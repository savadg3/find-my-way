import { useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom'; 
import { decode, encode } from '../../../../../../helpers/utils';
import { fetchPinData } from '../../../../../../components/map/components/hooks/useLoadPins';
import { setPinsByCategory } from '../../../../../../store/slices/projectItemSlice';
import { SetBackEndErrorsAPi } from '../../../../../../hooks/setBEerror'; 
import { saveAdvertisment } from '../services/advertisingService';
import { useBuildAdvertisingPayload } from './useBuildAdvertisingPayload';
import { useRef, useState } from 'react';
import { useSelector } from 'react-redux';

export const useAdvertisingImageHandler = () => {
    const fileRef = useRef(null);

    const [previewImage, setPreviewImage]   = useState(null);
    const [croppedImage, setCroppedImage]   = useState(null);
    const [blobImage, setBlobImage]         = useState(null);
    const [modal, setModal]                 = useState(false);
    const [postCall, setPostCall]           = useState(false);
    const [fileKey, setFileKey]             = useState(Date.now());

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

    const toggle2 = () => setModal((v) => !v);

    return {
        fileRef,
        previewImage,
        setPreviewImage,
        croppedImage,
        setCroppedImage,
        blobImage,
        setBlobImage,
        modal,
        setModal,
        toggle2,
        postCall,
        setPostCall,
        fileKey,
        onSelectImg,
    };
};

export const useAdvertisingLinkHandler = () => {
    const allPins = useSelector((state) => state.api.allPins);
    const products = allPins.product ?? [] 

    const locationValues = (products ?? []).map((pin) => ({
        ...pin,
        type : 2,
        // type_id : pin.enc_id,
        value: pin.enc_id,
        label: pin.title,
    }))   

    const handleURL = (setFieldValue) => {
        setFieldValue('ad_type', 1);
        setFieldValue('type_id', '');
        setFieldValue('type', '');
    };

    const handlePin = (setFieldValue) => {
        setFieldValue('ad_type', 2);
        setFieldValue('link', '');
    };

    const onValueChange = (value, field, setFieldValue) => {
        setFieldValue(field, value);
    };

    return { locationValues, handleURL, handlePin, onValueChange };
};
