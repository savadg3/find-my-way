import React, { useEffect, useState } from "react";
import { Formik, Field } from "formik";
import {
  Row,
  Card,
  Label,
  Col,
  CardBody,
 ModalBody, Modal,
  Button,
} from "reactstrap";
import * as Yup from "yup";
import { getRequest, putRequest, postRequest } from '../../hooks/axiosClient';
import { getCurrentUser, setCurrentUser } from "../../helpers/utils";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { SetBackEndErrorsAPi } from '../../hooks/setBEerror';
import InputMask from 'react-input-mask';
import { environmentaldatas } from "../../constant/defaultValues";


const {phoneRegExp} = environmentaldatas


const ProfileSchema = Yup.object().shape({
  first_name: Yup.string().required("This field is required."),
  email: Yup.string()
    .email("Invalid email format.")
    .required("This field is required."),
  contact: Yup.string()
    .required("This field is required.")
    .matches(phoneRegExp, "Please enter a valid phone number."),

});

const validationSchema = Yup.object().shape({
  code: Yup.string().required("This field is required."),
});

const Profile = ({ onUsernameUpdate }) => {
  const initialFormValues = {
    first_name: '',
    last_name: '',
    email: '',
    contact: '',
    code: ''
  };

  const [formDetails, setFormDetails] = useState(initialFormValues);
  const [loading, setLoading] = useState(false);
  const id = getCurrentUser()?.user?.id;
  const user = getCurrentUser()?.user?.role_id;
  const [cardSubmitPopup, setCardSubmitPopup] = useState(false);
  const toggle2 = () => setCardSubmitPopup(!cardSubmitPopup);
  const [agentDetails, setAgentDetails] = useState();
  const [aCode, agentCode] = useState();
  const [isAffiliate, setAsAffiliate] = useState(false);

  const [codeInitialValues, setCodeInitialValues] = useState({
    code: formDetails?.customer_coupon_code ?? ''
  });


  const getFormData = async () => {
    // setLoading(true);
    try {
      const response = await getRequest(`settings/${id}`);
      const formDataRes = response.data.data ?? [];
      const fullName = formDataRes?.first_name + (formDataRes?.last_name ?? '')
      let data = {
        ...formDataRes,
        first_name: fullName,
        code: formDataRes?.customer_coupon_code
      };
      setFormDetails(data);
      onUsernameUpdate(data);
      // setLoading(false);

    } catch (error) {
    }
  };

  useEffect(() => {
    getFormData();
  }, []);

  
  useEffect(() => {
    console.log('formdata updated');
    setLoading(true)
    setCodeInitialValues({
      code: formDetails?.customer_coupon_code ?? ''
    });
    setLoading(false)

  }, [formDetails]);


  const handleSubmitProfile = async (values, setFieldError) => {
    try {
      const data = {
        id: id,
        first_name: values?.first_name || '',
        last_name: values?.last_name || '',
        email: values?.email || '',
        contact: values?.contact || '',
      };
      const response = await putRequest(`settings/${id}`, data);
      if (response.type === 2) {
        SetBackEndErrorsAPi(response, setFieldError);
      } else {

        window.location.reload(); // Reload the page
        let userdata = response?.response?.data?.userdata;
        if (!userdata) {
          const currentuser = getCurrentUser();
          if (currentuser) {
            currentuser.first_name = data?.first_name;
            currentuser.last_name = data?.last_name;
            currentuser.contact = data?.contact;
            currentuser.email = data?.email;
            userdata = currentuser;
          }
        }
        setCurrentUser(userdata);
        getFormData();
        toast.success(response?.response?.data?.message);

      }
    } catch (error) {
    }
  }

  const handleValidate = async (values, setFieldError, from) => {
    console.log(values)
    try {
      const data = {
        code: values?.code,
      };
      const response = await postRequest(`validate-customer-code`, data);
      if (response.type === 2) {
        SetBackEndErrorsAPi(response, setFieldError);
      } else {
        let agentData = response?.response?.data?.coupon_details
        if (from == 'submit') {
          toggle2();
        }
        setAgentDetails(agentData)
        agentCode(values?.code)
        setAsAffiliate(false)
      }
    } catch (error) {
      console.error(error);
    }
  };

  const submitCode = async () => {
    try {
      const data = {
        code: aCode,
        common_id: getCurrentUser()?.user?.common_id
      };
      const response = await postRequest(`update-customer-code`, data);
      if (response.type === 2) {
        SetBackEndErrorsAPi(response, setFieldError);
      } else {
        let agentData = response?.response?.data?.coupon_details
        toggle2();
        getFormData();
        agentCode();
        setAgentDetails()
        // reloadComponent();
        toast.success(response?.response?.data?.message);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleModalClosed = () => {
    setCodeInitialValues({code:''})
    agentCode();
    getFormData()
  };



  return (
  // loading ? (
  //   <div className="w-100 ml-3 pt-2 position-relative">
  //     Loading...
  //     <div className="loading  top-50  translate-middle left-0 position-absolute" />
  //   </div>
  // ) :
   
      <>
        <div className="container-fluid">
          <Card>
            <CardBody>
              <Formik
                initialValues={formDetails}
                validationSchema={ProfileSchema}
                onSubmit={(values, setFieldError) => {
                  handleSubmitProfile(values, setFieldError);
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
                      <h5 className="f-w-600 mb-2 heading-font" >Profile</h5>
                      <hr></hr>
                      <Row className="mt-2">
                        <Col md={6}>
                          <div className="mb-2">
                            <Label for="fName" className="form-labels">Full Name</Label><span className="asterisk">*</span>
                            <div className="d-flex">
                              <Field
                                id="fName"
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
                          </div>
                        </Col>
                        <Col md={6}>
                          <div className="mb-2">
                            <Label for="email" className="form-labels">Email Address</Label><span className="asterisk">*</span>
                            <div className="d-flex">
                              <Field
                                id="email"
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
                      </Row>
                      <Row className="mt-2">
                        <Col md={6}>
                          <div className="mb-2">
                          <Label for="number" className="form-labels">Phone Number</Label><span className="asterisk">*</span>
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
                            {/* <div className="d-flex">
                              <Field
                                id="number"
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
                          </div>
                        </Col>
                        <Col md={6}>
                          {(user == 2 ) &&
                            <Formik
                            initialValues={codeInitialValues}
                              validationSchema={validationSchema}
                              onSubmit={(values, setFieldError) => {
                                handleValidate(values, setFieldError, 'submit');
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
                                    className="av-tooltip  formGroups "
                                    onSubmit={(e) => handleSubmit(e, setFieldError)}
                                >
                                    <Row>
                                      <Col md={12}>
                                        <div className="mb-2">
                                          <Label for="af_code" className="form-labels">Affiliate Code</Label><span className="asterisk">*</span>
                                          <div className="d-flex ">
                                            <Field
                                              id="af_code"
                                              className="aflCode form-control"
                                              type="text"
                                              name="code"
                                              placeholder="Please Type"
                                              value={values?.code}
                                              onChange={handleChange}
                                              disabled={!isAffiliate}
                                            />
                                            <div className="input-group-append " >
                                              <span
                                                className=" float-right afCode form-control input-group-text "
                                                type="primary"
                                                size="medium"
                                                onClick={() => {
                                                  setAsAffiliate(true)
                                                  if (isAffiliate) {
                                                    handleSubmit();
                                                  }
                                                }}
                                              >
                                                {isAffiliate ? "Validate" : "Edit"}
                                              </span>
                                            </div>
                                          </div>
                                        </div>
                                        {errors.code && touched.code ? (
                                          <div className="text-danger ">
                                            {errors.code}
                                          </div>
                                        ) : null}
                                        {formDetails?.customer_coupon_code &&
                                          <Row className="mt-1">
                                            <Col sm={12}>
                                              <div className='plan-detail-div' >
                                                <p className="f-w-600 mb-1" style={{ fontSize: '1rem' }}> Details</p>
                                                <hr></hr>
                                                <div className='d-flex justify-content-between mt-2' >
                                                  <span style={{ color: '#6a727d', fontWeight: '500', fontSize: '0.875rem', }}>
                                                    Name
                                                  </span>
                                                  <span style={{ color: '#1D1D1B', fontWeight: '500', fontSize: '1rem', }}>
                                                    {formDetails?.agent_name}
                                                  </span>
                                                </div>
                                                <div className='d-flex justify-content-between' >
                                                  <span style={{ color: '#6a727d', fontWeight: '500', fontSize: '0.875rem', }}>
                                                    Discount
                                                  </span>
                                                  <span style={{ color: '#1D1D1B', fontWeight: '500', fontSize: '1rem', }}>
                                                    {formDetails?.discount ?? 0}%
                                                  </span>
                                                </div>
                                              </div>
                                            </Col>
                                          </Row >
                                        }
                                      </Col>
                                    </Row>
                                  </form>
                                </div>
                              )}
                            </Formik>
                          }
                        </Col>
                      </Row>
                      <div className="form-group " style={{ marginTop: "30px", marginBottom: "22px" }}>
                        <Button
                          className="float-right btn btn-primary"
                          htmlType="submit"
                          type="primary"
                          size="medium"
                          style={{ marginTop: '2px' }}
                        >
                          {"Submit"}
                        </Button>
                      </div>
                    </form>
                  </div>
                )}
              </Formik>
            </CardBody>
          </Card>
          <Modal isOpen={cardSubmitPopup} toggle={toggle2} size='md' onClosed={handleModalClosed} style={{ zIndex: '999999 !important' }} centered>
            <ModalBody className=' '>
              <Row>
                <Col sm={12}>
                  <div className="mt- " style={{ fontSize: '1rem', color: '#000', padding: '12px', fontWeight: '500' }}>
                    <span>Wow, the code you entered is correct. Please click on the 'Save' button to confirm the details. If incorrect, please click on the 'Cancel' button and enter a new valid code</span>
                  </div>
                </Col>
              </Row >
              <Row className="mt-1">
                <Col sm={12}>
                  <div className='plan-detail-div' >
                    <p className="f-w-600 mb-1" style={{ fontSize: '1rem' }}> Details</p>
                    <hr></hr>
                    <div className='d-flex justify-content-between mt-2' >
                      <span style={{ color: '#6a727d', fontWeight: '500', fontSize: '0.875rem', }}>
                        Name
                      </span>
                      <span style={{ color: '#1D1D1B', fontWeight: '500', fontSize: '1rem', }}>
                        {agentDetails?.agent_name}
                      </span>
                    </div>
                    <div className='d-flex justify-content-between' >
                      <span style={{ color: '#6a727d', fontWeight: '500', fontSize: '0.875rem', }}>
                        Discount
                      </span>
                      <span style={{ color: '#1D1D1B', fontWeight: '500', fontSize: '1rem', }}>
                        {agentDetails?.discount_percentage ?? 0}%
                      </span>
                    </div>
                  </div>
                </Col>
              </Row >
              <div className="form-group text-right " style={{ marginTop: "30px" }}>
                <Button color="secondary" className="btn btnCancel mr-3" onClick={() => { toggle2(); agentCode(); getFormData() }}>
                  Cancel
                </Button>
                <Button color="primary" className="btn btn-primary float-right" onClick={() => submitCode()} >
                  Save
                </Button>
              </div>
            </ModalBody>
          </Modal>
        </div>
      </>
    )
}
export default Profile;