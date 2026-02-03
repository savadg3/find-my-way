import React, { useEffect, useState } from "react";
import {
  Button, Spinner
} from "reactstrap";
import Accordion from '../../components/Accordian';
import { getRequest, postRequest } from '../../hooks/axiosClient';
import { useNavigate } from "react-router-dom";
import { FaInfo } from "react-icons/fa";
import "./project.css";
import { getCurrentUser, encode } from "../../helpers/utils";
import { Formik, Field } from "formik";
import * as Yup from "yup";
import {
  Modal,
  ModalBody,
  Row, Col, Label
} from 'reactstrap';
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { SetBackEndErrorsAPi } from '../../hooks/setBEerror';
import { environmentaldatas } from "../../constant/defaultValues";
import noDataImg from "../../assets/img/noData.png";
import SwitchComponent from "../../components/switch/SwitchComponent";
import Password from "antd/es/input/Password";

const { image_url } = environmentaldatas;

const validationSchema = Yup.object().shape({
  project_name: Yup.string().required("This field is required."),
  is_pass_protected: Yup.boolean(),
  password: Yup.string()
    .when('is_pass_protected', {
      is: true,
      then: (schema) =>
        schema
          .required('Password is required.')
          .min(6, 'Password must be at least 6 characters'),
      otherwise: (schema) => schema.notRequired(),
    }),
  confirm_password: Yup.string()
    .when('is_pass_protected', {
      is: true,
      then: (schema) =>
        schema
          .required('Confirm Password is required.')
          .oneOf([Yup.ref('password'), null], 'Passwords do not match'),
      otherwise: (schema) => schema.notRequired(),
    }),
});

