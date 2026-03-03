import { fabric } from "fabric";
import { standardFontSize, standardFonts } from "../../../components/constants/standardFonts";
import { getBeaconPin, getLocationPin, getProductPin } from "./getPinIcons";
import { getSquareCoordinates, hexToRgb } from "./calculateDistance";
import { ChangeSvgColorPassingBE } from "../CustomSvg";
import { bringFabricObjectsToFrontByName, bringToFrontPinNameNodes, findObjectById, removeFabricObjectsByName, sendToBackObjects } from "./bringFabricObjects";
import drawLine from "./drawLine";
import { addNodePoint } from "./addNodeOrLine";
import { objPinNamesOnly } from "./constants/constant";
import { navigationPathZoomLevel } from "./tracingLengthZoomLevel";
import { checkSubnodePathOrNot } from "./addConnectionBtwnEdges";
import { triggerMouseWheelManually } from "./handleMouseWheel";
import { triggerFocus } from "antd/es/input/Input";

const renderTracing = (canvas, tracings, projectSettings, toolActive, addNewFloor, activeTab) => {
    if (tracings?.length > 0) {
        tracings?.forEach((t, idx) => {
            let strokeColor = t?.border_color ?? projectSettings?.border_color;
            let strokeWidth = t?.border_thick ?? projectSettings?.border_thick;
            let fillColor = t?.fill_color ?? projectSettings?.fill_color;
            
            let polyObj = new fabric.Polygon(t.vertices, {
                objectCaching: false,
                name: "tracing",
                id: new Date().toString(),
                fill: fillColor,
                stroke: strokeColor,
                strokeWidth: 1 / canvas.current?.getZoom() < 0.25 ? 0.25 : 1 / canvas.current?.getZoom() > strokeWidth ? strokeWidth : 1 / canvas.current?.getZoom() ,
                originX: "center",
                originY: "center",
                perPixelTargetFind: true,
                position: "absolute",
                zIndex: 2000,
                selectable: toolActive === "Select" && activeTab === "floorDetails" ? true : false,
                hoverCursor: activeTab === "floorDetails" && addNewFloor ? "grab" : "default",
                evented: true,
                opacity: 1,
                
            });
            polyObj.setCoords();
            canvas?.current?.add(polyObj);
        });
        triggerMouseWheelManually(canvas)
    }
};

const renderTracingCircle = (canvas, tracings, projectSettings, toolActive, addNewFloor, activeTab) => {
    if (tracings?.length > 0) {
        tracings?.forEach((t, idx) => {
            let strokeColor = t?.border_color ?? projectSettings?.border_color;
            let strokeWidth = t?.border_thick ?? projectSettings?.border_thick;
            let fillColor = t?.fill_color ?? projectSettings?.fill_color;
            
            let circle = new fabric.Circle({
                objectCaching: false,
                name: "tracing",
                id: new Date().toString(),
                fill: fillColor,
                stroke: strokeColor,
                strokeWidth: strokeWidth,
                left: t.vertices.x,
                top: t.vertices.y,
                scaleX: t.scaleX,
                scaleY: t.scaleY,
                radius: t.radius,
                perPixelTargetFind: true,
                position: "absolute",
                zIndex: 2000,
                selectable: toolActive === "Select" && activeTab === "floorDetails" ? true : false,
                hoverCursor: activeTab === "floorDetails" && addNewFloor ? "grab" : "default",
                evented: true,
                opacity: 1,
                lockRotation: true,
                
            });
            circle.setCoords();
            canvas?.current?.add(circle);
            canvas?.current.renderAll()
        });
        triggerMouseWheelManually(canvas)
    }
};

const renderText = (canvas, texts, toolActive, addNewFloor, activeTab) => {
    if (texts.length > 0) {
        texts?.forEach((item, idx) => {
            
            let textObj = new fabric.Textbox(item.text, {
                objectCaching: false,
                id: new Date().toString(),
                left: item.left,
                top: item.top,
                fontSize: 14,
                // maxWidth: Infinity,
                name: "text",
                backgroundColor: "transparent",
                perPixelTargetFind: false,
                position: "absolute",
                zIndex: 2000,
                scaleX: item?.scaleX ?? 1,
                scaleY: item?.scaleY ?? 1,
                angle: item?.angle ?? 0,
                selectable: toolActive === "Select" && activeTab === "floorDetails" ? true : false,
                hasRotatingPoint: false,
                hoverCursor: activeTab === "floorDetails" && addNewFloor ? "grab" : "default",
                fontFamily: item.fontFamily ?? standardFonts[0],
                fill: item.fill ?? "black",
                textAlign: item.textAlign ?? "center",
                fontSize: item.fontSize ?? standardFontSize[5],
                fontWeight: item.fontWeight ?? 'normal',
            });
            
            if (item.height && item.width) {
                textObj.set({
                    height: item.height,
                    width: item.width
                });
            }
            const zoom = canvas.current.getZoom();
            if (textObj?._text?.length > 0) {
                textObj.setCoords();
                
                if (!(zoom < 1)) {
                    textObj.scaleX = textObj.scaleX / zoom;
                    textObj.scaleY = textObj.scaleY / zoom;
                }
                canvas?.current?.add(textObj);
                canvas.current.bringToFront(textObj);
                canvas.current.renderAll();
            }
        });
        triggerMouseWheelManually(canvas)
    }
};

