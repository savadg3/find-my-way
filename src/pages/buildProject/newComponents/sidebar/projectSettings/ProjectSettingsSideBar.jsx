import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Formik, Field } from 'formik';
import * as Yup from 'yup';
import { IoMdClose } from 'react-icons/io';
import { BsArrowLeftShort } from 'react-icons/bs';
import { Label } from 'reactstrap';
import BoderThickIco from '../../../../../assets/icons/border_thickness.png';
import { postRequest } from '../../../../../hooks/axiosClient';
import { decode, getCurrentUser } from '../../../../../helpers/utils';
import { SetBackEndErrorsAPi } from '../../../../../hooks/setBEerror';
import ImageUploader from '../../../../../components/constants/imageCropNew';
import ColorPicker from '../../../../../components/common/Colorpicker';
import CommonDropdown from '../../../../../components/common/CommonDropdown';
import canvasBackGroundColor from '../../../Helpers/canvas/canvasBGcolor';
import { environmentaldatas } from '../../../../../constant/defaultValues';
import AutosaveForm from '../../../components/AutoSaveForm';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { setProjectData } from '../../../../../store/slices/projectItemSlice';
import './ProjectSettingsSideBar.css'
import { useProjectHeader } from '../../../Helpers/pageDiv/ProjectHeaderContext';
 

const { image_url } = environmentaldatas;

const ValidationSchema = Yup.object().shape({
  error_reporting_email: Yup.string().nullable().email('Invalid email format.'),
});

const PIN_COLOR_FIELDS = [
  { label: 'Inactive Pin Colour',                        name: 'inactive_color' },
  { label: 'Active Starting Pin Colour',                 name: 'start_color' },
  { label: 'Active Destination Pin Colour (Location)',   name: 'location_color' },
  { label: 'Active Destination Pin Colour (Product)',    name: 'product_color' },
  { label: 'Amenity Pin Colour',                         name: 'amenity_color' },
  { label: 'Safety Pin Colour',                          name: 'safety_color' },
  { label: 'Vertical Transport Pin Colour',              name: 'level_change_color' },
  { label: 'Navigation Path Colour',                     name: 'navigation_color' },
];

const STYLE_COLOR_FIELDS = [
    { label: 'Map Background Colour',         name: 'background_color',   default: '#1a91d3' },
    { label: 'Navigation Button Colour',      name: 'nav_btn_color',      default: '#1a91d3' },
    { label: 'Navigation Button Text Colour', name: 'nav_btn_text_color', default: '#fff'},
];

const NAV_TEXT_COLOR_OPTIONS = [
  { value: '#ffffff', label: '#ffffff' },
  { value: '#000000', label: '#000000' },
];
 

const SectionHeader = ({ title, style }) => (
  <div className="bar-sub-header" style={style}>
    <p style={{ marginTop: 0 }}>{title}</p>
  </div>
);

const FieldError = ({ error, touched }) =>
  error && touched ? <div className="text-danger mt-1">{error}</div> : null;

const BorderWidthField = ({ label, value, onChange, name }) => (
  <div className="color-input-wrpr mb-4">
    <p className="label color-label">{label}</p>
    <div className="input-wrpr">
      <img src={BoderThickIco} alt="Border thickness icon" className="color-picker" />
      <input
        type="number"
        name={name}
        value={value}
        onChange={onChange}
        style={{ width: 77 }}
        aria-label={label}
      />
    </div>
  </div>
);

const ColorSwatchOption = ({ value, label }) => (
  <div style={{ display: 'flex', alignItems: 'center' }}>
    <span
      aria-hidden="true"
      style={{
        display: 'inline-block',
        width: 16,
        height: 19,
        borderRadius: 3,
        backgroundColor: value,
        marginRight: 8,
      }}
    />
    {label}
  </div>
);
 

