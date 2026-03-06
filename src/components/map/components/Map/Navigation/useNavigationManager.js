// useNavigationManager.js
// All map-event logic for the navigation drawing/editing system.

import { useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector }        from 'react-redux';
import {
  setInProgress,
  clearInProgress,
  addPath,
  updatePoint,
  updateSnapPoint,
  removePath,
  removePointFromPath,
  selectPath,
  selectPoint,
  clearNavSelection,
  bulkAddPaths,
  insertPointAtIndex,
} from '../../../../../store/slices/navigationSlice';
import {
  findSnap,
  getPositionAtT,
  nearestOnPolyline2D,
  nodesToGeoJSON,
  pathsToLinesGeoJSON,
  previewToGeoJSON,
  emptyCol,
  makePoint,
  buildNavGraph,
  dijkstra,
  findPinNodeId,
  autoGenerateSubPaths,
  decomposeSnapT,
  reAnchorSnapPoint,
} from './navigationUtils';
import { navSourceRef, NAV_LAYERS } from './NavigationLayer';

// ── Imperative source updater (mirrors DrawingLayer pattern) ──────────────────
const pushLines   = (paths, selId)            => navSourceRef.setLines?.(paths, selId);
const pushNodes   = (paths, selId, selPtId)   => navSourceRef.setNodes?.(paths, selId, selPtId);
const pushPreview = (inProg, mousePos)         => navSourceRef.setPreview?.(inProg, mousePos);