const renderLocation = (canvas, locations, projectSettings, activeTab, addNewLocation, selLocationDtls, checkConditionDrag) => {
    if (locations.length > 0) {
        let tmpLocs = [...locations];
        tmpLocs?.forEach((loc, idx) => {
            // if (loc.position === '' || (loc.position?.x == 0 && loc.position?.y == 0)) {
            if (loc.position === '' || (loc.position === null)) {
                return
            }
            let vertices = getSquareCoordinates(
                loc?.position?.x,
                loc?.position?.y,
                50
            );
            if (loc.boundary_attributes && loc.boundary_attributes != "null") {
                vertices = JSON.parse(loc.boundary_attributes);
            }
            
            if (loc.location_color) {
                let polyObj = new fabric.Polygon(vertices, {
                    name: "boundary",
                    objectCaching: false,
                    id: `boundary_${loc.enc_id}`,
                    fill: loc.boundary_color ? hexToRgb(loc.boundary_color, 0.4) : null,
                    stroke: "grey",
                    strokeWidth: Number(0),
                    // lockMovementX: true, lockMovementY: true,
                    originX: "center",
                    originY: "center",
                    selectable: false,
                    hoverCursor: activeTab === "locations" && addNewLocation ? "grab" : "default"
                });
                canvas.current.add(polyObj).renderAll();
                // canvas.current.sendToBack(polyObj);
                bringFabricObjectsToFrontByName(canvas, "product")
                // sendToBackObjects(canvas, "tracing");
            }
            
            let fillColor = loc?.location_color ?? projectSettings?.location_color;
            let locationIcon = getLocationPin(fillColor)
            
            let square;
            if (loc?.enc_id === selLocationDtls?.enc_id) {
                square = new fabric.Rect({
                    left: loc.position?.x - 14,
                    top: loc.position?.y - 15,
                    width: 26,
                    height: 28,
                    fill: "transparent",
                    stroke: "red",
                    strokeWidth: 2,
                    hoverCursor: activeTab === "locations" && addNewLocation ? "grab" : "default"
                });
            }
            let path = fabric.loadSVGFromString(
                locationIcon,
                function (objects, options) {
                    let obj = fabric.util.groupSVGElements(objects, options);
                    let singleLineProductName = loc.location_name.replace(
                        /\s/g,
                        "\u00A0"
                    );
                    // let paddedText = ` ${singleLineProductName} `;
                    let textObj = new fabric.Textbox(singleLineProductName, {
                        left: loc.position?.x,
                        top: loc.position?.y - 24,
                        fill: "#515151",
                        fontSize: 12,
                        name: "location",
                        enc_id: loc?.enc_id,
                        id: loc.location_name,
                        fp_id: loc?.fp_id || null,
                        perPixelTargetFind: true,
                        position: "absolute",
                        zIndex: 2000,
                        selectable: false,
                        originX: "center",
                        originY: "center",
                        hoverCursor: activeTab === "locations" && addNewLocation ? "grab" : "default",
                        fontFamily: `'SF Pro Text',-apple-system,BlinkMacSystemFont,Roboto,'Segoe UI',Helvetica,Arial,sans-serif,'Apple Color Emoji','Segoe UI Emoji','Segoe UI Symbol'`
                    });
                    // canvas?.current?.add(textObj);
                    
                    let backgroundRect = new fabric.Rect({
                        left: loc.position?.x,
                        top: loc.position?.y - 24,
                        width: textObj.width + 12,
                        height: textObj.height + 5,
                        fill: "#ffffffad",
                        strokeWidth: 1,
                        originX: "center",
                        originY: "center",
                        selectable: false,
                        name: "location",
                        enc_id: loc?.enc_id,
                        fp_id: loc?.fp_id || null,
                        id: loc.location_name,
                        hoverCursor: activeTab === "locations" && addNewLocation ? "grab" : "default",
                        rx: 2,
                        ry: 2
                    });
                    
                    obj.set({
                        id: loc.location_name,
                        left: loc.position?.x - obj.width / 2,
                        top: loc.position?.y - obj.height / 2,
                        // selectable: false,
                        selectable: checkConditionDrag() ? true : false,
                        name: "location",
                        enc_id: loc?.enc_id,
                        fp_id: loc?.fp_id || null,
                        uniformScaling: false,
                        lockRotation: true,
                        lockScalingX: true,
                        lockScalingY: true,
                        hasControls: false,
                        hasBorders: false,
                        isBoundary: loc?.boundary_attributes ? true : false,
                        hoverCursor: checkConditionDrag() ? "grab" : "default",
                        boundary_attributes: loc?.boundary_attributes ? loc?.boundary_attributes : null
                    });
                    
                    
                    let group = new fabric.Group([backgroundRect, textObj,obj], {
                        name: "location",
                        enc_id: loc?.enc_id,
                        id: loc.location_name,
                        fp_id: loc?.fp_id || null,
                        hoverCursor: activeTab === "locations" && addNewLocation ? "grab" : "default",
                        selectable: true,
                        // types: 'text_field',
                        left: loc.position?.x,
                        top: loc.position?.y,
                        originX: 'center',
                        originY: 'center',
                        lockRotation: true,
                        lockScalingX: true,
                        lockScalingY: true,
                        hasControls: false,
                        hasBorders: false,
                        selectable: checkConditionDrag() ? true : false,
                        hoverCursor: checkConditionDrag() ? true : false,
                    });
                    // canvas?.current?.add(group);
                    
                    const zoom = canvas.current.getZoom();
                    if (loc?.enc_id === selLocationDtls?.enc_id) {
                        // const group = new fabric.Group([square, obj], {
                        //     selectable: false,
                        //     lockRotation: true,
                        //     lockScalingX: true,
                        //     lockScalingY: true,
                        //     name: "location",
                        //     enc_id: loc?.enc_id,
                        //     id: loc.enc_id,
                        //     hasControls: false,
                        //     hasBorders: false,
                        //     hoverCursor:
                        //     activeTab === "locations" && addNewLocation
                        //     ? "grab"
                        //             : "default",
                        //     selectable: checkConditionDrag() ? true : false,
                        //     hoverCursor: checkConditionDrag() ? true : false,
                        // });
                        // if (!(zoom < 1)) {
                        //     group.scaleX = group.scaleX / zoom;
                        //     group.scaleY = group.scaleY / zoom;
                        // }
                        // canvas.current.add(group).renderAll();
                        // canvas.current.bringToFront(group);
                    } else {
                        // canvas.current.add(obj).renderAll();
                        // canvas.current.bringToFront(obj);
                        if (!(zoom < 1)) {
                            group.scaleX = group.scaleX / zoom;
                            group.scaleY = group.scaleY / zoom;
                        }
                        canvas?.current?.add(group);
                    }
                }
            );
        });
        
        triggerMouseWheelManually(canvas)
    }
};

