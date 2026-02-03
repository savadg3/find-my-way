import React, {  useState, useRef } from 'react'
import { Formik, Field } from "formik";
import {
    Row,
    Card,
    Label,
    Col,
    Modal, ModalBody,
    Button, Spinner
} from "reactstrap";
import * as Yup from "yup";
import { postRequest } from '../../hooks/axiosClient';
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { SetBackEndErrorsAPi } from '../../hooks/setBEerror';


const validationSchema = Yup.object().shape({
    name: Yup.string().required("This field is required."),
    is_default: Yup.number(),
    is_free_plan: Yup.number(),
    basic_cost: Yup.number().required('This field is required.').typeError('Invalid number format.'),
    // .when('is_free_plan', {
    //     is: (is_free_plan) => is_free_plan !== 1,
    //     then: () => Yup.number().required('This field is required.').typeError('Invalid number format.'),
    //     otherwise: () => Yup.number().nullable().typeError('Invalid number format.'),
    // }),
    basic_location_pins: Yup.number()
        .required('This field is required.')
        .typeError('Invalid number format.')
        .integer("Invalid number format."),
    basic_product_pins: Yup.number()
        .required('This field is required.')
        .typeError('Invalid number format.')
        .integer("Invalid number format."),
    additional_cost: Yup.number().typeError('Invalid number format.')
        .when('is_free_plan', {
            is: (is_free_plan) => is_free_plan !== 1,
            then: () => Yup.number().required('This field is required.').typeError('Invalid number format.'),
            otherwise: () => Yup.number().nullable().typeError('Invalid number format.'),
        }),
    additional_location_pins: Yup.number().typeError('Invalid number format.')
        .when('is_free_plan', {
            is: (is_free_plan) => is_free_plan !== 1,
            then: () => Yup.number().required('This field is required.').typeError('Invalid number format.').integer("Invalid number format."),
            otherwise: () => Yup.number().nullable().typeError('Invalid number format.').integer("Invalid number format.")
        }),
    additional_product_pins: Yup.number().typeError('Invalid number format.')
        .when('is_free_plan', {
            is: (is_free_plan) => is_free_plan !== 1,
            then: () => Yup.number().required('This field is required.').typeError('Invalid number format.').integer("Invalid number format."),
            otherwise: () => Yup.number().nullable().typeError('Invalid number format.').integer("Invalid number format."),
        }),

});
const Pricing = ({
   
    modal,
    toggle,
    setModal,
    getPricingList,
    pricingValues,
    
}) => {

    const handleCancelClick = () => {
        setModal(false)
    }

    const formRef = useRef();
    const [loading, setLoading] = useState(false);


    const handleCheckbox = (value, setFieldValue, name, values, validateForm) => {
        if (value.target.checked) {
            setFieldValue(name, 1);
            if (name == 'is_default') {
                setFieldValue('is_free_plan', 0);
            } else {
                setFieldValue('is_default', 0);
                setFieldValue('basic_cost', '');
                setFieldValue('additional_cost', '');
                setFieldValue('additional_location_pins', '');
                setFieldValue('additional_product_pins', '');
            }
        } else {
            setFieldValue(name, 0);
        }
    }

    const handlePricingSubmit = async (values, setFieldError) => {
        setLoading(true)
        let data = {
            id: values?.enc_id ?? null,
            name: values?.name,
            // basic_cost: (values?.is_free_plan == 0 ? values?.basic_cost : null),
            basic_cost: values?.basic_cost,
            basic_location_pins: values?.basic_location_pins,
            basic_product_pins: values?.basic_product_pins,
            // additional_cost: (values?.is_free_plan == 0 ? values?.additional_cost : null),
            // additional_location_pins: (values?.is_free_plan == 0 ? values?.additional_location_pins : null),
            // additional_product_pins: (values?.is_free_plan == 0 ? values?.additional_product_pins : null),
            is_default: values?.is_default,
            is_free_plan: values?.is_free_plan
        }
        if (values?.is_free_plan == 0) {
            data.additional_cost = values?.additional_cost,
                data.additional_location_pins = values?.additional_location_pins,
                data.additional_product_pins = values?.additional_product_pins
        }
        try {
            const request = postRequest('pricing', data);
            const response = await request;
            const res = response.response?.data ?? [];
            if (response.type === 1) {
                toast.success(res?.message);
                getPricingList()
                setModal(false)
            } else {
                SetBackEndErrorsAPi(response, setFieldError);
            }
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Modal isOpen={modal} toggle={toggle} style={{ zIndex: '999999 !important', maxWidth: '800px' }} centered >
            <ModalBody >
                <Card>
                    <Formik
                        initialValues={pricingValues}
                        validationSchema={validationSchema}
                        validateOnBlur={true}  // Add this line
                        validateOnChange={true}
                        onSubmit={(values, setFieldError) => {
                            handlePricingSubmit(values, setFieldError);
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
                            setFieldValue,
                            setFieldTouched,
                            validateForm
                        }) => (
                            <div>
                                <form
                                    ref={formRef}
                                    className="av-tooltip tooltip-label-bottom formGroups"
                                    onSubmit={(e) => { handleSubmit(e, setFieldError) }}
                                >
                                    <h5 className="f-w-600 " style={{ fontSize: '19.24px', marginBottom: '28.39px' }}>{values?.enc_id ? 'Edit' : 'Create New'} {values?.is_free_plan == 1 ? 'Free' : 'Pro'} Pricing Plan</h5>
                                    <div className="mb-2">
                                        <Row>
                                            <Col md={8}>
                                                <Label className="form-labels">Plan Name</Label><span className="asterisk">*</span>
                                                <Field
                                                    className="form-control"
                                                    type="text"
                                                    placeholder="Please Type"
                                                    name="name"
                                                    autoComplete="off"
                                                    value={values?.name}
                                                    onChange={handleChange}
                                                />
                                                {errors.name && touched.name ? (
                                                    <div className="text-danger mt-1">
                                                        {errors.name}
                                                    </div>
                                                ) : null}
                                            </Col>
                                            {values?.is_free_plan != 1 &&
                                                <Col md={2}>
                                                    <div >
                                                        <label for="is_default" className="form-labels"> Default Plan</label><br />
                                                        <input className='checkbox_animated '
                                                            style={{ marginTop: '7px' }}
                                                            type="checkbox" id="is_default"
                                                            name="is_default"
                                                            checked={values?.is_default == 1}
                                                            onBlur={() => setFieldTouched('is_default')}
                                                            disabled={values?.enc_id && values?.default_disabled == 1}
                                                            onChange={(e) => handleCheckbox(e, setFieldValue, 'is_default', values, validateForm)}
                                                        />
                                                    </div>
                                                </Col>
                                            }
                                            {values?.is_free_plan == 1 &&
                                                <Col md={2} >
                                                    <div >
                                                        <label for="is_free" className="form-labels"> Free Plan</label><br />
                                                        <input className='checkbox_animated '
                                                            style={{ marginTop: '7px' }}
                                                            type="checkbox" id="is_free"
                                                            name="is_free_plan"
                                                            checked={values?.is_free_plan == 1}
                                                            onBlur={() => setFieldTouched('is_free_plan')}
                                                            disabled={values?.is_free_plan == 1}
                                                            onChange={(e) => handleCheckbox(e, setFieldValue, 'is_free_plan', validateForm)}
                                                        />
                                                    </div>
                                                </Col>
                                            }
                                        </Row>
                                    </div>
                                    <div className='sub-header mt-4'>
                                        <p className='' style={{ marginTop: 0 }} >Base Package</p>
                                    </div>
                                    <div className="mb-2" style={{ padding: '0px 12px 0px 12px' }}>
                                        <Row>
                                            <Col md={4}>
                                                <Label className="form-labels">Base Package Cost</Label><span className="asterisk">*</span>
                                                <Field
                                                    className="form-control"
                                                    type="text"
                                                    name="basic_cost"
                                                    placeholder="Please Type"
                                                    value={values?.basic_cost}
                                                    disabled={values?.is_free_plan}
                                                    onChange={(e) => {
                                                        handleChange(e);
                                                    }}
                                                    onBlur={() => setFieldTouched('basic_cost')}
                                                />
                                                {errors.basic_cost && touched.basic_cost ? (
                                                    <div className="text-danger mt-1">
                                                        {errors.basic_cost}
                                                    </div>
                                                ) : null}
                                            </Col>
                                            <Col md={4}>
                                                <Label className="form-labels">Base Location Pins</Label><span className="asterisk">*</span>
                                                <Field
                                                    className="form-control"
                                                    type="text"
                                                    name="basic_location_pins"
                                                    placeholder="Please Type"
                                                    value={values?.basic_location_pins}
                                                    onChange={handleChange}
                                                />
                                                {errors.basic_location_pins && touched.basic_location_pins ? (
                                                    <div className="text-danger mt-1">
                                                        {errors.basic_location_pins}
                                                    </div>
                                                ) : null}
                                            </Col>
                                            <Col md={4}>
                                                <Label className="form-labels">Base Product Pins</Label><span className="asterisk">*</span>
                                                <Field
                                                    className="form-control"
                                                    type="text"
                                                    name="basic_product_pins"
                                                    placeholder="Please Type"
                                                    value={values?.basic_product_pins}
                                                    onChange={handleChange}
                                                />
                                                {errors.basic_product_pins && touched.basic_product_pins ? (
                                                    <div className="text-danger mt-1">
                                                        {errors.basic_product_pins}
                                                    </div>
                                                ) : null}
                                            </Col>
                                        </Row>
                                    </div>
                                    {values?.is_free_plan != 1 &&
                                        <>
                                            <div className='sub-header mt-4'>
                                                <p className='' style={{ marginTop: 0 }} >Additional Package</p>
                                            </div>

                                            <div className="mb-2" style={{ padding: '0px 12px 0px 12px' }} >
                                                <Row>
                                                    <Col md={4}>
                                                        <Label className="form-labels">Additional Pin Cost</Label>{<span className="asterisk">*</span>}
                                                        <Field
                                                            className="form-control"
                                                            type="text"
                                                            placeholder="Please Type"
                                                            name='additional_cost'
                                                            value={(values?.is_free_plan == 1) ? '' : (values?.additional_cost)}
                                                            disabled={values?.is_free_plan == 1}
                                                            onChange={(e) => {
                                                                handleChange(e);
                                                                onAdditionalChange(e, values, 'additional_cost');
                                                                
                                                            }}
                                                        />
                                                        {errors.additional_cost && touched.additional_cost ? (
                                                            <div className="text-danger mt-1">
                                                                {errors.additional_cost}
                                                            </div>
                                                        ) : null}
                                                    </Col>
                                                    <Col md={4}>
                                                        <Label className="form-labels">Additional Location Pins</Label>{<span className="asterisk">*</span>}
                                                        <Field
                                                            className="form-control"
                                                            type="text"
                                                            name="additional_location_pins"
                                                            placeholder="Please Type"
                                                            value={(values?.is_free_plan == 1) ? '' : (values?.additional_location_pins)}
                                                            onChange={(e) => {
                                                                handleChange(e);
                                                                onAdditionalChange(e, values, 'additional_location_pins');
                                                            }} disabled={values?.is_free_plan == 1}
                                                        />
                                                        {errors.additional_location_pins && touched.additional_location_pins ? (
                                                            <div className="text-danger mt-1">
                                                                {errors.additional_location_pins}
                                                            </div>
                                                        ) : null}
                                                    </Col>
                                                    <Col md={4}>
                                                        <Label className="form-labels">Additional Product Pins</Label>{<span className="asterisk">*</span>}
                                                        <Field
                                                            className="form-control"
                                                            type="text"
                                                            name="additional_product_pins"
                                                            placeholder="Please Type"
                                                            value={(values?.is_free_plan == 1) ? '' : (values?.additional_product_pins)}
                                                            onChange={(e) => {
                                                                handleChange(e);
                                                                onAdditionalChange(e, values, 'additional_product_pins');
                                                            }} disabled={values?.is_free_plan == 1}
                                                        />
                                                        {errors.additional_product_pins && touched.additional_product_pins ? (
                                                            <div className="text-danger mt-1">
                                                                {errors.additional_product_pins}
                                                            </div>
                                                        ) : null}
                                                    </Col>
                                                </Row>
                                            </div>
                                        </>
                                    }
                                    <div className="form-group text-right " style={{ marginTop: "30px" }}>
                                        <Button
                                            className="btnCancel mr-3"
                                            size="medium"
                                            onClick={handleCancelClick}
                                        >
                                            {"Cancel"}
                                        </Button>
                                        <Button
                                            className="btn btn-primary"
                                            htmlType="submit"
                                            type="submit"
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
                                </form>
                            </div>
                        )}
                    </Formik>
                </Card>
            </ModalBody >
        </Modal>
    )
}
export default Pricing;