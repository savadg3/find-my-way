import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  shapes: [],           // GeoJSON Feature[]
  selectedIds: [],      // string[]  — multi-select
  inProgress: null,     // partial shape being drawn (vertices so far)
};

const drawingSlice = createSlice({
  name: 'drawing',
  initialState,
  reducers: {
    // ── Shape CRUD ──────────────────────────────────────────────
    addShape(state, { payload }) {
      // payload: full GeoJSON Feature with id + properties
      state.shapes.push(payload);
    },

    updateShape(state, { payload }) {
      // payload: { id, ...fields to merge into properties or geometry }
      const idx = state.shapes.findIndex((s) => s.id === payload.id);
      if (idx === -1) return;
      const shape = state.shapes[idx];
      // allow updating geometry (e.g. after drag-move)
      if (payload.geometry) shape.geometry = payload.geometry;
      // merge any property overrides (color, stroke, text, etc.)
      if (payload.properties)
        shape.properties = { ...shape.properties, ...payload.properties };
    },

    removeShapes(state, { payload }) {
      // payload: string | string[]
      const ids = Array.isArray(payload) ? payload : [payload];
      state.shapes = state.shapes.filter((s) => !ids.includes(s.id));
      state.selectedIds = state.selectedIds.filter((id) => !ids.includes(id));
    },

    clearAllShapes(state) {
      state.shapes      = [];
      state.selectedIds = [];
      state.inProgress  = null;
    },

    // ── Selection ────────────────────────────────────────────────
    setSelectedIds(state, { payload }) {
      // payload: string[]
      state.selectedIds = payload;
    },

    toggleSelectedId(state, { payload }) {
      // payload: string
      const exists = state.selectedIds.includes(payload);
      state.selectedIds = exists
        ? state.selectedIds.filter((id) => id !== payload)
        : [...state.selectedIds, payload];
    },

    clearSelection(state) {
      state.selectedIds = [];
    },

    // ── Batch-update selected shapes (stroke / fill while selected) ──
    updateSelectedShapes(state, { payload }) {
      // payload: Partial<properties>  e.g. { strokeColor, strokeWidth }
      state.shapes = state.shapes.map((s) =>
        state.selectedIds.includes(s.id)
          ? { ...s, properties: { ...s.properties, ...payload } }
          : s
      );
    },

    // ── In-progress (preview vertices while polygon is being drawn) ──
    setInProgress(state, { payload }) {
      state.inProgress = payload; // null | { shapeType, coords: [lng,lat][] }
    },

    clearInProgress(state) {
      state.inProgress = null;
    },
  },
});

export const {
  addShape,
  updateShape,
  removeShapes,
  clearAllShapes,
  setSelectedIds,
  toggleSelectedId,
  clearSelection,
  updateSelectedShapes,
  setInProgress,
  clearInProgress,
} = drawingSlice.actions;

export default drawingSlice.reducer;