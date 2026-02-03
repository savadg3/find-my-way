import { Field, Formik } from 'formik'
import React, { useCallback, useRef, useState, useEffect } from 'react'
import { Button, Label, Row, Col, Modal, ModalBody, ModalHeader, Card, CardBody, Spinner } from 'reactstrap'
import { BsArrowLeftShort } from 'react-icons/bs';
import { BiSolidPencil } from 'react-icons/bi'
import { FaChevronDown, FaEdit, FaInfo, FaMapMarkerAlt, FaTimes } from 'react-icons/fa';
import { HiDotsVertical } from "react-icons/hi";
import { IoMdCheckmark, IoMdClose } from 'react-icons/io'
import ProdSpecItem, { LocationWebListItem } from './ProdSpecItem'
import { ProductSvg } from "../CustomSvg";
import TagInputComp from '../../../components/tagInput/TagInputComp';
import { postRequest, getRequest, deleteRequest } from '../../../hooks/axiosClient';
import { getCurrentUser } from '../../../helpers/utils';
import { SetBackEndErrorsAPi } from '../../../hooks/setBEerror';
import * as Yup from 'yup';
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { environmentaldatas } from '../../../constant/defaultValues';
import ImageUploader from '../../../components/constants/imageCropNew';
import AutosaveForm from './AutoSaveForm';
import { FiSearch } from "react-icons/fi";
import { GoPlus } from "react-icons/go";
import ColorPicker from '../../../components/common/Colorpicker';
import PaymentForm from '../../../components/stripe/payment';
import { PlanExpiryDetails, deletePinApi, deleteSubPinApi, removePinApi, revertPackage } from '../Helpers/apis/otherApis';
import { handleBlockEnter } from '../Helpers/constants/constant';
import { ProPinModal } from '../Helpers/modal/proPinModal';
import { DragPreviewImage, useDrag, useDrop } from 'react-dnd';
import DragPinImage from '../../../assets/icons/deleteIcon.png'
import { getProductPin, getProductPinDragPreview } from '../Helpers/getPinIcons';
import BulkUploadPin from '../Helpers/modal/BulkUploadModal';
import { removeFabricObjectsEncId } from '../Helpers/bringFabricObjects';
import UndraggedDiv from '../Helpers/modal/UndraggedDiv';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import { getEmptyImage } from 'react-dnd-html5-backend';
import CommonDropdown from '../../../components/common/CommonDropdown';


const { image_url } = environmentaldatas;
// const urlRegex = /^(https:\/\/|www\.)[a-zA-Z0-9-]+(\.[a-zA-Z]{2,})+$/;
// const urlRegex = /^(https?:\/\/)?(www\.)?[a-zA-Z0-9-]+(\.[a-zA-Z]{2,})(\/[\w\-./?%&=]*)?$/;
const urlRegex = /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/[^\s]*)?$/i;

const ValidationSchema = Yup.object().shape({
    product_name: Yup.string(),
        // .required('This field is required.'),
    // product_code: Yup.string().required('This field is required.'),
    websiteLink: Yup.array().of(
            Yup.object().shape({
                label: Yup.string()
                    .required("Name is required")
                ,
                value: Yup.string()
                    .required("URL is required")
                    .test("is-valid-url", "Enter a valid URL ", function (val) {
                    const { path, createError } = this;
    
                    if (!val || urlRegex.test(val.trim())) {
                        return true;
                    }
                        
                    return createError({ path, message: "Enter a valid URL" });
                }),
            })
        ),
})

