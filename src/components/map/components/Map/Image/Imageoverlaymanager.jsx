// ImageOverlayManager.jsx
// Renders each image/SVG as a maplibregl.Marker with a custom HTML element.
// Handles: move (drag marker), resize (corner handles), delete (key / button).

import { useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector }        from 'react-redux';
import maplibregl                          from 'maplibre-gl';
import { updateItem, removeItem, selectItem, clearItemSelection } from '../../../../../store/slices/imageOverlaySlice';

// ── Constants ────────────────────────────────────────────────────────────────
const HANDLE_SIZE   = 10;   // px
const MIN_SIZE      = 32;   // px minimum width/height
const BORDER_NORMAL = '1px dashed transparent';
const BORDER_SEL    = '1px dashed #1a73e8';

// ── Build the marker DOM element ─────────────────────────────────────────────
// Returns { wrapper, img, handles[] }
const buildElement = (item) => {
  const wrapper = document.createElement('div');
  wrapper.dataset.overlayId = item.id;
  Object.assign(wrapper.style, {
    position:    'relative',
    width:       `${item.width}px`,
    height:      `${item.height}px`,
    cursor:      'move',
    userSelect:  'none',
    border:      item.selected ? BORDER_SEL : BORDER_NORMAL,
    boxSizing:   'border-box',
  });

  // ── Image / SVG content ──────────────────────────────────────────────────
  let content;
  if (item.type === 'svg') {
    // SVG markup → inline via a blob URL so it scales naturally
    const blob = new Blob([item.src], { type: 'image/svg+xml' });
    const url  = URL.createObjectURL(blob);
    content    = document.createElement('img');
    content.src = url;
    content._blobUrl = url; // store for cleanup
  } else {
    content     = document.createElement('img');
    content.src = item.src;
  }

  Object.assign(content.style, {
    width:       '100%',
    height:      '100%',
    display:     'block',
    pointerEvents: 'none',
    objectFit:   'contain',
  });
  wrapper.appendChild(content);

  // ── Delete button (top-right, only visible when selected) ────────────────
  const deleteBtn = document.createElement('button');
  deleteBtn.dataset.role = 'delete';
  deleteBtn.textContent  = '×';
  Object.assign(deleteBtn.style, {
    display:         item.selected ? 'flex' : 'none',
    position:        'absolute',
    top:             '-12px',
    right:           '-12px',
    width:           '22px',
    height:          '22px',
    borderRadius:    '50%',
    border:          'none',
    background:      '#e03131',
    color:           '#fff',
    fontSize:        '14px',
    fontWeight:      'bold',
    cursor:          'pointer',
    alignItems:      'center',
    justifyContent:  'center',
    zIndex:          10,
    padding:         0,
    lineHeight:      1,
  });
  wrapper.appendChild(deleteBtn);

  // ── Resize handles (corners, only visible when selected) ─────────────────
  const corners = [
    { id: 'nw', top: 0,    left: 0,    cursor: 'nw-resize' },
    { id: 'ne', top: 0,    right: 0,   cursor: 'ne-resize' },
    { id: 'sw', bottom: 0, left: 0,    cursor: 'sw-resize' },
    { id: 'se', bottom: 0, right: 0,   cursor: 'se-resize' },
  ];

  corners.forEach(({ id, cursor, ...pos }) => {
    const h = document.createElement('div');
    h.dataset.role   = 'resize';
    h.dataset.corner = id;
    Object.assign(h.style, {
      display:         item.selected ? 'block' : 'none',
      position:        'absolute',
      width:           `${HANDLE_SIZE}px`,
      height:          `${HANDLE_SIZE}px`,
      background:      '#1a73e8',
      border:          '2px solid #fff',
      borderRadius:    '2px',
      cursor,
      zIndex:          10,
      ...Object.fromEntries(
        Object.entries(pos).map(([k, v]) => [k, `${-HANDLE_SIZE / 2}px`])
      ),
    });
    wrapper.appendChild(h);
  });

  return wrapper;
};

// ── Helper: show/hide selection UI on an existing element ────────────────────
const applySelectionStyle = (el, selected) => {
  el.style.border = selected ? BORDER_SEL : BORDER_NORMAL;
  el.querySelectorAll('[data-role="resize"]').forEach((h) => {
    h.style.display = selected ? 'block' : 'none';
  });
  const btn = el.querySelector('[data-role="delete"]');
  if (btn) btn.style.display = selected ? 'flex' : 'none';
};

