import { useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom'; 
import { decode } from '../../../../../../helpers/utils';
import { fetchPinData } from '../../../../../../components/map/components/hooks/useLoadPins';
import { setPinsByCategory } from '../../../../../../store/slices/projectItemSlice';
import { SetBackEndErrorsAPi } from '../../../../../../hooks/setBEerror'; 
import { useBuildAmenityPayload } from './useBuildAmenityPayload'; 
import { saveAmenity } from '../services/amenityService';

export const useAmenitySubmit = ({ onAfterSave } = {}) => {
    const dispatch   = useDispatch();
    const { id }     = useParams();
    let decodedId      = decode(id);  
    
    const buildPayload = useBuildAmenityPayload({
        decodedId,
    }); 
    
    const submit = async (values, { setFieldError }) => {  
        try {
            const payload  = buildPayload(values); 
            const response = await saveAmenity(payload);
            
            if (response.type === 1) {
                const updated = await fetchPinData(decodedId, ['amenity']);
                dispatch(setPinsByCategory({ amenity: updated?.amenity }));
                onAfterSave?.();
            } else {
                SetBackEndErrorsAPi(response, setFieldError);
                onAfterSave?.();
            }
        } catch (error) {
            console.error('Location save failed:', error);
            onAfterSave?.();
        }
    };

    return { submit };
};
