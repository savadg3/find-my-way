import React from 'react';
import Select from 'react-select';
import { useEffect, useState } from 'react';

const customStyles = {
    control: (provided) => ({
        ...provided,
        height: '30px', // Adjust the height as needed
        minHeight: '30px',
        fontSize: '0.875rem ', // Adjust the font size as needed
        borderRadius: '4px', // Optional: Add some border radius to make it look better
        borderColor: '#F5F6F7', // Optional: Customize the border color
    }),
    option: (provided) => ({
        ...provided,
        fontSize: '0.875rem ', // Adjust the font size of the options
    }),
    singleValue: (provided) => ({
        ...provided,
        fontSize: '0.875rem ', // Adjust the font size of the selected value
        position: 'absolute',
        top: '48%',
        transform: 'translateY(-50%)',
    }),
    indicatorSeparator: () => ({
        display: 'none', // Hide the default separator between value and arrow icon
    }),
    dropdownIndicator: (provided) => ({
        ...provided,
        padding: '4px', // Optional: Adjust the padding around the arrow icon
    }),
};


const DropdownWithIcons = ({ name, options, selDtls, setSelDtls, setFieldValue, vericalTransport, autoSaveOnChange, isDisabled, setIsDirty }) => {
    const [selectedOption, setSelectedOption] = useState(null);

    options?.forEach(element => {
        element.value = element?.dec_id
        element.label = (
            <div className='align-icon-label'>
                <div dangerouslySetInnerHTML={{ __html: element?.path }}>
                </div>
                <span className='ml-2'> {element?.name}</span>
            </div>
        )
    });
    useEffect(() => {
        // Update the selected option whenever selDtls changes
        const newSelectedOption = options.find((el) => selDtls?.icon === el?.dec_id);
        setSelectedOption(newSelectedOption);
    }, [selDtls, options]);

    return (
        <Select
            options={options}
            styles={customStyles}
            isSearchable={false}
            name={name}
            value={selectedOption}
            // defaultValue={options?.find(el => selDtls?.icon_id == el?.dec_id)}
            placeholder='Select'
            onChange={(e) => {
                console.log(e)
                setFieldValue('icon_path', e.path), setFieldValue('icon', e.enc_id), setFieldValue('icon_id', e.enc_id); setSelectedOption(e);

                if (vericalTransport == 1) {
                    setSelDtls(prev => ({ ...prev, icon: e.enc_id, icon_path: e.path }))
                    autoSaveOnChange(e, selDtls, setFieldValue)
                } else if (vericalTransport == 2) {
                    if (setIsDirty) {
                        setIsDirty(true)
                    }
                    setSelDtls(prev => ({
                        ...prev, ...selDtls,
                        icon: e.enc_id, icon_path: e.path
                    }))
                    autoSaveOnChange(e, selDtls, setFieldValue)
                }
            }}
            isDisabled={isDisabled ? isDisabled : false}
        // onChange={(e) => { setSelDtls(prev => ({ ...prev, icon: e.enc_id, icon_path: e.path })), setFieldValue('icon', e.enc_id), console.log(e.enc_id) }}
        />
    );
};

export default DropdownWithIcons;
