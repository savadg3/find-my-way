import { useDispatch } from "react-redux";
import { getRequest, postRequest } from "../../../../hooks/axiosClient"; 



export const PinCountApi = async (id) => { 
    try {
        const response = await getRequest(`pins-used/${id}`);
        const data = response.data ?? [];
        return data
    } catch (error) {
        console.log(error);
    }
};

export const updatePinPosition = async (value) => {
    
    try {
        const reqUrl = `update-position`;
        const response = await postRequest(reqUrl, value); 
        return response
    } catch (error) {
        console.log(error);
    }
}

export const getTypeFromCategory = (category) => {
    switch (category) {
        case 'location':
        return 1;
        case 'product':
        return 2;
        case 'beacon':
        return 3;
        case 'amenity':
        return 4;
        case 'safety':
        return 5;
        case 'vertical':
        return 6;
        default:
        return null;
    }
}