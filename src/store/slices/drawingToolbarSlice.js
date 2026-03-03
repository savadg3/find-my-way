// drawingToolbarSlice.js
// Lifts DrawingToolbar's local state to Redux so DrawingManager can read it.

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  activeTool:  'pen',
  activeShape: 'freehand',
  fillColor:   '#646464',
  strokeColor: '#D3D3D3',
  strokeWidth: 3,
  fontFamily:  'Arial',
  fontSize:    14,
  bold:        false,
  textAlign:   'left',
};

const drawingToolbarSlice = createSlice({
  name: 'drawingToolbar',
  initialState,
  reducers: {
    setActiveTool(state, { payload })  { state.activeTool  = payload; },
    setActiveShape(state, { payload }) { state.activeShape = payload; },
    setFillColor(state, { payload })   { state.fillColor   = payload; },
    setStrokeColor(state, { payload }) { state.strokeColor = payload; },
    setStrokeWidth(state, { payload }) { state.strokeWidth = payload; },
    setFontFamily(state, { payload })  { state.fontFamily  = payload; },
    setFontSize(state, { payload })    { state.fontSize    = payload; },
    setBold(state, { payload })        { state.bold        = payload; },
    setTextAlign(state, { payload })   { state.textAlign   = payload; },
  },
});

export const {
  setActiveTool, setActiveShape,
  setFillColor, setStrokeColor, setStrokeWidth,
  setFontFamily, setFontSize, setBold, setTextAlign,
} = drawingToolbarSlice.actions;

export default drawingToolbarSlice.reducer;