import React, { useCallback, useEffect, useState } from "react";
import {
  Button,
  Col,
  Label,
  Modal,
  ModalBody,
  Row,
  Spinner,
} from "reactstrap";
import * as Yup from "yup";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaInfo } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

import Accordion from "../../components/Accordian";
import SwitchComponent from "../../components/switch/SwitchComponent";
import { getRequest, postRequest } from "../../hooks/axiosClient";
import { getCurrentUser, encode } from "../../helpers/utils";
import { environmentaldatas } from "../../constant/defaultValues";
import noDataImg from "../../assets/img/noData.png";
import "./project.css";

const { image_url } = environmentaldatas;
 
const validationSchema = Yup.object().shape({
  project_name: Yup.string().required("This field is required."),
  is_pass_protected: Yup.boolean(),
  password: Yup.string().when("is_pass_protected", {
    is: true,
    then: (schema) =>
      schema
        .required("Password is required.")
        .min(6, "Password must be at least 6 characters"),
    otherwise: (schema) => schema.notRequired(),
  }),
  confirm_password: Yup.string().when("is_pass_protected", {
    is: true,
    then: (schema) =>
      schema
        .required("Confirm Password is required.")
        .oneOf([Yup.ref("password"), null], "Passwords do not match"),
    otherwise: (schema) => schema.notRequired(),
  }),
});
 
const DEFAULT_FORM = {
  project_name: "",
  logo: null,
  error_reporting_email: "",
  background_color: "#F6F7F3",
  fill_color: "#EFEEEC",
  border_color: "#D3D3D3",
  border_thick: "3",
  inactive_color: "#B2B2B2",
  location_color: "#26A3DB",
  product_color: "#F2C538",
  start_color: "#5FD827",
  beacon_color: "#26A3DB",
  amenity_color: "#9440C6",
  safety_color: "#ED1C24",
  level_change_color: "#374046",
  navigation_color: "#E52525",
  navigation_thick: "3",
  nav_btn_color: "#1a91d3",
  nav_btn_text_color: "#fff",
  is_pass_protected: false,
  password: null,
  confirm_password: null,
};

