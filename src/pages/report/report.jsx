import React, { useState } from 'react';
// import { Form, Input, Row, Col, DatePicker, Label } from 'antd';
import { Row, Col, Label, Input, FormGroup, Button, Table, Card, CardBody } from 'reactstrap';
import { Formik } from "formik";
import { HiDownload } from 'react-icons/hi'
import * as Yup from 'yup';
import Select from 'react-select';
import FormikDatePicker from '../../components/constants/Datepicker';
import CustomSelect from '../../components/constants/CustomSelect';
import './report.css';
import ReportTable from './reportTable';

// import InvoiceTable from './invoiceTable'

const invoiceIntialValue = {
    start_date: '',
    end_date: '',
}

const optionsCustomer = [
    { value: '1', label: 'Customer 1' },
    { value: '2', label: 'Customer 2' },
    { value: '3', label: 'Customer 3' },
];

const optionsProjects = [
    { value: '1', label: 'Project 1' },
    { value: '2', label: 'Project 2' },
    { value: '3', label: 'Project 3' },
];

const optionsStatus = [
    { value: '1', label: 'Paid' },
    { value: '2', label: 'Unpaid' },
];


const Report = () => {
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [selectedProject, setSelectedProject] = useState(null);
    const [selectedStatus, setSelectedStatus] = useState(null);

    return (
        <>
            <div className="container-fluid">
                <h5 className="f-w-600 headingmargin" style={{ fontSize: '20px' }}>Reports</h5>
                <Card style={{ minHeight: '70vh', padding: '30px' }}>

                    <Formik
                        initialValues={invoiceIntialValue}
                        // validationSchema={}
                        onSubmit={(values, setFieldError) => {
                            console.log(values)
                        }}
                    >
                        {({ errors,
                            values,
                            touched,
                            setFieldValue,
                            setFieldTouched,
                            setFieldError,
                            handleSubmit }) => (
                            <form onSubmit={(e) => handleSubmit(e, setFieldError)}>

                                <Row >
                                    <Col sm="2">
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
                                    </Col>
                                    <Col sm="2">
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
                                    </Col>
                                    <Col sm="2">
                                        <Label className="form-labels">
                                            Select Customer
                                        </Label>
                                        <CustomSelect
                                            selectedOption={selectedCustomer}
                                            setSelectedOption={setSelectedCustomer}
                                            options={optionsCustomer}
                                        />
                                    </Col>
                                    <Col sm="3">
                                        <Label className="form-labels">
                                            Select Project
                                        </Label>
                                        <CustomSelect
                                            selectedOption={selectedProject}
                                            setSelectedOption={setSelectedProject}
                                            options={optionsProjects}
                                        />
                                    </Col>

                                    <Col sm="1" className='show-as-align'>
                                        <Button className="btn btn-sm  btn-primary mt-4">Go</Button>
                                    </Col>
                                    <Col sm="2" >
                                        <Button className="btn btn-sm btn-primary-outline mt-4 float-right"> <span className='show-as-align'> <HiDownload className='mr-1'/>Download as Excel</span>  </Button>
                                    </Col>
                                </Row>
                                <Row className='mt-4'>
                                    <Col sm={12}>
                                        <ReportTable/>
                                    </Col>
                                </Row>

                            </form>

                        )}
                    </Formik>
                </Card>
            </div>

            <Row className='mt-4'>
                <Col sm="12">
                    {/* <InvoiceTable /> */}
                </Col>
            </Row>
        </>
    )
}
export default Report;