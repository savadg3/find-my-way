import { Field, Formik, FieldArray } from 'formik'
import React, { useCallback, useRef, useState, useEffect } from 'react'
import { Button, Label, Row, Col, Input } from 'reactstrap'
import { BsArrowLeftShort } from 'react-icons/bs';
import { BiSolidPencil } from 'react-icons/bi'
import { IoMdClose } from 'react-icons/io';
import { FaInfo } from 'react-icons/fa';
import DropdownWithIcons from '../IconDropdown'
import { ChangeSvgColorPassingBE } from '../CustomSvg';
import { postRequest, getRequest, deleteRequest } from '../../../hooks/axiosClient';
import { getCurrentUser } from '../../../helpers/utils';
import { SetBackEndErrorsAPi } from '../../../hooks/setBEerror';
import * as Yup from 'yup';
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Select from 'react-select';
import debounce from 'lodash/debounce';
import { FiSearch } from "react-icons/fi";
import { GoPlus } from "react-icons/go";
import ColorPicker from '../../../components/common/Colorpicker';
import { getVerticalTransportIconDropDown } from '../Helpers/apis/getPins';
import { handleBlockEnter } from '../Helpers/constants/constant';


const ValidationSchema = Yup.object().shape({
    vt_name: Yup.string().required('This field is required.'),
    icon: Yup.string().required('This field is required.'),
    // connectionPins: Yup.array()
    //     .of(Yup.string())

})

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

