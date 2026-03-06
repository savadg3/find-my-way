// NavigationLayer.jsx
// Registers all MapLibre GL sources + layers for navigation paths.
// Data is pushed imperatively through navSourceRef — this component never
// re-renders due to path state changes, keeping it blink-free.

import { useEffect, useRef } from 'react';
import { useSelector }       from 'react-redux';
import {
  pathsToLinesGeoJSON,
  nodesToGeoJSON,
  previewToGeoJSON,
  emptyCol,
} from './navigationUtils';

// ── Source / Layer name constants ─────────────────────────────────────────────
export const NAV_SOURCES = {
  lines:   'nav-lines',
  nodes:   'nav-nodes',
  preview: 'nav-preview',
};

export const NAV_LAYERS = {
  mainLine:     'nav-main-line',
  subLine:      'nav-sub-line',
  selectedLine: 'nav-selected-line',
  hitLine:      'nav-hit-line',      // invisible wide line for easy click detection
  nodes:        'nav-nodes-circle',
  nodesPin:     'nav-nodes-pin',
  nodesSnap:    'nav-nodes-snap',
  previewLine:  'nav-preview-line',
  previewDot:   'nav-preview-dot',
};

// ── Imperative handle ─────────────────────────────────────────────────────────
// NavSync and useNavigationManager push data through here — zero re-renders.
export const navSourceRef = {
  setLines:   null, // (paths, selectedPathId) => void
  setNodes:   null, // (paths, selectedPathId, selectedPointId) => void
  setPreview: null, // (inProgress, mousePos?) => void
};

