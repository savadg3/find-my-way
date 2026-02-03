import { Field, Formik, useFormikContext } from 'formik';
import React, { useCallback, useRef, useState, useEffect } from 'react';
import { Button, Label, Row, Col } from 'reactstrap';
import { AiFillPlusCircle } from 'react-icons/ai';
import { BsArrowLeftShort } from 'react-icons/bs';
import { MdBlock } from 'react-icons/md';
import { IoMdCheckmark } from 'react-icons/io';
import { BiSolidPencil } from 'react-icons/bi';
import { FaInfo } from 'react-icons/fa';
import { IoMdClose } from 'react-icons/io';
import DropdownWithIcons from '../IconDropdown';
import { postRequest, getRequest, deleteRequest } from '../../../hooks/axiosClient';
import { getCurrentUser } from '../../../helpers/utils';
import { SetBackEndErrorsAPi } from '../../../hooks/setBEerror';
import * as Yup from 'yup';
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { environmentaldatas } from '../../../constant/defaultValues';
import { AiFillCloseCircle } from 'react-icons/ai';
import TickLabel from './TickLabel';
import ImageCropModal from '../../../components/constants/ImageCropModal';
import { ChangeSvgColorPassingBE } from '../CustomSvg';
import AutosaveForm from './AutoSaveForm';
import debounce from 'lodash/debounce';
import { FiSearch } from "react-icons/fi";
import { GoPlus } from "react-icons/go";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { TfiLocationPin } from "react-icons/tfi";
import { HiOutlineWindow } from "react-icons/hi2";
import CustomDropdown2 from "../../../components/common/CustomDropDown2";
import ImageUploader from '../../../components/constants/imageCropNew';
import { useDrag, useDrop } from 'react-dnd';
import { handleBlockEnter } from '../Helpers/constants/constant';

const ValidationSchema = Yup.object().shape({
    // safety_name: Yup.string().required('This field is required.'),
    // icon: Yup.string().required('This field is required.'),

})

