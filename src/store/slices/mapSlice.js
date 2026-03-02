import { createSlice } from '@reduxjs/toolkit';

const initialState = { 
  mapCenter: [153.02787263735087, -27.467165333131128],
  mapContainer: null,
};

const mapSlice = createSlice({
  name: 'map',
  initialState,
  reducers: { 
    setMapCenter(state, action) {
      state.mapCenter = action.payload;
    },
    setMapContainer(state, action) { 
      state.mapContainer = action.payload;
    },
  },
});

export const { 
  setMapCenter,
  setMapContainer
} = mapSlice.actions;

export default mapSlice.reducer;
