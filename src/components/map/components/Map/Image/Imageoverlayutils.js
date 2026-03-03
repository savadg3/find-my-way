// imageOverlayUtils.js
// Coordinate math for geo-anchored image overlays.

// ── Convert pixel size → geo coordinates ─────────────────────────────────────
// Given a center lngLat and a size in metres, returns the 4 corners.
// metersPerDeg is approximate but good enough for building-scale overlays.

export const DEFAULT_METRES = 20; // default width of imported image in metres

const metersToLng = (m, lat) => m / (111320 * Math.cos((lat * Math.PI) / 180));
const metersToLat = (m)      => m / 110540;

// Build 4-corner coordinates from center + size (metres) + rotation (degrees)
export const buildCoordinates = (centerLng, centerLat, widthM, heightM, rotationDeg = 0) => {
  const hw = metersToLng(widthM  / 2, centerLat);
  const hh = metersToLat(heightM / 2);

  // Unrotated corners relative to center
  const corners = [
    [-hw, +hh],  // top-left
    [+hw, +hh],  // top-right
    [+hw, -hh],  // bottom-right
    [-hw, -hh],  // bottom-left
  ];

  const rad = (rotationDeg * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);

  return corners.map(([dx, dy]) => [
    centerLng + dx * cos - dy * sin,
    centerLat + dx * sin + dy * cos,
  ]);
};

// Get the center of a 4-corner coordinates array
export const getCenter = (coordinates) => {
  const lngs = coordinates.map((c) => c[0]);
  const lats  = coordinates.map((c) => c[1]);
  return [
    (Math.min(...lngs) + Math.max(...lngs)) / 2,
    (Math.min(...lats) + Math.max(...lats)) / 2,
  ];
};

// Get width in metres from top-left → top-right
export const getWidthMetres = (coordinates) => {
  const [lng1, lat1] = coordinates[0];
  const [lng2, lat2] = coordinates[1];
  const dx = (lng2 - lng1) * 111320 * Math.cos((lat1 * Math.PI) / 180);
  const dy = (lat2 - lat1) * 110540;
  return Math.sqrt(dx * dx + dy * dy);
};

// Translate all 4 corners by delta
export const translateCoordinates = (coordinates, dlng, dlat) =>
  coordinates.map(([lng, lat]) => [lng + dlng, lat + dlat]);

// Rotate coordinates around their center by delta degrees
export const rotateCoordinates = (coordinates, newRotationDeg, aspectRatio) => {
  const [cx, cy] = getCenter(coordinates);
  const widthM   = getWidthMetres(coordinates);
  const heightM  = widthM / aspectRatio;
  return buildCoordinates(cx, cy, widthM, heightM, newRotationDeg);
};

// Resize: keep center, update width preserving aspect ratio
export const resizeCoordinates = (coordinates, newWidthM, aspectRatio, rotationDeg) => {
  const [cx, cy] = getCenter(coordinates);
  const heightM  = newWidthM / aspectRatio;
  return buildCoordinates(cx, cy, newWidthM, heightM, rotationDeg);
};

// Convert SVG src string → data URL so MapLibre image source can load it
export const svgToDataURL = (svgText) => {
  const blob = new Blob([svgText], { type: 'image/svg+xml' });
  return URL.createObjectURL(blob);
};