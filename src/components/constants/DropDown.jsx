import React from 'react'
import Select from 'react-dropdown-select';
const DropDown = ({ options, multi, onChange, ...props }) => {
    return ( 
        <Select
            multi
            options={options}
            onChange={onChange}
            labelField='name'
        />
    )
}

export default DropDown