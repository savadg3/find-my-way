import { createSlice } from '@reduxjs/toolkit'; 

const initialState = {
  isConnectionEnabled: false,
  placedLocation: null,
  dummyVerticalItem:{}
};

const verticalPlacementSlice = createSlice({
  name: 'verticalPlacement',
  initialState,
  reducers: {
    setIsConnectionEnabled(state, action) { 
      state.isConnectionEnabled = action.payload;
    },
    setPlacedLocation(state, action) {
      state.placedLocation = action.payload;
    },
    setDummyVerticalItem(state, action) {
      state.placedLocation = action.payload;
    },
  },
});

export const {
  setIsConnectionEnabled,
  setPlacedLocation,
  setDummyVerticalItem
} = verticalPlacementSlice.actions;

export default verticalPlacementSlice.reducer;
