// useDrawingManager.js
// All map event logic for every drawing tool.
// Reads activeTool, activeShape, strokeColor, etc. from drawingToolbarSlice.
// Dispatches to drawingSlice.

import { useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import {
    addShape,
    updateShape,
    removeShapes,
    clearSelection,
    toggleSelectedId,
    setSelectedIds,
    updateSelectedShapes,
    setInProgress,
    clearInProgress,
} from '../../../../../store/slices/drawingSlice';

import {
    makePolygonFeature,
    makeRectFeature,
    makeCircleFeature,
    makeTextFeature,
    buildPreviewGeoJSON,
    translateGeometry,
    isNearStart,
    distance,
    defaultProps,
} from './drawingUtils';

import { SOURCES, LAYERS, drawingSourceRef } from './DrawingLayer';

// ── Imperative source helpers — zero React/Redux, zero blink ─────────────────
// setShapesOnly: geometry only, no annotation rebuild — use during drag
// setShapesFull: geometry + vertex dots + edge labels — use on commit
const setPreviewData  = (_map, geojson)       => drawingSourceRef.setPreviewData?.(geojson);
const setShapesOnly   = (shapes, selectedIds) => drawingSourceRef.setShapesOnly?.(shapes, selectedIds);
const setShapesFull   = (shapes, selectedIds) => drawingSourceRef.setShapesFull?.(shapes, selectedIds);

export default function useDrawingManager({
    activeTool,
    activeShape,
    strokeColor,
    strokeWidth,
    fillColor,
    
    
    fontFamily, 
    fontSize, 
    bold, 
    textAlign
}) {
    const dispatch   = useDispatch();
    const map        = useSelector((s) => s.map.mapContainer);
    
    const shapes      = useSelector((s) => s.drawing.shapes);
    const selectedIds = useSelector((s) => s.drawing.selectedIds);
    
    // Always-current refs — readable inside event callbacks without re-binding
    const shapesRef       = useRef(shapes);
    const selectedIdsRef  = useRef(selectedIds);
    useEffect(() => { shapesRef.current      = shapes;      }, [shapes]);
    useEffect(() => { selectedIdsRef.current = selectedIds; }, [selectedIds]);
    
    // Keep refs so event callbacks always see latest values without re-binding
    const stateRef = useRef({});
    stateRef.current = { activeTool, activeShape, strokeColor, strokeWidth, fillColor, shapes, selectedIds };
    
    // Drag-move state
    const dragRef = useRef({ active: false, startLngLat: null, shapeIds: [], origGeometries: {} });
    
    // Rect/circle drag-draw state
    const drawDragRef = useRef({ active: false, startLngLat: null });
    
    // ── Cursor management ─────────────────────────────────────────────────────
    const setCursor = useCallback((cursor) => {
        if (map) map.getCanvas().style.cursor = cursor;
    }, [map]);
    
    // ── Hit-test: which shape ids are under a pixel point ────────────────────
    const hitTest = useCallback((point) => {
        if (!map) return [];
        
        // Use a small bbox for better stroke hit accuracy
        const bbox = [
            [point.x - 6, point.y - 6],
            [point.x + 6, point.y + 6],
        ];
        
        const features = map.queryRenderedFeatures(bbox, {
            layers: [
                LAYERS.fill, LAYERS.stroke,
                LAYERS.selectedFill, LAYERS.selectedStroke,
                LAYERS.text,
            ],
        });
        
        // Filter out annotation features (vertex dots, edge labels, previews)
        const ids = features
        .filter((f) => {
            const p = f.properties || {};
            return !('vertexIndex' in p) && !('edgeIndex' in p) && !p.preview;
        })
        .map((f) => String(f.id))
        .filter(Boolean);
        
        return [...new Set(ids)];
    }, [map]);
    
    // ── Deselect drawing shapes when tool changes ───────────────────────────
    useEffect(() => {
        dispatch(clearSelection());
    }, [activeTool, dispatch]);
    
    // ── Main effect: bind / unbind listeners when tool changes ───────────────
    useEffect(() => {
        if (!map) return;
        
        // Cleanup helpers
        const cleanups = [];
        const on = (event, handler, options) => {
            map.on(event, handler, options);
            cleanups.push(() => map.off(event, handler));
        };
        const onCanvas = (event, handler) => {
            map.getCanvas().addEventListener(event, handler);
            cleanups.push(() => map.getCanvas().removeEventListener(event, handler));
        };
        
        // Reset cursor + clear in-progress + deselect on tool switch
        setCursor('default');
        dispatch(clearInProgress());
        setPreviewData(map, { type: 'FeatureCollection', features: [] });
        
        // ──────────────────────────────────────────────────────────────────────
        // PEN tool
        // ──────────────────────────────────────────────────────────────────────
        if (activeTool === 'pen') {
            setCursor('crosshair');
            
            // Shared props builder
            const buildProps = () => {
                const { strokeColor, strokeWidth, fillColor } = stateRef.current;
                return defaultProps({ strokeColor, strokeWidth, fillColor });
            };
            
            // ── FREEHAND polygon ──
            if (activeShape === 'freehand') {
                let coords = [];

                const commitPolygon = (c) => {
                    const shape = makePolygonFeature(c, buildProps());
                    dispatch(addShape(shape));
                    dispatch(clearInProgress());
                    coords = [];
                    setPreviewData(map, { type: 'FeatureCollection', features: [] });
                };

                const handleClick = (e) => {
                    const { lng, lat } = e.lngLat;
                    const pt = [lng, lat];

                    // Commit polygon if clicking near ANY already-placed vertex.
                    // Skip the very last vertex (index coords.length-1) to avoid
                    // an accidental immediate close right after placing a point.
                    if (coords.length >= 3) {
                        const nearExisting = coords
                            .slice(0, -1)
                            .some((v) => isNearStart(map, pt, v));
                        if (nearExisting) {
                            commitPolygon(coords);
                            return;
                        }
                    }

                    coords = [...coords, pt];
                    dispatch(setInProgress({ shapeType: 'freehand', coords }));
                };

                const handleDblClick = (e) => {
                    e.preventDefault();
                    const { lng, lat } = e.lngLat;
                    const pt = [lng, lat];

                    // Browser fired 2 click events before this dblclick — each added
                    // a point. Roll back to coords before those 2 ghost clicks.
                    const base = coords.length >= 2 ? coords.slice(0, -2) : [];
                    if (base.length < 1) return; // nothing drawn yet

                    // If the dblclick landed on/near an existing vertex → commit
                    // as-is (no extra point). Otherwise add the dblclick location
                    // as the final point, then commit.
                    const nearExisting =
                        base.length >= 1 &&
                        base.some((v) => isNearStart(map, pt, v));

                    const final = nearExisting ? base : [...base, pt];

                    if (final.length >= 3) {
                        commitPolygon(final);
                    }
                };

                const handleMouseMove = (e) => {
                    if (coords.length === 0) return;
                    const mousePos = [e.lngLat.lng, e.lngLat.lat];
                    setPreviewData(map, buildPreviewGeoJSON({ shapeType: 'freehand', coords }, mousePos));
                };

                on('click', handleClick);
                on('dblclick', handleDblClick);
                on('mousemove', handleMouseMove);

                // ESC cancels
                const handleKey = (e) => {
                    if (e.key === 'Escape') {
                        coords = [];
                        dispatch(clearInProgress());
                        setPreviewData(map, { type: 'FeatureCollection', features: [] });
                    }
                };
                window.addEventListener('keydown', handleKey);
                cleanups.push(() => window.removeEventListener('keydown', handleKey));
            }
            
            // ── RECT drag-draw ──
            if (activeShape === 'rect') {
                const handleMouseDown = (e) => {
                    map.dragPan.disable();
                    drawDragRef.current = { active: true, startLngLat: [e.lngLat.lng, e.lngLat.lat] };
                };
                
                const handleMouseMove = (e) => {
                    if (!drawDragRef.current.active) return;
                    const mousePos = [e.lngLat.lng, e.lngLat.lat]; 
                    setPreviewData(map, buildPreviewGeoJSON(
                        { shapeType: 'rect', coords: [drawDragRef.current.startLngLat] },
                        mousePos
                    ));
                };
                
                const handleMouseUp = (e) => {
                    if (!drawDragRef.current.active) return;
                    map.dragPan.enable();
                    const { startLngLat } = drawDragRef.current;
                    const end = [e.lngLat.lng, e.lngLat.lat];
                    drawDragRef.current = { active: false };
                    
                    if (distance(startLngLat, end) < 0.0001) return; // too small
                    const shape = makeRectFeature(startLngLat, end, {
                        ...stateRef.current.strokeColor && { strokeColor: stateRef.current.strokeColor },
                        strokeWidth: stateRef.current.strokeWidth,
                        fillColor: stateRef.current.fillColor,
                    });

                    console.log(shape, "shape");
                    dispatch(addShape(shape));
                    setPreviewData(map, { type: 'FeatureCollection', features: [] });
                };
                
                on('mousedown', handleMouseDown);
                on('mousemove', handleMouseMove);
                on('mouseup', handleMouseUp);
            }
            
            // ── CIRCLE drag-draw ──
            if (activeShape === 'circle') {
                const handleMouseDown = (e) => {
                    map.dragPan.disable();
                    drawDragRef.current = { active: true, startLngLat: [e.lngLat.lng, e.lngLat.lat] };
                };
                
                const handleMouseMove = (e) => {
                    if (!drawDragRef.current.active) return;
                    const mousePos = [e.lngLat.lng, e.lngLat.lat];
                    setPreviewData(map, buildPreviewGeoJSON(
                        { shapeType: 'circle', coords: [drawDragRef.current.startLngLat] },
                        mousePos
                    ));
                };
                
                const handleMouseUp = (e) => {
                    if (!drawDragRef.current.active) return;
                    map.dragPan.enable();
                    const { startLngLat } = drawDragRef.current;
                    const end = [e.lngLat.lng, e.lngLat.lat];
                    drawDragRef.current = { active: false };
                    
                    const radius = distance(startLngLat, end);
                    if (radius < 0.0001) return;
                    const shape = makeCircleFeature(startLngLat, radius, {
                        strokeColor: stateRef.current.strokeColor,
                        strokeWidth: stateRef.current.strokeWidth,
                        fillColor:   stateRef.current.fillColor,
                    });
                    dispatch(addShape(shape));
                    setPreviewData(map, { type: 'FeatureCollection', features: [] });
                };
                
                on('mousedown', handleMouseDown);
                on('mousemove', handleMouseMove);
                on('mouseup', handleMouseUp);
            }
        }
        
        // ──────────────────────────────────────────────────────────────────────
        // ──────────────────────────────────────────────────────────────────────
        // HIGHLIGHTER tool — click shape to select AND immediately apply colors
        // ──────────────────────────────────────────────────────────────────────
        if (activeTool === 'highlighter') {
            setCursor('pointer');
            
            const handleClick = (e) => {
                const ids = hitTest(e.point);
                if (ids.length === 0) {
                    dispatch(clearSelection());
                    return;
                }
                
                const targetIds = e.originalEvent?.shiftKey
                ? null   // handled below
                : ids.slice(0, 1);
                
                if (e.originalEvent?.shiftKey) {
                    ids.forEach((id) => dispatch(toggleSelectedId(id)));
                } else {
                    dispatch(setSelectedIds(targetIds));
                }
                
                // Apply current toolbar stroke/fill immediately to clicked shapes
                const applyIds = e.originalEvent?.shiftKey ? ids : targetIds;
                const { strokeColor, strokeWidth, fillColor } = stateRef.current;
                applyIds.forEach((id) => {
                    dispatch(updateShape({
                        id,
                        properties: { strokeColor, strokeWidth, fillColor },
                    }));
                });
            };
            
            on('click', handleClick);
        }
        
        // ──────────────────────────────────────────────────────────────────────
        // TEXT tool
        // ──────────────────────────────────────────────────────────────────────
        if (activeTool === 'text') {
            setCursor('text');
            
            const handleClick = (e) => {
                const { lng, lat } = e.lngLat;
                
                // Create a floating input at the click position
                const canvas    = map.getCanvas();
                const rect      = canvas.getBoundingClientRect();
                const pixel     = map.project([lng, lat]);
                
                const input = document.createElement('input');
                input.type  = 'text';
                input.placeholder = 'Type text…';
                Object.assign(input.style, {
                    position:   'fixed',
                    left:       `${rect.left + pixel.x}px`,
                    top:        `${rect.top  + pixel.y}px`,
                    zIndex:     9999,
                    fontSize:   `${stateRef.current.fontSize || 14}px`,
                    fontFamily: stateRef.current.fontFamily || 'Arial',
                    fontWeight: stateRef.current.bold ? 'bold' : 'normal',
                    border:     '1px dashed #1a73e8',
                    background: 'rgba(255,255,255,0.9)',
                    padding:    '2px 4px',
                    minWidth:   '80px',
                    outline:    'none',
                });
                
                document.body.appendChild(input);
                input.focus();
                
                const commit = () => {
                    const text = input.value.trim();
                    if (text) {
                        const shape = makeTextFeature([lng, lat], text, {
                            strokeColor: stateRef.current.strokeColor,
                            fontFamily:  stateRef.current.fontFamily,
                            fontSize:    stateRef.current.fontSize,
                            bold:        stateRef.current.bold,
                            textAlign:   stateRef.current.textAlign,
                        });
                        dispatch(addShape(shape));
                    }
                    input.remove();
                };
                
                input.addEventListener('blur', commit);
                input.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') commit();
                    if (e.key === 'Escape') input.remove();
                });
            };
            
            on('click', handleClick);
        }
        
        // ──────────────────────────────────────────────────────────────────────
        // ERASER tool
        // ──────────────────────────────────────────────────────────────────────
        if (activeTool === 'eraser') {
            setCursor('cell');
            
            const handleClick = (e) => {
                const ids = hitTest(e.point);
                if (ids.length > 0) {
                    // If shapes are selected, delete selected; else delete clicked
                    const { selectedIds } = stateRef.current;
                    const toDelete = selectedIds.length > 0 ? selectedIds : ids;
                    dispatch(removeShapes(toDelete));
                }
            };
            
            // Delete selected with Delete/Backspace key regardless of eraser
            const handleKey = (e) => {
                if (e.key === 'Delete' || e.key === 'Backspace') {
                    const { selectedIds } = stateRef.current;
                    if (selectedIds.length > 0) dispatch(removeShapes(selectedIds));
                }
            };
            window.addEventListener('keydown', handleKey);
            cleanups.push(() => window.removeEventListener('keydown', handleKey));
            
            on('click', handleClick);
        }
        
        // ──────────────────────────────────────────────────────────────────────
        // SELECT tool — click to select, shift+click multi-select,
        //               drag shape to move, drag vertex corner to reshape
        // ──────────────────────────────────────────────────────────────────────
        if (activeTool === 'select') {
            setCursor('default');
            
            // Separate ref for vertex drag so it doesn't collide with shape drag
            const vertexDragRef = { active: false, parentId: null, vertexIndex: null };
            
            // ── Vertex hit-test: check if click landed on a corner dot ──────────
            const vertexHitTest = (point) => {
                const bbox = [
                    [point.x - 8, point.y - 8],
                    [point.x + 8, point.y + 8],
                ];
                const features = map.queryRenderedFeatures(bbox, {
                    layers: [LAYERS.vertices],
                });
                if (features.length === 0) return null;
                const f = features[0];
                return {
                    parentId:    String(f.properties.parentId),
                    vertexIndex: Number(f.properties.vertexIndex),
                };
            };
            
            // ── Click / shift-click (only fires if no drag occurred) ─────────────
            const handleClick = (e) => {
                if (dragRef.current.moved) return;
                if (vertexDragRef.active)  return;
                
                const ids = hitTest(e.point);
                if (ids.length === 0) {
                    dispatch(clearSelection());
                    return;
                }
                if (e.originalEvent?.shiftKey) {
                    ids.forEach((id) => dispatch(toggleSelectedId(id)));
                } else {
                    dispatch(setSelectedIds(ids.slice(0, 1)));
                }
            };
            
            // ── MouseDown — decide: vertex drag OR whole-shape drag ──────────────
            const handleMouseDown = (e) => {
                // 1. Check for vertex hit first (takes priority)
                const vertex = vertexHitTest(e.point);
                if (vertex) {
                    vertexDragRef.active      = true;
                    vertexDragRef.parentId    = vertex.parentId;
                    vertexDragRef.vertexIndex = vertex.vertexIndex;
                    map.dragPan.disable();
                    setCursor('crosshair');
                    return;
                }
                
                // 2. Fall through to whole-shape drag
                const ids = hitTest(e.point);
                if (ids.length === 0) return;
                
                const { selectedIds, shapes } = stateRef.current;
                const activeIds =
                selectedIds.length > 0 && selectedIds.some((id) => ids.includes(id))
                ? selectedIds
                : ids.slice(0, 1);
                
                const origGeometries = {};
                activeIds.forEach((id) => {
                    const shape = shapes.find((s) => s.id === id);
                    if (shape) origGeometries[id] = JSON.parse(JSON.stringify(shape.geometry));
                });
                
                dragRef.current = {
                    active:        true,
                    moved:         false,
                    startLngLat:   [e.lngLat.lng, e.lngLat.lat],
                    shapeIds:      activeIds,
                    origGeometries,
                };
                
                map.dragPan.disable();
            };
            
            // ── MouseMove ────────────────────────────────────────────────────────
            const handleMouseMove = (e) => {
                const lngLat = [e.lngLat.lng, e.lngLat.lat];
                
                // Vertex drag — move just one corner
                if (vertexDragRef.active) {
                    const { parentId, vertexIndex } = vertexDragRef;
                    const { shapes } = stateRef.current;
                    const shape = shapes.find((s) => s.id === parentId);
                    if (!shape || shape.geometry.type !== 'Polygon') return;
                    
                    // Deep-clone coordinates, replace the dragged vertex
                    const coords = shape.geometry.coordinates[0].map((c) => [...c]);
                    coords[vertexIndex] = lngLat;
                    
                    // If moving the first vertex, also update the closing duplicate
                    if (vertexIndex === 0) {
                        coords[coords.length - 1] = lngLat;
                    }
                    // If moving the last vertex (closing duplicate), also move index 0
                    if (vertexIndex === coords.length - 1) {
                        coords[0] = lngLat;
                    }
                    
                    // Update MapLibre source imperatively — zero React/Redux, zero blink
                    const newGeometry   = { ...shape.geometry, coordinates: [coords] };
                    const updatedShapes = shapesRef.current.map((s) =>
                        s.id === parentId ? { ...s, geometry: newGeometry } : s
                );
                drawingSourceRef.isDragging = true;
                setShapesOnly(updatedShapes, selectedIdsRef.current);
                vertexDragRef.liveGeometry = { id: parentId, geometry: newGeometry };
                return;
            }
            
            // Whole-shape drag
            if (dragRef.current.active) {
                dragRef.current.moved = true;
                const { startLngLat, shapeIds, origGeometries } = dragRef.current;
                const dlng = lngLat[0] - startLngLat[0];
                const dlat = lngLat[1] - startLngLat[1];
                
                // Update MapLibre source imperatively — zero React/Redux, zero blink
                const geomUpdates = {};
                shapeIds.forEach((id) => {
                    const orig = origGeometries[id];
                    if (!orig) return;
                    geomUpdates[id] = translateGeometry(orig, dlng, dlat);
                });
                const updatedShapes = shapesRef.current.map((s) =>
                    geomUpdates[s.id] ? { ...s, geometry: geomUpdates[s.id] } : s
            );
            drawingSourceRef.isDragging = true;
            setShapesOnly(updatedShapes, selectedIdsRef.current);
            dragRef.current.liveGeomUpdates = geomUpdates;
            return;
        }
        
        // Hover cursor — show grab on shapes, crosshair on vertices
        const vertex = vertexHitTest(e.point);
        if (vertex) {
            setCursor('crosshair');
            return;
        }
        const ids = hitTest(e.point);
        setCursor(ids.length > 0 ? 'move' : 'default');
    };
    
    // ── MouseUp ──────────────────────────────────────────────────────────
    const handleMouseUp = () => {
        // Clear drag gate FIRST so DrawingLayer effect can run after commit
        drawingSourceRef.isDragging = false;
        
        // ── Vertex drag commit ─────────────────────────────────────────
        if (vertexDragRef.active) {
            if (vertexDragRef.liveGeometry) {
                dispatch(updateShape(vertexDragRef.liveGeometry));
            }
            vertexDragRef.active       = false;
            vertexDragRef.parentId     = null;
            vertexDragRef.vertexIndex  = null;
            vertexDragRef.liveGeometry = null;
            map.dragPan.enable();
            setCursor('default');
            return;
        }
        // ── Shape drag commit ──────────────────────────────────────────
        if (dragRef.current.active) {
            const { liveGeomUpdates } = dragRef.current;
            if (liveGeomUpdates) {
                Object.entries(liveGeomUpdates).forEach(([id, geometry]) => {
                    dispatch(updateShape({ id, geometry }));
                });
            }
            map.dragPan.enable();
            setTimeout(() => {
                dragRef.current = { active: false, moved: false, liveGeomUpdates: null };
            }, 10);
        }
    };
    
    on('click',     handleClick);
    on('mousedown', handleMouseDown);
    on('mousemove', handleMouseMove);
    on('mouseup',   handleMouseUp);
    
    // Delete key
    const handleKey = (e) => {
        if (e.key === 'Delete' || e.key === 'Backspace') {
            const { selectedIds } = stateRef.current;
            if (selectedIds.length > 0) dispatch(removeShapes(selectedIds));
        }
    };
    window.addEventListener('keydown', handleKey);
    cleanups.push(() => window.removeEventListener('keydown', handleKey));
}

// ──────────────────────────────────────────────────────────────────────
return () => cleanups.forEach((fn) => fn());
}, [map, activeTool, activeShape, dispatch, hitTest, setCursor]);

