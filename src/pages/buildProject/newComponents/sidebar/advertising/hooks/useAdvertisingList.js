import { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import swal from 'sweetalert';
import { encode, decode } from '../../../../../../helpers/utils';   
import { deleteAdvertisement, fetchAdvertisingList } from '../services/advertisingService';
import { toast } from 'react-toastify';

export const useAdvertisingList = () => { 
    const navigate    = useNavigate();
    const { id }      = useParams();
    const decodedId   = decode(id);
 
    const projectData = useSelector((state) => state.api.projectData); 
  
    const [searchTerm, setSearchTerm] = useState('');
    const [advertisingList, setAdvertising] = useState([]);

    const filteredList = advertisingList.filter(({ banner_name = '' }) => {
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        return (
            banner_name?.toLowerCase().includes(term) 
        );
    });

    useEffect(()=>{
        if(!decodedId) return
        fetchList()
    },[decodedId])

    const fetchList = async () =>{
        let listItems = await fetchAdvertisingList(decodedId)
        setAdvertising(listItems)
    }

    const handleAddNew = () => {  
        if (projectData?.is_basic == 0 && advertisingList?.length >= 2) {
            toast.warning('Sorry! You can only add 2 banners in the free plan.')
        }else{
            navigate('0')  
        } 
    };

    const handleEdit = useCallback((vertical) => {
        navigate(encode(vertical.enc_id)); 
    }, [navigate]);

    const handleRemove = useCallback((advertise) => { 
        const buttons = {
            cancel:  { text: 'Cancel', value: 'No',     visible: true, className: 'btn-danger', closeModal: true },
            confirm: { text: 'Delete', value: 'Yes',    visible: true, className: 'btn-red',    closeModal: true }, 
        };

        const orderedButtons = buttons;

        swal({ title: 'Are you sure you want to delete?', icon: 'warning', buttons: orderedButtons })
            .then(async (value) => {
                if (value === 'Yes') {
                    const updated = await deleteAdvertisement(advertise?.enc_id,fetchList);
                } 
            });
    }, [projectData, decodedId]);

    return {
        filteredList,
        searchTerm,
        setSearchTerm,
        handleAddNew,
        handleEdit,
        handleRemove, 
    };
};