import { ChangeSvgColorPassingBE } from "../CustomSvg";
import { removeFabricObjectsByName, removeFabricObjectsEncId } from "./bringFabricObjects";
import { getBeaconPin, getProductPin, getVerticalPin } from "./getPinIcons";
import { triggerMouseWheelManually } from "./handleMouseWheel";

const updateProductPin = (canvas, selProductDtls, projectSettings, setCanvasUpdated, addNewProduct, combinedArray) => {
    if (canvas?.current && selProductDtls?.product_color) {
        if (combinedArray) {
            combinedArray?.forEach((obj) => {
                if (obj.name === "temp_prod") {
                    removeFabricObjectsByName(canvas, "temp_prod");
                    let fillColor =
                        selProductDtls?.product_color ??
                        projectSettings?.product_color ??
                        "red";
                    let productIcon = getProductPin(fillColor)
                    let path = fabric.loadSVGFromString(
                        productIcon,
                        function (objects, options) {
                            let obj = fabric.util.groupSVGElements(objects, options);

                            obj.set({
                                left: selProductDtls?.position?.x - obj.width / 2,
                                top: selProductDtls?.position?.y - obj.width / 2,
                                name: "temp_prod",
                                lockRotation: true,
                                lockScalingX: true,
                                lockScalingY: true,
                                hoverCursor: "grab", boundaryGroup: true,
                            });

                            canvas?.current?.add(obj);
                        }
                    );
                } else if (obj?.enc_id == selProductDtls?.enc_id && obj?.name === 'product') {
                    removeFabricObjectsEncId(canvas, obj?.enc_id, 'product');
                    let fillColor =
                        selProductDtls?.product_color ?? projectSettings?.product_color;
                    let productIcon = getProductPin(fillColor)
                    let square;
                    square = new fabric.Rect({
                        left: selProductDtls?.position?.x - 14,
                        top: selProductDtls.position?.y - 15,
                        width: 26,
                        height: 28,
                        fill: "transparent",
                        stroke: "red",
                        strokeWidth: 2,
                        hoverCursor: "grab"
                    });

                    let path = fabric.loadSVGFromString(
                        productIcon,
                        function (objects, options) {
                            let obj = fabric.util.groupSVGElements(objects, options);
                            obj.set({
                                left: selProductDtls?.position?.x - obj.width / 2,
                                top: selProductDtls.position?.y - obj.height / 2,
                                selectable: false,
                                name: "product",
                                id: selProductDtls.product_name,
                                enc_id: selProductDtls?.enc_id,
                                lockRotation: true,
                                lockScalingX: true,
                                lockScalingY: true,
                                hoverCursor: "grab"
                            });
                            if (addNewProduct) {
                                const group = new fabric.Group([square, obj], {
                                    selectable: addNewProduct ? true : false,
                                    lockRotation: true,
                                    lockScalingX: true,
                                    lockScalingY: true,
                                    hasControls: false,
                                    hasBorders: false,
                                    name: "product",
                                    id: selProductDtls.enc_id,
                                    enc_id: selProductDtls?.enc_id,
                                    hoverCursor: "grab", boundaryGroup: true,
                                });
                                canvas.current.add(group).renderAll();
                            } else {
                                canvas.current.add(obj).renderAll();
                            }

                        }
                    );
                }
            });
        } else {
            canvas?.current?.forEachObject((obj) => {
                if (obj.name === "temp_prod") {
                    removeFabricObjectsByName(canvas, "temp_prod");
                    let fillColor =
                        selProductDtls?.product_color ??
                        projectSettings?.product_color ??
                        "red";
                    let productIcon = getProductPin(fillColor)
                    let path = fabric.loadSVGFromString(
                        productIcon,
                        function (objects, options) {
                            let obj = fabric.util.groupSVGElements(objects, options);

                            obj.set({
                                left: selProductDtls?.position?.x - obj.width / 2,
                                top: selProductDtls?.position?.y - obj.width / 2,
                                name: "temp_prod",
                                lockRotation: true,
                                lockScalingX: true,
                                lockScalingY: true,
                                hoverCursor: "grab",
                                boundaryGroup: true,
                            });

                            canvas?.current?.add(obj);
                        }
                    );
                } else if (obj?.enc_id == selProductDtls?.enc_id && obj?.name === 'product') {
                    removeFabricObjectsEncId(canvas, obj?.enc_id, 'product');
                    let fillColor =
                        selProductDtls?.product_color ?? projectSettings?.product_color;
                    let productIcon = getProductPin(fillColor)
                    let square;
                    square = new fabric.Rect({
                        left: selProductDtls?.position?.x - 14,
                        top: selProductDtls.position?.y - 15,
                        width: 26,
                        height: 28,
                        fill: "transparent",
                        stroke: "red",
                        strokeWidth: 2,
                        hoverCursor: "grab"
                    });

                    let path = fabric.loadSVGFromString(
                        productIcon,
                        function (objects, options) {
                            let obj = fabric.util.groupSVGElements(objects, options);
                            obj.set({
                                left: selProductDtls?.position?.x - obj.width / 2,
                                top: selProductDtls.position?.y - obj.height / 2,
                                selectable: false,
                                name: "product",
                                id: selProductDtls.product_name,
                                enc_id: selProductDtls?.enc_id,
                                lockRotation: true,
                                lockScalingX: true,
                                lockScalingY: true,
                                hoverCursor: "grab"
                            });
                            if (addNewProduct) {
                                const group = new fabric.Group([square, obj], {
                                    selectable: addNewProduct ? true : false,
                                    lockRotation: true,
                                    lockScalingX: true,
                                    lockScalingY: true,
                                    hasControls: false,
                                    hasBorders: false,
                                    name: "product",
                                    id: selProductDtls.enc_id,
                                    enc_id: selProductDtls?.enc_id,
                                    hoverCursor: "grab", boundaryGroup: true,
                                });
                                canvas.current.add(group).renderAll();
                            } else {
                                canvas.current.add(obj).renderAll();
                            }

                        }
                    );
                }
            });
        }

        window.requestAnimationFrame(() => {
            canvas?.current?.renderAll();
            setCanvasUpdated((prev) => !prev);
        });
        // canvas?.current?.renderAll();
        triggerMouseWheelManually(canvas)
    }
}

