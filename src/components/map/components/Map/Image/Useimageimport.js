// useImageImport.js
import { useCallback } from 'react';
import { v4 as uuid } from 'uuid';
import { useDispatch, useSelector } from 'react-redux';
import { addItem, selectItem } from '../../../../../store/slices/imageOverlaySlice';
import { setActiveTool } from '../../../../../store/slices/drawingToolbarSlice';
import { buildCoordinates, DEFAULT_METRES, svgToPNGDataURL } from './imageOverlayUtils';

const readFileAsDataURL = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const readFileAsText = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsText(file);
  });

const getImageDimensions = (src) =>
  new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight });
    img.src = src;
  });

const getSVGDimensions = (svgText) => {
  const parser = new DOMParser();
  const doc    = parser.parseFromString(svgText, 'image/svg+xml');
  const svg    = doc.querySelector('svg');
  if (!svg) return { w: 1, h: 1 };
  const vb = svg.getAttribute('viewBox');
  if (vb) {
    const parts = vb.trim().split(/[\s,]+/).map(Number);
    return { w: parts[2], h: parts[3] };
  }
  return {
    w: parseFloat(svg.getAttribute('width'))  || 1,
    h: parseFloat(svg.getAttribute('height')) || 1,
  };
};

const pickFile = (accept) =>
  new Promise((resolve) => {
    const input    = document.createElement('input');
    input.type     = 'file';
    input.accept   = accept;
    input.onchange = () => resolve(input.files?.[0] ?? null);
    input.click();
  });

export default function useImageImport() {
  const dispatch = useDispatch();
  const map      = useSelector((s) => s.map.mapContainer);

  const getMapCenter = useCallback(() => {
    if (!map) return [0, 0];
    const c = map.getCenter();
    return [c.lng, c.lat];
  }, [map]);

  const openImagePicker = useCallback(async () => {
    const file = await pickFile('image/png,image/jpeg,image/gif,image/webp');
    if (!file) return;

    const src         = await readFileAsDataURL(file);
    const { w, h }    = await getImageDimensions(src);
    const aspectRatio = w / h;
    const [lng, lat]  = getMapCenter();
    const widthM      = DEFAULT_METRES;
    const heightM     = widthM / aspectRatio;
    const coordinates = buildCoordinates(lng, lat, widthM, heightM, 0);

    // Pre-generate the id so we can reference it for auto-selection.
    // React batches all three dispatches into one render, and the tool-change
    // effect in ImageOverlayManager is guarded to NOT clear selection when the
    // tool changes TO 'select', so the selectItem dispatch wins.
    const id = uuid();
    dispatch(addItem({ type: 'image', src, coordinates, aspectRatio, rotation: 0, id }));
    dispatch(setActiveTool('select'));
    dispatch(selectItem(id));
  }, [dispatch, getMapCenter]);

  const openSVGPicker = useCallback(async () => {
    const file = await pickFile('image/svg+xml,.svg');
    if (!file) return;

    const svgText     = await readFileAsText(file);
    const { w, h }    = getSVGDimensions(svgText);
    const aspectRatio = w / h;
    // Rasterise the SVG to a PNG data URL so MapLibre's WebGL pipeline can load it.
    // blob: SVG URLs fail silently in gl.texImage2D (canvas taint / unsupported MIME).
    const src         = await svgToPNGDataURL(svgText, w, h);
    const [lng, lat]  = getMapCenter();
    const widthM      = DEFAULT_METRES;
    const heightM     = widthM / aspectRatio;
    const coordinates = buildCoordinates(lng, lat, widthM, heightM, 0);

    const id = uuid();
    dispatch(addItem({ type: 'svg', src, coordinates, aspectRatio, rotation: 0, id }));
    dispatch(setActiveTool('select'));
    dispatch(selectItem(id));
  }, [dispatch, getMapCenter]);

  return { openImagePicker, openSVGPicker };
}