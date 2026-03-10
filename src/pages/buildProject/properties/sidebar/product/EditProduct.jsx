import { Formik } from 'formik';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { BsArrowLeftShort } from 'react-icons/bs';
import { Button, Col, Row } from 'reactstrap';
import * as Yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';

import { decode } from '../../../../../helpers/utils';
import { setEditingPinId } from '../../../../../store/slices/projectItemSlice';
import { useActiveTab } from '../../../../../components/map/components/hooks/useActiveTab';
import AutosaveForm from '../../../components/AutoSaveForm';
import useFlyToPin from '../../../../../components/map/components/hooks/useFlyToPin';

import { fetchProductById, normalizeProductData } from './services/productService';
import useProductImageHandler, { useProductSubmit } from './hooks/useProductActions';
import ProductFormFields from './components/ProductFormFields';
import { FormInitializer } from '../../utils/pinServices';
import { postRequest } from '../../../../../hooks/axiosClient';
import { environmentaldatas } from '../../../../../constant/defaultValues';
const { image_url } = environmentaldatas;


const urlRegex = /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/[^\s]*)?$/i;

const validationSchema = Yup.object().shape({
    product_name: Yup.string(),
    websiteLink: Yup.array().of(
        Yup.object().shape({
            label: Yup.string().required('Name is required'),
            value: Yup.string()
                .required('URL is required')
                .test('is-valid-url', 'Enter a valid URL', (val) =>
                    !val || urlRegex.test(val.trim())
                ),
        })
    ),
});


const EditProduct = () => {
    useActiveTab('product');

    const dispatch     = useDispatch();
    const navigate     = useNavigate();
    const { id, subid } = useParams();
    const decodedSubid = decode(subid);
    const flyToPin     = useFlyToPin();

    const projectData = useSelector((state) => state.api.projectData);

    const [currentPinData, setCurrentPinData] = useState({});
    const [websiteLinks, setwebsiteLinks]     = useState([]);
    const [specifications, setSpecifications] = useState([]);
    const [isDirty, setIsDirty]               = useState(false);
    const [color, setColor]                   = useState(null);
    const [openPicker, setOpenPicker]         = useState(null);
    const [planDetails, setPlanDetails]       = useState(null);
    const [planModal, setPlanModal]           = useState(false);
    const [isSaving, setIsSaving]             = useState(false);

    const pendingNavigation = useRef(false);

    const imageHandler = useProductImageHandler({
        onUpload: (blob) => postImages(blob, 'post'),
        onDelete: (deleted) => postImages(deleted, 'delete')
    });

    useEffect(() => {
        if (!decodedSubid) return;

        const load = async () => {
            try {
                const data = await fetchProductById(decodedSubid);
                const { prefillData, websiteLinks: links, specificationsArray, uniqueImages } = normalizeProductData(data);

                dispatch(setEditingPinId(decodedSubid));
                setCurrentPinData(prefillData);
                setwebsiteLinks(links);
                setSpecifications(specificationsArray ?? []);

                if (uniqueImages?.length > 0) {
                    imageHandler.setImages(uniqueImages);
                }

                if (data?.positions) {
                    flyToPin(JSON.parse(data.positions));
                }
            } catch (err) {
                console.error('Failed to load product:', err);
            }
        };

        load();
    }, [decodedSubid]);

    const postImages = async (imagePath, type) => {
        const formData = new FormData();

        formData.append('id', currentPinData?.enc_id);
        formData.append('is_published', '0');
        formData.append('discard', '1');
        formData.append('publish', '1');

        if (currentPinData?.product_id) {
            formData.append('product_id', currentPinData?.product_id);
            formData.append('type', 3);
        }

        if (type === 'post') {
            formData.append(`image_path[0]`, imagePath[0]);
        } else {
            imagePath.forEach((deletedImage, index) => {
                const cleanedPath = deletedImage.replace(image_url, '');
                formData.append(`deleted_images[${index}]`, cleanedPath);
            });
        }

        const response = await postRequest("product-image", formData, true);
        return response;
    };

    const handleAfterSave = useCallback(() => {
        setIsSaving(false);
        if (pendingNavigation.current) {
            pendingNavigation.current = false;
            navigate(-1);
        }
    }, [navigate]);

    const { submit } = useProductSubmit({
        websiteLinks,
        specifications,
        imageHandler,
        setCurrentPinData,
        setIsDirty,
        setPlanModal,
        setPlanDetails,
        onAfterSave: handleAfterSave,
    });

    const handleAutoSave = useCallback(() => {
        document.getElementById('productSubmitBtn')?.click();
    }, []);

    const goBack = () => {
        if (isDirty) {
            setIsSaving(true);
            pendingNavigation.current = true;
            document.getElementById('productSubmitBtn')?.click();
        } else {
            navigate(-1);
        }
    };

    const initialValues = {
        product_name:  '! New product',
        description:   '',
        product_code:  '',
        website:       [],
        websiteLink:   websiteLinks,
        enc_id:        null,
        product_color: null,
        tags:          projectData?.product_tags ?? [],
        position:      null,
        type:          null,
        assignDetails: null,
        ...currentPinData,
    };

    return (
        <div
            className="bar"
            id="inner-customizer2"
            style={{ position: 'relative', height: window.innerHeight, paddingBottom: 20 }}
        >
            {/* Loading overlay shown while auto-saving before navigation */}
            {isSaving && (
                <div style={{
                    position:        'absolute',
                    top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(255, 255, 255, 0.75)',
                    display:         'flex',
                    alignItems:      'center',
                    justifyContent:  'center',
                    zIndex:          9999,
                }}>
                    <div className="spinner-border text-primary" role="status">
                        <span className="sr-only">Saving…</span>
                    </div>
                </div>
            )}

            <Row className="backRow">
                <Col md={8}>
                    <h1>Product Pin Details</h1>
                </Col>
                <Col md={4}>
                    <div className="backArrow float-right" onClick={goBack}>
                        <BsArrowLeftShort />
                    </div>
                </Col>
            </Row>

            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={submit}
            >
                {({ errors, values, touched, handleSubmit, handleChange, setFieldValue, setFieldError }) => (
                    <>
                        <FormInitializer currentPinData={currentPinData} />

                        {currentPinData?.position && !currentPinData?.enc_id && (
                            <AutosaveForm handleSubmit={handleAutoSave} />
                        )}

                        <form
                            id="productForm"
                            className="av-tooltip tooltip-label-bottom formGroups"
                            onSubmit={handleSubmit}
                        >
                            <div
                                className="custom-scrollbar customScroll"
                                style={{ height: window.innerHeight - 80 }}
                            >
                                <div className="bar-sub">
                                    <ProductFormFields
                                        values={values}
                                        errors={errors}
                                        touched={touched}
                                        handleChange={handleChange}
                                        setFieldValue={setFieldValue}
                                        setFieldError={setFieldError}
                                        {...imageHandler}
                                        websiteLinks={websiteLinks}
                                        setwebsiteLinks={setwebsiteLinks}
                                        specifications={specifications}
                                        setSpecifications={setSpecifications}
                                        color={color}
                                        setColor={setColor}
                                        openPicker={openPicker}
                                        setOpenPicker={setOpenPicker}
                                        setCurrentPinData={setCurrentPinData}
                                        setIsDirty={setIsDirty}
                                        projectData={projectData}
                                    />
                                </div>
                            </div>

                            <Button
                                id="productSubmitBtn"
                                className="btn-primary bar-btn"
                                type="submit"
                                hidden
                            >
                                Submit
                            </Button>
                        </form>
                    </>
                )}
            </Formik>
        </div>
    );
};

export default EditProduct;
