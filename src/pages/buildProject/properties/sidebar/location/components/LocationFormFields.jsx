import React from 'react';
import { Field } from 'formik';
import { GoPlus } from 'react-icons/go';
import { Input, Label } from 'reactstrap';
import TagInputComp from '../../../../../../components/tagInput/TagInputComp';
import TextEditor from '../../../../../../components/text-editor/TextEditor';
import HourInputComp from '../../../../components/HourInputComp';
import PromotionComp from '../../../../components/PromotionComp';
import ColorPicker from '../../../../../../components/common/Colorpicker';
import { WebListItem } from '../../../../components/ProdSpecItem';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const LocationFormFields = ({
    values,
    errors,
    touched,
    handleChange,
    setFieldValue,
    setFieldError,
    hours,
    setHours,
    setIsError,
    websiteLinks,
    setwebsiteLinks,
    promotions,
    setPromotions,
    setPromotionError,
    triedToSubmit,
    setTriedToSubmit,
    isBoundary,
    setIsBoundary,
    color,
    setColor,
    openPicker,
    setOpenPicker,
    setCurrentPinData,
    setIsDirty,
    postPromotion,
    projectData,
    currentPinData,
    setMaxContentLimit,
}) => {

    const handlePickerClick = (name) => setOpenPicker(name); 

    return (
        <> 
            <div className="bar-sub-header" style={{ marginTop: 0 }}>
                <p style={{ marginTop: 0 }}>Details</p>
            </div>

            <div className="pl-4 pr-4">
                <div className="marginBottom">
                    <Label className="form-labels">Name</Label>
                    <Field
                        className="form-control"
                        type="text"
                        placeholder="Please Type"
                        name="location_name"
                        autoComplete="off"
                        value={values.location_name}
                        onChange={(e) => {
                            handleChange(e);
                            setCurrentPinData((prev) => ({ ...prev, location_name: e.target.value }));
                            setIsDirty(true);
                        }}
                        onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}
                    />
                    {errors.location_name && touched.location_name && (
                        <div className="text-danger mt-1">{errors.location_name}</div>
                    )}
                </div>

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

                <div className="marginBottom">
                    <Label className="form-labels">Editor</Label> 
                    <TextEditor
                        name="description"
                        value={values.description}
                        setFieldValue={setFieldValue}
                        setSelBeaconDtls={setCurrentPinData}
                        setMaxContentLimit={setMaxContentLimit}
                        setIsDirty={setIsDirty}
                    />
                    {errors.description && touched.description && (
                        <div className="text-danger mt-1">{errors.description}</div>
                    )}
                </div>

                <div className="marginBottom">
                    <Label className="form-labels">Hours</Label>
                    {DAYS.map((day) => (
                        <HourInputComp
                            key={day}
                            day={day}
                            hourData={hours}
                            setHourData={setHours}
                            setIsError={setIsError}
                            setFieldValue={setFieldValue}
                            setIsDirty={setIsDirty}
                        />
                    ))}
                </div>

                <div className="marginBottom">
                    <Label className="form-labels">Phone</Label>
                    <Field
                        className="form-control"
                        type="text"
                        placeholder="Please Type"
                        name="contact"
                        autoComplete="off"
                        value={values.contact}
                        onChange={(e) => {
                            handleChange(e);
                            setCurrentPinData((prev) => ({ ...prev, contact: e.target.value }));
                            setIsDirty(true);
                        }}
                        onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}
                    />
                    {errors.contact && touched.contact && (
                        <div className="text-danger mt-1">{errors.contact}</div>
                    )}
                </div>
            </div>

            {/* ── Website ── */}
            <div className="bar-sub-header">
                <p style={{ marginTop: 0 }}>Website</p>
                <div className="plus-icon" onClick={() => setwebsiteLinks((prev) => [...prev, {}])}>
                    <GoPlus />
                </div>
            </div>
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

            {/* ── Promotions ── */}
            <div className="bar-sub-header">
                <p style={{ marginTop: 0 }}>Images / Promotions</p>
                <div className="plus-icon" onClick={() => setPromotions((prev) => [...prev, {}])}>
                    <GoPlus />
                </div>
            </div>
            {promotions.map((promo, idx) => (
                <PromotionComp
                    key={idx}
                    promo={promo}
                    promotions={promotions}
                    setPromotions={setPromotions}
                    index={idx}
                    setPromotionError={setPromotionError}
                    triedToSubmit={triedToSubmit}
                    setTriedToSubmit={setTriedToSubmit}
                    setFieldValue={setFieldValue}
                    values={values}
                    postPromotion={postPromotion}
                    setIsDirty={setIsDirty}
                />
            ))}

            {/* ── Style ── */}
            <div className="bar-sub-header">
                <p style={{ marginTop: 0 }}>Style</p>
            </div>
            <div className="pl-4 pr-4">
                <ColorPicker
                    label="Active Destination Pin Colour"
                    value={values.location_color ?? currentPinData?.location_color ?? projectData?.location_color ?? '#320101'}
                    name="location_color"
                    onChange={setColor}
                    handleOkClick={(e) => setCurrentPinData((prev) => ({ ...prev, ...values, location_color: e }))}
                    setFieldValue={setFieldValue}
                    isOpen={openPicker === 'location_color'}
                    setOpenPicker={setOpenPicker}
                    onClick={() => handlePickerClick('location_color')}
                    color={color}
                    setColor={setColor}
                    setSelLocationDtls={setCurrentPinData}
                    values={values}
                    setIsDirty={setIsDirty}
                />

                <div className="row mt-3">
                    <div className="col-sm-10">
                        <Label className="form-labels">Boundary</Label>
                    </div>
                    <div className="col-sm-2">
                        <Input
                            type="checkbox"
                            className="float-right"
                            style={{ cursor: 'pointer' }}
                            onChange={() => { setIsBoundary((prev) => !prev); setIsDirty(true); }}
                            checked={isBoundary}
                            disabled={values.position === null}
                        />
                    </div>
                </div>

                {isBoundary && (
                    <div className="mt-3">
                        <ColorPicker
                            label="Boundary Colour"
                            value={values.boundary_color ?? currentPinData?.boundary_color ?? '#320101'}
                            name="boundary_color"
                            onChange={setColor}
                            handleOkClick={(e) => setCurrentPinData((prev) => ({ ...prev, ...values, boundary_color: e }))}
                            setFieldValue={setFieldValue}
                            isOpen={openPicker === 'boundary_color'}
                            setOpenPicker={setOpenPicker}
                            onClick={() => handlePickerClick('boundary_color')}
                            color={color}
                            setColor={setColor}
                            setSelLocationDtls={setCurrentPinData}
                            values={values}
                            setIsDirty={setIsDirty}
                        />
                    </div>
                )}
            </div>
        </>
    );
};

export default LocationFormFields;