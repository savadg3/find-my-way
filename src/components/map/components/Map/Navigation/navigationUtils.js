// navigationUtils.js
// Pure math utilities for the navigation path system.
// No React/Redux — safe to call from anywhere.

import { v4 as uuid } from 'uuid';

// ── Geodesic distance (Haversine) in metres ───────────────────────────────────
const R = 6371000;
export const haversineM = ([lng1, lat1], [lng2, lat2]) => {
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// ── 2-D Euclidean distance between two pixel {x,y} points ────────────────────
export const dist2D = (a, b) =>
  Math.sqrt((b.x - a.x) ** 2 + (b.y - a.y) ** 2);

// ── Nearest point on a 2-D segment a→b to point p ────────────────────────────
// Returns { point:{x,y}, t:[0,1] fraction, dist:px }
export const nearestOnSeg2D = (p, a, b) => {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return { point: a, t: 0, dist: dist2D(p, a) };
  const t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / lenSq));
  const point = { x: a.x + t * dx, y: a.y + t * dy };
  return { point, t, dist: dist2D(p, point) };
};

// ── Arc-length of a polyline (points = [[lng,lat],...]) ───────────────────────
export const polylineLength = (positions) => {
  let len = 0;
  for (let i = 0; i < positions.length - 1; i++) {
    len += haversineM(positions[i], positions[i + 1]);
  }
  return len;
};

// ── Get [lng,lat] at fractional arc-length t ∈ [0,1] along a polyline ────────
export const getPositionAtT = (positions, t) => {
  if (!positions || positions.length === 0) return null;
  if (positions.length === 1) return positions[0];
  if (t <= 0) return positions[0];
  if (t >= 1) return positions[positions.length - 1];

  const segs = [];
  let total = 0;
  for (let i = 0; i < positions.length - 1; i++) {
    const d = haversineM(positions[i], positions[i + 1]);
    segs.push(d);
    total += d;
  }
  if (total === 0) return positions[0];

  const target = t * total;
  let acc = 0;
  for (let i = 0; i < segs.length; i++) {
    if (acc + segs[i] >= target) {
      const frac = segs[i] === 0 ? 0 : (target - acc) / segs[i];
      const a = positions[i];
      const b = positions[i + 1];
      return [a[0] + frac * (b[0] - a[0]), a[1] + frac * (b[1] - a[1])];
    }
    acc += segs[i];
  }
  return positions[positions.length - 1];
};

// ── Nearest point on a polyline to a screen-space point ──────────────────────
// Returns { position:[lng,lat], t:[0,1], segIndex, distPx }
export const nearestOnPolyline2D = (screenPt, pathPoints, map) => {
  let best = { distPx: Infinity, t: 0, segIndex: 0, position: null };

  const px = pathPoints.map((pt) => map.project(pt.position));
  const segs = [];
  let total = 0;
  for (let i = 0; i < pathPoints.length - 1; i++) {
    const d = haversineM(pathPoints[i].position, pathPoints[i + 1].position);
    segs.push(d);
    total += d;
  }

  let acc = 0;
  for (let i = 0; i < px.length - 1; i++) {
    const { point, t, dist: distPx } = nearestOnSeg2D(screenPt, px[i], px[i + 1]);
    if (distPx < best.distPx) {
      // Convert pixel snap point back to lng/lat
      const lngLat = map.unproject(point);
      // Global t along the whole polyline
      const globalT = total > 0 ? (acc + t * segs[i]) / total : 0;
      best = { distPx, t: globalT, segIndex: i, position: [lngLat.lng, lngLat.lat] };
    }
    acc += segs[i];
  }

  return best;
};