export default function useNavigationManager({ activeTool, activePath }) {
  const dispatch    = useDispatch();
  const map         = useSelector((s) => s.map.mapContainer);
  const allPins     = useSelector((s) => s.api.allPins);
  const currentFloor= useSelector((s) => s.api.currentFloor);
  const activeTab   = useSelector((s) => s.api.activeTab);

  const paths           = useSelector((s) => s.navigation.paths);
  const selectedPathId  = useSelector((s) => s.navigation.selectedPathId);
  const selectedPointId = useSelector((s) => s.navigation.selectedPointId);
  const inProgress      = useSelector((s) => s.navigation.inProgress);

  // Always-current refs so event callbacks never capture stale closures
  const stateRef = useRef({});
  stateRef.current = {
    activeTool, activePath, paths, selectedPathId, selectedPointId, inProgress,
  };

  // All visible pins (same logic as MapMarkers)
  const visiblePins = useRef([]);
  useEffect(() => {
    const { vertical, ...rest } = allPins || {};
    const flat = Object.values(rest).flat();
    visiblePins.current = flat.filter((pin) => {
      if (!pin?.positions) return false;
      if (pin?.fp_id !== currentFloor?.enc_id) return false;
      if (activeTab !== 'all' && pin?.category !== activeTab) return false;
      return true;
    });
  }, [allPins, currentFloor, activeTab]);

  // ── Cursor helper ─────────────────────────────────────────────────────────
  const setCursor = useCallback((c) => {
    if (map) map.getCanvas().style.cursor = c;
  }, [map]);

  // ── Hit-test: which path/point is at pixel point ──────────────────────────
  // hitTestPath — returns pathId string or null.
  // Reads f.properties.pathId (explicitly set in pathsToLinesGeoJSON) so that
  // the result never depends on promoteId / f.id behaviour.
  const hitTestPath = useCallback((screenPt) => {
    if (!map) return null;
    const features = map.queryRenderedFeatures(
      [
        [screenPt.x - 8, screenPt.y - 8],
        [screenPt.x + 8, screenPt.y + 8],
      ],
      { layers: [NAV_LAYERS.hitLine, NAV_LAYERS.mainLine, NAV_LAYERS.subLine, NAV_LAYERS.selectedLine] }
    );
    if (features.length === 0) return null;
    // Use properties.pathId — guaranteed to exist regardless of promoteId
    return features[0].properties?.pathId ?? null;
  }, [map]);

  // hitTestNode — returns { pointId, pathId } or null.
  // Reads from properties (pointId + pathId are explicitly set in nodesToGeoJSON).
  const hitTestNode = useCallback((screenPt) => {
    if (!map) return null;
    const features = map.queryRenderedFeatures(
      [
        [screenPt.x - 10, screenPt.y - 10],
        [screenPt.x + 10, screenPt.y + 10],
      ],
      { layers: [NAV_LAYERS.nodes, NAV_LAYERS.nodesSnap] }
    );
    if (features.length === 0) return null;
    const p = features[0].properties;
    if (!p?.pointId || !p?.pathId) return null;
    return { pointId: p.pointId, pathId: p.pathId };
  }, [map]);

  // ── Main effect: bind / unbind listeners when tool or path changes ────────
  useEffect(() => {
    if (!map || !activeTool) return;

    const cleanups = [];
    const on = (evt, handler) => {
      map.on(evt, handler);
      cleanups.push(() => map.off(evt, handler));
    };
    const onKey = (evt, handler) => {
      window.addEventListener(evt, handler);
      cleanups.push(() => window.removeEventListener(evt, handler));
    };

    setCursor('default');
    dispatch(clearInProgress());
    pushPreview(null);

    // ════════════════════════════════════════════════════════════════════════
    // PEN tool — draw paths
    // ════════════════════════════════════════════════════════════════════════
    if (activeTool === 'pen') {
      setCursor('crosshair');

      // Track local coords separately from Redux inProgress for snap preview
      // (avoids expensive re-renders on every mousemove)
      let localProgress    = null; // { type, points: Point[] }
      // When the last click lands on an existing same-type path's endpoint,
      // set this so commitPath merges the two paths into one continuous line.
      let localMergeTarget = null; // { pathId, pointId } | null

      const commitPath = () => {
        if (!localProgress || localProgress.points.length < 2) {
          localProgress    = null;
          localMergeTarget = null;
          dispatch(clearInProgress());
          pushPreview(null);
          return;
        }

        // ── Merge: last click landed on an existing same-type path endpoint ──
        const mergeTarget = localMergeTarget;
        localMergeTarget  = null;

        if (mergeTarget) {
          const { paths: latestPaths } = stateRef.current;
          const targetPath = latestPaths.find((p) => p.id === mergeTarget.pathId);
          if (targetPath && targetPath.type === localProgress.type) {
            const tFirst = targetPath.points[0];
            const tLast  = targetPath.points[targetPath.points.length - 1];
            let mergedPoints = null;

            if (tFirst?.id === mergeTarget.pointId) {
              // new path's end → target's start: drop duplicate point, append target
              mergedPoints = [
                ...localProgress.points.slice(0, -1),
                ...targetPath.points,
              ];
            } else if (tLast?.id === mergeTarget.pointId) {
              // new path's end → target's end: drop duplicate, append target reversed
              mergedPoints = [
                ...localProgress.points.slice(0, -1),
                ...targetPath.points.slice().reverse(),
              ];
            }

            if (mergedPoints && mergedPoints.length >= 2) {
              dispatch(addPath({ type: localProgress.type, points: mergedPoints }));
              dispatch(removePath(targetPath.id));
              localProgress = null;
              pushPreview(null);
              return;
            }
          }
        }

        dispatch(addPath({ type: localProgress.type, points: localProgress.points }));
        localProgress = null;
        pushPreview(null);
      };

      const cancelPath = () => {
        localProgress = null;
        dispatch(clearInProgress());
        pushPreview(null);
        setCursor('crosshair');
      };

      // ── Click ────────────────────────────────────────────────────────
      on('click', (e) => {
        const { lng, lat } = e.lngLat;
        const { activePath: curPath, paths: curPaths } = stateRef.current;

        // Snap detection — wider pin threshold (25 px) so clicking anywhere on
        // a pin icon reliably snaps to the pin's coordinate.
        const snap = findSnap({
          lngLat: [lng, lat],
          map,
          paths:  curPaths,
          visiblePins: visiblePins.current,
          pinThresholdPx: 25,
        });

        let newPoint;
        let shouldEnd = false;
        localMergeTarget = null; // reset on every click

        if (snap) {
          if (snap.type === 'pin') {
            // ── Pin anchor — always use pinId ──────────────────────────────
            newPoint = makePoint(snap.position, { pinId: snap.pinId });

          } else if (snap.type === 'node') {
            const snapPath  = curPaths.find((p) => p.id === snap.pathId);
            const existingPt = snapPath?.points.find((x) => x.id === snap.pointId);

            if (curPath === 'sub' && snapPath?.type === 'main') {
              // ── Sub-path endpoint on a main-path node → floating anchor ─
              // The anchor is NOT inserted into the main path.
              const screenPt = map.project(snap.position);
              const result   = nearestOnPolyline2D(screenPt, snapPath.points, map);
              newPoint = makePoint(snap.position, {
                snapPathId: snap.pathId,
                snapT:      result.t,
              });
              // Already drawing → finish sub-path at this anchor.
              // Not yet drawing → BEGIN sub-path from this anchor (no shouldEnd).
              if (localProgress !== null) shouldEnd = true;

            } else if (snapPath?.type === curPath) {
              // ── Same-type node snap ──────────────────────────────────────
              const isEndpoint =
                snapPath.points[0]?.id                               === snap.pointId ||
                snapPath.points[snapPath.points.length - 1]?.id === snap.pointId;

              if (localProgress === null) {
                // ── Start drawing FROM this existing node ─────────────────
                // Reuse the existing UUID (+ pinId / snapPathId) so the new
                // path is graph-connected to all paths that already share it.
                newPoint = existingPt
                  ? { ...existingPt }          // preserve pinId, snapPathId, snapT
                  : makePoint(snap.position);
                // shouldEnd stays false — keep drawing

              } else if (isEndpoint) {
                // ── Finish here + merge the two paths into one ────────────
                newPoint         = { id: snap.pointId, position: snap.position,
                                     pinId: null, snapPathId: null, snapT: null };
                localMergeTarget = { pathId: snap.pathId, pointId: snap.pointId };
                shouldEnd = true;

              } else {
                // Interior node — stop here, reuse existing UUID so the new
                // path is graph-connected at that point. Infinite lines can
                // share any node this way, whether endpoint or interior.
                newPoint  = existingPt ? { ...existingPt } : makePoint(snap.position);
                shouldEnd = true;
              }

            } else {
              // ── Cross-type snap (main→sub node or sub→main non-anchor) ──
              if (localProgress === null) {
                // Start from this position with a fresh node
                newPoint = makePoint(snap.position);
                // shouldEnd stays false — keep drawing
              } else {
                // Finish here — reuse existing UUID for cross-type connectivity
                newPoint  = existingPt ? { ...existingPt } : makePoint(snap.position);
                shouldEnd = true;
              }
            }

          } else if (snap.type === 'segment') {
            if (curPath === 'sub' && snap.pathType === 'main') {
              // ── Sub-path snapping to a main-path SEGMENT ───────────────
              // Floating yellow anchor — main path is NOT touched at all.
              // Graph connectivity is handled by buildNavGraph via snapT/snapPathId.
              newPoint  = makePoint(snap.position, {
                snapPathId: snap.pathId,
                snapT:      snap.t,
              });
              shouldEnd = true;

            } else {
              // ── Any other segment snap (main→main, main→sub, sub→sub) ────
              // Plain junction node — NO snapPathId, so it won't render yellow
              // and won't be treated as a floating anchor.
              // Graph connectivity comes from the shared UUID inserted into the
              // target path via insertPointAtIndex.
              newPoint = makePoint(snap.position);
              dispatch(insertPointAtIndex({
                pathId: snap.pathId,
                index:  snap.segIndex + 1,
                point:  {
                  id:         newPoint.id,
                  position:   newPoint.position,
                  pinId:      null,
                  snapPathId: null,
                  snapT:      null,
                },
              }));
              shouldEnd = true;
            }
          }
        } else {
          newPoint = makePoint([lng, lat]);
        }

        if (!localProgress) {
          // Start a new path
          localProgress = { type: curPath, points: [newPoint] };
        } else {
          localProgress = { ...localProgress, points: [...localProgress.points, newPoint] };
        }

        // Update Redux inProgress for NavSync to pick up
        dispatch(setInProgress(localProgress));
        // Push preview imperatively
        pushPreview(localProgress, null);

        if (shouldEnd) {
          commitPath();
        }
      });

      // ── Double-click: finish path ─────────────────────────────────────
      on('dblclick', (e) => {
        e.preventDefault();
        // Remove last point added by the preceding single-click
        if (localProgress && localProgress.points.length > 1) {
          localProgress = {
            ...localProgress,
            points: localProgress.points.slice(0, -1),
          };
        }
        commitPath();
      });

      // ── Mousemove: live preview ───────────────────────────────────────
      on('mousemove', (e) => {
        if (!localProgress) return;
        const mousePos = [e.lngLat.lng, e.lngLat.lat];
        pushPreview(localProgress, mousePos);
      });

      // ── ESC key: cancel ───────────────────────────────────────────────
      onKey('keydown', (e) => {
        if (e.key === 'Escape') cancelPath();
        if ((e.key === 'Delete' || e.key === 'Backspace') && !localProgress) {
          const { selectedPathId: sid } = stateRef.current;
          if (sid) dispatch(removePath(sid));
        }
      });
    }

    // ════════════════════════════════════════════════════════════════════════
    // SELECT tool — select, drag nodes, slide snapped points
    // ════════════════════════════════════════════════════════════════════════
    if (activeTool === 'select') {
      setCursor('default');

      // Plain object — cannot use useRef inside useEffect
      const drag = { active: false };

      on('click', (e) => {
        // click fires after mouseup — check if this followed a drag and ignore it
        if (drag.moved) { drag.moved = false; return; }

        // Clicking a node does NOT select — dragging is the only action on nodes.
        // Clicking directly on a node just clears any existing selection.
        const hitN = hitTestNode(e.point);
        if (hitN) {
          dispatch(clearNavSelection());
          return;
        }

        const pathId = hitTestPath(e.point);
        if (pathId) {
          dispatch(selectPath(pathId));
        } else {
          dispatch(clearNavSelection());
        }
      });

      on('mousedown', (e) => {
        // Check for node drag first
        const hit = hitTestNode(e.point);
        if (hit) {
          map.dragPan.disable();
          setCursor('grabbing');

          const { paths: curPaths } = stateRef.current;
          // hitTestNode may return the main path's copy of a shared snap node
          // (because the main path comes first in GeoJSON ordering).
          // Search ALL paths to find the copy that has snapPathId set — that is
          // the sub-path endpoint that should slide, not the main path's plain node.
          let snapPathId = null;
          for (const p of curPaths) {
            const pt = p.points.find((x) => x.id === hit.pointId);
            if (pt?.snapPathId) { snapPathId = pt.snapPathId; break; }
          }

          // Ensure at least one path contains this node
          const exists = curPaths.some((p) =>
            p.points.some((pt) => pt.id === hit.pointId)
          );
          if (!exists) return;

          drag.active     = true;
          drag.moved      = false;
          drag.pathId     = hit.pathId;
          drag.pointId    = hit.pointId;
          drag.isSnap     = !!snapPathId;
          drag.snapPathId = snapPathId;
          return;
        }
      });

      on('mousemove', (e) => {
        if (!drag.active) {
          // Cursor feedback
          const hitN = hitTestNode(e.point);
          if (hitN) { setCursor('grab'); return; }
          const hitP = hitTestPath(e.point);
          setCursor(hitP ? 'pointer' : 'default');
          return;
        }

        drag.moved = true;
        const { lng, lat } = e.lngLat;
        const mousePos = [lng, lat];

        const { paths: curPaths, selectedPathId: selPId, selectedPointId: selPtId } =
          stateRef.current;

        if (drag.isSnap) {
          // ── Slide along ANY main path (allows crossing the whole network) ──
          const mainPaths = curPaths.filter((p) => p.type === 'main');
          let bestResult  = null;
          let bestPathId  = null;
          let bestDistPx  = Infinity;

          for (const mp of mainPaths) {
            if (mp.points.length < 2) continue;
            const result = nearestOnPolyline2D(e.point, mp.points, map);
            if (result.distPx < bestDistPx) {
              bestDistPx = result.distPx;
              bestResult = result;
              bestPathId = mp.id;
            }
          }

          if (!bestResult || !bestPathId) return;
          const newPos = bestResult.position;

          // Track which main path we're currently riding (may change mid-drag)
          drag.snapPathId = bestPathId;

          // Update every path that owns this UUID (normally just the sub-path,
          // since floating anchors are never inserted into the main path).
          const updatedPaths = curPaths.map((p) => {
            if (!p.points.some((pt) => pt.id === drag.pointId)) return p;
            return {
              ...p,
              points: p.points.map((pt) =>
                pt.id === drag.pointId
                  ? { ...pt, position: newPos, snapT: bestResult.t, snapPathId: bestPathId }
                  : pt
              ),
            };
          });
          pushLines(updatedPaths, selPId);
          pushNodes(updatedPaths, selPId, selPtId);
          drag.livePos = newPos;
          drag.liveT   = bestResult.t;
        } else {
          // ── Free move — update ALL paths sharing this node ID ───────────
          // Step 1: move the dragged vertex in every path that contains it
          const movedPathIds = new Set(
            curPaths
              .filter((p) => p.points.some((pt) => pt.id === drag.pointId))
              .map((p) => p.id)
          );
          const partialPaths = curPaths.map((p) => {
            if (!movedPathIds.has(p.id)) return p;
            return {
              ...p,
              points: p.points.map((pt) =>
                pt.id === drag.pointId ? { ...pt, position: mousePos } : pt
              ),
            };
          });

          // Step 2: recompute floating anchor positions — segment-aware.
          // Decompose each anchor's snapT into (segIndex, localT) using the OLD
          // path shape, then re-lerp that same (segIndex, localT) within the NEW
          // segment endpoints. Anchors on segments whose endpoints didn't move
          // compute the exact same position → they stay visually still.
          // Only anchors on segments adjacent to the dragged vertex actually shift.
          const updatedPaths = partialPaths.map((p) => {
            const hasAnchor = p.points.some(
              (pt) => pt.snapPathId && movedPathIds.has(pt.snapPathId)
            );
            if (!hasAnchor) return p;
            return {
              ...p,
              points: p.points.map((pt) => {
                if (!pt.snapPathId || !movedPathIds.has(pt.snapPathId)) return pt;
                const origHost = curPaths.find((hp) => hp.id === pt.snapPathId);
                const newHost  = partialPaths.find((hp) => hp.id === pt.snapPathId);
                if (!origHost || !newHost || newHost.points.length < 2) return pt;
                const { segIndex, localT } = decomposeSnapT(origHost.points, pt.snapT);
                const reanchored = reAnchorSnapPoint(newHost.points, segIndex, localT);
                return reanchored
                  ? { ...pt, position: reanchored.position, snapT: reanchored.snapT }
                  : pt;
              }),
            };
          });

          pushLines(updatedPaths, selPId);
          pushNodes(updatedPaths, selPId, selPtId);
          drag.livePos = mousePos;
        }
      });

      on('mouseup', () => {
        if (!drag.active) return;
        map.dragPan.enable();
        setCursor('default');

        if (drag.moved && drag.livePos) {
          // Commit to every path that shares this node UUID.
          // (Snap endpoints exist in both the sub-path and the main path.)
          const { paths: finalPaths } = stateRef.current;
          const pathsWithNode = finalPaths.filter((p) =>
            p.points.some((pt) => pt.id === drag.pointId)
          );

          if (drag.isSnap && drag.snapPathId) {
            // Floating anchor only lives in the sub-path — dispatch snap update
            // for every path that owns this UUID (usually just one sub-path).
            pathsWithNode.forEach((p) =>
              dispatch(updateSnapPoint({
                pathId:     p.id,
                pointId:    drag.pointId,
                position:   drag.livePos,
                snapT:      drag.liveT,
                snapPathId: drag.snapPathId,
              }))
            );
          } else {
            // Persist the moved vertex
            pathsWithNode.forEach((p) =>
              dispatch(updatePoint({
                pathId:   p.id,
                pointId:  drag.pointId,
                position: drag.livePos,
              }))
            );

            // Persist floating anchor positions — segment-aware, same logic as
            // mousemove step 2. Uses original (pre-move) finalPaths for decompose,
            // and simulated post-move path for re-anchoring.
            const movedPathIds = new Set(pathsWithNode.map((p) => p.id));
            finalPaths.forEach((p) => {
              p.points.forEach((pt) => {
                if (!pt.snapPathId || !movedPathIds.has(pt.snapPathId)) return;
                const origHost = finalPaths.find((hp) => hp.id === pt.snapPathId);
                const rawHost  = pathsWithNode.find((hp) => hp.id === pt.snapPathId);
                if (!origHost || !rawHost) return;
                // Simulate host path with dragged vertex at its final position
                const simHostPoints = rawHost.points.map((hp) =>
                  hp.id === drag.pointId ? { ...hp, position: drag.livePos } : hp
                );
                const { segIndex, localT } = decomposeSnapT(origHost.points, pt.snapT);
                const reanchored = reAnchorSnapPoint(simHostPoints, segIndex, localT);
                if (!reanchored) return;
                dispatch(updateSnapPoint({
                  pathId:     p.id,
                  pointId:    pt.id,
                  position:   reanchored.position,
                  snapT:      reanchored.snapT,
                  snapPathId: pt.snapPathId,
                }));
              });
            });
          }
        }

        drag.active  = false;
        // drag.moved intentionally NOT reset here — click fires after mouseup
        // and checks drag.moved to decide if it should be treated as a drag-end
        drag.livePos = null;
        drag.liveT   = undefined;
      });

      // Delete key
      onKey('keydown', (e) => {
        if (e.key === 'Delete' || e.key === 'Backspace') {
          const { selectedPathId: sid } = stateRef.current;
          if (sid) dispatch(removePath(sid));
        }
      });
    }

    // ════════════════════════════════════════════════════════════════════════
    // HIGHLIGHTER tool — click to DELETE node (+ all paths through it)
    //                    or click a path line to delete that path
    // ════════════════════════════════════════════════════════════════════════
    if (activeTool === 'highlighter') {
      setCursor('crosshair');

      // Cursor feedback: crosshair over nodes/paths, default elsewhere
      on('mousemove', (e) => {
        const hitN = hitTestNode(e.point);
        if (hitN) { setCursor('crosshair'); return; }
        const hitP = hitTestPath(e.point);
        setCursor(hitP ? 'crosshair' : 'default');
      });

      on('click', (e) => {
        const { paths: curPaths } = stateRef.current;

        // ── Node click: remove this point from every path that owns it ────
        // The reducer deletes the path entirely if fewer than 2 points remain.
        const hitN = hitTestNode(e.point);
        if (hitN) {
          curPaths
            .filter((p) => p.points.some((pt) => pt.id === hitN.pointId))
            .forEach((p) =>
              dispatch(removePointFromPath({ pathId: p.id, pointId: hitN.pointId }))
            );
          return;
        }

        // ── Path line click: delete that path ──────────────────────────────
        const pathId = hitTestPath(e.point);
        if (pathId) dispatch(removePath(pathId));
      });
    }

    return () => {
      cleanups.forEach((fn) => fn());
      setCursor('default');
    };
  }, [map, activeTool, activePath, dispatch, setCursor, hitTestPath, hitTestNode]);

  // ── When pin moves (dragend in MapMarkers), update connected points ────────
  // MapMarkers dispatches updatePinConnectedPoints via the pin dragend handler.
  // We sync the lines/nodes here whenever paths change (covered by NavSync).

  // ── Expose auto-generate trigger ──────────────────────────────────────────
  // Called by ConnectionToolbar Auto-Generate button via dispatch(triggerAutoGenerate())
  // Handled in a separate effect below watching a trigger flag.
}

