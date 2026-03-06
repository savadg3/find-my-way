import React from 'react';
import { FaInfo } from 'react-icons/fa';
import { GoPlus } from 'react-icons/go';
import { Button, Label } from 'reactstrap';
import CustomDropdown2 from '../../../../../../components/common/CustomDropDown2';

const PATH_INSTRUCTION = 'Draw a path that connects along all walkable routes; Connect all the pins to the path to enable navigation.'; 

const FieldError = ({ error, touched }) =>
    error && touched ? <div className="text-danger mt-1">{error}</div> : null;

const normalizeOptions = (options) =>
    options.map((item) => ({
        pin_id: item?.enc_id,
        id:     item?.enc_id ?? item?.id,
        value:     item?.enc_id ?? item?.id,
        label:  item?.title,
    }));

const findOption = (options, e) =>{
    let item = e?.pin_id
        ? options.find((item) => item?.enc_id == e?.pin_id)
        : options.find((item) => item?.id == e?.id); 
    return item
} 

const InfoAlert = ({ message }) => (
    <div style={{ marginTop: '4rem' }}>
        <div className="warning-pin-div">
            <div className="d-flex align-items-center justify-content-center mb-2">
                <div className="info-cont">
                    <FaInfo />
                </div>
            </div>
            <div className="text-center">
                <p className="label color-labels">{message}</p>
            </div>
        </div>
    </div>
); 

const MultiPathControls = ({ selTraversibleDetails, setSelTraversibleDetails, handleNextPreviousClick, switchFloor, showPath, handleEndDirectionclick }) => {
    const currentLength = parseInt(localStorage.getItem('currentLength'));
    const pathLength    = localStorage.getItem('pathLength');
    const isAtEnd       = String(currentLength) === String(pathLength);

    const handlePrevious = () => { 
        if (currentLength !== 1) localStorage.setItem('currentLength', currentLength - 1);
        handleNextPreviousClick(selTraversibleDetails?.isNext, 'previous', selTraversibleDetails, switchFloor, showPath, setSelTraversibleDetails);
    };

    const handleNext = async () => { 
        if (!isAtEnd) localStorage.setItem('currentLength', currentLength + 1);
        handleNextPreviousClick(selTraversibleDetails?.isNext ?? 0, 'next', selTraversibleDetails, switchFloor, showPath, setSelTraversibleDetails);
    };

    const handleEnd = () => {
        localStorage.removeItem('pathLength');
        localStorage.removeItem('currentLength');
        localStorage.removeItem('shortestPath');
        handleEndDirectionclick();
    };

    return (
        <div className="d-flex float-right">
            {currentLength > 1 && (
                <Button
                    className="btn-primary bar-btn mt-1 mb-3 mr-3"
                    type="button"
                    size="medium"
                    onClick={handlePrevious}
                >
                    Previous
                </Button>
            )}

            {!isAtEnd ? (
                <Button
                    className="btn-primary bar-btn mt-1 mb-3"
                    type="button"
                    size="medium"
                    onClick={handleNext}
                >
                    Next
                </Button>
            ) : (
                <Button
                    className="btn-danger btn-danger-btn bar-btn mt-1 mb-3"
                    type="button"
                    size="medium"
                    onClick={handleEnd}
                >
                    End direction
                </Button>
            )}
        </div>
    );
};

// ── Format metres to a readable string ───────────────────────────────────────
const formatDistance = (metres) => {
    if (metres == null) return '';
    if (metres >= 1000) return `${(metres / 1000).toFixed(2)} km`;
    return `${Math.round(metres)} m`;
};

// ── Estimated walk time (average walking speed 5 km/h = 1.389 m/s) ───────────
const formatWalkTime = (metres) => {
    if (metres == null) return '';
    const totalSeconds = metres / 1.3889;
    const totalMinutes = Math.ceil(totalSeconds / 60);
    if (totalMinutes < 1) return '< 1 min';
    if (totalMinutes < 60) return `${totalMinutes} min`;
    const hours = Math.floor(totalMinutes / 60);
    const mins  = totalMinutes % 60;
    return mins > 0 ? `${hours} hr ${mins} min` : `${hours} hr`;
};

