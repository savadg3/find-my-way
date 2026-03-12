import { useEffect, useMemo, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams }                from 'react-router-dom';
import { decode }                   from '../../../../../helpers/utils';
import { setAllShapes, clearAllShapes, clearSelection } from '../../../../../store/slices/drawingSlice';
import { setSaveStatus }            from '../../../../../store/slices/navigationSlice';
import { saveDrawingShapes, loadDrawingShapes } from './drawingService';
import { shapesToGeoJSON, emptyCollection } from './drawingUtils';

export const SOURCES = {
  shapes:  'drawing-shapes',
  preview: 'drawing-preview',
};

export const LAYERS = {
  fill:           'drawing-fill',
  stroke:         'drawing-stroke',
  selectedFill:   'drawing-selected-fill',
  selectedStroke: 'drawing-selected-stroke',
  vertices:       'drawing-vertices',
  edgeLabels:     'drawing-edge-labels',
  previewLine:    'drawing-preview-line',
  previewFill:    'drawing-preview-fill',
  previewVertex:  'drawing-preview-vertex',
  previewEdge:    'drawing-preview-edge', 
};

const prop = (name) => ['get', name];
 
export const drawingSourceRef = {
  setShapesData:  null,   
  setShapesOnly:  null,   
  setShapesFull:  null,   
  setPreviewData: null,   
  isDragging:     false,
  onInit:         null,    
};

