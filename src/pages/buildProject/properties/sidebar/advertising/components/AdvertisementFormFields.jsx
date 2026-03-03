import React from 'react';
import { Field } from 'formik';
import DatePicker from 'react-datepicker';
import { Label } from 'reactstrap';
import 'react-datepicker/dist/react-datepicker.css';

import ImageUploader from '../../../../../../components/constants/imageCropNew';
import { BorderWidthComp } from './BorderWidthComp';
import CustomDropdown2 from '../../../../../../components/common/CustomDropDown2';

// ── Constants ──────────────────────────────────────────────────────────────────

const AD_LINK_TYPES = [
    { id: 'radio1', value: 1, label: 'URL' },
    { id: 'radio2', value: 2, label: 'Pin' },
];

// ── Sub-components ─────────────────────────────────────────────────────────────

const FieldError = ({ error, touched }) =>
    error && touched ? <div className="text-danger mt-1">{error}</div> : null;

const SectionHeader = ({ title, style }) => (
    <div className="bar-sub-header" style={style}>
        <p style={{ marginTop: 0 }}>{title}</p>
    </div>
);

const AdImageField = ({ croppedImage, adImage, fileKey, fileRef, onSelectImg }) => (
    <>
        {croppedImage || adImage ? (
            <img
                src={croppedImage ?? adImage}
                className="ad-img mt-3"
                style={{ cursor: 'pointer' }}
                onClick={() => fileRef.current.click()}
                alt="Advertisement"
            />
        ) : (
            <div className="select-logo ad mt-3" onClick={() => fileRef.current.click()}>
                <p>+</p>
            </div>
        )}
        <input
            type="file"
            key={fileKey}
            ref={fileRef}
            hidden
            onChange={onSelectImg}
            accept=".png, .jpg, .jpeg"
        />
        <p className="mt-2 recomended-res-label">Recommended Resolution: 1035 x 150 px</p>
    </>
);

const DateRangeField = ({ values, errors, touched, onValueChange, setFieldValue, setIsDirty }) => (
    <div className="dt-wrpr d-flex mt-3">
        <Label className="form-labels" style={{ width: '50%' }}>Date Range</Label>
        <div className="mr-2">
            <DatePicker
                name="start_date"
                selected={values.start_date}
                onChange={(e) => { onValueChange(e, 'start_date', setFieldValue); setIsDirty(true); }}
                dateFormat="dd-MM-yy"
                placeholderText="Select"
                className="form-control datePicker custom-datepicker-page bgGrey mr-3"
            />
            <FieldError error={errors.start_date} touched={touched.start_date} />
        </div>
        <div>
            <DatePicker
                name="end_date"
                selected={values.end_date ?? ''}
                onChange={(e) => { onValueChange(e, 'end_date', setFieldValue); setIsDirty(true); }}
                dateFormat="dd-MM-yy"
                placeholderText="Ongoing"
                className="form-control datePicker custom-datepicker-page bgGrey"
            />
            <FieldError error={errors.end_date} touched={touched.end_date} />
        </div>
    </div>
);

// SVGs extracted as components so they are not recreated inline on each render
const UrlIcon = ({ active }) => (
    <svg width="16.1232" height="15.3366" xmlns="http://www.w3.org/2000/svg">
        <path strokeWidth="0px" fill={active ? '#25a2db' : '#666'} d="m13.8815,0l-11.6398,0c-1.2358,0 -2.2417,1.0059 -2.2417,2.2417l0,10.8533c0,1.2358 1.0059,2.2417 2.2417,2.2417l11.6398,0c1.2358,0 2.2417,-1.0059 2.2417,-2.2417l0,-10.8533c0,-1.2358 -1.0059,-2.2417 -2.2417,-2.2417zm-7.7156,2.0051c0.3682,0 0.6666,0.2984 0.6666,0.6668c0,0.368 -0.2984,0.6664 -0.6666,0.6664s-0.6666,-0.2984 -0.6666,-0.6664c0,-0.3684 0.2984,-0.6668 0.6666,-0.6668zm-1.7498,0c0.3681,0 0.6666,0.2984 0.6666,0.6668c0,0.368 -0.2985,0.6664 -0.6666,0.6664s-0.6666,-0.2984 -0.6666,-0.6664c0,-0.3684 0.2984,-0.6668 0.6666,-0.6668zm-1.7706,0c0.3681,0 0.6666,0.2984 0.6666,0.6668c0,0.368 -0.2984,0.6664 -0.6666,0.6664s-0.6666,-0.2984 -0.6666,-0.6664c0,-0.3684 0.2984,-0.6668 0.6666,-0.6668zm12.7695,11.0899c0,0.8459 -0.6877,1.5335 -1.5335,1.5335l-11.6398,0c-0.8459,0 -1.5335,-0.6877 -1.5335,-1.5335l0,-7.9235l14.7068,0l0,7.9235z" />
    </svg>
);

const PinIcon = ({ active }) => (
    <svg width="14.2222" height="18.33" xmlns="http://www.w3.org/2000/svg">
        <path strokeWidth="0px" fill={active ? '#25a2db' : '#666'} d="m7.1115,0c-3.9212,0 -7.1115,3.1903 -7.1115,7.1115c0,1.0564 0.2627,2.18 0.7601,3.2489c0.3639,0.78 1.1685,1.8927 1.259,2.0168c1.0178,1.3961 4.6251,5.4304 4.7781,5.6014l0.3143,0.3514l0.3143,-0.3514c0.153,-0.171 3.7599,-4.2054 4.7777,-5.6014c0.0906,-0.1241 0.8952,-1.2368 1.259,-2.0168c0.497,-1.0681 0.7597,-2.1917 0.7597,-3.2489c0,-3.9212 -3.1899,-7.1115 -7.1107,-7.1115zm-0.0004,10.401c-1.9114,0 -3.4667,-1.5553 -3.4667,-3.4675s1.5553,-3.4667 3.4667,-3.4667s3.4671,1.5553 3.4671,3.4667s-1.5553,3.4675 -3.4671,3.4675z" />
    </svg>
);

