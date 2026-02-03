import React, { useEffect, useState } from 'react'
import { Formik, Field } from "formik";
import {
    Row,
    Card,
    Label,
    Col,
    Modal,
    ModalBody,
    Button, Spinner
} from "reactstrap";
import * as Yup from "yup";
import { getRequest, postRequest } from '../../hooks/axiosClient';
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { SetBackEndErrorsAPi } from '../../hooks/setBEerror';
import CustomDropdown from '../../components/common/CustomDropDown'
import InputMask from 'react-input-mask';
import { environmentaldatas } from "../../constant/defaultValues";


const { phoneRegExp } = environmentaldatas

const AddCustomer = ({ modal, toggle, id, setModal, setSubmitted, getCustomersList, setEditId }) => {

    const validationSchema = Yup.object().shape({
        first_name: Yup.string().required("This field is required."),
        email: Yup.string().required("This field is required.").email("Invalid email format."),
        contact: Yup.string().required("This field is required.")
            .matches(phoneRegExp, "Please enter a valid phone number."),
        pricing_id: Yup.string().required("This field is required."),
    });

    const initialFormValues = {
        business_name: null,
        first_name: null,
        status: 1,
        email: null,
        contact: null,
        coupon_code: null,
        select: null,
        pricing_id: null,
    };

    const [customerValues, setCustomerValues] = useState(initialFormValues);
    const [packageOptions, setPackageOptions] = useState([]);
    const [agentOptions, setAgentOptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loader, setLoader] = useState(false);
    const statusOption = [
        { value: 1, label: 'Active' },
        { value: 0, label: 'Inactive' }

    ]

    useEffect(() => {
        if (id != 0 && id) {
            getPricingById(id);
        }
    }, [id]);

    useEffect(() => {
        getAgentDropdown(0)
    }, [])

    const getPackageDropdown = async () => {
        setLoading(true)
        try {
            const response = await getRequest(`dropdown-pricings`);
            const DataRes = response.data ?? [];
            let data = null
            data = DataRes?.map((prev) => ({ ...prev, value: prev?.enc_id, label: prev?.name }))
            setPackageOptions(data)
        } catch (error) {
        } finally {
            setLoading(false)
        }
    }

    const getAgentDropdown = async (id) => {
        setLoading(true)
        try {
            const response = await getRequest(`dropdown-agent/${id}`);
            const DataRes = response.data ?? [];
            let data = DataRes?.map((prev) => ({ ...prev, value: prev?.enc_id, label: prev?.full_name }))
            setAgentOptions(data)
            getPackageDropdown()
        } catch (error) {
        } finally {
        }
    }


    const getPricingById = async (id) => {
        setLoading(true)
        try {
            const response = await getRequest(`customers/${id}`);
            const DataRes = response.data?.data ?? [];
            let data = {
                ...DataRes,
                first_name: DataRes?.user_data?.name ?? '',
                status: DataRes?.status ?? '',
                contact: DataRes?.user_data?.contact ?? '',
                email: DataRes?.user_data?.email ?? '',
                enc_pricing: DataRes?.enc_pricing ?? '',
                agent_id: DataRes?.agent_id ?? '',
                pricing_id: DataRes?.pricing_id ?? '',
                select: DataRes?.pricing_id ?? '',
                agent: DataRes?.agent_id ?? ''
            }
            getAgentDropdown(DataRes?.agent_id ?? 0)
            setCustomerValues(data);
            setSubmitted(true)
        } catch (error) {
        } finally {
        }
    }

    const registerHandler = async (values, setFieldError) => {
        setLoader(true)
        let data = {
            business_name: values?.business_name,
            first_name: values?.first_name,
            status: values?.status ?? 1,
            email: values?.email,
            contact: values?.contact,
            pricing_id: values?.pricing_id,
            agent_id: values?.agent_id
        }
        if (values?.enc_id) {
            data.id = values?.enc_id
            data._method = 'PUT',
                data.user_id = values?.user_data?.enc_user_id
        }
        try {
            const reqUrl = values?.enc_id ? `customers/${values?.enc_id}` : `customers`;
            const response = await postRequest(reqUrl, data);
            console.log(response)
            if (response.type === 1) {
                toast.success(response?.response?.data?.message);
                setModal(false)
                setSubmitted(true)
                setEditId(null)
                getCustomersList()
                setCustomerValues()
            } else {
                SetBackEndErrorsAPi(response, setFieldError);
            }
        } catch (error) {
            //console.log(error);
        } finally {
            setLoader(false)
        }
    };

    return (
        <>
            <div tabindex="-1" style={{
                position: 'fixed',
                zIndex: '999999',
                display: 'block',
            }}>
                <Modal isOpen={modal} toggle={() => setModal(false)} style={{ zIndex: '999999 !important', maxWidth: '750px' }} centered >
                    <ModalBody style={{ height: loading ? '450px' : 'auto' }}>
                        <Card >
                            <Formik
                                initialValues={customerValues}
                                validationSchema={validationSchema}
                                onSubmit={(values, setFieldError) => {
                                    registerHandler(values, setFieldError);
                                }}
                                enableReinitialize
                            >
                                {({
                                    errors,
                                    values,
                                    touched,
                                    handleSubmit,
                                    handleChange,
                                    setFieldError,
                                    setFieldValue
                                }) => (
                                    <div >
                                        {loading ? (
                                            <div className="w-100 ml-3 pt-2 position-relative">
                                                Loading...
                                                <div className="loading  top-50  translate-middle left-0 position-absolute" />
                                            </div>
                                        ) : (
                                            <form
                                                className="av-tooltip tooltip-label-bottom formGroups"
                                                onSubmit={(e) => handleSubmit(e, setFieldError)}
                                            >
                                                <h5 className="f-w-600 " style={{ fontSize: '19.24px', marginBottom: '28.39px' }}> {id ? 'Edit' : 'Add New'}  Customer</h5>
                                                <Row >
                                                    <Col md={6}>
                                                        <Label className="form-labels">Name</Label><span className="asterisk">*</span>
                                                        <div className="d-flex">
                                                            <Field
                                                                className="form-control"
                                                                type="text"
                                                                name="first_name"
                                                                placeholder="Please Type"
                                                                value={values?.first_name}
                                                                onChange={handleChange}
                                                            />
                                                        </div>
                                                        {errors.first_name && touched.first_name ? (
                                                            <div className="text-danger mt-1">
                                                                {errors.first_name}
                                                            </div>
                                                        ) : null}
                                                    </Col>
                                                    <Col md={6}>
                                                        <Label className="form-labels">Status</Label>
                                                        <CustomDropdown name='status' options={statusOption} setFieldValue={setFieldValue} selectValue={values} from='status' />
                                                        {errors.status && touched.status ? (
                                                            <div className="text-danger mt-1">
                                                                {errors.status}
                                                            </div>
                                                        ) : null}
                                                    </Col>
                                                </Row>
                                                <Row className='mt-2'>
                                                    <Col md={12}>
                                                        <Label className="form-labels">Email</Label><span className="asterisk">*</span>
                                                        <div className="d-flex">
                                                            <Field
                                                                className="form-control"
                                                                type={"text"}
                                                                name="email"
                                                                placeholder="Please Type"
                                                                value={values?.email}
                                                                onChange={handleChange}
                                                            />
                                                        </div>
                                                        {errors.email && touched.email ? (
                                                            <div className="text-danger mt-1">
                                                                {errors.email}
                                                            </div>
                                                        ) : null}
                                                    </Col>
                                                </Row>
                                                <Row className='mt-2'>
                                                    <Col md={6}>
                                                        <Label className="form-labels">Company</Label>
                                                        <Field
                                                            className="form-control"
                                                            type="text"
                                                            placeholder="Please Type"
                                                            name="business_name"
                                                            value={values?.business_name}
                                                            onChange={handleChange}
                                                        />
                                                        {errors.business_name && touched.business_name ? (
                                                            <div className="text-danger mt-1">
                                                                {errors.business_name}
                                                            </div>
                                                        ) : null}
                                                    </Col>
                                                    <Col md={6}>
                                                        <Label className="form-labels">Phone Number</Label><span className="asterisk">*</span>
                                                        <div className="input-group" style={{ padding: '0px', border: 'none' }}>
                                                            <div className="input-group-prepend"><span className="input-group-text">+61</span></div>
                                                            <InputMask mask='9999 999 999' maskChar={null} onBlur={(e) => console.log(e.target.value.replace(/ /g, ''))}
                                                                className="form-control"
                                                                placeholder="Please Type"
                                                                name="contact"
                                                                type="text"
                                                                value={values?.contact}
                                                                onChange={handleChange} />

                                                        </div>
                                                        {/* <div className="d-flex">
                                                            <Field
                                                                className="form-control"
                                                                type="text"
                                                                name="contact"
                                                                placeholder="Please Type"
                                                                value={values?.contact}
                                                                onChange={handleChange}
                                                            />
                                                        </div> */}
                                                        {errors.contact && touched.contact ? (
                                                            <div className="text-danger mt-1">
                                                                {errors.contact}
                                                            </div>
                                                        ) : null}
                                                    </Col>
                                                </Row>
                                                <Row className='mt-2'>
                                                    <Col md={6}>
                                                        <Label className="form-labels">Agent</Label>
                                                        <CustomDropdown name='agent' options={agentOptions} setFieldValue={setFieldValue} selectValue={values} from='agent' />
                                                    </Col>
                                                    <Col md={6}>
                                                        <Label className="form-labels">Pricing Plan</Label><span className="asterisk">*</span>
                                                        <CustomDropdown name='select' options={packageOptions} setFieldValue={setFieldValue} setCustomerValues={setCustomerValues} selectValue={values} from='pricing' />
                                                        {errors.pricing_id && touched.pricing_id ? (
                                                            <div className="text-danger mt-1">
                                                                {errors.pricing_id}
                                                            </div>
                                                        ) : null}
                                                    </Col>
                                                </Row>
                                                <div className="form-group text-right" style={{ marginTop: "30px" }}>
                                                    <Button
                                                        className="btnCancel mr-3"
                                                        size="medium"
                                                        onClick={() => setModal(false)}
                                                    >
                                                        {"Cancel"}
                                                    </Button>
                                                    <Button
                                                        className=" btn btn-primary"
                                                        type="submit"
                                                        htmlFor="submit"
                                                        size="medium"
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
                                        )}
                                    </div>
                                )}
                            </Formik>
                        </Card>
                    </ModalBody>
                </Modal>
            </div>
        </>
    )
}
export default AddCustomer;