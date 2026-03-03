// useImageImport.js
import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addItem } from '../../../../../store/slices/imageOverlaySlice';
import { buildCoordinates, DEFAULT_METRES, svgToDataURL } from './imageOverlayUtils';

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

    dispatch(addItem({ type: 'image', src, coordinates, aspectRatio, rotation: 0 }));
  }, [dispatch, getMapCenter]);

  const openSVGPicker = useCallback(async () => {
    const file = await pickFile('image/svg+xml,.svg');
    if (!file) return;

    const svgText     = await readFileAsText(file);
    const { w, h }    = getSVGDimensions(svgText);
    const aspectRatio = w / h;
    const src         = svgToDataURL(svgText);  // blob URL MapLibre can load
    const [lng, lat]  = getMapCenter();
    const widthM      = DEFAULT_METRES;
    const heightM     = widthM / aspectRatio;
    const coordinates = buildCoordinates(lng, lat, widthM, heightM, 0);

    dispatch(addItem({ type: 'svg', src, coordinates, aspectRatio, rotation: 0 }));
  }, [dispatch, getMapCenter]);

  return { openImagePicker, openSVGPicker };
}