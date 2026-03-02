import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Formik, Field } from "formik";
import * as Yup from "yup";
import { postRequest } from '../../hooks/axiosClient'
import { NavLink } from "react-router-dom";
import {
  Row,
  Card,
  CardTitle,
  Label,
  Col,
  Button, Spinner, Input
} from "reactstrap";
import Image from "../../assets/img/signup.svg";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LogoIco from "../../assets/icons/Logo.svg";
import { SetBackEndErrorsAPi } from '../../hooks/setBEerror';
import "./auth.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import "yup-phone"; 
import InputMask from 'react-input-mask';
import { environmentaldatas } from "../../constant/defaultValues";


const {phoneRegExp} = environmentaldatas

const SignupSchema = Yup.object().shape({
  first_name: Yup.string().required("This field is required."),
  email: Yup.string().required("This field is required.").email("Invalid email format."),
  password: Yup.string().required("This field is required."),
  confirm_password: Yup.string()
    .required("This field is required.")
    .oneOf([Yup.ref("password"), null], "Passwords must match"),
  contact: Yup.string().required("This field is required.")
    .matches(phoneRegExp, "Please enter a valid phone number."),
});

const Register = () => {
  const navigate = useNavigate();

  const [buttonDisable, setButtonDisable] = useState(false);
  const [isRevealPwd, setIsRevealPwd] = useState(false);
  const [isRevealconPwd, setIsRevealconPwd] = useState(false);

  const initialFormValues = {
    business_name: null,
    first_name: null,
    last_name: null,
    email: null,
    contact: null,
    password: null,
    confirm_password:null,
    coupon_code: null,
    is_accepted: 0

  };

  const registerHandler = async (values, setFieldError) => {
    setButtonDisable(true)
    let data = {
      first_name: values?.first_name,
      email: values?.email,
      password: values?.password,
      confirm_password: values?.confirm_password,
      business_name: values?.business_name,
      contact: values?.contact,
      coupon_code: values?.coupon_code,
      is_accepted: values?.is_accepted,
      ip_address: ip
    }
    try {
      const response = await postRequest('register', data);
      if (response.type === 2) {
        SetBackEndErrorsAPi(response, setFieldError);
        setButtonDisable(false)
      } else {
        toast.success(response?.response?.data?.message);
        navigate("/");
      }

    } catch (error) {
      console.log(error);
    }
  };

  const [ip, setIP] = useState('');

  const getIP = async () => {
    try {
      const res = await fetch('https://api.ipify.org?format=json');
      const data = await res.json();
      setIP(data.ip);
    } catch (error) {
      console.error('Failed to fetch IP address:', error);
    }
  }

  useEffect(() => {
    getIP();
  }, [])

  const handleCheckboxChange = (e, setFieldValue) => {
    if (e.target.checked) {
      setFieldValue('is_accepted', 1)
    } else {
      setFieldValue('is_accepted', 0)
    }
  }


  return (
    <div className="justify-content-center align-items-center vertical-center container">
      <div className="row justify-content-center" style={{ width: "100%" }}>
        <div className="col-md-10  align-card-center">
          <Card className="auth-card">
            <Row style={{ padding: '15px' }}>
              <Col xs={12} sm={7}>
                <div className="imageContainer">
                  <img src={Image} alt="logo" className="imageLogin" />
                </div>
              </Col>
              <Col xs={12} sm={5} >
                <div className="forms">
                  <div className="img-center-register" >
                    <img
                      src={LogoIco}
                      alt="logo"
                      className="image-logo"
                    />
                  </div>
                  <CardTitle className=" text-center" style={{ marginBottom: '10.52px' }}>
                    <h5
                      style={{
                        color: "#1D1D1B",
                        fontSize: "19.64px",
                        fontWeight: 'bold'
                      }}
                    >
                      Create your account
                    </h5>
                  </CardTitle>
                  <Formik
                    initialValues={initialFormValues}
                    validationSchema={SignupSchema}
                    onSubmit={(values, { setFieldError }) => {
                      registerHandler(values, setFieldError);
                    }}
                  >
                    {({
                      errors,
                      values,
                      touched,
                      handleSubmit,
                      handleChange,
                      setFieldError,
                      setFieldValue,
                      setFieldTouched
                    }) => (
                      <form
                        className="av-tooltip tooltip-label-bottom formGroups"
                        onSubmit={handleSubmit}
                      >
                        <div >
                          <Label for="first_name" className="form-labels">Name</Label><span className="asterisk">*</span>
                          <Field
                            id="first_name"
                            className="form-control custom-input "
                            type="text"
                            placeholder="Enter full name"
                            name="first_name"
                            autoComplete="off"
                            value={values?.first_name}
                            onChange={handleChange}
                          />
                          {errors.first_name && touched.first_name ? (
                            <div className="text-danger mt-1">
                              {errors.first_name}
                            </div>
                          ) : null}
                        </div>
                        <div className="mt-1">
                          <Label for="email" className="form-labels">Email</Label><span className="asterisk">*</span>
                          <div className="d-flex">
                            <Field
                              id="email"
                              className="form-control custom-input"
                              type={"text"}
                              name="email"
                              placeholder="Enter email address"
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
                        <div className="mt-1">
                          <Label for="password" className="form-labels">Password</Label><span className="asterisk">*</span>
                          <div className="d-flex">
                            <Field
                              id="password"
                              className="form-control custom-input"
                              type={isRevealPwd ? "text" : "password"}
                              name="password"
                              placeholder="Enter password"
                              value={values?.password}
                              onChange={handleChange}
                            />
                            <div
                              className="input-group-append"
                              style={{ marginLeft: "-39px" }}
                            >
                              <span
                                className="input-group-text"
                                style={{
                                  border: "none",
                                  backgroundColor: "transparent",
                                }}
                              >
                                {isRevealPwd ? (
                                  <FaEyeSlash
                                    title="Hide password"
                                    onClick={() => setIsRevealPwd((prev) => !prev)}
                                  />
                                ) : (
                                  <FaEye
                                    title="Show password"
                                    onClick={() => setIsRevealPwd((prev) => !prev)}
                                  />
                                )}
                              </span>
                            </div>
                          </div>
                          {errors.password && touched.password ? (
                            <div className="text-danger mt-1">
                              {errors.password}
                            </div>
                          ) : null}
                        </div>
                        <div className="mt-1">
                          <Label for="confirm_password" className="form-labels">Confirm Password</Label><span className="asterisk">*</span>
                          <div className="d-flex">
                            <Field
                              id="confirm_password"
                              className="form-control custom-input"
                              type={isRevealconPwd ? "text" : "password"}
                              name="confirm_password"
                              placeholder="Enter confirm password"
                              value={values?.confirm_password}
                              onChange={handleChange}
                            />
                            <div
                              className="input-group-append"
                              style={{ marginLeft: "-39px" }}
                            >
                              <span
                                className="input-group-text"
                                style={{
                                  border: "none",
                                  backgroundColor: "transparent",
                                }}
                              >
                                {isRevealconPwd ? (
                                  <FaEyeSlash
                                    title="Hide password"
                                    onClick={() => setIsRevealconPwd((prev) => !prev)}
                                  />
                                ) : (
                                  <FaEye
                                    title="Show password"
                                    onClick={() => setIsRevealconPwd((prev) => !prev)}
                                  />
                                )}
                              </span>
                            </div>
                          </div>
                          {errors.confirm_password && touched.confirm_password ? (
                            <div className="text-danger mt-1">
                              {errors.confirm_password}
                            </div>
                          ) : null}
                        </div>
                        <div className="mt-1">
                          <Label for="Company" className="form-labels">Company</Label>
                          <div className="d-flex">
                            <Field
                              id="Company"
                              className="form-control custom-input"
                              type="text"
                              name="business_name"
                              placeholder="Enter company name"
                              value={values?.business_name}
                              onChange={handleChange}
                            />
                          </div>
                        </div>
                        <div className="mt-1">
                          <Label for="mNumber" className="form-labels">Phone Number</Label><span className="asterisk">*</span>
                          {/* <div className="d-flex align-items-center">
                            <PhoneInput
                              country={'au'}
                              value={values?.contact??'+61'}
                              onChange={(phone) => {

                                setFieldValue('contact', phone); // Add the country code if not present

                              }}
                              onBlur={() => setFieldTouched('contact')}
                              placeholder="Enter phone number"
                              className="tel-style"
                              disableDropdown={true}
                            />
                          </div> */}
                          <div className="input-group" style={{ padding: '0px',border:'none' }}>
                            <div className="input-group-prepend"><span className="input-group-text">+61</span></div>
                            <InputMask mask='9999 999 999' maskChar={null}
                              className="form-control"
                              placeholder="Please Type"
                              name="contact"
                              type="text"
                              value={ values?.contact}
                              onChange={handleChange} />

                          </div>

                          {errors.contact && touched.contact ? (
                            <div className="text-danger mt-1">{errors.contact}</div>
                          ) : null}
                          {/* <Label for="mNumber" className="form-labels">Phone Number</Label>
                          <div className="d-flex">
                            <Field
                              id="mNumber"
                              className="form-control custom-input"
                              type={"text"}
                              name="contact"
                              placeholder="Enter phone number"
                              value={values?.contact}
                              onChange={handleChange}
                            />
                          </div> */}
                          {/* {errors.contact && touched.contact ? (
                            <div className="text-danger mt-1">
                              {errors.contact}
                            </div>
                          ) : null} */}
                        </div>
                        <div className="mt-1" >
                          <Label for="code" className="form-labels">Affiliate Code (Optional)</Label>
                          <div className="d-flex">
                            <Field
                              id="code"
                              className="form-control custom-input"
                              type={"text"}
                              name="coupon_code"
                              placeholder="Enter affiliate code"
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
                        <div className='row mt-2'>
                          <div className='col-sm-12 '>
                            <div className="d-flex align-items-center">
                              <Input type="checkbox"
                                style={{ cursor: 'pointer', marginRight: '12px' }}
                                name="is_accepted"
                                className="check-bx float-right mt-0"
                                checked={values?.is_accepted}
                                onChange={(e) => {
                                  handleCheckboxChange(e, setFieldValue);
                                }}
                              />
                              <Label for="exampleName" className="T-C " style={{ fontSize: '13px' }}>I have read and agree to the <a style={{ color: '#26a3db' }} href="https://fmw.app/terms/" target="_blank" >Terms of Use</a> and <a style={{ color: '#26a3db' }} href="https://fmw.app/privacy/" target="_blank">Privacy Policy.</a><span className="asterisk">*</span> </Label>
                            </div>
                          </div>
                          {errors.is_accepted && touched.is_accepted ? (
                            <div className="text-danger mt-1">
                              {errors.is_accepted}
                            </div>
                          ) : null}
                        </div>
                        <div className="form-group text-center " style={{ marginTop: "30px", marginBottom: "22px" }}>
                          <Button
                            className="btn-signin btn-primary"
                            htmlType="submit"
                            disabled={buttonDisable || values?.is_accepted == 0}
                          >
                            {buttonDisable ? (
                              <>
                                <p style={{ opacity: '0', position: 'relative' }}>Sign Up</p>
                                <Spinner
                                  className="ml-2 spinner-style"
                                  color="light"
                                />
                              </>
                            ) : 'Sign Up'}
                          </Button>
                        </div>
                        <div className="creat-an-account" style={{ marginTop: '30px' }}>
                          <span style={{ color: '#8b8e97' }} >
                            Already have an account?{" "}
                          </span>
                          <NavLink
                            className="forgot-pass-link"
                            to="/"
                          >
                            <span className="link"> Log In</span>
                          </NavLink>
                        </div>
                      </form>
                    )}
                  </Formik>
                </div>
              </Col>
            </Row>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Register;
