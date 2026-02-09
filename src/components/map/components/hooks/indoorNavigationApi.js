// src/services/indoorNavigationApi.js

/**
 * Indoor Navigation API Service
 * Replace these functions with actual API calls to your backend
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// ==================== PROJECT API ====================

/**
 * Fetch project data
 * @param {string} projectId - Project ID
 * @returns {Promise<Object>} Project data { projectName, location }
 */
export const getProjectData = async (projectId) => {
  try {
    // TODO: Replace with actual API call
    // const response = await fetch(`${API_BASE_URL}/projects/${projectId}`);
    // const data = await response.json();
    // return data;
    
    // Mock data for now
    return {
      projectName: "Indoor Navigation",
      location: [75.7804, 11.2588] // [longitude, latitude]
    };
  } catch (error) {
    console.error('Error fetching project data:', error);
    throw error;
  }
};

// ==================== FLOOR LIST API ====================

/**
 * Fetch list of floors for a project
 * @param {string} projectId - Project ID
 * @returns {Promise<Array>} Array of floors [{ name, id }, ...]
 */
export const getFloorList = async (projectId) => {
  try {
    // TODO: Replace with actual API call
    // const response = await fetch(`${API_BASE_URL}/projects/${projectId}/floors`);
    // const data = await response.json();
    // return data;
    
    // Mock data for now
    return [
      { name: "basement", id: 0 },
      { name: "floor 1", id: 1 },
      { name: "floor 2", id: 2 },
      { name: "floor 3", id: 3 },
    ];
  } catch (error) {
    console.error('Error fetching floor list:', error);
    throw error;
  }
};

// ==================== FLOOR DATA API ====================

/**
 * Fetch pin/location data for a specific floor
 * @param {string} projectId - Project ID
 * @param {number} floorId - Floor ID
 * @returns {Promise<Array>} Array of GeoJSON features
 */
export const getFloorData = async (projectId, floorId) => {
  try {
    // TODO: Replace with actual API call
    // const response = await fetch(`${API_BASE_URL}/projects/${projectId}/floors/${floorId}/data`);
    // const data = await response.json();
    // return data;
    
    // Mock data for now
    // Simulating API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Return mock data based on floor ID
    const mockData = generateMockFloorData(floorId);
    return mockData;
  } catch (error) {
    console.error('Error fetching floor data:', error);
    throw error;
  }
};

// ==================== HELPER: GENERATE MOCK DATA ====================

const generateMockFloorData = (floorId) => {
  // This is just for testing - remove when you have real API
  const baseCoords = [75.7804, 11.2588];
  const numPins = Math.floor(Math.random() * 5) + 3; // 3-7 pins per floor
  
  const pinTypes = [
    { type: 'workstation', icon: '💻', color: '#3b82f6' },
    { type: 'meeting_room', icon: '📊', color: '#8b5cf6' },
    { type: 'restroom', icon: '🚻', color: '#06b6d4' },
    { type: 'elevator', icon: '🛗', color: '#f59e0b' },
    { type: 'printer', icon: '🖨️', color: '#6366f1' },
    { type: 'cafeteria', icon: '☕', color: '#ec4899' },
  ];
  
  const pins = [];
  
  for (let i = 0; i < numPins; i++) {
    const pinType = pinTypes[Math.floor(Math.random() * pinTypes.length)];
    const offsetLng = (Math.random() - 0.5) * 0.001;
    const offsetLat = (Math.random() - 0.5) * 0.001;
    
    pins.push({
      type: "Feature",
      properties: {
        type: "pin",
        pin_type: pinType.type,
        id: `pin_${floorId}_${i}`,
        name: `${pinType.type} ${i + 1}`,
        description: `${pinType.type} on floor ${floorId}`,
        floor: floorId,
        level: floorId,
        icon: pinType.icon,
        color: pinType.color,
        height: floorId * 4,
        category: pinType.type
      },
      geometry: {
        type: "Point",
        coordinates: [
          baseCoords[0] + offsetLng,
          baseCoords[1] + offsetLat,
          floorId * 4
        ]
      }
    });
  }
  
  return pins;
};

// ==================== SEARCH API ====================

/**
 * Search for pins/locations across all floors
 * @param {string} projectId - Project ID
 * @param {string} query - Search query
 * @returns {Promise<Array>} Array of matching pins
 */
export const searchLocations = async (projectId, query) => {
  try {
    // TODO: Replace with actual API call
    // const response = await fetch(`${API_BASE_URL}/projects/${projectId}/search?q=${query}`);
    // const data = await response.json();
    // return data;
    
    console.log('Searching for:', query);
    return [];
  } catch (error) {
    console.error('Error searching locations:', error);
    throw error;
  }
};

// ==================== ROUTE API ====================

/**
 * Get route between two points
 * @param {string} projectId - Project ID
 * @param {string} startPinId - Start pin ID
 * @param {string} endPinId - End pin ID
 * @returns {Promise<Object>} Route data
 */
export const getRoute = async (projectId, startPinId, endPinId) => {
  try {
    // TODO: Replace with actual API call
    // const response = await fetch(`${API_BASE_URL}/projects/${projectId}/route`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ start: startPinId, end: endPinId })
    // });
    // const data = await response.json();
    // return data;
    
    console.log('Getting route from', startPinId, 'to', endPinId);
    return null;
  } catch (error) {
    console.error('Error fetching route:', error);
    throw error;
  }
};

// ==================== EXPORT ALL ====================

export default {
  getProjectData,
  getFloorList,
  getFloorData,
  searchLocations,
  getRoute
};