import React, { useCallback, useEffect, useRef, useState } from 'react';
import BaseMap from './Map/BaseMap';
import MapMarkers from './Map/Overlays/MapMarkers';
import { demoBuildingData, demoMarkersGeoJSON, floorDataResponse, ProjectData } from '../mapData';
import MapDrawing from './Map/Overlays/MapDrawing';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { setIsConnectionEnabled, setPlacedLocation } from '../../../store/slices/verticalPlacementSlice';
import { fetchFloorData } from './hooks/useLoadPins';
import { useParams } from 'react-router-dom';
import DrawingLayer, { DrawingSync } from './Map/Drawing/DrawingLayer';
import DrawingManager from './Map/Drawing/DrawingManager';
import ImageOverlayManager from './Map/Image/Imageoverlaymanager';
import NavigationLayer, { NavSync, NavVisibility } from './Map/Navigation/NavigationLayer';
import NavigationManager from './Map/Navigation/NavigationManager';

const MapComponent = () => {
    const mapRef                        = useRef(null);
    const [isMapReady, setIsMapReady]   = useState(false); 
    const [projectData, setProjectData] = useState(ProjectData);

    const dispatch               = useDispatch()
    const params               = useParams()
    const currentFloor           = useSelector((state) => state.api.currentFloor);
    const isConnectionEnabled    = useSelector((state) => state.vertical.isConnectionEnabled);
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
            // console.log({lat, lng });
            if (isConnectionEnabledRef.current) {
                dispatch(setIsConnectionEnabled(false));
                dispatch(setPlacedLocation({ x : lng, y : lat }));                 
            }
        };
    
        map.on('click', clickHandler);
    
        return () => {
            map.off('click', clickHandler);
        };
    }, [dispatch, currentFloor]);
    
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

                    <DrawingLayer />

                    <DrawingSync />

                    <DrawingManager />

                    <MapDrawing map={mapRef.current} />

                    <ImageOverlayManager />

                    {/* Navigation paths — always mounted so sources exist;
                        NavigationManager no-ops when activeTool is null.
                        NavVisibility hides all nav GL layers on non-navigation pages. */}
                    <NavigationLayer />
                    <NavSync />
                    <NavVisibility />
                    <NavigationManager />

                </>
            )}
        </div>
    );
};

export default MapComponent;
        
        