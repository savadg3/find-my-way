import { fabric } from "fabric";

const showObjLength = (obj, points, canvas) => {
    const sides = points ?? obj.get("points");

    for (let i = 0; i < sides.length; i++) {
        const sideStart = new fabric.Point(sides[i].x, sides[i].y);
        const sideEnd = new fabric.Point(
            sides[(i + 1) % sides.length].x,
            sides[(i + 1) % sides.length].y
        );

        const sideLength = Math.sqrt(
            Math.pow(sideEnd.x - sideStart.x, 2) +
            Math.pow(sideEnd.y - sideStart.y, 2)
        );
        const lengthInMeters = (sideLength / 100 / 2) * 10;
        const center = {
            x: (sideStart.x + sideEnd.x) / 2,
            y: (sideStart.y + sideEnd.y) / 2
        };
        const angle = Math.atan2(
            sideEnd.y - sideStart.y,
            sideEnd.x - sideStart.x
        );
        const textLeft = center.x - (lengthInMeters / 2) * Math.cos(angle);
        const textTop = center.y - (lengthInMeters / 2) * Math.sin(angle);
        const text = new fabric.Text(lengthInMeters.toFixed(2) + " m", {
            left: textLeft,
            top: textTop,
            originX: "center",
            originY: "center",
            selectable: false,
            hoverCursor: "auto",
            fontSize: 12,
            fontFamily: "Arial",
            fill: "black",
            fontWeight: 700,
            name: "tracing_obj_length"
        });
        const textOverlay = new fabric.Text(lengthInMeters.toFixed(2) + " m", {
            left: textLeft,
            top: textTop,
            originX: "center",
            originY: "center",
            selectable: false,
            hoverCursor: "auto",
            fontSize: 12,
            fontFamily: "Arial",
            fill: "black",
            fontWeight: 700,
            name: "tracing_obj_length",
            stroke: "white",
            strokeWidth: 3
        });
        canvas?.current?.add(textOverlay);
        canvas?.current?.add(text);
    }
};

export default showObjLength;