import { Field, Formik } from 'formik'
import React, { useCallback, useRef, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    Button, Label, Row, Col, Modal,
    ModalBody, Spinner,
    Input
} from 'reactstrap'
import { AiOutlineCloudUpload } from 'react-icons/ai';
import { FiSearch } from 'react-icons/fi'
import { RxDragHandleHorizontal } from 'react-icons/rx'
import { BiSolidPencil } from 'react-icons/bi'
import { IoMdClose } from 'react-icons/io';
import { GoPlus } from "react-icons/go";
import { FaInfo } from 'react-icons/fa';
import { useDrag, useDrop } from 'react-dnd';
import { BsArrowLeftShort } from 'react-icons/bs';
import { getCurrentUser } from '../../../helpers/utils';
import { SetBackEndErrorsAPi } from '../../../hooks/setBEerror';
import { postRequest, getRequest, deleteRequest } from '../../../hooks/axiosClient';
import * as Yup from 'yup';
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import '../BuildProject.css';
import { environmentaldatas } from '../../../constant/defaultValues';
import AutosaveForm from './AutoSaveForm';
import { BiDevices } from "react-icons/bi";
import { revertPackage } from '../Helpers/apis/otherApis';
import { Groupstack } from '../Helpers/constants/constant';
import floorPlanSvg from '../../../assets/img/testmap.svg';
import { renderTracing } from '../Helpers/renderObjs';
import SwitchComponent from '../../../components/switch/SwitchComponent';

const { image_url } = environmentaldatas;

const ValidationSchema = Yup.object().shape({
    floor_plan: Yup.string().required('This field is required.'),
    refImg: Yup.mixed().nullable(),
})

