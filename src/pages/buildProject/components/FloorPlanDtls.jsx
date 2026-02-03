import { Formik } from "formik";
import React, { useEffect, useRef, useState } from "react";
import { RxBorderWidth } from "react-icons/rx";
import styled from "styled-components";
import Select from "react-select";
import { standardFontSize, standardFonts } from "../../../components/constants/standardFonts";
import ColorPicker from '../../../components/common/Colorpicker';
import { MdOutlineCircle, MdOutlineRectangle } from "react-icons/md";
import { BsTriangle } from "react-icons/bs";
import { PiPaintBucketDuotone } from "react-icons/pi";
import { FaEraser } from "react-icons/fa";
import { RiFileDownloadLine } from "react-icons/ri";
import { BoldSvg, CenterAlignSvg, CircleSvg, EraseSvg, FillSvg, ImportSvg, LeftAlignSvg, PencilSvg, PolygonSvg, RectangleSvg, RightAlignSvg, SelectSvg, TextSvg } from "../../../components/common/svgIcons";
import { IoMdClose } from "react-icons/io";
import { Modal, ModalBody } from "reactstrap";
import { IoImageOutline } from "react-icons/io5";
import { RiRestartLine } from "react-icons/ri";
import { postRequest } from "../../../hooks/axiosClient";


const Container = styled.span`
  display: inline-flex;
  align-items: center;
  width: 135px;
  max-width: 150px;
  padding: 4px 5px;
  border: 1px solid #e6e6e6;
  border-radius: 6px;

  input[type="color"] {
    margin-right: 8px;
    -webkit-appearance: none;
    border: none;
    width: auto;
    height: auto;
    cursor: pointer;
    background: none;
    &::-webkit-color-swatch-wrapper {
      padding: 0;
      width: 18px;
      height: 18px;
    }
    &::-webkit-color-swatch {
      border: none;
      border-radius: 5px;
      padding: 0;
    }
  }

  input[type="text"] {
    border: none;
    width: 100%;
    font-size: 14px;
    outline: none;
    color: #6a6d73;
  }
`;

