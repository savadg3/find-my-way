import React, { useCallback, useMemo } from 'react';
import { useDrop } from 'react-dnd';
import { useDispatch, useSelector } from 'react-redux';

import MapComponent from '../../../../components/map/components/Map';
import CustomDropdown2, { CustomDropdown3 } from '../../../../components/common/CustomDropDown2';
import { ProjectData } from '../../../../components/map/mapData';
import { setCurrentFloor, setPinsByCategory } from '../../../../store/slices/projectItemSlice';
import { getCurrentUser } from '../../../../helpers/utils';
import { fetchPinData } from '../../../../components/map/components/hooks/useLoadPins';
import { daysOfWeek } from '../../Helpers/constants/constant';
import { sanitizeTags } from '../utils/pinServices';

import { normalizeLocationData, saveLocation } from '../sidebar/location/services/locationService';
import { normalizeProductData,  saveProduct  } from '../sidebar/product/services/productService';
import { normalizeBeaconData,   saveBeacon   } from '../sidebar/beacon/services/beaconService';
import { normalizeAmenityData,  saveAmenity  } from '../sidebar/amenity/services/amenityService';
import { normalizeSafetyData,   saveSafety   } from '../sidebar/safety/services/safetyService';
import { toast } from 'react-toastify';
import DrawingToolbar from './components/Drawingtoolbar ';
import ConnectionToolbar from './components/Connectiontoolbar';
import { useMatch } from 'react-router-dom';
import LocationPickerPanel from './LocationPickerPanel';

const customStyles = {
    control: (provided) => ({
        ...provided,
        height: '30px',
        minHeight: '30px',
        fontSize: '0.875rem',
        borderRadius: '4px',
        borderColor: '#F5F6F7',
    }),

    option: (provided) => ({
        ...provided,
        fontSize: '0.875rem',
    }),

    singleValue: (provided) => ({
        ...provided,
        fontSize: '0.875rem',
        position: 'absolute',
        top: '40%',
        transform: 'translateY(-50%)',
    }),

    placeholder: (provided) => ({
        ...provided,
        fontSize: '0.875rem',
        position: 'absolute',
        top: '40%',
        transform: 'translateY(-50%)',
        color: '#d4d4d4',
    }),

    indicatorSeparator: () => ({
        display: 'none',
    }),

    dropdownIndicator: (provided) => ({
        ...provided,
        padding: '4px',
    }),
};

const buildHourObject = (hours = {}) => {
    const hourObject = {};
    daysOfWeek.forEach((day) => {
        const key = day.toLowerCase();
        hourObject[`${key}_open`]  = hours.hasOwnProperty(day) ? 1 : 0;
        hourObject[`${key}_start`] = hours[day]?.from ?? (hours.hasOwnProperty(day) ? '09:00:00' : '');
        hourObject[`${key}_end`]   = hours[day]?.to   ?? (hours.hasOwnProperty(day) ? '17:30:00' : '');
    });
    return hourObject;
};