function ProjectList() {

  const initialFormValues = {
    project_name: '',
    logo: null,
    error_reporting_email: '',
    background_color: '#F6F7F3',
    fill_color: '#EFEEEC',
    border_color: '#D3D3D3',
    border_thick: '3',
    inactive_color: '#B2B2B2',
    location_color: '#26A3DB',
    product_color: '#F2C538',
    start_color: '#5FD827',
    beacon_color: '#26A3DB',
    amenity_color: '#9440C6',
    safety_color: '#ED1C24',
    level_change_color: '#374046',
    navigation_color: '#E52525',
    navigation_thick: "3",
    nav_btn_color: '#1a91d3',
    nav_btn_text_color :'#fff', 
    is_pass_protected: false,
    password: null,
    confirm_password:null
  };

  let commonId = getCurrentUser()?.user?.common_id;
  let userId = getCurrentUser()?.user?.id;
  const role = getCurrentUser()?.user?.role_id;

  const [projectList, setprojectList] = useState([]);
  const [tempProjectList, setTempProjectList] = useState([]);
  const [projectSettingData, setProjectSettingData] = useState(initialFormValues);
  const [croppedImage, setCroppedImage] = useState(null);
  const [modal, setModal] = useState(false);
  const toggle2 = () => {
    setModal(!modal)
    setEdit(false)
    setErrors({});
    setIsProjectEditing(false)
  };
  const navigate = useNavigate();
  const [details, setUserDetails] = useState([]);
  const [noData, setNodata] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [isProjectEditing, setIsProjectEditing] = useState(false);

  const [edit, setEdit] = useState(false)
  const [errors, setErrors] = useState(false)
  const [passwordData, setPasswordData] = useState({
    is_pass_protected: false,
    password: null,
    confirm_password:null
  });

  useEffect(() => {
    setPasswordData(projectSettingData)
    // console.log(projectSettingData,"projectSettingDataprojectSettingData")
  },[projectSettingData])



  const getProjectlist = async (page = 1, searchKey = null) => {
    let payload = {
      common_id: commonId,
      role_id: role,
      page: page,
      key: searchKey
    }
    try {
     
      const response = await postRequest(`project-list`, payload);
      const data = response.response.data ?? [];
      data?.forEach(element => {
        element.customer_name = element?.customer?.user?.first_name
        element.email = element?.customer?.user?.email
      });
      if (data?.length == 0 && page == 1 && !searchKey) {
        setNodata(true)
      } else {
        setNodata(false)
      }
      // setprojectList(data)
      setTempProjectList(data)
      if (page === 1) {
        setprojectList(data)
      } else {
        setprojectList((prev) => [...prev, ...data]);
      }
      
    } catch (error) {
      console.log(error);
      
    }
  }

  const getAllList = async () => {
    let payload = {
      common_id: commonId,
      role_id: role,
      page: page,
      key: searchTerm !== "" ? searchTerm : null,
    }
    try {
      const response = await postRequest(`project-new-list`, payload);
      const data = response.response.data ?? [];
      data?.forEach(element => {
        element.customer_name = element?.customer?.user?.first_name
        element.email = element?.customer?.user?.email
      });
      if (data?.length == 0 && page == 1 && !searchKey) {
        setNodata(true)
      } else {
        setNodata(false)
      }
      console.log(data);
      setprojectList(data)

    } catch (error) {
      console.log(error);
      
    }
  }

  const getUser = async () => {
    try {
      const response = await getRequest(`settings/${userId}`);
      const userData = response.data.data ?? [];
      setUserDetails(userData);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    getProjectlist()
  }, []);
  useEffect(() => {
    console.log(projectList.length,"projectListprojectList")
  }, [projectList]);

  useEffect(() => {
    getUser()
  }, [userId]);

  const handleSubmitProject = async (values, setFieldError) => {
    setLoading(true)
    const formdata = new FormData();
    if (croppedImage?.startsWith('data:image')) {
      const base64Logo = croppedImage;
      formdata.append(`logo`, base64Logo);
    } else {
      const trimmedImageUrl = values?.logo ? values?.logo?.replace(image_url, '') : '';
      formdata.append(`logo`, trimmedImageUrl);
    }
    formdata.append(`customer_id`, values?.enc_customer_id ?? getCurrentUser()?.user?.common_id);
    formdata.append(`project_name`, values?.project_name);
    formdata.append(`background_color`, values?.background_color);
    formdata.append(`fill_color`, values?.fill_color);
    formdata.append(`border_thick`, values?.border_thick);
    formdata.append(`border_color`, values?.border_color);
    formdata.append(`inactive_color`, values?.inactive_color);
    formdata.append(`location_color`, values?.location_color);
    formdata.append(`product_color`, values?.product_color);
    formdata.append(`start_color`, values?.start_color);
    formdata.append(`beacon_color`, values?.beacon_color);
    formdata.append(`amenity_color`, values?.amenity_color);
    formdata.append(`safety_color`, values?.safety_color);
    formdata.append(`level_change_color`, values?.level_change_color);
    formdata.append(`navigation_color`, values?.navigation_color);
    formdata.append(`error_reporting_email`, values?.error_reporting_email ?? '');
    formdata.append(`navigation_thick`, values?.navigation_thick ?? '3');
    // if (values?.is_pass_protected) {
      formdata.append(`pass_update`, values?.pass_update ? 1 : 0);
      formdata.append(`is_pass_protected`, values?.is_pass_protected ? 1 : 0);
      formdata.append(`password`, values?.password ? values?.password : "");
      formdata.append(`confirm_password`, values?.confirm_password ? values?.confirm_password : "");
    // }
    if (values?.enc_id) {
      formdata.append(`_method`, 'PUT');
      formdata.append(`id`, values?.enc_id);
      formdata.append(`is_published`, '0');
      formdata.append(`discard `, '1');
      formdata.append(`publish  `, '1');
    }
    try {
      const reqUrl = values?.enc_id ? `project/${values?.enc_id}` : `project`;
      const response = await postRequest(reqUrl, formdata);
      const data = response.response?.data ?? [];
      if (response.type === 1) {
        if (data?.message == 'Project added successfully.') {
          navigate(`/view-floor/${encode(data?.id)}`);
        } else {
          toggle2()
          if (values?.enc_id) {
            getAllList()
          } else {
            getProjectlist()
          }
        }
        toast.success(data?.message);
      } else {
        // SetBackEndErrorsAPi(response, setFieldError);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false)
      setIsProjectEditing(false)
      setErrors({});
    }
  }

  const getProjectById = async (id) => {
    try {
      const response = await getRequest(`project/${id}`);
      const data = response.data ?? [];
      // console.log(response.data,"response.data");
       let newValue = data?.is_pass_protected ? {
        password: 111111,
        confirm_password: 111111,
      } : {}
      let value = {
        ...data,
        ...newValue
      }
      setProjectSettingData(value)
      console.log(value,"setProjectSettingData");
      setCroppedImage(value.logo ? (image_url + value.logo) : null)
      toggle2()
    } catch (error) {
      console.log(error);
    } finally {
    }
  }

  const handleSwitchChange = (checked) => {
    setErrors({})
    setPasswordData((prev) => ({
        ...prev,
        is_pass_protected: checked,
        password: passwordData?.enc_id ? projectSettingData?.password : null,
        confirm_password: passwordData?.enc_id ? projectSettingData?.confirm_password : null,
        pass_update: checked ? 1 : 0,
    }));
    if (!checked) {
        setEdit(false);
    }
  };

   const handleChange = (e) => {
      const { name, value } = e.target;
      setPasswordData((prev) => ({ ...prev, [name]: value }));
      setErrors((prev) => ({ ...prev, [name]: "" }));
  };
  

  const handleValidationAndSubmit = async (e) => {
    e.preventDefault();
    try {
        await validationSchema.validate(passwordData, { abortEarly: false });

        setErrors({});
        setEdit(false);
        handleSubmitProject(passwordData);
    } catch (err) {
        console.log(err);
        const errMap = {};
        err?.inner?.forEach((e) => {
            errMap[e.path] = e.message;
        });
        setErrors(errMap);
    }
  };

  return (
    <>
      {(details?.data?.pricing_id == 0) ? (
        <div className="container-fluid ">
          <div className=" py-4 flex justify-between ">
            <div className='click-map-alert'>
              <div className='project-alert-div'>
                <div className="d-flex align-items-center justify-content-center mb-2">
                  <div className="info-cont">
                    <FaInfo />
                  </div>
                </div>
                <div className="text-center">
                  <p style={{ fontSize: '14px', fontWeight: 500 }} >Project settings have not been enabled by the administrator. Please contact the administrator.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="container-fluid" style={{ paddingBottom: '20px' }}>
          <div className="  flex justify-between " style={{ marginBottom: '24.36px' }}>
            <h5 className="f-w-600 heading-font" >Projects</h5>
            {role != 1 &&
              <Button
                className="btn btn-primary"
                htmlType="submit"
                type=""
                style={{ border: "0", }}
                onClick={() => { setProjectSettingData(initialFormValues); toggle2() }}
              >
                Add New Project
              </Button>
            }
          </div>
          <Modal isOpen={modal} toggle={toggle2} size='md' style={{ zIndex: '999999 !important' }} centered>
            {/* <Formik
              initialValues={projectSettingData}
              validationSchema={validationSchema}
              onSubmit={(values, setFieldError) => {
                handleSubmitProject(values, setFieldError);
              }}
              enableReinitialize
            >
              {({
                errors,
                values,
                touched,
                handleSubmit,
                handleChange,
                setFieldError,
                setFieldValue
              }) => ( */}
                <form
                className="av-tooltip tooltip-label-bottom formGroups"
                autoComplete="off"
                  onSubmit={handleValidationAndSubmit}
                >
                  <ModalBody className=' '>
                    <h5 className="f-w-600 mb-4" style={{ fontSize: '1.5rem' }}>{passwordData?.enc_id ? 'Edit' : 'Add New'} Project</h5>
                    <Row className="">
                      <Col md={12}>
                        <div className="mb-2">
                          <Label for="fName" className="form-labels">Project Name</Label><span className="asterisk">*</span>
                          <div className="d-flex">
                            {/* <Field
                              id="fName"
                              className="form-control"
                              type="text"
                              name="project_name"
                              placeholder="Please Type"
                              autoComplete="off"
                            /> */}
                          
                            <input
                              className="form-control"
                              type="text"
                              name="project_name"
                              placeholder="Please Type"
                              value={passwordData.project_name}
                              onChange={handleChange}
                              autoComplete="off"
                            />
                          </div>
                          {errors.project_name ? (
                            <div className="text-danger mt-1">
                              {errors.project_name}
                            </div>
                          ) : null}
                          </div>
                          
                          {!passwordData?.enc_id && <div className="project-auth-check edit">
                            <div>
                              <div>
                                <Label for="fName" className="form-labels">Is this project password protected? </Label>
                                {/* <SwitchComponent
                                  checked={values.is_pass_protected}
                                  value={values.is_pass_protected}
                                  name="is_pass_protected"
                                  onChange={(checked) => {
                                    setFieldValue('is_pass_protected', checked);
                                    
                                    setFieldValue('password', projectSettingData?.password);
                                    setFieldValue('confirm_password', projectSettingData?.confirm_password);
                                    if (!checked) {
                                      setFieldValue('password', '');
                                      setFieldValue('confirm_password', '');
                                      setIsProjectEditing(checked)
                                      setFieldValue('pass_update', 0);
                                    }
                                  }}
                                /> */}
                                <SwitchComponent
                                  checked={passwordData.is_pass_protected} onChange={handleSwitchChange}
                                />
                              </div>
                              {passwordData.is_pass_protected && passwordData?.enc_id && <div style={{ display:"flex",justifyContent: "space-between",maxWidth:'100%' }}>
                                  <button type='button' style={{ padding: "5px !important" }} onClick={() => {
                                    // setFieldValue('pass_update', !isProjectEditing ? 1 : 0);
                                    // setIsProjectEditing((prev) => {
                                    //   if (!prev) {
                                    //     setFieldValue('password', "");
                                    //     setFieldValue('confirm_password',"");
                                    //   }
                                    //   return  !prev
                                    // })
                              
                                    setEdit((prev) => {
                                      if (!prev) {
                                        setPasswordData((prevState) => ({
                                            ...prevState,
                                            password: "",
                                            confirm_password: "",
                                        }));
                                      }
                                      return !prev;
                                    });
                              
                                    setPasswordData((prev) => ({
                                      ...prev,
                                      pass_update: edit ? 0 : 1,
                                    }));
                                  }} className={`btn btn-primary float-right btn btn-primary ${edit ? "active" : ""}`}>
                                      <svg width="25" height="25" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                                          <path d="M20.2787 6.01838C20.0041 6.06415 19.7601 6.1557 19.5236 6.30065C19.2719 6.46086 17.9296 7.78831 17.8381 7.96378C17.7542 8.13925 17.7542 8.3376 17.8305 8.49018C17.861 8.55121 18.6999 9.40567 19.6838 10.3898C21.6058 12.3047 21.5981 12.3047 21.9337 12.2131C22.0786 12.175 22.2388 12.0301 22.8795 11.3892C23.4972 10.7713 23.6803 10.5576 23.7871 10.344C23.9548 10.0007 24.0235 9.65742 23.993 9.29123C23.9472 8.65802 23.7794 8.41389 22.6125 7.25428C21.6668 6.31591 21.4761 6.17096 21.0795 6.07178C20.8202 6.00312 20.5075 5.98023 20.2787 6.01838Z" fill="#fff"/>
                                          <path d="M16.4728 9.32943C16.2745 9.42861 7.05364 18.6826 6.88585 18.9496C6.80958 19.0717 6.71043 19.2777 6.66467 19.3998C6.56552 19.6973 5.97063 23.5118 6.00113 23.6568C6.04689 23.8398 6.25282 24.0001 6.42824 24.0001C6.6723 24.0001 10.2493 23.4508 10.4857 23.3745C11.0883 23.1838 10.8976 23.3668 15.939 18.3241C20.0422 14.2196 20.6753 13.5788 20.7134 13.4262C20.8125 13.0753 20.8125 13.0753 18.9058 11.1604C17.9372 10.1915 17.083 9.36758 17.0144 9.32943C16.8542 9.25314 16.6406 9.25314 16.4728 9.32943Z" fill="#fff"/>
                                      </svg>
                                  </button>
                              </div>}
                            </div>
                        
                            {passwordData.is_pass_protected && <>
                              <div className="project-auth-check-inputs">
                                <Label for="password" className="form-labels">Type your password </Label>
                                <div className="d-flex">
                                  {/* <Field
                                    id="password"
                                    className="form-control"
                                    type="password"
                                    name="password"
                                    placeholder="password"
                                    readOnly={values?.enc_id ? isProjectEditing ? false : true : false}
                                    autoComplete="off"
                                  /> */}
                                  <input
                                    className="form-control"
                                    type="password"
                                    name="password"
                                    placeholder="password"
                                    readOnly={passwordData?.enc_id ? !edit : false}
                                    value={passwordData.password}
                                    onChange={handleChange}
                                    autoComplete="off"
                                  />
                                </div>
                              </div>

                              {errors.password ? (
                                <div className="text-danger">
                                  {errors.password}
                                </div>
                              ) : null}
                              
                              <div className="project-auth-check-inputs">
                                <Label for="confirmPassword" className="form-labels">Re-type your password </Label>
                                  <div className="d-flex">
                                    {/* <Field
                                      id="confirmPassword"
                                      className="form-control"
                                      type="password"
                                      name="confirm_password"
                                      placeholder="confirm password"
                                      readOnly={values?.enc_id ? isProjectEditing ? false : true : false}
                                      autoComplete="off"
                                    /> */}
                                   <input
                                      className="form-control"
                                      type="password"
                                      name="confirm_password"
                                      placeholder="confirm password"
                                      readOnly={passwordData?.enc_id ? !edit : false}
                                      value={passwordData.confirm_password}
                                      onChange={handleChange}
                                      autoComplete="off"
                                    />
                                  </div>
                              </div>

                              {errors.confirm_password ? (
                                <div className="text-danger">
                                  {errors.confirm_password}
                                </div>
                              ) : null}
                            </>}
                          </div>}
                      </Col>
                    </Row>
                    <div className="form-group text-right " style={{ marginTop: "30px" }}>
                      <Button color="secondary" className="btn btnCancel mr-3" onClick={toggle2}>
                        Cancel
                      </Button>
                      <Button color="primary" type="submit" className="btn btn-primary float-right" disabled={loading} >
                        {loading ? (
                          <>
                            <p style={{ opacity: '0', position: 'relative' }}>Save</p>
                            <Spinner
                              className="ml-2 spinner-style"
                              color="light"
                            />
                          </>
                        ) : 'Save'}
                      </Button>
                    </div>
                  </ModalBody>
                </form>
              {/* )}
            </Formik> */}
          </Modal>
          {
            (!noData) ?
                <Accordion
                  getProjectById={getProjectById}
                  projectList={projectList}
                  getProjectlist={getProjectlist}
                  getAllList={getAllList}
                  setPage={setPage}
                  tempProjectList={tempProjectList}
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                />
              :
              <div className="container-fluid">
                <div className=" py-4 flex justify-between ">
                  <div className='click-map-alert'>
                    <div className='project-alert-div'>
                      <div className="d-flex align-items-center justify-content-center mb-2 pt-3">
                        <div className="d-flex justify-content-center">
                          <img src={noDataImg} style={{ width: "35%" }}></img>
                        </div>
                      </div>
                      <div className="text-center pb-3">
                        <p style={{ fontSize: '14px', fontWeight: 500 }} >No projects found. Please tap on the 'Add New Project' button to create projects.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
          }
        </div>
      )}
    </>
  );
}

export default ProjectList;
