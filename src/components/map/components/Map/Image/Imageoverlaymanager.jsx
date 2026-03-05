// ImageOverlayManager.jsx
import { useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector }        from 'react-redux';
import {
  updateItem, removeItem, selectItem, clearItemSelection,
} from '../../../../../store/slices/imageOverlaySlice';
import { clearSelection } from '../../../../../store/slices/drawingSlice';
import { getCenter } from './imageOverlayUtils';

const HS = 10;

// ─────────────────────────────────────────────────────────────────────────────
// Pure DOM helpers — no React, no Redux
// ─────────────────────────────────────────────────────────────────────────────

const buildHandleOverlay = () => {
  const el = document.createElement('div');
  Object.assign(el.style, {
    position:        'absolute',
    boxSizing:       'border-box',
    border:          '2px dashed #1a73e8',
    cursor:          'move',
    transformOrigin: '0 0',
    pointerEvents:   'all',
    zIndex:          500,
    display:         'none',   // hidden until shown
  });

  const rot = document.createElement('div');
  rot.dataset.role = 'rotate';
  Object.assign(rot.style, {
    position: 'absolute', top: '-30px', left: '50%',
    transform: 'translateX(-50%)', width: '20px', height: '20px',
    borderRadius: '50%', background: '#1a73e8', border: '2px solid #fff',
    cursor: 'grab', display: 'flex', alignItems: 'center',
    justifyContent: 'center', fontSize: '12px', color: '#fff', userSelect: 'none',
  });
  rot.textContent = '↺';
  el.appendChild(rot);

//   const del = document.createElement('button');
//   del.dataset.role = 'delete';
//   del.textContent  = '×';
//   Object.assign(del.style, {
//     position: 'absolute', top: '-13px', right: '-13px',
//     width: '22px', height: '22px', borderRadius: '50%', border: 'none',
//     background: '#e03131', color: '#fff', fontSize: '15px', fontWeight: 'bold',
//     cursor: 'pointer', display: 'flex', alignItems: 'center',
//     justifyContent: 'center', padding: 0, zIndex: 10,
//   });
//   el.appendChild(del);

  [
    { corner: 'nw', top: `${-HS/2}px`, left:   `${-HS/2}px`, cursor: 'nw-resize' },
    { corner: 'ne', top: `${-HS/2}px`, right:  `${-HS/2}px`, cursor: 'ne-resize' },
    { corner: 'sw', bottom: `${-HS/2}px`, left: `${-HS/2}px`, cursor: 'sw-resize' },
    { corner: 'se', bottom: `${-HS/2}px`, right:`${-HS/2}px`, cursor: 'se-resize' },
  ].forEach(({ corner, cursor, ...pos }) => {
    const h = document.createElement('div');
    h.dataset.role   = 'resize';
    h.dataset.corner = corner;
    Object.assign(h.style, {
      position: 'absolute', width: `${HS}px`, height: `${HS}px`,
      background: '#1a73e8', border: '2px solid #fff', borderRadius: '2px',
      cursor, zIndex: 10, ...pos,
    });
    el.appendChild(h);
  });

  return el;
};

