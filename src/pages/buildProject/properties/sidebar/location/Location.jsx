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
import { ProPinModal } from '../../../Helpers/modal/proPinModal';
import PaymentForm from '../../../../../components/stripe/payment';
 
import { useLocationList } from './hooks/useLocationList';
import LocationItem from './components/LocationItem';

const LocationSidebar = () => {
    useActiveTab('all');

    const dispatch    = useDispatch();
    const navigate    = useNavigate();
    const projectData = useSelector((state) => state.api.projectData);
    const pinCount    = useSelector((state) => state.api.pinCount);
    const pinsLoaded  = useSelector((state) => state.api.pinsLoaded);

    const [mapDivSize, setMapDivSize]     = useState(window.innerHeight - 80);
    const [modal, setModal]               = useState(false);
    const [planDetails, setPlanDetails]   = useState(null);
    const [stripeModal, setStripeModal]   = useState(false);
    const [modalBulk, setModalBulk]       = useState(false);

    const {
        filteredList,
        searchTerm,
        setSearchTerm,
        handleAddNew,
        handleEdit,
        handleRemove,
        handleCreateLocation,
    } = useLocationList({ setModal, setPlanDetails });

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
        <div
            className="bar"
            id="inner-customizer2"
            style={{ position: 'relative', 
                // height: mapDivSize,
                 paddingBottom: 20 }}
        >
            <Row className="backRow">
                <Col md={8}>
                    <h1>Location Pins</h1>
                </Col>
                <Col md={4}>
                    <div className="backArrow float-right" onClick={goBack}>
                        <BsArrowLeftShort />
                    </div>
                </Col>
            </Row>

            <Formik
                initialValues={{
                    location_name:  '! New location',
                    tags:           projectData?.location_tags ?? [],
                    position:       null,
                    enc_id:         null,
                }}
                onSubmit={handleCreateLocation}
            >
                {({ handleSubmit }) => (
                    <form
                        id="locationForm"
                        onSubmit={handleSubmit}
                    >
                        <div className="bar-sub-header" style={{ marginRight: 14 }}>
                            <p style={{ marginTop: 0 }}>Add New Location Pin</p>
                            <div className="plus-icon" onClick={handleAddNew}>
                                <GoPlus />
                            </div>
                        </div>

                        <div className="mb-2 text-right" style={{ marginRight: 14 }}>
                            <Button
                                className="btn-primary bar-btn"
                                type="button"
                                size="medium"
                                onClick={() => setModalBulk(true)}
                            >
                                Bulk Location Upload
                            </Button>
                        </div>

                        {/* ── Search ── */}
                        <div className="d-flex bar-search mb-2">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyDown={handleBlockEnter}
                            />
                            <div className="input-group-append" style={{ marginLeft: -36 }}>
                                <span
                                    className="input-group-text"
                                    style={{ border: 'none', backgroundColor: 'transparent', padding: 4 }}
                                >
                                    <FiSearch className="iconStyle" />
                                </span>
                            </div>
                        </div>
 
                        <div
                            className="custom-scrollbar customScroll"
                            // style={{ height: mapDivSize - 140 }}
                            style={{height:'calc(100vh - 220px)'}}
                        >
                            {!pinsLoaded ? (
                                <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 40 }}>
                                    <div className="spinner-border text-primary" role="status">
                                        <span className="sr-only">Loading…</span>
                                    </div>
                                </div>
                            ) : filteredList.map((location, idx) => (
                                <LocationItem
                                    key={location.enc_id}
                                    index={idx}
                                    location={location}
                                    onEdit={handleEdit}
                                    onRemove={handleRemove}
                                />
                            ))}
                        </div>

                        {/* Hidden submit — triggered by handleAddNew */}
                        <Button id="locationSubmitBtn" type="submit" hidden>
                            Submit
                        </Button>
                    </form>
                )}
            </Formik>

            {/* ── Modals ── */}
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
            <BulkUploadPin
                modal={modalBulk}
                setModal={setModalBulk}
                type="location"
                projectSettings={projectData}
                getList={() => {}}
            />
        </div>
    );
};

export default LocationSidebar;