import { getRequest, postRequest } from '../../../../../../hooks/axiosClient';
import { convertBase64ToBlob, dayMap, NOImg } from '../../../../Helpers/constants/constant';
import { environmentaldatas } from '../../../../../../constant/defaultValues';
import moment from 'moment';
import { safeParse } from '../../../../Helpers/apis/PinsEdit';
import { convertToObject } from '../../../utils/pinServices';

const { image_url } = environmentaldatas; 

export const fetchLocationById = async (decodedSubid) => {
    const response = await getRequest(`location/${decodedSubid}`);
    return response.data ?? {};
};

export const saveLocation = async (payload) => {
    const response = await postRequest('location', payload);
    return response;
};

export const savePromotions = async ({ encId, promotions }) => {
    const formData = new FormData();
    formData.append('id', encId);
    formData.append('is_published', '0');
    formData.append('discard', '1');
    formData.append('publish', '1');

    promotions.forEach((promo, i) => {
        formData.append(`promotions[${i}][image_path]`, promo.image_path);
        formData.append(`promotions[${i}][start_date]`, promo.start_date);
        formData.append(`promotions[${i}][end_date]`, promo.end_date ?? null);
    });

    const response = await postRequest('promotion-image', formData, true);
    return response;
};

export const normalizeLocationData = (data) => {
    const promotions = data.promotions ? JSON.parse(data.promotions) : [];
    const normalizedPromotions = promotions.map((el) => ({
        ...el,
        image_path: el.image_path ? image_url + el.image_path : null,
        start_date: el.start_date ? moment(el.start_date).toDate() : '',
        end_date:   el.end_date   ? moment(el.end_date).toDate()   : '',
    }));

    const webArray     = data.website ? safeParse(data.website) : [];
    const filteredWeb  = Array.isArray(webArray) ? webArray : [webArray];
    const websiteLinks = data.website ? convertToObject(filteredWeb) : [];

    const prefillData = {
        ...data,
        position:            data.positions ? JSON.parse(data.positions) : null,
        tags:                data.tags ? JSON.parse(data.tags) : [],
        boundary_attributes: data.boundary_attributes && data.boundary_attributes !== 'null'
            ? JSON.parse(data.boundary_attributes)
            : null,
    };

    const hours = {};
    Object.keys(dayMap).forEach((day) => {
        if (data[`${day}_open`] == 1) {
            hours[dayMap[day]] = {
                from: data[`${day}_start`],
                to:   data[`${day}_end`],
            };
        }
    });

    return { prefillData, normalizedPromotions, websiteLinks, hours };
};



export const normalizePromotionsFromApi = (rawPromotions) => {
    if (!rawPromotions) return [];
    const parsed = typeof rawPromotions === 'string'
        ? JSON.parse(rawPromotions)
        : rawPromotions;

    return parsed.map((el) => ({
        ...el,
        image_path: el.image_path ? image_url + el.image_path : null,
        start_date: el.start_date ? moment(el.start_date).toDate() : '',
        end_date:   el.end_date   ? moment(el.end_date).toDate()   : '',
    }));
};

export const normalizePromotionsForUpload = (promotions, isEdit, imageUrl) => {
    return promotions
        .filter((el) =>
            !Object.keys(el).every((key) => {
                const v = el[key];
                return v === null || v === undefined || v === '';
            })
        )
        .map((el) => {
            const promo = { ...el };
            if (isEdit && !(promo.image_path instanceof Blob)) {
                promo.image_path = promo.image_path?.replace(imageUrl, '');
            }
            if (!promo.start_date) promo.start_date = new Date();
            if (!promo.image_path) promo.image_path = convertBase64ToBlob(NOImg);
            return promo;
        });
};

export const validatePromotions = (promotions) => {
    for (const promo of promotions) {
        const start   = new Date(promo.start_date);
        const end     = new Date(promo.end_date);
        const today   = new Date();
        [start, end, today].forEach((d) => d.setHours(0, 0, 0, 0));

        const startInvalid = promo.start_date && isNaN(start.getTime());
        const endBeforeStart = promo.start_date && promo.end_date && start > end;
        const endInPast = startInvalid && end < today;

        if (endBeforeStart || endInPast) return false;
    }
    return true;
};


