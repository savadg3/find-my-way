// import React, { useRef } from 'react';
// import styled from "styled-components";

// const Container = styled.span`
//     display: inline-flex;
//     align-items: center;
//     width: 135px;
//     max-width: 150px;
//     padding: 6px 8px;
//     border: 1px solid #E6E6E6;
//     border-radius: 6px;

//     ${props =>
//       props.from=='notification' &&
//       ` max-width: 100% !important;
//       width: 100% !important;

//     `}

//     input[type="color"] {
//       margin-right: 8px;
//       -webkit-appearance: none;
//       border: none;
//       width: auto;
//       height: auto;
//       cursor: pointer;
//       background: none;
//       outline: none;
//       &::-webkit-color-swatch-wrapper {
//         padding: 0;
//         width: 20px;
//         height: 20px;
//       }
//       &::-webkit-color-swatch {
//         border: 1px solid #bfc9d9;
//         border-radius: 5px;
//         padding: 0;

//       }
//     }

//     input[type="text"] {
//       border: none;
//       width: 100%;
//       font-size: 14px;
//       outline: none;

//     }
//   `;

// const ColorSelectorComp = ({ label, value, onChange, name,from }) => {
//   const selectorRef = useRef()
//   return (
//     <div className = {`${from!='notification'?'color-input-wrpr':''}`} >
//       <p className='label color-label' >{label}</p>
//       <Container >
//         <input type="color" value={value} name={name} onChange={onChange} />
//         <input type="text" style={{ outline: 'none !important' }} name={name} value={value} readOnly />
//       </Container>

//     </div>
//   )

// }

// export default ColorSelectorComp
import React, { useRef } from 'react';
import { ChromePicker,SketchPicker  } from 'react-color';
import { Button, Card, CardBody } from 'reactstrap';
import styled from "styled-components";

const Container = styled.span`
display: inline-flex;
align-items: center;
width: 110px;
max-width: 150px;
padding: 3px 4px;
border: 1px solid #F5F6F7;
border-radius: 6px;
${props =>
    props.from == 'notification' &&
    ` max-width: 100% !important;
  width: 100% !important;
  padding: 4px 4px;


`}
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
    ${props =>
    props.from == 'notification' &&
    ` width: 20px;
      height: 20px;

    `}
   
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
  font-size: 0.875rem !important;
  outline: none;

}
.colorBox {
  width: 19px;
  height: 16px;
  margin-right: 8px;
  background-color: ${(props) => props.color};
  border-radius: 3px;
}
`;


const ColorSelectorComp = ({ label, value, onChange, name, from, setColor, color, onClick, setOpenPicker, isOpen, setFieldValue }) => {
  const selectorRef = useRef();


  const handleInputClick = () => {
    selectorRef.current.click();
  }
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
    console.log(newColor)
    let colorStr = newColor.hex
    if(newColor.rgb.a !== 1){
      colorStr = rgbaToHex(newColor.rgb.r, newColor.rgb.g, newColor.rgb.b, newColor.rgb.a);
      console.log(colorStr);
      onChange(colorStr);

    } else {
      onChange(newColor.hex);

    }

  };

  const handleSave = () => {
    // onSave(color);
    // onClose();
    setOpenPicker(null);
    setFieldValue(name, color ?? value);

    setColor(null)


  };

  const handleCancel = () => {
    // onClose();
    setOpenPicker(null);
    setFieldValue(name, value);
    setColor(null)


  };

  return (
    <div className={`${from != 'notification' ? 'color-input-wrpr' : ''}`} >
      <p className='label color-label' style={{ fontWeight: '400' }} >{label}</p>
      <Container from={from} onClick={onClick} color={value}>
        <div className='colorBox' ></div>
        <input type="text" style={{ outline: 'none !important', cursor: 'pointer' }} name={name} value={value} readOnly />
      </Container>
      {/* <Container from={from}>
        <input type="color" value={value} name={name} onChange={onChange} ref={selectorRef} />
        <input type="text" style={{ outline: 'none !important',cursor:'pointer' }} name={name} value={value} readOnly onClick={handleInputClick}/>
      </Container> */}
      {(isOpen) &&
        <Card className='color-picker-card'>
          <CardBody>
            <SketchPicker
              color={color ?? value}
              onChange={handleColorChange}
              // disableAlpha={false}

            />
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
      {/* <div className=' input-wrpr' >
                <div className='color-picker' style={{ backgroundColor: value }} onClick={() => selectorRef.current.click()} />
                <input type='color' value={value} style={{ position: 'absolute', width: 100 }} name={name} ref={selectorRef} onChange={onChange} hidden />
                <input
                    value={value}
                    onChange={onChange}
                    // className="form-control"
                    type="text"
                    name={name}
                    style={{ width: 100 }}
                />
            </div> */}
    </div>
  )

}

export default ColorSelectorComp