import { Formik } from 'formik';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { BsArrowLeftShort } from 'react-icons/bs';
import { Button, Col, Row } from 'reactstrap';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';

import { decode } from '../../../../../helpers/utils';
import { setEditingPinId } from '../../../../../store/slices/projectItemSlice';
import { useActiveTab } from '../../../../../components/map/components/hooks/useActiveTab';
import AutosaveForm from '../../../components/AutoSaveForm';
import useFlyToPin from '../../../../../components/map/components/hooks/useFlyToPin';

import { useSafetySubmit } from './hooks/useSafetyActions';
import { FormInitializer } from '../../utils/pinServices';
import { fetchSafetyById, fetchSafetyIcons, normalizeSafetyData } from './services/safetyService';
import SafetyFormFields from './components/SafetyFormFields';

const EditSafety = () => {
    useActiveTab('safety');

    const dispatch     = useDispatch();
    const navigate     = useNavigate();
    const { subid }    = useParams();
    const decodedSubid = decode(subid);
    const flyToPin     = useFlyToPin();

    const projectData = useSelector((state) => state.api.projectData);

    const [currentPinData, setCurrentPinData] = useState({});
    const [isDirty, setIsDirty]               = useState(false);
    const [color, setColor]                   = useState(null);
    const [openPicker, setOpenPicker]         = useState(null);
    const [planDetails, setPlanDetails]       = useState(null);
    const [planModal, setPlanModal]           = useState(false);
    const [safetyIcons, setSafetyIcons]       = useState([]);
    const [isSaving, setIsSaving]             = useState(false);

    const pendingNavigation = useRef(false);

    useEffect(() => {
        if (!decodedSubid) return;

        const load = async () => {
            try {
                const data = await fetchSafetyById(decodedSubid);
                const { prefillData } = normalizeSafetyData(data);

                dispatch(setEditingPinId(decodedSubid));
                setCurrentPinData(prefillData);

                if (data?.positions) {
                    flyToPin(JSON.parse(data.positions));
                }
            } catch (err) {
                console.error('Failed to load product:', err);
            }
        };

        load();
        fetchIcons(0);
    }, [decodedSubid]);

    const fetchIcons = async (id) => {
        let response = await fetchSafetyIcons(id);
        setSafetyIcons(response);
    };

    const handleAfterSave = useCallback(() => {
        setIsSaving(false);
        if (pendingNavigation.current) {
            pendingNavigation.current = false;
            navigate(-1);
        }
    }, [navigate]);

    const { submit } = useSafetySubmit({
        setCurrentPinData,
        setIsDirty,
        setPlanModal,
        setPlanDetails,
        onAfterSave: handleAfterSave,
    });

    const handleAutoSave = useCallback(() => {
        document.getElementById('safetySubmitBtn')?.click();
    }, []);

    const goBack = () => {
        if (isDirty) {
            setIsSaving(true);
            pendingNavigation.current = true;
            document.getElementById('safetySubmitBtn')?.click();
        } else {
            navigate(-1);
        }
    };

    const initialValues = {
        safety_name: '! New safety',
        ...currentPinData,
    };

    return (
        <div
            className="bar"
            id="inner-customizer2"
            style={{ position: 'relative', height: window.innerHeight - 80, paddingBottom: 20 }}
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
                    <h1>Safety Pin Details</h1>
                </Col>
                <Col md={4}>
                    <div className="backArrow float-right" onClick={goBack}>
                        <BsArrowLeftShort />
                    </div>
                </Col>
            </Row>

            <Formik
                initialValues={initialValues}
                onSubmit={submit}
            >
                {({ errors, values, touched, handleSubmit, handleChange, setFieldValue, setFieldError }) => (
                    <>
                        <FormInitializer currentPinData={currentPinData} />

                        {currentPinData?.position && !currentPinData?.enc_id && (
                            <AutosaveForm handleSubmit={handleAutoSave} />
                        )}

                        <form
                            className="av-tooltip tooltip-label-bottom formGroups"
                            onSubmit={handleSubmit}
                        >
                            <div
                                className="custom-scrollbar customScroll"
                                style={{ height: window.innerHeight - 80 }}
                            >
                                <div className="bar-sub">
                                    <SafetyFormFields
                                        values={values}
                                        errors={errors}
                                        touched={touched}
                                        handleChange={handleChange}
                                        setFieldValue={setFieldValue}
                                        color={color}
                                        setColor={setColor}
                                        openPicker={openPicker}
                                        setOpenPicker={setOpenPicker}
                                        setSelSafetyDtls={setCurrentPinData}
                                        setIsDirty={setIsDirty}
                                        projectSettings={projectData}
                                        safetyIcons={safetyIcons}
                                        handleAutoSave={handleAutoSave}
                                    />
                                </div>
                            </div>

                            <Button
                                id="safetySubmitBtn"
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

export default EditSafety;
