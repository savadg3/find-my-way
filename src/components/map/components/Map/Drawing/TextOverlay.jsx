// TextOverlay.jsx
// Renders text drawing shapes as absolutely-positioned HTML elements
// overlaid on the MapLibre canvas.  Gives full CSS font support
// (any font-family, bold, textAlign) which MapLibre symbol layers cannot do.
//
// Interactions:
//   Single-click  (select tool) → select the shape
//   Double-click  (select tool) → enter inline edit mode (textarea, multi-line)
//   Click         (eraser tool) → delete the shape
//   Drag          (select tool) → move the shape (commits on mouseup)
//   Ctrl+Enter / ⌘+Enter       → commit edit
//   Escape                      → cancel edit
//   Click outside textarea      → commit edit (onBlur)

import { useEffect, useRef, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
    setSelectedIds,
    toggleSelectedId,
    updateShape,
    removeShapes,
} from '../../../../../store/slices/drawingSlice';

// ── 8 resize-handle positions around the selection box ───────────────────────
const HANDLES = [
    { top: -4,                left:  -4               },
    { top: -4,                left:  'calc(50% - 4px)'},
    { top: -4,                right: -4               },
    { top: 'calc(50% - 4px)', left:  -4               },
    { top: 'calc(50% - 4px)', right: -4               },
    { bottom: -4,             left:  -4               },
    { bottom: -4,             left:  'calc(50% - 4px)'},
    { bottom: -4,             right: -4               },
];

// ── Auto-resizing textarea used for inline editing ───────────────────────────
function EditTextarea({ value, onChange, onCommit, onCancel, textStyle }) {
    const ref = useRef(null);

    // Focus + move caret to end on mount, then auto-size
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        el.focus();
        el.setSelectionRange(el.value.length, el.value.length);
        resize(el);
    }, []);

    const resize = (el) => {
        el.style.height = 'auto';
        el.style.height = el.scrollHeight + 'px';
    };

    return (
        <textarea
            ref={ref}
            value={value}
            onChange={e => { onChange(e.target.value); resize(e.target); }}
            onBlur={onCommit}
            onKeyDown={e => {
                e.stopPropagation(); // prevent map key handlers (Delete etc.) while typing
                if (e.key === 'Escape') {
                    e.preventDefault();
                    onCancel();
                }
                // Ctrl+Enter or ⌘+Enter → commit (plain Enter adds a newline)
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                    e.preventDefault();
                    onCommit();
                }
            }}
            style={{
                ...textStyle,
                resize:     'none',
                overflow:   'hidden',
                outline:    'none',
                border:     '1px dashed #4A90D9',
                background: 'rgba(255,255,255,0.95)',
                padding:    '2px 6px',
                minWidth:   '80px',
                boxSizing:  'border-box',
                display:    'block',
                cursor:     'text',
            }}
        />
    );
}

