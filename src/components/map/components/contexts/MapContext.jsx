// src/contexts/MapContext.js
import React, { createContext, useContext, useState, useCallback } from 'react';

const MapContext = createContext();

export const useMapContext = () => {
  const context = useContext(MapContext);
  if (!context) {
    throw new Error('useMapContext must be used within MapProvider');
  }
  return context;
};

export { MapContext };

// Shape types
export const DRAW_MODES = {
  NONE: 'none',
  CIRCLE: 'circle',
  RECTANGLE: 'rectangle',
  POLYGON: 'polygon',
};

export const MapProvider = ({ children }) => {
  const [activeTab, setActiveTab] = useState('all');
  const [editingPinId, setEditingPinId] = useState(null);

  // Shape drawing state
  const [activeDrawMode, setActiveDrawMode] = useState(DRAW_MODES.NONE);
  const [shapes, setShapes] = useState([]); // Array of GeoJSON Feature objects
  const [selectedShapeId, setSelectedShapeId] = useState(null);

  const addShape = useCallback((shape) => {
    setShapes((prev) => [...prev, shape]);
  }, []);

  const updateShape = useCallback((id, updatedShape) => {
    setShapes((prev) => prev.map((s) => (s.id === id ? { ...s, ...updatedShape } : s)));
  }, []);

  const deleteShape = useCallback((id) => {
    setShapes((prev) => prev.filter((s) => s.id !== id));
    setSelectedShapeId((prev) => (prev === id ? null : prev));
  }, []);

  const clearDrawMode = useCallback(() => {
    setActiveDrawMode(DRAW_MODES.NONE);
  }, []);

  return (
    <MapContext.Provider
      value={{
        activeTab,
        setActiveTab,
        editingPinId,
        setEditingPinId,
        // shape drawing
        activeDrawMode,
        setActiveDrawMode,
        shapes,
        setShapes,
        selectedShapeId,
        setSelectedShapeId,
        addShape,
        updateShape,
        deleteShape,
        clearDrawMode,
      }}
    >
      {children}
    </MapContext.Provider>
  );
};