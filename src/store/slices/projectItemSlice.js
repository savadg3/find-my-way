import { createSlice } from '@reduxjs/toolkit';
import { ProjectData } from '../../components/map/mapData';

const initialState = {
  activeTab: 'all',
  editingPinId: null,
  // projectData: ProjectData,
  projectData: null,
  pinsLoaded: false,
  allPins:{
    location:[],
    product:[],
    beacon:[],
    amenity:[],
    safety:[],
    vertical:[],
    vertical_transport:[],
  }, 
  floorList : [],
  currentFloor : null,
  selectedPin:{},
  pinCount : {
    used_locations: 0,
    used_products: 0,
    total_locations: 0,
    total_products: 0,
  }
};

const projectItemSlice = createSlice({
  name: 'map',
  initialState,
  reducers: {
    setActiveTab(state, action) {
      state.activeTab = action.payload;
    },
    setEditingPinId(state, action) {
      state.editingPinId = action.payload;
    },
    setProjectData(state, action) { 
      state.projectData = {
        ...state.projectData,
        ...action.payload
      };
    },
    setAllPins(state, action) {
      state.allPins = action.payload;
      state.pinsLoaded = true;
    },
    setPinsByCategory(state, action) { 
      Object.assign(state.allPins, action.payload); 
    },
    setPinCount(state, action) { 
      state.pinCount = action.payload;
    },
    setFloorList(state, action) {
      state.floorList = action.payload;
    },
    setCurrentFloor(state, action) {
      state.currentFloor = action.payload;
    },
    setSelectedPin(state, action) {
      // state.selectedPin = action.payload; 
      state.selectedPin = {
        ...state.selectedPin,
        ...action.payload
      };
    },
  },
});

export const {
  setActiveTab,
  setEditingPinId,
  setProjectData,
  setAllPins,
  setFloorList,
  setPinCount,
  setCurrentFloor,
  setPinsByCategory,
  setSelectedPin
} = projectItemSlice.actions;

export default projectItemSlice.reducer;
