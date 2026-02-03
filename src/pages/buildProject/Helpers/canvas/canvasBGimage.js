import { removeFabricObjectsByName } from "../bringFabricObjects";
import { fabric } from "fabric";
import testSVG from '../../../../assets/img/testSVG.svg'


const canvasBGimage = (
    canvas,
    projectSettings,
    addNewFloor,
    selFloorPlanDtls,
    canvasContainerRef,
    activeTab,
    imgSrc,
    zoom,
    bgColor,
    scaleX,
    scaleY,
    zoomInOut,
    svgFile
) => {

    if (!canvas.current) return
    
    if (imgSrc && canvas.current) {
        const isSvg = imgSrc.endsWith('.svg')
        
        if (isSvg) {
            const svg_Blob = selFloorPlanDtls?.get_svg ?? ''
            /* Add svg as object */
            removeFabricObjectsByName(canvas, 'svg_refImage');
            removeFabricObjectsByName(canvas, "backgroundRect");

            canvas.current.setBackgroundImage(
                null,
                canvas.current.renderAll.bind(canvas.current)
            );
            // fabric.loadSVGFromString(svg_Blob, function (objects, options) {
            //     const svg = fabric.util.groupSVGElements(objects, options);
            //     let scaleFactor = zoom ?? zoomInOut;
            //     svg.set({
            //         selectable: false,
            //         originX: "center",
            //         originY: "center",
            //         left: selFloorPlanDtls?.width / 2,
            //         top: selFloorPlanDtls?.height / 2,
            //         scaleX: scaleFactor,
            //         scaleY: scaleFactor,
            //         objectCaching: false,
            //         id: 'svg_refImage',
            //         name: 'svg_refImage'
            //     })
            //     canvas.current.add(svg);
            //     canvas.current.sendToBack(svg);
            //     canvas.current.renderAll();
            // });
            // canvas.current.setBackgroundImage(null, canvas.current.renderAll.bind(canvas.current));
           
            

            // /* Add svg setBackgroundImage */
            // fabric.loadSVGFromString(svg_Blob, function (objects, options) {
            //     const svgGroup = fabric.util.groupSVGElements(objects, options);
            //     console.log(svgGroup, 'setBackgroundImage')
            //     let canvasAspectRatio = selFloorPlanDtls?.width / selFloorPlanDtls?.height;
            //     let imgAspectRatio = svgGroup.width / svgGroup.height;
            //     let scaleFactor = zoom ?? zoomInOut;
            //     console.log(scaleFactor, 'scaleFactor')
            //     svgGroup.scale(scaleFactor).set({
            //         originX: "center",
            //         originY: "center",
            //         left: selFloorPlanDtls?.width / 2,
            //         top: selFloorPlanDtls?.height / 2,
            //         scaleX: scaleFactor,
            //         scaleY: scaleFactor,
            //     });
            //     canvas.current.setBackgroundImage(
            //         svgGroup,
            //         canvas.current.renderAll.bind(canvas.current),
            //         {
            //             backgroundImageStretch: false,
            //         }
            //     );
            // })
            const scaleFactor = zoom ?? zoomInOut;
            fabric.loadSVGFromString(svg_Blob, (objects, options) => {
                // const svg = fabric.util.groupSVGElements(objects, options);
                const fabricObjects = [];
                objects.forEach(obj => {
                    let fabricObj;
            
                    switch (obj.type) {
                        case 'path':
                            // console.log(obj,"item obj");
                            fabricObj = new fabric.Path(obj.path, {
                                fill: obj.fill,
                                stroke: obj.stroke,
                                // strokeWidth: obj.strokeWidth * scaleFactor,
                                strokeWidth: obj.strokeWidth,
                                left: obj.left * scaleFactor,
                                top: obj.top * scaleFactor,
                                scaleX: scaleFactor,
                                scaleY: scaleFactor,
                                objectCaching: false,
                                opacity:obj.opacity || 1
                                // id: 'svg_refImage',
                                // name: 'svg_refImage',
                            });
                            break;
            
                        case 'line':
                            fabricObj = new fabric.Line(
                                [obj.x1 * scaleFactor, obj.y1 * scaleFactor, obj.x2 * scaleFactor, obj.y2 * scaleFactor],
                                {
                                    stroke: obj.stroke,
                                    strokeWidth: obj.strokeWidth * scaleFactor,
                                    left: obj.left * scaleFactor,
                                    top: obj.top * scaleFactor,
                                    // id: 'svg_refImage',
                                    // name: 'svg_refImage'
                                }
                            );
                            break;
            
                        case 'polyline':
                            fabricObj = new fabric.Polyline(
                                obj.points.map(point => ({ x: point.x * scaleFactor, y: point.y * scaleFactor })),
                                {
                                    fill: obj.fill,
                                    stroke: obj.stroke,
                                    strokeWidth: obj.strokeWidth * scaleFactor,
                                    left: obj.left * scaleFactor,
                                    top: obj.top * scaleFactor,
                                    // id: 'svg_refImage',
                                    // name: 'svg_refImage'
                                }
                            );
                            break;
            
                        case 'polygon':
                            fabricObj = new fabric.Polygon(
                                obj.points.map(point => ({ x: point.x * scaleFactor, y: point.y * scaleFactor })),
                                {
                                    fill: obj.fill,
                                    stroke: obj.stroke,
                                    strokeWidth: obj.strokeWidth * scaleFactor,
                                    left: obj.left * scaleFactor,
                                    top: obj.top * scaleFactor,
                                    // id: 'svg_refImage',
                                    // name: 'svg_refImage'
                                }
                            );
                            break;
            
                        case 'rect':
                            fabricObj = new fabric.Rect({
                                width: obj.width * scaleFactor,
                                height: obj.height * scaleFactor,
                                fill: obj.fill,
                                // fill: "red",
                                stroke: obj.stroke,
                                strokeWidth: obj.strokeWidth * scaleFactor,
                                left: obj.left * scaleFactor,
                                top: obj.top * scaleFactor,
                                angle:obj.angle || null,
                                rx: (obj.rx || 0) * scaleFactor,
                                ry: (obj.ry || 0) * scaleFactor,
                                // id: 'svg_refImage',
                                // name: 'svg_refImage',
                            });
                            break;
            
                        case 'circle':
                            const { valueX, valuey } = getCirclePositionAdjustment(scaleFactor);
                            const adjustedLeft = (obj.left * scaleFactor) - (obj.radius * (scaleFactor - valueX));
                            const adjustedTop = (obj.top * scaleFactor) - (obj.radius * (scaleFactor - valuey));
                
                            fabricObj = new fabric.Circle({
                                radius: obj.radius * scaleFactor,
                                fill: obj.fill,
                                stroke: obj.stroke,
                                strokeWidth: obj.strokeWidth * scaleFactor,
                                left: adjustedLeft, 
                                top: adjustedTop,  
                                // id: 'svg_refImage',
                                // name: 'svg_refImage',
                            });
                            break;
            
                        default:
                            console.warn(`Unsupported SVG type: ${obj.type}`);
                            return;
                    }
            
                    fabricObjects.push(fabricObj); 
                });
                // canvas.current.add(...fabricObjects);
                const svg = new fabric.Group(fabricObjects, {
                    selectable: false,
                    originX: "center",
                    originY: "center",
                    left: selFloorPlanDtls?.width / 2,
                    top: selFloorPlanDtls?.height / 2,
                    scaleX: scaleFactor,
                    scaleY: scaleFactor,
                    objectCaching: false,
                    id: 'svg_refImage',
                    name: 'svg_refImage'
                });
                canvas.current.add(svg);
                canvas.current.sendToBack(svg);
                canvas.current.renderAll();
                // canvas.current.renderAll();
            });
            // console.log(svg_Blob,"svg url from if image is svg")
            
                     
        } else {
            removeFabricObjectsByName(canvas, 'svg_refImage');
            removeFabricObjectsByName(canvas, "backgroundRect");

            fabric.Image.fromURL(imgSrc, (img) => {
                // console.log(selFloorPlanDtls?.width,selFloorPlanDtls?.height,selFloorPlanDtls, 'selFloorPlanDtls?.img_size')
                if (selFloorPlanDtls?.img_size) {
                    zoomInOut = JSON.parse(selFloorPlanDtls?.img_size)
                }
                let fpWidth = parseInt(selFloorPlanDtls?.width, 10)
                let fpHeight = parseInt(selFloorPlanDtls?.height, 10)
                let canvasAspectRatio =  fpWidth / fpHeight;
                let imgAspectRatio = img.width / img.height;
                let scaleFactor = zoom ?? zoomInOut;

                if (canvasAspectRatio > imgAspectRatio) {
                    scaleFactor = fpWidth / img.width;
                } else {
                    scaleFactor = fpHeight / img.height;
                }

                const newScaleX = img.scaleX * (scaleX ?? zoomInOut);
                const newScaleY = img.scaleY * (scaleY ?? zoomInOut);

                img.scale(scaleFactor).set({
                    originX: "center",
                    originY: "center",
                    scaleX: zoom ?? newScaleX ?? zoomInOut,
                    scaleY: zoom ?? newScaleY ?? zoomInOut,
                    left: fpWidth / 2,
                    top: fpHeight / 2
                });
                // Set the image as canvas background
                canvas.current.setBackgroundImage(
                    img,
                // canvas.current.renderAll.bind(canvas.current)
                () => {
                    const slightZoom = 0.000000000000000001;
                    const centerPoint = new fabric.Point(
                        canvas.current.getWidth() / 2,
                        canvas.current.getHeight() / 2
                    );

                    canvas.current.zoomToPoint(centerPoint, canvas.current.getZoom() + slightZoom);
                    canvas.current.renderAll();
                },
                    {
                        backgroundImageStretch: false,
                    }
                );
                // canvas.current.centerObject(img);
                const backgroundRect = new fabric.Rect({
                    height: canvasContainerRef.current.clientHeight,
                    width: canvasContainerRef.current.clientWidth,
                    left: 0,
                    top: 0,
                    objectCaching: false,
                    // fill: filterColor,
                    fill: 'transparent',
                    selectable: false,
                    name: "backgroundRect",
                    hoverCursor: activeTab == "floorDetails" ? "default" : "pointer"
                });
                canvas.current.add(backgroundRect);
                canvas.current.sendToBack(backgroundRect);
            });
            // console.log(imgSrc,"svg url if image is present")
        }
    }
    else {
        canvas.current.setBackgroundImage(
            null,
            canvas.current.renderAll.bind(canvas.current)
        );
        removeFabricObjectsByName(canvas, 'svg_refImage');
        removeFabricObjectsByName(canvas, "backgroundRect");
        const backgroundRect = new fabric.Rect({
            height: canvasContainerRef.current.clientHeight,
            width: canvasContainerRef.current.clientWidth,
            left: 0,
            top: 0,
            // fill: filterColor,
            fill: 'transparent',
            selectable: false,
            name: "backgroundRect",
            hoverCursor: activeTab == "floorDetails" ? "default" : "pointer"
        });
        canvas.current.add(backgroundRect);
        canvas.current.sendToBack(backgroundRect);
        canvas.current.renderAll()

        // console.log("svg url no image is present")
    }
};

