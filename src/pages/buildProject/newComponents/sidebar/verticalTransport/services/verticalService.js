import { getRequest, postRequest } from "../../../../../../hooks/axiosClient";
import { safeJsonParse } from "../../../utils/pinServices"; 
 

export const saveVertical = async (payload) => {
    const response = await postRequest('vertical-transport', payload);
    return response;
};

export const normalizeVerticalData = (data = {}) => { 
    const positions = safeJsonParse(data.positions, null);
    let connections = data?.transport_details.map((item) => ({
        // ...item,
        // value:  item.fp_id,
        // label:  item.floor_plan,
        // position : JSON.parse(item.positions)

        id: item?.enc_id,
        value: item?.fp_id,
        label: item?.floor_plan,
        position: JSON.parse(item?.positions)
    }))
 
    let prefillData = {
        ...data,
        position: positions, 
        icon: data?.enc_icon, 
        connectionPins : connections
    };
 
    if (data?.name) {
        prefillData.vertical_name = data.name;
    }

    return {
        prefillData
    };
};

export const fetchVerticalById = async (decodedSubid) => {
    const response = await getRequest(`vertical-transport/${decodedSubid}`);
    return response.data ?? {};
};

export const fetchVerticalIcons = async (id) => {
    let value = {
        id: id,
        type: 3
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