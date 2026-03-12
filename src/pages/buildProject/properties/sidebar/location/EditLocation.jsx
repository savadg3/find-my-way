import { Formik, useFormikContext } from 'formik';
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

import { fetchLocationById, normalizeLocationData } from './services/locationService';
import { useLocationSubmit, usePromotionSubmit } from './hooks/useLocationActions';
import LocationFormFields from './components/LocationFormFields';
import useFlyToPin from '../../../../../components/map/components/hooks/useFlyToPin';
import { FormInitializer } from '../../utils/pinServices';
import { Loader } from '../../utils/commonComponent';
 

const urlRegex = /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/[^\s]*)?$/i;

const validationSchema = Yup.object().shape({
    contact: Yup.number().typeError('Please type numbers only.').nullable(),
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
 

const EditLocation = () => {
    useActiveTab('all');

    const dispatch       = useDispatch();
    const navigate       = useNavigate();
    const { id, subid }  = useParams();
    const decodedSubid   = decode(subid);

    const projectData    = useSelector((state) => state.api.projectData);
    const flyToPin       = useFlyToPin();
 
    const [currentPinData, setCurrentPinData] = useState({});
    const [hours, setHours]                   = useState({});
    const [promotions, setPromotions]         = useState([]);
    const [websiteLinks, setwebsiteLinks]     = useState([]);
    const [isBoundary, setIsBoundary]         = useState(false);
    const [isDirty, setIsDirty]               = useState(false);
    const [isError, setIsError]               = useState(false);
    const [promotionError, setPromotionError] = useState(false);
    const [triedToSubmit, setTriedToSubmit]   = useState(true);
    const [color, setColor]                   = useState(null);
    const [openPicker, setOpenPicker]         = useState(null);
    const [maxContentLimit, setMaxContentLimit] = useState(false);
    const [planDetails, setPlanDetails]       = useState(null);
    const [modal, setModal]                   = useState(false);
    const [isSaving, setIsSaving]             = useState(false);
    const [loading, setLoading]               = useState(false);
 
    const boundaryAttributesRef = useRef(undefined);
    const pendingNavigation     = useRef(false);
 
    useEffect(() => {
        if (!decodedSubid) return;

        const load = async () => {
            setLoading(true)
            try {
                const data = await fetchLocationById(decodedSubid);
                const { prefillData, normalizedPromotions, websiteLinks, hours } = normalizeLocationData(data);
                dispatch(setEditingPinId(decodedSubid));
                setCurrentPinData(prefillData);
                setPromotions(normalizedPromotions);
                setwebsiteLinks(websiteLinks);
                setHours(hours);
                if(data?.positions){
                    flyToPin(JSON.parse(data?.positions));
                }
                setLoading(false)
            } catch (err) {
                console.error('Failed to load location:', err);
                setLoading(false)
            }
        };

        load();
    }, [decodedSubid]);

    const handleAfterSave = useCallback(() => {
        setIsSaving(false);
        if (pendingNavigation.current) {
            pendingNavigation.current = false;
            navigate(-1);
        }
    }, [navigate]);

    const { submit } = useLocationSubmit({
        websiteLinks,
        hours,
        isBoundary,
        boundaryAttributesRef,
        setModal,
        setPlanDetails,
        onAfterSave: handleAfterSave,
    });

    const { handleSubmit: submitPromotion } = usePromotionSubmit({
        currentPinData,
        promotions,
        setPromotions,
        setPromotionError,
        promotionError,
    });

    const handleAutoSave = useCallback(() => {
        document.getElementById('locationSubmitBtn')?.click();
    }, []);

    const goBack = () => {
        if (isDirty) {
            setIsSaving(true);
            pendingNavigation.current = true;
            document.getElementById('locationSubmitBtn')?.click();
        } else {
            navigate(-1);
        }
    };

    const initialValues = {
        location_name:  '! New location',
        message:        '',
        description:    '',
        contact:        '',
        website:        [],
        websiteLink:    websiteLinks,
        enc_id:         null,
        boundary_color: null,
        location_color: null,
        tags:           projectData?.location_tags ?? [],
        isBoundary:     false,
        position:       null,
        ...currentPinData,
    };

    return (
        <div
            className="bar"
            id="inner-customizer2"
            style={{ position: 'relative', 
                // height: window.innerHeight - 80,
                height: "100%",
                 paddingBottom: 20 }}
        > 
            {(isSaving || loading) && (
                <Loader/> 
            )}

            <Row className="backRow">
                <Col md={8}>
                    <h1>Location Pin Details</h1>
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
                            id="locationForm"
                            className="av-tooltip tooltip-label-bottom formGroups"
                            onSubmit={handleSubmit}
                        >
                            <div className="custom-scrollbar customScroll" style={{ height: window.innerHeight - 80 }}>
                                <div className="bar-sub">
                                    <LocationFormFields
                                        values={values}
                                        errors={errors}
                                        touched={touched}
                                        handleChange={handleChange}
                                        setFieldValue={setFieldValue}
                                        setFieldError={setFieldError}
                                        hours={hours}
                                        setHours={setHours}
                                        setIsError={setIsError}
                                        websiteLinks={websiteLinks}
                                        setwebsiteLinks={setwebsiteLinks}
                                        promotions={promotions}
                                        setPromotions={setPromotions}
                                        setPromotionError={setPromotionError}
                                        triedToSubmit={triedToSubmit}
                                        setTriedToSubmit={setTriedToSubmit}
                                        isBoundary={isBoundary}
                                        setIsBoundary={setIsBoundary}
                                        color={color}
                                        setColor={setColor}
                                        openPicker={openPicker}
                                        setOpenPicker={setOpenPicker}
                                        setCurrentPinData={setCurrentPinData}
                                        setIsDirty={setIsDirty}
                                        postPromotion={submitPromotion}
                                        projectData={projectData}
                                        currentPinData={currentPinData}
                                        setMaxContentLimit={setMaxContentLimit}
                                    />
                                </div>
                            </div>

                            <Button
                                id="locationSubmitBtn"
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

export default EditLocation;
