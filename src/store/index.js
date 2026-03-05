import { configureStore } from '@reduxjs/toolkit';
import mapReducer from './slices/mapSlice';
import apiReducer from './slices/projectItemSlice';
import verticalReducer from './slices/verticalPlacementSlice';
import drawingToolbarReducer from './slices/drawingToolbarSlice';
import drawingReducer from './slices/drawingSlice';
import imageOverlayReducer from './slices/imageOverlaySlice';
import navigationReducer from './slices/navigationSlice';


export const store = configureStore({
  reducer: {
    map: mapReducer,
    api: apiReducer,
    vertical: verticalReducer,
    drawingToolbar: drawingToolbarReducer,
    drawing: drawingReducer,
    imageOverlay: imageOverlayReducer,
    navigation: navigationReducer,
  },
});

