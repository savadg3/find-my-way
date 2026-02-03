import React, { useEffect, useState } from "react";
import {
    Row,
    Card,
    CardBody,
    Col,
} from "reactstrap";
import { useParams } from "react-router-dom";
import './customer.css'
import LogTable from './logTable';
import { postRequest } from '../../hooks/axiosClient';
import { decode } from "../../helpers/utils";

function Logs() {
    let { id } = useParams();
    id = id && decode(id);
    const [dataSource, setDataSource] = useState([]);
    const [customerDetails, setCustomerDetails] = useState();

    const getCustomerLog = async () => {
        const data = {
            customer_id: id
        }
        try {
            const reqUrl = 'tc-report'
            const response = await postRequest(reqUrl, data);
            const DataRes = response?.response?.data ?? [];
            setCustomerDetails(DataRes?.customer_details)
            setDataSource(DataRes?.tc_details);
        } catch (error) {
        }
    }

    useEffect(() => {
        getCustomerLog()
    }, [id])

    return (

        <div className="text-[#1D1D1B] container-fluid">
            <div className=" flex justify-between " style={{ marginBottom: '16px' }}>
                <h5 className="f-w-600 heading-font" >Logs</h5>
            </div>
            <Card className="vh-70" style={{ padding: '20px' }} >
                <CardBody>
                    <Row >
                        <Col className='' sm={12} >
                            <Card className="customer-details-card mt-2">
                                <CardBody>
                                    <h5 className="f-w-600 log-sub-beading mb-2" >Customer Details</h5>
                                    <Row >
                                        <Col sm={4} >
                                            <div className="">
                                                <p className="customer-labels">Customer Name</p>
                                                <p className="customer-values">{customerDetails?.customer_name}</p>
                                            </div>
                                        </Col>
                                        <Col sm={4} >
                                            <div className="">
                                                <p className="customer-labels" >Customer Email</p>
                                                <p className="customer-values">{customerDetails?.email}</p>
                                            </div>
                                        </Col>
                                        <Col sm={4} >
                                            <div className="">
                                                <p className="customer-labels">Plan</p>
                                                <p className="customer-values">{customerDetails?.plan}</p>
                                            </div>
                                        </Col>
                                    </Row>
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>
                    <Row className="mt-3">
                        <Col className='' sm={12} >
                            {dataSource &&
                                <LogTable
                                    dataSource={dataSource}
                                    setDataSource={setDataSource}
                                    getCustomerLog={getCustomerLog}
                                />
                            }
                        </Col>
                    </Row>
                </CardBody>
            </Card>
        </div>
    );
}

export default Logs;
