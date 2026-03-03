import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BsArrowLeftShort } from 'react-icons/bs';
import { FaInfo } from 'react-icons/fa';
import { FiSearch } from 'react-icons/fi';
import { GoPlus } from 'react-icons/go';
import { Button, Col, Row } from 'reactstrap';
import { useSelector } from 'react-redux';
import { encode } from '../../../../../helpers/utils';
import { useProjectHeader } from '../../../Helpers/pageDiv/ProjectHeaderContext';

import FloorItem from './components/FloorItem';
import AddFloorPlanModal from './components/AddFloorPlanModal';
import { useFloorPlanActions } from './hooks/useFloorPlanActions';

const FloorPlan = () => {
    const navigate    = useNavigate();
    const projectData = useSelector((state) => state.api.projectData);
    const { getProjectById } = useProjectHeader();

    const [floorPlans, setFloorPlans] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [mapDivSize, setMapDivSize] = useState(window.innerHeight - 100);
    const [modal, setModal]           = useState(false);
    const [loading, setLoading]       = useState(false);

    const { loadFloors, handleSave, handleDelete, handleReorder } = useFloorPlanActions({
        setFloorPlans,
        setModal,
        setLoading,
    });
 
    useEffect(() => {
        if (projectData?.enc_id) loadFloors();
    }, [projectData?.enc_id]);
 
    useEffect(() => {
        const handleResize = () => setMapDivSize(window.innerHeight - 100);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
 
    const handleAddNew = () => {
        setModal(true);
        getProjectById();
    };

    const handleModalClose = () => setModal(false);

    const handleEdit = (plan) => navigate(encode(plan.enc_id));

    const goBack = () => {
        if (loading) return;
        navigate(-1);
    };
 
    const filteredData = floorPlans.filter(({ floor_plan = '' }) =>
        !searchTerm || floor_plan.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div
            className="bar"
            id="inner-customizer2"
            style={{ position: 'relative', height: mapDivSize, paddingBottom: 20 }}
        > 
            <Row className="backRow">
                <Col md={8}>
                    <h1>Floor Plan</h1>
                </Col>
                <Col md={4}>
                    <div className="backArrow float-right" onClick={goBack}>
                        <BsArrowLeftShort />
                    </div>
                </Col>
            </Row>
 
            <div className="bar-sub-header" style={{ marginRight: 14 }}>
                <p style={{ marginTop: 0 }}>Add New Floor Plan</p>
                <div className="plus-icon" onClick={handleAddNew}>
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
                    onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}
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
 
            <div className="custom-scrollbar customScroll" style={{ height: mapDivSize - 90 }}>
                {filteredData.map((plan, idx) => (
                    <FloorItem
                        key={plan.enc_id}
                        index={idx}
                        plan={plan}
                        floorsArray={filteredData}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onReorder={handleReorder}
                        onDropEnd={loadFloors}
                    />
                ))}
 
                <div style={{ marginTop: '1rem' }}>
                    <div className="warning-pin-div">
                        <div className="d-flex align-items-center justify-content-center mb-2">
                            <div className="info-cont">
                                <FaInfo />
                            </div>
                        </div>
                        <div className="text-center">
                            <p className="label color-labels">
                                Floors are ordered from bottom to top. The lowest level in the list represents the ground floor.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
 
            <AddFloorPlanModal
                isOpen={modal}
                onClose={handleModalClose}
                onSubmit={(values, helpers) => handleSave(values, helpers)}
                loading={loading}
                nextLevelNumber={floorPlans.length + 1}
            />
        </div>
    );
};

export default FloorPlan;