const NavigationTestForm = ({
    errors,
    touched,
    setFieldValue,
    options,
    selTraversibleDetails,
    setSelTraversibleDetails,
    findPath,
    onClear,
    pathResult,
    pathError,
    handleNextPreviousClick,
    switchFloor,
    showPath,
    handleEndDirectionclick,
}) => {
    const normalizedOptions = normalizeOptions(options);  

    const handleFromChange = (e) => {
        const found = findOption(options, e);
        setSelTraversibleDetails((prev) => ({
            ...prev,
            from:          `${found?.title}_${found?.enc_id}`,
            from_floor_id: found?.fp_id,
            from_pin_id:   found?.enc_id,
            is_miltiple:   false,
            isNext:        0,
        }));
    };

    const handleToChange = (e) => {
        const found = findOption(options, e);
        setSelTraversibleDetails((prev) => ({
            ...prev,
            to:          `${found?.title}_${found?.enc_id}`,
            to_floor_id: found?.fp_id,
            to_pin_id:   found?.enc_id,
            is_miltiple: false,
            isNext:      0,
        }));
    };

    return (
        <div>
            <div className="bar-sub-header" style={{ marginTop: 0 }}>
                <p style={{ marginTop: 0 }}>Navigation Path Test</p>
            </div>

            <div className="pl-4 pr-4">
                 
                <div className="marginBottom">
                    <Label className="form-labels">From</Label>
                    <CustomDropdown2
                        name="from"
                        id="from"
                        options={normalizedOptions}
                        setFieldValue={setFieldValue}
                        values={selTraversibleDetails}
                        setCustomerValues={{}}
                        selectValue={{}}
                        onChange={handleFromChange}
                    />
                    <FieldError error={errors.from} touched={touched.from} />
                </div>
 
                <div className="marginBottom">
                    <Label className="form-labels">To</Label>
                    <CustomDropdown2
                        name="to"
                        id="to"
                        options={normalizedOptions}
                        setFieldValue={setFieldValue}
                        values={selTraversibleDetails}
                        setCustomerValues={{}}
                        selectValue={{}}
                        onChange={handleToChange}
                    />
                    <FieldError error={errors.to} touched={touched.to} />
                </div>
 
                {!selTraversibleDetails?.is_miltiple ? (
                    <Button
                        className="btn-primary bar-btn float-right mt-1 mb-3"
                        type="button"
                        size="medium"
                        onClick={findPath}
                    >
                        Find
                    </Button>
                ) : (
                    <MultiPathControls
                        selTraversibleDetails={selTraversibleDetails}
                        setSelTraversibleDetails={setSelTraversibleDetails}
                        handleNextPreviousClick={handleNextPreviousClick}
                        switchFloor={switchFloor}
                        showPath={showPath}
                        handleEndDirectionclick={handleEndDirectionclick}
                    />
                )}

                {/* ── Shortest-path result ── */}
                {pathError && (
                    <div className="text-danger mt-2" style={{ clear: 'both', fontSize: '0.85rem' }}>
                        {pathError}
                    </div>
                )}
                {pathResult && !pathError && (
                    <div style={{ clear: 'both', marginTop: '0.75rem' }}>
                        <div
                            style={{
                                background:   '#e8f5e9',
                                border:       '1px solid #66bb6a',
                                borderRadius: 6,
                                padding:      '10px 12px',
                                fontSize:     '0.85rem',
                                color:        '#2e7d32',
                            }}
                        >
                            <div style={{ fontWeight: 600, marginBottom: 4 }}>Path found</div>
                            <div>📏 Distance: <strong>{formatDistance(pathResult.distanceM)}</strong></div>
                            <div>🚶 Est. walk time: <strong>{formatWalkTime(pathResult.distanceM)}</strong></div>
                        </div>
                        <Button
                            className="btn-danger bar-btn mt-2"
                            type="button"
                            size="sm"
                            style={{ width: '100%' }}
                            onClick={onClear}
                        >
                            Clear
                        </Button>
                    </div>
                )}
            </div>

            <InfoAlert message={PATH_INSTRUCTION} />
        </div>
    );
};

const NavigationFormFields = ({
    errors,
    touched,
    setFieldValue,

    options,
    selTraversibleDetails,
    setSelTraversibleDetails,

    findPath,
    onClear,
    pathResult,
    pathError,
    handleNextPreviousClick,
    switchFloor,
    showPath,
    handleEndDirectionclick,
}) => {

    return (
        <NavigationTestForm
            errors={errors}
            touched={touched}
            setFieldValue={setFieldValue}
            options={options}
            selTraversibleDetails={selTraversibleDetails}
            setSelTraversibleDetails={setSelTraversibleDetails}
            findPath={findPath}
            onClear={onClear}
            pathResult={pathResult}
            pathError={pathError}
            handleNextPreviousClick={handleNextPreviousClick}
            switchFloor={switchFloor}
            showPath={showPath}
            handleEndDirectionclick={handleEndDirectionclick}
        />
    );
};

export default NavigationFormFields;