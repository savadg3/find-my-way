import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useDispatch } from 'react-redux';
import { setMapContainer } from '../../../../store/slices/mapSlice';

const BaseMap = forwardRef(
    ({ config, onMapLoad, className = 'w-full h-screen',isBoundActive = true }, ref) => {
        const mapContainer = useRef(null);
        const map = useRef(null);
        const dispatch = useDispatch()
        
        useImperativeHandle(ref, () => ({
            getMap: () => map.current
        }));
        
        useEffect(() => {
            if (map.current || !mapContainer.current) return;
            
            const defaultConfig = {
                center: [0, 0],
                zoom: 2,
                style: 'https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json' , 
                ...config
            };
            
            const bounds = getBoundsFromCenter(defaultConfig.center, defaultConfig.radius);
            
            const newMap = new maplibregl.Map({
                container: mapContainer.current,
                style: defaultConfig.style,
                center: defaultConfig.center,
                zoom: defaultConfig.zoom, 
                ...(isBoundActive && {
                    maxBounds:bounds,
                }),
            });
            
            map.current = newMap;
            dispatch(setMapContainer(newMap))

            
            newMap.on('load', () => {
                if (onMapLoad) onMapLoad(newMap);
                if(!isBoundActive) return
                const layers = newMap.getStyle().layers;
                
                layers.forEach(layer => {  
                    if (layer.id.includes('building')) {
                        newMap.setLayoutProperty(layer.id, 'visibility', 'none');
                    }
                });
            });
            
            return () => {
                newMap.remove();
                map.current = null;
            };
        }, [config?.style, config?.center, config?.zoom]);
        
        useEffect(() => {
            if (map.current && map.current.loaded() && onMapLoad) {
                onMapLoad(map.current);
            }
        }, [onMapLoad]);
        
        function getBoundsFromCenter(center, radiusInKm) {
            const lat = center[1];
            const lng = center[0];
            
            const latOffset = radiusInKm / 110.574; 
            const lngOffset = radiusInKm / (111.320 * Math.cos(lat * Math.PI / 180));
            
            return [
                [lng - lngOffset, lat - latOffset], 
                [lng + lngOffset, lat + latOffset] 
            ];
        }
        
        return <div ref={mapContainer} className={`${className} base-map`} />;
    }
);

BaseMap.displayName = 'BaseMap';

export default BaseMap;