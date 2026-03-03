// useImageImport.js
// Hook that opens a file picker and dispatches addItem to imageOverlaySlice.
// Supports: PNG, JPG, GIF, WebP, SVG
// Usage:
//   const { openImagePicker, openSVGPicker } = useImageImport(map);

import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addItem } from '../../../../../store/slices/imageOverlaySlice'; 

// Default size on import — 200px wide, aspect-ratio preserved
const DEFAULT_WIDTH = 200;

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
  if (!svg) return { w: 200, h: 200 };

  const vb = svg.getAttribute('viewBox');
  if (vb) {
    const [, , w, h] = vb.split(/\s+|,/).map(Number);
    return { w, h };
  }
  return {
    w: parseFloat(svg.getAttribute('width'))  || 200,
    h: parseFloat(svg.getAttribute('height')) || 200,
  };
};

// Opens an invisible file <input> and returns the selected File
const pickFile = (accept) =>
  new Promise((resolve) => {
    const input    = document.createElement('input');
    input.type     = 'file';
    input.accept   = accept;
    input.onchange = () => resolve(input.files[0] ?? null);
    input.click();
  });

export default function useImageImport() {
  const dispatch = useDispatch();
  const map      = useSelector((s) => s.map.mapContainer);

  // Map centre as the default drop position
  const getCenter = useCallback(() => {
    if (!map) return [0, 0];
    const c = map.getCenter();
    return [c.lng, c.lat];
  }, [map]);

  const openImagePicker = useCallback(async () => {
    const file = await pickFile('image/png,image/jpeg,image/gif,image/webp');
    if (!file) return;

    const src  = await readFileAsDataURL(file);
    const { w, h } = await getImageDimensions(src);
    const aspect = h / w;

    dispatch(addItem({
      type:   'image',
      src,
      lngLat: getCenter(),
      width:  DEFAULT_WIDTH,
      height: Math.round(DEFAULT_WIDTH * aspect),
    }));
  }, [dispatch, getCenter]);

  const openSVGPicker = useCallback(async () => {
    const file = await pickFile('image/svg+xml,.svg');
    if (!file) return;

    const src  = await readFileAsText(file);
    const { w, h } = getSVGDimensions(src);
    const aspect = h / w;

    dispatch(addItem({
      type:   'svg',
      src,
      lngLat: getCenter(),
      width:  DEFAULT_WIDTH,
      height: Math.round(DEFAULT_WIDTH * aspect),
    }));
  }, [dispatch, getCenter]);

  return { openImagePicker, openSVGPicker };
}