import { Field, Formik, } from 'formik';
import moment from 'moment';
import React, { useCallback, useEffect, useState } from 'react';
import { useDrag } from 'react-dnd';
import { BiSolidPencil } from 'react-icons/bi';
import { BsArrowLeftShort } from 'react-icons/bs';
import { FiSearch } from "react-icons/fi";
import { GoPlus } from "react-icons/go";
import { IoMdClose } from 'react-icons/io';
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Button, Col, Input, Label, Row, Spinner } from 'reactstrap';
import swal from 'sweetalert';
import * as Yup from 'yup';
import ColorPicker from '../../../components/common/Colorpicker';
import hashids from '../../../components/common/common';
import PaymentForm from '../../../components/stripe/payment';
import TagInputComp from '../../../components/tagInput/TagInputComp';
import TextEditor from '../../../components/text-editor/TextEditor';
import { environmentaldatas } from '../../../constant/defaultValues';
import { getCurrentUser } from "../../../helpers/utils";
import { postRequest } from '../../../hooks/axiosClient';
import { SetBackEndErrorsAPi } from '../../../hooks/setBEerror';
import '../BuildProject.css';
import { LocationSvg } from "../CustomSvg";
import { PlanExpiryDetails, deletePinApi, removePinApi } from '../Helpers/apis/otherApis';
import { removeFabricObjectsEncId } from '../Helpers/bringFabricObjects';
import { NOImg, convertBase64ToBlob, daysOfWeek, handleBlockEnter } from '../Helpers/constants/constant';
import BulkUploadPin from '../Helpers/modal/BulkUploadModal';
import { ProPinModal } from '../Helpers/modal/proPinModal';
import UndraggedDiv from '../Helpers/modal/UndraggedDiv';
import AutosaveForm from './AutoSaveForm';
import HourInputComp from './HourInputComp';
import PromotionComp from './PromotionComp';
import { LocationWebListItem } from './ProdSpecItem';



const { image_url } = environmentaldatas;
// const urlRegex = /^(https:\/\/|www\.)[a-zA-Z0-9-]+(\.[a-zA-Z]{2,})+$/;
// const urlRegex = /^(https?:\/\/)?(www\.)?[a-zA-Z0-9-]+(\.[a-zA-Z]{2,})(\/[\w\-./?%&=]*)?$/;
const urlRegex = /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/[^\s]*)?$/i;
const validationSchema = Yup.object().shape({
    contact: Yup.number().typeError("Please type numbers only.").nullable(),
    websiteLink: Yup.array().of(
        Yup.object().shape({
            label: Yup.string()
                .required("Name is required")
            ,
            value: Yup.string()
                .required("URL is required ")
                .test("is-valid-url", "Enter a valid URL", function (val) {
                const { path, createError } = this;

                if (!val || urlRegex.test(val.trim())) {
                    return true;
                }

                return createError({ path, message: "Enter a valid URL" });
            }),
        })
    ),
});

