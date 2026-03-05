// ImageOverlayManager.jsx
import { useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector }        from 'react-redux';
import {
  updateItem, removeItem, selectItem, clearItemSelection,
} from '../../../../../store/slices/imageOverlaySlice';
import { clearSelection } from '../../../../../store/slices/drawingSlice';
import { getCenter } from './imageOverlayUtils';

// Fixed logical size for the selection-outline div.
// The matrix3d homography maps this 100×100 div to the actual image quad.
const OW = 100;
const OH = 100;

// Screen-space sizes for the handles — these are always in real CSS pixels,
// never affected by the matrix3d scale of the outline div.
const HANDLE_R  =  10;   // corner handle radius (px) — matches drawing circle-radius
const ROT_R     =  10;   // rotate handle radius (px)
const STEM_PX   = 36;   // stem length from image top-edge midpoint to rotate handle edge (px)

// ─────────────────────────────────────────────────────────────────────────────
// Pure DOM helpers
// ─────────────────────────────────────────────────────────────────────────────

// Returns { el, stem, rot, corners } — all DOM elements appended separately to
// the canvas container so they are positioned in raw screen space and never
// inherit the matrix3d scale of the outline div.
//
// corners order = [nw, ne, se, sw]  →  matches image coords [tl, tr, br, bl]
const buildHandleOverlay = () => {
  // ── Selection outline (matrix3d div) ─────────────────────────────────────
  const el = document.createElement('div');
  Object.assign(el.style, {
    position:        'absolute',
    boxSizing:       'border-box',
    width:           `${OW}px`,
    height:          `${OH}px`,
    left:            '0px',
    top:             '0px',
    border:          '1px dashed #f5a623',   // matches drawing selected-stroke
    cursor:          'move',
    transformOrigin: '0 0',
    pointerEvents:   'all',
    zIndex:          500,
    display:         'none',
  });

  // ── Connector stem (screen-space, rotated by positionOverlay) ─────────────
  const stem = document.createElement('div');
  Object.assign(stem.style, {
    position:        'absolute',
    width:           `${STEM_PX}px`,
    height:          '1px',
    background:      '#3b5bdb',
    pointerEvents:   'none',
    zIndex:          500,
    display:         'none',
    transformOrigin: 'left center',
  });

  // ── Rotate handle (screen-space, positioned by positionOverlay) ───────────
  const D_ROT = ROT_R * 2;
  const rot   = document.createElement('div');
  rot.dataset.role = 'rotate';
  Object.assign(rot.style, {
    position:     'absolute',
    width:        `${D_ROT}px`,
    height:       `${D_ROT}px`,
    borderRadius: '50%',
    background:   '#3b5bdb',
    border:       '1.5px solid #ffffff',
    cursor:       'grab',
    zIndex:       501,
    display:      'none',
    userSelect:   'none',
  });
  // Tiny SVG icon — pointer-events:none keeps mousedown on the rot div
  const svgNS    = 'http://www.w3.org/2000/svg';
  const svg      = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('width',   '7');
  svg.setAttribute('height',  '7');
  svg.setAttribute('viewBox', '0 0 24 24');
  Object.assign(svg.style, {
    pointerEvents: 'none',
    position:      'absolute',
    left:          '50%',
    top:           '50%',
    transform:     'translate(-50%,-50%)',
  });
  const iconPath = document.createElementNS(svgNS, 'path');
  iconPath.setAttribute(
    'd',
    'M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z',
  );
  iconPath.setAttribute('fill', '#ffffff');
  svg.appendChild(iconPath);
  rot.appendChild(svg);

  // ── Corner resize handles (screen-space, positioned by positionOverlay) ───
  // Order: [nw, ne, se, sw] matches image source coords [tl, tr, br, bl]
  const D_HANDLE = HANDLE_R * 2;
  const corners  = [
    { corner: 'nw', cursor: 'nw-resize' },
    { corner: 'ne', cursor: 'ne-resize' },
    { corner: 'se', cursor: 'se-resize' },
    { corner: 'sw', cursor: 'sw-resize' },
  ].map(({ corner, cursor }) => {
    const h = document.createElement('div');
    h.dataset.role   = 'resize';
    h.dataset.corner = corner;
    Object.assign(h.style, {
      position:     'absolute',
      width:        `${D_HANDLE}px`,
      height:       `${D_HANDLE}px`,
      background:   '#3b5bdb',
      border:       '1.5px solid #ffffff',
      borderRadius: '50%',
      cursor,
      zIndex:       501,
      display:      'none',
    });
    return h;
  });

  return { el, stem, rot, corners };
};