const FloorPlanDtls = ({
  selObject,
  textStyleHandler,
  onDeleteTracing,
  selTracingId,
  onChangeTracingMetadata,
  selFloorPlanDtls,
  setIsEdit,
  projectSettings,
  isEdit,
  tracingIntialValue,
  toolActive,
  setToolActive,
  obj,
  setSelObject,
  stopPathDrawing,
  activeText,
  setProjectSettings,
  setTracingIntialValue,
  setPanTool,
  setTextStyleValue,
  onSelectReferanceImage,
  importSvg,
  handleDeleteRefImage,
  fileKey,
  // resizeAndScaleCanvas,
  duplicateObject,
  getSvgFileAsRefImage,
  reftoggle
}) => {
  const [selectedFont, setSelectedFont] = useState();
  const [fontSize, setFontsize] = useState();
  const [fontWeight, setFontWeight] = useState();
  const [textAlign, setTextAlign] = useState();
  const referenceImageRef = useRef()
  const importSvgRef = useRef()

  const [fontColor, setFontColor] = useState();
  const [color, setColor] = useState(null);
  const [openPicker, setOpenPicker] = useState(null);

  const handlePickerClick = (name) => {
    setOpenPicker(name);
  };

  const fontOptions = [...standardFonts.map((a) => ({ label: a, value: a }))];
  const fontSizeOptions = [...standardFontSize.map((a) => ({ label: a, value: a }))];


  const handleFontMetaChange = (type, event) => {
    console.log(type, event, textAlign);
    if (type == "fontFamily") {
      setSelectedFont(event);

    } else if (type == "fill") {
      setFontColor(event.value);
    }
    else if (type == "fontSize") {
      setFontsize(event);
    }
    else if (type == "fontWeight") {
      setFontWeight(event.value);
    }
    else if (type == "textAlign") {
      setTextAlign(event.value);
    }
    setTextStyleValue((prev) => ({ ...prev, [type]: event?.value }))
    // setSelObject((prev) => ({ ...prev, [type]: event?.value }))
    textStyleHandler(type, event.value);
  };



  const onChangeHandler = (value, name) => {
    setProjectSettings((prev) => ({ ...prev, [name]: value }));
    setTracingIntialValue((prev) => ({ ...prev, [name]: value }));
    onChangeTracingMetadata(value, name);
  };

  useEffect(() => {
    if (selObject?.name == "text") {
      setSelectedFont({
        value: selObject.fontFamily,
        label: selObject.fontFamily,
      });
      setFontColor(selObject.fill);
      setFontsize({
        value: selObject.fontSize,
        label: selObject.fontSize
      });
      setFontWeight(
        selObject.fontWeight
      );
      setTextAlign(
        selObject.textAlign
      );
    }
  }, [selObject]);


  const handleShapeToolClick = (type) => {
    activeText = undefined;
    stopPathDrawing()
    setToolActive(type);
    setPanTool(false);
  }


  

  return (
    <div className="d-grid">
      <Formik
        initialValues={tracingIntialValue}
        onSubmit={(values) => {
        }}
        enableReinitialize
      >
        {({
          values,
          handleSubmit,
          setFieldValue
        }) => (
          <>

            <div className="magical-words">
              <div className="bp-fpd-container">

                <div className="d-flex tool-div ">
                  <form
                    className="av-tooltip  formGroups bp-fpd-bar"
                    onSubmit={handleSubmit}
                  >
                    <div className="d-grid">
                      <div className="d-flex bp-fpd-bar">
                        <div
                          className="tool-icons_fp"
                          onClick={() => {
                            stopPathDrawing()
                            setToolActive("Draw");
                            setSelObject()
                            // setFontColor()
                            // setSelectedFont()
                            activeText = undefined;
                            setPanTool(false);
                            // resizeAndScaleCanvas()

                          }}
                          style={{
                            backgroundColor:
                              (toolActive === "Draw" || toolActive === "Circle" || toolActive === "Rectangle") ? "#f0f8fc" : "#f5f6f7",
                            color: (toolActive === "Draw" || toolActive === "Circle" || toolActive === "Rectangle") ? "#26a3db" : "#6a6d73"
                          }}
                        >
                          <PencilSvg fill={(toolActive === "Draw" || toolActive === "Circle" || toolActive === "Rectangle") ? "#26a3db" : "#A8ABAF"} />

                        </div>
                        <div
                          className="tool-icons_fp"
                          onClick={() => {
                            stopPathDrawing()
                            setToolActive("Fill");
                            setSelObject()
                            // setFontColor()
                            // setSelectedFont()
                            activeText = undefined;
                            setPanTool(false);
                            // resizeAndScaleCanvas()

                          }}
                          style={{
                            backgroundColor:
                              toolActive === "Fill" ? "#f0f8fc" : "#f5f6f7",
                            color: toolActive === "Fill" ? "#26a3db" : "#6a6d73"
                          }}
                        >
                          <FillSvg fill={toolActive === "Fill" ? "#26a3db" : "#A8ABAF"} />

                        </div>
                        <div
                          className="tool-icons_fp"
                          onClick={() => {
                            setToolActive("Text");
                            setPanTool(false);
                            // resizeAndScaleCanvas()

                          }}
                          style={{
                            backgroundColor:
                              toolActive === "Text" ? "#f0f8fc" : "#f5f6f7",
                            color: toolActive === "Text" ? "#26a3db" : "#6a6d73"
                          }}
                        >
                          <TextSvg fill={toolActive === "Text" ? "#26a3db" : "#6A6D73"} />
                        </div>
                        <div
                          className="tool-icons_fp"
                          onClick={() => {
                            stopPathDrawing()
                            setToolActive("Erase");
                            setSelObject()
                            // setFontColor()
                            // setSelectedFont()
                            activeText = undefined;
                            setPanTool(false);
                            // resizeAndScaleCanvas()

                          }}
                          style={{
                            backgroundColor:
                              toolActive === "Erase" ? "#f0f8fc" : "#f5f6f7",
                            color: toolActive === "Erase" ? "#26a3db" : "#6a6d73"
                          }}
                        >
                          <EraseSvg fill={`${toolActive === 'Erase' ? '#26a3db' : '#A8ABAF'}`} />

                        </div>
                        <div
                          className="tool-icons_fp "
                          onClick={() => {
                            activeText = undefined;
                            stopPathDrawing()
                            setToolActive("Select");
                            setPanTool(false);
                            setSelObject();

                            // resizeAndScaleCanvas()
                          }}
                          style={{
                            backgroundColor:
                              toolActive === "Select" ? "#f0f8fc" : "#f5f6f7",
                            color: toolActive === "Select" ? "#26a3db" : "#6a6d73"
                          }}
                        >
                          <SelectSvg fill={`${toolActive === 'Select' ? '#26a3db' : '#A8ABAF'}`} />

                        </div>
                      </div>
                      <div className="text-center color-labels" >
                        <span>Tools</span>
                      </div>

                    </div>
                    <hr className="vertical-line2 " />
                    <>
                      <div className="d-grid">
                        <div className=" bp-fpd-bar" style={{ padding: '7px 0px' }}>
                          {(toolActive !== 'Text' && selObject?.name != "text") ?
                            <ColorPicker
                              label={''}
                              value={values.fill_color ??

                                projectSettings?.fill_color ?? selFloorPlanDtls?.fill_color ??
                                "black"}
                              name={'fill_color'}
                              onChange={(e) => {
                                setColor(e);

                              }}
                              setFieldValue={setFieldValue} isOpen={openPicker === 'fill_color'}
                              setOpenPicker={setOpenPicker}
                              onClick={() => {
                                handlePickerClick('fill_color')
                              }}
                              color={color} setColor={setColor} values={values}
                              onChangeHandler={onChangeHandler} from='floor'
                            />
                            :
                            <ColorPicker
                              label={''}
                              value={fontColor ?? "#646464"}
                              name={'font_color'}
                              onChange={(e) => {
                                setColor(e);

                              }}
                              setFieldValue={setFieldValue} isOpen={openPicker === 'font_color'}
                              setOpenPicker={setOpenPicker}
                              onClick={() => {
                                console.log(selTracingId, isEdit)
                                if (isEdit) {
                                  handlePickerClick('font_color')
                                }
                              }}
                              color={color} setColor={setColor} values={values}
                              handleFontMetaChange={handleFontMetaChange} from='floor'
                            />
                          }
                        </div>
                        <div className="text-center color-labels" >
                          <span>Fill</span>
                        </div>
                      </div>
                      <hr className="vertical-line2 ml-2" />

                      <div className={`d-grid `}>
                        <div className={`d-flex bp-fpd-bar ${toolActive !== 'Text' && selObject?.name != "text" ? '' : 'disablediv'}`} style={{ padding: '7px 0px' }}>
                          <ColorPicker
                            label={''}
                            value={values.border_color ??
                              selFloorPlanDtls?.border_color ??
                              projectSettings?.border_color ??
                              "black"}
                            name={'border_color'}
                            onChange={(e) => {
                              setColor(e);
                            }}
                            setFieldValue={setFieldValue} isOpen={openPicker === 'border_color'}
                            setOpenPicker={setOpenPicker}
                            onClick={() => {
                              handlePickerClick('border_color')
                            }}
                            color={color} setColor={setColor} values={values}
                            onChangeHandler={onChangeHandler} from='floor'
                            transparency={true}
                          />
                          <BorderWidthComp
                            label=""
                            name="border_thick"
                            value={
                              values?.border_thick ??
                              selFloorPlanDtls?.border_thick ??
                              projectSettings.border_thick ??
                              1
                            }
                            onChange={(e) => onChangeHandler(Number(e), "border_thick")}
                          />
                        </div>
                        <div className="text-center color-labels" >
                          <span>Stroke</span>
                        </div>
                      </div>
                      <hr className="vertical-line2 mr-2 ml-2" />
                      <div className="d-grid">
                        <div className="bp-fpd-bar" >
                          <div
                            className="tool-icons_fp"
                            onClick={() => {
                              stopPathDrawing()
                              setToolActive("import");
                              setSelObject()
                              // setFontColor()
                              // setSelectedFont()
                              activeText = undefined;
                              setPanTool(false);
                              // resizeAndScaleCanvas()
                              importSvgRef.current.click()

                            }}
                            style={{
                              backgroundColor:
                                toolActive === "import" ? "#f0f8fc" : "#f5f6f7",
                              color: toolActive === "import" ? "#26a3db" : "#6a6d73"
                            }}
                          >
                            <ImportSvg fill={toolActive === "import" ? "#26a3db" : "#6a6d73"} />
                            <input
                              key={fileKey}
                              type='file'
                              hidden
                              onChange={(e) => { importSvg(e) }}
                              name='refImg'
                              accept=' .svg '
                              ref={importSvgRef}
                            />
                          </div>
                        </div>
                        <div className="text-center color-labels">
                          <span>Import SVG</span>
                        </div>
                      </div>
                      <hr className="vertical-line2 mr-2 ml-2" />
                      <div className="d-grid mr-2">
                        <div className="bp-fpd-bar">
                          {selFloorPlanDtls?.plan ? (
                            <div className='floorimg-div2'>
                              <img src={selFloorPlanDtls?.plan} style={{ border: '1px solid #ccc', borderRadius: '6px', width: '70px', height: '36px', objectFit: 'contain' }}></img>

                              <span className='delete-logo-icon' style={{ right: 0 }} ><div onClick={() =>{
                                reftoggle()
                                // handleDeleteRefImage()
                              }} className='ml-4 p-1 rounded-circle' style={{ backgroundColor: '#E5E5E5', cursor: 'pointer', }} >
                                <IoMdClose style={{ fontSize: '10px' }} />
                              </div></span>
                            </div>
                          ) : (
                            <label
                              className='select-floorimg2-new'
                              // onClick={() => referenceImageRef?.current?.click()}
                            >
                              <p>+</p>

                              <input
                                key={fileKey}
                                type='file'
                                hidden
                                onChange={(e) => { onSelectReferanceImage(e) }}
                                name='refImg'
                                id='fileInput'
                                ref={referenceImageRef}
                                accept=' .png, .jpg, .jpeg, .svg'
                              />
                            </label>
                          )}
                        </div>
                        <div className="text-center color-labels">
                          <span>Reference Image</span>
                        </div>
                      </div>
                    </>
                    {/* )} */}
                    {/* {(toolActive === "Text" || selObject?.name == "text") && (
                      <>
                        <CustomSelect
                          options={fontOptions}
                          setSelectedOption={(e) =>
                            handleFontMetaChange("fontFamily", e)
                          }
                          selectedOption={selectedFont ?? { value: standardFonts[0], label: standardFonts[0] }}
                          value={selectedFont}
                        />
                        <ColorPicker
                          label={'Font Colour'}
                          value={fontColor ?? "#646464"}
                          name={'font_color'}
                          onChange={(e) => {
                            setColor(e);

                          }}
                          setFieldValue={setFieldValue} isOpen={openPicker === 'font_color'}
                          setOpenPicker={setOpenPicker}
                          onClick={() => {
                            console.log(selTracingId, isEdit)
                            if (isEdit) {
                              handlePickerClick('font_color')

                            }
                          }}
                          color={color} setColor={setColor} values={values}
                          handleFontMetaChange={handleFontMetaChange} from='floor'
                        />
                      </>
                    )} */}
                  </form>
                  <div
                    className="delete-tool-floor seperate-delete"
                    hidden={!selTracingId}
                    onClick={() => onDeleteTracing(selFloorPlanDtls?.enc_id)}
                  >
                    <svg width="16" height="19" xmlns="http://www.w3.org/2000/svg" fill="none">
                      <g>
                        <title>Delete</title>
                        <path id="svg_1" fill="white" d="m2.85715,19c-0.57143,0 -0.95238,-0.2 -1.33333,-0.6c-0.38096,-0.4 -0.57144,-0.8 -0.57144,-1.4l0,-14.4l-0.19049,0c-0.19047,0 -0.38093,0 -0.5714,-0.2c-0.19048,-0.2 -0.19049,-0.4 -0.19049,-0.6c0,-0.2 0.00001,-0.4 0.19049,-0.6c0.19047,-0.2 0.38093,-0.2 0.5714,-0.2l4.00002,0c0,-0.2 0.19049,-0.6 0.19049,-0.6c0.19047,-0.2 0.38094,-0.4 0.76189,-0.4l4.57141,0c0.1905,0 0.5715,0 0.7619,0.4c0.1905,0.4 0.1905,0.4 0.1905,0.6l4,0c0.1905,0 0.381,0 0.5714,0.2c0.1905,0.2 0.1905,0.4 0.1905,0.6c0,0.2 0,0.4 -0.1905,0.6c-0.1904,0.2 -0.3809,0.2 -0.5714,0.2l-0.1905,0l0,14.2c0,0.6 -0.1904,1 -0.5714,1.4c-0.3809,0.4 -0.7619,0.6 -1.3333,0.6l-10.28575,0l0,0.2zm10.47615,-16.4l-10.66664,0l0,14.2c0,0 0.00001,0.2 0.19049,0.2c0.19047,0 0.19048,0 0.19048,0l10.09527,0c0.1904,0 0.1904,0 0.1904,0l0.1905,-0.2l-0.1905,-14.2zm-5.52376,8.4l2.28576,2.4c0.1904,0.2 0.3809,0.2 0.5714,0.2c0.1905,0 0.3809,0 0.5714,-0.2c0.1905,-0.2 0.1905,-0.4 0.1905,-0.6c0,-0.2 0,-0.4 -0.1905,-0.6l-2.28572,-2.4l2.28572,-2.4c0.1905,-0.2 0.1905,-0.4 0.1905,-0.6c0,-0.2 0,-0.4 -0.1905,-0.6c-0.1905,-0.2 -0.3809,-0.2 -0.5714,-0.2c-0.1905,0 -0.381,0 -0.5714,0.2l-2.28576,2.4l-2.28574,-2.4c-0.19047,-0.2 -0.38093,-0.2 -0.5714,-0.2c-0.19048,0 -0.38096,0 -0.57144,0.2c-0.19047,0.2 -0.19049,0.4 -0.19049,0.6c0,0.2 0.00002,0.4 0.19049,0.6l2.28571,2.4l-2.28571,2.4c-0.19047,0.2 -0.19049,0.4 -0.19049,0.6c0,0.2 0.00002,0.4 0.19049,0.6c0.19048,0.2 0.38096,0.2 0.57144,0.2c0.19047,0 0.38093,0 0.5714,-0.2l2.28574,-2.4z" />
                      </g>
                    </svg>
                    <span className="tool-text" style={{ marginTop: '5px', marginLeft: '5px' }}>Delete</span>

                  </div>
                </div>

              </div>
            </div>


            {((toolActive === "Draw" || toolActive === "Circle" || toolActive === "Rectangle")) &&
              <div className="magical-words">
                <div className="bp-fpd-container2" style={{ padding: '1px 6px', borderRadius: '6px' }}>
                  <div className="bp-fpd-bar">
                    <div className="d-flex tool-div " style={{ gap: '6px' }}>
                      <div className="tool-icons_fp d-flex"
                        style={{
                          backgroundColor:
                            toolActive === "Draw" ? "#f0f8fc" : "#f5f6f7",
                          color: toolActive === "Draw" ? "#26a3db" : "#6a6d73"
                        }}
                        onClick={() => {
                          setToolActive("Draw");
                        }} >
                        <PolygonSvg fill={toolActive === 'Draw' ? '#26a3db' : '#A8ABAF'} />
                        {/* <MdOutlineRectangle color={toolActive === 'Rectangle' ? '#26a3db' : '#6a6d73'}  /> */}
                      </div>
                      <div className="tool-icons_fp d-flex"
                        style={{
                          backgroundColor:
                            toolActive === "Rectangle" ? "#f0f8fc" : "#f5f6f7",
                          color: toolActive === "Rectangle" ? "#26a3db" : "#6a6d73"
                        }}
                        onClick={() => {
                          handleShapeToolClick('Rectangle')
                        }} >
                        <RectangleSvg fill={toolActive === 'Rectangle' ? '#26a3db' : '#A8ABAF'} />
                        {/* <MdOutlineRectangle color={toolActive === 'Rectangle' ? '#26a3db' : '#6a6d73'}  /> */}
                      </div>
                      <div className="tool-icons_fp d-flex" style={{
                        backgroundColor:
                          toolActive === "Circle" ? "#f0f8fc" : "#f5f6f7",
                        color: toolActive === "Circle" ? "#26a3db" : "#6a6d73"
                      }}
                        onClick={() => { handleShapeToolClick('Circle') }}>
                        <CircleSvg fill={toolActive === 'Circle' ? '#26a3db' : '#A8ABAF'} />
                        {/* <MdOutlineCircle color={toolActive === 'Circle' ? '#26a3db' : '#6a6d73'}  /> */}
                      </div>
                      {/* <div className="tool-icons_fp d-flex"
                 style={{
                  backgroundColor:
                    toolActive === "Triangle" ? "#f0f8fc" : "#f5f6f7",
                  color: toolActive === "Triangle" ? "#26a3db" : "#6a6d73"
                }}
                  onClick={() => { handleShapeToolClick('Triangle') }}>
                  <BsTriangle fontSize={13} color={toolActive === 'Triangle' ? '#26a3db' : '#6a6d73'}  />
                </div> */}
                    </div>
                  </div>
                </div>
              </div>
            }

            {(toolActive === "Text" || selObject?.name == "text") &&
              <div className="magical-words">
                <div className="bp-fpd-container2" style={{ padding: '1px 12px', borderRadius: '6px' }}>
                  <div className="">
                    <div className="d-flex tool-div " style={{ gap: '6px' }}>
                      <>
                        <CustomSelect
                          options={fontOptions}
                          setSelectedOption={(e) =>
                            handleFontMetaChange("fontFamily", e)
                          }
                          selectedOption={selectedFont ?? { value: standardFonts[0], label: standardFonts[0] }}
                          value={selectedFont}
                          width='246px'
                        />
                        <CustomSelect
                          options={fontSizeOptions}
                          setSelectedOption={(e) =>
                            handleFontMetaChange("fontSize", e)
                          }
                          selectedOption={fontSize ?? { value: standardFontSize[5], label: standardFontSize[5] }}
                          value={fontSize}
                          width='77px'
                        />
                        <hr className="vertical-line2 mr-2" style={{ height: '35px' }} />
                        <div className="d-grid">
                          <div className="bp-fpd-bar" >
                            <div
                              className="tool-icons_fp"
                              onClick={() => {
                                // stopPathDrawing()
                                // setToolActive("import");
                                // setSelObject()
                                // // setFontColor()
                                // // setSelectedFont()
                                // activeText = undefined;
                                // setPanTool(false);
                                // // resizeAndScaleCanvas();
                                if (fontWeight == "bold") {
                                  handleFontMetaChange("fontWeight", { value: "normal" })
                                } else {
                                  handleFontMetaChange("fontWeight", { value: "bold" })
                                }
                              }}
                              style={{
                                backgroundColor:
                                  fontWeight === "bold" ? "#f0f8fc" : "#f5f6f7",
                                color: fontWeight === "bold" ? "#26a3db" : "#6a6d73"
                              }}
                            >
                              <BoldSvg fill={fontWeight === "bold" ? "#26a3db" : "#6a6d73"} />

                            </div>
                          </div>

                        </div>
                        <hr className="vertical-line2 mr-2" style={{ height: '35px' }} />
                        <div className="d-grid">
                          <div className="bp-fpd-bar" >
                            <div
                              className="tool-icons_fp"
                              onClick={() => {
                                if (textAlign == "left") {
                                  handleFontMetaChange("textAlign", { value: "" })
                                } else {
                                  handleFontMetaChange("textAlign", { value: "left" })
                                }
                              }}
                              style={{
                                backgroundColor:
                                  textAlign === "left" ? "#f0f8fc" : "#f5f6f7",
                                color: textAlign === "left" ? "#26a3db" : "#6a6d73"
                              }}
                            >
                              <LeftAlignSvg fill={textAlign === "left" ? "#26a3db" : "#6a6d73"} />

                            </div>
                          </div>

                        </div>
                        {/* <hr className="vertical-line2 mr-2" style={{height:'30px'}}/> */}
                        <div className="d-grid">
                          <div className="bp-fpd-bar" >
                            <div
                              className="tool-icons_fp"
                              onClick={() => {
                                if (textAlign == "center") {
                                  handleFontMetaChange("textAlign", { value: "" })
                                } else {
                                  handleFontMetaChange("textAlign", { value: "center" })
                                }
                              }}
                              style={{
                                backgroundColor:
                                  textAlign === "center" ? "#f0f8fc" : "#f5f6f7",
                                color: textAlign === "center" ? "#26a3db" : "#6a6d73"
                              }}
                            >
                              <CenterAlignSvg fill={textAlign === "center" ? "#26a3db" : "#6a6d73"} />

                            </div>
                          </div>

                        </div>
                        {/* <hr className="vertical-line2 mr-2" style={{height:'30px'}}/> */}
                        <div className="d-grid">
                          <div className="bp-fpd-bar" >
                            <div
                              className="tool-icons_fp"
                              onClick={() => {
                                if (textAlign == "right") {
                                  handleFontMetaChange("textAlign", { value: "" })
                                } else {
                                  handleFontMetaChange("textAlign", { value: "right" })
                                }

                              }}
                              style={{
                                backgroundColor:
                                  textAlign === "right" ? "#f0f8fc" : "#f5f6f7",
                                color: textAlign === "right" ? "#26a3db" : "#6a6d73"
                              }}
                            >
                              <RightAlignSvg fill={textAlign === "right" ? "#26a3db" : "#6a6d73"} />

                            </div>
                          </div>

                        </div>
                        {/* <ColorPicker
                          label={'Font Colour'}
                          value={fontColor ?? "#646464"}
                          name={'font_color'}
                          onChange={(e) => {
                            setColor(e);

                          }}
                          setFieldValue={setFieldValue} isOpen={openPicker === 'font_color'}
                          setOpenPicker={setOpenPicker}
                          onClick={() => {
                            console.log(selTracingId, isEdit)
                            if (isEdit) {
                              handlePickerClick('font_color')

                            }
                          }}
                          color={color} setColor={setColor} values={values}
                          handleFontMetaChange={handleFontMetaChange} from='floor'
                        /> */}
                      </>
                    </div>
                  </div>
                </div>
              </div>
            }

            {/* {(selTracingId) &&
              <div className="magical-words">
                <div className={`bp-fpd-container2 copy-delete-tools ${(selObject?.name === "text" || toolActive === "Text") ? 'increaseTop' : ''}`}>
                  <div className="d-flex tool-div ">
                    <div
                      className="delete-tool-floor"
                      // hidden={!selTracingId}
                      onClick={duplicateObject}
                      style={{
                        marginLeft: "0"
                      }}
                    >
                      <svg
                        id="b"
                        xmlns="http://www.w3.org/2000/svg"
                        width="15.8964"
                        height="18.6066"
                        viewBox="0 0 15.8964 18.6066"
                      >
                        <g id="c">
                          <polygon
                            class="f"
                            style={{ fill: "#fff", strokeWidth: "0px" }}
                            points=".2272 2.8314 8.1461 2.8314 12.3761 7.0613 12.3761 18.3796 .2272 18.3796 .2272 2.8314"
                          />
                          <path
                            class="d"
                            style={{
                              fill: "none",
                              strokeLinecap: "round",
                              strokeLinejoin: "round",
                              strokeWidth: ".454px",
                              stroke: "#6A6D73",
                            }}
                            d="M.7393,2.8314h7.1944c.1359,0,.2662.054.3622.15l3.9299,3.9299c.0961.0961.15.2264.15.3622v10.5938c0,.2829-.2293.5123-.5123.5123H.7392c-.2829,0-.5123-.2293-.5123-.5123V3.3436c0-.2829.2293-.5123.5123-.5123h.0001Z"
                          />
                          <polygon
                            class="f"
                            style={{ fill: "#fff", strokeWidth: "0px" }}
                            points="3.5208 .2271 11.4397 .2271 15.6697 4.457 15.6697 15.7752 3.5208 15.7752 3.5208 .2271"
                          />
                          <path
                            class="e"
                            style={{
                              fill: "#A8ABAF",
                              strokeMiterlimit: "10",
                              strokeWidth: ".4327px",
                              stroke: "#6A6D73",
                            }}
                            d="M11.4397.305v3.6434c0,.2814.2281.5097.5097.5097h3.6616"
                          />
                          <path
                            class="d"
                            style={{
                              fill: "none",
                              strokeLinecap: "round",
                              strokeLinejoin: "round",
                              strokeWidth: ".454px",
                              stroke: "#6A6D73",
                            }}
                            d="M4.0329.2271h7.1944c.1359,0,.2662.054.3622.15l3.9299,3.9299c.0961.0961.15.2264.15.3622v10.5938c0,.2829-.2293.5123-.5123.5123H4.0328c-.2829,0-.5123-.2293-.5123-.5123V.7392c0-.2829.2293-.5123.5123-.5123h.0001Z"
                          />
                        </g>
                      </svg>
                    </div>
                    <div
                      className="delete-tool-floor"
                      hidden={!selTracingId}
                      onClick={() => onDeleteTracing(selFloorPlanDtls?.enc_id)}
                    >
                    
                      <svg
                        id="b"
                        xmlns="http://www.w3.org/2000/svg"
                        width="16.1183"
                        height="18.1526"
                        viewBox="0 0 16.1183 18.1526"
                      >
                        <defs>
                        </defs>
                        <g id="c">
                          <path
                            class="d"
                            style={{ fill: "#F03528", strokeWidth: "0px" }}
                            d="M2.7417,18.1526c-.4275,0-.7982-.157-1.112-.4711-.3141-.3139-.4711-.6845-.4711-1.112V1.621H.4489c-.1323,0-.2402-.0423-.3238-.1268-.0834-.0843-.1251-.1891-.1251-.3143s.0417-.2283.1251-.3093c.0836-.0811.1915-.1216.3238-.1216h3.9857v-.0144c0-.2001.0723-.3725.2169-.5173.1448-.1448.324-.2172.5375-.2172h5.7658c.1951,0,.3662.0737.5136.221.1471.1471.2207.3183.2207.5136v.0144h4.0169c.1078,0,.2035.0428.2871.1285s.1254.1856.1254.2998c0,.1336-.0425.241-.1274.3221-.0847.0811-.1834.1216-.2961.1216h-.7354v14.9485c0,.4275-.1569.7982-.4708,1.112-.3139.3141-.6846.4711-1.1123.4711,0,0-10.6347,0-10.6347,0Z"
                          />
                          <path
                            class="e"
                            style={{ fill: "#fff", strokeWidth: "0px" }}
                            d="M8.044,11.1063l3.0291,3.0227c.0748.1086.1955.168.362.1782.1665.0102.2956-.0403.3874-.1513.0917-.1109.1376-.2361.1376-.3757,0-.1394-.0451-.2633-.1354-.3718l-3.0157-3.0435,3.0157-3.0667c.0746-.0748.1159-.1859.1238-.3332.0077-.1474-.0342-.2714-.126-.3721s-.2169-.151-.3754-.151c-.1588,0-.2834.0451-.3739.1354l-3.0157,3.0499-3.0355-3.0499c-.0748-.0903-.1916-.1354-.3504-.1354s-.284.0503-.3757.151-.1376.222-.1376.3638.0452.258.1357.3485l3.0426,3.0735-3.0426,3.0227c-.0905.0927-.1357.2139-.1357.3635,0,.1498.0459.2751.1376.3757.0917.1164.2131.1746.3641.1746.1508,0,.2715-.0621.362-.1862,0,0,3.0221-3.0227,3.0221-3.0227Z"
                          />
                        </g>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            } */}
          </>
        )}
      </Formik>
    </div >
  );
};

