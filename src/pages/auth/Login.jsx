import React, { useState, useEffect } from "react";
import {
  Row,
  Card,
  CardTitle,
  Label,
  Col,
  Button, Spinner
} from "reactstrap";
import { NavLink, useNavigate } from "react-router-dom";
import { Formik, Field } from "formik";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import * as Yup from "yup";
import { postRequest } from '../../hooks/axiosClient';
import { setCurrentUser, encode } from '../../helpers/utils';
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LogoIco from "../../assets/icons/Logo.svg";
import "./auth.css";
import TimeoutModal from "./TimeoutModal";
import hashids from '../../components/common/common';
import Image from "../../assets/img/signup.svg";

const SignupSchema = Yup.object().shape({
  email: Yup.string()
    .email("Invalid email format.")
    .required("This field is required."),
  password: Yup.string().required("This field is required."),
});


const Login = () => {

  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isRevealPwd, setIsRevealPwd] = useState(false);
  const [showTime, setShowTime] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [modal, setModal] = useState(false);
  const [ip, setIP] = useState('');
  const toggle = () => setModal((prev) => !prev);

  const getIP = async () => {
    try {
      const res = await fetch('https://api.ipify.org?format=json');
      const data = await res.json();
      setIP(data.ip);
    } catch (error) {
      console.error('Failed to fetch the IP address:', error);
    }
  };

  const initialFormValues = {
    email: "",
    password: "",
  };

  const handleSubmitProfile = async (values) => {
    setLoading(true)
    let postData = {
      email: values?.email,
      password: values?.password,
      ip_address: ip
    }
    try {
      const response = await postRequest('login', postData);
      const loginData = response.response?.data ?? [];
      if (response.type === 2) {
        onResponseFails(response)
      } else {
        setCurrentUser(loginData);
        onResponseSuccess(loginData);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false)
    }
  };

  const onResponseFails = (response) => {
    // setLoginAttempts(loginAttempts + 1);
    // if (loginAttempts + 1 >= 6) {
    //   toggle();
    //   setShowTime(true)
    // }
    toast.error(response.errormessage);
  }


  const onResponseSuccess = (loginData) => {
    console.log(loginData,"loginData?.user?.id")
    if (loginData?.user?.isExpired) {
      navigate(`/two-step-verification/${hashids.encode(loginData?.user?.id)}`);
    } else {
      switch (loginData?.user?.role_id) {
        case 1:
          navigate("/admin");
          break;
        case 2:
          navigate("/dashboard");
          break;
        case 3:
          navigate(`/agent-portal/${encode(loginData?.user?.role_id)}/${encode(loginData?.user?.common_id)}`);
          break;
        default:
          break;
      }
    }
  }

  useEffect(() => {
    getIP();
    localStorage.removeItem('current_user');

    // const preventNavigation = (e) => {
    //   e.preventDefault();
    //   e.returnValue = "You are not allowed to leave this page.";
    // };
    // window.onbeforeunload = preventNavigation;
    // return () => {
    //   window.onbeforeunload = null;
    // };
  }, []);

  return (
    <div className="justify-content-center align-items-center vertical-center container">
      <Row className=" justify-content-center" style={{ width: "100%" }}>
        <Col xs={12} sm={12} md={12} lg={10} xl={10} className=" align-card-center">
          <Card className="auth-card">
            <Row style={{ padding: '16px' }}>
              <Col xs={12} sm={7}>
                <div className="imageContainer">
                  <img src={Image} alt="logo" className="imageLogin" />
                </div>
              </Col>
              <Col xs={12} sm={5}>
                <div className="forms">
                  <div className="img-center" >
                    <img
                      src={LogoIco}
                      alt="logo"
                      className="image-logo"
                    />
                  </div>
                  <CardTitle className=" text-center" style={{ marginBottom: ' 10.52px' }}>
                    <h5
                      style={{
                        color: "#1D1D1B",
                        fontSize: "19.64px",
                        fontWeight: 'bold'
                      }}
                    >
                      Log in to your account
                    </h5>
                  </CardTitle>
                  <Formik
                    initialValues={initialFormValues}
                    validationSchema={SignupSchema}
                    onSubmit={(values) => {
                      handleSubmitProfile(values);
                    }}
                  >
                    {({
                      errors,
                      values,
                      touched,
                      handleSubmit,
                      handleChange,
                    }) => (
                      <form
                        className="av-tooltip tooltip-label-bottom formGroups"
                        onSubmit={handleSubmit}
                      >
                        <div >
                          <Label for="exampleEmail1" className="form-labels">Email</Label><span className="asterisk">*</span>
                          <Field
                            id="exampleEmail1"
                            className="form-control custom-input"
                            type="text"
                            placeholder="Enter email address"
                            name="email"
                            autoComplete="off"
                            value={values?.email}
                            onChange={handleChange}
                          />
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
                        <div className="actions mt-2 ">
                          <NavLink
                            className="forgot-pass-link float-right"
                            to="/forgot-password"
                          >
                            <span className="link">
                              {" "}
                              Forgot Password?
                            </span>
                          </NavLink>
                        </div>
                        <div className="form-group text-center">
                          <Button
                            className="btn-signin btn-primary"
                            htmlType="submit"
                            disabled={showTime || loading}
                          >
                            {loading ? (
                              <>
                                <p style={{ opacity: '0', position: 'relative' }}>Log In</p>
                                <Spinner
                                  className="ml-2 spinner-style"
                                  color="light"
                                />
                              </>
                            ) : 'Log In'}
                          </Button>
                        </div>
                        <div className="creat-an-account" >
                          <span style={{ color: '#8b8e97' }} >
                            Don't have an account?{" "}
                          </span>
                          <NavLink
                            className="forgot-pass-link"
                            to="/register"
                          >
                            <span className="link"> Sign Up</span>
                          </NavLink>
                        </div>
                      </form>
                    )}
                  </Formik>
                </div>
              </Col>
            </Row>
          </Card>
          <TimeoutModal
            modal={modal}
            setModal={setModal}
            setLoginAttempts={setLoginAttempts}
            setShowTime={setShowTime}
            showTime={showTime}
          />
        </Col>
      </Row>
    </div>
  );
};

export default Login;
