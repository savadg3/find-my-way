import React from 'react';
import { Field } from 'formik';
import { Label } from 'reactstrap';

import ColorPicker from '../../../../../../components/common/Colorpicker';
import DropdownWithIcons from '../../../../IconDropdown'; 

const STYLE_COLOR_FIELDS = [
    { label: 'Pin Colour',    name: 'amenity_color',    default: '#9440C6' }, 
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

const AmenityFormFields = ({ 
    values,
    errors,
    touched,
    handleChange,
    setFieldValue, 
    color,
    setColor,
    openPicker,
    setOpenPicker, 
    setSelAmenityDtls,
    setIsDirty, 
    handleAutoSave,
    amenityIcons = []
}) => {

    const handlePickerClick = (name) => setOpenPicker(name);

    const makeChangeHandler = (field) => (e) => {
        handleChange(e);
        setSelAmenityDtls((prev) => ({ ...prev, [field]: e.target.value }));
        setIsDirty(true);
    };

    const blockEnter = (e) => { if (e.key === 'Enter') e.preventDefault(); };

    const autoSaveOnChange = (e, values) => {
        if (values?.enc_id) {
            setSelAmenityDtls((prev) => ({ ...prev, icon_id: e?.enc_id, icon_path: e?.path, icon: e?.enc_id }));
            handleAutoSave();
        }
    }

    return (
        <div> 
            <SectionHeader title="Details" style={{ marginTop: 0 }} />

            <div className="pl-4 pr-4">
                <SimpleField
                    label="Name"
                    name="amenity_name"
                    value={values.amenity_name}
                    onChange={makeChangeHandler('amenity_name')}
                    onKeyDown={blockEnter}
                />
                <FieldError error={errors.amenity_name} touched={touched.amenity_name} />
            </div>

            <div className="pl-4 pr-4">
                <Label for="exampleName" className="form-labels">Icon</Label>
                <DropdownWithIcons
                    name='icon'
                    options={amenityIcons}
                    selDtls={values}
                    setSelDtls={setSelAmenityDtls}
                    setFieldValue={setFieldValue}
                    vericalTransport={2}
                    autoSaveOnChange={autoSaveOnChange}
                    isDisabled={!values?.enc_id}
                    setIsDirty={setIsDirty}

                />
                {errors.icon && touched.icon ? (
                    <div className="text-danger mt-1">
                        {errors.icon}
                    </div>
                ) : null}
            </div>
 
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
                            setSelDtls={setSelAmenityDtls}
                            values={values}
                            setIsDirty={setIsDirty}
                        />
                    </div>
                ))} 
            </div>
        </div>
    );
};

export default AmenityFormFields;