// imageOverlaySlice.js
import { createSlice } from '@reduxjs/toolkit';
import { v4 as uuid } from 'uuid';

// Each item:
// {
//   id:          string,
//   type:        'image' | 'svg',
//   src:         string,       // base64 data URL (image) or blob URL (svg)
//   coordinates: [             // 4 corners in lngLat — MapLibre image source format
//     [lng, lat],  // top-left
//     [lng, lat],  // top-right
//     [lng, lat],  // bottom-right
//     [lng, lat],  // bottom-left
//   ],
//   rotation:    number,       // degrees — applied by rotating the coordinates
//   selected:    boolean,
//   aspectRatio: number,       // w/h — preserved during resize
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
      state.items     = state.items.filter((i) => i.id !== payload);
      if (state.selectedId === payload) state.selectedId = null;
    },
    selectItem(state, { payload }) {
      state.items     = state.items.map((i) => ({ ...i, selected: i.id === payload }));
      state.selectedId = payload;
    },
    clearItemSelection(state) {
      state.items     = state.items.map((i) => ({ ...i, selected: false }));
      state.selectedId = null;
    },
  },
});

export const { addItem, updateItem, removeItem, selectItem, clearItemSelection } =
  imageOverlaySlice.actions;
export default imageOverlaySlice.reducer;