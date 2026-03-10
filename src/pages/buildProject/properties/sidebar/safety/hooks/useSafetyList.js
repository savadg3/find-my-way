import { useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import swal from 'sweetalert';
import { encode, decode, getCurrentUser } from '../../../../../../helpers/utils';
import { setPinsByCategory, setEditingPinId } from '../../../../../../store/slices/projectItemSlice';
import { deletePinApi, removePinApi } from '../../../../Helpers/apis/otherApis'; 
import { fetchPinData } from '../../../../../../components/map/components/hooks/useLoadPins';  
import { saveSafety } from '../services/safetyService';

export const useSafetyList = () => {
    const dispatch    = useDispatch();
    const navigate    = useNavigate();
    const { id }      = useParams();
    const decodedId   = decode(id);
 
    const projectData = useSelector((state) => state.api.projectData);
    const allPins     = useSelector((state) => state.api.allPins);

    const safetyList = allPins?.safety ?? [];   

    const [searchTerm, setSearchTerm] = useState('');

    const filteredList = safetyList.filter(({ safety_name = '', floor_plan = '', search_name = '' }) => {
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        return (
            safety_name?.toLowerCase().includes(term) ||
            floor_plan?.toLowerCase().includes(term) ||
            search_name?.toLowerCase().includes(term)
        );
    });

    const handleAddNew = () => { 
        document.getElementById('safetySubmitBtn')?.click(); 
    };

    const handleEdit = useCallback((safety) => {
        navigate(encode(safety.enc_id));
        dispatch(setEditingPinId(safety.enc_id));
    }, [navigate, dispatch]);

    const handleRemove = useCallback((safety, canDrag) => {
        const buttons = {
            cancel:  { text: 'Cancel', value: 'No',     visible: true, className: 'btn-danger', closeModal: true },
            confirm: { text: 'Delete', value: 'Yes',    visible: true, className: 'btn-red',    closeModal: true },
            ...(!canDrag && {
                remove: { text: 'Remove From Floor Plan', value: 'Remove', visible: true, className: 'btn-danger', closeModal: true },
            }),
        };

        const orderedButtons = !canDrag
            ? { cancel: buttons.cancel, remove: buttons.remove, confirm: buttons.confirm }
            : buttons;

        swal({ title: 'Are you sure you want to delete?', icon: 'warning', buttons: orderedButtons })
            .then(async (value) => {
                if (value === 'Yes') {
                    const updated = await deletePinApi(`safety/${safety.enc_id}`, projectData, decodedId, ['safety']);
                    dispatch(setPinsByCategory({ safety: updated?.safety }));
                }

                if (value === 'Remove') {
                    const updated = await removePinApi('remove-pin', { type: 5, id: safety.enc_id }, projectData, decodedId, ['safety']);
                    dispatch(setPinsByCategory({ safety: updated?.safety }));
                }
            });
    }, [dispatch, projectData, decodedId]);

    const handleCreateSafety = async (values, { setFieldError }) => {
 
        if (values?.enc_id && values?.isDrop) {
            handleAddNew();
            return;
        }

        const user       = getCurrentUser()?.user;
        const customerId = projectData?.enc_customer_id ?? user?.common_id;

        const payload = {
            customer_id:    customerId,
            project_id:     decodedId,
            floor_plan_id:  null,
            positions:      null,

            safety_name: values.safety_name ?? '! New safety',
            icon_id:  values.icon_id ?? 7,
            safety_color: values.safety_color ?? projectData?.safety_color,   
        };

        try {
            const response = await saveSafety(payload);

            if (response.type === 1) {
                const updated = await fetchPinData(decodedId, ['safety']);
                dispatch(setPinsByCategory({ safety: updated?.safety }));
            } else {
                SetBackEndErrorsAPi(response, setFieldError);
            }
        } catch (err) {
            console.error('Create safety failed:', err);
        }
    };

    return {
        filteredList,
        searchTerm,
        setSearchTerm,
        handleAddNew,
        handleEdit,
        handleRemove,
        handleCreateSafety,
    };
};