import { Field, Formik } from 'formik';
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Col, Input, Label, Row } from 'reactstrap';
import { BsArrowLeftShort } from 'react-icons/bs';
import { BiDevices } from 'react-icons/bi';
import { FaInfo } from 'react-icons/fa';
import * as Yup from 'yup';
import { useSelector } from 'react-redux';

import { decode } from '../../../../../helpers/utils';
import { SetBackEndErrorsAPi } from '../../../../../hooks/setBEerror';
import { useProjectHeader } from '../../../Helpers/pageDiv/ProjectHeaderContext';
import AutosaveForm from '../../../components/AutoSaveForm';

import { fetchFloorPlanById, saveFloorPlan } from './services/floorPlanService';
import { FormInitializer } from '../../utils/pinServices'; 
import { Loader } from '../../utils/commonComponent';
 
const ValidationSchema = Yup.object().shape({
    floor_plan: Yup.string().required('This field is required.'),
    refImg:     Yup.mixed().nullable(),
});

const ZoomControl = ({ zoomValue, onZoomChange }) => {
    const percentage = `${Math.round(zoomValue * 100)}%`;
    return (
        <Row className="mt-2">
            <Col md={12}>
                <Label className="form-labels" style={{ marginBottom: '0px !important' }}>
                    Reference Image Size
                </Label>
                <div className="controls">
                    <span className="mr-2 zoompercent">
                        <p>{percentage}</p>
                    </span>
                    <input
                        type="range"
                        value={zoomValue}
                        min={0.1}
                        max={10}
                        step={0.01}
                        aria-labelledby="Zoom"
                        onChange={(e) => onZoomChange(Number(e.target.value))}
                        className="zoom-range"
                    />
                    <span className="ml-2">
                        <BiDevices />
                    </span>
                </div>
            </Col>
        </Row>
    );
}; 