export default function DrawingLayer() {
  const map = useSelector((s) => s.map.mapContainer);
  // NOTE: deliberately NOT selecting shapes or selectedIds here.
  // All data flows through drawingSourceRef imperatively from useDrawingManager
  // and the one-time sync in useDrawingSync (see below).
  const initialised = useRef(false);
 
  useEffect(() => { 
    if (!map) return;

    const init = () => {
      if (initialised.current) return;
      // NOTE: initialised.current is set AFTER all setup succeeds,
      // so that a premature throw (e.g. "Style is not done loading")
      // doesn't permanently block re-initialization.

      // ── Sources ────────────────────────────────────────────────────────
      map.addSource(SOURCES.shapes, {
        type:      'geojson',
        data:      emptyCollection(),
        promoteId: 'id',
      });
      map.addSource(SOURCES.preview, {
        type: 'geojson',
        data: emptyCollection(),
      });

      // ── Layers ────────────────────────────────────────────────────────
      map.addLayer({ id: LAYERS.fill, type: 'fill', source: SOURCES.shapes,
        filter: ['==', ['geometry-type'], 'Polygon'],
        paint: { 'fill-color': prop('fillColor'), 'fill-opacity': ['coalesce', prop('opacity'), 1] },
      });
      map.addLayer({ id: LAYERS.selectedFill, type: 'fill', source: SOURCES.shapes,
        filter: ['all', ['==', ['geometry-type'], 'Polygon'], ['==', prop('selected'), true]],
        paint: { 'fill-color': 'rgba(255,200,0,0.20)', 'fill-opacity': 1 },
      });
      map.addLayer({ id: LAYERS.stroke, type: 'line', source: SOURCES.shapes,
        filter: ['all', ['!=', ['geometry-type'], 'Point'], ['!', ['has', 'edgeIndex']], ['!', ['has', 'vertexIndex']]],
        paint: { 'line-color': prop('strokeColor'), 'line-width': prop('strokeWidth'), 'line-opacity': ['coalesce', prop('opacity'), 1] },
      });
      map.addLayer({ id: LAYERS.selectedStroke, type: 'line', source: SOURCES.shapes,
        filter: ['all', ['!=', ['geometry-type'], 'Point'], ['==', prop('selected'), true], ['!', ['has', 'edgeIndex']], ['!', ['has', 'vertexIndex']]],
        paint: { 'line-color': '#f5a623', 'line-width': ['+', prop('strokeWidth'), 2], 'line-dasharray': [4, 2] },
      });
      map.addLayer({ id: LAYERS.vertices, type: 'circle', source: SOURCES.shapes,
        filter: ['all', ['has', 'vertexIndex'], ['==', prop('selected'), true]],
        paint: { 'circle-radius': 5, 'circle-color': '#3b5bdb', 'circle-stroke-width': 1.5, 'circle-stroke-color': '#ffffff' },
      });
      map.addLayer({ id: LAYERS.edgeLabels, type: 'symbol', source: SOURCES.shapes,
        filter: ['all', ['has', 'edgeIndex'], ['==', prop('selected'), true]],
        layout: { 'text-field': prop('label'), 'text-font': ['Open Sans Regular'], 'text-size': 11, 'text-allow-overlap': true, 'text-ignore-placement': true, 'text-anchor': 'center' },
        paint: { 'text-color': '#222222', 'text-halo-color': '#ffffff', 'text-halo-width': 1.5 },
      });
      // Text shapes are rendered by TextOverlay.jsx (HTML overlay) — no MapLibre layers here.
      map.addLayer({ id: LAYERS.previewLine, type: 'line', source: SOURCES.preview,
        filter: ['!=', ['geometry-type'], 'Point'],
        paint: { 'line-color': '#1a73e8', 'line-width': 2, 'line-dasharray': [4, 3], 'line-opacity': 0.9 },
      });
      map.addLayer({ id: LAYERS.previewFill, type: 'fill', source: SOURCES.preview,
        filter: ['==', ['geometry-type'], 'Polygon'],
        paint: { 'fill-color': '#1a73e8', 'fill-opacity': 0.10 },
      });
      map.addLayer({ id: LAYERS.previewVertex, type: 'circle', source: SOURCES.preview,
        filter: ['==', prop('vertexPreview'), true],
        paint: { 'circle-radius': 5, 'circle-color': ['case', ['==', prop('isFirst'), true], '#e03131', '#3b5bdb'], 'circle-stroke-width': 1.5, 'circle-stroke-color': '#ffffff' },
      });
      map.addLayer({ id: LAYERS.previewEdge, type: 'symbol', source: SOURCES.preview,
        filter: ['==', prop('edgeLabel'), true],
        layout: { 'text-field': prop('label'), 'text-font': ['Open Sans Regular'], 'text-size': 11, 'text-allow-overlap': true, 'text-ignore-placement': true, 'text-anchor': 'center' },
        paint: { 'text-color': '#222222', 'text-halo-color': '#ffffff', 'text-halo-width': 1.5 },
      });

      // ── Wire imperative handle ─────────────────────────────────────────
      const setShapesSource = (shapes, selectedIds) => {
        map.getSource(SOURCES.shapes)?.setData(shapesToGeoJSON(shapes, selectedIds));
      };
      drawingSourceRef.setShapesData  = setShapesSource;
      drawingSourceRef.setShapesOnly  = setShapesSource;  // same impl — MapLibre handles delta efficiently
      drawingSourceRef.setShapesFull  = setShapesSource;
      drawingSourceRef.setPreviewData = (geojson) => {
        map.getSource(SOURCES.preview)?.setData(geojson);
      };

      // Mark as fully initialised AFTER all setup succeeds,
      // then notify DrawingSync so it re-pushes any existing shapes.
      initialised.current = true;
      drawingSourceRef.onInit?.();
    };

    const handleStyleData = () => {
      // styledata fires many times during loading (sprites, fonts, tiles).
      // Only act when the style is fully loaded AND our source is gone
      // (indicates a genuine style-swap via map.setStyle()).
      if (!map.isStyleLoaded()) return;
      if (map.getSource(SOURCES.shapes)) return;  // sources still exist — nothing to do

      initialised.current = false;
      // Re-wire after style reload
      drawingSourceRef.setShapesData  = null;
      drawingSourceRef.setShapesOnly  = null;
      drawingSourceRef.setShapesFull  = null;
      drawingSourceRef.setPreviewData = null;
      init();
    };

    if (map.isStyleLoaded()) init();
    else map.once('load', init);
    map.on('styledata', handleStyleData);

    return () => {
      map.off('styledata', handleStyleData);
      drawingSourceRef.setShapesData  = null;
      drawingSourceRef.setShapesOnly  = null;
      drawingSourceRef.setShapesFull  = null;
      drawingSourceRef.setPreviewData = null;
      initialised.current = false;
      Object.values(LAYERS).forEach((l) => {
        try { if (map.getLayer(l))  map.removeLayer(l);  } catch (e) { console.warn(e); }
      });
      Object.values(SOURCES).forEach((s) => {
        try { if (map.getSource(s)) map.removeSource(s); } catch (e) { console.warn(e); }
      });
    };
  }, [map]);

  return null;
}
 
const DRW_LS_KEY    = (pid) => `drawing-shapes-${pid}`;
const DRW_MAX_RETRY = 1;
const DRW_RETRY_MS  = 2000;

