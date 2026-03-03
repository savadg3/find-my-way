import { Col, Row } from 'reactstrap';
import React, { useEffect, useState } from 'react';
import { BsArrowLeftShort } from 'react-icons/bs'; 
import { GoPlus } from 'react-icons/go'; 
import { useDispatch } from 'react-redux';
import { useActiveTab } from '../../../../../components/map/components/hooks/useActiveTab';
import NavigationFormFields from './components/NavigationFormFields';
import { Formik } from 'formik';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

function Navigation() {
    
    useActiveTab('vertical');
    const dispatch    = useDispatch(); 
    const navigate    = useNavigate(); 

    const allPins      = useSelector((s) => s.api.allPins);
    const [mapDivSize, setMapDivSize] = useState(window.innerHeight - 80);
    const [options, setOptions] = useState([]);
    const [currentFormDetails, setCurrentFormDetails] = useState({
        from:"",
        to:""
    });

    useEffect(() => {
        const flat = Object.values(allPins).flat();
        let list =  flat.filter((pin) => {
            if (!pin?.positions) return false; 
            return true;
        })
        setOptions(list)
    }, [allPins]);  
    
    useEffect(() => {
        const handleResize = () => setMapDivSize(window.innerHeight - 80);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const goBack = () => {
        navigate(-1);
    };

    const findPath = () =>{
        console.log("path finding");
    }

    return (
        <div className="bar" id="inner-customizer2" style={{ position: 'relative', height: mapDivSize, paddingBottom: '20px' }} >
            <Row className='backRow'>
                <Col md={8}>
                    <h1> Navigation Path</h1>
                </Col>
                <Col md={4} >
                    <div className='backArrow float-right' onClick={goBack}>
                        <BsArrowLeftShort />
                    </div>
                </Col>
            </Row> 

            <Formik
                initialValues={{
                    from: "",
                    to: "", 
                }}
                // validationSchema={ValidationSchema}
                onSubmit={(values, setFieldError) => {
                    // console.log(values, "values");
                }}
                enableReinitialize
            >
                {({ errors, touched, handleSubmit, setFieldValue }) => (
                    <form onSubmit={handleSubmit}>
                        <div className="custom-scrollbar customScroll" style={{ height: mapDivSize }}>
                            <div className="bar-sub">
                                <NavigationFormFields
                                    errors={errors}
                                    touched={touched}
                                    setFieldValue={setFieldValue}
                                    options={options}
                                    findPath={findPath}
                                    // addNew={addNew}
                                    selTraversibleDetails={currentFormDetails}
                                    setSelTraversibleDetails={setCurrentFormDetails}
                                    // addBeaconClick={addBeaconClick}
                                    // canvas={canvas}
                                    // handleNextPreviousClick={handleNextPreviousClick}
                                    // switchFloor={switchFloor}
                                    // showPath={showPath}
                                    // handleEndDirectionclick={handleEndDirectionclick}
                                />
                            </div>
                        </div>
                    </form>
                )}
            </Formik>
        
        </div>
    )
}

export default Navigation