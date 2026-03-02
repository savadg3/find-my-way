import { Field, Formik } from 'formik'
import React, { useCallback, useRef, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    Button, Label, Row, Col, Modal,
    ModalBody, Spinner, 
} from 'reactstrap' 
import { FiSearch } from 'react-icons/fi' 
import { BiSolidPencil } from 'react-icons/bi'
import { IoMdClose } from 'react-icons/io';
import { GoPlus } from "react-icons/go";
import { FaInfo } from 'react-icons/fa';
import { useDrag, useDrop } from 'react-dnd';
import { BsArrowLeftShort } from 'react-icons/bs';
import { decode, encode, getCurrentUser } from '../../../../../helpers/utils';
import { SetBackEndErrorsAPi } from '../../../../../hooks/setBEerror';
import { postRequest, getRequest, deleteRequest } from '../../../../../hooks/axiosClient';
import * as Yup from 'yup';
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import '../../../BuildProject.css'; 
import { revertPackage } from '../../../Helpers/apis/otherApis';
import { Groupstack } from '../../../Helpers/constants/constant'; 
import { environmentaldatas } from '../../../../../constant/defaultValues';
import AutosaveForm from '../../../components/AutoSaveForm'; 
import { useSelector } from 'react-redux';
import { useProjectHeader } from '../../../Helpers/pageDiv/ProjectHeaderContext';

const { image_url } = environmentaldatas;

const ValidationSchema = Yup.object().shape({
    floor_plan: Yup.string().required('This field is required.'),
    refImg: Yup.mixed().nullable(),
})

