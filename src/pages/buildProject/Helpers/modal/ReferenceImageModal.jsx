import React, { useEffect, useRef, useState } from 'react';
import { Modal, ModalBody, Button, Row, Col, Label, Spinner } from 'reactstrap';
import { fabric } from 'fabric';
import { calculateDistance } from '../calculateDistance';
import { Field, Formik } from 'formik'
import * as Yup from 'yup';
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaMinus, FaPlus } from 'react-icons/fa';
import controllPan from '../controllPan';
// import iphoneImage from '../../../../assets/img/iphone-16-pro.png'; 
import iphoneImage from '../../../../assets/img/PhoneAsset.png'; 


const ValidationSchema = Yup.object().shape({
    // points_distance: Yup.string().required('Select two points on your floor plan.'),
    // real_world_distance: Yup.string().required('This field is required.'),

})
const ReferenceImageModal = ({
    modal, values, toggle, handleScaleSubmit, 
    handleDeleteRefImage, selImageOrSvgValues,
    setSelImageOrSvgValues,
    loading,
    setSelFloorPlanDtls
}) => {
    const [canvas, setCanvas] = useState(null);
    const referenceImgRef = useRef(null);
    const refImageDivRef = useRef(null);
    const isPanning = useRef(false);
    const lastPosX = useRef(0);
    const lastPosY = useRef(0);
    const zoomAfterFitBg = useRef(false);
    const [isSelectionCompleted, setIsSelectionCompleted] = useState(false);
    const [nextPage, setNextPage] = useState(false);
    const [currentImageData, setCurrentImageData] = useState(null);
    const mainImageRef = useRef(null);
    const cloneImageRef = useRef(null);
    const screenClip = useRef(null);

    useEffect(() => {
        if (modal && referenceImgRef.current) {
            initCanvas()
        }
    }, [modal, referenceImgRef.current]);

    let isDrawing = false;
    let points = [];
    // let zoomAfterFitBg = false
   
    // const initCanvas = () => {
    //     const newCanvas = new fabric.Canvas(referenceImgRef.current, {
    //         height: 520,
    //         width: 520,
    //         hoverCursor: 'pointer',
    //         selection: false
    //     });

    //     setCanvas(newCanvas);

    //     if (values?.imageType === 'import-svg') {
    //         // fabric.loadSVGFromURL(values.imageScale, (objects, options) => {
    //         //     const svg = fabric.util.groupSVGElements(objects, options);
    //         //     svg.set({
    //         //         selectable: false
    //         //     })
    //         //     newCanvas.add(svg);
    //         //     newCanvas.renderAll();
    //         // });

    //         fabric.loadSVGFromURL(values.imageScale, (objects, options) => {
    //             const svg = fabric.util.groupSVGElements(objects, options);
            
    //             const canvasWidth = newCanvas.width;
    //             const canvasHeight = newCanvas.height;
            
    //             const scaleX = canvasWidth / svg.width;
    //             const scaleY = canvasHeight / svg.height;
    //             const scale = Math.min(scaleX, scaleY); 
            
    //             svg.set({
    //                 scaleX: scale,
    //                 scaleY: scale,
    //                 left: (canvasWidth - svg.width * scale) / 2, 
    //                 top: (canvasHeight - svg.height * scale) / 2, 
    //                 selectable: false, 
    //             });
            
    //             newCanvas.add(svg);
    //             newCanvas.renderAll();
    //         });
    //     } else {
    //         // console.log(values?.image,values?.image.type,'values?.image')
    //         if (values?.image.type !== 'image/svg+xml') {
    //             fabric.Image.fromURL(values.imageScale, (img) => {
    //                 // newCanvas.setBackgroundImage(img, newCanvas.renderAll.bind(newCanvas), {
    //                 //     backgroundImageStretch: false
    //                 // });
    //                 // newCanvas.renderAll();

    //                 const canvasWidth = newCanvas.width;
    //                 const canvasHeight = newCanvas.height;
                
    //                 const imgWidth = img.width;
    //                 const imgHeight = img.height;
                
    //                 const scaleX = canvasWidth / imgWidth;
    //                 const scaleY = canvasHeight / imgHeight;
                
    //                 const scale = Math.min(scaleX, scaleY);
                
    //                 const offsetX = (canvasWidth - imgWidth * scale) / 2;
    //                 const offsetY = (canvasHeight - imgHeight * scale) / 2;
                
    //                 newCanvas.setBackgroundImage(img, newCanvas.renderAll.bind(newCanvas), {
    //                     scaleX: scale,
    //                     scaleY: scale,
    //                     left: offsetX,
    //                     top: offsetY
    //                 });
                
    //                 newCanvas.renderAll();

    //             });
    //         } else {
    //             // fabric.loadSVGFromURL(values.imageScale, (objects, options) => {
    //             //     const svg = fabric.util.groupSVGElements(objects, options);
    //             //     svg.set({
    //             //         selectable: false
    //             //     })
    //             //     newCanvas.add(svg);
    //             //     newCanvas.renderAll();
    //             // });

    //             fabric.loadSVGFromURL(values.imageScale, (objects, options) => {
    //                 const svg = fabric.util.groupSVGElements(objects, options);
                
    //                 const canvasWidth = newCanvas.width;
    //                 const canvasHeight = newCanvas.height;
                
    //                 const scaleX = canvasWidth / svg.width;
    //                 const scaleY = canvasHeight / svg.height;
    //                 const scale = Math.min(scaleX, scaleY); 
                
    //                 svg.set({
    //                     scaleX: scale,
    //                     scaleY: scale,
    //                     left: (canvasWidth - svg.width * scale) / 2, 
    //                     top: (canvasHeight - svg.height * scale) / 2, 
    //                     selectable: false, 
    //                 });
                
                    
    //                 newCanvas.add(svg);
    //                 newCanvas.renderAll();
    //             });
    //         }
    //     }

    //     newCanvas.on('mouse:down', (event) => {
    //         handleMouseDown(event, newCanvas)
    //     });

    //     newCanvas.on('mouse:move', (event) => {
    //         newCanvas.upperCanvasEl.hoverCursor = 'pointer';
    //         newCanvas.upperCanvasEl.style.cursor = 'pointer';
    //         handleMouseMove(event, newCanvas)
    //         if (isPanning.current) {
    //             var delta = new fabric.Point(event.e.movementX, event.e.movementY);
    //             newCanvas.relativePan(delta);
    //             newCanvas.defaultCursor = "grab";
    //             newCanvas.hoverCursor = "grab";
    //             newCanvas.renderAll();
    //         }
    //     });

    //     newCanvas.on("mouse:up", () => {
    //         isPanning.current = false;
    //     });

    //     newCanvas.on('mouse:wheel', (event) => {
    //         handleMouseWheel(event, newCanvas)
    //         event.e.preventDefault();
    //         event.e.stopPropagation();
    //     })

    //     document.addEventListener("mousedown", (opt) => {
    //         if (opt.button === 1) {
    //           isPanning.current = true;
    //           lastPosX.current = opt.clientX;
    //           lastPosY.current = opt.clientY;
    //         }
    //     });
      
    //     document.addEventListener("mouseup", () => {
    //         isPanning.current = false;
    //     });

    // }
    
    const initCanvas = () => {
        const newCanvas = new fabric.Canvas(referenceImgRef.current, {
            height: 570,
            width: 594,
            hoverCursor: 'pointer',
            selection: false,
        });

        newCanvas.selectionColor = 'rgba(0, 120, 255, 0.1)';
        newCanvas.selectionBorderColor = '#0D99FF';
        newCanvas.selectionLineWidth = 3;

        fabric.Object.prototype.transparentCorners = false;
        fabric.Object.prototype.cornerColor = '#fff';
        fabric.Object.prototype.cornerStrokeColor = '#0D99FF';
        fabric.Object.prototype.cornerStyle = 'rect';
        fabric.Object.prototype.cornerSize = 10;
        fabric.Object.prototype.borderColor = '#0D99FF';
        fabric.Object.prototype.padding = 5;

        fabric.Object.prototype.setControlsVisibility({
            mt: false,
            mb: false,
            ml: false,
            mr: false,
            mtr: false,
        });
        
        setCanvas(newCanvas);

        function urlToBase64(url) {
            return fetch(url)
                .then((response) => response.blob())
                .then((blob) => {
                return new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result); 
                    reader.readAsDataURL(blob);
                });
            });
        }


        urlToBase64(iphoneImage).then((base64Image) => {
            fabric.Image.fromURL(base64Image, (img) => {
                const canvasCenter = newCanvas.getCenter();
                img.set({
                    left: canvasCenter.left,
                    top: canvasCenter.top,
                    originX: 'center',
                    originY: 'center',
                    selectable: false
                });

                screenClip.current = img;
                newCanvas.add(img);
                newCanvas.bringToFront(img);

                console.log(img, "iphoneImage as base64 loaded on canvas");
            });
        });
        
        // fabric.Image.fromURL(iphoneImage, (img) => {
        //     const canvasCenter = newCanvas.getCenter();
        //     img.set({
        //         left: canvasCenter.left,
        //         top: canvasCenter.top,
        //         originX: 'center',
        //         originY: 'center',
        //         // scaleX: 0.5, 
        //         // scaleY: 0.5,
        //         selectable: false
        //     });

        //     screenClip.current = img
        //     newCanvas.add(img);
        //     newCanvas.bringToFront(img);
        //     console.log(img,"iphoneImageiphoneImage");


        //     // newCanvas.setBackgroundImage(img, newCanvas.renderAll.bind(newCanvas), {
        //     //     backgroundImageStretch: false
        //     // });
        // });

        if (values?.imageType === 'import-svg') {
            // fabric.loadSVGFromURL(values.imageScale, (objects, options) => {
            //     const svg = fabric.util.groupSVGElements(objects, options);
            //     svg.set({
            //         selectable: true
            //     })
            //     newCanvas.add(svg);
            //     // fitCanvasToImage(svg)

            //     // newCanvas.renderAll();
            // });

            fabric.loadSVGFromURL(values.imageScale, (objects, options) => {
                const svg = fabric.util.groupSVGElements(objects, options);
            
                const canvasCenter = newCanvas.getCenter();
                const canvasWidth = newCanvas.width - 40;
                const canvasHeight = newCanvas.height - 40;
            
                const svgWidth = svg.width;
                const svgHeight = svg.height;
            
                const scaleX = canvasWidth / svgWidth;
                const scaleY = canvasHeight / svgHeight;
                const scale = Math.min(scaleX, scaleY);
            
                svg.set({
                    left: canvasCenter.left,
                    top: canvasCenter.top,
                    scaleX: scale,
                    scaleY: scale,
                    originX: 'center',
                    originY: 'center',
                    selectable: true,
                    opacity: 0.3,
                });
            
                mainImageRef.current = svg;
                newCanvas.add(svg);
            
                svg.clone((cloned) => {
                    const clipBounds = screenClip?.current?.getBoundingRect(true);
                    const clipRect = new fabric.Rect({
                        left: clipBounds?.left + 10,
                        top: clipBounds?.top + 10,
                        width: clipBounds?.width - 20,
                        height: clipBounds?.height - 20,
                        absolutePositioned: true,
                        rx: 30,
                        ry: 30,
                    });
            
                    cloned.set({
                        opacity: 1,
                        selectable: false,
                        evented: false,
                        clipPath: clipRect,
                        scaleX: scale,
                        scaleY: scale,
                    });
            
                    newCanvas.add(cloned);
                    cloneImageRef.current = cloned;
                    newCanvas.sendToBack(cloned);
            
                    const syncClone = (original, clone) => {
                        clone.set({
                            left: original.left,
                            top: original.top,
                            scaleX: original.scaleX,
                            scaleY: original.scaleY,
                            angle: original.angle,
                            flipX: original.flipX,
                            flipY: original.flipY,
                        });
                        clone.setCoords();
                    };
            
                    const onTransform = (e) => {
                        if (e.target === svg) {
                            syncClone(svg, cloned);
                            newCanvas.requestRenderAll();
                        }
                    };
            
                    newCanvas.on('object:scaling', onTransform);
                    newCanvas.on('object:rotating', onTransform);
                    newCanvas.on('object:moving', onTransform);
            
                    newCanvas.on('object:modified', (e) => {
                        if (e.target === svg) {
                            const isInside = checkIfInside(svg, screenClip?.current);
                            if (isInside) {
                                setSelImageOrSvgValues(prev => ({
                                    ...prev,
                                    IsImageInsideScreen: true,
                                    currentImageData: svg
                                }));
                            } else {
                                setSelImageOrSvgValues(prev => ({
                                    ...prev,
                                    IsImageInsideScreen: false,
                                    currentImageData: null
                                }));
                            }
                        }
                    });

                    setSelImageOrSvgValues(prev => ({
                        ...prev,
                        IsImageInsideScreen: true,
                        currentImageData: svg
                    }));
                });
            
                newCanvas.setActiveObject(svg);
            });
               
        } else {
            if (values?.image.type !== 'image/svg+xml') {
                // fabric.Image.fromURL(values.imageScale, (img) => {
                //     const canvasCenter = newCanvas.getCenter();
                //     img.set({
                //         left: canvasCenter.left,
                //         top: canvasCenter.top,
                //         originX: 'center',
                //         originY: 'center',
                //         scaleX: 3, 
                //         scaleY: 3,
                //         selectable: true,
                //         opacity:0.5
                //     });
                //     newCanvas.add(img)
                // });
           
                
                function syncClone(original, clone) {
                    clone.set({
                        left: original.left,
                        top: original.top,
                        scaleX: original.scaleX,
                        scaleY: original.scaleY,
                        angle: original.angle,
                        flipX: original.flipX,
                        flipY: original.flipY,
                    });
                    clone.setCoords();
                }
           
                fabric.Image.fromURL(values.imageScale, (img) => {
                    const canvasCenter = newCanvas.getCenter();

                    const canvasWidth = newCanvas.width - 40;
                    const canvasHeight = newCanvas.height - 40;
                
                    const imgWidth = img.width;
                    const imgHeight = img.height;
                
                    const scaleX = canvasWidth / imgWidth;
                    const scaleY = canvasHeight / imgHeight;
                
                    const scale = Math.min(scaleX, scaleY);
                
                    img.set({
                        left: canvasCenter.left,
                        top: canvasCenter.top,
                        scaleX: scale,
                        scaleY: scale,
                        // left: offsetX,
                        // top: offsetY,
                        originX: 'center',
                        originY: 'center',
                        selectable: true,
                        opacity: 0.3,
                    });

                    mainImageRef.current = img;

                    newCanvas.add(img);
                    
                  
                    img.clone((cloned) => {
                        const clipBounds = screenClip?.current?.getBoundingRect(true);
                        const clipRect = new fabric.Rect({
                            left: clipBounds?.left + 10,
                            top: clipBounds?.top + 10,
                            width: clipBounds?.width - 20,
                            height: clipBounds?.height - 20,
                            absolutePositioned: true,
                            rx: 30,
                            ry: 30,
                        });
                    
                        cloned.set({
                            opacity: 1,
                            selectable: false,
                            evented: false,
                            clipPath: clipRect,
                            scaleX: scale,
                            scaleY: scale,
                        });
                    
                        newCanvas.add(cloned);
                        cloneImageRef.current = cloned;
                        newCanvas.sendToBack(cloned);
                    
                        newCanvas.on('object:scaling', (e) => {
                            if (e.target === img) {
                                syncClone(img, cloned);
                                newCanvas.requestRenderAll();
                            }
                        });
                        
                        newCanvas.on('object:rotating', (e) => {
                            if (e.target === img) {
                                syncClone(img, cloned);
                                newCanvas.requestRenderAll();
                            }
                        });
                        
                        newCanvas.on('object:moving', (e) => {
                            if (e.target === img) {
                                syncClone(img, cloned);
                                newCanvas.requestRenderAll();
                            }
                        });
                            
                        newCanvas.on('object:modified', (e) => {
                            if (e.target === img) {
                                const isInside = checkIfInside(img, screenClip?.current);
                                if (isInside) {
                                    // console.log("✅ Image is fully within the phone screen");
                                    // console.log(e.target);
                                    // setCurrentImageData(e.target)
                                    setSelImageOrSvgValues(prev => ({ ...prev, IsImageInsideScreen: true, currentImageData: img }))
                                    
                                } else {
                                    setSelImageOrSvgValues(prev => ({ ...prev, IsImageInsideScreen: false, }))
                                    // console.log("❌ Image is partially outside the screen");
                                }
                            }
                        });

                        setSelImageOrSvgValues(prev => ({ ...prev, IsImageInsideScreen: true, currentImageData: img }))
                    });

                    newCanvas.setActiveObject(img);
                });

            } else {
                // fabric.loadSVGFromURL(values.imageScale, (objects, options) => {
                //     const svg = fabric.util.groupSVGElements(objects, options);
                //     svg.set({
                //         selectable: true
                //     })
                //     newCanvas.add(svg);
                // });

                fabric.loadSVGFromURL(values.imageScale, (objects, options) => {
                    const svg = fabric.util.groupSVGElements(objects, options);
                
                    const canvasCenter = newCanvas.getCenter();
                    const canvasWidth = newCanvas.width - 40;
                    const canvasHeight = newCanvas.height - 40;
                
                    const svgWidth = svg.width;
                    const svgHeight = svg.height;
                
                    const scaleX = canvasWidth / svgWidth;
                    const scaleY = canvasHeight / svgHeight;
                
                    const scale = Math.min(scaleX, scaleY);
                
                    svg.set({
                        left: canvasCenter.left,
                        top: canvasCenter.top,
                        scaleX: scale,
                        scaleY: scale,
                        originX: 'center',
                        originY: 'center',
                        selectable: true,
                        opacity: 0.3,
                    });
                
                    mainImageRef.current = svg;
                    newCanvas.add(svg);
                
                    svg.clone((cloned) => {
                        const clipBounds = screenClip?.current?.getBoundingRect(true);
                        const clipRect = new fabric.Rect({
                            left: clipBounds?.left + 10,
                            top: clipBounds?.top + 10,
                            width: clipBounds?.width - 20,
                            height: clipBounds?.height - 20,
                            absolutePositioned: true,
                            rx: 30,
                            ry: 30,
                        });
                
                        cloned.set({
                            opacity: 1,
                            selectable: false,
                            evented: false,
                            clipPath: clipRect,
                            scaleX: scale,
                            scaleY: scale,
                        });
                
                        newCanvas.add(cloned);
                        cloneImageRef.current = cloned;
                        newCanvas.sendToBack(cloned);
                
                        const syncClone = (original, clone) => {
                            clone.set({
                                left: original.left,
                                top: original.top,
                                scaleX: original.scaleX,
                                scaleY: original.scaleY,
                                angle: original.angle,
                                flipX: original.flipX,
                                flipY: original.flipY,
                            });
                            clone.setCoords();
                        };
                
                        const onTransform = (e) => {
                            if (e.target === svg) {
                                syncClone(svg, cloned);
                                newCanvas.requestRenderAll();
                            }
                        };
                
                        newCanvas.on('object:scaling', onTransform);
                        newCanvas.on('object:rotating', onTransform);
                        newCanvas.on('object:moving', onTransform);
                
                        newCanvas.on('object:modified', (e) => {
                            if (e.target === svg) {
                                const isInside = checkIfInside(svg, screenClip?.current);
                                if (isInside) {
                                    setSelImageOrSvgValues(prev => ({
                                        ...prev,
                                        IsImageInsideScreen: true,
                                        currentImageData: svg
                                    }));
                                } else {
                                    setSelImageOrSvgValues(prev => ({
                                        ...prev,
                                        IsImageInsideScreen: false,
                                        currentImageData: null
                                    }));
                                }
                            }
                        });

                        setSelImageOrSvgValues(prev => ({
                            ...prev,
                            IsImageInsideScreen: true,
                            currentImageData: svg
                        }));
                    });
                
                    newCanvas.setActiveObject(svg);
                });
                
            }
        }

        const fitCanvasToImage = (img) => {
            const canvasWidth = newCanvas.width - 40;
            const canvasHeight = newCanvas.height - 40;
        
            const imgWidth = img.width || img.getBoundingRect().width;
            const imgHeight = img.height || img.getBoundingRect().height;
        
            const scaleX = canvasWidth / imgWidth;
            const scaleY = canvasHeight / imgHeight;
            const scale = Math.min(scaleX, scaleY);
        
            newCanvas.setZoom(scale);
        
            const vpt = newCanvas.viewportTransform;
            vpt[4] = (canvasWidth - imgWidth * scale) / 2;
            vpt[5] = (canvasHeight - imgHeight * scale) / 2;
        
            newCanvas.setViewportTransform(vpt);
            
        
            zoomAfterFitBg.current = scale;
        
            newCanvas.renderAll();
        };

        newCanvas.on('mouse:down', (event) => {
            if (mainImageRef.current) {
                newCanvas.setActiveObject(mainImageRef.current);
            }
            handleMouseDown(event, newCanvas)
        });

        newCanvas.on('mouse:move', (event) => {
            newCanvas.upperCanvasEl.hoverCursor = 'pointer';
            newCanvas.upperCanvasEl.style.cursor = 'pointer';
            handleMouseMove(event, newCanvas)
            // if (isPanning.current) {
            //     var delta = new fabric.Point(event.e.movementX, event.e.movementY);
            //     newCanvas.relativePan(delta);
            //     newCanvas.defaultCursor = "grab";
            //     newCanvas.hoverCursor = "grab";
            //     newCanvas.renderAll();
            // }
        });

        newCanvas.on("mouse:up", () => {
            isPanning.current = false;
        });

        newCanvas.on('mouse:wheel', (event) => {
            if (mainImageRef.current) {
                newCanvas.setActiveObject(mainImageRef.current);
            }
            handleMouseWheel(event, newCanvas)
            event.e.preventDefault();
            event.e.stopPropagation();
        })

        document.addEventListener("mousedown", (opt) => {
            if (opt.button === 1) {
                isPanning.current = true;
                lastPosX.current = opt.clientX;
                lastPosY.current = opt.clientY;
            }
        });
      
        document.addEventListener("mouseup", () => {
            isPanning.current = false;
        });

    }


    function checkIfInside(img, screenClip) {
        const clipBounds = {
            left: 161.5,
            top: 4,
            width: 271,
            height: 562
        };
    
        const topLeft = img.getPointByOrigin('left', 'top');
        const topRight = img.getPointByOrigin('right', 'top');
        const bottomLeft = img.getPointByOrigin('left', 'bottom');
        const bottomRight = img.getPointByOrigin('right', 'bottom');
    
        const corners = [topLeft, topRight, bottomLeft, bottomRight];
    
        // return corners.every(point =>
        //     point.x >= clipBounds.left &&
        //     point.y >= clipBounds.top &&
        //     point.x <= clipBounds.left + clipBounds.width &&
        //     point.y <= clipBounds.top + clipBounds.height
        // );
        return true
    }

    const scaleImageAndClone = (direction) => {
        const mainImage = mainImageRef.current;
        const cloneImage = cloneImageRef.current;
        
        if (!mainImage || !cloneImage) return;
    
        const factor = direction === 'in' ? 1.1 : 1 / 1.1;
    
        const newScaleX = mainImage.scaleX * factor;
        const newScaleY = mainImage.scaleY * factor;
    
        const minScale = 0.05;
        const maxScale = 10;
    
        if (newScaleX < minScale || newScaleX > maxScale) return;
    
        mainImage.scaleX = newScaleX;
        mainImage.scaleY = newScaleY;
    
        cloneImage.scaleX = newScaleX;
        cloneImage.scaleY = newScaleY;
    
        cloneImage.left = mainImage.left;
        cloneImage.top = mainImage.top;
        cloneImage.angle = mainImage.angle;



        const isInside = checkIfInside(mainImage, screenClip?.current);
        if (isInside) {
            // console.log("✅ Image is fully within the phone screen");
            // setCurrentImageData(mainImageRef.current)
            setSelImageOrSvgValues(prev => ({ ...prev, IsImageInsideScreen: true, currentImageData: mainImageRef.current }))
            
        } else {
            setSelImageOrSvgValues(prev => ({ ...prev, IsImageInsideScreen: false, currentImageData: null }))
            // console.log("❌ Image is partially outside the screen");
        }
    
        mainImage.canvas.requestRenderAll();
    };

    const handleMouseDown = (event, canvas) => {
        let isSelection = null
        setIsSelectionCompleted((prev) => {
            isSelection = prev
            return prev
        })
        let isNextpage = null
        setNextPage((prev) => {
            isNextpage = prev
            return prev
        })
        
        if (!isSelection && !isNextpage) return
        // return
        // if (points?.length <= 1) {
        let zoom = canvas.getZoom();
        const pointer = canvas.getPointer(event.e);
        let startPoint = new fabric.Circle({
            left: pointer.x,
            top: pointer.y,
            radius: 5 / zoom,
            fill: 'red',
            selectable: false,
            originX: 'center',
            originY: 'center',
            name: 'point'
        });
        canvas.add(startPoint);


        points.push({ x: startPoint.left, y: startPoint.top })
        isDrawing = true
        // }
        if (points.length >= 2) {
            // let zoom = canvas.getZoom();
            isDrawing = false
            let linePoints = [{ x: points[0].x, y: points[0].y }, { x: points[1].x, y: points[1].y }];
            let adjustedStrokeWidth = 1 / zoom;
            console.log(adjustedStrokeWidth, zoom, "sjgbhgbdfh");

            const endPoint = new fabric.Line(linePoints, {
                stroke: 'red',
                strokeWidth: adjustedStrokeWidth,
                selectable: false,
                name: 'line'
            });

            const distance = calculateDistance(points[0], points[1])
            const length = ((distance * 0.5) / 100) * 10;
            // removeFabricObjectsByName(canvas, 'line_distance')
            // showLength(points, canvas)
            setSelImageOrSvgValues({ points_distance: length.toFixed(2) })
            setSelImageOrSvgValues(prev => ({ ...prev, points_distance: length.toFixed(2) }))
            canvas.add(endPoint);
            canvas.renderAll();
            if (points.length === 3) {
                points = []
                removeFabricObjectsByName(canvas, 'line')
                removeFabricObjectsByName(canvas, 'point')
                removeFabricObjectsByName(canvas, 'line_distance')
                setSelImageOrSvgValues(prev => ({ ...prev, points_distance: null, }))

            }
        }

    }

    const handleMouseMove = (event, canvas) => {
        if (isDrawing) {
            removeFabricObjectsByName(canvas, 'line')
            let zoom = canvas.getZoom();
            let adjustedStrokeWidth = 1 / zoom;
            const pointer = canvas.getPointer(event.e);
            const endPoint = new fabric.Line([points[points.length - 1].x, points[points.length - 1].y, pointer.x, pointer.y], {
                stroke: 'red',
                strokeWidth: adjustedStrokeWidth,
                selectable: false,
                name: 'line'
            });

            canvas.add(endPoint);
            canvas.renderAll();
        };

        // if (isPanning.current) {
        //     const e = event.e;
        //     lastPosX.current = e.clientX;
        //     lastPosY.current = e.clientY;
        // }
    }

    // const handleMouseWheel = (options, canvas) => {
    //     var delta = options.e.deltaY;
    //     var pointer = canvas.getPointer(options.e);

    //     var zoom = canvas.getZoom();
    //     if (delta > 0) {
    //         zoom /= 1.1;
    //     } else {
    //         zoom *= 1.1;
    //     }
    //     if (zoom > 10) zoom = 10;

    //     if (zoomAfterFitBg && zoom <= zoomAfterFitBg) {
    //         zoom = zoomAfterFitBg;
    //     } else if (!zoomAfterFitBg && zoom < 0.1) {
    //         zoom = 0.1
    //     };
    //     canvas.zoomToPoint(
    //         { x: options.e.offsetX, y: options.e.offsetY },
    //         zoom
    //     );

    //     canvas.getObjects().forEach(obj => {
    //         if (obj.type === 'line') {
    //             obj.set({
    //                 strokeWidth: 1 / zoom // Adjust strokeWidth dynamically
    //             });
    //             console.log(1/zoom);
    //         }
    //         if (obj.type === 'circle') {
    //             obj.set({ radius: 5 / zoom }); // Adjust circle size dynamically
    //         }
    //     });

    //     canvas.renderAll();
    // }


    const handleMouseWheel = (options, canvas) => {
        // console.log(screenClip?.current,"screenClip?.current");
        options.e.preventDefault(); 
    
        const mainImage = mainImageRef.current;
        const cloneImage = cloneImageRef.current;
        
        if (!mainImage || !cloneImage) return;
    
        const delta = options.e.deltaY;
        const factor = delta > 0 ? 1 / 1.1 : 1.1;
        
        const newScaleX = mainImage.scaleX * factor;
        const newScaleY = mainImage.scaleY * factor;
        
        const minScale = 0.05;
        const maxScale = 10;
        if (newScaleX < minScale || newScaleX > maxScale) return;
        
        mainImage.scaleX = newScaleX;
        mainImage.scaleY = newScaleY;
    
        cloneImage.scaleX = newScaleX;
        cloneImage.scaleY = newScaleY;
    
        cloneImage.left = mainImage.left;
        cloneImage.top = mainImage.top;
        cloneImage.angle = mainImage.angle;

        const isInside = checkIfInside(mainImage, screenClip?.current);
        // console.log(isInside,"is inside");
        // if (isInside) {
        if (true) {
            // setCurrentImageData(mainImageRef.current)
            setSelImageOrSvgValues(prev => ({ ...prev, IsImageInsideScreen: true, currentImageData : mainImageRef.current }))
        } else {
            setSelImageOrSvgValues(prev => ({ ...prev, IsImageInsideScreen: false, currentImageData : null }))
        }
    
        canvas.requestRenderAll();
    // };

        var zoom = canvas.getZoom();
        if (zoomAfterFitBg.current && zoom <= zoomAfterFitBg.current) {
            zoom = zoomAfterFitBg.current;
        } else if (!zoomAfterFitBg.current && zoom < 0.1) {
            zoom = 0.1
        };
        canvas.zoomToPoint(
            { x: options.e.offsetX, y: options.e.offsetY },
            zoom
        );

        canvas.getObjects().forEach(obj => {
            if (obj.type === 'line') {
                obj.set({
                    strokeWidth: 1 / zoom // Adjust strokeWidth dynamically
                });
                console.log(1/zoom);
            }
            if (obj.type === 'circle') {
                obj.set({ radius: 5 / zoom }); // Adjust circle size dynamically
            }
        });


        var canvasCenter = {
            x: canvas.width / 2,
            y: canvas.height / 2
        };
        // canvas.current.zoomToPoint(
        //   { x: canvasCenter.x, y: canvasCenter.y },
        //   zoom
        // );
        canvas.renderAll();
        // adjustContainerSize(zoom);
    }

    const adjustContainerSize = (scaleFactor) => {
        if (refImageDivRef.current) {
            refImageDivRef.current.style.width = `${scaleFactor * 100}%`;
            // refImageDivRef.current.style.height = `${scaleFactor * 100}%`;
        }
    };

    const removeFabricObjectsByName = (canvas, name) => {
        canvas?.forEachObject(function (obj) {
            if (obj.name == name) {
                canvas.remove(obj);
            }
        });
    };

    const showLength = (point, canvas) => {
        let length = 0;
        let center = {};
        for (let i = 1; i < point.length; i++) {
            const point1 = point[i - 1];
            const point2 = point[i];
            const distance = calculateDistance(point1, point2);
            center = {
                x: (point1.x + point2.x) / 2,
                y: (point1.y + point2.y) / 2
            };
            length = ((distance * 0.5) / 100) * 10;
        }

        const angle = Math.atan2(
            point[point.length - 1]?.y - point[0]?.y,
            point[point.length - 1]?.x - point[0]?.x
        );
        const textLeft = center.x - (length / 2) * Math.cos(angle);
        const textTop = center.y - (length / 2) * Math.sin(angle);

        const text = new fabric.Text(`${length.toFixed(2)} m`, {
            left: textLeft,
            top: textTop - 4,
            selectable: false,
            fontSize: 12,
            fontFamily: "Arial",
            fill: "black",
            originX: "center",
            originY: "center",
            fontWeight: 700,
            name: 'line_distance'
        });
        canvas.add(text);
    }

    const ZoomInOut = (canvas, direction) => () => {
        let zoom = canvas.getZoom();
        if (direction === 'in') {
            zoom *= 1.1;
            if (zoom > 10) zoom = 10;
            console.log(zoom,zoomAfterFitBg.current,direction,"zoom,zoomAfterFitBg,direction");
        } else if (direction === 'out') {
            zoom /= 1.1;
            // if (zoom < 0.1) zoom = 0.1;
            console.log(zoom,zoomAfterFitBg.current,direction,"zoom,zoomAfterFitBg,direction");
            if (zoomAfterFitBg.current && zoom <= zoomAfterFitBg.current) {
                zoom = zoomAfterFitBg.current;
            } else if (!zoomAfterFitBg.current && zoom < 0.1) {
                zoom = 0.1
            };
        }
        // centerCanvas(canvas, zoom);

        const canvasCenter = {
            x: canvas.width / 2,
            y: canvas.height / 2,
        };
        canvas.zoomToPoint(canvasCenter, zoom);
    };

    const panCanvas = (canvas, direction) => {
        const panAmount = 50; // Adjust pan distance as needed
        const viewportTransform = canvas.viewportTransform || [1, 0, 0, 1, 0, 0];
    
        switch (direction) {
            case 'up':
                viewportTransform[5] += panAmount; // Move canvas down (pan up)
                break;
            case 'down':
                viewportTransform[5] -= panAmount; // Move canvas up (pan down)
                break;
            case 'left':
                viewportTransform[4] += panAmount; // Move canvas right (pan left)
                break;
            case 'right':
                viewportTransform[4] -= panAmount; // Move canvas left (pan right)
                break;
            default:
                break;
        }
    
        canvas.setViewportTransform(viewportTransform);
    };

    const centerCanvas = (canvas, zoom) => {
        const backgroundImage = canvas.backgroundImage;
        if (backgroundImage) {
            const imgCenter = {
                x: (backgroundImage.left + backgroundImage.width * backgroundImage.scaleX) / 2,
                y: (backgroundImage.top + backgroundImage.height * backgroundImage.scaleY) / 2,
            };
            canvas.zoomToPoint(imgCenter, zoom);
        } else {
            const canvasCenter = {
                x: canvas.width / 2,
                y: canvas.height / 2,
            };
            canvas.zoomToPoint(canvasCenter, zoom);
        }
        canvas.renderAll();
    };

    const handleInitialPage = () => {
        // setSelFloorPlanDtls((prev) => {
        //     return {
        //         ...prev,
        //         currentImageData
        //     };
        // });
        
    }


    return (
        <Modal
            isOpen={modal}
            toggle={toggle}
            // size="lg"
            style={{ maxWidth: '660px', zIndex: "999999 !important" }}
            centered
        >
            <ModalBody>
                <div style={{justifyContent:"center",position:"relative"}}>
                    <div style={{padding:"0"}}>
                        <div
                            className='ref-image-div'
                            style={{
                                height:"570px"
                            }}
                            ref={refImageDivRef}>
                            {/* <canvas ref={referenceImgRef} id='referenceCanvas' ></canvas> */}
                            <canvas ref={referenceImgRef} id='referenceCanvas' ></canvas>
                        </div>
                        <div className='zoom-control-div' style={{
                            bottom: "10px",
                            right:"10px"
                        }}>
                            <button className="zoom-buttons" onClick={()=>scaleImageAndClone('in')}>
                                <FaPlus className='zoom-icons'  />
                            </button>
                                <hr className='horizontal-line' />
                            <button className="zoom-buttons" onClick={()=>scaleImageAndClone('out')}>
                                <FaMinus className='zoom-icons'  />
                            </button>
                        </div>
                    </div>
                </div>
                <Formik
                    initialValues={{ real_world_distance: '', points_distance: '', ...values, ...selImageOrSvgValues }}
                    validationSchema={ValidationSchema}
                    onSubmit={(values, setFieldError) => {
                        // setIsSelectionCompleted(false)
                        // setNextPage(false)
                        handleScaleSubmit(values?.imageType, selImageOrSvgValues)
                        // console.log("submited");
                        // handleInitialPage()
                    }}
                    enableReinitialize
                >
                    {({
                        errors,
                        values,
                        touched,
                        handleSubmit,
                        handleChange,
                        setFieldValue,
                        setFieldError
                    }) => (
                        <form
                            className="av-tooltip tooltip-label-bottom formGroups"
                            onSubmit={(e) => {
                                handleSubmit(e, setFieldError);
                            }}
                        >
                            <p className='ref-image-text text-center ' style={{
                                // maxWidth: "366px",
                                // margin:"auto"
                            }}>Use scale and pan to adjust the image so it fits well within the mobile view for optimum results.</p>
                            <div
                                className="form-group text-right "
                                style={{ marginTop: "30px" }}
                            >
                                <Button
                                    color="secondary"
                                    className="btn btnCancel mr-3"
                                    onClick={() => {
                                        toggle()
                                        setSelImageOrSvgValues()
                                        // if (values?.imageType !== 'import-svg') {
                                        //     setSelFloorPlanDtls((prev) => ({ ...prev, plan: null, refImg: '', image: null, show_image: 0 }))
                                        // }
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button color="primary" type="submit"  className="btn btn-primary float-right" disabled={loading} >
                                    {loading ? (
                                        <>
                                            <p style={{ opacity: '0', position: 'relative' }}>Save</p>
                                            <Spinner
                                                className="ml-2 spinner-style"
                                                color="light"
                                            />
                                        </>
                                    ) : 'Save'}
                                </Button>
                            </div>
                        </form>
                    )}
                </Formik>
            </ModalBody>

            {/* <ModalBody className=" ">
                <h5 className="f-w-600 mb-4" style={{ fontSize: "18px" }}>
                    {values?.imageType === 'import-svg' ? 'Scale Import' : 'Scale Reference Image'}
                </h5>
                <Row className="">
                    <Col md={{ size: 10, offset: 1 }}>
                        <div className='ref-image-div'  ref={refImageDivRef}>
                            <canvas ref={referenceImgRef} id='referenceCanvas' ></canvas>

                        </div>
                        <div className='zoom-control-div'>
                            <FaPlus className='zoom-icons' onClick={ZoomInOut(canvas, 'in')} />
                            <hr className='horizontal-line' />
                            <FaMinus className='zoom-icons' onClick={ZoomInOut(canvas, 'out')} />
                        </div>
                        <div className="pan-control-div">
                            <button className="pan-buttons" style={{transform: 'rotate(45deg)'}}>
                                
                                <svg width="26" height="26" onClick={() => panCanvas(canvas, 'up')} viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M0.0154484 4.09539C0.0069165 1.88627 1.79085 0.0885819 3.99997 0.0801503L20.9998 0.0152668C23.209 0.00683524 25.0067 1.79085 25.0153 3.99997L25.0809 20.9998C25.0895 23.209 23.3055 25.0066 21.0964 25.0151L4.09652 25.08C1.8874 25.0884 0.0896361 23.3044 0.0811042 21.0953L0.0154484 4.09539Z" fill="white"/>
                                    <path d="M4.0019 0.580147L21.0018 0.515263C22.9348 0.507885 24.5078 2.0689 24.5153 4.00188L24.5809 21.0018C24.5884 22.9347 23.0275 24.5077 21.0945 24.5151L4.09459 24.58C2.16161 24.5873 0.588566 23.0263 0.581101 21.0934L0.515445 4.09348C0.507979 2.1605 2.06892 0.587524 4.0019 0.580147Z" stroke="black" stroke-opacity="0.1"/>
                                    <path d="M17.3374 10.0808L11.0991 10.1208L11.1393 16.3224" stroke="#696969" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>

                            </button>

                            <div className="pan-horizontal">
                                <button className="pan-buttons" style={{transform: "rotate(-45deg)"}}>
                                    
                                    <svg width="26" height="26" onClick={() => panCanvas(canvas, 'left')} viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M0.0154484 4.09539C0.0069165 1.88627 1.79085 0.0885819 3.99997 0.0801503L20.9998 0.0152668C23.209 0.00683524 25.0067 1.79085 25.0153 3.99997L25.0809 20.9998C25.0895 23.209 23.3055 25.0066 21.0964 25.0151L4.09652 25.08C1.8874 25.0884 0.0896361 23.3044 0.0811042 21.0953L0.0154484 4.09539Z" fill="white"/>
                                        <path d="M4.0019 0.580147L21.0018 0.515263C22.9348 0.507885 24.5078 2.0689 24.5153 4.00188L24.5809 21.0018C24.5884 22.9347 23.0275 24.5077 21.0945 24.5151L4.09459 24.58C2.16161 24.5873 0.588566 23.0263 0.581101 21.0934L0.515445 4.09348C0.507979 2.1605 2.06892 0.587524 4.0019 0.580147Z" stroke="black" stroke-opacity="0.1"/>
                                        <path d="M17.3374 10.0808L11.0991 10.1208L11.1393 16.3224" stroke="#696969" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    </svg>
                                </button>

                                <button className="pan-buttons" style={{transform: "rotate(135deg)"}}>
                                    
                                    <svg width="26" height="26"  onClick={() => panCanvas(canvas, 'right')}  viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M0.0154484 4.09539C0.0069165 1.88627 1.79085 0.0885819 3.99997 0.0801503L20.9998 0.0152668C23.209 0.00683524 25.0067 1.79085 25.0153 3.99997L25.0809 20.9998C25.0895 23.209 23.3055 25.0066 21.0964 25.0151L4.09652 25.08C1.8874 25.0884 0.0896361 23.3044 0.0811042 21.0953L0.0154484 4.09539Z" fill="white"/>
                                        <path d="M4.0019 0.580147L21.0018 0.515263C22.9348 0.507885 24.5078 2.0689 24.5153 4.00188L24.5809 21.0018C24.5884 22.9347 23.0275 24.5077 21.0945 24.5151L4.09459 24.58C2.16161 24.5873 0.588566 23.0263 0.581101 21.0934L0.515445 4.09348C0.507979 2.1605 2.06892 0.587524 4.0019 0.580147Z" stroke="black" stroke-opacity="0.1"/>
                                        <path d="M17.3374 10.0808L11.0991 10.1208L11.1393 16.3224" stroke="#696969" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    </svg>
                                </button>
                            </div>

                            <button className="pan-buttons" style={{transform: "rotate(225deg)"}}>
                               
                                <svg width="26" height="26" onClick={() => panCanvas(canvas, 'down')} viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M0.0154484 4.09539C0.0069165 1.88627 1.79085 0.0885819 3.99997 0.0801503L20.9998 0.0152668C23.209 0.00683524 25.0067 1.79085 25.0153 3.99997L25.0809 20.9998C25.0895 23.209 23.3055 25.0066 21.0964 25.0151L4.09652 25.08C1.8874 25.0884 0.0896361 23.3044 0.0811042 21.0953L0.0154484 4.09539Z" fill="white"/>
                                        <path d="M4.0019 0.580147L21.0018 0.515263C22.9348 0.507885 24.5078 2.0689 24.5153 4.00188L24.5809 21.0018C24.5884 22.9347 23.0275 24.5077 21.0945 24.5151L4.09459 24.58C2.16161 24.5873 0.588566 23.0263 0.581101 21.0934L0.515445 4.09348C0.507979 2.1605 2.06892 0.587524 4.0019 0.580147Z" stroke="black" stroke-opacity="0.1"/>
                                        <path d="M17.3374 10.0808L11.0991 10.1208L11.1393 16.3224" stroke="#696969" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    </svg>
                            </button>
                        </div>
                    </Col>
                </Row>
                <Formik
                    initialValues={{ real_world_distance: '', points_distance: '', ...values, ...selImageOrSvgValues }}
                    validationSchema={ValidationSchema}
                    onSubmit={(values, setFieldError) => {
                        handleScaleSubmit(values?.imageType, selImageOrSvgValues)
                    }}
                    enableReinitialize
                >
                    {({
                        errors,
                        values,
                        touched,
                        handleSubmit,
                        handleChange,
                        setFieldValue,
                        setFieldError
                    }) => (
                        <form
                            className="av-tooltip tooltip-label-bottom formGroups"
                            onSubmit={(e) => {
                                // if (Object.keys(errors).length > 0) {
                                // let errorMessage = '';
                                // console.log(errors, values)
                                // if (errors.points_distance) {
                                //     errorMessage += `${errors.points_distance}\n`;
                                //     toast.error(errors.points_distance)
                                // }
                                // }
                                handleSubmit(e, setFieldError);
                            }}
                        >
                            <Row className="mt-2">
                                <Col md={12} style={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center' }}>
                                    <p className='ref-image-text'>Select two points on your floor plan.</p>
                                    <p className='ref-image-text'> Enter the real world distance between the selected points.</p>
                                    
                                    <div className="d-flex mt-2 justify-content-center">
                                        <input
                                            type="text"
                                            className="form-control non-focus-input"
                                            style={{ width: '60%' }}
                                            // placeholder="Search..."
                                            value={values.real_world_distance}
                                            onChange={(e) => {
                                                handleChange(e)
                                                setSelImageOrSvgValues(prev => ({ ...prev, real_world_distance: e.target.value, }))
                                            }}
                                        // onKeyDown={handlePrevent}
                                        />
                                        <div
                                            className="input-group-append"
                                            style={{ marginLeft: "-36px" }}
                                        >
                                            <span className="input-group-text scale-meter">m</span>
                                        </div>
                                    </div>

                                    {errors.real_world_distance && touched.real_world_distance ? (
                                        <div className="text-danger mt-1">
                                            {errors.real_world_distance}
                                        </div>
                                    ) : null}
                                </Col>
                            </Row>

                            <div
                                className="form-group text-right "
                                style={{ marginTop: "30px" }}
                            >
                                <Button
                                    color="secondary"
                                    className="btn btnCancel mr-3"
                                    onClick={() => {
                                        toggle()
                                        setSelImageOrSvgValues()
                                        if (values?.imageType !== 'import-svg') {
                                            setSelFloorPlanDtls((prev) => ({ ...prev, plan: null, refImg: '', image: null, show_image: 0 }))
                                        }
                                    }}
                                >
                                    Cancel
                                </Button>
                                
                                <Button color="primary" type="submit" className="btn btn-primary float-right" disabled={loading} >
                                    {loading ? (
                                        <>
                                            <p style={{ opacity: '0', position: 'relative' }}>Save</p>
                                            <Spinner
                                                className="ml-2 spinner-style"
                                                color="light"
                                            />
                                        </>
                                    ) : 'Save'}
                                </Button>
                            </div>
                        </form>
                    )}
                </Formik>
            </ModalBody> */}

        </Modal>
    )
}
export default ReferenceImageModal;