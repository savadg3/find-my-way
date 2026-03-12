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

import { useBeaconSubmit } from './hooks/useBeaconActions';
import { FormInitializer } from '../../utils/pinServices';
import { fetchBeaconById, normalizeBeaconData } from './services/beaconService';
import BeaconFormFields from './components/BeaconFormFields';
import { Loader } from '../../utils/commonComponent';

const EditBeacon = () => {
    useActiveTab('all');

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
    const [isSaving, setIsSaving]             = useState(false);
    const [loading, setLoading]               = useState(false);

    const pendingNavigation = useRef(false);

    useEffect(() => {
        if (!decodedSubid) return;

        const load = async () => {
            setLoading(true)
            try {
                const data = await fetchBeaconById(decodedSubid);
                const { prefillData } = normalizeBeaconData(data);
                
                dispatch(setEditingPinId(decodedSubid));
                setCurrentPinData(prefillData);
                
                if (data?.positions) {
                    flyToPin(JSON.parse(data.positions));
                }
                setLoading(false)
            } catch (err) {
                console.error('Failed to load product:', err);
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

    const { submit } = useBeaconSubmit({
        setCurrentPinData,
        setIsDirty,
        setPlanModal,
        setPlanDetails,
        onAfterSave: handleAfterSave,
    });

    const handleAutoSave = useCallback(() => {
        document.getElementById('beaconSubmitBtn')?.click();
    }, []);

    const goBack = () => {
        if (isDirty) {
            setIsSaving(true);
            pendingNavigation.current = true;
            document.getElementById('beaconSubmitBtn')?.click();
        } else {
            navigate(-1);
        }
    };

    const initialValues = {
        beacon_name: '! New beacon',
        message: '',
        enc_id: null,
        position: null,
        heading: 'Find Your Destination',
        content: null,
        subheading: 'Instant directions with no app download',
        heading_color: '#FFFFFF',
        subheading_color: '#26A3DB',
        content_color: '#1D1D1B',
        bg_color: '#8BCDEB',
        ...currentPinData,
    };

    return (
        <div
            className="bar"
            id="inner-customizer2"
            style={{ position: 'relative', height: window.innerHeight, paddingBottom: 20 }}
        >
            {(isSaving || loading) && (
                <Loader/> 
            )}

            <Row className="backRow">
                <Col md={8}>
                    <h1>QR Code Beacon Details</h1>
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
                                    <BeaconFormFields
                                        values={values}
                                        errors={errors}
                                        touched={touched}
                                        handleChange={handleChange}
                                        setFieldValue={setFieldValue}
                                        color={color}
                                        setColor={setColor}
                                        openPicker={openPicker}
                                        setOpenPicker={setOpenPicker}
                                        setSelBeaconDtls={setCurrentPinData}
                                        setIsDirty={setIsDirty}
                                        projectSettings={projectData}
                                    />
                                </div>
                            </div>

                            <Button
                                id="beaconSubmitBtn"
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

export default EditBeacon;
