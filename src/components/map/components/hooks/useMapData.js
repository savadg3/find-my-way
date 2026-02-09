// src/hooks/useMapData.js
import { useState, useCallback, useEffect } from 'react';

// Mock API service (replace with real API calls)
const mockApi = {
  fetchPins: async () => ({
    type: 'FeatureCollection',
    features: [
      {
        id: 'pin-1',
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [0, 0] },
        properties: { name: 'Pin 1', type: 'product' }
      }
    ]
  }),
  
  fetchBuildings: async () => ({
    type: 'FeatureCollection',
    features: [
      {
        id: 'building-1',
        type: 'Feature',
        geometry: { 
          type: 'Polygon', 
          coordinates: [[[0,0],[1,0],[1,1],[0,1],[0,0]]] 
        },
        properties: { name: 'Building 1', type: 'office' }
      }
    ]
  }),
  
  updateFeature: async (layerId, featureId, updates) => {
    console.log(`Updating ${layerId}.${featureId}:`, updates);
    return { success: true };
  }
};

export const useMapData = (projectId) => {
  const [pins, setPins] = useState(null);
  const [buildings, setBuildings] = useState(null);
  const [rooms, setRooms] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load all map data
  const loadMapData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [pinsData, buildingsData] = await Promise.all([
        mockApi.fetchPins(),
        mockApi.fetchBuildings()
      ]);
      
      setPins(pinsData);
      setBuildings(buildingsData);
      setLoading(false);
      return { pins: pinsData, buildings: buildingsData };
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  }, []);

  // Load specific layer data
  const loadLayerData = useCallback(async (layerId) => {
    setLoading(true);
    try {
      let data;
      switch (layerId) {
        case 'pins':
          data = await mockApi.fetchPins();
          setPins(data);
          break;
        case 'buildings':
          data = await mockApi.fetchBuildings();
          setBuildings(data);
          break;
        default:
          throw new Error(`Unknown layer: ${layerId}`);
      }
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update a feature
  const updateFeature = useCallback(async (layerId, featureId, updates) => {
    try {
      const result = await mockApi.updateFeature(layerId, featureId, updates);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  // Add a new feature
  const addFeature = useCallback(async (layerId, feature) => {
    // In a real app, this would call your API
    console.log(`Adding feature to ${layerId}:`, feature);
    return { success: true, id: `feature-${Date.now()}` };
  }, []);

  // Remove a feature
  const removeFeature = useCallback(async (layerId, featureId) => {
    // In a real app, this would call your API
    console.log(`Removing feature ${featureId} from ${layerId}`);
    return { success: true };
  }, []);

  // Filter features by property
  const filterFeatures = useCallback((layerId, predicate) => {
    const data = layerId === 'pins' ? pins : 
                 layerId === 'buildings' ? buildings : 
                 layerId === 'rooms' ? rooms : null;
    
    if (!data) return [];
    
    return {
      ...data,
      features: data.features.filter(predicate)
    };
  }, [pins, buildings, rooms]);

  // Get feature by ID
  const getFeature = useCallback((layerId, featureId) => {
    const data = layerId === 'pins' ? pins : 
                 layerId === 'buildings' ? buildings : 
                 layerId === 'rooms' ? rooms : null;
    
    if (!data) return null;
    
    return data.features.find(f => f.id === featureId);
  }, [pins, buildings, rooms]);

  // Load data on mount
  useEffect(() => {
    if (projectId) {
      loadMapData();
    }
  }, [projectId, loadMapData]);

  return {
    // Data
    pins,
    buildings,
    rooms,
    loading,
    error,
    
    // Actions
    loadMapData,
    loadLayerData,
    updateFeature,
    addFeature,
    removeFeature,
    filterFeatures,
    getFeature,
    
    // Helper functions
    getPinCount: () => pins?.features.length || 0,
    getBuildingCount: () => buildings?.features.length || 0,
    getRoomCount: () => rooms?.features.length || 0,
    
    // Status
    isEmpty: !pins && !buildings && !rooms
  };
};