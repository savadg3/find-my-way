// drawingUtils.js
import { v4 as uuid } from 'uuid';

export const newId = () => uuid();

// ── Default properties ────────────────────────────────────────────────────────
export const defaultProps = (overrides = {}) => ({
  strokeColor: '#1a73e8',
  strokeWidth: 2,
  fillColor:   'rgba(26,115,232,0.15)',
  opacity:     1,
  text:        '',
  fontFamily:  'Arial',
  fontSize:    14,
  bold:        false,
  textAlign:   'left',
  ...overrides,
});

// ── GeoJSON factories ─────────────────────────────────────────────────────────

export const makePolygonFeature = (coords, props = {}) => {
  const id = newId();
  return {
    type: 'Feature',
    id,                          // root-level id required for promoteId hit-test
    geometry: {
      type:        'Polygon',
      coordinates: [closeRing(coords)],
    },
    properties: defaultProps({ shapeType: 'freehand', id, ...props }),
  };
};

export const makeRectFeature = ([lng1, lat1], [lng2, lat2], props = {}) => {
  const coords = [
    [lng1, lat1], [lng2, lat1],
    [lng2, lat2], [lng1, lat2],
  ];
  return makePolygonFeature(coords, { shapeType: 'rect', ...props });
};

export const makeCircleFeature = (center, radiusInDeg, props = {}, steps = 64) => {
  const [cx, cy] = center;
  const coords = Array.from({ length: steps }, (_, i) => {
    const angle = (i / steps) * 2 * Math.PI;
    return [cx + radiusInDeg * Math.cos(angle), cy + radiusInDeg * Math.sin(angle)];
  });
  return makePolygonFeature(coords, { shapeType: 'circle', ...props });
};

export const makeTextFeature = ([lng, lat], text, props = {}) => {
  const id = newId();
  return {
    type: 'Feature',
    id,
    geometry: { type: 'Point', coordinates: [lng, lat] },
    properties: defaultProps({ shapeType: 'text', id, text, ...props }),
  };
};

// ── Geodesic distance in metres (Haversine) ───────────────────────────────────
const R = 6371000; // Earth radius in metres

export const haversineMetres = ([lng1, lat1], [lng2, lat2]) => {
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat  = toRad(lat2 - lat1);
  const dLng  = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// ── Derive vertex + edge annotation features from a polygon ──────────────────

// Returns vertex Point features (blue dots on corners)
export const makeVertexFeatures = (feature) => {
  const { id, geometry, properties } = feature;
  if (geometry.type !== 'Polygon') return [];

  const ring = geometry.coordinates[0];
  // Exclude the closing duplicate vertex
  return ring.slice(0, -1).map((coord, i) => ({
    type: 'Feature',
    id:   `${id}-v${i}`,
    geometry: { type: 'Point', coordinates: coord },
    properties: {
      parentId:   id,
      vertexIndex: i,
      selected:   properties.selected || false,
    },
  }));
};

// Returns midpoint Point features carrying edge length label
export const makeEdgeLabelFeatures = (feature) => {
  const { id, geometry, properties } = feature;
  if (geometry.type !== 'Polygon') return [];

  const ring = geometry.coordinates[0];
  const edges = [];

  for (let i = 0; i < ring.length - 1; i++) {
    const a   = ring[i];
    const b   = ring[i + 1];
    const mid = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    const m   = haversineMetres(a, b);
    const label = m >= 1000
      ? `${(m / 1000).toFixed(2)} km`
      : `${m.toFixed(2)} m`;

    edges.push({
      type: 'Feature',
      id:   `${id}-e${i}`,
      geometry: { type: 'Point', coordinates: mid },
      properties: {
        parentId:  id,
        edgeIndex: i,
        label,
        selected:  properties.selected || false,
      },
    });
  }

  return edges;
};

// ── Preview GeoJSON ───────────────────────────────────────────────────────────
export const buildPreviewGeoJSON = (inProgress, mousePos) => {
  if (!inProgress) return emptyCollection();
  const { shapeType, coords } = inProgress;

  if (shapeType === 'freehand') {
    if (coords.length === 0) return emptyCollection();
    const line = [...coords, mousePos].filter(Boolean);

    const features = [
      {
        type: 'Feature',
        geometry: { type: 'LineString', coordinates: line },
        properties: { preview: true },
      },
    ];

    // Closing hint line
    if (coords.length > 1 && mousePos) {
      features.push({
        type: 'Feature',
        geometry: { type: 'LineString', coordinates: [mousePos, coords[0]] },
        properties: { preview: true, closing: true },
      });
    }

    // Vertex dots while drawing
    coords.forEach((c, i) => {
      features.push({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: c },
        properties: { preview: true, vertexPreview: true, isFirst: i === 0 },
      });
    });

    // Edge length labels while drawing
    for (let i = 0; i < coords.length - 1; i++) {
      const a   = coords[i];
      const b   = coords[i + 1];
      const mid = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
      const m   = haversineMetres(a, b);
      const label = m >= 1000 ? `${(m / 1000).toFixed(2)} km` : `${m.toFixed(2)} m`;
      features.push({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: mid },
        properties: { preview: true, edgeLabel: true, label },
      });
    }

    // Live edge from last vertex to mouse
    if (coords.length > 0 && mousePos) {
      const a   = coords[coords.length - 1];
      const mid = [(a[0] + mousePos[0]) / 2, (a[1] + mousePos[1]) / 2];
      const m   = haversineMetres(a, mousePos);
      const label = m >= 1000 ? `${(m / 1000).toFixed(2)} km` : `${m.toFixed(2)} m`;
      features.push({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: mid },
        properties: { preview: true, edgeLabel: true, label, live: true },
      });
    }

    return { type: 'FeatureCollection', features };
  }

  if (shapeType === 'rect' && coords.length === 1 && mousePos) {
    const [lng1, lat1] = coords[0];
    const [lng2, lat2] = mousePos;
    return {
      type: 'FeatureCollection',
      features: [{
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [closeRing([[lng1,lat1],[lng2,lat1],[lng2,lat2],[lng1,lat2]])],
        },
        properties: { preview: true },
      }],
    };
  }

  if (shapeType === 'circle' && coords.length === 1 && mousePos) {
    const radius  = distance(coords[0], mousePos);
    const feature = makeCircleFeature(coords[0], radius, {});
    feature.properties.preview = true;
    return { type: 'FeatureCollection', features: [feature] };
  }

  return emptyCollection();
};

