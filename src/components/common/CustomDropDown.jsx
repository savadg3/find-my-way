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


const CustomDropdown = ({ name, options, setCustomerValues, selectValue, setFieldValue, from }) => {

    let defaultOption = [];
    if (from == 'pricing') {
        defaultOption = options?.find(ele => selectValue?.pricing_id === ele?.dec_id)
    } else if (from == 'agent') {
        defaultOption = options?.find(ele => selectValue?.agent_id === ele?.dec_id)

    } else if (from == 'status') {
        defaultOption = ((selectValue?.enc_id) || (selectValue?.id) || (selectValue?.notification_id)) ? options?.find(ele => selectValue?.status === ele?.value) : options[0]
    }

    const handleSelect = (e) => { 
        if (from == 'pricing') {
            setFieldValue('pricing_id', e?.dec_id)
            setFieldValue('enc_pricing', e?.enc_id)
        } else if (from == 'agent') {
            setFieldValue('agent_id', e?.dec_id)
        } else {
            setFieldValue('status', e?.value)
        }
    }

    return (
        <Select
            options={options}
            styles={customStyles}
            // isSearchable={false}
            name={name}
            defaultValue={defaultOption}
            placeholder='Select'
            onChange={(e) => { handleSelect(e) }}
        />
    );
};

export default CustomDropdown;
