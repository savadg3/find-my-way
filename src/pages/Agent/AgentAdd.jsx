import React, { useState, } from "react";
import { Formik, Field } from "formik";
import {
  Row,
  Card,
  Label,
  Col,
  Button, Modal, ModalBody, Spinner
} from "reactstrap";
import * as Yup from "yup";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { postRequest, putRequest } from '../../hooks/axiosClient';
import { SetBackEndErrorsAPi } from '../../hooks/setBEerror';
import CustomDropdown from '../../components/common/CustomDropDown';
import InputMask from 'react-input-mask';
import { environmentaldatas } from "../../constant/defaultValues";


const {phoneRegExp} = environmentaldatas

const agentValidationSchema = Yup.object().shape({
  business_name: Yup.string().nullable(),
  first_name: Yup.string().required("This field is required."),
  address: Yup.string().nullable(),
  email: Yup.string()
    .email("Invalid email format.")
    .required("This field is required."),
  contact: Yup.string()
    .required("This field is required.")
    .matches(phoneRegExp, "Please enter a valid phone number."),

    // .nullable()
    // .typeError("Invalid number format."),
  coupon_code: Yup.string().required('This field is required.'),
  commission_charge: Yup.number().required('This field is required.').typeError('Invalid number format.'),
  discount: Yup.number().required('This field is required.').typeError('Invalid number format.'),
  // commission_charge: Yup.number().typeError('Invalid number format.')
  //   .when('coupon_code', {
  //     is: (coupon_code) => coupon_code != null || '',
  //     then: () => Yup.number().required('This field is required.').typeError('Invalid number format.'),
  //     otherwise: () => Yup.number().nullable().typeError('Invalid number format.'),
  //   }),

  // discount: Yup.number().typeError('Invalid number format.')
  //   .when('coupon_code', {
  //     is: (coupon_code) => coupon_code != null || '',
  //     then: () => Yup.number().required('This field is required.').typeError('Invalid number format.'),
  //     otherwise: () => Yup.number().nullable().typeError('Invalid number format.'),
  //   }),

  // account_name: Yup.string().required("This field is required."),
  // bank_name: Yup.string().required("This field is required."),
  bsb_number: Yup.number().nullable().typeError('Invalid number format.').integer("Invalid number format."),
  account_number: Yup.number().nullable().typeError("Invalid number format.").integer("Invalid number format."),
  abn: Yup.number().nullable().typeError('Invalid number format.').integer("Invalid number format."),
  status: Yup.string().required("This field is required."),
  f_name: Yup.string().required("This field is required."),
  l_name: Yup.string().required("This field is required."),

});