const renderProduct = (canvas, products, projectSettings, activeTab, addNewProduct, selProductDtls, checkConditionDrag) => {
    if (products.length > 0) {
        let tmpProds = [...products];
        tmpProds.forEach((prod, idx) => {
            // if (prod.position === '' || (prod.position?.x == 0 && prod.position?.y == 0)) {
            if (prod.position === '' || (prod.position === null)) {
                return
            }
            let fillColor = prod?.product_color ?? projectSettings?.product_color;
            let productIcon = getProductPin(fillColor)
            let square;
            if (prod?.enc_id === selProductDtls?.enc_id) {
                square = new fabric.Rect({
                    left: prod.position?.x - 14,
                    top: prod.position?.y - 15,
                    width: 26,
                    height: 28,
                    fill: "transparent",
                    stroke: "red",
                    strokeWidth: 2,
                    hoverCursor:
                    activeTab === "products" && addNewProduct ? "grab" : "default",
                    selectable: false,
                    hasControls: false,
                    hasBorders: false,
                });
            }
            
            let path = fabric.loadSVGFromString(
                productIcon,
                function (objects, options) {
                    let obj = fabric.util.groupSVGElements(objects, options);
                    let singleLineProductName = prod.product_name.replace(
                        /\s/g,
                        "\u00A0"
                    );
                    let textObj = new fabric.Textbox(singleLineProductName, {
                        left: prod.position?.x,
                        top: prod.position?.y - 24,
                        fill: "#515151",
                        fontSize: 12,
                        name: "product",
                        id: prod.enc_id,
                        enc_id: prod?.enc_id,
                        fp_id: prod?.fp_id || null,
                        // backgroundColor: "#ffffffad",
                        perPixelTargetFind: true,
                        position: "absolute",
                        zIndex: 2000,
                        selectable: false,
                        originX: "center",
                        originY: "center",
                        hoverCursor:
                        activeTab === "products" && addNewProduct ? "grab" : "default",
                        fontFamily: `'SF Pro Text',-apple-system,BlinkMacSystemFont,Roboto,'Segoe UI',Helvetica,Arial,sans-serif,'Apple Color Emoji','Segoe UI Emoji','Segoe UI Symbol'`
                    });
                    
                    
                    let backgroundRect = new fabric.Rect({
                        left: prod.position?.x,
                        top: prod.position?.y - 24,
                        width: textObj.width + 12,
                        height: textObj.height + 5,
                        fill: "#ffffffad",
                        // stroke: 'black',
                        strokeWidth: 1,
                        originX: "center",
                        originY: "center",
                        selectable: false,
                        name: "product",
                        id: prod.enc_id,
                        enc_id: prod?.enc_id,
                        fp_id: prod?.fp_id || null,
                        hoverCursor:
                        activeTab === "products" && addNewProduct ? "grab" : "default",
                        rx: 2,
                        ry: 2,
                        hasControls: false,
                        hasBorders: false,
                    });
                    
                    obj.set({
                        left: prod.position?.x - obj.width / 2,
                        top: prod.position?.y - obj.height / 2,
                        // selectable: (activeTab === "products" && !addNewProduct) ? true : false,
                        // selectable: false,
                        selectable: checkConditionDrag() ? true : false,
                        name: "product",
                        id: prod.product_name,
                        enc_id: prod?.enc_id,
                        fp_id: prod?.fp_id || null,
                        lockRotation: true,
                        lockScalingX: true,
                        lockScalingY: true,
                        hasControls: false,
                        hasBorders: false,
                        hoverCursor: checkConditionDrag() ? "grab" : "default"
                    });
                    
                    let group = new fabric.Group([backgroundRect, textObj, obj], {
                        name: "product",
                        id: prod.enc_id,
                        enc_id: prod?.enc_id,
                        fp_id: prod?.fp_id || null,
                        hoverCursor:
                        activeTab === "products" && addNewProduct ? "grab" : "default",
                        selectable: true,
                        // types: 'text_field',
                        left: prod.position?.x,
                        top: prod.position?.y,
                        originX: 'center',
                        originY: 'center',
                        lockRotation: true,
                        lockScalingX: true,
                        lockScalingY: true,
                        hasControls: false,
                        hasBorders: false,
                        selectable: checkConditionDrag() ? true : false,
                        hoverCursor: checkConditionDrag() ? true : false,
                    });
                    // canvas?.current?.add(group);
                    const zoom = canvas.current.getZoom();
                    
                    if (prod?.enc_id === selProductDtls?.enc_id) {
                        const group = new fabric.Group([square, obj], {
                            selectable: false,
                            lockRotation: true,
                            lockScalingX: true,
                            lockScalingY: true,
                            hasControls: false,
                            hasBorders: false,
                            name: "product",
                            id: prod.enc_id,
                            enc_id: prod?.enc_id,
                            fp_id: prod?.fp_id || null,
                            hoverCursor:
                                activeTab === "products" && addNewProduct ? "grab" : "default",
                            // selectable: checkConditionDrag() ? true : false,
                            hoverCursor: checkConditionDrag() ? true : false,
                        });
                        if (!(zoom < 1)) {
                            group.scaleX = group.scaleX / zoom;
                            group.scaleY = group.scaleY / zoom;
                        }
                        canvas.current.add(group).renderAll();
                    } else {
                        // canvas.current.add(obj).renderAll();
                        if (!(zoom < 1)) {
                            group.scaleX = group.scaleX / zoom;
                            group.scaleY = group.scaleY / zoom;
                        }
                        canvas?.current?.add(group);
                    }
                }
            );
        });
        triggerMouseWheelManually(canvas)
    }
};

