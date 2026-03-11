import { useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import swal from 'sweetalert';
import { encode, decode, getCurrentUser } from '../../../../../../helpers/utils';
import { setPinsByCategory, setEditingPinId, setSelectedPin, setCurrentFloor } from '../../../../../../store/slices/projectItemSlice';
import { deletePinApi, removePinApi, PlanExpiryDetails } from '../../../../Helpers/apis/otherApis'; 
import { fetchPinData } from '../../../../../../components/map/components/hooks/useLoadPins'; 
import { saveProduct } from '../services/productService';

export const useProductList = ({ setModal }) => {
    const dispatch    = useDispatch();
    const navigate    = useNavigate();
    const { id }      = useParams();
    const decodedId   = decode(id);

    const pinCount    = useSelector((state) => state.api.pinCount);
    const projectData = useSelector((state) => state.api.projectData);
    const allPins     = useSelector((state) => state.api.allPins);
    const floorList     = useSelector((s) => s.api.floorList);

    const productList = allPins?.product ?? []; 

    const [searchTerm, setSearchTerm] = useState('');

    const filteredList = productList.filter(({ product_name = '', floor_plan = '', search_name = '' }) => {
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        return (
            product_name?.toLowerCase().includes(term) ||
            floor_plan?.toLowerCase().includes(term) ||
            search_name?.toLowerCase().includes(term)
        );
    });

    const handleAddNew = () => {

        const isAtLimit = pinCount?.used_products === pinCount?.total_products; 

        if (isAtLimit) {
            const plan = PlanExpiryDetails(decodedId, setModal); 
            return;
        }
 
        document.getElementById('productSubmitBtn')?.click(); 
    };

    const handleEdit = useCallback((product) => {
        const found = floorList.find(
            (option) => String(option.enc_id) === String(product?.fp_id)
        ); 
        if(found?.enc_id){
            dispatch(setCurrentFloor(found));
        }  
        navigate(encode(product.enc_id));
        dispatch(setEditingPinId(product.enc_id));
    }, [navigate, dispatch]);

    const handleRemove = useCallback((product, canDrag) => {
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
                    const updated = await deletePinApi(`product/${product.enc_id}`, projectData, decodedId, ['product']);
                    dispatch(setPinsByCategory({ product: updated?.product }));
                }

                if (value === 'Remove') {
                    const updated = await removePinApi('remove-pin', { type: 2, id: product.enc_id }, projectData, decodedId, ['product']);
                    dispatch(setPinsByCategory({ product: updated?.product }));
                }
            });
    }, [dispatch, projectData, decodedId]);

    const handleCreateProduct = async (values, { setFieldError }) => {
 
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
            product_name:  '! New product',
            tags:           values.tags ?? [],
            product_code: '', 
            description:    '',
            positions:      null,
            website:        JSON.stringify([]),
            specifications: JSON.stringify([]),
            product_color: projectData?.product_color,
            boundary_color: null, 
        };

        try {
            const response = await saveProduct(payload);

            if (response.type === 1) {
                const updated = await fetchPinData(decodedId, ['product']);
                dispatch(setPinsByCategory({ product: updated?.product }));
            } else {
                SetBackEndErrorsAPi(response, setFieldError);
            }
        } catch (err) {
            console.error('Create product failed:', err);
        }
    };

    return {
        filteredList,
        searchTerm,
        setSearchTerm,
        handleAddNew,
        handleEdit,
        handleRemove,
        handleCreateProduct,
    };
};