import { useState } from "react";
import "./checkbox.css";

const Checkbox = ({ label , checked, onChange}) => {

  return (
    <div className="checkbox-wrapper">
      <div className="d-flex f-12">
        <input
          className="checkbox_animated "
          type="checkbox"
          checked={checked}
          onChange={onChange}
        />
        <span style={{ fontSize: "1rem" }}> {label}</span>
      </div>
    </div>
  );
};

export default Checkbox;