const ProductSideBar = ({
    selProductDtls,
    setSelProductDtls,
    selFloorPlanDtls,
    id, floorID,
    projectSettings,
    addNew, setAddNew,
    getProductList,
    images,
    setImages,
    specifications,
    setSpecifications,
    onSideBarIconClick,
    activeTab,
    savingTimer, setSavingTimer,
    handleEnableDisable,
    totalPinsUsed,
    setFloorID,
    productList,
    getFloorPlanByid,
    searchTerm,
    setSearchTerm,
    setCommonSidebarVisible,
    dropDownFloor,
    setIsDirty,
    isDirty,
    setPanTool,
    stopPathDrawing,
    canvas,
    onEditProduct,
    setStoredObjects,
    setwebsiteLinks,
    websiteLinks
}) => {

    const initialValues = {
        // product_name: 'New product',
        // product_name: '! New product',
        product_name: '',
        // product_code: products?.length + 1,
        product_code: null,
        tags: selProductDtls?.tags ?? projectSettings?.product_tags ?? [],
        description: '',
        website: '',
        websiteLink:websiteLinks || [],
        specifications: [],
        boundary_color: null,
        boundary_attributes: null,
        product_color: null,
        enc_id: null,
        position: null,
        // position: { x: 0, y: 0 },
        ...selProductDtls
    }

    const imgInputRef = useRef()
    const fileInputRef = useRef()
    const [mapDivSize, setMapDivSize] = useState(window.innerHeight - 80)
    
    const [isPinGroup, setIsPinGroup] = useState(false);

    const [deletedImages, setDeletedImages] = useState([]);
    const [imagesForpost, setImagesForpost] = useState([]);
    const [previewImage, setPreviewImage] = useState(null);
    const [croppedImage, setCroppedImage] = useState(null);
    const [blobImage, setBlobImage] = useState(null);
    const [postCall, setPostCall] = useState(false);
    const [modal, setModal] = useState(false);
    const toggle2 = () => setModal(!modal);
    const [fileKey, setFileKey] = useState(Date.now());
    const [planDetails, setPlanDetails] = useState();
    const [modalPlan, setModalPlan] = useState(false);
    const [modalBulk, setModalBulk] = useState(false);
    const toggle3 = () => setModalPlan(!modalPlan);
    const [stripeModal, setStripeModal] = useState(false);
    const toggleStripe = () => setStripeModal(!stripeModal);
    const [backClick, setBackClick] = useState(false);
    const [color, setColor] = useState(null);
    const [openPicker, setOpenPicker] = useState(null);
    const [filteredData, setFilteredData] = useState([]);

    const [parentList, setParantList] = useState([]);
    // const [assignDetails, setAssignDetails] = useState({});

    const accordianListOpen = useRef([])

    const addProductClick = () => {
        if (totalPinsUsed?.used_products == totalPinsUsed?.total_products) {
            PlanExpiryDetails(id, setPlanDetails, setModalPlan);
        } else if (totalPinsUsed?.used_products == totalPinsUsed?.total_products) {
            PlanExpiryDetails(id, setPlanDetails, setModalPlan);
        } else if (totalPinsUsed?.used_products == totalPinsUsed?.total_products) {
            PlanExpiryDetails(id, setPlanDetails, setModalPlan);
        } else {
            addClick();
            document.getElementById("productSubmitBtn")?.click();
        }
    }

    const planCheck = () => {
        if (totalPinsUsed?.used_products == totalPinsUsed?.total_products) {
            PlanExpiryDetails(id, setPlanDetails, setModalPlan);
            setTimeout(() => {
                removeFabricObjectsEncId(canvas, selProductDtls?.enc_id, 'product')
            }, 2000);
            setSavingTimer(false)
            return
        } else if (totalPinsUsed?.used_products == totalPinsUsed?.total_products) {
            PlanExpiryDetails(id, setPlanDetails, setModalPlan);
            setTimeout(() => {
                removeFabricObjectsEncId(canvas, selProductDtls?.enc_id, 'product')
            }, 2000);
            setSavingTimer(false)

        } else if (totalPinsUsed?.used_products == totalPinsUsed?.total_products) {
            PlanExpiryDetails(id, setPlanDetails, setModalPlan);
            setTimeout(() => {
                removeFabricObjectsEncId(canvas, selProductDtls?.enc_id, 'product')
            }, 2000);
            setSavingTimer(false)
            return
        } else {
            document.getElementById("productSubmitBtn")?.click();
            setSelProductDtls((prev) => ({
                ...prev,
                isDrop: false
            }));
        }
    }

    const addClick = () => {
        setPanTool(false)
        if (floorID) {
            // setAddNew(true)
            setSelProductDtls()
            setImagesForpost([])
            setImages([])
            setDeletedImages([])
            setSpecifications([])
            setwebsiteLinks([])
            setCroppedImage(null)

        } else {
            toast.warning('Please select a floor plan to add a product')
        }
    }

    const bulkUploadClick = (type) => {
        if (floorID) {
            setModalBulk(type)
        } else {
            toast.warning('Please select a floor plan to bulk upload.')
        }
    };

    useEffect(() => {
        getProductList(floorID)
    }, [floorID])

    const addProduct = async (values, setFieldError) => {

        // console.log(selProductDtls, projectSettings, "selselProductDtls");
        
        // return

        let floor_id
        setFloorID((prev) => {
            floor_id = prev;
            return prev;
        });

        if (values?.enc_id && values?.isDrop) {
            planCheck()
            return
        }

        setSavingTimer(true);
        let uniqueImages = imagesForpost.filter((value, index, self) => {
            return self.indexOf(value) === index;
        });

        for (let image of uniqueImages) {
            if (croppedImage) {
                image = image;
            } else {
                image = null;
            }
        }


        const filteredspecifications = specifications.filter((obj) => {
            return Object.values(obj).some((val) => val !== null && val !== undefined);
        });
        
        const filteredwebsites = websiteLinks?.filter((obj) => {
            return Object.values(obj).some((val) => val !== null && val !== undefined);
        });
        
        const filtergroupitems = productList?.filter((obj) => obj.type == 2);
        // if (values.position) {

        let value = {
            customer_id: projectSettings?.enc_customer_id ?? getCurrentUser()?.user?.common_id,
            product_name: values?.product_name ?? "! New product",
            project_id: id,
            tags: values?.tags,
            // floor_plan_id: selFloorPlanDtls?.enc_id,
            floor_plan_id: values?.position === null ? null : (values?.enc_floor_plan_id ?? floor_id ?? floorID ?? selFloorPlanDtls?.enc_id),
            // image_path: uniqueImages?.length == 0 ? null : uniqueImages?.map(el => el),
            // deleted_images: deletedImages,
            product_code: values?.product_code,
            description: values?.description,
            specifications: JSON.stringify(filteredspecifications),
            website: JSON.stringify(filteredwebsites),
            // website: values?.website,
            product_color: values?.product_color ?? projectSettings?.product_color,
            boundary_color: values?.boundary_color,
            positions: values?.position ?? null,
        }

        if (selProductDtls?.product_id) {
            value = {
                ...value,
                product_id: selProductDtls?.product_id,
                type:3
            }
        }

        if (isPinGroup) {
            value.type = 2
            if (values?.product_name && values.product_name.trim() !== "") {
                value.product_name = values.product_name;
            } else {
                value.product_name = `Pin Group`;
                // ${(filtergroupitems?.length || 0) + 1}
            }
        } else {
            if (values?.product_name && values.product_name.trim() !== "") {
                value.product_name = values.product_name;
            } else {
                value.product_name = "! New product"
            }
        }

        if (values?.enc_id) {
            value.id = values?.enc_id
            value.is_published = '0';
            value.discard = '1';
            value.publish = '1';
        }

        try {
            const reqUrl = `product`
            const response = await postRequest(reqUrl, value);
            const data = response.response?.data ?? [];
            if (response.type === 1) {
                setImagesForpost([])
                setCroppedImage()
                setDeletedImages([])
                
                if (values?.enc_id && isDirty) {
                    setSelProductDtls((prev) => ({ ...prev, ...values, enc_id: data?.id }));
                } else {
                    setSelProductDtls();
                }

                if (values?.assignDetails) {
                    let { customer_id, project_id, prev_id, product_id, type } = values?.assignDetails
                    moveProductToGroup({
                        customer_id, project_id, prev_id, product_id, type
                    })
                }

                if (isPinGroup) {
                    addGroupProductClick({enc_id:data?.id})
                } else {
                    getProductList(floorID)
                    handleEnableDisable();
                    setIsDirty(false)
                }
                
                setTimeout(() => {
                    setSavingTimer(false)
                }, 1000);

                if (backClick) {
                    onSideBarIconClick(activeTab);
                    setBackClick(false)
                }

            } else {
                setSavingTimer(false)
                SetBackEndErrorsAPi(response, setFieldError);
            }

            setIsPinGroup(false)
        } catch (error) {
            setSavingTimer(false)
        }

    }


    const moveProductToGroup = async (payload) => {
        try {
            const reqUrl = `product/drop-to-group`
            const response = await postRequest(reqUrl, payload);
            const data = response.response?.data ?? [];
            toast.success(data?.message)
            console.log(data);
        } catch (error) {
            console.log(error);
        }
    }

    const addGroupProductClick = async (item) => {

        let floor_id
        setFloorID((prev) => {
            floor_id = prev;
            return prev;
        });
        
        try {
            // const reqUrl = `group-product`
            const reqUrl = `product`
            // let payloadItem = {
            //     product_name: "! New product",
            //     id: 0,
            //     type: 3,
            //     customer_id:projectSettings?.enc_customer_id ?? getCurrentUser()?.user?.common_id,
            //     project_id: id,
            //     product_id: item?.enc_id,
            //     floor_plan_id:"",
            // }

            let payloadItem = {
                customer_id: projectSettings?.enc_customer_id ?? getCurrentUser()?.user?.common_id,
                product_name: "! New product",
                project_id: id,
                product_id: item?.enc_id,
                floor_plan_id:  floor_id ?? floorID ?? selFloorPlanDtls?.enc_id,
                product_color: projectSettings?.product_color,
                type: 3,
            }
            
            // console.log(item,reqUrl,"kjsbshsdbfdsh");
            const response = await postRequest(reqUrl, payloadItem);
            if (response?.type == 1) {
                getProductList(floorID)
                handleEnableDisable();
                setIsDirty(false)
            }

            // console.log(response,"response");
        } catch (error) {
            console.log(error)
        }
    }

    // const getPinGroupItem = async () => {
    //     try {
    //         const reqUrl = `group-product`
    //         const response = await postRequest(reqUrl, value);
    //     } catch (error) {
    //         console.log(error)
    //     }
    // }

    useEffect(() => {
       let productData = productList.filter((val) => {
            const {
                product_name = '',
                floor_plan = '',
                search_name,
                group_details = []
            } = val;

            if (searchTerm === '') {
                return val;
            }
            const term = searchTerm.toLowerCase();

            const groupMatch = group_details.some(
                (group) => group?.name?.toLowerCase().includes(term)
            );

            return (
                product_name?.toLowerCase().includes(term) ||
                floor_plan?.toLowerCase().includes(term) ||
                search_name?.toLowerCase().includes(term) ||
                groupMatch
            );
        });
        setFilteredData(productData)

        let newList = productList?.filter((item) => item.type == 2)
        newList = newList.map((el) => ({ ...el, value: el.enc_id, label: el.product_name }))
        newList.unshift({ value: null, label: "None" })
        // console.log(newList,"newListnewListnewListnewList");
        setParantList(newList)
    },[productList,searchTerm])

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    // const filteredData = productList.filter((val) => {
    //     const {
    //         product_name = '',
    //         floor_plan = '',
    //         search_name,
    //         group_details = []
    //     } = val;

    //     if (searchTerm === '') {
    //         return val;
    //     }
    //     const term = searchTerm.toLowerCase();

    //     const groupMatch = group_details.some(
    //         (group) => group?.name?.toLowerCase().includes(term)
    //     );

    //     return (
    //         product_name?.toLowerCase().includes(term) ||
    //         floor_plan?.toLowerCase().includes(term) ||
    //         search_name?.toLowerCase().includes(term) ||
    //         groupMatch
    //     );
    // });


    const removeProduct = (row, canDrag, subpin = false) => {
        deleteClick(row, canDrag,subpin)

        let floor_id
        setFloorID((prev) => {
            floor_id = prev;
            return prev;
        });
    }

    const deleteClick = async (row, canDrag = false, subpin = false) => {
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
        if (!canDrag) {
            buttons.remove = {
                text: "Remove From Floor Plan",
                value: "Remove",
                visible: true,
                className: "btn-danger",
                closeModal: true,
            };
        }
        const orderedButtons = !canDrag
            ? { cancel: buttons.cancel, remove: buttons.remove, confirm: buttons.confirm }
            : buttons;

        swal({
            title: "Are you sure you want to delete?",
            icon: "warning",
            buttons: orderedButtons
        })
            .then((value) => {
                switch (value) {
                    case "Yes":

                        if (subpin) {
                            deleteSubPinApi(row?.id,setFloorID, floorID, getProductList, handleEnableDisable, projectSettings)
                        } else {
                            deletePinApi(`product/${row?.enc_id}`, setFloorID, floorID, getProductList, handleEnableDisable, projectSettings)
                        
                            const index = accordianListOpen.current.indexOf(row?.enc_id);
                            if (index !== -1) {
                                accordianListOpen.current.splice(index, 1);
                            }
                            
                            // setStoredObjects((prev) => {
                            //     let updatedObjects = prev
                            //     updatedObjects.delete(`${row?.enc_id}_${row?.fp_id}`)
                            //     return updatedObjects
                            // })
                        }
                        break;
                    case "Remove":
                        const para = {
                            type: 2,
                            id: row?.enc_id
                        }

                        removePinApi(`remove-pin`, para, setFloorID, floorID, getProductList, handleEnableDisable, projectSettings)
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

    const onSelectImg = async (e) => {
        const file = e?.target?.files[0];
        const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];

        if (file && !allowedTypes.includes(file.type)) {
            toast.warning('Sorry! Only JPEG, PNG, and JPG files are allowed for upload.');
            return;
        }
        setFileKey(Date.now());
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviewImage(reader.result);
            setModal(true);

        };
        if (file) {
            reader.readAsDataURL(file);
        }
    }

    const handleDeleteImage = (image, index, setFieldValue) => {
        images.splice(index, 1);
        setImages([...images])
        const trimmedImageUrl = image.replace(image_url, '');
        setDeletedImages([...deletedImages, trimmedImageUrl]);
        setFieldValue('image_path', images);
        postImages([trimmedImageUrl], 'delete')
    }

    const editClick = (product, type = false) => {
        setPanTool(false)
        if (product?.position) {
            getFloorPlanByid(product?.fp_id, 'products', "0", "default", product);
        } else {
            onEditProduct(product,type)
        }
    }

    const DraggablePinItem = ({ pin,product, fromGroupId,removeProduct, editClick }) => {

        const [isEdit, setIsEdit] = useState(false)
        const [{ isDragging }, drag, preview] = useDrag({
            type: 'product_pin',
            item: { pin, fromGroupId },
            collect: (monitor) => ({
                isDragging: monitor.isDragging(),
            }),
        });

         useEffect(() => {
            preview(getEmptyImage(), { captureDraggingState: true });
         }, [preview]);
        
        const handleChange = (e) => {
            let value = e?.target?.value
            setIsEdit((prev) => ({
                ...prev,
                ["name"]:value
            }))
        }
        
        const updateName = async () => {
            if (!isEdit?.name || isEdit?.name?.trim() == "") {
                toast.error("Please type a name.")
                return
            }
            
            try {
                let response = await postRequest(`group-product`, isEdit)

                if (response?.type == 1) {
                    getProductList(floorID)
                    setIsEdit(false)
                    handleEnableDisable();
                }
            } catch (error) {
                console.log(error);
            }
        }

        return <div ref={isEdit ? null : drag} className='drag-wrpr' style={{
            opacity: isDragging ? 0.5 : 1,
            gap:isEdit ? "0.5rem" : 0
        }}>
           
            <div className={`drag-item`} >
                <div className='magical-words' >
                    <div >
                        <ProductSvg color={product?.product_color ?? "#6A6D73"} />
                    </div>
                    {
                        isEdit ? <>
                            <input className='form-control ml-2' value={isEdit?.name} onChange={handleChange}/>
                        </> :
                        <div>
                            <p>{pin?.name}{product?.floor_plan && ` (${product.floor_plan})`}</p>
                        </div>
                    }
                </div>
                    

                {!isEdit && <>
                    <div className='flex-grow-1' />
                    {/* <UndraggedDiv pinName={'product'} /> */}
                    <div className=' edit-square magical-words'
                        title='Edit name'
                        onClick={() =>
                            // setIsEdit(pin)
                            editClick(pin,'subpin')
                        }
                    >
                        <BiSolidPencil fontSize={15} />
                    </div>
                </>
                }
            </div>

            {
                isEdit ?
                    <>
                        <div className=' edit-square magical-words'
                            style={{marginBottom:"8px"}}
                            onClick={updateName}
                            title='Save name'
                        >
                            <IoMdCheckmark  fontSize={15} />
                        </div>
                        <div className=' edit-square magical-words'
                            style={{marginBottom:"8px"}}
                            onClick={() => setIsEdit(false)}
                            title='Reset'
                        >
                            <IoMdClose fontSize={10} />
                        </div>
                    </>
                : 
                <div className='ml-2  rounded-circle'
                        onClick={() => removeProduct(pin, true, true)}
                        title='Delete pin'
                    style={{ backgroundColor: '#E5E5E5', cursor: 'pointer', marginBottom: '8px', padding: '4px' }} >
                    <IoMdClose fontSize={10} />
                </div>
            }

        </div>
    };
    
    const PinGroupAccordion = ({ product, editClick,removeProduct,addGroupProductClick,drag,canDrag,movePinToGroup   }) => {
        const [isOpen, setIsOpen] = useState(accordianListOpen.current?.includes(product?.enc_id));
        const [isMenuOpen, setIsMenuOpen] = useState(false);

        const toggleDropdown = () => {
            setIsMenuOpen(!isMenuOpen);
        };

        const [, drop] = useDrop({
            accept: 'product_pin',
            drop: (draggedItem) => {
                if (draggedItem.fromGroupId !== product.enc_id) {
                    movePinToGroup(draggedItem.pin, draggedItem.fromGroupId, product.enc_id);
                }
            },
        });


        const openAccordian = () => {
            const currentList = accordianListOpen.current;

            if (currentList.includes(product?.enc_id)) {
                const index = currentList.indexOf(product?.enc_id);
                if (index !== -1) {
                    currentList.splice(index, 1);
                }
            } else {
                currentList.push(product?.enc_id);
            }

            setIsOpen(!isOpen);
        }

        return (
            <div className={`mb-2 pin-group-head ${canDrag && 'can-drag'} mxx-3`} ref={drop}>
                 <div className='drag-wrpr '  >
                    <div className={`drag-item pin-group-item `} >
                        <button className='pin-acc-icon' title='Open sub menu' type='button' onClick={openAccordian}>
                            <FaChevronDown  style={{ transform: isOpen ? "rotate(360deg)" : "rotate(270deg)", transition: "0.3s" }} />
                        </button>
                        <div className='magical-words' ref={drag}>
                            <div >
                                <ProductSvg color={product?.product_color ?? "#6A6D73"} />
                            </div>
                            <div>
                                <p>{product?.product_name}{product?.floor_plan && ` (${product?.floor_plan})`}</p>
                            </div>
                        </div>
                        <div className='flex-grow-1' />
                         {canDrag &&
                            <>
                                <UndraggedDiv pinName={'product'} />
                            </>
                        }
                       
                       
                        <Dropdown isOpen={isMenuOpen} toggle={() => toggleDropdown()} className="dropdown-toggle">
                            <DropdownToggle caret>
                                <div className=' edit-square magical-words' title='Show more option'>
                                    <HiDotsVertical  fontSize={15} />
                                </div> 
                            </DropdownToggle>
                             <DropdownMenu className="drpdown">
                                <DropdownItem  className={`d-flex align-items-center gap-2 `} style={{ color: '#f9b74c' }}
                                    onClick={(e) => e.stopPropagation()}
                                >
                                   <div className='info-icon plus-icon' title='Add new pin'  onClick={() => {
                                        // setIsPinGroup(true)
                                        toggleDropdown()
                                        addGroupProductClick(product)
                                    }}>
                                        <GoPlus />
                                    </div>
                                    <div className=' edit-square magical-words' title='Edit Group' onClick={() => {
                                        toggleDropdown()
                                        editClick(product)
                                    }}  >
                                        <BiSolidPencil fontSize={15} />
                                    </div>
                                    <div className=' edit-square magical-words'
                                        title='Delete group'
                                        onClick={() => removeProduct(product, canDrag)}
                                    >
                                        <IoMdClose fontSize={10} />
                                    </div>
                                </DropdownItem>
                            </DropdownMenu>
                        </Dropdown>
                    </div>

                    {/* <div className=' rounded-circle' onClick={() => removeProduct(index, product, canDrag)} style={{ backgroundColor: '#E5E5E5', cursor: 'pointer', marginBottom: '8px', padding: '4px' }} >
                        <IoMdClose fontSize={10} />
                    </div> */}
                </div>
               

                {isOpen && (
                    <div className='pin-group-accordian'>
                            {product?.group_details?.map((pin, index) => (
                                <DraggablePinItem key={index} editClick={editClick} pin={pin} product={product} removeProduct={removeProduct} fromGroupId={product.enc_id}/>
                            ))}

                        {product?.group_details.length == 0 &&
                            <button type='button' className='pin-group-paceholder' title='Add new pin'  onClick={() => {
                                // toggleDropdown()
                                addGroupProductClick(product)
                            }}>
                                <p>Add Product</p>
                                <GoPlus />
                            </button>
                        }
                    </div>
                )}
            </div>
        );
    };

    const ProductItem = ({ product, index, }) => {
        const canDrag = (product?.position === null);
        const id = product.enc_id;
        const [{ isDragging }, drag, preview] = useDrag({
            type: 'productpin',
            item: () => {
                return { index, id, product };
            },
            canDrag: () => {
                return canDrag && floorID;
            },
            collect: (monitor) => ({
                isDragging: monitor.isDragging(),
            }),
        });

        const movePinToGroup = async (pin, fromGroupId, toGroupId) => {
            let filteredData;
            setFilteredData((prev) => {
                filteredData = prev
                return prev
            })
            // console.log(pin, fromGroupId, toGroupId, filteredData, productList);
            
            const newData = [...filteredData];
            const fromGroup = newData.find(g => g.enc_id === fromGroupId);
            const toGroup = newData.find(g => g.enc_id === toGroupId);

            if (!fromGroup || !toGroup) {
                toast.error("Something went wrong")
                return;
            }
            let payload = {
                product_id: toGroup?.enc_id,
                // name: pin.name,
                id: pin.id,
                type: 3,
                product_name:pin.name,
                customer_id:projectSettings?.enc_customer_id ?? getCurrentUser()?.user?.common_id,
                project_id: id,
            }

            console.log(payload,toGroup,"payload,toGrouppayload,toGroup");
            // return
            try {
                // let response = await postRequest(`group-product`,payload )
                let response = await postRequest(`product`,payload )
                if (response?.type == 1) {
                    getProductList(floorID)
                    handleEnableDisable();
                }
            } catch (error) {
                console.log(error); 
            }
            // fromGroup.group_details = fromGroup.group_details.filter(p => p.id !== pin.id);

            // toGroup.group_details.push(pin);

            // console.log({newData},"newData,filteredData")
           
        };

        let item = product?.type !== 2 ? 
            <div className='drag-wrpr mxx-3'  >
                <div className={`drag-item ${canDrag && 'can-drag'}`} >
                    <div className='magical-words' ref={drag}>
                        <div >
                            <ProductSvg color={product?.product_color ?? "#6A6D73"} />
                        </div>
                        <div>
                            <p>{product.product_name}{product?.floor_plan && ` (${product.floor_plan})`}</p>
                        </div>
                    </div>
                    <div className='flex-grow-1' />
                    {canDrag &&
                        <>
                            <UndraggedDiv pinName={'product'} />
                        </>
                    }
                    <div className=' edit-square magical-words' onClick={() => editClick(product)}  >
                        <BiSolidPencil fontSize={15} />

                    </div>
                </div>

                <div className='ml-2  rounded-circle' onClick={() => removeProduct(product, canDrag)} style={{ backgroundColor: '#E5E5E5', cursor: 'pointer', marginBottom: '8px', padding: '4px' }} >
                    <IoMdClose fontSize={10} />
                </div>
            </div>
            : <PinGroupAccordion product={product} movePinToGroup={movePinToGroup} editClick={editClick} canDrag={canDrag} drag={drag} removeProduct={removeProduct} addGroupProductClick={addGroupProductClick}/>
        return item
    }

    const renderProductItem = useCallback((product, index) => {
        return (
            <ProductItem
                key={product.id}
                index={index}
                id={product.id}
                product={product}
            />
        )
    }, [])

    useEffect(() => {
        if (croppedImage) {
            setImages([...images, croppedImage]);
            postImages([blobImage], 'post')

        }
    }, [croppedImage]);

    const postImages = async (imagePath, type) => {
        const formData = new FormData();
        formData.append('id', selProductDtls?.enc_id);
        formData.append('is_published', '0');
        formData.append('discard', '1');
        formData.append('publish', '1');


        // console.log(selProductDtls, "selProductDtls");

        if (selProductDtls?.product_id) {
            formData.append('product_id', selProductDtls?.product_id);
            formData.append('type', 3);
        }
    
        // return

        if (type === 'post') {
            if (imagePath) {
                formData.append(`image_path[${0}]`, imagePath[0]);
            }
        } else {
            if (imagePath) {
                imagePath.forEach((deletedImage, index) => {
                    formData.append(`deleted_images[${index}]`, deletedImage);
                });
            }
        }

        try {
            const reqUrl = `product-image`
            const response = await postRequest(reqUrl, formData, true);
            const data = response.response?.data ?? [];
            if (response.type === 1) {
                setImagesForpost([])
                const images = data?.image_path?.map((item) => image_url + item)
                setImages(images)
                handleEnableDisable()
                setCroppedImage()
                setBlobImage()
                setDeletedImages([]);
                setModal(false);
            } else {
                SetBackEndErrorsAPi(response, setFieldError);
            }
        } catch (error) {
            console.log(error);
        }
    }

    const goBack = () => {
        setSearchTerm('');
        if (addNew) {
            console.log(isDirty, 'isDirty')
            if (isDirty) {
                setBackClick(true)
                document.getElementById("productSubmitBtn")?.click();
            } else {
                setAddNew(false)
                setSelProductDtls()
                stopPathDrawing()
            }
        } else {
            setCommonSidebarVisible(true)

        }
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
    }, [])

    const handleAutoSave = (type) => {
        setTimeout(() => {
            document.getElementById("productSubmitBtn")?.click();
        }, 500)
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
                    <h1> {addNew ? 'Product Pin Details' : 'Product Pins'}</h1>
                </Col>
                <Col md={4} >
                    <div className='backArrow float-right' style={(savingTimer && !isDirty) ? { pointerEvents: 'none' } : { opacity: '1' }} onClick={goBack}>
                        {(savingTimer && !isDirty && addNew) ?
                            <Spinner className='loader-style' /> :
                            <BsArrowLeftShort />
                        }
                    </div>
                </Col>
            </Row>
            <Formik
                initialValues={initialValues}
                validationSchema={ValidationSchema}
                onSubmit={(values, setFieldError) => {
                    addProduct(values, setFieldError)
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
                        {(selProductDtls?.position && !selProductDtls?.enc_id) &&
                            <>
                                <AutosaveForm handleSubmit={handleAutoSave} setSavingTimer={setSavingTimer} savingTimer={savingTimer} />
                            </>
                        }
                        <form
                            id="productForm"
                            className="av-tooltip tooltip-label-bottom formGroups"
                            onSubmit={(e) => handleSubmit(e)}
                        >
                            {
                                addNew ?
                                    <div className='custom-scrollbar customScroll' style={{ height: mapDivSize }} >
                                        <div className='bar-sub'>
                                            {/* {(selProductDtls?.position?.x) ? ( */}
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
                                                            name="product_name"
                                                            autoComplete="off"
                                                            value={values?.product_name}
                                                            onChange={(e) => {
                                                                handleChange(e);
                                                                setSelProductDtls(prev => ({ ...prev, product_name: e.target.value }));
                                                                setIsDirty(true);
                                                            }}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') {
                                                                    e.preventDefault(); 
                                                                }
                                                            }}
                                                        />
                                                        {errors.product_name && touched.product_name ? (
                                                            <div className="text-danger mt-1">
                                                                {errors.product_name}
                                                            </div>
                                                        ) : null}
                                                    </div>

                                                    <div className="marginBottom">
                                                        <Label for="exampleName" className="form-labels">Product Code</Label>
                                                        <Field
                                                            id="exampleName"
                                                            className="form-control"
                                                            type="text"
                                                            placeholder="Please Type"
                                                            name="product_code"
                                                            autoComplete="off"
                                                            value={values?.product_code}
                                                            onChange={(e) => {
                                                                handleChange(e);
                                                                setSelProductDtls(prev => ({ ...prev, product_code: e.target.value }))
                                                                setIsDirty(true);
                                                            }}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') {
                                                                    e.preventDefault(); 
                                                                }
                                                            }}
                                                        />
                                                        {errors.product_code && touched.product_code ? (
                                                            <div className="text-danger mt-1">
                                                                {errors.product_code}
                                                            </div>
                                                        ) : null}
                                                    </div>

                                                    <div className="marginBottom">
                                                        <Label for="exampleName" className="form-labels">Tags</Label>

                                                        <TagInputComp
                                                            tags={values.tags ?? []}
                                                            setTags={(values) => {
                                                                setFieldValue('tags', values)
                                                                setSelProductDtls(prev => ({ ...prev, tags: values }))
                                                                setIsDirty(true);
                                                            }}
                                                        />
                                                      
                                                    </div>

                                                    <input hidden name='position' value={values?.position} />

                                                    <div className="marginBottom">
                                                        <Label for="exampleName" className="form-labels">Product Image</Label>
                                                        <Row>
                                                            <Col md={4}>
                                                                {images?.length == 0 ?
                                                                    <div className='select-logo product-image' style={{ marginBottom: 0 }} onClick={() => imgInputRef.current.click()} >
                                                                        <p>+</p>
                                                                        <input key={fileKey} type='file' accept=".jpeg, .png, .jpg" ref={imgInputRef} hidden onChange={onSelectImg} />
                                                                    </div>

                                                                    :
                                                                    <>

                                                                        <div className='img-wrpr prduct' >
                                                                            <span className='image-container'>
                                                                                <img src={images[0]} style={{ borderRadius: '6px', border: '1px solid rgb(204, 204, 204)' }} />
                                                                                <span className='delete-logo-icon' style={{ right: '0px' }}><div onClick={() => handleDeleteImage(images[0], 0, setFieldValue)} className='ml-4 p-1 rounded-circle' style={{ backgroundColor: '#E5E5E5', cursor: 'pointer', }} >
                                                                                    <IoMdClose style={{ fontSize: '10px' }} />
                                                                                </div></span>
                                                                            </span>
                                                                        </div>
                                                                    </>
                                                                }
                                                            </Col>
                                                            <p className='mt-2 recomended-res-label'>Recommended Resolution:  240 × 240 px</p>
                                                        </Row>
                                                        <ImageUploader
                                                            onSubmit={(blob, url, blobUrl) => {
                                                                setCroppedImage(url);
                                                                setBlobImage(blob);

                                                            }}
                                                            onCancel={() => {
                                                                console.log("Cancelled");
                                                            }}
                                                            sourceImageUrl={previewImage}
                                                            setSourceImageUrl={setPreviewImage}
                                                            openCropModal={modal}
                                                            setOpenCropModal={setModal}
                                                            name={`image_path`}
                                                            setFieldValue={setFieldValue}
                                                            setPostCall={setPostCall}
                                                            imgAspect={4 / 4}
                                                            diasbleFreeFlow={true}
                                                            from={'product'}

                                                        />
                                                    </div>
                                                    <div className="marginBottom">
                                                        <Label for="exampleName" className="form-labels">Description</Label>
                                                        <textarea
                                                            id="exampleName"
                                                            className="form-control"
                                                            type="text"
                                                            placeholder="Please Type"
                                                            name="description"
                                                            rows={4}
                                                            autoComplete="off"
                                                            value={values?.description}
                                                            onChange={(e) => {
                                                                handleChange(e);
                                                                setSelProductDtls(prev => ({ ...prev, description: e.target.value }));
                                                                setIsDirty(true);
                                                            }}

                                                        ></textarea>
                                                        {errors.description && touched.description ? (
                                                            <div className="text-danger mt-1">
                                                                {errors.description}
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
                                                                handleChange(e);
                                                                setSelProductDtls(prev => ({ ...prev, website: e.target.value }));
                                                                setIsDirty(true);

                                                            }}
                                                        />
                                                        {errors.website && touched.website ? (
                                                            <div className="text-danger mt-1">
                                                                {errors.website}
                                                            </div>
                                                        ) : null}
                                                    </div> */}
                                                </div>

                                                
                                                {values?.type == 1 && <div className='row  pl-4 pr-4 mt-2 mb-3' >
                                                    <Col md={6} className='d-flex align-items-center'>
                                                        <Label className=' mb-0' style={{fontSize:"1rem"}}>Assign to Group</Label>
                                                    </Col>
                                                    <Col md={6}>
                                                        <CommonDropdown name='agent' options={parentList}
                                                            value={ values?.assignDetails || parentList[0]}
                                                            onChange={(e) => {
                                                                setIsDirty(true);
                                                                if (e.value == null) {
                                                                    // setAssignDetails(null)
                                                                    setSelProductDtls(prev => ({ ...prev, assignDetails: null }));
                                                                } else {
                                                                    setSelProductDtls(prev => ({ ...prev, assignDetails: {
                                                                        ...e,
                                                                        customer_id: values?.enc_customer_id,
                                                                        project_id: values?.enc_project_id,
                                                                        prev_id: values?.enc_id,
                                                                        product_id: e?.enc_id,
                                                                        type: 3
                                                                    } }));
                                                                    // setAssignDetails({
                                                                    //     ...e,
                                                                    //     customer_id: values?.enc_customer_id,
                                                                    //     project_id: values?.enc_project_id,
                                                                    //     prev_id: values?.enc_id,
                                                                    //     product_id: e?.enc_id,
                                                                    //     type: 3
                                                                    // })
                                                                }

                                                            }}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') {
                                                                    e.preventDefault(); 
                                                                }
                                                            }}
                                                            />
                                                    </Col>
                                                </div>}

                                                <div className='bar-sub-header' >
                                                    <p style={{ marginTop: 0 }} >Website</p>
                                                    <div className='plus-icon' onClick={() => setwebsiteLinks(prev => [...prev, {}])}>
                                                        <GoPlus />
                                                    </div>
                                                </div>
                                                <div className='pl-4 pr-4'>
                                                    {/* {websiteLinks.map((sp, id) => <ProdSpecItem spec={sp} index={id} setSpecifications={setwebsiteLinks} specifications={websiteLinks} name='websiteLink' setFieldValue={setFieldValue} setIsDirty={setIsDirty} />)} */}
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
                                                    <div className="text-danger mt-2">
                                                        {errors.website}
                                                    </div>
                                                ) : null}

                                                
                                                <div className='bar-sub-header' >
                                                    <p style={{ marginTop: 0 }} >Specifications</p>
                                                    <div className='plus-icon' onClick={() => setSpecifications(prev => [...prev, {}])}>
                                                        <GoPlus />
                                                    </div>
                                                </div>

                                                <div className='pl-4 pr-4'>

                                                    {specifications.map((sp, id) => <ProdSpecItem spec={sp} index={id} setSpecifications={setSpecifications} specifications={specifications} name='specifications' setFieldValue={setFieldValue} setIsDirty={setIsDirty} />)}

                                                </div>

                                                {
                                                    !values?.product_id && <>
                                                        <div className='bar-sub-header' >
                                                            <p style={{ marginTop: 0 }} >Style</p>
                                                        </div>
                                                        <div className='pl-4 pr-4'>

                                                            <ColorPicker
                                                                label={'Active Destination Pin Colour'}
                                                                value={values.product_color ?? projectSettings?.product_color ?? '#320101'}
                                                                name={'product_color'}
                                                                onChange={(e) => {
                                                                    setColor(e)
                                                                }}
                                                                handleOkClick={(e) => {
                                                                    setSelProductDtls(prev => ({ ...prev, ...values, product_color: e }))
                                                                }}
                                                                setFieldValue={setFieldValue}
                                                                isOpen={openPicker === 'product_color'}
                                                                setOpenPicker={setOpenPicker}
                                                                onClick={() => handlePickerClick('product_color')}
                                                                color={color} setColor={setColor} setIsDirty={setIsDirty}

                                                            />
                                                        </div>
                                                    </>
                                                }
                                                
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

                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    :
                                    <>
                                        <div className='bar-sub-header' style={{ marginRight: '14px' }}>
                                            <p style={{ marginTop: 0 }} >Add New Product Pin</p>
                                            <div className='plus-icon' onClick={() => addProductClick()}>
                                                <GoPlus />
                                            </div>
                                        </div>
                                        
                                        <div className='bar-sub-header pin-group' style={{ marginRight: '14px' }}>
                                            <p style={{ marginTop: 0 }} >Add New Pin Group</p>
                                            <div className='plus-icon' onClick={() => {
                                                setIsPinGroup(true)
                                                addProductClick()
                                            }}>
                                                <GoPlus />
                                            </div>
                                        </div>

                                        <div className='mb-2 text-right d-grid gap-2' style={{ marginRight: '14px' }}>
                                            <Button
                                                className="btn-primary bar-btn"
                                                type="button"
                                                size="medium"
                                                onClick={()=>bulkUploadClick(1)}
                                            >
                                                Bulk Group Product Upload
                                            </Button>
                                            <Button
                                                className="btn-primary bar-btn"
                                                type="button"
                                                size="medium"
                                                onClick={()=>bulkUploadClick(2)}
                                            >
                                                Bulk Product Upload
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

                                        <div className='custom-scrollbar customScroll' style={{
                                            height: mapDivSize - 246
                                                // mapDivSize - 140
                                        }} >
                                            {filteredData.filter(p => p?.floorId === selFloorPlanDtls?.id)?.map((plan, idx) => renderProductItem(plan, idx))}
                                        </div>
                                    </>}

                            <Button
                                className="btn-primary bar-btn"
                                htmlType="submit"
                                type="primary"
                                size="medium"
                                id='productSubmitBtn'
                            // hidden
                            >
                                Submit
                            </Button>
                            {/* <Label for="exampleEmail1" className="form-labels">Name</Label> */}

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
            <BulkUploadPin
                modal={modalBulk}
                setModal={setModalBulk}
                type={'product'}
                projectSettings={projectSettings}
                selFloorPlanDtls={selFloorPlanDtls}
                getList={() => getProductList(selFloorPlanDtls?.enc_id)}
                handleEnableDisable={handleEnableDisable}
            />
        </div>
    )
}

export default ProductSideBar

