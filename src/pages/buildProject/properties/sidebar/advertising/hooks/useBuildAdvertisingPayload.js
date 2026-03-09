import { useSelector } from 'react-redux';
import { postRequest } from '../../../../../../hooks/axiosClient';
import { environmentaldatas } from '../../../../../../constant/defaultValues';
import { decode, getCurrentUser } from '../../../../../../helpers/utils';
import { dateFormatYYYYMMDD } from '../../../utils/pinServices';
import { SetBackEndErrorsAPi } from '../../../../../../hooks/setBEerror';
import { useNavigate, useParams } from 'react-router-dom';

const { image_url } = environmentaldatas;

export const useBuildAdvertisingPayload = ({ decodedId, croppedImage, blobImage }) => {
    const projectData = useSelector((state) => state.api.projectData);

    const build = (values) => {
        const user       = getCurrentUser()?.user;
        const customerId = projectData?.enc_customer_id ?? user?.common_id;

        const payload = {
            customer_id: customerId,
            project_id:  decodedId,
            banner_name: values.banner_name ?? '',
            start_date:  dateFormatYYYYMMDD(values.start_date),
            end_date:    dateFormatYYYYMMDD(values.end_date),
            ad_type:     values.ad_type,
            duration:    values.duration,
        };

        if (values.enc_id) {
            payload.is_published = '0';
            payload.discard      = '1';
            payload.publish      = '1';
            payload._method      = 'PUT';
        }

        if (values.ad_type === 1) {
            payload.link = values.link ?? '';
        } else {
            payload.type    = values.type    ?? '';
            payload.type_id = values.type_id ?? '';
        }

        if (croppedImage?.startsWith('data:image')) {
            payload.ad_image = blobImage;
        } else {
            payload.ad_image = values.ad_image
                ? values.ad_image.replace(image_url, '')
                : '';
        }

        console.log(payload);

        const formData = new FormData();
        Object.entries(payload).forEach(([key, val]) => {
            formData.append(key, val);
        });

        return formData;
    };

    return build;
};

export const useAdvertisingSubmit = ({
    croppedImage,
    blobImage,
    setIsDirty,
    setCroppedImage,
    setBlobImage,
    setPreviewImage,
    onAfterSave,
}) => {
    const navigate = useNavigate()
    const { id, subid } = useParams();
    const decodedSubid  = decode(subid);  
    const decodedId  = decode(id);  
    const build         = useBuildAdvertisingPayload({ decodedId, croppedImage, blobImage });

    const submit = async (values, { setFieldError }) => {
        try {
            const formData = build(values);
            const reqUrl   = decodedSubid
                ? `advertisements/${decodedSubid}`
                : 'advertisements';

            const response = await postRequest(reqUrl, formData, true);

            if (response.type === 1) {
                setCroppedImage(null);
                setBlobImage(null);
                setPreviewImage(null);
                setIsDirty(false);

                let enc_id = response?.response?.data?.enc_id;
                if (enc_id) {
                    navigate(`/project/${id}/advertisements`);
                } else {
                    onAfterSave?.();
                }
            } else {
                SetBackEndErrorsAPi(response, {setFieldError});
                onAfterSave?.();
            }

        } catch (error) {
            console.error('Advertisement save failed:', error);
            onAfterSave?.();
        }
    };

    return { submit };
};