import React, { useEffect, useRef, useCallback } from 'react';
import { useMapContext, DRAW_MODES } from '../../contexts/MapContext';

// ─── Geometry helpers ────────────────────────────────────────────────────────

/** Generate a GeoJSON polygon approximating a circle */
function makeCircleGeoJSON(centerLng, centerLat, radiusMeters, steps = 64) {
  const coords = [];
  for (let i = 0; i <= steps; i++) {
    const angle = (i / steps) * 2 * Math.PI;
    // 1 degree lat ≈ 111320 m
    const dLat = (radiusMeters / 111320) * Math.sin(angle);
    const dLng =
      (radiusMeters / (111320 * Math.cos((centerLat * Math.PI) / 180))) *
      Math.cos(angle);
    coords.push([centerLng + dLng, centerLat + dLat]);
  }
  return {
    type: 'Polygon',
    coordinates: [coords],
  };
}

/** Build a rectangle polygon from two corner lng/lat points */
function makeRectGeoJSON(lng1, lat1, lng2, lat2) {
  return {
    type: 'Polygon',
    coordinates: [
      [
        [lng1, lat1],
        [lng2, lat1],
        [lng2, lat2],
        [lng1, lat2],
        [lng1, lat1],
      ],
    ],
  };
}

/** Convert lngLat array to pixel distance (approx) for circle radius */
function lngLatDistance(map, from, to) {
  const p1 = map.project(from);
  const p2 = map.project(to);
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/** Pixel distance → metres (rough, good enough for small shapes) */
function pixelsToMeters(map, center, pixels) {
  const p = map.project(center);
  const edgePoint = map.unproject([p.x + pixels, p.y]);
  const dLng = edgePoint.lng - center[0];
  const dLat = edgePoint.lat - center[1];
  const metres = Math.sqrt(
    Math.pow(dLng * 111320 * Math.cos((center[1] * Math.PI) / 180), 2) +
      Math.pow(dLat * 111320, 2)
  );
  return metres;
}

// ─── Layer/source ID helpers ─────────────────────────────────────────────────

const FILL_LAYER = (id) => `shape-fill-${id}`;
const LINE_LAYER = (id) => `shape-line-${id}`;
const SOURCE_ID = (id) => `shape-source-${id}`;
const VERTEX_SOURCE = (id) => `vertex-source-${id}`;
const VERTEX_LAYER = (id) => `vertex-layer-${id}`;

const SELECTED_COLOR = '#1a73e8';
const DEFAULT_FILL_COLOR = '#1a73e8';
const DEFAULT_FILL_OPACITY = 0.2;
const DEFAULT_LINE_COLOR = '#1a73e8';
const DEFAULT_LINE_WIDTH = 2;
const SELECTED_LINE_WIDTH = 3;

// ─── MapDrawing component ─────────────────────────────────────────────────────

const MapDrawing = ({ map }) => {
  const {
    activeDrawMode,
    shapes,
    addShape,
    updateShape,
    deleteShape,
    selectedShapeId,
    setSelectedShapeId,
    clearDrawMode,
  } = useMapContext();

  // Refs to avoid stale closure issues inside event handlers
  const drawModeRef = useRef(activeDrawMode); 
  const shapesRef = useRef(shapes);
  const selectedRef = useRef(selectedShapeId);

  useEffect(() => { drawModeRef.current = activeDrawMode; }, [activeDrawMode]);
  useEffect(() => { shapesRef.current = shapes; }, [shapes]);
  useEffect(() => { selectedRef.current = selectedShapeId; }, [selectedShapeId]);

  // Drawing state (persists across renders without triggering re-renders)
  const drawing = useRef({
    active: false,
    startLng: null,
    startLat: null,
    previewId: '__preview__',
    polygonPoints: [],   // for free polygon
  });

  // Dragging a vertex for edit
  const dragging = useRef({
    active: false,
    shapeId: null,
    vertexIndex: null,
  });

  // ── Get maplibre map instance ──────────────────────────────────────────────
  const getMapInstance = useCallback(() => {
    if (!map) return null;
    return typeof map.getMap === 'function' ? map.getMap() : map;
  }, [map]);

  // ── Add / update / remove a shape's layers ─────────────────────────────────
  const upsertShapeLayers = useCallback((mapInst, shape) => {
    const sid = SOURCE_ID(shape.id);
    const fill = FILL_LAYER(shape.id);
    const line = LINE_LAYER(shape.id);
    const isSelected = selectedRef.current === shape.id;

    const geojsonData = {
      type: 'FeatureCollection',
      features: [{ type: 'Feature', geometry: shape.geometry, properties: {} }],
    };

    if (mapInst.getSource(sid)) {
      mapInst.getSource(sid).setData(geojsonData);
      if (mapInst.getLayer(line)) {
        mapInst.setPaintProperty(
          line,
          'line-width',
          isSelected ? SELECTED_LINE_WIDTH : DEFAULT_LINE_WIDTH
        );
        mapInst.setPaintProperty(
          line,
          'line-color',
          isSelected ? SELECTED_COLOR : DEFAULT_LINE_COLOR
        );
      }
    } else {
      mapInst.addSource(sid, { type: 'geojson', data: geojsonData });
      mapInst.addLayer({
        id: fill,
        type: 'fill',
        source: sid,
        paint: {
          'fill-color': DEFAULT_FILL_COLOR,
          'fill-opacity': DEFAULT_FILL_OPACITY,
        },
      });
      mapInst.addLayer({
        id: line,
        type: 'line',
        source: sid,
        paint: {
          'line-color': isSelected ? SELECTED_COLOR : DEFAULT_LINE_COLOR,
          'line-width': isSelected ? SELECTED_LINE_WIDTH : DEFAULT_LINE_WIDTH,
        },
      });

      // Click on fill → select shape
      mapInst.on('click', fill, (e) => {
        e.preventDefault();
        setSelectedShapeId(shape.id);
      });

      // Cursor feedback
      mapInst.on('mouseenter', fill, () => {
        if (drawModeRef.current === DRAW_MODES.NONE) {
          mapInst.getCanvas().style.cursor = 'pointer';
        }
      });
      mapInst.on('mouseleave', fill, () => {
        mapInst.getCanvas().style.cursor =
          drawModeRef.current !== DRAW_MODES.NONE ? 'crosshair' : '';
      });
    }
  }, [setSelectedShapeId]);

  const removeShapeLayers = useCallback((mapInst, id) => {
    const sid = SOURCE_ID(id);
    const fill = FILL_LAYER(id);
    const line = LINE_LAYER(id);
    const vsrc = VERTEX_SOURCE(id);
    const vlayer = VERTEX_LAYER(id);

    [vlayer, fill, line].forEach((l) => {
      if (mapInst.getLayer(l)) mapInst.removeLayer(l);
    });
    [sid, vsrc].forEach((s) => {
      if (mapInst.getSource(s)) mapInst.removeSource(s);
    });
  }, []);

  // ── Vertex handles for editing ─────────────────────────────────────────────
  const upsertVertexHandles = useCallback((mapInst, shape) => {
    if (selectedRef.current !== shape.id) return;
    // Only polygon/rectangle support vertex editing; circles show center point
    const vsrc = VERTEX_SOURCE(shape.id);
    const vlayer = VERTEX_LAYER(shape.id);

    let points = [];
    if (shape.geometry.type === 'Polygon') {
      // exclude closing duplicate
      const ring = shape.geometry.coordinates[0];
      points = ring.slice(0, ring.length - 1).map((coord, i) => ({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: coord },
        properties: { index: i },
      }));
    }
    // circle: expose center
    if (shape.type === 'circle') {
      points = [
        {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [shape.meta.centerLng, shape.meta.centerLat] },
          properties: { index: 0 },
        },
      ];
    }

    const fc = { type: 'FeatureCollection', features: points };

    if (mapInst.getSource(vsrc)) {
      mapInst.getSource(vsrc).setData(fc);
    } else {
      mapInst.addSource(vsrc, { type: 'geojson', data: fc });
      mapInst.addLayer({
        id: vlayer,
        type: 'circle',
        source: vsrc,
        paint: {
          'circle-radius': 6,
          'circle-color': '#fff',
          'circle-stroke-color': SELECTED_COLOR,
          'circle-stroke-width': 2,
        },
      });

      // Drag vertex to edit
      mapInst.on('mousedown', vlayer, (e) => {
        e.preventDefault();
        const idx = e.features[0].properties.index;
        dragging.current = { active: true, shapeId: shape.id, vertexIndex: idx };
        mapInst.getCanvas().style.cursor = 'grabbing';
        mapInst.dragPan.disable();
      });
    }
  }, []);

  const removeVertexHandles = useCallback((mapInst, id) => {
    const vsrc = VERTEX_SOURCE(id);
    const vlayer = VERTEX_LAYER(id);
    if (mapInst.getLayer(vlayer)) mapInst.removeLayer(vlayer);
    if (mapInst.getSource(vsrc)) mapInst.removeSource(vsrc);
  }, []);

  // ── Sync shapes → MapLibre layers ─────────────────────────────────────────
  useEffect(() => {
    const mapInst = getMapInstance();
    if (!mapInst) return;

    const syncShapes = () => {
      shapes.forEach((shape) => {
        upsertShapeLayers(mapInst, shape);
        if (shape.id === selectedShapeId) {
          upsertVertexHandles(mapInst, shape);
        } else {
          removeVertexHandles(mapInst, shape.id);
        }
      });
    };

    if (mapInst.loaded()) {
      syncShapes();
    } else {
      mapInst.once('load', syncShapes);
    }
  }, [shapes, selectedShapeId, getMapInstance, upsertShapeLayers, upsertVertexHandles, removeVertexHandles]);

  // ── Remove layers when a shape is deleted ─────────────────────────────────
  const prevShapeIds = useRef([]);
  useEffect(() => {
    const mapInst = getMapInstance();
    if (!mapInst || !mapInst.loaded()) return;

    const currentIds = shapes.map((s) => s.id);
    const removed = prevShapeIds.current.filter((id) => !currentIds.includes(id));
    removed.forEach((id) => removeShapeLayers(mapInst, id));
    prevShapeIds.current = currentIds;
  }, [shapes, getMapInstance, removeShapeLayers]);

  // ── Drawing event handlers ─────────────────────────────────────────────────

  const genId = () => `shape-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

  /** Remove the temporary preview shape from the map */
  const removePreview = useCallback((mapInst) => {
    const pid = drawing.current.previewId;
    removeShapeLayers(mapInst, pid);
  }, [removeShapeLayers]);

  /** Show a live preview while mouse moves */
  const renderPreview = useCallback((mapInst, geometry) => {
    const pid = drawing.current.previewId;
    const sid = SOURCE_ID(pid);
    const fill = FILL_LAYER(pid);
    const line = LINE_LAYER(pid);

    const fc = {
      type: 'FeatureCollection',
      features: [{ type: 'Feature', geometry, properties: {} }],
    };

    if (mapInst.getSource(sid)) {
      mapInst.getSource(sid).setData(fc);
    } else {
      mapInst.addSource(sid, { type: 'geojson', data: fc });
      mapInst.addLayer({
        id: fill,
        type: 'fill',
        source: sid,
        paint: { 'fill-color': DEFAULT_FILL_COLOR, 'fill-opacity': 0.15 },
      });
      mapInst.addLayer({
        id: line,
        type: 'line',
        source: sid,
        paint: { 'line-color': DEFAULT_LINE_COLOR, 'line-width': 1.5, 'line-dasharray': [3, 3] },
      });
    }
  }, []);

  // ── Mouse down: start drawing ──────────────────────────────────────────────
  const handleMouseDown = useCallback((e) => {
    const mode = drawModeRef.current;
    if (mode === DRAW_MODES.NONE) return;
    if (e.defaultPrevented) return; // vertex drag took precedence

    const { lng, lat } = e.lngLat;

    if (mode === DRAW_MODES.POLYGON) {
      // Polygon: each click adds a point; double-click closes
      drawing.current.polygonPoints.push([lng, lat]);
      return;
    }

    drawing.current.active = true;
    drawing.current.startLng = lng;
    drawing.current.startLat = lat;
  }, []);

  // ── Mouse move: update preview ─────────────────────────────────────────────
  const handleMouseMove = useCallback((e) => {
    const mapInst = getMapInstance();
    if (!mapInst) return;

    // Vertex dragging
    if (dragging.current.active) {
      const { lng, lat } = e.lngLat;
      const { shapeId, vertexIndex } = dragging.current;
      const shape = shapesRef.current.find((s) => s.id === shapeId);
      if (!shape) return;

      if (shape.type === 'circle') {
        // Drag center
        const newGeom = makeCircleGeoJSON(lng, lat, shape.meta.radiusMeters);
        updateShape(shapeId, {
          geometry: newGeom,
          meta: { ...shape.meta, centerLng: lng, centerLat: lat },
        });
      } else if (shape.type === 'rectangle') {
        // Move one corner, adjust opposite
        const ring = shape.geometry.coordinates[0];
        const newRing = [...ring];
        // rectangle vertices: [0]=tl,[1]=tr,[2]=br,[3]=bl,[4]=tl(close)
        newRing[vertexIndex] = [lng, lat];
        // fix adjacent corners based on which vertex moved
        if (vertexIndex === 0) { newRing[1][1] = lat; newRing[3][0] = lng; }
        if (vertexIndex === 1) { newRing[0][1] = lat; newRing[2][0] = lng; }
        if (vertexIndex === 2) { newRing[1][0] = lng; newRing[3][1] = lat; }
        if (vertexIndex === 3) { newRing[0][0] = lng; newRing[2][1] = lat; }
        newRing[4] = newRing[0];
        updateShape(shapeId, { geometry: { type: 'Polygon', coordinates: [newRing] } });
      } else if (shape.type === 'polygon') {
        const ring = [...shape.geometry.coordinates[0]];
        ring[vertexIndex] = [lng, lat];
        ring[ring.length - 1] = ring[0]; // keep closed
        updateShape(shapeId, { geometry: { type: 'Polygon', coordinates: [ring] } });
      }
      return;
    }

    if (!drawing.current.active) return;
    const mode = drawModeRef.current;
    const { startLng, startLat } = drawing.current;
    const { lng, lat } = e.lngLat;

    if (mode === DRAW_MODES.CIRCLE) {
      const px = lngLatDistance(mapInst, [startLng, startLat], [lng, lat]);
      const radiusMeters = pixelsToMeters(mapInst, [startLng, startLat], px);
      renderPreview(mapInst, makeCircleGeoJSON(startLng, startLat, radiusMeters));
    } else if (mode === DRAW_MODES.RECTANGLE) {
      renderPreview(mapInst, makeRectGeoJSON(startLng, startLat, lng, lat));
    }
  }, [getMapInstance, updateShape, renderPreview]);

  // ── Mouse up: commit shape ─────────────────────────────────────────────────
  const handleMouseUp = useCallback((e) => {
    const mapInst = getMapInstance();
    if (!mapInst) return;

    // Finish vertex drag
    if (dragging.current.active) {
      dragging.current = { active: false, shapeId: null, vertexIndex: null };
      mapInst.dragPan.enable();
      mapInst.getCanvas().style.cursor = 'crosshair';
      return;
    }

    if (!drawing.current.active) return;
    const mode = drawModeRef.current;
    const { startLng, startLat } = drawing.current;
    const { lng, lat } = e.lngLat;

    drawing.current.active = false;
    removePreview(mapInst);

    if (mode === DRAW_MODES.CIRCLE) {
      const px = lngLatDistance(mapInst, [startLng, startLat], [lng, lat]);
      if (px < 5) return; // too small — ignore
      const radiusMeters = pixelsToMeters(mapInst, [startLng, startLat], px);
      const id = genId();
      addShape({
        id,
        type: 'circle',
        geometry: makeCircleGeoJSON(startLng, startLat, radiusMeters),
        meta: { centerLng: startLng, centerLat: startLat, radiusMeters },
      });
      setSelectedShapeId(id);
      clearDrawMode();
    } else if (mode === DRAW_MODES.RECTANGLE) {
      const dx = Math.abs(lng - startLng);
      const dy = Math.abs(lat - startLat);
      if (dx < 0.00001 && dy < 0.00001) return; // too small
      const id = genId();
      addShape({
        id,
        type: 'rectangle',
        geometry: makeRectGeoJSON(startLng, startLat, lng, lat),
        meta: {},
      });
      setSelectedShapeId(id);
      clearDrawMode();
    }
  }, [getMapInstance, removePreview, addShape, setSelectedShapeId, clearDrawMode]);

  // ── Double click: close polygon ────────────────────────────────────────────
  const handleDblClick = useCallback((e) => {
    if (drawModeRef.current !== DRAW_MODES.POLYGON) return;
    e.preventDefault();

    const pts = drawing.current.polygonPoints;
    if (pts.length < 3) {
      drawing.current.polygonPoints = [];
      return;
    }

    const mapInst = getMapInstance();
    if (mapInst) removePreview(mapInst);

    const ring = [...pts, pts[0]]; // close ring
    const id = genId();
    addShape({
      id,
      type: 'polygon',
      geometry: { type: 'Polygon', coordinates: [ring] },
      meta: {},
    });
    setSelectedShapeId(id);
    drawing.current.polygonPoints = [];
    clearDrawMode();
  }, [getMapInstance, removePreview, addShape, setSelectedShapeId, clearDrawMode]);

  // ── Polygon: live line preview while placing points ────────────────────────
  const handleMouseMovePolygon = useCallback((e) => {
    if (drawModeRef.current !== DRAW_MODES.POLYGON) return;
    const pts = drawing.current.polygonPoints;
    if (pts.length === 0) return;
    const mapInst = getMapInstance();
    if (!mapInst) return;

    const { lng, lat } = e.lngLat;
    const preview = [...pts, [lng, lat], pts[0]];
    renderPreview(mapInst, { type: 'Polygon', coordinates: [preview] });
  }, [getMapInstance, renderPreview]);

  // ── Click on blank map → deselect ─────────────────────────────────────────
  const handleMapClick = useCallback((e) => {
    if (e.defaultPrevented) return;
    if (drawModeRef.current !== DRAW_MODES.NONE) return;
    setSelectedShapeId(null);
  }, [setSelectedShapeId]);

  // ── Keyboard: Delete selected shape ───────────────────────────────────────
  useEffect(() => {
    const onKeyDown = (e) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedRef.current) {
        deleteShape(selectedRef.current);
      }
      if (e.key === 'Escape') {
        // Cancel in-progress drawing
        const mapInst = getMapInstance();
        if (mapInst) removePreview(mapInst);
        drawing.current.active = false;
        drawing.current.polygonPoints = [];
        clearDrawMode();
        setSelectedShapeId(null);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [deleteShape, clearDrawMode, setSelectedShapeId, getMapInstance, removePreview]);

  // ── Attach / detach map event listeners ───────────────────────────────────
  useEffect(() => {
    const mapInst = getMapInstance();
    if (!mapInst) return;

    const attach = () => {
      mapInst.on('mousedown', handleMouseDown);
      mapInst.on('mousemove', handleMouseMove);
      mapInst.on('mousemove', handleMouseMovePolygon);
      mapInst.on('mouseup', handleMouseUp);
      mapInst.on('dblclick', handleDblClick);
      mapInst.on('click', handleMapClick);
    };

    if (mapInst.loaded()) {
      attach();
    } else {
      mapInst.once('load', attach);
    }

    return () => {
      mapInst.off('mousedown', handleMouseDown);
      mapInst.off('mousemove', handleMouseMove);
      mapInst.off('mousemove', handleMouseMovePolygon);
      mapInst.off('mouseup', handleMouseUp);
      mapInst.off('dblclick', handleDblClick);
      mapInst.off('click', handleMapClick);
    };
  }, [
    getMapInstance,
    handleMouseDown,
    handleMouseMove,
    handleMouseMovePolygon,
    handleMouseUp,
    handleDblClick,
    handleMapClick,
  ]);

  // ── Update cursor based on draw mode ──────────────────────────────────────
  useEffect(() => {
    const mapInst = getMapInstance();
    if (!mapInst) return;
    const canvas = mapInst.getCanvas();
    canvas.style.cursor = activeDrawMode !== DRAW_MODES.NONE ? 'crosshair' : '';

    // When entering polygon mode clear any previous points
    if (activeDrawMode === DRAW_MODES.POLYGON) {
      drawing.current.polygonPoints = [];
    }
    // Cancel in-progress draw when mode changes externally
    if (activeDrawMode === DRAW_MODES.NONE) {
      drawing.current.active = false;
      drawing.current.polygonPoints = [];
      removePreview(mapInst);
    }
  }, [activeDrawMode, getMapInstance, removePreview]);

  return null; // all rendering is done via MapLibre layers
};

export default MapDrawing;
