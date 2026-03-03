import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { getRequest } from '../../../../hooks/axiosClient';
import { setAllPins, setPinsByCategory } from '../../../../store/slices/projectItemSlice';
import { GetFloorData } from '../helpers/projectApi';

export const useLoadPins = (id) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    if (!id) return;
    
    const loadData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const pins = await fetchPinData(id, Object.keys(ENDPOINTS)); 
        dispatch(setAllPins(pins));
      } catch (err) {
        console.error(err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [id, dispatch]);
  
  return { loading, error };
};


const ENDPOINTS = {
  location: { url: "list-location", titleKey: "location_name" },
  beacon: { url: "list-QrBeacon", titleKey: "beacon_name" },
  amenity: { url: "list-amenity", titleKey: "amenity_name" },
  safety: { url: "list-safety", titleKey: "safety_name" },
  product: { url: "product-list", titleKey: "product_name" },
  vertical: { url: "list-vTransport", titleKey: "vt_name" },
};

export const fetchPinData = async (id, categories = Object.keys(ENDPOINTS)) => {
  const requests = categories.map(async (category) => {
    const config = ENDPOINTS[category];
    if (!config) return null;
    
    const res = await getRequest(`${config.url}/${id}`);
    
    let formatted = (res?.data || []).map((item) => ({
      ...item,
      title: item[config.titleKey],
      category,
    }));
    
    if(config.url == 'list-vTransport'){
      formatted = (formatted || []).map((item) => ({
        ...item, 
        position: item?.positions ? JSON.parse(item?.positions) : ""
      }));
      
    }
    
    return { category, data: formatted };
  });
  
  const results = await Promise.all(requests);
  
  return results.reduce((acc, curr) => {
    if (curr) acc[curr.category] = curr.data;
    return acc;
  }, {});
}

export const fetchFloorData = async (dispatch, currentFloor) => {   
  if(!currentFloor) return
  
  let getFloorData = await GetFloorData(currentFloor.enc_id) 
 
  let verticalItem = (getFloorData?.vertical_transports || []).map((item) => ({
    ...item,
    category:"vertical_transport",
    title:getFloorData?.vt_name ?? ''
  }))  

  dispatch(
    setPinsByCategory({
      vertical_transport : verticalItem
    }
  )); 
};