import { useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import swal from 'sweetalert';
import { encode, decode, getCurrentUser } from '../../../../../../helpers/utils';
import { setPinsByCategory, setEditingPinId, setSelectedPin, setCurrentFloor } from '../../../../../../store/slices/projectItemSlice';
import { deletePinApi, removePinApi, PlanExpiryDetails } from '../../../../Helpers/apis/otherApis'; 
import { fetchPinData } from '../../../../../../components/map/components/hooks/useLoadPins'; 
import { saveBeacon } from '../services/beaconService';

export const useBeaconList = () => {
    const dispatch    = useDispatch();
    const navigate    = useNavigate();
    const { id }      = useParams();
    const decodedId   = decode(id);

    const pinCount    = useSelector((state) => state.api.pinCount);
    const projectData = useSelector((state) => state.api.projectData);
    const allPins     = useSelector((state) => state.api.allPins);
    const floorList   = useSelector((s) => s.api.floorList);

    const beaconList = allPins?.beacon ?? [];  

    const [searchTerm, setSearchTerm] = useState('');

    const filteredList = beaconList.filter(({ beacon_name = '', floor_plan = '', search_name = '' }) => {
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        return (
            beacon_name?.toLowerCase().includes(term) ||
            floor_plan?.toLowerCase().includes(term) ||
            search_name?.toLowerCase().includes(term)
        );
    });

    const handleAddNew = () => { 
        document.getElementById('beaconSubmitBtn')?.click(); 
    };

    const handleEdit = useCallback((beacon) => {
        const found = floorList.find(
            (option) => String(option.enc_id) === String(beacon?.fp_id)
        ); 
        if(found?.enc_id){
            dispatch(setCurrentFloor(found));
        }  
        navigate(encode(beacon.enc_id));
        dispatch(setEditingPinId(beacon.enc_id));
    }, [navigate, dispatch]);

    const handleRemove = useCallback((beacon, canDrag) => {
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
                    const updated = await deletePinApi(`qr-beacon/${beacon.enc_id}`, projectData, decodedId, ['beacon']);
                    dispatch(setPinsByCategory({ beacon: updated?.beacon }));
                }

                if (value === 'Remove') {
                    const updated = await removePinApi('remove-pin', { type: 3, id: beacon.enc_id }, projectData, decodedId, ['beacon']);
                    dispatch(setPinsByCategory({ beacon: updated?.beacon }));
                }
            });
    }, [dispatch, projectData, decodedId]);

    const handleCreateBeacon = async (values, { setFieldError }) => {
 
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
            beacon_name:  values.beacon_name ?? '! New beacon',
            bg_color:  values.bg_color ?? projectData?.beacon_color,
            content_color:  values.content_color,
            heading:        values.heading,
            heading_color: values.heading_color, 
            message: values.message,
            positions:      null,
            subheading: values.subheading,
            subheading_color: values.subheading_color,
            beacon_color: projectData?.beacon_color,  
        };

        // console.log({payload,values}, "payload,values");
        // return
        try {
            const response = await saveBeacon(payload);

            if (response.type === 1) {
                const updated = await fetchPinData(decodedId, ['beacon']);
                dispatch(setPinsByCategory({ beacon: updated?.beacon }));
            } else {
                SetBackEndErrorsAPi(response, setFieldError);
            }
        } catch (err) {
            console.error('Create beacon failed:', err);
        }
    };

    return {
        filteredList,
        searchTerm,
        setSearchTerm,
        handleAddNew,
        handleEdit,
        handleRemove,
        handleCreateBeacon,
    };
};