// ── Snap detection ─────────────────────────────────────────────────────────────
// Returns the best snap target for a given screen position.
// Priority: pin → existing node → path segment
// Returns null if nothing within threshold.
export const findSnap = ({
  lngLat,     // [lng, lat] of the mouse / click
  map,        // MapLibre map instance
  paths,      // current paths array from Redux
  visiblePins,// visible pin objects from Redux (with enc_id, positions)
  excludePointId = null, // ignore this point (when dragging it)
  nodeThresholdPx  = 14,
  segThresholdPx   = 16,
  pinThresholdPx   = 18,
}) => {
  const screenPt = map.project(lngLat);

  // 1. Pins ─────────────────────────────────────────────────────────────────
  // Markers use anchor='center', so the stored [lng,lat] IS the visual centre
  // of the icon. No pixel offset needed — snap to the coordinate directly.
  for (const pin of (visiblePins || [])) {
    try {
      const pos = parsePinPosition(pin.positions);
      if (!pos) continue;
      const pxPin = map.project(pos);
      if (dist2D(screenPt, pxPin) <= pinThresholdPx) {
        return { type: 'pin', pinId: pin.enc_id, position: pos };
      }
    } catch { /* skip bad pin */ }
  }

  // 2. Existing nodes ────────────────────────────────────────────────────────
  for (const path of paths) {
    for (const pt of path.points) {
      if (pt.id === excludePointId) continue;
      const pxPt = map.project(pt.position);
      if (dist2D(screenPt, pxPt) <= nodeThresholdPx) {
        return { type: 'node', pathId: path.id, pointId: pt.id, position: pt.position };
      }
    }
  }

  // 3. Path segments ─────────────────────────────────────────────────────────
  let bestSeg = null;
  let bestDist = segThresholdPx;
  for (const path of paths) {
    if (path.points.length < 2) continue;
    const result = nearestOnPolyline2D(screenPt, path.points, map);
    if (result.distPx < bestDist) {
      bestDist = result.distPx;
      bestSeg = {
        type:     'segment',
        pathId:   path.id,
        pathType: path.type,
        segIndex: result.segIndex,
        t:        result.t,
        position: result.position,
      };
    }
  }
  if (bestSeg) return bestSeg;

  return null;
};

// ── Parse pin position {x,y} → [lng,lat] ─────────────────────────────────────
export const parsePinPosition = (positions) => {
  try {
    const parsed = typeof positions === 'string' ? JSON.parse(positions) : positions;
    const x = Number(parsed.x);
    const y = Number(parsed.y);
    if (isNaN(x) || isNaN(y)) return null;
    return [x, y];
  } catch {
    return null;
  }
};

// ── Build GeoJSON for rendering ───────────────────────────────────────────────
export const pathsToLinesGeoJSON = (paths, selectedPathId) => {
  const features = [];
  for (const path of paths) {
    if (path.points.length < 2) continue;
    features.push({
      type: 'Feature',
      id:   path.id,
      geometry: {
        type:        'LineString',
        coordinates: path.points.map((p) => p.position),
      },
      properties: {
        pathId:   path.id,   // explicit — hitTestPath reads this, never relies on f.id
        pathType: path.type,
        selected: path.id === selectedPathId,
      },
    });
  }
  return { type: 'FeatureCollection', features };
};

export const nodesToGeoJSON = (paths, selectedPathId, selectedPointId) => {
  const features = [];
  const seen     = new Set();

  for (const path of paths) {
    for (const pt of path.points) {
      if (seen.has(pt.id)) continue;
      seen.add(pt.id);
      features.push({
        type: 'Feature',
        id:   pt.id,
        geometry: { type: 'Point', coordinates: pt.position },
        properties: {
          pointId:     pt.id,        // explicit — hitTestNode reads this, never relies on f.id
          pathId:      path.id,
          pathType:    path.type,
          pinId:       pt.pinId    || null,
          isPin:       !!pt.pinId,
          isSnap:      !!pt.snapPathId,
          selected:    pt.id === selectedPointId,
          pathSelected: path.id === selectedPathId,
        },
      });
    }
  }
  return { type: 'FeatureCollection', features };
};

export const previewToGeoJSON = (inProgress, mousePos) => {
  if (!inProgress || inProgress.points.length === 0) return emptyCol();

  const pathType = inProgress.type;
  const features = [];

  // ── Preview line (includes live mouse position) ──
  const lineCoords = [...inProgress.points.map((p) => p.position)];
  if (mousePos) lineCoords.push(mousePos);
  if (lineCoords.length >= 2) {
    features.push({
      type: 'Feature',
      geometry: { type: 'LineString', coordinates: lineCoords },
      properties: { pathType },
    });
  }

  // ── A dot at every committed click point ──
  for (const pt of inProgress.points) {
    features.push({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: pt.position },
      properties: { pathType },
    });
  }

  return { type: 'FeatureCollection', features };
};

export const emptyCol = () => ({ type: 'FeatureCollection', features: [] });

// ── Decompose a global arc-length fraction into { segIndex, localT } ─────────
// segIndex = which segment [i, i+1] this fraction falls on (0-based)
// localT   = 0..1 fraction within that segment
// Use the OLD path shape to decompose — then reAnchorSnapPoint re-applies the
// same (segIndex, localT) to the NEW shape, keeping anchors on unchanged
// segments perfectly still.
export const decomposeSnapT = (pathPoints, globalT) => {
  if (!pathPoints || pathPoints.length < 2) return { segIndex: 0, localT: 0 };
  const segs = [];
  let total = 0;
  for (let i = 0; i < pathPoints.length - 1; i++) {
    const d = haversineM(pathPoints[i].position, pathPoints[i + 1].position);
    segs.push(d);
    total += d;
  }
  if (total === 0) return { segIndex: 0, localT: 0 };
  const target = Math.max(0, Math.min(total, globalT * total));
  let acc = 0;
  for (let i = 0; i < segs.length; i++) {
    const end = acc + segs[i];
    if (target <= end || i === segs.length - 1) {
      const localT = segs[i] > 0 ? (target - acc) / segs[i] : 0;
      return { segIndex: i, localT: Math.max(0, Math.min(1, localT)) };
    }
    acc = end;
  }
  return { segIndex: segs.length - 1, localT: 1 };
};

