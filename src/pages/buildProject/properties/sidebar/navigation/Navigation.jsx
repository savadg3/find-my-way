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

    const allPins     = useSelector((s) => s.api.allPins);
    const paths       = useSelector((s) => s.navigation.paths);
    const shortestPath = useSelector((s) => s.navigation.shortestPath);

    const [mapDivSize, setMapDivSize] = useState(window.innerHeight);
    const [options, setOptions]       = useState([]);
    const [pathError, setPathError]   = useState(null);
    const [currentFormDetails, setCurrentFormDetails] = useState({
        from: '',
        to:   '',
    });

    // Build the options list from all pins that have a position
    useEffect(() => {
        const flat = Object.values(allPins).flat();
        setOptions(flat.filter((pin) => !!pin?.positions));
    }, [allPins]);

    // Responsive height
    useEffect(() => {
        const handleResize = () => setMapDivSize(window.innerHeight);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Note: we intentionally do NOT clear shortestPath on unmount.
    // NavVisibility hides all nav layers when not on the nav page, so the
    // highlight is invisible anyway.  Clearing here was the bug — it wiped
    // Redux state whenever the component briefly unmounted, which made the
    // red highlight disappear whenever the user changed tools or drew paths.
    // The Clear button is the only explicit way to dismiss the highlight.

    const goBack = () => { navigate(-1); };

    // ── Find shortest path between two pins ───────────────────────────────────
    const findPath = () => {
        const fromPinId = currentFormDetails?.from_pin_id;
        const toPinId   = currentFormDetails?.to_pin_id;

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

        const startId = findPinNodeId(paths, fromPinId);
        const endId   = findPinNodeId(paths, toPinId);

        if (!startId) {
            setPathError('The "From" pin is not connected to any navigation path. Draw a connection first.');
            return;
        }
        if (!endId) {
            setPathError('The "To" pin is not connected to any navigation path. Draw a connection first.');
            return;
        }

        // prioritizeMain=true — sub-path edges carry a 1e9 m penalty so
        // Dijkstra always routes through the main-path network when possible,
        // only falling back to sub paths when there is no other connection.
        const { nodes, adj } = buildNavGraph(paths, true);
        const result = dijkstra(nodes, adj, startId, endId);

        if (!result) {
            setPathError('No connected path found between the selected locations.');
            return;
        }

        // Reconstruct [lng, lat] positions from node IDs.
        const positions = result.nodeIds.map((id) => nodes[id]);

        // Recompute true geographic distance by summing haversine between
        // consecutive waypoints.  Dijkstra's cost includes sub-path penalties
        // used for routing preference and must NOT be shown to the user.
        let realDistanceM = 0;
        for (let i = 1; i < positions.length; i++) {
            realDistanceM += haversineM(positions[i - 1], positions[i]);
        }

        dispatch(setShortestPath({ positions, distanceM: realDistanceM }));
    };

    // ── Clear the highlighted path ─────────────────────────────────────────────
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