// NavigationLayer.jsx
// Registers all MapLibre GL sources + layers for navigation paths.
// Data is pushed imperatively through navSourceRef — this component never
// re-renders due to path state changes, keeping it blink-free.

import { useEffect, useRef } from 'react';
import { useSelector }       from 'react-redux';
import { useMatch }          from 'react-router-dom';
import {
  pathsToLinesGeoJSON,
  nodesToGeoJSON,
  previewToGeoJSON,
  emptyCol,
} from './navigationUtils';

// ── Source / Layer name constants ─────────────────────────────────────────────
export const NAV_SOURCES = {
  lines:     'nav-lines',
  nodes:     'nav-nodes',
  preview:   'nav-preview',
  highlight: 'nav-highlight',   // shortest-path result
};

export const NAV_LAYERS = {
  mainLine:       'nav-main-line',
  subLine:        'nav-sub-line',
  selectedLine:   'nav-selected-line',
  hitLine:        'nav-hit-line',       // invisible wide line for easy click detection
  nodes:          'nav-nodes-circle',
  nodesPin:       'nav-nodes-pin',
  nodesSnap:      'nav-nodes-snap',
  previewLine:    'nav-preview-line',
  previewDot:     'nav-preview-dot',
  highlightLine:  'nav-highlight-line', // shortest-path solid red base
  highlightDash:  'nav-highlight-dash', // animated dashes — direction cue
  highlightArrow: 'nav-highlight-arrow',// direction chevron symbols
};

// ── Imperative handle ─────────────────────────────────────────────────────────
// NavSync and useNavigationManager push data through here — zero re-renders.
export const navSourceRef = {
  setLines:         null,  // (paths, selectedPathId) => void
  setNodes:         null,  // (paths, selectedPathId, selectedPointId) => void
  setPreview:       null,  // (inProgress, mousePos?) => void
  setHighlight:     null,  // (positions: [lng,lat][] | null) => void
  // ── Survival ref: last positions pushed to the highlight source.
  // NavigationLayer.init() reads this after every reinit (style-swap / map
  // reference change) so the red path is immediately restored without
  // waiting for NavSync's shortestPath effect to re-fire.
  _latestHighlight: null,  // [lng,lat][] | null
};

