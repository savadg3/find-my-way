import { fabric } from "fabric";

const addNodePoint = (mouse, nodeName, color,isconnected = false) => {
    // const color = graph.subNode.includes(nodeName) ? "rgba(0,255,0,0.5)" : "rgba(0,0,255,0.5)"
    let node = new fabric.Circle({
        radius: 7,
        fill: color,
        left: mouse?.x,
        top: mouse?.y,
        selectable: false,
        originX: "center",
        originY: "center",
        hoverCursor: "auto",
        selectable: false,
        name: `node`,
        id: nodeName,
        lockMovementX: true,
        lockMovementY: true,
        lockRotation: true,
        lockScalingX: true,
        lockScalingY: true,
        hasControls: false,
        hasBorders: false,
        strokeUniform: true,
        // scaleX: 1 / canvas.current?.getZoom(),
        // scaleY: 1 / canvas.current?.getZoom(),
    });
    if (color === 'rgba(0,255,0,0.5)') {
        node.subpath = true
    }
    if (isconnected) {
        node.isconnected = true
    }
    return node;
}

const addPolyLine = (pts, name) => {
    let polyline = new fabric.Polyline(pts, {
        objectCaching: false,
        fill: "",
        stroke: "black",
        zIndex: 12,
        originX: "center",
        originY: "center",
        selectable: true,
        hoverCursor: "default",
        name: name,
        strokeWidth: 1,
        perPixelTargetFind: true,
        lockMovementX: true,
        lockMovementY: true,
        lockRotation: true,
        lockScalingX: true,
        lockScalingY: true,
        hasControls: false,
        hasBorders: false,
        // strokeUniform: true,
    });
    return polyline;
}

export { addNodePoint, addPolyLine }