const getCirclePositionAdjustment = (scaleFactor) => {
    const referenceScale = 0.8839779005524862
    const baseOffsetX = 1.15;
    const baseOffsetY = 0.47;

    let valueX = calculateNumber(referenceScale, scaleFactor, baseOffsetX);
    let valuey = calculateNumber(referenceScale, scaleFactor, baseOffsetY);

    return {
        valueX,
        valuey
    };
};

function calculateNumber(referenceScale,scaleFactor, baseOffsetX) {
    let scaleFactorAt08 = referenceScale;
    let baseOffsetXAt08 = baseOffsetX;

    let scaleFactorAt1 = scaleFactor;
    let baseOffsetXAt1 = (baseOffsetXAt08 / scaleFactorAt08) * scaleFactorAt1;
    return baseOffsetXAt1
}


const loadSvgAsBackground = async (canvas, selFloorPlanDtls) => {
    fabric.Image.fromURL(selFloorPlanDtls?.refImg, (img) => {
        let canvasAspectRatio = selFloorPlanDtls?.width / selFloorPlanDtls?.height;
        let imgAspectRatio = img.width / img.height;
        let scaleFactor = zoom ?? zoomInOut;

        if (canvasAspectRatio > imgAspectRatio) {
            scaleFactor = selFloorPlanDtls?.width / img.width;
        } else {
            scaleFactor = selFloorPlanDtls?.height / img.height;
        }

        const newScaleX = img.scaleX * (scaleX ?? zoomInOut);
        const newScaleY = img.scaleY * (scaleY ?? zoomInOut);

        img.scale(scaleFactor).set({
            originX: "center",
            originY: "center",
            scaleX: zoom ?? newScaleX ?? zoomInOut,
            scaleY: zoom ?? newScaleY ?? zoomInOut,
            left: selFloorPlanDtls?.width / 2,
            top: selFloorPlanDtls?.height / 2
        });

        // Set the image as canvas background
        canvas.current.setBackgroundImage(
            img,
            canvas.current.renderAll.bind(canvas.current),
            {
                backgroundImageStretch: false,
            }
        );
        // canvas.current.centerObject(img);
        removeFabricObjectsByName(canvas, "backgroundRect");
        const backgroundRect = new fabric.Rect({
            height: canvasContainerRef.current.clientHeight,
            width: canvasContainerRef.current.clientWidth,
            left: 0,
            top: 0,
            // fill: filterColor,
            fill: 'transparent',
            selectable: false,
            name: "backgroundRect",
            hoverCursor: activeTab == "floorDetails" ? "default" : "pointer"
        });
        canvas.current.add(backgroundRect);
        canvas.current.sendToBack(backgroundRect);
    });
};

export default canvasBGimage;