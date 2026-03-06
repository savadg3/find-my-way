import React, { useEffect, useState } from 'react';
import { BsArrowLeftShort } from 'react-icons/bs';
import { FiSearch } from 'react-icons/fi';
import { GoPlus } from 'react-icons/go';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import { setEditingPinId } from '../../../../../store/slices/projectItemSlice';
import { handleBlockEnter } from '../../../Helpers/constants/constant'; 
  
import { Col, Row } from 'reactstrap';
import { useAdvertisingList } from './hooks/useAdvertisingList';
import AdvertisingItem from './components/AdvertisingItem';


const AdvertisingSideBar = () => {
  
    const { id }      = useParams();
    const dispatch    = useDispatch();
    const navigate    = useNavigate();
    const pinsLoaded  = useSelector((state) => state.api.pinsLoaded);

    const [mapDivSize, setMapDivSize] = useState(window.innerHeight - 80);
    
    const {
        filteredList,
        searchTerm,
        setSearchTerm,
        handleAddNew,
        handleEdit,
        handleRemove, 
    } = useAdvertisingList();
     
        
    useEffect(() => {
        dispatch(setEditingPinId(null));
    }, []);  
    
    useEffect(() => {
        const handleResize = () => setMapDivSize(window.innerHeight - 80);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const goBack = () => {
        navigate(`/project/${id}`);
        setSearchTerm('');
    };

    return (
        <div className="bar" id="inner-customizer2" style={{ position: 'relative', height: mapDivSize, paddingBottom: '20px' }} >
            <Row className='backRow'>
                <Col md={8}>
                    <h1> Advertising Banner</h1>
                </Col>
                <Col md={4} >
                    <div className='backArrow float-right' onClick={goBack}>
                        <BsArrowLeftShort />
                    </div>
                </Col>
            </Row>

            <div className='bar-sub-header' style={{ marginRight: '14px' }}>
                <p style={{ marginTop: 0 }} >Add New Advertising Banner</p>
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
                {!pinsLoaded ? (
                    <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 40 }}>
                        <div className="spinner-border text-primary" role="status">
                            <span className="sr-only">Loading…</span>
                        </div>
                    </div>
                ) : filteredList.map((advertise, idx) => (
                    <AdvertisingItem
                        key={advertise.enc_id}
                        advertise={advertise}
                        onEdit={handleEdit}
                        onRemove={handleRemove}
                    />
                ))}
            </div>  
                            
             
        </div>
    )
}

export default AdvertisingSideBar