// ── Re-anchor a snap point to (segIndex, localSegT) on a (re)shaped path ─────
// Returns { position:[lng,lat], snapT:number } or null if the segment is missing.
// For anchors on unchanged segments: position is identical to before (lerp of
// same two unmoved endpoints), so they stay visually still even though all
// floating anchors are processed through this function.
export const reAnchorSnapPoint = (newPathPoints, segIndex, localSegT) => {
  const a = newPathPoints[segIndex]?.position;
  const b = newPathPoints[segIndex + 1]?.position;
  if (!a || !b) return null;
  const newPos = [
    a[0] + localSegT * (b[0] - a[0]),
    a[1] + localSegT * (b[1] - a[1]),
  ];
  // Recompute global snapT so Dijkstra virtual-edge computation stays accurate
  const segs = [];
  let total = 0;
  for (let i = 0; i < newPathPoints.length - 1; i++) {
    const d = haversineM(newPathPoints[i].position, newPathPoints[i + 1].position);
    segs.push(d);
    total += d;
  }
  if (total === 0) return { position: newPos, snapT: 0 };
  let acc = 0;
  for (let i = 0; i < segIndex; i++) acc += segs[i];
  const snapT = (acc + localSegT * (segs[segIndex] || 0)) / total;
  return { position: newPos, snapT };
};

// ── New Point factory ─────────────────────────────────────────────────────────
export const makePoint = (position, extra = {}) => ({
  id: uuid(),
  position,
  pinId:      null,
  snapPathId: null,
  snapT:      null,
  ...extra,
});

// ── Build graph for Dijkstra ──────────────────────────────────────────────────
// Returns { nodes: { id: [lng,lat] }, adj: { id: [{ to, weight }] } }
export const buildNavGraph = (paths) => {
  const nodes = {}; // id → [lng,lat]
  const adj   = {}; // id → [{to, weight}]

  const ensureNode = (id, pos) => {
    if (!nodes[id]) {
      nodes[id] = pos;
      adj[id]   = [];
    }
  };
  const addEdge = (a, b, w) => {
    adj[a].push({ to: b, weight: w });
    adj[b].push({ to: a, weight: w });
  };

  // 1. Register all nodes and path edges
  for (const path of paths) {
    for (const pt of path.points) {
      ensureNode(pt.id, pt.position);
    }
    for (let i = 0; i < path.points.length - 1; i++) {
      const a = path.points[i];
      const b = path.points[i + 1];
      const w = haversineM(a.position, b.position);
      addEdge(a.id, b.id, w);
    }
  }

  // 2. Connect snap endpoints to the main path segment endpoints
  // When a sub-path endpoint has snapPathId/snapT, create virtual edges to
  // the surrounding main-path nodes (the actual traversable connections).
  for (const path of paths) {
    for (const pt of path.points) {
      if (!pt.snapPathId) continue;
      const hostPath = paths.find((p) => p.id === pt.snapPathId);
      if (!hostPath || hostPath.points.length < 2) continue;

      // Find which segment this t falls on
      const positions = hostPath.points.map((p) => p.position);
      const segs = [];
      let total = 0;
      for (let i = 0; i < positions.length - 1; i++) {
        const d = haversineM(positions[i], positions[i + 1]);
        segs.push(d);
        total += d;
      }
      const target = pt.snapT * total;
      let acc = 0;
      let segIdx = 0;
      for (let i = 0; i < segs.length; i++) {
        if (acc + segs[i] >= target) { segIdx = i; break; }
        acc += segs[i];
      }

      const nodeA = hostPath.points[segIdx];
      const nodeB = hostPath.points[segIdx + 1];
      if (!nodeA || !nodeB) continue;

      const dA = haversineM(pt.position, nodeA.position);
      const dB = haversineM(pt.position, nodeB.position);
      ensureNode(pt.id, pt.position);
      addEdge(pt.id, nodeA.id, dA);
      addEdge(pt.id, nodeB.id, dB);
    }
  }

  return { nodes, adj };
};

