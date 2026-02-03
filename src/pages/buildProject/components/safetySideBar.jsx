import { Field, Formik } from 'formik';
import React, { useCallback, useState, useEffect } from 'react';
import { Button, Label, Row, Col, Spinner } from 'reactstrap';
import { BsArrowLeftShort } from 'react-icons/bs';
import { BiSolidPencil } from 'react-icons/bi';
import { FaInfo } from 'react-icons/fa';
import { IoMdClose, IoMdEye, IoIosInformationCircleOutline } from 'react-icons/io';
import DropdownWithIcons from '../IconDropdown';
import { postRequest, getRequest, deleteRequest } from '../../../hooks/axiosClient';
import { getCurrentUser } from '../../../helpers/utils';
import { SetBackEndErrorsAPi } from '../../../hooks/setBEerror';
import * as Yup from 'yup';
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ChangeSvgColorPassingBE } from '../CustomSvg';
import AutosaveForm from './AutoSaveForm';
import { FiSearch } from "react-icons/fi";
import { GoPlus } from "react-icons/go";
import ColorPicker from '../../../components/common/Colorpicker';
import { getSafetyIconDropDown } from '../Helpers/apis/getPins';
import { handleBlockEnter } from '../Helpers/constants/constant';
import { deletePinApi, removePinApi } from '../Helpers/apis/otherApis';
import { useDrag } from 'react-dnd';
import UndraggedDiv from '../Helpers/modal/UndraggedDiv';


const ValidationSchema = Yup.object().shape({
    // safety_name: Yup.string().required('This field is required.'),
    // icon: Yup.string().required('This field is required.'),
})

