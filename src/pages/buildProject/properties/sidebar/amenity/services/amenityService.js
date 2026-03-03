import { getRequest, postRequest } from "../../../../../../hooks/axiosClient";
import { safeJsonParse } from "../../../utils/pinServices"; 
 

export const saveAmenity = async (payload) => {
    const response = await postRequest('amenity', payload);
    return response;
};

export const normalizeAmenityData = (data = {}) => { 
    const positions = safeJsonParse(data.positions, null);
 
    let prefillData = {
        ...data,
        position: positions, 
        icon: data?.enc_icon, 
    };
 
    if (data?.name) {
        prefillData.amenity_name = data.name;
    }

    return {
        prefillData
    };
};

export const fetchAmenityById = async (decodedSubid) => {
    const response = await getRequest(`amenity/${decodedSubid}`);
    return response.data ?? {};
};

export const fetchAmenityIcons = async (id) => {
    let value = {
        id: id,
        type: 1
    };
    try {
        const reqUrl = `dropdown-icons`;
        const response = await postRequest(reqUrl, value);
        const data = response.response?.data ?? [];
        return data 
    } catch (error) {
         console.log(error);
    }
};