// ── NavigationLayer ───────────────────────────────────────────────────────────
export default function NavigationLayer() {
  const map         = useSelector((s) => s.map.mapContainer);
  const initialised = useRef(false);

  useEffect(() => {
    if (!map) return;

    // Shared teardown helper — used by the effect cleanup and handleStyleData
    // when a genuine style-swap has removed all sources.
    const teardown = () => {
      Object.values(NAV_LAYERS).forEach((l) => {
        try { if (map.getLayer(l)) map.removeLayer(l); } catch {}
      });
      Object.values(NAV_SOURCES).forEach((s) => {
        try { if (map.getSource(s)) map.removeSource(s); } catch {}
      });
      navSourceRef.setLines   = null;
      navSourceRef.setNodes   = null;
      navSourceRef.setPreview = null;
    };

    const init = () => {
      if (initialised.current) return;
      // NOTE: initialised.current is set AFTER all setup succeeds,
      // so that a premature throw (e.g. "Style is not done loading")
      // doesn't permanently block re-initialization.

      // ── Sources ──────────────────────────────────────────────────────
      map.addSource(NAV_SOURCES.lines, {
        type: 'geojson', data: emptyCol(), promoteId: 'id',
      });
      map.addSource(NAV_SOURCES.nodes, {
        type: 'geojson', data: emptyCol(), promoteId: 'id',
      });
      map.addSource(NAV_SOURCES.preview, {
        type: 'geojson', data: emptyCol(),
      });

      // ── Layers — order matters (bottom → top) ─────────────────────────
      // Main path line  (blue)
      map.addLayer({
        id: NAV_LAYERS.mainLine, type: 'line', source: NAV_SOURCES.lines,
        filter: ['all', ['==', ['get', 'pathType'], 'main'], ['!', ['get', 'selected']]],
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint:  { 'line-color': '#1a73e8', 'line-width': 3, 'line-opacity': 0.9 },
      });

      // Sub path line  (green)
      map.addLayer({
        id: NAV_LAYERS.subLine, type: 'line', source: NAV_SOURCES.lines,
        filter: ['all', ['==', ['get', 'pathType'], 'sub'], ['!', ['get', 'selected']]],
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint:  { 'line-color': '#2e7d32', 'line-width': 2.5, 'line-opacity': 0.9 },
      });

      // Selected path  (orange + wider)
      map.addLayer({
        id: NAV_LAYERS.selectedLine, type: 'line', source: NAV_SOURCES.lines,
        filter: ['==', ['get', 'selected'], true],
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint:  { 'line-color': '#f57c00', 'line-width': 4, 'line-opacity': 1 },
      });

      // Invisible wide hit layer — makes lines easier to click (16 px target)
      map.addLayer({
        id: NAV_LAYERS.hitLine, type: 'line', source: NAV_SOURCES.lines,
        layout: { 'line-cap': 'round' },
        paint:  { 'line-color': 'rgba(0,0,0,0)', 'line-width': 16, 'line-opacity': 0 },
      });

      // ── Regular corner nodes — solid blue (main) / green (sub) ──────────
      // Uses isPin/isSnap (explicit bools) so we never rely on null-comparison.
      // Snap (floating anchor) nodes are excluded — nodesSnap renders them yellow.
      map.addLayer({
        id: NAV_LAYERS.nodes, type: 'circle', source: NAV_SOURCES.nodes,
        filter: ['all', ['!', ['get', 'isPin']], ['!', ['get', 'isSnap']]],
        paint: {
          'circle-radius': ['case', ['get', 'selected'], 8, 6],
          'circle-color': [
            'case',
            ['get', 'selected'],                         '#f57c00',
            ['==', ['get', 'pathType'], 'main'],         '#1a73e8',
            /* sub */                                     '#2e7d32',
          ],
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
        },
      });

      // Floating anchor nodes (sub-path endpoint riding a main path) — solid yellow.
      // These are NOT part of the main path; they are independent snap points.
      map.addLayer({
        id: NAV_LAYERS.nodesSnap, type: 'circle', source: NAV_SOURCES.nodes,
        filter: ['get', 'isSnap'],
        paint: {
          'circle-radius':       7,
          'circle-color':        '#FFD600',
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
        },
      });

      // NOTE: Pin-anchored path endpoints (isPin === true) are NOT rendered as
      // GL circles. The pin marker itself (anchor: 'bottom', tip at [lng,lat])
      // is the visual anchor. Adding a circle layer here would produce a
      // floating dot 8 px below the pin tip because the circle is centred at
      // the coordinate, while the marker tip is AT the coordinate.
      // The path line connecting to the pin is visual evidence enough.

      // Preview line while drawing (dashed, coloured by path type)
      map.addLayer({
        id: NAV_LAYERS.previewLine, type: 'line', source: NAV_SOURCES.preview,
        filter: ['==', ['geometry-type'], 'LineString'],
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': [
            'case', ['==', ['get', 'pathType'], 'main'], '#1a73e8', '#2e7d32',
          ],
          'line-width':     2,
          'line-dasharray': [4, 3],
          'line-opacity':   0.8,
        },
      });

      // Preview vertex dots — solid colour matching path type, white outline
      map.addLayer({
        id: NAV_LAYERS.previewDot, type: 'circle', source: NAV_SOURCES.preview,
        filter: ['==', ['geometry-type'], 'Point'],
        paint: {
          'circle-radius':       5,
          'circle-color': [
            'case', ['==', ['get', 'pathType'], 'main'], '#1a73e8', '#2e7d32',
          ],
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
        },
      });

      // ── Wire imperative handle ────────────────────────────────────────
      navSourceRef.setLines = (paths, selectedPathId) => {
        map.getSource(NAV_SOURCES.lines)
          ?.setData(pathsToLinesGeoJSON(paths, selectedPathId));
      };
      navSourceRef.setNodes = (paths, selectedPathId, selectedPointId) => {
        map.getSource(NAV_SOURCES.nodes)
          ?.setData(nodesToGeoJSON(paths, selectedPathId, selectedPointId));
      };
      navSourceRef.setPreview = (inProgress, mousePos) => {
        map.getSource(NAV_SOURCES.preview)
          ?.setData(previewToGeoJSON(inProgress, mousePos));
      };

      // Mark fully initialised AFTER all setup succeeds.
      // This mirrors the DrawingLayer pattern so that a premature throw
      // (e.g. "Style is not done loading") doesn't permanently block retries.
      initialised.current = true;
    };

    const handleStyleData = () => {
      // styledata fires many times during loading (sprites, fonts, tiles).
      // Only reinitialise when the style is fully loaded AND our sources are
      // gone — identical to DrawingLayer's guard, preventing the
      // constant teardown/reinit loop that the previous "always reinit"
      // approach created.
      if (!map.isStyleLoaded()) return;
      if (map.getSource(NAV_SOURCES.lines)) return; // sources still exist — nothing to do

      // Sources are gone (genuine style-swap) — reset and re-init.
      initialised.current = false;
      navSourceRef.setLines   = null;
      navSourceRef.setNodes   = null;
      navSourceRef.setPreview = null;
      init();
    };

    if (map.isStyleLoaded()) init();
    else map.once('load', init);
    map.on('styledata', handleStyleData);

    return () => {
      map.off('styledata', handleStyleData);
      initialised.current = false;
      teardown();
    };
  }, [map]);

  return null;
}

// ── NavSync ───────────────────────────────────────────────────────────────────
// Separate component: subscribes to Redux navigation state and pushes it into
// MapLibre imperatively. Isolated so NavigationLayer never re-renders on data.
export function NavSync() {
  const paths           = useSelector((s) => s.navigation.paths);
  const selectedPathId  = useSelector((s) => s.navigation.selectedPathId);
  const selectedPointId = useSelector((s) => s.navigation.selectedPointId);
  const inProgress      = useSelector((s) => s.navigation.inProgress);

  useEffect(() => {
    navSourceRef.setLines?.(paths, selectedPathId);
    navSourceRef.setNodes?.(paths, selectedPathId, selectedPointId);
  }, [paths, selectedPathId, selectedPointId]);

  useEffect(() => {
    if (!inProgress) {
      navSourceRef.setPreview?.(null, null);
    }
  }, [inProgress]);

  return null;
}