const PIN_CONFIG = {
    location: {
        dragType:    'LocationPin',
        dragKey:     'location',
        saveFn:      saveLocation,
        normalizeFn: normalizeLocationData,
        buildExtra:  (normalized, prod, projectData) => ({
            location_name:       prod.location_name ?? '! New location',
            location_color:      prod.location_color ?? projectData?.location_color,
            boundary_color:      prod.boundary_color ?? '#26A3DB',
            boundary_attributes: null,
            contact:             prod.contact,
            description:         prod.description,
            tags:                sanitizeTags(prod.tags),
            website:             JSON.stringify(normalized.websiteLinks ?? []),
            ...buildHourObject(normalized.hours),
        }),
    },

    product: {
        dragType:    'productpin',
        dragKey:     'location',
        saveFn:      saveProduct,
        normalizeFn: normalizeProductData,
        buildExtra:  (normalized, prod, projectData) => ({
            product_name:   prod.product_name  ?? '! New product',
            product_color:  prod.product_color ?? projectData?.product_color,
            product_code:   prod.product_code,
            boundary_color: null,
            description:    prod.description,
            tags:           sanitizeTags(prod.tags),
            website:        JSON.stringify(normalized.websiteLinks      ?? []),
            specifications: JSON.stringify(normalized.specificationsArray ?? []),
        }),
    },

    beacon: {
        dragType:    'beaconpin',
        dragKey:     'location',
        saveFn:      saveBeacon,
        normalizeFn: normalizeBeaconData,
        buildExtra:  (normalized, prod, projectData) => ({
            beacon_name:      prod.beacon_name ?? '! New beacon',
            beacon_color:     prod.beacon_color     ?? projectData?.beacon_color,
            bg_color:         prod.bg_color         ?? projectData?.beacon_color,
            heading:          prod.heading,
            heading_color:    prod.heading_color,
            subheading:       prod.subheading,
            subheading_color: prod.subheading_color,
            content_color:    prod.content_color,
            message:          prod.message,
        }),
    },

    amenity: {
        dragType:    'amenitypin',
        dragKey:     'location',
        saveFn:      saveAmenity,
        normalizeFn: normalizeAmenityData,
        buildExtra:  (normalized, prod, projectData) => ({
            amenity_name:  prod.amenity_name ?? '! New amenity',
            icon_id:       prod.icon_id      ?? 1,
            amenity_color: prod.amenity_color ?? projectData?.amenity_color,
        }),
    },

    safety: {
        dragType:    'safetypin',
        dragKey:     'location',
        saveFn:      saveSafety,
        normalizeFn: normalizeSafetyData,
        buildExtra:  (normalized, prod, projectData) => ({
            safety_name:  prod.safety_name  ?? '! New safety',
            icon_id:      prod.icon_id      ?? 7,
            safety_color: prod.safety_color ?? projectData?.safety_color,
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

const useHandleDrop = ({ projectData, currentFloor, dispatch }) => {
    return useCallback(async (prod, pointer, pinType) => {
        const config   = PIN_CONFIG[pinType];
        const payload  = buildPayload({ prod, pointer, projectData, currentFloor, pinType });
        const response = await config.saveFn(payload);

        if (response.type === 1) {
            const updated = await fetchPinData(projectData.enc_id, [pinType]);
            dispatch(setPinsByCategory({ [pinType]: updated?.[pinType] }));
        }
    }, [projectData, currentFloor, dispatch]);
};

const usePinDrop = (pinType, map, onDrop) => {
    const { dragType, dragKey } = PIN_CONFIG[pinType];

    return useDrop({
        accept: dragType,
        drop: (item, monitor) => {
            if (!map) return;
            const pointer = getDropPosition(map, monitor);
            if (!pointer) return;
            onDrop(item[dragKey], pointer, pinType);
        },
    });
};

function RightSideComponent() {
    const dispatch               = useDispatch();
    const projectData            = useSelector((state) => state.api.projectData);
    const map                    = useSelector((state) => state.map.mapContainer);
    const currentFloor           = useSelector((state) => state.api.currentFloor);
    const floorList              = useSelector((state) => state.api.floorList);
    const isConnectionEnabled    = useSelector((state) => state.vertical.isConnectionEnabled);
    const showLocationPicker     = useSelector((state) => state.api.showLocationPicker);

    // Use useMatch for reliable route detection — handles trailing slashes and
    // any URL normalisation React Router applies, unlike manual string splitting.
    const isNavigation = !!useMatch('/project/:id/navigation');
    const isFloorplan  = !!useMatch('/project/:id/floor-plan/:subid');

    const handleDrop = useHandleDrop({ projectData, currentFloor, dispatch });

    // All hook calls must be before any conditional returns (rules of hooks)
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

    const floorOptions = useMemo(
        () =>
            (floorList ?? []).map((item) => ({
                label: item?.floor_plan,
                value: item?.enc_id,
            })),
        [floorList]
    );

    const selectedOption = useMemo(() => {
        const found = floorOptions.find(
            (option) => String(option.value) === String(currentFloor?.enc_id)
        );
        return found ? found : {};
    }, [floorOptions, currentFloor]);

    const onChange = (e) => {
        if (isConnectionEnabled) {
            toast.warning("Please click on map to add Vertical Transport");
        } else {
            const found = floorList.find(
                (option) => String(option.enc_id) === String(e?.value)
            );
            console.log(found);
            dispatch(setCurrentFloor(found));
        }
    };

    // ── Conditional rendering (after all hooks) ───────────────────────────────

    // Show the location picker panel whenever requested (initial set OR change)
    if (showLocationPicker) {
        return <LocationPickerPanel />;
    }

    // No location set and picker not open — hide the map entirely.
    // The user must first set a location via Project Settings.
    if (!projectData?.positions) return null;

    // Normal map view
    return (
        <div className="pin-drag-drop-div position-relative" ref={setDropRef}>

            {!isFloorplan && (
                <div className='d-flex position-absolute top-2 left-2 z-10'>
                    <div style={{ minWidth: "150px" }}>
                        <CustomDropdown3
                            options={floorOptions}
                            onChange={(e) => onChange(e)}
                            selectedValue={selectedOption}
                        />
                    </div>
                </div>
            )}

            {isFloorplan && <DrawingToolbar />}

            {isNavigation && <ConnectionToolbar />}

            <MapComponent projectData={projectData} />
        </div>
    );
}

export default RightSideComponent;
