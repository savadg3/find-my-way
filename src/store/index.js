import { configureStore } from '@reduxjs/toolkit';
import mapReducer from './slices/mapSlice';
import apiReducer from './slices/projectItemSlice';
import verticalReducer from './slices/verticalPlacementSlice';

export const store = configureStore({
  reducer: {
    map: mapReducer,
    api: apiReducer,
    vertical: verticalReducer,
  },
});

