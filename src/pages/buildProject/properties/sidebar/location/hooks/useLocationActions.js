import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom'; 
import { decode } from '../../../../../../helpers/utils';
import { fetchPinData } from '../../../../../../components/map/components/hooks/useLoadPins';
import { setPinsByCategory } from '../../../../../../store/slices/projectItemSlice';
import { SetBackEndErrorsAPi } from '../../../../../../hooks/setBEerror';
import { PlanExpiryDetails } from '../../../../Helpers/apis/otherApis';
import {
    saveLocation,
    savePromotions,
    normalizePromotionsFromApi,
    normalizePromotionsForUpload,
    validatePromotions,
} from '../services/locationService';
import { useBuildLocationPayload } from './useBuildLocationPayload';
import { environmentaldatas } from '../../../../../../constant/defaultValues';

const { image_url } = environmentaldatas;

export const useLocationSubmit = ({ 
    websiteLinks,
    hours,
    isBoundary,
    boundaryAttributesRef = undefined, 
    // setIsDirty,
    setModal,
    setPlanDetails,
}) => {
    const dispatch   = useDispatch();
    const { id }     = useParams();
    let decodedId      = decode(id);
    const pinCount   = useSelector((state) => state.api.pinCount); 
    
    
    const buildPayload = useBuildLocationPayload({
        decodedId, 
        websiteLinks,
        hours,
        isBoundary,
        boundaryAttributes: boundaryAttributesRef.current,
    });
    
    const isAtPinLimit = () =>
        pinCount?.used_locations === pinCount?.total_locations;
    
    const submit = async (values, { setFieldError }) => { 
        if (values.enc_id && values.isDrop) {
            if (isAtPinLimit()) {
                PlanExpiryDetails(decodedId, setPlanDetails, setModal);
                return;
            }
            document.getElementById('locationSubmitBtn')?.click(); 
            return;
        }
        
        try {
            const payload  = buildPayload(values);
            const response = await saveLocation(payload);
            
            if (response.type === 1) {
                const data = response.response?.data ?? {};
                boundaryAttributesRef.current = undefined;
                  
                const updated = await fetchPinData(decodedId, ['location']);
                dispatch(setPinsByCategory({ location: updated?.location }));
                
                // setIsDirty(false);
            } else {
                SetBackEndErrorsAPi(response, setFieldError);
            }
        } catch (error) {
            console.error('Location save failed:', error);
        }
    };
    
    return { submit };
};

export const usePromotionSubmit = ({
    currentPinData,
    promotions,
    setPromotions,
    setPromotionError,
    promotionError,
}) => {
    const handleSubmit = async (promoArray) => {
        const tempPromos = promoArray ?? [...promotions];
        const isValid    = validatePromotions(tempPromos);
        
        if (!isValid) {
            setPromotionError(true);
            setPromotions([...tempPromos]);
            return;
        }
        
        setPromotionError(false);
        
        const normalized = normalizePromotionsForUpload(
            tempPromos,
            !!currentPinData?.enc_id,
            image_url,
        );
        
        if (normalized.length > 0) {
            setPromotions(normalized);
        }
        
        try {
            const response = await savePromotions({
                encId:      currentPinData.enc_id,
                promotions: normalized,
            });
            
            if (response.type === 1) {
                const data           = response.response?.data ?? {};
                const promotionData  = normalizePromotionsFromApi(data.promotions);
                setPromotions(promotionData);
            }
        } catch (error) {
            console.error('Promotion save failed:', error);
        }
    };
    
    return { handleSubmit };
};