// ── Sync toolbar changes to selected shapes in real-time ────────────────
// Only fires when the user actively changes a toolbar value while shapes
// are selected — not on tool switch (selectedIds would be empty then).
const prevToolbarRef = useRef({});
useEffect(() => {
    if (selectedIds.length === 0) return;
    const prev = prevToolbarRef.current;
    
    // Detect which properties actually changed so we only update those
    const changed = {};
    if (strokeColor !== prev.strokeColor) changed.strokeColor = strokeColor;
    if (strokeWidth !== prev.strokeWidth) changed.strokeWidth = strokeWidth;
    if (fillColor   !== prev.fillColor)   changed.fillColor   = fillColor;
    if (fontFamily  !== prev.fontFamily)  changed.fontFamily  = fontFamily;
    if (fontSize    !== prev.fontSize)    changed.fontSize    = fontSize;
    if (bold        !== prev.bold)        changed.bold        = bold;
    if (textAlign   !== prev.textAlign)   changed.textAlign   = textAlign;
    
    if (Object.keys(changed).length > 0) {
        dispatch(updateSelectedShapes(changed));
    }
    
    prevToolbarRef.current = { strokeColor, strokeWidth, fillColor, fontFamily, fontSize, bold, textAlign };
}, [strokeColor, strokeWidth, fillColor, fontFamily, fontSize, bold, textAlign]);

