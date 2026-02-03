import React from 'react';
import Select from 'react-select';


const customStyles = {
    control: (provided) => ({
        ...provided,
        height: '32px', 
        minHeight: '32px',
        fontSize: '0.875rem',
        borderRadius: '4px', 
        borderColor: '#F5F6F7', 
    }),
    // valueContainer: (provided) => ({
    //     ...provided,
    //     padding: '1px 8px', 
    //     fontSize: '0.875rem',
    // }),
    valueContainer: (provided) => ({
        ...provided,
        padding: '1px 8px',
        fontSize: '0.875rem',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
    }),
    placeholder: (provided) => ({
        ...provided,
        color: '#d4d4d4',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    }),
    option: (provided, state) => ({
        ...provided,
        fontSize: '0.875rem',
    }),
    singleValue: (provided, state) => ({
        ...provided,
        fontSize: '0.875rem', 
        position: 'absolute',
        // position: 'relative', 
        top: '48%',
        transform: 'translateY(-50%)',
        color: state.data.label === 'Active' ? '#6dab8f' : state.data.label === 'Inactive' ? 'red' : 'black',

    }),
    indicatorSeparator: () => ({
        display: 'none', 
    }),
    dropdownIndicator: (provided) => ({
        ...provided,
        padding: '4px', 
        alignItems: 'center',
    }),
    clearIndicator: (provided) => ({
        ...provided,
        padding: '4px',
        alignItems: 'center',
    }),
    placeholder: (provided) => ({
        ...provided,
        color: '#d4d4d4', 
    }),
};


const CommonDropdown = ({
    name,
    options,
    value,
    onChange,
    isClearable = false,
    placeholder = false,
    formatOptionLabel = false,
    style = false
}) => {

    return (
        <Select
            options={options}
            styles={style ? style : customStyles}
            name={name}
            placeholder={placeholder ? placeholder : 'Select'}
            onChange={onChange}
            value={value}
            isClearable={isClearable} 
            formatOptionLabel={formatOptionLabel}
        />
    );
};

export default CommonDropdown;
