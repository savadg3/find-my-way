// import React, { useEffect, useRef, useState } from 'react';
// import $ from 'jquery';
import React, { useState, useEffect } from 'react';
import { SketchPicker } from 'react-color';
import { Button, Card, CardBody } from 'reactstrap';
import styled from "styled-components";


// import 'spectrum-colorpicker';
// import 'spectrum-colorpicker/spectrum.css';
// import styled from "styled-components";

// const ColorPicker = () => {
//     const [selectedColor, setSelectedColor] = useState('');
//     const preferredHexRef = useRef(null);
//     const Container = styled.span`
//   display: inline-flex;
//   align-items: center;
//   width: 110px;
//   max-width: 150px;
//   padding: 3px 4px;
//   border: 1px solid #F5F6F7;
//   border-radius: 6px;

//   input[type="color"] {
//     margin-right: 8px;
//     -webkit-appearance: none;
//     border: none;
//     width: auto;
//     height: auto;
//     cursor: pointer;
//     background: none;
//     outline: none;
//     &::-webkit-color-swatch-wrapper {
//       padding: 0;
//       width: 15px;
//       height: 15px;
//     }
//     &::-webkit-color-swatch {
//       border: 1px solid transparent;
//       border-radius: 3px;
//       padding: 0;
//     }
//   }

//   input[type="text"] {
//     border: none;
//     width: 100%;
//     font-size: 11.12px;
//     outline: none;

//   }
//   .colorBox {
//     width: 20px;
//     height: 20px;
//     margin-right: 8px;
//     background-color: ${selectedColor};
// }
// `;
//     useEffect(() => {
//         // Initialize Spectrum color picker
//         const spectrumInstance = $(preferredHexRef.current).spectrum({
//             preferredFormat: "hex",
//             showInput: true,
//             showPalette: false,
//             palette: [
//                 ["rgb(0, 0, 0)", "rgb(67, 67, 67)", "rgb(102, 102, 102)",
//                     "rgb(204, 204, 204)", "rgb(217, 217, 217)", "rgb(255, 255, 255)"],
//                 ["rgb(152, 0, 0)", "rgb(255, 0, 0)", "rgb(255, 153, 0)", "rgb(255, 255, 0)", "rgb(0, 255, 0)",
//                     "rgb(0, 255, 255)", "rgb(74, 134, 232)", "rgb(0, 0, 255)", "rgb(153, 0, 255)", "rgb(255, 0, 255)"],
//                 ["rgb(230, 184, 175)", "rgb(244, 204, 204)", "rgb(252, 229, 205)", "rgb(255, 242, 204)", "rgb(217, 234, 211)",
//                     "rgb(208, 224, 227)", "rgb(201, 218, 248)", "rgb(207, 226, 243)", "rgb(217, 210, 233)", "rgb(234, 209, 220)",
//                     "rgb(221, 126, 107)", "rgb(234, 153, 153)", "rgb(249, 203, 156)", "rgb(255, 229, 153)", "rgb(182, 215, 168)",
//                     "rgb(162, 196, 201)", "rgb(164, 194, 244)", "rgb(159, 197, 232)", "rgb(180, 167, 214)", "rgb(213, 166, 189)",
//                     "rgb(204, 65, 37)", "rgb(224, 102, 102)", "rgb(246, 178, 107)", "rgb(255, 217, 102)", "rgb(147, 196, 125)",
//                     "rgb(118, 165, 175)", "rgb(109, 158, 235)", "rgb(111, 168, 220)", "rgb(142, 124, 195)", "rgb(194, 123, 160)",
//                     "rgb(166, 28, 0)", "rgb(204, 0, 0)", "rgb(230, 145, 56)", "rgb(241, 194, 50)", "rgb(106, 168, 79)",
//                     "rgb(69, 129, 142)", "rgb(60, 120, 216)", "rgb(61, 133, 198)", "rgb(103, 78, 167)", "rgb(166, 77, 121)",
//                     "rgb(91, 15, 0)", "rgb(102, 0, 0)", "rgb(120, 63, 4)", "rgb(127, 96, 0)", "rgb(39, 78, 19)",
//                     "rgb(12, 52, 61)", "rgb(28, 69, 135)", "rgb(7, 55, 99)", "rgb(32, 18, 77)", "rgb(76, 17, 48)"]
//             ],
//             change: function (color) {
//                 setSelectedColor(color.toHexString());
//             }
//         });

