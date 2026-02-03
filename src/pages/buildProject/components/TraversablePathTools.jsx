import { Formik } from 'formik'
import React from 'react'
import { EraseSvg, PencilSvg, SelectSvg } from '../../../components/common/svgIcons';
import { Button } from 'reactstrap';
import { IoIosMove } from 'react-icons/io';

const TraversablePathTools = ({
    tracingIntialValue,
    toolActive,
    setToolActive,
    deleteSelectedObjects,
    selectedPaths,
    setPanTool,
    panTool,
    generateAutoConnections
}) => {

    return (
        <div className="d-grid">
            <Formik
                initialValues={tracingIntialValue}
                onSubmit={(values) => {
                }}
                enableReinitialize
            >
                {({
                    handleSubmit,
                }) => (
                    <>
                        <div className='magical-words'>
                            <div className='bp-fpd-container ' >
                                <div className='d-flex tool-div'>
                                    <form
                                        className="av-tooltip formGroups bp-fpd-bar"
                                        onSubmit={handleSubmit}
                                        // style={{ width: '342px' }}
                                        style={{ width: '400px' }}
                                    >
                                        <div className="d-grid">
                                            <div className="d-flex bp-fpd-bar" style={{ padding: '0px 8px' }}>
                                                <div className='tool-icons_fp' onClick={() => {
                                                    setToolActive('Draw'); setPanTool(false);
                                                }} style={{ backgroundColor: ((toolActive === 'Draw' || toolActive === 'sub_path') && !panTool) ? '#f0f8fc' : '#f5f6f7', color: (toolActive === 'Draw' && !panTool) ? '#26a3db' : '' }}>
                                                    <PencilSvg fill={((toolActive === "Draw") || toolActive === 'sub_path') ? "#26a3db" : "#6a6d73"} />
                                                </div>
                                                <div className='tool-icons_fp'
                                                    onClick={() => {
                                                        setToolActive('Erase'); setPanTool(false);
                                                    }}
                                                // onClick={() => { deleteSelectedObjects() }} hidden={!selectedPaths}
                                                >
                                                    <EraseSvg fill={(toolActive === "Erase") ? "#26a3db" : "#6a6d73"} />
                                                </div>
                                                <div className='tool-icons_fp ' onClick={() => { setToolActive('Select'); setPanTool(false) }} style={{ backgroundColor: (toolActive === 'Select' || toolActive === 'Drag_pin') ? '#f0f8fc' : '#f5f6f7', color: (toolActive === 'Select' || toolActive === 'Drag_pin') ? '#26a3db' : '#6a6d73' }}>
                                                    <SelectSvg fill={(toolActive === "Select" || toolActive === 'Drag_pin') ? "#26a3db" : "#6a6d73"} />
                                                </div>
                                                {/* <div className='tool-icons_fp ' onClick={() => { setToolActive('Drag_pin'); setPanTool(false) }} style={{ backgroundColor: toolActive === 'Drag_pin' ? '#f0f8fc' : '#f5f6f7', color: toolActive === 'Drag_pin' ? '#26a3db' : '#6a6d73' }}>
                                                    <IoIosMove fontSize={22} color={(toolActive === "Drag_pin") ? "#26a3db" : "#6a6d73"} />
                                                </div> */}

                                            </div>
                                            <div className="text-center mt-1 color-labels" >
                                                <span >Tools</span>
                                            </div>
                                        </div>
                                        <hr className="vertical-line2 mr-2" />
                                        <>
                                            <div className="d-grid mr-2" >
                                                <div className=" bp-fpd-bar" style={{ padding: '7px 0px' }}>
                                                    <Button
                                                        className="btn-primary bar-btn "
                                                        onClick={generateAutoConnections}
                                                        // disabled={true}
                                                    >
                                                        Auto Generate Connections
                                                    </Button>
                                                </div>
                                            </div>
                                        </> 
                                    </form>
                                    <div className='delete-tool' onClick={() => { deleteSelectedObjects() }} hidden={!selectedPaths} >
                                        <svg width="16" height="19" xmlns="http://www.w3.org/2000/svg" fill="none">
                                            <g>
                                                <title>Delete</title>
                                                <path id="svg_1" fill="white" d="m2.85715,19c-0.57143,0 -0.95238,-0.2 -1.33333,-0.6c-0.38096,-0.4 -0.57144,-0.8 -0.57144,-1.4l0,-14.4l-0.19049,0c-0.19047,0 -0.38093,0 -0.5714,-0.2c-0.19048,-0.2 -0.19049,-0.4 -0.19049,-0.6c0,-0.2 0.00001,-0.4 0.19049,-0.6c0.19047,-0.2 0.38093,-0.2 0.5714,-0.2l4.00002,0c0,-0.2 0.19049,-0.6 0.19049,-0.6c0.19047,-0.2 0.38094,-0.4 0.76189,-0.4l4.57141,0c0.1905,0 0.5715,0 0.7619,0.4c0.1905,0.4 0.1905,0.4 0.1905,0.6l4,0c0.1905,0 0.381,0 0.5714,0.2c0.1905,0.2 0.1905,0.4 0.1905,0.6c0,0.2 0,0.4 -0.1905,0.6c-0.1904,0.2 -0.3809,0.2 -0.5714,0.2l-0.1905,0l0,14.2c0,0.6 -0.1904,1 -0.5714,1.4c-0.3809,0.4 -0.7619,0.6 -1.3333,0.6l-10.28575,0l0,0.2zm10.47615,-16.4l-10.66664,0l0,14.2c0,0 0.00001,0.2 0.19049,0.2c0.19047,0 0.19048,0 0.19048,0l10.09527,0c0.1904,0 0.1904,0 0.1904,0l0.1905,-0.2l-0.1905,-14.2zm-5.52376,8.4l2.28576,2.4c0.1904,0.2 0.3809,0.2 0.5714,0.2c0.1905,0 0.3809,0 0.5714,-0.2c0.1905,-0.2 0.1905,-0.4 0.1905,-0.6c0,-0.2 0,-0.4 -0.1905,-0.6l-2.28572,-2.4l2.28572,-2.4c0.1905,-0.2 0.1905,-0.4 0.1905,-0.6c0,-0.2 0,-0.4 -0.1905,-0.6c-0.1905,-0.2 -0.3809,-0.2 -0.5714,-0.2c-0.1905,0 -0.381,0 -0.5714,0.2l-2.28576,2.4l-2.28574,-2.4c-0.19047,-0.2 -0.38093,-0.2 -0.5714,-0.2c-0.19048,0 -0.38096,0 -0.57144,0.2c-0.19047,0.2 -0.19049,0.4 -0.19049,0.6c0,0.2 0.00002,0.4 0.19049,0.6l2.28571,2.4l-2.28571,2.4c-0.19047,0.2 -0.19049,0.4 -0.19049,0.6c0,0.2 0.00002,0.4 0.19049,0.6c0.19048,0.2 0.38096,0.2 0.57144,0.2c0.19047,0 0.38093,0 0.5714,-0.2l2.28574,-2.4z" />
                                            </g>
                                        </svg>
                                        <div className='tool-text' style={{ marginTop: '5px', marginLeft: '5px' }}>
                                            Delete
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {((toolActive === "Draw" || toolActive === 'sub_path')) &&
                            <div className="magical-words">
                                <div className="bp-fpd-container2"
                                    style={{ padding: '1px 6px', borderRadius: '6px', top: '155px' }}
                                >
                                    <div className="bp-fpd-bar">
                                        <div className="d-flex tool-div " style={{ gap: '6px' }}>
                                            <div className="tool-icons_fp d-flex"
                                                style={{
                                                    backgroundColor:
                                                        // toolActive === "Draw" ? "#f0f8fc" : "#f5f6f7",
                                                        toolActive === "Draw" ? "#68c0df" : "#f5f6f7",
                                                    color: toolActive === "Draw" ? "#fff" : "#6a6d73",
                                                    // color: toolActive === "Draw" ? "#26a3db" : "#6a6d73",
                                                    width: 'auto',
                                                    height: 'auto',
                                                    padding: '10px'
                                                }}
                                                onClick={() => {
                                                    setToolActive("Draw");
                                                    setPanTool(false)
                                                }} >
                                                <span className='color-labels'>
                                                    Main Path
                                                </span>
                                            </div>
                                            <div className="tool-icons_fp d-flex"
                                                style={{
                                                    backgroundColor:
                                                        // toolActive === "sub_path" ? "#f0f8fc" : "#f5f6f7",
                                                        toolActive === "sub_path" ? "#68c0df" : "#f5f6f7",
                                                    color: toolActive === "sub_path" ? "#fff" : "#6a6d73",
                                                    // color: toolActive === "sub_path" ? "#26a3db" : "#6a6d73",
                                                    width: 'auto',
                                                    height: 'auto',
                                                    padding: '10px'
                                                }}
                                                onClick={() => {
                                                    setToolActive("sub_path");
                                                    setPanTool(false)
                                                }} >
                                                <span className='color-labels'>
                                                    Subpath
                                                </span>
                                            </div>

                                        </div>
                                    </div>
                                </div>
                            </div>
                        }

                        {/* {((toolActive === "Select" || toolActive === 'Drag_pin')) &&

                            <div className="magical-words">
                                <div className="bp-fpd-container2"
                                    style={{
                                        padding: '1px 6px', borderRadius: '6px', top: '137px',
                                        flexDirection: 'row',
                                        backgroundColor: 'transparent'
                                    }}
                                >
                                    <div className="bp-fpd-bar">
                                        <div className="d-flex tool-div " style={{ gap: '6px' }}>
                                            <div className="tool-icons_fp d-flex"
                                                style={{
                                                    backgroundColor:
                                                        toolActive === "Select" ? "#f0f8fc" : "#f5f6f7",
                                                    color: toolActive === "Select" ? "#26a3db" : "#6a6d73",
                                                    width: 'auto',
                                                    height: 'auto',
                                                    padding: '10px'
                                                }}
                                                onClick={() => {
                                                    setToolActive("Select");
                                                    setPanTool(false)
                                                }} >
                                                <span className='color-labels'>
                                                    Move Path
                                                </span>
                                            </div>
                                            <div className="tool-icons_fp d-flex"
                                                style={{
                                                    backgroundColor:
                                                        toolActive === "Drag_pin" ? "#f0f8fc" : "#f5f6f7",
                                                    color: toolActive === "Drag_pin" ? "#26a3db" : "#6a6d73",
                                                    width: 'auto',
                                                    height: 'auto',
                                                    padding: '10px'
                                                }}
                                                onClick={() => {
                                                    setToolActive("Drag_pin");
                                                    setPanTool(false)
                                                }} >
                                                <span className='color-labels'>
                                                    Move Pin
                                                </span>
                                            </div>

                                        </div>
                                    </div>
                                    <div className='delete-tool'
                                        onClick={() => { deleteSelectedObjects() }}
                                        hidden={!selectedPaths}
                                        style={{ opacity: 0, pointerEvents: 'none' }}
                                    >
                                        <svg width="16" height="19" xmlns="http://www.w3.org/2000/svg" fill="none">
                                            <g>
                                                <title>Delete</title>
                                                <path id="svg_1" fill="white" d="m2.85715,19c-0.57143,0 -0.95238,-0.2 -1.33333,-0.6c-0.38096,-0.4 -0.57144,-0.8 -0.57144,-1.4l0,-14.4l-0.19049,0c-0.19047,0 -0.38093,0 -0.5714,-0.2c-0.19048,-0.2 -0.19049,-0.4 -0.19049,-0.6c0,-0.2 0.00001,-0.4 0.19049,-0.6c0.19047,-0.2 0.38093,-0.2 0.5714,-0.2l4.00002,0c0,-0.2 0.19049,-0.6 0.19049,-0.6c0.19047,-0.2 0.38094,-0.4 0.76189,-0.4l4.57141,0c0.1905,0 0.5715,0 0.7619,0.4c0.1905,0.4 0.1905,0.4 0.1905,0.6l4,0c0.1905,0 0.381,0 0.5714,0.2c0.1905,0.2 0.1905,0.4 0.1905,0.6c0,0.2 0,0.4 -0.1905,0.6c-0.1904,0.2 -0.3809,0.2 -0.5714,0.2l-0.1905,0l0,14.2c0,0.6 -0.1904,1 -0.5714,1.4c-0.3809,0.4 -0.7619,0.6 -1.3333,0.6l-10.28575,0l0,0.2zm10.47615,-16.4l-10.66664,0l0,14.2c0,0 0.00001,0.2 0.19049,0.2c0.19047,0 0.19048,0 0.19048,0l10.09527,0c0.1904,0 0.1904,0 0.1904,0l0.1905,-0.2l-0.1905,-14.2zm-5.52376,8.4l2.28576,2.4c0.1904,0.2 0.3809,0.2 0.5714,0.2c0.1905,0 0.3809,0 0.5714,-0.2c0.1905,-0.2 0.1905,-0.4 0.1905,-0.6c0,-0.2 0,-0.4 -0.1905,-0.6l-2.28572,-2.4l2.28572,-2.4c0.1905,-0.2 0.1905,-0.4 0.1905,-0.6c0,-0.2 0,-0.4 -0.1905,-0.6c-0.1905,-0.2 -0.3809,-0.2 -0.5714,-0.2c-0.1905,0 -0.381,0 -0.5714,0.2l-2.28576,2.4l-2.28574,-2.4c-0.19047,-0.2 -0.38093,-0.2 -0.5714,-0.2c-0.19048,0 -0.38096,0 -0.57144,0.2c-0.19047,0.2 -0.19049,0.4 -0.19049,0.6c0,0.2 0.00002,0.4 0.19049,0.6l2.28571,2.4l-2.28571,2.4c-0.19047,0.2 -0.19049,0.4 -0.19049,0.6c0,0.2 0.00002,0.4 0.19049,0.6c0.19048,0.2 0.38096,0.2 0.57144,0.2c0.19047,0 0.38093,0 0.5714,-0.2l2.28574,-2.4z" />
                                            </g>
                                        </svg>
                                        <div className='tool-text' style={{ marginTop: '5px', marginLeft: '5px' }}>
                                            Delete
                                        </div>
                                    </div>
                                </div>

                            </div>

                        } */}
                    </>
                )}
            </Formik>
        </div>

    )
}

export default TraversablePathTools