// Reposition overlay to match the image's current screen bbox.
// Called on every mousemove and map render — must be as cheap as possible.
const positionOverlay = (el, coordinates, map) => {
  const px  = coordinates.map((c) => map.project(c));
  const [tl, tr, , bl] = px;
  const w     = Math.hypot(tr.x - tl.x, tr.y - tl.y);
  const h     = Math.hypot(bl.x - tl.x, bl.y - tl.y);
  const angle = Math.atan2(tr.y - tl.y, tr.x - tl.x) * (180 / Math.PI);
  // Batch all style writes in one assignment — single layout pass
  el.style.cssText = el.style.cssText.replace(/left:[^;]+/, `left:${tl.x}px`)
    .replace(/top:[^;]+/, `top:${tl.y}px`)
    .replace(/width:[^;]+/, `width:${w}px`)
    .replace(/height:[^;]+/, `height:${h}px`)
    .replace(/transform:[^;]+/, `transform:rotate(${angle}deg)`);
  // Fallback if cssText replace fails (first call)
  Object.assign(el.style, {
    left:      `${tl.x}px`,
    top:       `${tl.y}px`,
    width:     `${w}px`,
    height:    `${h}px`,
    transform: `rotate(${angle}deg)`,
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────
export default function ImageOverlayManager() {
  const dispatch   = useDispatch();
  const map        = useSelector((s) => s.map.mapContainer);
  const items      = useSelector((s) => s.imageOverlay.items);
  const selectedId = useSelector((s) => s.imageOverlay.selectedId);
  const activeTool = useSelector((s) => s.drawingToolbar.activeTool);

  // id → { sourceId, layerId, hitLayerId }
  const registryRef = useRef(new Map());

  // Live coordinates per id — updated imperatively during drag, never causes re-render
  const liveCoordsRef = useRef(new Map()); // id → [[lng,lat],...]

  // The ONE overlay element — created once on mount, never recreated
  const overlayElRef    = useRef(null);
  const overlayItemRef  = useRef(null); // which item id the overlay is currently for

  // Always-current items — readable in event handlers without stale closure
  const itemsRef = useRef(items);
  useEffect(() => { itemsRef.current = items; }, [items]);

  const selectedIdRef = useRef(selectedId);
  useEffect(() => { selectedIdRef.current = selectedId; }, [selectedId]);

  // Drag state — plain objects, never cause re-renders
  const moveDragRef   = useRef({ active: false });
  const rotateDragRef = useRef({ active: false });
  const resizeDragRef = useRef({ active: false });
  const isDraggingRef = useRef(false);

  // ── Create the single overlay element on mount ────────────────────────────
  useEffect(() => {
    if (!map) return;
    const el = buildHandleOverlay();
    map.getCanvasContainer().appendChild(el);
    overlayElRef.current = el;

    // ── Reposition on every MapLibre render (handles pan/zoom) ────────────
    const onRender = () => {
      if (!overlayItemRef.current || !overlayElRef.current) return;
      const coords = liveCoordsRef.current.get(overlayItemRef.current)
        ?? itemsRef.current.find((i) => i.id === overlayItemRef.current)?.coordinates;
      if (coords) positionOverlay(overlayElRef.current, coords, map);
    };
    map.on('render', onRender);

    return () => {
      map.off('render', onRender);
      el.remove();
      overlayElRef.current   = null;
      overlayItemRef.current = null;
    };
  }, [map]);

  // ── Show / hide overlay (just toggle display, never recreate) ────────────
  const showOverlay = useCallback((itemId) => {
    const el = overlayElRef.current;
    if (!el || !map) return;
    const item = itemsRef.current.find((i) => i.id === itemId);
    if (!item) return;

    overlayItemRef.current = itemId;
    positionOverlay(el, item.coordinates, map);
    el.style.display = 'block';
  }, [map]);

  const hideOverlay = useCallback(() => {
    if (overlayElRef.current) overlayElRef.current.style.display = 'none';
    overlayItemRef.current = null;
  }, []);

  // ── Wire overlay event handlers once (on mount) ───────────────────────────
  // Handlers read from refs so they never go stale — no need to re-wire.
  useEffect(() => {
    if (!map) return;
    const el = overlayElRef.current;
    if (!el) return;

    const cornerMap = { nw: 0, ne: 1, se: 2, sw: 3 };

    // ── Move ─────────────────────────────────────────────────────────────
    el.addEventListener('mousedown', (e) => {
      const role = e.target.dataset?.role;
      if (role === 'rotate' || role === 'resize' || role === 'delete') return;
      e.stopPropagation();
      e.preventDefault();

      const itemId  = overlayItemRef.current;
      const item    = itemsRef.current.find((i) => i.id === itemId);
      if (!item) return;

      map.dragPan.disable();
      const coords = liveCoordsRef.current.get(itemId) ?? item.coordinates;
      moveDragRef.current = {
        active: true, id: itemId,
        lastX: e.clientX, lastY: e.clientY,
        liveCoords: coords.map((c) => [...c]),
      };
    });

    // ── Rotate ───────────────────────────────────────────────────────────
    el.querySelector('[data-role="rotate"]').addEventListener('mousedown', (e) => {
      e.stopPropagation();
      e.preventDefault();

      const itemId = overlayItemRef.current;
      const item   = itemsRef.current.find((i) => i.id === itemId);
      if (!item) return;

      map.dragPan.disable();
      const coords     = liveCoordsRef.current.get(itemId) ?? item.coordinates;
      const center     = getCenter(coords);
      const cp         = map.project(center);
      const cRect      = map.getCanvasContainer().getBoundingClientRect();
      const initAngle  = Math.atan2(
        e.clientY - (cRect.top  + cp.y),
        e.clientX - (cRect.left + cp.x),
      );
      rotateDragRef.current = {
        active: true, id: itemId,
        lastAngle: initAngle,
        liveCoords: coords.map((c) => [...c]),
        liveRotation: item.rotation || 0,
      };
    });

    // ── Resize ───────────────────────────────────────────────────────────
    el.querySelectorAll('[data-role="resize"]').forEach((handle) => {
      handle.addEventListener('mousedown', (e) => {
        e.stopPropagation();
        e.preventDefault();

        const itemId = overlayItemRef.current;
        const item   = itemsRef.current.find((i) => i.id === itemId);
        if (!item) return;

        map.dragPan.disable();
        const coords = liveCoordsRef.current.get(itemId) ?? item.coordinates;
        resizeDragRef.current = {
          active: true, id: itemId,
          cornerIdx: cornerMap[handle.dataset.corner] ?? 2,
          liveCoords: coords.map((c) => [...c]),
        };
      });
    });

    // // ── Delete ───────────────────────────────────────────────────────────
    // el.querySelector('[data-role="delete"]').addEventListener('click', (e) => {
    //   e.stopPropagation();
    //   const itemId = overlayItemRef.current;
    //   if (!itemId) return;

    //   hideOverlay();
    //   liveCoordsRef.current.delete(itemId);

    //   const entry = registryRef.current.get(itemId);
    //   if (entry) {
    //     try { if (map.getLayer(entry.hitLayerId)) map.removeLayer(entry.hitLayerId); } catch {}
    //     try { if (map.getLayer(entry.layerId))    map.removeLayer(entry.layerId);    } catch {}
    //     try { if (map.getSource(`${entry.sourceId}-hit`)) map.removeSource(`${entry.sourceId}-hit`); } catch {}
    //     try { if (map.getSource(entry.sourceId))  map.removeSource(entry.sourceId);  } catch {}
    //     registryRef.current.delete(itemId);
    //   }
    //   dispatch(removeItem(itemId));
    // });
  }, [map, dispatch, hideOverlay]);

  // ── Core drag logic: update sources imperatively, never touch Redux ───────
  useEffect(() => {
    if (!map) return;

    const updateSourcesDirect = (id, newCoords) => {
      const entry = registryRef.current.get(id);
      if (!entry) return;
      // setCoordinates is the fast path — no parse, no re-upload, just repositions
      map.getSource(entry.sourceId)?.setCoordinates(newCoords);
      // Store live coords so overlay repositions correctly on render
      liveCoordsRef.current.set(id, newCoords);
      // Reposition overlay immediately — don't wait for next render event
      if (overlayItemRef.current === id && overlayElRef.current) {
        positionOverlay(overlayElRef.current, newCoords, map);
      }
    };

    const onMove = (e) => {
      // ── Move ────────────────────────────────────────────────────────────
      const md = moveDragRef.current;
      if (md.active) {
        isDraggingRef.current = true;
        // Convert pixel delta to lngLat delta at current zoom
        const center = map.getCenter();
        const cp     = map.project(center);
        const p1     = map.unproject({ x: cp.x + (e.clientX - md.lastX), y: cp.y + (e.clientY - md.lastY) });
        const dlng   = p1.lng - center.lng;
        const dlat   = p1.lat - center.lat;

        const newCoords = md.liveCoords.map(([lng, lat]) => [lng + dlng, lat + dlat]);
        md.liveCoords   = newCoords;
        md.lastX        = e.clientX;
        md.lastY        = e.clientY;

        updateSourcesDirect(md.id, newCoords);
        return;
      }

      // ── Rotate ──────────────────────────────────────────────────────────
      const rr = rotateDragRef.current;
      if (rr.active) {
        isDraggingRef.current = true;
        const center  = getCenter(rr.liveCoords);
        const cp      = map.project(center);
        const cRect   = map.getCanvasContainer().getBoundingClientRect();
        const angle   = Math.atan2(
          e.clientY - (cRect.top  + cp.y),
          e.clientX - (cRect.left + cp.x),
        );
        const delta   = angle - rr.lastAngle;
        const cos     = Math.cos(delta);
        const sin     = Math.sin(delta);

        const newCoords = rr.liveCoords.map(([lng, lat]) => {
          const dx = lng - center[0];
          const dy = lat - center[1];
          return [center[0] + dx * cos - dy * sin, center[1] + dx * sin + dy * cos];
        });
        rr.liveCoords    = newCoords;
        rr.lastAngle     = angle;
        rr.liveRotation  = (rr.liveRotation + delta * (180 / Math.PI)) % 360;

        updateSourcesDirect(rr.id, newCoords);
        return;
      }

      // ── Resize ──────────────────────────────────────────────────────────
      const rd = resizeDragRef.current;
      if (rd.active) {
        isDraggingRef.current = true;
        const center  = getCenter(rd.liveCoords);
        const cp      = map.project(center);
        const cRect   = map.getCanvasContainer().getBoundingClientRect();
        const cpVpX   = cRect.left + cp.x;
        const cpVpY   = cRect.top  + cp.y;

        const mouseDist = Math.hypot(e.clientX - cpVpX, e.clientY - cpVpY);
        const corner    = rd.liveCoords[rd.cornerIdx];
        const cornerPx  = map.project(corner);
        const origDist  = Math.hypot(cornerPx.x - cp.x, cornerPx.y - cp.y);
        if (origDist < 1) return;

        const scale     = mouseDist / origDist;
        const newCoords = rd.liveCoords.map(([lng, lat]) => [
          center[0] + (lng - center[0]) * scale,
          center[1] + (lat - center[1]) * scale,
        ]);
        rd.liveCoords = newCoords;

        updateSourcesDirect(rd.id, newCoords);
      }
    };

    const onUp = () => {
      isDraggingRef.current = false;

      const md = moveDragRef.current;
      if (md.active) {
        map.dragPan.enable();
        // Sync live coords → Redux (only happens once on mouseup)
        dispatch(updateItem({ id: md.id, coordinates: md.liveCoords }));
        moveDragRef.current = { active: false };
      }

      const rr = rotateDragRef.current;
      if (rr.active) {
        map.dragPan.enable();
        dispatch(updateItem({ id: rr.id, coordinates: rr.liveCoords, rotation: rr.liveRotation }));
        rotateDragRef.current = { active: false };
      }

      const rd = resizeDragRef.current;
      if (rd.active) {
        map.dragPan.enable();
        dispatch(updateItem({ id: rd.id, coordinates: rd.liveCoords }));
        resizeDragRef.current = { active: false };
      }
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup',   onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup',   onUp);
    };
  }, [map, dispatch]);

  // ── Delete key ────────────────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== 'Delete' && e.key !== 'Backspace') return;
      const id = selectedIdRef.current;
      if (!id) return;
      dispatch(clearItemSelection());
      dispatch(removeItem(id));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [dispatch]);

  // ── Deselect on tool change ───────────────────────────────────────────────
  useEffect(() => {
    dispatch(clearItemSelection());
    dispatch(clearSelection());
  }, [activeTool, dispatch]);

  // ── selectedId change → show/hide overlay ────────────────────────────────
  // NOTE: does NOT recreate the overlay — just repositions and toggles display
  useEffect(() => {
    if (selectedId) showOverlay(selectedId);
    else            hideOverlay();
  }, [selectedId, showOverlay, hideOverlay]);

  // ── Sync items → MapLibre sources (add new, remove deleted) ─────────────
  // This effect ONLY runs for structural changes (add/delete).
  // Coordinate updates during drag bypass this entirely via updateSourcesDirect.
  useEffect(() => {
    if (!map) return;

    const registry    = registryRef.current;
    const incomingIds = new Set(items.map((i) => i.id));

    // Remove deleted items
    registry.forEach((entry, id) => {
      if (incomingIds.has(id)) return;
      try { if (map.getLayer(entry.hitLayerId))          map.removeLayer(entry.hitLayerId);         } catch {}
      try { if (map.getLayer(entry.layerId))             map.removeLayer(entry.layerId);            } catch {}
      try { if (map.getSource(`${entry.sourceId}-hit`))  map.removeSource(`${entry.sourceId}-hit`); } catch {}
      try { if (map.getSource(entry.sourceId))           map.removeSource(entry.sourceId);          } catch {}
      liveCoordsRef.current.delete(id);
      registry.delete(id);
    });

    items.forEach((item) => {
      const sourceId   = `img-src-${item.id}`;
      const layerId    = `img-lyr-${item.id}`;
      const hitLayerId = `img-hit-${item.id}`;

      if (registry.has(item.id)) {
        // Existing item: only update coordinates if NOT mid-drag
        // (during drag, updateSourcesDirect keeps the source current)
        if (!isDraggingRef.current) {
          const coords = liveCoordsRef.current.get(item.id) ?? item.coordinates;
          map.getSource(sourceId)?.setCoordinates(coords);
          // Only update hit polygon on commit (mouseup), not during drag
          map.getSource(`${sourceId}-hit`)?.setData({
            type: 'Feature',
            geometry: { type: 'Polygon', coordinates: [[...coords, coords[0]]] },
            properties: {},
          });
        }
        return;
      }

      // New item — create source + layers
      try {
        map.addSource(sourceId, {
          type: 'image', url: item.src, coordinates: item.coordinates,
        });
        map.addLayer({
          id: layerId, type: 'raster', source: sourceId,
          paint: { 'raster-opacity': 1 },
        });

        map.addSource(`${sourceId}-hit`, {
          type: 'geojson',
          data: {
            type: 'Feature',
            geometry: { type: 'Polygon', coordinates: [[...item.coordinates, item.coordinates[0]]] },
            properties: {},
          },
        });
        map.addLayer({
          id: hitLayerId, type: 'fill', source: `${sourceId}-hit`,
          paint: { 'fill-opacity': 0, 'fill-color': '#000' },
        });

        map.on('click', hitLayerId, (e) => {
          e.originalEvent.stopPropagation();
          dispatch(selectItem(item.id));
        });
        map.on('mouseenter', hitLayerId, () => { map.getCanvas().style.cursor = 'pointer'; });
        map.on('mouseleave', hitLayerId, () => { map.getCanvas().style.cursor = '';        });

        registry.set(item.id, { sourceId, layerId, hitLayerId });

        // Store initial live coords
        liveCoordsRef.current.set(item.id, item.coordinates.map((c) => [...c]));

      } catch (err) {
        console.error('[ImageOverlayManager] create failed:', err);
      }
    });
  }, [map, items, dispatch]);

  // ── Click map background → deselect ──────────────────────────────────────
  useEffect(() => {
    if (!map) return;
    const onClick = () => dispatch(clearItemSelection());
    map.on('click', onClick);
    return () => map.off('click', onClick);
  }, [map, dispatch]);

  // ── Cleanup ───────────────────────────────────────────────────────────────
  useEffect(() => () => {
    if (map) {
      registryRef.current.forEach(({ sourceId, layerId, hitLayerId }) => {
        try { if (map.getLayer(hitLayerId))          map.removeLayer(hitLayerId);         } catch {}
        try { if (map.getLayer(layerId))             map.removeLayer(layerId);            } catch {}
        try { if (map.getSource(`${sourceId}-hit`))  map.removeSource(`${sourceId}-hit`); } catch {}
        try { if (map.getSource(sourceId))           map.removeSource(sourceId);          } catch {}
      });
    }
    registryRef.current.clear();
    liveCoordsRef.current.clear();
  }, []);

  return null;
}