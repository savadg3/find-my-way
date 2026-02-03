import React, { useState, useRef, useEffect } from "react";
import { Formik, Field } from "formik";
import {
    Row,
    Card,
    Label,
    Col,
    CardBody,
    Button, Spinner
} from "reactstrap";
import * as Yup from "yup";
import { getRequest, postRequest } from '../../hooks/axiosClient';
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { SetBackEndErrorsAPi } from '../../hooks/setBEerror';
import Default from '../../assets/img/default_c.png';
import { environmentaldatas } from '../../constant/defaultValues';
import { TiCamera } from "react-icons/ti";
import ImageUploader from '../../components/constants/imageCropNew';

const { image_url } = environmentaldatas;

const validationSchema = Yup.object().shape({
    company_name: Yup.string().required("This field is required."),
    contact: Yup.number().nullable().typeError("Please type numbers only."),

});

const CompanySettings = () => {

    const initialValues = {
        id: null,
        company_name: null,
        address: null,
        contact: null,
        website: null,
        account_name: null,
        bsb: null,
        account_no: null,

    }
    const [formDetails, setFormDetails] = useState(initialValues);
    const [previewImage, setPreviewImage] = useState(null);
    const [croppedImage, setCroppedImage] = useState(null);
    const fileInputRefs = useRef(null);
    const [modal, setModal] = useState(false);
    const toggle2 = () => setModal(!modal);
    const [postCall, setPostCall] = useState(false);
    const [loading, setLoading] = useState(false);
    const [id, setId] = useState(null);
    const [fileKey, setFileKey] = useState(Date.now());
    const [loader, setLoader] = useState(false);


    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        setFileKey(Date.now());
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviewImage(reader.result);
            setModal(true)
        };
        if (file) {
            reader.readAsDataURL(file);
        }
    };

    const getFormData = async () => {
        setLoading(true);
        try {
            const response = await getRequest(`company-details`);
            const formDataRes = response.data ?? [];
            setFormDetails(formDataRes);
            const resUrl = response.data.logo;
            const url = resUrl ? (image_url + resUrl) : Default;
            setCroppedImage(url);
            setId(response.data.id)
        } catch (error) {
        }
        setLoading(false);
    };

    const handleSubmitCompany = async (values, setFieldError) => {
        setLoader(true)
        try {
            const response = await postRequest(`update-company`, values);
            if (response.type === 2) {
                SetBackEndErrorsAPi(response, setFieldError);
            } else {
                resetForm()
                toast.success(response?.response?.data?.message);
                getFormData();

            }
        } catch (error) {
        } finally {
            setLoader(false)
        }

    }
    // useEffect(() => {
    //     if (croppedImage) {
    //         handleSubmitPic()
    //     }
    // }, [croppedImage]);

    const handleSubmitPic = async (blobImage) => {
        try {
            const formdata = new FormData();
            formdata.append('id', id)
            formdata.append('logo', blobImage)
            const response = await postRequest(`update-logo`, formdata, true);
            if (response.type === 2) {
            } else {
                getFormData()
                toast.success(response?.response?.data?.message);
            }
        } catch (error) {
        }
    }

    const resetForm = () => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
        }, 500);
    }

    useEffect(() => {
        getFormData();
    }, []);

    return loading ? (
        <div className="w-100 ml-3 pt-2 position-relative">
            Loading...
            <div className="loading  top-50  translate-middle left-0 position-absolute" />
        </div>
    ) : (
        <>
            <div className="container-fluid">
                <Card>
                    <CardBody>
                        <h5 className="f-w-600 mb-2 mt-4 heading-font" >Company Settings</h5>
                        <hr></hr>
                        <Row>
                            <Col md={12}>
                                <div className='d-flex justify-content-center align-items-center mt-3'>
                                    <span className='image-preview2 image-fluid' style={{ borderRadius: '15px' }}>
                                        <img src={loading ? Default : (croppedImage)} alt='Uploaded Preview' className="preview-image" style={{ borderRadius: '15px' }} />
                                    </span>
                                    <span className='image_' style={{ borderRadius: '15px' }}>
                                        <label htmlFor='fileInputs'>
                                            <TiCamera size={20} style={{ position: 'absolute', cursor: 'pointer', bottom: '5px', right: '64px', color: 'white' }} />
                                        </label>
                                        <input
                                            key={fileKey}
                                            id='fileInputs'
                                            type='file'
                                            ref={fileInputRefs}
                                            style={{ display: 'none' }}
                                            onChange={handleFileUpload}
                                            accept='.svg, .png, .jpg, .jpeg'
                                        />
                                        <ImageUploader
                                            onSubmit={(blob, url) => {
                                                setCroppedImage(url);
                                                if (blob) {
                                                    handleSubmitPic(blob)
                                                }
                                            }}
                                            onCancel={() => {
                                            }}
                                            sourceImageUrl={previewImage}
                                            setSourceImageUrl={setPreviewImage}
                                            openCropModal={modal}
                                            setOpenCropModal={setModal}
                                            toggle={toggle2}
                                            setPostCall={setPostCall}
                                            imgAspect={5 / 6}
                                        />
                                    </span>
                                </div>
                            </Col>
                        </Row>
                        <Formik
                            initialValues={formDetails}
                            validationSchema={validationSchema}
                            onSubmit={(values, setFieldError) => {
                                handleSubmitCompany(values, setFieldError);
                            }}
                            enableReinitialize
                        >
                            {({
                                errors,
                                values,
                                touched,
                                handleSubmit,
                                handleChange,
                                setFieldError
                            }) => (
                                <div >
                                    <form
                                        className="av-tooltip tooltip-label-bottom formGroups mt-4"
                                        onSubmit={(e) => handleSubmit(e, setFieldError)}
                                    >
                                        <Row className="mt-2">
                                            <Col md={6}>
                                                <div className="mb-2">
                                                    <Label for="companyName" className="form-labels">Company Name</Label><span className="asterisk">*</span>
                                                    <div className="d-flex">
                                                        <Field
                                                            id="companyName"
                                                            className="form-control"
                                                            type="text"
                                                            name="company_name"
                                                            placeholder="Please Type"
                                                            value={values?.company_name}
                                                            onChange={handleChange}
                                                        />
                                                    </div>
                                                    {errors.company_name && touched.company_name ? (
                                                        <div className="text-danger mt-1">
                                                            {errors.company_name}
                                                        </div>
                                                    ) : null}
                                                </div>
                                            </Col>
                                            <Col md={6}>
                                                <div className="mb-2">
                                                    <Label for="address" className="form-labels">Address </Label>
                                                    <div className="d-flex">
                                                        <Field
                                                            id="address "
                                                            className="form-control"
                                                            type="text"
                                                            name="address"
                                                            placeholder="Please Type"
                                                            value={values?.address}
                                                            onChange={handleChange}
                                                        />
                                                    </div>
                                                </div>
                                            </Col>
                                        </Row>
                                        <Row >
                                            <Col md={6}>
                                                <div className="mb-2">
                                                    <Label for="contact" className="form-labels">Contact</Label>
                                                    <div className="d-flex">
                                                        <Field
                                                            id="contact"
                                                            className="form-control"
                                                            type="text"
                                                            name="contact"
                                                            placeholder="Please Type"
                                                            value={values?.contact}
                                                            onChange={handleChange}
                                                        />
                                                    </div>
                                                    {errors.contact && touched.contact ? (
                                                        <div className="text-danger mt-1">
                                                            {errors.contact}
                                                        </div>
                                                    ) : null}
                                                </div>
                                            </Col>
                                            <Col md={6}>
                                                <div className="mb-2">
                                                    <Label for="website" className="form-labels">Website</Label>
                                                    <div className="d-flex">
                                                        <Field
                                                            id="website"
                                                            className="form-control"
                                                            type="text"
                                                            name="website"
                                                            placeholder="Please Type (Eg. www.demo.com)"
                                                            value={values?.website}
                                                            onChange={handleChange}
                                                        />
                                                    </div>
                                                    {errors.website && touched.website ? (
                                                        <div className="text-danger mt-1">
                                                            {errors.website}
                                                        </div>
                                                    ) : null}
                                                </div>
                                            </Col>
                                        </Row>
                                        <Row >
                                            <Col md={4}>
                                                <div className="mb-2">
                                                    <Label for="accountName" className="form-labels">Account Name</Label>
                                                    <div className="d-flex">
                                                        <Field
                                                            id="accountName"
                                                            className="form-control"
                                                            type="text"
                                                            name="account_name"
                                                            placeholder="Please Type"
                                                            value={values?.account_name}
                                                            onChange={handleChange}
                                                        />
                                                    </div>
                                                </div>
                                            </Col>
                                            <Col md={4}>
                                                <div className="mb-2">
                                                    <Label for="bsb" className="form-labels">BSB</Label>
                                                    <div className="d-flex">
                                                        <Field
                                                            id="bsb"
                                                            className="form-control"
                                                            type="text"
                                                            name="bsb"
                                                            placeholder="Please Type"
                                                            value={values?.bsb}
                                                            onChange={handleChange}
                                                        />
                                                    </div>
                                                </div>
                                            </Col>
                                            <Col md={4}>
                                                <div className="mb-2">
                                                    <Label for="accountName" className="form-labels">Account Number</Label>
                                                    <div className="d-flex">
                                                        <Field
                                                            id="accountName"
                                                            className="form-control"
                                                            type="text"
                                                            name="account_no"
                                                            placeholder="Please Type"
                                                            value={values?.account_no}
                                                            onChange={handleChange}
                                                        />
                                                    </div>
                                                </div>
                                            </Col>
                                        </Row>
                                        <div className="form-group " style={{ marginTop: "30px", marginBottom: "22px" }}>
                                            <Button
                                                className="float-right btn btn-primary"
                                                htmlType="submit"
                                                type="primary"
                                                size="medium"
                                                style={{ marginTop: '2px' }}
                                                disabled={loader}
                                            >
                                                {loader ? (
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
                                    </form>
                                </div>
                            )}
                        </Formik>
                    </CardBody>
                </Card>
            </div>
        </>
    )
}
export default CompanySettings;