function ProjectList() {
  const navigate = useNavigate();

  const currentUser = getCurrentUser()?.user;
  const commonId   = currentUser?.common_id;
  const userId     = currentUser?.id;
  const role       = currentUser?.role_id;
 
  const [projectList,     setProjectList]     = useState([]);
  const [tempProjectList, setTempProjectList] = useState([]);
  const [noData,          setNoData]          = useState(false);
  const [page,            setPage]            = useState(1);
  const [searchTerm,      setSearchTerm]      = useState("");
  const [userDetails,     setUserDetails]     = useState({});
 
  const [modalOpen,    setModalOpen]    = useState(false);
  const [formData,     setFormData]     = useState(DEFAULT_FORM);
  const [croppedImage, setCroppedImage] = useState(null);
  const [loading,      setLoading]      = useState(false);
  const [fieldErrors,  setFieldErrors]  = useState({});
  const [editingPass,  setEditingPass]  = useState(false); 
 
  const openModal = useCallback((initialData = DEFAULT_FORM) => {
    setFormData(initialData);
    setCroppedImage(initialData.logo ? image_url + initialData.logo : null);
    setFieldErrors({});
    setEditingPass(false);
    setModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setFormData(DEFAULT_FORM);
    setCroppedImage(null);
    setFieldErrors({});
    setEditingPass(false);
  }, []);
 
  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: "" }));
  };
 
  const handleSwitchChange = (checked) => {
    setFieldErrors({});
    setFormData((prev) => ({
      ...prev,
      is_pass_protected: checked,
      password:         checked && prev.enc_id ? prev.password  : null,
      confirm_password: checked && prev.enc_id ? prev.confirm_password : null,
      pass_update:      checked ? 1 : 0,
    }));
    if (!checked) setEditingPass(false);
  };
 
  const handleEditPasswordToggle = () => {
    setEditingPass((prev) => {
      const next = !prev;
      if (next) { 
        setFormData((fd) => ({ ...fd, password: "", confirm_password: "" }));
      }
      return next;
    });
    setFormData((prev) => ({ ...prev, pass_update: editingPass ? 0 : 1 }));
  };
 
  const getProjectList = useCallback(async (pg = 1, searchKey = null) => {
    const payload = {
      common_id: commonId,
      role_id:   role,
      page:      pg,
      key:       searchKey,
    };
    try {
      const response = await postRequest("project-list", payload);
      const data = response.response?.data ?? [];

      data.forEach((item) => {
        item.customer_name = item?.customer?.user?.first_name;
        item.email         = item?.customer?.user?.email;
      });

      setNoData(data.length === 0 && pg === 1 && !searchKey);
      setTempProjectList(data);
      setProjectList((prev) => (pg === 1 ? data : [...prev, ...data]));
    } catch (error) {
      console.error(error);
    }
  }, [commonId, role]);

  const getAllList = useCallback(async () => {
    const payload = {
      common_id: commonId,
      role_id:   role,
      page,
      key: searchTerm || null,
    };
    try {
      const response = await postRequest("project-new-list", payload);
      const data = response.response?.data ?? [];

      data.forEach((item) => {
        item.customer_name = item?.customer?.user?.first_name;
        item.email         = item?.customer?.user?.email;
      });

      setProjectList(data);
    } catch (error) {
      console.error(error);
    }
  }, [commonId, role, page, searchTerm]);
 
  const getProjectById = useCallback(async (id) => {
    try {
      const response = await getRequest(`project/${id}`);
      const data = response.data ?? {};

      const protectedDefaults = data.is_pass_protected
        ? { password: 111111, confirm_password: 111111 }
        : {};

      openModal({ ...data, ...protectedDefaults });
    } catch (error) {
      console.error(error);
    }
  }, [openModal]);
 
  const getUser = useCallback(async () => {
    try {
      const response = await getRequest(`settings/${userId}`);
      setUserDetails(response.data?.data ?? {});
    } catch (error) {
      console.error(error);
    }
  }, [userId]);

  useEffect(() => { getProjectList(); }, [getProjectList]);
  useEffect(() => { getUser();        }, [getUser]);
 
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await validationSchema.validate(formData, { abortEarly: false });
    } catch (err) {
      const errMap = {};
      err?.inner?.forEach((ve) => { errMap[ve.path] = ve.message; });
      setFieldErrors(errMap);
      return;
    }

    setLoading(true);
    try {
      const fd = new FormData();
 
      if (croppedImage?.startsWith("data:image")) {
        fd.append("logo", croppedImage);
      } else {
        fd.append("logo", formData.logo ? formData.logo.replace(image_url, "") : "");
      }

      fd.append("customer_id",        formData.enc_customer_id ?? commonId);
      fd.append("project_name",       formData.project_name);
      fd.append("background_color",   formData.background_color);
      fd.append("fill_color",         formData.fill_color);
      fd.append("border_thick",       formData.border_thick);
      fd.append("border_color",       formData.border_color);
      fd.append("inactive_color",     formData.inactive_color);
      fd.append("location_color",     formData.location_color);
      fd.append("product_color",      formData.product_color);
      fd.append("start_color",        formData.start_color);
      fd.append("beacon_color",       formData.beacon_color);
      fd.append("amenity_color",      formData.amenity_color);
      fd.append("safety_color",       formData.safety_color);
      fd.append("level_change_color", formData.level_change_color);
      fd.append("navigation_color",   formData.navigation_color);
      fd.append("error_reporting_email", formData.error_reporting_email ?? "");
      fd.append("navigation_thick",   formData.navigation_thick ?? "3");
      fd.append("pass_update",        formData.pass_update ? 1 : 0);
      fd.append("is_pass_protected",  formData.is_pass_protected ? 1 : 0);
      fd.append("password",           formData.password        ?? "");
      fd.append("confirm_password",   formData.confirm_password ?? "");

      if (formData.enc_id) {
        fd.append("_method",      "PUT");
        fd.append("id",           formData.enc_id);
        fd.append("is_published", "0");
        fd.append("discard",      "1");
        fd.append("publish",      "1");
      }

      const reqUrl = formData.enc_id ? `project/${formData.enc_id}` : "project";
      const response = await postRequest(reqUrl, fd);
      const data = response.response?.data ?? {};

      if (response.type === 1) {
        toast.success(data.message);
        if (data.message === "Project added successfully.") {
          // navigate(`/view-floor/${encode(data.id)}`);
          navigate(`/project/${encode(data.id)}`);
        } else {
          closeModal();
          formData.enc_id ? getAllList() : getProjectList();
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
 
  const noPlan = userDetails?.data?.pricing_id === 0;
 
  if (noPlan) {
    return (
      <div className="container-fluid">
        <div className="py-4 flex justify-between">
          <div className="click-map-alert">
            <div className="project-alert-div">
              <div className="d-flex align-items-center justify-content-center mb-2">
                <div className="info-cont">
                  <FaInfo />
                </div>
              </div>
              <div className="text-center">
                <p style={{ fontSize: "14px", fontWeight: 500 }}>
                  Project settings have not been enabled by the administrator.
                  Please contact the administrator.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid" style={{ paddingBottom: "20px" }}> 
      <div className="flex justify-between" style={{ marginBottom: "24.36px" }}>
        <h5 className="f-w-600 heading-font">Projects</h5>
        {role !== 1 && (
          <Button
            className="btn btn-primary"
            style={{ border: "0" }}
            onClick={() => openModal()}
          >
            Add New Project
          </Button>
        )}
      </div>
 
      <Modal
        isOpen={modalOpen}
        toggle={closeModal}
        size="md"
        style={{ zIndex: "999999 !important" }}
        centered
      >
        <form
          className="av-tooltip tooltip-label-bottom formGroups"
          autoComplete="off"
          onSubmit={handleSubmit}
        >
          <ModalBody>
            <h5 className="f-w-600 mb-4" style={{ fontSize: "1.5rem" }}>
              {formData.enc_id ? "Edit" : "Add New"} Project
            </h5>

            <Row>
              <Col md={12}> 
                <div className="mb-2">
                  <Label className="form-labels">
                    Project Name <span className="asterisk">*</span>
                  </Label>
                  <input
                    className="form-control"
                    type="text"
                    name="project_name"
                    placeholder="Please Type"
                    value={formData.project_name ?? ""}
                    onChange={handleFieldChange}
                    autoComplete="off"
                  />
                  {fieldErrors.project_name && (
                    <div className="text-danger mt-1">
                      {fieldErrors.project_name}
                    </div>
                  )}
                </div>
 
                {!formData.enc_id && (
                  <div className="project-auth-check edit">
                    <div>
                      <Label className="form-labels">
                        Is this project password protected?
                      </Label>
                      <SwitchComponent
                        checked={formData.is_pass_protected}
                        onChange={handleSwitchChange}
                      />
                    </div>
 
                    {formData.is_pass_protected && formData.enc_id && (
                      <div style={{ display: "flex", justifyContent: "space-between", maxWidth: "100%" }}>
                        <button
                          type="button"
                          onClick={handleEditPasswordToggle}
                          className={`btn btn-primary float-right ${editingPass ? "active" : ""}`}
                        >
                          <svg width="25" height="25" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M20.2787 6.01838C20.0041 6.06415 19.7601 6.1557 19.5236 6.30065C19.2719 6.46086 17.9296 7.78831 17.8381 7.96378C17.7542 8.13925 17.7542 8.3376 17.8305 8.49018C17.861 8.55121 18.6999 9.40567 19.6838 10.3898C21.6058 12.3047 21.5981 12.3047 21.9337 12.2131C22.0786 12.175 22.2388 12.0301 22.8795 11.3892C23.4972 10.7713 23.6803 10.5576 23.7871 10.344C23.9548 10.0007 24.0235 9.65742 23.993 9.29123C23.9472 8.65802 23.7794 8.41389 22.6125 7.25428C21.6668 6.31591 21.4761 6.17096 21.0795 6.07178C20.8202 6.00312 20.5075 5.98023 20.2787 6.01838Z" fill="#fff"/>
                            <path d="M16.4728 9.32943C16.2745 9.42861 7.05364 18.6826 6.88585 18.9496C6.80958 19.0717 6.71043 19.2777 6.66467 19.3998C6.56552 19.6973 5.97063 23.5118 6.00113 23.6568C6.04689 23.8398 6.25282 24.0001 6.42824 24.0001C6.6723 24.0001 10.2493 23.4508 10.4857 23.3745C11.0883 23.1838 10.8976 23.3668 15.939 18.3241C20.0422 14.2196 20.6753 13.5788 20.7134 13.4262C20.8125 13.0753 20.8125 13.0753 18.9058 11.1604C17.9372 10.1915 17.083 9.36758 17.0144 9.32943C16.8542 9.25314 16.6406 9.25314 16.4728 9.32943Z" fill="#fff"/>
                          </svg>
                        </button>
                      </div>
                    )}
 
                    {formData.is_pass_protected && (
                      <>
                        <div className="project-auth-check-inputs">
                          <Label className="form-labels">Type your password</Label>
                          <input
                            className="form-control"
                            type="password"
                            name="password"
                            placeholder="password"
                            readOnly={formData.enc_id ? !editingPass : false}
                            value={formData.password ?? ""}
                            onChange={handleFieldChange}
                            autoComplete="new-password"
                          />
                          {fieldErrors.password && (
                            <div className="text-danger">{fieldErrors.password}</div>
                          )}
                        </div>

                        <div className="project-auth-check-inputs">
                          <Label className="form-labels">Re-type your password</Label>
                          <input
                            className="form-control"
                            type="password"
                            name="confirm_password"
                            placeholder="confirm password"
                            readOnly={formData.enc_id ? !editingPass : false}
                            value={formData.confirm_password ?? ""}
                            onChange={handleFieldChange}
                            autoComplete="new-password"
                          />
                          {fieldErrors.confirm_password && (
                            <div className="text-danger">{fieldErrors.confirm_password}</div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </Col>
            </Row>
 
            <div className="form-group text-right" style={{ marginTop: "30px" }}>
              <Button
                color="secondary"
                className="btn btnCancel mr-3"
                type="button"
                onClick={closeModal}
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
                    <p style={{ opacity: 0, position: "relative" }}>Save</p>
                    <Spinner className="ml-2 spinner-style" color="light" />
                  </>
                ) : (
                  "Save"
                )}
              </Button>
            </div>
          </ModalBody>
        </form>
      </Modal>

      {noData ? (
        <div className="container-fluid">
          <div className="py-4 flex justify-between">
            <div className="click-map-alert">
              <div className="project-alert-div">
                <div className="d-flex align-items-center justify-content-center mb-2 pt-3">
                  <div className="d-flex justify-content-center">
                    <img src={noDataImg} style={{ width: "35%" }} alt="No data" />
                  </div>
                </div>
                <div className="text-center pb-3">
                  <p style={{ fontSize: "14px", fontWeight: 500 }}>
                    No projects found. Please tap on the 'Add New Project'
                    button to create projects.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <Accordion
          getProjectById={getProjectById}
          projectList={projectList}
          getProjectlist={getProjectList}
          getAllList={getAllList}
          setPage={setPage}
          tempProjectList={tempProjectList}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />
      )}
    </div>
  );
}

export default ProjectList;