// ── When selection changes, sync toolbar state FROM selected shape ────────
// So toolbar reflects the selected shape's existing styles.
useEffect(() => {
    if (selectedIds.length === 0) return;
    const { shapes } = stateRef.current;
    const shape = shapes.find((s) => s.id === selectedIds[0]);
    if (!shape) return;
    const p = shape.properties;
    
    // Import setters from drawingToolbarSlice — dispatch to sync toolbar UI
    // Only update if value differs to avoid infinite loops
    const updates = [
        ['strokeColor', p.strokeColor],
        ['strokeWidth', p.strokeWidth],
        ['fillColor',   p.fillColor],
        ['fontFamily',  p.fontFamily],
        ['fontSize',    p.fontSize],
        ['bold',        p.bold],
        ['textAlign',   p.textAlign],
    ].filter(([, v]) => v !== undefined);
    
    updates.forEach(([key, value]) => {
        dispatch({ type: `drawingToolbar/set${key.charAt(0).toUpperCase() + key.slice(1)}`, payload: value });
    });
}, [selectedIds]);

// ── Keep stateRef.inProgress up-to-date for freehand handler ────────────
const inProgress = useSelector((s) => s.drawing.inProgress);
useEffect(() => {
    stateRef.current.inProgress = inProgress;
}, [inProgress]);

// ── Keep stateRef.inProgress up-to-date ─────────────────────────────────
}