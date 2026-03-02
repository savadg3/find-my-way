import React, { useCallback } from 'react'
import MapComponent from '../../components/map/components/Map'
import LocationMapComponent from '../../components/map/components/ChooseLocationMap'
import { ProjectData } from '../../components/map/mapData'
import { useDrop } from 'react-dnd'
import { useSelector } from 'react-redux'
import { setPinsByCategory } from '../../store/slices/projectItemSlice'
import { useDispatch } from 'react-redux'
import { dayMap, daysOfWeek } from './Helpers/constants/constant'
import { getCurrentUser } from '../../helpers/utils' 
import { fetchPinData } from '../../components/map/components/hooks/useLoadPins'
import { normalizeLocationData, saveLocation } from './newComponents/sidebar/location/services/locationService'
import { saveProduct, normalizeProductData } from './newComponents/sidebar/product/services/productService'
import { sanitizeTags } from './newComponents/utils/pinServices'
import { normalizeBeaconData, saveBeacon } from './newComponents/sidebar/beacon/services/beaconService'
import { normalizeAmenityData, saveAmenity } from './newComponents/sidebar/amenity/services/amenityService'
import { saveSafety } from './newComponents/sidebar/safety/services/safetyService'

const PIN_CONFIG = {
    location: {
        dragType:  'LocationPin',
        saveFn:    saveLocation,
        normalizeFn: normalizeLocationData,
        buildExtra: (normalized, prod, projectData) => ({
            location_name:       prod.location_name ?? '! New location',
            location_color:      prod.location_color ?? projectData?.location_color,
            boundary_color:      prod.boundary_color ?? '#26A3DB',
            boundary_attributes: null,
            contact:             prod.contact,
            website:             JSON.stringify(normalized.websiteLinks ?? []),
            tags:                sanitizeTags(prod.tags),  
            description:         prod.description,
            ...buildHourObject(normalized.hours),
        }),
    },
    product: {
        dragType:  'productpin',
        saveFn:    saveProduct,
        normalizeFn: normalizeProductData,
        buildExtra: (normalized, prod, projectData) => ({
            product_name:    prod.product_name ?? '! New product',
            product_color:   prod.product_color ?? projectData?.product_color,
            product_code:    prod.product_code,
            boundary_color:  null,
            specifications:  JSON.stringify(prod.specifications ?? []),
            website:         JSON.stringify(normalized.websiteLinks ?? []),
            specifications:  JSON.stringify(normalized.specificationsArray ?? []), 
            tags:            sanitizeTags(prod.tags),  
            description:     prod.description,
        }),
    },
    beacon: {
        dragType:  'beaconpin',
        saveFn:    saveBeacon,
        normalizeFn: normalizeBeaconData,
        buildExtra: (normalized, prod, projectData) => ({  
            beacon_name:      prod.beacon_name ?? '! New beacon',
            bg_color:         prod.bg_color ?? projectData?.beacon_color,
            content_color:    prod.content_color,
            heading:          prod.heading,
            heading_color:    prod.heading_color, 
            message:          prod.message,
            subheading:       prod.subheading,
            subheading_color: prod.subheading_color,
            beacon_color:     prod.beacon_color ?? projectData?.beacon_color,  
        }),
    },
    amenity: {
        dragType:    'amenitypin',
        saveFn:      saveAmenity,
        normalizeFn: normalizeAmenityData,
        buildExtra: (normalized, prod, projectData) => ({  
            amenity_name:  prod.amenity_name ?? '! New amenity',
            icon_id:       prod.icon_id ?? 1,
            amenity_color: prod.amenity_color ?? projectData?.amenity_color,   
        }),
    },
    safety: {
        dragType:    'safetypin',
        saveFn:      saveSafety,
        normalizeFn: normalizeAmenityData,
        buildExtra: (normalized, prod, projectData) => ({  
            safety_name:   prod.safety_name ?? '! New safety',
            icon_id:       prod.icon_id ?? 7,
            safety_color:  prod.safety_color ?? projectData?.safety_color,   
        }),
    },
};

