

import React, { useCallback, useEffect, useRef, useState } from 'react';
import BaseMap from './Map/BaseMap';
import MapMarkers from './Map/Overlays/MapMarkers';
import { demoBuildingData, demoMarkersGeoJSON, floorDataResponse, ProjectData } from '../mapData';
import MapDrawing from './Map/Overlays/MapDrawing';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { setIsConnectionEnabled, setPlacedLocation } from '../../../store/slices/verticalPlacementSlice';

const MapComponent = () => {
    const mapRef = useRef(null);
    const [isMapReady, setIsMapReady] = useState(false); 
    const [projectData, setProjectData] = useState(ProjectData);

    const dispatch = useDispatch()
    const isConnectionEnabled = useSelector((state) => state.vertical.isConnectionEnabled);
    const isConnectionEnabledRef = useRef(isConnectionEnabled);


    useEffect(() => {
        const checkMapRef = setInterval(() => {
        if (mapRef.current) {
            setIsMapReady(true);
            clearInterval(checkMapRef);
        }
        }, 100);

        return () => clearInterval(checkMapRef);
    }, []);
    
    useEffect(() => {
        isConnectionEnabledRef.current = isConnectionEnabled;
    }, [isConnectionEnabled]);
    
    const handleMapLoad = useCallback((map) => {
        const clickHandler = (e) => {
            const { lng, lat } = e.lngLat;
    
            if (isConnectionEnabledRef.current) {
                dispatch(setIsConnectionEnabled(false));
                dispatch(setPlacedLocation({ lng, lat }));
            }
        };
    
        map.on('click', clickHandler);
    
        return () => {
            map.off('click', clickHandler);
        };
    }, [dispatch]);
    
    return (
        <div className="app">  

            <BaseMap
                ref={mapRef}
                config={{
                    center: projectData.location,
                    zoom: 18,
                    style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
                    // style: 'https://basemaps.cartocdn.com/gl/positron-nolabels-gl-style/style.json',
                }}
                onMapLoad={handleMapLoad}
            />

            {isMapReady && mapRef.current && (
                <>
                    <MapMarkers />

                    {/* <BuildingOverlay
                        map={mapRef.current}
                        geojson={demoBuildingData}
                        // selectedFloor={selectedFloor}
                        // onFeatureClick={onFeatureClick}
                    /> */}

                    <MapDrawing map={mapRef.current} />

                </>
            )}
        </div>
    );
};

export default MapComponent;
        
        