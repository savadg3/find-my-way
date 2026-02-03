import React, { useEffect, useRef, useState } from 'react';
import {
    Card,
    Row, Col,
    Label,
    Button,
    Modal,
    ModalBody,
    Spinner
} from 'reactstrap';
import * as Yup from "yup";
import { Formik, Field } from "formik";
import { Link } from "react-router-dom";
import './notification.css'
import { AiOutlineClose, } from 'react-icons/ai';
import { environmentaldatas } from '../../constant/defaultValues';
import { postRequest } from '../../hooks/axiosClient';
import { SetBackEndErrorsAPi } from '../../hooks/setBEerror';
import { toast } from "react-toastify";
import ColorSelectorComp from '../editMap/components/ColorSelectorComp'
import CustomDropdown from '../../components/common/CustomDropDown';
import ImageUploader from '../../components/constants/imageCropNew';

const { image_url } = environmentaldatas;

const notificationValidationSchema = Yup.object().shape({
    heading: Yup.string().required("This field is required."),
    banner_image: Yup.mixed().required("This field is required."),
    link: Yup.string().required("This field is required."),
    sub_heading: Yup.string().required("This field is required."),
    button_text: Yup.string().required("This field is required."),
});

const Notification = ({
    modalPricing,
    togglePricing,
    initialvalues,
    notificationId,
    croppedImage,
    setCroppedImage,
    getNotificationList
}) => {
    const statusOption = [
        { value: 1, label: 'Active' },
        { value: 0, label: 'Inactive' }
    ];
    const fileInputRef = useRef();
    const [previewImage, setPreviewImage] = useState(null);
    const [fileName, setFileName] = useState('');
    const [modal, setModal] = useState(false);
    const toggle = () => setModal(!modal);
    const [postCall, setPostCall] = useState(null)
    const [loading, setLoading] = useState(false)
    const [openCropModal, setOpenCropModal] = useState(false);
    const toggle2 = () => setOpenCropModal(!openCropModal);
    const [fileKey, setFileKey] = useState(Date.now());
    const [color, setColor] = useState(null);
    const [openPicker, setOpenPicker] = useState(null);
    const handlePickerClick = (name) => {
        setOpenPicker(name);
    };
    const [blobImage, setBlobImage] = useState(null)


    const handleFileUpload = (e, setFieldValue) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            setFieldValue('banner_image', file)
            setFileKey(Date.now());
            const fileReader = new FileReader();
            fileReader.addEventListener("load", () => {
                setPreviewImage(fileReader.result);
                setFileName(file.name);
                setOpenCropModal(true);
            });
            fileReader.readAsDataURL(file);
        }
    };

    const removeImage = (setFieldValue) => {
        setPreviewImage(null);
        setCroppedImage(null);
        setBlobImage(null)
        setFieldValue('banner_image', '')
    };

    const handleDragOver = (event) => {
        event.preventDefault(); // Prevent the default behavior to enable dropping
    };

    const handleDrop = (event) => {
        event.preventDefault();
        const file = event.dataTransfer.files[0]; // Get the dropped file
        handleFileUpload({ target: { files: [file] } }); // Handle the file upload
    };

    useEffect(() => {
    }, [croppedImage]);

    const handleSubmitNotification = async (values, setFieldError) => {
        setLoading(true)
        const formdata = new FormData();
        formdata.append('heading', values?.heading);
        formdata.append('link', values?.link);
        formdata.append('sub_heading', values?.sub_heading);
        formdata.append('button_text', values?.button_text);
        formdata.append('text_color', values?.text_color);
        formdata.append('bg_color', values?.bg_color);
        formdata.append('status', values?.status);
        if (notificationId) {
            formdata.append('_method', 'PUT');
        }
        if (croppedImage.startsWith('data:image')) {
            const base64Logo = croppedImage;
            formdata.append(`banner_image`, blobImage);
        } else {
            formdata.append(`banner_image`, values?.banner_image);
        }
        try {
            const reqUrl = notificationId ? `notifications/${notificationId}` : `notifications`;
            const response = await postRequest(reqUrl, formdata, true);
            const data = response.response?.data ?? [];
            console.log(response.errormessage, 'response')
            if (response.type === 1) {
                toast.success(data?.message);
                togglePricing();
                getNotificationList();
                setCroppedImage(null)
                setBlobImage(null)
            } else {
                if (response.errormessage == 'Maximum file upload is limited to 5MB only.') {
                    toast.error(response.errormessage);
                }
                SetBackEndErrorsAPi(response, setFieldError);
            }
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false)
        }
        return
    }

    return (
        <>
            <Modal isOpen={modalPricing} toggle={togglePricing} style={{ zIndex: '999999 !important', maxWidth: '700px' }} centered >
                <ModalBody >
                    <Card >
                        <Formik
                            initialValues={initialvalues}
                            validationSchema={notificationValidationSchema}
                            onSubmit={(values, setFieldError) => {
                                handleSubmitNotification(values, setFieldError);

                            }}
                            enableReinitialize

                        >
                            {({
                                errors,
                                values,
                                touched,
                                handleSubmit,
                                handleChange,
                                setFieldValue,
                                setFieldError,
                            }) => (
                                <form
                                    className="av-tooltip tooltip-label-bottom formGroups"
                                    onSubmit={(e) => handleSubmit(e, setFieldError)}
                                >
                                    <h5 className="f-w-600 " style={{ fontSize: '19.24px', marginBottom: '28.39px' }}>{values?.notification_id ? 'Edit' : 'Add New'} Notification</h5>
                                    <Row>
                                        <Col md={6}>
                                            <Label className="form-labels">Heading</Label><span className="asterisk">*</span>
                                            <Field
                                                className="form-control"
                                                type="text"
                                                name="heading"
                                                placeholder="Please Type"
                                                autoComplete="off"
                                                values={values?.heading}
                                                onChange={handleChange}
                                            />
                                            {errors.heading && touched.heading ? (
                                                <div className="text-danger mt-1">
                                                    {errors.heading}
                                                </div>
                                            ) : null}
                                        </Col>
                                        <Col md={6}>
                                            <Label className="form-labels">Status</Label><span className="asterisk">*</span>
                                            <CustomDropdown name='status' options={statusOption} setFieldValue={setFieldValue} selectValue={values} from='status' />
                                            {errors.status && touched.status ? (
                                                <div className="text-danger mt-1">
                                                    {errors.status}
                                                </div>
                                            ) : null}
                                        </Col>
                                    </Row>
                                    <Row className='mt-2'>
                                        <Col md={6}>
                                            <Label className="form-labels">Subheading</Label><span className="asterisk">*</span>
                                            <div className="d-flex">
                                                <Field
                                                    component="textarea"
                                                    className="form-control"
                                                    type={"text"}
                                                    name="sub_heading"
                                                    placeholder="Please Type"
                                                    values={values?.sub_heading}
                                                    rows={8}
                                                    onChange={handleChange}
                                                />
                                            </div>
                                            {errors.sub_heading && touched.sub_heading ? (
                                                <div className="text-danger mt-1">
                                                    {errors.sub_heading}
                                                </div>
                                            ) : null}
                                        </Col>
                                        <Col md={6}>
                                            <Row>
                                                <Col md={12}>
                                                    <Label className='form-labels'>
                                                        Featured Image
                                                    </Label><span className="asterisk">*</span>
                                                    {croppedImage ? (
                                                        <div className='d-flex'>
                                                            <div className='image-preview'>
                                                                <img src={croppedImage} alt='Uploaded Preview' style={{ height: '100%', width: '100%', objectFit: 'contain' }} />
                                                            </div>
                                                            <div className='ml-1' >
                                                                <div className='removeimage' onClick={() => removeImage(setFieldValue)}>
                                                                    <AiOutlineClose />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ) :
                                                        <>
                                                            <div className='image-upload' onClick={(e) => {
                                                                fileInputRef.current.click()
                                                            }}
                                                                onDragOver={handleDragOver} onDrop={handleDrop}>
                                                                <div className='text-center'>
                                                                    <label >
                                                                        <p className='dragAndDrop mt-1'>+</p>
                                                                        <p className='format'></p>
                                                                    </label>
                                                                </div>
                                                                <input
                                                                    type='file'
                                                                    ref={fileInputRef}
                                                                    hidden
                                                                    name="banner_image"
                                                                    values={values?.banner_image}
                                                                    onChange={(e) => handleFileUpload(e, setFieldValue)}
                                                                    accept='.svg, .png, .jpg, .jpeg'
                                                                    key={fileKey}
                                                                />
                                                            </div>
                                                            {errors.banner_image && touched.banner_image ? (
                                                                <div className="text-danger mt-1">
                                                                    {errors.banner_image}
                                                                </div>
                                                            ) : null}
                                                        </>}
                                                </Col>
                                            </Row>
                                        </Col>
                                    </Row>
                                    <Row className='mt-2'>
                                        <Col md={6}>
                                            <Label className='form-labels'>
                                                Text Colour
                                            </Label>
                                            <ColorSelectorComp value={values?.text_color} name={'text_color'}
                                                onChange={(e) => {
                                                    setColor(e);
                                                }}
                                                setFieldValue={setFieldValue} isOpen={openPicker === 'text_color'} className="form-control" from="notification" setOpenPicker={setOpenPicker} onClick={() => handlePickerClick('text_color')} color={color} setColor={setColor} />
                                        </Col>
                                        <Col md={6}>
                                            <Label className='form-labels'>
                                                Background Colour
                                            </Label>
                                            <ColorSelectorComp value={values?.bg_color} name={'bg_color'}
                                                onChange={(e) => {
                                                    setColor(e);
                                                }}
                                                setFieldValue={setFieldValue} isOpen={openPicker === 'bg_color'}
                                                className="form-control" from="notification" setOpenPicker={setOpenPicker} onClick={() => handlePickerClick('bg_color')} color={color} setColor={setColor} />
                                        </Col>
                                    </Row>
                                    <div >
                                        <ImageUploader
                                            onSubmit={(blob, url) => {
                                                setCroppedImage(url);
                                                setBlobImage(blob)
                                            }}
                                            onCancel={() => {
                                            }}
                                            sourceImageUrl={previewImage}
                                            setSourceImageUrl={setPreviewImage}
                                            openCropModal={openCropModal}
                                            setOpenCropModal={setOpenCropModal}
                                            toggle={toggle2}
                                            setPostCall={setPostCall}
                                            imgAspect={450 / 299}
                                        />
                                    </div >
                                    <Row className='mt-2'>
                                        <Col md={6}>
                                            <Label className="form-labels">Button Text</Label><span className="asterisk">*</span>
                                            <div className="d-flex">
                                                <Field
                                                    className="form-control"
                                                    type={"text"}
                                                    name="button_text"
                                                    placeholder="Please Type"
                                                    values={values?.tebutton_textxt}
                                                    onChange={handleChange}
                                                />
                                            </div>
                                            {errors.button_text && touched.button_text ? (
                                                <div className="text-danger mt-1">
                                                    {errors.button_text}
                                                </div>
                                            ) : null}
                                        </Col>
                                        <Col md={6}>
                                            <Label className="form-labels">Button Link</Label><span className="asterisk">*</span>
                                            <div className="d-flex">
                                                <Field
                                                    className="form-control"
                                                    type={"text"}
                                                    name="link"
                                                    placeholder="Please Type"
                                                    values={values?.link}
                                                    onChange={handleChange}
                                                />
                                            </div>
                                            {errors.link && touched.link ? (
                                                <div className="text-danger mt-1">
                                                    {errors.link}
                                                </div>
                                            ) : null}
                                        </Col>
                                    </Row>
                                    <div className="mb-2">
                                    </div>
                                    <div className="mb-2">
                                    </div>
                                    <div className="float-right form-group " style={{ marginTop: "30px" }}>
                                        <Link to='/notification'>
                                            <Button
                                                className="btnCancel mr-3"
                                                type="primary"
                                                size="medium"
                                                onClick={togglePricing}
                                            >
                                                {"Cancel"}
                                            </Button>
                                        </Link>
                                        <Button
                                            className="float-right btn-primary"
                                            htmlType="submit"
                                            type="primary"
                                            size="medium"
                                            disabled={loading}
                                        >
                                            {loading ? (
                                                <>
                                                    <p style={{ opacity: '0', position: 'relative' }}>Submit</p>
                                                    <Spinner
                                                        className="ml-2 spinner-style"
                                                        color="light"
                                                    />
                                                </>
                                            ) : 'Submit'}
                                        </Button>
                                    </div>
                                </form >
                            )}
                        </Formik >
                    </Card >
                </ModalBody >
            </Modal>
        </>
    )
}
export default Notification;