import { toast } from "react-toastify";
import { deleteRequest, getRequest, postRequest } from "../../../../../../hooks/axiosClient"; 
import { environmentaldatas } from "../../../../../../constant/defaultValues";
import moment from "moment";
const { image_url } = environmentaldatas;

export const fetchAdvertisingList = async (id) => {
    const response = await getRequest(`advertisement-list/${id}`); 
    return response?.data?.data ?? [];
}; 

export const fetchAdvertisingItemById = async (decodedSubid) => {
    const response = await getRequest(`advertisements/${decodedSubid}`);
    return response.data ?? {};
};

export const normalizeAdvertisingData = (data = {}) => { 
    let adData = data?.data
   
    let prefillData = {
        ...adData,
        
        start_date: moment(adData?.start_date).toDate(),
        end_date: adData?.end_date ? moment(adData?.end_date).toDate() : '',
        ad_image: adData?.ad_image ? image_url + adData?.ad_image : null,
        ad_type: adData?.link == null ? 2 : 1,
        type_id: adData?.location_id !== null ? adData?.location_id : adData?.product_id,
    };

    console.log(prefillData);

    return {
        prefillData
    };
};

export const deleteAdvertisement = async (id, fetch) => {
    try {
        const response = await deleteRequest(`advertisements/${id}`);
        const data = response.data ?? [];
        toast.success(data?.message);
        fetch(); 
    } catch (error) {
        console.log(error);
    }
}

export const saveAdvertisment = async (id,payload) => {
    try {
        const reqUrl = id ? `advertisements/${id}` : 'advertisements';
        const response = await postRequest(reqUrl, payload, true);
        const data = response.data ?? [];
        toast.success(data?.message);  
    } catch (error) {
        console.log(error);
    }
}