
import React, { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';

const BuildingOverlay = ({ map, geojson, selectedFloor, onFeatureClick }) => {
  const layersRef = useRef([]);
  const sourcesRef = useRef([]);

  useEffect(() => {
    if (!map || !geojson) return;
    
    const mapInstance = map.getMap();
    if (!mapInstance) return;
 
    const filteredFeatures = geojson.features.filter(feature => {
      const props = feature.properties;
      return (
        (feature.geometry.type === 'Polygon' || 
         feature.geometry.type === 'LineString') 
        //  &&
        // (props.floor === selectedFloor || props.floor === undefined)
      );
    }); 
 
    const featuresSourceId = 'map-features-source';
    const featuresLayerId = 'map-features-layer';
    const linesLayerId = 'map-lines-layer';
 
    if (mapInstance.getLayer(featuresLayerId)) {
      mapInstance.removeLayer(featuresLayerId);
    }
    if (mapInstance.getLayer(linesLayerId)) {
      mapInstance.removeLayer(linesLayerId);
    }
    if (mapInstance.getSource(featuresSourceId)) {
      mapInstance.removeSource(featuresSourceId);
    }

    if (filteredFeatures.length === 0) return;
 
    mapInstance.addSource(featuresSourceId, {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: filteredFeatures
      }
    });

    sourcesRef.current.push(featuresSourceId);
 
    const polygonFeatures = filteredFeatures.filter(f => 
      f.geometry.type === 'Polygon'
    );
    const lineFeatures = filteredFeatures.filter(f => 
      f.geometry.type === 'LineString'
    );
 
    if (polygonFeatures.length > 0) {
      mapInstance.addLayer({
        id: featuresLayerId,
        type: 'fill',
        source: featuresSourceId,
        filter: ['==', '$type', 'Polygon'],
        paint: {
          'fill-color': [
            'case',
            ['has', 'fillColor'],
            ['get', 'fillColor'],
            '#e5e7eb' 
          ],
          'fill-opacity': [
            'case',
            ['has', 'fillOpacity'],
            ['get', 'fillOpacity'],
            0.3
          ],
          'fill-outline-color': [
            'case',
            ['has', 'strokeColor'],
            ['get', 'strokeColor'],
            '#374151'
          ]
        }
      });
 
      mapInstance.addLayer({
        id: `${featuresLayerId}-border`,
        type: 'line',
        source: featuresSourceId,
        filter: ['==', '$type', 'Polygon'],
        paint: {
          'line-color': [
            'case',
            ['has', 'strokeColor'],
            ['get', 'strokeColor'],
            '#374151'
          ],
          'line-width': [
            'case',
            ['has', 'strokeWidth'],
            ['get', 'strokeWidth'],
            2
          ],
          'line-opacity': 1
        }
      });

      layersRef.current.push(featuresLayerId, `${featuresLayerId}-border`);
    }
 
    if (lineFeatures.length > 0) {
      mapInstance.addLayer({
        id: linesLayerId,
        type: 'line',
        source: featuresSourceId,
        filter: ['==', '$type', 'LineString'],
        paint: {
          'line-color': [
            'case',
            ['has', 'strokeColor'],
            ['get', 'strokeColor'],
            '#9ca3af'
          ],
          'line-width': [
            'case',
            ['has', 'strokeWidth'],
            ['get', 'strokeWidth'],
            2
          ],
          'line-dasharray': [
            'case',
            ['has', 'dashArray'],
            ['literal', ['get', 'dashArray']],
            ['literal', [1, 0]]
          ],
          'line-opacity': 0.8
        }
      });

      layersRef.current.push(linesLayerId);
    }
 
    if (onFeatureClick) { 
      if (polygonFeatures.length > 0) {
        mapInstance.on('click', featuresLayerId, (e) => {
          const features = mapInstance.queryRenderedFeatures(e.point, {
            layers: [featuresLayerId]
          });
          
          if (features.length > 0) {
            const feature = features[0];
            onFeatureClick(feature);
             
            mapInstance.setPaintProperty(
              featuresLayerId,
              'fill-opacity',
              [
                'case',
                ['==', ['get', 'id'], feature.properties.id || ''],
                0.7,
                [
                  'case',
                  ['has', 'fillOpacity'],
                  ['get', 'fillOpacity'],
                  0.3
                ]
              ]
            );
          }
        });
 
        mapInstance.on('mouseenter', featuresLayerId, () => {
          mapInstance.getCanvas().style.cursor = 'pointer';
        });

        mapInstance.on('mouseleave', featuresLayerId, () => {
          mapInstance.getCanvas().style.cursor = '';
        });
      }
    }
 
    return () => {
      layersRef.current.forEach(layerId => {
        if (mapInstance.getLayer(layerId)) {
          mapInstance.removeLayer(layerId);
        }
      });

      sourcesRef.current.forEach(sourceId => {
        if (mapInstance.getSource(sourceId)) {
          mapInstance.removeSource(sourceId);
        }
      });

      layersRef.current = [];
      sourcesRef.current = [];
    };
  }, [map, geojson, selectedFloor, onFeatureClick]);

  return null;
};

export default BuildingOverlay;