const ProjectSettingsSideBar = () => {
  const logoSelectRef = useRef(null);
  const { id }    = useParams();
  const navigate  = useNavigate();
  const dispatch  = useDispatch();
  const decodedId = decode(id);
 
  const projectData = useSelector((state) => state.api.projectData);
  const { getProjectById } = useProjectHeader();
 
  const [blobImage, setBlobImage]       = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [fileKey, setFileKey]           = useState(Date.now());
  const [openPicker, setOpenPicker]     = useState(null);
  const [color, setColor]               = useState(null);
 
  const [logoState, setLogoState] = useState({ 
    url:  projectData?.logo ?? '',
    blob: null,
  }); 

  const buildFormData = (values) => {
    const fd = new FormData();
 
    if (logoState.blob) {
      fd.append('logo', logoState.blob);
    } else {
      fd.append('logo', logoState.url?.replace(image_url, '') ?? '');
    }

    const textFields = [
      'project_name', 'background_color', 'fill_color', 'border_thick',
      'border_color', 'inactive_color', 'location_color', 'product_color',
      'start_color', 'beacon_color', 'amenity_color', 'safety_color',
      'level_change_color', 'navigation_color', 'error_reporting_email',
    ];
    textFields.forEach((key) => fd.append(key, values?.[key] ?? ''));

    fd.append('customer_id', values?.enc_customer_id ?? getCurrentUser()?.user?.common_id);
    fd.append('navigation_thick', values?.navigation_thick ?? '3');
    fd.append('nav_btn_color', values?.nav_btn_color ?? '#1a91d3');
    fd.append('nav_btn_text_color', values?.nav_btn_text_color ?? '#fff');
    fd.append('pass_update', values?.pass_update ? 1 : 0);
    fd.append('is_pass_protected', values?.is_pass_protected ? 1 : 0);

    if (decodedId !== 0) {
      fd.append('_method', 'PUT');
      fd.append('id', decodedId);
      fd.append('is_published', '0');
      fd.append('discard', '1');
      fd.append('publish', '1');
    }

    return fd;
  };
 
  const onSubmit = async (values, { setFieldError }) => { 
    try {
      const url = decodedId !== 0 ? `project/${decodedId}` : 'project';
      const response = await postRequest(url, buildFormData(values), true);
      const data = response.response?.data ?? {};

      if (response.type === 1) { 
        dispatch(setProjectData({ logo: logoState.url }));
        setBlobImage(null);
        setLogoState((prev) => ({ ...prev, blob: null }));
      } else { 
        SetBackEndErrorsAPi(response, setFieldError);
      }
    } catch (error) {
      console.error('Project settings save failed:', error);
    }
  };
 

  const handleFileUpload = (file, setFieldValue) => {
    if (!file) return;
    setFieldValue('logo', file);
    setFileKey(Date.now());
    const reader = new FileReader();
    reader.onloadend = () => setPreviewImage(reader.result);
    reader.readAsDataURL(file);
    setCropModalOpen(true);
  };

  const handleCropComplete = (blob, url) => { 
    setBlobImage(blob);
    setLogoState({ url, blob });
  };

  const handleDeleteImage = (setFieldValue) => {
    setLogoState({ url: '', blob: null });
    setBlobImage(null);
    setFieldValue('logo', '');
    dispatch(setProjectData({ logo: null }));
  };

  const handleAutoSave = useCallback(() => {
    document.getElementById('projectSettingsBtn')?.click();
  }, []);
 

  if(!projectData) return <></>

  return (
    <aside
      className="bar"
      // style={{ position: 'relative', height: '100%', paddingBottom: 20 }}
      id="inner-customizer"
      aria-label="Project Settings panel"
    >
      <div
        className="backRow"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
      >
        <h1 style={{ margin: 0 }}>Project Settings</h1>
        <button
          type="button"
          className="backArrow"
          onClick={() => {
            getProjectById()
            navigate(-1)
          }}
          aria-label="Go back"
        >
          <BsArrowLeftShort aria-hidden="true" />
        </button>
      </div>

      <div className="sub">
        <Formik 
          initialValues={projectData ?? {}}
          validationSchema={ValidationSchema}
          onSubmit={onSubmit}
        >
          {({ errors, values, touched, handleSubmit, handleChange, setFieldValue, setFieldError }) => (
            <>
              <AutosaveForm handleSubmit={handleAutoSave} />

              <form onSubmit={(e) => handleSubmit(e, setFieldError)} noValidate>
                <div className="custom-scrollbar customScroll" style={{ height: '100%' }}>
 
                  <SectionHeader title="Details" style={{ marginTop: 0 }} />

                  <div className="pl-4 pr-4">
                  
                    <div className="marginBottom">
                      <Label className="form-labels" htmlFor="logo-upload">
                        Project Logo <span className="asterisk" aria-hidden="true">*</span>
                      </Label>

                      {logoState.url || values.logo && typeof values.logo == "string" ? (
                        <div className="logo-div">
                          <img
                            src={logoState.url || values.logo }
                            alt="Project logo preview"
                            style={{ border: '1px solid #ccc', borderRadius: 5, objectFit: 'contain', width: 'auto' }}
                          />
                          <button
                            type="button"
                            className="delete-logo-icon"
                            onClick={() => handleDeleteImage(setFieldValue)}
                            aria-label="Remove logo"
                            style={{ background: '#E5E5E5', border: 'none', borderRadius: '50%', cursor: 'pointer', padding: 4 }}
                          >
                            <IoMdClose style={{ fontSize: 10 }} aria-hidden="true" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <button
                            id="logo-upload"
                            type="button"
                            className="select-logo project"
                            // onClick={() => logoSelectRef.current?.click()}
                            aria-label="Upload project logo"
                          >
                            <input
                              key={fileKey}
                              type="file"
                              accept="image/png, image/jpeg, image/jpg"
                              ref={logoSelectRef}
                              hidden
                              onChange={(e) => handleFileUpload(e.target.files?.[0], setFieldValue)}
                              name="logo"
                              aria-hidden="true" 
                            />
                            <span aria-hidden="true">+</span>
                          </button>
                        </>
                      )}

                      <p className="mt-2 recomended-res-label">
                        Recommended Resolution: 480 × 210 px
                      </p>
                      <FieldError error={errors.logo} touched={touched.logo} />
                    </div>
 
                    <div className="marginBottom mt-3">
                      <Label htmlFor="error_reporting_email" className="form-labels">
                        Error Report Recipient{' '}
                        <span className="asterisk" aria-hidden="true">*</span>
                      </Label>
                      <Field
                        id="error_reporting_email"
                        name="error_reporting_email"
                        type="email"
                        className="form-control"
                        placeholder="Please enter an email address"
                        autoComplete="off"
                        value={values.error_reporting_email ?? ''}
                        onChange={handleChange}
                        aria-describedby={errors.error_reporting_email ? 'email-error' : undefined}
                        aria-invalid={!!(errors.error_reporting_email && touched.error_reporting_email)}
                      />
                      {errors.error_reporting_email && touched.error_reporting_email && (
                        <div id="email-error" className="text-danger mt-1" role="alert">
                          {errors.error_reporting_email}
                        </div>
                      )}
                    </div>
 
                    <ImageUploader
                      onSubmit={handleCropComplete}
                      onCancel={() => {}}
                      sourceImageUrl={previewImage}
                      setSourceImageUrl={setPreviewImage}
                      openCropModal={cropModalOpen}
                      setOpenCropModal={setCropModalOpen}
                      toggle={() => setCropModalOpen((v) => !v)}
                      setFieldValue={setFieldValue}
                      name="logo"
                      setPostCall={() => {}}
                      page="projectsettings"
                      imgAspect={160 / 70}
                    />
                  </div>
 
                  <SectionHeader title="Default Styles" />

                  <div className="pl-4 pr-4" style={{ marginBottom: 18.75 }}>
                  
                    {PIN_COLOR_FIELDS.map((item) => (
                      <ColorPicker
                        key={item.name}
                        label={item.label}
                        name={item.name}
                        value={values[item.name] ?? '#320101'}
                        color={color}
                        setColor={setColor}
                        onChange={setColor}
                        setFieldValue={setFieldValue}
                        isOpen={openPicker === item.name}
                        setOpenPicker={setOpenPicker}
                        onClick={() => setOpenPicker(item.name)}
                      />
                    ))}
 
                    <BorderWidthField
                      label="Navigation Path Thickness"
                      name="navigation_thick"
                      value={values.navigation_thick ?? 3}
                      onChange={handleChange}
                    />
 
                    {STYLE_COLOR_FIELDS.map((item) => (
                      <ColorPicker
                        key={item.name}
                        label={item.label}
                        name={item.name}
                        value={values[item.name] ?? item.default}
                        color={color ?? values[item.name]}
                        setColor={setColor}
                        onChange={setColor}
                        setFieldValue={setFieldValue}
                        isOpen={openPicker === item.name}
                        setOpenPicker={setOpenPicker}
                        onClick={() => setOpenPicker(item.name)}
                      />
                    ))}
 
                  </div>
 
                  <button id="projectSettingsBtn" type="submit" hidden aria-hidden="true">
                    Submit
                  </button>
                </div>
              </form>
            </>
          )}
        </Formik>
      </div>
    </aside>
  );
};

export default ProjectSettingsSideBar;