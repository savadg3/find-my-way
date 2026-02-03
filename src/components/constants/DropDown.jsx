import React from 'react'
import Select from 'react-dropdown-select';
const DropDown = ({ options, multi, onChange, ...props }) => {
    return (
        // <select className="form-select  " {...props} >
        //     {options.map(op => <option value={op.value}>{op.label}</option>)}


        // </select >
        <Select
            multi
            options={options}
            onChange={onChange}
            labelField='name'
        />
    )
}

export default DropDown