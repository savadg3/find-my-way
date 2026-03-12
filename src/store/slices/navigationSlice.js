import { createSlice } from '@reduxjs/toolkit';
import { v4 as uuid } from 'uuid';

const initialState = {
  paths:           [], 
  activeTool:      null, 
  activePath:      'main', 
  selectedPathId:  null,
  selectedPointId: null,
  inProgress:      null, 
  shortestPath:    null,
  saveStatus:      'idle', 
};

const navigationSlice = createSlice({
  name: 'navigation',
  initialState,
  reducers: { 
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
 
    setInProgress(state, { payload }) {
      state.inProgress = payload;
    },
    clearInProgress(state) {
      state.inProgress = null;
    },
 
    addPath(state, { payload }) {  
      state.paths.push({ id: uuid(), ...payload });
      state.inProgress = null;
    },
 
    updatePoint(state, { payload: { pathId, pointId, position, snapT } }) {
      const path = state.paths.find((p) => p.id === pathId);
      if (!path) return;
      const pt = path.points.find((p) => p.id === pointId);
      if (!pt) return;
      pt.position = position;
      if (snapT !== undefined) pt.snapT = snapT;
 
    },
 
    updatePathPoints(state, { payload: { pathId, points } }) {
      const path = state.paths.find((p) => p.id === pathId);
      if (path) path.points = points;
    },
 
    updateSnapPoint(state, { payload: { pathId, pointId, position, snapT, snapPathId } }) {
      const path = state.paths.find((p) => p.id === pathId);
      if (!path) return;
      const pt = path.points.find((p) => p.id === pointId);
      if (!pt) return;
      pt.position = position;
      pt.snapT    = snapT;
      if (snapPathId !== undefined) pt.snapPathId = snapPathId;
    },
 
    removePath(state, { payload: pathId }) {
      state.paths = state.paths.filter((p) => p.id !== pathId);
      if (state.selectedPathId === pathId) {
        state.selectedPathId  = null;
        state.selectedPointId = null;
      }
    },
 
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
 
    bulkAddPaths(state, { payload: paths }) {
      state.paths.push(...paths);
    },
 
    insertPointAtIndex(state, { payload: { pathId, index, point } }) {
      const path = state.paths.find((p) => p.id === pathId);
      if (!path) return;
      path.points.splice(index, 0, point);
    },
 
    updatePinConnectedPoints(state, { payload: { pinId, position } }) {
      state.paths.forEach((path) => {
        path.points.forEach((pt) => {
          if (pt.pinId === pinId) pt.position = position;
        });
      });
    },
 
    setAllPaths(state, { payload: paths }) {
      state.paths = paths;
    },
 
    clearAllNavPaths(state) {
      state.paths      = [];
      state.inProgress = null;
      state.selectedPathId  = null;
      state.selectedPointId = null;
    },
 
    setShortestPath(state, { payload }) {
      state.shortestPath = payload;
    },
    clearShortestPath(state) {
      state.shortestPath = null;
    },
 
    setSaveStatus(state, { payload }) {
      state.saveStatus = payload;
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
  setAllPaths,
  clearAllNavPaths,
  setShortestPath,
  clearShortestPath,
  setSaveStatus,
} = navigationSlice.actions;

export default navigationSlice.reducer;