//         // Cleanup function
//         return () => {
//               if (spectrumInstance) {
//                 $(preferredHexRef.current).spectrum('destroy');

//                 // spectrumInstance?.destroy();
//               }
//         };
//     }, []); // Run only once when the component mounts

//     useEffect(() => {
//         // Update the color of elements when selectedColor changes
//         $(".changingColor").css('color', selectedColor);
//         $(".colorBox").css('background-color', selectedColor);
//     }, [selectedColor]); // Run whenever selectedColor changes

//     const handleColorBoxClick = () => {
//         if (preferredHexRef.current) {
//             $(preferredHexRef.current).spectrum('show');
//         }
//     };

//     const handleInputClick = () => {
//         if (preferredHexRef.current) {
//             $(preferredHexRef.current).spectrum('show');
//         }
//     };

//     return (
//         <div>
//             <Container >
//             <div className="colorBox" onClick={handleColorBoxClick}></div>
//                 <input type="text"  id="preferredHex" value={selectedColor} readOnly hidden ref={preferredHexRef}
//                 />
//                 <input type="text" style={{ outline: 'none !important', cursor: 'pointer' }}  value={selectedColor} readOnly onClick={handleInputClick}   />
//             </Container>

//         </div>
//     );
// };

// export default ColorPicker;

const Container = styled.span`
  display: inline-flex;
  align-items: center;
  width: 110px;
  max-width: 150px;
  padding: 6px 4px;
  border: 1px solid #F5F6F7;
  border-radius: 6px;
  cursor: pointer;

  input[type="color"] {
    margin-right: 8px;
    -webkit-appearance: none;
    border: none;
    width: auto;
    height: auto;
    cursor: pointer;
    background: none;
    outline: none;
    &::-webkit-color-swatch-wrapper {
      padding: 0;
      width: 15px;
      height: 15px;
    }
    &::-webkit-color-swatch {
      border: 1px solid transparent;
      border-radius: 3px;
      padding: 0;
    }
  }

  input[type="text"] {
    border: none;
    width: 100%;
    font-size: 11.12px;
    outline: none;
  }

  .colorBox {
    width: 22px;
    height: 19px;
    margin-right: 8px;
    background-color: ${(props) => props.color};
    border-radius: 3px;
  }
`;

