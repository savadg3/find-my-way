// hooks/useFlyToPin.js

import { useCallback } from 'react';
import { useSelector } from 'react-redux';

const useFlyToPin = () => {
    const map = useSelector((s) => s.map.mapContainer);
    
    const flyToPin = useCallback(
        (position, options = {}) => {
            if (!map) {
                console.warn('Map is not ready yet.');
                return;
            }
            let lng, lat;
            if (Array.isArray(position)) {
                [lng, lat] = position;
            } else if ('x' in position) {
                ({ x: lng, y: lat } = position);
            } else {
                ({ lng, lat } = position);
            }
            
            if (isNaN(lng) || isNaN(lat)) {
                console.warn('Invalid coordinates:', position);
                return;
            } 
            
            map.flyTo({
                center: [lng, lat],
                zoom: options.zoom ?? 20,
                speed: 2,
                curve: 1,
                essential: true,
            });
        },
        [map]
    );
    
    return flyToPin;
};

export default useFlyToPin;