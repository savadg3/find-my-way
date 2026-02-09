// src/contexts/MapContext.js
import React, { createContext, useContext, useState } from 'react';

const MapContext = createContext();

export const useMapContext = () => {
  const context = useContext(MapContext);
  if (!context) {
    throw new Error('useMapContext must be used within MapProvider');
  }
  return context;
};

export { MapContext };


export const MapProvider = ({ children }) => {
  const [activeTab, setActiveTab] = useState('all');
  const [editingPinId, setEditingPinId] = useState(null);

  return (
    <MapContext.Provider
      value={{
        activeTab,
        setActiveTab,
        editingPinId,
        setEditingPinId,
      }}
    >
      {children}
    </MapContext.Provider>
  );
};