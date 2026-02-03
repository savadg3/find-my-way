import React from 'react';
import { MdCalendarMonth } from "react-icons/md";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const FormikDatePicker = ({ name, value, className, onChange, onBlur, readOnly, disabled }) => {
  const handleChange = (val) => {
    onChange(name, val);
  };

  const handleBlur = (_val) => {
    onBlur(name, true);
  };

  const styleElement = document.createElement("style");
  styleElement.innerHTML = `
  .datepicker-container {
    position: absolute;
  }
  
  .date {
    display: inline-block;
    color: #808080;
    padding: 8px;
    position: relative;
    top: -32px !important;
    left: 159px;
    right: 34px !important;
    z-index: 3;
    font-size: 16px;
}


`;

  document.head.appendChild(styleElement);

  return (
    <div className="d-flex">
      <DatePicker
        name={name}
        selected={value}
        onChange={handleChange}
        onBlur={handleBlur}
        dateFormat="dd-MM-yyyy"
        placeholderText='Select date'
        readOnly={readOnly}
        disabled={disabled}
        className="form-control datePicker" // You can add your custom className here
      />
      <div
        className="input-group-append"
        style={{ marginLeft: "-36px" }}
      >
        <span
          className="input-group-text"
          style={{
            border: "none",
            backgroundColor: "transparent",
            position: 'relative',
            zIndex: 100
          }}
        >
          <MdCalendarMonth />

        </span>
      </div>
    </div>
    // <div className={`input-group ${className}`}>
    //   <DatePicker
    //     name={name}
    //     selected={value}
    //     onChange={handleChange}
    //     onBlur={handleBlur}
    //     dateFormat="dd-MM-yyyy"
    //     placeholderText='Select date'
    //     readOnly={readOnly}
    //     disabled={disabled}
    //     className="form-control datePicker" // You can add your custom className here
    //   />
    //   <span className="date">
    //     <MdCalendarMonth />
    //   </span>
    // </div>
  );
};

export default FormikDatePicker;
