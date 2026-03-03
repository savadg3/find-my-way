import React, { useEffect, useState } from 'react';
import { BsArrowLeftShort } from 'react-icons/bs';
import { FiSearch } from 'react-icons/fi';
import { GoPlus } from 'react-icons/go';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Col, Row } from 'reactstrap';
import { Formik } from 'formik';
import { useDispatch, useSelector } from 'react-redux';

import { useActiveTab } from '../../../../../components/map/components/hooks/useActiveTab';
import { setEditingPinId } from '../../../../../store/slices/projectItemSlice';
import { handleBlockEnter } from '../../../Helpers/constants/constant'; 
  
import SafetyItem from './components/SafetyItem'; 
import { useSafetyList } from './hooks/useSafetyList'; 
import { fetchSafetyIcons } from './services/safetyService';
import { decode } from '../../../../../helpers/utils';


const SafetySideBar = () => {

    useActiveTab('safety');
    
    const dispatch    = useDispatch();
    const navigate    = useNavigate(); 
    const { id }      = useParams();
    const decodedId   = decode(id);
    
    const [mapDivSize, setMapDivSize] = useState(window.innerHeight - 80); 
    const [safetyIcons, setSafetyIcons] = useState([]); 
    
    const {
        filteredList,
        searchTerm,
        setSearchTerm,
        handleAddNew,
        handleEdit,
        handleRemove,
        handleCreateSafety,
    } = useSafetyList();
 
    
    useEffect(() => {
        dispatch(setEditingPinId(null));
    }, []);

    useEffect(() => {
        fetchIcons(decodedId);
    }, [decodedId]);

    const fetchIcons = async (id) =>{
        let response = await fetchSafetyIcons(id)
        setSafetyIcons(response)
    }
    
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
                    <h1> Safety Pins</h1>
                </Col>
                <Col md={4} >
                    <div className='backArrow float-right' onClick={goBack}>
                        <BsArrowLeftShort />
                    </div>
                </Col>
            </Row>

            <Formik
                initialValues={{
                    safety_name: '! New safety',
                    enc_id: null,
                    position: null, 
                    icon: safetyIcons[0]?.enc_id, 
                    icon_id: safetyIcons[0]?.enc_id,
                }} 
                onSubmit={handleCreateSafety} 
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
                                        <p style={{ marginTop: 0 }} >Add New Safety Pin</p>
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
                                        {filteredList.map((safety, idx) => (
                                            <SafetyItem
                                                key={safety.enc_id}
                                                index={idx}
                                                safety={safety}
                                                onEdit={handleEdit}
                                                onRemove={handleRemove}
                                            />
                                        ))}
                                    </div>
                                </>
                            }
 
                            <Button 
                                type="submit" 
                                id='safetySubmitBtn'
                                hidden
                            >
                                Submit
                            </Button> 

                        </form>
                    </>
                )}
            </Formik>
             
        </div>
    )
}

export default SafetySideBar

