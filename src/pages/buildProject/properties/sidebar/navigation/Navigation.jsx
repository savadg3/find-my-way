import { Col, Row } from 'reactstrap';
import React, { useEffect, useState } from 'react';
import { BsArrowLeftShort } from 'react-icons/bs';
import { useDispatch, useSelector } from 'react-redux';
import NavigationFormFields from './components/NavigationFormFields';
import { Formik } from 'formik';
import { useNavigate } from 'react-router-dom';
import {
  buildNavGraph,
  dijkstra,
  findPinNodeId,
  haversineM,
} from '../../../../../components/map/components/Map/Navigation/navigationUtils';
import {
  setShortestPath,
  clearShortestPath,
} from '../../../../../store/slices/navigationSlice';

function Navigation() {

    const dispatch    = useDispatch();
    const navigate    = useNavigate();

    const allPins      = useSelector((s) => s.api.allPins);
    const paths        = useSelector((s) => s.navigation.paths);
    const shortestPath = useSelector((s) => s.navigation.shortestPath);
    const currentFloor = useSelector((s) => s.api.currentFloor);

    const [mapDivSize, setMapDivSize] = useState(window.innerHeight);
    const [options, setOptions]       = useState([]);
    const [pathError, setPathError]   = useState(null);
    const [currentFormDetails, setCurrentFormDetails] = useState({
        from: '',
        to:   '',
    });
 
    useEffect(() => {
        const { vertical, vertical_transport, ...restPins } = allPins || {}; 
        const flat = Object.values(restPins).flat();
        setOptions(flat.filter((pin) => !!pin?.positions));
    }, [allPins]);
 
    useEffect(() => {
        const handleResize = () => setMapDivSize(window.innerHeight);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const goBack = () => { 
        navigate(-1); 
    };

    const findPath = () => {
        const fromPinId = currentFormDetails?.from_pin_id;
        const toPinId   = currentFormDetails?.to_pin_id; 

        let floorPath = paths.filter((item) => item?.floorId == currentFloor?.enc_id)


        setPathError(null);
        dispatch(clearShortestPath());

        if (!fromPinId || !toPinId) {
            setPathError('Please select both From and To locations.');
            return;
        }
        if (fromPinId === toPinId) {
            setPathError('From and To locations must be different.');
            return;
        }

        const startId = findPinNodeId(floorPath, fromPinId);
        const endId   = findPinNodeId(floorPath, toPinId);

        if (!startId) {
            setPathError('The "From" pin is not connected to any navigation path. Draw a connection first.');
            return;
        }
        if (!endId) {
            setPathError('The "To" pin is not connected to any navigation path. Draw a connection first.');
            return;
        }
        
        const { nodes, adj } = buildNavGraph(floorPath, true);
        const result = dijkstra(nodes, adj, startId, endId);

        if (!result) {
            setPathError('No connected path found between the selected locations.');
            return;
        }
 
        const positions = result.nodeIds.map((id) => nodes[id]);

        let realDistanceM = 0;
        for (let i = 1; i < positions.length; i++) {
            realDistanceM += haversineM(positions[i - 1], positions[i]);
        }

        dispatch(setShortestPath({ positions, distanceM: realDistanceM }));
    };

    const clearPath = () => {
        dispatch(clearShortestPath());
        setPathError(null);
    };

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
                                    onClear={clearPath}
                                    pathResult={shortestPath}
                                    pathError={pathError}
                                    selTraversibleDetails={currentFormDetails}
                                    setSelTraversibleDetails={setCurrentFormDetails}
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