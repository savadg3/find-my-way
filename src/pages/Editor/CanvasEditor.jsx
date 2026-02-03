import React, { useEffect, useRef, useState } from 'react';
import { fabric } from 'fabric';
import companyLogo from "../../assets/textEditor/CompanyLogo.png"
import siteLogo from "../../assets/textEditor/FmwLogo.png"
import Phoneimage from "../../assets/textEditor/Phoneimage.png"
import qr from "../../assets/textEditor/qr.png"
import { Button, Col, Modal, ModalBody, Row } from 'reactstrap';
import CommonDropdown from '../../components/common/CommonDropdown';
import ColorPicker from '../../components/common/Colorpicker';
import { SketchPicker } from 'react-color';

import { GradientPickerPopover } from 'react-linear-gradient-picker';
import 'react-linear-gradient-picker/dist/index.css';
import { toast } from 'react-toastify';
import { getRequest, postRequest } from '../../hooks/axiosClient';
import { decode, getCurrentUser } from '../../helpers/utils';
import { useNavigate, useParams } from 'react-router-dom';
import { BsArrowLeftShort } from 'react-icons/bs';

const CanvasEditor = () => {
    const defaultValues = {
        color: "#0071CE",
        borderColor: "#0071CE",
        borderType: "Inside",
        borderSize: 0,
        borderRadius: 0,
        borderDashArray: "solid"
    };

    let userDetails = getCurrentUser()?.user
    const { id } = useParams()

    const canvasRef = useRef(null);
    const fabricRef = useRef(null);
    const currentTool = useRef(null);
    const currentSubTool = useRef(null);
    const activeObjects = useRef(null);
    const canvasHistory = useRef([]);
    const isEditingStarted = useRef(false);
    const selectedTextStyles = useRef(null);
    const drawing = useRef(false);
    const [savedTemplate, setSavedTemplate] = useState(false);
    const [tools, setTools] = useState("select");
    const [subTools, setSubTools] = useState("draw1");
    const [showSubMenu, setShowSubMenu] = useState(false);
    const [textStyles, setTextStyles] = useState(defaultValues);

    useEffect(() => {
        selectedTextStyles.current = textStyles
    }, [textStyles])
    

    let isPanning = false;
    let lastPosX = 0;
    let lastPosY = 0;
    // let dimensionLabel;
    let distanceLines = [];
    let historyStep = -1;
    const currentShape = useRef(null);
    const currentLine = useRef(null);
    let startX = 0;
    let startY = 0;
    let points = useRef([]);
    let tempLines = useRef([]);
    const CLOSE_DISTANCE = 10;
    const arrowHead = useRef(null);
    const startArrow = useRef(null);
    const dimensionLabel = useRef(null);
    const isLabelHidden = useRef(false);



    const resetAllvalues = () => {
        currentShape.current = null
        currentLine.current = null
        points.current = []
        tempLines.current = []
        arrowHead.current = null
        startArrow.current = null
        drawing.current = false
    }


    function updateToolbarPosition(e, canvas) {
        return
        const toolbar = document.getElementById('toolbar');
        const obj = e?.selected?.[0];
        if (!obj || !toolbar) return;

        const bound = canvasRef.current.getBoundingClientRect();
        const transform = canvas.viewportTransform; 
        
        const zoom = canvas.getZoom();

        const center = obj.getCenterPoint();

        const screenX = center.x * transform[0] + transform[4] + bound.left;
        const screenY = center.y * transform[3] + transform[5] + bound.top;

        toolbar.style.left = `${screenX}px`;
        toolbar.style.top = `${screenY - 50}px`; 
        toolbar.style.display = 'block';
    }

    useEffect(() => {
        currentTool.current = tools
    }, [tools])
   
    useEffect(() => {
        currentSubTool.current = subTools
    }, [subTools])

    const rotateIconSvg = `
        <svg width="38" height="39" viewBox="0 0 38 39" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="4" y="4.11768" width="30" height="30" rx="15" fill="white"/>
        <path d="M25.6668 19.1178C25.6668 22.7978 22.6802 25.7845 19.0002 25.7845C15.3202 25.7845 13.0735 22.0778 13.0735 22.0778M13.0735 22.0778H16.0868M13.0735 22.0778V25.4112M12.3335 19.1178C12.3335 15.4378 15.2935 12.4512 19.0002 12.4512C23.4468 12.4512 25.6668 16.1578 25.6668 16.1578M25.6668 16.1578V12.8245M25.6668 16.1578H22.7068" stroke="#26A3DB" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
    `;

    const encoded = 'data:image/svg+xml;utf8,' + encodeURIComponent(rotateIconSvg);
    const rotateIconImage = new Image();

    rotateIconImage.src = encoded;
    const customRotateControl = new fabric.Control({
        x: 0,
        y: 0.5,
        offsetY: 30,
        cursorStyle: 'crosshair',
        actionName: 'rotate',
        // actionHandler: function (eventData, transform, x, y) {
        //     if (!isLabelHidden.current && dimensionLabel.current) {
        //         dimensionLabel.current.set({ opacity: 0 });
        //         isLabelHidden.current = true;
        //         transform.target.canvas.requestRenderAll();
        //     }
        //     return fabric.controlsUtils.rotationWithSnapping(eventData, transform, x, y);
        // },
        // render: function (ctx, left, top, styleOverride, fabricObject) {
        //     const size = 32;
        //     ctx.save();
        //     ctx.translate(left, top);
        //     if (rotateIconImage.complete) {
        //     ctx.drawImage(rotateIconImage, -size / 2, -size / 2, size, size);
        //     } else {
        //     rotateIconImage.onload = () => {
        //         fabricObject.canvas && fabricObject.canvas.requestRenderAll();
        //     };
        //     }
        //     ctx.restore();
        // }
        actionHandler: function (eventData, transform, x, y) {
            if (!isLabelHidden.current && dimensionLabel.current) {
                dimensionLabel.current.set({ opacity: 0 });
                isLabelHidden.current = true;
                transform.target.canvas.requestRenderAll();
            }
            return fabric.controlsUtils.rotationWithSnapping(eventData, transform, x, y);
        },
        positionHandler: function(dim, finalMatrix, fabricObject) {
            // const zoom = fabricObject?.canvas?.getZoom();
            // console.log(zoom);
            const adjustedOffsetY = 25;
            // zoom > 1.3 ? 30 : 25;
            
            return fabric.util.transformPoint(
                { x: 0, y: (dim.y / 2 + adjustedOffsetY) },
                finalMatrix
            );
        },
        render: function (ctx, left, top, styleOverride, fabricObject) {
            const size = 32;
            ctx.save();
            ctx.translate(left, top);
            if (rotateIconImage.complete) {
                ctx.drawImage(rotateIconImage, -size / 2, -size / 2, size, size);
            } else {
                rotateIconImage.onload = () => {
                    fabricObject.canvas && fabricObject.canvas.requestRenderAll();
                };
            }
            ctx.restore();            
        }
    });
    

    function debounce(fn, delay) {
        let id;
        return (...args) => {
            clearTimeout(id);
            id = setTimeout(() => fn(...args), delay);
        };
    }

    const exportCanvas = () => {
        if (!fabricRef.current) return;
        const canvasData = fabricRef.current.toJSON(['name',
            'objectLayoutType',
            'includeInHistory',
            'evented',
            'editable',
            'cropX',
            'cropY',
            'width',
            'height',
            'left',
            'top',
            'scaleX',
            'scaleY',
            'angle',
            'originX',
            'originY'
        ]);
        
        canvasData.objects = canvasData.objects.filter(obj => obj.evented === true);
        const json = JSON.stringify(canvasData);

        let payload = {
            customer_id:userDetails?.common_id,
            project_id: decode(id),
            name:`${decode(id)}-template`,
            canvas_json:json,
        }
        if (isEditingStarted.current && !drawing.current) {
            saveTempate(payload)
        }
    };

    const saveTempate = async (data) => {
        try {
            const response = await postRequest('beacon-template/save', data);
        } catch (error) {
            console.log(error);
        }
    };

    const getsavedTempate = async () => {
        try {
            let url = `beacon-template/${userDetails?.common_id}/${decode(id)}`
            const response = await getRequest(url);
            setSavedTemplate(response?.data?.template)
        } catch (error) {
            console.log(error);
        }
    };

    const debouncedSave = debounce(exportCanvas, 500);

    useEffect(() => {
      getsavedTempate()
    }, [])
    

    useEffect(() => {
        if (!canvasRef.current) return;
        const toolbar = document.getElementById('toolbar');
        const canvas = new fabric.Canvas(canvasRef.current, {
            width: window.innerWidth,
            height: window.innerHeight,
            backgroundColor: '#f6f7f3',
            preserveObjectStacking: true
        });

        fabric.Object.prototype.setControlsVisibility({ mtr: true });
        fabric.Object.prototype.transparentCorners = false;
        fabric.Object.prototype.cornerStyle = 'circle';
        fabric.Object.prototype.cornerColor = '#ffffff';
        fabric.Object.prototype.cornerStrokeColor = '#0078ff';
        fabric.Object.prototype.cornerSize = 12;
        fabric.Object.prototype.borderColor = '#0078ff';
        fabric.Object.prototype.borderDashArray = [];
        fabric.Object.prototype.padding = 5;

        fabric.Object.prototype.toObject = (function (toObject) {
            return function (propertiesToInclude) {
                return toObject.call(this, ['name'].concat(propertiesToInclude || []));
            };
        })(fabric.Object.prototype.toObject);

        if(!canvas) return
        fabricRef.current = canvas;

        const saved = savedTemplate
        
        if (saved && canvasRef.current) {
            canvasHistory.current = []
            function snapLineToArrows(group) {
                if (!group || group.type !== 'group') return;

                const polyline = group._objects.find(obj => obj.name === 'drawing line' && obj.type === 'polyline');
                
                polyline.set({
                    pathOffset:{ x: 0, y: 0 },
                    stroke: "red",
                    originX: "left",
                    originY: "center",
                });

                polyline.setCoords();
            }

           
            canvas?.loadFromJSON(saved, () => {
                canvas?.renderAll();
                canvas.setWidth(window.innerWidth);
                canvas.setHeight(window.innerHeight);
                onSelectTools("select");
                const objects = canvas.getObjects();
                canvas.getObjects().forEach((obj) => {
                    if (obj.type === 'image') {
                        obj.set({
                            objectCaching: false,
                            originX: 'left',
                            originY: 'top',
                        });

                        setupCustomControls(obj);

                        obj.setCoords();
                    }
                });
                const bounds = objects.find((item) => item?.objectLayoutType === "layout-boundary");

                if (bounds) {
                    const boundsWidth = bounds.width * bounds.scaleX;
                    const boundsHeight = bounds.height * bounds.scaleY;

                    const topDivHeight = 90;
                    const availableHeight = window.innerHeight - topDivHeight;
                    const availableWidth = window.innerWidth;

                    const zoomX = availableWidth / boundsWidth;
                    const zoomY = availableHeight / boundsHeight;
                    const zoom = Math.min(zoomX, zoomY);  

                    canvas.setZoom(zoom);

                    const canvasCenter = {
                        x: availableWidth / 2,
                        y: (availableHeight / 2) + topDivHeight,  
                    };

                    const objectCenter = bounds.getCenterPoint();
                    const screenCenter = fabric.util.transformPoint(objectCenter, canvas.viewportTransform);

                    const dx = canvasCenter.x - screenCenter.x;
                    const dy = canvasCenter.y - screenCenter.y;

                    canvas.relativePan(new fabric.Point(dx, dy));
                    canvas.requestRenderAll();
                }
            });
           
            canvasHistory.current?.push(saved);

            isEditingStarted.current = true
        }else {
            if (isEditingStarted.current) {
                addTemplate(canvas) 
            }
        }

        const handleWheel = (opt) => {
            const delta = opt?.e?.deltaY || 1;
            let zoom = canvas.getZoom();
            zoom *= 0.999 ** delta;
            zoom = Math.max(0.2, Math.min(zoom, 3));
            canvas.zoomToPoint({ x: opt?.e?.offsetX, y: opt?.e?.offsetY }, zoom);
            
            opt.e.preventDefault();
            opt.e.stopPropagation();

            canvas.getActiveObjects().forEach(obj => obj.setCoords());
            canvas.requestRenderAll();

            updateToolbarPosition({ selected: canvas.getActiveObjects() }, canvas);
        };


        canvas.on('mouse:wheel', handleWheel);
        
        canvas.on('object:moving', (e) => {

            const boundary = canvas.getObjects().find(item => item?.objectLayoutType === 'layout-boundary');
            let activeObjects = canvas.getActiveObjects();     
            
            
            if (!boundary) return;

            const boundLeft = boundary.left;
            const boundTop = boundary.top;
            const boundRight = boundary.left + boundary.width * boundary.scaleX;
            const boundBottom = boundary.top + boundary.height * boundary.scaleY;

            activeObjects.forEach(obj => {
                if (obj.name === 'qrimage') {
                    const objWidth = obj.width * obj.scaleX;
                    const objHeight = obj.height * obj.scaleY;

                    if (obj.left < boundLeft) {
                        obj.left = boundLeft;
                    }

                    if (obj.top < boundTop) {
                        obj.top = boundTop;
                    }

                    if (obj.left + objWidth > boundRight) {
                        obj.left = boundRight - objWidth;
                    }

                    if (obj.top + objHeight > boundBottom) {
                        obj.top = boundBottom - objHeight;
                    }
                }
            });

            // updateDimensionLabel(e,canvas)
            updateToolbarPosition({ selected: [e.target] }, canvas)
        });
        
        canvas.on('object:added', (e) => {
            if (e?.target?.includeInHistory) {
                debouncedSave()
            }
        });
        
        canvas.on('object:modified', (e) => {
            // updateDimensionLabel(e, canvas)
            if (e?.target?.includeInHistory) {
                const qrImages = canvas.getObjects().filter(obj => obj.name === 'qrimage');
                qrImages.forEach(obj => canvas.bringToFront(obj));
    
                saveHistory(canvas);
                debouncedSave()
            }
        });

        canvas.on('object:removed', (e) => {
            if (e?.target?.includeInHistory) {
                debouncedSave()
            }
        });
        
        canvas.on('object:moved', (e) => {
            debouncedSave()
        });
        
        canvas.on('object:scaled', (e) => {
            debouncedSave()
        });

        canvas.on('object:rotated', (e) => {
            debouncedSave()
        });

        canvas.on('path:created', (e) => {
            debouncedSave()
        });
        

        canvas.on('object:scaling', (e) => {
            updateDimensionLabel(e, canvas);
            updateToolbarPosition({ selected: [e.target] }, canvas);
            const obj = e.target;
            
            if (obj.name !== 'qrimage') return;
 
            const boundary = canvas.getObjects().find(o => o.objectLayoutType === 'layout-boundary');
            if (!boundary) return;
 
            const qrBounds = obj.getBoundingRect(true); 
 
            const boundLeft = boundary.left;
            const boundTop = boundary.top;
            const boundRight = boundary.left + boundary.width * boundary.scaleX;
            const boundBottom = boundary.top + boundary.height * boundary.scaleY;
 
            const isOutOfBounds =
                qrBounds.left < boundLeft ||
                qrBounds.top < boundTop ||
                qrBounds.left + qrBounds.width > boundRight ||
                qrBounds.top + qrBounds.height > boundBottom;

            if (isOutOfBounds) { 
                obj.scaleX = obj._lastScaleX || obj.scaleX;
                obj.scaleY = obj._lastScaleY || obj.scaleY;
                obj.left = obj._lastLeft || obj.left;
                obj.top = obj._lastTop || obj.top;
                obj.setCoords();
                canvas.requestRenderAll();
            } else { 
                obj._lastScaleX = obj.scaleX;
                obj._lastScaleY = obj.scaleY;
                obj._lastLeft = obj.left;
                obj._lastTop = obj.top;
            }
            


        });
        canvas.on('object:resizing', (e) => {
            updateDimensionLabel(e, canvas);
        });

        canvas.on('selection:created', (e) => {
            if (e?.selected?.length > 1) {
                const filtered = e.selected.filter(obj => !obj.excludeFromGroupSelection && obj.objectLayoutType !== "layout-boundary" && obj.name !== 'qrimage');
                if (filtered.length !== e.selected.length) {
                    canvas.discardActiveObject(); 
                    const selection = new fabric.ActiveSelection(filtered, {
                        canvas: canvas
                    });
                    canvas.setActiveObject(selection);
                    canvas.requestRenderAll();
                }
            }
            activeObjects.current = e?.selected
            // updateDimensionLabel(e,canvas)
            updateToolbarPosition(e, canvas)
        });

        canvas.on('selection:updated', (e) => {
            if (e.e?.shiftKey) {
                const previousSelection = canvas._previousSelection || [];
                
                if (previousSelection.length === 1) {
                canvas.setActiveObject(previousSelection[0]);
                } else if (previousSelection.length > 1) {
                const sel = new fabric.ActiveSelection(previousSelection, { canvas });
                canvas.setActiveObject(sel);
                } else {
                canvas.discardActiveObject();
                }

                canvas.requestRenderAll();
            } 

            // updateDimensionLabel(e,canvas)
            updateToolbarPosition(e, canvas)
        });
        
        canvas.on('selection:cleared', () => {
            activeObjects.current = []
            if (toolbar) toolbar.style.display = 'none';
            if (dimensionLabel.current) {
                canvas.remove(dimensionLabel.current);
                dimensionLabel.current = null;
            }
        });
        
        canvas.on('mouse:down', function (opt) {
            let tool = currentTool.current
            const evt = opt.e;
            const pointer = canvas.getPointer(opt.e);

            if (opt.target  && tool !== "draw") {
                activeObjects.current=[opt.target]
                if ('viewportTag' in opt.target) {
                    delete opt.target.viewportTag;
                }
                
                if (opt.target && (opt.target.type === 'i-text' || opt.target.type === 'textbox')) {
                    
                    const fontSize = opt.target?.fontSize;
                    const lineHeight = opt.target?.lineHeight;
                    const textAlign = opt.target?.textAlign;
                    const fontWeight = opt.target?.fontWeight;
                    const fontStyle = opt.target?.fontStyle;
                    const underline = opt.target?.underline || false;
                    const fontFamily = opt.target?.fontFamily;
                    const link = opt.target?.data?.link || '';
                    const opacity = opt?.target?.opacity * 100 || 100;
                    const textTransform = detectTextCase(opt.target?.text) || '';

                    function detectTextCase(text) {
                        if (!text) return 'empty';
                      
                        if (text === text.toUpperCase()) return 'uppercase';
                        if (text === text.toLowerCase()) return 'lowercase';
                      
                        const words = text.split(' ');
                        const capitalizedWords = words.filter(word => {
                          return word[0] === word[0]?.toUpperCase() && word.slice(1) === word.slice(1)?.toLowerCase();
                        });
                      
                        if (capitalizedWords.length === words.length) return 'capitalize';
                      
                        return 'mixed';
                    }
            
                    setTextStyles({
                        fontSize,
                        lineHeight,
                        textAlign,
                        fontWeight,
                        fontStyle,
                        underline,
                        fontFamily,
                        link,
                        textTransform,
                        opacity,
                    });
                    
                } 

                const opacity = opt?.target?.opacity * 100 || 100;
                let color = (opt.target?.type !== 'image' && opt.target?.fill) 
                    ? opt.target.fill 
                    : defaultValues?.color;
                const borderColor = opt.target?.stroke || defaultValues?.borderColor;
                const borderRadius = opt.target?.rx || defaultValues?.borderRadius;
                const borderSize = opt.target?.stroke ? opt.target?.strokeWidth : defaultValues?.borderSize;
                const borderDashArray = opt.target?.strokeDashArray ? "dashed" : "solid";
 
                const gradientStops = opt.target.fill?.colorStops;

                if (gradientStops) {
                    color =  `linear-gradient(270deg, ${gradientStops.map(stop => `${stop.color} ${stop.offset * 100}%`).join(', ')})`;
                }


                setTextStyles((prev) => ({
                    ...prev,
                    opacity,
                    color,
                    borderRadius,
                    borderColor,
                    borderSize,
                    borderDashArray
                }));
                
                if (tool == "erase") {
                    if (opt.target?.name === "qrimage") {
                        toast.warning("QR image could not be removed.")
                    } else {
                        if(opt.target?.objectLayoutType == 'layout-boundary') return
                        canvas.remove(opt.target);
                        saveHistory(canvas)
                    }
                }
            } else if (tool == "draw") {
                startX = pointer.x;
                startY = pointer.y;
                const x = pointer.x;
                const y = pointer.y;
                let shapeType = currentSubTool.current || null
                setShowSubMenu(false)

               
                if (shapeType) {
                    if (shapeType.includes("line")
                        && (shapeType === 'line1' || shapeType === 'line2' || shapeType === 'line3')
                    ) {
                        if (!drawing.current && points.current.length == 0) {
                            if (points.current.length > 0) return
                                drawing.current = true;
                                points.current.push({ x, y });
                                currentLine.current = new fabric.Polyline(points.current, {
                                    stroke: 'gray',
                                    strokeWidth: 2,
                                    fill: null,
                                    selectable: false,
                                    evented: false,
                                    name:"drawing line"
                                });

                            if (shapeType === 'line2' || shapeType === 'line5' || shapeType === 'line8' ) {
                                currentLine.current?.set({ strokeDashArray: [2, 5] });
                            } else if (shapeType === 'line3' || shapeType === 'line6' || shapeType === 'line9') {
                                currentLine.current?.set({ strokeDashArray: [5, 5] });
                            }

                            tempLines.current.push(currentLine.current);
                            canvas.add(currentLine.current);

                            if(shapeType === "line4" || shapeType === "line5" || shapeType === "line6"){
                                arrowHead.current = new fabric.Path('M 0 0 L 10 7.5 L 0 15', {
                                    left: startX,
                                    top: startY,
                                    stroke: 'gray',
                                    strokeWidth: 2,
                                    fill: '',
                                    originX: 'center',
                                    originY: 'center',
                                    angle: 0,
                                    selectable: false,
                                    evented: false,
                                    name:"drawing triangle"
                                  });
                                canvas.add(arrowHead.current);
                            }else if(shapeType === "line7" || shapeType === "line8" || shapeType === "line9"){
                                arrowHead.current = new fabric.Path('M 0 0 L 10 7.5 L 0 15', {
                                    left: startX,
                                    top: startY,
                                    stroke: 'gray',
                                    strokeWidth: 2,
                                    fill: '',
                                    originX: 'center',
                                    originY: 'center',
                                    angle: 0,
                                    selectable: false,
                                    evented: false,
                                     name:"drawing triangle"
                                  }); 
                                startArrow.current = new fabric.Path('M 0 0 L 10 7.5 L 0 15', {
                                    left: startX,
                                    top: startY,
                                    stroke: 'gray',
                                    strokeWidth: 2,
                                    fill: '',
                                    originX: 'center',
                                    originY: 'center',
                                    angle: 0,
                                    selectable: false,
                                    evented: false,
                                     name:"drawing triangle"
                                });
                                canvas.add(arrowHead.current);
                                canvas.add(startArrow.current);
                            }else if(shapeType === "line10"){
                                arrowHead.current = new fabric.Triangle({
                                    width: 10,
                                    height: 15,
                                    fill: 'black',
                                    left: startX,
                                    top: startY,
                                    originX: 'center',
                                    originY: 'center',
                                    angle: 270,
                                    selectable: false,
                                    evented: false,
                                     name:"drawing triangle"
                                });
                                canvas.add(arrowHead.current);
                            }else if(shapeType === "line11"){
                                arrowHead.current = new fabric.Rect({
                                    width: 10,
                                    height: 10,
                                    fill: 'black',
                                    left: startX,
                                    top: startY,
                                    originX: 'center',
                                    originY: 'center',
                                    angle: 270,
                                    selectable: false,
                                    evented: false,
                                     name:"drawing triangle"
                                  });
                                canvas.add(arrowHead.current);
                            }else if(shapeType === "line12"){
                                arrowHead.current = new fabric.Circle({
                                    radius: 5, 
                                    fill: 'black',
                                    left: startX,
                                    top: startY,
                                    originX: 'center',
                                    originY: 'center', 
                                    selectable: false,
                                    evented: false,
                                     name:"drawing triangle"
                                  });
                                canvas.add(arrowHead.current);
                            }

                        } else {
                            const first = points.current[0];
                            const dx = x - first?.x;
                            const dy = y - first?.y;
                            const distance = Math.sqrt(dx * dx + dy * dy);

                            if (distance < CLOSE_DISTANCE && points.current.length > 2) {
                                tempLines.current.forEach(line => canvas.remove(line));
                                tempLines.current = [];  
                                const polygon = new fabric.Polygon(points.current, {
                                    fill: 'rgba(100,100,100,0.5)',
                                    stroke: 'gray',
                                    strokeWidth: 2,
                                    selectable: true,
                                    evented: true,
                                    includeInHistory:true,
                                    name:"generatedObject"
                                });
                                if (shapeType === 'line2') {
                                    polygon?.set({ strokeDashArray: [2, 5] });
                                } else if (shapeType === 'line3') {
                                    polygon?.set({ strokeDashArray: [5, 5] });
                                }
                                canvas.add(polygon);
                                canvas.setActiveObject(polygon);

                                drawing.current = false;
                                points.current = [];
                                currentLine.current = null;
                                return;
                            }

                            if (shapeType === "line1" || shapeType === "line2" || shapeType === "line3") {
                                points.current.push({ x, y });
                                currentLine.current?.set({
                                    points: [...points.current],
                                    includeInHistory: true
                                });
                                tempLines.current.push(currentLine.current);
                                canvas.add(currentLine.current);
                            } else {
                                let arrowLine;
                                if (shapeType === "line4" || shapeType === "line5" || shapeType === "line6" || shapeType === "line10" || shapeType === "line11" || shapeType === "line12") {
                                    
                                    arrowLine = new fabric.Group([currentLine.current, arrowHead.current], {
                                        selectable: false,
                                        evented: true,
                                        includeInHistory:true,
                                        name:"generatedObject"
                                    })
                                    canvas.remove(currentLine.current)
                                    canvas.remove(arrowHead.current)
                                } else if (shapeType === "line7" || shapeType === "line8" || shapeType === "line9") {
                                    arrowLine = new fabric.Group([currentLine.current, arrowHead.current, startArrow.current], {
                                        selectable: false,
                                        evented: true,
                                        includeInHistory:true,
                                        name:"generatedObject"
                                    })
                                    canvas.remove(currentLine.current)
                                    canvas.remove(arrowHead.current)
                                    canvas.remove(startArrow.current)
                                }
                                if (!arrowLine) return
                                canvas.add(arrowLine) 
                                drawing.current = false;
                                points.current = [];
                                currentLine.current = null;
                            }
                        }
                    } else {
                        if (!drawing.current) {
                            onSelectTools("select")
                        }
                    }

                } 
            }else {
                 
            }

            if (tool == "text") { 
            }  

            if (evt.altKey || evt.button === 1) { 
                isPanning = true;
                lastPosX = evt.clientX;
                lastPosY = evt.clientY;
            }
        });

        canvas.on('mouse:move', function(opt) {
            if (isPanning) {
                const e = opt.e;
                const vpt = canvas.viewportTransform;
                vpt[4] += e.clientX - lastPosX;
                vpt[5] += e.clientY - lastPosY;
                canvas.requestRenderAll();
                lastPosX = e.clientX;
                lastPosY = e.clientY;
                handleWheel(opt)
            }
            
            const active = canvas.getActiveObjects();            

            if (active.length) {
                updateToolbarPosition({ selected: active }, canvas);
            }

            if (!drawing.current && !currentShape.current && !currentLine.current) return;


            const pointer = canvas.getPointer(opt.e);
            const width = pointer.x - startX;
            const height = pointer.y - startY;
        
            let tools = currentSubTool.current

            if (tools.includes("line")) {
                const tempPoints = [...points.current, { x: pointer.x, y: pointer.y }];
                currentLine.current?.set({ points: tempPoints });
                if (tools === "line4" || tools === "line5" || tools === "line6" || tools === "line7" || tools === "line8" || tools === "line9" || tools === "line10" || tools === "line11" || tools === "line12") {
                    const dx = pointer.x - startX;
                    const dy = pointer.y - startY;
                    const angle = Math.atan2(dy, dx) * (180 / Math.PI);
                    startArrow.current?.set({
                        angle: angle + 180
                    });

                    if (tools === "line10" || tools === "line11" || tools === "line12") {
                        arrowHead.current?.set({
                            left: pointer.x,
                            top: pointer.y,
                            angle: angle + 90
                        });
                    } else {
                        arrowHead.current?.set({
                            left: pointer.x,
                            top: pointer.y,
                            angle: angle 
                        });
                    }
                     
                    canvas.requestRenderAll();
                     
                }

            }else if (["draw1","draw2","draw3","draw4","draw5"].includes(tools)) {   
                
            }
            
            if (currentLine.current) {
                currentLine.current.setCoords();
                currentLine.current.dirty = true;
                currentLine.current.objectCaching = false;
            } else if(currentShape.current) { 
            }
            canvas.requestRenderAll()
        
        });

        canvas.on('mouse:up', function (opt) {
            isPanning = false;
            // isLabelHidden.current = false
            // if (dimensionLabel.current) {
            //     updateDimensionLabel(opt, canvas)
            // }

            if (dimensionLabel.current) {
                dimensionLabel.current.set({ opacity: 0 });
                isLabelHidden.current = true;
                canvas.requestRenderAll();
            }
            if (currentShape.current) {
                currentShape.current.set({
                    selectable: false,
                    hasControls: false,
                    hasBorders: false,
                    lockMovementX: false,
                    lockMovementY: false,
                    includeInHistory:true
                });
                currentShape.current.setCoords();
           
            }
            let tools = currentSubTool.current
            
            if (tools !== "line1" && tools !== "line2" && tools !== "line3" && currentTool.current == "draw") { 
                if (currentShape.current) {
                    currentShape.current.set({
                        name:"drawingline"
                    });
                    canvas.discardActiveObject();

                }
                drawing.current = false;
                if (points.current.length > 2) {
                    points.current = []
                }
            }
            currentShape.current = null;
        });

        canvas.on('after:render', () => {
            const active = canvas.getActiveObjects();
            if (active.length) {
                updateToolbarPosition({ selected: active }, canvas);
            }
            
        });

        const handleKeyDown = (e) => {

            const tag = document.activeElement.tagName.toLowerCase();
            if (tag === 'input' || tag === 'textarea' || document.activeElement.isContentEditable) {
                return; 
            }
            
            if (e.key === 'Escape') { 
                if (drawing.current) {
                    drawing.current = false;
                
                    if (currentLine.current) {
                        tempLines.current.forEach(line => canvas.remove(line));
                        tempLines.current = [];  
                        if (points.current?.length > 1) {
                            const polygon = new fabric.Polygon(points.current, {
                                fill: 'rgba(100,100,100,0.5)',
                                stroke: 'gray',
                                strokeWidth: 2,
                                selectable: true
                            });
                            if (currentSubTool.current === 'line2') {
                                polygon?.set({ strokeDashArray: [2, 5] });
                            } else if (currentSubTool.current === 'line3') {
                                polygon?.set({ strokeDashArray: [5, 5] });
                            }
                            canvas.add(polygon);
                            canvas.setActiveObject(polygon);
                        }
                        currentLine.current = null;
                    }
            
                    points.current = [];
            
                    canvas.requestRenderAll();
                }
            }
            
            if (e.key === 'Delete') {
                const activeObjects = canvas.getActiveObjects();

                if (activeObjects.length > 0) {
                    let blocked = false;

                    activeObjects.forEach((obj) => {
                        if (obj.name === "qrimage") {
                            blocked = true;
                        } else if (obj.objectLayoutType === 'layout-boundary') { 
                        }else {
                            canvas.remove(obj);
                        }
                    });

                    if (blocked) {
                        toast.warning("QR image could not be removed.");
                    }

                    canvas.discardActiveObject(); 
                    canvas.requestRenderAll(); 
                }
            }
        
            if (e.ctrlKey && e.key === 'z') {
                e.preventDefault();
                undo(canvas);
            } else if (e.ctrlKey && e.key === 'y') {
                e.preventDefault();
                redo(canvas);
            }
        
            const step = e.shiftKey ? 10 : 1;
            let moved = false;
        
            switch (e.key) {
                case 'ArrowLeft':
                    moveSelectedObjects(canvas, 'left', step);
                    moved = true;
                    break;
                case 'ArrowRight':
                    moveSelectedObjects(canvas, 'right', step);
                    moved = true;
                    break;
                case 'ArrowUp':
                    moveSelectedObjects(canvas, 'up', step);
                    moved = true;
                    break;
                case 'ArrowDown':
                    moveSelectedObjects(canvas, 'down', step);
                    moved = true;
                    break;
            }
        
            if (moved) {
                e.preventDefault(); 
            }
        };
        

        window.addEventListener('keydown', handleKeyDown);
        document.addEventListener("mousedown", (e) => handleMiddleMouseClick(e, canvas));
        document.addEventListener("mouseup", () => {
            isPanning = false;
        });

        return () => {
            canvas.dispose();
            document.removeEventListener("mousedown", handleMiddleMouseClick);
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [savedTemplate]);
 
    const applyDefaultStyles = (obj, defaults) => {
        if (!obj) return;
    
        if (obj instanceof fabric.Group) {
            obj.forEachObject(child => applyDefaultStyles(child, defaults));
            obj._objects.forEach(o => o.setCoords()); 
        } else {
            if ('fill' in obj) {
                obj.set({ fill: getFillOrGradient(defaults.color, obj) });
            }
    
            if ('stroke' in obj) {
                obj.set({
                    stroke: defaults.borderColor,
                    strokeWidth: parseInt(defaults.borderSize, 10),
                });
            }
    
            if (defaults.borderType === 'Dashed') {
                obj.set({ strokeDashArray: [5, 5] });
            } else if (defaults.borderType === 'Dotted') {
                obj.set({ strokeDashArray: [2, 5] });
            } else {
                obj.set({ strokeDashArray: null }); 
            }
        }
    
        obj.setCoords();
    };
    
 
    function getFillOrGradient(value, object) {
        const isGradient = typeof value === 'string' && value.startsWith('linear-gradient');
         
        if (!isGradient) return value;
      
        if (isGradient) {
            const match = value.match(/linear-gradient\((\d+)deg,\s*(#[0-9A-Fa-f]{6})\s*\d*%?,\s*(#[0-9A-Fa-f]{6})\s*\d*%?\)/);
            if (!match) return object.fill;
        
            const angle = parseInt(match[1]);
            const color1 = match[2];
            const color2 = match[3];
         
            const radians = (angle * Math.PI) / 180;
            const x1 = 0;
            const y1 = 0;
            const x2 = Math.cos(radians) * object.width;
            const y2 = Math.sin(radians) * object.height;
        
            return new fabric.Gradient({
                type: 'linear',
                coords: { x1, y1, x2, y2 },
                colorStops: [
                    { offset: 0, color: color1 },
                    { offset: 1, color: color2 }
                ]
            });
        }
      
        return '#000'; 
    }
 
    const resetCanvas = () => {
        let canvas = fabricRef.current
        if (!canvas) return;
        canvas.getObjects().forEach(obj => {
            canvas.remove(obj);
        });

        if (dimensionLabel.current) {
            canvas.remove(dimensionLabel.current);
            dimensionLabel.current = null;
        }

        canvas.discardActiveObject();
        canvas.setViewportTransform([1, 0, 0, 1, 0, 0]); 
        canvas.renderAll();
 
        presetTemplate()
    };

    const presetTemplate = async () => {
        try {
          const response = await getRequest(`beacon-template/default`);
            const data = response.data ?? [];
            let template = data?.template
            let canvas = fabricRef.current

            canvas?.loadFromJSON(template, () => {
                canvas?.renderAll();
                canvas.setWidth(window.innerWidth);
                canvas.setHeight(window.innerHeight);
                onSelectTools("select")

                const objects = canvas.getObjects();
                const bounds = objects.find((item) => item?.objectLayoutType === "layout-boundary");

                if (bounds) {

                    const boundsWidth = bounds.width * bounds.scaleX;
                    const boundsHeight = bounds.height * bounds.scaleY;

                    const topDivHeight = 90;
                    const availableHeight = window.innerHeight - topDivHeight;
                    const availableWidth = window.innerWidth;

                    const zoomX = availableWidth / boundsWidth;
                    const zoomY = availableHeight / boundsHeight;
                    const zoom = Math.min(zoomX, zoomY);  

                    canvas.setZoom(zoom);

                    const canvasCenter = {
                        x: availableWidth / 2,
                        y: (availableHeight / 2) + topDivHeight,  
                    };
                     
                    const objectCenter = bounds.getCenterPoint();
                    const viewportTransform = canvas.viewportTransform;
                    const screenCenter = fabric.util.transformPoint(objectCenter, viewportTransform);

                    const dx = canvasCenter.x - screenCenter.x;
                    const dy = canvasCenter.y - screenCenter.y;

                    canvas.relativePan(new fabric.Point(dx, dy));
                    canvas.requestRenderAll();
                }
            });
        } catch (error) {
          console.log(error);
        }
    }
     
    const addTemplate = (canvas,addToHistory = true) => {
        const rect = new fabric.Rect({
            left: 0,
            top: 0,
            width: 595,
            height: 842,
            fill: 'rgba(139, 205, 235, 1)',
            includeInHistory: true,
            name: "rect",
            selectable: false,   
            objectLayoutType: "layout-boundary",
            stroke: 'rgba(120, 120, 120)',
            strokeWidth: 1, 
            shadow: {
                color: 'rgba(0,0,0,0.3)',
                blur: 20,
                offsetX: 0,
                offsetY: 0,
                affectStroke: false
            },
            editable: false,
        }); 

        const text = new fabric.Textbox('Find Your Destination', {
            left: 32.23,
            top: 85.26,
            fontFamily: 'Roboto',
            fontWeight: '700',
            fontSize: 81,
            lineHeight: 84 / 81, 
            charSpacing: 0,  
            width:438.2315,
            fill: '#fff',
            includeInHistory: true,
            selectable: false,   
        }); 

        
        const headingPeragraph = new fabric.Textbox(
            `Instant directions with no app download`,
            {
                left: 35.98,
                top: 260.97,
                fontFamily: 'Roboto',
                fontWeight: '400',
                fontSize: 28,
                lineHeight: 1,
                width: 500,
                fill: 'rgba(38, 163, 219, 1)',
                includeInHistory:true,
                selectable: false,   
            }
        );
        
        
    
        const step1Heading = new fabric.Textbox('Step 1: Scan the QR code', {
            left: 38.23,
            top: 603.84,
            fontFamily: 'Roboto',
            fontWeight: '700',
            fontSize: 9,
            lineHeight: 1,
            width:110,
            fill: '#000',
            includeInHistory:true,
            selectable: false,   
        });
        
        const step1Body = new fabric.Textbox(
            `Open your device's camera and aim your camera at the QR code provided.\n` +
            `Wait for the QR code to be recognised, and tap the link that appears on your screen.`,
            {
                left: 38.23,
                top: 614.47,
                fontFamily: 'Roboto',
                fontWeight: '400',
                fontSize: 9,
                lineHeight: 1,
                width: 292,
                fill: '#000',
                includeInHistory:true,
                selectable: false,   
            }
        );
        
        const step2Heading = new fabric.Textbox('Step 2: Select Your Destination', {
            left: 38.23,
            top: 657.02,
            fontFamily: 'Roboto',
            fontWeight: '700',
            fontSize: 9,
            lineHeight: 1,
            width:130,
            fill: '#000',
            includeInHistory:true,
            selectable: false,   
            // evented: false,
        });
        
        const step2Body = new fabric.Textbox(
            `On the main screen, tap the “To:” search box and select either the product or place that you are looking for.\n` +
            `Once you've made your selection, review the details of the selected product or place and tap the "Set as destination" button to confirm.`,
            {
                left: 38.23,
                top: 667.67,
                fontFamily: 'Roboto',
                fontWeight: '400',
                fontSize: 9,
                lineHeight: 1,
                width: 292,
                fill: '#000',
                width:297,
                includeInHistory:true,
                selectable: false,   
            }
        );
        
        const step3Heading = new fabric.Textbox('Step 3: Get Directions', {
            left: 38.23,
            top: 720.85,
            fontFamily: 'Roboto',
            fontWeight: '700',
            fontSize: 9,
            lineHeight: 1,
            fill: '#000',
            width:95,
            includeInHistory:true,
            selectable: false,   
        });
        
        const step3Body = new fabric.Textbox(
            `After selecting your destination, tap the "Find my way" button to generate the best route to your chosen destination.\n` +
            `Follow the displayed directions to reach your desired product or place.`,
            {
                left: 38.23,
                top: 731.48,
                fontFamily: 'Roboto',
                fontWeight: '400',
                fontSize: 9,
                lineHeight: 1,
                width: 297,
                fill: '#000',
                includeInHistory:true,
                selectable: false,   
                
            }
        ); 
        
        const headingPeragraph1 = new fabric.Textbox(
            `To learn more and discover how `,
            {
                left: 180.92,
                top: 798.64,
                fontFamily: 'Roboto',
                fontWeight: '400',
                fontSize: 9.2,
                lineHeight: 1,
                width: 140,
                fill: 'rgba(38, 163, 219, 1)',
                includeInHistory:true,
                selectable: false,   
            }
        ); 
        
        const headingPeragraph2 = new fabric.Textbox(
            `find my way`,
            {
            left: 316.81,
            top: 798.64,
            fontFamily: 'Roboto',
            fontWeight: '700',
            fontSize: 9.2,
            lineHeight: 1,
            width: 53,
            fill: 'rgba(38, 163, 219, 1)',
            includeInHistory:true,
            selectable: false,   
            }
        ); 
        
        const headingPeragraph3 = new fabric.Textbox(
            ` can work for your business, visit `,
            {
            left: 372.78,
            top: 798.64,
            fontFamily: 'Roboto',
            fontWeight: '400',
            fontSize: 9.2,
            lineHeight: 1,
            width: 134,
            fill: 'rgba(38, 163, 219, 1)',
            includeInHistory:true,
            selectable: false,   
            }
        ); 
        
        const headingPeragraph4 = new fabric.Textbox(
            ` fmw.app `,
            {
            left: 510.41,
            top: 798.64,
            fontFamily: 'Roboto',
            fontWeight: '400',
            fontSize: 9.2,
            lineHeight: 1,
            width: 40,
            fill: 'rgba(38, 163, 219, 1)',
            includeInHistory:true,
            selectable: false,   
            }
        );

         const qrtext = new fabric.Textbox(`New beacon`, {
            left: 145,
            top: 560.2,
            fontFamily: 'Roboto',
            fontWeight: '700',
            fontSize: 15,
            lineHeight: 1,
            width: 90,
            fill: 'rgba(0,0,0,1)',
            includeInHistory: true,
            selectable: false,
            name: "qrimage",
            editable: false,
        }); 

        if (!canvas) return
        if (!canvasRef.current) return;

        const asyncLoads = [
            new Promise(resolve => {
              fabric.Image.fromURL(companyLogo, (img) => {
                img.set({  left: 38.23,
                    top: 33,
                    includeInHistory: true,
                    selectable: false,  
                });
                canvas.add(img);
                resolve();
              });
            }),
        
            new Promise(resolve => {
              fabric.Image.fromURL(siteLogo, (img) => {
                img.set({
                    left: 37.48,
                    top: 788.88,
                    includeInHistory:true,
                    selectable: false,  
                });
                canvas.add(img);
                resolve();
              });
            }),
        
            new Promise(resolve => {
                fabric.Image.fromURL(qr, (img) => {
                    const maxWidth = 190;
                    const maxHeight = 190;
                
                    const scaleX = maxWidth / img.width;
                    const scaleY = maxHeight / img.height;
                    const scale = Math.min(scaleX, scaleY);
                
                    img.set({
                        left: 92,
                        top: 361.12,
                        scaleX: scale,
                        scaleY: scale,
                        originX: 'left',
                        originY: 'top',
                        includeInHistory: true,
                        selectable: false,
                         name:"qrimage",
                    });
                    canvas.add(img);
                    resolve(); 
                });
            }),
            
            
           
        
            new Promise((resolve) => {
                Promise.all([ 
                    urlToBase64(Phoneimage).then((base64Phone) => {
                        return new Promise((res) => {
                            fabric.Image.fromURL(base64Phone, (img) => {
                            img.set({
                                left: 0,
                                top: 0,
                                width: 196,
                                height: 431,
                                originX: 'left',
                                originY: 'top'
                            });
                            res(img);
                            });
                        });
                    }),
 
                    new Promise((res) => {
                        fabric.Image.fromURL(companyLogo, (img) => {
                            const maxWidth = 70.54;
                            const maxHeight = 30.9;

                            const scaleX = maxWidth / img.width;
                            const scaleY = maxHeight / img.height;
                            const scale = Math.min(scaleX, scaleY);

                            img.set({
                            left: 11.76,
                            top: 34.26,
                            scaleX: scale,
                            scaleY: scale,
                            originX: 'left',
                            originY: 'top'
                            });
                            res(img);
                        });
                    })
                ]).then(([base64PhoneImg, logoImg]) => {
                    const group = new fabric.Group([base64PhoneImg, logoImg], {
                    left: 364.56,
                    top: 347.37,
                    originX: 'left',
                    originY: 'top',
                    includeInHistory: true,
                    selectable: false
                    });

                    canvas.add(group);
                    resolve();
                });
            })

        ];

        [
            rect, text, headingPeragraph, 
            step1Heading, step1Body, step2Heading, step2Body,
            step3Heading, step3Body,
            headingPeragraph1, headingPeragraph2,
            headingPeragraph3, headingPeragraph4,qrtext
          ].forEach(obj => {
            if (obj.name === "rect") {
              obj.sendToBack();
            }
              canvas.add(obj);
          });
         

        Promise.all(asyncLoads).then(() => {
            if (addToHistory) { 
                canvasHistory.current = []
            }
            const objects = canvas.getObjects();
            let bounds = objects.find((item) => item?.objectLayoutType === "layout-boundary")

            if (bounds) {
                const boundsWidth = bounds.width * bounds.scaleX;
                const boundsHeight = bounds.height * bounds.scaleY;

                const topDivHeight = 90;
                const availableHeight = window.innerHeight - topDivHeight;
                const availableWidth = window.innerWidth;

                const zoomX = availableWidth / boundsWidth;
                const zoomY = availableHeight / boundsHeight;
                const zoom = Math.min(zoomX, zoomY);  

                canvas.setZoom(zoom);

                const canvasCenter = {
                    x: availableWidth / 2,
                    y: (availableHeight / 2) + topDivHeight,  
                };

                const objectCenter = bounds.getCenterPoint();
                const screenCenter = fabric.util.transformPoint(objectCenter, canvas.viewportTransform);

                const dx = canvasCenter.x - screenCenter.x;
                const dy = canvasCenter.y - screenCenter.y;

                canvas.relativePan(new fabric.Point(dx, dy));
                canvas.requestRenderAll();
            }
            
            
            if (addToHistory) {
                saveHistory(canvas)
            } 
            onSelectTools("select");
        });

    }

 
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
 
    function saveHistory(canvas) { 
        if (!canvas) return
        const json = canvas.toJSON(['name',
            'objectLayoutType',
            'includeInHistory',
            'evented',
            'editable',
            'cropX',
            'cropY',
            'width',
            'height',
            'left',
            'top',
            'scaleX',
            'scaleY',
            'angle',
            'originX',
            'originY'
        ]);  
        json.objects = json.objects.filter(obj => obj.includeInHistory);
        canvasHistory.current?.push(json);
        debouncedSave()
    }
 
    function undo(canvas) {
        if (!canvas) return
        if (canvasHistory.current.length == 1) {
            const json = canvasHistory.current[0];
            canvas.loadFromJSON(json, () => {
                canvas.renderAll();
                canvas.setWidth(window.innerWidth);
                canvas.setHeight(window.innerHeight);
                fabricRef.current.getObjects().forEach(obj => {
                    if (obj.objectLayoutType === "layout-boundary") { 
                        obj.set({
                            selectable: true,
                            hasControls: false,
                            lockScalingX: true,
                            lockScalingY: true,
                            lockRotation: true,
                            lockMovementX: true,
                            lockMovementY: true,
                            excludeFromGroupSelection: true,
                        })
                    }
                });
            });
        } else if (canvasHistory.current.length > 1) {
            const json = canvasHistory.current.pop();
            canvas.loadFromJSON(json, () => {
                canvas.renderAll();
                canvas.setWidth(window.innerWidth);
                canvas.setHeight(window.innerHeight);
                fabricRef.current.getObjects().forEach(obj => {
                    if (obj.objectLayoutType === "layout-boundary") { 
                        obj.set({
                            selectable: true,
                            hasControls: false,
                            lockScalingX: true,
                            lockScalingY: true,
                            lockRotation: true,
                            lockMovementX: true,
                            lockMovementY: true,
                            excludeFromGroupSelection: true,
                        })
                    }
                });
            });
        } 
    }
     
    function redo(canvas) {
        if (!canvas) return 
    }
     
    // function updateDimensionLabel(e,canvas,obj = false) {
    //     let selection = canvas.getActiveObject();
    //     if (obj) {
    //         selection = obj;
    //     }
    //     if (!selection) return;
    //     const bounds = selection.getBoundingRect(true);
    //     const width = Math.round(bounds.width);
    //     const height = Math.round(bounds.height);
    //     const labelText = `${width} × ${height}`;
        
    //     const labelLeft = bounds.left + bounds.width / 2;
    //     const labelTop = bounds.top + bounds.height + 10;
      
    //     if (!dimensionLabel) {
    //       dimensionLabel = new fabric.Text(labelText, {
    //         left: labelLeft,
    //         top: labelTop,
    //         fontSize: 14,
    //         fill: 'black',
    //         originX: 'center',
    //         backgroundColor: 'rgba(255,255,255,0.7)',
    //         selectable: false,
    //         evented: false,
    //       });
    //       canvas.add(dimensionLabel);
    //     } else {
    //       dimensionLabel.set({
    //         left: labelLeft,
    //         top: labelTop,
    //         text: labelText,
    //       });
    //     }
      
    //     dimensionLabel.bringToFront();
    //     canvas.requestRenderAll();
    // }

    function updateDimensionLabel(e, canvas, obj = false) {
        if(!canvas?.backgroundColor) return
        let selection = canvas?.getActiveObject();
        if (obj) {
            selection = obj;
        }
        if (!selection) return;
        
        const bounds = selection.getBoundingRect(true);
        const width = Math.round(bounds.width);
        const height = Math.round(bounds.height);
        const labelText = `${width} × ${height}`;
        
        const centerPoint = selection.getCenterPoint();
        const angle = selection.angle || 0;
        
        const offsetDistance = (selection.height * selection.scaleY) / 2 + 30;
        
        const angleRad = (angle * Math.PI) / 180;
        
        const labelLeft = centerPoint.x + Math.sin(angleRad) * offsetDistance;
        const labelTop = centerPoint.y - Math.cos(angleRad) * offsetDistance;

        // Keep text readable by limiting rotation
        // Normalize angle to 0-360 range
        let textAngle = angle % 360;
        if (textAngle < 0) textAngle += 360;
        
        // If rotated beyond 90-270 degrees, flip text to keep it readable
        if (textAngle > 90 && textAngle < 270) {
            textAngle = textAngle + 180;
        }

        if (!dimensionLabel.current) {
            dimensionLabel.current = new fabric.Text(labelText, {
                left: labelLeft,
                top: labelTop,
                fontSize: 14,
                fill: 'black',
                originX: 'center',
                originY: 'center',
                backgroundColor: 'rgba(255,255,255,0.7)',
                padding: 4,
                selectable: false,
                evented: false,
                angle: textAngle,
                opacity: 1
            });
            canvas.add(dimensionLabel.current);
        } else {
            dimensionLabel.current.set({
                opacity: 1,
                left: labelLeft,
                top: labelTop,
                text: labelText,
                angle: textAngle, 
            });
        }

        dimensionLabel.current.bringToFront();
        canvas.requestRenderAll();
    }

    // function updateDimensionLabel(e, canvas, obj = false) {
    //     if(!canvas?.backgroundColor) return
    //     let selection = canvas?.getActiveObject();
    //     if (obj) {
    //         selection = obj;
    //     }
    //     if (!selection) return;
        
    //     const bounds = selection.getBoundingRect(true);
    //     const width = Math.round(bounds.width);
    //     const height = Math.round(bounds.height);
    //     const labelText = `${width} × ${height}`;
        
    //     const centerPoint = selection.getCenterPoint();
    //     const angle = selection.angle || 0;
        
    //     const offsetDistance = (selection.height * selection.scaleY) / 2 + 30;
        
    //     const angleRad = (angle * Math.PI) / 180;
        
    //     const labelLeft = centerPoint.x + Math.sin(angleRad) * offsetDistance;
    //     const labelTop = centerPoint.y - Math.cos(angleRad) * offsetDistance;
    
    //     if (!dimensionLabel) {
    //         dimensionLabel = new fabric.Text(labelText, {
    //             left: labelLeft,
    //             top: labelTop,
    //             fontSize: 14,
    //             fill: 'black',
    //             originX: 'center',
    //             originY: 'center',
    //             backgroundColor: 'rgba(255,255,255,0.7)',
    //             padding: 4,
    //             selectable: false,
    //             evented: false,
    //             angle: angle,
    //             opacity: 1
    //         });
    //         canvas.add(dimensionLabel);
    //     } else {
    //         dimensionLabel.set({
    //             opacity: 1,
    //             left: labelLeft,
    //             top: labelTop,
    //             text: labelText,
    //             angle: angle, 
    //         });
    //     }
    
    //     dimensionLabel.bringToFront();
    //     canvas.requestRenderAll();
    // }
       
    function showDistancesToNearestObjects(e, canvas) {
        if(!canvas) return
        const movingObj = e.target;
        clearDistanceLines(canvas);
      
        const movingBounds = movingObj.getBoundingRect(true);
        const objects = canvas.getObjects().filter(obj => obj !== movingObj);
      
        let closestLeft = null, closestRight = null, closestTop = null, closestBottom = null;
        let minLeftDist = Infinity, minRightDist = Infinity, minTopDist = Infinity, minBottomDist = Infinity;
      
        objects.forEach(obj => {
          const bounds = obj.getBoundingRect(true);
      
          const leftDist = Math.abs(movingBounds.left - (bounds.left + bounds.width));
          if (leftDist < minLeftDist) {
            minLeftDist = leftDist;
            closestLeft = bounds;
          }
      
          const rightDist = Math.abs(bounds.left - (movingBounds.left + movingBounds.width));
          if (rightDist < minRightDist) {
            minRightDist = rightDist;
            closestRight = bounds;
          }
      
          const topDist = Math.abs(movingBounds.top - (bounds.top + bounds.height));
          if (topDist < minTopDist) {
            minTopDist = topDist;
            closestTop = bounds;
          }
      
          const bottomDist = Math.abs(bounds.top - (movingBounds.top + movingBounds.height));
          if (bottomDist < minBottomDist) {
            minBottomDist = bottomDist;
            closestBottom = bounds;
          }
        });
      
        if (closestLeft && minLeftDist < 100) {
          drawDistanceLine(
            closestLeft.left + closestLeft.width,
            movingBounds.top + movingBounds.height / 2,
            movingBounds.left,
            movingBounds.top + movingBounds.height / 2,
            minLeftDist,canvas
          );
        }
      
        if (closestRight && minRightDist < 100) {
          drawDistanceLine(
            movingBounds.left + movingBounds.width,
            movingBounds.top + movingBounds.height / 2,
            closestRight.left,
            movingBounds.top + movingBounds.height / 2,
            minRightDist,canvas
          );
        }
      
        if (closestTop && minTopDist < 100) {
          drawDistanceLine(
            movingBounds.left + movingBounds.width / 2,
            closestTop.top + closestTop.height,
            movingBounds.left + movingBounds.width / 2,
            movingBounds.top,
            minTopDist,canvas
          );
        }
      
        if (closestBottom && minBottomDist < 100) {
          drawDistanceLine(
            movingBounds.left + movingBounds.width / 2,
            movingBounds.top + movingBounds.height,
            movingBounds.left + movingBounds.width / 2,
            closestBottom.top,
            minBottomDist,canvas
          );
        }
      
        canvas.requestRenderAll();
    }
       
    function drawDistanceLine(x1, y1, x2, y2, distance, canvas) {
        const line = new fabric.Line([x1, y1, x2, y2], {
          stroke: 'red',
          strokeWidth: 1,
          selectable: false,
          evented: false
        });
      
        const label = new fabric.Text(`${Math.round(distance)}px`, {
          left: (x1 + x2) / 2,
          top: (y1 + y2) / 2 - 10,
          fontSize: 12,
          fill: 'red',
          selectable: false,
          evented: false,
          originX: 'center',
          originY: 'center'
        });
      
        distanceLines.push(line, label);
        canvas.add(line, label);
    }
       
    function clearDistanceLines(canvas) {
        distanceLines.forEach(obj => canvas.remove(obj));
        distanceLines = [];
    }

    const moveSelectedObjects = (canvas, direction, step = 1) => {
        const activeObjects = canvas.getActiveObjects();
        if (!activeObjects.length) return;

        const boundary = canvas.getObjects().find(item => item?.objectLayoutType === 'layout-boundary');

        let boundLeft, boundTop, boundRight, boundBottom;
        if (boundary) {
            boundLeft = boundary.left;
            boundTop = boundary.top;
            boundRight = boundary.left + boundary.width * boundary.scaleX;
            boundBottom = boundary.top + boundary.height * boundary.scaleY;
        }

        activeObjects.forEach((obj) => {
            if (obj.objectLayoutType === "layout-boundary") return;

            switch (direction) {
            case 'left':
                obj.left -= step;
                break;
            case 'right':
                obj.left += step;
                break;
            case 'up':
                obj.top -= step;
                break;
            case 'down':
                obj.top += step;
                break;
            }

            if (obj.name === 'qrimage' && boundary) {
            const objWidth = obj.width * obj.scaleX;
            const objHeight = obj.height * obj.scaleY;

            if (obj.left < boundLeft) {
                obj.left = boundLeft;
            }
            if (obj.top < boundTop) {
                obj.top = boundTop;
            }
            if (obj.left + objWidth > boundRight) {
                obj.left = boundRight - objWidth;
            }
            if (obj.top + objHeight > boundBottom) {
                obj.top = boundBottom - objHeight;
            }
            }

            obj.setCoords();
        });

        canvas.discardActiveObject();
        if (activeObjects.length === 1) {
            canvas.setActiveObject(activeObjects[0]);
        } else {
            const selection = new fabric.ActiveSelection(activeObjects, { canvas });
            canvas.setActiveObject(selection);
        }

        saveHistory(canvas); 
        canvas.requestRenderAll();
    };

       
    const handleMiddleMouseClick = (event,canvas) => {
        if ((event.button === 1 || event.buttons === 4 ) && canvas) { 
            isPanning = true;
            lastPosX = event.clientX;
            lastPosY = event.clientY;
        }
    };
 
    const onSelectTools = (item, type = false) => {
        if(!fabricRef.current) return
        setTools(item) 
        resetAllvalues()
        fabricRef.current.getObjects().map((obj) => {
            if (obj.name == "drawing line" ||  obj.name == "drawing triangle") {
                fabricRef.current.remove(obj)
            }
        }) 

        if (item == "draw" && !type) {
            setShowSubMenu("sub-tools")
        }else if (item == "text" && type) {
            setShowSubMenu("textControls")
        } else {
            setShowSubMenu(type)
        }

        if (item == "select" || item == "color" || item == "borderColor" || item == "borderThick" || item == "transparancy" || item == "layers") {
            fabricRef.current.getObjects().forEach(obj => {
                    
                if (obj.includeInHistory !== false) {
                    obj.set({
                        selectable : true
                    })
                    obj.controls.mtr = customRotateControl;
                }

                if (obj.objectLayoutType === "layout-boundary") { 
                    obj.set({
                        selectable: true,
                        hasControls: false,
                        lockScalingX: true,
                        lockScalingY: true,
                        lockRotation: true,
                        lockMovementX: true,
                        lockMovementY: true,
                        excludeFromGroupSelection: true,
                    })
                }
            });
            fabricRef.current.selection = true;
        } else  if (item == "text") {
            fabricRef.current.getObjects().forEach(obj => {
                if (obj.includeInHistory !== false && (obj?.type == "i-text" || obj?.type === 'textbox')) {
                    obj.set({
                        selectable: true,
                    })
                }
            }); 

            if (!type ) {
                const canvas = fabricRef.current;
                const viewportCenter = canvas.getVpCenter();
                const tagX = Math.round(viewportCenter.x / 50) * 50; 
                const tagY = Math.round(viewportCenter.y / 50) * 50;
                const viewportTag = `${tagX}_${tagY}`;
                const startX = viewportCenter.x;
                const startY = viewportCenter.y;
                
                
                const existingObj = canvas.getObjects().find(obj => obj.viewportTag === viewportTag);

                const text = new fabric.Textbox("Type here", {
                    left: startX,
                    top: startY,
                    fontFamily: 'Roboto',
                    fontSize: 14,
                    lineHeight: 1.2,
                    fill: '#000',
                    editable: true,
                    viewportTag,
                    includeInHistory:true

                });

                if (existingObj) {
                    const existingBottomY = existingObj.top + (existingObj.height * existingObj.scaleY || 0);
                    text.top = existingBottomY + 1;
                    delete existingObj.viewportTag;
                }

                canvas.add(text).setActiveObject(text);
                canvas.renderAll();
            }  

            fabricRef.current.selection = true;
        } else {
            fabricRef.current.getObjects().forEach(obj => {
                if (obj.includeInHistory !== false) {
                    obj.set({
                        selectable : false
                    })
                }
            });
            fabricRef.current.selection = false;
            fabricRef.current.discardActiveObject(); 
        }

        fabricRef.current.requestRenderAll();
    }
 
    function applyTextStyleToSelection(property, toggleValue, defaultValue) {
        const active = fabricRef.current.getActiveObject();
        if (!active) return;
      
        const applyTo = (obj) => {
          if (obj.type === 'i-text' || obj.type === 'textbox') {
            const selectionStart = obj.selectionStart;
            const selectionEnd = obj.selectionEnd;
      
            const isFullySelected = selectionStart === 0 && selectionEnd === obj.text.length;
      
            if (isFullySelected || selectionStart === selectionEnd) { 
              const current = obj.get(property);
                obj.set(property, current === toggleValue ? defaultValue : toggleValue);
                setTextStyles((prev) => ({
                    ...prev,
                    fontStyle: current === toggleValue ? defaultValue : toggleValue
                }))
            } else { 
              const styles = obj.getSelectionStyles(selectionStart, selectionEnd);
              const shouldToggleOn = !styles.every(style => style[property] === toggleValue);
      
              for (let i = selectionStart; i < selectionEnd; i++) {
                obj.setSelectionStyles({
                  [property]: shouldToggleOn ? toggleValue : defaultValue
                }, i, i + 1);
              }
            }
          }
        };
      
        if (active.type === 'i-text' || active.type === 'textbox') {
          applyTo(active);
        } else if (active.type === 'activeSelection' || active.type === 'group') {
          active.getObjects().forEach(applyTo);
        }
      
        saveHistory(fabricRef.current)
        fabricRef.current.requestRenderAll();
    }
 
    function addLinkToText() {
        const active = fabricRef.current.getActiveObject();
        if (!active) return;
      
        const applyLink = (obj) => {
          if (obj.type !== 'i-text' && obj.type !== 'textbox') return;
      
          const selectionStart = obj.selectionStart;
          const selectionEnd = obj.selectionEnd;
      
          const isFullSelection = selectionStart === 0 && selectionEnd === obj.text.length;
          const isNoSelection = selectionStart === selectionEnd;
      
          const existingLink = obj.data?.link || "";
      
          const url = prompt(
            existingLink
              ? `Current link: ${existingLink}\nEnter a new URL, or leave empty to remove the link:`
              : 'Enter the URL:'
          );
      
          if (!url) { 
            if (isNoSelection || isFullSelection) {
              obj.set({
                underline: false,
                fill: 'black',
              });
              if (obj.data) delete obj.data.link;
              obj.off('mousedown');
            } else { 
              for (let i = selectionStart; i < selectionEnd; i++) {
                obj.setSelectionStyles({
                  underline: false,
                  fill: 'black',
                  link: undefined,
                }, i, i + 1);
              }
            }
          } else {
            if (isNoSelection || isFullSelection) { 
              obj.set({
                underline: true,
                fill: 'blue',
                data: { ...(obj.data || {}), link: url }
              });
            } else { 
              for (let i = selectionStart; i < selectionEnd; i++) {
                obj.setSelectionStyles({
                  underline: true,
                  fill: 'blue',
                  link: url
                }, i, i + 1);
              }
            }
       
            obj.off('mousedown');
            obj.on('mousedown', function (e) {
              const pointer = fabricRef.current.getPointer(e.e);
              const index = obj.getSelectionStartFromPointer(pointer);
              const style = obj.getStyleAtPosition(index);
      
              if (style && style.link) {
                const confirmed = confirm(`Do you want to open this link?\n${style.link}`);
                if (confirmed) {
                  window.open(style.link, '_blank');  
                }
              } else if (obj.data?.link) { 
                const confirmed = confirm(`Do you want to open this link?\n${obj.data.link}`);
                    if (confirmed) {
                        window.open(obj.data.link, '_blank');
                    } 
                }
            });
          }
        };
      
        if (active.type === 'i-text' || active.type === 'textbox') {
          applyLink(active);
        } else if (active.type === 'activeSelection' || active.type === 'group') {
          active.getObjects().forEach(applyLink);
        }
      
        fabricRef.current.requestRenderAll();
    }
     
    const ChangeFontSize = (e, type = false) => {
        const canvas = fabricRef.current;
        const active = canvas.getActiveObject();
        let newSize;
    
        if (type === 'plus') {
            newSize = textStyles.fontSize + 1;
        } else if (type === 'minus') {
            newSize = textStyles.fontSize - 1;
        } else {
            newSize = parseInt(e.target.value, 10);
        }
    
        if (newSize < 0) return;
    
        const applyFontSize = (obj) => {
            if (obj.type === 'i-text' || obj.type === 'textbox') {
                obj.set('fontSize', newSize);
                setTextStyles((prev) => ({
                    ...prev,
                    fontSize: newSize
                }));
            }
        };
    
        const traverseAndApply = (object) => {
            if (object.type === 'group' || object.type === 'activeSelection') {
                object.getObjects().forEach(traverseAndApply);
            } else {
                applyFontSize(object);
            }
        };
    
        if (active) {
            traverseAndApply(active);
            saveHistory(canvas)
            canvas.requestRenderAll();
        }
    };
     
    const changeLineHeight = (e) => {
        const canvas = fabricRef.current;
        const active = canvas.getActiveObject();
        const newSize = parseFloat(e.target.value); 
    
        if (newSize < 0) return;
    
        const applyLineHeight = (obj) => {
            if (obj.type === 'i-text' || obj.type === 'textbox') {
                obj.set('lineHeight', newSize);
                setTextStyles((prev) => ({
                    ...prev,
                    lineHeight: newSize
                }));
            }
        };
    
        const traverseAndApply = (object) => {
            if (object.type === 'group' || object.type === 'activeSelection') {
                object.getObjects().forEach(traverseAndApply);
            } else {
                applyLineHeight(object);
            }
        };
    
        if (active) {
            traverseAndApply(active);
            saveHistory(canvas)
            canvas.requestRenderAll();
        }
    };
 
    const ChangeFontFamily = (e) => {
        const canvas = fabricRef.current;
        const selectedFont = e.value;
        const active = canvas.getActiveObject();
    
        const applyFontFamily = (obj) => {
            if (obj.type === 'i-text' || obj.type === 'textbox') {
                obj.set('fontFamily', selectedFont);
                setTextStyles((prev) => ({
                    ...prev,
                    fontFamily: selectedFont
                }));
            }
        };
    
        const traverseAndApply = (object) => {
            if (object.type === 'group' || object.type === 'activeSelection') {
                object.getObjects().forEach(traverseAndApply);
            } else {
                applyFontFamily(object);
            }
        };
    
        if (active) {
            traverseAndApply(active);
            saveHistory(canvas)
            canvas.requestRenderAll();
        }
    };
     
    const ChangeTextAlignment = (value) => {
        const canvas = fabricRef.current;
        const selectedAlign = value;
        const active = canvas.getActiveObject();
    
        const applyTextAlign = (obj) => {
            if (obj.type === 'i-text' || obj.type === 'textbox') {
                obj.set('textAlign', selectedAlign);
                setTextStyles((prev) => ({
                    ...prev,
                    textAlign: selectedAlign
                }));
            }
        };
    
        const traverseAndApply = (object) => {
            if (object.type === 'group' || object.type === 'activeSelection') {
                object.getObjects().forEach(traverseAndApply);
            } else {
                applyTextAlign(object);
            }
        };
    
        if (active) {
            traverseAndApply(active);
            saveHistory(canvas)
            canvas.requestRenderAll();
        }
    };
     
    const applyTextTransform = (transformType) => {
        const canvas = fabricRef.current;
        const active = canvas.getActiveObject();
    
        const transformText = (obj) => {
            if (obj.type === 'i-text' || obj.type === 'textbox') {
                let text = obj.text;
                switch (transformType) {
                    case 'capitalize':
                        text = text
                            .split(' ')
                            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                            .join(' ');
                        break;
                    case 'uppercase':
                        text = text.toUpperCase();
                        break;
                    case 'lowercase':
                        text = text.toLowerCase();
                        break;
                    case 'mixed':
                        text = text.toLowerCase();
                        break;
                }
                obj.set('text', text);
            }
        };
    
        const traverseAndTransform = (object) => {
            if (object.type === 'group' || object.type === 'activeSelection') {
                object.getObjects().forEach(traverseAndTransform);
            } else {
                transformText(object);
            }
        };
    
        if (!active) return;
    
        traverseAndTransform(active);
    
        setTextStyles((prev) => ({
            ...prev,
            textTransform: transformType
        }));
    
        saveHistory(canvas)
        canvas.requestRenderAll();
    };
     
    const onSelectSubTools = (item) => {
        if (!fabricRef.current) return;
        setSubTools(item);

        const canvas = fabricRef.current;
        const viewportCenter = canvas.getVpCenter();
        const tagX = Math.round(viewportCenter.x / 50) * 50; 
        const tagY = Math.round(viewportCenter.y / 50) * 50;
        const viewportTag = `${tagX}_${tagY}`;
        const startX = viewportCenter.x;
        const startY = viewportCenter.y;
        const endX = viewportCenter.x + 200;
        const endY = viewportCenter.y;

        let currentShape;
        const existingObj = canvas.getObjects().find(obj => obj.viewportTag === viewportTag);

        if (item.includes('draw')) {
            if (item === 'draw1') {
                currentShape = new fabric.Rect({
                    left: startX,
                    top: startY,
                    width: 100,
                    height: 100,
                    fill: 'rgba(100,100,100,0.5)',
                    originX: 'left',
                    originY: 'top',
                    selectable: false,
                    hasControls: false,
                    hasBorders: false,
                    lockMovementX: true,
                    lockMovementY: true,
                    viewportTag,
                    includeInHistory:true
    
                });
            } else if (item === 'draw2') {
                currentShape = new fabric.Rect({
                    left: startX,
                    top: startY,
                    width: 100,
                    height: 100,
                    fill: 'rgba(100,100,100,0.5)',
                    originX: 'left',
                    originY: 'top',
                    selectable: false,
                    hasControls: false,
                    hasBorders: false,
                    lockMovementX: true,
                    lockMovementY: true,
                    viewportTag,
                    rx: 20,
                    ry: 20,
                    includeInHistory:true
                });
            } else if (item === 'draw3') {
                currentShape = new fabric.Circle({
                    left: startX + 50,
                    top: startY + 200,
                    radius: 50,
                    fill: 'rgba(100,100,100,0.5)',
                    originX: 'center',
                    originY: 'center',
                    selectable: false,
                    hasControls: false,
                    hasBorders: false,
                    lockMovementX: true,
                    lockMovementY: true,
                    viewportTag,
                    includeInHistory:true
                })
            } else if (item === 'draw4') {
                currentShape = new fabric.Triangle({
                    left: startX,
                    top: startY,
                    width: 100,
                    height: 100,
                    fill: 'rgba(100,100,100,0.5)',
                    originX: 'left',
                    originY: 'top',
                    selectable: false,
                    hasControls: false,
                    hasBorders: false,
                    lockMovementX: true,
                    lockMovementY: true,
                    viewportTag,
                    includeInHistory:true
                });                          
            } else if (item === 'draw5') {
                currentShape = new fabric.Polygon([
                    { x: 0, y: 0 },  
                    { x: 100, y: 0 },        
                    { x: 50, y: 100 } 
                    ], {
                    left: startX,
                    top: startY,
                    fill: 'rgba(100,100,100,0.5)',
                    originX: 'left',
                    originY: 'top',
                    selectable: false,
                    hasControls: false,
                    hasBorders: false,
                    lockMovementX: true,
                    lockMovementY: true,
                    viewportTag,
                    includeInHistory:true
                });           
            } else if (item === 'draw6') {
                currentShape = new fabric.Polygon([
                    { x: 50, y: 0 },
                    { x: 100, y: 50 },
                    { x: 50, y: 100 },
                    { x: 0, y: 50 }
                ], {
                    left: startX,
                    top: startY,
                    fill: 'rgba(100,100,100,0.5)',
                    selectable: false,
                    hasControls: false,
                    hasBorders: false, 
                    lockMovementX: true,
                    lockMovementY: true,
                    includeInHistory:true
                });                          
            } else if (item === 'draw7') {
                const pentagonPoints = [...Array(5)].map((_, i) => {
                    const angle = (i * 72 - 90) * (Math.PI / 180);
                    return {
                        x: 50 + 40 * Math.cos(angle),
                        y: 50 + 40 * Math.sin(angle)
                    };
                    });
                    currentShape = new fabric.Polygon(pentagonPoints, {
                        left: startX,
                        top: startY,
                        fill: 'rgba(100,100,100,0.5)',
                        originX: 'left',
                        originY: 'top',
                        selectable: false,
                        hasControls: false,
                        hasBorders: false,
                        lockMovementX: true,
                        lockMovementY: true,
                        viewportTag,
                        includeInHistory:true
                    });
                    
            } else if (item === 'draw8') {
                const hexagonPoints = [...Array(6)].map((_, i) => {
                    const angle = (i * 60 - 30) * (Math.PI / 180);
                    return {
                        x: 50 + 40 * Math.cos(angle),
                        y: 50 + 40 * Math.sin(angle)
                    };
                    });
                    currentShape = new fabric.Polygon(hexagonPoints, {
                        left: startX,
                        top: startY,
                        fill: 'rgba(100,100,100,0.5)',
                        originX: 'left',
                        originY: 'top',
                        selectable: false,
                        hasControls: false,
                        hasBorders: false,
                        lockMovementX: true,
                        lockMovementY: true,
                        viewportTag,
                        includeInHistory:true
                    });
            } else if (item === 'draw9') {
                const octagonPoints = [...Array(8)].map((_, i) => {
                    const angle = (i * 45 + 22.5) * (Math.PI / 180);
                    return {
                        x: 50 + 40 * Math.cos(angle),
                        y: 50 + 40 * Math.sin(angle)
                    };
                    });
                    currentShape = new fabric.Polygon(octagonPoints, {
                        left: startX,
                        top: startY,
                        fill: 'rgba(100,100,100,0.5)',
                        originX: 'left',
                        originY: 'top',
                        selectable: false,
                        hasControls: false,
                        hasBorders: false,
                        lockMovementX: true,
                        lockMovementY: true,
                        viewportTag,
                        includeInHistory:true
                });
            }else if (item === 'draw10') {
                const heptagonPoints = [...Array(7)].map((_, i) => {
                    const angle = (i * (360 / 7) - 90) * (Math.PI / 180);
                    return {
                        x: 50 + 40 * Math.cos(angle),
                        y: 50 + 40 * Math.sin(angle)
                    };
                    });
                    
                    currentShape = new fabric.Polygon(heptagonPoints, {
                        left: startX,
                        top: startY,
                        fill: 'rgba(100,100,100,0.5)',
                        originX: 'left',
                        originY: 'top',
                        selectable: false,
                        hasControls: false,
                        hasBorders: false,
                        lockMovementX: true,
                        lockMovementY: true,
                        viewportTag,
                        includeInHistory:true
                    });
                    
            }else if (item === 'draw11') {
                const star5Points = [...Array(10)].map((_, i) => {
                    const angle = (i * 36 - 90) * (Math.PI / 180);
                    const radius = i % 2 === 0 ? 40 : 20;
                    return {
                        x: 50 + radius * Math.cos(angle),
                        y: 50 + radius * Math.sin(angle)
                    };
                    });
                    currentShape = new fabric.Polygon(star5Points, {
                        left: startX,
                        top: startY,
                        fill: 'rgba(100,100,100,0.5)',
                        originX: 'left',
                        originY: 'top',
                        selectable: false,
                        hasControls: false,
                        hasBorders: false,
                        lockMovementX: true,
                        lockMovementY: true,
                        viewportTag,
                        includeInHistory:true
                    });
                    
            }else if (item === 'draw12') {
                const points4 = [...Array(8)].map((_, i) => {
                    const angle = i * (Math.PI / 4); 
                    const radius = i % 2 === 0 ? 40 : 15;
                    return {
                        x: 50 + radius * Math.cos(angle),
                        y: 50 + radius * Math.sin(angle)
                    };
                    });
                    currentShape = new fabric.Polygon(points4, {
                        left: startX,
                        top: startY,
                        fill: 'rgba(100,100,100,0.5)',
                        originX: 'left',
                        originY: 'top',
                        selectable: false,
                        hasControls: false,
                        hasBorders: false,
                        lockMovementX: true,
                        lockMovementY: true,
                        viewportTag,
                        includeInHistory:true
                    });                              
                    
            }else if (item === 'draw13') {
                const points6 = [...Array(12)].map((_, i) => {
                    const angle = i * (Math.PI / 6); 
                    const radius = i % 2 === 0 ? 40 : 25;
                    return {
                        x: 50 + radius * Math.cos(angle),
                        y: 50 + radius * Math.sin(angle)
                    };
                    });
                    currentShape = new fabric.Polygon(points6, {
                        left: startX,
                        top: startY,
                        fill: 'rgba(100,100,100,0.5)',
                        originX: 'left',
                        originY: 'top',
                        selectable: false,
                        hasControls: false,
                        hasBorders: false,
                        lockMovementX: true,
                        lockMovementY: true,
                        viewportTag,
                        includeInHistory:true
                    });                              
            }else if (item === 'draw14') {
                const points8 = [...Array(16)].map((_, i) => {
                    const angle = i * (Math.PI / 8);
                    const radius = i % 2 === 0 ? 40 : 30;
                    return {
                        x: 50 + radius * Math.cos(angle),
                        y: 50 + radius * Math.sin(angle)
                    };
                    });
                    currentShape = new fabric.Polygon(points8, {
                        left: startX,
                        top: startY,
                        fill: 'rgba(100,100,100,0.5)',
                        originX: 'left',
                        originY: 'top',
                        selectable: false,
                        hasControls: false,
                        hasBorders: false,
                        lockMovementX: true,
                        lockMovementY: true,
                        viewportTag,
                        includeInHistory:true
                    });
                        
            }else if (item === 'draw15') {
                const points10 = [...Array(20)].map((_, i) => {
                    const angle = i * (Math.PI / 10); 
                    const radius = i % 2 === 0 ? 40 : 31;
                    return {
                        x: 50 + radius * Math.cos(angle),
                        y: 50 + radius * Math.sin(angle)
                    };
                    });
                    currentShape = new fabric.Polygon(points10, {
                        left: startX,
                        top: startY,
                        fill: 'rgba(100,100,100,0.5)',
                        originX: 'left',
                        originY: 'top',
                        selectable: false,
                        hasControls: false,
                        hasBorders: false,
                        lockMovementX: true,
                        lockMovementY: true,
                        viewportTag,
                        includeInHistory:true
                    });
                    
            }else if (item === 'draw16') {
                currentShape = new fabric.Polygon([
                    { x: 10, y: 0 },
                    { x: 90, y: 0 },
                    { x: 110, y: 100 },
                    { x: 30, y: 100 }
                    ], {
                        left: startX,
                        top: startY,
                        fill: 'rgba(100,100,100,0.5)',
                        selectable: false,
                        hasControls: false,
                        hasBorders: false,
                        lockMovementX: true,
                        lockMovementY: true,
                        viewportTag,
                        includeInHistory:true
                    });
                    
            }else if (item === 'draw17') {
                currentShape = new fabric.Polygon([
                    { x: 20, y: 0 },
                    { x: 80, y: 0 },
                    { x: 90, y: 100 },
                    { x: 10, y: 100 }
                    ], {
                        left: startX,
                        top: startY,
                        fill: 'rgba(100,100,100,0.5)',
                        selectable: false,
                        hasControls: false,
                        hasBorders: false,
                        lockMovementX: true,
                        lockMovementY: true,
                        viewportTag,
                        includeInHistory:true
                    });
                    
            }else if (item === 'draw18') {
                currentShape = new fabric.Polygon([
                    { x: 0, y: 0 },
                    { x: 90, y: 0 },
                    { x: 70, y: 100 },
                    { x: 20, y: 100 }
                    ], {
                        left: startX,
                        top: startY,
                        fill: 'rgba(100,100,100,0.5)',
                        selectable: false,
                        hasControls: false,
                        hasBorders: false,
                        lockMovementX: true,
                        lockMovementY: true,
                        viewportTag,
                        includeInHistory:true
                    });
            }else if (item === 'draw19') {
                const baseRect = new fabric.Rect({
                        width: 80,
                        height: 60,
                        left: 0,
                        top: 0, 
                        fill: 'rgba(100,100,100,1)',
                        originX: 'left',
                        originY: 'top',
                        includeInHistory:true
                    });
                    
                    const halfCircle = new fabric.Circle({
                        radius: 40,
                        startAngle: Math.PI,
                        endAngle: 0,
                        left: 0,
                        top: 20,
                        fill: 'rgba(100,100,100,1)',
                        originX: 'left',
                        originY: 'top',
                        includeInHistory:true
                    });
                    
                    currentShape = new fabric.Group([baseRect, halfCircle], {
                        left: startX,
                        top: startY,
                        selectable: false,
                        hasControls: false,
                        hasBorders: false,
                        lockMovementX: true,
                        lockMovementY: true,
                        viewportTag,
                        includeInHistory:true
                    });
                    
            }else if (item === 'draw20') {
                const baseRect = new fabric.Rect({
                    width: 80,
                    height: 60,
                    left: 0,
                    top: 40,
                    fill: 'rgba(100,100,100,1)',
                    originX: 'left',
                    originY: 'top'
                    });
                    
                    const halfCircle = new fabric.Circle({
                    radius: 40,
                    startAngle: Math.PI,
                    endAngle: 0,
                    left: 0,
                    top: 0,
                    fill: 'rgba(100,100,100,1)',
                    originX: 'left',
                    originY: 'top'
                    });
                    
                    currentShape = new fabric.Group([halfCircle, baseRect], {
                        left: startX,
                        top: startY,
                        selectable: false,
                        hasControls: false,
                        hasBorders: false,
                        lockMovementX: true,
                        lockMovementY: true,
                        viewportTag,
                        includeInHistory:true
                    });
                    
            }else if (item === 'draw21') {
                currentShape = new fabric.Polygon([
                    { x: 0, y: 20 },
                    { x: 30, y: 0 },
                    { x: 30, y: 15 },
                    { x: 60, y: 15 },
                    { x: 60, y: 25 },
                    { x: 30, y: 25 },
                    { x: 30, y: 40 },
                    ], {
                    fill: 'rgba(100,100,100,0.5)',
                        left: startX,
                        top: startY,
                        selectable: false,
                        hasControls: false,
                        hasBorders: false,
                        lockMovementX: true,
                        lockMovementY: true,
                        viewportTag,
                        includeInHistory:true
                    });
                    
            }else if (item === 'draw22') {
                currentShape = new fabric.Polygon([
                    { x: 0, y: 15 },
                    { x: 30, y: 15 },
                    { x: 30, y: 0 },
                    { x: 60, y: 20 },
                    { x: 30, y: 40 },
                    { x: 30, y: 25 },
                    { x: 0, y: 25 },
                    ], {
                    fill: 'rgba(100,100,100,0.5)',
                        left: startX,
                        top: startY,
                        selectable: false,
                        hasControls: false,
                        hasBorders: false,
                        lockMovementX: true,
                        lockMovementY: true,
                        viewportTag,
                        includeInHistory:true
                    });
                    
            }else if (item === 'draw23') {
                currentShape = new fabric.Polygon([
                    { x: 30, y: 0 },
                    { x: 0, y: 30 },
                    { x: 20, y: 30 },
                    { x: 20, y: 60 },
                    { x: 40, y: 60 },
                    { x: 40, y: 30 },
                    { x: 60, y: 30 },
                    ], {
                    fill: 'rgba(100,100,100,0.5)',
                        left: startX,
                        top: startY,
                        selectable: false,
                        hasControls: false,
                        hasBorders: false,
                        lockMovementX: true,
                        lockMovementY: true,
                        viewportTag,
                        includeInHistory:true
                    });
                    
            }else if (item === 'draw24') {
                currentShape = new fabric.Polygon([
                    { x: 20, y: 0 },
                    { x: 20, y: 30 },
                    { x: 0, y: 30 },
                    { x: 30, y: 60 },
                    { x: 60, y: 30 },
                    { x: 40, y: 30 },
                    { x: 40, y: 0 },
                    ], {
                        fill: 'rgba(100,100,100,1)',
                        left: startX,
                        top: startY,
                        selectable: false,
                        hasControls: false,
                        hasBorders: false,
                        lockMovementX: true,
                        lockMovementY: true,
                        viewportTag,
                        includeInHistory:true
                    });
                    
            }else if (item === 'draw25') {
                currentShape = new fabric.Polygon([
                    { x: 0, y: 20 },
                    { x: 20, y: 0 },
                    { x: 20, y: 15 },
                    { x: 40, y: 15 },
                    { x: 40, y: 0 },
                    { x: 60, y: 20 },
                    { x: 40, y: 40 },
                    { x: 40, y: 25 },
                    { x: 20, y: 25 },
                    { x: 20, y: 40 },
                    ], {
                        fill: 'rgba(100,100,100,1)',
                        left: startX,
                        top: startY,
                        selectable: false,
                        hasControls: false,
                        hasBorders: false,
                        lockMovementX: true,
                        lockMovementY: true,
                        viewportTag,
                        includeInHistory:true
                    });
                    
            }

            if (currentShape) {
                currentShape.set({
                    selectable: true,
                    hasControls: true,
                    hasBorders: true,
                    lockMovementX: false,
                    lockMovementY: false,
                    includeInHistory:true
                });

                applyDefaultStyles(currentShape,selectedTextStyles.current)
                
                if (existingObj) {
                    const existingBottomY = existingObj.top + (existingObj.height * existingObj.scaleY || 0);
                    currentShape.top = existingBottomY + 1;
                    delete existingObj.viewportTag;
                }
                canvas.add(currentShape);
                canvas.requestRenderAll();
                setTimeout(() => {
                    canvas.setActiveObject(currentShape);
                    saveHistory(canvas)
                    canvas.requestRenderAll();
                }, 0);
            }
        } else if (item.includes('line')) {
            const commonProps = {
                selectable: false,
                hasControls: false,
                hasBorders: false,
                lockMovementX: true,
                lockMovementY: true,
                viewportTag,
                includeInHistory: true,
            };
            
            if (item === 'line4') {
                const line = new fabric.Line([startX, startY, endX, endY], {
                    stroke: 'black',
                    strokeWidth: 2,
                    selectable: false,
                    hasControls: false,
                    hasBorders: false,
                    lockMovementX: true,
                    lockMovementY: true,
                    viewportTag,
                    includeInHistory: true,
                }); 

                const arrowHead = new fabric.Path('M 0 0 L 10 7.5 L 0 15', {
                    left: endX,
                    top: endY, 
                     stroke: 'black',
                    fill:'',
                    strokeWidth: 2,
                    originX: 'center',
                    originY: 'center',
                    angle: 0,
                    selectable: false,
                    evented: false,
                    name:"drawing triangle"
                });

                currentShape = new fabric.Group([line, arrowHead], {
                    selectable: false,
                    hasControls: false,
                    hasBorders: false,
                    lockMovementX: true,
                    lockMovementY: true,
                    viewportTag,
                    includeInHistory: true,
                });
            }else if (item === 'line5') {
                const line = new fabric.Line([startX, startY, endX, endY], {
                    stroke: 'black',
                    strokeWidth: 2,
                    strokeDashArray: [4, 4],
                    ...commonProps
                });

                const arrowHead = new fabric.Path('M 0 0 L 10 7.5 L 0 15', {
                    left: endX,
                    top: endY, 
                     stroke: 'black',
                    fill:'',
                    strokeWidth: 2,
                    originX: 'center',
                    originY: 'center',
                    angle: 0,
                    selectable: false,
                    evented: false,
                    name:"drawing triangle"
                });

                currentShape = new fabric.Group([line, arrowHead], { ...commonProps });
            }else if (item === 'line6') {
                const line = new fabric.Line([startX, startY, endX, endY], {
                    stroke: 'black',
                    strokeWidth: 2,
                    strokeDashArray: [12, 6],
                    ...commonProps
                });

                const arrowHead = new fabric.Path('M 0 0 L 10 7.5 L 0 15', {
                    left: endX,
                    top: endY, 
                     stroke: 'black',
                    fill:'',
                    strokeWidth: 2,
                    originX: 'center',
                    originY: 'center',
                    angle: 0,
                    selectable: false,
                    evented: false,
                    name:"drawing triangle"
                });

                currentShape = new fabric.Group([line, arrowHead], { ...commonProps });
            }else if (item === 'line7') {
                const line = new fabric.Line([endX, endY, startX, startY], {
                    stroke: 'black',
                    strokeWidth: 2,
                    ...commonProps
                });

                const leftHead = new fabric.Path('M 0 0 L 10 7.5 L 0 15', {
                    left: startX,
                    top: startY, 
                     stroke: 'black',
                    fill:'',
                    strokeWidth: 2,
                    originX: 'center',
                    originY: 'center',
                    angle: -180,
                    selectable: false,
                    evented: false,
                    name:"drawing triangle"
                });
                const rightHead = new fabric.Path('M 0 0 L 10 7.5 L 0 15', {
                    left: endX,
                    top: endY, 
                     stroke: 'black',
                    fill:'',
                    strokeWidth: 2,
                    originX: 'center',
                    originY: 'center',
                    angle: 0,
                    selectable: false,
                    evented: false,
                    name:"drawing triangle"
                });

                currentShape = new fabric.Group([line, leftHead, rightHead], { ...commonProps });
            }else if (item === 'line8') {
                const line = new fabric.Line([startX, startY, endX, endY], {
                    stroke: 'black',
                    strokeWidth: 2,
                    strokeDashArray: [4, 4],
                    ...commonProps
                });

                const leftHead = new fabric.Path('M 0 0 L 10 7.5 L 0 15', {
                    left: startX,
                    top: startY, 
                     stroke: 'black',
                    fill:'',
                    strokeWidth: 2,
                    originX: 'center',
                    originY: 'center',
                    angle: -180,
                    selectable: false,
                    evented: false,
                    name:"drawing triangle"
                });
                const rightHead = new fabric.Path('M 0 0 L 10 7.5 L 0 15', {
                    left: endX,
                    top: endY, 
                     stroke: 'black',
                    fill:'',
                    strokeWidth: 2,
                    originX: 'center',
                    originY: 'center',
                    angle: 0,
                    selectable: false,
                    evented: false,
                    name:"drawing triangle"
                });

                currentShape = new fabric.Group([line, leftHead, rightHead], { ...commonProps });
            }else if (item === 'line9') {
                const line = new fabric.Line([startX, startY, endX, endY], {
                    stroke: 'black',
                    strokeWidth: 2,
                    strokeDashArray: [12, 6],
                    ...commonProps
                });

                const leftHead = new fabric.Path('M 0 0 L 10 7.5 L 0 15', {
                    left: startX,
                    top: startY, 
                     stroke: 'black',
                    fill:'',
                    strokeWidth: 2,
                    originX: 'center',
                    originY: 'center',
                    angle: -180,
                    selectable: false,
                    evented: false,
                    name:"drawing triangle"
                });
                const rightHead = new fabric.Path('M 0 0 L 10 7.5 L 0 15', {
                    left: endX,
                    top: endY, 
                     stroke: 'black',
                    fill:'',
                    strokeWidth: 2,
                    originX: 'center',
                    originY: 'center',
                    angle: 0,
                    selectable: false,
                    evented: false,
                    name:"drawing triangle"
                });

                currentShape = new fabric.Group([line, leftHead, rightHead], { ...commonProps });
            }else if (item === 'line10') {
                const line = new fabric.Line([startX, startY, endX, endY], {
                    stroke: 'black',
                    strokeWidth: 2,
                    ...commonProps
                });

                const solidArrow = new fabric.Triangle({
                    left: endX,
                    top: endY,
                    angle: 90,
                    width: 12,
                    height: 16,
                    fill: 'black',
                    originX: 'center',
                    originY: 'center',
                });

                currentShape = new fabric.Group([line, solidArrow], { ...commonProps });
            }else if (item === 'line11') {
                
                const line = new fabric.Line([startX, startY, endX, endY], {
                    stroke: 'black',
                    strokeWidth: 2,
                    ...commonProps
                });

                const diamond = new fabric.Polygon([
                    { x: 0, y: -6 },
                    { x: 6, y: 0 },
                    { x: 0, y: 6 },
                    { x: -6, y: 0 },
                ], {
                    left: endX,
                    top: endY,
                    angle: 90,
                    fill: 'black',
                    originX: 'center',
                    originY: 'center',
                });

                currentShape = new fabric.Group([line, diamond], { ...commonProps });
            }else if (item === 'line12') {
                const line = new fabric.Line([startX, startY, endX, endY], {
                    stroke: 'black',
                    strokeWidth: 2,
                    ...commonProps
                });

                const circle = new fabric.Circle({
                    radius: 5,
                    fill: 'black',
                    left: endX,
                    top: endY,
                    originX: 'center',
                    originY: 'center',
                });

                currentShape = new fabric.Group([line, circle], { ...commonProps });
            }

            

            if (currentShape) {
                currentShape.set({
                    selectable: true,
                    hasControls: true,
                    hasBorders: true,
                    lockMovementX: false,
                    lockMovementY: false,
                    includeInHistory: true,
                    name:"generatedObject"
                });
 
                if (existingObj) {
                    const existingBottomY = existingObj.top + (existingObj.height * existingObj.scaleY || 0);
                    currentShape.top = existingBottomY + 1;
                    delete existingObj.viewportTag;
                }
                canvas.add(currentShape);
                canvas.requestRenderAll();
                setTimeout(() => {
                    canvas.setActiveObject(currentShape);
                    saveHistory(canvas)
                    canvas.requestRenderAll();
                }, 0);
            }
        }

 
    }
  
    function createPolygon(sides, radius) {
        const angle = Math.PI * 2 / sides;
        const points = [];
      
        for (let i = 0; i < sides; i++) {
          points.push({
            x: radius * Math.cos(i * angle),
            y: radius * Math.sin(i * angle)
          });
        }
      
        return new fabric.Polygon(points, {
          fill: 'gray',
          left: 100,
          top: 100,
          originX: 'center',
          originY: 'center'
        });
    }
       
    function createStar(points, outerRadius, innerRadius) {
        const step = Math.PI / points;
        const path = [];
      
        for (let i = 0; i < 2 * points; i++) {
          const r = (i % 2 === 0) ? outerRadius : innerRadius;
          const angle = i * step;
          path.push({
            x: r * Math.cos(angle),
            y: r * Math.sin(angle)
          });
        }
      
        return new fabric.Polygon(path, {
          fill: 'gray',
          left: 100,
          top: 100,
          originX: 'center',
          originY: 'center'
        });
    }
 
    function createArrow(direction) {
        let path;
      
        switch (direction) {
          case 'right':
            path = 'M 0 50 L 70 50 L 70 30 L 100 60 L 70 90 L 70 70 L 0 70 Z';
            break;
        }
      
        return new fabric.Path(path, {
          fill: 'gray',
          left: 100,
          top: 100,
          originX: 'center',
          originY: 'center'
        });
    }
       
    function addShape(type) {
        let shape;
        let canvas = fabricRef.current

        if(!canvas) return
      
        switch (type) {
          case 'square':
            shape = new fabric.Rect({
              width: 100,
              height: 100,
              fill: 'gray',
              left: 100,
              top: 100,
              originX: 'center',
              originY: 'center'
            });
            break;
      
          case 'rounded-rect':
            shape = new fabric.Rect({
              width: 100,
              height: 100,
              rx: 20,
              ry: 20,
              fill: 'gray',
              left: 100,
              top: 100,
              originX: 'center',
              originY: 'center'
            });
            break;
      
          case 'circle':
            shape = new fabric.Circle({
              radius: 50,
              fill: 'gray',
              left: 100,
              top: 100,
              originX: 'center',
              originY: 'center'
            });
            break;
      
          case 'triangle':
            shape = new fabric.Triangle({
              width: 100,
              height: 100,
              fill: 'gray',
              left: 100,
              top: 100,
              originX: 'center',
              originY: 'center'
            });
            break;
      
          case 'pentagon':
            shape = createPolygon(5, 50);
            break;
      
          case 'hexagon':
            shape = createPolygon(6, 50);
            break;
      
          case 'heptagon':
            shape = createPolygon(7, 50);
            break;
      
          case 'octagon':
            shape = createPolygon(8, 50);
            break;
      
          case 'star':
            shape = createStar(5, 50, 20);
            break;
      
          case 'arrow-right':
            shape = createArrow('right');
            break;
      
        }
      
        if (shape) {
          canvas.add(shape);
          canvas.setActiveObject(shape);
          canvas.requestRenderAll();
        }
    }
 
    const changeSelectedObjectColor = (color, gradient = false) => {
        const canvas = fabricRef.current;
        const activeObject = canvas.getActiveObject();
        if (!activeObject) return;
    
        const parseGradient = (colorString) => {
            const match = colorString.match(/linear-gradient\((\d+)deg,\s*(.+)\)/);
            if (!match) {
                return null;
            }
    
            const angleDeg = parseInt(match[1], 10);
            const stopsString = match[2];
    
            const stops = stopsString.split(',').map(stop => {
                const parts = stop.trim().split(/\s+/);
                return {
                    color: parts[0],
                    offset: parseFloat(parts[1].replace('%', '')) / 100,
                };
            });
    
            const angleRad = angleDeg * (Math.PI / 180);
            const x1 = 0.5 - 0.5 * Math.cos(angleRad);
            const y1 = 0.5 - 0.5 * Math.sin(angleRad);
            const x2 = 0.5 + 0.5 * Math.cos(angleRad);
            const y2 = 0.5 + 0.5 * Math.sin(angleRad);
    
            return new fabric.Gradient({
                type: 'linear',
                gradientUnits: 'percentage',
                coords: { x1, y1, x2, y2 },
                colorStops: stops,
            });
        };
    
         
        const applyColor = (obj) => {
            if (!obj.set) return;

            if (obj.name === 'generatedObject' && obj.type === 'group') {
                obj.getObjects().forEach(child => {
                    applyColor(child);
                });
                return;
            }

            const fillableTypes = ['rect', 'circle', 'triangle', 'polygon', 'path', 'i-text', 'textbox', 'text'];
            const isLine = obj.type === 'line';

            if (gradient) {
                const gradientFill = parseGradient(color);
                if (!gradientFill) return;

                if (isLine) {
                    obj.set('stroke', gradientFill);
                } else if (fillableTypes.includes(obj.type)) {
                    if (obj.fill !== null && obj.fill !== undefined  && obj.fill !== '') {
                        obj.set('fill', gradientFill);
                    }
                }
            } else {
                if (obj.fill !== null && obj.fill !== undefined && obj.fill !== '') {
                    obj.set('fill', color);
                }

                if (obj.stroke !== undefined) {
                    obj.set('stroke', color);
                }

                if (obj.color !== undefined) {
                    obj.set('color', color); 
                }

                if (obj.stroke == undefined) {
                    if (obj.name === 'qrimage' || obj.objectLayoutType === 'layout-boundary') return;
                    obj.set('stroke', color);
                }
            }
        };

    
        if (activeObject.type === 'group' || activeObject.type === 'activeSelection') {
            activeObject.getObjects().forEach(applyColor);
        } else {
            applyColor(activeObject);
        }
        saveHistory(canvas)
        canvas.requestRenderAll();
    };
 
    const changeSelectedObjectBorderColor = (strokeColor) => {
        const canvas = fabricRef.current;
        const activeObject = canvas.getActiveObject();
        if (!activeObject) return;
        
        const applyStrokeColor = (obj) => {
          if (obj?.objectLayoutType === "layout-boundary") return;
          if (!obj.set || obj.stroke === undefined || obj.name == 'qrimage') return;
          if (obj.type === 'i-text' || obj.type === 'textbox') return;
      
          const strokeTypes = ['rect', 'circle', 'triangle', 'polygon', 'line', 'path', 'ellipse', 'text', 'i-text', 'textbox'];
          if (strokeTypes.includes(obj.type)) {
            obj.set('stroke', strokeColor);
          }
        };
      
        if (activeObject.type === 'group' || activeObject.type === 'activeSelection') {
          if (activeObject?.name === "generatedObject") return;
          activeObject.getObjects().forEach(applyStrokeColor);
        } else {
          applyStrokeColor(activeObject);
        }
      
        canvas.requestRenderAll();
    };
       
    const updateObjectBorder = (type, value) => {
        if(!value) return
        const canvas = fabricRef.current;
        const activeObject = canvas.getActiveObject();
        if (!activeObject) return;
      
        const applyUpdate = (obj) => {
            if (!obj) return;
            if (obj.name == 'qrimage') return;
            if (obj?.objectLayoutType === "layout-boundary") return;
            if (['textbox', 'text', 'i-text'].includes(obj.type)) return;
      
          if (type === "position") {
            if (!obj.strokeWidth || obj.strokeWidth === 0) return;
      
            const scaleDelta = obj.strokeWidth / obj.width;
      
            if (value === 'Inside') {
              obj.set('strokeUniform', false);
              obj.set({
                scaleX: obj.scaleX * (1 - scaleDelta),
                scaleY: obj.scaleY * (1 - scaleDelta),
              });
            } else if (value === 'Outside') {
              obj.set('strokeUniform', false);
              obj.set({
                scaleX: obj.scaleX * (1 + scaleDelta),
                scaleY: obj.scaleY * (1 + scaleDelta),
              });
            }
      
          } else if (type === "borderDashArray") {
            obj.set({
              strokeDashArray: value === 'dashed' ? [6, 4] : null,
            });
      
          } else if (type === "strokeWidth") {
            const strokeWidth = parseInt(value, 10);
            if (strokeWidth === 0) {
              obj.set({
                stroke: null,
                strokeWidth: 0,
                strokeUniform: true,
              });
            } else {
              obj.set({
                stroke: obj.stroke || textStyles.borderColor || '#000000',
                strokeWidth: strokeWidth,
                strokeUniform: true,
                strokeDashArray: selectedTextStyles.current.borderDashArray === "dashed" ? [6, 4] : null,
              });
            }
      
          } else if (type === "borderRadius") {
            const radius = parseInt(value, 10);
            if (obj.type === 'image') {
              if (radius === 0) {
                obj.set({ clipPath: null });
              } else {
                const clipPath = new fabric.Rect({
                  left: 0,
                  top: 0,
                  originX: 'center',
                  originY: 'center',
                  width: obj.width,
                  height: obj.height,
                  rx: radius,
                  ry: radius,
                  absolutePositioned: false,
                });
                obj.set({ clipPath });
              }
            } else if ('rx' in obj && 'ry' in obj) {
              obj.set({ rx: radius, ry: radius });
            }
          }
        };
      
        if (activeObject.type === 'activeSelection' || activeObject.type === 'group') {
          activeObject.getObjects().forEach(applyUpdate);
        } else {
          applyUpdate(activeObject);
        }
      
        canvas.requestRenderAll();
    };
       
    function updateClipPath(obj) {
        
    }
     
    const changeOpacity = (e) => {
        let inputValue = e.target.value;
     
        const value = Math.min(100, Math.max(0, parseInt(inputValue)));
     
        const activeObjects = fabricRef.current.getActiveObjects();
     
        setTextStyles((prev) => ({
            ...prev,
            opacity: value
        }));
     
        if (!activeObjects.length) return;
     
        activeObjects.forEach(obj => {
            obj.set('opacity', value / 100);
        });
     
        fabricRef.current.requestRenderAll();
    }
      
    const handleUpload = (e) => { 
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = () => {
            fabric.Image.fromURL(reader.result, (img) => {
                img.set({
                    left: 100,
                    top: 100,
                    scaleX: 1,
                    scaleY: 1,
                    includeInHistory: true,
                    cropX: 0,
                    cropY: 0,
                    objectCaching: false,
                    width: img.width,
                    height: img.height,
                    originX: 'left',
                    originY: 'top',
                });
                setupCustomControls(img);
                fabricRef.current.add(img).setActiveObject(img);
            });
        };
        reader.readAsDataURL(file);
        e.target.value = '';
    };

 
    function setupCustomControls(img) {
        const size = 10;

        img.controls.mtr.visible = false; 

        img.controls.ml = new fabric.Control({
            x: -0.5,
            y: 0,
            cursorStyle: 'ew-resize',
            actionHandler: cropLeft,
            sizeX: size,
            sizeY: size,
        });

        img.controls.mr = new fabric.Control({
            x: 0.5,
            y: 0,
            cursorStyle: 'ew-resize',
            actionHandler: cropRight,
            sizeX: size,
            sizeY: size,
        });

        img.controls.mt = new fabric.Control({
            x: 0,
            y: -0.5,
            cursorStyle: 'ns-resize',
            actionHandler: cropTop,
            sizeX: size,
            sizeY: size,
        });

        img.controls.mb = new fabric.Control({
            x: 0,
            y: 0.5,
            cursorStyle: 'ns-resize',
            actionHandler: cropBottom,
            sizeX: size,
            sizeY: size,
        });
    }
 
    function cropLeft(eventData, transform, x, y) {
        const target = transform.target;
        const canvas = target.canvas;
        const pointer = canvas.getPointer(eventData);
        const scaleX = target.scaleX || 1;

        const diff = (target.left + target.width * scaleX - pointer.x) / scaleX;
        const newWidth = diff;
        const newCropX = target.originalElement ? target.originalElement.width - diff : target.cropX + (target.width - diff);

        if (newWidth > 10 && newCropX >= 0) {
            const newLeft = target.left + (target.width - newWidth) * scaleX;

            target.set({
            cropX: newCropX,
            width: newWidth,
            left: newLeft,
            });

            target.setCoords();
            target.dirty = true;
            canvas.requestRenderAll();
        }

        return true;
    }

    function cropRight(eventData, transform, x, y) {
        const target = transform.target;
        const canvas = target.canvas;
        const pointer = canvas.getPointer(eventData);

        const scaleX = target.scaleX || 1;
        const originalWidth = target._element?.naturalWidth || target.width;

        const newWidth = (pointer.x - target.left) / scaleX;

        const clampedWidth = Math.min(newWidth, originalWidth - target.cropX);

        if (clampedWidth > 10) {
            target.set({
            width: clampedWidth,
            });

            target.setCoords();
            target.dirty = true;
            canvas.requestRenderAll();
        }

        return true;
    }

    function cropTop(eventData, transform, x, y) {
        const target = transform.target;
        const canvas = target.canvas;
        const pointer = canvas.getPointer(eventData);
        const scaleY = target.scaleY || 1;

        const diff = (target.top + target.height * scaleY - pointer.y) / scaleY;
        const newHeight = diff;
        const newCropY = target.originalElement ? target.originalElement.height - diff : target.cropY + (target.height - diff);

        if (newHeight > 10 && newCropY >= 0) {
            const newTop = target.top + (target.height - newHeight) * scaleY;

            target.set({
            cropY: newCropY,
            height: newHeight,
            top: newTop,
            });

            target.setCoords();
            target.dirty = true;
            canvas.requestRenderAll();
        }

        return true;
    }

    function cropBottom(eventData, transform, x, y) {
        const target = transform.target;
        const canvas = target.canvas;
        const pointer = canvas.getPointer(eventData);

        const scaleY = target.scaleY || 1;
        const originalHeight = target._element?.naturalHeight || target.height;

        const newHeight = (pointer.y - target.top) / scaleY;

        const clampedHeight = Math.min(newHeight, originalHeight - target.cropY);

        if (clampedHeight > 10) {
            target.set({
            height: clampedHeight,
            });

            target.setCoords();
            target.dirty = true;
            canvas.requestRenderAll();
        }

        return true;
    }




    const addRectangle = () => {
        const rect = new fabric.Rect({
            left: 100,
            top: 100,
            width: 100,
            height: 100,
            fill: 'skyblue',
        });
        fabricRef.current.add(rect).setActiveObject(rect);
    };

    const addText = () => {
        const text = new fabric.IText('Edit me', {
            left: 150,
            top: 150,
            fontSize: 30,
            fill: '#000',
        });
        fabricRef.current.add(text).setActiveObject(text);
    };

    const zoomCanvas = (factor) => {
        const canvas = fabricRef.current;
        canvas.setZoom(factor);
        canvas.setWidth(1000 * factor);
        canvas.setHeight(600 * factor);
        canvas.requestRenderAll();
    };

    const bringToFront = () => {
        const obj = fabricRef.current.getActiveObject();
        if (obj) {
            fabricRef.current.bringToFront(obj);
            fabricRef.current.requestRenderAll();
        }
    };

    const sendToBack = () => {
        const canvas = fabricRef.current;
        const obj = canvas.getActiveObject();
        if (obj) {
            canvas.sendToBack(obj);
            canvas.requestRenderAll();
        }
    };

    const bringForward = () => {
        const obj = fabricRef.current.getActiveObject();
        if (obj) {
            fabricRef.current.bringForward(obj);
            fabricRef.current.requestRenderAll();
        }
    };

    const sendBackward = () => {
        const canvas = fabricRef.current;
        const obj = canvas.getActiveObject();
        if (obj) {
            canvas.sendBackwards(obj);
            canvas.requestRenderAll();
        }
    };

    const toggleLock = () => {
        const obj = fabricRef.current.getActiveObject();
        if (obj) {
            const isLocked = obj.lockMovementX;
            obj.set({
                lockMovementX: !isLocked,
                lockMovementY: !isLocked,
                lockScalingX: !isLocked,
                lockScalingY: !isLocked,
                lockRotation: !isLocked,
                hasControls: isLocked,
                selectable: true,
            });
            fabricRef.current.requestRenderAll();
        }
    };

    const duplicateObject = () => {
        const active = fabricRef.current.getActiveObject();
        if (active) {
            active.clone((cloned) => {
                cloned.set({ left: active.left + 20, top: active.top + 20 });
                fabricRef.current.add(cloned).setActiveObject(cloned);
            });
        }
    };

    const deleteObject = () => {
        const active = fabricRef.current.getActiveObject();
        if (active) fabricRef.current.remove(active);
    };

    const importCanvas = () => {
        const saved = localStorage.getItem("savedCanvas");
        if (!saved || !fabricRef.current) return;
        fabricRef.current.loadFromJSON(saved, () => {
            fabricRef.current.renderAll();
            alert("Canvas loaded from localStorage!");
        });
    };
 
    const fontFamilyList = [
        {
            label:"Roboto",
            value:"Roboto",
        },
        {
            label:"Arial",
            value:"Arial",
        },
        {
            label:"Times New Roman",
            value:"Times New Roman",
        },
        {
            label:"Courier New",
            value:"Courier New",
        },
        {
            label:"Georgia",
            value:"Georgia",
        },
        {
            label:"Verdana",
            value:"Verdana",
        },
        {
            label:"Tahoma",
            value:"Tahoma",
        },
        {
            label:"Comic Sans MS",
            value:"Comic Sans MS",
        },
    ]
 
    const borderSelector = [
        {
            label: "Inside",
            value:"Inside"
        },
        {
            label: "Outside",
            value:"Outside"
        },
    ]
 
    const borderDashArray = [
        {
            label: "Dashed",
            value:"dashed"
        },
        {
            label: "Solid",
            value:"solid"
        },
    ]

    const onclosePopup = (e) => {
        e.stopPropagation()
        setShowSubMenu(false)
    }

    const checkIfActiveHasItem = (item) => {
        if (item == 'layout') {
            let hasTextItem = activeObjects.current?.some(obj => obj?.objectLayoutType === "layout-boundary");
            if (hasTextItem) {
               return true
            } else {
                return false
            }
        }if (item == 'qrimage') {
            let hasTextItem = activeObjects.current?.some(obj => obj.name == 'qrimage' && obj.type == 'image');
            if (hasTextItem) {
               return true
            } else {
                return false
            }
        } else {
            let hasTextItem = activeObjects.current?.some(obj =>
                obj.type === 'textbox' || obj.type === 'i-text' || obj.type === 'text' || obj.name == 'qrimage'
            );
                
            if (hasTextItem) {
               return true
            } else {
                return false
            }
        }

    }

    const [modal, setModal] = useState(false)
    const modalToggle = () => {
        setModal(!modal)
    }

    const navigate = useNavigate()

    return (
        <div>

             <Modal
                isOpen={modal}
                toggle={modalToggle}
                // size="lg"
                style={{ maxWidth: '600px', zIndex: "999999 !important" }}
                centered
            >
                <ModalBody >
                    <h5 className="f-w-600" style={{ fontSize: "18px",textAlign:"center" }}>
                        {'Reset to Default Settings?'}
                    </h5>
                    <Row className="mt-2">
                        <Col md={12} style={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center' }}>
                            <p className='ref-image-text' style={{fontWeight:400}}>This will remove all current changes and restore the original default template.</p>
                            <p className='ref-image-text' style={{fontWeight:400}}> Are you sure you want to continue?</p>
                        </Col>
                    </Row>
                    <div
                        className="form-group text-center "
                        style={{ marginTop: "15px", }}
                    >
                        <Button
                            color="secondary"
                            className="btn btnCancel mr-3"
                            onClick={() => {
                                modalToggle()
                            }}
                        >
                            No, Keep My Changes
                        </Button>
                        <Button color="primary" type="submit" className="btn btn-primary"
                            // disabled={loading}
                            onClick={() => {
                                resetCanvas()
                                modalToggle()
                            }}
                        >
                            { 'Yes, Reset'}
                        </Button>
                    </div>
                </ModalBody>
            </Modal>

            <div className='editor-toolbar'>
                <div >
                    <div className={tools === "select" && "active"} onClick={() => {
                        onSelectTools("select")
                    }}
                    title="Select"
                    >
                        <Button className='editor-Tools' style={{background:"#E5E5E580"}}>
                            {ArrowIcon}
                        </Button>
                    </div>

                    <div className='tool-seperation'></div>

                    <div className={`${tools === "draw" && "active" } has-sub-tools` } title="Draw" onClick={() => onSelectTools("draw","shapes")}> 
                        <Button className='editor-Tools' style={{background:"#E5E5E580"}}>
                            {PencilIcon}
                        </Button>
                    </div>

                    <div className='tool-seperation'></div>

                    <div className={tools === "erase" && "active" } title="Erase" onClick={() => onSelectTools("erase")}>
                        <Button className='editor-Tools' style={{background:"#E5E5E580"}}>
                            {EraseIcon}
                        </Button>
                    </div>

                    <div className='tool-seperation'></div>

                    <div className={`${tools === "text" && "active"}   has-sub-tools` } title="Text" onClick={() => onSelectTools("text")}>
                        <Button className='editor-Tools' style={{background:"#E5E5E580"}}>
                            {TextIcon}
                        </Button>
                    </div>

                    <div className='tool-seperation'></div>

                   

                    <div className={` image-upload-tool `} title="Upload">
                        <input type="file" id='upload-image' accept="image/*" onChange={handleUpload} />
                        <label htmlFor='upload-image' className='upload-image-label'>
                            <div className='editor-Tools' style={{background:"#E5E5E580"}} >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 16V4M12 4L8 8M12 4L16 8" stroke="#26A3DB" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    <path d="M20 16V19C20 20.1046 19.1046 21 18 21H6C4.89543 21 4 20.1046 4 19V16" stroke="#26A3DB" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                            </div>
                        </label>
                    </div>

                    <div className='tool-seperation'></div>

                    <button className='btn-primary bar-btn  btn btn-secondary btn-medium' onClick={modalToggle}> Reset</button>

                </div>
            </div>

            <div className='editor-back-Button btn btn-secondary' title="Back" onClick={() => {
                localStorage.setItem("return",true)
                navigate(-1)
            }}>
                <BsArrowLeftShort />
            </div>

            <div
                id="toolbar"
                style={{
                    position: 'absolute',
                    padding: '8px',
                    background: '#fff',
                    borderRadius: '8px',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
                    zIndex: 10,
                    display: 'none',
                }}
            >
                {/* <button onClick={duplicateObject}>➕</button>
                <button onClick={deleteObject}>🗑️</button>
                <button onClick={toggleLock}>🔒</button>
                <button className='editor-Tools' style={{background:"#E5E5E580"}}>⋯</button> */}
            </div>

            {/* <Picker/> */}

           {((activeObjects?.current?.length > 0 ) || (tools === "draw" && showSubMenu === "shapes" || (tools === "draw" && showSubMenu === "lines") )) && <div className='editor-side-bar' >
                <div >
                    {tools === "draw" && <>
                        <div className={`${tools === "draw" && "active" } has-sub-tools` } title="Draw" onClick={() => onSelectTools("draw","shapes")}> 
                                <Button className='editor-Tools' style={{background:"#E5E5E580"}}>
                                    <svg width="18" height="18" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <rect width="40" height="40" fill="#6A6D73"/>
                                    </svg>
                                </Button>                     
                                {tools === "draw" && showSubMenu === "shapes" && (
                                    <DrawingTools subTools={subTools} onSelectSubTools={onSelectSubTools} tabitem='shapes'/>
                                )}
                            </div>
                        <div className={`${tools === "draw" && "active" } has-sub-tools` } title="Draw" onClick={() => onSelectTools("draw","lines")}> 
                                <Button className='editor-Tools' style={{background:"#E5E5E580"}}>
                                    <svg width="18" height="5" viewBox="0 0 80 1" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <line x1="0.00146484" y1="0.5" x2="80.0015" y2="0.5" stroke="#6A6D73"/>
                                    </svg>
                                </Button>                     
                                {tools === "draw" && showSubMenu === "lines" && (
                                    <DrawingTools subTools={subTools} onSelectSubTools={onSelectSubTools} tabitem='Lines'/>
                                )}
                            </div>
                    </>}

                    {activeObjects?.current?.length > 0 && <>
                        {checkIfActiveHasItem("text") && !checkIfActiveHasItem('qrimage') && <div className={`${tools === "text" && "active"}   has-sub-tools` } title="Text" onClick={() => onSelectTools("text", true)}>
                            <Button className='editor-Tools' style={{background:"#E5E5E580"}}>
                                {TextIcon}
                            </Button>
                            {/* <label>Text</label> */}
                            {/* <span style={{marginLeft:"10px"}} onClick={(e) => {
                                e.stopPropagation()
                                onSelectTools("text", true)
                            }}>
                                <svg width="12" height="6" viewBox="0 0 12 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M6.00002 5.66668C5.87202 5.66668 5.744 5.61804 5.64666 5.52004L0.979996 0.853368C0.784663 0.658035 0.784663 0.341345 0.979996 0.146012C1.17533 -0.0493216 1.49202 -0.0493216 1.68735 0.146012L6.00067 4.45933L10.314 0.146012C10.5093 -0.0493216 10.826 -0.0493216 11.0213 0.146012C11.2167 0.341345 11.2167 0.658035 11.0213 0.853368L6.35467 5.52004C6.256 5.61804 6.12802 5.66668 6.00002 5.66668Z" fill="#6A6D73"/>
                                </svg>
                            </span> */}

                            {tools === "text" && showSubMenu === "textControls" && <div id="textControls" className='text-options'>
                                <button className="close-popup-button" onClick={onclosePopup}>
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="24"
                                        height="24"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        style={{ cursor: 'pointer' }}
                                        >
                                            <line x1="18" y1="6" x2="6" y2="18" />
                                            <line x1="6" y1="6" x2="18" y2="18" />
                                        </svg>
                                </button>
                                <div>
                                    {/* <div className='select-container' onClick={(e) => {
                                                e.stopPropagation()
                                            }}>
                                        <CommonDropdown name='font-list' placeholder="Select Font Family" options={fontFamilyList} onChange={(e) => {
                                            // e.stopPropagation()
                                        }} />
                                    </div> */}

                                    <div className='text-grid-items'  onClick={(e) => {
                                            e.stopPropagation()
                                        }}>
                                        <div className='select-container' >
                                            <CommonDropdown name='font-family' placeholder="Select Font Family" value={ textStyles?.fontFamily ? {
                                                    label:textStyles?.fontFamily,
                                                    value:textStyles?.fontFamily,
                                            } : null} options={fontFamilyList} onChange={(e) => {
                                                ChangeFontFamily(e)
                                            }} />
                                        </div>

                                        <div className='fontSize-lineHeight-incrementer'  onClick={(e) => {
                                            e.stopPropagation()
                                        }}>
                                            <button onClick={(e) => {
                                                ChangeFontSize(e, "minus")
                                            }}>
                                                <svg width="9" height="2" viewBox="0 0 9 2" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M0 1.75684V0.243164H8.82812V1.75684H0Z" fill="#1D1D1B"/>
                                                </svg>
                                            </button>
                                            <input type='number' value={textStyles?.fontSize || 0} onChange={(e) => {
                                                ChangeFontSize(e)
                                            }}/>
                                            <button onClick={(e) => {
                                                ChangeFontSize(e, "plus")
                                            }}>
                                                <svg width="9" height="10" viewBox="0 0 9 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M0.171875 5.76172V4.24805H9V5.76172H0.171875ZM3.75586 9.7168V0.283203H5.41602V9.7168H3.75586Z" fill="#1D1D1B"/>
                                                </svg>
                                            </button>
                                        </div>
                                        
                                        <div className='fontSize-lineHeight-incrementer lineHeight-incrementer'  onClick={(e) => {
                                                e.stopPropagation()
                                        }}  >
                                            <button>
                                                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M1.75 12.8333H12.25" stroke="#1D1D1B" stroke-linecap="round" stroke-linejoin="round"/>
                                                    <path d="M1.75 1.16675H12.25" stroke="#1D1D1B" stroke-linecap="round" stroke-linejoin="round"/>
                                                    <path d="M7 3.5V10.5" stroke="#1D1D1B" stroke-linecap="round" stroke-linejoin="round"/>
                                                    <path d="M8.65079 4.50337L6.99995 2.85254L5.34912 4.50337" stroke="#1D1D1B" stroke-linecap="round" stroke-linejoin="round"/>
                                                    <path d="M8.65079 9.26929L6.99995 10.9201L5.34912 9.26929" stroke="#1D1D1B" stroke-linecap="round" stroke-linejoin="round"/>
                                                </svg>
                                            </button>
                                            <input type='number'
                                                value={textStyles?.lineHeight || 0}
                                                onChange={(e) => {
                                                    changeLineHeight(e)
                                                }} />
                                        </div>
                                    
                                        <div className='bold-italic' style={{justifyContent:"space-between"}} onClick={(e) => {
                                            e.stopPropagation()
                                        }}>
                                            <button className={`${textStyles?.fontWeight === "bold" || textStyles?.fontWeight == "700" ? "active" : ""}`} onClick={(e) => {
                                                applyTextStyleToSelection('fontWeight', 'bold', 'normal')
                                            }}>
                                                <svg  width="10" height="12" viewBox="0 0 10 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path fill-rule="evenodd" clip-rule="evenodd" d="M0.800098 0.399658C0.413498 0.399658 0.100098 0.713059 0.100098 1.09966V5.99966V10.8997C0.100098 11.2863 0.413498 11.5997 0.800098 11.5997H6.4001C7.30041 11.5997 8.1796 11.2876 8.84095 10.7089C9.50529 10.1276 9.9001 9.31755 9.9001 8.44966C9.9001 7.58177 9.50529 6.77174 8.84095 6.19044C8.64651 6.0203 8.43323 5.87321 8.20612 5.75032C8.83103 5.17381 9.2001 4.38878 9.2001 3.54966C9.2001 2.68177 8.80529 1.87174 8.14095 1.29044C7.4796 0.711761 6.60041 0.399658 5.7001 0.399658H0.800098ZM5.7001 5.29966C6.285 5.29966 6.83019 5.09551 7.21904 4.75527C7.60491 4.41763 7.8001 3.98133 7.8001 3.54966C7.8001 3.11799 7.60491 2.68168 7.21904 2.34405C6.83019 2.0038 6.285 1.79966 5.7001 1.79966H1.5001V5.29966H5.7001ZM1.5001 6.69966V10.1997H6.4001C6.985 10.1997 7.53019 9.99551 7.91904 9.65526C8.30491 9.31763 8.5001 8.88133 8.5001 8.44966C8.5001 8.01799 8.30491 7.58168 7.91904 7.24405C7.53019 6.9038 6.985 6.69966 6.4001 6.69966H5.7001H1.5001Z" fill="#6A6D73"/>
                                                </svg>
                                            </button>

                                            <button className={`${textStyles?.fontStyle === "italic" ? "active" : ""}`} onClick={(e) => {
                                                applyTextStyleToSelection('fontStyle', 'italic', 'normal')
                                            }}>
                                                <svg  width="8" height="12" viewBox="0 0 8 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path fill-rule="evenodd" clip-rule="evenodd" d="M6.11645 0.39985H7.1566C7.5432 0.39985 7.8566 0.713251 7.8566 1.09985C7.8566 1.48645 7.5432 1.79985 7.1566 1.79985H6.5851L3.4351 10.1998H3.95625C4.34285 10.1998 4.65625 10.5132 4.65625 10.8998C4.65625 11.2864 4.34285 11.5998 3.95625 11.5998H2.44101C2.43029 11.6001 2.41954 11.6001 2.40878 11.5998H1.2C0.813401 11.5998 0.5 11.2864 0.5 10.8998C0.5 10.5132 0.813401 10.1998 1.2 10.1998H1.9399L5.0899 1.79985H4.56875C4.18215 1.79985 3.86875 1.48645 3.86875 1.09985C3.86875 0.713251 4.18215 0.39985 4.56875 0.39985H6.08376C6.09463 0.399595 6.10553 0.399593 6.11645 0.39985Z" fill="#6A6D73"/>
                                                </svg>
                                            </button>

                                            <button className={`${textStyles?.underline ? "active" : ""}`} onClick={(e) => {
                                                applyTextStyleToSelection('underline', true, false)
                                            }}>
                                                <svg width="9" height="12" viewBox="0 0 9 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path fill-rule="evenodd" clip-rule="evenodd" d="M2.20005 1.09966C2.20005 0.713059 1.88665 0.399658 1.50005 0.399658C1.11345 0.399658 0.800049 0.713059 0.800049 1.09966V4.91077C0.800049 5.96279 1.21796 6.97173 1.96186 7.71563C2.70575 8.45952 3.71469 8.87743 4.76672 8.87743C5.81874 8.87743 6.82768 8.45952 7.57157 7.71563C8.31547 6.97173 8.73338 5.96279 8.73338 4.91077V1.09966C8.73338 0.713059 8.41998 0.399658 8.03338 0.399658C7.64678 0.399658 7.33338 0.713059 7.33338 1.09966V4.91077C7.33338 5.59149 7.06297 6.24433 6.58162 6.72568C6.10028 7.20702 5.44744 7.47744 4.76672 7.47744C4.08599 7.47744 3.43315 7.20702 2.95181 6.72568C2.47046 6.24433 2.20005 5.59149 2.20005 4.91077V1.09966ZM1.50005 10.1997C1.11345 10.1997 0.800049 10.5131 0.800049 10.8997C0.800049 11.2863 1.11345 11.5997 1.50005 11.5997H8.04614C8.43274 11.5997 8.74614 11.2863 8.74614 10.8997C8.74614 10.5131 8.43274 10.1997 8.04614 10.1997H1.50005Z" fill="#6A6D73"/>
                                                </svg>
                                            </button>

                                            {/* <button className={`${textStyles?.link && textStyles?.link != "" ? "active" : ""}`} onClick={(e) => {
                                                addLinkToText(e)
                                            }}>
                                                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M10.4457 8.48784C10.7434 10.7353 9.80849 12.9143 7.27066 13.1087C4.32806 13.3341 3.70579 11.1323 3.70579 9.46688" stroke="#6A6D73" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                                                    <line x1="1.75894" y1="7.21689" x2="12.0589" y2="7.21689" stroke="#6A6D73" stroke-width="0.7" stroke-linecap="round" stroke-linejoin="round"/>
                                                    <path d="M3.72838 5.92036C3.43068 3.67285 4.36559 1.4939 6.90341 1.29953C9.84601 1.07415 10.4683 3.27593 10.4683 4.94132" stroke="#6A6D73" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                                                </svg>
                                            </button> */}
                                        </div>
                                    
                                        <div className='text-alignment-container' onClick={(e) => {
                                            e.stopPropagation()
                                        }}>
                                            <button className={`${textStyles?.textAlign === "left" ? "active" : ""}`} onClick={(e) => {
                                                ChangeTextAlignment("left")
                                            }}>
                                                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M1.75 2.625H12.25" stroke="#1D1D1B" stroke-linecap="round" stroke-linejoin="round"/>
                                                    <path d="M1.75 5.54175H7.27417" stroke="#1D1D1B" stroke-linecap="round" stroke-linejoin="round"/>
                                                    <path d="M1.75 8.45825H12.25" stroke="#1D1D1B" stroke-linecap="round" stroke-linejoin="round"/>
                                                    <path d="M1.75 11.375H7.27417" stroke="#1D1D1B" stroke-linecap="round" stroke-linejoin="round"/>
                                                </svg>
                                            </button>
                                            <button className={`${textStyles?.textAlign === "center" ? "active" : ""}`} onClick={(e) => {
                                                ChangeTextAlignment("center")
                                            }}>
                                                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M1.75 2.625H12.25" stroke="#6A6D73" stroke-linecap="round" stroke-linejoin="round"/>
                                                    <path d="M4.23511 5.54175H9.76511" stroke="#6A6D73" stroke-linecap="round" stroke-linejoin="round"/>
                                                    <path d="M1.75 8.45825H12.25" stroke="#6A6D73" stroke-linecap="round" stroke-linejoin="round"/>
                                                    <path d="M4.23511 11.375H9.76511" stroke="#6A6D73" stroke-linecap="round" stroke-linejoin="round"/>
                                                </svg>
                                            </button>
                                            <button className={`${textStyles?.textAlign === "right" ? "active" : ""}`} onClick={(e) => {
                                                ChangeTextAlignment("right")
                                            }}>
                                                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M1.75 2.625H12.25" stroke="#6A6D73" stroke-linecap="round" stroke-linejoin="round"/>
                                                    <path d="M6.72583 5.54175H12.25" stroke="#6A6D73" stroke-linecap="round" stroke-linejoin="round"/>
                                                    <path d="M1.75 8.45825H12.25" stroke="#6A6D73" stroke-linecap="round" stroke-linejoin="round"/>
                                                    <path d="M6.72583 11.375H12.25" stroke="#6A6D73" stroke-linecap="round" stroke-linejoin="round"/>
                                                </svg>
                                            </button>
                                            <button className={`${textStyles?.textAlign === "justify" ? "active" : ""}`} onClick={(e) => {
                                                ChangeTextAlignment("justify")
                                            }}>
                                                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M1.75 2.625H12.25" stroke="#6A6D73" stroke-linecap="round" stroke-linejoin="round"/>
                                                    <path d="M1.75 5.54175H12.25" stroke="#6A6D73" stroke-linecap="round" stroke-linejoin="round"/>
                                                    <path d="M1.75 8.45825H12.25" stroke="#6A6D73" stroke-linecap="round" stroke-linejoin="round"/>
                                                    <path d="M1.75 11.375H12.25" stroke="#6A6D73" stroke-linecap="round" stroke-linejoin="round"/>
                                                </svg>
                                            </button>
                                        </div>

                                        <div className='text-transform-container' onClick={(e) => {
                                            e.stopPropagation()
                                        }}>
                                            <button className={`${textStyles?.textTransform === "uppercase" ? "active" : ""}`} onClick={(e) => {
                                                applyTextTransform('uppercase')
                                            }}>
                                                <svg width="16" height="10" viewBox="0 0 16 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M8.62012 5.60798V5.07561C8.62012 3.77942 8.94338 2.7687 9.58989 2.04344C10.2402 1.31819 11.0784 0.955566 12.1045 0.955566C13.033 0.955566 13.7603 1.2121 14.2865 1.72518C14.8165 2.2344 15.1116 2.83621 15.1717 3.5306L15.1774 3.59425H14.0948V3.53638C14.0948 3.15061 13.9201 2.7822 13.5705 2.43115C13.2209 2.08009 12.7285 1.90457 12.0933 1.90457C11.3753 1.90457 10.7984 2.18618 10.3623 2.74941C9.93007 3.31263 9.71393 4.08804 9.71393 5.07561V5.60798C9.71393 6.59556 9.93007 7.37096 10.3623 7.93419C10.7984 8.49741 11.411 8.77903 12.2004 8.77903C12.6139 8.77903 12.971 8.73466 13.2717 8.64594C13.5724 8.55721 13.858 8.4164 14.1287 8.22352V6.25608H12.0876V5.3418H15.1774V8.62858C14.9218 8.89862 14.5403 9.14937 14.0328 9.38083C13.5254 9.6123 12.9146 9.72803 12.2004 9.72803C11.1103 9.72803 10.2402 9.3654 9.58989 8.64015C8.94338 7.9149 8.62012 6.90417 8.62012 5.60798Z" fill="#1D1D1B"/>
                                                    <path d="M0.82251 9.55442L3.94609 1.07129H4.91586L8.03944 9.55442H6.9118L4.65651 3.18918C4.6114 3.06187 4.57193 2.93843 4.5381 2.81884C4.50427 2.69925 4.4742 2.5758 4.44789 2.4485H4.39151C4.3652 2.5758 4.33513 2.69925 4.3013 2.81884C4.26747 2.93843 4.228 3.06187 4.1829 3.18918L1.90505 9.55442H0.82251ZM2.16441 7.35552L2.49706 6.44124H6.35361L6.68063 7.35552H2.16441Z" fill="#1D1D1B"/>
                                                </svg>
                                            </button>
                                            <button className={`${textStyles?.textTransform === "mixed" ? "active" : ""}`} onClick={(e) => {
                                                applyTextTransform('mixed')
                                            }}>
                                                <svg width="14" height="10" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M7.73349 8.88155L8.44275 7.98631C8.62057 8.20372 8.87113 8.39556 9.19444 8.56182C9.51774 8.73234 9.88147 8.81761 10.2856 8.81761C10.8312 8.81761 11.2616 8.65348 11.5768 8.32522C11.892 7.99696 12.0496 7.53442 12.0496 6.93759V6.27255C11.8637 6.54965 11.6132 6.77346 11.298 6.94398C10.9868 7.11024 10.6089 7.19337 10.1644 7.19337C9.35609 7.19337 8.70948 6.87364 8.22451 6.23418C7.73955 5.59472 7.49707 4.78473 7.49707 3.80422V3.5996C7.49707 2.61909 7.73955 1.8091 8.22451 1.16964C8.70948 0.53018 9.35609 0.210449 10.1644 0.210449C10.6089 0.210449 10.9969 0.3085 11.3283 0.504602C11.6637 0.700703 11.9122 0.937304 12.0739 1.2144H12.1103L12.1588 0.338342H13.1772V6.93759C13.1772 7.87546 12.9125 8.59593 12.3831 9.09897C11.8536 9.60201 11.1646 9.85353 10.3159 9.85353C9.79054 9.85353 9.30557 9.76188 8.86103 9.57857C8.41648 9.39525 8.04063 9.16292 7.73349 8.88155ZM8.64885 3.80422C8.64885 4.48632 8.7903 5.0597 9.0732 5.52438C9.35609 5.98905 9.80064 6.22139 10.4068 6.22139C10.811 6.22139 11.1545 6.10416 11.4374 5.86969C11.7203 5.63522 11.9244 5.36877 12.0496 5.07036V2.33346C11.9244 2.03505 11.7203 1.7686 11.4374 1.53414C11.1545 1.29967 10.811 1.18243 10.4068 1.18243C9.80064 1.18243 9.35609 1.41477 9.0732 1.87944C8.7903 2.34412 8.64885 2.9175 8.64885 3.5996V3.80422Z" fill="#6A6D73"/>
                                                    <path d="M0.822754 5.08313C0.822754 4.40104 1.07938 3.87028 1.59263 3.49087C2.10588 3.11146 2.75856 2.92175 3.55066 2.92175H4.99343V2.46134C4.99343 2.05634 4.89441 1.72809 4.69639 1.47657C4.49836 1.22078 4.15687 1.09289 3.6719 1.09289C3.18694 1.09289 2.83939 1.19946 2.62924 1.41262C2.42313 1.62151 2.32007 1.86451 2.32007 2.14161V2.17358H1.1986V2.14161C1.1986 1.60872 1.42289 1.14404 1.87148 0.747579C2.32411 0.346849 2.93436 0.146484 3.70221 0.146484C4.47007 0.146484 5.06415 0.340454 5.48445 0.728395C5.90879 1.11633 6.12096 1.69398 6.12096 2.46134V5.53075C6.12096 5.80785 6.14117 6.07003 6.18158 6.31729C6.222 6.56029 6.27857 6.77557 6.35132 6.96315V7.06546H5.26015C5.20358 6.95888 5.15104 6.82033 5.10254 6.64981C5.05809 6.47929 5.0298 6.30877 5.01767 6.13824C4.86814 6.41534 4.62566 6.66047 4.29023 6.87362C3.95884 7.08678 3.53046 7.19335 3.00508 7.19335C2.39888 7.19335 1.88361 7.01217 1.45927 6.64981C1.03492 6.28745 0.822754 5.76522 0.822754 5.08313ZM1.95029 5.01918C1.95029 5.40286 2.05537 5.70341 2.26552 5.92083C2.47567 6.13824 2.80301 6.24695 3.24756 6.24695C3.69211 6.24695 4.09423 6.08495 4.45391 5.76096C4.81359 5.43697 4.99343 5.09379 4.99343 4.73143V3.76584H3.6719C3.10612 3.76584 2.67773 3.87881 2.38676 4.10475C2.09578 4.3307 1.95029 4.63551 1.95029 5.01918Z" fill="#6A6D73"/>
                                                </svg>
                                            </button>
                                            <button className={`${textStyles?.textTransform === "capitalize" ? "active" : ""}`} onClick={(e) => {
                                                applyTextTransform('capitalize')
                                        
                                            }}>
                                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M9.55574 14.312L10.2752 13.4653C10.4556 13.6709 10.7098 13.8524 11.0378 14.0096C11.3657 14.1709 11.7347 14.2515 12.1446 14.2515C12.6981 14.2515 13.1347 14.0963 13.4545 13.7858C13.7742 13.4754 13.9341 13.0379 13.9341 12.4734V11.8444C13.7455 12.1065 13.4914 12.3182 13.1716 12.4795C12.8559 12.6367 12.4726 12.7153 12.0217 12.7153C11.2017 12.7153 10.5458 12.4129 10.0538 11.8081C9.56189 11.2033 9.31592 10.4372 9.31592 9.50985V9.31631C9.31592 8.38894 9.56189 7.62286 10.0538 7.01805C10.5458 6.41324 11.2017 6.11084 12.0217 6.11084C12.4726 6.11084 12.8662 6.20358 13.2023 6.38905C13.5426 6.57452 13.7947 6.7983 13.9587 7.06039H13.9956L14.0448 6.2318H15.0779V12.4734C15.0779 13.3605 14.8094 14.0419 14.2723 14.5176C13.7353 14.9934 13.0363 15.2313 12.1754 15.2313C11.6424 15.2313 11.1505 15.1446 10.6995 14.9713C10.2486 14.7979 9.86731 14.5781 9.55574 14.312ZM10.4843 9.50985C10.4843 10.155 10.6278 10.6973 10.9148 11.1368C11.2017 11.5763 11.6527 11.796 12.2676 11.796C12.6776 11.796 13.0261 11.6851 13.313 11.4634C13.6 11.2416 13.807 10.9896 13.9341 10.7074V8.1188C13.807 7.83655 13.6 7.58455 13.313 7.36279C13.0261 7.14103 12.6776 7.03015 12.2676 7.03015C11.6527 7.03015 11.2017 7.24989 10.9148 7.68938C10.6278 8.12888 10.4843 8.67119 10.4843 9.31631V9.50985Z" fill="#6A6D73"/>
                                                    <path d="M0.921875 12.5942L4.32864 3.72778H5.38634L8.79311 12.5942H7.56323L5.10347 5.94137C5.05427 5.80832 5.01123 5.67929 4.97433 5.5543C4.93744 5.42931 4.90464 5.30028 4.87594 5.16722H4.81445C4.78575 5.30028 4.75295 5.42931 4.71606 5.5543C4.67916 5.67929 4.63611 5.80832 4.58692 5.94137L2.10256 12.5942H0.921875ZM2.38543 10.296L2.74825 9.34039H6.95444L7.3111 10.296H2.38543Z" fill="#6A6D73"/>
                                                </svg>
                                            </button>
                                            {/* <button className={`${textStyles?.textTransform === "capitalize" ? "active" : ""}`} onClick={(e) => {
                                                applyTextTransform('capitalize')
                                            }}>
                                                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M0 12.0422L3.42515 2.97852H4.48855L7.9137 12.0422H6.67718L4.20415 5.24134C4.15469 5.10532 4.11141 4.97343 4.07432 4.84565C4.03722 4.71788 4.00425 4.58599 3.9754 4.44997H3.91357C3.88472 4.58599 3.85174 4.71788 3.81465 4.84565C3.77755 4.97343 3.73428 5.10532 3.68481 5.24134L1.18705 12.0422H0ZM1.47145 9.69279L1.83622 8.71595H6.06511L6.4237 9.69279H1.47145Z" fill="#6A6D73"/>
                                                    <path d="M8.64771 9.01705V8.63727C8.64771 7.64511 8.9112 6.87082 9.43819 6.31438C9.96813 5.75795 10.6379 5.47974 11.4475 5.47974C12.2336 5.47974 12.8416 5.67699 13.2714 6.0715C13.7012 6.46306 13.9426 6.92528 13.9956 7.45816L14 7.50674H13.1124L13.108 7.46258C13.0903 7.17406 12.9431 6.89878 12.6664 6.63676C12.3926 6.37474 11.9848 6.24373 11.4431 6.24373C10.8837 6.24373 10.4274 6.45717 10.0741 6.88406C9.72082 7.30801 9.54418 7.89241 9.54418 8.63727V9.01705C9.54418 9.76191 9.71935 10.3478 10.0697 10.7747C10.423 11.1986 10.922 11.4106 11.5668 11.4106C11.9053 11.4106 12.1968 11.3767 12.4412 11.309C12.6855 11.2413 12.9181 11.1338 13.1389 10.9866V9.54257H11.474V8.80508H14V11.3134C13.7881 11.5254 13.4745 11.7227 13.0594 11.9052C12.6472 12.0848 12.1497 12.1746 11.5668 12.1746C10.6777 12.1746 9.96813 11.8964 9.43819 11.3399C8.9112 10.7835 8.64771 10.0092 8.64771 9.01705Z" fill="#6A6D73"/>
                                                </svg>
                                            </button> */}
                                        </div>
                                    </div>
                                </div>
                            </div>}
                        </div>}

                        {!checkIfActiveHasItem("qrimage")  && <div className={`${tools === "color" && "active"}  has-sub-tools` } title="Colour" onClick={() => {
                            onSelectTools("color","color-tool")
                        }}>
                            <Button className='editor-Tools' >
                                <div style={{ width: "24px", height: "24px", background: textStyles.color ? textStyles.color :"#0071CE", borderRadius: "50%" }}></div>
                            </Button>                        
                            {tools === "color" && showSubMenu === "color-tool" && <Picker changeColor={changeSelectedObjectColor} values={textStyles} type={"color"} setValues={setTextStyles} onclosePopup={onclosePopup} />}
                        </div>}

                        {!checkIfActiveHasItem("text")  && <div className={`${tools === "borderColor" && "active"}  has-sub-tools`} title="Border Colour" onClick={() => onSelectTools("borderColor","border-tool")}>
                            <Button className='editor-Tools' >
                                <div style={{width:"24px",height:"24px",border:`2px solid ${ textStyles.borderColor ? textStyles.borderColor :"#0071CE"}`,borderRadius:"50%"}}></div>
                            </Button>
                            {tools === "borderColor" && showSubMenu === "border-tool" && <Picker changeColor={changeSelectedObjectBorderColor}  values={textStyles} type={"border"} setValues={setTextStyles} onclosePopup={onclosePopup}/> }
                        </div>}

                        {!checkIfActiveHasItem("text")  && !checkIfActiveHasItem("layout") && <div className={`${tools === "borderThick" && "active" } has-sub-tools`} title="Border Thickness" onClick={() => onSelectTools("borderThick","border-thick")}>
                            <Button className='editor-Tools' style={{background:"#E5E5E580"}}>
                                {BorderThicknessIcon}
                            </Button>
                            {/* <label>Border Thickness</label> */}

                            {tools === "borderThick" && showSubMenu === "border-thick" && 
                                <div className='border-menu-items'>    
                                    <button className="close-popup-button" onClick={onclosePopup}>
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="24"
                                            height="24"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            style={{ cursor: 'pointer' }}
                                            >
                                            <line x1="18" y1="6" x2="6" y2="18" />
                                            <line x1="6" y1="6" x2="18" y2="18" />
                                        </svg>
                                    </button>
                                    
                                    <div className='border-selector'>
                                    
                                        <CommonDropdown name='font-list' placeholder="Select Border" value={
                                            {
                                                label: textStyles.borderType,
                                                value: textStyles.borderType
                                            }
                                        } options={borderSelector} onChange={(e) => {
                                            setTextStyles((prev) => ({
                                                ...prev,
                                                borderType: e.value
                                            }))
                                            updateObjectBorder("position",e.value)
                                        }} />

                                        <div>
                                            <svg width="14" height="12" viewBox="0 0 14 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <rect y="0.304932" width="14" height="1.16667" fill="#1D1D1B"/>
                                                <rect y="3.22168" width="14" height="2.33333" fill="#1D1D1B"/>
                                                <rect y="7.30493" width="14" height="4.66667" fill="#1D1D1B"/>
                                            </svg>
                                            <input type="number" value={textStyles.borderSize} onChange={(e) => {
                                                let value = e.target.value
                                                if (value < 0) {
                                                    value = 0
                                                }
                                                setTextStyles((prev) => ({
                                                    ...prev,
                                                    borderSize: value
                                                }))
                                                updateObjectBorder("strokeWidth",value)
                                            }}/>
                                        </div>
                                    </div>
                                    <CommonDropdown name='font-list' placeholder="Select Border" value={
                                            {
                                                label: textStyles.borderDashArray,
                                                value: textStyles.borderDashArray
                                            }
                                        } options={borderDashArray} onChange={(e) => {
                                            setTextStyles((prev) => ({
                                                ...prev,
                                                borderDashArray: e.value
                                            }))
                                            updateObjectBorder("borderDashArray",e.value)
                                        }} />
                                    <div className="border-radius-item">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path fill-rule="evenodd" d="M17 5.75C10.787 5.75 5.75 10.787 5.75 17v2a.75.75 0 0 1-1.5 0v-2C4.25 9.958 9.958 4.25 17 4.25h2a.75.75 0 0 1 0 1.5z" clip-rule="evenodd"></path></svg>
                                        <input type="number" value={textStyles?.borderRadius} onChange={(e) => {
                                                let value = e.target.value
                                                if (value < 0) {
                                                    value = 0
                                                }
                                                setTextStyles((prev) => ({
                                                    ...prev,
                                                    borderRadius: value
                                                }))
                                                updateObjectBorder("borderRadius",value)
                                        }}/>
                                    </div>
                                </div>
                            }
                        </div>}

                       {!checkIfActiveHasItem("qrimage")  && <div className={`${tools === "transparancy" && "active"} has-sub-tools`} title="Transparancy" onClick={() => onSelectTools("transparancy", "transparancy")}>
                            
                            <Button className='editor-Tools transparant-icon' style={{background:"#E5E5E580"}}>
                                {TransparentIcon}
                            </Button>
                            {/* <label>transparancy</label> */}

                            {tools === "transparancy" && showSubMenu === "transparancy" && <div className=' opacityRange'>
                                <button className="close-popup-button" onClick={onclosePopup}>
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="24"
                                        height="24"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        style={{ cursor: 'pointer' }}
                                        >
                                            <line x1="18" y1="6" x2="6" y2="18" />
                                            <line x1="6" y1="6" x2="18" y2="18" />
                                        </svg>
                                </button>
                                <input type="range" min="0" max="100" step="1" value={textStyles.opacity || 100} onChange={changeOpacity} />
                                <input type="number" value={textStyles.opacity || 100} onChange={changeOpacity}/>
                            </div>}
                        </div>}

                        {!checkIfActiveHasItem("qrimage")  && <div className={`${tools === "layers" && "active"} has-sub-tools`} title="Layers"  onClick={() => onSelectTools("layers", "layers")}>
                            <Button className='editor-Tools transparant-icon' style={{background:"#E5E5E580"}}>
                               <svg width="24" height="24" viewBox="0 0 24 24"><path fill="#6A6D73" d="m19.474 12.838 1.697.835a1 1 0 0 1 0 1.795L13.32 19.33a3 3 0 0 1-2.649 0L2.82 15.468a1 1 0 0 1 0-1.795l1.697-.835 1.698.836-1.821.896 6.94 3.415a1.5 1.5 0 0 0 1.324 0l6.94-3.415-1.822-.896 1.7-.836ZM13.32 4.673l7.852 3.864a1 1 0 0 1 0 1.794l-7.852 3.864a3 3 0 0 1-2.649 0L2.82 10.33a1 1 0 0 1 0-1.794l7.851-3.864a3 3 0 0 1 2.65 0Zm-1.986 8.176a1.5 1.5 0 0 0 1.324 0l6.94-3.415-6.94-3.415a1.5 1.5 0 0 0-1.324 0l-6.94 3.415 6.94 3.415Z"></path></svg>
                            </Button>
                            {tools === "layers" && showSubMenu === "layers" && <div className='layer-selector' style={{ width: "150px" }}>
                                <button className="close-popup-button" onClick={onclosePopup}>
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="24"
                                        height="24"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <line x1="18" y1="6" x2="6" y2="18" />
                                        <line x1="6" y1="6" x2="18" y2="18" />
                                    </svg>
                                </button>

                                <div  title="Backward" onClick={sendBackward}>
                                    <Button className='editor-Tools transparant-icon' style={{ background: "#E5E5E580" }}>
                                        <svg width="24" height="24" viewBox="0 0 24 24"><path fill="#6A6D73" d="M12.75 18.12V9.75a.75.75 0 1 0-1.5 0v8.37l-2.26-2.25a.75.75 0 0 0-1.06 1.06l2.83 2.82c.68.69 1.79.69 2.47 0l2.83-2.82A.75.75 0 0 0 15 15.87l-2.25 2.25zM15 11.85v1.67l6.18-3.04a1 1 0 0 0 0-1.79l-7.86-3.86a3 3 0 0 0-2.64 0L2.82 8.69a1 1 0 0 0 0 1.8L9 13.51v-1.67L4.4 9.6l6.94-3.42c.42-.2.9-.2 1.32 0L19.6 9.6 15 11.85z"></path></svg>
                                    </Button>
                                </div>

                                <div title="Forward" onClick={bringForward}>
                                    <Button className='editor-Tools transparant-icon' style={{ background: "#E5E5E580" }}>
                                        <svg width="24" height="24" viewBox="0 0 24 24"><path fill="#6A6D73" d="M12.75 5.82v8.43a.75.75 0 1 1-1.5 0V5.81L8.99 8.07A.75.75 0 1 1 7.93 7l2.83-2.83a1.75 1.75 0 0 1 2.47 0L16.06 7A.75.75 0 0 1 15 8.07l-2.25-2.25zM15 10.48l6.18 3.04a1 1 0 0 1 0 1.79l-7.86 3.86a3 3 0 0 1-2.64 0l-7.86-3.86a1 1 0 0 1 0-1.8L9 10.49v1.67L4.4 14.4l6.94 3.42c.42.2.9.2 1.32 0l6.94-3.42-4.6-2.26v-1.67z"></path></svg>
                                    </Button>
                                </div>
                                
                                <div title="To Front" onClick={bringToFront}>
                                    <Button className='editor-Tools transparant-icon' style={{ background: "#E5E5E580" }}>
                                        <svg width="24" height="24" viewBox="0 0 24 24"><path fill="#6A6D73" d="M12.75 3.82v9.43a.75.75 0 1 1-1.5 0V3.81L8.99 6.07A.75.75 0 1 1 7.93 5l2.83-2.83a1.75 1.75 0 0 1 2.47 0L16.06 5A.75.75 0 0 1 15 6.07l-2.25-2.25zM15 8.48l6.18 3.04a1 1 0 0 1 0 1.79l-7.86 3.86a3 3 0 0 1-2.64 0l-7.86-3.86a1 1 0 0 1 0-1.8L9 8.49v1.67L4.4 12.4l6.94 3.42c.42.2.9.2 1.32 0l6.94-3.42-4.6-2.26V8.48zm4.48 7.34 1.7.83a1 1 0 0 1 0 1.8l-7.86 3.86a3 3 0 0 1-2.64 0l-7.86-3.86a1 1 0 0 1 0-1.8l1.7-.83 1.7.83-1.82.9 6.94 3.41c.42.2.9.2 1.32 0l6.94-3.41-1.82-.9 1.7-.83z"></path></svg>
                                    </Button>
                                </div>
                                
                                <div title="To Back"  onClick={sendToBack}>
                                    <Button className='editor-Tools transparant-icon' style={{ background: "#E5E5E580" }}>
                                        <svg width="24" height="24" viewBox="0 0 24 24"><path fill="#6A6D73" d="m19.48 10.82 1.7.83a1 1 0 0 1 0 1.8L15 16.49V14.8l4.6-2.26-1.82-.9 1.7-.83zm-14.96 0-1.7.83a1 1 0 0 0 0 1.8L9 16.49V14.8l-4.6-2.26 1.82-.9-1.7-.83zm8.23 9.5L15 18.07a.75.75 0 0 1 1.06 1.06l-2.83 2.83c-.68.68-1.79.68-2.47 0l-2.83-2.83a.75.75 0 0 1 1.06-1.06l2.26 2.26V6.9a.75.75 0 1 1 1.5 0v13.43zM15 11.35V9.68l4.6-2.27L12.66 4c-.42-.2-.9-.2-1.32 0L4.4 7.4 9 9.68v1.67L2.82 8.3a1 1 0 0 1 0-1.8l7.86-3.86a3 3 0 0 1 2.64 0l7.86 3.87a1 1 0 0 1 0 1.79L15 11.35z"></path></svg>
                                    </Button>
                                </div>

                            </div>}
                        </div>}

                    </>}
                </div>
            </div>}
            

            <div>
                <canvas ref={canvasRef} style={{ overflow: "hidden" }} />
            </div>
        </div>
    );
};

export default CanvasEditor;

const DrawingTools = ({subTools,onSelectSubTools,tabitem="shapes"}) => {
    const [tab, setTab] = useState("shapes");

    useEffect(() => {
        setTab(tabitem)
    },[tabitem])

    const handleChange = (newColor) => {
        if (type === "color") {
            setValues((prev) => ({
                ...prev,
                color: newColor
            }))
        }else if (type === "border") {
            setValues((prev) => ({
                ...prev,
                borderColor: newColor
            }))
        }
        setColor(newColor);
        if(tab == "gradient"){
            changeColor(newColor,"gradient")
        } else {            
            changeColor(newColor)
        }
    };

    return <>
        <div className='shapes-list-container'>
            {/* <div className='tool-tab-selector'>
                <button className={tab === "shapes" && "active"} onClick={()=> setTab("shapes")}>Shape</button>
                <button className={tab === "Lines" && "active"} onClick={()=> setTab("Lines")}>Lines</button>
            </div> */}
            <div className='sub-tools'>
                <div className="sub-tool-item">
                    {tab === "Lines" && <div className='lines-tool'>
                        <div className={subTools === "line1" && "active"  } onClick={() => onSelectSubTools("line1")}>
                            <svg width="80" height="1" viewBox="0 0 80 1" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <line x1="0.00146484" y1="0.5" x2="80.0015" y2="0.5" stroke="#6A6D73"/>
                            </svg>
                        </div>

                        <div className={subTools === "line2" && "active" } onClick={() => onSelectSubTools("line2")}>
                            <svg width="80" height="1" viewBox="0 0 80 1" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <line x1="0.501465" y1="0.5" x2="79.5015" y2="0.5" stroke="#6A6D73" stroke-linecap="square" stroke-dasharray="1 8"/>
                            </svg>
                        </div>

                        <div className={subTools === "line3" && "active" } onClick={() => onSelectSubTools("line3")}>
                            <svg width="80" height="1" viewBox="0 0 80 1" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <line x1="0.501465" y1="0.5" x2="79.5015" y2="0.5" stroke="#6A6D73" stroke-linecap="square" stroke-dasharray="7 7"/>
                            </svg>
                        </div>

                        <div className={subTools === "line4" && "active" } onClick={() => onSelectSubTools("line4")}>
                            <svg width="81" height="8" viewBox="0 0 81 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M80.355 4.35355C80.5503 4.15829 80.5503 3.84171 80.355 3.64645L77.173 0.464466C76.9778 0.269204 76.6612 0.269204 76.4659 0.464466C76.2707 0.659728 76.2707 0.976311 76.4659 1.17157L79.2944 4L76.4659 6.82843C76.2707 7.02369 76.2707 7.34027 76.4659 7.53553C76.6612 7.7308 76.9778 7.7308 77.173 7.53553L80.355 4.35355ZM0.00146484 4.5H80.0015V3.5H0.00146484V4.5Z" fill="#6A6D73"/>
                            </svg>
                        </div>

                        <div className={subTools === "line5" && "active" } onClick={() => onSelectSubTools("line5")}>
                            <svg width="82" height="8" viewBox="0 0 82 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M1.00146 3.5H0.501465V4.5H1.00146V3.5ZM81.355 4.35355C81.5503 4.15829 81.5503 3.84171 81.355 3.64645L78.173 0.464466C77.9778 0.269204 77.6612 0.269204 77.4659 0.464466C77.2707 0.659728 77.2707 0.976311 77.4659 1.17157L80.2944 4L77.4659 6.82843C77.2707 7.02369 77.2707 7.34027 77.4659 7.53553C77.6612 7.7308 77.9778 7.7308 78.173 7.53553L81.355 4.35355ZM1.49529 4.5H1.99529V3.5H1.49529V4.5ZM9.39653 3.5H8.89653V4.5H9.39653V3.5ZM10.3842 4.5H10.8842V3.5H10.3842V4.5ZM18.2854 3.5H17.7854V4.5H18.2854V3.5ZM19.2731 4.5H19.7731V3.5H19.2731V4.5ZM27.1743 3.5H26.6743V4.5H27.1743V3.5ZM28.162 4.5H28.662V3.5H28.162V4.5ZM36.0632 3.5H35.5632V4.5H36.0632V3.5ZM37.0508 4.5H37.5508V3.5H37.0508V4.5ZM44.9521 3.5H44.4521V4.5H44.9521V3.5ZM45.9397 4.5H46.4397V3.5H45.9397V4.5ZM53.841 3.5H53.341V4.5H53.841V3.5ZM54.8286 4.5H55.3286V3.5H54.8286V4.5ZM62.7299 3.5H62.2299V4.5H62.7299V3.5ZM63.7175 4.5H64.2175V3.5H63.7175V4.5ZM71.6188 3.5H71.1188V4.5H71.6188V3.5ZM72.6064 4.5H73.1064V3.5H72.6064V4.5ZM80.5076 3.5H80.0076V4.5H80.5076V3.5ZM1.00146 4.5H1.49529V3.5H1.00146V4.5ZM9.39653 4.5H10.3842V3.5H9.39653V4.5ZM18.2854 4.5H19.2731V3.5H18.2854V4.5ZM27.1743 4.5H28.162V3.5H27.1743V4.5ZM36.0632 4.5H37.0508V3.5H36.0632V4.5ZM44.9521 4.5H45.9397V3.5H44.9521V4.5ZM53.841 4.5H54.8286V3.5H53.841V4.5ZM62.7299 4.5H63.7175V3.5H62.7299V4.5ZM71.6188 4.5H72.6064V3.5H71.6188V4.5ZM80.5076 4.5H81.0015V3.5H80.5076V4.5Z" fill="#6A6D73"/>
                            </svg>
                        </div>

                        <div className={subTools === "line6" && "active" } onClick={() => onSelectSubTools("line6")}>
                            <svg width="82" height="8" viewBox="0 0 82 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M1.00146 3.5H0.501465V4.5H1.00146V3.5ZM81.355 4.35355C81.5503 4.15829 81.5503 3.84171 81.355 3.64645L78.173 0.464466C77.9778 0.269204 77.6612 0.269204 77.4659 0.464466C77.2707 0.659728 77.2707 0.976311 77.4659 1.17157L80.2944 4L77.4659 6.82843C77.2707 7.02369 77.2707 7.34027 77.4659 7.53553C77.6612 7.7308 77.9778 7.7308 78.173 7.53553L81.355 4.35355ZM4.3348 4.5H4.8348V3.5H4.3348V4.5ZM11.0015 3.5H10.5015V4.5H11.0015V3.5ZM17.6681 4.5H18.1681V3.5H17.6681V4.5ZM24.3348 3.5H23.8348V4.5H24.3348V3.5ZM31.0015 4.5H31.5015V3.5H31.0015V4.5ZM37.6681 3.5H37.1681V4.5H37.6681V3.5ZM44.3348 4.5H44.8348V3.5H44.3348V4.5ZM51.0015 3.5H50.5015V4.5H51.0015V3.5ZM57.6681 4.5H58.1681V3.5H57.6681V4.5ZM64.3348 3.5H63.8348V4.5H64.3348V3.5ZM71.0015 4.5H71.5015V3.5H71.0015V4.5ZM77.6681 3.5H77.1681V4.5H77.6681V3.5ZM1.00146 4.5H4.3348V3.5H1.00146V4.5ZM11.0015 4.5H17.6681V3.5H11.0015V4.5ZM24.3348 4.5H31.0015V3.5H24.3348V4.5ZM37.6681 4.5H44.3348V3.5H37.6681V4.5ZM51.0015 4.5H57.6681V3.5H51.0015V4.5ZM64.3348 4.5H71.0015V3.5H64.3348V4.5ZM77.6681 4.5H81.0015V3.5H77.6681V4.5Z" fill="#6A6D73"/>
                            </svg>
                        </div>

                        <div className={subTools === "line7" && "active" } onClick={() => onSelectSubTools("line7")}>
                            <svg width="82" height="8" viewBox="0 0 82 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M0.647911 3.64645C0.452649 3.84171 0.452649 4.15829 0.647911 4.35355L3.82989 7.53553C4.02515 7.7308 4.34174 7.7308 4.537 7.53553C4.73226 7.34027 4.73226 7.02369 4.537 6.82843L1.70857 4L4.537 1.17157C4.73226 0.976311 4.73226 0.659728 4.537 0.464466C4.34174 0.269204 4.02515 0.269204 3.82989 0.464466L0.647911 3.64645ZM81.355 4.35355C81.5503 4.15829 81.5503 3.84171 81.355 3.64645L78.173 0.464466C77.9778 0.269204 77.6612 0.269204 77.4659 0.464466C77.2707 0.659728 77.2707 0.976311 77.4659 1.17157L80.2944 4L77.4659 6.82843C77.2707 7.02369 77.2707 7.34027 77.4659 7.53553C77.6612 7.7308 77.9778 7.7308 78.173 7.53553L81.355 4.35355ZM1.00146 4.5H81.0015V3.5H1.00146V4.5Z" fill="#6A6D73"/>
                            </svg>
                        </div>
                        
                        <div className={subTools === "line8" && "active"} onClick={() => onSelectSubTools("line8")}>
                            <svg width="82" height="8" viewBox="0 0 82 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M0.647911 3.64645C0.452649 3.84171 0.452649 4.15829 0.647911 4.35355L3.82989 7.53553C4.02515 7.7308 4.34174 7.7308 4.537 7.53553C4.73226 7.34027 4.73226 7.02369 4.537 6.82843L1.70857 4L4.537 1.17157C4.73226 0.976311 4.73226 0.659728 4.537 0.464466C4.34174 0.269204 4.02515 0.269204 3.82989 0.464466L0.647911 3.64645ZM81.355 4.35355C81.5503 4.15829 81.5503 3.84171 81.355 3.64645L78.173 0.464466C77.9778 0.269204 77.6612 0.269204 77.4659 0.464466C77.2707 0.659728 77.2707 0.976311 77.4659 1.17157L80.2944 4L77.4659 6.82843C77.2707 7.02369 77.2707 7.34027 77.4659 7.53553C77.6612 7.7308 77.9778 7.7308 78.173 7.53553L81.355 4.35355ZM1.49529 4.5H1.99529V3.5H1.49529V4.5ZM9.39653 3.5H8.89653V4.5H9.39653V3.5ZM10.3842 4.5H10.8842V3.5H10.3842V4.5ZM18.2854 3.5H17.7854V4.5H18.2854V3.5ZM19.2731 4.5H19.7731V3.5H19.2731V4.5ZM27.1743 3.5H26.6743V4.5H27.1743V3.5ZM28.162 4.5H28.662V3.5H28.162V4.5ZM36.0632 3.5H35.5632V4.5H36.0632V3.5ZM37.0508 4.5H37.5508V3.5H37.0508V4.5ZM44.9521 3.5H44.4521V4.5H44.9521V3.5ZM45.9397 4.5H46.4397V3.5H45.9397V4.5ZM53.841 3.5H53.341V4.5H53.841V3.5ZM54.8286 4.5H55.3286V3.5H54.8286V4.5ZM62.7299 3.5H62.2299V4.5H62.7299V3.5ZM63.7175 4.5H64.2175V3.5H63.7175V4.5ZM71.6188 3.5H71.1188V4.5H71.6188V3.5ZM72.6064 4.5H73.1064V3.5H72.6064V4.5ZM80.5076 3.5H80.0076V4.5H80.5076V3.5ZM1.00146 4.5H1.49529V3.5H1.00146V4.5ZM9.39653 4.5H10.3842V3.5H9.39653V4.5ZM18.2854 4.5H19.2731V3.5H18.2854V4.5ZM27.1743 4.5H28.162V3.5H27.1743V4.5ZM36.0632 4.5H37.0508V3.5H36.0632V4.5ZM44.9521 4.5H45.9397V3.5H44.9521V4.5ZM53.841 4.5H54.8286V3.5H53.841V4.5ZM62.7299 4.5H63.7175V3.5H62.7299V4.5ZM71.6188 4.5H72.6064V3.5H71.6188V4.5ZM80.5076 4.5H81.0015V3.5H80.5076V4.5Z" fill="#6A6D73"/>
                            </svg>
                        </div>
                        
                        <div className={subTools === "line9" && "active"} onClick={() => onSelectSubTools("line9")}>
                            <svg width="82" height="8" viewBox="0 0 82 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M0.647911 3.64645C0.452649 3.84171 0.452649 4.15829 0.647911 4.35355L3.82989 7.53553C4.02515 7.7308 4.34174 7.7308 4.537 7.53553C4.73226 7.34027 4.73226 7.02369 4.537 6.82843L1.70857 4L4.537 1.17157C4.73226 0.976311 4.73226 0.659728 4.537 0.464466C4.34174 0.269204 4.02515 0.269204 3.82989 0.464466L0.647911 3.64645ZM81.355 4.35355C81.5503 4.15829 81.5503 3.84171 81.355 3.64645L78.173 0.464466C77.9778 0.269204 77.6612 0.269204 77.4659 0.464466C77.2707 0.659728 77.2707 0.976311 77.4659 1.17157L80.2944 4L77.4659 6.82843C77.2707 7.02369 77.2707 7.34027 77.4659 7.53553C77.6612 7.7308 77.9778 7.7308 78.173 7.53553L81.355 4.35355ZM4.3348 4.5H4.8348V3.5H4.3348V4.5ZM11.0015 3.5H10.5015V4.5H11.0015V3.5ZM17.6681 4.5H18.1681V3.5H17.6681V4.5ZM24.3348 3.5H23.8348V4.5H24.3348V3.5ZM31.0015 4.5H31.5015V3.5H31.0015V4.5ZM37.6681 3.5H37.1681V4.5H37.6681V3.5ZM44.3348 4.5H44.8348V3.5H44.3348V4.5ZM51.0015 3.5H50.5015V4.5H51.0015V3.5ZM57.6681 4.5H58.1681V3.5H57.6681V4.5ZM64.3348 3.5H63.8348V4.5H64.3348V3.5ZM71.0015 4.5H71.5015V3.5H71.0015V4.5ZM77.6681 3.5H77.1681V4.5H77.6681V3.5ZM1.00146 4.5H4.3348V3.5H1.00146V4.5ZM11.0015 4.5H17.6681V3.5H11.0015V4.5ZM24.3348 4.5H31.0015V3.5H24.3348V4.5ZM37.6681 4.5H44.3348V3.5H37.6681V4.5ZM51.0015 4.5H57.6681V3.5H51.0015V4.5ZM64.3348 4.5H71.0015V3.5H64.3348V4.5ZM77.6681 4.5H81.0015V3.5H77.6681V4.5Z" fill="#6A6D73"/>
                            </svg>
                        </div>

                        <div className={subTools === "line10" && "active" } onClick={() => onSelectSubTools("line10")}>
                            <svg width="80" height="6" viewBox="0 0 80 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M80.0015 3L75.0015 0.113249V5.88675L80.0015 3ZM0.00146484 3.5H75.5015V2.5H0.00146484V3.5Z" fill="#6A6D73"/>
                            </svg>
                        </div>
                        
                        <div className={subTools === "line11" && "active"} onClick={() => onSelectSubTools("line11")}>
                            <svg width="83" height="6" viewBox="0 0 83 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M82.8882 3L80.0015 0.113249L77.1147 3L80.0015 5.88675L82.8882 3ZM0.00146484 3.5H80.0015V2.5H0.00146484V3.5Z" fill="#6A6D73"/>
                            </svg>
                        </div>
                        
                        <div className={subTools === "line12" && "active"} onClick={() => onSelectSubTools("line12")}>
                            <svg width="83" height="6" viewBox="0 0 83 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M77.3348 3C77.3348 4.47276 78.5287 5.66667 80.0015 5.66667C81.4742 5.66667 82.6681 4.47276 82.6681 3C82.6681 1.52724 81.4742 0.333333 80.0015 0.333333C78.5287 0.333333 77.3348 1.52724 77.3348 3ZM0.00146484 3.5H80.0015V2.5H0.00146484V3.5Z" fill="#6A6D73"/>
                            </svg>
                        </div>
                    </div>}
                    {tab === "shapes" && <div className='shape-tool'>
                        <div className={subTools === "draw1" && "active"  } onClick={() => onSelectSubTools("draw1")}>
                            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect width="40" height="40" fill="#6A6D73"/>
                            </svg>
                        </div>

                        <div className={subTools === "draw2" && "active" } onClick={() => onSelectSubTools("draw2")}>
                            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect width="40" height="40" rx="10" fill="#6A6D73"/>
                            </svg>
                        </div>

                        <div className={subTools === "draw3" && "active" } onClick={() => onSelectSubTools("draw3")}>
                            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="20" cy="20" r="20" fill="#6A6D73"/>
                            </svg>
                        </div>

                        <div className={subTools === "draw4" && "active" } onClick={() => onSelectSubTools("draw4")}>
                            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M20 0L40 40H0L20 0Z" fill="#6A6D73"/>
                            </svg>
                        </div>

                        <div className={subTools === "draw5" && "active" } onClick={() => onSelectSubTools("draw5")}>
                            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M20 40L40 0H0L20 40Z" fill="#6A6D73"/>
                            </svg>
                        </div>

                        <div className={subTools === "draw6" && "active" } onClick={() => onSelectSubTools("draw6")}>
                            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M20 0L40 20L20 40L0 20L20 0Z" fill="#6A6D73"/>
                            </svg>
                        </div>

                        <div className={subTools === "draw7" && "active" } onClick={() => onSelectSubTools("draw7")}>
                            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M20 0L40 15.2786L32.3607 40H7.63932L0 15.2786L20 0Z" fill="#6A6D73"/>
                            </svg>
                        </div>

                        <div className={subTools === "draw8" && "active" } onClick={() => onSelectSubTools("draw8")}>
                            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M20 0L40 10V30L20 40L0 30V10L20 0Z" fill="#6A6D73"/>
                            </svg>
                        </div>

                        <div className={subTools === "draw9" && "active" } onClick={() => onSelectSubTools("draw9")}>
                            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M40 20L30 40L10 40L-8.74228e-07 20L10 -1.31134e-06L30 -4.37114e-07L40 20Z" fill="#6A6D73"/>
                            </svg>
                        </div>

                        <div className={subTools === "draw10" && "active" } onClick={() => onSelectSubTools("draw10")}>
                            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M20 0L34.1421 5.85786L40 20L34.1421 34.1421L20 40L5.85786 34.1421L0 20L5.85786 5.85786L20 0Z" fill="#6A6D73"/>
                            </svg>
                        </div>

                        <div className={subTools === "draw11" && "active" } onClick={() => onSelectSubTools("draw11")}>
                            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M20 0L24.7214 15.2786H40L27.6393 24.7214L32.3607 40L20 30.5573L7.63932 40L12.3607 24.7214L0 15.2786H15.2786L20 0Z" fill="#6A6D73"/>
                            </svg>
                        </div>

                        <div className={subTools === "draw12" && "active" } onClick={() => onSelectSubTools("draw12")}>
                            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M20 0L25.4018 14.5982L40 20L25.4018 25.4018L20 40L14.5982 25.4018L0 20L14.5982 14.5982L20 0Z" fill="#6A6D73"/>
                            </svg>
                        </div>

                        <div className={subTools === "draw13" && "active" } onClick={() => onSelectSubTools("draw13")}>
                            <svg width="36" height="40" viewBox="0 0 36 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M18 0L24.8 8.22205L35.3205 10L31.6 20L35.3205 30L24.8 31.7779L18 40L11.2 31.7779L0.679491 30L4.4 20L0.679491 10L11.2 8.22205L18 0Z" fill="#6A6D73"/>
                            </svg>
                        </div>

                        <div className={subTools === "draw14" && "active" } onClick={() => onSelectSubTools("draw14")}>
                            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M20 0L25.7403 6.14181L34.1421 5.85786L33.8582 14.2597L40 20L33.8582 25.7403L34.1421 34.1421L25.7403 33.8582L20 40L14.2597 33.8582L5.85786 34.1421L6.14181 25.7403L0 20L6.14181 14.2597L5.85786 5.85786L14.2597 6.14181L20 0Z" fill="#6A6D73"/>
                            </svg>
                        </div>

                        <div className={subTools === "draw15" && "active" } onClick={() => onSelectSubTools("draw15")}>
                            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M20 0L24.6353 5.73415L31.7557 3.81966L32.1353 11.1832L39.0211 13.8197L35 20L39.0211 26.1803L32.1353 28.8168L31.7557 36.1803L24.6353 34.2658L20 40L15.3647 34.2658L8.2443 36.1803L7.86475 28.8168L0.97887 26.1803L5 20L0.97887 13.8197L7.86475 11.1832L8.2443 3.81966L15.3647 5.73415L20 0Z" fill="#6A6D73"/>
                            </svg>
                        </div>

                        <div className={subTools === "draw16" && "active" } onClick={() => onSelectSubTools("draw16")}>
                            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M0 0H33.3333L40 40H6.66667L0 0Z" fill="#6A6D73"/>
                            </svg>
                        </div>

                        <div className={subTools === "draw17" && "active" } onClick={() => onSelectSubTools("draw17")}>
                            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M6.66667 0H33.3333L40 40H0L6.66667 0Z" fill="#6A6D73"/>
                            </svg>
                        </div>

                        <div className={subTools === "draw18" && "active" } onClick={() => onSelectSubTools("draw18")}>
                            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M6.66667 40H33.3333L40 0H0L6.66667 40Z" fill="#6A6D73"/>
                            </svg>
                        </div>

                        <div className={subTools === "draw19" && "active" } onClick={() => onSelectSubTools("draw19")}>
                            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M0 0H40V20C40 31.0457 31.0457 40 20 40C8.95431 40 0 31.0457 0 20V0Z" fill="#6A6D73"/>
                            </svg>
                        </div>

                        <div className={subTools === "draw20" && "active" } onClick={() => onSelectSubTools("draw20")}>
                            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M0 40H40V20C40 8.95431 31.0457 0 20 0C8.95431 0 0 8.95431 0 20V40Z" fill="#6A6D73"/>
                            </svg>
                        </div>

                        <div className={subTools === "draw21" && "active" } onClick={() => onSelectSubTools("draw21")}>
                            <svg width="40" height="32" viewBox="0 0 40 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M16.6667 0L16.6667 7.2H30H40V16V24.8H30H16.6667V32L0 16L16.6667 0Z" fill="#6A6D73"/>
                            </svg>
                        </div>

                        <div className={subTools === "draw22" && "active" } onClick={() => onSelectSubTools("draw22")}>
                            <svg width="40" height="32" viewBox="0 0 40 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M23.3333 0L23.3333 7.2H10H0V16V24.8H10H23.3333V32L40 16L23.3333 0Z" fill="#6A6D73"/>
                            </svg>
                        </div>

                        <div className={subTools === "draw23" && "active" } onClick={() => onSelectSubTools("draw23")}>
                            <svg width="36" height="40" viewBox="0 0 36 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M0.499999 22.2223L8.375 22.2222L8.375 40L18 40L27.625 40L27.625 22.2222L35.5 22.2222L18 7.64949e-07L0.499999 22.2223Z" fill="#6A6D73"/>
                            </svg>
                        </div>

                        <div className={subTools === "draw24" && "active" } onClick={() => onSelectSubTools("draw24")}>
                            <svg width="36" height="40" viewBox="0 0 36 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M0.499999 17.7777L8.375 17.7778L8.375 -3.44227e-07L18 -7.64949e-07L27.625 -1.18567e-06L27.625 17.7778L35.5 17.7778L18 40L0.499999 17.7777Z" fill="#6A6D73"/>
                            </svg>
                        </div>

                        <div className={subTools === "draw25" && "active" } onClick={() => onSelectSubTools("draw25")}>
                            <svg width="40" height="28" viewBox="0 0 40 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path fill-rule="evenodd" clip-rule="evenodd" d="M15.3333 6.575L15.3334 0.5L0 14L15.3333 27.5V21.425H16.6667H24.6667V27.5L40.0001 14L24.6667 0.5L24.6667 6.575H16.6667H15.3333Z" fill="#6A6D73"/>
                            </svg>
                        </div>
                    </div>}
                </div>
            </div>
        </div>
    </>
}

const Picker = ({values,type,setValues,changeColor,onclosePopup}) => {
    const [color, setColor] = useState('#000000');
    const [tab, setTab] = useState("solid");

    useEffect(() => {
        if (values) {
            if (type === "color") {
                setColor(values.color)
            }
            if (type === "border") {
                setColor(values.borderColor)
            }
                
        }
    }, [values])
    
    const defaultColor = ["#000000", "#545454", "#A6A6A6", "#D9D9D9", "#FFFFFF", "#FF3131", "#FF5757", "#FF66C4", "#CB6CE6", "#5E17EB", "#0097B2", "#0CC0DF", "#38B6FF", "#5271FF", "#004AAD", "#00BF63", "#7ED957", "#FFDE59", "#FFBD59", "#FF914D"]
    const gradientCdefaultGradients = [
        "linear-gradient(270deg, #000000 0%, #666666 100%)",
        "linear-gradient(270deg, #1E1603 0%, #B98615 100%)",
        "linear-gradient(270deg, #3331C5 0%, #060619 100%)",
        "linear-gradient(270deg, #D9D9D9 0%, #737373 100%)",
        "linear-gradient(270deg, #C2F1DF 0%, #98BEFC 100%)",
        "linear-gradient(270deg, #FF4F39 0%, #FF8C4B 100%)",
        "linear-gradient(270deg, #766EF2 0%, #F16EC2 100%)",
        "linear-gradient(270deg, #3052BB 0%, #993D76 100%)",
        "linear-gradient(270deg, #836CFA 0%, #B98615 100%)",
        "linear-gradient(270deg, #56D4E2 0%, #0450AF 100%)",
        "linear-gradient(270deg, #7663E6 0%, #05BA67 100%)",
        "linear-gradient(270deg, #44C7C0 0%, #F5DC5E 100%)",
        "linear-gradient(270deg, #FFD057 0%, #FF994E 100%)",
        "linear-gradient(270deg, #FF7BB1 0%, #FFD461 100%)",
        "linear-gradient(270deg, #9B5AE8 0%, #F38A5F 100%)",
        "linear-gradient(270deg, #FF914D 0%, #05BA67 100%)",
        "linear-gradient(270deg, #38B6FF 0%, #FFDE59 100%)",
        "linear-gradient(270deg, #004AAD 0%, #FF914D 100%)",
        "linear-gradient(270deg, #7ED957 0%, #FF914D 100%)",
        "linear-gradient(270deg, #7663E6 0%, #05BA67 100%)",
    ]

    const handleChange = (newColor) => {
        if (type === "color") {
            setValues((prev) => ({
                ...prev,
                color: newColor
            }))
        }else if (type === "border") {
            setValues((prev) => ({
                ...prev,
                borderColor: newColor
            }))
        }
        setColor(newColor);
        if(tab == "gradient"){
            changeColor(newColor,"gradient")
        } else {            
            changeColor(newColor)
        }
    };

    const handleEyedropper = async () => {
        if (!window.EyeDropper) {
            alert('EyeDropper API not supported in this browser.');
            return;
        }

        try {
            const eyeDropper = new window.EyeDropper();
            const result = await eyeDropper.open();
            handleChange(result.sRGBHex);
            // onChange && onChange(result.sRGBHex);
        } catch (err) {
            console.error('Eyedropper cancelled or failed:', err);
        }
    };
    
    const [open, setOpen] = useState(false);
    const [angle, setAngle] = useState(270); 
    const [palette, setPalette] = useState([
        { offset: 0, color: "#ff0000" },
        { offset: 1, color: "#0000ff" }
    ]);

    useEffect(() => {
        if (tab == "gradient") {
            const gradient = `linear-gradient(${angle}deg, ${palette
                .map(({ color, offset }) => `${color} ${offset * 100}%`)
                .join(', ')})`;
            handleChange(gradient)
        }
    }, [palette,angle])
    

    const handleColorChange = (newColor, index) => {
        if (!index) {
            const stops = [...newColor.matchAll(/(#(?:[0-9a-fA-F]{3,6}))\s+([0-9.]+)%/g)];
            const palette = stops.map(([, color, offset]) => ({
              color,
              offset: parseFloat(offset) / 100
            }));
            setPalette(palette);
        } else {
            const isValidHex = (hex) => /^#([0-9A-F]{3}){1,2}$/i.test(hex);
            if (!isValidHex(newColor)) return;
            const newPalette = [...palette];
            newPalette[index] = {
                ...newPalette[index],
                color: newColor
            };
            setPalette(newPalette);
        }
    };

    return <div className={`color-list-container ${open ? "show" : ""}`}>
        {type === "color" && <div className='tool-tab-selector'>
            <button className={tab === "solid" && "active"} onClick={()=> setTab("solid")}>Solid Colour</button>
            <button className={tab === "gradient" && "active"} onClick={()=> setTab("gradient")}>Gradient</button>
        </div>}

        <button className="close-popup-button" onClick={onclosePopup}>
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ cursor: 'pointer' }}
                >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
        </button>

        <div className='color-list'>
            {
                tab === "solid" && <>
                    {defaultColor.map((item) => {
                        return <button className='color-circles' onClick={(e) => {
                            e.stopPropagation()
                            handleChange(item)
                        }} style={{
                            background: item,
                            width: "40px",
                            height:"40px"
                        }}></button>
                    })}
                </>
            }

            {
                tab === "gradient" && <>
                    {gradientCdefaultGradients.map((item) => {
                        return <button className='color-circles' onClick={(e) => {
                            e.stopPropagation()
                            handleColorChange(item)
                        }} style={{
                            background: item,
                            width: "40px",
                            height:"40px"
                        }}></button>
                    })}
                </>
            }
        </div>

        <div className="sketch-picker-item" style={{ position: 'relative', width: 'fit-content' }}>
            {tab === "solid" && <>
                <SketchPicker color={color} onChange={(e) => {
                    handleChange(e.hex)
                }} />

                <div className='selected-color-item' style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    
                    <div>
                        <div
                            style={{
                                width: '16px',
                                height: '16px',
                                backgroundColor: color,
                                border: '1px solid #ccc',
                                borderRadius: '50%',
                            }}
                        />
                        <input
                            type="text"
                            value={color}
                            onChange={(e) => handleChange({ hex: e.target.value })}
                            style={{ width: '100px' }}
                        />
                    </div>
                    <button onClick={handleEyedropper} title="Eyedropper Tool">
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fill-rule="evenodd" clip-rule="evenodd" d="M13.0355 1.40386C14.0187 0.42072 15.6127 0.42072 16.5958 1.40386C17.5789 2.38699 17.5789 3.98097 16.5958 4.9641L14.7513 6.80858L15.6896 7.74692C15.9221 7.97936 15.9221 8.35626 15.6896 8.5887L13.8774 10.401C13.7657 10.5126 13.6144 10.5754 13.4564 10.5754C13.2986 10.5754 13.1472 10.5126 13.0355 10.401L12.5103 9.87578L3.9514 16.8785C3.15167 17.5329 1.98625 17.4747 1.2556 16.7441C0.524955 16.0134 0.46683 14.848 1.12114 14.0483L8.12388 5.48936L7.59864 4.9641C7.3662 4.73165 7.3662 4.35476 7.59864 4.12231L9.41096 2.31001C9.52257 2.19838 9.674 2.13567 9.83185 2.13567C9.98971 2.13567 10.1411 2.19838 10.2527 2.31001L11.1911 3.24834L13.0355 1.40386ZM8.96989 6.33531L6.08513 9.8612L9.52245 10.7822L11.6644 9.02977L8.96989 6.33531Z" fill="#6A6D73"/>
                        </svg>
                    </button>
                </div>
            </>}

            {tab === "gradient" &&  <>
                <div>
                    <GradientPickerPopover
                        open={true}
                        setOpen={setOpen}
                        angle={angle}
                        setAngle={setAngle}
                        width={270}
                        maxStops={3}
                        paletteHeight={40}
                        palette={palette}
                        onPaletteChange={setPalette}
                    />  
                </div>
                            
                <div className='selected-color-item gradient' style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    
                    <div>
                        <div
                            style={{
                                width: '16px',
                                height: '16px',
                                backgroundColor: palette[0].color,
                                border: '1px solid #ccc',
                                borderRadius: '50%',
                            }}
                        />
                        <input
                            type="text"
                            value={palette[0].color}
                            onChange={(e) => handleColorChange(e?.target?.value,0)}
                            style={{ width: '100px' }}
                        />
                    </div>
                    <input
                        type="text"
                        value={`${ Number.isInteger(palette[0].offset * 100) ? palette[0].offset * 100 : (palette[0].offset * 100).toFixed(2)}%`}
                        style={{ width: '50px !important' }}
                        readOnly
                    />
                </div>
                <div className='selected-color-item gradient' style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    
                    <div>
                        <div
                            style={{
                                width: '16px',
                                height: '16px',
                                backgroundColor: palette[1].color,
                                border: '1px solid #ccc',
                                borderRadius: '50%',
                            }}
                        />
                        <input
                            type="text"
                            value={palette[1].color}
                            onChange={(e) => handleColorChange(e?.target?.value,1)}
                            style={{ width: '100px' }}
                        />
                    </div>
                    <input
                        type="text"
                        value={`${ Number.isInteger(palette[1].offset * 100) ? palette[1].offset * 100 : (palette[1].offset * 100).toFixed(2)}%`}
                        style={{ width: '50px !important' }}
                        readOnly

                    />
                    
                </div>
            </>
            }
        </div>
    </div>
}



const ArrowIcon = <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.8751 15.1972L12.5781 9.90028C12.4126 9.73471 12.4126 9.47889 12.5781 9.32844L16.1145 5.79208C16.3251 5.58144 16.2499 5.22024 15.9639 5.11492L1.05114 0.0436637C0.434168 -0.167034 -0.167799 0.41987 0.0428987 1.0519L5.12922 15.9346C5.21947 16.2205 5.59568 16.3108 5.80638 16.0851L9.31261 12.5789C9.47812 12.4133 9.73395 12.4133 9.88445 12.5789L15.1965 17.8759C15.362 18.0414 15.6178 18.0414 15.7683 17.8759L17.875 15.7691C18.0406 15.6036 18.0406 15.3477 17.8751 15.1972Z" fill="#6A6D73"/>
</svg>

const PencilIcon = <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M14.2789 0.0183758C14.0044 0.06415 13.7603 0.155698 13.5239 0.30065C13.2722 0.46086 11.9298 1.78831 11.8383 1.96378C11.7544 2.13925 11.7544 2.3376 11.8307 2.49018C11.8612 2.55121 12.7002 3.40567 13.684 4.38981C15.606 6.3047 15.5984 6.3047 15.934 6.21315C16.0789 6.175 16.239 6.03005 16.8797 5.38921C17.4975 4.77126 17.6805 4.55765 17.7873 4.34404C17.9551 4.00073 18.0237 3.65742 17.9932 3.29123C17.9475 2.65802 17.7797 2.41389 16.6128 1.25428C15.667 0.315908 15.4763 0.170956 15.0798 0.071779C14.8204 0.00311774 14.5077 -0.0197693 14.2789 0.0183758Z" fill="#C7C7C8"/>
    <path d="M10.4728 3.32943C10.2745 3.42861 1.05364 12.6826 0.885852 12.9496C0.809583 13.0717 0.710434 13.2777 0.664672 13.3998C0.565523 13.6973 -0.0293746 17.5118 0.00113296 17.6568C0.0468943 17.8398 0.25282 18.0001 0.428239 18.0001C0.672299 18.0001 4.24931 17.4508 4.48574 17.3745C5.08827 17.1838 4.89759 17.3668 9.93897 12.3241C14.0422 8.21964 14.6753 7.5788 14.7134 7.42622C14.8125 7.07529 14.8125 7.07529 12.9058 5.1604C11.9372 4.19151 11.083 3.36758 11.0144 3.32943C10.8542 3.25314 10.6406 3.25314 10.4728 3.32943Z" fill="#6A6D73"/>
</svg>

const EditIcon = <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8.775 4.5H8.1H4.5C2.016 4.5 0 6.516 0 9V13.5C0 15.984 2.016 18 4.5 18H9C11.484 18 13.5 15.984 13.5 13.5V9.9V9.225C13.5 6.615 11.385 4.5 8.775 4.5Z" fill="#C7C7C8"/>
    <path d="M13.05 0C10.467 0 8.35195 1.98 8.12695 4.5H8.77495C11.385 4.5 13.5 6.615 13.5 9.225V9.873C16.02 9.648 18 7.524 18 4.95C18 2.214 15.786 0 13.05 0Z" fill="#6A6D73"/>
</svg>

const EraseIcon = <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.192 17.9999H9.77282C9.3302 17.9999 8.98242 17.6594 8.98242 17.2488C8.98242 16.8383 9.34073 16.4978 9.77282 16.4978H17.192C17.6346 16.4978 17.9824 16.8383 17.9824 17.2488C17.9824 17.6594 17.6346 17.9999 17.192 17.9999Z" fill="#6A6D73"/>
    <path d="M12.0699 12.9247L7.79396 17.2066C6.79473 18.2072 5.19242 18.2613 4.13019 17.3689C4.06717 17.3148 4.01316 17.2607 3.95915 17.2066L3.17598 16.4223L1.56458 14.8087L0.79042 14.0335C0.727406 13.9704 0.673391 13.9073 0.619379 13.8442C-0.262818 12.7805 -0.199802 11.1939 0.79042 10.2023L4.11216 6.88498L5.06638 5.92944L12.0699 12.9247Z" fill="#C7C7C8"/>
    <path d="M17.2101 7.78629L12.0699 12.9246L5.06641 5.9293L10.2066 0.791024C11.2598 -0.263675 12.9882 -0.263675 14.0414 0.791024L17.2101 3.95512C18.2634 5.00982 18.2634 6.73159 17.2101 7.78629Z" fill="#6A6D73"/>
</svg>

const TextIcon = <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fill-rule="evenodd" clip-rule="evenodd" d="M2.63344 1.74193C2.08196 1.74193 1.63636 2.21351 1.63636 2.80068V4.49734C1.63636 4.97837 1.27005 5.36831 0.818181 5.36831C0.366312 5.36831 0 4.97837 0 4.49734V2.80068C0 1.24373 1.1855 0 2.63344 0H15.3666C16.8284 0 18 1.25853 18 2.80068V4.49734C18 4.97837 17.6337 5.36831 17.1818 5.36831C16.7299 5.36831 16.3636 4.97837 16.3636 4.49734V2.80068C16.3636 2.21735 15.9216 1.74193 15.3666 1.74193H2.63344Z" fill="#6A6D73"/>
    <path fill-rule="evenodd" clip-rule="evenodd" d="M8.99987 0.773682C9.4809 0.773682 9.87084 1.16363 9.87084 1.64465V17.129C9.87084 17.61 9.4809 18 8.99987 18C8.51885 18 8.12891 17.61 8.12891 17.129V1.64465C8.12891 1.16363 8.51885 0.773682 8.99987 0.773682Z" fill="#6A6D73"/>
    <path fill-rule="evenodd" clip-rule="evenodd" d="M4.45605 17.129C4.45605 16.648 4.846 16.2581 5.32702 16.2581H12.673C13.154 16.2581 13.544 16.648 13.544 17.129C13.544 17.61 13.154 18 12.673 18H5.32702C4.846 18 4.45605 17.61 4.45605 17.129Z" fill="#6A6D73"/>
</svg>

const BorderThicknessIcon = <svg width="18" height="16" viewBox="0 0 18 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect y="0.677734" width="18" height="1.5" fill="#26A3DB"/>
    <rect y="4.42773" width="18" height="3" fill="#26A3DB"/>
    <rect y="9.67773" width="18" height="6" fill="#26A3DB"/>
</svg>

const TransparentIcon = <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g fill="currentColor" fill-rule="evenodd"><path d="M3 2h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1zm0 8h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1zm0 8h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1z"></path><path d="M11 2h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1zm0 8h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1zm0 8h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1z" opacity=".45"></path><path d="M19 2h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1zm0 8h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1zm0 8h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1z" opacity=".15"></path><path d="M7 6h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1zm0 8h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1z" opacity=".7"></path><path d="M15 6h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1zm0 8h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1z" opacity=".3"></path></g></svg>





