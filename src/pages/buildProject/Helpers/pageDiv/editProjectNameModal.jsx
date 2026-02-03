import React, { useEffect, useState } from 'react';
import { Modal, ModalBody, Button, Row, Col, Label, Spinner } from 'reactstrap';
import { Formik, Field } from 'formik';
import SwitchComponent from '../../../../components/switch/SwitchComponent';

const EditProjectModal = ({ modal, loading, toggle, initialValues, validationSchema, handleSubmitProject, showpassfield=false }) => {

    // console.log(validationSchema,"validationSchema");

    const [edit, setEdit] = useState(false)

    useEffect(() => {
        setFormValues(initialValues)
    },[initialValues])


     const [formValues, setFormValues] = useState({
        project_name: initialValues.project_name || "",
        is_pass_protected: initialValues.is_pass_protected || false,
        password: initialValues.password || "",
        confirm_password: initialValues.confirm_password || "",
        enc_id: initialValues.enc_id || "",
        pass_update: 0,
    });

    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormValues((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: "" }));
    };

    const handleSwitchChange = (checked) => {
        setErrors({})
        setFormValues((prev) => ({
            ...prev,
            is_pass_protected: checked,
            password: checked ? initialValues?.password : "",
            confirm_password: checked ? initialValues?.confirm_password : "",
            pass_update: checked ? 1 : 0,
        }));
        if (!checked) {
            setEdit(false);
        } else {
            if (!initialValues?.password) {
                setEdit(true);
            }
        }
    };

     const handleValidationAndSubmit = async (e) => {
        e.preventDefault();
        try {
            await validationSchema.validate(formValues, { abortEarly: false });

            setErrors({});
            setEdit(false);
            handleSubmitProject(formValues);
        } catch (err) {
            // console.log(err);
            const errMap = {};
            err?.inner?.forEach((e) => {
                errMap[e.path] = e.message;
            });
            setErrors(errMap);
        }
    };
    

    return (
        <Modal
            isOpen={modal}
            toggle={toggle}
            size="md"
            style={{ zIndex: "999999 !important",maxWidth:'600px' }}
            centered
            
        >
            {/* <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={(values, formikHelpers) => {
                    if (values.is_pass_protected) {
                        formikHelpers.setFieldTouched('password', true, true);
                        formikHelpers.setFieldTouched('confirm_password', true, true);
                    }

                    setEdit(false);
                    handleSubmitProject(values, formikHelpers.setFieldError);
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
                }) => ( */}
                    <form
                        className="av-tooltip tooltip-label-bottom formGroups"
                // onSubmit={(e) => handleSubmit(e, setFieldError)}
                autoComplete="off"
                        onSubmit={handleValidationAndSubmit}
                    >
                        <ModalBody className=" " >
                            {!showpassfield && <h5 className="f-w-600 mb-4" style={{ fontSize: "18px" }}>
                                {initialValues?.enc_id ? "Edit" : "Add New"} Project
                            </h5>}
                            <Row className="">
                                <Col md={12}>
                                    {!showpassfield && <div className="mb-2">
                                        <Label for="fName" className="form-labels">
                                            Project Name
                                        </Label>
                                        <span className="asterisk">*</span>
                                        <div className="d-flex">
                                            {/* <Field
                                                id="fName"
                                                className="form-control"
                                                type="text"
                                                name="project_name"
                                                placeholder="Please Type"
                                            /> */}
                                            <input
                                                className="form-control"
                                                type="text"
                                                name="project_name"
                                                placeholder="Please Type"
                                                value={formValues.project_name}
                                                onChange={handleChange}
                                                autoComplete="off"
                                            />
                                        </div>
                                        {errors.project_name && <div className="text-danger mt-1">{errors.project_name}</div>}
                                    </div>}

                                    {showpassfield && <div className="project-auth-check edit">
                                       
                                        <div>
                                            <div>
                                                <Label  className="form-labels">Is this project password protected? </Label>
                                                <SwitchComponent
                                                    checked={formValues.is_pass_protected} onChange={handleSwitchChange}
                                                />
                                            </div>
                                            {/* {formValues.is_pass_protected && initialValues.password && <div style={{ display:"flex",justifyContent: "space-between",maxWidth:'100%' }}>
                                                <button type='button' style={{ padding: "5px !important" }} onClick={() => {
                                                    setEdit((prev) => {
                                                        if (!prev) {
                                                            setFormValues((prevState) => ({
                                                                ...prevState,
                                                                password: "",
                                                                confirm_password: "",
                                                            }));
                                                        }
                                                        return !prev;
                                                    });
                                                    setFormValues((prev) => ({
                                                        ...prev,
                                                        pass_update: edit ? 0 : 1,
                                                    }));
                                                }} className={`btn btn-primary float-right btn btn-primary ${edit ? "active" : ""}`}>
                                                    <svg width="25" height="25" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M20.2787 6.01838C20.0041 6.06415 19.7601 6.1557 19.5236 6.30065C19.2719 6.46086 17.9296 7.78831 17.8381 7.96378C17.7542 8.13925 17.7542 8.3376 17.8305 8.49018C17.861 8.55121 18.6999 9.40567 19.6838 10.3898C21.6058 12.3047 21.5981 12.3047 21.9337 12.2131C22.0786 12.175 22.2388 12.0301 22.8795 11.3892C23.4972 10.7713 23.6803 10.5576 23.7871 10.344C23.9548 10.0007 24.0235 9.65742 23.993 9.29123C23.9472 8.65802 23.7794 8.41389 22.6125 7.25428C21.6668 6.31591 21.4761 6.17096 21.0795 6.07178C20.8202 6.00312 20.5075 5.98023 20.2787 6.01838Z" fill="#fff"/>
                                                        <path d="M16.4728 9.32943C16.2745 9.42861 7.05364 18.6826 6.88585 18.9496C6.80958 19.0717 6.71043 19.2777 6.66467 19.3998C6.56552 19.6973 5.97063 23.5118 6.00113 23.6568C6.04689 23.8398 6.25282 24.0001 6.42824 24.0001C6.6723 24.0001 10.2493 23.4508 10.4857 23.3745C11.0883 23.1838 10.8976 23.3668 15.939 18.3241C20.0422 14.2196 20.6753 13.5788 20.7134 13.4262C20.8125 13.0753 20.8125 13.0753 18.9058 11.1604C17.9372 10.1915 17.083 9.36758 17.0144 9.32943C16.8542 9.25314 16.6406 9.25314 16.4728 9.32943Z" fill="#fff"/>
                                                    </svg>
                                                </button>
                                            </div>} */}
                                        </div>

                                        {formValues.is_pass_protected && <>
                                            <div className="project-auth-check-inputs edit">
                                                <Label for="password" className="form-labels">Type your password <span className="asterisk" style={{marginLeft:"5px"}}>*</span></Label>
                                            
                                                <div className="d-flex">
                                                    {/* <Field
                                                        id="password"
                                                        className="form-control"
                                                        type="password"
                                                        name="password"
                                                        placeholder="password"
                                                        readOnly={!edit}
                                                    /> */}
                                                    <input
                                                        className="form-control"
                                                        type="password"
                                                        name="password"
                                                        placeholder="password"
                                                        readOnly={!edit}
                                                        value={formValues.password}
                                                        onChange={handleChange}
                                                        autoComplete="off"
                                                    
                                                    />
                                                </div>
                                        
                                                {formValues.is_pass_protected && initialValues.password && <div style={{ display:"flex",justifyContent: "space-between",maxWidth:'100%' }}>
                                                    <button type='button' style={{ padding: "5px !important" }} onClick={() => {
                                                        setEdit((prev) => {
                                                            if (!prev) {
                                                                setFormValues((prevState) => ({
                                                                    ...prevState,
                                                                    password: "",
                                                                    confirm_password: "",
                                                                }));
                                                            }
                                                            return !prev;
                                                        });
                                                        setFormValues((prev) => ({
                                                            ...prev,
                                                            pass_update: edit ? 0 : 1,
                                                        }));
                                                    }} className={`btn btn-primary float-right btn btn-primary ${edit ? "active" : ""}`}>
                                                        <svg width="25" height="25" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                            <path d="M20.2787 6.01838C20.0041 6.06415 19.7601 6.1557 19.5236 6.30065C19.2719 6.46086 17.9296 7.78831 17.8381 7.96378C17.7542 8.13925 17.7542 8.3376 17.8305 8.49018C17.861 8.55121 18.6999 9.40567 19.6838 10.3898C21.6058 12.3047 21.5981 12.3047 21.9337 12.2131C22.0786 12.175 22.2388 12.0301 22.8795 11.3892C23.4972 10.7713 23.6803 10.5576 23.7871 10.344C23.9548 10.0007 24.0235 9.65742 23.993 9.29123C23.9472 8.65802 23.7794 8.41389 22.6125 7.25428C21.6668 6.31591 21.4761 6.17096 21.0795 6.07178C20.8202 6.00312 20.5075 5.98023 20.2787 6.01838Z" fill="#fff"/>
                                                            <path d="M16.4728 9.32943C16.2745 9.42861 7.05364 18.6826 6.88585 18.9496C6.80958 19.0717 6.71043 19.2777 6.66467 19.3998C6.56552 19.6973 5.97063 23.5118 6.00113 23.6568C6.04689 23.8398 6.25282 24.0001 6.42824 24.0001C6.6723 24.0001 10.2493 23.4508 10.4857 23.3745C11.0883 23.1838 10.8976 23.3668 15.939 18.3241C20.0422 14.2196 20.6753 13.5788 20.7134 13.4262C20.8125 13.0753 20.8125 13.0753 18.9058 11.1604C17.9372 10.1915 17.083 9.36758 17.0144 9.32943C16.8542 9.25314 16.6406 9.25314 16.4728 9.32943Z" fill="#fff"/>
                                                        </svg>
                                                    </button>
                                                </div>}
                                            </div>

                                            {errors.password ? (
                                                <div className="text-danger">
                                                {errors.password}
                                                </div>
                                            ) : null}
                                        
                                            <div className="project-auth-check-inputs">
                                                <Label for="confirmPassword" className="form-labels">Re-type your password <span className="asterisk" style={{marginLeft:"5px"}}> *</span></Label>
                                                <div className="d-flex">
                                                    {/* <Field
                                                        id="confirmPassword"
                                                        className="form-control"
                                                        type="password"
                                                        name="confirm_password"
                                                        placeholder="confirm password"
                                                        readOnly={!edit}
                                                    /> */}
                                                
                                                <input
                                                    className="form-control"
                                                    type="password"
                                                    name="confirm_password"
                                                    placeholder="confirm password"
                                                    readOnly={!edit}
                                                    value={formValues.confirm_password}
                                                    onChange={handleChange}
                                                    autoComplete="off"
                                                />
                                                </div>
                                                <div></div>
                                            </div>

                                            {errors.confirm_password ? (
                                                <div className="text-danger">
                                                {errors.confirm_password}
                                                </div>
                                        ) : null
                                    }
                                    </>
                                }
                                    </div>}
                                </Col>
                            </Row>
                            <div
                                className="form-group text-right "
                                style={{ marginTop: "30px" }}
                            >
                                <Button
                                    color="secondary"
                                    className="btn btnCancel mr-3"
                                    onClick={() => {
                                        setFormValues(initialValues)
                                        setEdit(false)
                                        toggle()
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    disabled={loading}
                                    color="primary"
                                    type="submit"
                                    className="btn btn-primary float-right"
                                >
                                    {loading ? (
                                        <>
                                        <p style={{ opacity: "0", position: "relative" }}>
                                            Save
                                        </p>
                                        <Spinner className="ml-2 spinner-style" color="light" />
                                        </>
                                    ) : (
                                        "Save"
                                    )}
                                </Button>
                            </div>
                        </ModalBody>
                    </form>
                {/* )}
            </Formik> */}
        </Modal>
    )
}
export default EditProjectModal;