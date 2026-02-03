import { fabric } from "fabric";

const drawLine = (p1, p2, name = "path", id = "path", canvas, color = "black") => {
    let points = [p1?.x, p1?.y, p2?.x, p2?.y];
    let line = new fabric.Line(points, {
        strokeWidth: 1 / canvas.current?.getZoom() < 0.25 ? 0.25 : 1 / canvas.current?.getZoom() > 10 ? 10 : 1 / canvas.current?.getZoom(),
        // stroke: "black",
        stroke: color,
        selectable: false,
        name,
        id,
        perPixelTargetFind: true,
        lockMovementX: true,
        lockMovementY: true,
        lockRotation: true,
        lockScalingX: true,
        lockScalingY: true,
        hoverCursor: "auto"
    });
    canvas.current.add(line);

    let lineId = id.split("$").splice(1)
    let arrayofId = lineId.filter((item) => item.includes("_")).map((item) => item.split("_")[1])
    // let ids = [edge.split("_")[1],edge2.split("_")[1]]
    // console.log(arrayofId,"arrayofId")
    canvas?.current?.forEachObject(function (obj) {
        // console.log(obj?.enc_id)
        if (arrayofId.includes(obj?.enc_id + "") && !obj.types) {
            // console.log(obj,"obj")
            canvas.current?.bringToFront(obj);
        }
    });
    return line;
};



export default drawLine;