// ── Translation ───────────────────────────────────────────────────────────────
export const translateGeometry = (geometry, dlng, dlat) => {
  const t = ([lng, lat]) => [lng + dlng, lat + dlat];
  if (geometry.type === 'Point')
    return { ...geometry, coordinates: t(geometry.coordinates) };
  if (geometry.type === 'LineString')
    return { ...geometry, coordinates: geometry.coordinates.map(t) };
  if (geometry.type === 'Polygon')
    return { ...geometry, coordinates: geometry.coordinates.map((r) => r.map(t)) };
  return geometry;
};

// ── Helpers ───────────────────────────────────────────────────────────────────
export const closeRing = (coords) => {
  if (coords.length < 2) return coords;
  const [fx, fy] = coords[0];
  const [lx, ly] = coords[coords.length - 1];
  if (fx === lx && fy === ly) return coords;
  return [...coords, coords[0]];
};

export const distance = ([x1, y1], [x2, y2]) =>
  Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);

export const emptyCollection = () => ({ type: 'FeatureCollection', features: [] });

// ── Snap-to-start: pixel-based, zoom-independent ─────────────────────────────
// A fixed degree threshold (old approach) breaks at high zoom levels because
// the entire visible area may span only a few hundredths of a degree — making
// all 3 early clicks appear "close" to the start in geographic space.
// Comparing screen-pixel distance instead keeps the snap zone a constant size
// regardless of zoom level.
export const SNAP_THRESHOLD_PX = 12; // pixels — comfortable click target

export const isNearStart = (map, point, start) => {
  if (!start || !map) return false;
  const ps = map.project(start);
  const pp = map.project(point);
  const dx = pp.x - ps.x;
  const dy = pp.y - ps.y;
  return Math.sqrt(dx * dx + dy * dy) < SNAP_THRESHOLD_PX;
};

// Convert shapes[] → FeatureCollection including vertex + edge annotation features
export const shapesToGeoJSON = (shapes, selectedIds = []) => {
  const features = [];

  shapes.forEach((s) => {
    const withSelected = {
      ...s,
      properties: { ...s.properties, selected: selectedIds.includes(s.id) },
    };
    features.push(withSelected);

    // Add vertex dots and edge labels for polygons — but NOT for circles.
    // Circles are 64-sided polygon approximations, so showing all 64 vertex
    // handles and 64 edge-length labels is noisy and unhelpful.
    const isCircle = s.properties?.shapeType === 'circle';
    if (s.geometry.type === 'Polygon' && !isCircle) {
      features.push(...makeVertexFeatures(withSelected));
      features.push(...makeEdgeLabelFeatures(withSelected));
    }
  });

  return { type: 'FeatureCollection', features };
};