// ── Auto-generate hook (separate, called from Toolbar button) ──────────────────
export function useAutoGenerateSubPaths() {
  const dispatch = useDispatch();
  const map      = useSelector((s) => s.map.mapContainer);
  const paths    = useSelector((s) => s.navigation.paths);
  const allPins  = useSelector((s) => s.api.allPins);
  const currentFloor = useSelector((s) => s.api.currentFloor);
  const activeTab    = useSelector((s) => s.api.activeTab);

  return useCallback(() => {
    if (!map) return;

    const { vertical, ...rest } = allPins || {};
    const visiblePins = Object.values(rest).flat().filter((pin) => {
      if (!pin?.positions) return false;
      if (pin?.fp_id !== currentFloor?.enc_id) return false;
      if (activeTab !== 'all' && pin?.category !== activeTab) return false;
      return true;
    });

    // autoGenerateSubPaths now builds sub-paths exactly like manual drawing:
    // floating anchor with snapPathId+snapT, no main-path modification needed.
    const { newSubPaths } = autoGenerateSubPaths(paths, visiblePins, map);

    if (newSubPaths.length > 0) {
      dispatch(bulkAddPaths(newSubPaths));
    }
  }, [map, paths, allPins, currentFloor, activeTab, dispatch]);
}

// ── Shortest path hook ────────────────────────────────────────────────────────
export function useShortestPath() {
  const paths = useSelector((s) => s.navigation.paths);

  return useCallback((pinIdA, pinIdB) => {
    const nodeIdA = findPinNodeId(paths, pinIdA);
    const nodeIdB = findPinNodeId(paths, pinIdB);
    if (!nodeIdA || !nodeIdB) return null;

    const { nodes, adj } = buildNavGraph(paths);
    const result = dijkstra(nodes, adj, nodeIdA, nodeIdB);
    if (!result) return null;

    // Resolve node IDs to positions for display
    const positions = result.nodeIds.map((id) => nodes[id]).filter(Boolean);
    return { distanceM: result.distanceM, positions };
  }, [paths]);
}