function ColorPicker({
    label,
    value,
    onChange,
    name,
    setFieldValue,
    isOpen,
    onClick,
    setOpenPicker,
    color,
    setColor,
    setSelDtls,
    values,
    debouncedAutoSave,
    onChangeHandler,
    from,
    handleFontMetaChange,
    setIsDirty,
    handleOkClick,
    transparency
}) {
    
    const [currentPicker, setCurrentPicker] = useState(null);
    // const [color, setColor] = useState({ r: 255, g: 255, b: 255, a: 1 });
    const [displayColor, setDisplayColor] = useState(value);

    function rgbaToHex(r, g, b, a) {
        // Ensure alpha is in the range of 0 to 1
        const alpha = Math.round(a * 255);

        // Convert each value to a hexadecimal string and ensure it's two digits
        const toHex = x => {
            const hex = x.toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        };

        // Convert each component to hex and concatenate them together
        return `#${toHex(r)}${toHex(g)}${toHex(b)}${toHex(alpha)}`;
    }

    const handleColorChange = (newColor) => {
        // onChange(newColor.hex);
        // let { r, g, b, a } = newColor.rgb;

        let colorStr = newColor.hex
        if (newColor.rgb.a !== 1) {
            colorStr = rgbaToHex(newColor.rgb.r, newColor.rgb.g, newColor.rgb.b, (newColor.rgb.a === 0 && transparency) ? (0.01) : newColor.rgb.a);
            // console.log(colorStr);
            onChange(colorStr);
        } else {
            onChange(newColor.hex);
        }


        // let { r, g, b, a } = newColor.rgb;
        // let internalColor;
        // let displayColor;
        // if (a === 0) {
        //     internalColor = `rgba(${r}, ${g}, ${b}, 0.1)`;
        //     displayColor = `rgba(${r}, ${g}, ${b}, 0)`;
        // } else {
        //     internalColor = displayColor = `rgba(${r}, ${g}, ${b}, ${a})`;
        // }
        // onChange(internalColor);  // Use internal color for actual color value
        // setDisplayColor(displayColor);  // Update the display color for UI

        // const { r, g, b, a } = newColor.rgb;
        // let effectiveAlpha = a === 0 ? 0.01 : a;  // Ensure functional alpha isn't zero
        // let colorValue = `rgba(${r}, ${g}, ${b}, ${effectiveAlpha})`;
        // console.log(colorValue)
        // setColor(colorValue);
        // onChange(colorValue);
        // setDisplayColor(newColor.rgb)
    };

    // Effect to set initial display color
    // useEffect(() => {
    //     setDisplayColor(value);
    // }, [value]);

    const handleSave = () => {
        if (handleOkClick) {
            handleOkClick(color);
        }
        setOpenPicker(null);
        setFieldValue(name, color ?? value);
        if (setSelDtls) {
            setSelDtls(prev => ({ ...prev, ...values, [name]: color ?? value }));
        }
        if (debouncedAutoSave) {
            debouncedAutoSave();
        }
        if (onChangeHandler) {
            onChangeHandler(color ?? value, name);
        }
        if (handleFontMetaChange) {
            handleFontMetaChange("fill", { value: color ?? value });
        }
        setColor(null);
        if (setIsDirty) {
            setIsDirty(true);
        }
    };

    const handleCancel = () => {
        setOpenPicker(null);
        setFieldValue(name, value);
        setColor(null);
    };

    const handlePickerClick = () => {
        setOpenPicker(true);
        setCurrentPicker(name);
    };

    return (
        <div style={{ position: 'relative' }}>
            <div className='color-input-wrpr' style={{ marginBottom: from ? '0px' : '18.75px' }}>
                <p className={`label ${from ? 'color-labels mr-2' : 'color-label'}`} style={{ fontWeight: '400' }}>{label}</p>
                <Container onClick={onClick} color={value}>
                    <div className='colorBox'></div>
                    <input type="text" style={{ outline: 'none !important', cursor: 'pointer' }} name={name} value={value} readOnly  onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault(); 
                        }
                    }}/>
                </Container>
            </div>
            {isOpen &&
                <Card className='color-picker-card'>
                    <CardBody>
                        <SketchPicker
                            color={color ?? value}
                            onChange={handleColorChange}
                            disableAlpha={false}
                        />
                        {/* {displayColor?.a === 0 && (
                            <div style={{
                                position: 'absolute',
                                top: '0',
                                left: '0',
                                right: '0',
                                bottom: '0',
                                background: 'transparent',
                                border: '2px solid #fff', // white border to simulate the picker border
                            }} />
                        )} */}
                        <div className='float-right'>
                            <Button className='btn-sm btnCancel mr-2' onClick={handleCancel}>
                                Cancel
                            </Button>
                            <Button className='btn-sm btn-primary' onClick={handleSave}>
                                OK
                            </Button>
                        </div>
                    </CardBody>
                </Card>
            }
        </div>
    );
}

export default ColorPicker;
