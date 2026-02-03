import React, { useState, useRef, useEffect, } from "react";
import { Nav, NavItem, NavLink, Row, Col, Card, TabContent, TabPane, } from 'reactstrap';
import { FaUserAlt } from "react-icons/fa";
import { BsFillShieldLockFill, BsFillBuildingFill } from "react-icons/bs";
import { TiCamera } from "react-icons/ti";
import Profile from './profile';
import ChangePassword from './changePassword';
import CompanySettings from "./companySettings";
import './settings.css';
import Default from '../../assets/img/default_user.svg';
import { getCurrentUser } from "../../helpers/utils";
import { getRequest, postRequest } from '../../hooks/axiosClient';
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { environmentaldatas } from '../../constant/defaultValues';
import ImageUploader from '../../components/constants/imageCropNew';

const { image_url, appurl } = environmentaldatas;


const Settings = () => {
  const [activeTab, setActiveTab] = useState('1');
  const [previewImage, setPreviewImage] = useState(null);
  const [croppedImage, setCroppedImage] = useState(null);
  const [blobImage, setBlobImage] = useState(null);
  const [postCall, setPostCall] = useState(false);
  const [loading, setLoading] = useState(false);
  const [updatedUser, setUpdatedUser] = useState(null);
  const id = getCurrentUser()?.user?.id;
  const role = getCurrentUser()?.user?.role_id;
  const fileInputRef = useRef(null);
  const [scale, setScale] = useState(1)
  const [rotate, setRotate] = useState(0)
  const [aspect, setAspect] = useState(16 / 9)
  const [openCropModal, setOpenCropModal] = useState(false);
  const toggle2 = () => setOpenCropModal(!openCropModal);
  const [fileKey, setFileKey] = useState(Date.now());


  const toggle = (tab) => {
    if (activeTab !== tab) setActiveTab(tab);
  };

  const onReset = () => {
    setAspect(16 / 9)
    setRotate(0);
    setScale(1);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];

    if (file && !allowedTypes.includes(file.type)) {
      toast.warning('Sorry! Only JPEG, PNG, and JPG files are allowed for upload.');
      return;
    }
    setFileKey(Date.now());
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result);
      onReset()
      setOpenCropModal(true)
    };
    if (file) {
      reader.readAsDataURL(file);
    }
  };


  const getImage = async () => {
    try {
      const response = await getRequest(`settings/${id}/image`);
      const resUrl = response.data.data.image_path;
      const url = resUrl ? (image_url + resUrl) : Default
      setCroppedImage(url)
      setPostCall(false);
    } catch (error) {
    }
  }

  useEffect(() => {
    getImage()
  }, [updatedUser])

  const handleSubmitPic = async (blob) => {
    try {
      const formData = new FormData();
      formData.append('id', id);
      formData.append('image', blob);

      const response = await postRequest(`settings/${id}/image`, formData, true);
      if (response.type === 2) {
      } else {
        window.location.reload();
        localStorage.setItem('updateUser', true)
        getImage()
        toast.success(response?.response?.data?.message);
      }
    } catch (error) {
    }
  }

  return (
    <>
      <div className="container-fluid">
        <h5 className="f-w-600 headingmargin heading-font" >Settings</h5>
        <Card style={{ minheight: '60vh', padding: '0px 30px 0px 10px' }}>
          <Row>
            <Col xs={12} sm={5} md={4} lg={3} xl={3} className="column1">
              <div className='d-flex justify-content-center align-items-center mt-3'>
                <span className='image-preview2 image-fluid'>
                  <img src={loading ? Default : (croppedImage)} alt='Uploaded Preview' className="preview-image" />
                </span>
                <span className='image_' >
                  <label htmlFor='fileInput'>
                    <TiCamera size={20} style={{ cursor: 'pointer', position: 'absolute', bottom: '5px', right: '64px', color: 'white' }} />
                  </label>
                  <input
                    key={fileKey}
                    id='fileInput'
                    type='file'
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    onChange={handleFileUpload}
                    accept='.svg, .png, .jpg, .jpeg'
                  />
                </span>
              </div>
              <div className='d-flex justify-content-center align-items-center mt-1' style={{ flexDirection: 'column' }} >
                <p className="f-w-600" style={{ fontSize: '1rem' }}>{updatedUser?.first_name} {updatedUser?.last_name}</p>
              </div>
              <ImageUploader
                onSubmit={(blob, url, blobUrl) => {
                  setCroppedImage(url);
                  setBlobImage(blob)
                  handleSubmitPic(blob)
                }}
                onCancel={() => {
                }}
                sourceImageUrl={previewImage}
                setSourceImageUrl={setPreviewImage}
                openCropModal={openCropModal}
                setOpenCropModal={setOpenCropModal}
                toggle={toggle2}
                setPostCall={setPostCall}
                page='settings'
                imgAspect={148 / 148}
              />
              <Nav vertical pills className="mb-4" style={{ fontSize: '13.14px' }}>
                <NavItem >
                  <NavLink
                    className={activeTab === '1' ? 'active p-3' : 'p-3'}
                    onClick={() => {
                      toggle('1');
                    }}
                  >
                    <div className="align-center">
                      <FaUserAlt className="mr-3" /><span className="ml-5" style={{ fontSize: '1rem' }}> Profile</span>
                    </div>
                  </NavLink>
                </NavItem>
                <NavItem >
                  <NavLink
                    className={activeTab === '2' ? 'active p-3' : 'p-3'}
                    onClick={() => {
                      toggle('2');
                    }}
                  >
                    <div className="align-center">
                      <BsFillShieldLockFill className="mr-3" /><span className="ml-5" style={{ fontSize: '1rem' }}> Change Password</span>
                    </div>
                  </NavLink>
                </NavItem>
                {role == 1 &&
                  <NavItem >
                    <NavLink
                      className={activeTab === '3' ? 'active p-3' : 'p-3'}
                      onClick={() => {
                        toggle('3');
                      }}
                    >
                      <div className="align-center">
                        <BsFillBuildingFill className="mr-3" /><span className="ml-5" style={{ fontSize: '1rem' }}> Company Settings</span>
                      </div>
                    </NavLink>
                  </NavItem>
                }
              </Nav>
            </Col>
            <Col xs={12} sm={7} md={8} lg={9} xl={9} className="column2">
              <TabContent activeTab={activeTab}>
                <TabPane tabId="1" >
                  <Row>
                    <Col sm="12">
                      <Profile onUsernameUpdate={setUpdatedUser} />
                    </Col>
                  </Row>
                </TabPane>
                <TabPane tabId="2">
                  <Row>
                    <Col sm="12">
                      <ChangePassword />
                    </Col>
                  </Row>
                </TabPane>
                {role == 1 &&
                  <TabPane tabId="3">
                    <Row>
                      <Col sm="12">
                        <CompanySettings />
                      </Col>
                    </Row>
                  </TabPane>
                }
              </TabContent>
            </Col>
          </Row>
        </Card>
      </div>
    </>
  )
}
export default Settings;