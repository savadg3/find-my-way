

import React, { useCallback, useEffect, useRef, useState } from 'react';
import BaseMap from './Map/BaseMap';
import MapMarkers from './Map/Overlays/MapMarkers';
import { demoBuildingData, demoMarkersGeoJSON, floorDataResponse, ProjectData } from '../mapData';
import LocationSearch from './locationSearch/LocationSearch'; 
import { Modal } from 'reactstrap';
import './map.css'
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';

const LocationMapComponent = () => {
    const mapRef = useRef(null);   
    const mapCenter = useSelector(state => state.map.mapCenter);

    const [isMapReady, setIsMapReady] = useState(false);
    const [markersData, setMarkersData] = useState(demoMarkersGeoJSON);
    const [projectData, setProjectData] = useState(ProjectData);

    const [modal, setModal] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState([]);
    

    const toggle = () =>{
        setModal(prev => !prev)
    }

    useEffect(() => {
        const checkMapRef = setInterval(() => {
            if (mapRef.current) {
                setIsMapReady(true);
                clearInterval(checkMapRef);
            }
        }, 100);

        return () => clearInterval(checkMapRef);
    }, []);
 

    const handleMapLoad = useCallback((map) => {
        // const center = map.getCenter();
        // setSelectedLocation([center.lng, center.lat])

        map.on('click', (e) => {
            const { lng, lat } = e.lngLat;
            console.log('Clicked location:', lng, lat);
            setSelectedLocation([lng, lat])
            toggle()
        });
    }, []); 

    const submitLocation = ()=>{
        toast.success(`Location selected: ${selectedLocation}`, {
            position: 'top-center',
            style: {
                width: '360px',
                // textAlign: 'center',
            },
        });

        toggle()
    }

    
    return (
        <div className="app">  

            {!projectData.coordinates && <LocationSearch />} 

            <BaseMap
                ref={mapRef}
                config={{
                    center: mapCenter,
                    zoom: 18,
                    style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json', 
                }}
                isBoundActive = {false}
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

            <Modal
                isOpen={modal}
                toggle={toggle}
                size="md"
                style={{ zIndex: "999999 !important",maxWidth:'600px' }}
                centered
                
            >
                <div className='location-modal'>
                    <h5 className='f-w-600 mb-2 text-center'>Is this the right spot?</h5>
                    <p>We’ll mark this location as your project area. You can change it later.</p>
                    <div className='d-flex items-center justify-content-end gap-3'>
                            <button className='btn btnCancel rounded' onClick={toggle}>Pick a different place</button>
                        <button className='btn-primary rounded' onClick={submitLocation}>Yes, use this place</button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default LocationMapComponent;
        
        