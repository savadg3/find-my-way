import { useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import swal from 'sweetalert';
import { encode, decode } from '../../../../../../helpers/utils';
import { setPinsByCategory, setEditingPinId } from '../../../../../../store/slices/projectItemSlice';
import { deletePinApi, removePinApi } from '../../../../Helpers/apis/otherApis';  
import { fetchFloorData } from '../../../../../../components/map/components/hooks/useLoadPins';

export const useVerticalList = () => {
    const dispatch    = useDispatch();
    const navigate    = useNavigate();
    const { id }      = useParams();
    const decodedId   = decode(id);
 
    const projectData  = useSelector((state) => state.api.projectData);
    const allPins      = useSelector((state) => state.api.allPins);
    const currentFloor = useSelector((s) => s.api.currentFloor);

    const verticalList = allPins?.vertical ?? [];   

    const [searchTerm, setSearchTerm] = useState('');

    const filteredList = verticalList.filter(({ vt_name = '', floor_plan = '', search_name = '' }) => {
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        return (
            vt_name?.toLowerCase().includes(term) ||
            floor_plan?.toLowerCase().includes(term) ||
            search_name?.toLowerCase().includes(term)
        );
    });

    const handleAddNew = () => { 
        navigate('0') 
    };

    const handleEdit = useCallback((vertical) => {
        navigate(encode(vertical.enc_id));
        dispatch(setEditingPinId(vertical.enc_id));
    }, [navigate, dispatch]);

    const handleRemove = useCallback((vertical, canDrag) => {
        const buttons = {
            cancel:  { text: 'Cancel', value: 'No',     visible: true, className: 'btn-danger', closeModal: true },
            confirm: { text: 'Delete', value: 'Yes',    visible: true, className: 'btn-red',    closeModal: true }, 
        };

        const orderedButtons = !canDrag
            ? { cancel: buttons.cancel, remove: buttons.remove, confirm: buttons.confirm }
            : buttons;

        swal({ title: 'Are you sure you want to delete?', icon: 'warning', buttons: orderedButtons })
            .then(async (value) => {
                if (value === 'Yes') {
                    const updated = await deletePinApi(`vertical-transport/${vertical.enc_id}`, projectData, decodedId, ['vertical']);
                    fetchFloorData(dispatch,currentFloor)
                    dispatch(setPinsByCategory({ vertical: updated?.vertical }));
                } 
            });
    }, [dispatch, projectData, decodedId]);

    return {
        filteredList,
        searchTerm,
        setSearchTerm,
        handleAddNew,
        handleEdit,
        handleRemove, 
    };
};