// imageOverlaySlice.js
// Stores images/SVGs placed on the map as HTML marker overlays.

import { createSlice } from '@reduxjs/toolkit';
import { v4 as uuid } from 'uuid';

// Each item shape:
// {
//   id:        string,
//   type:      'image' | 'svg',
//   src:       string,          // data URL (base64) or SVG markup string
//   lngLat:    [lng, lat],      // anchor position on map
//   width:     number,          // px at zoom=0 reference — we store metres equivalent
//   height:    number,
//   rotation:  number,          // degrees
//   selected:  boolean,
// }

const initialState = {
  items:      [],
  selectedId: null,
};

const imageOverlaySlice = createSlice({
  name: 'imageOverlay',
  initialState,
  reducers: {
    addItem(state, { payload }) {
      state.items.push({ rotation: 0, selected: false, ...payload, id: uuid() });
    },
    updateItem(state, { payload }) {
      const idx = state.items.findIndex((i) => i.id === payload.id);
      if (idx !== -1) state.items[idx] = { ...state.items[idx], ...payload };
    },
    removeItem(state, { payload }) {
      state.items      = state.items.filter((i) => i.id !== payload);
      if (state.selectedId === payload) state.selectedId = null;
    },
    selectItem(state, { payload }) {
      state.items      = state.items.map((i) => ({ ...i, selected: i.id === payload }));
      state.selectedId = payload;
    },
    clearItemSelection(state) {
      state.items      = state.items.map((i) => ({ ...i, selected: false }));
      state.selectedId = null;
    },
  },
});

export const { addItem, updateItem, removeItem, selectItem, clearItemSelection } =
  imageOverlaySlice.actions;
export default imageOverlaySlice.reducer;