const updateBeaconPin = (canvas, selBeaconDtls, projectSettings, setCanvasUpdated, combinedArray, addNewQrCodeBeacon) => {
    if (canvas?.current && selBeaconDtls?.beacon_color) {
        if (combinedArray) {
            combinedArray?.forEach((obj) => {
                if (obj.name === "temp_beacon") {
                    removeFabricObjectsByName(canvas, "temp_beacon");
                    let fillColor =
                        selBeaconDtls?.beacon_color ??
                        projectSettings?.beacon_color ??
                        "red";
                    let beaconIcon = getBeaconPin(fillColor)
                    let path = fabric.loadSVGFromString(
                        beaconIcon,
                        function (objects, options) {
                            let objUpdate = fabric.util.groupSVGElements(objects, options);
                            objUpdate.set({
                                left: selBeaconDtls?.position?.x - obj.width / 2,
                                top: selBeaconDtls?.position?.y - obj.width / 2,
                                name: "temp_beacon",
                                lockRotation: true,
                                lockScalingX: true,
                                lockScalingY: true,
                                hoverCursor: "grab",
                                boundaryGroup: true,
                            });
                            canvas?.current?.add(objUpdate);
                        }
                    );
                } else if (obj?.enc_id == selBeaconDtls?.enc_id && obj?.name === 'beacon') {
                    removeFabricObjectsEncId(canvas, obj?.enc_id, 'beacon');
                    let fillColor =
                        selBeaconDtls?.beacon_color ??
                        projectSettings?.beacon_color ??
                        "red";
                    let beaconIcon = getBeaconPin(fillColor)
                    let square;
                    square = new fabric.Rect({
                        left: selBeaconDtls.position?.x - 12,
                        top: selBeaconDtls.position?.y - 12,
                        width: 22,
                        height: 22,
                        fill: "transparent",
                        stroke: "red",
                        strokeWidth: 2
                    });

                    let path = fabric.loadSVGFromString(
                        beaconIcon,
                        function (objects, options) {
                            let obj = fabric.util.groupSVGElements(objects, options);

                            obj.set({
                                // left: prod.position?.x - obj.width / 2,
                                // top: prod.position?.y - obj.height / 2,
                                left: selBeaconDtls?.position?.x - obj.width / 2,
                                top: selBeaconDtls.position?.y - obj.height / 2,
                                selectable: true,
                                name: "beacon",
                                id: selBeaconDtls.beacon_name,
                                enc_id: selBeaconDtls?.enc_id,
                                lockRotation: true,
                                lockScalingX: true,
                                lockScalingY: true,
                                hoverCursor: "grab"
                            });
                            if (addNewQrCodeBeacon) {
                                const group = new fabric.Group([square, obj], {
                                    selectable: true,
                                    lockRotation: true,
                                    lockScalingX: true,
                                    lockScalingY: true,
                                    name: "beacon",
                                    id: selBeaconDtls.enc_id,
                                    enc_id: selBeaconDtls?.enc_id,
                                    hoverCursor: "grab",
                                    hasBorders: false,
                                    hasControls: false,
                                });
                                canvas.current.add(group).renderAll();
                            } else {
                                canvas.current.add(obj).renderAll();
                            }
                        }
                    );
                }
            });
        } else {
            canvas?.current?.forEachObject((obj) => {
                if (obj.name === "temp_beacon") {
                    removeFabricObjectsByName(canvas, "temp_beacon");
                    let fillColor =
                        selBeaconDtls?.beacon_color ??
                        projectSettings?.beacon_color ??
                        "red";
                    let beaconIcon = getBeaconPin(fillColor)
                    let path = fabric.loadSVGFromString(
                        beaconIcon,
                        function (objects, options) {
                            let objUpdate = fabric.util.groupSVGElements(objects, options);
                            objUpdate.set({
                                left: selBeaconDtls?.position?.x - obj.width / 2,
                                top: selBeaconDtls?.position?.y - obj.width / 2,
                                name: "temp_beacon",
                                lockRotation: true,
                                lockScalingX: true,
                                lockScalingY: true,
                                hoverCursor: "grab",
                                boundaryGroup: true,
                            });
                            canvas?.current?.add(objUpdate);
                        }
                    );
                } else if (obj?.enc_id == selBeaconDtls?.enc_id && obj?.name === 'beacon') {
                    removeFabricObjectsEncId(canvas, obj?.enc_id, 'beacon');
                    let fillColor =
                        selBeaconDtls?.beacon_color ??
                        projectSettings?.beacon_color ??
                        "red";
                    let beaconIcon = getBeaconPin(fillColor)
                    let square;
                    square = new fabric.Rect({
                        left: selBeaconDtls.position?.x - 12,
                        top: selBeaconDtls.position?.y - 12,
                        width: 22,
                        height: 22,
                        fill: "transparent",
                        stroke: "red",
                        strokeWidth: 2
                    });

                    let path = fabric.loadSVGFromString(
                        beaconIcon,
                        function (objects, options) {
                            let obj = fabric.util.groupSVGElements(objects, options);

                            obj.set({
                                // left: prod.position?.x - obj.width / 2,
                                // top: prod.position?.y - obj.height / 2,
                                left: selBeaconDtls?.position?.x - obj.width / 2,
                                top: selBeaconDtls.position?.y - obj.height / 2,
                                selectable: true,
                                name: "beacon",
                                id: selBeaconDtls.beacon_name,
                                enc_id: selBeaconDtls?.enc_id,
                                lockRotation: true,
                                lockScalingX: true,
                                lockScalingY: true,
                                hoverCursor: "grab"
                            });
                            const group = new fabric.Group([square, obj], {
                                selectable: true,
                                lockRotation: true,
                                lockScalingX: true,
                                lockScalingY: true,
                                name: "beacon",
                                id: selBeaconDtls.enc_id,
                                enc_id: selBeaconDtls?.enc_id,
                                hoverCursor: "grab"
                            });
                            canvas.current.add(group).renderAll();
                        }
                    );
                }
            });
        }
        window.requestAnimationFrame(() => {
            canvas?.current?.renderAll();
            setCanvasUpdated((prev) => !prev);
        });
        triggerMouseWheelManually(canvas)
    }
}

