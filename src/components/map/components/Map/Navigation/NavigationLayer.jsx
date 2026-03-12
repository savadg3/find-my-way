import { useEffect, useMemo, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useMatch, useParams }      from 'react-router-dom';
import { decode }                   from '../../../../../helpers/utils';
import { setAllPaths, clearAllNavPaths, clearNavSelection, setSaveStatus } from '../../../../../store/slices/navigationSlice';
import { saveNavigationPaths, loadNavigationPaths } from './navigationService';
import {
  pathsToLinesGeoJSON,
  nodesToGeoJSON,
  previewToGeoJSON,
  emptyCol,
} from './navigationUtils';

export const NAV_SOURCES = {
  lines:     'nav-lines',
  nodes:     'nav-nodes',
  preview:   'nav-preview',
  highlight: 'nav-highlight', 
};

export const NAV_LAYERS = {
  mainLine:       'nav-main-line',
  subLine:        'nav-sub-line',
  selectedLine:   'nav-selected-line',
  hitLine:        'nav-hit-line', 
  nodes:          'nav-nodes-circle',
  nodesPin:       'nav-nodes-pin',
  nodesSnap:      'nav-nodes-snap',
  previewLine:    'nav-preview-line',
  previewDot:     'nav-preview-dot',
  highlightLine:  'nav-highlight-line', 
  highlightDash:  'nav-highlight-dash', 
  highlightArrow: 'nav-highlight-arrow', 
};

export const navSourceRef = {
  setLines:           null,
  setNodes:           null,
  setPreview:         null,
  setHighlight:       null,
  _latestHighlight:   null,  
  _desiredVisibility: 'none', 
  applyVisibility:    null, 
};

