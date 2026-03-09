import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom'; 
import { decode } from '../../../../../../helpers/utils';
import { fetchPinData } from '../../../../../../components/map/components/hooks/useLoadPins';
import { setPinsByCategory } from '../../../../../../store/slices/projectItemSlice';
import { SetBackEndErrorsAPi } from '../../../../../../hooks/setBEerror';
import { PlanExpiryDetails } from '../../../../Helpers/apis/otherApis'; 
import { useBuildBeaconPayload } from './useBuildBeaconPayload';
import { saveBeacon } from '../services/beaconService';

export const useBeaconSubmit = ({
    setModal,
    setPlanDetails,
    onAfterSave,
}) => {
    const dispatch   = useDispatch();
    const { id }     = useParams();
    let decodedId      = decode(id);
    const pinCount   = useSelector((state) => state.api.pinCount); 
    
    
    const buildPayload = useBuildBeaconPayload({
        decodedId,
    });
    
    const isAtPinLimit = () =>
        pinCount?.used_locations === pinCount?.total_locations;
    
    const submit = async (values, { setFieldError }) => { 
        if (values.enc_id && values.isDrop) {
            if (isAtPinLimit()) {
                PlanExpiryDetails(decodedId, setPlanDetails, setModal);
                return;
            }
            document.getElementById('beaconSubmitBtn')?.click(); 
            return;
        }
        
        try {
            const payload  = buildPayload(values); 
            const response = await saveBeacon(payload);
            
            if (response.type === 1) {
                const data = response.response?.data ?? {};

                const updated = await fetchPinData(decodedId, ['beacon']);
                dispatch(setPinsByCategory({ beacon: updated?.beacon }));

                // setIsDirty(false);
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
