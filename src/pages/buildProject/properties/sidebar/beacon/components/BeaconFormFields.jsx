import React from 'react';
import { Field } from 'formik';
import { Label } from 'reactstrap';

import ColorPicker from '../../../../../../components/common/Colorpicker';
// import TextEditor from '../../../../../../components/text-editor/TextEditor';

const STYLE_COLOR_FIELDS = [
    { label: 'Heading Colour',    name: 'heading_color',    default: '#FFFFFF' },
    { label: 'Subheading Colour', name: 'subheading_color', default: '#26A3DB' },
    { label: 'Content Colour',    name: 'content_color',    default: '#1D1D1B' },
    { label: 'Background Colour', name: 'bg_color',         default: '#8BCDEB' },
];

const FieldError = ({ error, touched }) =>
    error && touched ? <div className="text-danger mt-1">{error}</div> : null;

const SectionHeader = ({ title, style }) => (
    <div className="bar-sub-header" style={style}>
        <p style={{ marginTop: 0 }}>{title}</p>
    </div>
);

const SimpleField = ({ label, name, value, onChange, onKeyDown }) => (
    <div className="marginBottom">
        <Label className="form-labels">{label}</Label>
        <Field
            className="form-control"
            type="text"
            placeholder="Please Type"
            name={name}
            autoComplete="off"
            value={value ?? ''}
            onChange={onChange}
            onKeyDown={onKeyDown}
        />
    </div>
); 

const BeaconFormFields = ({ 
    values,
    errors,
    touched,
    handleChange,
    setFieldValue, 
    color,
    setColor,
    openPicker,
    setOpenPicker, 
    setSelBeaconDtls,
    setIsDirty, 
    projectSettings,
}) => {

    const handlePickerClick = (name) => setOpenPicker(name);

    const makeChangeHandler = (field) => (e) => {
        handleChange(e);
        setSelBeaconDtls((prev) => ({ ...prev, [field]: e.target.value }));
        setIsDirty(true);
    };

    const blockEnter = (e) => { if (e.key === 'Enter') e.preventDefault(); };

    return (
        <div> 
            <SectionHeader title="Details" style={{ marginTop: 0 }} />

            <div className="pl-4 pr-4">
                <SimpleField
                    label="Name"
                    name="beacon_name"
                    value={values.beacon_name}
                    onChange={makeChangeHandler('beacon_name')}
                    onKeyDown={blockEnter}
                />
                <FieldError error={errors.beacon_name} touched={touched.beacon_name} />
            </div>
 
            {/* <SectionHeader title="QR Beacon Poster Content" style={{ marginTop: 12 }} />

            <div className="pl-4 pr-4">
                <SimpleField
                    label="Heading"
                    name="heading"
                    value={values.heading}
                    onChange={makeChangeHandler('heading')}
                    onKeyDown={blockEnter}
                />

                <SimpleField
                    label="Subheading"
                    name="subheading"
                    value={values.subheading}
                    onChange={makeChangeHandler('subheading')}
                    onKeyDown={blockEnter}
                /> 
            </div> */}
 
            <SectionHeader title="Style" />

            <div className="pl-4 pr-4"> 
                {STYLE_COLOR_FIELDS.map((field) => (
                    <div key={field.name} style={{ marginBottom: 18.75 }}>
                        <ColorPicker
                            label={field.label}
                            name={field.name}
                            value={values[field.name] ?? field.default}
                            onChange={setColor}
                            setFieldValue={setFieldValue}
                            isOpen={openPicker === field.name}
                            setOpenPicker={setOpenPicker}
                            onClick={() => handlePickerClick(field.name)}
                            color={color}
                            setColor={setColor}
                            setSelDtls={setSelBeaconDtls}
                            values={values}
                            setIsDirty={setIsDirty}
                        />
                    </div>
                ))}
 
                <ColorPicker
                    label="Beacon Colour"
                    name="beacon_color"
                    value={values.beacon_color ?? projectSettings?.beacon_color ?? '#320101'}
                    onChange={setColor}
                    setFieldValue={setFieldValue}
                    isOpen={openPicker === 'beacon_color'}
                    setOpenPicker={setOpenPicker}
                    onClick={() => handlePickerClick('beacon_color')}
                    color={color}
                    setColor={setColor}
                    setSelDtls={setSelBeaconDtls}
                    values={values}
                    setIsDirty={setIsDirty}
                />
            </div>
        </div>
    );
};

export default BeaconFormFields;