import React, { useState } from 'react';
import { Row, Card, CardTitle, Label, Col, Button, Spinner } from 'reactstrap';
import { NavLink, useNavigate } from 'react-router-dom';
import { Formik, Field } from 'formik';
import { postRequest } from '../../hooks/axiosClient';
import * as Yup from 'yup';
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Image from "../../assets/img/signup.svg";
import LogoIco from "../../assets/icons/Logo.svg";
import "./auth.css";


const SignupSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email format.').required('This field is required.'),
});

function Forgot() {
  
  const navigate = useNavigate()
  const initialFormValues = {
    email: '',
  };
  const [loading, setLoading] = useState(false);

  const handleSubmitProfile = async (values) => {
    setLoading(true)
    try {
      const response = await postRequest('forgot-password', values);
      const loginData = response.response?.data ?? [];
      if (response.type === 2) {
        toast.error(response?.errormessage);
      } else {
        toast.success(loginData?.message);
        navigate('/')
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false)
    }
  };

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
              <Col xs={12} sm={5}>
                <div className="forms">
                  <div className="img-center" >
                    <img
                      src={LogoIco}
                      alt="logo"
                      className="image-logo"
                    />
                  </div>
                  <CardTitle className=" text-center" style={{ marginBottom: '20px' }}>
                    <h5
                      style={{
                        color: "#1D1D1B",
                        fontSize: "19.64px",
                        marginBottom: "5px",
                        fontWeight: 'bold'
                      }}
                    >
                      Forgot password
                    </h5>
                  </CardTitle>
                  <Formik
                    initialValues={initialFormValues}
                    validationSchema={SignupSchema}
                    onSubmit={(values) => {
                      handleSubmitProfile(values);
                    }}
                  >
                    {({ errors, values, touched, handleSubmit, handleChange }) => (
                      <form className="av-tooltip tooltip-label-bottom formGroups" onSubmit={handleSubmit}>
                        <div className='mb-3'>
                          <Label for="exampleEmail1" className="form-labels">Email</Label><span className="asterisk">*</span>
                          <Field
                            className="form-control custom-input"
                            type="text"
                            placeholder="Enter email address"
                            name="email"
                            autoComplete="off"
                            value={values?.email}
                            onChange={handleChange}
                          />
                          {errors.email && touched.email ? (
                            <div className="text-danger mt-1">{errors.email}</div>
                          ) : null}
                        </div>
                        <div className="form-group text-center" style={{ marginTop: '40px' }}>
                          <Button className="btn-signin btn-signin btn-primary" htmlType="submit" disabled={loading}>
                            {loading ? (
                              <>
                                <p style={{ opacity: '0', position: 'relative' }}>Send</p>
                                <Spinner
                                  className="ml-2 spinner-style"
                                  color="light"
                                />
                              </>
                            ) : 'Send'}
                          </Button>
                        </div>
                        <div style={{ fontSize: '0.875rem', textAlign: 'center', marginTop: '140px' }}>
                          <NavLink className="forgot-pass-link " to="/">
                            <span className='link'>Back to Log In</span>
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
}

export default Forgot;