export default FloorPlanDtls;

const CustomSelect = ({
  defaultValue,
  selectedOption,
  setSelectedOption,
  options,
  value,
  name,
  width
}) => {
  const customStyles = {
    control: (provided) => ({
      ...provided,
      height: '35px', // Adjust the height as needed
      minHeight: '35px',
      fontSize: '14px', // Adjust the font size as needed
      borderRadius: '4px', // Optional: Add some border radius to make it look better
      borderColor: '#F5F6F7', // Optional: Customize the border color
      width: width
    }),
    option: (provided) => ({
      ...provided,
      fontSize: "14px", // Adjust the font size of the options
    }),
    singleValue: (provided) => ({
      ...provided,
      fontSize: '14px', // Adjust the font size of the selected value
      position: 'absolute',
      top: '50%',
      transform: 'translateY(-50%)',
    }),
    indicatorSeparator: () => ({
      display: "none", // Hide the default separator between value and arrow icon
    }),
    placeholder: (provided) => ({
      ...provided,
      fontSize: "14px", // Adjust the font size of the placeholder
      position: "absolute",
      top: "40%",
      transform: "translateY(-50%)",
      color: "#6b6b6b", // Optional: Customize the color of the placeholder
    }),
    dropdownIndicator: (provided) => ({
      ...provided,
      padding: "0px 4px 4px 0px", // Optional: Adjust the padding around the arrow icon
    }),
  };
  return (
    <>
      <div className='color-input-wrpr mr-3'>
        {/* <p className="label color-labels mr-2">Font Family</p> */}
        <Select
          value={selectedOption}
          onChange={setSelectedOption}
          options={options}
          styles={customStyles}
          defaultValue={defaultValue}
        />
      </div>
    </>
  );
};

const BorderWidthComp = ({ label, value, onChange, name }) => {
  const handleKeyDown = (e) => {
    // Prevent default action for all keys except for up and down arrow keys
    if (
      e.key !== 'ArrowUp' &&
      e.key !== 'ArrowDown' &&
      e.key !== 'Tab' &&
      e.key !== 'Shift'
      // e.key !== 'Backspace'
    ) {
      e.preventDefault();
    }
  };

  return (
    <div className="color-input-wrpr">
      <p className="label color-labels">{label}</p>

      <div
        className=" input-wrpr-width"
        style={{ width: "131px !important", marginTop: "0px" }}
      >
        <RxBorderWidth />
        <input
          value={value}
          onChange={(e) => {
            e.stopPropagation();
            onChange(e.target.value);
          }}
          onKeyDown={handleKeyDown}
          // className="form-control"
          type="number"
          name={name}
          style={{ width: 35 }}
          min={0}
        />
      </div>
    </div>

  );
};
