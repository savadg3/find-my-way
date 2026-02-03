import { fabric } from "fabric";

const initCanvas = (width, height, projectSettings) => {
    const canvasObj = new fabric.Canvas("canvas", {
        width,
        height,
        // backgroundColor: 'pink',
        selection: false,
        renderOnAddRemove: true,
        position: "absolute",
        name: 'canvas',
        preserveObjectStacking: true,
        fireRightClick: false,
        stopContextMenu: true,
        // backgroundColor: projectSettings?.background_color ? hexToRgb(projectSettings?.background_color, 0.4) : '#F6F7F3',
        backgroundColor: projectSettings?.background_color ?? '#F6F7F3',
    });
    return canvasObj;
};

export default initCanvas;