const FloorPlan = () => { 

  const projectData = useSelector((state) => state.api.projectData);
  const navigate = useNavigate()
  const id = projectData?.enc_id
  const { getProjectById } = useProjectHeader();  
  let selFloorPlanDtls = {}
  const [searchTerm, setSearchTerm] = useState('');

  const [floorPlans, setFloorPlans] = useState([]);
  const [mapDivSize, setMapDivSize] = useState(window.innerHeight - 100); 
  const [modal, setModal] = useState(false);
  const toggle = () => setModal(!modal);
  const formRef = useRef();
  const [loading, setLoading] = useState(false);

  const addNewFloorPlan = () => {
    toggle();
    getProjectById(); 
  };

  const modalClose = () => {
    toggle();
    getFloorPlanByid(floorID, "default");
  };

  const addFloorPlan = async (values, setFieldError) => {
    setLoading(true);

    if (id != 0) {
      let refImg = "";
      if (values?.image && values?.image?.name) {
        const base64Image = values?.image;
        refImg = base64Image;
      } else {
        refImg = null;
      }

      values.refImg =
        refImg ?? (values?.plan ? values?.plan.replace(image_url, "") : null);
      let datas = {
        floor_img: values?.refImg ?? "",
        show_image: values?.show_image ?? 0,
        customer_id:
          projectData?.enc_customer_id ?? getCurrentUser()?.user?.common_id,
        project_id: id,
        file_type: 1,
        floor_plan: values?.floor_plan,
        border_color: values?.border_color ?? "",
        border_thick: values?.border_thick ?? "",
        fill_color: values?.fill_color ?? "",
        // is_high_res_tiling :"1"
      };
      if (values?.enc_id) {
        datas._method = "PUT";
        datas.id = values?.enc_id;
        datas.is_published = "0";
        datas.discard = "1";
        datas.publish = "1";
        (datas.text = texts?.length != 0 ? JSON.stringify(texts) : ""),
        (datas.tracings = tracings.length != 0 ? JSON.stringify(tracings) : "");
      } else {
        (datas.width = 820),
        (datas.height = 734),
        (datas.tracings = ""),
        (datas.points_data = ""),
        (datas.edges_data = "");
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
        const data = response?.response?.data ?? [];
        if (response.type === 1) {
          setModal(false);
          getFloors()
          if (!values?.enc_id) {
            toast.success(data?.message);
          } 
        } else {
          SetBackEndErrorsAPi(response, setFieldError); 
        }
      } catch (error) {
        console.log(error); 
      } finally {
        setLoading(false); 
      }
    } else {
      toast.error("Please add a project to add floor plan");
    }
  };

  const getFloors = async () => {
    try {
      const response = await getRequest(`list-floor-plan/${id}`);
      const data = response.data ?? []; 
      setFloorPlans(data); 

    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getFloors();
  }, [id]);

  const onEditFloorPlan = (floor, index) => {
    navigate(`${encode(floor?.enc_id)}`)
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
    //   if (value?.plan && value?.show_image) {
    //     canvasBackgroundImageHandler(
    //       value?.plan,
    //       data?.img_size ? JSON.parse(data?.img_size) : zoomInOut
    //     );
    //     // resetCanvasTransform()
    //   } else {
    //     canvasBackgroundImageHandler(null);
    //   }
      if (type == "edit") {
        // setZoomInOut(data?.img_size ? JSON.parse(data?.img_size) : zoomInOut);
      } else {
        // setZoomInOut(zoomInOut);
      }
      // resetCanvasTransform()
      // setTextStyleValue();
      // setFloorID(id);
      // setSelFloorPlanDtls(value);
      // getSvgFileAsRefImage(value?.enc_id);
      // handleTraversibleData(value, graph);
      const modifiedData = data?.vertical_transports?.map((el) => ({
        ...el,
        position: el?.positions ? JSON.parse(el?.positions) : "",
      }));
      if (type && type === "edit") {
        // removePins();
      } else {
        // getLocationList(id);
        // getProductList(id);
        // getBeaconList(id);
        // getAmenityList(id);
        // getSafetyList(id);
        // getVerticalTransportList(id);
        // setVerticalTransports(modifiedData);
      }
      // setTempPolygon([]);
      // setIsEdit(true);
      if (type !== "default") {
        console.log("here");
        // setToolActive("Draw");
        // setAddNewFloor(true);
      }
      const decodedTexts = data?.text ? JSON.parse(data?.text) : null;
      decodedString = data?.tracings ? JSON.parse(data?.tracings) : null;
      arrayOfObjects = decodedString ? JSON?.parse(decodedString) : "";
      var arrayOfTexts = decodedTexts ? JSON.parse(decodedTexts) : "";
      var decodedCircle = JSON.parse(data?.circle_data);
      var objectCircle = JSON.parse(decodedCircle);
      // setTracingCircle(objectCircle ?? []);
      // setTracings(arrayOfObjects ?? []);
      // setTexts(arrayOfTexts ?? []);
      // handleEnableDisable();
      // removeFabricObjectsByName();
      // renderTracings(arrayOfObjects);
      // renderTracingCircles(objectCircle);
      // renderTexts(arrayOfTexts);
    } catch (error) {
      console.log(error);
    } finally {
      // setFloorID(id);
      // setTimeout(() => {
        // setSavingTimer(false);
      // }, 1000);
    }
  };

  const deleteFloorPlan = async (id) => {
    try {
      const response = await deleteRequest(`floor-plan/${id}`);
      const data = response.data ?? [];
      toast.success(data?.message); 
      getFloors(); 
      revertPackage(id);
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
    if (
      fromIndex < 0 ||
      fromIndex >= arr.length ||
      toIndex < 0 ||
      toIndex >= arr.length ||
      fromIndex === toIndex
    ) {
      return arr; 
    }

    const element = arr.splice(fromIndex, 1)[0]; 
    arr.splice(toIndex, 0, element); 
    return arr;
  }

  const moveCard = useCallback((dragIndex, hoverIndex, floorsArray) => {
    let arr = moveElementToIndex(floorsArray, dragIndex, hoverIndex);
    setFloorPlans([...arr]); 
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
      project_id: id,
    };
    try {
      const reqUrl = "drag-drop";
      const response = await postRequest(reqUrl, value);
      const data = response.data ?? [];
    //   handleEnableDisable()
    } catch (error) {
      console.log(error);
    }
  };

  const FloorItem = ({ plan, index, moveCard, id, floorsArray }) => {
    const ref = useRef(null);

    const [{ handlerId }, drop] = useDrop({
      accept: "floorItem",
      drop() {
        getFloors() 
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
 
  
  const goBack = () => {
    if(loading) return
    navigate(-1) 
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
          <h1>Floor Plan </h1>
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
            />
            <form
              ref={formRef}
              className="av-tooltip tooltip-label-bottom formGroups"
              onSubmit={(e) => handleSubmit(e, setFieldError)}
            > 
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

export default FloorPlan

