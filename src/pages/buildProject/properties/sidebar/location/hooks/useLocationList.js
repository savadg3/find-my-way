import { useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import swal from 'sweetalert';
import { encode, decode, getCurrentUser } from '../../../../../../helpers/utils';
import { setPinsByCategory, setEditingPinId, setSelectedPin, setCurrentFloor } from '../../../../../../store/slices/projectItemSlice';
import { deletePinApi, removePinApi, PlanExpiryDetails } from '../../../../Helpers/apis/otherApis';
import { saveLocation } from '../services/locationService';
import { fetchPinData } from '../../../../../../components/map/components/hooks/useLoadPins';
import { SetBackEndErrorsAPi } from '../../../../../../hooks/setBEerror';

export const useLocationList = ({ setModal, setPlanDetails }) => {
    const dispatch    = useDispatch();
    const navigate    = useNavigate();
    const { id }      = useParams();
    const decodedId   = decode(id);

    const pinCount      = useSelector((state) => state.api.pinCount);
    const projectData   = useSelector((state) => state.api.projectData);
    const allPins       = useSelector((state) => state.api.allPins); 
    const floorList     = useSelector((s) => s.api.floorList);

    const locationList = allPins?.location ?? []; 

    const [searchTerm, setSearchTerm] = useState('');

    const filteredList = locationList.filter(({ location_name = '', floor_plan = '', search_name = '' }) => {
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        return (
            location_name?.toLowerCase().includes(term) ||
            floor_plan?.toLowerCase().includes(term) ||
            search_name?.toLowerCase().includes(term)
        );
    });

    const handleAddNew = async () => {

        const isAtLimit = pinCount?.used_locations === pinCount?.total_locations;

        if (isAtLimit) {
            const plan = await PlanExpiryDetails(decodedId, setModal);
            setPlanDetails?.(plan);
            return;
        }

        document.getElementById('locationSubmitBtn')?.click();
    };

    const handleEdit = useCallback((location) => { 
        const found = floorList.find(
            (option) => String(option.enc_id) === String(location?.fp_id)
        ); 
        if(found?.enc_id){
            dispatch(setCurrentFloor(found));
        }  
        navigate(encode(location.enc_id));
        dispatch(setEditingPinId(location.enc_id));
    }, [navigate, dispatch]);

    const handleRemove = useCallback((location, canDrag) => {
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
                    const updated = await deletePinApi(`location/${location.enc_id}`, projectData, decodedId, ['location']);
                    dispatch(setPinsByCategory({ location: updated?.location }));
                }

                if (value === 'Remove') {
                    const updated = await removePinApi('remove-pin', { type: 1, id: location.enc_id }, projectData, decodedId, ['location']);
                    dispatch(setPinsByCategory({ location: updated?.location }));
                }
            });
    }, [dispatch, projectData, decodedId]);

    const handleCreateLocation = async (values, { setFieldError }) => {

        const user       = getCurrentUser()?.user;
        const customerId = projectData?.enc_customer_id ?? user?.common_id;

        const payload = {
            customer_id:    customerId,
            project_id:     decodedId,
            floor_plan_id:  null,
            location_name:  '! New location',
            tags:           values.tags ?? [],
            contact:        '',
            description:    '',
            positions:      null,
            website:        JSON.stringify([]),
            location_color: projectData?.location_color,
            boundary_color: null,
            boundary_attributes: null,
            promotions:     JSON.stringify([]),
        };

        try {
            const response = await saveLocation(payload);

            if (response.type === 1) {
                const updated = await fetchPinData(decodedId, ['location']);
                dispatch(setPinsByCategory({ location: updated?.location }));
            } else {
                SetBackEndErrorsAPi(response, setFieldError);
            }
        } catch (err) {
            console.error('Create location failed:', err);
        }
    };

    return {
        filteredList,
        searchTerm,
        setSearchTerm,
        handleAddNew,
        handleEdit,
        handleRemove,
        handleCreateLocation,
    };
};