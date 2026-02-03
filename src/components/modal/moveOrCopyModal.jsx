import { Field, Formik } from "formik";
import { useState } from "react";
import { Button, Col, Label, Modal, ModalBody, Row, Spinner } from "reactstrap";
import ReactSelect from '../../components/common/ReactSelect';
import * as Yup from "yup";
import { useEffect } from "react";
import { getRequest, postRequest } from "../../hooks/axiosClient";
import { toast } from "react-toastify";

const validationSchema = Yup.object().shape({
    customer_id: Yup.string().required("This field is required."),
});

const MoveOrCopy = ({
    modal,
    toggle,
    type,
    rowDetails,
    getProjectlist
}) => {

    const initialFormValues = {
        customer_id: null,
    }


    const [loading, setLoading] = useState(false);
    const [customers, setCustomers] = useState(false);


    const getCustomerDropdown = async () => {
        console.log(rowDetails)
        try {
            const response = await getRequest(`customers-except/${rowDetails?.customer?.customer_id}`);
            console.log(response)
            const DataRes = response.data?.customers ?? [];
            const customers = DataRes.map((item) => ({ ...item, value: item?.id, label: item?.customer_name }))
            setCustomers(customers);

        } catch (error) {
            //console.log(error);
        }
    }

    useEffect(() => {
        if (modal == true) {
            getCustomerDropdown();

        }
    }, [modal]);

    const handleSubmit = async (values, setFieldError) => {
        if (type === 1) {
            handleMove(values, setFieldError)
        } else {
            handleCopy(values, setFieldError)
        }

    }

    const handleCopy = async (values, setFieldError) => {
        setLoading(true)
        let data = {
            project_id: rowDetails?.enc_id,
            customer_id: values?.customer_id
        }
        try {
            const response = await postRequest(`project-copy`, data);
            toast.success(response?.response?.data?.message)
            toggle();
            setLoading(false);
            getProjectlist()

        } catch (error) {
            //console.log(error);
        }
    }

    const handleMove = async (values, setFieldError) => {
        setLoading(true)
        let data = {
            project_id: rowDetails?.enc_id,
            customer_id: values?.customer_id
        }
        try {
            const response = await postRequest(`project-move`, data);
            toast.success(response?.response?.data?.message)
            toggle();
            setLoading(false)
            getProjectlist()

        } catch (error) {
            //console.log(error);
        }
    }

    return (
        <Modal isOpen={modal} toggle={toggle} size='md' style={{ zIndex: '999999 !important' }} centered>
            <Formik
                initialValues={initialFormValues}
                validationSchema={validationSchema}
                onSubmit={(values, setFieldError) => {
                    handleSubmit(values, setFieldError);
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
                }) => (
                    <form
                        className="av-tooltip tooltip-label-bottom formGroups"
                        onSubmit={(e) => handleSubmit(e, setFieldError)}
                    >
                        <ModalBody className=' '>
                            <h5 className="f-w-600 mb-4" style={{ fontSize: '1.5rem' }}>{type === 1 ? 'Move' : 'Copy'} Project</h5>
                            <Row className="">
                                <Col md={12}>
                                    <div className="mb-2">
                                        <Label for="fName" className="form-labels">Destination</Label><span className="asterisk">*</span>
                                        <ReactSelect
                                            name='customer_id'
                                            options={customers}
                                            onchange={(e) => setFieldValue('customer_id', e.id)}
                                            defaultOption={null}
                                        />
                                        {errors.customer_id && touched.customer_id ? (
                                            <div className="text-danger mt-1">
                                                {errors.customer_id}
                                            </div>
                                        ) : null}
                                    </div>
                                </Col>
                            </Row>
                            <div className="form-group text-right " style={{ marginTop: "30px" }}>
                                <Button color="secondary" className="btn btnCancel mr-3" onClick={toggle}>
                                    Cancel
                                </Button>
                                <Button color="primary" type="submit" className="btn btn-primary float-right" disabled={loading} >
                                    {loading ? (
                                        <>
                                            <p style={{ opacity: '0', position: 'relative' }}>{type === 1 ? 'Move' : 'Copy'}</p>
                                            <Spinner
                                                className="ml-2 spinner-style"
                                                color="light"
                                            />
                                        </>
                                    ) : (
                                        <>
                                            {type === 1 ? 'Move' : 'Copy'}
                                        </>
                                    )}
                                </Button>
                            </div>
                        </ModalBody>
                    </form>
                )}
            </Formik>
        </Modal>
    )
}
export default MoveOrCopy