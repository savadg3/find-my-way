// components/SVGUploader.jsx
import React, { useState } from 'react'; 
import BuildingOverlay from './BuildingOverlay';
import { extractPolygonsFromSVG } from '../../helpers/helperFunction';

const SVGUploader = ({ map, onFeaturesLoaded }) => {
  const [loading, setLoading] = useState(false);
  const [geoJSON, setGeoJSON] = useState(null);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file || !file.name.endsWith('.svg')) {
      alert('Please select an SVG file');
      return;
    }

    setLoading(true);
    try { 
       const result = await extractPolygonsFromSVG(file);

      setGeoJSON(result);
      
      if (onFeaturesLoaded) {
        onFeaturesLoaded(result);
      }
      
    } catch (error) {
      console.error('Error converting SVG:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="svg-uploader">
      <input
        type="file"
        accept=".svg"
        onChange={handleFileUpload}
        disabled={loading}
        style={{ margin: '10px 0' }}
      />
      {loading && <div>Converting SVG...</div>}
       
      {map && geoJSON && (
        <BuildingOverlay
          map={map}
          geojson={geoJSON}
          selectedFloor={0}
          onFeatureClick={(feature) => {
            // console.log('SVG feature clicked:', feature);
          }}
        />
      )}
    </div>
  );
};

export default SVGUploader;