const renderBeacon = (canvas, beacons, projectSettings, activeTab, addNewQrCodeBeacon, selBeaconDtls, checkConditionDrag) => {
    
    if (beacons.length > 0) {
        let tmpBeacons = [...beacons];
        tmpBeacons.forEach((item, idx) => {
            if (item.position === '' || (item.position === null)) {
                return
            }
            let fillColor = item?.beacon_color ?? projectSettings?.beacon_color;
            let beaconIcon = getBeaconPin(fillColor)
            let square;
            if (item?.enc_id === selBeaconDtls?.enc_id) {
                //// console.log("highlight");
                // beaconIcon = beaconIcon?.replace('<path', '<path stroke="black" stroke-width="1"');

                // square = new fabric.Rect({
                //     left: item.position?.x - 12,
                //     top: item.position?.y - 12,
                //     width: 22,
                //     height: 22,
                //     fill: "transparent",
                //     stroke: "red",
                //     strokeWidth: 2,
                //     hoverCursor:
                //     activeTab === "beacons" && addNewQrCodeBeacon ? "grab" : "default"
                // });
            }
            let path = fabric.loadSVGFromString(
                beaconIcon,
                function (objects, options) {
                    let obj = fabric.util.groupSVGElements(objects, options);
                    
                    let singleLineBeaconName = item.beacon_name.replace(
                        /\s/g,
                        "\u00A0"
                    );
                    let textObj = new fabric.Textbox(singleLineBeaconName, {
                        left: item.position?.x,
                        top: item.position?.y - 21,
                        fill: "#515151",
                        fontSize: 12,
                        name: "beacon",
                        id: item.beacon_name,
                        enc_id: item?.enc_id,
                        fp_id: item?.fp_id || null,
                        // backgroundColor: "#ffffffad",
                        perPixelTargetFind: true,
                        position: "absolute",
                        zIndex: 2000,
                        selectable: false,
                        originX: "center",
                        originY: "center",
                        hoverCursor:
                        activeTab === "beacons" && addNewQrCodeBeacon
                        ? "grab"
                        : "default",
                        fontFamily: `'SF Pro Text',-apple-system,BlinkMacSystemFont,Roboto,'Segoe UI',Helvetica,Arial,sans-serif,'Apple Color Emoji','Segoe UI Emoji','Segoe UI Symbol'`
                    });
                    // canvas?.current?.add(textObj);
                    
                    let backgroundRect = new fabric.Rect({
                        left: item.position?.x,
                        top: item.position?.y - 21,
                        width: textObj.width + 12,
                        height: textObj.height + 5,
                        fill: "#ffffffad",
                        // stroke: 'black',
                        strokeWidth: 1,
                        originX: "center",
                        originY: "center",
                        selectable: false,
                        name: "beacon",
                        id: item.beacon_name,
                        enc_id: item?.enc_id,
                        fp_id: item?.fp_id || null,
                        hoverCursor:
                        activeTab === "beacons" && addNewQrCodeBeacon
                        ? "grab"
                        : "default",
                        rx: 2,
                        ry: 2
                    });
                    
                    obj.set({
                        left: item.position?.x - obj.width / 2,
                        top: item.position?.y - obj.height / 2,
                        // selectable: item?.enc_id === selBeaconDtls?.enc_id ? true : false,
                        selectable: checkConditionDrag() ? true : false,
                        name: "beacon",
                        id: item.beacon_name,
                        enc_id: item?.enc_id,
                        fp_id: item?.fp_id || null,
                        lockRotation: true,
                        lockScalingX: true,
                        lockScalingY: true,
                        hasControls: false,
                        hasBorders: false,
                        // hoverCursor: activeTab === "beacons" && addNewQrCodeBeacon ? "grab" : "default"
                        hoverCursor: checkConditionDrag() ? "grab" : "default",
                        
                    });
                    
                    // console.log(checkConditionDrag(),"checkConditionDrag()");
                    
                    let group = new fabric.Group([backgroundRect, textObj, obj], {
                        name: "beacon",
                        id: item.beacon_name,
                        enc_id: item?.enc_id,
                        fp_id: item?.fp_id || null,
                        // hoverCursor: activeTab === "beacons" && addNewQrCodeBeacon
                        //         ? "grab"
                        //     : "default",
                        hoverCursor: checkConditionDrag() ? "grab" : "default",
                        // selectable: false,
                        
                        // types: 'text_field',
                        left: item.position?.x,
                        top: item.position?.y,
                        originX: 'center',
                        originY: 'center',
                        lockRotation: true,
                        lockScalingX: true,
                        lockScalingY: true,
                        hasControls: false,
                        hasBorders: false,
                        
                        selectable: checkConditionDrag() ? true : false,
                    });
                    
                    // canvas?.current?.add(group);
                    const zoom = canvas.current.getZoom();
                    if (item?.enc_id === selBeaconDtls?.enc_id) {
                        // // const group = new fabric.Group([square, obj], {
                        // const group = new fabric.Group([obj], {
                        //     selectable: false,
                        //     lockRotation: true,
                        //     lockScalingX: true,
                        //     lockScalingY: true,
                        //     name: "beacon",
                        //     id: item.enc_id,
                        //     enc_id: item?.enc_id,
                        //     fp_id: item?.fp_id || null,
                        //     hoverCursor:
                        //     activeTab === "beacons" && addNewQrCodeBeacon
                        //     ? "grab"
                        //     : "default"
                        // });
                        // if (!(zoom < 1)) {
                        //     group.scaleX = group.scaleX / zoom;
                        //     group.scaleY = group.scaleY / zoom;
                        // }
                        // canvas.current.add(group).renderAll();
                        // console.log(group,group.left,group.top,"group 2");
                    } else {
                        // canvas.current.add(obj).renderAll();
                        if (!(zoom < 1)) {
                            group.scaleX = group.scaleX / zoom;
                            group.scaleY = group.scaleY / zoom;
                        }
                        canvas?.current?.add(group).renderAll();
                    }
                }
            );
        });
    }
    // console.log(beacons,"beacons");
    // triggerMouseWheelManually(canvas)
};