const SafetySideBar = ({
    id,
    floorID,
    setAddNew,
    addNew,
    selSafetyDtls,
    setSelSafetyDtls,
    projectSettings,
    selFloorPlanDtls,
    getSafetyList,
    setSafetyIcons,
    safetyIcons,
    onSideBarIconClick,
    activeTab,
    savingTimer, setSavingTimer,
    handleEnableDisable,
    setFloorID,
    getFloorPlanByid,
    safetyList,
    searchTerm,
    setSearchTerm,
    setCommonSidebarVisible,
    setIsDirty,
    isDirty,
    setPanTool,
    setStoredObjects,
    onEditSafety
}) => {

    const [mapDivSize, setMapDivSize] = useState(window.innerHeight - 70)
    const [backClick, setBackClick] = useState(false);
    const [color, setColor] = useState(null);
    const [openPicker, setOpenPicker] = useState(null);

    const [isHovered, setIsHovered] = useState(false);


    const handlePickerClick = (name) => {
        setOpenPicker(name);
    };

    const addSafetyClick = () => {
        setPanTool(false)
        if (floorID) {
            // setAddNew(true)
            document.getElementById("safetySubmitBtn")?.click();
        } else {
            toast.warning('Please select a floor plan to add a safety')
        }
    }

    const handleSafetySubmit = async (values, setFieldError) => {
        console.log(values)
        setSavingTimer(true)
        let value = {
            customer_id: projectSettings?.enc_customer_id ?? getCurrentUser()?.user?.common_id,
            project_id: id,
            // floor_plan_id: values?.enc_floor_plan_id ?? selFloorPlanDtls?.enc_id,
            floor_plan_id: values?.position === null ? null : (values?.enc_floor_plan_id ?? selFloorPlanDtls?.enc_id),
            safety_name: values?.safety_name ?? `! New safety`,
            icon_id: values?.icon_id ?? safetyIcons[0]?.enc_id ?? 4,
            safety_color: values?.safety_color ?? projectSettings?.safety_color,
            positions: values?.position
        }
        if (values?.enc_id) {
            value.id = values?.enc_id
            value.is_published = '0';
            value.discard = '1';
            value.publish = '1';
        }
        try {
            const reqUrl = `safety`
            const response = await postRequest(reqUrl, value);
            const data = response.response?.data ?? [];
            if (response.type === 1) {

                // onEditSafety(data)
                if (values?.enc_id && isDirty) {
                    setSelSafetyDtls((prev) => ({
                        ...prev,
                        ...values,
                        enc_id: data?.enc_id,
                        icon: values?.icon,
                        icon_id: values?.icon,
                        icon_path: safetyIcons?.find(item => item.enc_id == values?.icon)?.path
                    }));
                } else {
                    setSelSafetyDtls()
                }
                getSafetyList(floorID)
                handleEnableDisable();
                setIsDirty(false);
                setTimeout(() => {
                    setSavingTimer(false)
                }, 1000);
                if (backClick) {
                    // setSavingTimer(false)
                    onSideBarIconClick(activeTab);
                    setBackClick(false)
                }
            } else {
                setSavingTimer(false)
                SetBackEndErrorsAPi(response, setFieldError);
            }
        } catch (error) {
            setSavingTimer(false)
            console.log(error);
        }
    }

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };
    useEffect(() => {
        getSafetyIconDropDown(0, setSafetyIcons)
    }, [!selSafetyDtls && !selSafetyDtls?.enc_id])

    const filteredData = safetyList.filter((val) => {
        const {
            safety_name = '',
            floor_plan = '',
            search_name
        } = val;
        if (searchTerm === '') {
            return val;
        }
        return (
            safety_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            floor_plan?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            search_name?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    });

    const removeSafety = (row, index, canDrag) => {
        const buttons = {
            cancel: {
                text: "Cancel",
                value: "No",
                visible: true,
                className: "btn-danger",
                closeModal: true,
            },

            confirm: {
                text: "Delete",
                value: "Yes",
                visible: true,
                className: "btn-red",
                closeModal: true,
            },
        }
        // Conditionally add 'remove' button if canDrag is true
        if (!canDrag) {
            buttons.remove = {
                text: "Remove From Floor Plan",
                value: "Remove",
                visible: true,
                className: "btn-danger",
                closeModal: true,
            };
        }
        // Adjust the buttons order if 'remove' exists
        const orderedButtons = !canDrag
            ? { cancel: buttons.cancel, remove: buttons.remove, confirm: buttons.confirm }
            : buttons;

        swal({
            title: "Are you sure you want to delete?",
            // text: "This action is permanent and cannot be undone.",
            icon: "warning",
            buttons: orderedButtons
        })
            .then((value) => {
                switch (value) {
                    case "Yes":
                        deletePinApi(`safety/${row?.enc_id}`, setFloorID, floorID, getSafetyList, handleEnableDisable)
                        setStoredObjects((prev) => {
                            let updatedObjects = prev
                            updatedObjects.delete(`${row?.enc_id}_${row?.fp_id}`)
                            return updatedObjects
                        })
                        break;
                    case "Remove":
                        const para = {
                            type: 5,
                            id: row?.enc_id
                        }
                        removePinApi(`remove-pin`, para, setFloorID, floorID, getSafetyList, handleEnableDisable, projectSettings)
                        setStoredObjects((prev) => {
                            let updatedObjects = prev
                            updatedObjects.delete(`${row?.enc_id}_${row?.fp_id}`)
                            return updatedObjects
                        })
                        break;
                    default:
                        break;
                }
            });
    }

    const editClick = (item) => {
        setPanTool(false)
        if (item.position) {
            getFloorPlanByid(item?.fp_id, 'safety', "0", "default", item);
        } else {
            onEditSafety(item)
        }
    }

    const SafetyItems = ({ item, index, }) => {
        const id = item.enc_id;
        const canDrag = (item?.position === null)
        const [{ isDragging }, drag, preview] = useDrag({
            type: 'SafetyPin',
            item: () => {
                return { index, id, item };
            },
            canDrag: () => {
                // Block dragging if the position is not (0, 0)
                return canDrag && floorID;
            },
            collect: (monitor) => ({
                isDragging: monitor.isDragging(),
            }),
        });
        return (
            <div className='drag-wrpr mxx-3'  >
                <div className={`drag-item ${canDrag && 'can-drag'}`} >
                    <div className='magical-words' ref={drag}>
                        <div dangerouslySetInnerHTML={{ __html: ChangeSvgColorPassingBE(item?.path, item?.safety_color ?? projectSettings?.safety_color) }} />
                        <div>
                            {/* <p>{item?.safety_name} ({item?.floor_plan})</p> */}
                            <p>{item.safety_name} {item?.floor_plan && ` (${item?.floor_plan})`}</p>
                        </div>
                    </div>
                    <div className='flex-grow-1' />
                    {canDrag &&
                        <>
                            <UndraggedDiv pinName={'safety'} />
                        </>
                    }
                    <div className='edit-square magical-words' onClick={() => editClick(item)}  >
                        <BiSolidPencil fontSize={15} />
                    </div>
                </div>
                <div className='ml-2 rounded-circle' onClick={() => removeSafety(item, index, canDrag)} style={{ backgroundColor: '#E5E5E5', cursor: 'pointer', marginBottom: '8px', padding: '4px' }} >
                    <IoMdClose fontSize={10} />

                </div>
            </div>
        )
    }

    const renderSAfetyItem = useCallback((item, index) => {
        return (
            <SafetyItems
                key={item.id}
                index={index}
                id={item.id}
                item={item}
            />
        )
    }, [])

    const goBack = () => {
        setSearchTerm('')
        if (addNew) {
            if (isDirty) {
                setBackClick(true)
                document.getElementById("safetySubmitBtn")?.click();
            } else {
                setAddNew(false)
                setSelSafetyDtls()
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
    }, []);
    const handleAutoSave = () => {
        setTimeout(() => {
            document.getElementById("safetySubmitBtn")?.click();
        }, 500);
    }

    const autoSaveOnChange = (e, values) => {
        if (values?.enc_id) {
            setSelSafetyDtls((prev) => ({ ...prev, icon_id: e?.enc_id, icon_path: e?.path, icon: e?.enc_id }));
            handleAutoSave();
        }
    }

    return (
        <div className="bar" id="inner-customizer2" style={{ position: 'relative', height: mapDivSize, paddingBottom: '20px' }} >
            <Row className='backRow'>
                <Col md={8}>
                    <h1>Safety  {addNew ? 'Pin Details' : 'Pins'}</h1>
                </Col>
                <Col md={4} >
                    <div className='backArrow float-right' style={savingTimer ? { pointerEvents: 'none', } : { opacity: '1' }} onClick={goBack}>
                        {savingTimer ?
                            <Spinner className='loader-style' /> :
                            <BsArrowLeftShort />
                        }
                    </div>
                </Col>
            </Row>
            <Formik
                initialValues={{
                    safety_name: '! New safety',
                    message: '',
                    enc_id: null,
                    position: null,
                    // icon: 4,
                    icon: safetyIcons[0]?.enc_id,
                    ...selSafetyDtls
                }}
                validationSchema={ValidationSchema}
                onSubmit={(values, setFieldError) => {
                    console.log(values, 'values')
                    handleSafetySubmit(values, setFieldError)
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
                        {(selSafetyDtls?.position && !selSafetyDtls?.enc_id) &&
                            <>
                                {/* {!selSafetyDtls?.enc_id && setIsDirty(true)} */}
                                <AutosaveForm handleSubmit={handleAutoSave} />
                            </>
                        }
                        <form
                            className="av-tooltip tooltip-label-bottom formGroups"
                            onSubmit={(e) => handleSubmit(e, setFieldError)}
                        >
                            {
                                addNew ?
                                    <div className='custom-scrollbar customScroll' style={{ height: mapDivSize }} >
                                        <div className='bar-sub'>
                                            {/* {(selSafetyDtls?.position?.x) ? ( */}
                                            <div>
                                                <div className='bar-sub-header' style={{ marginTop: 0 }} >
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
                                                            name="safety_name"
                                                            autoComplete="off"
                                                            value={values?.safety_name}
                                                            onChange={(e) => {
                                                                handleChange(e)
                                                                setSelSafetyDtls(prev => ({ ...prev, safety_name: e.target.value }))
                                                                setIsDirty(true);
                                                            }}
                                                        />
                                                        {errors.safety_name && touched.safety_name ? (
                                                            <div className="text-danger mt-1">
                                                                {errors.safety_name}
                                                            </div>
                                                        ) : null}
                                                    </div>

                                                    <div className="marginBottom">
                                                        <Label for="exampleName" className="form-labels">Icon</Label>
                                                        <DropdownWithIcons
                                                            name='icon'
                                                            options={safetyIcons}
                                                            selDtls={values}
                                                            setSelDtls={setSelSafetyDtls}
                                                            setFieldValue={setFieldValue}
                                                            vericalTransport={2}
                                                            autoSaveOnChange={autoSaveOnChange}
                                                            isDisabled={!values?.enc_id}
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
                                                    <p style={{ marginTop: 0 }} >Style</p>
                                                </div>
                                                <div className='pl-4 pr-4'>
                                                    <ColorPicker
                                                        label={'Pin Colour'}
                                                        value={values.safety_color ?? projectSettings?.safety_color ?? '#320101'}
                                                        name={'safety_color'}
                                                        onChange={(e) => {
                                                            setColor(e)

                                                        }}
                                                        setFieldValue={setFieldValue} isOpen={openPicker === 'safety_color'}
                                                        setOpenPicker={setOpenPicker} onClick={() => handlePickerClick('safety_color')}
                                                        color={color} setColor={setColor} setSelDtls={setSelSafetyDtls} values={values}
                                                        setIsDirty={setIsDirty}
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

                                                    {/* <Button
                                                            className="btn-primary bar-btn"
                                                            htmlType="submit"
                                                            type="primary"
                                                            size="medium"
                                                            id='safetySubmitBtn'
                                                            hidden
                                                        >
                                                            Submit
                                                        </Button> */}

                                                </div>
                                            </div>
                                            {/* ) : (
                                                <div className='click-map-alert'>
                                                    <div className='warning-pin-div'>
                                                        <div className="d-flex align-items-center justify-content-center mb-2">
                                                            <div className="info-cont">
                                                                <FaInfo />
                                                            </div>
                                                        </div>
                                                        <div className=" text-center  ">
                                                            <p className='label color-labels' >Click on the map to place your safety pin. Once you have placed the pin, you will be able to edit the pin details.</p>

                                                        </div>
                                                    </div>
                                                </div>
                                            )} */}
                                        </div>
                                    </div>
                                    :
                                    <>
                                        <div className='bar-sub-header' style={{ marginRight: '14px' }} >
                                            <p style={{ marginTop: 0 }} >Add New Safety Pin</p>
                                            <div className='plus-icon' onClick={() => addSafetyClick()}>
                                                <GoPlus />
                                            </div>
                                            {/* <AiFillPlusCircle size={19} style={{ cursor: 'pointer' }} color='#26A3DB'  /> */}
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


                                            {filteredData.filter(p => p?.floorId === selFloorPlanDtls?.id)?.map((plan, idx) => renderSAfetyItem(plan, idx))}
                                        </div>
                                    </>}
                            {/* <Label for="exampleEmail1" className="form-labels">Name</Label> */}
                            <Button
                                className="btn-primary bar-btn"
                                htmlType="submit"
                                type="primary"
                                size="medium"
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

export default SafetySideBar;

