import { environmentaldatas } from "../../../../../../constant/defaultValues";
import { getRequest, postRequest } from "../../../../../../hooks/axiosClient";
import { convertToObject, ensureArray, safeJsonParse } from "../../../utils/pinServices"; 

const { image_url } = environmentaldatas; 

export const saveProduct = async (payload) => {
    const response = await postRequest('product', payload);
    return response;
};

export const normalizeProductData = (data = {}) => {
 
    const specifications      = safeJsonParse(data.specifications, []);
    const specificationsArray = ensureArray(specifications);
    const tags                = safeJsonParse(data.tags, []);
    const positions           = safeJsonParse(data.positions, null);
             
    const websiteParsed = safeJsonParse(data.website, []);
    const websiteArray  = ensureArray(websiteParsed);
    const websiteLinks  = websiteParsed ? convertToObject(websiteArray) : [];
 
    const imageUrlArray = data.image_path
        ? data.image_path.map((item) => image_url + item)
        : [];

    const uniqueImages = [...new Set(imageUrlArray)];
 
    let prefillData = {
        ...data,
        tags,
        position: positions, 
    };
 
    if (data?.name) {
        prefillData.product_name = data.name;
    }
 

    return {
        prefillData, 
        websiteLinks, 
        uniqueImages,
        specificationsArray
    };
};

export const fetchProductById = async (decodedSubid) => {
    const response = await getRequest(`product/${decodedSubid}`);
    return response.data ?? {};
};