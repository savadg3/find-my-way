import { useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom'; 
import { decode, encode } from '../../../../../../helpers/utils';
import { fetchPinData } from '../../../../../../components/map/components/hooks/useLoadPins';
import { setPinsByCategory } from '../../../../../../store/slices/projectItemSlice';
import { SetBackEndErrorsAPi } from '../../../../../../hooks/setBEerror'; 
import { saveVertical } from '../services/verticalService';
import { useBuildVerticalPayload } from './useBuildVerticalPayload';

export const useVerticalSubmit = ( ) => {
    const dispatch   = useDispatch();
    const { id }     = useParams();
    const navigate   = useNavigate();
    let decodedId      = decode(id);  
    
    const buildPayload = useBuildVerticalPayload({
        decodedId,
    }); 
    
    const submit = async (values, { setFieldError }) => {  
        try {
            const payload  = buildPayload(values);  
            if(payload.connection_pins.length == 0)  return
            
            const response = await saveVertical(payload);
            
            
            if (response.type === 1) {    
                let enc_id = response?.response?.data?.enc_id               
                if(enc_id){
                    navigate(`/project/${id}/vertical-transport/${encode(enc_id)}`)
                }
                const updated = await fetchPinData(decodedId, ['vertical']);
                dispatch(setPinsByCategory({ vertical: updated?.vertical })); 

            } else {
                SetBackEndErrorsAPi(response, setFieldError);
            }
        } catch (error) {
            console.error('Location save failed:', error);
        }
    };
    
    return { submit };
};
