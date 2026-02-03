import React, { useEffect, useState } from "react";
import {
    Row,
    Card,
    Col,
    Button
} from "reactstrap";
import './notification.css'
import NotificationTable from './notificationTable';
import Notification from "./notification";
import { getRequest } from '../../hooks/axiosClient';
import { environmentaldatas } from '../../constant/defaultValues';
const { image_url } = environmentaldatas;

function NotificationList() {

    const initialFormValues = {
        heading: '',
        banner_image: '',
        link: '',
        sub_heading: '',
        text: '',
        text_color: '#ffffff',
        bg_color: '#2d2d2e',
        button_text: '',
        status: 1
    }
    const [modal, setModal] = useState(false);
    const toggle = () => setModal(!modal);
    const [dataSource, setDataSource] = useState([]);
    const [tempTableList, setTempTableList] = useState([]);
    const [croppedImage, setCroppedImage] = useState(null);
    const [values, setValues] = useState(initialFormValues);
    const [notificationId, setNotificationId] = useState(null);
    const [noData, setNodata] = useState(false);

    const getNotificationList = async () => {
        try {
            const response = await getRequest(`notifications`);
            const DataRes = response.data.data ?? [];
            if (DataRes?.length == 0) {
                setNodata(true)
            } else {
                setNodata(false)
            }
            setDataSource(DataRes);
            setTempTableList(DataRes);
        } catch (error) {
        }
    }

    const getNotificationById = async (id) => {
        try {
            const response = await getRequest(`notifications/${id}`);
            const DataRes = response.data.data ?? [];
            setNotificationId(DataRes.notification_id);
            setValues(DataRes);
            setCroppedImage(image_url + (DataRes?.banner_image))
            toggle()
        } catch (error) {
            console.log(error);
        } finally {
        }
    }
    
    useEffect(() => {
        getNotificationList();
    }, []);

    return (
        <div className="text-[#1D1D1B] container-fluid">
            <div className="  flex justify-between " style={{ marginBottom: '16px' }}>
                <h5 className="f-w-600 heading-font" >Notifications</h5>
                <Button
                    className="btn btn-primary"
                    htmlType="submit"
                    type=""
                    style={{ border: "0", }}
                    onClick={() => { toggle(); setValues(initialFormValues); setCroppedImage(null); setNotificationId(null) }}
                >
                    Add New Notification
                </Button>
            </div>
            <Notification
                id={0}
                modalPricing={modal}
                setModalPricing={setModal}
                togglePricing={toggle}
                initialvalues={values}
                notificationId={notificationId}
                croppedImage={croppedImage}
                setCroppedImage={setCroppedImage}
                getNotificationList={getNotificationList}
            />
            <Card className="vh-70" style={{ padding: '20px' }}>
                <Row className=" ">
                    <Col md={12}>
                        <NotificationTable noData={noData} setNodata={setNodata} dataSource={dataSource} getNotificationById={getNotificationById} tempTableList={tempTableList} setDataSource={setDataSource} getNotificationList={getNotificationList} />
                    </Col>
                </Row>
            </Card>
        </div>
    );
}

export default NotificationList;