export default function NavigationLayer() {
  const map         = useSelector((s) => s.map.mapContainer);
  const initialised = useRef(false);
  
  useEffect(() => {
    if (!map) return; 

    let dashRafId = null;
    
    const teardown = () => { 
      if (dashRafId) { cancelAnimationFrame(dashRafId); dashRafId = null; }
      Object.values(NAV_LAYERS).forEach((l) => {
        try { if (map.getLayer(l)) map.removeLayer(l); } catch {}
      });
      Object.values(NAV_SOURCES).forEach((s) => {
        try { if (map.getSource(s)) map.removeSource(s); } catch {}
      });
      navSourceRef.setLines         = null;
      navSourceRef.setNodes         = null;
      navSourceRef.setPreview       = null;
      navSourceRef.setHighlight     = null;
      navSourceRef.applyVisibility  = null;
    };
    
    const init = () => {
      if (initialised.current) return; 
      if (dashRafId) { cancelAnimationFrame(dashRafId); dashRafId = null; }
      
      map.addSource(NAV_SOURCES.lines, {
        type: 'geojson', data: emptyCol(), promoteId: 'id',
      });
      map.addSource(NAV_SOURCES.nodes, {
        type: 'geojson', data: emptyCol(), promoteId: 'id',
      });
      map.addSource(NAV_SOURCES.preview, {
        type: 'geojson', data: emptyCol(),
      });
      
      map.addLayer({
        id: NAV_LAYERS.mainLine, type: 'line', source: NAV_SOURCES.lines,
        filter: ['all', ['==', ['get', 'pathType'], 'main'], ['!', ['get', 'selected']]],
        layout: { 'line-cap': 'round', 'line-join': 'round', 'visibility': 'none' },
        paint:  { 'line-color': '#1a73e8', 'line-width': 3, 'line-opacity': 0.9 },
      });

      map.addLayer({
        id: NAV_LAYERS.subLine, type: 'line', source: NAV_SOURCES.lines,
        filter: ['all', ['==', ['get', 'pathType'], 'sub'], ['!', ['get', 'selected']]],
        layout: { 'line-cap': 'round', 'line-join': 'round', 'visibility': 'none' },
        paint:  { 'line-color': '#2e7d32', 'line-width': 2.5, 'line-opacity': 0.9 },
      });

      map.addLayer({
        id: NAV_LAYERS.selectedLine, type: 'line', source: NAV_SOURCES.lines,
        filter: ['==', ['get', 'selected'], true],
        layout: { 'line-cap': 'round', 'line-join': 'round', 'visibility': 'none' },
        paint:  { 'line-color': '#f57c00', 'line-width': 4, 'line-opacity': 1 },
      });

      map.addLayer({
        id: NAV_LAYERS.hitLine, type: 'line', source: NAV_SOURCES.lines,
        layout: { 'line-cap': 'round', 'visibility': 'none' },
        paint:  { 'line-color': 'rgba(0,0,0,0)', 'line-width': 16, 'line-opacity': 0 },
      });

      map.addLayer({
        id: NAV_LAYERS.nodes, type: 'circle', source: NAV_SOURCES.nodes,
        filter: ['all', ['!', ['get', 'isPin']], ['!', ['get', 'isSnap']]],
        layout: { 'visibility': 'none' },
        paint: {
          'circle-radius': ['case', ['get', 'selected'], 8, 6],
          'circle-color': [
            'case',
            ['get', 'selected'],                         '#f57c00',
            ['==', ['get', 'pathType'], 'main'],         '#1a73e8',
            '#2e7d32',
          ],
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
        },
      });

      map.addLayer({
        id: NAV_LAYERS.nodesSnap, type: 'circle', source: NAV_SOURCES.nodes,
        filter: ['get', 'isSnap'],
        layout: { 'visibility': 'none' },
        paint: {
          'circle-radius':       7,
          'circle-color':        '#FFD600',
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
        },
      });

      map.addLayer({
        id: NAV_LAYERS.previewLine, type: 'line', source: NAV_SOURCES.preview,
        filter: ['==', ['geometry-type'], 'LineString'],
        layout: { 'line-cap': 'round', 'line-join': 'round', 'visibility': 'none' },
        paint: {
          'line-color': [
            'case', ['==', ['get', 'pathType'], 'main'], '#1a73e8', '#2e7d32',
          ],
          'line-width':     2,
          'line-dasharray': [4, 3],
          'line-opacity':   0.8,
        },
      });

      map.addLayer({
        id: NAV_LAYERS.previewDot, type: 'circle', source: NAV_SOURCES.preview,
        filter: ['==', ['geometry-type'], 'Point'],
        layout: { 'visibility': 'none' },
        paint: {
          'circle-radius':       5,
          'circle-color': [
            'case', ['==', ['get', 'pathType'], 'main'], '#1a73e8', '#2e7d32',
          ],
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
        },
      });
      
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
      
      const ARROW_SZ = 22;
      const arrowCanvas = document.createElement('canvas');
      arrowCanvas.width  = ARROW_SZ;
      arrowCanvas.height = ARROW_SZ;
      const arrowCtx = arrowCanvas.getContext('2d');
      arrowCtx.fillStyle = 'rgba(255,255,255,0.95)';
      arrowCtx.beginPath();
      arrowCtx.moveTo(ARROW_SZ,          ARROW_SZ / 2); 
      arrowCtx.lineTo(ARROW_SZ * 0.35,   0);           
      arrowCtx.lineTo(ARROW_SZ * 0.55,   ARROW_SZ / 2); 
      arrowCtx.lineTo(ARROW_SZ * 0.35,   ARROW_SZ);     
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
      
      map.addLayer({
        id: NAV_LAYERS.highlightLine, type: 'line', source: NAV_SOURCES.highlight,
        layout: { 'line-cap': 'round', 'line-join': 'round', 'visibility': 'none' },
        paint: {
          'line-color':   '#e53935',
          'line-width':   7,
          'line-opacity': 0.95,
        },
      });

      map.addLayer({
        id: NAV_LAYERS.highlightDash, type: 'line', source: NAV_SOURCES.highlight,
        layout: { 'line-cap': 'butt', 'line-join': 'round', 'visibility': 'none' },
        paint: {
          'line-color':     '#ffffff',
          'line-width':     3,
          'line-opacity':   0.85,
          'line-dasharray': [0, 4, 3],
        },
      });

      map.addLayer({
        id: NAV_LAYERS.highlightArrow, type: 'symbol', source: NAV_SOURCES.highlight,
        layout: {
          'visibility':              'none',
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
      
      if (navSourceRef._latestHighlight) {
        navSourceRef.setHighlight(navSourceRef._latestHighlight);
      }
 
      navSourceRef.applyVisibility = (v) => {
        Object.values(NAV_LAYERS).forEach((l) => {
          try { if (map.getLayer(l)) map.setLayoutProperty(l, 'visibility', v); } catch {}
        });
      };
      
      navSourceRef.applyVisibility(navSourceRef._desiredVisibility);
      const dashFrames = [
        [0, 4, 3], [0.5, 4, 2.5], [1, 4, 2],   [1.5, 4, 1.5],
        [2, 4, 1], [2.5, 4, 0.5], [3, 4, 0],
        [0, 0.5, 3, 3.5], [0, 1, 3, 3], [0, 1.5, 3, 2.5],
        [0, 2, 3, 2],     [0, 2.5, 3, 1.5], [0, 3, 3, 1], [0, 3.5, 3, 0.5],
      ];
      let dashStep   = 0;
      let lastDashTs = 0;
      const DASH_MS  = 50; 
      
      const animateDash = (ts) => {
        dashRafId = requestAnimationFrame(animateDash);
        if (ts - lastDashTs < DASH_MS) return;
        lastDashTs = ts;
        try {
          map.setPaintProperty(
            NAV_LAYERS.highlightDash, 'line-dasharray', dashFrames[dashStep],
          );
        } catch { }
        dashStep = (dashStep + 1) % dashFrames.length;
      };
      dashRafId = requestAnimationFrame(animateDash);
      
      initialised.current = true;
    };
    
    const handleStyleData = () => {
      if (!map.isStyleLoaded()) return;
      if (map.getSource(NAV_SOURCES.lines)) return;
      initialised.current = false;
      navSourceRef.setLines        = null;
      navSourceRef.setNodes        = null;
      navSourceRef.setPreview      = null;
      navSourceRef.setHighlight    = null;
      navSourceRef.applyVisibility = null;
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

export function NavSync() {
  const dispatch        = useDispatch();
  const allPaths        = useSelector((s) => s.navigation.paths);
  const selectedPathId  = useSelector((s) => s.navigation.selectedPathId);
  const selectedPointId = useSelector((s) => s.navigation.selectedPointId);
  const inProgress      = useSelector((s) => s.navigation.inProgress);
  const shortestPath    = useSelector((s) => s.navigation.shortestPath);
  const currentFloor    = useSelector((s) => s.api.currentFloor);
  
  const floorId = currentFloor?.enc_id ?? null;
  
  const floorPaths = useMemo(
    () => allPaths.filter((p) => p.floorId === floorId),
    [allPaths, floorId],
  ); 
  
  useEffect(() => { 
    navSourceRef.setLines?.(floorPaths, selectedPathId);
    navSourceRef.setNodes?.(floorPaths, selectedPathId, selectedPointId);
  }, [floorPaths, selectedPathId, selectedPointId]);
  
  useEffect(() => {
    dispatch(clearNavSelection());
  }, [floorId, dispatch]);
  
  useEffect(() => {
    if (!inProgress) {
      navSourceRef.setPreview?.(null, null);
    }
  }, [inProgress]);
  
  useEffect(() => { 
    navSourceRef.setHighlight?.(shortestPath?.positions ?? null);
  }, [shortestPath]);
  
  return null;
}

export function NavVisibility() {
  const isNavPage = !!useMatch('/project/:id/navigation');

  useEffect(() => {
    const visibility = isNavPage ? 'visible' : 'none'; 
    navSourceRef._desiredVisibility = visibility; 
    navSourceRef.applyVisibility?.(visibility);
  }, [isNavPage]);

  return null;
}

const LS_KEY = (projectId) => `nav-paths-${projectId}`;
const MAX_RETRIES = 1;
const RETRY_BASE_MS = 2000;

export function NavAutoSave() { 
  const dispatch    = useDispatch();
  const paths       = useSelector((s) => s.navigation.paths);
  const { id }      = useParams();
  const decodedId   = decode(id);
  
  const hasLoaded    = useRef(false);
  const skipSaveRef  = useRef(false);
  const saveTimer    = useRef(null);
  const statusTimer  = useRef(null);
  const saveVersion  = useRef(0);  
  
  const markSaved = () => {
    dispatch(setSaveStatus('saved'));
    if (statusTimer.current) clearTimeout(statusTimer.current);
    statusTimer.current = setTimeout(() => dispatch(setSaveStatus('idle')), 3000);
  };
  
  const attemptSave = (projectId, snapshot, version, attempt = 0) => {
    if (version !== saveVersion.current) return;  
    
    // saveNavigationPaths(projectId, snapshot)
    // .then((result) => {
    //   if (version !== saveVersion.current) return;
    //   if (result.type === 1) { 
    //     try { 
    //       localStorage.setItem(LS_KEY(projectId), JSON.stringify(snapshot)); 
    //     } catch {} 
    //     markSaved(); 
    //   } else {
    //     throw new Error(result.errormessage || 'Save failed');
    //   }
    // })
    // .catch(() => {
    //   if (version !== saveVersion.current) return;
    //   if (attempt < MAX_RETRIES - 1) { 
    //     setTimeout(
    //       () => attemptSave(projectId, snapshot, version, attempt + 1),
    //       RETRY_BASE_MS * Math.pow(2, attempt),
    //     );
    //   } else { 
    //     try { localStorage.setItem(LS_KEY(projectId), JSON.stringify(snapshot)); } catch {}
    //     dispatch(setSaveStatus('failed'));
    //   }
    // });

    localStorage.setItem(LS_KEY(projectId), JSON.stringify(snapshot)); 
    markSaved(); 
  };
  
  useEffect(() => {
    if (!decodedId) return;
    
    hasLoaded.current = false;
    dispatch(clearAllNavPaths());
    dispatch(setSaveStatus('idle'));
    
    const load = async () => {
      try {
        let savedPaths = await loadNavigationPaths(decodedId); 
        
        if (!savedPaths?.length) {
          try {
            const raw = localStorage.getItem(LS_KEY(decodedId));
            if (raw) savedPaths = JSON.parse(raw) ?? [];
          } catch {}
        }
        
        if (savedPaths?.length > 0) {
          skipSaveRef.current = true;
          dispatch(setAllPaths(savedPaths));
        }
      } catch { 
        try {
          const raw = localStorage.getItem(LS_KEY(decodedId));
          if (raw) {
            const localPaths = JSON.parse(raw) ?? [];
            if (localPaths.length > 0) {
              skipSaveRef.current = true;
              dispatch(setAllPaths(localPaths));
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
    const snapshot = paths;
    
    
    saveTimer.current = setTimeout(() => {
      saveVersion.current += 1;
      const version = saveVersion.current;
      
      try { localStorage.setItem(LS_KEY(decodedId), JSON.stringify(snapshot)); } catch {}
      
      dispatch(setSaveStatus('saving'));
      attemptSave(decodedId, snapshot, version);
    }, 1000);
  }, [paths, decodedId]); 
  
  return null;
}
