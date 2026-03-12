import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import BaseMap from './Map/BaseMap';
import MapMarkers from './Map/Overlays/MapMarkers';
import { demoBuildingData, demoMarkersGeoJSON, floorDataResponse, ProjectData } from '../mapData';
import MapDrawing from './Map/Overlays/MapDrawing';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { setIsConnectionEnabled, setPlacedLocation } from '../../../store/slices/verticalPlacementSlice';
import { fetchFloorData } from './hooks/useLoadPins';
import { useMatch, useParams } from 'react-router-dom';
import DrawingLayer, { DrawingSync, DrawingAutoSave } from './Map/Drawing/DrawingLayer';
import DrawingManager from './Map/Drawing/DrawingManager';
import TextOverlay from './Map/Drawing/TextOverlay';
import ImageOverlayManager from './Map/Image/Imageoverlaymanager';
import NavigationLayer, { NavSync, NavVisibility, NavAutoSave } from './Map/Navigation/NavigationLayer';
import NavigationManager from './Map/Navigation/NavigationManager';

const MapComponent = () => {
    const mapRef                        = useRef(null);
    const [isMapReady, setIsMapReady]   = useState(false); 
    // const [projectData, setProjectData] = useState(ProjectData);

    const dispatch               = useDispatch() 
    const currentFloor           = useSelector((state) => state.api.currentFloor);
    const isConnectionEnabled    = useSelector((state) => state.vertical.isConnectionEnabled);
    const projectData            = useSelector((state) => state.api.projectData);
    const isConnectionEnabledRef = useRef(isConnectionEnabled);
    const isNavPage              = !!useMatch('/project/:id/navigation');

    let center =  useMemo(() => {
        const x = projectData?.positions?.x;
        const y = projectData?.positions?.y;
        if (!x || !y) return [0, 0]; 
        return [x, y];
    }, [projectData?.positions?.x, projectData?.positions?.y]); 

    let radius =  useMemo(() => { 
        return parseFloat(projectData?.radius_km ?? 1).toFixed(2);
    }, [projectData?.radius_km]);


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
                dispatch(setPlacedLocation({ x : lng, y : lat }));                 
            }
        };
    
        map.on('click', clickHandler);
    
        return () => {
            map.off('click', clickHandler);
        };
    }, [dispatch, currentFloor]);
    
    return (
        <div className="app" style={{ position: 'relative' }}>

            <BaseMap
                ref={mapRef}
                config={{ 
                    center: center,
                    radius:radius,
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
                    <ImageOverlayManager />

                    <DrawingLayer />

                    <DrawingSync />

                    <DrawingAutoSave />

                    <DrawingManager />

                    <TextOverlay />

                    <MapDrawing map={mapRef.current} />

  
                    <NavigationLayer />
                    <NavSync />
                    <NavVisibility />
                    <NavAutoSave />
                    {isNavPage && <NavigationManager />}

                </>
            )}
        </div>
    );
};

export default MapComponent;
        
        