const renderAmenity = (canvas,
    amenities, projectSettings,
    activeTab, addNewAmenity, selAmenityDtls,
    amenityList, selFloorPlanDtls,
    checkConditionDrag
) => {
    const currentFloorPins = amenityList?.filter(
        (item) => (selAmenityDtls?.enc_floor_plan_id ?? selFloorPlanDtls?.enc_id) == item?.fp_id
    );
    const amenityPin = currentFloorPins?.length > 0 ? currentFloorPins : amenities
    if (amenityPin.length > 0) {
        let tmpAmenitys = [...amenityPin];
        tmpAmenitys.forEach((item, idx) => {
            if (item.position === '' || (item.position === null)) {
                return
            }
            let fillColor = item?.amenity_color ?? projectSettings?.amenity_color;
            
            let amenityIcon = ChangeSvgColorPassingBE(item?.path, fillColor);
            let square;
            if (item?.enc_id === selAmenityDtls?.enc_id) {
                square = new fabric.Rect({
                    left: item.position?.x - 13,
                    top: item.position?.y - 13,
                    width: 24,
                    height: 24,
                    fill: "transparent",
                    stroke: "red",
                    strokeWidth: 2,
                    hoverCursor:
                    activeTab === "amenitys" && addNewAmenity ? "grab" : "default"
                });
            }
            let path = fabric.loadSVGFromString(
                amenityIcon,
                function (objects, options) {
                    let obj = fabric.util.groupSVGElements(objects, options);
                    
                    obj.set({
                        left: item.position?.x - obj.width / 2,
                        top: item.position?.y - obj.height / 2,
                        // selectable: item?.enc_id == selAmenityDtls?.enc_id ? true : false,
                        selectable: checkConditionDrag() ? true : false,
                        name: "amenity",
                        id: item.amenity_name,
                        enc_id: item?.enc_id,
                        fp_id: item?.fp_id || null,
                        lockRotation: true,
                        lockScalingX: true,
                        lockScalingY: true,
                        hasControls: false,
                        hasBorders: false,
                        hoverCursor: checkConditionDrag() ? "grab" : "default",
                        // hoverCursor:  activeTab === "amenitys" && addNewAmenity ? "grab" : "default"
                    });
                    
                    const zoom = canvas.current.getZoom();

                    if (item?.enc_id === selAmenityDtls?.enc_id) {
                        // const group = new fabric.Group([square, obj], {
                        //     selectable: false,
                        //     lockRotation: true,
                        //     lockScalingX: true,
                        //     lockScalingY: true,
                        //     name: "amenity",
                        //     id: item.enc_id,
                        //     enc_id: item?.enc_id,
                        //     fp_id: item?.fp_id || null,
                        //     hoverCursor:
                        //     activeTab === "amenitys" && addNewAmenity ? "grab" : "default"
                        // });
                        // if (!(zoom < 1)) {
                        //     group.scaleX = group.scaleX / zoom;
                        //     group.scaleY = group.scaleY / zoom;
                        // }
                        // // Highlight the edited pin
                        // canvas.current.add(group).renderAll();
                    } else {
                        if (!(zoom < 1)) {
                            obj.scaleX = obj.scaleX / zoom;
                            obj.scaleY = obj.scaleY / zoom;
                        }
                        canvas.current.add(obj).renderAll();
                    }
                }
            );
            // canvas?.current?.add(polyObj);
        });
        triggerMouseWheelManually(canvas)
    }
};

const renderSafetie = (canvas, safeties, projectSettings, activeTab, addNewSafety, selSafetyDtls, checkConditionDrag) => {
    if (safeties.length > 0) {
        let tmpSafeties = [...safeties];
        tmpSafeties.forEach((item, idx) => {
            if (item.position === '' || (item.position === null)) {
                return
            }
            let fillColor = item?.safety_color ?? projectSettings?.safety_color;
            let safetyIcon = ChangeSvgColorPassingBE(item?.path, fillColor);
            let square;
            if (item?.enc_id === selSafetyDtls?.enc_id) {
                square = new fabric.Rect({
                    left: item.position?.x - 13,
                    top: item.position?.y - 13,
                    width: 24,
                    height: 24,
                    fill: "transparent",
                    stroke: "red",
                    strokeWidth: 2,
                    hoverCursor:
                    activeTab === "safety" && addNewSafety ? "grab" : "default"
                });
            }
            let path = fabric.loadSVGFromString(
                safetyIcon,
                function (objects, options) {
                    let obj = fabric.util.groupSVGElements(objects, options);
                    
                    obj.set({
                        left: item.position?.x - obj.width / 2,
                        top: item.position?.y - obj.height / 2,
                        // selectable: item?.enc_id == selSafetyDtls?.enc_id ? true : false,
                        selectable: checkConditionDrag() ? true : false,
                        name: "safety",
                        id: item.safety_name,
                        enc_id: item.enc_id,
                        fp_id: item?.fp_id || null,
                        lockRotation: true,
                        lockScalingX: true,
                        lockScalingY: true,
                        hasControls: false,
                        hasBorders: false,
                        hoverCursor: checkConditionDrag() ? "grab" : "default",
                        // hoverCursor: activeTab === "safety" && addNewSafety ? "grab" : "default"
                    });
                    
                    const zoom = canvas.current.getZoom();
                    if (item?.enc_id === selSafetyDtls?.enc_id) {
                        const group = new fabric.Group([square, obj], {
                            selectable: true,
                            lockRotation: true,
                            lockScalingX: true,
                            lockScalingY: true,
                            name: "safety",
                            id: item.enc_id,
                            enc_id: item?.enc_id,
                            fp_id: item?.fp_id || null,
                            hoverCursor:
                            activeTab === "safety" && addNewSafety ? "grab" : "default"
                        });
                        // Highlight the edited pin
                        if (!(zoom < 1)) {
                            group.scaleX = group.scaleX / zoom;
                            group.scaleY = group.scaleY / zoom;
                        }

                        canvas.current.add(group).renderAll();
                    } else {
                        if (!(zoom < 1)) {
                            obj.scaleX = obj.scaleX / zoom;
                            obj.scaleY = obj.scaleY / zoom;
                        }
                        canvas.current.add(obj).renderAll();
                    }
                }
            );
        });
        triggerMouseWheelManually(canvas)
    }
};

