

import React, { useCallback, useEffect, useRef, useState } from 'react';
import BaseMap from './Map/BaseMap';
import MapMarkers from './Map/Overlays/MapMarkers';
import { demoBuildingData, demoMarkersGeoJSON, floorDataResponse, ProjectData } from '../mapData';

const MapComponent = () => {
    const mapRef = useRef(null);
    const [isMapReady, setIsMapReady] = useState(false);
    const [markersData, setMarkersData] = useState(demoMarkersGeoJSON);
    const [projectData, setProjectData] = useState(ProjectData);

    useEffect(() => {
        const checkMapRef = setInterval(() => {
        if (mapRef.current) {
            setIsMapReady(true);
            clearInterval(checkMapRef);
        }
        }, 100);

        return () => clearInterval(checkMapRef);
    }, []);

    const handleMapLoad = useCallback(() => {
       
    }, []); 
    
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
                    <MapMarkers 
                        map={mapRef.current} 
                        geojson={markersData} 
                    />

                    {/* <BuildingOverlay
                        map={mapRef.current}
                        geojson={demoBuildingData}
                        // selectedFloor={selectedFloor}
                        // onFeatureClick={onFeatureClick}
                    /> */}

                </>
            )}
        </div>
    );
};

export default MapComponent;
        
        