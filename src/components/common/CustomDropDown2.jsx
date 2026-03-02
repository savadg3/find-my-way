import React, { useEffect, useState } from 'react';
import Select from 'react-select';


const customStyles = {
    control: (provided) => ({
        ...provided,
        height: '30px', // Adjust the height as needed
        minHeight: '30px',
        fontSize: '0.875rem', // Adjust the font size as needed
        borderRadius: '4px', // Optional: Add some border radius to make it look better
        borderColor: '#F5F6F7', // Optional: Customize the border color
    }),
    
    option: (provided) => ({
        ...provided,
        fontSize: '0.875rem', // Adjust the font size of the options
    }),

    singleValue: (provided) => ({
        ...provided,
        fontSize: '0.875rem', // Adjust the font size of the selected value
        position: 'absolute',
        top: '40%',
        transform: 'translateY(-50%)',
    }),

    placeholder: (provided) => ({
        ...provided,
        fontSize: '0.875rem', // Adjust the font size of the placeholder
        position: 'absolute',
        top: '40%',
        transform: 'translateY(-50%)',
        color: '#d4d4d4', // Optional: Customize the color of the placeholder
    }),

    indicatorSeparator: () => ({
        display: 'none', // Hide the default separator between value and arrow icon
    }),
    
    dropdownIndicator: (provided) => ({
        ...provided,
        padding: '4px', // Optional: Adjust the padding around the arrow icon
    }),
};


const CustomDropdown2 = ({ onChange, name, options, setCustomerValues, selectValue, setFieldValue, values }) => {
    const [value, setValue] = useState('') 

    useEffect(() => {
        if (!values?.from) {
            setValue('')
        }
        // console.log(options,selectValue,values)
        if (values?.type_id) {
            const defaultOption = options?.find(ele => (selectValue === ele?.enc_id) && (values?.type == ele?.type));
            if (defaultOption) {
                setValue(defaultOption)
                setFieldValue(name,selectValue)

            } else {
                setValue()
                setFieldValue(name,'')

            }

        }
    }, [values, options])
    

    return (
        <Select
            options={options}
            styles={customStyles} 
            name={name} 
            placeholder='Select'
            onChange={(e) => {
                onChange(e);
                setValue(e)
            }}
            value={value}
        />
    );
};

export default CustomDropdown2;


export const CustomDropdown3 = ({ options, onChange }) => {
    const [value, setValue] = useState('');
    return (
        <Select
            options={options}
            value={value}
            styles={customStyles}
            getOptionLabel={(e) => e.label}
            getOptionValue={(e) => e.id}
            onChange={(e) => {
                setValue(e)
                onChange(e);
            }}
            placeholder="Select"
        />
    );
};