// Reposition ALL overlay elements to match the current screen projection of the
// image coordinates.  Handles are positioned in raw screen pixels so they never
// inherit the scale from the matrix3d outline transform.
//
// overlayElements: { el, stem, rot, corners: [nw, ne, se, sw] }
// coordinates:     [[lng,lat], [lng,lat], [lng,lat], [lng,lat]]  = [tl, tr, br, bl]
const positionOverlay = ({ el, stem, rot, corners }, coordinates, map) => {
  const px = coordinates.map((c) => map.project(c));
  const [tl, tr, br, bl] = px;

  // ── Selection outline: matrix3d homography (maps 100×100 → screen quad) ──
  const x0 = tl.x, y0 = tl.y;
  const x1 = tr.x, y1 = tr.y;
  const x2 = br.x, y2 = br.y;
  const x3 = bl.x, y3 = bl.y;

  const dx1 = x1 - x2,  dy1 = y1 - y2;
  const dx2 = x3 - x2,  dy2 = y3 - y2;
  const dx3 = x0 - x1 + x2 - x3;
  const dy3 = y0 - y1 + y2 - y3;
  const det = dx1 * dy2 - dx2 * dy1;
  if (Math.abs(det) < 1e-10) return;

  const h31u = (dx3 * dy2 - dx2 * dy3) / det;
  const h32u = (dx1 * dy3 - dx3 * dy1) / det;

  const h11 = (x1 - x0 + h31u * x1) / OW;
  const h21 = (y1 - y0 + h31u * y1) / OW;
  const h31 =  h31u / OW;
  const h12 = (x3 - x0 + h32u * x3) / OH;
  const h22 = (y3 - y0 + h32u * y3) / OH;
  const h32 =  h32u / OH;
  const h13 = x0, h23 = y0;

  Object.assign(el.style, {
    left: '0px', top: '0px',
    width: `${OW}px`, height: `${OH}px`,
    transformOrigin: '0 0',
    transform: `matrix3d(${h11},${h21},0,${h31},${h12},${h22},0,${h32},0,0,1,0,${h13},${h23},0,1)`,
  });

  // ── Corner handles: each fixed at the projected screen corner ─────────────
  // corners[0]=nw=tl, [1]=ne=tr, [2]=se=br, [3]=sw=bl
  [tl, tr, br, bl].forEach((pt, i) => {
    Object.assign(corners[i].style, {
      left: `${pt.x - HANDLE_R}px`,
      top:  `${pt.y - HANDLE_R}px`,
    });
  });

  // ── Stem + rotate handle: perpendicular to the image's top edge ───────────
  // Screen space has y increasing DOWNWARD, so the CW rotation of the top-edge
  // vector (edgeDx, edgeDy) is (edgeDy, -edgeDx), which points AWAY from the
  // image interior (outward).  The CCW rotation (-edgeDy, edgeDx) would point
  // INTO the image — that was the original bug placing the handle inside.
  const midX    = (tl.x + tr.x) / 2;
  const midY    = (tl.y + tr.y) / 2;
  const edgeDx  = tr.x - tl.x;
  const edgeDy  = tr.y - tl.y;
  const edgeLen = Math.sqrt(edgeDx * edgeDx + edgeDy * edgeDy) || 1;
  const nX      =  edgeDy / edgeLen;   // outward normal X (CW rotation of edge)
  const nY      = -edgeDx / edgeLen;   // outward normal Y (CW rotation of edge)

  // Stem: starts at midX/midY, extends STEM_PX in normal direction
  const stemAngleDeg = Math.atan2(nY, nX) * (180 / Math.PI);
  Object.assign(stem.style, {
    left:      `${midX}px`,
    top:       `${midY}px`,
    transform: `rotate(${stemAngleDeg}deg)`,
  });

  // Rotate handle: centre is STEM_PX + ROT_R beyond midpoint
  const rotCX = midX + nX * (STEM_PX + ROT_R);
  const rotCY = midY + nY * (STEM_PX + ROT_R);
  Object.assign(rot.style, {
    left: `${rotCX - ROT_R}px`,
    top:  `${rotCY - ROT_R}px`,
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

  // Live coordinates per id — updated imperatively during drag
  const liveCoordsRef = useRef(new Map());

  // The ONE overlay elements object — created once on mount, never recreated
  // Shape: { el, stem, rot, corners: [nw, ne, se, sw] }
  const overlayElRef   = useRef(null);
  const overlayItemRef = useRef(null);

  // Always-current values — readable in event handlers without stale closure
  const itemsRef = useRef(items);
  useEffect(() => { itemsRef.current = items; }, [items]);

  const selectedIdRef = useRef(selectedId);
  useEffect(() => { selectedIdRef.current = selectedId; }, [selectedId]);

  const activeToolRef = useRef(activeTool);
  useEffect(() => { activeToolRef.current = activeTool; }, [activeTool]);

  // Flag to prevent the general map 'click' from clearing selection right after
  // a hit-layer click selects an image (both fire for the same browser event).
  const selectJustFiredRef = useRef(false);

  // Drag state
  const moveDragRef   = useRef({ active: false });
  const rotateDragRef = useRef({ active: false });
  const resizeDragRef = useRef({ active: false });
  const isDraggingRef = useRef(false);

  // ── Create overlay elements on mount ─────────────────────────────────────
  useEffect(() => {
    if (!map) return;
    const ov        = buildHandleOverlay();
    const container = map.getCanvasContainer();

    // Append each element separately — they are siblings in screen space,
    // NOT children of the matrix3d div, so their sizes are always in real px.
    container.appendChild(ov.el);
    container.appendChild(ov.stem);
    container.appendChild(ov.rot);
    ov.corners.forEach((h) => container.appendChild(h));
    overlayElRef.current = ov;

    // Reposition on every MapLibre render (handles pan / zoom / pitch)
    const onRender = () => {
      if (!overlayItemRef.current || !overlayElRef.current) return;
      const coords = liveCoordsRef.current.get(overlayItemRef.current)
        ?? itemsRef.current.find((i) => i.id === overlayItemRef.current)?.coordinates;
      if (coords) positionOverlay(overlayElRef.current, coords, map);
    };
    map.on('render', onRender);

    return () => {
      map.off('render', onRender);
      ov.el.remove();
      ov.stem.remove();
      ov.rot.remove();
      ov.corners.forEach((h) => h.remove());
      overlayElRef.current   = null;
      overlayItemRef.current = null;
    };
  }, [map]);

  // ── Show / hide overlay ───────────────────────────────────────────────────
  const showOverlay = useCallback((itemId) => {
    const ov = overlayElRef.current;
    if (!ov || !map) return;
    const item = itemsRef.current.find((i) => i.id === itemId);
    if (!item) return;

    overlayItemRef.current = itemId;
    positionOverlay(ov, item.coordinates, map);
    ov.el.style.display   = 'block';
    ov.stem.style.display = 'block';
    ov.rot.style.display  = 'block';
    ov.corners.forEach((h) => { h.style.display = 'block'; });
  }, [map]);

  const hideOverlay = useCallback(() => {
    const ov = overlayElRef.current;
    if (!ov) return;
    ov.el.style.display   = 'none';
    ov.stem.style.display = 'none';
    ov.rot.style.display  = 'none';
    ov.corners.forEach((h) => { h.style.display = 'none'; });
    overlayItemRef.current = null;
  }, []);

  // ── Wire overlay event handlers once (on mount) ───────────────────────────
  // Handlers read from refs so they are never stale.
  useEffect(() => {
    if (!map) return;
    const ov = overlayElRef.current;
    if (!ov) return;
    const { el, rot, corners } = ov;

    // cornerMap: corner name → index in liveCoords ([tl,tr,br,bl])
    const cornerMap = { nw: 0, ne: 1, se: 2, sw: 3 };

    // ── Move ─────────────────────────────────────────────────────────────
    // Fires on the outline div. Handles are sibling elements with higher
    // z-index, so clicks on handles never bubble to el.
    el.addEventListener('mousedown', (e) => {
      e.stopPropagation();
      e.preventDefault();

      const itemId = overlayItemRef.current;
      const item   = itemsRef.current.find((i) => i.id === itemId);
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
    rot.addEventListener('mousedown', (e) => {
      e.stopPropagation();
      e.preventDefault();

      const itemId = overlayItemRef.current;
      const item   = itemsRef.current.find((i) => i.id === itemId);
      if (!item) return;

      map.dragPan.disable();
      const coords    = liveCoordsRef.current.get(itemId) ?? item.coordinates;
      const center    = getCenter(coords);
      const cp        = map.project(center);
      const cRect     = map.getCanvasContainer().getBoundingClientRect();
      const initAngle = Math.atan2(
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
    corners.forEach((handle) => {
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
  }, [map, dispatch, hideOverlay]);

  // ── Core drag logic: update sources imperatively, never touch Redux ───────
  useEffect(() => {
    if (!map) return;

    const updateSourcesDirect = (id, newCoords) => {
      const entry = registryRef.current.get(id);
      if (!entry) return;
      map.getSource(entry.sourceId)?.setCoordinates(newCoords);
      // Keep hit polygon in sync so click detection follows the image
      map.getSource(`${entry.sourceId}-hit`)?.setData({
        type: 'Feature',
        geometry: { type: 'Polygon', coordinates: [[...newCoords, newCoords[0]]] },
        properties: {},
      });
      liveCoordsRef.current.set(id, newCoords);
      if (overlayItemRef.current === id && overlayElRef.current) {
        positionOverlay(overlayElRef.current, newCoords, map);
      }
    };

    const onMove = (e) => {
      // ── Move ────────────────────────────────────────────────────────────
      const md = moveDragRef.current;
      if (md.active) {
        isDraggingRef.current = true;
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
        const center = getCenter(rr.liveCoords);
        const cp     = map.project(center);
        const cRect  = map.getCanvasContainer().getBoundingClientRect();
        const angle  = Math.atan2(
          e.clientY - (cRect.top  + cp.y),
          e.clientX - (cRect.left + cp.x),
        );
        // Negate delta: atan2 is in screen space (y-down) but lat/lng has y-up.
        // Without negation a clockwise drag produces a counter-clockwise rotation.
        const delta = rr.lastAngle - angle;
        const cos   = Math.cos(delta);
        const sin   = Math.sin(delta);

        const newCoords = rr.liveCoords.map(([lng, lat]) => {
          const dx = lng - center[0];
          const dy = lat - center[1];
          return [center[0] + dx * cos - dy * sin, center[1] + dx * sin + dy * cos];
        });
        rr.liveCoords   = newCoords;
        rr.lastAngle    = angle;
        rr.liveRotation = (rr.liveRotation - delta * (180 / Math.PI)) % 360;

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
  // Only clear image selection when switching AWAY from 'select', so that the
  // auto-select dispatch on image import isn't immediately undone.
  useEffect(() => {
    if (activeTool !== 'select') dispatch(clearItemSelection());
    dispatch(clearSelection());
  }, [activeTool, dispatch]);

  // ── selectedId change → show/hide overlay ────────────────────────────────
  useEffect(() => {
    if (selectedId) showOverlay(selectedId);
    else            hideOverlay();
  }, [selectedId, showOverlay, hideOverlay]);

  // ── Sync items → MapLibre sources (add new, remove deleted) ─────────────
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
        // Existing item — only push coords when they genuinely changed
        if (!isDraggingRef.current) {
          const live  = liveCoordsRef.current.get(item.id);
          const redux = item.coordinates;
          const coordsChanged = !live || live.some(
            ([lng, lat], i) => lng !== redux[i][0] || lat !== redux[i][1],
          );
          if (coordsChanged) {
            liveCoordsRef.current.set(item.id, redux.map((c) => [...c]));
            map.getSource(sourceId)?.setCoordinates(redux);
            map.getSource(`${sourceId}-hit`)?.setData({
              type: 'Feature',
              geometry: { type: 'Polygon', coordinates: [[...redux, redux[0]]] },
              properties: {},
            });
          }
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
          if (activeToolRef.current !== 'select') return;
          e.originalEvent.stopPropagation();
          selectJustFiredRef.current = true;
          dispatch(selectItem(item.id));
        });
        map.on('mouseenter', hitLayerId, () => { map.getCanvas().style.cursor = 'pointer'; });
        map.on('mouseleave', hitLayerId, () => { map.getCanvas().style.cursor = '';        });

        registry.set(item.id, { sourceId, layerId, hitLayerId });
        liveCoordsRef.current.set(item.id, item.coordinates.map((c) => [...c]));

      } catch (err) {
        console.error('[ImageOverlayManager] create failed:', err);
      }
    });
  }, [map, items, dispatch]);

  // ── Click map background → deselect ──────────────────────────────────────
  useEffect(() => {
    if (!map) return;
    const onClick = () => {
      if (selectJustFiredRef.current) {
        selectJustFiredRef.current = false;
        return;
      }
      if (activeToolRef.current === 'select') dispatch(clearItemSelection());
    };
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
