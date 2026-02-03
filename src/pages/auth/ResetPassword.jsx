import React, { useState } from "react";
import {
  Row,
  Card,
  CardTitle,
  Label,
  Col,
  Button, Spinner
} from "reactstrap";
import { useParams, useNavigate } from "react-router-dom";
import { Formik, Field } from "formik";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import * as Yup from "yup";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { postRequest } from '../../hooks/axiosClient';
import LogoIco from "../../assets/icons/Logo.svg";
import "./auth.css";


const passwordSchema = Yup.object().shape({
  password: Yup.string()
    .required("This field is required."),
  password_confirmation: Yup.string().required("This field is required.").oneOf([Yup.ref('password'), null], 'Passwords mismatch.'),

});

const Reset = () => {
  const { token } = useParams();
  const [isRevealPwd, setIsRevealPwd] = useState(false);
  const [isRevealPwdConfirm, setIsRevealPwdConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const initialFormValues = {
    password: "",
    password_confirmation: "",
  };

  const navigate = useNavigate();

  const handleSubmitPassword = async (values) => {
    setLoading(true)
    try {
      const data = {
        token: token,
        password: values.password,
        password_confirmation: values.password_confirmation
      };
      const response = await postRequest('reset-password', data);
      if (response.type === 2) {
        toast.error(response.errormessage);
      } else {
        toast.success(response?.response?.data?.message);
        navigate("/");
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false)

    }
  };

  return (
    <div className="justify-content-center align-items-center vertical-center container">
      <div className="row row-width" >
        <div className="col-md-12 ">
          <Card
            style={{
              borderRadius: "5px",
            }}
          >
            <Row>
              <Col xs={12} sm={12}>
                <div className="form-side">
                  <div className="img-center-register" >
                    <img
                      src={LogoIco}
                      alt="logo"
                      className="image-logo"
                    />
                  </div>
                  <div className="row forms">
                    <div className="col-sm-10 offset-1">
                      <CardTitle className=" text-center">
                        <h5
                          style={{
                            color: "#1D1D1B",
                            fontSize: "19.64px",
                            marginBottom: "20px",
                            fontWeight: 'bold'
                          }}
                        >
                          Reset password
                        </h5>

                      </CardTitle>
                      <Formik
                        initialValues={initialFormValues}
                        validationSchema={passwordSchema}
                        onSubmit={(values) => {
                          handleSubmitPassword(values);
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
                            <div className="marginBottom">
                              <Label for="new_password" className="form-labels">New Password</Label><span class="asterisk">*</span>
                              <div className="d-flex">
                                <Field
                                  id="new_password"
                                  className="form-control custom-input"
                                  type={isRevealPwd ? "text" : "Password"}
                                  name="password"
                                  placeholder="Enter new password"
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
                                      outline: "none", // Add this line to remove the focus outline
                                    }}
                                    tabIndex="0" // Add this line to make the span focusable
                                    onBlur={(e) => e.target.blur()} // Add this line to remove focus when span loses focus

                                  >
                                    {!isRevealPwd && (
                                      <FaEyeSlash
                                        title="Hide password"
                                        onClick={() =>
                                          setIsRevealPwd(
                                            (prevState) => !prevState
                                          )
                                        }
                                      />
                                    )}
                                    {isRevealPwd && (
                                      <FaEye
                                        title="Show Password"
                                        onClick={() =>
                                          setIsRevealPwd(
                                            (prevState) => !prevState
                                          )
                                        }
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
                            <div className="marginBottom">
                              <Label for="confirm_password" className="form-labels">Confirm Password</Label><span class="asterisk">*</span>
                              <div className="d-flex">
                                <Field
                                  id="confirm_password"
                                  className="form-control custom-input"
                                  type={isRevealPwdConfirm ? "text" : "Password"}
                                  name="password_confirmation"
                                  placeholder="Enter confirm password"
                                  value={values?.password_confirmation}
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
                                      outline: "none", // Add this line to remove the focus outline
                                    }}
                                    tabIndex="0" // Add this line to make the span focusable
                                    onBlur={(e) => e.target.blur()} // Add this line to remove focus when span loses focus

                                  >
                                    {!isRevealPwdConfirm && (
                                      <FaEyeSlash
                                        title="Hide password"
                                        onClick={() =>
                                          setIsRevealPwdConfirm(
                                            (prevState) => !prevState
                                          )
                                        }
                                      />
                                    )}
                                    {isRevealPwdConfirm && (
                                      <FaEye
                                        title="Show Password"
                                        onClick={() =>
                                          setIsRevealPwdConfirm(
                                            (prevState) => !prevState
                                          )
                                        }
                                      />
                                    )}
                                  </span>
                                </div>
                              </div>
                              {errors.password_confirmation && touched.password_confirmation ? (
                                <div className="text-danger mt-1">
                                  {errors.password_confirmation}
                                </div>
                              ) : null}
                            </div>
                            <div className="form-group text-center mt-5 pb-3">
                              <Button
                                className="btn-signin btn-primary"
                                htmlType="submit"
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
                        )}
                      </Formik>
                    </div>
                  </div>
                </div>
              </Col>
            </Row>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Reset;