const FloorPlanDtlsBar = ({
  addNewFloor,
  setAddNewFloor,
  selFloorPlanDtls,
  setSelFloorPlanDtls,
  floorPlans,
  setFloorPlans,
  setFloorPlansPathSort,
  tracings,
  setTracings,
  setTracingCircle,
  setIsEdit,
  setTempPolygon,
  id,
  getFloorDropdown,
  projectSettings,
  setLocations,
  getLocationList,
  getProductList,
  setFloorID,
  getBeaconList,
  getAmenityList,
  getSafetyList,
  getVerticalTransportList,
  onSideBarIconClick,
  activeTab,
  handleTraversibleData,
  graph,
  setVerticalTransports,
  savingTimer,
  setSavingTimer,
  getFloorsList,
  handleEnableDisable,
  canvasBackgroundImageHandler,
  zoomInOut,
  setZoomInOut,
  texts,
  setTexts,
  setToolActive,
  floorID,
  canvasContainerRef,
  clearPinsList,
  removePins,
  setSearchTerm,
  searchTerm,
  setCommonSidebarVisible,
  getProjectById,
  setPanTool,
  totalPinCount,
  resetCanvasTransform,
  setTextStyleValue,

  canvasSvgBackground,
  renderTracings,
  handlezoomPost,
  setLoadingSacle,
  setRefLoading,
  closeReftoggle,
  setFloorPlanModal,
  setSelImageOrSvgValues,
  removeFabricObjectsByName,
  renderTexts,
  renderTracingCircles,
  getSvgFileAsRefImage,
}) => {
  const [mapDivSize, setMapDivSize] = useState(window.innerHeight - 100);
  const [fileName, setFileName] = useState("");
  const [previewImage, setPreviewImage] = useState(null);
  const [modal, setModal] = useState(false);
  const toggle = () => setModal(!modal);
  const logoSelectRef = useRef();
  const formRef = useRef();
  const [fileKey, setFileKey] = useState(Date.now());
  const [loading, setLoading] = useState(false);

  const onSelectRefImg = async (e, values, setFieldError, setFieldValue) => {
    console.log(values, e);
    const pic = e.target.files[0];
    setFileKey(Date.now());
    const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];
    console.log(pic.type, "allowedTypes");
    if (!allowedTypes.includes(pic.type)) {
      toast.error(
        "Please check the supported formats of the reference image and try again."
      );
    } else {
      if (pic) {
        setSelFloorPlanDtls((prev) => ({
          ...prev,
          plan: URL.createObjectURL(pic),
          image: pic,
        }));
        setTimeout(() => {
          document.getElementById("FloorPlanAddBtn")?.click();
        }, 1000);
      } else {
        setFieldValue("image", null);
      }
    }
    setIsEdit(true);
  };

  const addNewFloorPlan = () => {
    toggle();
    getProjectById();
    setPanTool(false);
  };

  const modalClose = () => {
    toggle();
    getFloorPlanByid(floorID, "default");
  };

  const addFloorPlan = async (values, setFieldError, image) => {
    setSavingTimer(true);
    setLoading(true);
    let tracingVar;
    setTracings((prev) => {
      tracingVar = prev;
      return prev;
    });
    console.log(tracingVar);

    if (id != 0) {
      let refImg = "";
      if (values?.image && values?.image?.name) {
        console.log("yesimg");
        const base64Image = values?.image;
        refImg = base64Image;
      } else {
        console.log("noimg");
        refImg = null;
      }

      // console.log(values);
      values.refImg =
        refImg ?? (values?.plan ? values?.plan.replace(image_url, "") : null);
      let datas = {
        floor_img: values?.refImg ?? "",
        show_image: values?.show_image ?? 0,
        customer_id:
          projectSettings?.enc_customer_id ?? getCurrentUser()?.user?.common_id,
        project_id: id,
        file_type: 1,
        floor_plan: values?.floor_plan,
        border_color: values?.border_color ?? "",
        border_thick: values?.border_thick ?? "",
        fill_color: values?.fill_color ?? "",
        is_high_res_tiling :"1"
      };
      if (values?.enc_id) {
        datas._method = "PUT";
        datas.id = values?.enc_id;
        datas.is_published = "0";
        datas.discard = "1";
        datas.publish = "1";
        (datas.text = texts?.length != 0 ? JSON.stringify(texts) : ""),
          (datas.tracings =
            tracings.length != 0 ? JSON.stringify(tracings) : "");
      } else {
        (datas.width = canvasContainerRef.current.clientWidth),
          (datas.height = canvasContainerRef.current.clientHeight),
          (datas.tracings = ""),
          (datas.points_data = ""),
          (datas.edges_data = "");
        setTracings([]);
        setTracingCircle([]);
        setTexts([]);
        setLocations([]);
        setVerticalTransports([]);
        setSelFloorPlanDtls(null);
      }
      const formData = new FormData();
      for (const key in datas) {
        if (datas.hasOwnProperty(key)) {
          formData.append(key, datas[key]);
        }
      }
      try {
        const reqUrl = values?.enc_id
          ? `floor-plan/${values?.enc_id}`
          : `floor-plan`;
        const response = await postRequest(reqUrl, formData, true);
        console.log(formData,datas)
        const data = response?.response?.data ?? [];
        if (response.type === 1) {
          setModal(false);
          if (!values?.enc_id) {
            toast.success(data?.message);
          }
          if (
            values?.image ||
            data?.message === "Floor plan added successfully." ||
            data?.message === "Floor level added successfully."
          ) {
          } else {
            setTempPolygon([]);
            setTracings([]);
            setTracingCircle([]);
            setTexts([]);
          }
          getFloorPlanByid(data?.id, "edit");
          setTimeout(() => {
            setLoadingSacle(false);
            setRefLoading(false)
            closeReftoggle()
            setFloorPlanModal(false);
            setSelImageOrSvgValues();
          }, 2000);
        } else {
          SetBackEndErrorsAPi(response, setFieldError);
          setTimeout(() => {
            setLoadingSacle(false);
            setRefLoading(false)
            closeReftoggle()
            setFloorPlanModal(false);
            setSelImageOrSvgValues();
          }, 2000);
        }
      } catch (error) {
        console.log(error);
        setTimeout(() => {
          setLoadingSacle(false);
          setRefLoading(false)
          closeReftoggle()
          setFloorPlanModal(false);
          setSelImageOrSvgValues();
        }, 2000);
      } finally {
        setLoading(false);
        setPanTool(false);
      }
    } else {
      toast.error("Please add a project to add floor plan");
    }
  };

  useEffect(() => {
    // if (id != 0) {
    getFloorsList();
    // }
  }, []);

  const onEditFloorPlan = (floor, index) => {
    setPanTool(false);
    getProjectById();
    getFloorPlanByid(floor?.enc_id, "edit");
    handleEnableDisable();
    // resetCanvasTransform()
  };

  const getFloorPlanByid = async (id, type) => {
    try {
      const response = await getRequest(`floor-plan/${id}`);
      const data = response.data ?? [];
      let value = {
        ...data,
        floor_plan: data?.floor_plan,
        refImg: data?.cropped_path_base64,
        plan: data?.cropped_image,
        border_color: data?.border_color,
        fill_color: data?.fill_color,
        border_thick: data?.border_thick,
        width: data?.width ? Number(data?.width) : null,
        height: data?.height ? Number(data?.height) : null,
      };

      let decodedString;
      let arrayOfObjects;
      console.log(value?.plan, "value?.plan");
      // canvasSvgBackground(floorPlanSvg)
      if (value?.plan && value?.show_image) {
        canvasBackgroundImageHandler(
          value?.plan,
          data?.img_size ? JSON.parse(data?.img_size) : zoomInOut
        );
        // resetCanvasTransform()
      } else {
        canvasBackgroundImageHandler(null);
      }
      if (type == "edit") {
        setZoomInOut(data?.img_size ? JSON.parse(data?.img_size) : zoomInOut);
      } else {
        setZoomInOut(zoomInOut);
      }
      // resetCanvasTransform()
      setTextStyleValue();
      setFloorID(id);
      setSelFloorPlanDtls(value);
      getSvgFileAsRefImage(value?.enc_id);
      handleTraversibleData(value, graph);
      const modifiedData = data?.vertical_transports?.map((el) => ({
        ...el,
        position: el?.positions ? JSON.parse(el?.positions) : "",
      }));
      if (type && type === "edit") {
        removePins();
      } else {
        getLocationList(id);
        getProductList(id);
        getBeaconList(id);
        getAmenityList(id);
        getSafetyList(id);
        getVerticalTransportList(id);
        setVerticalTransports(modifiedData);
      }
      setTempPolygon([]);
      setIsEdit(true);
      if (type !== "default") {
        console.log("here");
        setToolActive("Draw");
        setAddNewFloor(true);
      }
      const decodedTexts = data?.text ? JSON.parse(data?.text) : null;
      decodedString = data?.tracings ? JSON.parse(data?.tracings) : null;
      arrayOfObjects = decodedString ? JSON?.parse(decodedString) : "";
      var arrayOfTexts = decodedTexts ? JSON.parse(decodedTexts) : "";
      var decodedCircle = JSON.parse(data?.circle_data);
      var objectCircle = JSON.parse(decodedCircle);
      setTracingCircle(objectCircle ?? []);
      setTracings(arrayOfObjects ?? []);
      setTexts(arrayOfTexts ?? []);
      handleEnableDisable();
      removeFabricObjectsByName();
      renderTracings(arrayOfObjects);
      renderTracingCircles(objectCircle);
      renderTexts(arrayOfTexts);
    } catch (error) {
      console.log(error);
    } finally {
      setFloorID(id);
      setTimeout(() => {
        setSavingTimer(false);
      }, 1000);
    }
  };

  const deleteFloorPlan = async (id) => {
    try {
      const response = await deleteRequest(`floor-plan/${id}`);
      const data = response.data ?? [];
      toast.success(data?.message);
      clearPinsList();
      getFloorsList();
      getFloorDropdown();
      handleEnableDisable();
      setFloorID(null);
      totalPinCount();
      revertPackage(projectSettings?.enc_id);
    } catch (error) {
      console.log(error);
    }
  };

  const deleteClick = async (row) => {
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
    }).then((value) => {
      switch (value) {
        case "Yes":
          deleteFloorPlan(row?.enc_id);
          break;
        default:
          break;
      }
    });
  };

  const removeFloor = (row, index) => {
    deleteClick(row);
  };

  function moveElementToIndex(arr, fromIndex, toIndex) {
    console.log(arr, fromIndex, toIndex,"arr, fromIndex, toIndex");
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

  const moveCard = useCallback((dragIndex, hoverIndex, floorsArray) => {
    console.log(floorsArray, dragIndex, hoverIndex,"adsArray, dragIndex, hoverIndex")
    let arr = moveElementToIndex(floorsArray, dragIndex, hoverIndex);
      // console.log(floorsArray, arr);
    setFloorPlans([...arr]);
    setFloorPlansPathSort([...arr]);
    const dragArray = arr?.reverse().map((floor, index) => ({
      id: floor?.enc_id,
      floor_plan: floor?.floor_plan,
      index: index,
    }));
    dragAndDropApi(dragArray);
  }, []);

  const dragAndDropApi = async (floors) => {
    let value = {
      type: 1,
      drag_drop: floors,
      is_published: "0",
      discard: "1",
      publish: "1",
      project_id: projectSettings?.enc_id,
    };
    try {
      const reqUrl = "drag-drop";
      const response = await postRequest(reqUrl, value);
      const data = response.data ?? [];
      // console.log(data, "drag-drop");
      handleEnableDisable()
      // getFloorsList();
      // getFloorDropdown("discard");
    } catch (error) {
      console.log(error);
    }
  };

  const FloorItem = ({ plan, index, moveCard, id, floorsArray }) => {
    const ref = useRef(null);
    const [{ handlerId }, drop] = useDrop({
      accept: "floorItem",
      drop() {
        getFloorsList() 
        // getFloorDropdown("discard");
      },
      collect(monitor) {
        return {
          handlerId: monitor.getHandlerId(),
        };
      },
      hover(item, monitor) {
        if (!ref.current) {
          return;
        } 
        const dragIndex = item.index;
        const hoverIndex = index;
        if (dragIndex === hoverIndex) {
          return;
        }
        const hoverBoundingRect = ref.current?.getBoundingClientRect();
        const hoverMiddleY =
          (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
        const clientOffset = monitor.getClientOffset();
        const hoverClientY = clientOffset.y - hoverBoundingRect.top;
        if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
          return;
        }
        if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
          return;
        }
        moveCard(dragIndex, hoverIndex, floorsArray);
        item.index = hoverIndex;
      },
    });
    const [{ isDragging }, drag] = useDrag({
      type: "floorItem",
      item: () => {
        return { index, id };
      },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    });
    const opacity = isDragging ? 0 : 1;
    drag(drop(ref));
    return (
      <div
        className="drag-wrpr mxx-3"
        style={{ opacity }}
        data-handler-id={handlerId}
        ref={ref}
      >
        <div className="drag-item" style={{ padding: "0px 4px 0px 0px" }}>
          <div
            className="magical-words"
            style={{
              height: "34px",
              width: "34px",
              backgroundColor: "#e5e5e5",
              borderRadius: "4px",
              paddingLeft: "2px",
              paddingTop: "2px",
            }}
          >
            {Groupstack}
          </div>
          <div>
            <p>{plan.floor_plan}</p>
          </div>
          <div className="flex-grow-1" />
          <div
            className="edit-square magical-words"
            onClick={() => onEditFloorPlan(plan, index)}
          >
            <BiSolidPencil fontSize={15} />
          </div>
        </div>
        <div
          className="ml-2  rounded-circle"
          onClick={() => removeFloor(plan, index)}
          style={{
            backgroundColor: "#E5E5E5",
            cursor: "pointer",
            marginBottom: "8px",
            padding: "4px",
          }}
        >
          <IoMdClose fontSize={10} />
        </div>
      </div>
    );
  };

  const renderFlooItem = useCallback((plan, index, floorsArray) => {
    return (
      <FloorItem
        key={plan.enc_id}
        index={index}
        id={plan.enc_id}
        moveCard={moveCard}
        plan={plan}
        floorsArray={floorsArray}
      />
    );
  }, []);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handlePrevent = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
    }
  };

  const filteredData = floorPlans.filter((val) => {
    const { floor_plan = "" } = val;
    if (searchTerm === "") {
      return val;
    }
    return floor_plan?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleDeleteImage = (setFieldValue) => {
    setFieldValue("refImg", "");
    setFieldValue("plan", null);
    handlezoomPost("1");
  };
  
  const goBack = () => {
    if (addNewFloor) {
      getFloorsList();
      getFloorDropdown();
      getProjectById();
      onSideBarIconClick(activeTab, "floorBackBtn");
    } else {
      setCommonSidebarVisible(true);
    }
  };

  const handleResize = () => {
    const { clientHeight } = window.document.getElementById("pageDiv");
    setMapDivSize(window.innerHeight - 100);
  };
  useEffect(() => {
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);
  const handleAutoSave = () => {
    document.getElementById("FloorPlanAddBtn")?.click();
  };

  const setZoom = (e) => {
    console.log(e);
    setZoomInOut(e);
    setSelFloorPlanDtls((prev) => ({ ...prev, zoom: e }));
    handlezoomPost(e);
  };
  const calculateZoomPercentage = () => {
    const percentage = Math.round(zoomInOut * 100);
    return `${percentage}%`;
  };

  const onToggleFloorImage = (e) => {
    console.log(e.target.checked);
    const showImage = e.target.checked === true ? 1 : 0;
    setSelFloorPlanDtls((prev) => ({
      ...prev,
      show_image: showImage,
    }));
    setTimeout(() => {
      document.getElementById("FloorPlanAddBtn")?.click();
    }, 1000);
  };

  return (
    <div
      className="bar"
      id="inner-customizer2"
      style={{
        position: "relative",
        height: mapDivSize,
        paddingBottom: "20px",
      }}
    >
      <Row className="backRow">
        <Col md={8}>
          <h1>Floor Plan {addNewFloor && "Details"}</h1>
        </Col>
        <Col md={4}>
          <div className="backArrow float-right" onClick={goBack}>
            <BsArrowLeftShort />
          </div>
        </Col>
      </Row>
      <Formik
        initialValues={{ floor_plan: "", refImg: "", ...selFloorPlanDtls }}
        validationSchema={ValidationSchema}
        onSubmit={(values, setFieldError) => {
          addFloorPlan(values, setFieldError);
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
        }) => (
          <>
            <AutosaveForm
              handleSubmit={handleAutoSave}
              setSavingTimer={setSavingTimer}
              savingTimer={savingTimer}
            />
            <form
              ref={formRef}
              className="av-tooltip tooltip-label-bottom formGroups"
              onSubmit={(e) => handleSubmit(e, setFieldError)}
            >
              {addNewFloor ? (
                <div
                  className="custom-scrollbar customScroll"
                  style={{ height: mapDivSize }}
                >
                  <div className="bar-sub">
                    <div className="bar-sub-header" style={{ marginTop: 0 }}>
                      <p style={{ marginTop: 0 }}>Details</p>
                    </div>
                    <div className="pl-4 pr-4">
                      <div className="marginBottom">
                        <Label for="exampleName" className="form-labels">
                          Name
                        </Label>
                        <Field
                          id="exampleName"
                          className="form-control"
                          type="text"
                          placeholder="Please Type Here (Eg. Level 1)"
                          name="floor_plan"
                          autoComplete="off"
                          value={values?.floor_plan}
                          onChange={(e) => {
                            handleChange(e);
                          }}
                        />
                        {errors.floor_plan && touched.floor_plan ? (
                          <div className="text-danger mt-1">
                            {errors.floor_plan}
                          </div>
                        ) : null}
                      </div>
                      {/* <div className='bar-heading' >
                                                    <Label className="form-labels" >Reference Image </Label>
                                                </div>
                                                <Row>
                                                    {values?.plan ? (
                                                        <Col md={6} >
                                                            <div className='floorimg-div'>
                                                                <img src={values?.plan} style={{ border: '1px solid #ccc', borderRadius: '6px', width: '100%', height: '75px', objectFit: 'contain' }}></img>

                                                                <span className='delete-logo-icon' style={{ right: 0 }} ><div onClick={() => handleDeleteImage(setFieldValue)} className='ml-4 p-1 rounded-circle' style={{ backgroundColor: '#E5E5E5', cursor: 'pointer', }} >
                                                                    <IoMdClose style={{ fontSize: '10px' }} />
                                                                </div></span>
                                                            </div>
                                                        </Col>
                                                    ) : (
                                                        <Col md={6}>
                                                            <div
                                                                className='select-floorimg'
                                                                onClick={() => logoSelectRef.current.click()}
                                                            >
                                                                <p>+</p>
                                                            </div>
                                                        </Col>
                                                    )}
                                                </Row>
                                                <Row>
                                                    <Col md={12}>
                                                        <div className='supported-format-text'>
                                                            <p style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}> <AiOutlineCloudUpload className='mr-1' /> Supported formats: PNG, JPG</p>
                                                        </div>
                                                    </Col>
                                                </Row>

                                                <input
                                                    type='file'
                                                    // ref={logoSelectRef}
                                                    hidden
                                                    onChange={(e) => { onSelectRefImg(e, values, setFieldError, setFieldValue); }}
                                                    name='refImg'
                                                    id='fileInput'
                                                    ref={logoSelectRef}
                                                    key={fileKey}
                                                    accept=' .png, .jpg, .jpeg, '
                                                /> */}
                      {/* {errors.refImg && touched.refImg ? (
                                            <div className="text-danger mt-1">
                                                {errors.refImg}
                                            </div>
                                        ) : null} */}
                      {values?.plan && values?.show_image == 1 && (
                        <>
                          <Row className="mt-2">
                            <Col md={12}>
                              <Label
                                className="form-labels"
                                style={{ marginBottom: "0px !important" }}
                              >
                                Reference Image Size
                              </Label>
                              <div className="controls">
                                <span className="mr-2 zoompercent">
                                  <p>{calculateZoomPercentage()}</p>
                                </span>
                                <input
                                  type="range"
                                  value={zoomInOut}
                                  min={0.1}
                                  max={10}
                                  step={0.01}
                                  aria-labelledby="Zoom"
                                  onChange={(e) => {
                                    setZoom(e.target.value);
                                  }}
                                  className="zoom-range"
                                />
                                <span className="ml-2">
                                  <BiDevices />
                                </span>
                              </div>
                            </Col>
                          </Row>
                        </>
                      )}
                      {values?.plan && (
                        <Row className="mt-4">
                          <Col md={12}>
                            <div className="d-flex align-items-center justify-content-between">
                              {/* <Label style={{ marginBottom: '0px', fontSize: '1rem' }} >Show Reference Image</Label>
                                                                    <SwitchComponent checked={values?.show_image == 1} onChange={(e) => onToggleFloorImage(e)} /> */}
                              <Label
                                style={{
                                  marginBottom: "0px",
                                  fontSize: "1rem",
                                }}
                              >
                                Make reference image visible to the public
                              </Label>
                              <Input
                                type="checkbox"
                                name="show_image"
                                className="float-right"
                                checked={values?.show_image == 1}
                                style={{
                                  cursor: "pointer",
                                  marginTop: "0px",
                                }}
                                onChange={(e) => onToggleFloorImage(e)}
                              />
                            </div>
                          </Col>
                        </Row>
                      )}
                    </div>
                    <Button
                      id="FloorPlanAddBtn"
                      className="btn-primary bar-btn"
                      htmlType="submit"
                      type="primary"
                      size="medium"
                      hidden
                    >
                      {"Create / Edit Floorplan Design"}
                    </Button>
                    <div className="mt-3">
                      <div className="warning-pin-div">
                        <div className="d-flex align-items-center justify-content-center mb-2">
                          <div className="info-cont">
                            <FaInfo />
                          </div>
                        </div>
                        <div className=" text-center  ">
                          {/* <p className='label color-labels' >Begin drawing a new floorplan, import an existing vector format floorplan, or upload an image of a floorplan to use as a reference for tracing.<br />
                                                            Reference images are only a guide for creating floorplans within the designer and are not visible to the end users.
                                                        </p> */}
                          <p className="label color-labels">
                            Start a new floorplan by drawing, uploading a
                            reference image, or importing an existing SVG format
                            floorplan. Reference images can serve as a tracing
                            guide within the designer and will remain hidden
                            from the end user unless the 'Make reference image
                            visible to the public' checkbox is selected.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div
                    className="bar-sub-header"
                    style={{ marginRight: "14px" }}
                  >
                    <p style={{ marginTop: 0 }}> Add New Floor Plan</p>
                    <div
                      className="plus-icon"
                      onClick={() => addNewFloorPlan()}
                    >
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
                      onKeyDown={handlePrevent}
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
                          padding: "4px",
                        }}
                      >
                        <FiSearch className="iconStyle" />
                      </span>
                    </div>
                  </div>
                  <div
                    className="custom-scrollbar customScroll"
                    style={{ height: mapDivSize - 90 }}
                  >
                    {filteredData?.map((plan, idx) =>
                      renderFlooItem(plan, idx, filteredData)
                    )}
                    
                      <div style={{ marginTop: "1rem" }}>
                      <div className="warning-pin-div">
                        <div className="d-flex align-items-center justify-content-center mb-2">
                          <div className="info-cont">
                            <FaInfo />
                          </div>
                        </div>
                        <div className=" text-center  ">
                          <p className="label color-labels">
                            Floors are ordered from bottom to top. The lowest level in the list represents the ground floor.
                          </p>
                        </div>
                      </div>
                    </div>
                    </div>
                    
                </>
              )}
              {/* <Label for="exampleEmail1" className="form-labels">Name</Label> */}
            </form>
          </>
        )}
      </Formik>
      <Modal
        isOpen={modal}
        toggle={toggle}
        size="md"
        style={{ zIndex: "999999 !important" }}
        centered
      >
        <Formik
          initialValues={{
            floor_plan: `Level ${floorPlans?.length + 1}`,
            refImg: "",
          }}
          validationSchema={ValidationSchema}
          onSubmit={(values, setFieldError) => {
            console.log(values, "modal");
            addFloorPlan(values, setFieldError);
            resetCanvasTransform();
          }}
        >
          {({
            errors,
            values,
            touched,
            handleSubmit,
            handleChange,
            setFieldError,
          }) => (
            <form
              className="av-tooltip tooltip-label-bottom formGroups "
              onSubmit={(e) => handleSubmit(e, setFieldError)}
            >
              <ModalBody>
                <h5 className="f-w-600 mb-4" style={{ fontSize: "18px" }}>
                  Add New Floor Plan
                </h5>
                <Row>
                  <Col md={12}>
                    <div className="marginBottom">
                      <Label className="form-labels">Name</Label>
                      <span className="asterisk">*</span>
                      <Field
                        className="form-control"
                        type="text"
                        placeholder="Please Type Here (Eg. Level 1)"
                        name="floor_plan"
                        autoComplete="off"
                        value={values?.floor_plan}
                        onChange={(e) => {
                          handleChange(e);
                        }}
                      />
                      {errors.floor_plan && touched.floor_plan ? (
                        <div className="text-danger mt-1">
                          {errors.floor_plan}
                        </div>
                      ) : null}
                    </div>
                  </Col>
                </Row>
                <div
                  className="form-group text-right "
                  style={{ marginTop: "30px" }}
                >
                  <Button
                    color="secondary"
                    className="btn btnCancel mr-3"
                    onClick={modalClose}
                  >
                    Cancel
                  </Button>
                  <Button
                    color="primary"
                    type="submit"
                    className="btn btn-primary float-right"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <p style={{ opacity: "0", position: "relative" }}>
                          Save
                        </p>
                        <Spinner className="ml-2 spinner-style" color="light" />
                      </>
                    ) : (
                      "Save"
                    )}
                  </Button>
                </div>
              </ModalBody>
            </form>
          )}
        </Formik>
      </Modal>
    </div>
  );
};

export default FloorPlanDtlsBar