// ── Component ────────────────────────────────────────────────────────────────
export default function ImageOverlayManager() {
  const dispatch   = useDispatch();
  const map        = useSelector((s) => s.map.mapContainer);
  const items      = useSelector((s) => s.imageOverlay.items);
  const selectedId = useSelector((s) => s.imageOverlay.selectedId);

  // Registry: id → { marker, element }
  const registryRef = useRef(new Map());

  // ── Resize drag state ────────────────────────────────────────────────────
  const resizeDragRef = useRef({
    active:    false,
    id:        null,
    corner:    null,
    startX:    0,
    startY:    0,
    origW:     0,
    origH:     0,
    origLngLat: null,
  });

  // ── Handle delete button click ────────────────────────────────────────────
  const handleDeleteClick = useCallback((id) => {
    const entry = registryRef.current.get(id);
    if (entry) {
      // Revoke blob URL if SVG
      const img = entry.element.querySelector('img');
      if (img?._blobUrl) URL.revokeObjectURL(img._blobUrl);
      entry.marker.remove();
      registryRef.current.delete(id);
    }
    dispatch(removeItem(id));
  }, [dispatch]);

  // ── Global mousemove / mouseup for resize ────────────────────────────────
  useEffect(() => {
    const onMouseMove = (e) => {
      const dr = resizeDragRef.current;
      if (!dr.active) return;

      const dx = e.clientX - dr.startX;
      const dy = e.clientY - dr.startY;

      let newW = dr.origW;
      let newH = dr.origH;

      // Corner determines which dimension grows which direction
      if (dr.corner === 'se') { newW = dr.origW + dx; newH = dr.origH + dy; }
      if (dr.corner === 'sw') { newW = dr.origW - dx; newH = dr.origH + dy; }
      if (dr.corner === 'ne') { newW = dr.origW + dx; newH = dr.origH - dy; }
      if (dr.corner === 'nw') { newW = dr.origW - dx; newH = dr.origH - dy; }

      newW = Math.max(MIN_SIZE, newW);
      newH = Math.max(MIN_SIZE, newH);

      // Update DOM directly for smooth resize (no Redux on every pixel)
      const entry = registryRef.current.get(dr.id);
      if (entry) {
        entry.element.style.width  = `${newW}px`;
        entry.element.style.height = `${newH}px`;
      }
    };

    const onMouseUp = (e) => {
      const dr = resizeDragRef.current;
      if (!dr.active) return;

      const dx = e.clientX - dr.startX;
      const dy = e.clientY - dr.startY;
      let newW = dr.origW;
      let newH = dr.origH;
      if (dr.corner === 'se') { newW = dr.origW + dx; newH = dr.origH + dy; }
      if (dr.corner === 'sw') { newW = dr.origW - dx; newH = dr.origH + dy; }
      if (dr.corner === 'ne') { newW = dr.origW + dx; newH = dr.origH - dy; }
      if (dr.corner === 'nw') { newW = dr.origW - dx; newH = dr.origH - dy; }
      newW = Math.max(MIN_SIZE, newW);
      newH = Math.max(MIN_SIZE, newH);

      // Commit to Redux
      dispatch(updateItem({ id: dr.id, width: newW, height: newH }));
      resizeDragRef.current = { active: false };
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup',   onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup',   onMouseUp);
    };
  }, [dispatch]);

  // ── Delete key ────────────────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
        handleDeleteClick(selectedId);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedId, handleDeleteClick]);

  // ── Click outside → deselect ──────────────────────────────────────────────
  useEffect(() => {
    if (!map) return;
    const onMapClick = () => dispatch(clearItemSelection());
    map.on('click', onMapClick);
    return () => map.off('click', onMapClick);
  }, [map, dispatch]);

  // ── Main effect: sync items → markers ────────────────────────────────────
  useEffect(() => {
    if (!map) return;

    const registry  = registryRef.current;
    const incomingIds = new Set(items.map((i) => i.id));

    // Remove markers for deleted items
    registry.forEach((entry, id) => {
      if (!incomingIds.has(id)) {
        const img = entry.element.querySelector('img');
        if (img?._blobUrl) URL.revokeObjectURL(img._blobUrl);
        entry.marker.remove();
        registry.delete(id);
      }
    });

    items.forEach((item) => {
      if (registry.has(item.id)) {
        // ── Update existing marker ──────────────────────────────────────
        const { marker, element } = registry.get(item.id);

        // Size may have changed (resize committed to Redux)
        element.style.width  = `${item.width}px`;
        element.style.height = `${item.height}px`;

        // Selection state
        applySelectionStyle(element, item.selected);

        // Position
        marker.setLngLat(item.lngLat);
        return;
      }

      // ── Create new marker ─────────────────────────────────────────────
      const element = buildElement(item);

      // ── Marker drag (move) ────────────────────────────────────────────
      const marker = new maplibregl.Marker({
        element,
        anchor:   'top-left',
        draggable: true,
      })
        .setLngLat(item.lngLat)
        .addTo(map);

      marker.on('drag', () => {
        // live position handled by maplibre, no Redux update needed during drag
      });
      marker.on('dragend', () => {
        const { lng, lat } = marker.getLngLat();
        dispatch(updateItem({ id: item.id, lngLat: [lng, lat] }));
      });

      // ── Click: select this item, stop map click from deselecting ─────
      element.addEventListener('click', (e) => {
        e.stopPropagation();
        dispatch(selectItem(item.id));
      });

      // ── Delete button ─────────────────────────────────────────────────
      const deleteBtn = element.querySelector('[data-role="delete"]');
      if (deleteBtn) {
        deleteBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          handleDeleteClick(item.id);
        });
      }

      // ── Resize handle mousedown ───────────────────────────────────────
      element.querySelectorAll('[data-role="resize"]').forEach((handle) => {
        handle.addEventListener('mousedown', (e) => {
          e.stopPropagation();
          e.preventDefault();
          // Disable marker drag during resize
          marker.setDraggable(false);

          const rect = element.getBoundingClientRect();
          resizeDragRef.current = {
            active:     true,
            id:         item.id,
            corner:     handle.dataset.corner,
            startX:     e.clientX,
            startY:     e.clientY,
            origW:      rect.width,
            origH:      rect.height,
          };

          // Re-enable drag on mouseup
          const onUp = () => {
            marker.setDraggable(true);
            window.removeEventListener('mouseup', onUp);
          };
          window.addEventListener('mouseup', onUp);
        });
      });

      registry.set(item.id, { marker, element });
    });
  }, [map, items, dispatch, handleDeleteClick]);

  // ── Clean up all markers on unmount ──────────────────────────────────────
  useEffect(() => {
    return () => {
      registryRef.current.forEach(({ marker, element }) => {
        const img = element.querySelector('img');
        if (img?._blobUrl) URL.revokeObjectURL(img._blobUrl);
        marker.remove();
      });
      registryRef.current.clear();
    };
  }, []);

  return null;
}