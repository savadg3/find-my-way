import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardBody,Col ,Row } from 'reactstrap';
import VisitorSvg from '../../assets/icons/visitor.svg';
import EngagementSvg from '../../assets/icons/engagement_svg.svg';

import './report.css';

const Reporting = () => {

    const navigate = useNavigate();

    const visitorClick = () => {
        navigate('/report-visitor');
    }

    const engagementClick = () => {
        navigate('/report-engagement');
    }

    const advertisementClick = () => {
        navigate('/report-advertisement');
    }

    return (
        <>
            <div className="container-fluid">
                <h5 className="f-w-600 headingmargin" style={{ fontSize: '19.64px' }}>Reporting</h5>
                <div >
                    <Row>
                        <Col xs={12} sm={12} md={6} lg={6} xl={4} xxl={3} className='mb-2'>
                            <Card style={{ cursor: 'pointer' }} onClick={visitorClick} >
                                <CardBody style={{ padding: '10px 25px' }} className=''>
                                    <Row>
                                        <Col xs={9} sm={8} md={8} lg={8} xl={8} xxl={10}>
                                        <h5 className="" style={{ fontSize: '19.24px'  }}>Report: Visitors</h5>
                                        <p className='project-visitor mt-1' >Project visitor traffic.</p>
                                        </Col>
                                        <Col xs={3} sm={4} md={4} lg={4} xl={4} xxl={2} >
                                        <img src={VisitorSvg} width={60} className='float-right'/>
                                        </Col>
                                    </Row>
                                </CardBody>
                            </Card>
                        </Col>
                        <Col xs={12} sm={12} md={6} lg={6} xl={4} xxl={3} className='mb-2'>
                            <Card style={{ cursor: 'pointer' }} onClick={engagementClick} >
                                <CardBody style={{ padding: '10px 25px' }} >
                                <Row>
                                        <Col xs={9} sm={8} md={8} lg={8} xl={8} xxl={10}>
                                        <h5 className=" " style={{ fontSize: '19.24px' }} >Report: Engagement</h5>
                                        <p className='project-visitor mt-1'>Visitor interaction with project pins.</p>
                                        </Col>
                                        <Col xs={3} sm={4} md={4} lg={4} xl={4} xxl={2} >
                                        <img src={EngagementSvg} width={60} className='float-right' />
                                        </Col>
                                    </Row>
                                </CardBody>
                            </Card>
                        </Col>
                        <Col xs={12} sm={12} md={6} lg={6} xl={4} xxl={3} className='mb-2'>
                            <Card style={{ cursor: 'pointer' }} onClick={advertisementClick} >
                                <CardBody style={{ padding: '10px 25px' }} >
                                <Row>
                                        <Col xs={9} sm={8} md={8} lg={8} xl={8} xxl={10}>
                                        <h5 className=" " style={{ fontSize: '19.24px' }} >Report: Advertising</h5>
                                        <p className='project-visitor mt-1'>Visitor interaction with advertising banners.</p>
                                        </Col>
                                        <Col xs={3} sm={4} md={4} lg={4} xl={4} xxl={2} >
                                        <img src={EngagementSvg} width={60} className='float-right'/>
                                        </Col>
                                    </Row>
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>
                </div>
            </div>
        </>
    )
}
export default Reporting;