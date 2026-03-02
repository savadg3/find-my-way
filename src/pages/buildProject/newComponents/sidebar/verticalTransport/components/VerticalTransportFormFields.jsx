import React from 'react';
import { Field, FieldArray } from 'formik';
import { GoPlus } from 'react-icons/go';
import { IoMdClose } from 'react-icons/io';
import { FaInfo } from 'react-icons/fa';
import { Input, Label } from 'reactstrap';
import Select from 'react-select';

import ColorPicker from '../../../../../../components/common/Colorpicker';
import { useSelector } from 'react-redux';
import DropdownWithIcons from '../../../../IconDropdown';
import { useDispatch } from 'react-redux';
import { setCurrentFloor } from '../../../../../../store/slices/projectItemSlice';
import { setIsConnectionEnabled } from '../../../../../../store/slices/verticalPlacementSlice';


const customStyles = {
    control: (provided) => ({
        ...provided,
        // width:'100%',
        height: '30px', // Adjust the height as needed
        minHeight: '30px',
        fontSize: '0.875rem', // Adjust the font size as needed
        borderRadius: '4px', // Optional: Add some border radius to make it look better
        borderColor: '#F5F6F7', // Optional: Customize the border color
    }),
    option: (provided) => ({
        ...provided,
        fontSize: '0.875rem', // Adjust the font size of the options
    }),
    singleValue: (provided) => ({
        ...provided,
        fontSize: '0.875rem', // Adjust the font size of the selected value
        position: 'absolute',
        top: '48%',
        transform: 'translateY(-50%)',
    }),
    indicatorSeparator: () => ({
        display: 'none', // Hide the default separator between value and arrow icon
    }),
    dropdownIndicator: (provided) => ({
        ...provided,
        padding: '4px', // Optional: Adjust the padding around the arrow icon
    }),
    valueContainer: (provided) => ({
        ...provided,
        padding: '1px 8px', // Adjust padding as needed
        fontSize: '0.875rem',
    }),
}; 

const MOVEMENT_DIRECTIONS = [
    { label: 'Up & Down', value: 'bidirectional' },
    { label: 'Only Up',   value: 'up'            },
    { label: 'Only Down', value: 'down'           },
]; 

const FieldError = ({ error, touched }) =>
    error && touched ? <div className="text-danger mt-1">{error}</div> : null;

const SectionHeader = ({ title, onAdd, style }) => (
    <div className="bar-sub-header" style={style}>
        <p style={{ marginTop: 0 }}>{title}</p>
        {onAdd && (
            <div className="plus-icon" onClick={onAdd}>
                <GoPlus />
            </div>
        )}
    </div>
);

const ConnectionPinItem = ({ index, values, floorList, customStyles, onLevelChange, onRemove }) => (
    <div className="drag-wrpr2 mb-2">
        <div style={{ width: '100%' }}>
            <Select
                value={values.connectionPins[index]}
                onChange={(selected) => onLevelChange(selected, index)}
                options={floorList.map((floor) => ({
                    value:  floor.enc_id,
                    label:  floor.floor_plan,
                    id:     floor.enc_id,
                    plan:   floor.plan,
                    dec_id: floor.dec_id,
                }))}
                isDisabled={!!values.connectionPins[index]?.value}
                styles={customStyles}
                name={`connectionPins[${index}]`}
            />
        </div>
        <div
            className="ml-2 rounded-circle"
            onClick={() => onRemove(index)}
            style={{ backgroundColor: '#E5E5E5', cursor: 'pointer', padding: 4 }}
        >
            <IoMdClose fontSize={10} />
        </div>
    </div>
);

const PlacePinAlert = () => (
    <div className="click-map-alert mb-2" style={{ height: 'auto' }}>
        <div className="warning-pin-div">
            <div className="d-flex align-items-center justify-content-center mb-2">
                <div className="info-cont">
                    <FaInfo />
                </div>
            </div>
            <div className="text-center">
                <p className="label color-labels">
                    Click on the map to place your vertical transport connection pin.
                    Place one pin per level to enable navigation between levels.
                </p>
            </div>
        </div>
    </div>
);
 