const LocationsSideBar = ({
    selLocationDtls,
    setSelLocationDtls,
    setLocations,
    selFloorPlanDtls,
    id, floorID,
    projectSettings,
    addNew, setAddNew,
    hours,
    setHours,
    promotions,
    setPromotions,
    isBoundary,
    setIsBoundary,
    getLocationList,
    activeTab,
    onSideBarIconClick,
    boundaryAttributes,
    savingTimer, setSavingTimer,
    handleEnableDisable,
    totalPinsUsed,
    setFloorID,
    locationList,
    getFloorPlanByid,
    searchTerm,
    setSearchTerm,
    setCommonSidebarVisible,
    setIsDirty,
    isDirty,
    setPanTool,
    stopPathDrawing,
    canvas,
    onEditLocation,
    setStoredObjects,
    setwebsiteLinks,
    websiteLinks
}) => {


    const [isError, setIsError] = useState(false);
    const [promotionError, setPromotionError] = useState(false);
    const [triedToSubmit, setTriedToSubmit] = useState(true);
    const [modal, setModal] = useState(false);
    const toggle2 = () => setModal(!modal);
    const [mapDivSize, setMapDivSize] = useState(window.innerHeight - 80)
    const currentDate = new Date();
    const [planDetails, setPlanDetails] = useState();
    const [stripeModal, setStripeModal] = useState(false);
    const [modalBulk, setModalBulk] = useState(false);
    const toggleStripe = () => setStripeModal(!stripeModal);
    const [backClick, setBackClick] = useState(false);
    const [color, setColor] = useState(null);
    const [openPicker, setOpenPicker] = useState(null);
    const [maxContentLimit, setMaxContentLimit] = useState(false);
    const [prefilledMessage, setPrefilledMessage] = useState("");
    useEffect(() => {
        if (selLocationDtls?.description) {
            console.log(selLocationDtls?.description,"selLocationDtls?.description");
            setPrefilledMessage(selLocationDtls.description);
        }
    }, [selLocationDtls]);


    const addlocationClick = () => {
        // if (totalPinsUsed?.used_locations == totalPinsUsed?.total_locations) {
        //     PlanExpiryDetails(id, setPlanDetails, setModal);
        //     return
        // } else if (totalPinsUsed?.used_locations == totalPinsUsed?.total_locations) {
        //     PlanExpiryDetails(id, setPlanDetails, setModal);

        // } else if (totalPinsUsed?.used_locations == totalPinsUsed?.total_locations) {
        //     PlanExpiryDetails(id, setPlanDetails, setModal);
        //     return
        // } else {
        locationClick();
        document.getElementById("locationSubmitBtn")?.click();
        // }
    };

    const planCheck = () => {
        if (totalPinsUsed?.used_locations == totalPinsUsed?.total_locations) {
            PlanExpiryDetails(id, setPlanDetails, setModal);
            setTimeout(() => {
                removeFabricObjectsEncId(canvas, selLocationDtls?.enc_id, 'location')
            }, 2000);
            setSavingTimer(false)
            return
        } else if (totalPinsUsed?.used_locations == totalPinsUsed?.total_locations) {
            PlanExpiryDetails(id, setPlanDetails, setModal);
            setTimeout(() => {
                removeFabricObjectsEncId(canvas, selLocationDtls?.enc_id, 'location')
            }, 2000);
            setSavingTimer(false)

        } else if (totalPinsUsed?.used_locations == totalPinsUsed?.total_locations) {
            PlanExpiryDetails(id, setPlanDetails, setModal);
            setTimeout(() => {
                removeFabricObjectsEncId(canvas, selLocationDtls?.enc_id, 'location')
            }, 2000);
            setSavingTimer(false)
            return
        } else {
            document.getElementById("locationSubmitBtn")?.click();
            setSelLocationDtls((prev) => ({
                ...prev,
                isDrop: false
            }));
        }
    }

    const locationClick = () => {
        setPanTool(false)

        if (floorID) {
            setSelLocationDtls()
            setHours({})
            // setAddNew(true)
            setPromotions([])
            setIsBoundary(false)
            setwebsiteLinks([])
            boundaryAttributes = undefined
        } else {
            toast.warning('Please select a floor plan to add a location')
        }
    }

    const bulkUploadClick = () => {
        if (floorID) {
            setModalBulk(true)
        } else {
            toast.warning('Please select a floor plan to bulk upload.')
        }
    };

    useEffect(() => {
        // if (floorID) {
        getLocationList(floorID);
        // }
    }, [floorID]);



    const removeLocation = (location, canDrag) => {
        let floor_id
        setFloorID((prev) => {
            floor_id = prev;
            return prev;
        });

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
                        deletePinApi(`location/${location?.enc_id}`, setFloorID, floorID, getLocationList, handleEnableDisable, projectSettings)
                        setStoredObjects((prev) => {
                            let updatedObjects = prev
                            updatedObjects.delete(`${location?.enc_id}_${location?.fp_id}`)
                            return updatedObjects
                        })
                        break;
                    case "Remove":
                        const para = {
                            type: 1,
                            id: location?.enc_id
                        }

                        removePinApi(`remove-pin`, para, setFloorID, floorID, getLocationList, handleEnableDisable, projectSettings)
                        setStoredObjects((prev) => {
                            let updatedObjects = prev
                            updatedObjects.delete(`${location?.enc_id}_${location?.fp_id}`)
                            return updatedObjects
                        })
                        break;
                    default:
                        break;
                }
            });
        return
    }

    const addLocation = async (values, setFieldError) => {
        setSavingTimer(true)
        // console.log(values, 'addLocation')
        // if (values.position && !isError) {
        if (values?.enc_id && values?.isDrop) {
            // check plan after bulk upload and drop pin
            planCheck()
            return
        }
        setTriedToSubmit(false)
        setTriedToSubmit(true)
        const user = getCurrentUser()?.user;
        const ID = + hashids.decode(user?.role_id);

        const customerId = projectSettings?.enc_customer_id ?? user?.common_id

        let hourObject = {}
        daysOfWeek.forEach(day => {
            hourObject[`${day.toLowerCase()}_open`] = hours.hasOwnProperty(day) ? 1 : 0;
            hourObject[`${day.toLowerCase()}_start`] = hours[day]?.from ?? (hours.hasOwnProperty(day) ? '09:00:00' : '');
            hourObject[`${day.toLowerCase()}_end`] = hours[day]?.to ?? (hours.hasOwnProperty(day) ? '17:30:00' : '');
        })

        const filteredwebsites = websiteLinks?.filter((obj) => {
            return Object.values(obj).some((val) => val !== null && val !== undefined);
        });

        let value = {

            customer_id: customerId,
            project_id: id,
            // floor_plan_id: selFloorPlanDtls?.enc_id ?? floorID,
            floor_plan_id: values?.position === null ? null : (values?.enc_floor_plan_id ?? selFloorPlanDtls?.enc_id),
            location_name: values?.location_name ?? `! New location`,
            tags: values?.tags,
            contact: values?.contact,
            product_code: values?.productCode,
            // description: values?.description,
            description: values?.message,
            positions: values?.position ?? null,
            // promotions: promotions.length > 0 ? JSON.stringify(promotions) : '',
            website: JSON.stringify(filteredwebsites),
            location_color: values.location_color ?? projectSettings?.location_color,
            boundary_color: isBoundary ? (values?.boundary_color ?? '#26A3DB') : null,
            boundary_attributes: isBoundary ? (boundaryAttributes ?? null) : null,
            ...hourObject
        }
        if (values?.enc_id) {
            value.id = values.enc_id,
                value.is_published = '0';
            value.discard = '1';
            value.publish = '1';
        } else {
            console.log(values, 'addLocation')
            value.promotions = JSON.stringify([])
        }
        // console.log(value)
        try {
            const reqUrl = `location`;
            const response = await postRequest(reqUrl, value);
            const data = response.response?.data ?? [];
            if (response.type === 1) {
                boundaryAttributes = undefined
                // setSelLocationDtls(prev => ({ ...prev, ...values, enc_id: data?.enc_id }))
                if (values?.enc_id && isDirty) {
                    setSelLocationDtls((prev) => ({ ...prev, ...values, enc_id: data?.enc_id }));
                } else {
                    setSelLocationDtls();
                }
                getLocationList(floorID);
                handleEnableDisable()
                setIsDirty(false)

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
        }
        // }
        // else if (!values.position) {
        //     toast.error('Click on map to add pin');
        //     return;
        // }
    }

    const postPromotion = async (promoArray) => {
        let errorExist
        setPromotionError((prev) => {
            errorExist = prev;
            return prev;
        });
        console.log(errorExist, 'post')
        let isEmptyObject = null
        if (!errorExist) {
            let isPromoErro = false

            let tempPromos = promoArray ?? [...promotions]
            // console.log(tempPromos, 'org')
            tempPromos.forEach((promo, idx) => {
                let startDate = new Date(promo.start_date)
                startDate.setHours(0, 0, 0, 0)
                let endDate = new Date(promo.end_date)
                endDate.setHours(0, 0, 0, 0)
                let currentdate = new Date()
                currentdate.setHours(0, 0, 0, 0)

                if (startDate && endDate && startDate > endDate) {
                    isPromoErro = true
                    setPromotionError(true)
                } else if (startDate == 'Invalid Date' && endDate < currentdate) {
                    isPromoErro = true
                    setPromotionError(true)
                    console.log(startDate, currentdate)
                } else {
                    isPromoErro = false
                    setPromotionError(false)
                }
            })

            if (isPromoErro) {
                setPromotions([...tempPromos]);
                isPromoErro = false
                return;

            } else {

                if (tempPromos.length > 0) {
                    isEmptyObject = Object.keys(tempPromos[0]).every(key => {
                        const value = tempPromos[0][key];
                        return value === null || value === undefined || value === "";
                    });
                    const newPromotions = tempPromos.filter((el) => {
                        const isEmptyObject2 = Object.keys(el).every((key) => {
                            const value = el[key];
                            return value === null || value === undefined || value === "";
                        });

                        if (!isEmptyObject2) {
                            if (selLocationDtls?.enc_id && !(el.image_path instanceof Blob)) {
                                el.image_path = el.image_path?.replace(image_url, '');
                            }
                            if (!el?.start_date) {
                                el.start_date = currentDate;
                            }
                            if (!el?.image_path) {
                                const noImageBlob = convertBase64ToBlob(NOImg)
                                el.image_path = noImageBlob;
                            }
                            return true;
                        }
                        return false;
                    });
                    promotions = newPromotions;
                }
            }

            const formData = new FormData();

            formData.append('id', selLocationDtls?.enc_id);
            formData.append('is_published', '0');
            formData.append('discard', '1');
            formData.append('publish', '1');

            if (promoArray?.length !== 0) {
                for (var i = 0; i < promotions.length; i++) {
                    formData.append(`promotions[${i}][image_path]`, promotions[i]?.image_path);
                    formData.append(`promotions[${i}][start_date]`, promotions[i]?.start_date);
                    formData.append(`promotions[${i}][end_date]`, promotions[i]?.end_date ?? null);
                }
            }

            try {
                const reqUrl = `promotion-image`;
                const response = await postRequest(reqUrl, formData, true);

                const data = response.response?.data ?? [];

                if (response.type === 1) {
                    let promotionData = data.promotions ? JSON.parse(data.promotions) : [];
                    promotionData?.forEach((el) => {
                        el.image_path = el.image_path ? image_url + el.image_path : null;
                        el.start_date = el.start_date ? moment(el.start_date).toDate() : '';
                        el.end_date = el.end_date ? moment(el.end_date).toDate() : '';
                    });
                    console.log(promotionData, 'promotionData')
                    handleEnableDisable()
                    setPromotions(promotionData);
                    getPromotionData(promotionData)

                }

            } catch (error) {

            }
        }
    }

    const getPromotionData = (promotions) => {
        let isPromoErro = false;
        let tempPromos = [...promotions];

        tempPromos?.forEach((promo, idx) => {

            if (promo.start_date) {
                let startDate = new Date(promo.start_date);
                startDate.setHours(0, 0, 0, 0);
            }

            if (promo.end_date) {
                let endDate = new Date(promo.end_date);
                endDate.setHours(0, 0, 0, 0);
            }

            if (startDate && endDate && startDate > endDate) {
                isPromoErro = true;
                tempPromos[idx].error = 'Please add an image'
            }
        });

        if (isPromoErro) {
            console.log(tempPromos, 'tempPromos')

            setPromotions([...tempPromos]);
            return;
        }
    }

    function moveElementToIndex(arr, fromIndex, toIndex) {
        if (
            fromIndex < 0 ||
            fromIndex >= arr.length ||
            toIndex < 0 ||
            toIndex >= arr.length ||
            fromIndex === toIndex
        ) {
            return arr; // No valid move, return the original array
        }

        const element = arr.splice(fromIndex, 1)[0]; // Remove the element at fromIndex

        // Adjust the toIndex based on the original array length after removing the element
        toIndex = toIndex > fromIndex ? toIndex - 1 : toIndex;

        arr.splice(toIndex, 0, element); // Insert the element at toIndex
        return arr;
    }

    const moveCard = useCallback((dragIndex, hoverIndex) => {
        ////console.log(dragIndex, hoverIndex)

        let arr = moveElementToIndex(locationList, dragIndex, hoverIndex)
        setLocations([...arr])

    }, []);

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const filteredData = locationList.filter((val) => {
        const {
            location_name = '',
            floor_plan = '',
            search_name

        } = val;
        if (searchTerm === '') {
            return val;
        }
        return (
            location_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            floor_plan?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            search_name?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    });

    const editClick = (location) => {
        setPanTool(false)
        if (location?.position) {
            getFloorPlanByid(location?.fp_id, 'locations', "0", "default", location);
        } else {
            onEditLocation(location)
        }
    }

    const LocationItem = ({ location, index, }) => {
        const id = location.enc_id;
        // const canDrag = location?.position?.x === 0 && location?.position?.y === 0;
        const canDrag = (location?.position === null)
        const [{ isDragging }, drag, preview] = useDrag({
            type: 'LocationPin',
            item: () => {
                return { index, id, location };
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
            <div className='drag-wrpr mxx-3' >
                <div className={`drag-item ${canDrag && 'can-drag'}`}>
                    <div className='magical-words' ref={drag}>
                        <div>
                            <LocationSvg color={location.location_color ?? "#6A6D73"} />
                        </div>
                        <div>
                            <p>{location.location_name} {location?.floor_plan && ` (${location?.floor_plan})`}</p>
                        </div>
                    </div>
                    <div className='flex-grow-1' />
                    {canDrag &&
                        <>
                            <UndraggedDiv pinName={'location'} />
                        </>
                    }
                    <div className=' edit-square magical-words' onClick={() => editClick(location)}  >
                        <BiSolidPencil fontSize={15} />

                    </div>
                </div>
                <div className='ml-2  rounded-circle' onClick={() => removeLocation(location, canDrag)} style={{ backgroundColor: '#E5E5E5', cursor: 'pointer', marginBottom: '8px', padding: '4px' }} >
                    <IoMdClose fontSize={10} />

                </div>
            </div>
        )
    }


    const renderLocationItem = useCallback((location, index) => {
        return (
            <LocationItem
                key={location?.id}
                index={index}
                id={location.id}
                moveCard={moveCard}
                location={location}
            />
        )
    }, [])
    const goBack = () => {
        // setAddNew(false)
        // setFloorID(floorID)
        setSearchTerm('')
        if (addNew) {

            // if (selLocationDtls?.position && isDirty) {
            if (isDirty) {
                setBackClick(true)
                // setSelLocationDtls()
                document.getElementById("locationSubmitBtn")?.click();
                // onSideBarIconClick(activeTab)
            } else {
                console.log('just back')

                setAddNew(false)
                setSelLocationDtls()
                stopPathDrawing()
                // resetCanvasTransform()
            }

        } else {
            setCommonSidebarVisible(true)

        }
    }

    const handleBoundaryCheckbox = (setFieldValue, setTouched, values) => {
        setIsBoundary(!isBoundary);
        if (!isBoundary) {
            // setSelLocationDtls(prev => ({ ...prev, boundary_color: '#26A3DB' }));
            setFieldValue('boundary_color', '#26A3DB')
            setFieldValue('fake_value', '#26A3DB')

            setTimeout(() => {
                setSelLocationDtls(prev => ({ ...prev, ...values, boundary_color: '#26A3DB' }));
            }, 1000);
        } else {
            // setSelLocationDtls(prev => ({ ...prev, boundary_color: '' }))
            setFieldValue('boundary_color', '')
            setFieldValue('fake_value', '#26A3DB')

            setTimeout(() => {
                setSelLocationDtls(prev => ({ ...prev, ...values, boundary_color: '', boundary_attributes: null }));
            }, 1000);
        }
        // setTouched({});
    }

    const handleResize = () => {
        const { clientHeight } = window.document.getElementById('pageDiv')
        setMapDivSize(window.innerHeight - 80)
    }
    useEffect(() => {

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const handleAutoSave = () => {
        document.getElementById("locationSubmitBtn")?.click();
    }

    const addCardDetails = (planDetails) => {
        toggle2()
        setStripeModal(true);
    }

    const handlePickerClick = (name) => {
        setOpenPicker(name);
    };

    return (
        <div className="bar" id="inner-customizer2" style={{ position: 'relative', height: mapDivSize, paddingBottom: '20px' }} >
            <Row className='backRow'>
                <Col md={8}>
                    <h1> {addNew ? 'Location Pin Details' : 'Location Pins'}</h1>
                </Col>
                {/* {addNew && ( */}
                <Col md={4} >
                    <div className='backArrow float-right' style={(savingTimer && !isDirty) ? { pointerEvents: 'none' } : { opacity: '1' }} onClick={goBack}>
                        {(savingTimer && !isDirty && addNew) ?
                            <Spinner className='loader-style' /> :
                            <BsArrowLeftShort />
                        }
                    </div>
                </Col>
            </Row>
            {/* {console.log(websiteLinks,"websiteLinkswebsiteLinkswebsiteLinks")} */}
            <Formik
                initialValues={{
                    // location_name: 'New location',
                    location_name: '! New location',
                    message: selLocationDtls?.description ?? '',
                    description: "",
                    contact: '',
                    website: [],
                    websiteLink:websiteLinks || [],
                    enc_id: null,
                    boundary_color: null,
                    location_color: null,
                    tags: selLocationDtls?.tags ?? projectSettings?.location_tags ?? [],
                    isBoundary: false,
                    fake_value: null,
                    promos: '',
                    // position: { x: 0, y: 0 },
                    position: null,
                    ...selLocationDtls,
                }}
                validationSchema={validationSchema}
                onSubmit={(values, setFieldError) => {
                    addLocation(values, setFieldError)
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
                    setFieldError,
                    setTouched,
                }) => (
                    <>
                        {(selLocationDtls?.position && !selLocationDtls?.enc_id) &&
                            <>
                                {/* {!selLocationDtls?.enc_id && setIsDirty(true)} */}
                                <AutosaveForm handleSubmit={handleAutoSave} setSavingTimer={setSavingTimer} savingTimer={savingTimer} />
                            </>
                        }

                        <form
                            id="locationForm"
                            className="av-tooltip tooltip-label-bottom formGroups"
                            onSubmit={(e) => handleSubmit(e)}
                        >
                            {
                                addNew ?
                                    <div className='custom-scrollbar customScroll' style={{ height: mapDivSize }} >
                                        <div className='bar-sub'>
                                            {/* {(selLocationDtls?.position?.x) ? ( */}
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
                                                            name="location_name"
                                                            autoComplete="off"
                                                            value={values?.location_name}
                                                            onChange={(e) => {
                                                                handleChange(e);
                                                                setSelLocationDtls(prev => ({ ...prev, location_name: e.target.value, }))
                                                                setIsDirty(true)
                                                            }}
                                                             onKeyDown={(e) => {
                                                                if (e.key === 'Enter') {
                                                                    e.preventDefault(); 
                                                                }
                                                            }}
                                                        />
                                                        {errors.location_name && touched.location_name ? (
                                                            <div className="text-danger mt-1">
                                                                {errors.location_name}
                                                            </div>
                                                        ) : null}
                                                    </div>

                                                    <div className="marginBottom">
                                                        <Label for="exampleName" className="form-labels">Tags</Label>

                                                        <TagInputComp
                                                            tags={values.tags ?? []}
                                                            setTags={(values) => {
                                                                // if (values[values?.length - 1] !== ',') {
                                                                setFieldValue('tags', values);
                                                                setSelLocationDtls(prev => ({ ...prev, tags: values }))
                                                                setIsDirty(true)
                                                                // }
                                                            }}
                                                        />
                                                        {/* {errors.name && touched.name ? (
                                            <div className="text-danger mt-1">
                                                {errors.name}
                                            </div>
                                        ) : null} */}
                                                    </div>
                                                    <div className="marginBottom">
                                                        <Label for="exampleName" className="form-labels">Editor</Label>
                                                        {/* <textarea
                                                            id="exampleName"
                                                            className="form-control"
                                                            type="text"
                                                            placeholder="Please Type"
                                                            rows={4}
                                                            name="description"
                                                            autoComplete="off"
                                                            value={values?.description}
                                                            onChange={(e) => {
                                                                handleChange(e);
                                                                setSelLocationDtls(prev => ({ ...prev, description: e.target.value, }))
                                                                setIsDirty(true)
                                                            }}

                                                        ></textarea>  */}


                                                        <TextEditor
                                                            name='message'
                                                            value={values?.message}
                                                            setFieldValue={setFieldValue}
                                                            setSelBeaconDtls={setSelLocationDtls}
                                                            setMaxContentLimit={setMaxContentLimit}
                                                            setIsDirty={setIsDirty}
                                                        />
                                                        {/* {maxContentLimit &&
                                                            <div className="text-danger mt-1">
                                                                The maximum limit has been exceeded. The characters will be automatically trimmed while saving.
                                                            </div>
                                                        } */}

                                                        {errors.description && touched.description ? (
                                                            <div className="text-danger mt-1">
                                                                {errors.description}
                                                            </div>
                                                        ) : null}
                                                    </div>
                                                    <div className="marginBottom">
                                                        <Label for="exampleName" className="form-labels">Hours</Label>
                                                        <div>
                                                            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day =>
                                                                <HourInputComp
                                                                    key={day}
                                                                    day={day}
                                                                    hourData={hours}
                                                                    setHourData={setHours}
                                                                    setIsError={setIsError}
                                                                    setFieldValue={setFieldValue}
                                                                    setIsDirty={setIsDirty}
                                                                />
                                                            )}

                                                        </div>
                                                    </div>
                                                    <div className="marginBottom">
                                                        <Label for="exampleName" className="form-labels">Phone</Label>
                                                        <Field
                                                            id="exampleName"
                                                            className="form-control"
                                                            type="text"
                                                            placeholder="Please Type"
                                                            name="contact"
                                                            autoComplete="off"
                                                            value={values?.contact}
                                                            onChange={(e) => {
                                                                handleChange(e);
                                                                setSelLocationDtls(prev => ({ ...prev, contact: e.target.value, }))
                                                                setIsDirty(true)
                                                            }}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') {
                                                                    e.preventDefault(); 
                                                                }
                                                            }}
                                                        />
                                                        {errors.contact && touched.contact ? (
                                                            <div className="text-danger mt-1">
                                                                {errors.contact}
                                                            </div>
                                                        ) : null}
                                                    </div>
                                                    {/* <div className="marginBottom">
                                                        <Label for="exampleName" className="form-labels">Website</Label>
                                                        <Field
                                                            id="exampleName"
                                                            className="form-control"
                                                            type="text"
                                                            placeholder="Please Type (Eg. www.demo.com)"
                                                            name="website"
                                                            autoComplete="off"
                                                            value={values?.website}
                                                            onChange={(e) => {
                                                                handleChange(e)
                                                                setSelLocationDtls(prev => ({ ...prev, website: e.target.value, }))
                                                                setIsDirty(true)
                                                            }}
                                                        />

                                                    </div> */}
                                                </div>
                                                
                                                <div className='bar-sub-header' >
                                                    <p style={{ marginTop: 0 }} >Website</p>
                                                    <div className='plus-icon' onClick={() => setwebsiteLinks(prev => [...prev, {}])}>
                                                        <GoPlus />
                                                    </div>
                                                </div>
                                                <div className='pl-4 pr-4'>
                                                    {
                                                        values.websiteLink.map((sp, id) => (
                                                            <LocationWebListItem
                                                                key={id}
                                                                spec={sp}
                                                                index={id}
                                                                setSpecifications={setwebsiteLinks}
                                                                specifications={websiteLinks}
                                                                name="websiteLink"
                                                                setFieldValue={setFieldValue}
                                                                setIsDirty={setIsDirty}
                                                                setFieldError={setFieldError}
                                                                // error={errors?.websiteLink?.[id]?.label ? errors?.websiteLink?.[id]?.label : errors?.websiteLink?.[id]?.value}
                                                                error={errors?.websiteLink?.[id]}
                                                                // touched={touched}
                                                            />
                                                        ))
                                                    }
                                                </div>

                                                {errors.website && touched.website ? (
                                                    <div className="text-danger mt-1">
                                                        {errors.website}
                                                    </div>
                                                ) : null}


                                                <div className='bar-sub-header' >
                                                    <p style={{ marginTop: 0 }} >Images / Promotions</p>
                                                    {/* {promotions?.length == 0 && */}
                                                    <div className='plus-icon' onClick={() => setPromotions(prev => [...prev, {}])}>
                                                        <GoPlus />
                                                    </div>
                                                    {/* } */}

                                                    {/* <AiFillPlusCircle size={19} color='#26A3DB' style={{ cursor: 'pointer' }}  /> */}
                                                </div>
                                                {promotions.map((promo, idx) => <PromotionComp
                                                    promo={promo}
                                                    promotions={promotions}
                                                    setPromotions={setPromotions}
                                                    index={idx}
                                                    setPromotionError={setPromotionError}
                                                    triedToSubmit={triedToSubmit}
                                                    setTriedToSubmit={setTriedToSubmit}
                                                    setFieldValue={setFieldValue}
                                                    values={values}
                                                    postPromotion={postPromotion}
                                                    setIsDirty={setIsDirty}
                                                />)}
                                                <div className='bar-sub-header' >
                                                    <p style={{ marginTop: 0 }} >Style</p>
                                                </div>
                                                <div className='pl-4 pr-4'>
                                                    <ColorPicker
                                                        label={'Active Destination Pin Colour'}
                                                        value={values.location_color ?? selLocationDtls?.location_color ?? projectSettings?.location_color ?? '#320101'}
                                                        name={'location_color'}
                                                        onChange={(e) => {
                                                            // handleChange(e);
                                                            setColor(e)
                                                            // setFieldValue('fake_value', e.target.value)
                                                            // setTimeout(() => {
                                                            //     setSelLocationDtls(prev => ({ ...prev, ...values, location_color: e }))
                                                            // }, 1000);
                                                        }}
                                                        handleOkClick={(e) => {
                                                            setSelLocationDtls(prev => ({ ...prev, ...values, location_color: e }))
                                                        }}
                                                        setFieldValue={setFieldValue}
                                                        isOpen={openPicker === 'location_color'}
                                                        setOpenPicker={setOpenPicker}
                                                        onClick={() => handlePickerClick('location_color')}
                                                        color={color} setColor={setColor}
                                                        setSelLocationDtls={setSelLocationDtls}
                                                        values={values}
                                                        setIsDirty={setIsDirty}
                                                    />
                                                    <div className='row mt-3'>
                                                        <div className='col-sm-10'>
                                                            <Label for="exampleName" className="form-labels ">Boundary </Label>
                                                        </div>
                                                        <div className='col-sm-2'>
                                                            <Input type="checkbox"
                                                                name='fake_value'
                                                                className='float-right'
                                                                style={{ cursor: 'pointer' }}
                                                                onChange={(e) => {
                                                                    handleChange(e); handleBoundaryCheckbox(setFieldValue, setTouched, values);
                                                                    setIsDirty(true)
                                                                }}
                                                                checked={isBoundary}
                                                                disabled={values?.position === null}
                                                            />
                                                        </div>
                                                    </div>
                                                    {isBoundary &&
                                                        <div className='mt-3'>

                                                            <ColorPicker
                                                                label={'Boundary Colour'}
                                                                value={values.boundary_color ?? selLocationDtls?.boundary_color ?? '#320101'}
                                                                name={'boundary_color'}
                                                                onChange={(e) => {
                                                                    // handleChange(e);
                                                                    setColor(e)
                                                                    // setFieldValue('fake_value', e.target.value)
                                                                    // setTimeout(() => {
                                                                    //     setSelLocationDtls(prev => ({ ...prev, ...values, boundary_color: e }))
                                                                    // }, 1000);
                                                                }}
                                                                handleOkClick={(e) => {
                                                                    setSelLocationDtls(prev => ({ ...prev, ...values, boundary_color: e }))
                                                                }}
                                                                setFieldValue={setFieldValue}
                                                                isOpen={openPicker === 'boundary_color'}
                                                                setOpenPicker={setOpenPicker}
                                                                onClick={() => handlePickerClick('boundary_color')}
                                                                color={color} setColor={setColor}
                                                                setSelLocationDtls={setSelLocationDtls}
                                                                values={values}
                                                                setIsDirty={setIsDirty}
                                                            />
                                                        </div>
                                                    }
                                                </div>

                                                <div className='btn-wrpr' >
                                                    <Button
                                                        className="btnCancel "
                                                        type="button"
                                                        size="medium"
                                                        hidden
                                                        onClick={() => { setAddNew(false); setSelLocationDtls() }}
                                                    >
                                                        Cancel
                                                    </Button>

                                                    {/* <Button
                                                            className="btn-primary bar-btn"
                                                            htmlType="submit"
                                                            type="primary"
                                                            size="medium"
                                                            id='locationSubmitBtn'
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
                                                            <p className='label color-labels' >Click on the map to place your location pin. Once you have placed the pin, you will be able to edit the pin details.</p>

                                                        </div>
                                                    </div>
                                                </div>
                                            )} */}
                                        </div>
                                    </div>
                                    :
                                    <>
                                        <div className='bar-sub-header' style={{ marginRight: '14px' }} >
                                            <p style={{ marginTop: 0 }} >Add New Location Pin  </p>
                                            <div className='plus-icon' onClick={() => addlocationClick()}>
                                                <GoPlus />
                                            </div>
                                        </div>
                                        <div className='mb-2 text-right' style={{ marginRight: '14px' }}>
                                            <Button
                                                className="btn-primary bar-btn"
                                                type="button"
                                                size="medium"
                                                onClick={bulkUploadClick}
                                            >
                                                Bulk Location Upload
                                            </Button>
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
                                        <div className='custom-scrollbar customScroll' style={{ height: mapDivSize - 140 }} >
                                            {[...filteredData]?.map((plan, idx) => renderLocationItem(plan, idx))}
                                        </div>
                                    </>}
                            <Button
                                className="btn-primary bar-btn"
                                htmlType="submit"
                                type="primary"
                                size="medium"
                                id='locationSubmitBtn'
                                hidden
                            >
                                Submit
                            </Button>
                        </form>
                    </>

                )}
            </Formik>
            <ProPinModal
                isOpen={modal}
                toggle={toggle2}
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
            <BulkUploadPin
                modal={modalBulk}
                setModal={setModalBulk}
                type={'location'}
                projectSettings={projectSettings}
                selFloorPlanDtls={selFloorPlanDtls}
                getList={() => getLocationList(selFloorPlanDtls?.enc_id)}
                handleEnableDisable={handleEnableDisable}
            />
        </div>
    )
}

export default LocationsSideBar

