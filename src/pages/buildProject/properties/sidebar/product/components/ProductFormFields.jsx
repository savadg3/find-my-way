import React from 'react';
import { Field } from 'formik';
import { GoPlus } from 'react-icons/go';
import { IoMdClose } from 'react-icons/io';
import { Button, Col, Label, Row } from 'reactstrap';

import TagInputComp from '../../../../../../components/tagInput/TagInputComp';
// import ImageUploader from '../../../../../components/constants/imageCropNew';
import ColorPicker from '../../../../../../components/common/Colorpicker';
import CommonDropdown from '../../../../../../components/common/CommonDropdown';
// import { WebListItem, ProdSpecItem } from '../../../../components/ProdSpecItem';
import ImageUploader from '../../../../../../components/constants/imageCropNew';
import ProdSpecItem, { WebListItem } from '../../../../components/ProdSpecItem';

// ── Sub-components ─────────────────────────────────────────────────────────────

const FieldError = ({ error, touched }) =>
    error && touched ? <div className="text-danger mt-1">{error}</div> : null;

const SectionHeader = ({ title, onAdd }) => (
    <div className="bar-sub-header">
        <p style={{ marginTop: 0 }}>{title}</p>
        {onAdd && (
            <div className="plus-icon" onClick={onAdd}>
                <GoPlus />
            </div>
        )}
    </div>
);

const ProductImageField = ({ images, imgInputRef, fileKey, onSelectImg, onDelete, setFieldValue }) => (
    <div className="marginBottom">
        <Label className="form-labels">Product Image</Label>
        <Row>
            <Col md={4}>
                {images?.length === 0 ? (
                    <div
                        className="select-logo product-image"
                        style={{ marginBottom: 0 }}
                        onClick={() => imgInputRef.current.click()}
                    >
                        <p>+</p>
                        <input
                            key={fileKey}
                            type="file"
                            accept=".jpeg, .png, .jpg"
                            ref={imgInputRef}
                            hidden
                            onChange={onSelectImg}
                        />
                    </div>
                ) : (
                    <div className="img-wrpr prduct">
                        <span className="image-container">
                            <img
                                src={images[0]}
                                style={{ borderRadius: 6, border: '1px solid rgb(204, 204, 204)' }}
                                alt="Product"
                            />
                            <span className="delete-logo-icon" style={{ right: 0 }}>
                                <div
                                    className="ml-4 p-1 rounded-circle"
                                    style={{ backgroundColor: '#E5E5E5', cursor: 'pointer' }}
                                    onClick={() => onDelete(images[0], 0, setFieldValue)}
                                >
                                    <IoMdClose style={{ fontSize: 10 }} />
                                </div>
                            </span>
                        </span>
                    </div>
                )}
            </Col>
            <p className="mt-2 recomended-res-label">Recommended Resolution: 240 × 240 px</p>
        </Row>
    </div>
);

// ── Main component ─────────────────────────────────────────────────────────────