const updateAmenityPin = (canvas, selAmenityDtls, projectSettings, setCanvasUpdated, aminityIcons, combinedArray,addNewAmenity) => {
    if (
        canvas?.current &&
        (selAmenityDtls?.amenity_color || selAmenityDtls?.icon_path)
    ) {
        if (combinedArray) {
            combinedArray?.forEach((obj) => {
                if (obj.name === "temp_amenity") {
                    //// console.log(selAmenityDtls);
                    removeFabricObjectsByName(canvas, "temp_amenity");
                    let fillColor =
                        selAmenityDtls?.amenity_color ??
                        projectSettings?.amenity_color ??
                        "red";
                    let iconPath = aminityIcons.find(
                        (ele) => selAmenityDtls?.icon_id == ele?.enc_id
                    )?.path;
                    let amenityIcon = ChangeSvgColorPassingBE(iconPath, fillColor);
                    let path = fabric.loadSVGFromString(
                        amenityIcon,
                        function (objects, options) {
                            let obj = fabric.util.groupSVGElements(objects, options);

                            obj.set({
                                left: selAmenityDtls?.position?.x - obj.width / 2,
                                top: selAmenityDtls?.position?.y - obj.width / 2,
                                name: "temp_amenity",
                                lockRotation: true,
                                lockScalingX: true,
                                lockScalingY: true,
                                hoverCursor: "grab",
                                boundaryGroup: true,
                            });
                            canvas.current.add(obj);
                        }
                    );
                } else if (obj?.enc_id == selAmenityDtls?.enc_id && obj?.name === 'amenity') {
                    console.log(selAmenityDtls)
                    console.log(obj)
                    removeFabricObjectsEncId(canvas, selAmenityDtls?.enc_id, 'amenity');
                    let fillColor =
                        selAmenityDtls?.amenity_color ??
                        projectSettings?.amenity_color ??
                        "red";
                    let iconPath = aminityIcons.find(
                        (ele) => selAmenityDtls?.icon_id == ele?.enc_id
                    )?.path;
                    let amenityIcon = ChangeSvgColorPassingBE(iconPath, fillColor);
                    let square;
                    square = new fabric.Rect({
                        left: selAmenityDtls.position?.x - 13,
                        top: selAmenityDtls.position?.y - 13,
                        width: 24,
                        height: 24,
                        fill: "transparent",
                        stroke: "red",
                        strokeWidth: 2,
                        hoverCursor: "grab"
                    });

                    let path = fabric.loadSVGFromString(
                        amenityIcon,
                        function (objects, options) {
                            let obj = fabric.util.groupSVGElements(objects, options);

                            obj.set({
                                left: selAmenityDtls.position?.x - obj.width / 2,
                                top: selAmenityDtls.position?.y - obj.height / 2,
                                selectable: true,
                                name: "amenity",
                                id: selAmenityDtls.amenity_name,
                                enc_id: selAmenityDtls?.enc_id,
                                lockRotation: true,
                                lockScalingX: true,
                                lockScalingY: true,
                                hoverCursor: "grab"
                            });
                            if (addNewAmenity) {
                                const group = new fabric.Group([square, obj], {
                                    selectable: true,
                                    lockRotation: true,
                                    lockScalingX: true,
                                    lockScalingY: true,
                                    name: "amenity",
                                    id: selAmenityDtls.enc_id,
                                    enc_id: selAmenityDtls?.enc_id,
                                    hoverCursor: "grab",
                                    hasBorders: false,
                                    hasControls: false,
                                });
                                canvas.current.add(group).renderAll();
                            } else {
                                canvas.current.add(obj).renderAll();
                            }
                        }
                    );
                }
            });
        } else {
            canvas?.current?.forEachObject((obj) => {
                if (obj.name === "temp_amenity") {
                    //// console.log(selAmenityDtls);
                    removeFabricObjectsByName(canvas, "temp_amenity");
                    let fillColor =
                        selAmenityDtls?.amenity_color ??
                        projectSettings?.amenity_color ??
                        "red";
                    let iconPath = aminityIcons.find(
                        (ele) => selAmenityDtls?.icon_id == ele?.enc_id
                    )?.path;
                    let amenityIcon = ChangeSvgColorPassingBE(iconPath, fillColor);
                    let path = fabric.loadSVGFromString(
                        amenityIcon,
                        function (objects, options) {
                            let obj = fabric.util.groupSVGElements(objects, options);

                            obj.set({
                                left: selAmenityDtls?.position?.x - obj.width / 2,
                                top: selAmenityDtls?.position?.y - obj.width / 2,
                                name: "temp_amenity",
                                lockRotation: true,
                                lockScalingX: true,
                                lockScalingY: true,
                                hoverCursor: "grab",
                                boundaryGroup: true,
                            });
                            canvas.current.add(obj);
                        }
                    );
                } else if (obj?.enc_id == selAmenityDtls?.enc_id && obj?.name === 'amenity') {
                    removeFabricObjectsEncId(canvas, selAmenityDtls?.enc_id, 'amenity');
                    let fillColor =
                        selAmenityDtls?.amenity_color ??
                        projectSettings?.amenity_color ??
                        "red";
                    let iconPath = aminityIcons.find(
                        (ele) => selAmenityDtls?.icon_id == ele?.enc_id
                    )?.path;
                    let amenityIcon = ChangeSvgColorPassingBE(iconPath, fillColor);
                    let square;
                    square = new fabric.Rect({
                        left: selAmenityDtls.position?.x - 13,
                        top: selAmenityDtls.position?.y - 13,
                        width: 24,
                        height: 24,
                        fill: "transparent",
                        stroke: "red",
                        strokeWidth: 2,
                        hoverCursor: "grab"
                    });

                    let path = fabric.loadSVGFromString(
                        amenityIcon,
                        function (objects, options) {
                            let obj = fabric.util.groupSVGElements(objects, options);

                            obj.set({
                                left: selAmenityDtls.position?.x - obj.width / 2,
                                top: selAmenityDtls.position?.y - obj.height / 2,
                                selectable: true,
                                name: "amenity",
                                id: selAmenityDtls.amenity_name,
                                enc_id: selAmenityDtls?.enc_id,
                                lockRotation: true,
                                lockScalingX: true,
                                lockScalingY: true,
                                hoverCursor: "grab"
                            });
                            const group = new fabric.Group([square, obj], {
                                selectable: true,
                                lockRotation: true,
                                lockScalingX: true,
                                lockScalingY: true,
                                name: "amenity",
                                id: selAmenityDtls.enc_id,
                                enc_id: selAmenityDtls?.enc_id,
                                hoverCursor: "grab"
                            });
                            canvas.current.add(group).renderAll();
                        }
                    );
                }
            });
        }
        window.requestAnimationFrame(() => {
            canvas?.current?.renderAll();
            setCanvasUpdated((prev) => !prev);
        });
        triggerMouseWheelManually(canvas)
    }
}