const renderVT = (canvas, verticalTransports, projectSettings, activeTab,
    addNewVertical, selVerticalDtls, verticalFloorId,
    checkConditionDrag
) => {
    console.log(verticalTransports,"verticalTransports");
    if (verticalTransports.length > 0) {
        let tmpVerticals = [...verticalTransports];
        tmpVerticals.forEach((item, idx) => {
            let fillColor = item?.vt_color ?? projectSettings?.level_change_color;
            let verticalIcon = ChangeSvgColorPassingBE(item?.path, fillColor);
            let square;
            if (item?.vertical_transport_id === selVerticalDtls?.enc_id) {
                // Highlight the edited pin
                // console.log("highlight");
                square = new fabric.Rect({
                    left: item.position?.x - 13,
                    top: item.position?.y - 13,
                    width: 24,
                    height: 24,
                    fill: "transparent",
                    stroke: "red",
                    strokeWidth: 2
                });
            }
            let path = fabric.loadSVGFromString(
                verticalIcon,
                function (objects, options) {
                    let obj = fabric.util.groupSVGElements(objects, options);
                    
                    obj.set({
                        left: item.position?.x - obj.width / 2,
                        top: item.position?.y - obj.height / 2,
                        // selectable: addNewVertical && item?.vertical_transport_id === selVerticalDtls?.enc_id ? true : false,
                        selectable: (checkConditionDrag() || item?.vertical_transport_id === selVerticalDtls?.enc_id) ? true : false,
                        name: "vertical",
                        id: item.vt_name,
                        enc_id: item?.enc_id,
                        fp_id: item?.fp_id || null,
                        lockRotation: true,
                        lockScalingX: true,
                        lockScalingY: true,
                        hasControls: false,
                        hasBorders: false,
                        positions: item?.position,
                        floor_id: verticalFloorId ?? item?.fp_id,
                        hoverCursor: checkConditionDrag() ? "grab" : "default",
                        // hoverCursor:
                        //     activeTab === "verticalTransport" && addNewVertical
                        //         ? "grab"
                        //         : "default"
                        
                    });
                    
                    
                    if (item?.vertical_transport_id !== selVerticalDtls?.enc_id) {
                        let singleLineProductName = item.vt_name.replace(
                            /\s/g,
                            "\u00A0"
                        );
                        let textObj = new fabric.Textbox(singleLineProductName, {
                            left: item.position?.x,
                            top: item.position?.y - 24,
                            fill: "#515151",
                            fontSize: 12,
                            name: "vertical",
                            fp_id: item?.fp_id || null,
                            id: item.vt_name,
                            enc_id: item?.enc_id,
                            // backgroundColor: "#ffffffad",
                            perPixelTargetFind: true,
                            position: "absolute",
                            zIndex: 2000,
                            selectable: false,
                            originX: "center",
                            originY: "center",
                            hoverCursor:
                            activeTab === "verticalTransport" && addNewVertical
                            ? "grab"
                            : "default",
                            fontFamily: `'SF Pro Text',-apple-system,BlinkMacSystemFont,Roboto,'Segoe UI',Helvetica,Arial,sans-serif,'Apple Color Emoji','Segoe UI Emoji','Segoe UI Symbol'`
                        });
                        // canvas?.current?.add(textObj);
                        
                        let backgroundRect = new fabric.Rect({
                            left: item.position?.x,
                            top: item.position?.y - 24,
                            width: textObj.width + 12,
                            height: textObj.height + 5,
                            fill: "#ffffffad",
                            // stroke: 'black',
                            strokeWidth: 1,
                            originX: "center",
                            originY: "center",
                            selectable: false,
                            name: "vertical",
                            id: item.vt_name,
                            enc_id: item?.enc_id,
                            fp_id: item?.fp_id || null,
                            hoverCursor:
                            activeTab === "verticalTransport" && addNewVertical
                            ? "grab"
                            : "default",
                            rx: 2,
                            ry: 2
                        });
                        
                        obj.set({
                            left: item.position?.x - obj.width / 2,
                            top: item.position?.y - obj.height / 2,
                            // selectable: addNewVertical && item?.vertical_transport_id === selVerticalDtls?.enc_id ? true : false,
                            selectable: (checkConditionDrag() || item?.vertical_transport_id === selVerticalDtls?.enc_id) ? true : false,
                            name: "vertical",
                            id: item.vt_name,
                            enc_id: item?.enc_id,
                            fp_id: item?.fp_id || null,
                            lockRotation: true,
                            lockScalingX: true,
                            lockScalingY: true,
                            hasControls: false,
                            hasBorders: false,
                            positions: item?.position,
                            floor_id: verticalFloorId ?? item?.fp_id,
                            hoverCursor: checkConditionDrag() ? "grab" : "default",
                            // hoverCursor:
                            //     activeTab === "verticalTransport" && addNewVertical
                            //         ? "grab"
                            //         : "default"
                        });
                        
                        let group = new fabric.Group([backgroundRect, textObj, obj], {
                            name: "vertical",
                            id: item.vt_name,
                            enc_id: item?.enc_id,
                            fp_id: item?.fp_id || null,
                            hoverCursor:
                            activeTab === "verticalTransport" && addNewVertical
                            ? "grab"
                            : "default",
                            // selectable: true,
                            // types: 'text_field',
                            left: item.position?.x,
                            top: item.position?.y,
                            originX: 'center',
                            originY: 'center',
                            lockRotation: true,
                            lockScalingX: true,
                            lockScalingY: true,
                            hasControls: false,
                            hasBorders: false,
                            selectable: checkConditionDrag() ? true : false,
                            hoverCursor: checkConditionDrag() ? true : false,
                        });
                        canvas?.current?.add(group);
                    }
                    
                    const zoom = canvas.current.getZoom();
                    if (item?.vertical_transport_id === selVerticalDtls?.enc_id) {
                        const group = new fabric.Group([square, obj], {
                            //   selectable: false,
                            selectable: addNewVertical && item?.vertical_transport_id === selVerticalDtls?.enc_id ? true : false,
                            lockRotation: true,
                            lockScalingX: true,
                            lockScalingY: true,
                            hasControls: false,
                            hasBorders: false,
                            left: item.position?.x,
                            top: item.position?.y,
                            originX: 'center',
                            originY: 'center',
                            name: "vertical",
                            id: item.enc_id,
                            enc_id: item?.enc_id,
                            fp_id: item?.fp_id || null,
                            floor_id: verticalFloorId ?? item?.fp_id,
                            boundaryGroup: true,
                            hoverCursor:
                            activeTab === "verticalTransport" && addNewVertical
                            ? "grab"
                            : "default",
                        });

                        if (!(zoom < 1)) {
                            group.scaleX = group.scaleX / zoom;
                            group.scaleY = group.scaleY / zoom;
                        }
                        canvas.current.add(group).renderAll();
                        
                        
                    } else {
                        // canvas.current.add(obj).renderAll();
                    }
                }
            );
        });
        
        triggerMouseWheelManually(canvas)
    }
};

