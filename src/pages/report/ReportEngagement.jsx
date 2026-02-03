import React, { useEffect, useState } from 'react';
import { Card, CardBody, Label, Button, Row, Col, Spinner } from 'reactstrap';
import { HiDownload } from 'react-icons/hi';
import { Formik } from "formik";
import * as Yup from "yup";
import ReportTable from './reportTable';
import FormikDatePicker from '../../components/constants/FormikDatepicker';
import CommonDropdown from '../../components/common/CommonDropdown';
import { getCurrentUser } from '../../helpers/utils';
import { getRequest, postRequest, postRequestForDownload } from '../../hooks/axiosClient';
import './report.css';
import { DownloadForExcel, dateFormatYYYYMMDD } from '../../helpers/functions';

const ReportEngagement = () => {
    const validationSchema = Yup.object().shape({
        project: Yup.number().required("This field is required."),
        type: Yup.string().required("This field is required."),
        start_date: Yup.string().required("This field is required."),
        end_date: Yup.mixed().required("This field is required.")
            .test('end-date', "The end date shouldn't be less than the start date.", function (value) {
                const { start_date } = this.parent;
                if (!value || !start_date) {
                    return true;
                }
                return new Date(value) >= new Date(start_date);
            }),
    })

    const [projectValues, setProjectValues] = useState([]);
    const [listData, setListData] = useState([]);
    const loggedUser = getCurrentUser()?.user
    const [customerValues, setCustomerValues] = useState([]);
    const [loading, setLoading] = useState(false);
    const valuedropdowns = [
        { label: 'Location', value: '1' },
        { label: 'Product', value: '2' },
        { label: 'All', value: '0' }
    ]

    useEffect(() => {
        getProjectsDropdown();
        getCustomerDropdown()
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



    const getEngagementList = async (values, setFieldError) => {
        setLoading(true)
        let data = {
            project_id: values?.project,
            type: values?.type,
            start_date: dateFormatYYYYMMDD(values?.start_date),
            end_date: dateFormatYYYYMMDD(values?.end_date)
        }
        try {
            const response = await postRequest(`engagement-report`, data);
            const DataRes = response?.response?.data?.report ?? [];
            setListData(DataRes, values)
        } catch (error) {
        } finally {
            setLoading(false)
        }
    }

    const downloadReport = async (values) => {
        let formData = {
            project_id: values?.project,
            type: values?.type,
            start_date: dateFormatYYYYMMDD(values?.start_date),
            end_date: dateFormatYYYYMMDD(values?.end_date)
        }
        try {
            const response = await postRequestForDownload(`engagement-report-excel`, formData);
            if (response.status === 200) {
                const dataRes = response.data;
                const fileName = "Engagement report.xlsx";
                DownloadForExcel(dataRes, fileName)
            } else {
                console.error("Failed to download report. Server returned:", response.status, response.data);
            }
        } catch (error) {
            console.log(error);
        }
    }


    return (
        <>
            <div className="container-fluid">
                <h5 className="f-w-600 headingmargin heading-font" >Report: Engagement</h5>
                <div className="row">
                    <div className="col-sm-12">
                        <Card className='vh-70'>
                            <CardBody>
                                <Formik
                                    initialValues={{
                                        customer_id: null,
                                        project: null,
                                        type: null,
                                        start_date: null,
                                        end_date: null
                                    }}
                                    validationSchema={validationSchema}
                                    onSubmit={(values, setFieldError) => {
                                        console.log(values);
                                        getEngagementList(values, setFieldError);
                                        enableReinitialize
                                    }}
                                >
                                    {({
                                        errors,
                                        values,
                                        touched,
                                        handleSubmit,
                                        handleChange,
                                        setFieldValue,
                                        setFieldError,
                                        setFieldTouched
                                    }) => (
                                        <form
                                            className="av-tooltip tooltip-label-bottom formGroups "
                                            onSubmit={(e) => handleSubmit(e, setFieldError)}
                                        >
                                            <Row>
                                                <Col xs={12} sm={12} md={12} lg={9} xl={10}>
                                                    <Row>
                                                        {loggedUser?.role_id == 1 &&
                                                            <Col xs={6} sm={6} md={3} lg={3} xl={2} >
                                                                <>
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
                                                                            setFieldValue('project', null)
                                                                            setListData([])
                                                                        }}
                                                                    />
                                                                    {errors.customer_id && touched.customer_id ? (
                                                                        <div className="text-danger mt-1">
                                                                            {errors.customer_id}
                                                                        </div>
                                                                    ) : null}
                                                                </>
                                                            </Col>
                                                        }
                                                        <Col xs={6} sm={6} md={6} lg={2} xl={3} >
                                                            <Label className="form-labels">Project</Label><span className="asterisk">*</span>
                                                            <CommonDropdown
                                                                name='project'
                                                                value={values?.project ? projectValues?.find(item => values.project == item.value) : null}
                                                                options={projectValues}
                                                                onChange={(e) => {
                                                                    setFieldValue('project', e?.value);
                                                                    setListData([])
                                                                }}
                                                            />
                                                            {errors.project && touched.project ? (
                                                                <div className="text-danger mt-1">
                                                                    {errors.project}
                                                                </div>
                                                            ) : null}
                                                        </Col>
                                                        <Col xs={6} sm={6} md={2} lg={2} xl={2} >
                                                            <Label className="form-labels">Type</Label><span className="asterisk">*</span>
                                                            <CommonDropdown
                                                                name='type'
                                                                options={valuedropdowns}
                                                                onChange={(e) => {
                                                                    setFieldValue('type', e?.value)
                                                                    setListData([])
                                                                }
                                                                }
                                                            />
                                                            {errors.type && touched.type ? (
                                                                <div className="text-danger mt-1">
                                                                    {errors.type}
                                                                </div>
                                                            ) : null}
                                                        </Col>
                                                        <Col xs={6} sm={6} md={3} lg={3} xl={2} >
                                                            <Label className="form-labels">Start date</Label><span className="asterisk">*</span>
                                                            <FormikDatePicker
                                                                name='start_date'
                                                                selected={values.start_date}
                                                                onChange={(e) => {
                                                                    setFieldValue('start_date', e)
                                                                    setListData([])
                                                                }}
                                                                dateFormat="dd-MM-yyyy"
                                                                placeholderText={'Select '}
                                                                style={{ backgroundColor: '#ccc' }}
                                                            />
                                                            {errors.start_date && touched.start_date ? (
                                                                <div className="text-danger mt-1">
                                                                    {errors.start_date}
                                                                </div>
                                                            ) : null}
                                                        </Col>
                                                        <Col xs={6} sm={6} md={3} lg={3} xl={2} >
                                                            <Label className="form-labels">End date</Label><span className="asterisk">*</span>
                                                            <FormikDatePicker
                                                                name='end_date'
                                                                selected={values.end_date}
                                                                onChange={(date) => {
                                                                    setFieldValue('end_date', date)
                                                                    setListData([])
                                                                }}
                                                                dateFormat="dd-MM-yyyy"
                                                                placeholderText={'Select '}
                                                                style={{ backgroundColor: '#ccc' }}
                                                            />
                                                            {errors.end_date && touched.end_date ? (
                                                                <div className="text-danger mt-1">
                                                                    {errors.end_date}
                                                                </div>
                                                            ) : null}
                                                        </Col>
                                                        <Col xs={6} sm={6} md={2} lg={1} xl={1} >
                                                            <Button
                                                                className=" btn btn-primary mt-4"
                                                                type="submit"
                                                                htmlFor="submit"
                                                                size="medium"
                                                                disabled={loading}
                                                            >
                                                                {loading ? (
                                                                    <>
                                                                        <p style={{ opacity: '0', position: 'relative' }}>Apply</p>
                                                                        <Spinner
                                                                            className="ml-2 spinner-style"
                                                                            color="light"
                                                                        />
                                                                    </>
                                                                ) : 'Apply'}
                                                            </Button>
                                                        </Col>
                                                    </Row>
                                                </Col>
                                                <Col xs={12} sm={12} md={12} lg={3} xl={2}>
                                                    <div>
                                                        {(listData?.length > 0) &&
                                                            <Button className="btn btn-sm btn-primary-outline mt-4 float-right" onClick={() => downloadReport(values)}> <span className='show-as-align'> <HiDownload className='mr-1' />Download Report</span>  </Button>
                                                        }
                                                    </div>
                                                </Col>
                                            </Row>
                                        </form>
                                    )}
                                </Formik>
                                <div className="row mt-3">
                                    <div className="col-sm-12">
                                        <ReportTable listData={listData} />
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    )
}
export default ReportEngagement;

