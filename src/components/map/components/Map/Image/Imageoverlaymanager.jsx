// ImageOverlayManager.jsx
// Images: MapLibre raster source+layer (zooms with map).
// Interaction: transparent fill layer on top catches clicks.
// Handles: DOM overlay on canvasContainer, repositioned on every render.

import { useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector }        from 'react-redux';
import {
  updateItem, removeItem, selectItem, clearItemSelection,
} from '../../../../../store/slices/imageOverlaySlice';
import { clearSelection } from '../../../../../store/slices/drawingSlice';
import {
  getCenter, getWidthMetres,
  translateCoordinates, rotateCoordinates, resizeCoordinates,
} from './imageOverlayUtils';

const HS = 10; // handle size px

// ── Build handle overlay DOM ──────────────────────────────────────────────────
const buildHandleOverlay = () => {
  const el = document.createElement('div');
  Object.assign(el.style, {
    position:        'absolute',
    boxSizing:       'border-box',
    border:          '2px dashed #1a73e8',
    cursor:          'move',
    transformOrigin: '0 0',
    // handles inside need pointer events; overlay itself also needs them for move
    pointerEvents:   'all',
    zIndex:          500,
  });

  // Rotate handle — top-center
  const rot = document.createElement('div');
  rot.dataset.role = 'rotate';
  Object.assign(rot.style, {
    position:       'absolute',
    top:            '-30px',
    left:           '50%',
    transform:      'translateX(-50%)',
    width:          '20px',
    height:         '20px',
    borderRadius:   '50%',
    background:     '#1a73e8',
    border:         '2px solid #fff',
    cursor:         'grab',
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    fontSize:       '12px',
    color:          '#fff',
    userSelect:     'none',
  });
  rot.textContent = '↺';
  el.appendChild(rot);

  // Delete button — top-right
  const del = document.createElement('button');
  del.dataset.role = 'delete';
  del.textContent  = '×';
  Object.assign(del.style, {
    position:       'absolute',
    top:            '-13px',
    right:          '-13px',
    width:          '22px',
    height:         '22px',
    borderRadius:   '50%',
    border:         'none',
    background:     '#e03131',
    color:          '#fff',
    fontSize:       '15px',
    fontWeight:     'bold',
    cursor:         'pointer',
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    padding:        0,
    zIndex:         10,
  });
  el.appendChild(del);

  // Resize corner handles
  [
    { id: 'nw', top:    `${-HS/2}px`, left:   `${-HS/2}px`, cursor: 'nw-resize' },
    { id: 'ne', top:    `${-HS/2}px`, right:  `${-HS/2}px`, cursor: 'ne-resize' },
    { id: 'sw', bottom: `${-HS/2}px`, left:   `${-HS/2}px`, cursor: 'sw-resize' },
    { id: 'se', bottom: `${-HS/2}px`, right:  `${-HS/2}px`, cursor: 'se-resize' },
  ].forEach(({ id, cursor, ...pos }) => {
    const h = document.createElement('div');
    h.dataset.role   = 'resize';
    h.dataset.corner = id;
    Object.assign(h.style, {
      position:    'absolute',
      width:       `${HS}px`,
      height:      `${HS}px`,
      background:  '#1a73e8',
      border:      '2px solid #fff',
      borderRadius:'2px',
      cursor,
      zIndex:      10,
      ...pos,
    });
    el.appendChild(h);
  });

  return el;
};

// ── Position handle overlay to match image screen bbox ────────────────────────
// Uses top-left corner as origin + rotation angle from TL→TR vector.
const positionOverlay = (el, coordinates, map) => {
  const px = coordinates.map((c) => map.project(c));
  // [0]=TL [1]=TR [2]=BR [3]=BL
  const [tl, tr] = px;

  const w     = Math.hypot(tr.x - tl.x, tr.y - tl.y);
  // height from TL→BL
  const bl    = px[3];
  const h     = Math.hypot(bl.x - tl.x, bl.y - tl.y);
  const angle = Math.atan2(tr.y - tl.y, tr.x - tl.x) * (180 / Math.PI);

  Object.assign(el.style, {
    left:      `${tl.x}px`,
    top:       `${tl.y}px`,
    width:     `${w}px`,
    height:    `${h}px`,
    transform: `rotate(${angle}deg)`,
  });
};

