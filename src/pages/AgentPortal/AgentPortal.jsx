import React, { useEffect, useState } from 'react'
import { Row, Col, CardBody, Card, Button,  } from 'reactstrap';
import { decode } from '../../helpers/utils';
import { postRequest, getRequest } from '../../hooks/axiosClient';
import BarGraph from '../../components/chart/barchart';
import 'react-datepicker/dist/react-datepicker.css';
import { CiWarning } from "react-icons/ci";
import './agentPortal.css';
import { FiDownload } from "react-icons/fi";
import { environmentaldatas } from '../../constant/defaultValues';
import { useParams } from "react-router-dom";

const { image_url } = environmentaldatas;


const AgentDashboard = () => {
    const params = useParams();
    const roleId = decode(params?.roleId);
    const commonId =decode(params?.commonId)
    const [list, setList] = useState([]);
    const [redirectUrl, setRedirectUrl] = useState(false);
    const [pack, setPack] = useState();
    const [graphData, setGraphData] = useState({ label: [], datasets: [] });
    const [summaryData, setProjectSummaryData] = useState({ label: [], datasets: [] });    

    const getlist = async () => {
        let param = {
            role_id: roleId,
            common_id: commonId,
        }
        try {
            const response = await postRequest(`dashboards`, param);
            const datas = response.response.data ?? [];
            setList(datas);
        } catch (error) {
            console.log(error);
        } finally {
        }
    }

    const getPack = async () => {
        try {
            const response = await getRequest(`pack`);
            const datas = response.data ?? [];
            setPack(datas);
        } catch (error) {
            console.log(error);
        } finally {
        }
    }

    const getCustomerCountGraph = async () => {
        let param = {
            agent_id: commonId,
        }
        try {
            const response = await postRequest(`agent-customer-count-graph`, param);
            const datas = response.response.data ?? [];
            arrangeGraphData(datas, param)
        } catch (error) {
            console.log(error);
        } finally {
        }
    }

    const arrangeGraphData = (datas) => {
        const allMonths = getPrevious12Months();
        const monthlyData = allMonths.reduce((acc, month) => {
            acc[month] = 0;
            return acc;
        }, {});

        datas.forEach(item => {
            const label = `${item.month}-${item.year % 100}`;
            monthlyData[label] = item.cust_count;
        });
        const chartData = {
            labels: allMonths,
            datasets: [{
                label: 'No of Customers',
                data: allMonths.map(month =>
                    monthlyData[month]
                ),
                backgroundColor: 'rgb(38, 163, 219)',
                borderWidth: 0,
            }],
        };
        setGraphData(chartData);
    }
   

    const getPrevious12Months = () => {
        const months = [];
        const currentDate = new Date();
        for (let i = 1; i <= 12; i++) {
            currentDate.setMonth(currentDate.getMonth() - 1);
            const month = currentDate.toLocaleString('en-US', { month: 'short' });
            const year = currentDate.getFullYear();
            months.unshift(`${month}-${year % 100}`);
        }
        return months;
    };

    const handleSubmitCommissionSummary = async () => {
        let param = {
            agent_id: commonId,
        }
        try {
            const response = await postRequest(`agent-graph`, param);
            const datas = response.response.data ?? [];
            const allMonths = getPrevious12Months();
            arrangeSummaryGraphData(datas, allMonths);
        } catch (error) {
            console.log(error);
        } finally {
        }
    }

    const arrangeSummaryGraphData = (datas,allMonths) => {
        const monthlyDataForCharge = allMonths.reduce((acc, month) => {
            acc[month] = 0;
            return acc;
        }, {});
        const monthlyDataForCount = allMonths.reduce((acc, month) => {
            acc[month] = 0;
            return acc;
        }, {});
        datas.forEach(item => {
            const label = `${item.month}-${item.year % 100}`;
            monthlyDataForCharge[label] = item.sum_commision_charge;
        });
        datas.forEach(item => {
            const label = `${item.month} ${item.year}`;
            monthlyDataForCount[label] = item.project_count;
        });
        const data = {
            labels: allMonths,
            datasets: [
                {
                    label: 'Commission Charge',
                    data: allMonths.map((month => monthlyDataForCharge[month])),
                    backgroundColor: 'rgb(38, 163, 219)',
                    borderWidth: 0,
                },
            ],
        };
        setProjectSummaryData(data);
    }

    useEffect(() => {
        getlist();
        getPack();
    }, []);

    useEffect(() => {
        if (roleId == 3) {
            getAgentStatus();
            getCustomerCountGraph();
            handleSubmitCommissionSummary();
        }
    }, []);

    const getAgentStatus = async () => {
        try {
            const response = await getRequest(`check-status/${commonId}`);
            console.log(response, 'agentstatus');
            const responseData = response?.data;
            if (responseData?.redirect_url) {
                setRedirectUrl(responseData?.redirect_url);
            } else {
                setRedirectUrl(null);
            }
        } catch (error) {
            console.log(error);
        } finally {
        }
    }

    const Connectnow = (url) => {
        window.open(url, '_self');
    }

    const downloadPack = () => {
        const url = image_url + pack?.pack?.file_path;
        const link = document.createElement("a");
        link.href = url;
        link.download = pack?.pack?.document_name;
        link.click();
        window.URL.revokeObjectURL(url);
    }

    return (
        <>
            <div className='container-fluid'>
                <div className='d-flex  align-items-center justify-content-between  headingmargin'  >
                    <h5 className="f-w-600 heading-font" >Agent Portal</h5>
                </div>
                {redirectUrl &&
                    <Row>
                        <Col xxl={24} lg={24} xs={24}>
                            <div className='stripe-warning '  >
                                <div className='d-flex'>
                                    <div className='mr-2'>
                                        <CiWarning fontSize={22} style={{ marginTop: '2px' }} />
                                    </div>
                                    <div>
                                        <p className='f-w-600 ' style={{ fontSize: '19.24px' }}>Alert</p>
                                        <p style={{ fontSize: '13.14px' }}>You are not connected to Stripe to receive your commission. Please connect now.</p>
                                        <div>
                                            <Button className="btn-connect"
                                                size="medium"
                                                style={{ marginTop: '10px' }}
                                                onClick={() => Connectnow(redirectUrl)}
                                            >
                                                Connect
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Col>
                    </Row>
                }
                <Row className='mt-3'>
                    <Col className='mt-2' xs={6} sm={6} md={6} lg={3} >
                        <div className="agent-column">
                            <h5 className=" agent-heading-font">Affiliate Code</h5>
                            <h4 className='afiliate-value'>{list?.affliate_code}</h4>
                        </div>
                    </Col>
                    <Col className='mt-2' xs={6} sm={6} md={6} lg={3}>
                        <div className="agent-column">
                            <h5 className=" agent-heading-font">Project Commission</h5>
                            <h4 className='value '>{list?.project_commission ? (list?.project_commission + '%') : 0}</h4>
                        </div>
                    </Col>
                    <Col className='mt-2' xs={6} sm={6} md={6} lg={3}>
                        <div className="agent-column">
                            <h5 className=" agent-heading-font">Customer Discount</h5>
                            <h4 className='value '>{list?.customer_discount ? (list?.customer_discount + '%') : 0}</h4>
                        </div>
                    </Col>
                    <Col className='mt-2' xs={6} sm={6} md={6} lg={3}>
                        <div className="agent-column">
                            <h5 className=" agent-heading-font">Total Earnings</h5>
                            <h4 className='value '>{list?.total_earnings ? ('$' + list?.total_earnings) : 0}</h4>
                        </div>
                    </Col>
                </Row>
                <Row className='mt-3'>
                    <Col className='mt-2' xs={6} sm={6} md={6} lg={3} >
                    </Col>
                    <Col className='mt-2' xs={6} sm={6} md={6} lg={3} >
                        <div className="agent-column">
                            <h5 className=" agent-heading-font">Affiliated Users</h5>
                            <h4 className='value '>{list?.affiliated_users ?? 0}</h4>
                        </div>
                    </Col>
                    <Col className='mt-2' xs={6} sm={6} md={6} lg={3} >
                        <div className="agent-column">
                            <h5 className=" agent-heading-font">Affiliated Projects (PRO)</h5>
                            <h4 className='value '>{list?.affiliated_projects ?? 0}</h4>
                        </div>
                    </Col>
                    <Col className='mt-2' xs={6} sm={6} md={6} lg={3} >
                        <div className="agent-column">
                            <h5 className=" agent-heading-font">Next Commission Payment</h5>
                            <h4 className='value '>{list?.next_commission_payment ? ('$' + list?.next_commission_payment) : 0}</h4>
                        </div>
                    </Col>
                </Row>
                {roleId == 3 &&
                    <>
                        <Row>
                            <Col xs={12} sm={12} md={12} lg={6} >
                                <Card className='mt-4 pb-4'>
                                    <CardBody>
                                        <Row >
                                            <Col md={12}>
                                                <Card>
                                                    <CardBody>
                                                        <h5 className="  agent-heading-font" >New affiliated users (Past 12 month)</h5>
                                                        <div className='chart-container barchart-container mt-4' style={{ padding: '0px 25px' }}>
                                                            <BarGraph style={{ height: '400px', display: 'block' }} data={graphData} />
                                                        </div>
                                                    </CardBody>
                                                </Card>
                                            </Col>
                                        </Row>
                                    </CardBody>
                                </Card>
                            </Col>
                            <Col xs={12} sm={12} md={12} lg={6}>
                                <Card className='mt-4 pb-4'>
                                    <CardBody>
                                        <Row >
                                            <Col md={12}>
                                                <Card>
                                                    <CardBody>
                                                        <h5 className="agent-heading-font  " >Monthly Earnings (Past 12 month)</h5>
                                                        <div className='chart-container barchart-container mt-4' style={{ padding: '0px 25px' }}>
                                                            <BarGraph style={{ height: '400px', display: 'block' }} data={summaryData} />
                                                        </div>
                                                    </CardBody>
                                                </Card>
                                            </Col>
                                        </Row>
                                    </CardBody>
                                </Card>
                            </Col>
                        </Row>
                        {pack?.pack &&
                            <Row className='pb-4'>
                                <Col xs={7} sm={6} md={5} lg={4} xl={3}>
                                    <Card className='mt-4 '>
                                        <CardBody style={{ padding: '20px 34px' }} className='download-marketing' onClick={downloadPack}>
                                            <Row >
                                                <Col md={12}>
                                                    <div className='d-flex justify-content-between align-items-center'>
                                                        <p className="  agent-heading-font" >Download Marketing Pack</p>
                                                        <FiDownload style={{ cursor: 'pointer' }} />
                                                    </div>
                                                </Col>
                                            </Row>
                                        </CardBody>
                                    </Card>
                                </Col>
                            </Row>
                        }
                    </>
                }
            </div>
        </>
    )
}

export default AgentDashboard