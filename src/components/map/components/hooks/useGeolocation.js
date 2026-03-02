import { useState, useEffect } from 'react';

export const useGeolocation = () => {
  const [location, setLocation] = useState({ 
    loaded: false, 
    coordinates: [0,0], 
    error: null 
  });

  const handleSuccess = (pos) => {
    const { latitude, longitude } = pos.coords; 
    setLocation({ loaded: true, coordinates: [longitude, latitude] });
  };

  const handleError = (error) => {
    setLocation({ loaded: true, error: { message: error.message } });
  };

  useEffect(() => {
    if (!navigator.geolocation) {
      handleError({ message: 'Geolocation not supported' });
      return;
    }
    navigator.geolocation.getCurrentPosition(handleSuccess, handleError, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000
    });
  }, []);

  return location;
};