const ProductFormFields = ({
    // Formik
    values,
    errors,
    touched,
    handleChange,
    setFieldValue,
    setFieldError,
    // Local state + setters
    images,
    imgInputRef,
    fileKey,
    onSelectImg,
    handleDeleteImage,
    previewImage,
    setPreviewImage,
    handleCropComplete,
    modal,
    setModal,
    setPostCall,
    setCroppedImage,
    setBlobImage,
    websiteLinks,
    setwebsiteLinks,
    specifications,
    setSpecifications,
    color,
    setColor,
    openPicker,
    setOpenPicker,
    parentList,
    // Callbacks
    setCurrentPinData,
    setIsDirty,
    projectData,
}) => {
    const handlePickerClick = (name) => setOpenPicker(name);

    return (
        <div>
            {/* ── Details ── */}
            <div className="bar-sub-header" style={{ marginTop: 0 }}>
                <p style={{ marginTop: 0 }}>Details</p>
            </div>

            <div className="pl-4 pr-4">
                {/* Name */}
                <div className="marginBottom">
                    <Label className="form-labels">Name</Label>
                    <Field
                        className="form-control"
                        type="text"
                        placeholder="Please Type"
                        name="product_name"
                        autoComplete="off"
                        value={values.product_name ?? ''}
                        onChange={(e) => {
                            handleChange(e);
                            setCurrentPinData((prev) => ({ ...prev, product_name: e.target.value }));
                            setIsDirty(true);
                        }}
                        onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}
                    />
                    <FieldError error={errors.product_name} touched={touched.product_name} />
                </div>

                {/* Product Code */}
                <div className="marginBottom">
                    <Label className="form-labels">Product Code</Label>
                    <Field
                        className="form-control"
                        type="text"
                        placeholder="Please Type"
                        name="product_code"
                        autoComplete="off"
                        value={values.product_code ?? ''}
                        onChange={(e) => {
                            handleChange(e);
                            setCurrentPinData((prev) => ({ ...prev, product_code: e.target.value }));
                            setIsDirty(true);
                        }}
                        onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}
                    />
                    <FieldError error={errors.product_code} touched={touched.product_code} />
                </div>

                {/* Tags */}
                <div className="marginBottom">
                    <Label className="form-labels">Tags</Label>
                    <TagInputComp
                        tags={values.tags ?? []}
                        setTags={(val) => {
                            setFieldValue('tags', val);
                            setCurrentPinData((prev) => ({ ...prev, tags: val }));
                            setIsDirty(true);
                        }}
                    />
                </div>

                <input hidden name="position" value={values.position ?? ''} readOnly />

                {/* Product Image */}
                <ProductImageField
                    images={images}
                    imgInputRef={imgInputRef}
                    fileKey={fileKey}
                    onSelectImg={onSelectImg}
                    onDelete={handleDeleteImage}
                    setFieldValue={setFieldValue}
                />

                <ImageUploader
                    // onSubmit={(blob, url) => {
                    //     setCroppedImage(url);
                    //     setBlobImage(blob); 
                    // }}
                    onSubmit={handleCropComplete}
                    onCancel={() => {
                        setCroppedImage(null);
                        setBlobImage(null);
                    }}
                    sourceImageUrl={previewImage}
                    setSourceImageUrl={setPreviewImage}
                    openCropModal={modal}
                    setOpenCropModal={setModal}
                    name="image_path"
                    setFieldValue={setFieldValue}
                    setPostCall={setPostCall}
                    imgAspect={4 / 4}
                    diasbleFreeFlow
                    // from="product"
                />

                {/* Description */}
                <div className="marginBottom">
                    <Label className="form-labels">Description</Label>
                    <textarea
                        className="form-control"
                        placeholder="Please Type"
                        name="description"
                        rows={4}
                        autoComplete="off"
                        value={values.description ?? ''}
                        onChange={(e) => {
                            handleChange(e);
                            setCurrentPinData((prev) => ({ ...prev, description: e.target.value }));
                            setIsDirty(true);
                        }}
                    />
                    <FieldError error={errors.description} touched={touched.description} />
                </div>
            </div>

            {/* ── Assign to Group (only for grouped products) ── */}
            {/* {values.type === 1 && (
                <div className="row pl-4 pr-4 mt-2 mb-3">
                    <Col md={6} className="d-flex align-items-center">
                        <Label className="mb-0" style={{ fontSize: '1rem' }}>Assign to Group</Label>
                    </Col>
                    <Col md={6}>
                        <CommonDropdown
                            name="agent"
                            options={parentList}
                            value={values.assignDetails || parentList?.[0]}
                            onChange={(e) => {
                                setIsDirty(true);
                                setCurrentPinData((prev) => ({
                                    ...prev,
                                    assignDetails: e.value == null ? null : {
                                        ...e,
                                        customer_id: values.enc_customer_id,
                                        project_id:  values.enc_project_id,
                                        prev_id:     values.enc_id,
                                        product_id:  e.enc_id,
                                        type:        3,
                                    },
                                }));
                            }}
                            onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}
                        />
                    </Col>
                </div>
            )} */}

            {/* ── Links ── */}
            <SectionHeader
                title="Links"
                onAdd={() => setwebsiteLinks((prev) => [...prev, {}])}
            />
            <div className="pl-4 pr-4">
                {websiteLinks?.map((sp, idx) => (
                    <WebListItem
                        key={idx}
                        spec={sp}
                        index={idx}
                        setSpecifications={setwebsiteLinks}
                        specifications={websiteLinks}
                        name="websiteLink"
                        setFieldValue={setFieldValue}
                        setIsDirty={setIsDirty}
                        setFieldError={setFieldError}
                        error={errors?.websiteLink?.[idx]}
                    />
                ))}
            </div>
            <FieldError error={errors.website} touched={touched.website} />

            {/* ── Specifications ── */}
            <SectionHeader
                title="Specifications"
                onAdd={() => setSpecifications((prev) => [...prev, {}])}
            />
            <div className="pl-4 pr-4">
                {specifications.map((sp, idx) => (
                    <ProdSpecItem
                        key={idx}
                        spec={sp}
                        index={idx}
                        setSpecifications={setSpecifications}
                        specifications={specifications}
                        name="specifications"
                        setFieldValue={setFieldValue}
                        setIsDirty={setIsDirty}
                    />
                ))}
            </div>

            {/* ── Style (hidden for child products) ── */}
            {!values.product_id && (
                <>
                    <SectionHeader title="Style" />
                    <div className="pl-4 pr-4">
                        <ColorPicker
                            label="Active Destination Pin Colour"
                            value={values.product_color ?? projectData?.product_color ?? '#320101'}
                            name="product_color"
                            onChange={setColor}
                            handleOkClick={(e) =>
                                setCurrentPinData((prev) => ({ ...prev, ...values, product_color: e }))
                            }
                            setFieldValue={setFieldValue}
                            isOpen={openPicker === 'product_color'}
                            setOpenPicker={setOpenPicker}
                            onClick={() => handlePickerClick('product_color')}
                            color={color}
                            setColor={setColor}
                            setIsDirty={setIsDirty}
                        />
                    </div>
                </>
            )}
        </div>
    );
};

export default ProductFormFields;