const ICON_MAP = { 1: UrlIcon, 2: PinIcon };

const LinkTypeSelector = ({ values, setFieldValue, setIsDirty, handleURL, handlePin }) => (
    <div className="marginBottom d-flex mt-3">
        <Label className="form-labels d-flex align-items-center" style={{ width: '100%' }}>Link</Label>
        <div className="selectors">
            {AD_LINK_TYPES.map(({ id, value, label }) => {
                const Icon = ICON_MAP[value];
                const isActive = values.ad_type === value;
                return (
                    <div key={id} className="selecotr-item">
                        <input
                            type="radio"
                            id={id}
                            name="ad_type"
                            className="selector-item_radio"
                            value={value}
                            checked={isActive}
                            onChange={() => {
                                value === 1 ? handleURL(setFieldValue) : handlePin(setFieldValue);
                                setIsDirty(true);
                            }}
                        />
                        <label htmlFor={id} className="selector-item_label magical-words">
                            <div className="mr-1"><Icon active={isActive} /></div>
                            {label}
                        </label>
                    </div>
                );
            })}
        </div>
    </div>
);

const LinkValueField = ({ values, errors, touched, handleChange, setFieldValue, setIsDirty, locationValues, currentPinData }) => (
    <div className="mt-3">
        {values.ad_type === 2 ? (
            <>
                <CustomDropdown2
                    name="type_id"
                    options={locationValues}
                    setFieldValue={setFieldValue}
                    values={currentPinData}
                    setCustomerValues={{}}
                    selectValue={values.product_id} 
                    onChange={(e) => {
                        setFieldValue('type_id', e?.enc_id);
                        setFieldValue('type', e?.type);
                        setIsDirty(true);
                    }}
                />
                <FieldError error={errors.type_id} touched={touched.type_id} />
            </>
        ) : (
            <>
                <input
                    type="text"
                    name="link"
                    className="form-control"
                    placeholder="Please Type (Eg. www.demo.com)"
                    value={values.link ?? ''}
                    onChange={(e) => { handleChange(e); setIsDirty(true); }}
                />
                <FieldError error={errors.link} touched={touched.link} />
            </>
        )}
    </div>
);

// ── Main component ─────────────────────────────────────────────────────────────

const AdvertisementFormFields = ({
    values, errors, touched, handleChange, setFieldValue,
    croppedImage, fileKey, fileRef, onSelectImg,
    previewImage, setPreviewImage, modal, setModal, toggle2, setPostCall, setCroppedImage, setBlobImage,
    locationValues, currentPinData,
    setCurrentPinData, setIsDirty, onValueChange, handleURL, handlePin,
}) => (
    <div>
        <SectionHeader title="Details" style={{ marginTop: 0 }} />

        <div className="pl-4 pr-4"> 
            <div className="marginBottom d-flex">
                <Label className="form-labels mr-3">Name</Label>
                <div style={{ width: '100%' }}>
                    <Field
                        className="form-control"
                        type="text"
                        placeholder="Please Type"
                        name="banner_name"
                        autoComplete="off"
                        value={values.banner_name ?? ''}
                        onChange={(e) => {
                            handleChange(e);
                            setCurrentPinData((prev) => ({ ...prev, ...values, banner_name: e.target.value }));
                            setIsDirty(true);
                        }}
                    />
                    <FieldError error={errors.banner_name} touched={touched.banner_name} />
                </div>
            </div>
 
            <AdImageField
                croppedImage={croppedImage}
                adImage={values.ad_image}
                fileKey={fileKey}
                fileRef={fileRef}
                onSelectImg={onSelectImg}
            />
            <FieldError error={errors.ad_image} touched={touched.ad_image} />
 
            <DateRangeField
                values={values}
                errors={errors}
                touched={touched}
                onValueChange={onValueChange}
                setFieldValue={setFieldValue}
                setIsDirty={setIsDirty}
            />
 
            <LinkTypeSelector
                values={values}
                setFieldValue={setFieldValue}
                setIsDirty={setIsDirty}
                handleURL={handleURL}
                handlePin={handlePin}
            />
 
            <LinkValueField
                values={values}
                errors={errors}
                touched={touched}
                handleChange={handleChange}
                setFieldValue={setFieldValue}
                setIsDirty={setIsDirty}
                locationValues={locationValues}
                currentPinData={currentPinData}
            />
 
            <div className="mt-3">
                <BorderWidthComp
                    label="Duration"
                    name="duration"
                    value={values.duration}
                    onChange={(e) => { setFieldValue('duration', e); setIsDirty(true); }}
                />
                <FieldError error={errors.duration} touched={touched.duration} />
            </div>
        </div>
 
        <ImageUploader
            onSubmit={(blob, url) => {
                setCroppedImage(url);
                setBlobImage(blob);
                setIsDirty(true);
                setCurrentPinData((prev) => ({ ...prev, ...values, ad_image: blob }));
            }}
            onCancel={() => {}}
            sourceImageUrl={previewImage}
            setSourceImageUrl={setPreviewImage}
            openCropModal={modal}
            setOpenCropModal={setModal}
            toggle={toggle2}
            name="ad_image"
            setFieldValue={setFieldValue}
            setPostCall={setPostCall}
            page="ad"
            imgAspect={345 / 50}
            diasbleFreeFlow
        />
    </div>
);

export default AdvertisementFormFields;