// ── Main overlay component ────────────────────────────────────────────────────
export default function TextOverlay() {
    const dispatch     = useDispatch();
    const map          = useSelector(s => s.map.mapContainer);
    const shapes       = useSelector(s => s.drawing.shapes);
    const selectedIds  = useSelector(s => s.drawing.selectedIds);
    const activeTool   = useSelector(s => s.drawingToolbar.activeTool);
    const currentFloor = useSelector(s => s.api.currentFloor);

    // ── Re-render when the map moves so pixel positions stay in sync ──────────
    const [, setTick] = useState(0);
    const refresh = useCallback(() => setTick(n => n + 1), []);

    useEffect(() => {
        if (!map) return;
        map.on('move',   refresh);
        map.on('zoom',   refresh);
        map.on('rotate', refresh);
        return () => {
            map.off('move',   refresh);
            map.off('zoom',   refresh);
            map.off('rotate', refresh);
        };
    }, [map, refresh]);

    // ── Drag state ────────────────────────────────────────────────────────────
    const dragRef   = useRef({ active: false });
    const [, setDragTick] = useState(0);

    // ── Inline-edit state ─────────────────────────────────────────────────────
    const [editingId, setEditingId]   = useState(null);
    const [editValue, setEditValue]   = useState('');
    const editCommittedRef            = useRef(false); // prevents double-commit (blur after Ctrl+Enter)

    // ── Commit / cancel edit ──────────────────────────────────────────────────
    const commitEdit = useCallback(() => {
        if (editCommittedRef.current) return;
        editCommittedRef.current = true;

        const text = editValue; // preserve whitespace / newlines
        if (text.trim() && editingId) {
            dispatch(updateShape({ id: editingId, properties: { text } }));
        }
        setEditingId(null);
        setEditValue('');
    }, [editingId, editValue, dispatch]);

    const cancelEdit = useCallback(() => {
        editCommittedRef.current = true; // block the onBlur commit that fires after cancel
        setEditingId(null);
        setEditValue('');
    }, []);

    // ── Double-click: enter inline edit mode ─────────────────────────────────
    const handleDoubleClick = useCallback((e, shapeId) => {
        if (activeTool !== 'select') return;
        e.stopPropagation();
        e.preventDefault();

        const id    = String(shapeId);
        const shape = shapes.find(s => String(s.id) === id);
        if (!shape) return;

        dispatch(setSelectedIds([id]));

        editCommittedRef.current = false; // fresh edit session
        setEditingId(id);
        setEditValue(shape.properties.text || '');
    }, [activeTool, dispatch, shapes]);

    // ── Single-click: select or erase ─────────────────────────────────────────
    const handleClick = useCallback((e, shapeId) => {
        if (editingId) return; // ignore clicks while editing
        e.stopPropagation();

        const id = String(shapeId);

        if (activeTool === 'eraser') {
            dispatch(removeShapes([id]));
            return;
        }
        if (activeTool === 'select') {
            if (e.shiftKey) {
                dispatch(toggleSelectedId(id));
            } else {
                dispatch(setSelectedIds([id]));
            }
        }
    }, [activeTool, dispatch, editingId]);

    // ── Mouse-down: begin drag ────────────────────────────────────────────────
    const handleMouseDown = useCallback((e, shapeId) => {
        if (activeTool !== 'select') return;
        if (editingId) return; // no drag while editing
        e.stopPropagation();
        e.preventDefault();

        const id    = String(shapeId);
        const shape = shapes.find(s => String(s.id) === id);
        if (!shape) return;

        dispatch(setSelectedIds([id]));

        dragRef.current = {
            active:     true,
            shapeId:    id,
            startX:     e.clientX,
            startY:     e.clientY,
            origCoords: shape.geometry.coordinates,
            liveLngLat: null,
        };

        document.body.style.cursor = 'move';

        const onMouseMove = (mv) => {
            const dr = dragRef.current;
            if (!dr.active) return;

            const dx     = mv.clientX - dr.startX;
            const dy     = mv.clientY - dr.startY;
            const origPx = map.project(dr.origCoords);
            const newPx  = { x: origPx.x + dx, y: origPx.y + dy };
            const ll     = map.unproject([newPx.x, newPx.y]);

            dragRef.current.liveLngLat = [ll.lng, ll.lat];
            setDragTick(n => n + 1);
        };

        const onMouseUp = () => {
            const dr = dragRef.current;
            if (dr.active && dr.liveLngLat) {
                dispatch(updateShape({
                    id:       dr.shapeId,
                    geometry: { type: 'Point', coordinates: dr.liveLngLat },
                }));
            }
            dragRef.current            = { active: false };
            document.body.style.cursor = '';
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup',   onMouseUp);
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup',   onMouseUp);
    }, [activeTool, dispatch, editingId, map, shapes]);

    // ─────────────────────────────────────────────────────────────────────────

    if (!map) return null;

    // Only show text shapes belonging to the currently active floor.
    const floorId    = currentFloor?.enc_id ?? null;
    const textShapes = shapes.filter(
        s => s.properties?.shapeType === 'text' && s.properties?.floorId === floorId,
    );
    const canInteract = activeTool === 'select' || activeTool === 'eraser';

    return (
        <div style={{
            position:      'absolute',
            inset:         0,
            pointerEvents: 'none',
            overflow:      'hidden',
            zIndex:        10,
        }}>
            {textShapes.map(shape => {
                const id         = String(shape.id);
                const [lng, lat] = shape.geometry.coordinates;
                const p          = shape.properties;
                const isSelected = selectedIds.includes(id);
                const isEditing  = editingId === id;

                // Live pixel position during drag
                const dr    = dragRef.current;
                const pixel = (dr.active && dr.shapeId === id && dr.liveLngLat)
                    ? map.project(dr.liveLngLat)
                    : map.project([lng, lat]);

                // Shared text style — applied to both the span and the textarea
                const textStyle = {
                    fontFamily: p.fontFamily  || 'Arial',
                    fontSize:   `${p.fontSize || 14}px`,
                    fontWeight: p.bold        ? 'bold' : 'normal',
                    color:      p.strokeColor || '#000000',
                    textAlign:  p.textAlign   || 'left',
                    lineHeight: 1.2,
                    "--map-font": p.fontFamily || "Arial",
                };

                return (
                    <div
                        key={id}
                        style={{
                            position:      'absolute',
                            left:          Math.round(pixel.x),
                            top:           Math.round(pixel.y),
                            pointerEvents: (canInteract || isEditing) ? 'auto' : 'none',
                            cursor: isEditing
                                ? 'text'
                                : activeTool === 'select'
                                    ? 'move'
                                    : activeTool === 'eraser'
                                        ? 'cell'
                                        : 'default',
                            userSelect: 'none',
                        }}
                        onClick={e       => handleClick(e, shape.id)}
                        onDoubleClick={e => handleDoubleClick(e, shape.id)}
                        onMouseDown={e   => handleMouseDown(e, shape.id)}
                    >
                        {/* ── Selection box + handles (hidden while editing) ── */}
                        {isSelected && !isEditing && (
                            <div style={{
                                position:      'absolute',
                                inset:         -6,
                                border:        '1.5px solid #4A90D9',
                                borderRadius:  2,
                                pointerEvents: 'none',
                                boxSizing:     'border-box',
                            }}>
                                {HANDLES.map((pos, i) => (
                                    <div key={i} style={{
                                        position:     'absolute',
                                        width:        8,
                                        height:       8,
                                        background:   '#ffffff',
                                        border:       '1.5px solid #4A90D9',
                                        borderRadius: 1,
                                        boxSizing:    'border-box',
                                        ...pos,
                                    }} />
                                ))}
                            </div>
                        )}

                        {/* ── Inline textarea editor (double-click to open) ── */}
                        {isEditing ? (
                            <EditTextarea
                                value={editValue}
                                onChange={setEditValue}
                                onCommit={commitEdit}
                                onCancel={cancelEdit}
                                textStyle={textStyle}
                            />
                        ) : (
                            /* ── Normal text display ────────────────────────── */
                            <span
                                title={activeTool === 'select' ? 'Double-click to edit' : undefined}
                                 className="map-text"
                                style={{
                                    ...textStyle,
                                    display:    'block',
                                    whiteSpace: 'pre',        // preserves newlines
                                    WebkitFontSmoothing: 'antialiased', 
                                }}
                            >
                                {p.text}
                            </span>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
