import { Field, Formik } from 'formik'
import * as Yup from 'yup';
import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from "react-router-dom";
import BoderThickIco from '../../../assets/icons/border_thickness.png'
import { Button, Label, Row, Col } from 'reactstrap'
import TagInputComp from '../../../components/tagInput/TagInputComp'
import { postRequest, getRequest } from '../../../hooks/axiosClient';
import { getCurrentUser } from '../../../helpers/utils';
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { SetBackEndErrorsAPi } from '../../../hooks/setBEerror';
import ImageUploader from '../../../components/constants/imageCropNew';
import ColorPicker from '../../../components/common/Colorpicker';
import styled from "styled-components";
import { environmentaldatas } from '../../../constant/defaultValues';
import { IoMdClose } from 'react-icons/io';
import AutosaveForm from './AutoSaveForm';
import { BsArrowLeftShort } from 'react-icons/bs';
import canvasBackGroundColor from '../Helpers/canvas/canvasBGcolor';
import CommonDropdown from '../../../components/common/CommonDropdown';
import Select from "react-select";

const { image_url } = environmentaldatas;

const ValidationSchema = Yup.object().shape({
    // project_name: Yup.string().required('This field is required.'),
    error_reporting_email: Yup.string().nullable()
        .email("Invalid email format.")
    // error_reporting_email: Yup.string().required('This field is required.')
    //     .email("Invalid email format.")
})


