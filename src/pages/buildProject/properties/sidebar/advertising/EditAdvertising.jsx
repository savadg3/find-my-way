import { Formik } from 'formik';
import React, { useEffect, useState } from 'react'; 
import { Button, Col, Row } from 'reactstrap';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';

import { decode } from '../../../../../helpers/utils'; 
import { useActiveTab } from '../../../../../components/map/components/hooks/useActiveTab';
import AutosaveForm from '../../../components/AutoSaveForm'; 

import { FormInitializer } from '../../utils/pinServices';
import { fetchAdvertisingItemById, normalizeAdvertisingData } from './services/advertisingService';
import {  useAdvertisingImageHandler, useAdvertisingLinkHandler } from './hooks/useAdvertisingActions';
import AdvertisementFormFields from './components/AdvertisementFormFields'; 
import { IoMdCheckmark } from 'react-icons/io';
import { MdBlock } from 'react-icons/md';
import { useAdvertisingSubmit } from './hooks/useBuildAdvertisingPayload';

const EditAdvertising = () => {
    useActiveTab('advertisements');
 
    const navigate   = useNavigate();
    const { id, subid } = useParams();
    const decodedSubid  = decode(subid);  
 
    const [currentPinData, setCurrentPinData] = useState({}); 
    const [isDirty, setIsDirty]               = useState(false); 
 
    const imageHandler = useAdvertisingImageHandler();
    const { locationValues, handleURL, handlePin, onValueChange } = useAdvertisingLinkHandler(); 

    const { submit } = useAdvertisingSubmit({
        croppedImage: imageHandler.croppedImage, 
        blobImage:    imageHandler.blobImage, 
        setIsDirty,
        setCroppedImage: imageHandler.setCroppedImage,
        setBlobImage:    imageHandler.setBlobImage,
        setPreviewImage: imageHandler.setPreviewImage,
    });

    useEffect(() => {
        if (!decodedSubid) return;

        const load = async () => {
            try {
                const data = await fetchAdvertisingItemById(decodedSubid); 
                const { prefillData } = normalizeAdvertisingData(data); 
                setCurrentPinData(prefillData); 
            } catch (err) {
                console.error('Failed to load advertising item:', err);
            }
        };

        load();
    }, [decodedSubid]); 

    const goBack = () => { 
        if (isDirty) {
            document.getElementById('advertismentSubmitBtn')?.click();
        }else{
            navigate(`/project/${id}/advertisements`);
        }
    };
 
    const initialValues = {
        banner_name: '',
        start_date:  '',
        end_date:    '',
        ad_type:     1,
        duration:    '',
        link:        '',
        type_id:     '',
        ad_image:    '',
        type:        '',
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
                    <h1>Advertisement Details</h1>
                </Col>
                <Col md={4}>
                   <div className='d-flex gap-1 justify-end mx-3'>
                        <div className='backArrow m-0' onClick={() => {
                            navigate(`/project/${id}/advertisements`)
                        }}>
                            <MdBlock />
                        </div>

                        <div className='plus-icon ' onClick={() => 
                            goBack()
                        } >
                            <IoMdCheckmark />
                        </div>
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

                        <form
                            className="av-tooltip tooltip-label-bottom formGroups"
                            onSubmit={handleSubmit}
                        >
                            <div
                                className="custom-scrollbar customScroll"
                                style={{ height: window.innerHeight - 80 }}
                            >
                                <div className="bar-sub">
                                    <AdvertisementFormFields 
                                        values={values}
                                        errors={errors}
                                        touched={touched}
                                        handleChange={handleChange}
                                        setFieldValue={setFieldValue} 
                                        {...imageHandler} 
                                        locationValues={locationValues}
                                        handleURL={handleURL}
                                        handlePin={handlePin}
                                        onValueChange={onValueChange} 
                                        currentPinData={currentPinData}
                                        setCurrentPinData={setCurrentPinData} 
                                        setIsDirty={setIsDirty}
                                    />
                                </div>
                            </div>

                            <Button
                                id="advertismentSubmitBtn"
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

export default EditAdvertising;