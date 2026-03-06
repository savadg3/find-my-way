import { useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom'; 
import { decode, encode } from '../../../../../../helpers/utils';
import { fetchFloorData, fetchPinData } from '../../../../../../components/map/components/hooks/useLoadPins';
import { setPinsByCategory } from '../../../../../../store/slices/projectItemSlice';
import { SetBackEndErrorsAPi } from '../../../../../../hooks/setBEerror'; 
import { saveVertical } from '../services/verticalService';
import { useBuildVerticalPayload } from './useBuildVerticalPayload';
import { GetFloorData } from '../../../../../../components/map/components/helpers/projectApi';
import { useSelector } from 'react-redux';

export const useVerticalSubmit = ({setNewPinAdded, newPinAdded, onAfterSave} ) => {
    const dispatch   = useDispatch();
    const { id }     = useParams();
    const navigate   = useNavigate();
    let decodedId      = decode(id);  
    const currentFloor = useSelector((s) => s.api.currentFloor);
    
    const buildPayload = useBuildVerticalPayload({
        decodedId,
    }); 
    
    const submit = async (values, { setFieldError }) => {  
        try {
            const payload  = buildPayload(values); 
            
            const response = await saveVertical(payload);
            
            if (response.type === 1) {
                let enc_id = response?.response?.data?.enc_id
                if(enc_id){
                    navigate(`/project/${id}/vertical-transport/${encode(enc_id)}`)
                }
                const updated = await fetchPinData(decodedId, ['vertical']);
                dispatch(setPinsByCategory({ vertical: updated?.vertical }));

                if(newPinAdded){
                    fetchFloorData(dispatch,currentFloor)
                    setNewPinAdded(false)
                }

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
