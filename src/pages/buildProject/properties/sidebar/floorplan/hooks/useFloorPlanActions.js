import { useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import swal from 'sweetalert'; 
import {
    fetchFloorPlans,
    deleteFloorPlan,
    reorderFloorPlans,
    saveFloorPlan,
} from '../services/floorPlanService';
import { setFloorList } from '../../../../../../store/slices/projectItemSlice';
import { SetBackEndErrorsAPi } from '../../../../../../hooks/setBEerror';
import { revertPackage } from '../../../../Helpers/apis/otherApis';

export const useFloorPlanActions = ({ setFloorPlans, setModal, setLoading }) => {
    const dispatch    = useDispatch();
    const projectData = useSelector((state) => state.api.projectData);
    const projectId   = projectData?.enc_id; 

    const loadFloors = useCallback(async () => {
        try {
            const data = await fetchFloorPlans(projectId);
            setFloorPlans(data);
            dispatch(setFloorList(data));
        } catch (err) {
            console.error('Failed to load floor plans:', err);
        }
    }, [projectId, dispatch, setFloorPlans]); 

    const handleSave = async (values, { setFieldError }, onSuccess) => {
        setLoading(true);
        try {
            const response = await saveFloorPlan({ values, projectData });

            if (response.type === 1) {
                setModal(false);
                await loadFloors();
                if (!values.enc_id) {
                    toast.success(response.response?.data?.message);
                }
                onSuccess?.();
            } else {
                SetBackEndErrorsAPi(response, setFieldError);
            }
        } catch (err) {
            if (err.message === 'No project selected') {
                toast.error('Please add a project to add a floor plan');
            } else {
                console.error('Save floor plan failed:', err);
            }
        } finally {
            setLoading(false);
        }
    }; 

    const handleDelete = useCallback((row) => {
        swal({
            title: 'Are you sure you want to delete?',
            text:  'This action is permanent and cannot be undone.',
            icon:  'warning',
            buttons: {
                cancel:  { text: 'No',  value: 'No',  visible: true, className: 'btn-danger',  closeModal: true },
                confirm: { text: 'Yes', value: 'Yes', visible: true, className: 'btn-success', closeModal: true },
            },
        }).then(async (value) => {
            if (value !== 'Yes') return;
            try {
                const data = await deleteFloorPlan(row.enc_id);
                toast.success(data?.message);
                await loadFloors();
                revertPackage(row.enc_id);
            } catch (err) {
                console.error('Delete floor plan failed:', err);
            }
        });
    }, [loadFloors]); 

    const handleReorder = useCallback(async (reorderedFloors) => {
        setFloorPlans([...reorderedFloors]);
        try {
            await reorderFloorPlans({ projectId, floors: reorderedFloors });
        } catch (err) {
            console.error('Reorder failed:', err);
        }
    }, [projectId, setFloorPlans]);

    return { loadFloors, handleSave, handleDelete, handleReorder };
};