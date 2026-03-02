import { getRequest, postRequest } from "../../../../../../hooks/axiosClient";
import { safeJsonParse } from "../../../utils/pinServices"; 
 

export const saveSafety = async (payload) => {
    const response = await postRequest('safety', payload);
    return response;
};

export const normalizeSafetyData = (data = {}) => { 
    const positions = safeJsonParse(data.positions, null);
 
    let prefillData = {
        ...data,
        position: positions, 
        icon: data?.enc_icon, 
    };
 
    if (data?.name) {
        prefillData.safety_name = data.name;
    }

    return {
        prefillData
    };
};

export const fetchSafetyById = async (decodedSubid) => {
    const response = await getRequest(`safety/${decodedSubid}`);
    return response.data ?? {};
};

export const fetchSafetyIcons = async (id) => {
    let value = {
        id: id,
        type: 2
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