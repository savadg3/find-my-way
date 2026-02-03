import React, { useState } from "react";
import { Formik, Field } from "formik";
import {
  Row,
  Card,
  Label,
  Col,
  CardBody,
  Button,Spinner
} from "reactstrap";
import * as Yup from "yup";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { postRequest } from '../../hooks/axiosClient';
import { getCurrentUser } from "../../helpers/utils";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { SetBackEndErrorsAPi } from '../../hooks/setBEerror';

const PasswordSchema = Yup.object().shape({
  old_password: Yup.string().required("This field is required."),
  new_password: Yup.string().required("This field is required."),
  confirm_password: Yup.string().required("This field is required.").oneOf([Yup.ref('new_password'), null], 'Passwords mismatch.'),
});

const id = getCurrentUser()?.user?.id;
const initialValues = {
  id:id,
  old_password: null,
  new_password: null,
  confirm_password: null
}

const ChangePassword = () => {
  const [isRevealPwdCurrent, setIsRevealPwdCurrent] = useState(false);
  const [isRevealPwdNew, setIsRevealPwdNew] = useState(false);
  const [isRevealPwdOld, setIsRevealPwdOld] = useState(false);
  const [resetValues, setResetValues] = useState(initialValues);
  const [loading, setLoading] = useState(false);
  const [loader, setLoader] = useState(false);

  const handleSubmitPassword = async (values, setFieldError) => {
    setLoader(true)
    let data = {
      id: getCurrentUser()?.user?.id,
      old_password: values?.old_password,
      new_password: values?.new_password,
      confirm_password:values?.confirm_password
    }
    try {
      const response = await postRequest(`change-password`, data);
      if (response.type === 2) {
        SetBackEndErrorsAPi(response, setFieldError);
      } else {
        resetForm()
        toast.success(response?.response?.data?.message);
      }
    } catch (error) {
    } finally {
      setLoader(false)
    }
  }

  const resetForm = () => {
    setLoading(true);
    setResetValues(initialValues)
    setTimeout(() => {
      setLoading(false);
    }, 500);
  }

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
            <Formik
              initialValues={resetValues}
              validationSchema={PasswordSchema}
              onSubmit={(values,setFieldError) => {
                handleSubmitPassword(values,setFieldError);
              }}
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
                    onSubmit={(e)=>handleSubmit(e,setFieldError)}
                  >
                    <h5 className="f-w-600 mb-2 heading-font" >Change Password</h5>
                    <hr></hr>
                    <Row className="mt-2">
                      <Col md={6}>
                        <div className="mb-2">
                          <Label for="currentPassword" className="form-labels">Current Password</Label><span className="asterisk">*</span>
                          <div className="d-flex">
                            <Field
                              id="currentPassword"
                              className="form-control"
                              type={isRevealPwdCurrent ? "text" : "Password"}
                              name="old_password"
                              placeholder="Please Type"
                              value={values?.old_password}
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
                                {!isRevealPwdCurrent && (
                                  <FaEyeSlash
                                    title="Hide password"
                                    onClick={() =>
                                      setIsRevealPwdCurrent(
                                        (prevState) => !prevState
                                      )
                                    }
                                  />
                                )}
                                {isRevealPwdCurrent && (
                                  <FaEye
                                    title="Show Password"
                                    onClick={() =>
                                      setIsRevealPwdCurrent(
                                        (prevState) => !prevState
                                      )
                                    }
                                  />
                                )}
                              </span>
                            </div>
                          </div>
                          {errors.old_password && touched.old_password ? (
                            <div className="text-danger mt-1">
                              {errors.old_password}
                            </div>
                          ) : null}
                        </div>
                      </Col>
                    </Row>
                    <Row className="mt-2">
                      <Col md={6}>
                        <div className="mb-2">
                          <Label for="newPassword" className="form-labels">New Password</Label><span className="asterisk">*</span>
                          <div className="d-flex">
                            <Field
                              id="newPassword"
                              className="form-control"
                              type={isRevealPwdNew ? "text" : "Password"}
                              name="new_password"
                              placeholder="Please Type"
                              value={values?.new_password}
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
                                {!isRevealPwdNew && (
                                  <FaEyeSlash
                                    title="Hide password"
                                    onClick={() =>
                                      setIsRevealPwdNew(
                                        (prevState) => !prevState
                                      )
                                    }
                                  />
                                )}
                                {isRevealPwdNew && (
                                  <FaEye
                                    title="Show Password"
                                    onClick={() =>
                                      setIsRevealPwdNew(
                                        (prevState) => !prevState
                                      )
                                    }
                                  />
                                )}
                              </span>
                            </div>
                          </div>
                          {errors.new_password && touched.new_password ? (
                            <div className="text-danger mt-1">
                              {errors.new_password}
                            </div>
                          ) : null}
                        </div>
                      </Col>
                      <Col md={6}>
                        <div className="mb-2">
                          <Label for="confirmPassword" className="form-labels">Confirm Password</Label><span className="asterisk">*</span>
                          <div className="d-flex">
                            <Field
                              id="confirmPassword"
                              className="form-control"
                              type={isRevealPwdOld ? "text" : "Password"}
                              name="confirm_password"
                              placeholder="Please Type"
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
                                {!isRevealPwdOld && (
                                  <FaEyeSlash
                                    title="Hide password"
                                    onClick={() =>
                                      setIsRevealPwdOld(
                                        (prevState) => !prevState
                                      )
                                    }
                                  />
                                )}
                                {isRevealPwdOld && (
                                  <FaEye
                                    title="Show Password"
                                    onClick={() =>
                                      setIsRevealPwdOld(
                                        (prevState) => !prevState
                                      )
                                    }
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
                                <p style={{opacity:'0',position:'relative'}}>Submit</p>
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
export default ChangePassword;