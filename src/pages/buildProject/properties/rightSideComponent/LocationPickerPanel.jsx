import React, { useState, useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

import LocationPickerMap from '../sidebar/projectSettings/LocationPickerMap';
import { postRequest } from '../../../../hooks/axiosClient';
import { setProjectData, setShowLocationPicker } from '../../../../store/slices/projectItemSlice';
import { setMapCenter } from '../../../../store/slices/mapSlice';
import { decode } from '../../../../helpers/utils';
import { FaCheck } from 'react-icons/fa';


function AddressSearchBar({ onSelect }) {
    const [query,       setQuery]       = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [open,        setOpen]        = useState(false);

    useEffect(() => {
        if (query.length < 2) { setSuggestions([]); return; }
        const t = setTimeout(async () => {
            try {
                const r = await fetch(
                    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`
                );
                const d = await r.json();
                setSuggestions(d.map((i) => ({
                    id:        i.place_id,
                    name:      i.display_name,
                    latitude:  parseFloat(i.lat),
                    longitude: parseFloat(i.lon),
                })));
                setOpen(true);
            } catch {
                setSuggestions([]);
            }
        }, 300);
        return () => clearTimeout(t);
    }, [query]);

    const pick = (loc) => {
        setQuery(loc.name.split(',')[0]);
        setOpen(false);
        onSelect([loc.longitude, loc.latitude]);
    };

    return (
        <div style={{ position: 'relative', padding: '10px 16px 0' }}>
            <input
                className="form-control"
                style={{ fontSize: '0.875rem' }}
                placeholder="Search for an address…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => suggestions.length > 0 && setOpen(true)}
                onBlur={() => setTimeout(() => setOpen(false), 200)}
            />
            {open && suggestions.length > 0 && (
                <ul style={{
                    position:     'absolute',
                    zIndex:       9999,
                    top:          'calc(100% - 0px + 2px)',
                    left:         16,
                    right:        16,
                    background:   '#fff',
                    border:       '1px solid #d1d5db',
                    borderRadius: 6,
                    boxShadow:    '0 4px 12px rgba(0,0,0,0.12)',
                    listStyle:    'none',
                    margin:       0,
                    padding:      0,
                    maxHeight:    200,
                    overflowY:    'auto',
                }}>
                    {suggestions.map((s) => (
                        <li
                            key={s.id}
                            onMouseDown={() => pick(s)}
                            style={{
                                display:       'flex',
                                flexDirection: 'column',
                                padding:       '8px 12px',
                                cursor:        'pointer',
                                borderBottom:  '1px solid #f3f4f6',
                            }}
                        >
                            <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: '#111827' }}>
                                {s.name.split(',')[0]}
                            </span>
                            <span style={{
                                fontSize:     '0.75rem',
                                color:        '#6b7280',
                                overflow:     'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace:   'nowrap',
                            }}>
                                {s.name.split(',').slice(1).join(',').trim()}
                            </span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

 
export default function LocationPickerPanel() {
    const dispatch    = useDispatch();
    const { id }      = useParams();
    const decodedId   = decode(id);
    const projectData = useSelector((state) => state.api.projectData);

    const [activeTab,   setActiveTab]   = useState('map');  
    const [selectedLoc, setSelectedLoc] = useState(null);
    const [flyTo,       setFlyTo]       = useState(null);
    const [saving,      setSaving]      = useState(false);

    const hasExistingLocation = !!projectData?.positions;

   
    const handleAddressSelect = useCallback(([lng, lat]) => {
        setFlyTo([lng, lat]);
        setActiveTab('map');
    }, []);

    const handleSave = async () => {
        if (!selectedLoc) return;
        setSaving(true);
        try {
            // const response = await postRequest('project-location', {
            //     id:        decodedId,
            //     lat:       selectedLoc.lat,
            //     lng:       selectedLoc.lng,
            //     radius_km: selectedLoc.radiusKm,
            //     address:   selectedLoc.address ?? '',
            // });
            
            const response = await postRequest(`project-location/${decodedId}`, { 
                center: { x: selectedLoc.lng, y: selectedLoc.lat },
                radius_km: selectedLoc.radiusKm,
                address:   selectedLoc.address ?? '',
            });

            if (response.type === 1) {
                dispatch(setProjectData({
                    positions:        { x: selectedLoc.lng, y: selectedLoc.lat },
                    location_radius:  selectedLoc.radiusKm,
                    location_address: selectedLoc.address,
                }));
                dispatch(setMapCenter([selectedLoc.lng, selectedLoc.lat]));
                dispatch(setShowLocationPicker(false));
                toast.success('Location saved successfully');
            } else {
                toast.error('Failed to save location. Please try again.');
            }
        } catch {
            toast.error('Failed to save location. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div style={{
            display:       'flex',
            flexDirection: 'column',
            width:         '100%',
            height:        '100%',
            background:    '#fff',
            height:        'calc(100% - 30px)',

        }}>
            
            <div style={{
                padding:      '14px 16px 0',
                // borderBottom: '1px solid #e5e7eb',
                flexShrink:   0,
            }}>
                <div style={{
                    display:        'flex',
                    alignItems:     'flex-start',
                    justifyContent: 'space-between',
                    marginBottom:   8,
                }}>
                    <div>
                        <h2 style={{
                            margin:     0,
                            fontSize:   '1rem',
                            fontWeight: 600,
                            color:      '#111827',
                        }}>
                            Select Project Location
                        </h2>
                        <p style={{ margin: '4px 0 0', fontSize: '0.8125rem', color: '#6b7280' }}>
                            {activeTab === 'map'
                                ? 'Click anywhere on the map to place a pin. Drag the handle to resize the boundary.'
                                : 'Search for an address, the map will fly to that location automatically.'}
                        </p>
                    </div>

           
                    {hasExistingLocation && (
                        <button
                            type="button"
                            style={{
                                flexShrink:   0,
                                marginLeft:   12,
                                background:   'none',
                                border:       '1px solid #d1d5db',
                                borderRadius: 6,
                                padding:      '4px 12px',
                                fontSize:     '0.8rem',
                                color:        '#6b7280',
                                cursor:       'pointer',
                            }}
                            onClick={() => dispatch(setShowLocationPicker(false))}
                        >
                            Cancel
                        </button>
                    )}
                </div>

             
                {/* <div style={{ display: 'flex' }}>
                    {[
                        { key: 'map',     label: 'Select on Map'  },
                        { key: 'address', label: 'Enter Address'  },
                    ].map(({ key, label }) => (
                        <button
                            key={key}
                            type="button"
                            onClick={() => setActiveTab(key)}
                            style={{
                                flex:        1,
                                padding:     '8px 12px',
                                fontSize:    '0.8125rem',
                                fontWeight:  500,
                                border:      'none',
                                borderBottom: activeTab === key
                                    ? '2px solid #3b82f6'
                                    : '2px solid transparent',
                                background:  'none',
                                color:       activeTab === key ? '#3b82f6' : '#6b7280',
                                cursor:      'pointer',
                                transition:  'color 0.15s, border-color 0.15s',
                            }}
                        >
                            {label}
                        </button>
                    ))}
                </div> */}

                <div style={{
                    display:       'inline-flex',
                    background:    '#f3f4f6',
                    borderRadius:  999,
                    padding:       '3px',
                    gap:           '2px',
                    mb:            '20px'
                }}>
                    {[
                        { key: 'address', label: 'Enter Address' },
                        { key: 'map',     label: 'Select on Map' },
                    ].map(({ key, label }) => (
                        <button
                            key={key}
                            type="button"
                            onClick={() => setActiveTab(key)}
                            style={{
                                display:      'flex',
                                alignItems:   'center',
                                gap:          '6px',
                                padding:      '6px 16px',
                                fontSize:     '0.8125rem',
                                fontWeight:   500,
                                border:       'none',
                                borderRadius: 999,
                                background:   activeTab === key ? '#3b82f6' : 'transparent',
                                color:        activeTab === key ? '#ffffff' : '#6b7280',
                                cursor:       'pointer',
                                transition:   'background 0.15s, color 0.15s',
                            }}
                        >
                            {activeTab === key && <FaCheck style={{ fontSize: '0.7rem' }} />}
                            {label}
                        </button>
                    ))}
                </div>
            </div>

             
            {activeTab === 'address' && (
                <AddressSearchBar onSelect={handleAddressSelect} />
            )}

             
            <div style={{
                flex:      1,
                minHeight: 0,        
                padding:   '12px 16px',
                display:   'flex',
                flexDirection: 'column',
            }}>
                <LocationPickerMap
                    flyTo={flyTo}
                    onSelect={setSelectedLoc}
                    mapHeight="100%"
                />
            </div>

            
            {selectedLoc && (
                <div style={{
                    flexShrink:  0,
                    padding:     '12px 16px',
                    borderTop:   '1px solid #e5e7eb',
                    background:  '#f9fafb',
                    display:     'flex',
                    alignItems:  'center',
                    gap:         12,
                    flexWrap:    'wrap',
                }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        {selectedLoc.address && (
                            <p style={{
                                margin:       0,
                                fontSize:     '0.8125rem',
                                fontWeight:   500,
                                color:        '#111827',
                                overflow:     'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace:   'nowrap',
                            }}>
                                {selectedLoc.address.split(',')[0]}
                            </p>
                        )}
                        <p style={{ margin: 0, fontSize: '0.75rem', color: '#6b7280' }}>
                            {selectedLoc.lat.toFixed(5)}°,&nbsp;{selectedLoc.lng.toFixed(5)}°
                            &nbsp;·&nbsp;Radius:&nbsp;{selectedLoc.radiusKm.toFixed(2)}&nbsp;km
                        </p>
                    </div>

                    <button
                        type="button"
                        className="btn btn-primary"
                        style={{ fontSize: '0.875rem', whiteSpace: 'nowrap', flexShrink: 0 }}
                        onClick={handleSave}
                        disabled={saving}
                    >
                        {saving ? 'Saving…' : 'Save Location'}
                    </button>
                </div>
            )}
        </div>
    );
}