// ── Component ─────────────────────────────────────────────────────────────────
export default function ImageOverlayManager() {
  const dispatch   = useDispatch();
  const map        = useSelector((s) => s.map.mapContainer);
  const items      = useSelector((s) => s.imageOverlay.items);
  const selectedId = useSelector((s) => s.imageOverlay.selectedId);
  const activeTool = useSelector((s) => s.drawingToolbar.activeTool);

  // id → { sourceId, layerId, hitLayerId }
  const registryRef   = useRef(new Map());
  // Gating flag — while true, the items useEffect skips setCoordinates
  // (drag handlers update sources directly for zero-latency smooth updates)
  const isDraggingRef = useRef(false);

  // Single handle overlay (only one selection at a time)
  const overlayElRef  = useRef(null);

  // Always-current item data for drag handlers (avoids stale closure)
  const itemsRef      = useRef(items);
  useEffect(() => { itemsRef.current = items; }, [items]);

  const resizeDragRef = useRef({ active: false });
  const rotateDragRef = useRef({ active: false });
  const moveDragRef   = useRef({ active: false });

  // ── Deselect on tool change ───────────────────────────────────────────────
  useEffect(() => {
    dispatch(clearItemSelection());
    dispatch(clearSelection());
  }, [activeTool, dispatch]);

  // ── Remove handle overlay ─────────────────────────────────────────────────
  const removeOverlay = useCallback(() => {
    if (overlayElRef.current) {
      overlayElRef.current._offRender?.();
      overlayElRef.current.remove();
      overlayElRef.current = null;
    }
  }, []);

  // ── Update both raster + hit sources directly (used during drag) ────────────
  // Bypasses Redux entirely so there is zero re-render latency.
  const updateSources = useCallback((id, newCoords) => {
    const entry = registryRef.current.get(id);
    if (!entry || !map) return;

    // Update raster image position
    map.getSource(entry.sourceId)?.setCoordinates(newCoords);

    // Update transparent hit polygon so click target stays in sync
    map.getSource(`${entry.sourceId}-hit`)?.setData({
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [[...newCoords, newCoords[0]]],
      },
      properties: {},
    });

    // Update overlay handle position directly — no re-render needed
    if (overlayElRef.current) positionOverlay(overlayElRef.current, newCoords, map);
  }, [map]);

  // ── Delete item ───────────────────────────────────────────────────────────
  const handleDelete = useCallback((id) => {
    removeOverlay();
    const entry = registryRef.current.get(id);
    if (entry && map) {
      try { if (map.getLayer(entry.hitLayerId)) map.removeLayer(entry.hitLayerId); } catch {}
      try { if (map.getLayer(entry.layerId))    map.removeLayer(entry.layerId);    } catch {}
      try { if (map.getSource(entry.sourceId))  map.removeSource(entry.sourceId); } catch {}
      registryRef.current.delete(id);
    }
    dispatch(removeItem(id));
  }, [map, dispatch, removeOverlay]);

  // ── Create / update handle overlay for selected item ─────────────────────
  const showOverlay = useCallback((itemId) => {
    if (!map) return;
    removeOverlay();

    const item = itemsRef.current.find((i) => i.id === itemId);
    if (!item) return;

    const el = buildHandleOverlay();
    overlayElRef.current = el;
    map.getCanvasContainer().appendChild(el);

    // Initial position
    positionOverlay(el, item.coordinates, map);

    // Reposition on every map render so it tracks pan/zoom
    const onRender = () => {
      const current = itemsRef.current.find((i) => i.id === itemId);
      if (!current || !overlayElRef.current) return;
      positionOverlay(overlayElRef.current, current.coordinates, map);
    };
    map.on('render', onRender);
    el._offRender = () => map.off('render', onRender);

    // ── Delete ───────────────────────────────────────────────────────────
    el.querySelector('[data-role="delete"]').addEventListener('click', (e) => {
      e.stopPropagation();
      handleDelete(itemId);
    });

    // ── Move (drag the overlay border) ────────────────────────────────────
    el.addEventListener('mousedown', (e) => {
      // ignore clicks on child handles — they have their own handlers
      const role = e.target.dataset?.role;
      if (role === 'rotate' || role === 'resize' || role === 'delete') return;

      e.stopPropagation();
      e.preventDefault();
      map.dragPan.disable();

      const current = itemsRef.current.find((i) => i.id === itemId);
      moveDragRef.current = {
        active:     true,
        id:         itemId,
        startX:     e.clientX,
        startY:     e.clientY,
        origCoords: current.coordinates.map((c) => [...c]),
      };
    });

    // ── Rotate ───────────────────────────────────────────────────────────
    el.querySelector('[data-role="rotate"]').addEventListener('mousedown', (e) => {
      e.stopPropagation();
      e.preventDefault();
      map.dragPan.disable();

      const current = itemsRef.current.find((i) => i.id === itemId);
      rotateDragRef.current = {
        active:      true,
        id:          itemId,
        aspectRatio: current.aspectRatio,
        origCoords:  current.coordinates.map((c) => [...c]),
        rotation:    current.rotation || 0,
      };
    });

    // ── Resize ───────────────────────────────────────────────────────────
    el.querySelectorAll('[data-role="resize"]').forEach((handle) => {
      handle.addEventListener('mousedown', (e) => {
        e.stopPropagation();
        e.preventDefault();
        map.dragPan.disable();

        const current = itemsRef.current.find((i) => i.id === itemId);
        resizeDragRef.current = {
          active:      true,
          id:          itemId,
          corner:      handle.dataset.corner,
          aspectRatio: current.aspectRatio,
          rotation:    current.rotation || 0,
          origCoords:  current.coordinates.map((c) => [...c]),
          origWidthM:  getWidthMetres(current.coordinates),
          startX:      e.clientX,
          startY:      e.clientY,
        };
      });
    });
  }, [map, handleDelete, removeOverlay]);

  // ── Global mousemove / mouseup ────────────────────────────────────────────
  useEffect(() => {
    if (!map) return;

    // Helper: px delta → lng/lat delta at current zoom
    const pxToLngLat = (dx, dy) => {
      const center = map.getCenter();
      const cp     = map.project(center);
      const newPos = map.unproject({ x: cp.x + dx, y: cp.y + dy });
      return [newPos.lng - center.lng, newPos.lat - center.lat];
    };

    const onMove = (e) => {
      // ── Move ────────────────────────────────────────────────────────────
      const md = moveDragRef.current;
      if (md.active) {
        const [dlng, dlat] = pxToLngLat(
          e.clientX - md.startX,
          e.clientY - md.startY,
        );
        const newCoords = translateCoordinates(md.origCoords, dlng, dlat);
        md.liveCoords   = newCoords;

        isDraggingRef.current = true;
        updateSources(md.id, newCoords);
        return;
      }

      // ── Rotate ──────────────────────────────────────────────────────────
      const rr = rotateDragRef.current;
      if (rr.active) {
        // Center of image in screen space
        const center = getCenter(rr.origCoords);
        const cp     = map.project(center);

        // Angle from center → mouse, +90 so 0° = pointing up
        const angle   = Math.atan2(e.clientY - cp.y, e.clientX - cp.x) * (180 / Math.PI) + 90;
        const rounded = Math.round(angle);

        const newCoords = rotateCoordinates(rr.origCoords, rounded, rr.aspectRatio);
        rr.liveCoords   = newCoords;
        rr.liveRotation = rounded;

        isDraggingRef.current = true;
        updateSources(rr.id, newCoords);
        return;
      }

      // ── Resize ──────────────────────────────────────────────────────────
      const rd = resizeDragRef.current;
      if (rd.active) {
        const dx    = e.clientX - rd.startX;
        // Left-side corners shrink when dragging right
        const sign  = (rd.corner === 'nw' || rd.corner === 'sw') ? -1 : 1;
        // 1 screen pixel → how many metres at current zoom?
        const [mPerPxLng] = pxToLngLat(1, 0);
        const mPerPx = Math.abs(mPerPxLng) * 111320 *
          Math.cos((getCenter(rd.origCoords)[1] * Math.PI) / 180);
        const newWidthM = Math.max(2, rd.origWidthM + sign * dx * mPerPx);
        const newCoords = resizeCoordinates(rd.origCoords, newWidthM, rd.aspectRatio, rd.rotation);
        rd.liveCoords   = newCoords;
        rd.liveWidthM   = newWidthM;

        isDraggingRef.current = true;
        updateSources(rd.id, newCoords);
      }
    };

    const onUp = () => {
      // Clear dragging flag BEFORE dispatch so the items useEffect
      // can safely call setCoordinates with the committed value
      isDraggingRef.current = false;

      const md = moveDragRef.current;
      if (md.active) {
        map.dragPan.enable();
        if (md.liveCoords) dispatch(updateItem({ id: md.id, coordinates: md.liveCoords }));
        moveDragRef.current = { active: false };
      }

      const rr = rotateDragRef.current;
      if (rr.active) {
        map.dragPan.enable();
        if (rr.liveCoords)
          dispatch(updateItem({ id: rr.id, coordinates: rr.liveCoords, rotation: rr.liveRotation }));
        rotateDragRef.current = { active: false };
      }

      const rd = resizeDragRef.current;
      if (rd.active) {
        map.dragPan.enable();
        if (rd.liveCoords) dispatch(updateItem({ id: rd.id, coordinates: rd.liveCoords }));
        resizeDragRef.current = { active: false };
      }
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup',   onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup',   onUp);
    };
  }, [map, dispatch, updateSources]);

  // ── Delete key ────────────────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId)
        handleDelete(selectedId);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedId, handleDelete]);

  // ── Click map background → deselect ──────────────────────────────────────
  useEffect(() => {
    if (!map) return;
    const onClick = () => {
      dispatch(clearItemSelection());
      removeOverlay();
    };
    map.on('click', onClick);
    return () => map.off('click', onClick);
  }, [map, dispatch, removeOverlay]);

  // ── React to selectedId change ────────────────────────────────────────────
  useEffect(() => {
    if (selectedId) {
      showOverlay(selectedId);
    } else {
      removeOverlay();
    }
  }, [selectedId, showOverlay, removeOverlay]);

  // ── Main sync: items → MapLibre sources/layers ────────────────────────────
  useEffect(() => {
    if (!map) return;

    const registry    = registryRef.current;
    const incomingIds = new Set(items.map((i) => i.id));

    // Remove deleted
    registry.forEach((entry, id) => {
      if (!incomingIds.has(id)) {
        try { if (map.getLayer(entry.hitLayerId))  map.removeLayer(entry.hitLayerId);  } catch {}
        try { if (map.getLayer(entry.layerId))     map.removeLayer(entry.layerId);     } catch {}
        try { if (map.getSource(entry.sourceId))   map.removeSource(entry.sourceId);  } catch {}
        registry.delete(id);
      }
    });

    items.forEach((item) => {
      const sourceId   = `img-src-${item.id}`;
      const layerId    = `img-lyr-${item.id}`;
      const hitLayerId = `img-hit-${item.id}`;

      if (registry.has(item.id)) {
        // Only update coordinates from Redux when NOT actively dragging.
        // During drag, the mousemove handler calls updateSources() directly
        // for zero-latency updates — no blink, no double update.
        if (!isDraggingRef.current) {
          map.getSource(sourceId)?.setCoordinates(item.coordinates);
          map.getSource(`${sourceId}-hit`)?.setData({
            type: 'Feature',
            geometry: {
              type: 'Polygon',
              coordinates: [[...item.coordinates, item.coordinates[0]]],
            },
            properties: {},
          });
        }
        return;
      }

      // ── Create ──────────────────────────────────────────────────────────
      try {
        // Raster source — the actual image
        map.addSource(sourceId, {
          type:        'image',
          url:         item.src,
          coordinates: item.coordinates,
        });
        map.addLayer({
          id:     layerId,
          type:   'raster',
          source: sourceId,
          paint:  { 'raster-opacity': 1 },
        });

        // Transparent fill on top — raster layers don't fire click events in MapLibre
        map.addSource(`${sourceId}-hit`, {
          type: 'geojson',
          data: {
            type: 'Feature',
            geometry: {
              type: 'Polygon',
              coordinates: [[...item.coordinates, item.coordinates[0]]],
            },
            properties: {},
          },
        });
        map.addLayer({
          id:     hitLayerId,
          type:   'fill',
          source: `${sourceId}-hit`,
          paint:  { 'fill-opacity': 0, 'fill-color': '#000' },
        });

        map.on('click', hitLayerId, (e) => {
          e.originalEvent.stopPropagation();
          dispatch(selectItem(item.id));
        });
        map.on('mouseenter', hitLayerId, () => { map.getCanvas().style.cursor = 'pointer'; });
        map.on('mouseleave', hitLayerId, () => { map.getCanvas().style.cursor = '';        });

        registry.set(item.id, { sourceId, layerId, hitLayerId });

      } catch (err) {
        console.error('[ImageOverlayManager] create failed:', err);
      }
    });
  }, [map, items, dispatch]);

  // ── Cleanup on unmount ────────────────────────────────────────────────────
  useEffect(() => () => {
    removeOverlay();
    if (map) {
      registryRef.current.forEach(({ sourceId, layerId, hitLayerId }) => {
        try { if (map.getLayer(hitLayerId))          map.removeLayer(hitLayerId);         } catch {}
        try { if (map.getLayer(layerId))             map.removeLayer(layerId);            } catch {}
        try { if (map.getSource(`${sourceId}-hit`))  map.removeSource(`${sourceId}-hit`); } catch {}
        try { if (map.getSource(sourceId))           map.removeSource(sourceId);          } catch {}
      });
    }
    registryRef.current.clear();
  }, []);

  return null;
}