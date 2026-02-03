import React from 'react';
import { MdCalendarMonth } from "react-icons/md";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const FormikDatePicker = ({
    name,
    selected,
    onChange,
    dateFormat,
    placeholderText,
    readOnly,
    disabled,
    onBlur
}) => {


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
                selected={selected}
                onChange={onChange}
                dateFormat="dd-MM-yyyy"
                placeholderText='Select'
                readOnly={readOnly}
                disabled={disabled}
                style={{ backgroundColor: '#ccc' }}
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
                    <svg width="15" height="13" xmlns="http://www.w3.org/2000/svg" fill="none">

                        <g>
                            <title>Layer 1</title>
                            <path id="svg_1" fill="#666666" d="m12.5861,1.09141l-0.6536,0l0,-1.09141l-1.0652,0l0,1.04289l-6.99632,0l0,-1.04289l-0.96833,0l0,1.04289l-0.6536,0c-0.36597,0 -0.71694,0.14568 -0.97572,0.40495c-0.25878,0.25926 -0.40419,0.61088 -0.40419,0.97753l0,9.19213c0.00623,0.3647 0.15362,0.7127 0.41106,0.9707c0.25744,0.2579 0.60482,0.4056 0.96885,0.4118l10.24025,0c0.364,-0.0062 0.7114,-0.1539 0.9689,-0.4118c0.2574,-0.258 0.4047,-0.606 0.4109,-0.9707l0,-9.19213c-0.0111,-0.34201 -0.1485,-0.66773 -0.3855,-0.91414c-0.237,-0.2464 -0.5568,-0.39599 -0.8975,-0.41982zm0,11.05969l-10.2402,0c-0.13074,0.0002 -0.25654,-0.0501 -0.35122,-0.1405c-0.09467,-0.0903 -0.15098,-0.2137 -0.15721,-0.3446l0,-6.62122l11.23283,0l0,6.62122c-0.0062,0.1244 -0.06,0.2417 -0.1501,0.3275c-0.0902,0.0858 -0.2098,0.1335 -0.3341,0.1334l0,0.0242z" />
                            <path id="svg_2" fill="#666666" d="m5.95545,6.06348l-0.99256,0l0,0.99441l0.99256,0l0,-0.99441z" />
                            <path id="svg_3" fill="#666666" d="m7.9671,6.06348l-0.99249,0l0,0.99441l0.99249,0l0,-0.99441z" />
                            <path id="svg_4" fill="#666666" d="m9.95155,6.06348l-0.99257,0l0,0.99441l0.99257,0l0,-0.99441z" />
                            <path id="svg_5" fill="#666666" d="m11.9555,6.06348l-0.9926,0l0,0.99441l0.9926,0l0,-0.99441z" />
                            <path id="svg_6" fill="#666666" d="m5.95545,8.05249l-0.99256,0l0,0.99438l0.99256,0l0,-0.99438z" />
                            <path id="svg_7" fill="#666666" d="m3.97108,8.05249l-0.99256,0l0,0.99438l0.99256,0l0,-0.99438z" />
                            <path id="svg_8" fill="#666666" d="m7.9671,8.05249l-0.99249,0l0,0.99438l0.99249,0l0,-0.99438z" />
                            <path id="svg_9" fill="#666666" d="m9.95155,8.05249l-0.99257,0l0,0.99438l0.99257,0l0,-0.99438z" />
                            <path id="svg_10" fill="#666666" d="m11.9555,8.05249l-0.9926,0l0,0.99438l0.9926,0l0,-0.99438z" />
                            <path id="svg_11" fill="#666666" d="m3.97108,10.0408l-0.99256,0l0,0.9944l0.99256,0l0,-0.9944z" />
                            <path id="svg_12" fill="#666666" d="m5.95545,10.0408l-0.99256,0l0,0.9944l0.99256,0l0,-0.9944z" />
                            <path id="svg_13" fill="#666666" d="m7.9671,10.0408l-0.99249,0l0,0.9944l0.99249,0l0,-0.9944z" />
                        </g>
                    </svg>
                </span>
            </div>
        </div>
    );
};

export default FormikDatePicker;