const AgentAdd = ({ id, modal, toggle, setModal, setValues, values, agentId, getAgentList, setValidation, validation }) => {




  // Get the validation schema based on the presence of id
  const [loading, setLoading] = useState(false);

  const statusOption = [
    { value: 1, label: 'Active' },
    { value: 0, label: 'Inactive' }

  ];

  const handleSubmitAgent = async (values, setFieldError) => {
    setLoading(true);
    let data = {
      id: values.id,
      user_id: values.user_id,
      first_name: values?.first_name,
      address: values?.address,
      email: values?.email,
      contact: values?.contact,
      // account_name: values?.account_name,
      // account_number: values?.account_number,
      // bsb_number: values?.bsb_number,
      abn: values?.abn,
      business_name: values?.business_name,
      commission_charge: values?.commission_charge,
      coupon_code: values?.coupon_code,
      discount: values?.discount,
      status: values?.status,
      f_name: values?.f_name,
      l_name: values?.l_name
    }
    
    try {
      const request = agentId ? putRequest(`agent/${agentId}`, data) : postRequest('agent', data);
      const response = await request;
      if (response.type === 2) {
        SetBackEndErrorsAPi(response, setFieldError);
      } else {
        toast.success(response?.response?.data?.message);
        const redirectUrl = response?.response?.data?.redirect_url;
        getAgentList();
        setModal(false)
      }
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false);
    }
  }
  const back = () => {
    setModal(false);
  }

  return (
    <>

      <Modal isOpen={modal} toggle={toggle} style={{ zIndex: '999999 !important', maxWidth: '850px' }} centered >
        <ModalBody >
          <Card >
            <Formik
              initialValues={values}
              validationSchema={agentValidationSchema}
              onSubmit={(values, setFieldError) => {
                handleSubmitAgent(values, setFieldError);
              }}
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
                <div>
                  <form
                    className="av-tooltip tooltip-label-bottom formGroups"
                    onSubmit={(e) => handleSubmit(e, setFieldError)}
                  >
                    {console.log(values)}
                    <h5 className="f-w-600 " style={{ fontSize: '19.24px', marginBottom: '28.39px' }}>{values?.id ? 'Edit' : 'Create New'} Agent</h5>
                    <Row>
                      <Col md={4}>
                        <div className="mb-2">
                          <Label className="form-labels">Business Name</Label>
                          <Field
                            className="form-control"
                            type="text"
                            placeholder="Please Type"
                            name="business_name"
                            autoComplete="off"
                            value={values?.business_name}
                            onChange={handleChange}
                          />
                          {errors.business_name && touched.business_name ? (
                            <div className="text-danger mt-1">
                              {errors.business_name}
                            </div>
                          ) : null}
                        </div>
                      </Col>
                      <Col md={4}>
                        <div className="mb-2">
                          <Label className="form-labels">ABN</Label>
                          <Field
                            className="form-control"
                            type="text"
                            placeholder="Please Type"
                            name="abn"
                            autoComplete="off"
                            value={values?.abn}
                            onChange={handleChange}
                          />
                          {errors.abn && touched.abn ? (
                            <div className="text-danger mt-1">
                              {errors.abn}
                            </div>
                          ) : null}
                        </div>
                      </Col>
                      <Col md={4}>
                        <div className="mb-2">
                          <Label className="form-labels">Status</Label><span className="asterisk">*</span>
                          <CustomDropdown name='status' options={statusOption} setFieldValue={setFieldValue} selectValue={values} from='status' />
                          {errors.status && touched.status ? (
                            <div className="text-danger mt-1">
                              {errors.status}
                            </div>
                          ) : null}
                        </div>
                      </Col>
                    </Row>
                    <Row>
                      <Col md={4}>
                        <div className="mb-2">
                          <Label className="form-labels">Display Name</Label><span className="asterisk">*</span>
                          <div className="d-flex">
                            <Field
                              className="form-control"
                              type={"text"}
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
                        </div>
                      </Col>
                      <Col md={4}>
                        <div className="mb-2">
                          <Label className="form-labels">Contact Email</Label><span className="asterisk">*</span>
                          <div className="d-flex">
                            <Field
                              className="form-control"
                              type="text"
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
                        </div>
                      </Col>
                      <Col md={4}>
                        <div className="mb-2">
                          <Label className="form-labels">Contact Phone</Label><span className="asterisk">*</span>
                          <div className="input-group" style={{ padding: '0px',border:'none' }}>
                            <div className="input-group-prepend"><span className="input-group-text">+61</span></div>
                            <InputMask mask='9999 999 999' maskChar={null} onBlur={(e) => console.log(e.target.value.replace(/ /g, ''))}
                              className="form-control"
                              placeholder="Please Type"
                              name="contact"
                              type="text"
                              value={ values?.contact}
                              onChange={handleChange} />

                          </div>
                          {/* <div className="input-group">
                            <div className="input-group-prepend">
                              <span className="input-group-text" style={{ borderTopLeftRadius: '6px', borderBottomLeftRadius: '6px' }}>+61</span>
                            </div>
                            <InputMask
                              mask="9999 999 999"
                              maskChar={null}
                              onBlur={(e) =>
                                console.log(e.target.value.replace(/ /g, ''))
                              }
                              className="form-control"
                              placeholder="Please Type"
                              type="text"
                              // maxlength="12"
                              name="contact"
                              autoComplete="off"
                              value={values?.contact}
                              onChange={handleChange}
                            />
                          </div> */}
                          {/* <div className="d-flex">
                            <Field
                              className="form-control"
                              type={"text"}
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
                        </div>
                      </Col>

                    </Row>
                    <Row>
                      {/* {!values?.id && */}
                      <>
                        <Col md={4}>
                          <div className="mb-2">
                            <Label className="form-labels">First Name</Label><span className="asterisk">*</span>
                            <div className="d-flex">
                              <Field
                                className="form-control"
                                type={"text"}
                                name="f_name"
                                placeholder="Please Type"
                                value={values?.f_name}
                                onChange={handleChange}
                              />
                            </div>
                            {errors.f_name && touched.f_name ? (
                              <div className="text-danger mt-1">
                                {errors.f_name}
                              </div>
                            ) : null}
                          </div>
                        </Col>
                        <Col md={4}>
                          <div className="mb-2">
                            <Label className="form-labels">Last Name</Label><span className="asterisk">*</span>
                            <div className="d-flex">
                              <Field
                                className="form-control"
                                type={"text"}
                                name="l_name"
                                placeholder="Please Type"
                                value={values?.l_name}
                                onChange={handleChange}
                              />
                            </div>
                            {errors.l_name && touched.l_name ? (
                              <div className="text-danger mt-1">
                                {errors.l_name}
                              </div>
                            ) : null}
                          </div>
                        </Col>
                      </>
                      {/* } */}
                      {/* <Col md={values?.id ? 8 : 4}> */}
                      <Col md={4}>
                        <div className="mb-2">
                          <Label className="form-labels">Address</Label>
                          <div className="d-flex">
                            <Field
                              className="form-control"
                              type={"text"}
                              name="address"
                              placeholder="Please Type"
                              value={values?.address}
                              onChange={handleChange}
                            />
                          </div>
                        </div>
                      </Col>
                    </Row>
                    <div className="mb-2">
                      <Row className="mt-2">
                        <Col md={4}>
                          <div className="">
                            <Label className="form-labels">Agent Affiliate Identifier</Label><span className="asterisk">*</span>
                            <div className="d-flex">
                              <Field
                                className="form-control"
                                type={"text"}
                                name="coupon_code"
                                placeholder="Please Type"
                                value={values?.coupon_code}
                                onChange={handleChange}
                              />
                            </div>
                            {errors.coupon_code && touched.coupon_code ? (
                              <div className="text-danger mt-1">
                                {errors.coupon_code}
                              </div>
                            ) : null}
                          </div>
                        </Col>
                        <Col md={4}>
                          <div className="">
                            <Label className="form-labels">Project Commission (%)</Label><span className="asterisk">*</span>
                            <div className="d-flex">
                              <Field
                                className="form-control"
                                type="text"
                                name="commission_charge"
                                placeholder="Please Type"
                                value={values?.commission_charge}
                                onChange={handleChange}
                              />
                            </div>
                            {errors.commission_charge && touched.commission_charge ? (
                              <div className="text-danger mt-1">
                                {errors.commission_charge}
                              </div>
                            ) : null}
                          </div>
                        </Col>
                        <Col md={4}>
                          <div className="">
                            <Label className="form-labels">Customer Discount (%)</Label><span className="asterisk">*</span>
                            <div className="d-flex">
                              <Field
                                className="form-control"
                                type="text"
                                name="discount"
                                placeholder="Please Type"
                                value={values?.discount}
                                onChange={handleChange}
                              />
                            </div>
                            {errors.discount && touched.discount ? (
                              <div className="text-danger mt-1">
                                {errors.discount}
                              </div>
                            ) : null}
                          </div>
                        </Col>
                      </Row>
                    </div>
                    {/* <div className='sub-header'>
                      <p className='' style={{ marginTop: 0 }} >Bank Details</p>
                    </div>
                    <div className="" style={{ padding: '0px 12px 0px 12px' }}>
                      <Row>
                        <Col md={4}>
                          <div className="">
                            <Label className="form-labels">Account Name</Label>
                            <Field
                              className="form-control"
                              type="text"
                              placeholder="Please Type"
                              name="account_name"
                              autoComplete="off"
                              value={values?.account_name}
                              onChange={(e) => {
                                handleChange(e, 'account_name');
                              }}
                            />
                            {errors.account_name && touched.account_name ? (
                              <div className="text-danger mt-1">
                                {errors.account_name}
                              </div>
                            ) : null}
                          </div>
                        </Col>
                        <Col md={4}>
                          <div className="">
                            <Label className="form-labels">BSB</Label>
                            <Field
                              className="form-control"
                              type="text"
                              placeholder="Please Type"
                              name="bsb_number"
                              autoComplete="off"
                              value={values?.bsb_number}
                              onChange={(e) => {
                                handleChange(e, 'bsb_number');
                              }}

                            />
                            {errors.bsb_number && touched.bsb_number ? (
                              <div className="text-danger mt-1">
                                {errors.bsb_number}
                              </div>
                            ) : null}
                          </div>
                        </Col>
                        <Col md={4}>
                          <div className="">
                            <Label className="form-labels">Account Number</Label>
                            <Field
                              className="form-control"
                              type="text"
                              placeholder="Please Type"
                              name="account_number"
                              autoComplete="off"
                              value={values?.account_number}
                              onChange={(e) => {
                                handleChange(e, 'account_number');
                              }}

                            />
                            {errors.account_number && touched.account_number ? (
                              <div className="text-danger mt-1">
                                {errors.account_number}
                              </div>
                            ) : null}
                          </div>
                        </Col>
                      </Row>
                    </div> */}
                    <div className="form-group float-right" style={{ marginTop: "30px" }}>
                      <Button
                        className="btnCancel mr-3"
                        size="medium"
                        onClick={() => back()}
                      >
                        {"Cancel"}
                      </Button>
                      <Button
                        className="float-right btn btn-primary"
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
                  </form>
                </div>
              )}
            </Formik>
          </Card>
        </ModalBody>
      </Modal>
    </>
  );
};

export default AgentAdd;