import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom'; 
import { decode } from '../../../../../../helpers/utils';
import { fetchPinData } from '../../../../../../components/map/components/hooks/useLoadPins';
import { setPinsByCategory } from '../../../../../../store/slices/projectItemSlice';
import { SetBackEndErrorsAPi } from '../../../../../../hooks/setBEerror';
import { PlanExpiryDetails } from '../../../../Helpers/apis/otherApis';
import { saveProduct } from '../services/productService';
import { useBuildProductPayload } from './useBuildProductPayload';
import { useRef, useState } from 'react';

export const useProductSubmit = ({ 
    websiteLinks, 
    // setIsDirty,
    setModal,
    setPlanDetails,
    specifications
}) => {
    const dispatch   = useDispatch();
    const { id }     = useParams();
    let decodedId      = decode(id);
    const pinCount   = useSelector((state) => state.api.pinCount); 
    
    
    const buildPayload = useBuildProductPayload({
        decodedId, 
        websiteLinks, 
        specifications
    });
    
    const isAtPinLimit = () =>
        pinCount?.used_locations === pinCount?.total_locations;
    
    const submit = async (values, { setFieldError }) => { 
        if (values.enc_id && values.isDrop) {
            if (isAtPinLimit()) {
                PlanExpiryDetails(decodedId, setPlanDetails, setModal);
                return;
            }
            document.getElementById('productSubmitBtn')?.click(); 
            return;
        }
        
        try {
            const payload  = buildPayload(values); 
            const response = await saveProduct(payload);
            
            if (response.type === 1) {
                const data = response.response?.data ?? {}; 
                  
                const updated = await fetchPinData(decodedId, ['product']);
                dispatch(setPinsByCategory({ product: updated?.product }));
                
                // setIsDirty(false);
            } else {
                SetBackEndErrorsAPi(response, setFieldError);
            }
        } catch (error) {
            console.error('Location save failed:', error);
        }
    };
    
    return { submit };
};

const useProductImageHandler = ({ onUpload, onDelete } = {}) => {
    const imgInputRef = useRef(null);

    const [images, setImages]             = useState([]);
    const [previewImage, setPreviewImage] = useState(null);
    const [croppedImage, setCroppedImage] = useState(null);
    const [blobImage, setBlobImage]       = useState(null);
    const [modal, setModal]               = useState(false);
    const [fileKey, setFileKey]           = useState(Date.now());

    const onSelectImg = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviewImage(reader.result);
            setModal(true);
        };
        reader.readAsDataURL(file);
        setFileKey(Date.now());
    };

    const handleDeleteImage = async (src, index) => {
        setImages((prev) => prev.filter((_, i) => i !== index));

        if (onDelete) {
            await onDelete([src]);
        }
    };

    const handleCropComplete = async (blob,baseString, url) => {
        setBlobImage(blob);
        setCroppedImage(url);
        setImages([url]);

        if (onUpload) {
            await onUpload([blob]);
        }
    };

    return {
        imgInputRef,
        images,
        previewImage,
        croppedImage,
        blobImage,
        modal,
        fileKey,
        onSelectImg,
        handleDeleteImage,
        handleCropComplete,
        setModal,
        setImages,
        setBlobImage,
        setCroppedImage,
        setPreviewImage
    };
};

export default useProductImageHandler;