const VerticalTransportSideBar = ({
    id,
    floorID,
    setAddNew,
    addNew,
    selVerticalDtls,
    setselVerticalDtls,
    projectSettings,
    verticalTransportlist,
    getVerticalTransportList,
    onEditVerticaltransport,
    onSideBarIconClick,
    activeTab,
    setVerticalFloorId,
    verticalFloorId,
    verticalIcons,
    setVerticalIcons,
    getFloorPlanByid,
    setSavingTimer,
    handleEnableDisable,
    searchTerm,
    setSearchTerm,
    setCommonSidebarVisible,
    setIsDirty,
    isDirty,
    setPanTool,
    setFloorID,
    selFloorPlanDtls,
    setSelFloorPlanDtls,
    setStoredObjects

}) => {
    const [mapDivSize, setMapDivSize] = useState(window.innerHeight - 70);
    const [addNewPin, setAddNewPin] = useState(false)
    const [floorPlanSelect, setFloorPlanSelect] = useState([]);
    const [backClick, setBackClick] = useState(false);
    const [color, setColor] = useState(null);
    const [openPicker, setOpenPicker] = useState(null);

    const handlePickerClick = (name) => {
        setOpenPicker(name);
    };

    useEffect(() => {
        getVerticalTransportIconDropDown(0, setVerticalIcons)
    }, [!selVerticalDtls && !selVerticalDtls?.enc_id]);

    const addBeaconClick = () => {
        setPanTool(false)
        setAddNew(true)
        setselVerticalDtls();
    }

    const handleVerticalSubmit = async (values, setFieldError) => {
        console.log(values,"valuess")
        setSavingTimer(true)
        let value = {
            id: values?.enc_id ?? 0,
            customer_id: projectSettings?.enc_customer_id ?? getCurrentUser()?.user?.common_id,
            project_id: id,
            // floor_plan_id: floorID,
            vt_name: values?.vt_name,
            icon_id: values?.icon,
            is_wheelchair: values?.is_wheelchair ? 1 : 0,
            movement_direction:values.movement_direction,
            vt_color: values?.vt_color ?? projectSettings?.level_change_color,
            // positions: values?.position,
        }
        if (values?.enc_id) {
            value.id = values?.enc_id,
            value.icon_id = values?.icon_id
            value.is_published = '0';
            value.discard = '1';
            value.publish = '1';

        } if (values?.connectionPins) {
            value.connection_pins = (values?.connectionPins || [''])
                .filter((item) => item.position) // Filter items with defined position
                .map((item, index) => ({
                    id: item.id ?? 0,
                    floor_plan_id: item.value,
                    positions: item.position
                }));
        }
        try {
            const reqUrl = `vertical-transport`
            const response = await postRequest(reqUrl, value);
            const data = response.response?.data ?? [];
            console.log(data, 'data')
            if (response.type === 1) {
                onEditVerticaltransport(data, backClick)
                if (!backClick) {
                    console.log('here')
                    setselVerticalDtls((prev) => ({ ...prev, enc_id: data?.enc_id }))
                }
                getFloorPlanByid(verticalFloorId ?? floorID, activeTab, '1', 'default');
                getVerticalTransportList(id)
                handleEnableDisable();
                setIsDirty(false)
                setTimeout(() => {
                    setSavingTimer(false)
                }, 1000);

                if (backClick) {
                    setVerticalFloorId()
                    onSideBarIconClick('verticalTransport', 1)
                    setBackClick(false)
                    setselVerticalDtls()
                }

            } else {
                setSavingTimer(false)

                SetBackEndErrorsAPi(response, setFieldError);
            }
        } catch (error) {
            setSavingTimer(false)

            console.log(error);
        } finally {
            setPanTool(false)
        }
    }

    const addNewPins = (setFieldValue, values) => {
        const lastAddedPin = values?.connectionPins[values?.connectionPins.length - 1]
        console.log(lastAddedPin)
        if (values?.connectionPins.length > 0) {
            if (lastAddedPin?.value && lastAddedPin?.position) {
                setFieldValue(`connectionPins[${values?.connectionPins.length}]`, '')
            } else {
                toast.warning('Please place your connection pin on the floor plan.');
            }
        } else {
            setFieldValue(`connectionPins[${values?.connectionPins.length}]`, '')
        }

    };

    const removePin = (index, data, setFieldValue) => {
        const updatedPins = [...data]; // Create a copy of the array
        updatedPins.splice(index, 1); // Remove the item at the specified index
        setFieldValue(`connectionPins`, updatedPins);
        setselVerticalDtls(prev => ({ ...prev, connectionPins: updatedPins }))

        if (updatedPins?.length > 0) {
            const lastselFloor = updatedPins[updatedPins?.length - 1]?.value
            setFloorID(selFloorPlanDtls?.enc_id ?? lastselFloor)
        }
        setTimeout(() => {
            setVerticalFloorId(null)
        }, 500);
        if (selVerticalDtls?.enc_id) {
            handleAutoSave()
        }
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const filteredData = verticalTransportlist.filter((val) => {
        const {
            vt_name = '',

        } = val;
        if (searchTerm === '') {
            return val;
        }
        return (
            vt_name?.toLowerCase().includes(searchTerm.toLowerCase())

        );
    });

    const deleteVertical = async (id) => {
        try {
            let floorsitems;
            setSelFloorPlanDtls((prev) => {
                floorsitems = prev;
                return prev
            })
            // console.log(floorsitems,"row")
            let item = floorsitems?.vertical_transports.find((vts) => (vts.vertical_transport_id == id))
            // console.log(item,id,`${item?.enc_id}_${floorID}`)
            const response = await deleteRequest(`vertical-transport/${id}`);
            const data = response.data ?? [];
            toast.success(data?.message);
            getVerticalTransportList(projectSettings?.enc_id);
            getFloorPlanByid(floorID, 'verticalTransport', '0', 'default');
            handleEnableDisable();
            
            setStoredObjects((prev) => {
                let updatedObjects = prev
                updatedObjects.delete(`${item?.enc_id}_${floorID}`)
                return updatedObjects
            })
        } catch (error) {
            console.log(error);
        }
    }

    const removeBeacon = (row, index) => {
        swal({
            title: "Are you sure you want to delete?",
            text: "This action is permanent and cannot be undone.",
            icon: "warning",
            buttons: [
                {
                    text: "No",
                    value: "No",
                    visible: true,
                    className: "btn-danger",
                    closeModal: true,
                },
                {
                    text: "Yes",
                    value: "Yes",
                    visible: true,
                    className: "btn-success",
                    closeModal: true,
                },
            ],
        })
            .then((value) => {
                switch (value) {
                    case "Yes":
                        deleteVertical(row?.enc_id,row)
                        break;
                    default:
                        break;
                }
            });
    }

    const TransportItems = ({ item, index, }) => {

        return (
            <div className='drag-wrpr mxx-3'  >
                <div className='drag-item' >
                    <div dangerouslySetInnerHTML={{ __html: item?.path ? ChangeSvgColorPassingBE(item?.path, item?.vt_color ?? projectSettings?.level_change_color) : null }} />
                    {/* <BeaconSvg color={item?.level_change_color ?? projectSettings?.level_change_color ?? "#6A6D73"} /> */}
                    <div>
                        <p>{item?.vt_name}</p>
                    </div>
                    <div className='flex-grow-1' />
                    <div className=' edit-square magical-words' onClick={() => { onEditVerticaltransport(item); setPanTool(false); }}  >
                        <BiSolidPencil fontSize={15} />
                    </div>
                </div>
                <div className='ml-2  rounded-circle' onClick={() => removeBeacon(item, index)} style={{ backgroundColor: '#E5E5E5', cursor: 'pointer', marginBottom: '8px', padding: '4px' }} >
                    <IoMdClose fontSize={10} />

                </div>
            </div>
        )
    }

    const renderTransportItem = useCallback((item, index) => {
        return (
            <TransportItems
                index={index}
                item={item}
            />
        )
    }, [])

    const getFloorDropdown = async () => {
        try {
            const response = await getRequest(`dropdown-floor-plan/${id}`);
            const data = response.data ?? [];
            const filteredData = data
                .filter((item) => {
                    return !selVerticalDtls?.connectionPins.some((pin) => pin.value == item.enc_id);
                });
            setFloorPlanSelect(filteredData);
            // localStorage.removeItem("shortestPath")
        } catch (error) {
            //console.log(error);
        }
    };

    const onLevelDDChange = (selected, index, setFieldValue, values) => {
        // console.log(values, 'select')
        setFieldValue(`connectionPins[${index}]`, selected);
        setselVerticalDtls((prev) => ({
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
        }));

        setTimeout(() => {
            setVerticalFloorId(selected?.value)
            setFloorID(selected?.value)
        }, 100);
    };

    useEffect(() => {
        getFloorDropdown();
    }, [addNew, selVerticalDtls]);

    const goBack = () => {
        setSearchTerm('')

        if (addNew) {
            if (selVerticalDtls?.enc_id && isDirty) {
                setAddNew(false);
                setAddNewPin(false);
                setBackClick(true)
                document.getElementById("transportSubmitBtn")?.click();
            } else {
                setAddNew(false)
                setVerticalFloorId()
                setselVerticalDtls()
                getFloorPlanByid(floorID, 'verticalTransport', '0', 'default');
            }
        } else {
            setCommonSidebarVisible(true)

        }

    }
    const handleResize = () => {
        const { clientHeight } = window.document.getElementById('pageDiv')
        setMapDivSize(window.innerHeight - 70)
    }
    useEffect(() => {

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [])

    const handleAutoSave = () => {
        let selVerticalDtlsVar
        setselVerticalDtls(prev => {
            selVerticalDtlsVar = prev
            return prev
        })
        const verTicalDetails = selVerticalDtlsVar ?? selVerticalDtls
        const lastConnection = verTicalDetails?.connectionPins[verTicalDetails?.connectionPins.length - 1]
        if ((lastConnection?.value) && (lastConnection?.position)) {
            setTimeout(() => {
                document.getElementById("transportSubmitBtn")?.click();
            }, 1000);
        }

    }
    const [debouncedAutoSave] = useState(() => debounce(handleAutoSave, 500));

    const autoSaveOnChange = (e, values) => {
        if (values?.enc_id) {
            setselVerticalDtls((prev) => ({ ...prev, icon_id: e?.enc_id, icon_path: e?.path, icon: e?.enc_id }));
            handleAutoSave();
        }
    }

    return (
        <div className="bar" id="inner-customizer2" style={{ position: 'relative', height: mapDivSize, paddingBottom: '20px' }} >
            <Row className='backRow'>
                <Col md={10}>
                    <h1>Vertical Transport  {addNew && 'Details'}</h1>

                </Col>
                {/* {addNew && ( */}
                <Col md={2} >
                    <div className='backArrow float-right' onClick={goBack}>
                        <BsArrowLeftShort />
                    </div>
                </Col>
                {/* )} */}
            </Row>
            <Formik
                initialValues={{
                    vt_name: 'New vertical transport',
                    message: '',
                    // icon: 7,
                    icon: verticalIcons[0]?.enc_id,
                    is_wheelchair: false,
                    movement_direction: "bidirectional",
                    connectionPins: [''],
                    ...selVerticalDtls
                }}
                validationSchema={ValidationSchema}
                onSubmit={(values, setFieldError) => {
                    handleVerticalSubmit(values, setFieldError)
                }}
                enableReinitialize
            >
                {({
                    errors,
                    values,
                    touched,
                    handleSubmit,
                    handleChange,
                    setFieldValue,
                    setFieldError
                }) => (
                    <>
                        <form
                            className="av-tooltip tooltip-label-bottom formGroups"
                            onSubmit={(e) => handleSubmit(e, setFieldError)}
                        >
                            {
                                addNew ?
                                    <div className='custom-scrollbar customScroll' style={{ height: mapDivSize }} >
                                        <div className='bar-sub'>
                                            <div>
                                                <div className='bar-sub-header' style={{ marginTop: 0 }}>
                                                    <p style={{ marginTop: 0 }} >Details</p>
                                                </div>
                                                <div className='pl-4 pr-4'>
                                                    <div className="marginBottom">
                                                        <Label for="exampleName" className="form-labels">Name</Label>
                                                        <Field
                                                            id="exampleName"
                                                            className="form-control"
                                                            type="text"
                                                            placeholder="Please Type"
                                                            name="vt_name"
                                                            autoComplete="off"
                                                            value={values?.vt_name}
                                                            onChange={(e) => {
                                                                setFieldValue('vt_name', e.target.value)
                                                                setselVerticalDtls(prev => ({ ...prev, vt_name: e.target.value }));
                                                                setIsDirty(true)
                                                            }}
                                                        />
                                                        {errors.vt_name && touched.vt_name ? (
                                                            <div className="text-danger mt-1">
                                                                {errors.vt_name}
                                                            </div>
                                                        ) : null}
                                                    </div>
                                                    <div className="marginBottom">
                                                        <Label for="exampleName" className="form-labels">Transport Type</Label>
                                                        <DropdownWithIcons
                                                            name='icon'
                                                            options={verticalIcons}
                                                            selDtls={values}
                                                            setSelDtls={setselVerticalDtls}
                                                            setFieldValue={setFieldValue}
                                                            vericalTransport={1}
                                                            autoSaveOnChange={autoSaveOnChange}
                                                            setIsDirty={setIsDirty}
                                                        />
                                                        {errors.icon && touched.icon ? (
                                                            <div className="text-danger mt-1">
                                                                {errors.icon}
                                                            </div>
                                                        ) : null}
                                                    </div>
                                                </div>
                                                <div className='bar-sub-header' >
                                                    <p style={{ marginTop: 0 }} >Accessibility</p>
                                                </div>
                                                <div className='pl-4 pr-4'>
                                                    <div className='row mt-2'>
                                                        <div className='col-sm-10'>
                                                            <Label for="exampleName" className="bar-sub-hearedr-label" style={{ marginBottom: '0px' }}>Wheelchair Accessibile </Label>
                                                        </div>
                                                        <div className='col-sm-2'>
                                                            <Input type="checkbox"
                                                                name='is_wheelchair'
                                                                checked={values?.is_wheelchair}
                                                                className='float-right'
                                                                style={{ cursor: 'pointer' }}
                                                                onChange={(e) => {
                                                                    handleChange(e);
                                                                    setIsDirty(true)
                                                                    setselVerticalDtls(prev => ({ ...prev, is_wheelchair: e.target.checked }));
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className='pl-4 pr-4'>
                                                    <div className='row mt-2'>
                                                        <div className='col-sm-8'>
                                                            <Label for="exampleName" className="bar-sub-hearedr-label" style={{ marginBottom: '0px' }}>Transport Direction </Label>
                                                        </div>
                                                        <div className='col-sm-4'>
                                                            {/* <Input type="checkbox"
                                                                name='is_wheelchair'
                                                                checked={values?.is_wheelchair}
                                                                className='float-right'
                                                                style={{ cursor: 'pointer' }}
                                                                onChange={(e) => {
                                                                    handleChange(e);
                                                                    setIsDirty(true)
                                                                    setselVerticalDtls(prev => ({ ...prev, is_wheelchair: e.target.checked }));
                                                                }}
                                                            /> */}
                                                                {
                                                                    [
                                                                        {
                                                                            name: "Up & Down",
                                                                            value:"bidirectional"
                                                                        },
                                                                        {
                                                                            name: "Only Up",
                                                                            value:"up"
                                                                        },
                                                                        {
                                                                            name: "Only Down",
                                                                            value:"down"
                                                                        }
                                                                    ].map((item) => (
                                                                        <div className='movementDirection'>
                                                                            <Label for={item.value} className="radio-label" style={{ marginBottom: '0px' }}>{item.name}</Label>
                                                                            <div className='custom-radio'>
                                                                                <input type="radio" className='float-right' id={item.value} name="movementDirection" value={item.value} checked={values?.movement_direction === item.value}
                                                                                    onChange={(e) => {
                                                                                        handleChange(e);
                                                                                        setIsDirty(true)
                                                                                        setselVerticalDtls(prev => ({ ...prev, movement_direction: e.target.value }));
                                                                                    }}
                                                                                />
                                                                                <span className='custom-radio-button'></span>
                                                                            </div>   
                                                                        </div>
                                                                    ))
                                                                }
                                                            
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                {values?.icon && values?.vt_name && (
                                                    <div >
                                                        <div className='bar-sub-header' >
                                                            <p style={{ marginTop: 0 }} >Level Connection Pins </p>
                                                            <div className='plus-icon' onClick={() => addNewPins(setFieldValue, values)}>
                                                                <GoPlus />
                                                            </div>
                                                        </div>
                                                        <div className='pl-4 pr-4'>
                                                            <FieldArray name="connectionPins">
                                                                {({ remove }) => (
                                                                    <div >
                                                                        {values.connectionPins?.map((pin, index) => (

                                                                            <div key={index} className="drag-wrpr2 mb-2">
                                                                                <div style={{ width: '100%' }}>
                                                                                    <Select
                                                                                        value={values.connectionPins[index]}
                                                                                        onChange={(selected) => onLevelDDChange(selected, index, setFieldValue, values)}
                                                                                        options={floorPlanSelect.map((floor) => ({
                                                                                            value: floor.enc_id,
                                                                                            label: floor?.floor_plan,
                                                                                            id: floor.enc_id,
                                                                                            plan: floor.plan,
                                                                                            dec_id: floor?.dec_id
                                                                                        }))}
                                                                                        isDisabled={values.connectionPins[index]?.value}
                                                                                        styles={customStyles}
                                                                                        name={`connectionPins[${index}]`}
                                                                                    />
                                                                                </div>
                                                                                <div className='ml-2  rounded-circle' onClick={() => removePin(index, values.connectionPins, setFieldValue)} style={{ backgroundColor: '#E5E5E5', cursor: 'pointer', padding: '4px' }} >
                                                                                    <IoMdClose fontSize={10} />
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </FieldArray>
                                                        </div>
                                                    </div>
                                                )}
                                                <div className='bar-sub-header' >
                                                    <p style={{ marginTop: 0 }} >Style</p>
                                                </div>
                                                <div className='pl-4 pr-4'>
                                                    <ColorPicker
                                                        label={'Pin Colour'}
                                                        value={values.vt_color ?? projectSettings?.level_change_color ?? '#374046'}
                                                        name={'vt_color'}
                                                        onChange={(e) => {
                                                            setColor(e);
                                                        }}
                                                        setFieldValue={setFieldValue} isOpen={openPicker === 'vt_color'}
                                                        setOpenPicker={setOpenPicker} onClick={() => handlePickerClick('vt_color')}
                                                        color={color} setColor={setColor} setSelDtls={setselVerticalDtls} values={values} setIsDirty={setIsDirty}
                                                        debouncedAutoSave={debouncedAutoSave}
                                                    />
                                                </div>
                                                <div className='btn-wrpr' >
                                                    <Button
                                                        className="btnCancel "
                                                        type="button"
                                                        size="medium"
                                                        hidden
                                                        onClick={() => { setAddNew(false) }}
                                                    >
                                                        Cancel
                                                    </Button>

                                                    <Button
                                                        className="btn-primary bar-btn"
                                                        htmlType="submit"
                                                        type="primary"
                                                        size="medium"
                                                        id='transportSubmitBtn'
                                                        hidden
                                                    >
                                                        Submit
                                                    </Button>
                                                </div>
                                            </div>
                                            {!(values?.connectionPins[values?.connectionPins.length - 1]?.value) || !(values?.connectionPins[values?.connectionPins.length - 1]?.position) && (
                                                <div className='click-map-alert mb-2' style={{ height: 'auto' }}>
                                                    <div className='warning-pin-div'>
                                                        <div className="d-flex align-items-center justify-content-center mb-2">
                                                            <div className="info-cont">
                                                                <FaInfo />
                                                            </div>
                                                        </div>
                                                        <div cla ssName=" text-center  ">
                                                            <p className='label color-labels' >Click on the map to place your vertical transport connection pin. Place one pin per level to enable navigation between levels.</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    :
                                    <>
                                        <div className='bar-sub-header' style={{ marginRight: '14px' }}>
                                            <p style={{ marginTop: 0 }} >Add New Vertical Transport </p>
                                            <div className='plus-icon' onClick={() => addBeaconClick()}>
                                                <GoPlus />
                                            </div>
                                        </div>
                                        <div className="d-flex bar-search mb-2">
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="Search..."
                                                value={searchTerm}
                                                onChange={(e) => handleSearch(e)}
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
                                        <div className='custom-scrollbar customScroll' style={{ height: mapDivSize - 90 }} >
                                            {filteredData?.map((plan, idx) => renderTransportItem(plan, idx))}

                                        </div>
                                    </>
                            }
                            {/* <Label for="exampleEmail1" className="form-labels">Name</Label> */}
                        </form>
                    </>
                )}
            </Formik>
        </div>
    )
}

export default VerticalTransportSideBar;

