import React, { useEffect, useState, useRef } from 'react'
import { Row, Col, CardBody, Card,  Modal, ModalBody } from 'reactstrap';
import { getCurrentUser } from '../../helpers/utils';
import { postRequest, getRequest } from '../../hooks/axiosClient';
import BarGraph from '../../components/chart/barchart';
import 'react-datepicker/dist/react-datepicker.css';
import { MdOutlineFileUpload } from "react-icons/md";
import { IoMdClose } from 'react-icons/io'
import swal from 'sweetalert';
import { toast } from "react-toastify";
import { environmentaldatas } from '../../constant/defaultValues';
import { UncontrolledTooltip } from 'reactstrap';

const { image_url } = environmentaldatas;

const AdminDashboard = () => {

    const [list, setList] = useState([]);
    const [pack, setPack] = useState();
    const logoSelectRef = useRef();
    const [fileKey, setFileKey] = useState(Date.now());
    const [loading, setLoading] = useState(false);
    const [graphData, setGraphData] = useState({ label: [], datasets: [] });
    const [summaryData, setProjectSummaryData] = useState({ label: [], datasets: [] });
    const user = getCurrentUser();

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
        try {
            const response = await getRequest(`admin-users-graph`);
            const datas = response?.data ?? [];
            arrangeGraphData(datas)
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
                label: 'No of Users',
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

    const getRevenueIncomeGraph = async () => {
        try {
            const response = await getRequest(`revenue-income-graph`);
            const datas = response.data ?? [];
            const allMonths = getPrevious12Months();
            arrangeGraphDataIncome(datas,allMonths)
        } catch (error) {
            console.log(error);
        } finally {
        }
    }

    const arrangeGraphDataIncome = (datas,allMonths) => {
        const monthlyDataForIncome = allMonths.reduce((acc, month) => {
            acc[month] = 0;
            return acc;
        }, {});
        const monthlyDataFordeduction = allMonths.reduce((acc, month) => {
            acc[month] = 0;
            return acc;
        }, {});
        datas.forEach(item => {
            const label = `${item.month}-${item.year % 100}`;
            monthlyDataForIncome[label] = item.income;
        });
        datas.forEach(item => {
            const label = `${item.month}-${item.year % 100}`;
            monthlyDataFordeduction[label] = item.deduction;
        });
        const data = {
            labels: allMonths,
            datasets: [
                {
                    label: 'Income',
                    data: allMonths.map((month => monthlyDataForIncome[month])),
                    backgroundColor: 'rgb(38, 163, 219)',
                    borderWidth: 0,
                    stack: 'Stack 0',
                },
                {
                    label: 'Deduction',
                    data: allMonths.map((month => monthlyDataFordeduction[month])),
                    backgroundColor: 'rgb(148, 197, 64)',
                    borderWidth: 0,
                    stack: 'Stack 0',
                },
            ],
        };
        setProjectSummaryData(data);
    }

    useEffect(() => {
        getlist();
        getPack();
        getCustomerCountGraph();
        getRevenueIncomeGraph();
    }, []);



    const handleFileUpload = (event) => {
        const file = event;
        setFileKey(Date.now());
        if (file) {
            const validExtensions = ['application/zip', 'application/x-zip-compressed', 'multipart/x-zip', 'application/x-compressed'];
            const fileExtension = file.name.split('.').pop();
            if (!validExtensions.includes(file.type) && fileExtension !== 'zip') {
                toast.error('Please upload a ZIP file.');
                return;
            }
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = function (e) {
                const fileData = {
                    file: file,
                    data: e.target.result,
                };
                handleUploadPack(fileData);
            };
            return
        }
    };

    const handleUploadPack = async (file) => {
        setLoading(true);
        const formData = new FormData();
        formData.append('file', file?.file);
        formData.append('file_size', file?.file?.size);
        try {
            const response = await postRequest(`upload-pack`, formData, true);
            getPack();
            const datas = response?.response?.data ?? [];
            toast.success(datas?.message);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false)
        }
    }

    const formatDate = (inputDate) => {
        if (inputDate) {
            const date = new Date(inputDate);
            const day = date.getDate().toString().padStart(2, '0');
            const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are zero-based
            const year = date.getFullYear();
            return `${day}/${month}/${year}`;
        } else {
            return ''
        }

    };
    const formatBytes = (bytes, decimals) => {
        if (bytes === 0) {
            return '0 Bytes';
        }
        const k = 1024;
        const dm = decimals <= 0 ? 0 : decimals || 2;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }

    const deleteApi = async (row) => {
        try {
            const response = await getRequest(`delete-pack/${row?.id}`);
            toast.success(response?.data?.message);
            getPack();
        } catch (error) {
            console.log(error);
        } finally {
        }
    }

    const onDelete = (row) => {
        swal({
            title: "Are you sure you want to delete?",
            text: "This action is permanent and cannot be undone.",
            icon: "warning",
            buttons: [
                {
                    text: "No",
                    value: "No",
                    visible: true,
                    className: "btn-danger",
                    closeModal: true,
                },
                {
                    text: "Yes",
                    value: "Yes",
                    visible: true,
                    className: "btn-success",
                    closeModal: true,
                },
            ],
        })
            .then((value) => {
                switch (value) {
                    case "Yes":
                        deleteApi(row)
                        break;
                    default:
                        break;
                }
            });
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
                    <h5 className="f-w-600 heading-font" >Admin Dashboard</h5>
                </div>
                <Row className='mt-3'>
                    <Col className='mt-2' sm={6} md={6} lg={3} xs={6}>
                        <div className="agent-column">
                            <h5 className=" agent-heading-font">Total Users</h5>
                            <h4 className='value'>{list?.total_users ?? 0}</h4>
                        </div>
                    </Col>
                    <Col className='mt-2' sm={6} md={6} lg={3} xs={6}>
                        <div className="agent-column">
                            <h5 className=" agent-heading-font"> Total Revenue (Lifetime)</h5>
                            <h4 className='value '>{list?.total_revenue ? ('$' + list?.total_revenue) : 0}</h4>
                        </div>
                    </Col>
                    <Col className='mt-2' sm={6} md={6} lg={3} xs={6}>
                        <div className="agent-column">
                            <h5 className=" agent-heading-font">Total Income (Lifetime)</h5>
                            <h4 className='value '>{list?.total_income ? ('$' + list?.total_income) : 0}</h4>
                        </div>
                    </Col>
                    <Col className='mt-2' sm={6} md={6} lg={3} xs={6}>
                        <div className="agent-column">
                            <h5 className=" agent-heading-font">Average Project Value (PRO)</h5>
                            <h4 className='value '>{list?.project_value ? ('$' + list?.project_value) : 0}</h4>
                        </div>
                    </Col>
                </Row>
                <Row className='mt-3'>
                    <Col className='mt-2' sm={6} md={6} lg={3} xs={6}>
                        <div className="agent-column">
                            <h5 className=" agent-heading-font"> Total Projects (FREE)</h5>
                            <h4 className='value '>{list?.free_projects ? (list?.free_projects) : 0}</h4>
                        </div>
                    </Col>
                    <Col className='mt-2' sm={6} md={6} lg={3} xs={6}>
                        <div className="agent-column">
                            <h5 className=" agent-heading-font">Total Projects (PRO)</h5>
                            <h4 className='value '>{list?.pro_projects ?? 0}</h4>
                        </div>
                    </Col>
                    <Col className='mt-2' sm={6} md={6} lg={3} xs={6}>
                        <div className="agent-column">
                            <h5 className=" agent-heading-font">Average Location Pins Per Project (PRO)</h5>
                            <h4 className='value '>{list?.avg_locations ?? 0}</h4>
                        </div>
                    </Col>
                    <Col className='mt-2' sm={6} md={6} lg={3} xs={6}>
                        <div className="agent-column">
                            <h5 className=" agent-heading-font"> Average Product Pins Per Project (PRO)</h5>
                            <h4 className='value '>{list?.avg_products ? (list?.avg_products) : 0}</h4>
                        </div>
                    </Col>
                </Row>
                <>
                    <Row>
                        <Col xs={12} sm={12} md={12} lg={6}>
                            <Card className='mt-4 pb-4'>
                                <CardBody>
                                    <Row >
                                        <Col md={12}>
                                            <Card>
                                                <CardBody>
                                                    <h5 className="  agent-heading-font" > New Users (Past 12 month)</h5>
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
                                                    <h5 className="agent-heading-font  " > Monthly Revenue VS Income (Past 12 month)</h5>
                                                    <div className='chart-container barchart-container mt-4' style={{ padding: '0px 25px' }}>
                                                        <BarGraph style={{ height: '400px', display: 'block' }} data={summaryData} stacked={true} />
                                                    </div>
                                                </CardBody>
                                            </Card>
                                        </Col>
                                    </Row>
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>
                    <Row className='mt-4'>
                        <Col md={12}>
                            <h5 className=" heading-font" >Documents</h5>
                        </Col>
                    </Row>
                    <Row className='pb-4'>
                        <Col xs={8} sm={7} md={6} lg={4} xl={3}>
                            <Card className='mt-4 '>
                                <CardBody style={{ padding: '20px 34px' }}>
                                    <Row >
                                        <Col md={12}>
                                            <div className='d-flex justify-content-between'>
                                                <h5 className="  agent-heading-font" >Agent Marketing Pack</h5>
                                            </div>
                                            {pack?.pack ?
                                                <>
                                                    <div className='d-flex align-items-center' style={{ marginTop: '20px' }}>
                                                        <UncontrolledTooltip placement="top" target={`pack`}>
                                                            Download
                                                        </UncontrolledTooltip>
                                                        <div className='file-contain' id={`pack`} onClick={() => downloadPack()}>
                                                            <p className='ml-2'  > {pack?.pack?.document_name}</p>
                                                        </div>
                                                        <div onClick={() => onDelete(pack?.pack)} className='ml-4 p-1 rounded-circle' style={{
                                                            backgroundColor: '#E5E5E5', cursor: 'pointer', height: '17px',
                                                            width: '17px',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            color: '#666666'
                                                        }} >
                                                            <IoMdClose style={{ fontSize: '10px' }} />
                                                        </div>
                                                    </div>
                                                    <div className='d-flex mt-1'>
                                                        <span className='file-detail'>
                                                            {formatBytes(pack?.pack?.file_size)}
                                                        </span>
                                                        <span className='file-detail ml-1'>
                                                            Last Updated: {formatDate(pack?.pack?.updated_at)}
                                                        </span>
                                                    </div>
                                                </>
                                                :
                                                <div style={{ marginTop: '20px' }}>
                                                    <div className='select-file' onClick={() => logoSelectRef.current.click()} >
                                                        <MdOutlineFileUpload />
                                                        <p className='ml-2'> Browse files</p>
                                                    </div>
                                                    <input key={fileKey} type='file' accept='.zip' ref={logoSelectRef} hidden onChange={(e) => { handleFileUpload(e?.target?.files[0]) }} />
                                                </div>
                                            }
                                        </Col>
                                    </Row>
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>
                    {loading &&
                        <Modal isOpen={true} size="sm" className="loading-modal" style={{ zIndex: '9999999 !important', maxWidth: '200px', backgroundColor: 'transparent' }} centered>
                            <ModalBody >
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <div class="folder">
                                        <span class="folder-tab"></span>
                                        <div class="folder-icn">
                                            <div class="uploading">
                                                <span class="custom-arrow-upload"></span>
                                            </div>
                                            <div class="bar-downld"></div>
                                        </div>
                                    </div>
                                </div>
                            </ModalBody>
                        </Modal>
                    }
                </>
            </div>
        </>
    )
}

export default AdminDashboard