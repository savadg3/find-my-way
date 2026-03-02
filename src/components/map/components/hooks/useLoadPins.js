import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { getRequest } from '../../../../hooks/axiosClient';
import { setAllPins } from '../../../../store/slices/projectItemSlice';

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

// async function fetchAllData(id) {
//     const endpoints = [
//         { url: `list-location/${id}`, category: 'location', titleKey: 'location_name' },
//         { url: `list-QrBeacon/${id}`, category: 'beacon', titleKey: 'beacon_name' },
//         { url: `list-amenity/${id}`, category: 'amenity', titleKey: 'amenity_name' },
//         { url: `list-safety/${id}`, category: 'safety', titleKey: 'safety_name' },
//         { url: `product-list/${id}`, category: 'product', titleKey: 'product_name' }
//     ];
    
//     const responses = await Promise.all(
//         endpoints.map(async ({ url, category, titleKey }) => {
//             const res = await getRequest(url);
            
//             return (res?.data || []).map(item => ({
//                 ...item,
//                 title: item[titleKey],
//                 category
//             }));
//         })
//     );

//     const [location, beacon, amenity, safety, product] = responses 
//     return {
//         location, beacon, amenity, safety, product
//     };
// }


export const fetchPinData = async (id, categories = Object.keys(ENDPOINTS)) => {
  const requests = categories.map(async (category) => {
    const config = ENDPOINTS[category];
    if (!config) return null;

    const res = await getRequest(`${config.url}/${id}`);

    const formatted = (res?.data || []).map((item) => ({
      ...item,
      title: item[config.titleKey],
      category,
    }));

    return { category, data: formatted };
  });

  const results = await Promise.all(requests);
 
  return results.reduce((acc, curr) => {
    if (curr) acc[curr.category] = curr.data;
    return acc;
  }, {});
}