import { useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import swal from 'sweetalert';
import { encode, decode, getCurrentUser } from '../../../../../../helpers/utils';
import { setPinsByCategory, setEditingPinId } from '../../../../../../store/slices/projectItemSlice';
import { deletePinApi, removePinApi } from '../../../../Helpers/apis/otherApis'; 
import { fetchPinData } from '../../../../../../components/map/components/hooks/useLoadPins';  
import { saveAmenity } from '../services/amenityService';

export const useAmenityList = () => {
    const dispatch    = useDispatch();
    const navigate    = useNavigate();
    const { id }      = useParams();
    const decodedId   = decode(id);
 
    const projectData = useSelector((state) => state.api.projectData);
    const allPins     = useSelector((state) => state.api.allPins);

    const amenityList = allPins?.amenity ?? [];  

    const [searchTerm, setSearchTerm] = useState('');

    const filteredList = amenityList.filter(({ amenity_name = '', floor_plan = '', search_name = '' }) => {
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        return (
            amenity_name?.toLowerCase().includes(term) ||
            floor_plan?.toLowerCase().includes(term) ||
            search_name?.toLowerCase().includes(term)
        );
    });

    const handleAddNew = () => { 
        document.getElementById('amenitySubmitBtn')?.click(); 
    };

    const handleEdit = useCallback((amenity) => {
        navigate(encode(amenity.enc_id));
        dispatch(setEditingPinId(amenity.enc_id));
    }, [navigate, dispatch]);

    const handleRemove = useCallback((amenity, canDrag) => {
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
                    const updated = await deletePinApi(`amenity/${amenity.enc_id}`, projectData, decodedId, ['amenity']);
                    dispatch(setPinsByCategory({ amenity: updated?.amenity }));
                }

                if (value === 'Remove') {
                    const updated = await removePinApi('remove-pin', { type: 4, id: amenity.enc_id }, projectData, decodedId, ['amenity']);
                    dispatch(setPinsByCategory({ amenity: updated?.amenity }));
                }
                });
    }, [dispatch, projectData, decodedId]);

    const handleCreateAmenity = async (values, { setFieldError }) => {
 
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

            amenity_name: values.amenity_name ?? '! New amenity',
            icon_id:  values.icon_id ?? 1,
            amenity_color: values.amenity_color ?? projectData?.amenity_color,   
        };

        try {
            const response = await saveAmenity(payload);

            if (response.type === 1) {
                const updated = await fetchPinData(decodedId, ['amenity']);
                dispatch(setPinsByCategory({ amenity: updated?.amenity }));
            } else {
                SetBackEndErrorsAPi(response, setFieldError);
            }
        } catch (err) {
            console.error('Create amenity failed:', err);
        }
    };

    return {
        filteredList,
        searchTerm,
        setSearchTerm,
        handleAddNew,
        handleEdit,
        handleRemove,
        handleCreateAmenity,
    };
};