const getDropPosition = (map, monitor) => {
    const clientOffset = monitor.getClientOffset();
    if (!clientOffset) return null;
    
    const mapRect = map.getContainer().getBoundingClientRect();
    const lngLat  = map.unproject([
        clientOffset.x - mapRect.left,
        clientOffset.y - mapRect.top,
    ]);
    
    return { x: lngLat.lng, y: lngLat.lat };
};

const buildHourObject = (hours) => {
    const hourObject = {};
    daysOfWeek.forEach((day) => {
        const key = day.toLowerCase();
        hourObject[`${key}_open`]  = hours.hasOwnProperty(day) ? 1 : 0;
        hourObject[`${key}_start`] = hours[day]?.from ?? (hours.hasOwnProperty(day) ? '09:00:00' : '');
        hourObject[`${key}_end`]   = hours[day]?.to   ?? (hours.hasOwnProperty(day) ? '17:30:00' : '');
    });
    return hourObject;
};

const buildPayload = ({ prod, pointer, projectData, currentFloor, pinType }) => {
    const config     = PIN_CONFIG[pinType];
    const user       = getCurrentUser()?.user;
    const customerId = projectData?.enc_customer_id ?? user?.common_id;
    
    const normalized = config.normalizeFn(prod);  
    
    const base = {
        customer_id:   customerId,
        project_id:    projectData.enc_id,
        floor_plan_id: prod?.enc_floor_plan_id ?? currentFloor?.enc_id, 
        positions:     pointer, 
        ...config.buildExtra(normalized, prod, projectData),
    };
    
    if (prod.enc_id) {
        base.id           = prod.enc_id;
        base.is_published = '0';
        base.discard      = '1';
        base.publish      = '1';
    }
    
    return base;
};

const useHandleDrop = ({ map, projectData, currentFloor, dispatch }) => {
    return useCallback(async (prod, pointer, pinType) => {
        const config  = PIN_CONFIG[pinType]; 
        
        const payload = buildPayload({ prod, pointer, projectData, currentFloor, pinType });
        
        const response = await config.saveFn(payload);
        
        if (response.type === 1) {
            const updated = await fetchPinData(projectData.enc_id, [pinType]);
            dispatch(setPinsByCategory({ [pinType]: updated?.[pinType] }));
        }
    }, [map, projectData, currentFloor, dispatch]);
};

const usePinDrop = (pinType, map, onDrop) => {
    const { dragType } = PIN_CONFIG[pinType];
    return useDrop({
        accept: dragType,
        drop: (item, monitor) => { 
            if (!map) return;
            const pointer = getDropPosition(map, monitor);
            if (!pointer) return; 
            const value = item[pinType];
            onDrop(value, pointer, pinType);
        },
    });
};

function NewComponent() {
    
    const dispatch      = useDispatch();
    const projectData   = useSelector((state) => state.api.projectData);
    const currentFloor  = useSelector((state) => state.api.currentFloor);
    const map           = useSelector((state) => state.map.mapContainer);
    
    const handleDrop = useHandleDrop({ map, projectData, currentFloor, dispatch });
    
    const [, dropLocation] = usePinDrop('location', map, handleDrop);
    const [, dropProduct]  = usePinDrop('product',  map, handleDrop); 
    const [, dropBeacon]   = usePinDrop('beacon',   map, handleDrop); 
    const [, dropAmenity]  = usePinDrop('amenity',  map, handleDrop); 
    const [, dropSafety]   = usePinDrop('safety',   map, handleDrop); 
    
    const setDropRef = (el) => {
        dropLocation(el);
        dropProduct(el);
        dropBeacon(el);
        dropAmenity(el);
        dropSafety(el);
    };
    
    if(!ProjectData.location) return <LocationMapComponent/> 
    
    return ( 
        <div className="pin-drag-drop-div" ref={setDropRef}>
            <MapComponent projectData = {projectData}/>
        </div> 
    )
}

export default NewComponent