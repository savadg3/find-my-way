import { Field, Formik } from 'formik'
import React, { useCallback, useState, useEffect } from 'react'
import { Button, Label, Row, Col, Modal, ModalBody, ModalHeader, Card, CardBody, Table, Spinner } from 'reactstrap'
import { BsArrowLeftShort } from 'react-icons/bs';
import { BiSolidPencil } from 'react-icons/bi'
import { FaInfo } from 'react-icons/fa';
import { IoMdClose } from 'react-icons/io'
import { BeaconSvg } from "../CustomSvg";
import { postRequest, getRequest, deleteRequest, getRequestForDownload } from '../../../hooks/axiosClient';
import { decode, encode, getCurrentUser } from '../../../helpers/utils';
import { SetBackEndErrorsAPi } from '../../../hooks/setBEerror';
import * as Yup from 'yup';
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AutosaveForm from './AutoSaveForm';
import TextEditor from '../../../components/text-editor/TextEditor';
import { FiSearch } from "react-icons/fi";
import PaymentForm from '../../../components/stripe/payment';
import { GoPlus } from "react-icons/go";
import ColorPicker from '../../../components/common/Colorpicker';
import { PlanExpiryDetails, deletePinApi, removePinApi, revertPackage } from '../Helpers/apis/otherApis';
import { additionalSvg, handleBlockEnter, proSvg } from '../Helpers/constants/constant';
import { GenerateQrModal,  ProPinModal } from '../Helpers/modal/proPinModal';
import { useDrag } from 'react-dnd';
import { removeFabricObjectsEncId } from '../Helpers/bringFabricObjects';
import UndraggedDiv from '../Helpers/modal/UndraggedDiv';
import { useNavigate, useParams } from 'react-router-dom';
import { useActiveTab } from '../../../components/map/components/hooks/useActiveTab';
import { useSelector } from 'react-redux';
import { setCurrentFloor, setEditingPinId, setPinsByCategory } from '../../../store/slices/projectItemSlice';
import { useDispatch } from 'react-redux';
import useFlyToPin from '../../../components/map/components/hooks/useFlyToPin';
import { fetchPinData } from '../../../components/map/components/hooks/useLoadPins';
// import { useMapContext } from '../../../components/map/components/contexts/MapContext';



const ValidationSchema = Yup.object().shape({
    // beacon_name: Yup.string().required('This field is required.'),
})

let messageContents = `<b>Step 1: Scan the QR code</b><br>`
messageContents += `Open your device's camera and aim your camera at the QR code provided.<br>`
messageContents += `Wait for the QR code to be recognised, and tap the link that appears on your screen.<br><br>`
messageContents += `<b>Step 2: Select Your Destination</b><br>`
messageContents += `On the main screen, tap the “To:” search box and select either the product or place that you are looking for.<br>`
messageContents += `Once you've made your selection, review the details of the selected product or place and tap the "Set as destination" button to confirm.<br><br>`
messageContents += `<b>Step 3: Get Directions</b><br>`
messageContents += `After selecting your destination, tap the "Find my way" button to generate the best route to your chosen destination.<br>`
messageContents += `Follow the displayed directions to reach your desired product or place.
`;

