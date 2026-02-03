import React, { useEffect, useState } from 'react'
import { Row, Col,  } from 'reactstrap';
import { getCurrentUser } from '../../helpers/utils';
import ImageSlider from './ImageSlider';
import './dashboard.css'
import { postRequest, getRequest } from '../../hooks/axiosClient';
import 'react-datepicker/dist/react-datepicker.css';



const Dashboard = () => {

    const [sliders, setSliders] = useState([]);
    const [list, setList] = useState([]);
    const user = getCurrentUser();

    const getSliders = async () => {
        try {
            const response = await getRequest(`sliders`);
            const data = response.data.data ?? [];
            setSliders(data)
        } catch (error) {
            console.log(error);
        } finally {
        }
    }

    const getlist = async () => {
        let param = {
            role_id: user?.user?.role_id,
            common_id: user?.user?.common_id,
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

    useEffect(() => {
        getSliders()
        getlist()
    }, []);

    return (
        <>
            <div className='container-fluid'>
                <div className='d-flex  align-items-center justify-content-between  headingmargin'  >
                    <h5 className="f-w-600 heading-font" >Dashboard</h5>
                    {list?.affliate_code &&
                        <span className="afl-code" ><span className="f-w-600" style={{ fontSize: '12px' }}>Affiliate Identifier:</span>  {list?.affliate_code}</span>
                    }
                </div>
                <Row>
                    <Col xxl={24} lg={24} xs={24}>
                        <div style={{ maxWidth: '100%', overflow: 'hidden', borderRadius: '8px' }}>
                            <div>
                                <ImageSlider setSliders={setSliders} sliders={sliders} />
                            </div>
                        </div>
                    </Col>
                </Row>
                <Row className='mt-3'>
                    <Col className='mt-2' xs={12} sm={6} md={6} lg={6} xl={6} xxl={3}>
                        <div className="column">
                            <h5 className="f-w-600 heading-font">Active Projects</h5>
                            <h4 className='value '>{list?.total_projects ?? 0}</h4>
                        </div>
                    </Col>
                    <Col className='mt-2' xs={12} sm={6} md={6} lg={6} xl={6} xxl={3}>
                        <div className="column">
                            <h5 className="f-w-600 heading-font">Active Location Pins</h5>
                            <h4 className='value '>{list?.total_location_pins ?? 0}</h4>
                        </div>
                    </Col>
                    <Col className='mt-2' xs={12} sm={6} md={6} lg={6} xl={6} xxl={3}>
                        <div className="column">
                            <h5 className="f-w-600 heading-font">Active Product Pins</h5>
                            <h4 className='value '>{list?.total_product_pins ?? 0}</h4>
                        </div>
                    </Col>
                    <Col className='mt-2 mb-2' xs={12} sm={6} md={6} lg={6} xl={6} xxl={3}>
                        <div className="column">
                            <h5 className="f-w-600 heading-font">Total Visitors</h5>
                            <h4 className='value '>{(list?.no_of_customers) ? (list?.no_of_customers ?? 0) : (list?.total_views ?? 0)}</h4>
                        </div>
                    </Col>
                </Row>
                
            </div>
        </>
    )
}

export default Dashboard