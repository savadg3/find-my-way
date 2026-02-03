import React, { useEffect, useState } from 'react';
import { Card, CardBody, Label, Button, Col, Row, Spinner } from 'reactstrap';
import { getRequest, postRequest, postRequestForDownload } from '../../hooks/axiosClient';
import { HiDownload } from 'react-icons/hi';
import { Formik } from "formik";
import * as Yup from "yup"; 
import CommonDropdown from '../../components/common/CommonDropdown';
import './report.css';
import { getCurrentUser } from '../../helpers/utils';
import { months, rangeOption } from '../../helpers/constants';
import { DownloadForExcel, arrangeGraphData, dateFormatDDMMYYYY, dateFormatYYYYMMDD, formatMonthYear } from '../../helpers/functions';
import ReportVisitorTable from './ReportVisitorTable';
import FormikDatePicker from '../../components/constants/FormikDatepicker';
import LineChart from '../../components/chart/Line';

const ReportVisitor = () => {
    const validationSchema = Yup.object().shape({
        project: Yup.number().required("This field is required."),
        // range: Yup.string().required("This field is required."),
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
    const [graphValues, setGraphValues] = useState({ label: [], datasets: [] });
    const [customerValues, setCustomerValues] = useState([]);
    const loggedUser = getCurrentUser()?.user;
    const [loading, setLoading] = useState(false);
    const [report, setReport] = useState([]);
    const [reportTable, setReportTable] = useState([]);

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
            //console.log(error);
        }
    }

    const getVisitorsGraph = async (values, setFieldError) => {
        setLoading(true)
        let data = {
            project_id: values?.project,
            // range: Number(values?.range),
            start_date: dateFormatYYYYMMDD(values?.start_date),
            end_date: dateFormatYYYYMMDD(values?.end_date)
        }
        try {
            const response = await postRequest(`visitors-report`, data);
            const DataRes = response?.response?.data?.report ?? [];
            const resTable = response?.response?.data?.beacon ?? [];
            // console.log(resTable, 'resTable')
            setReport(DataRes);
            setReportTable(resTable)
            const graph = arrangeGraphData(DataRes, values?.start_date, values?.end_date)
            console.log(graph,'data')
            setGraphValues(graph)
        } catch (error) {
        } finally {
            setLoading(false)

        }
    }


    // const arrangeGraphData = (result, values) => {
    //     let lastMonths = []
    //     let lastDays = []
    //     if (values.range == 5 || values.range == 4) {
    //         lastDays = addMissingDates(result, values.range);
    //     } else {
    //         lastMonths = extendDataForLast12Months(result, values.range);
    //     }
    //     const counts = (values.range == 5 || values.range == 4)
    //         ? lastDays.every(entry => entry.count === 0) ? Array(lastDays.length).fill(null) : lastDays.map(entry => entry.count)
    //         : lastMonths.every(entry => entry.count === 0) ? Array(lastMonths.length).fill(null) : lastMonths.map(entry => entry.count);
    //     const labels = (values.range == 5 || values.range == 4) ?
    //         lastDays?.map(item => item?.date) :
    //         lastMonths.map(entry => {
    //             if (entry.year === 2024 && entry.month === 1) {
    //                 return `${months[entry.month]}-${entry.year.toString().slice(-2)}`;
    //             } else {
    //                 return `${months[entry.month]}-${entry.year.toString().slice(-2)}`;
    //             }
    //         })
    //     const data = {
    //         labels: labels,
    //         datasets: [
    //             {
    //                 data: counts,
    //                 borderColor: '#26a3db',
    //                 backgroundColor: '#26a3db',
    //                 borderWidth: 4
    //             },
    //         ]
    //     }
    //     setGraphValues(data)
    // }


    // const extendDataForLast12Months = (existingData, values) => {
    //     const currentDate = new Date();
    //     const currentMonth = currentDate.getMonth() + 1; // Months are zero-indexed
    //     const currentYear = currentDate.getFullYear();
    //     const extendedData = [...existingData];
    //     // Number of months to extend based on the selected range
    //     let monthsToExtend = 12;

    //     switch (values) {
    //         case '5':
    //             monthsToExtend = 1; // Last week
    //             break;
    //         case '4':
    //             monthsToExtend = 1; // Last month
    //             break;
    //         case '3':
    //             monthsToExtend = 3; // Last 3 months
    //             break;
    //         case '2':
    //             monthsToExtend = 6; // Last 6 months
    //             break;
    //         case '1':
    //             monthsToExtend = 12; // Last 12 months
    //             break;
    //         default:
    //             break;
    //     }
    //     // Filter existing data for the selected number of months
    //     const filteredData = existingData.filter((data) => {
    //         const diffMonths = (currentYear - data.year) * 12 + (currentMonth - data.month);
    //         return diffMonths < monthsToExtend;
    //     });
    //     // Complete the missing months if needed
    //     for (let i = 0; i <= monthsToExtend; i++) {
    //         const month = (currentMonth) - i;
    //         const year = currentYear - (month <= 0 ? 1 : 0);
    //         const isExistingDataForMonth = filteredData.some(
    //             (data) => data.month === (month <= 0 ? month + 12 : month) && data.year === year
    //         );
    //         if (!isExistingDataForMonth) {
    //             extendedData.unshift({
    //                 count: 0,
    //                 month: month <= 0 ? month + 12 : month,
    //                 year,
    //             });
    //         }
    //     }
    //     // Sort the extended data by year and month
    //     extendedData.sort((a, b) => {
    //         if (a.year !== b.year) {
    //             return a.year - b.year;
    //         }
    //         return a.month - b.month;
    //     });
    //     return extendedData;
    // };

    // const addMissingDates = (existingData, values) => {
    //     const currentDate = new Date();
    //     const currentYear = currentDate.getFullYear();
    //     const currentMonth = currentDate.getMonth() + 1; // Months are zero-indexed
    //     let datesToAdd = [];

    //     switch (values) {
    //         case '5':
    //             // Last week
    //             const lastWeekStartDate = new Date(currentYear, currentMonth - 1, currentDate.getDate() - 6);
    //             datesToAdd = Array.from({ length: 7 }, (_, index) => {
    //                 const date = new Date(lastWeekStartDate);
    //                 date.setDate(lastWeekStartDate.getDate() + index);
    //                 return date.toISOString().split('T')[0];
    //             });
    //             break;
    //         case '4':
    //             // Last month
    //             const lastDayOfPrevMonth = new Date(currentYear, currentMonth - 1, 0).getDate();
    //             datesToAdd = Array.from({ length: lastDayOfPrevMonth }, (_, index) => {
    //                 const date = new Date(currentYear, currentMonth - 2, index + 2);
    //                 return date.toISOString().split('T')[0];
    //             });
    //             break;
    //         default:
    //             return existingData; // No action needed for other cases
    //     }

    //     const extendedData = existingData.map(item => ({ ...item }));
    //     datesToAdd.forEach(date => {
    //         const isExistingDataForDate = existingData.some(data => data.date === date);
    //         if (!isExistingDataForDate) {
    //             extendedData.unshift({
    //                 date,
    //                 count: 0,
    //             });
    //         }
    //     });
    //     // Sort the extended data by date
    //     extendedData.sort((a, b) => new Date(a.date) - new Date(b.date));
    //     let formattedDate = extendedData?.map((item) => ({ ...item, date: dateFormatDDMMYYYY(item?.date) }));
    //     return formattedDate;
    // };


    const downloadReport = async (values) => {
        const formData = {
            project_id: values?.project,
            start_date: dateFormatYYYYMMDD(values?.start_date),
            end_date: dateFormatYYYYMMDD(values?.end_date)
            // range: Number(values?.range),
        }
        try {
            const response = await postRequestForDownload(`visitors-report-excel`, formData);
            if (response.status === 200) {
                const dataRes = response.data;
                const fileName = "Visitors report.xlsx";
                DownloadForExcel(dataRes, fileName);
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
                <h5 className="f-w-600 headingmargin heading-font" >Report: Visitors</h5>
                <div className="row">
                    <div className="col-sm-12">
                        <Card >
                            <CardBody>
                                <Formik
                                    initialValues={{
                                        project: null,
                                        range: null
                                    }}
                                    validationSchema={validationSchema}
                                    onSubmit={(values, setFieldError) => {
                                        getVisitorsGraph(values, setFieldError);
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
                                            className="av-tooltip tooltip-label-bottom formGroups"
                                            onSubmit={(e) => handleSubmit(e, setFieldError)}
                                        >
                                            <Row>
                                                <Col md={10}>
                                                    <Row>
                                                        {loggedUser?.role_id == 1 &&
                                                            <Col xs={6} sm={6} md={3} lg={3} xl={3} >
                                                                <>
                                                                    <Label className="form-labels">
                                                                        Select Customer
                                                                    </Label>
                                                                    <CommonDropdown
                                                                        name='customer_id'
                                                                        value={values?.customer_id ? customerValues?.find(item => values?.customer_id == item.value) : null}
                                                                        options={customerValues}
                                                                        onChange={(e) => {
                                                                            console.log(e);
                                                                            getProjectsDropdown(e?.id)
                                                                            setFieldValue('customer_id', e?.value);
                                                                            setFieldValue('project', null)
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
                                                        <Col xs={6} sm={6} md={3} lg={3} xl={3} >
                                                            <Label className="form-labels">Project</Label><span className="asterisk">*</span>
                                                            <CommonDropdown
                                                                name='project'
                                                                value={values?.project ? projectValues?.find(item => values.project == item.value) : null}
                                                                options={projectValues}
                                                                onChange={(e) => {
                                                                    setFieldValue('project', e?.value)
                                                                }}
                                                            />
                                                            {errors.project && touched.project ? (
                                                                <div className="text-danger mt-1">
                                                                    {errors.project}
                                                                </div>
                                                            ) : null}
                                                        </Col>
                                                        {/* <Col xs={6} sm={6} md={3} lg={3} xl={2} >
                                                            <Label className="form-labels">Range</Label><span className="asterisk">*</span>
                                                            <CommonDropdown
                                                                name='range'
                                                                value={values?.range ? rangeOption?.find(item => values.range == item.value) : null}
                                                                options={rangeOption}
                                                                onChange={(e) => {
                                                                    setFieldValue('range', e?.value)
                                                                }}
                                                            />
                                                            {errors.range && touched.range ? (
                                                                <div className="text-danger mt-1">
                                                                    {errors.range}
                                                                </div>
                                                            ) : null}
                                                        </Col> */}
                                                        <Col xs={6} sm={6} md={3} lg={3} xl={2} >
                                                            <Label className="form-labels">Start date</Label><span className="asterisk">*</span>
                                                            <FormikDatePicker
                                                                name='start_date'
                                                                selected={values.start_date}
                                                                onChange={(e) => {
                                                                    setFieldValue('start_date', e)
                                                                    // setListData([])
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
                                                                    // setListData([])
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
                                                        <Col xs={6} sm={6} md={3} lg={3} xl={2} >
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
                                                <Col md={2}>
                                                    {(report?.length > 0) &&
                                                        <div className="col-sm-12">
                                                            <Button className="btn btn-sm btn-primary-outline mt-4 float-right" onClick={() => downloadReport(values)}>
                                                                <span className='show-as-align'> <HiDownload className='mr-1' />Download Report</span>
                                                            </Button>
                                                        </div>
                                                    }
                                                </Col>
                                            </Row>
                                            <div className="row mt-5">
                                                <div className="col-sm-12">
                                                    <Label className="form-labels ">Total number of visitors</Label>
                                                    <div style={{ padding: '10px 30px' }}>
                                                        <LineChart data={graphValues} />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="row mt-3">
                                                <div className="col-sm-12">
                                                    <ReportVisitorTable
                                                        data={reportTable}
                                                    />
                                                </div>
                                            </div>
                                        </form>
                                    )}
                                </Formik>
                            </CardBody>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    )
}
export default ReportVisitor;