const canvasViewport = (canvas) => {
    // to check if it possition lies in the viewport 
    const transform = canvas?.current?.viewportTransform;
    if (transform) {
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        const topLeft = fabric.util.transformPoint({ x: 0, y: 0 }, fabric.util.invertTransform(transform));
        const bottomRight = fabric.util.transformPoint({ x: viewportWidth, y: viewportHeight }, fabric.util.invertTransform(transform));
        
        const visibleArea = {
            x1: topLeft.x,
            y1: topLeft.y,
            x2: bottomRight.x,
            y2: bottomRight.y,
        };
        
        return visibleArea;
    }
}

const isInsideViewport = (object, viewport) => {
    return (
        object?.x >= viewport?.x1 &&
        object?.x <= viewport?.x2 &&
        object?.y >= viewport?.y1 &&
        object?.y <= viewport?.y2
    );
}


// const drawVisibleAreaRectangle = (fabricCanvas, visibleArea) => {
    //     const rect = new fabric.Rect({
//       left: visibleArea.x1,
//       top: visibleArea.y1,
//       width: visibleArea.x2 - visibleArea.x1,
//       height: visibleArea.y2 - visibleArea.y1,
//       fill: 'rgba(0, 0, 0, 0)', // Transparent fill
//       stroke: 'rgba(0, 0, 255, 1)', // Red border for visibility
//       strokeWidth: 2,
//       name: "drawVisibleAreaRectangle"
//     });

//     // Remove existing visible area rectangles before adding a new one
//     const existingRects = fabricCanvas.getObjects('rect').filter(obj => obj.name === 'drawVisibleAreaRectangle');
//     existingRects.forEach(rect => fabricCanvas.remove(rect));

//     fabricCanvas.add(rect);
//     // fabricCanvas.sendToBack(rect);
//     fabricCanvas.renderAll();
//   };

