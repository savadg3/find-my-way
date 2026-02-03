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
    valueContainer: (provided) => ({
        ...provided,
        padding: '1px 8px', // Adjust padding as needed
        fontSize: '0.875rem',
    }),

    option: (provided, state) => ({

        ...provided,
        fontSize: '0.875rem',

    }),
    singleValue: (provided, state) => ({
        ...provided,
        fontSize: '0.875rem',
        position: 'absolute',
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
    }),
    placeholder: (provided) => ({
        ...provided,
        color: '#d4d4d4',
    }),
};


const ReactSelect = ({
    name, options, onchange, defaultOption }) => {

    return (
        <Select
            options={options}
            styles={customStyles}
            name={name}
            defaultValue={defaultOption}
            placeholder='Select'
            onChange={(e) => { onchange(e) }}
        />
    );
};

export default ReactSelect;
