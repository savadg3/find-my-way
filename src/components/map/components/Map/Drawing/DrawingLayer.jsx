// DrawingLayer.jsx  (refactored + vertex dots + edge labels + selection fix)
import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
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
  vertices:       'drawing-vertices',           // blue corner dots
  verticesFirst:  'drawing-vertices-first',     // red snap-target dot (preview)
  edgeLabels:     'drawing-edge-labels',        // "8.22 m" text on each side
  previewLine:    'drawing-preview-line',
  previewFill:    'drawing-preview-fill',
  previewVertex:  'drawing-preview-vertex',     // dots while drawing
  previewEdge:    'drawing-preview-edge',       // live length labels while drawing
  text:           'drawing-text',
};

// Shorthand MapLibre expression to read a feature property
const prop = (name) => ['get', name];

export default function DrawingLayer() {
  const map         = useSelector((s) => s.map.mapContainer);
  const shapes      = useSelector((s) => s.drawing.shapes);
  const selectedIds = useSelector((s) => s.drawing.selectedIds);
  const inProgress  = useSelector((s) => s.drawing.inProgress);

  const initialised    = useRef(false);
  const shapesRef      = useRef(shapes);
  const selectedIdsRef = useRef(selectedIds);

  useEffect(() => { shapesRef.current      = shapes;      }, [shapes]);
  useEffect(() => { selectedIdsRef.current = selectedIds; }, [selectedIds]);

  // ── 1. Register sources + layers once ────────────────────────────────────
  useEffect(() => {
    if (!map) return;

    const init = () => {
      if (initialised.current) return;
      initialised.current = true;

      // ── Sources ──────────────────────────────────────────────────────────
      map.addSource(SOURCES.shapes, {
        type:      'geojson',
        data:      emptyCollection(),
        promoteId: 'id',   // required: makes queryRenderedFeatures return feature ids
      });
      map.addSource(SOURCES.preview, {
        type: 'geojson',
        data: emptyCollection(),
      });

      // ── Committed shape layers ────────────────────────────────────────────

      // Polygon fill
      map.addLayer({
        id:     LAYERS.fill,
        type:   'fill',
        source: SOURCES.shapes,
        filter: ['==', ['geometry-type'], 'Polygon'],
        paint: {
          'fill-color':   prop('fillColor'),
          'fill-opacity': ['coalesce', prop('opacity'), 1],
        },
      });

      // Selected polygon highlight
      map.addLayer({
        id:     LAYERS.selectedFill,
        type:   'fill',
        source: SOURCES.shapes,
        filter: ['all',
          ['==', ['geometry-type'], 'Polygon'],
          ['==', prop('selected'), true],
        ],
        paint: {
          'fill-color':   'rgba(255,200,0,0.20)',
          'fill-opacity': 1,
        },
      });

      // Stroke / outline
      map.addLayer({
        id:     LAYERS.stroke,
        type:   'line',
        source: SOURCES.shapes,
        filter: ['all',
          ['!=', ['geometry-type'], 'Point'],
          ['!', ['has', 'edgeIndex']],    // exclude edge-label points
          ['!', ['has', 'vertexIndex']],  // exclude vertex points
        ],
        paint: {
          'line-color':   prop('strokeColor'),
          'line-width':   prop('strokeWidth'),
          'line-opacity': ['coalesce', prop('opacity'), 1],
        },
      });

      // Selected stroke — dashed orange
      map.addLayer({
        id:     LAYERS.selectedStroke,
        type:   'line',
        source: SOURCES.shapes,
        filter: ['all',
          ['!=', ['geometry-type'], 'Point'],
          ['==', prop('selected'), true],
          ['!', ['has', 'edgeIndex']],
          ['!', ['has', 'vertexIndex']],
        ],
        paint: {
          'line-color':     '#f5a623',
          'line-width':     ['+', prop('strokeWidth'), 2],
          'line-dasharray': [4, 2],
        },
      });

      // Vertex dots — only visible when parent shape is selected
      map.addLayer({
        id:     LAYERS.vertices,
        type:   'circle',
        source: SOURCES.shapes,
        filter: ['all',
          ['has', 'vertexIndex'],
          ['==', prop('selected'), true],
        ],
        paint: {
          'circle-radius':       5,
          'circle-color':        '#3b5bdb',
          'circle-stroke-width': 1.5,
          'circle-stroke-color': '#ffffff',
        },
      });

      // Edge length labels — only visible when parent shape is selected
      map.addLayer({
        id:     LAYERS.edgeLabels,
        type:   'symbol',
        source: SOURCES.shapes,
        filter: ['all',
          ['has', 'edgeIndex'],
          ['==', prop('selected'), true],
        ],
        layout: {
          'text-field':            prop('label'),
          'text-font':             ['Open Sans Regular'],
          'text-size':             11,
          'text-allow-overlap':    true,
          'text-ignore-placement': true,
          'text-anchor':           'center',
        },
        paint: {
          'text-color':       '#222222',
          'text-halo-color':  '#ffffff',
          'text-halo-width':  1.5,
        },
      });

      // Text tool labels
      map.addLayer({
        id:     LAYERS.text,
        type:   'symbol',
        source: SOURCES.shapes,
        filter: ['all',
          ['==', ['geometry-type'], 'Point'],
          ['==', prop('shapeType'), 'text'],
        ],
        layout: {
          'text-field':            prop('text'),
          'text-font':             ['Open Sans Regular'],
          'text-size':             prop('fontSize'),
          'text-justify':          prop('textAlign'),
          'text-anchor':           'top-left',
          'text-allow-overlap':    true,
        },
        paint: {
          'text-color':       prop('strokeColor'),
          'text-halo-color':  '#fff',
          'text-halo-width':  1.5,
        },
      });

      // ── Preview layers (in-progress drawing) ─────────────────────────────

      // Preview polygon/line stroke
      map.addLayer({
        id:     LAYERS.previewLine,
        type:   'line',
        source: SOURCES.preview,
        filter: ['!=', ['geometry-type'], 'Point'],
        paint: {
          'line-color':     '#1a73e8',
          'line-width':     2,
          'line-dasharray': [4, 3],
          'line-opacity':   0.9,
        },
      });

      // Preview polygon fill
      map.addLayer({
        id:     LAYERS.previewFill,
        type:   'fill',
        source: SOURCES.preview,
        filter: ['==', ['geometry-type'], 'Polygon'],
        paint: {
          'fill-color':   '#1a73e8',
          'fill-opacity': 0.10,
        },
      });

      // Preview vertex dots (blue = normal, red = first/snap-target)
      map.addLayer({
        id:     LAYERS.previewVertex,
        type:   'circle',
        source: SOURCES.preview,
        filter: ['==', prop('vertexPreview'), true],
        paint: {
          'circle-radius':       5,
          'circle-color': [
            'case', ['==', prop('isFirst'), true], '#e03131', '#3b5bdb',
          ],
          'circle-stroke-width': 1.5,
          'circle-stroke-color': '#ffffff',
        },
      });

      // Preview edge length labels
      map.addLayer({
        id:     LAYERS.previewEdge,
        type:   'symbol',
        source: SOURCES.preview,
        filter: ['==', prop('edgeLabel'), true],
        layout: {
          'text-field':            prop('label'),
          'text-font':             ['Open Sans Regular'],
          'text-size':             11,
          'text-allow-overlap':    true,
          'text-ignore-placement': true,
          'text-anchor':           'center',
        },
        paint: {
          'text-color':      '#222222',
          'text-halo-color': '#ffffff',
          'text-halo-width': 1.5,
        },
      });

      // Seed immediately with current Redux state
      map.getSource(SOURCES.shapes)
        ?.setData(shapesToGeoJSON(shapesRef.current, selectedIdsRef.current));
    };

    // Re-init after style reload (floor/style change resets all sources+layers)
    const handleStyleData = () => {
      initialised.current = false;
      init();
    };

    if (map.isStyleLoaded()) {
      init();
    } else {
      map.once('load', init);
    }

    map.on('styledata', handleStyleData);

    return () => {
      map.off('styledata', handleStyleData);
      Object.values(LAYERS).forEach((l) => {
        try { if (map.getLayer(l))  map.removeLayer(l);  } catch (e) { console.warn('[DrawingLayer] removeLayer:', l, e); }
      });
      Object.values(SOURCES).forEach((s) => {
        try { if (map.getSource(s)) map.removeSource(s); } catch (e) { console.warn('[DrawingLayer] removeSource:', s, e); }
      });
      initialised.current = false;
    };
  }, [map]);

  // ── 2. Sync shapes → MapLibre on Redux change ─────────────────────────────
  useEffect(() => {
    if (!map || !initialised.current) return;
    map.getSource(SOURCES.shapes)
      ?.setData(shapesToGeoJSON(shapes, selectedIds));
  }, [map, shapes, selectedIds]);

  // ── 3. Clear preview when drawing committed / cancelled ───────────────────
  useEffect(() => {
    if (!map || !initialised.current) return;
    if (!inProgress) {
      map.getSource(SOURCES.preview)?.setData(emptyCollection());
    }
  }, [map, inProgress]);

  return null;
}