const updateSafetyPin = (canvas, selSafetyDtls, projectSettings, setCanvasUpdated, safetyIcons, combinedArray,addNewSafety) => {
    if (canvas?.current && (selSafetyDtls?.safety_color || selSafetyDtls?.icon_path)
    ) {
        if (combinedArray) {
            combinedArray?.forEach((obj) => {
                if (obj.name === "temp_safety") {
                    removeFabricObjectsByName(canvas, "temp_safety");
                    let fillColor =
                        selSafetyDtls?.safety_color ??
                        projectSettings?.safety_color ??
                        "red";
                    let iconPath = safetyIcons.find(
                        (ele) => selSafetyDtls?.icon_id == ele?.enc_id
                    )?.path;
                    let safetyIcon = ChangeSvgColorPassingBE(iconPath, fillColor);
                    let path = fabric.loadSVGFromString(
                        safetyIcon,
                        function (objects, options) {
                            let obj = fabric.util.groupSVGElements(objects, options);

                            obj.set({
                                left: selSafetyDtls?.position?.x - obj.width / 2,
                                top: selSafetyDtls?.position?.y - obj.width / 2,
                                name: "temp_safety",
                                lockRotation: true,
                                lockScalingX: true,
                                lockScalingY: true,
                                hoverCursor: "grab",
                                boundaryGroup: true,
                            });
                            canvas.current.add(obj);
                        }
                    );
                } else if (obj?.enc_id == selSafetyDtls?.enc_id && obj?.name === 'safety') {
                    removeFabricObjectsEncId(canvas, selSafetyDtls?.enc_id, 'safety');
                    let fillColor =
                        selSafetyDtls?.safety_color ??
                        projectSettings?.safety_color ??
                        "red";
                    let iconPath = safetyIcons.find(
                        (ele) => selSafetyDtls?.icon_id == ele?.enc_id
                    )?.path;
                    let safetyIcon = ChangeSvgColorPassingBE(iconPath, fillColor);
                    let square;

                    square = new fabric.Rect({
                        left: selSafetyDtls.position?.x - 13,
                        top: selSafetyDtls.position?.y - 13,
                        width: 24,
                        height: 24,
                        fill: "transparent",
                        stroke: "red",
                        strokeWidth: 2,
                        hoverCursor: "grab"
                    });
                    let path = fabric.loadSVGFromString(
                        safetyIcon,
                        function (objects, options) {
                            let obj = fabric.util.groupSVGElements(objects, options);

                            obj.set({
                                left: selSafetyDtls.position?.x - obj.width / 2,
                                top: selSafetyDtls.position?.y - obj.height / 2,
                                selectable: true,
                                name: "safety",
                                id: selSafetyDtls.safety_name,
                                enc_id: selSafetyDtls.enc_id,
                                lockRotation: true,
                                lockScalingX: true,
                                lockScalingY: true,
                                hoverCursor: "grab"
                            });
                            if (addNewSafety) {
                                const group = new fabric.Group([square, obj], {
                                    selectable: true,
                                    lockRotation: true,
                                    lockScalingX: true,
                                    lockScalingY: true,
                                    name: "safety",
                                    id: selSafetyDtls.enc_id,
                                    enc_id: selSafetyDtls?.enc_id,
                                    hoverCursor: "grab"
                                });
                                // Highlight the edited pin
                                canvas.current.add(group).renderAll();
                            } else {
                                canvas.current.add(obj).renderAll();
                            }
                        }
                    );
                }
            });
        } else {
            canvas?.current?.forEachObject((obj) => {
                if (obj.name === "temp_safety") {
                    removeFabricObjectsByName(canvas, "temp_safety");
                    let fillColor =
                        selSafetyDtls?.safety_color ??
                        projectSettings?.safety_color ??
                        "red";
                    let iconPath = safetyIcons.find(
                        (ele) => selSafetyDtls?.icon_id == ele?.enc_id
                    )?.path;
                    let safetyIcon = ChangeSvgColorPassingBE(iconPath, fillColor);
                    let path = fabric.loadSVGFromString(
                        safetyIcon,
                        function (objects, options) {
                            let obj = fabric.util.groupSVGElements(objects, options);

                            obj.set({
                                left: selSafetyDtls?.position?.x - obj.width / 2,
                                top: selSafetyDtls?.position?.y - obj.width / 2,
                                name: "temp_safety",
                                lockRotation: true,
                                lockScalingX: true,
                                lockScalingY: true,
                                hoverCursor: "grab",
                                boundaryGroup: true,
                            });
                            canvas.current.add(obj);
                        }
                    );
                } else if (obj?.enc_id == selSafetyDtls?.enc_id && obj?.name === 'safety') {
                    removeFabricObjectsEncId(canvas, selSafetyDtls?.enc_id, 'safety');
                    let fillColor =
                        selSafetyDtls?.safety_color ??
                        projectSettings?.safety_color ??
                        "red";
                    let iconPath = safetyIcons.find(
                        (ele) => selSafetyDtls?.icon_id == ele?.enc_id
                    )?.path;
                    let safetyIcon = ChangeSvgColorPassingBE(iconPath, fillColor);
                    let square;

                    square = new fabric.Rect({
                        left: selSafetyDtls.position?.x - 13,
                        top: selSafetyDtls.position?.y - 13,
                        width: 24,
                        height: 24,
                        fill: "transparent",
                        stroke: "red",
                        strokeWidth: 2,
                        hoverCursor: "grab"
                    });
                    let path = fabric.loadSVGFromString(
                        safetyIcon,
                        function (objects, options) {
                            let obj = fabric.util.groupSVGElements(objects, options);

                            obj.set({
                                left: selSafetyDtls.position?.x - obj.width / 2,
                                top: selSafetyDtls.position?.y - obj.height / 2,
                                selectable: true,
                                name: "safety",
                                id: selSafetyDtls.safety_name,
                                enc_id: selSafetyDtls.enc_id,
                                lockRotation: true,
                                lockScalingX: true,
                                lockScalingY: true,
                                hoverCursor: "grab"
                            });

                            const group = new fabric.Group([square, obj], {
                                selectable: true,
                                lockRotation: true,
                                lockScalingX: true,
                                lockScalingY: true,
                                name: "safety",
                                id: selSafetyDtls.enc_id,
                                enc_id: selSafetyDtls?.enc_id,
                                hoverCursor: "grab",
                                hasBorders: false,
                                hasControls: false,
                            });
                            // Highlight the edited pin
                            canvas.current.add(group).renderAll();
                        }
                    );
                }
            });
        }
        window.requestAnimationFrame(() => {
            canvas?.current?.renderAll();
            setCanvasUpdated((prev) => !prev);
        });
        triggerMouseWheelManually(canvas)
    }
}

