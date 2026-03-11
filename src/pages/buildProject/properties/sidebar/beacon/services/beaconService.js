import { environmentaldatas } from "../../../../../../constant/defaultValues";
import { getRequest, postRequest } from "../../../../../../hooks/axiosClient";
import { convertToObject, ensureArray, safeJsonParse } from "../../../utils/pinServices"; 

const { image_url } = environmentaldatas; 

export const saveBeacon = async (payload) => {
    const response = await postRequest('qr-beacon', payload);
    return response;
};

export const normalizeBeaconData = (data = {}) => { 
    const positions = safeJsonParse(data.positions, null);
 
    let prefillData = {
        ...data,
        position: positions, 
    };
 
    if (data?.name) {
        prefillData.beacon_name = data.name;
    }

    return {
        prefillData
    };
};

export const fetchBeaconById = async (decodedSubid) => {
    const response = await getRequest(`qr-beacon/${decodedSubid}`);
    return response.data ?? {};
};