const PSSideBar = ({
    projectSettings, setProjectSettings, id, savingTimer, setSavingTimer,
    getFloorDropdown,
    setDropDownFloor,
    setFloorID,
    getFloorPlanByid,
    floorPlanSelect,
    handleEnableDisable, getProjectById,
    croppedImage, setCroppedImage,
    setLoading, loading, projectSettingData,
    setProjectSettingData,
    floorID, setCommonSidebarVisible, setIsValid, canvas
}) => {
    const [mapDivSize, setMapDivSize] = useState(window.innerHeight - 80)

    const logoSelectRef = useRef()
    const [previewImage, setPreviewImage] = useState(null);
    const [blobImage, setBlobImage] = useState(null);
    const [postCall, setPostCall] = useState(false);
    const [modal, setModal] = useState(false);
    const [triedToSubmit, setTriedToSubmit] = useState(true)
    const [fileKey, setFileKey] = useState(Date.now());
    const [openPicker, setOpenPicker] = useState(null);
    const toggle2 = () => setModal(!modal);
    const [color, setColor] = useState(null);

    useEffect(() => {
        getProjectById()
    }, [])

    useEffect(() => {
        if (floorPlanSelect.length > 0) {
            getLastFloorData()
        }
    }, [floorPlanSelect])

    const getLastFloorData = () => {
        const lastAddedFloor = floorPlanSelect[0];
        const floor = floorPlanSelect.find((el) => el.enc_id == floorID);
        if (floorID) {
            getFloorPlanByid(floorID, 'settings', "0");
            setDropDownFloor({
                value: floor?.enc_id,
                label: floor?.floor_plan,
                id: floor?.enc_id,
                plan: floor?.plan,
                dec_id: floor?.dec_id
            });
        } else {
            if (lastAddedFloor) {
                getFloorPlanByid(lastAddedFloor?.enc_id, 'settings', '0');
                setDropDownFloor({
                    value: lastAddedFloor?.enc_id,
                    label: lastAddedFloor?.floor_plan,
                    id: lastAddedFloor?.enc_id,
                    plan: lastAddedFloor?.plan,
                    dec_id: lastAddedFloor?.dec_id
                });
            }
        }
    }

    const Container = styled.span`
    display: inline-flex;
    align-items: center;
    width: 110px;
    max-width: 150px;
    padding: 3px 4px;
    border: 1px solid #F5F6F7;
    border-radius: 6px;
  
    input[type="color"] {
      margin-right: 8px;
      -webkit-appearance: none;
      border: none;
      width: auto;
      height: auto;
      cursor: pointer;
      background: none;
      outline: none;
      &::-webkit-color-swatch-wrapper {
        padding: 0;
        width: 15px;
        height: 15px;
      }
      &::-webkit-color-swatch {
        border: 1px solid transparent;
        border-radius: 3px;
        padding: 0;
      }
    }
  
    input[type="text"] {
      border: none;
      width: 100%;
      font-size: 11.12px;
      outline: none;

    }
  `;

    const onSubmit = async (values, setFieldError) => {
        setTriedToSubmit(true)
        setSavingTimer(true)
        canvasBackGroundColor(values?.background_color, canvas)


        const formdata = new FormData();
        if (croppedImage?.startsWith('data:image')) {
            const base64Logo = croppedImage;
            // console.log(blobImage)
            formdata.append(`logo`, blobImage);
        } else {
            const trimmedImageUrl = (values?.logo) ? (values?.logo?.replace(image_url, '')) : '';

            formdata.append(`logo`, trimmedImageUrl ?? '');
        }
        formdata.append(`customer_id`, values?.enc_customer_id ?? getCurrentUser()?.user?.common_id);
        formdata.append(`project_name`, values?.project_name);
        formdata.append(`background_color`, values?.background_color);
        formdata.append(`fill_color`, values?.fill_color);
        formdata.append(`border_thick`, values?.border_thick);
        formdata.append(`border_color`, values?.border_color);
        formdata.append(`inactive_color`, values?.inactive_color);
        formdata.append(`location_color`, values?.location_color);
        formdata.append(`product_color`, values?.product_color);
        formdata.append(`start_color`, values?.start_color);
        formdata.append(`beacon_color`, values?.beacon_color);
        formdata.append(`amenity_color`, values?.amenity_color);
        formdata.append(`safety_color`, values?.safety_color);
        formdata.append(`level_change_color`, values?.level_change_color);
        formdata.append(`navigation_color`, values?.navigation_color);
        formdata.append(`error_reporting_email`, values?.error_reporting_email ?? '');
        formdata.append(`navigation_thick`, values?.navigation_thick ?? '3');
        formdata.append(`nav_btn_color`, values?.nav_btn_color ?? '#1a91d3');
        formdata.append(`nav_btn_text_color`, values?.nav_btn_text_color ?? '#fff');
        if (values?.pass_update) {
            formdata.append(`pass_update`, values?.pass_update ? 1 : 0);
        } else {
            formdata.append(`pass_update`, 0);
        }
        if (values?.is_pass_protected) {
            formdata.append(`is_pass_protected`, values?.is_pass_protected ? 1 : 0);
        } else {
            formdata.append(`is_pass_protected`, 0);
        }

        if (id != 0) {
            formdata.append(`_method`, 'PUT');
            formdata.append(`id`, id);
            formdata.append(`is_published`, '0');
            formdata.append(`discard`, '1');
            formdata.append(`publish`, '1');
        }

        try {
            const reqUrl = id != 0 ? `project/${id}` : `project`;
            const response = await postRequest(reqUrl, formdata, true);
            // console.log(response)
            const data = response.response?.data ?? [];
            if (response.type === 1) {
                setCroppedImage('');
                setBlobImage()
                getProjectById(data?.id);
                setIsValid(true)

            } else {
                SetBackEndErrorsAPi(response, setFieldError);
                setIsValid(false)

            }
        } catch (error) {
            console.log(error);
        }
    }

    const BorderWidthComp = ({ label, value, onChange, name }) => {
        return (
            <div className='color-input-wrpr mb-4' >
                <p className='label color-label' >{label}</p>
                <div className=' input-wrpr' >
                    <img src={BoderThickIco} alt='' className='color-picker' style={{ backgroundColor: value }} />
                    <input
                        value={value}
                        onChange={onChange}
                        // className="form-control"
                        type="number"
                        name={name}
                        style={{ width: 77 }}
                    />
                </div>
            </div>
        )
    }

    const handleFileUpload = (event, setFieldValue) => {
        const file = event
        setFieldValue(event)
        setFileKey(Date.now());
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result);
            };
            reader.readAsDataURL(file);
            setModal(true);

        }
    };
    const handleDeleteImage = (setFieldValue) => {
        setCroppedImage('');
        setFieldValue('logo', '')

    }
    const handleResize = () => {
        const { clientHeight } = window.document.getElementById('pageDiv')
        setMapDivSize(window.innerHeight - 80)
    }
    useEffect(() => {

        window.addEventListener('resize', handleResize);
        handleResize()
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const handleAutoSave = () => {
        document.getElementById("prpjectSettingsBtn")?.click();
    }

    const goBack = () => {
        setCommonSidebarVisible(true)
    }

    const handlePickerClick = (name) => {
        setOpenPicker(name);
    };

    return (
        <div className=" bar" style={{ position: 'relative', height: mapDivSize, paddingBottom: '20px' }} id="inner-customizer"  >
            <Row className='backRow'>
                <Col md={8}>
                    <h1>Project Settings</h1>
                </Col>
                <Col md={4} >
                    <div className='backArrow float-right' onClick={goBack}>
                        <BsArrowLeftShort />
                    </div>
                </Col>
            </Row>
            {loading ? (
                <div className="w-100 ml-3 pt-2 position-relative">
                    Loading...
                    <div className="loading  top-50  translate-middle left-0 position-absolute" />
                </div>
            ) :
                <div className='sub' >
                    <Formik
                        initialValues={projectSettingData}
                        validationSchema={ValidationSchema}
                        onSubmit={(values, setFieldError) => {
                            onSubmit(values, setFieldError)
                        }}
                        enableReinitialize={true}
                    >
                        {({
                            errors,
                            values,
                            touched,
                            handleSubmit,
                            handleChange,
                            setFieldValue,
                            setFieldError
                        }) => (
                            <>
                                <AutosaveForm handleSubmit={handleAutoSave} setSavingTimer={setSavingTimer} savingTimer={savingTimer} />
                                <form
                                    onSubmit={(e) => handleSubmit(e, setFieldError)}
                                >
                                    <div className='custom-scrollbar customScroll' style={{ height: mapDivSize }} >

                                        <div className='bar-sub-header' style={{ marginTop: 0 }} >
                                            <p style={{ marginTop: 0 }} >Details</p>
                                        </div>
                                        <div className='pl-4 pr-4'>
                                            <Label className="form-labels">Project Logo</Label><span className="asterisk">*</span>
                                            <Row className="marginBottom">
                                                {croppedImage ? (
                                                    <Col sm={7} md={7} lg={8} xl={7} >
                                                        {croppedImage &&
                                                            <div className='logo-div'>
                                                                <img src={croppedImage} style={{ border: '1px solid #ccc', borderRadius: '5px', objectFit: 'contain', width: 'auto' }}></img>
                                                                <span className='delete-logo-icon' style={{ right: '0px' }} ><div onClick={() => handleDeleteImage(setFieldValue)} className='ml-4 p-1 rounded-circle' style={{ backgroundColor: '#E5E5E5', cursor: 'pointer', }} >
                                                                    <IoMdClose style={{ fontSize: '10px' }} />
                                                                </div></span>
                                                            </div>
                                                        }
                                                    </Col>
                                                ) : (
                                                    <Col sm={7} md={7} lg={8} xl={7} >
                                                        <div className='select-logo project' onClick={() => logoSelectRef.current.click()} >
                                                            <p>+</p>
                                                        </div>
                                                        <input key={fileKey} type='file' accept="image/png, image/jpeg, image/jpg" ref={logoSelectRef} hidden onChange={(e) => handleFileUpload(e?.target?.files[0], setFieldValue)} name='logo' />
                                                    </Col>
                                                )}
                                                <p className='mt-2 recomended-res-label'>Recommended Resolution:  480 × 210 px</p>
                                                {errors.logo && touched.logo ? (
                                                    <div className="text-danger mt-1">
                                                        {errors.logo}
                                                    </div>
                                                ) : null}
                                            </Row>
                                            <div className="marginBottom mt-3">
                                                <Label for="exampleName" className="form-labels">Error Report Recipient</Label> <span className="asterisk">*</span>
                                                <Field
                                                    id="exampleName"
                                                    className="form-control"
                                                    type="text"
                                                    placeholder="Please Enter an Email Address"
                                                    name="error_reporting_email"
                                                    autoComplete="off"
                                                    value={values?.error_reporting_email ?? ''}
                                                    onChange={(e) => {
                                                        handleChange(e);
                                                        setSavingTimer(true)
                                                    }}
                                                />
                                                {errors.error_reporting_email && touched.error_reporting_email ? (
                                                    <div className="text-danger mt-1">
                                                        {errors.error_reporting_email}
                                                    </div>
                                                ) : null}
                                            </div>
                                            <ImageUploader
                                                onSubmit={(blob, url) => {
                                                    // console.log(blob);
                                                    setCroppedImage(url);
                                                    setBlobImage(blob)
                                                }}
                                                onCancel={() => {
                                                    // console.log("Cancelled");
                                                }}
                                                sourceImageUrl={previewImage}
                                                setSourceImageUrl={setPreviewImage}
                                                openCropModal={modal}
                                                setOpenCropModal={setModal}
                                                toggle={toggle2}
                                                setFieldValue={setFieldValue}
                                                name='logo'
                                                setPostCall={setPostCall}
                                                page='projectsettings'
                                                imgAspect={160 / 70}

                                            />
                                        </div>
                                        <div className='bar-sub-header' >
                                            <p style={{ marginTop: '0px' }}>Default Styles</p>
                                        </div>
                                        <div className='pl-4 pr-4  ' style={{ marginBottom: '18.75px' }}>
                                            <Row>
                                                <Col md={12}>
                                                    {[
                                                        { label: 'Inactive Pin Colour', name: 'inactive_color' },
                                                        { label: 'Active Starting Pin Colour', name: 'start_color' },
                                                        { label: 'Active Destination Pin Colour (Location)', name: 'location_color' },
                                                        { label: 'Active Destination Pin Colour (Product)', name: 'product_color' },
                                                        // { label: 'QR Code Beacon Primary Colour', name: 'beacon_color' },
                                                        { label: 'Amenity Pin Colour', name: 'amenity_color' },
                                                        { label: 'Safety Pin Colour', name: 'safety_color' },
                                                        { label: 'Vertical Transport Pin Colour', name: 'level_change_color' },
                                                        { label: 'Navigation Path Colour', name: 'navigation_color' },
                                                        // { label: 'Building Border Colour', name: 'border_color' },
                                                        // ].map(item => <ColorSelectorComp label={item.label} value={values[item.name] ?? '#320101'} name={item.name} onChange={handleChange} />)}
                                                    ].map(item =>
                                                        <ColorPicker label={item.label} value={values[item.name] ?? '#320101'} name={item.name}
                                                            onChange={(e) => {
                                                                setColor(e);
                                                            }}
                                                            setFieldValue={setFieldValue} isOpen={openPicker === item.name} setOpenPicker={setOpenPicker} onClick={() => handlePickerClick(item.name)} color={color} setColor={setColor} />
                                                    )}
                                                    <BorderWidthComp label='Navigation Path Thickness' value={values['navigation_thick'] ?? 3} name={'navigation_thick'} onChange={handleChange} />
                                                </Col>
                                            </Row>
                                            {[
                                                { label: 'Map Background Colour', name: 'background_color' },
                                                { label: 'Navigation Button Colour', name: 'nav_btn_color' },
                                            ].map(item =>
                                                <ColorPicker label={item.label} value={values[item.name] ?? '#1a91d3'} name={item.name}
                                                    onChange={(newColor) => {
                                                        // console.log(newColor);
                                                        setColor(newColor)
                                                    }
                                                    }
                                                    setFieldValue={setFieldValue} isOpen={openPicker === item.name}
                                                    setOpenPicker={setOpenPicker} onClick={() => handlePickerClick(item.name)}
                                                    color={color ?? values[item.name]} setColor={setColor}
                                                />
                                            )}


                                            <div className='color-input-wrpr' style={{ marginBottom: '18.75px' }}>
                                                <p className={`label color-labels mr-2 `} style={{ fontWeight: '400' }}>{"Navigation Button Text Colour"}</p>
                                                
                                                <CommonDropdown
                                                    name='nav_btn_text_color'
                                                    style={customStyles}
                                                    options={[
                                                        { value: "#ffffff", label: "#ffffff" },
                                                        { value: "#000000", label: "#000000" },
                                                    ]}
                                                    value={  values["nav_btn_text_color"] ? {value: values["nav_btn_text_color"] , label: values["nav_btn_text_color"] } : { value: "#ffffff", label: "#ffffff" }}
                                                    onChange={(selected) => {
                                                        setFieldValue("nav_btn_text_color", selected.value)
                                                    }}
                                                    formatOptionLabel={(option) => (
                                                        <div style={{ display: "flex", alignItems: "center" }}>
                                                            <span
                                                                style={{
                                                                    display: "inline-block",
                                                                    width: 16.38,
                                                                    height: 18.99,
                                                                    borderRadius: "3px",
                                                                    backgroundColor: option.value,
                                                                    marginRight: 8,
                                                                    fontSize:"11.12px"
                                                                }}
                                                            />
                                                            {option.label}
                                                        </div>
                                                    )}
                                                />
                                            </div>

                                            

                                            
                                        </div>


                                        <Row>
                                            <Col md={12} className="d-flex justify-content-center">
                                                <Button
                                                    id='prpjectSettingsBtn'
                                                    className="mt-4 btn-primary bar-btn"
                                                    htmlType="submit"
                                                    type="primary"
                                                    size="medium"
                                                    hidden
                                                >
                                                    Submit
                                                </Button>
                                            </Col>
                                        </Row>
                                    </div>
                                </form>
                            </>
                        )}
                    </Formik>
                </div>
            }
        </div>
    )
}

export default PSSideBar;


const customStyles = {
    control: (provided) => ({
        ...provided,
        height: '32px', 
        minHeight: '32px',
        fontSize: '11.12px',
        borderRadius: '4px', 
        borderColor: '#F5F6F7', 
    }),
    // valueContainer: (provided) => ({
    //     ...provided,
    //     padding: '1px 8px', 
    //     fontSize: '11.12px',
    // }),
    valueContainer: (provided) => ({
        ...provided,
        padding: '1px 8px',
        fontSize: '11.12px',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
    }),
    placeholder: (provided) => ({
        ...provided,
        color: '#d4d4d4',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    }),
    option: (provided, state) => ({
        ...provided,
        fontSize: '11.12px',
    }),
    // singleValue: (provided, state) => ({
    //     ...provided,
    //     fontSize: '11.12px', 
    //     position: 'absolute',
    //     // position: 'relative', 
    //     top: '48%',
    //     transform: 'translateY(-50%)',
    //     color: state.data.label === 'Active' ? '#6dab8f' : state.data.label === 'Inactive' ? 'red' : 'black',

    // }),
    indicatorSeparator: () => ({
        display: 'none', 
    }),
    dropdownIndicator: (provided) => ({
        ...provided,
        padding: '4px', 
        alignItems: 'center',
    }),
    clearIndicator: (provided) => ({
        ...provided,
        padding: '4px',
        alignItems: 'center',
    }),
    placeholder: (provided) => ({
        ...provided,
        color: '#d4d4d4', 
    }),
};