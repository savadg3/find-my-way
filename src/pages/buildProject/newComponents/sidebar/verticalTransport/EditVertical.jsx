import { Formik } from 'formik';
import React, { useEffect, useState } from 'react';
import { BsArrowLeftShort } from 'react-icons/bs';
import { Button, Col, Row } from 'reactstrap'; 
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';

import { decode } from '../../../../../helpers/utils';
import { setEditingPinId } from '../../../../../store/slices/projectItemSlice';
import { useActiveTab } from '../../../../../components/map/components/hooks/useActiveTab';
import AutosaveForm from '../../../components/AutoSaveForm';
import useFlyToPin from '../../../../../components/map/components/hooks/useFlyToPin';

import { FormInitializer, useDebouncedAutoSave } from '../../utils/pinServices';  
import { fetchVerticalById, fetchVerticalIcons, normalizeVerticalData } from './services/verticalService'; 
import VerticalTransportFormFields from './components/VerticalTransportFormFields';
import { useVerticalSubmit } from './hooks/useVerticalActions';
import { toast } from 'react-toastify';
import { setPlacedLocation } from '../../../../../store/slices/verticalPlacementSlice';

const EditVertical = () => {
    // useActiveTab('vertical');  
    useActiveTab('location');  

    const dispatch     = useDispatch();
    const navigate     = useNavigate();
    const { id, subid }    = useParams();
    const decodedSubid = decode(subid);
    const flyToPin     = useFlyToPin(); 

    const projectData = useSelector((state) => state.api.projectData);
    const placedLocation = useSelector((state) => state.vertical.placedLocation); 
 
    const [currentPinData, setCurrentPinData] = useState({});   
    const [isDirty, setIsDirty]               = useState(false);
    const [color, setColor]                   = useState(null);
    const [openPicker, setOpenPicker]         = useState(null);
    const [planDetails, setPlanDetails]       = useState(null);
    const [planModal, setPlanModal]           = useState(false);
    const [verticalIcons, setVerticalIcons] = useState([]);
 
    useEffect(() => { 
        if(decodedSubid == 0 && subid == 0){
            fetchIcons(0);
        }
        if (!decodedSubid) return;

        const load = async () => {
            try {
                const data = await fetchVerticalById(decodedSubid);
                const { prefillData } = normalizeVerticalData(data); 

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

    useEffect(() => { 
        if (!placedLocation) return; 
        setCurrentPinData((prev) => {
            const pins = (prev?.connectionPins || []).map((item, idx, arr) => {
                if (idx === arr.length - 1) {
                    return {
                        ...item,
                        position: placedLocation
                    };
                }
                return item;
            });

            return {
                ...prev,
                connectionPins: pins
            };
        });
        dispatch(setPlacedLocation(false));

        handleAutoSave()
    }, [placedLocation]);
  
    const fetchIcons = async (id) =>{
        let response = await fetchVerticalIcons(id)
        setVerticalIcons(response)
    }
 
    const { submit } = useVerticalSubmit({ 
        setCurrentPinData,
        setIsDirty,
        setPlanModal,
        setPlanDetails,
    }); 

    const addNewPins = (setFieldValue, values) => {
        const lastAddedPin = values?.connectionPins[values?.connectionPins.length - 1]
        
        if (values?.connectionPins.length > 0) {
            if (lastAddedPin?.value && lastAddedPin?.position) { 
                setFieldValue(`connectionPins[${values?.connectionPins.length}]`, '') 
            } else {
                toast.warning('Please place your connection pin on the floor plan.');
            }
        } else { 
            setFieldValue(`connectionPins[${values?.connectionPins.length}]`, '')
        }
    
    };

    const handleAutoSave = () => {
        setTimeout(() => {
            document.getElementById('verticalSubmitBtn')?.click();
        }, 300);
    };
    const debouncedAutoSave = useDebouncedAutoSave(()=>{document.getElementById('verticalSubmitBtn')?.click()}, 800);

    const goBack = () => { 
        if(isDirty){
            document.getElementById('verticalSubmitBtn')?.click();
        }
        navigate(`/project/${id}/vertical-transport`);
    };
 
    const initialValues = React.useMemo(() => ({
        vt_name           :  'New vertical transport',
        connectionPins    :  [], 
        icon              :  16,
        is_wheelchair     :  0,
        movement_direction: 'bidirectional',
        vt_color          :  projectData?.vt_color,  
        ...currentPinData,
    }), [currentPinData]);

    return (
        <div
            className="bar"
            id="inner-customizer2"
            style={{ position: 'relative', height: window.innerHeight - 80, paddingBottom: 20 }}
        >
            <Row className="backRow">
                <Col md={8}>
                    <h1>Vertical Transport Details</h1>
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
                enableReinitialize
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
                                    <VerticalTransportFormFields
                                        values={values}
                                        errors={errors}
                                        touched={touched}
                                        handleChange={handleChange}
                                        setFieldValue={setFieldValue}
                                        verticalIcons={verticalIcons}
                                        projectSettings={projectData}
                                        color={color}
                                        setColor={setColor}
                                        openPicker={openPicker}
                                        setOpenPicker={setOpenPicker}
                                        setselVerticalDtls={setCurrentPinData}
                                        setIsDirty={setIsDirty} 
                                        addNewPins={addNewPins}
                                        // onLevelDDChange={onLevelDDChange}
                                        // removePin={removePin}
                                        autoSaveOnChange={handleAutoSave}
                                        debouncedAutoSave={debouncedAutoSave}
                                    />
                                </div>
                            </div>

                            <Button
                                id="verticalSubmitBtn"
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

export default EditVertical;