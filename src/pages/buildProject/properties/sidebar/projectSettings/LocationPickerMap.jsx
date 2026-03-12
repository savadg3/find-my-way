import React, { useEffect, useRef, useState, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import { useSelector } from 'react-redux';

function makeCircleGeoJSON(center, radiusKm, steps = 64) {
    const [lng, lat] = center;
    const R = 6371;
    const coords = [];
    for (let i = 0; i <= steps; i++) {
        const angle = (i / steps) * 2 * Math.PI;
        const dLat = (radiusKm / R) * (180 / Math.PI) * Math.sin(angle);
        const dLng =
            (radiusKm / R) * (180 / Math.PI) * Math.cos(angle) /
            Math.cos((lat * Math.PI) / 180);
        coords.push([lng + dLng, lat + dLat]);
    }
    return {
        type: 'Feature',
        geometry: { type: 'Polygon', coordinates: [coords] },
    };
}

function getHandlePoint(center, radiusKm) {
    const [lng, lat] = center;
    const R = 6371;
    const dLng =
        (radiusKm / R) * (180 / Math.PI) / Math.cos((lat * Math.PI) / 180);
    return [lng + dLng, lat];
}

function haversineKm([lng1, lat1], [lng2, lat2]) {
    const R = 6371;
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const dφ = ((lat2 - lat1) * Math.PI) / 180;
    const dλ = ((lng2 - lng1) * Math.PI) / 180;
    const a =
        Math.sin(dφ / 2) ** 2 +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(dλ / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function reverseGeocode(lng, lat) {
    try {
        const r = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
        );
        const d = await r.json();
        return d.display_name ?? `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    } catch {
        return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    }
}

export default function LocationPickerMap({
    defaultRadiusKm = 1,
    flyTo = null,
    onSelect,
    mapHeight = '260px',
}) {
    const containerRef  = useRef(null);
    const mapRef        = useRef(null);
    const markerRef     = useRef(null);
    const centerRef     = useRef(null);
    const radiusRef     = useRef(defaultRadiusKm);
    const isDragging    = useRef(false); 
    const isMarkerDrag  = useRef(false); 

    const projectData = useSelector((state) => state.api.projectData);

    const [radiusKm, setRadiusKm] = useState(defaultRadiusKm);
    const [hasPin,   setHasPin]   = useState(false);
 
    const updateLayers = useCallback((map, center, radius) => {
        if (!map || !map.getSource('lp-circle')) return;
        map.getSource('lp-circle').setData({
            type: 'FeatureCollection',
            features: [makeCircleGeoJSON(center, radius)],
        });
        map.getSource('lp-handle').setData({
            type: 'FeatureCollection',
            features: [{
                type: 'Feature',
                geometry: { type: 'Point', coordinates: getHandlePoint(center, radius) },
            }],
        });
    }, []);
 
    const placePin = useCallback(async (map, lngLat, skipGeocode = false) => {
        if (markerRef.current) { 
            markerRef.current.setLngLat(lngLat);
        } else { 
            const marker = new maplibregl.Marker({ color: '#3b82f6', draggable: true })
                .setLngLat(lngLat)
                .addTo(map);
 
            marker.on('drag', () => {
                isMarkerDrag.current = true;
                const { lng, lat } = marker.getLngLat();
                const newCenter = [lng, lat];
                centerRef.current = newCenter;
                updateLayers(map, newCenter, radiusRef.current);
            });
 
            marker.on('dragend', async () => {
                isMarkerDrag.current = false;
                const { lng, lat } = marker.getLngLat();
                const newCenter = [lng, lat];
                centerRef.current = newCenter;
                updateLayers(map, newCenter, radiusRef.current);
                const address = await reverseGeocode(lng, lat);
                onSelect?.({ lng, lat, radiusKm: radiusRef.current, address });
            });

            markerRef.current = marker;
        }

        centerRef.current = lngLat;
        setHasPin(true);
        updateLayers(map, lngLat, radiusRef.current);

        if (!skipGeocode) {
            const address = await reverseGeocode(lngLat[0], lngLat[1]);
            onSelect?.({ lng: lngLat[0], lat: lngLat[1], radiusKm: radiusRef.current, address });
        }
    }, [updateLayers, onSelect]);
 
    useEffect(() => {
        if (!containerRef.current || mapRef.current) return;

        const map = new maplibregl.Map({
            container: containerRef.current,
            style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
            center: [0, 0],
            zoom: 18,
            minZoom: 14,
        });
        mapRef.current = map;

        map.on('load', () => {
            map.addSource('lp-circle', {
                type: 'geojson',
                data: { type: 'FeatureCollection', features: [] },
            });
            map.addLayer({
                id: 'lp-circle-fill',
                type: 'fill',
                source: 'lp-circle',
                paint: { 'fill-color': '#3b82f6', 'fill-opacity': 0.12 },
            });
            map.addLayer({
                id: 'lp-circle-outline',
                type: 'line',
                source: 'lp-circle',
                paint: {
                    'line-color': '#3b82f6',
                    'line-width': 2,
                    'line-dasharray': [5, 3],
                },
            });

            map.addSource('lp-handle', {
                type: 'geojson',
                data: { type: 'FeatureCollection', features: [] },
            });
            map.addLayer({
                id: 'lp-handle-dot',
                type: 'circle',
                source: 'lp-handle',
                paint: {
                    'circle-radius': 9,
                    'circle-color': '#fff',
                    'circle-stroke-color': '#3b82f6',
                    'circle-stroke-width': 2.5,
                },
            });
        });
 
        map.on('click', (e) => {
            if (isDragging.current || isMarkerDrag.current) return;
            placePin(map, [e.lngLat.lng, e.lngLat.lat]);
        });
 
        map.on('mousedown', (e) => {
            const hits = map.queryRenderedFeatures(e.point, { layers: ['lp-handle-dot'] });
            if (!hits.length) return;
            isDragging.current = true;
            map.dragPan.disable();
            map.getCanvas().style.cursor = 'ew-resize';
        });

        map.on('mousemove', (e) => {
            if (!isDragging.current || !centerRef.current) return;
            const newR = Math.max(
                0.05,
                haversineKm(centerRef.current, [e.lngLat.lng, e.lngLat.lat])
            );
            radiusRef.current = newR;
            setRadiusKm(newR);
            updateLayers(map, centerRef.current, newR);
        });

        const finishDrag = () => {
            if (!isDragging.current) return;
            isDragging.current = false;
            map.dragPan.enable();
            map.getCanvas().style.cursor = '';
            if (centerRef.current) {
                reverseGeocode(centerRef.current[0], centerRef.current[1]).then(
                    (address) => {
                        onSelect?.({
                            lng:      centerRef.current[0],
                            lat:      centerRef.current[1],
                            radiusKm: radiusRef.current,
                            address,
                        });
                    }
                );
            }
        };

        map.on('mouseup',    finishDrag);
        map.on('mouseleave', finishDrag);

        map.on('mouseenter', 'lp-handle-dot', () => {
            if (!isDragging.current) map.getCanvas().style.cursor = 'ew-resize';
        });
        map.on('mouseleave', 'lp-handle-dot', () => {
            if (!isDragging.current) map.getCanvas().style.cursor = '';
        });

        return () => {
            map.remove();
            mapRef.current  = null;
            markerRef.current = null;
        };
    }, []); 
 
    useEffect(() => {
        if (!flyTo || !mapRef.current) return;
        const map = mapRef.current;
        map.flyTo({ center: flyTo, zoom: 18, duration: 700 });
        if (map.isStyleLoaded() && map.getSource('lp-circle')) {
            placePin(map, flyTo);
        } else {
            map.once('load', () => placePin(map, flyTo));
        }
    }, [flyTo]); 
 
    useEffect(() => {
        const lngLat = projectData?.positions;

        if (!mapRef.current || !lngLat?.x) {
            if (mapRef.current) {
                navigator.geolocation?.getCurrentPosition(
                    ({ coords }) => {
                        mapRef.current.flyTo({
                            center: [coords.longitude, coords.latitude],
                            zoom: 18,
                            duration: 800,
                        });
                    },
                    () => {}
                );
            }
            return;
        }

        const map    = mapRef.current;
        const center = [lngLat.x, lngLat.y];
        const radius = parseFloat(projectData?.radius_km ?? 1);

        radiusRef.current = radius;
        setRadiusKm(radius);

        onSelect?.({
            lng:      lngLat.x,
            lat:      lngLat.y,
            radiusKm: radius,
            address:  projectData?.address ?? '',
        });

        map.flyTo({ center, zoom: 18, duration: 700 });

        const doPlace = () => placePin(map, center, true); 

        if (map.isStyleLoaded() && map.getSource('lp-circle')) {
            doPlace();
        } else {
            map.once('load', doPlace);
        }
    }, [projectData]); 

    return (
        <div style={{ position: 'relative', width: '100%', height: mapHeight, borderRadius: 8, overflow: 'hidden', border: '1px solid #e5e7eb' }}>
            <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
            {hasPin && (
                <div style={{
                    position:      'absolute',
                    bottom:        8,
                    left:          '50%',
                    transform:     'translateX(-50%)',
                    background:    'rgba(255,255,255,0.92)',
                    borderRadius:  6,
                    padding:       '3px 10px',
                    fontSize:      11,
                    color:         '#374151',
                    pointerEvents: 'none',
                    whiteSpace:    'nowrap',
                    boxShadow:     '0 1px 4px rgba(0,0,0,0.15)',
                }}>
                    Radius: {radiusKm.toFixed(2)} km · drag <strong><span className='resize-circle'></span>
                    {/* ● */}
                    </strong> to resize
                </div>
            )}
        </div>
    );
}