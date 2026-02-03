import React, { useState, useEffect } from 'react';
import { Row, Col, Label,  Button, Spinner } from 'reactstrap';
import { Formik } from "formik";
import * as Yup from 'yup';
import FormikDatePicker from '../../components/constants/Datepicker';
import InvoiceTable from './invoiceTable'
import { getCurrentUser } from '../../helpers/utils';
import { getRequest, postRequest } from '../../hooks/axiosClient';
import CommonDropdown from '../../components/common/CommonDropdown';
import { dateFormatYYYYMMDD ,dateFormatDDMMYYYY} from '../../helpers/functions';


const validationSchema = Yup.object().shape({
    start_date: Yup.string().required("This field is required."),
    end_date: Yup.string().required("This field is required.")
        .test('end-date', "The end date shouldn't be less than the start date.", function (value) {
            const { start_date } = this.parent;
            if (!value || !start_date) {
                // If either start_date or end_date is not provided, consider it valid
                return true;
            }
            return new Date(value) >= new Date(start_date);
        }),
    // last_name: Yup.string().nullable(),
    customer_id: Yup.string().nullable(),
    project_id: Yup.string()
        .nullable(),
});

const invoiceIntialValue = {
    start_date: '',
    end_date: '',
    customer_id: '',
    project_id: ''
}


const InvoiceList = () => {
    const [projectValues, setProjectValues] = useState([]);
    const [customerValues, setCustomerValues] = useState([]);
    const [tableData, setTableData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [tempTableList, setTempTableList] = useState([]);
    const loggedUser = getCurrentUser()?.user
    const [noData, setNodata] = useState(false);


    useEffect(() => {
        getProjectsDropdown();
        getCustomerDropdown();
    }, [])

    const getProjectsDropdown = async (id) => {
        let values = {
            role_id: id ? '2' : getCurrentUser()?.user?.role_id,
            common_id: id ?? getCurrentUser()?.user?.common_id,
        }

        try {
            const response = await postRequest(`project-dropdown`, values);
            const DataRes = response?.response?.data ?? [];
            let data = DataRes?.projects?.map((prev) => ({
                ...prev, value: prev?.id, label: prev?.project_name
            }))
            setProjectValues(data)
        } catch (error) {
        }
    }

    const getCustomerDropdown = async () => {
        try {
            const response = await getRequest(`customer-dropdown`);
            const DataRes = response?.data?.customers ?? [];
            let data = DataRes?.map((prev) => ({
                ...prev, value: prev?.id, label: prev?.customer_name
            }));
            setCustomerValues(data)
        } catch (error) {
        }
    }
    

    const getInvoiceList = async (values, setFieldError) => {
        setLoading(true)
        let data = {
            role_id: getCurrentUser()?.user?.role_id,
            customer_id: loggedUser?.role_id == 2 ? loggedUser?.common_id : values?.customer_id,
            project_id: values?.project_id,
            start_date: dateFormatYYYYMMDD(values?.start_date),
            end_date: dateFormatYYYYMMDD(values?.end_date)
        }
        try {
            const response = await postRequest(`list-invoice`, data);
            const invoices = response?.response?.data ?? [];
            invoices?.forEach(element => {
                element.invoice_date = dateFormatDDMMYYYY(element.invoice_date)
                element.paid_date = dateFormatDDMMYYYY(element.paid_date)
                element.used_loc = element?.billing_details?.used_loc
                element.used_prod = element?.billing_details?.used_prod
            });
            if (response?.type == 1) {
                setTableData(invoices ?? [])
                setTempTableList(invoices ?? [])
            }
        } catch (error) {
            //console.log(error);
        } finally {
            setLoading(false)
        }
    }


    return (
        <>
            <Formik
                initialValues={invoiceIntialValue}
                validationSchema={validationSchema}
                onSubmit={(values, setFieldError) => {
                    console.log(values);
                    getInvoiceList(values, setFieldError)
                }}
            >
                {({ errors,
                    values,
                    touched,
                    setFieldValue,
                    setFieldTouched,
                    setFieldError,
                    handleSubmit }) => (
                    <form onSubmit={(e) => handleSubmit(e, setFieldError)} className='formGroups'>
                        <Row >
                            <Col xs={6} sm={4} md={3} lg={2} xl={2}>
                                <Label className="form-labels">
                                    Start Date
                                </Label>
                                <FormikDatePicker
                                    name='start_date'
                                    label="Select a date"
                                    value={values.start_date}
                                    onChange={setFieldValue}
                                    onBlur={setFieldTouched}
                                />
                                {errors.start_date && touched.start_date ? (
                                    <div className="text-danger mt-1">
                                        {errors.start_date}
                                    </div>
                                ) : null}
                            </Col>
                            <Col xs={6} sm={4} md={3} lg={2} xl={2}>
                                <Label className="form-labels">
                                    End Date
                                </Label>
                                <FormikDatePicker
                                    name='end_date'
                                    label="Select a date"
                                    value={values.end_date}
                                    onChange={setFieldValue}
                                    onBlur={setFieldTouched}
                                />
                                {errors.end_date && touched.end_date ? (
                                    <div className="text-danger mt-1">
                                        {errors.end_date}
                                    </div>
                                ) : null}
                            </Col>
                            {loggedUser?.role_id == 1 &&
                                <Col xs={6} sm={4} md={3} lg={2} xl={2}>
                                    <Label className="form-labels">
                                        Select Customer
                                    </Label>
                                    <CommonDropdown
                                        name='customer_id'
                                        value={values?.customer_id ? customerValues?.find(item => values?.customer_id == item.value) : null}
                                        options={customerValues}
                                        onChange={(e) => {
                                            getProjectsDropdown(e?.id)
                                            setFieldValue('customer_id', e?.value);
                                            setFieldValue('project_id', null);
                                        }}
                                    />
                                    {errors.customer_id && touched.customer_id ? (
                                        <div className="text-danger mt-1">
                                            {errors.customer_id}
                                        </div>
                                    ) : null}
                                </Col>
                            }
                            <Col xs={6} sm={4} md={3} lg={2} xl={2}>
                                <Label className="form-labels">
                                    Select Project
                                </Label>
                                <CommonDropdown
                                    name='project_id'
                                    value={values?.project_id ? projectValues?.find(item => values.project_id == item.value) : null}
                                    options={projectValues}
                                    onChange={(e) => {
                                        setFieldValue('project_id', e?.value);
                                    }}
                                />
                                {errors.project_id && touched.project_id ? (
                                    <div className="text-danger mt-1">
                                        {errors.project_id}
                                    </div>
                                ) : null}
                            </Col>
                            <Col xs={6} sm={4} md={3} lg={2} xl={2}>
                                <Button className="btn btn-sm btn-primary mt-4" disabled={loading}>
                                    {loading ? (
                                        <>
                                            <p style={{ opacity: '0', position: 'relative' }}>Go</p>
                                            <Spinner
                                                className="ml-2 spinner-style"
                                                color="light"
                                            />
                                        </>
                                    ) : 'Go'}
                                </Button>
                            </Col>
                        </Row>
                    </form>
                )}
            </Formik>
            <Row className='mt-4'>
                <Col sm={12}>
                    <InvoiceTable tableData={tableData} setTableData={setTableData} tempTableList={tempTableList} setNodata={setNodata} noData={noData} />
                </Col>
            </Row>
        </>
    )
}
export default InvoiceList;