export function DrawingAutoSave() {
  const dispatch   = useDispatch();
  const shapes     = useSelector((s) => s.drawing.shapes);
  const { id }     = useParams();
  const decodedId  = decode(id);

  const hasLoaded   = useRef(false);
  const skipSaveRef = useRef(false);
  const saveTimer   = useRef(null);
  const statusTimer = useRef(null);
  const saveVersion = useRef(0);

  const markSaved = () => {
    dispatch(setSaveStatus('saved'));
    if (statusTimer.current) clearTimeout(statusTimer.current);
    statusTimer.current = setTimeout(() => dispatch(setSaveStatus('idle')), 3000);
  };

  const attemptSave = (projectId, snapshot, version, attempt = 0) => {
    if (version !== saveVersion.current) return;

    saveDrawingShapes(projectId, snapshot)
      .then((result) => {
        if (version !== saveVersion.current) return;
        if (result.type === 1) {
          try { localStorage.setItem(DRW_LS_KEY(projectId), JSON.stringify(snapshot)); } catch {}
          markSaved();
        } else {
          throw new Error(result.errormessage || 'Save failed');
        }
      })
      .catch(() => {
        if (version !== saveVersion.current) return;
        if (attempt < DRW_MAX_RETRY - 1) {
          setTimeout(
            () => attemptSave(projectId, snapshot, version, attempt + 1),
            DRW_RETRY_MS * Math.pow(2, attempt),
          );
        } else {
          try { localStorage.setItem(DRW_LS_KEY(projectId), JSON.stringify(snapshot)); } catch {}
          dispatch(setSaveStatus('failed'));
        }
      });
  };
 
  useEffect(() => {
    if (!decodedId) return;

    hasLoaded.current = false;
    dispatch(clearAllShapes());
    dispatch(setSaveStatus('idle'));

    const load = async () => {
      try {
        let savedShapes = await loadDrawingShapes(decodedId);
 
        if (!savedShapes?.length) {
          try {
            const raw = localStorage.getItem(DRW_LS_KEY(decodedId));
            if (raw) savedShapes = JSON.parse(raw) ?? [];
          } catch {}
        }

        if (savedShapes?.length > 0) {
          skipSaveRef.current = true;
          dispatch(setAllShapes(savedShapes));
        }
      } catch {
         
        try {
          const raw = localStorage.getItem(DRW_LS_KEY(decodedId));
          if (raw) {
            const local = JSON.parse(raw) ?? [];
            if (local.length > 0) {
              skipSaveRef.current = true;
              dispatch(setAllShapes(local));
            }
          }
        } catch {}
      } finally {
        hasLoaded.current = true;
      }
    };

    load();

    return () => {
      if (saveTimer.current)  clearTimeout(saveTimer.current);
      if (statusTimer.current) clearTimeout(statusTimer.current);
    };
  }, [decodedId, dispatch]);
 
  useEffect(() => { 

    if (!hasLoaded.current) return;

    if (skipSaveRef.current) {
      skipSaveRef.current = false;
      return;
    }

    if (saveTimer.current) clearTimeout(saveTimer.current);

    const snapshot = shapes;

    saveTimer.current = setTimeout(() => {
      saveVersion.current += 1;
      const version = saveVersion.current;
 
      try { localStorage.setItem(DRW_LS_KEY(decodedId), JSON.stringify(snapshot)); } catch {}


      dispatch(setSaveStatus('saving'));
      attemptSave(decodedId, snapshot, version);
    }, 1000);
  }, [shapes, decodedId]); 

  return null;
}
 
export function DrawingSync() {
  const dispatch     = useDispatch();
  const shapes       = useSelector((s) => s.drawing.shapes);
  const selectedIds  = useSelector((s) => s.drawing.selectedIds);
  const inProgress   = useSelector((s) => s.drawing.inProgress);
  const currentFloor = useSelector((s) => s.api.currentFloor);

  const floorId = currentFloor?.enc_id ?? null;
 
  const floorShapes = useMemo(
    () => shapes.filter((s) => s.properties?.floorId === floorId),
    [shapes, floorId],
  );
  const floorSelectedIds = useMemo(
    () => selectedIds.filter((id) => floorShapes.some((s) => String(s.id) === id)),
    [selectedIds, floorShapes],
  );
 
  const [initCount, setInitCount] = useState(0);
  useEffect(() => {
    drawingSourceRef.onInit = () => setInitCount((c) => c + 1);
    return () => { drawingSourceRef.onInit = null; };
  }, []);

  useEffect(() => {
    if (drawingSourceRef.isDragging) return; 
    drawingSourceRef.setShapesData?.(floorShapes, floorSelectedIds);
  }, [floorShapes, floorSelectedIds, initCount]);
 
  useEffect(() => {
    dispatch(clearSelection());
  }, [floorId, dispatch]);

  useEffect(() => {
    if (!inProgress) {
      drawingSourceRef.setPreviewData?.(emptyCollection());
    }
  }, [inProgress]);

  return null;
}