const QrcodeBeaconSideBar = ({
    // id,
    floorID,
    setAddNew,
    addNew,
    selBeaconDtls,
    setSelBeaconDtls,
    projectSettings,
    selFloorPlanDtls,
    getBeaconList,
    onSideBarIconClick,
    activeTab,
    savingTimer, setSavingTimer,
    handleEnableDisable,
    totalPinsUsed,
    setFloorID,
    // beaconList,
    getFloorPlanByid,
    searchTerm,
    setSearchTerm,
    setCommonSidebarVisible,
    setIsDirty,
    isDirty,
    setPanTool,
    stopPathDrawing,
    setPrefilledMessage,
    prefilledMessage,
    setStoredObjects = { setStoredObjects },
    canvas,
    onEditBeacon
}) => {

    useActiveTab('all'); 
    const editingPinId = useSelector(state => state.api.editingPinId);
    const allPins      = useSelector(state => state.api.allPins);
    const pinCount     = useSelector(state => state.api.pinCount); 
    const floorList    = useSelector(state => state.api.floorList); 
    const flyToPin     = useFlyToPin();
    const dispatch     = useDispatch();  
    const beaconList   = allPins?.beacon ?? [] 
    let { id }         = useParams()
    id                 = id && decode(id);
 

    useEffect(()=>{
        if(!addNew && editingPinId){
            dispatch(setEditingPinId(null))
        }
    },[addNew])

    const [mapDivSize, setMapDivSize] = useState(window.innerHeight - 100)
    const [planDetails, setPlanDetails] = useState();
    const [modalPlan, setModalPlan] = useState(false);
    const toggle3 = () => setModalPlan(!modalPlan);
    const [stripeModal, setStripeModal] = useState(false);
    const toggleStripe = () => setStripeModal(!stripeModal);
    const [backClick, setBackClick] = useState(false);
    const [maxContentLimit, setMaxContentLimit] = useState(false);
    const [modal, setModal] = useState(false);
    const toggle2 = () => setModal(!modal);
    const [color, setColor] = useState(null);
    const [openPicker, setOpenPicker] = useState(null);
    const navigate = useNavigate()

    const addBeaconClick = () => { 
        addClick();
        document.getElementById("beaconSubmitBtn")?.click();
    }

    const planCheck = () => {
        if (pinCount?.used_locations == pinCount?.total_locations) {
            PlanExpiryDetails(id, setPlanDetails, setModalPlan);
            // setTimeout(() => {
            //     removeFabricObjectsEncId(canvas, selBeaconDtls?.enc_id, 'beacon')
            // }, 2000);
            setSavingTimer(false)
            return
        } else {
            document.getElementById("beaconSubmitBtn")?.click();
            setSelBeaconDtls((prev) => ({
                ...prev,
                isDrop: false
            }));
        }
    }

    useEffect(() => {
        if (selBeaconDtls?.message) {
            setPrefilledMessage(selBeaconDtls.message);
        }
    }, [selBeaconDtls]);


    const addClick = () => {
        setPanTool(false)
        if (floorID) {
            // setAddNew(true);
            setSelBeaconDtls()

        } else {
            toast.warning('Please select a floor plan to add a beacon')
        }
    }

    const handleBeaconSubmit = async (values, setFieldError) => {
        setSavingTimer(true);

        if (values?.enc_id && values?.isDrop) {
            // check plan after bulk upload and drop pin
            planCheck()
            return
        } 

        let value = {
            customer_id: projectSettings?.enc_customer_id ?? getCurrentUser()?.user?.common_id,
            project_id: id,
            // floor_plan_id: values?.enc_floor_plan_id ?? selFloorPlanDtls?.enc_id,
            floor_plan_id: values?.position === null ? null : (values?.enc_floor_plan_id ?? selFloorPlanDtls?.enc_id),
            beacon_name: values?.beacon_name ?? `! New beacon`,
            message: values?.message,
            beacon_color: values?.beacon_color ?? projectSettings?.beacon_color,
            positions: values?.position,

            heading: values?.heading ?? 'Find Your Destination',
            subheading: values?.subheading ?? 'Instant directions with no app download',
            heading_color: values?.heading_color,
            subheading_color: values?.subheading_color,
            content_color: values?.content_color,
            bg_color: values?.bg_color

        }
        if (values?.enc_id) {
            value.id = values?.enc_id
            value.is_published = '0';
            value.discard = '1';
            value.publish = '1';

        }
        try { 
            const reqUrl = `qr-beacon`
            const response = await postRequest(reqUrl, value);
            const data = response.response?.data ?? [];
            if (response.type === 1) {

                // onEditBeacon(data)
                if (values?.enc_id && isDirty) {
                    setSelBeaconDtls((prev) => ({ ...prev, ...values, enc_id: data?.enc_id }));
                } else {
                    setSelBeaconDtls()
                }

                let beacons = await fetchPinData(id, ['beacon']);
                dispatch(
                    setPinsByCategory({
                        beacon : beacons?.beacon
                    }
                ));

                // getBeaconList(floorID)
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

    const filteredData = beaconList.filter((val) => {
        const {
            beacon_name = '',
            floor_plan = '',
            search_name
        } = val;
        if (searchTerm === '') {
            return val;
        }
        return (
            beacon_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            floor_plan?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            search_name?.toLowerCase().includes(searchTerm.toLowerCase())

        );
    });

    const removeBeacon = (row, index, canDrag) => {
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
            .then(async(value) => {
                switch (value) {
                    case "Yes":
                        let beaconList = await deletePinApi(`qr-beacon/${row?.enc_id}`, setFloorID, floorID, getBeaconList, handleEnableDisable, projectSettings, id, ['beacon'])
                        dispatch(
                            setPinsByCategory({
                                beacon : beaconList?.beacon
                            }
                        ));
                        // setStoredObjects((prev) => {
                        //     let updatedObjects = prev
                        //     updatedObjects.delete(`${row?.enc_id}_${row?.fp_id}`)
                        //     return updatedObjects
                        // })
                        break;
                    case "Remove":
                        const para = {
                            type: 3,
                            id: row?.enc_id
                        }

                        let beaconLists = removePinApi(`remove-pin`, para, setFloorID, floorID, getBeaconList, handleEnableDisable, projectSettings, id, ['beacon'])
                        dispatch(
                             setPinsByCategory({
                                beacon : beaconLists?.beacon
                            }
                        ));
                        // setStoredObjects((prev) => {
                        //     let updatedObjects = prev
                        //     updatedObjects.delete(`${row?.enc_id}_${row?.fp_id}`)
                        //     return updatedObjects
                        // })
                        break;
                    default:
                        break;
                }
            });
    }


    const editClick = (item) => {
        // dispatch(setEditingPinId(2));
        setPrefilledMessage();
        setPanTool(false)

        if (item?.positions) {
            let floor = floorList.find(itm => itm.enc_id == item.fp_id)
            dispatch(setCurrentFloor({
                value: floor.enc_id,
                label: floor?.floor_plan,
                id: floor?.enc_id,
                plan: floor?.plan,
                dec_id: floor?.dec_id,
            }));
            dispatch(setEditingPinId(item.enc_id));  
            flyToPin(JSON.parse(item?.positions));    
        }


        if (item.position) {
            getFloorPlanByid(item?.fp_id, 'beacons', "0", "default", item);
        } else {
            onEditBeacon(item)
        }
        setMaxContentLimit(false)
    }


    const BeaconItems = ({ item, index, }) => {
        // console.log(item, 'item')
        const id = item.enc_id;
        const canDrag = (!item?.positions || item?.positions === null)
        const [{ isDragging }, drag, preview] = useDrag({
            type: 'BeaconPin',
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
                <div className={`drag-item ${canDrag && 'can-drag'}`}>
                    <div className='magical-words' ref={drag}>
                        <div>
                            <BeaconSvg color={item?.beacon_color ?? projectSettings?.beacon_color ?? "#6A6D73"} />
                        </div>
                        <div>
                            {/* <p>{item?.beacon_name} ({item?.floor_plan})</p> */}
                            <p>{item.beacon_name} {item?.floor_plan && ` (${item?.floor_plan})`}</p>
                        </div>
                    </div>
                    <div className='flex-grow-1' />
                    {canDrag &&
                        <>
                            <UndraggedDiv pinName={'beacon'} />
                        </>
                    }
                    <div className='edit-square magical-words' onClick={() => editClick(item)}  >
                        <BiSolidPencil fontSize={15} />
                    </div>
                </div>
                <div className='ml-2  rounded-circle' onClick={() => removeBeacon(item, index, canDrag)} style={{ backgroundColor: '#E5E5E5', cursor: 'pointer', marginBottom: '8px', padding: '4px' }} >
                    <IoMdClose fontSize={10} />

                </div>
            </div>
        )
    }

    const renderBeaconItem = useCallback((item, index) => {
        return (
            <BeaconItems
                key={item.id}
                index={index}
                id={item.id}
                item={item}
            />
        )
    }, [])

    const goBack = () => {
        // setAddNew(false)
        // setFloorID(floorID)
        setSearchTerm('')
        if (addNew) {
            if (isDirty) {
                setBackClick(true)
                document.getElementById("beaconSubmitBtn")?.click();
                setPrefilledMessage(messageContents)
            } else {
                setAddNew(false)
                setSelBeaconDtls()
                stopPathDrawing()
                // resetCanvasTransform()
            }
        } else {
            setCommonSidebarVisible(true)

        }


    }
    const handleResize = () => {
        const { clientHeight } = window.document.getElementById('pageDiv')
        setMapDivSize(window.innerHeight - 100)
    }
    useEffect(() => {

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [])

    const handleAutoSave = () => {
        setTimeout(() => {
            document.getElementById("beaconSubmitBtn")?.click();
        }, 500);
    }


    const addCardDetails = (planDetails) => {
        toggle3()
        setStripeModal(true);
    }


    const handlePickerClick = (name) => {
        setOpenPicker(name);
    };

    return (
        <div className="bar" id="inner-customizer2" style={{ position: 'relative', height: mapDivSize, paddingBottom: '20px' }} >
            <Row className='backRow'>
                <Col md={8}>
                    <h1>QR Code Beacon {addNew && 'Details'}</h1>
                </Col>
                {/* {addNew && ( */}
                <Col md={4} >
                    <div className='backArrow float-right' style={(savingTimer && !isDirty) ? { pointerEvents: 'none' } : { opacity: '1' }} onClick={goBack}>
                        {(savingTimer && !isDirty) ?
                            <Spinner className='loader-style' /> :
                            <BsArrowLeftShort />
                        }
                    </div>
                </Col>
                {/* )} */}
            </Row>
            <Formik
                initialValues={{
                    beacon_name: '! New beacon',
                    message: prefilledMessage,
                    enc_id: null,
                    position: null,
                    heading: 'Find Your Destination',
                    content: null,
                    subheading: 'Instant directions with no app download',
                    heading_color: '#FFFFFF',
                    subheading_color: '#26A3DB',
                    content_color: '#1D1D1B',
                    bg_color: '#8BCDEB',
                    ...selBeaconDtls
                }

                }
                validationSchema={ValidationSchema}
                onSubmit={(values, setFieldError) => {
                    handleBeaconSubmit(values, setFieldError)
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
                        {(selBeaconDtls?.position && !selBeaconDtls?.enc_id) &&
                            // setIsDirty(true)
                            <AutosaveForm handleSubmit={handleAutoSave} />
                        }
                        <form
                            className="av-tooltip tooltip-label-bottom formGroups"
                            onSubmit={(e) => handleSubmit(e, setFieldError)}
                        >

                            {
                                addNew ?
                                    <div className='custom-scrollbar customScroll' style={{ height: mapDivSize }} >
                                        <div className='bar-sub'>
                                            {/* {(selBeaconDtls?.position?.x) ? ( */}
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
                                                            name="beacon_name"
                                                            autoComplete="off"
                                                            value={values?.beacon_name}
                                                            onChange={(e) => {
                                                                handleChange(e)
                                                                setSelBeaconDtls(prev => ({ ...prev, beacon_name: e.target.value }))
                                                                setIsDirty(true)
                                                            }}
                                                        />
                                                        {errors.beacon_name && touched.beacon_name ? (
                                                            <div className="text-danger mt-1">
                                                                {errors.beacon_name}
                                                            </div>
                                                        ) : null}
                                                    </div>
                                                </div>

                                                <div className='bar-sub-header mt-3'  >
                                                    <p  >QR Beacon Poster Content</p> 
                                                </div>
                                                <div className='pl-4 pr-4'>

                                                    <div className="marginBottom">
                                                        <Label className="form-labels">Heading</Label>
                                                        <Field
                                                            className="form-control"
                                                            type="text"
                                                            placeholder="Please Type"
                                                            name="heading"
                                                            autoComplete="off"
                                                            value={values?.heading}
                                                            onChange={(e) => {
                                                                handleChange(e)
                                                                setSelBeaconDtls(prev => ({ ...prev, heading: e.target.value }))
                                                                setIsDirty(true)
                                                            }}
                                                        ></Field>
                                                    </div>
                                                    <div className="marginBottom">
                                                        <Label className="form-labels">Subheading</Label>
                                                        <Field
                                                            className="form-control"
                                                            type="text"
                                                            placeholder="Please Type"
                                                            name="subheading"
                                                            autoComplete="off"
                                                            value={values?.subheading}
                                                            onChange={(e) => {
                                                                handleChange(e);
                                                                setIsDirty(true)

                                                                setSelBeaconDtls(prev => ({ ...prev, subheading: e.target.value }))
                                                            }}
                                                        ></Field>
                                                    </div>
                                                    <div className="marginBottom">
                                                        <Label for="message" className="form-labels">Content</Label>
                                                        <TextEditor
                                                            name='message'
                                                            value={values?.message}
                                                            setFieldValue={setFieldValue}
                                                            setSelBeaconDtls={setSelBeaconDtls}
                                                            setMaxContentLimit={setMaxContentLimit}
                                                            setIsDirty={setIsDirty}
                                                        />
                                                        {maxContentLimit &&
                                                            <div className="text-danger mt-1">
                                                                The maximum limit has been exceeded. The characters will be automatically trimmed while saving.
                                                            </div>
                                                        }

                                                    </div>
                                                </div>

                                                <div className='bar-sub-header' >
                                                    <p style={{ marginTop: 0 }} >Style</p>
                                                </div>
                                                <div className='pl-4 pr-4'>
                                                    <div className='' style={{ marginBottom: '18.75px' }}>

                                                        <ColorPicker
                                                            label={'Heading Colour'}
                                                            value={values.heading_color ?? '#FFFFFF'}
                                                            name={'heading_color'}
                                                            onChange={(e) => {
                                                                setColor(e)

                                                            }}
                                                            setFieldValue={setFieldValue} isOpen={openPicker === 'heading_color'} setOpenPicker={setOpenPicker} onClick={() => handlePickerClick('heading_color')} color={color}
                                                            setColor={setColor} setSelDtls={setSelBeaconDtls} values={values} setIsDirty={setIsDirty}
                                                        />
                                                    </div>
                                                    <div className='' style={{ marginBottom: '18.75px' }}>

                                                        <ColorPicker
                                                            label={'Subheading Colour'}
                                                            value={values.subheading_color ?? '#26A3DB'}
                                                            name={'subheading_color'}
                                                            onChange={(e) => {
                                                                setColor(e)

                                                            }}
                                                            setFieldValue={setFieldValue} isOpen={openPicker === 'subheading_color'}
                                                            setOpenPicker={setOpenPicker} onClick={() => handlePickerClick('subheading_color')}
                                                            color={color} setColor={setColor} setSelDtls={setSelBeaconDtls} values={values}
                                                            setIsDirty={setIsDirty}
                                                        />
                                                    </div>

                                                    <div className='' style={{ marginBottom: '18.75px' }}>

                                                        <ColorPicker
                                                            label={'Content Colour'}
                                                            value={values.content_color ?? '#1D1D1B'}
                                                            name={'content_color'}
                                                            onChange={(e) => {
                                                                setColor(e)

                                                            }}
                                                            setFieldValue={setFieldValue} isOpen={openPicker === 'content_color'}
                                                            setOpenPicker={setOpenPicker} onClick={() => handlePickerClick('content_color')}
                                                            color={color} setColor={setColor} setSelDtls={setSelBeaconDtls} values={values}
                                                            setIsDirty={setIsDirty}
                                                        />
                                                    </div>

                                                    <div className=' ' style={{ marginBottom: '18.75px' }}>

                                                        <ColorPicker
                                                            label={'Background Colour'}
                                                            value={values.bg_color ?? '#8BCDEB'}
                                                            name={'bg_color'}
                                                            onChange={(e) => {
                                                                setColor(e)

                                                            }}
                                                            setFieldValue={setFieldValue} isOpen={openPicker === 'bg_color'}
                                                            setOpenPicker={setOpenPicker} onClick={() => handlePickerClick('bg_color')}
                                                            color={color} setColor={setColor} setSelDtls={setSelBeaconDtls} values={values}
                                                            setIsDirty={setIsDirty}
                                                        />
                                                    </div>

                                                    <ColorPicker
                                                        label={'Beacon Colour'}
                                                        value={values.beacon_color ?? projectSettings?.beacon_color ?? '#320101'}
                                                        name={'beacon_color'}
                                                        onChange={(e) => {
                                                            setColor(e)

                                                        }}
                                                        setFieldValue={setFieldValue} isOpen={openPicker === 'beacon_color'}
                                                        setOpenPicker={setOpenPicker} onClick={() => handlePickerClick('beacon_color')}
                                                        color={color} setColor={setColor} setSelDtls={setSelBeaconDtls} values={values}
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
                                                            id='beaconSubmitBtn'
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
                                                            <p className='label color-labels' >Click on the map to place your beacon pin. Once you have placed the pin, you will be able to edit the pin details.</p>

                                                        </div>
                                                    </div>
                                                </div>
                                            )} */}
                                        </div>
                                    </div>
                                    :
                                    <>
                                        <div className='bar-sub-header' style={{ marginRight: '14px' }}>
                                            <p style={{ marginTop: 0 }} >Add New QR Code Beacon</p>
                                            <div className='plus-icon' onClick={() => addBeaconClick()}>
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
                                        <div className='custom-scrollbar customScroll' style={{ height: mapDivSize - 190 }} >
                                            {filteredData.filter(p => p?.floorId === selFloorPlanDtls?.id)?.map((plan, idx) => renderBeaconItem(plan, idx))}


                                        </div>
                                    </>}
                            {/* <Label for="exampleEmail1" className="form-labels">Name</Label> */}

                            {!addNew &&
                                <>
                                    <Button className='btn btn-primary' onClick={() => setModal(true)} style={{ width: '95%' }}>Generate QR Code Beacon Poster</Button>
                                    <Button className='btn btn-primary mt-2' onClick={() => navigate(`/canvas-editor/${encode(projectSettings?.enc_id)}`)} style={{ width: '95%' }}>PDF Editor</Button>
                                </>
                            }

                            <Button
                                className="btn-primary bar-btn"
                                htmlType="submit"
                                type="primary"
                                size="medium"
                                id='beaconSubmitBtn'
                                hidden
                            >
                                Submit
                            </Button>


                        </form>
                    </>
                )}
            </Formik>
            <ProPinModal
                isOpen={modalPlan}
                toggle={toggle3}
                totalPinsUsed={totalPinsUsed}
                planDetails={planDetails}
                addCardDetails={addCardDetails}
                projectSettings={projectSettings}
            />

            <PaymentForm
                toggleStripe={toggleStripe}
                stripeModal={stripeModal}
                planDetails={planDetails}
                project_id={id}
                onSideBarIconClick={onSideBarIconClick}
                activeTab={activeTab}
                fromUpgrade={false}
            />

            <GenerateQrModal
                isOpen={modal}
                toggle={toggle2}
                projectSettings={projectSettings}
                filteredData={filteredData}
            />

        </div>
    )
}

export default QrcodeBeaconSideBar;