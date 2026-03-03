import React from 'react';
import { Field, Formik } from 'formik';
import { Button, Col, Label, Modal, ModalBody, Row, Spinner } from 'reactstrap';
import * as Yup from 'yup';

const ValidationSchema = Yup.object().shape({
    floor_plan: Yup.string().required('This field is required.'),
    refImg:     Yup.mixed().nullable(),
});

const AddFloorPlanModal = ({ isOpen, onClose, onSubmit, loading, nextLevelNumber }) => (
    <Modal isOpen={isOpen} toggle={onClose} size="md" centered style={{ zIndex: '999999 !important' }}>
        <Formik
            initialValues={{ floor_plan: `Level ${nextLevelNumber}`, refImg: '' }}
            validationSchema={ValidationSchema}
            onSubmit={onSubmit}
        >
            {({ errors, values, touched, handleSubmit, handleChange, setFieldError }) => (
                <form
                    className="av-tooltip tooltip-label-bottom formGroups"
                    onSubmit={(e) => handleSubmit(e, setFieldError)}
                >
                    <ModalBody>
                        <h5 className="f-w-600 mb-4" style={{ fontSize: 18 }}>
                            Add New Floor Plan
                        </h5>

                        <Row>
                            <Col md={12}>
                                <div className="marginBottom">
                                    <Label className="form-labels">Name</Label>
                                    <span className="asterisk">*</span>
                                    <Field
                                        className="form-control"
                                        type="text"
                                        placeholder="Please Type Here (Eg. Level 1)"
                                        name="floor_plan"
                                        autoComplete="off"
                                        value={values.floor_plan}
                                        onChange={handleChange}
                                    />
                                    {errors.floor_plan && touched.floor_plan && (
                                        <div className="text-danger mt-1">{errors.floor_plan}</div>
                                    )}
                                </div>
                            </Col>
                        </Row>

                        <div className="form-group text-right" style={{ marginTop: 30 }}>
                            <Button color="secondary" className="btn btnCancel mr-3" onClick={onClose}>
                                Cancel
                            </Button>
                            <Button
                                color="primary"
                                type="submit"
                                className="btn btn-primary float-right"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <p style={{ opacity: 0, position: 'relative' }}>Save</p>
                                        <Spinner className="ml-2 spinner-style" color="light" />
                                    </>
                                ) : 'Save'}
                            </Button>
                        </div>
                    </ModalBody>
                </form>
            )}
        </Formik>
    </Modal>
);

export default AddFloorPlanModal;