const VerticalTransportFormFields = ({ 
    values,
    errors,
    touched,
    handleChange,
    setFieldValue,
    verticalIcons, 
    projectSettings,
    color,
    setColor,
    openPicker,
    setOpenPicker,
    setselVerticalDtls,
    setIsDirty,
    addNewPins, 
    autoSaveOnChange,
    debouncedAutoSave,
}) => {
    const dispatch          = useDispatch()
    const handlePickerClick = (name) => setOpenPicker(name);
    const projectData       = useSelector((state) => state.api.projectData);  
    const currentFloor      = useSelector((s) => s.api.currentFloor);
    const floorList         = useSelector((s) => s.api.floorList);

    const filteredList = React.useMemo(() => {
        const usedIds = new Set(values.connectionPins.map(pin => pin.value));
        return floorList.filter(item => !usedIds.has(item.enc_id));
    }, [floorList, values.connectionPins]);
     

    const lastPin         = values.connectionPins?.[values.connectionPins.length - 1];
    // console.log(values.connectionPins,lastPin);
    const shouldShowAlert = (lastPin?.value && !lastPin?.position)

    const removePin = (index, data, setFieldValue) => {
        const updatedPins = [...data]; 
        updatedPins.splice(index, 1); 
        setFieldValue(`connectionPins`, updatedPins);
        setselVerticalDtls(prev => ({ ...prev, connectionPins: updatedPins }))

        if (updatedPins?.length > 0) {
            const lastselFloor = updatedPins[updatedPins?.length - 1] 
            dispatch(setCurrentFloor(currentFloor ?? lastselFloor))
        }

        if (values?.enc_id) { 
            console.log("auto save");
        }
    };

    return (
        <div>
             
            <SectionHeader title="Details" style={{ marginTop: 0 }} />

            <div className="pl-4 pr-4"> 
                <div className="marginBottom">
                    <Label className="form-labels">Name</Label>
                    <Field
                        className="form-control"
                        type="text"
                        placeholder="Please Type"
                        name="vt_name"
                        autoComplete="off"
                        value={values.vt_name ?? ''}
                        onChange={(e) => {
                            setFieldValue('vt_name', e.target.value);
                            setselVerticalDtls((prev) => ({ ...prev, vt_name: e.target.value }));
                            setIsDirty(true);
                        }}
                    />
                    <FieldError error={errors.vt_name} touched={touched.vt_name} />
                </div>
 
                <div className="marginBottom">
                    <Label className="form-labels">Transport Type</Label>
                    <DropdownWithIcons
                        name="icon"
                        options={verticalIcons}
                        selDtls={values}
                        setSelDtls={setselVerticalDtls}
                        setFieldValue={setFieldValue}
                        vericalTransport={1}
                        autoSaveOnChange={autoSaveOnChange}
                        setIsDirty={setIsDirty}
                    />
                    <FieldError error={errors.icon} touched={touched.icon} />
                </div>
            </div> 

            <SectionHeader title="Accessibility" />

            <div className="pl-4 pr-4">
                {/* Wheelchair */}
                <div className="row mt-2">
                    <div className="col-sm-10">
                        <Label className="bar-sub-hearedr-label" style={{ marginBottom: 0 }}>
                            Wheelchair Accessible
                        </Label>
                    </div>
                    <div className="col-sm-2">
                        <Input
                            type="checkbox"
                            name="is_wheelchair"
                            checked={values.is_wheelchair ?? false}
                            className="float-right"
                            style={{ cursor: 'pointer' }}
                            onChange={(e) => {
                                handleChange(e);
                                setIsDirty(true);
                                setselVerticalDtls((prev) => ({ ...prev, is_wheelchair: e.target.checked }));
                            }}
                        />
                    </div>
                </div>

                {/* Transport Direction */}
                <div className="row mt-2">
                    <div className="col-sm-8">
                        <Label className="bar-sub-hearedr-label" style={{ marginBottom: 0 }}>
                            Transport Direction
                        </Label>
                    </div>
                    <div className="col-sm-4">
                        {MOVEMENT_DIRECTIONS.map((item) => (
                            <div key={item.value} className="movementDirection">
                                <Label htmlFor={item.value} className="radio-label" style={{ marginBottom: 0 }}>
                                    {item.label}
                                </Label>
                                <div className="custom-radio">
                                    <input
                                        type="radio"
                                        className="float-right"
                                        id={item.value}
                                        name="movementDirection"
                                        value={item.value}
                                        checked={values.movement_direction === item.value}
                                        onChange={(e) => {
                                            handleChange(e);
                                            setIsDirty(true);
                                            setselVerticalDtls((prev) => ({
                                                ...prev,
                                                movement_direction: e.target.value,
                                            }));
                                        }}
                                    />
                                    <span className="custom-radio-button" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
 
            {values.icon && values.vt_name && (
                <>
                    <SectionHeader
                        title="Level Connection Pins"
                        onAdd={() => addNewPins(setFieldValue, values)}
                    />
                    <div className="pl-4 pr-4">
                        <FieldArray name="connectionPins">
                            {() => (
                                <div>
                                    {values.connectionPins?.map((_, index) => (
                                        <ConnectionPinItem
                                            key={index}
                                            index={index}
                                            values={values}
                                            floorList={filteredList}
                                            customStyles={customStyles}
                                            onLevelChange={(selected) => { 
                                                let selectedFloor = filteredList.find(item => item?.enc_id == selected?.value)
                                                dispatch(setCurrentFloor(selectedFloor))
                                                dispatch(setIsConnectionEnabled(true))

                                                setselVerticalDtls((prev) => { 
                                                    
                                                    return {
                                                        ...prev,
                                                        vt_name: values?.vt_name,
                                                        icon: values?.icon,
                                                        icon_path: values?.icon_path,
                                                        connectionPins: Array.isArray(prev?.connectionPins)
                                                            ? [
                                                                ...prev.connectionPins,
                                                                { value: selected?.value, label: selected?.label, position: null }
                                                            ]
                                                            : [{ value: selected?.value, label: selected?.label, position: null }]
                                                    }
                                                });
                                            }}
                                            onRemove={() => 
                                                removePin(index, values.connectionPins, setFieldValue)
                                            }
                                        />
                                    ))}
                                </div>
                            )}
                        </FieldArray>
                    </div>
                </>
            )}
 
            <SectionHeader title="Style" />

            <div className="pl-4 pr-4">
                <ColorPicker
                    label="Pin Colour"
                    name="vt_color"
                    value={values.vt_color ?? projectSettings?.level_change_color ?? '#374046'}
                    onChange={setColor}
                    setFieldValue={setFieldValue}
                    isOpen={openPicker === 'vt_color'}
                    setOpenPicker={setOpenPicker}
                    onClick={() => handlePickerClick('vt_color')}
                    color={color}
                    setColor={setColor}
                    setSelDtls={setselVerticalDtls}
                    values={values}
                    setIsDirty={setIsDirty}
                    debouncedAutoSave={debouncedAutoSave}
                />
            </div>
 
            {shouldShowAlert && <PlacePinAlert />}
        </div>
    );
};

export default VerticalTransportFormFields;