const FloorPlanView = () => {
    const { id, subid } = useParams();
    const decodedId     = decode(id);
    const decodedSubid  = decode(subid);

    const navigate       = useNavigate();
    const projectData    = useSelector((state) => state.api.projectData);
    const { getProjectById } = useProjectHeader();

    const formRef = useRef();

    const [floorData, setFloorData] = useState({});
    const [loading, setLoading]     = useState(false);
    const [zoomValue, setZoomValue] = useState(1);
 
    useEffect(() => {
        if (!decodedSubid) return; 

        const load = async () => {
            setLoading(true)
            try {
                const data = await fetchFloorPlanById(decodedSubid);

                setFloorData({
                    ...data,
                    floor_plan:   data.floor_plan,
                    refImg:       data.cropped_path_base64,
                    plan:         data.cropped_image,
                    border_color: data.border_color,
                    fill_color:   data.fill_color,
                    border_thick: data.border_thick,
                    width:        data.width  ? Number(data.width)  : null,
                    height:       data.height ? Number(data.height) : null,
                });
 
                if (data?.img_size) {
                    const parsed = JSON.parse(data.img_size);
                    if (parsed?.zoom) setZoomValue(parsed.zoom);
                }
            } catch (err) {
                console.error('Failed to load floor plan:', err);
            }finally {
            setLoading(false);
        }
        };

        load();
    }, [decodedSubid]);

    useEffect(() => {
        if (decodedId) getProjectById(decodedId);
    }, [decodedId]);
 
    const handleSave = async (values, { setFieldError }) => { 
        // setLoading(true);
        try {
            const response = await saveFloorPlan({ values, projectData });

            if (response.type !== 1) {
                SetBackEndErrorsAPi(response, setFieldError);
            }
        } catch (err) {
            console.error('Save floor plan failed:', err);
        } finally {
            // setLoading(false);
        }
    };
 
    const handleZoomChange = (value) => {
        setZoomValue(value); 
        setTimeout(() => {
            document.getElementById('FloorPlanAddBtn')?.click();
        }, 300);
    };
 
    const handleToggleFloorImage = () => {
        setTimeout(() => {
            document.getElementById('FloorPlanAddBtn')?.click();
        }, 300);
    };

    const handleAutoSave = () => {
        document.getElementById('FloorPlanAddBtn')?.click();
    };

    const goBack = () => {
        if (loading) return;
        navigate(-1);
    };

    const initialValues = {
        floor_plan: '',
        refImg:     '',
        show_image: 0,
        ...floorData,
    };

    return (
        <div
            className="bar"
            id="inner-customizer2"
            style={{ position: 'relative', paddingBottom: 20 }}
        > 
            <Row className="backRow">
                <Col md={8}>
                    <h1>Floor Plan Details</h1>
                </Col>
                <Col md={4}>
                    <div className="backArrow float-right" onClick={goBack}>
                        <BsArrowLeftShort />
                    </div>
                </Col>
            </Row>

            {loading && <Loader/>}

            <Formik
                initialValues={initialValues}
                validationSchema={ValidationSchema}
                onSubmit={handleSave} 
            >
                {({ errors, values, touched, handleSubmit, handleChange, setFieldValue, setFieldError }) => (
                    <> 
                        <FormInitializer currentPinData={floorData} />

                        <AutosaveForm handleSubmit={handleAutoSave} />

                        <form
                            ref={formRef}
                            className="av-tooltip tooltip-label-bottom formGroups"
                            onSubmit={handleSubmit}
                        >
                            <div className="custom-scrollbar customScroll" style={{height:'calc(100vh - 90px)'}}>
                                <div className="bar-sub">
                                    <div className="bar-sub-header" style={{ marginTop: 0 }}>
                                        <p style={{ marginTop: 0 }}>Details</p>
                                    </div>

                                    <div className="pl-4 pr-4"> 
                                        <div className="marginBottom">
                                            <Label className="form-labels">Name</Label>
                                            <Field
                                                className="form-control"
                                                type="text"
                                                placeholder="Please Type Here (Eg. Level 1)"
                                                name="floor_plan"
                                                autoComplete="off"
                                                value={values.floor_plan ?? ''}
                                                onChange={handleChange}
                                            />
                                            {errors.floor_plan && touched.floor_plan && (
                                                <div className="text-danger mt-1">{errors.floor_plan}</div>
                                            )}
                                        </div>
 
                                        {values.plan && values.show_image == 1 && (
                                            <ZoomControl
                                                zoomValue={zoomValue}
                                                onZoomChange={handleZoomChange}
                                            />
                                        )}
 
                                        {values.plan && (
                                            <Row className="mt-4">
                                                <Col md={12}>
                                                    <div className="d-flex align-items-center justify-content-between">
                                                        <Label style={{ marginBottom: 0, fontSize: '1rem' }}>
                                                            Make reference image visible to the public
                                                        </Label>
                                                        <Input
                                                            type="checkbox"
                                                            name="show_image"
                                                            className="float-right"
                                                            checked={values.show_image == 1}
                                                            style={{ cursor: 'pointer', marginTop: 0 }}
                                                            onChange={(e) => {
                                                                setFieldValue('show_image', e.target.checked ? 1 : 0);
                                                                handleToggleFloorImage();
                                                            }}
                                                        />
                                                    </div>
                                                </Col>
                                            </Row>
                                        )}
                                    </div>
 
                                    <Button
                                        id="FloorPlanAddBtn"
                                        className="btn-primary bar-btn"
                                        type="submit"
                                        hidden
                                    >
                                        Save
                                    </Button>
 
                                    <div className="mt-3">
                                        <div className="warning-pin-div">
                                            <div className="d-flex align-items-center justify-content-center mb-2">
                                                <div className="info-cont">
                                                    <FaInfo />
                                                </div>
                                            </div>
                                            <div className="text-center">
                                                <p className="label color-labels">
                                                    Start a new floorplan by drawing, uploading a reference image,
                                                    or importing an existing SVG format floorplan. Reference images
                                                    can serve as a tracing guide within the designer and will remain
                                                    hidden from the end user unless the &apos;Make reference image
                                                    visible to the public&apos; checkbox is selected.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </>
                )}
            </Formik>
        </div>
    );
};

export default FloorPlanView;