// ── NavigationLayer ───────────────────────────────────────────────────────────
export default function NavigationLayer() {
  const map         = useSelector((s) => s.map.mapContainer);
  const initialised = useRef(false);

  useEffect(() => {
    if (!map) return;

    // Animation frame ID for the dash-animation loop.
    // Declared here so both init() and teardown() share the same reference.
    let dashRafId = null;

    // Shared teardown helper — used by the effect cleanup and handleStyleData
    // when a genuine style-swap has removed all sources.
    const teardown = () => {
      // Stop dash animation before removing layers
      if (dashRafId) { cancelAnimationFrame(dashRafId); dashRafId = null; }
      Object.values(NAV_LAYERS).forEach((l) => {
        try { if (map.getLayer(l)) map.removeLayer(l); } catch {}
      });
      Object.values(NAV_SOURCES).forEach((s) => {
        try { if (map.getSource(s)) map.removeSource(s); } catch {}
      });
      navSourceRef.setLines     = null;
      navSourceRef.setNodes     = null;
      navSourceRef.setPreview   = null;
      navSourceRef.setHighlight = null;
    };

    const init = () => {
      if (initialised.current) return;
      // Cancel any RAF from a previous init call (e.g. style-swap reinit)
      if (dashRafId) { cancelAnimationFrame(dashRafId); dashRafId = null; }
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

      // ── Shortest-path highlight ───────────────────────────────────────

      // Build a rightward-pointing chevron arrow via canvas.
      // MapLibre rotates it so its +x axis aligns with the line direction,
      // making it an accurate forward-direction indicator.
      const ARROW_SZ = 22;
      const arrowCanvas = document.createElement('canvas');
      arrowCanvas.width  = ARROW_SZ;
      arrowCanvas.height = ARROW_SZ;
      const arrowCtx = arrowCanvas.getContext('2d');
      arrowCtx.fillStyle = 'rgba(255,255,255,0.95)';
      arrowCtx.beginPath();
      arrowCtx.moveTo(ARROW_SZ,          ARROW_SZ / 2);  // tip (right)
      arrowCtx.lineTo(ARROW_SZ * 0.35,   0);             // upper-left
      arrowCtx.lineTo(ARROW_SZ * 0.55,   ARROW_SZ / 2); // inner notch → chevron shape
      arrowCtx.lineTo(ARROW_SZ * 0.35,   ARROW_SZ);     // lower-left
      arrowCtx.closePath();
      arrowCtx.fill();
      if (!map.hasImage('nav-direction-arrow')) {
        map.addImage(
          'nav-direction-arrow',
          arrowCtx.getImageData(0, 0, ARROW_SZ, ARROW_SZ),
        );
      }

      map.addSource(NAV_SOURCES.highlight, {
        type: 'geojson', data: emptyCol(),
      });

      // Layer 1 — solid red base (wide, rounded)
      map.addLayer({
        id: NAV_LAYERS.highlightLine, type: 'line', source: NAV_SOURCES.highlight,
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color':   '#e53935',  // vivid red
          'line-width':   7,
          'line-opacity': 0.95,
        },
      });

      // Layer 2 — animated white dashes on top (direction cue)
      // The dash pattern cycles via requestAnimationFrame below.
      map.addLayer({
        id: NAV_LAYERS.highlightDash, type: 'line', source: NAV_SOURCES.highlight,
        layout: { 'line-cap': 'butt', 'line-join': 'round' },
        paint: {
          'line-color':     '#ffffff',
          'line-width':     3,
          'line-opacity':   0.85,
          'line-dasharray': [0, 4, 3],
        },
      });

      // Layer 3 — chevron arrow symbols placed along the line
      map.addLayer({
        id: NAV_LAYERS.highlightArrow, type: 'symbol', source: NAV_SOURCES.highlight,
        layout: {
          'symbol-placement':        'line',
          'symbol-spacing':          80,
          'icon-image':              'nav-direction-arrow',
          'icon-size':               0.9,
          'icon-rotation-alignment': 'map',
          'icon-pitch-alignment':    'viewport',
          'icon-allow-overlap':      true,
          'icon-ignore-placement':   true,
        },
      });

      navSourceRef.setHighlight = (positions) => {
        // Persist so init() can restore after a style-swap / map-reinit.
        navSourceRef._latestHighlight = positions ?? null;
        const data = positions && positions.length >= 2
          ? {
              type: 'FeatureCollection',
              features: [{
                type: 'Feature',
                geometry: { type: 'LineString', coordinates: positions },
                properties: {},
              }],
            }
          : emptyCol();
        map.getSource(NAV_SOURCES.highlight)?.setData(data);
      };

      // ── Restore any previously displayed highlight ────────────────────
      // This fires when NavigationLayer reinitialises after a style-swap or
      // map-reference change.  NavSync's shortestPath useEffect won't re-fire
      // (shortestPath in Redux is the same object), so we proactively restore
      // the data here instead of relying on a Redux-triggered re-render.
      if (navSourceRef._latestHighlight) {
        navSourceRef.setHighlight(navSourceRef._latestHighlight);
      }

      // ── Animated dash loop ────────────────────────────────────────────
      // Cycles through 14 dash-offset frames at ~50 ms each, creating a
      // "flowing" illusion of motion along the line.  The loop runs
      // whenever the highlight is initialised; it's cheap when the source
      // has no data (empty FeatureCollection).
      const dashFrames = [
        [0, 4, 3], [0.5, 4, 2.5], [1, 4, 2],   [1.5, 4, 1.5],
        [2, 4, 1], [2.5, 4, 0.5], [3, 4, 0],
        [0, 0.5, 3, 3.5], [0, 1, 3, 3], [0, 1.5, 3, 2.5],
        [0, 2, 3, 2],     [0, 2.5, 3, 1.5], [0, 3, 3, 1], [0, 3.5, 3, 0.5],
      ];
      let dashStep   = 0;
      let lastDashTs = 0;
      const DASH_MS  = 50; // ~20 fps → smooth but not CPU-heavy

      const animateDash = (ts) => {
        dashRafId = requestAnimationFrame(animateDash);
        if (ts - lastDashTs < DASH_MS) return;
        lastDashTs = ts;
        try {
          map.setPaintProperty(
            NAV_LAYERS.highlightDash, 'line-dasharray', dashFrames[dashStep],
          );
        } catch { /* layer removed / not yet ready — safe to skip */ }
        dashStep = (dashStep + 1) % dashFrames.length;
      };
      dashRafId = requestAnimationFrame(animateDash);

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
      navSourceRef.setLines     = null;
      navSourceRef.setNodes     = null;
      navSourceRef.setPreview   = null;
      navSourceRef.setHighlight = null;
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
  const shortestPath    = useSelector((s) => s.navigation.shortestPath);

  useEffect(() => {
    navSourceRef.setLines?.(paths, selectedPathId);
    navSourceRef.setNodes?.(paths, selectedPathId, selectedPointId);
  }, [paths, selectedPathId, selectedPointId]);

  useEffect(() => {
    if (!inProgress) {
      navSourceRef.setPreview?.(null, null);
    }
  }, [inProgress]);

  // Push shortest-path result into the highlight GL source whenever it changes.
  useEffect(() => {
    navSourceRef.setHighlight?.(shortestPath?.positions ?? null);
  }, [shortestPath]);

  return null;
}

// ── NavVisibility ──────────────────────────────────────────────────────────────
// Hides all navigation GL layers when the user is NOT on the navigation page,
// and shows them when they are. Mount this alongside NavigationLayer + NavSync.
export function NavVisibility() {
  const map        = useSelector((s) => s.map.mapContainer);
  const isNavPage  = !!useMatch('/project/:id/navigation');

  useEffect(() => {
    if (!map) return;
    const visibility = isNavPage ? 'visible' : 'none';
    Object.values(NAV_LAYERS).forEach((layerId) => {
      try {
        if (map.getLayer(layerId)) {
          map.setLayoutProperty(layerId, 'visibility', visibility);
        }
      } catch { /* layer not yet added — safe to ignore */ }
    });
  }, [map, isNavPage]);

  return null;
}