const renderTraversiblePath = (canvas, graph, projectSettings, checkPinConnectOrNot, type, autoconnect = false, mouseDown = false) => {
    removeFabricObjectsByName(canvas, "node_name");
    let positions = graph.positions;
    let isJoined = localStorage.getItem("connectedNodePoint")
    let viewport = canvasViewport(canvas)
    // drawVisibleAreaRectangle(canvas.current,viewport)
    
    Object.keys(positions).forEach((position) => {
        if (!position || position == "null") return;
        
        // navigation optimisation
        if (!autoconnect) {
            const result = isInsideViewport(graph.positions[position], viewport);
            if (!result) return
        }
        // ------------------------
        
        if (Object.keys(graph.edges)?.length === 0) return;
        let node;
        if (graph.edges[position]) {
            let color;
            const hasOnePinOrNot = Object.keys(graph.edges[position]).filter(item => item.includes('_'));
            let pathPoint = localStorage.getItem("shortestPath") ?? []
            if (pathPoint.includes(position)) {
                color = projectSettings?.navigation_color ?? "red"
            } else
            if (graph.autoConnectNode.includes(position) ) {
                color = "rgb(255, 172, 28,0.5)"
            }
            // else if (pathPoint.includes(position)) {
            //     color = projectSettings?.navigation_color ?? "red"
            // }
            else {
                color = graph.subNode.includes(position) ? "rgba(0,255,0,0.5)" : "rgba(0,0,255,0.5)"
            }
            const isConnectedToMainpath = graph.connectedMainPathNodes.includes(position) ||  !graph.subNode.includes(position)
            node = addNodePoint(positions[position], position, color,isConnectedToMainpath)
        }
        
        if (type && node) {
            node.selectable = node.id.includes("_") ? false : true;
            node.lockMovementX = false;
            node.lockMovementY = false;
            node.lockRotation = true;
            node.lockScalingX = true;
            node.lockScalingY = true;
            node.hasControls = false;
            node.hasBorders = false;
            node.movedNode = true;
        }
        
        if (node) {
            if (canvas.current?.getZoom() > 0.85 ) {
                let zoom = canvas?.current?.getZoom()
                if (node?.id.includes("_")) {
                    node.set({fill:"rgba(0,255,0,0)"})
                }
                if (zoom) {
                    if (zoom < 2.1) { 
                        node.set({ scaleX: 1/zoom,scaleY: 1/zoom });
                    } else {
                        node.set({ scaleX: 1/2.1,scaleY: 1/2.1 });
                    }
                }
                
                canvas.current.add(node);
                
            }
        }
        
    });
    
    let edges = graph.edges;
    Object.keys(edges).forEach((key) => {
        if (!autoconnect) {
            const result = isInsideViewport(graph.positions[key], viewport);
            if (!result) return
        }
        // ------------------------
        
        if (!edges[key] || typeof edges[key] !== 'object' || Object.keys(edges[key]).length === 0) {
            if (!mouseDown) {
                delete edges[key]; 
            }
        } else {
            const values = Object.values(edges[key]);
            if (values.length > 0 && isNaN(values[0])) {
                delete edges[key];
            }
        }
    });
    
    Object.keys(edges).forEach((edge) => {
        if (!edge || edge == "null") return;
        Object.keys(edges[edge])?.forEach((edge2) => {
            
            if (!autoconnect) {
                const result = isInsideViewport(graph.positions[edge], viewport);
                if (!result) return
            }
            // ------------------------
            
            const color = checkSubnodePathOrNot(edge, edge2, graph, `path$${edge}$${edge2}`)
           
            
            // if (canvas.current?.getZoom() > 0.85) { 
            drawLine(
                positions[edge],
                positions[edge2],
                "path",
                `path$${edge}$${edge2}`,
                canvas,
                color
            );
            // }
            
        });
    });
    
    bringFabricObjectsToFrontByName(canvas, "path");
    bringFabricObjectsToFrontByName(canvas, "node");
    bringFabricObjectsToFrontByName(canvas, "location");
    bringFabricObjectsToFrontByName(canvas, "product");
    bringFabricObjectsToFrontByName(canvas, "beacon");
    bringFabricObjectsToFrontByName(canvas, "safety");
    bringFabricObjectsToFrontByName(canvas, "amenity");
    bringFabricObjectsToFrontByName(canvas, "vertical");
    
    setTimeout(() => {
        checkPinConnectOrNot();
    }, 500);
    
    navigationPathZoomLevel(canvas, canvas.current?.getZoom(), projectSettings)
};

const checkPinConnection = (canvas, graph, activeTab, isCommonSidebarVisible) => {
    if (activeTab === 'traversable' && !isCommonSidebarVisible) {
        const positions = graph.positions;
        
        // Collect connected pins based on positions
        const connectedPins = new Set();
        
        // Iterate through positions and check for connections
        Object.keys(positions).forEach((sourcePin) => {
            connectedPins.add(sourcePin);
            
            const targetPins = positions[sourcePin];
            Object.keys(targetPins).forEach((targetPin) => {
                connectedPins.add(targetPin);
                
                // If the target pin has sub-connections, add them as well
                const subConnections = targetPins[targetPin];
                if (subConnections && Object.keys(subConnections)?.length > 0) {
                    Object.keys(subConnections)?.forEach((subPin) => {
                        connectedPins?.add(subPin);
                    });
                }
            });
        });
        
        canvas?.current?.forEachObject(function (obj) {
            if (objPinNamesOnly?.includes(obj?.name)) {
                const pinName = `${obj.name}_${obj.enc_id}`;
                const isConnected = connectedPins.has(pinName);
                // Check if there is no connection before adjusting opacity
                if (!isConnected) {
                    obj.set({ opacity: 0.5 });
                } else {
                    obj.set({ opacity: 1 });
                    
                    // change color of the connected line and its connected nodes
                    let case1;
                    let case2;
                    let nodePoint
                    let isJoined = localStorage.getItem("connectedNodePoint")
                    if (Object.keys(graph.edges).length > 0 && graph.edges[pinName]) {
                        Object.keys(graph.edges[pinName])?.map((item) => {
                            case1 = findObjectById(`path$${pinName}$${item}`, canvas)
                            case2 = findObjectById(`path$${item}$${pinName}`, canvas)
                            nodePoint = findObjectById(`${item}`, canvas)
                            // case1?.set({ stroke: "green" });
                            // case2?.set({ stroke: "green" });
                            if (isJoined === item) {
                                nodePoint?.set({ fill: "rgba(255,255,0,0.5)", radius: 15 });
                            } else {
                                // nodePoint?.set({ fill: "rgba(0,255,0,0.5)" });
                            }
                            canvas.current.bringToFront(nodePoint)
                        })
                    }
                    
                }
            }
        });
        
        canvas?.current?.renderAll();
        const highlightNode = graph?.highligthNodes ?? []
        if (highlightNode?.length > 0) {
            highlightNode?.forEach((item) => {
                bringToFrontPinNameNodes(canvas, item)
            })
            canvas?.current?.renderAll();
        }
    }
    
    else if (isCommonSidebarVisible) {
        canvas.current.forEachObject(function (obj) {
            if (objPinNamesOnly?.includes(obj?.name)) {
                obj.set({ opacity: 1 });
            }
        });
        canvas.current.renderAll();
    }
    
};

export {
    renderTracing,
    renderTracingCircle,
    renderText,
    renderLocation,
    renderProduct,
    renderBeacon,
    renderAmenity,
    renderSafetie,
    renderVT,
    renderTraversiblePath,
    checkPinConnection
}