const updateVerticalPin = (canvas, selVerticalDtls, projectSettings, combinedArray) => {

    if (
        canvas?.current &&
        (selVerticalDtls?.vt_color || selVerticalDtls?.icon_path)
    ) {
        // if (combinedArray) {
        canvas?.current?.forEachObject((obj) => {
            if (obj.name === "temp_vertical") {
                console.log(obj, "pin")
                removeFabricObjectsByName(canvas, "temp_vertical");
                let fillColor =
                    selVerticalDtls?.vt_color ??
                    projectSettings?.level_change_color ??
                    "red";
                let safetyIcon = selVerticalDtls?.icon_path
                    ? ChangeSvgColorPassingBE(selVerticalDtls?.icon_path, fillColor)
                    : getVerticalPin(fillColor)
                let path = fabric.loadSVGFromString(
                    safetyIcon,
                    function (objects, options) {
                        let obj = fabric.util.groupSVGElements(objects, options);

                        obj.set({
                            left: selVerticalDtls?.position?.x - obj.width / 2,
                            top: selVerticalDtls?.position?.y - obj.width / 2,
                            name: "temp_vertical",
                            lockRotation: true,
                            lockScalingX: true,
                            lockScalingY: true,
                            hoverCursor: "grab",
                            boundaryGroup: true,
                        });
                        canvas.current.add(obj);
                    }
                );
            }
        });
        //     } else {
        //         canvas?.current?.forEachObject((obj) => {
        //             if (obj.name === "temp_vertical") {
        // // console.log(obj,"at update pin")

        //                 removeFabricObjectsByName(canvas, "temp_vertical");
        //                 let fillColor =
        //                     selVerticalDtls?.vt_color ??
        //                     projectSettings?.level_change_color ??
        //                     "red";
        //                 let safetyIcon = selVerticalDtls?.icon_path
        //                     ? ChangeSvgColorPassingBE(selVerticalDtls?.icon_path, fillColor)
        //                     : getVerticalPin(fillColor)
        //                 let path = fabric.loadSVGFromString(
        //                     safetyIcon,
        //                     function (objects, options) {
        //                         let obj = fabric.util.groupSVGElements(objects, options);

        //                         obj.set({
        //                             left: selVerticalDtls?.position?.x - obj.width / 2,
        //                             top: selVerticalDtls?.position?.y - obj.width / 2,
        //                             name: "temp_vertical",
        //                             lockRotation: true,
        //                             lockScalingX: true,
        //                             lockScalingY: true,
        //                             hoverCursor: "grab",
        //                             boundaryGroup:true,
        //                         });
        //                         canvas.current.add(obj);
        //                     }
        //                 );
        //             }
        //         });
        //     }
        canvas?.current?.renderAll();
        triggerMouseWheelManually(canvas)
    }
}

export {
    updateProductPin,
    updateBeaconPin,
    updateAmenityPin,
    updateSafetyPin,
    updateVerticalPin
}