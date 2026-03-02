import { Field, Formik } from 'formik'
import { useRef, useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
    Button, Label, Row, Col, 
    Input
} from 'reactstrap' 
import { FaInfo } from 'react-icons/fa'; 
import { BsArrowLeftShort } from 'react-icons/bs';
import { decode, getCurrentUser } from '../../../../../helpers/utils';
import { SetBackEndErrorsAPi } from '../../../../../hooks/setBEerror';
import { postRequest, getRequest } from '../../../../../hooks/axiosClient';
import * as Yup from 'yup';
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import '../../../BuildProject.css'; 
import { BiDevices } from "react-icons/bi"; 
import { environmentaldatas } from '../../../../../constant/defaultValues';
import AutosaveForm from '../../../components/AutoSaveForm'; 
import { useSelector } from 'react-redux';
import { useProjectHeader } from '../../../Helpers/pageDiv/ProjectHeaderContext';

const { image_url } = environmentaldatas;

const ValidationSchema = Yup.object().shape({
    floor_plan: Yup.string().required('This field is required.'),
    refImg: Yup.mixed().nullable(),
})

const FloorPlanView = () => {

  const { id , subid }    = useParams(); 
  const decodedId = decode(id);
  const decodedSubid = decode(subid);

  const projectData = useSelector((state) => state.api.projectData);
  const navigate = useNavigate()
  const { getProjectById } = useProjectHeader(); 

  const [floorData, setFloorData] = useState([]);
  const [modal, setModal] = useState(false); 
  const formRef = useRef();
  const [loading, setLoading] = useState(false);


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
        project_id: decodedId,
        file_type: 1,
        floor_plan: values?.floor_plan,
        border_color: values?.border_color ?? "",
        border_thick: values?.border_thick ?? "",
        fill_color: values?.fill_color ?? "", 
      };
      if (values?.enc_id) {
        datas._method = "PUT";
        datas.id = values?.enc_id;
        datas.is_published = "0";
        datas.discard = "1";
        datas.publish = "1"; 
      } else {
        (datas.width = 820),
        (datas.height = 734) 
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

  useEffect(() => {
    getFloorPlanByid(decodedSubid);
  }, [decodedSubid]);

  useEffect(() => {
    getProjectById(decodedId);
  }, [decodedId]);
 

  const getFloorPlanByid = async (id) => {
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


      setFloorData(value) 

      let decodedString;
      let arrayOfObjects;
      
      const modifiedData = data?.vertical_transports?.map((el) => ({
        ...el,
        position: el?.positions ? JSON.parse(el?.positions) : "",
      }));
     
      const decodedTexts = data?.text ? JSON.parse(data?.text) : null;
      decodedString = data?.tracings ? JSON.parse(data?.tracings) : null;
      arrayOfObjects = decodedString ? JSON?.parse(decodedString) : "";
      var arrayOfTexts = decodedTexts ? JSON.parse(decodedTexts) : "";
      var decodedCircle = JSON.parse(data?.circle_data);
      var objectCircle = JSON.parse(decodedCircle);
    } catch (error) {
      console.log(error);
    } finally {
    }
  }; 
  
  const goBack = () => {
    if(loading)return
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
        paddingBottom: "20px",
      }}
    >
      <Row className="backRow">
        <Col md={8}>
          <h1>Floor Plan Details</h1>
        </Col>

        <Col md={4}>
          <div className="backArrow float-right" onClick={goBack}>
            <BsArrowLeftShort />
          </div>
        </Col>
      </Row>

      <Formik
        initialValues={{ floor_plan: "", refImg: "", ...floorData }}
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
                <div
                  className="custom-scrollbar customScroll"
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
            </form>
          </>
        )}
      </Formik> 
    </div>
  );
};

export default FloorPlanView

