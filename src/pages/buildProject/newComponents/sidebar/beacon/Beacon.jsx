import React, { useEffect, useState } from 'react';
import { BsArrowLeftShort } from 'react-icons/bs';
import { FiSearch } from 'react-icons/fi';
import { GoPlus } from 'react-icons/go';
import { useNavigate } from 'react-router-dom';
import { Button, Col, Row } from 'reactstrap';
import { Formik } from 'formik';
import { useDispatch, useSelector } from 'react-redux';

import { useActiveTab } from '../../../../../components/map/components/hooks/useActiveTab';
import { setEditingPinId } from '../../../../../store/slices/projectItemSlice';
import { handleBlockEnter } from '../../../Helpers/constants/constant';
import BulkUploadPin from '../../../Helpers/modal/BulkUploadModal';
import { GenerateQrModal, ProPinModal } from '../../../Helpers/modal/proPinModal';
import PaymentForm from '../../../../../components/stripe/payment';
 
// import { useProductList } from './hooks/useProductList';
import BeaconItem from './components/BeaconItem'; 
import { useBeaconList } from './hooks/useBeaconList';
import { encode } from '../../../../../helpers/utils';


const BeaconSideBar = () => {

    useActiveTab('beacon');
    
    const dispatch    = useDispatch();
    const navigate    = useNavigate();
    const projectData = useSelector((state) => state.api.projectData);
    const pinCount    = useSelector((state) => state.api.pinCount);
    
    const [mapDivSize, setMapDivSize]     = useState(window.innerHeight - 80);
    const [modal, setModal]               = useState(false);
    const [planDetails, setPlanDetails]   = useState(null);
    const [stripeModal, setStripeModal]   = useState(false);
    const [modalBulk, setModalBulk]       = useState(false);
    const [qrModal, setQrModal]       = useState(false);
    
    const {
        filteredList,
        searchTerm,
        setSearchTerm,
        handleAddNew,
        handleEdit,
        handleRemove,
        handleCreateBeacon,
    } = useBeaconList({ setModal, setPlanDetails });
 
    
    useEffect(() => {
        dispatch(setEditingPinId(null));
    }, []);
    
    useEffect(() => {
        const handleResize = () => setMapDivSize(window.innerHeight - 80);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const goBack = () => {
        navigate(-1);
        setSearchTerm('');
    };

    return (
        <div className="bar" id="inner-customizer2" style={{ position: 'relative', height: mapDivSize, paddingBottom: '20px' }} >
            <Row className='backRow'>
                <Col md={8}>
                    <h1> QR Code Beacon</h1>
                </Col>
                <Col md={4} >
                    <div className='backArrow float-right' onClick={goBack}>
                        <BsArrowLeftShort />
                    </div>
                </Col>
            </Row>

            <Formik
                initialValues={{
                    beacon_name:       '! New beacon',
                    message:           '',
                    enc_id:            null,
                    position:          null,
                    heading:           'Find Your Destination',
                    content:           null,
                    subheading:       'Instant directions with no app download',
                    heading_color:    '#FFFFFF',
                    subheading_color: '#26A3DB',
                    content_color:    '#1D1D1B',
                    bg_color:         '#8BCDEB',
                }} 
                onSubmit={handleCreateBeacon} 
            >
                {({
                    handleSubmit, 
                }) => (
                    <> 
                        <form
                            id="productForm"
                            className="av-tooltip tooltip-label-bottom formGroups"
                            onSubmit={(e) => handleSubmit(e)}
                        >
                            { 
                                <>
                                    <div className='bar-sub-header' style={{ marginRight: '14px' }}>
                                        <p style={{ marginTop: 0 }} >Add New QR Code Beacon</p>
                                        <div className='plus-icon' onClick={() => handleAddNew()}>
                                            <GoPlus />
                                        </div>
                                    </div> 
 

                                    <div className="d-flex bar-search mb-2">
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Search..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            onKeyDown={(e) => handleBlockEnter(e)}
                                        />
                                        <div
                                            className="input-group-append"
                                            style={{ marginLeft: "-36px" }}
                                        >
                                            <span
                                                className="input-group-text"
                                                style={{
                                                    border: "none",
                                                    backgroundColor: "transparent",
                                                    padding: '4px'
                                                }}
                                            >
                                                <FiSearch className="iconStyle" />
                                            </span>
                                        </div>
                                    </div>

                                    <div className='custom-scrollbar customScroll' style={{
                                        height: mapDivSize - 246 
                                    }} >
                                        {filteredList.map((beacon, idx) => (
                                            <BeaconItem
                                                key={beacon.enc_id}
                                                index={idx}
                                                beacon={beacon}
                                                onEdit={handleEdit}
                                                onRemove={handleRemove}
                                            />
                                        ))}
                                    </div>
                                </>
                            }

                            <Button className='btn btn-primary' onClick={() => setQrModal(true)} style={{ width: '95%' }}>Generate QR Code Beacon Poster</Button>
                            <Button className='btn btn-primary mt-2' onClick={() => navigate(`/canvas-editor/${encode(projectData?.enc_id)}`)} style={{ width: '95%' }}>PDF Editor</Button>

                            <Button 
                                type="submit" 
                                id='beaconSubmitBtn'
                                hidden
                            >
                                Submit
                            </Button> 

                        </form>
                    </>
                )}
            </Formik>
            
            
            <ProPinModal
                isOpen={modal}
                toggle={() => setModal((v) => !v)}
                totalPinsUsed={pinCount}
                planDetails={planDetails}
                addCardDetails={() => { setModal(false); setStripeModal(true); }}
                projectSettings={projectData}
            />

            <PaymentForm
                toggleStripe={() => setStripeModal((v) => !v)}
                stripeModal={stripeModal}
                planDetails={planDetails}
                project_id={projectData?.enc_id}
                fromUpgrade={false}
            />

            <GenerateQrModal
                isOpen={qrModal}
                toggle={() => setQrModal((prev) => !prev)}
                projectSettings={projectData}
                filteredData={filteredList}
            />
        </div>
    )
}

export default BeaconSideBar

