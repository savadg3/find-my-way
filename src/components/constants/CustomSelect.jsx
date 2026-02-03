import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import { getRequest } from '../../hooks/axiosClient';



const CustomSelect = ({ defaultValue, selectedOption, setSelectedOption, options, value, name, from }) => {
  const [floorID, setFloorID] = useState(null)

  // const customStyles = {
  //   control: (provided) => ({
  //     ...provided,
  //     // width:'100%',
  //     height: '32px',
  //     minHeight: '32px',
  //     fontSize: from == 'floorplan' ? '1rem' : '0.875rem', 
  //     borderRadius: '4px', 
  //     borderColor: '#f0f0f0', 
  //   }),
  //   valueContainer: (provided) => ({
  //     ...provided,
  //     padding: from == 'floorplan' ? '0px 8px' : '2px 8px',
  // }),
  //   option: (provided) => ({
  //     ...provided,
  //     fontSize: from == 'floorplan' ? '1rem' : '0.875rem', 
  //   }),
  //   singleValue: (provided) => ({
  //     ...provided,
  //     fontSize: from == 'floorplan' ? '1rem' : '0.875rem', 
  //     position: 'absolute',
  //     top: '48%',
  //     transform: 'translateY(-50%)',
  //   }),
  //   indicatorSeparator: () => ({
  //     display: 'none', // Hide the default separator between value and arrow icon
  //   }),
  //   dropdownIndicator: (provided) => ({
  //     ...provided,
  //     padding: '4px', // Optional: Adjust the padding around the arrow icon
  //   }),
  // };

  // if (from === 'vertical') {
  //   // Apply your conditional styles here
  //   customStyles.control = {
  //     ...customStyles.control,
  //     // Add your conditional styles
  //     // For example, if your condition is met:
  //     width: '290%',
  //   };
  // }


  const customStyles = {
    control: (provided) => ({
      ...provided,
      height: '32px',
      minHeight: '32px',
      fontSize: from === 'floorplan' ? '1rem' : '0.875rem',
      borderRadius: '4px',
      borderColor: '#f0f0f0',
    }),
    valueContainer: (provided) => ({
      ...provided,
      padding: from === 'floorplan' ? '0px 8px' : '2px 8px',
    }),
    option: (provided) => ({
      ...provided,
      fontSize: from === 'floorplan' ? '1rem' : '0.875rem',
    }),
    singleValue: (provided) => ({
      ...provided,
      fontSize: from === 'floorplan' ? '1rem' : '0.875rem',
      position: 'absolute',
      top: '48%',
      transform: 'translateY(-50%)',
    }),
    indicatorSeparator: (provided) => ({
      ...provided,
      backgroundColor: '#EAEAEA', // Set the color of the vertical line
      width: '1px', // Set the width of the vertical line
      alignSelf: 'stretch',
      marginTop: '5px',
      marginBottom: '7px'
    }),
    dropdownIndicator: (provided) => ({
      ...provided,
      padding: '4px',
    }),
    menu: (provided) => ({
      ...provided,
      marginTop: '2px', // Adjust the spacing between the label and the dropdown menu
    }),
  };



  const getDecryptId = async (id) => {
    const floorId = options.find(el => el?.dec_id == id)
    setFloorID(floorId)
  }


  return (
    <Select
      value={selectedOption ?? floorID}
      onChange={setSelectedOption}
      options={options}
      styles={customStyles}
      defaultValue={defaultValue}
    />
  );
};

export default CustomSelect;
