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
 
import { useProductList } from './hooks/useProductList';
import ProductItem from './components/ProductItem'; 

const ProductSideBar = () => {

    useActiveTab('product');
    
    const dispatch    = useDispatch();
    const navigate    = useNavigate();
    const projectData = useSelector((state) => state.api.projectData);
    const pinCount    = useSelector((state) => state.api.pinCount);
    
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
        handleCreateProduct,
    } = useProductList({ setModal, setPlanDetails });
 
    
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
                    <h1> { 'Product Pins'}</h1>
                </Col>
                <Col md={4} >
                    <div className='backArrow float-right' onClick={goBack}>
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
                onSubmit={handleCreateProduct} 
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
                                            <p style={{ marginTop: 0 }} >Add New Product Pin</p>
                                            <div className='plus-icon' onClick={() => handleAddNew()}>
                                                <GoPlus />
                                            </div>
                                        </div>
                                        
                                        {/* <div className='bar-sub-header pin-group' style={{ marginRight: '14px' }}>
                                            <p style={{ marginTop: 0 }} >Add New Pin Group</p>
                                            <div className='plus-icon' onClick={() => {
                                                setIsPinGroup(true)
                                                handleAddNew()
                                            }}>
                                                <GoPlus />
                                            </div>
                                        </div> */}

                                        <div className='mb-2 text-right d-grid gap-2' style={{ marginRight: '14px' }}>
                                            {/* <Button
                                                className="btn-primary bar-btn"
                                                type="button"
                                                size="medium"
                                                onClick={()=>bulkUploadClick(1)}
                                            >
                                                Bulk Group Product Upload
                                            </Button> */}
                                            <Button
                                                className="btn-primary bar-btn"
                                                type="button"
                                                size="medium"
                                                onClick={()=>setModalBulk(true)}
                                            >
                                                Bulk Product Upload
                                            </Button>
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
                                                // mapDivSize - 140
                                        }} >
                                            {filteredList.map((product, idx) => (
                                                <ProductItem
                                                    key={product.enc_id}
                                                    index={idx}
                                                    product={product}
                                                    onEdit={handleEdit}
                                                    onRemove={handleRemove}
                                                />
                                            ))}
                                        </div>
                                    </>}

                            <Button 
                                type="submit" 
                                id='productSubmitBtn'
                                hidden
                            >
                                Submit
                            </Button>
                            {/* <Label for="exampleEmail1" className="form-labels">Name</Label> */}

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
            <BulkUploadPin
                modal={modalBulk}
                setModal={setModalBulk}
                type="product"
                projectSettings={projectData}
                getList={() => {}}
            />
        </div>
    )
}

export default ProductSideBar

