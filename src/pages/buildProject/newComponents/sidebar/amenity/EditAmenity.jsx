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

import { useAmenitySubmit } from './hooks/useAmenityActions';
// import ProductFormFields from './components/ProductFormFields'; 
import { FormInitializer } from '../../utils/pinServices';  
import { fetchAmenityById, fetchAmenityIcons, normalizeAmenityData } from './services/amenityService'; 
import AmenityFormFields from './components/AmenityFormFields';

const EditAmenity = () => {
    useActiveTab('amenity');  

    const dispatch     = useDispatch();
    const navigate     = useNavigate();
    const { subid }    = useParams();
    const decodedSubid = decode(subid);
    const flyToPin     = useFlyToPin();

    const projectData = useSelector((state) => state.api.projectData);
 
    const [currentPinData, setCurrentPinData] = useState({});  
    // const [specifications, setSpecifications] = useState([]); 
    const [isDirty, setIsDirty]               = useState(false);
    const [color, setColor]                   = useState(null);
    const [openPicker, setOpenPicker]         = useState(null);
    const [planDetails, setPlanDetails]       = useState(null);
    const [planModal, setPlanModal]           = useState(false);
    const [amenityIcons, setAmenityIcons] = useState([]);
 
    useEffect(() => { 
        if (!decodedSubid) return;

        const load = async () => {
            try {
                const data = await fetchAmenityById(decodedSubid);
                const { prefillData } = normalizeAmenityData(data); 

                dispatch(setEditingPinId(decodedSubid));
                setCurrentPinData(prefillData);

                console.log(prefillData, "prefillData prefillData");
 
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
 
    
    const fetchIcons = async (id) =>{
        let response = await fetchAmenityIcons(id)
        setAmenityIcons(response)
    }
 
    const { submit } = useAmenitySubmit({ 
        setCurrentPinData,
        setIsDirty,
        setPlanModal,
        setPlanDetails,
    });

    const handleAutoSave = () => {
        document.getElementById('amenitySubmitBtn')?.click();
    };

    const goBack = () => {
        handleAutoSave();
        navigate(-1);
    };
 
    const initialValues = {
        amenity_name: '! New amenity',
        ...currentPinData,
    };

    return (
        <div
            className="bar"
            id="inner-customizer2"
            style={{ position: 'relative', height: window.innerHeight - 80, paddingBottom: 20 }}
        >
            <Row className="backRow">
                <Col md={8}>
                    <h1>Amenity Pin Details</h1>
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
                                    <AmenityFormFields
                                        values={values}
                                        errors={errors}
                                        touched={touched}
                                        handleChange={handleChange}
                                        setFieldValue={setFieldValue}
                                        color={color}
                                        setColor={setColor}
                                        openPicker={openPicker}
                                        setOpenPicker={setOpenPicker}
                                        setSelAmenityDtls={setCurrentPinData}
                                        setIsDirty={setIsDirty}
                                        // setMaxContentLimit={setMaxContentLimit}
                                        // maxContentLimit={maxContentLimit}
                                        projectSettings={projectData}
                                        amenityIcons={amenityIcons}
                                        handleAutoSave={handleAutoSave}
                                    />
                                </div>
                            </div>

                            <Button
                                id="amenitySubmitBtn"
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

export default EditAmenity;