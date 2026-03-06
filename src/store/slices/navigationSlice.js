// navigationSlice.js
// State for the navigation path drawing system.
import { createSlice } from '@reduxjs/toolkit';
import { v4 as uuid } from 'uuid';

// ── Shape of a Point ──────────────────────────────────────────────────────────
// {
//   id:         string,
//   position:   [lng, lat],
//   pinId:      string | null,   // anchored to a map marker
//   snapPathId: string | null,   // sub-path endpoint riding on a main path
//   snapT:      number | null,   // 0..1 arc-length fraction along snapPathId
// }

// ── Shape of a Path ───────────────────────────────────────────────────────────
// {
//   id:     string,
//   type:   'main' | 'sub',
//   points: Point[],
// }

const initialState = {
  paths:           [],      // Path[]
  activeTool:      null,    // 'pen' | 'select' | null
  activePath:      'main',  // 'main' | 'sub'
  selectedPathId:  null,
  selectedPointId: null,
  inProgress:      null,    // { type, points: Point[] } while drawing
  // Shortest-path result — set by findPath, cleared on unmount / new selection
  // { positions: [[lng,lat],...], distanceM: number } | null
  shortestPath:    null,
};

const navigationSlice = createSlice({
  name: 'navigation',
  initialState,
  reducers: {
    // ── Tool controls ──────────────────────────────────────────────────
    setNavActiveTool(state, { payload }) {
      state.activeTool     = payload;
      state.inProgress     = null;
      state.selectedPathId  = null;
      state.selectedPointId = null;
    },
    setNavActivePath(state, { payload }) {
      state.activePath = payload;
      state.inProgress = null;
    },

    // ── In-progress drawing ───────────────────────────────────────────
    setInProgress(state, { payload }) {
      state.inProgress = payload;
    },
    clearInProgress(state) {
      state.inProgress = null;
    },

    // ── Commit a completed path ────────────────────────────────────────
    addPath(state, { payload }) {
      // payload: { type, points }
      state.paths.push({ id: uuid(), ...payload });
      state.inProgress = null;
    },

    // ── Update a single point's position (drag / slide) ───────────────
    updatePoint(state, { payload: { pathId, pointId, position, snapT } }) {
      const path = state.paths.find((p) => p.id === pathId);
      if (!path) return;
      const pt = path.points.find((p) => p.id === pointId);
      if (!pt) return;
      pt.position = position;
      if (snapT !== undefined) pt.snapT = snapT;

      // Cascade: update any sub-path endpoint snapped to this path
      // (only when the host path moves, sub-path endpoints recompute in the hook)
    },

    // ── Bulk update path points (used after cascade recompute) ────────
    updatePathPoints(state, { payload: { pathId, points } }) {
      const path = state.paths.find((p) => p.id === pathId);
      if (path) path.points = points;
    },

    // ── Update a snap endpoint's position + snapT + snapPathId (slide) ──
    updateSnapPoint(state, { payload: { pathId, pointId, position, snapT, snapPathId } }) {
      const path = state.paths.find((p) => p.id === pathId);
      if (!path) return;
      const pt = path.points.find((p) => p.id === pointId);
      if (!pt) return;
      pt.position = position;
      pt.snapT    = snapT;
      if (snapPathId !== undefined) pt.snapPathId = snapPathId;
    },

    // ── Delete a path ──────────────────────────────────────────────────
    removePath(state, { payload: pathId }) {
      state.paths = state.paths.filter((p) => p.id !== pathId);
      if (state.selectedPathId === pathId) {
        state.selectedPathId  = null;
        state.selectedPointId = null;
      }
    },

    // ── Remove a single point from a path ─────────────────────────────
    // If the path drops below 2 points it is deleted entirely.
    removePointFromPath(state, { payload: { pathId, pointId } }) {
      const path = state.paths.find((p) => p.id === pathId);
      if (!path) return;
      path.points = path.points.filter((pt) => pt.id !== pointId);
      if (path.points.length < 2) {
        state.paths = state.paths.filter((p) => p.id !== pathId);
        if (state.selectedPathId === pathId) {
          state.selectedPathId  = null;
          state.selectedPointId = null;
        }
      }
    },

    // ── Selection ─────────────────────────────────────────────────────
    selectPath(state, { payload: pathId }) {
      state.selectedPathId  = pathId;
      state.selectedPointId = null;
    },
    selectPoint(state, { payload: { pathId, pointId } }) {
      state.selectedPathId  = pathId;
      state.selectedPointId = pointId;
    },
    clearNavSelection(state) {
      state.selectedPathId  = null;
      state.selectedPointId = null;
    },

    // ── Auto-generate inserts paths built by the hook ─────────────────
    bulkAddPaths(state, { payload: paths }) {
      state.paths.push(...paths);
    },

    // ── Insert a node into an existing path at a specific index ───────
    insertPointAtIndex(state, { payload: { pathId, index, point } }) {
      const path = state.paths.find((p) => p.id === pathId);
      if (!path) return;
      path.points.splice(index, 0, point);
    },

    // ── Update pin-connected points when a pin moves ──────────────────
    updatePinConnectedPoints(state, { payload: { pinId, position } }) {
      state.paths.forEach((path) => {
        path.points.forEach((pt) => {
          if (pt.pinId === pinId) pt.position = position;
        });
      });
    },

    // ── Clear all navigation paths ────────────────────────────────────
    clearAllNavPaths(state) {
      state.paths      = [];
      state.inProgress = null;
      state.selectedPathId  = null;
      state.selectedPointId = null;
    },

    // ── Shortest-path result ──────────────────────────────────────────
    // payload: { positions: [[lng,lat],...], distanceM: number }
    setShortestPath(state, { payload }) {
      state.shortestPath = payload;
    },
    clearShortestPath(state) {
      state.shortestPath = null;
    },
  },
});

export const {
  setNavActiveTool,
  setNavActivePath,
  setInProgress,
  clearInProgress,
  addPath,
  updatePoint,
  updatePathPoints,
  updateSnapPoint,
  removePath,
  removePointFromPath,
  selectPath,
  selectPoint,
  clearNavSelection,
  bulkAddPaths,
  insertPointAtIndex,
  updatePinConnectedPoints,
  clearAllNavPaths,
  setShortestPath,
  clearShortestPath,
} = navigationSlice.actions;

export default navigationSlice.reducer;
