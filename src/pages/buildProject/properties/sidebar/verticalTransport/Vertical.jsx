import React, { useEffect, useState } from 'react';
import { BsArrowLeftShort } from 'react-icons/bs';
import { FiSearch } from 'react-icons/fi';
import { GoPlus } from 'react-icons/go';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import { useActiveTab } from '../../../../../components/map/components/hooks/useActiveTab';
import { setEditingPinId } from '../../../../../store/slices/projectItemSlice';
import { handleBlockEnter } from '../../../Helpers/constants/constant'; 

import { useVerticalList } from './hooks/useVerticalList';  
import VerticalItem from './components/VerticalItem';
import { Col, Row } from 'reactstrap';


const VerticalSideBar = () => {
    const { id } = useParams()

    useActiveTab('all');
    
    const dispatch    = useDispatch();
    const navigate    = useNavigate();
    const pinsLoaded  = useSelector((state) => state.api.pinsLoaded);

    const [mapDivSize, setMapDivSize] = useState(window.innerHeight);
    
    const {
        filteredList,
        searchTerm,
        setSearchTerm,
        handleAddNew,
        handleEdit,
        handleRemove, 
    } = useVerticalList();
 
    
    useEffect(() => {
        dispatch(setEditingPinId(null));
    }, []);  
    
    useEffect(() => {
        const handleResize = () => setMapDivSize(window.innerHeight);
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
                    <h1> Vertical Transport</h1>
                </Col>
                <Col md={4} >
                    <div className='backArrow float-right' onClick={goBack}>
                        <BsArrowLeftShort />
                    </div>
                </Col>
            </Row>

            <div className='bar-sub-header' style={{ marginRight: '14px' }}>
                <p style={{ marginTop: 0 }} >Add New Vertical Transport</p>
                <div className='plus-icon' 
                    onClick={() => handleAddNew()}
                >
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
                height: mapDivSize - 200
            }} >
                {!pinsLoaded ? (
                    <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 40 }}>
                        <div className="spinner-border text-primary" role="status">
                            <span className="sr-only">Loading…</span>
                        </div>
                    </div>
                ) : filteredList.map((vertical, idx) => (
                    <VerticalItem
                        key={vertical.enc_id}
                        vertical={vertical}
                        onEdit={handleEdit}
                        onRemove={handleRemove}
                    />
                ))}
            </div> 
     
        </div>
    )
}

export default VerticalSideBar