// ── Dijkstra ──────────────────────────────────────────────────────────────────
// Returns { distanceM, nodeIds } or null if no path found.
export const dijkstra = (nodes, adj, startId, endId) => {
  if (!nodes[startId] || !nodes[endId]) return null;
  if (startId === endId) return { distanceM: 0, nodeIds: [startId] };

  const dist = {};
  const prev = {};
  const visited = new Set();
  Object.keys(nodes).forEach((id) => { dist[id] = Infinity; });
  dist[startId] = 0;

  // MinHeap via sorted array (fine for small graphs < 10k nodes)
  const pq = [{ id: startId, d: 0 }];

  while (pq.length > 0) {
    pq.sort((a, b) => a.d - b.d);
    const { id: u } = pq.shift();
    if (visited.has(u)) continue;
    visited.add(u);
    if (u === endId) break;

    for (const { to, weight } of (adj[u] || [])) {
      if (visited.has(to)) continue;
      const nd = dist[u] + weight;
      if (nd < dist[to]) {
        dist[to] = nd;
        prev[to]  = u;
        pq.push({ id: to, d: nd });
      }
    }
  }

  if (!isFinite(dist[endId])) return null;

  const nodeIds = [];
  let cur = endId;
  while (cur !== undefined) { nodeIds.unshift(cur); cur = prev[cur]; }

  return { distanceM: dist[endId], nodeIds };
};

// ── Find node ID for a pin (its first path endpoint matching pinId) ────────────
export const findPinNodeId = (paths, pinId) => {
  for (const path of paths) {
    for (const pt of path.points) {
      if (pt.pinId === pinId) return pt.id;
    }
  }
  return null;
};

// ── Auto-generate sub paths ───────────────────────────────────────────────────
// For each pin that has no sub-path endpoint yet, find the nearest main-path
// segment and create a sub-path identical to one drawn manually (pen tool
// sub→main snap): a floating yellow anchor with snapPathId + snapT.
// The main path is NOT modified — buildNavGraph handles connectivity via snapT.
//
// Returns { newSubPaths }
// Caller dispatches bulkAddPaths(newSubPaths).
// Main paths are NOT modified — graph connectivity is handled by buildNavGraph
// via snapPathId/snapT on the sub-path endpoint, exactly like manual drawing.
export const autoGenerateSubPaths = (paths, visiblePins, map) => {
  const mainPaths = paths.filter((p) => p.type === 'main');
  if (mainPaths.length === 0) return { newSubPaths: [] };

  const newSubPaths = [];

  for (const pin of visiblePins) {
    const pinId = pin.enc_id;

    // Skip if already connected — covers both cases:
    //  • a sub-path whose endpoint anchors this pin
    //  • a main-path that was drawn directly through this pin
    const alreadyConnected = paths.some(
      (p) => p.points.some((pt) => pt.pinId === pinId)
    );
    if (alreadyConnected) continue;

    const pinPos = parsePinPosition(pin.positions);
    if (!pinPos) continue;

    // Markers use anchor='center', so pinPos IS the visual centre of the icon.
    // Find the nearest point on any main path in screen space.
    let best = null;
    let bestDistPx = Infinity;
    const screenPin = map.project(pinPos);

    for (const mp of mainPaths) {
      if (mp.points.length < 2) continue;
      const pxPoints = mp.points.map((pt) => map.project(pt.position));

      // Arc-length totals for global-T calculation
      let acc = 0;
      const segs = [];
      let total = 0;
      for (let i = 0; i < mp.points.length - 1; i++) {
        const d = haversineM(mp.points[i].position, mp.points[i + 1].position);
        segs.push(d);
        total += d;
      }

      for (let i = 0; i < pxPoints.length - 1; i++) {
        const { point, t: segT, dist: dPx } = nearestOnSeg2D(
          screenPin, pxPoints[i], pxPoints[i + 1]
        );
        if (dPx < bestDistPx) {
          bestDistPx = dPx;
          const lngLat  = map.unproject(point);
          const globalT = total > 0 ? (acc + segT * segs[i]) / total : 0;
          best = {
            mainPathId: mp.id,
            globalT,
            snapPos: [lngLat.lng, lngLat.lat],
          };
        }
        acc += segs[i];
      }
    }

    if (!best) continue;

    // Build the sub-path identically to a manually drawn sub→main snap:
    //   point[0] — pin anchor  (pinId links it to the map marker)
    //   point[1] — floating yellow anchor on the main path
    //              (snapPathId + snapT → buildNavGraph creates the virtual edge;
    //               isSnap = !!snapPathId → nodesToGeoJSON renders it yellow)
    // The main path is NOT modified; no shared UUID trick needed.
    newSubPaths.push({
      id:   uuid(),
      type: 'sub',
      points: [
        makePoint(pinPos,       { pinId }),
        makePoint(best.snapPos, { snapPathId: best.mainPathId, snapT: best.globalT }),
      ],
    });
  }

  return { newSubPaths };
};