const AdvertisementSideBar = ({
    id,
    floorID,
    setAddNew,
    addNew,
    selAd,
    setSelAd,
    projectSettings,
    selFloorPlanDtls,
    safeties,
    setSafeties,
    getAdvertisementList,
    onEditAd,
    setSafetyIcons,
    safetyIcons,
    onSideBarIconClick,
    activeTab,
    savingTimer, setSavingTimer,
    handleEnableDisable,
    setFloorID,
    getFloorPlanByid,
    adList,
    setAdList,
    searchTerm,
    setSearchTerm,
    setCommonSidebarVisible,
    setIsDirty,
    isDirty,
    setPanTool

}) => {
    const { image_url } = environmentaldatas;


    const initialValue = {
        safety_name: '',
        // message: '',
        safety_color: ''

    }
    if (selAd?.position) {
        initialValue.position = selAd?.position
    }

    // const [searchTerm, setSearchTerm] = useState('');
    const [mapDivSize, setMapDivSize] = useState(window.innerHeight - 70)
    const [backClick, setBackClick] = useState(false);
    const [fileKey, setFileKey] = useState(Date.now());
    const ref = useRef();

    const [selected, setSelected] = useState(1);
    const [modal, setModal] = useState(false);
    const [error, setError] = useState()
    const toggle2 = () => setModal(!modal);
    const [previewImage, setPreviewImage] = useState(null);
    const [croppedImage, setCroppedImage] = useState(null);
    const [blobImage, setBlobImage] = useState(null);
    const [postCall, setPostCall] = useState(false);
    const [locationValues, setLocationValues] = useState();

    let selectedIndex = null


    const Groupstack = <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" fill="none">
        <g>
            <title>Layer 1</title>
            <path id="svg_1" fill="#6A6D73" d="m7.58984,0.45996l-2.24551,2.24719l4.50225,0l-2.24551,-2.24719l-0.01123,0zm-7.5,3.75281l0,1.50561l14.99996,0l0,-1.50561l-14.99996,0zm0,3l0,1.50561l14.99996,0l0,-1.50561l-14.99996,0zm0,3.00003l0,1.5056l14.99996,0l0,-1.5056l-14.99996,0zm5.25449,3l2.24551,2.2472l2.24551,-2.2472l-4.50224,0l0.01122,0z" />
        </g>
    </svg>

    const addAdvertisementClick = () => {
        if (projectSettings?.is_basic == 0 && adList?.length >= 2) {
            toast.warning('Sorry! You can only add 2 banners in the free plan.')
        } else {
            setPanTool(false)
            // if (floorID) {
            setSelAd();
            setAddNew(true);
            setBlobImage();
            setCroppedImage();
            setPreviewImage();
            // } else {
            //     toast.warning('Please select a floor plan to add advertisement')
            // }
        }
    }

    const dateFormatYYYYMMDD = (inputDateString) => {
        if (inputDateString) {
            const inputDate = new Date(inputDateString);

            // Get day, month, and year
            const day = String(inputDate.getDate()).padStart(2, '0');
            const month = String(inputDate.getMonth() + 1).padStart(2, '0'); // Months are zero-based
            const year = inputDate.getFullYear();

            // Formatted date string
            const formattedDate = `${year}-${month}-${day}`;
            return formattedDate;
        } else {
            return ''
        }

    }


    const handleAdvertisementSubmit = async (values, setFieldError) => {
        console.log(values)
        setSavingTimer(true);

        let value = {
            customer_id: projectSettings?.enc_customer_id ?? getCurrentUser()?.user?.common_id,
            project_id: id,
            banner_name: values?.banner_name,
            start_date: dateFormatYYYYMMDD(values?.start_date),
            end_date: dateFormatYYYYMMDD(values?.end_date),
            ad_type: values?.ad_type,
            duration: values?.duration,
        }
        if (values?.enc_id) {
            // value.id = values?.enc_id
            value.is_published = '0';
            value.discard = '1';
            value.publish = '1';
            value._method = 'PUT';
        }
        if (values?.ad_type == 1) {
            value.link = values?.link ?? ''
        } else {
            value.type = values?.type ?? ''
            value.type_id = values?.type_id ?? ''
        }
        if (croppedImage?.startsWith('data:image')) {
            const base64Logo = croppedImage;
            value.ad_image = blobImage
        } else {
            const trimmedImageUrl = (values?.ad_image) ? (values?.ad_image?.replace(image_url, '')) : '';
            value.ad_image = trimmedImageUrl ?? ''
        }

        const formData = new FormData();
        for (const key in value) {
            if (value.hasOwnProperty(key)) {
                formData.append(key, value[key]);
            }
        }
        try {
            const reqUrl = values?.enc_id ? `advertisements/${values?.enc_id}` : 'advertisements';
            const response = await postRequest(reqUrl, formData, true);
            const data = response.response?.data ?? [];
            if (response.type === 1) {

                // getSafetyList(floorID)
                handleEnableDisable();
                setBlobImage();
                setCroppedImage();
                setPreviewImage();
                setIsDirty(false);
                setTimeout(() => {
                    setSavingTimer(false)
                }, 1000);
                getAdvertisementList()
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
        getLocationDropdowns()
    }, [])

    const filteredData = adList.filter((val) => {
        const {
            banner_name = '',
        } = val;
        if (searchTerm === '') {
            return val;
        }
        return (
            banner_name?.toLowerCase().includes(searchTerm.toLowerCase())

        );
    });


    const deleteAd = async (id) => {
        try {
            const response = await deleteRequest(`advertisements/${id}`);
            const data = response.data ?? [];
            toast.success(data?.message);
            let floor_id
            setFloorID((prev) => {
                floor_id = prev;
                return prev;
            });
            getAdvertisementList();
            handleEnableDisable();
        } catch (error) {
            console.log(error);
        }
    }

    const removeAd = (row) => {
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
                        deleteAd(row?.enc_id)
                        break;
                    default:
                        break;
                }
            });
    }

    const editClick = (item) => {
        setPanTool(false)
        onEditAd(item)
        // getFloorPlanByid(floorID, 'advertisements', "0", "default", item);
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
        arr.splice(toIndex, 0, element); // Insert the element at toIndex
        return arr;
    }


    const moveCard = useCallback((dragIndex, hoverIndex, adsArray) => {
        // console.log(dragIndex, hoverIndex)

        let arr = moveElementToIndex(adsArray, dragIndex, hoverIndex)
        // console.log(arr)
        setAdList([...arr])
        const dragArray = arr?.map((floor, index) => ({
            id: floor?.enc_id,
            index: index
        }));
        console.log(dragArray)
        dragAndDropApi(dragArray)
    }, [])


    const dragAndDropApi = async (floors) => {
        let value = {
            type: 4,
            drag_drop: floors,
            is_published: '0',
            project_id: projectSettings?.enc_id,
        }
        // console.log( projectSettings?.enc_id,"project_id: projectSettings?.enc_id,");
        try {
            const reqUrl = 'drag-drop'
            const response = await postRequest(reqUrl, value);
            const data = response.data ?? [];
            console.log(data, 'drag-drop')
            // getAdvertisementList()
            handleEnableDisable();
        } catch (error) {
            console.log(error);
        }
    }

    const AdvertisementItems = ({ item, index, adsArray }) => {
        const ref = useRef(null)

        const [{ handlerId }, drop] = useDrop({
            accept: 'adItem',
            drop() {
                getAdvertisementList() 
                selectedIndex = null
              },
            collect(monitor) {
                return {
                    handlerId: monitor.getHandlerId(),
                }
            },
            hover(item, monitor) {
                if (!ref.current) {
                    return
                }
                const dragIndex = item.index
                const hoverIndex = index
                // Don't replace items with themselves
                if (dragIndex === hoverIndex) {
                    return
                }
                // Determine rectangle on screen
                const hoverBoundingRect = ref.current?.getBoundingClientRect()
                // Get vertical middle
                const hoverMiddleY =
                    (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2
                // Determine mouse position
                const clientOffset = monitor.getClientOffset()
                // Get pixels to the top
                const hoverClientY = clientOffset.y - hoverBoundingRect.top
                // Only perform the move when the mouse has crossed half of the items height
                // When dragging downwards, only move when the cursor is below 50%
                // When dragging upwards, only move when the cursor is above 50%
                // Dragging downwards
                if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
                    return
                }
                // Dragging upwards
                if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
                    return
                }
                // Time to actually perform the action
                moveCard(dragIndex, hoverIndex, adsArray)
                // Note: we're mutating the monitor item here!
                // Generally it's better to avoid mutations,
                // but it's good here for the sake of performance
                // to avoid expensive index searches.
                item.index = hoverIndex
                selectedIndex = hoverIndex
            },
        })
        const [{ isDragging }, drag] = useDrag({
            type: 'adItem',
            item: () => {
                return { index, id }
            },
            end: () => {
                // console.log(adsArray,"droped");
                selectedIndex = null
                setAdList(adsArray)
            },
            collect: (monitor) => ({
                isDragging: monitor.isDragging(),
            }),
        })
        const opacity = (
            // isDragging &&
            selectedIndex === index) ? 0 : 1
        // console.log(isDragging,index,selectedIndex,"selectedIndexselectedIndex");
        drag(drop(ref))
        return (
            <div className='drag-wrpr mxx-3' style={{ opacity }} data-handler-id={handlerId} ref={ref}  >
                <div className='drag-item' style={{ padding: '0px 4px 0px 0px' }} >
                    {/* <RxDragHandleHorizontal size={16} color='gray' /> */}
                    <div className='magical-words' style={{
                        height: '34px',
                        width: '34px',
                        backgroundColor: '#e5e5e5',
                        borderRadius: '4px',
                        paddingLeft: '2px',
                        paddingTop: '2px'
                    }}>
                        {Groupstack}
                    </div>
                    <div>
                        <p>{item?.banner_name}</p>
                    </div>
                    <div className='flex-grow-1' />
                    <div className='edit-square magical-words' onClick={() => editClick(item)}  >
                        <BiSolidPencil fontSize={15} />
                    </div>
                </div>
                <div className='ml-2  rounded-circle' onClick={() => removeAd(item)} style={{ backgroundColor: '#E5E5E5', cursor: 'pointer', marginBottom: '8px', padding: '4px' }} >
                    <IoMdClose fontSize={10} />

                </div>
            </div>
        )
    }


    const renderAdvertisementItem = useCallback((item, index, adsArray) => {
        return (
            <AdvertisementItems
                key={item.id}
                index={index}
                id={item.id}
                item={item}
                moveCard={moveCard}
                adsArray={adsArray}
            />
        )
    }, [])

    const goBack = () => {
        if (addNew) {
            setBackClick(true)
            document.getElementById("advertisementSubmitBtn")?.click();

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


    // const [debouncedAutoSave] = useState(() => debounce(handleAutoSave, 500));
    const BorderWidthComp = ({ label, value, onChange, name }) => {
        return (
            <div className="color-input-wrpr">
                <p className="label color-labels">{label}</p>

                <div
                // className=" input-wrpr-width"
                // style={{ width: "36%", marginTop: "0px" }}
                >
                    {/* <img src={BoderThickIco} alt='' className='color-picker' style={{ backgroundColor: value }} /> */}
                    {/* <RxBorderWidth /> */}
                    <input
                        value={value}
                        onChange={(e) => {
                            // e.stopPropagation();
                            onChange(e.target.value);
                        }}
                        className="form-control"
                        type="number"
                        name={name}
                        style={{ width: 100 }}
                        // min={0}
                        placeholder='Sec'
                    />
                </div>
            </div>
        );
    };

    const handleURL = (setFieldValue) => {
        setSelected(1);
        setFieldValue('ad_type', 1)
    }
    const handlePin = (setFieldValue) => {
        setSelected(2);
        setFieldValue('ad_type', 2)

    }
    const onSelectImg = async (e) => {
        const file = e?.target?.files[0];
        const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];

        if (file && !allowedTypes.includes(file.type)) {
            toast.warning('Sorry! Only JPEG, PNG, and JPG files are allowed for upload.');
            return;
        }
        // setFieldValue(e)
        setFileKey(Date.now());
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviewImage(reader.result);
            //   onReset()
            setModal(true);

        };
        if (file) {
            reader.readAsDataURL(file);
        }

    }
    const onValueChange = (value, type, setFieldValue) => {

        if (type == 'end_date') {
            setFieldValue(`end_date`, value)

        } else {
            setFieldValue(`start_date`, value)

        }

    }

    const getLocationDropdowns = async () => {
        try {
            const response = await getRequest(`location-dropdown/${id}`);
            console.log(response, 'response');
            const DataRes = response?.data?.data ?? [];
            let data = DataRes?.map((prev) => ({
                ...prev, value: prev?.enc_id,
                label: `${prev?.location_name ?? prev?.product_name} - ${prev?.floor_plan}`,
            }));
            setLocationValues(data)


        } catch (error) {
            //console.log(error);
        }
    }


    return (
        <div className="bar ad-bar" id="inner-customizer2" style={{ position: 'relative', height: mapDivSize, paddingBottom: '20px' }} >
            <Row className='backRow'>
                <Col md={8}>
                    <h1>Advertising  {addNew ? 'Banner Details' : 'Banners'}</h1>
                </Col>

                <Col md={4} >
                    {addNew ? (
                        <div>
                            <div className='plus-icon float-right' style={{ marginRight: '15px' }} onClick={() => goBack()} >
                                <IoMdCheckmark />
                            </div>
                            <div className='backArrow float-right' style={{ marginRight: '5px' }} onClick={() => {
                                onSideBarIconClick(activeTab);
                                setCroppedImage();
                                setSelAd({ dirty: false });
                            }}>
                                <MdBlock />
                            </div>

                        </div>
                    ) : (
                        <div className='backArrow float-right' hidden={savingTimer} onClick={() => goBack()}>
                            <BsArrowLeftShort />
                        </div>
                    )}

                </Col>
            </Row>
            <Formik
                initialValues={{
                    banner_name: '',
                    start_date: '',
                    end_date: '',
                    ad_type: 1,
                    duration: '',
                    link: '',
                    type_id: '',
                    ad_image: '',
                    type: '',
                    ...selAd
                }}
                validationSchema={ValidationSchema}
                onSubmit={(values, setFieldError) => {
                    handleAdvertisementSubmit(values, setFieldError)
                }}

                enableReinitialize
            >
                {({
                    dirty,
                    errors,
                    values,
                    touched,
                    handleSubmit,
                    handleChange,
                    setFieldValue,
                    setFieldError
                }) => (
                    <>
                        {/* <Row className='backRow'>
                            {console.log(values, 'values')}
                            <Col md={8}>
                                <h1>Advertising  {addNew ? 'Banner Details' : 'Banners'}</h1>
                            </Col>
                            {console.log(dirty, 'dirty')}
                            <Col md={4} >
                                <div className='backArrow float-right' hidden={savingTimer} onClick={() => goBack(dirty)}>
                                    <BsArrowLeftShort />
                                </div>
                            </Col>
                        </Row> */}

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
                                                    <div className="marginBottom d-flex">
                                                        <Label for="exampleName" className="form-labels mr-3">Name</Label>
                                                        <div style={{ width: '100%' }}>
                                                            <Field
                                                                id="exampleName"
                                                                className="form-control"
                                                                type="text"
                                                                placeholder="Please Type"
                                                                name="banner_name"
                                                                autoComplete="off"
                                                                value={values?.banner_name}
                                                                onChange={(e) => {
                                                                    handleChange(e)
                                                                    setSelAd(prev => ({ ...prev, ...values, banner_name: e.target.value }))
                                                                    setIsDirty(true);
                                                                }}
                                                            />
                                                            {errors.banner_name && touched.banner_name ? (
                                                                <div className="text-danger mt-1">
                                                                    {errors.banner_name}
                                                                </div>
                                                            ) : null}
                                                        </div>

                                                    </div>
                                                    {/* <Row>
                                                        <Col md={12}> */}
                                                    {(croppedImage || values?.ad_image) ? <img src={croppedImage ?? values.ad_image} className='ad-img mt-3' style={{ cursor: 'pointer' }} onClick={() => ref.current.click()} /> :
                                                        <div className='select-logo ad mt-3' onClick={() => ref.current.click()} >
                                                            <p>+</p>
                                                        </div>
                                                    }
                                                    <input type='file' key={fileKey} ref={ref} hidden onChange={onSelectImg} accept=' .png, .jpg, .jpeg,'
                                                    />
                                                    <p className='mt-2 recomended-res-label'>Recommended Resolution:  1035 × 150 px</p>
                                                    {errors.ad_image && touched.ad_image ? (
                                                        <div className="text-danger mt-1">
                                                            {errors.ad_image}
                                                        </div>
                                                    ) : null}
                                                    {/* </Col>
                                                    </Row> */}
                                                    <div className='dt-wrpr d-flex mt-3' >
                                                        <Label for="exampleName" className="form-labels " style={{ width: '50%' }}>Date Range</Label>
                                                        <div className='mr-2'>
                                                            <DatePicker
                                                                name='start_date'
                                                                selected={values?.start_date}
                                                                onChange={(e) => {
                                                                    onValueChange(e, 'start_date', setFieldValue);
                                                                    setIsDirty(true);
                                                                }}
                                                                // onBlur={handleBlur}
                                                                dateFormat="dd-MM-yy"
                                                                placeholderText='Select '
                                                                // readOnly={readOnly}
                                                                // disabled={disabled}
                                                                className="form-control datePicker datePicker custom-datepicker-page bgGrey mr-3"
                                                            />
                                                            {errors.start_date && touched.start_date ? (
                                                                <div className="text-danger mt-1">
                                                                    {errors.start_date}
                                                                </div>
                                                            ) : null}
                                                        </div>
                                                        <div>
                                                            <DatePicker
                                                                name='end_date'
                                                                selected={values?.end_date ?? ''}
                                                                onChange={(e) => {
                                                                    onValueChange(e, 'end_date', setFieldValue);
                                                                    setIsDirty(true);
                                                                }}
                                                                // onBlur={handleBlur}
                                                                dateFormat="dd-MM-yy"
                                                                placeholderText={'Ongoing'}
                                                                style={{ backgroundColor: '#ccc' }}
                                                                // readOnly={readOnly}
                                                                // disabled={disabled}
                                                                className={`form-control datePicker datePicker custom-datepicker-page bgGrey `}
                                                            />
                                                            {errors.end_date && touched.end_date ? (
                                                                <div className="text-danger mt-1">
                                                                    {errors.end_date}
                                                                </div>
                                                            ) : null}
                                                        </div>

                                                        {/* {check ? */}

                                                        {/* : <> */}

                                                        {/* <input className='form-control '  value={'Ongoing'} onClick={(e) => onValueChange2(e)} /> */}
                                                        {/* </> */}
                                                        {/* } */}

                                                    </div>

                                                    <div className="marginBottom d-flex mt-3">
                                                        <Label for="exampleName" className="form-labels d-flex align-items-center" style={{ width: '100%' }}>Link</Label>

                                                        <div className="selectors">
                                                            <div className="selecotr-item">
                                                                <input
                                                                    type="radio"
                                                                    id="radio1"
                                                                    name="ad_type"
                                                                    className="selector-item_radio"
                                                                    onChange={() => {
                                                                        handleURL(setFieldValue); setIsDirty(true)
                                                                    }
                                                                    } // update the selected state when this radio button is clicked
                                                                    checked={values?.ad_type == 1}
                                                                />
                                                                <label htmlFor="radio1" className="selector-item_label magical-words">
                                                                    <div className='mr-1'>
                                                                        <svg width="16.1232" height="15.3366" xmlns="http://www.w3.org/2000/svg">
                                                                            <g>
                                                                                <title>Url</title>
                                                                                <g id="c">
                                                                                    <path id="svg_1" stroke-width="0px" fill={values?.ad_type == 1 ? '#25a2db' : '#666'} d="m13.8815,0l-11.6398,0c-1.2358,0 -2.2417,1.0059 -2.2417,2.2417l0,10.8533c0,1.2358 1.0059,2.2417 2.2417,2.2417l11.6398,0c1.2358,0 2.2417,-1.0059 2.2417,-2.2417l0,-10.8533c0,-1.2358 -1.0059,-2.2417 -2.2417,-2.2417zm-7.7156,2.0051c0.3682,0 0.6666,0.2984 0.6666,0.6668c0,0.368 -0.2984,0.6664 -0.6666,0.6664s-0.6666,-0.2984 -0.6666,-0.6664c0,-0.3684 0.2984,-0.6668 0.6666,-0.6668zm-1.7498,0c0.3681,0 0.6666,0.2984 0.6666,0.6668c0,0.368 -0.2985,0.6664 -0.6666,0.6664s-0.6666,-0.2984 -0.6666,-0.6664c0,-0.3684 0.2984,-0.6668 0.6666,-0.6668zm-1.7706,0c0.3681,0 0.6666,0.2984 0.6666,0.6668c0,0.368 -0.2984,0.6664 -0.6666,0.6664s-0.6666,-0.2984 -0.6666,-0.6664c0,-0.3684 0.2984,-0.6668 0.6666,-0.6668zm12.7695,11.0899c0,0.8459 -0.6877,1.5335 -1.5335,1.5335l-11.6398,0c-0.8459,0 -1.5335,-0.6877 -1.5335,-1.5335l0,-7.9235l14.7068,0l0,7.9235z" class="d" />
                                                                                </g>
                                                                            </g>
                                                                        </svg>
                                                                    </div>
                                                                    URL
                                                                </label>
                                                            </div>
                                                            <div className="selecotr-item">
                                                                <input
                                                                    type="radio"
                                                                    id="radio2"
                                                                    name="ad_type"
                                                                    className="selector-item_radio"
                                                                    value={2}
                                                                    onChange={() => {
                                                                        handlePin(setFieldValue)
                                                                        setIsDirty(true)
                                                                    }} // update the selected state when this radio button is clicked
                                                                    checked={values?.ad_type == 2}


                                                                />
                                                                <label htmlFor="radio2" className="selector-item_label magical-words">
                                                                    <div className='mr-1'>
                                                                        <svg width="14.2222" height="18.33" xmlns="http://www.w3.org/2000/svg">
                                                                            <g>
                                                                                <title>pin</title>
                                                                                <g id="c">
                                                                                    <path id="svg_1" stroke-width="0px" fill={values?.ad_type == 2 ? '#25a2db' : '#666'} d="m7.1115,0c-3.9212,0 -7.1115,3.1903 -7.1115,7.1115c0,1.0564 0.2627,2.18 0.7601,3.2489c0.3639,0.78 1.1685,1.8927 1.259,2.0168c1.0178,1.3961 4.6251,5.4304 4.7781,5.6014l0.3143,0.3514l0.3143,-0.3514c0.153,-0.171 3.7599,-4.2054 4.7777,-5.6014c0.0906,-0.1241 0.8952,-1.2368 1.259,-2.0168c0.497,-1.0681 0.7597,-2.1917 0.7597,-3.2489c0,-3.9212 -3.1899,-7.1115 -7.1107,-7.1115zm-0.0004,10.401c-1.9114,0 -3.4667,-1.5553 -3.4667,-3.4675s1.5553,-3.4667 3.4667,-3.4667s3.4671,1.5553 3.4671,3.4667s-1.5553,3.4675 -3.4671,3.4675z" class="d" />
                                                                                </g>
                                                                            </g>
                                                                        </svg>
                                                                    </div>
                                                                    Pin
                                                                </label>
                                                            </div>
                                                        </div>
                                                        {errors.icon && touched.icon ? (
                                                            <div className="text-danger mt-1">
                                                                {errors.icon}
                                                            </div>
                                                        ) : null}
                                                    </div>
                                                    <div className='mt-3'>

                                                        {values?.ad_type == 2 ?

                                                            <>

                                                                <CustomDropdown2
                                                                    name="type_id"
                                                                    options={locationValues}
                                                                    setFieldValue={setFieldValue}
                                                                    values={selAd}
                                                                    setCustomerValues={{}}
                                                                    selectValue={values?.type_id}
                                                                    onChange={(e) => {
                                                                        // console.log(e),
                                                                            setFieldValue('type_id', e?.enc_id);
                                                                        setFieldValue('type', e?.type);

                                                                        setIsDirty(true)
                                                                    }

                                                                    }
                                                                />
                                                                {errors.type_id && touched.type_id ? (
                                                                    <div className="text-danger mt-1">
                                                                        {errors.type_id}
                                                                    </div>
                                                                ) : null}
                                                            </>


                                                            :
                                                            <>

                                                                <input type='text'
                                                                    name='link'
                                                                    className='form-control'
                                                                    onChange={(e) => {
                                                                        handleChange(e);
                                                                        setIsDirty(true)
                                                                    }}
                                                                    value={values?.link}
                                                                    placeholder="Please Type (Eg. www.demo.com)"
                                                                />
                                                                {errors.link && touched.link ? (
                                                                    <div className="text-danger mt-1">
                                                                        {errors.link}
                                                                    </div>
                                                                ) : null}
                                                            </>

                                                        }


                                                    </div>
                                                    <div className='mt-3'>
                                                        <BorderWidthComp
                                                            label="Duration"
                                                            name="duration"
                                                            value={values?.duration}
                                                            onChange={(e) => {
                                                                setFieldValue('duration', e);
                                                                setIsDirty(true)
                                                            }}
                                                        />

                                                        {errors.duration && touched.duration ? (
                                                            <div className="text-danger mt-1">
                                                                {errors.duration}
                                                            </div>
                                                        ) : null}

                                                    </div>

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
                                                        id='advertisementSubmitBtn'
                                                        hidden
                                                    >
                                                        Submit
                                                    </Button>

                                                </div>
                                            </div>
                                            <ImageUploader
                                                onSubmit={(blob, url, blobUrl) => {
                                                    console.log(blobUrl, 'blobUrl')
                                                    setCroppedImage(url);
                                                    setBlobImage(blob);
                                                    setIsDirty(true)
                                                    setSelAd(prev => ({ ...prev, ...values, ad_image: blob }))
                                                }}
                                                onCancel={() => {
                                                    // setCroppedImage(null);
                                                    console.log("Cancelled");
                                                }}
                                                sourceImageUrl={previewImage}
                                                setSourceImageUrl={setPreviewImage}
                                                openCropModal={modal}
                                                setOpenCropModal={setModal}
                                                toggle={toggle2}
                                                name={`ad_image`}
                                                setFieldValue={setFieldValue}
                                                setPostCall={setPostCall}
                                                page='ad'
                                                imgAspect={345 / 50}
                                                diasbleFreeFlow={true}

                                            />
                                            {/* ) : (
                                                <div className='click-map-alert'>
                                                    <div className='warning-pin-div'>
                                                        <div className="d-flex align-items-center justify-content-center mb-2">
                                                            <div className="info-cont">
                                                                <FaInfo />
                                                            </div>
                                                        </div>
                                                        <div className=" text-center  ">
                                                            <p className='label color-labels' >Click on the map to mark your safety pin. Once you have drawn the safety pin, you can cover the fields and create it.</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )} */}
                                        </div>
                                    </div>
                                    :
                                    <>
                                        <div className='bar-sub-header' style={{ marginRight: '14px' }} >
                                            <p style={{ marginTop: 0 }} >Add New Advertising Banner</p>
                                            <div className='plus-icon' onClick={() => addAdvertisementClick()}>
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
                                            {filteredData.filter(p => p?.floorId === selFloorPlanDtls?.id)?.map((plan, idx) => renderAdvertisementItem(plan, idx, filteredData))}

                                        </div>

                                    </>}
                            {/* <Label for="exampleEmail1" className="form-labels">Name</Label> */}
                        </form>
                    </>
                )}
            </Formik>
        </div>
    )
}


export default AdvertisementSideBar;

