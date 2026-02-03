/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { FormGroup, Label } from 'reactstrap';
// import { FaExclamationTriangle } from "react-icons/fa";

const ColorSwitcher = () => {
  // const containerRef = useRef();
  const [isOpen, setIsOpen] = useState(false);
  // const [radius, setRadius] = useState(getCurrentRadius());

  const handleDocumentClick = () => {
    if (isOpen) {
      // const container = containerRef.current;
      // if (container.contains(e.target) || container === e.target) {
      //   return;
      // }
      setIsOpen(false);
    }
  };

  useEffect(() => {
    // ['click', 'touchstart'].forEach((event) =>
    //   document.addEventListener(event, handleDocumentClick, false)
    // );

    return () => {
      ['click', 'touchstart'].forEach((event) =>
        document.removeEventListener(event, handleDocumentClick, false)
      );
    };
  }, [isOpen]);

  // const changeThemeColor = (e, color) => {
  //   e.preventDefault();
  //   setCurrentColor(color);
  //   setIsOpen(false);
  //   setTimeout(() => {
  //     window.location.reload();
  //   }, 500);
  // };

  return (
    <div  className={`theme-colors ${isOpen ? '' : 'shown'}`}>
      <div className=" pb-0 pl-4 pt-4">
        <FormGroup>
          {/* <div className='icon-div-import'>
            <FaExclamationTriangle/>
          </div> */}
          <Label for="radiusRadio">This is a testing server. Please don&apos;t upload original data as we will clear this database occasionally.</Label>
        </FormGroup>
      </div>
{isOpen? (
  <a
        href="#section"
        type='button'
        className="theme-button"
        onClick={(e) => {
          e.preventDefault();
          setIsOpen(!isOpen);
        }}
      >
        {' '}
         Important{' '}
      </a>
):
    <a
        href="#section"
        type='button'
        className="theme-button1"
        style={{left:'-90px !important;'}}
        onClick={(e) => {
          e.preventDefault();
          setIsOpen(!isOpen);
        }}
      >
        {' '}
         Close{' '}
      </a>
   }
      
    </div>
  );
};

export default ColorSwitcher;
