// showLineLength.js

import { fabric } from 'fabric';
import { calculateDistance } from './calculateDistance';
import Pencil from "../../../assets/icons/pencil.png";

const showLineLength = (canvas, pts, objName, toolActive, cursor) => {
    let length = 0;
    let center = {};
    for (let i = 1; i < pts.length; i++) {
        const point1 = pts[i - 1];
        const point2 = pts[i];
        const distance = calculateDistance(point1, point2);
        center = {
            x: (point1.x + point2.x) / 2,
            y: (point1.y + point2.y) / 2
        };
        length = ((distance * 0.5) / 100) * 10;
    }

    const angle = Math.atan2(
        pts[pts.length - 1]?.y - pts[0]?.y,
        pts[pts.length - 1]?.x - pts[0]?.x
    );
    const textLeft = center.x - (length / 2) * Math.cos(angle);
    const textTop = center.y - (length / 2) * Math.sin(angle);

    const text = new fabric.Text(`${length.toFixed(2)} m`, {
        left: textLeft,
        top: textTop,
        selectable: false,
        hoverCursor: toolActive === 'Draw' ? `url(${Pencil}) 1 17, auto` : 'auto',
        fontSize: 12,
        fontFamily: "Arial",
        fill: "black",
        name: objName,
        originX: "center",
        originY: "center",
        fontWeight: 700
    });
    if (cursor) {
        text.hoverCursor = cursor
    }
    const textOverlay = new fabric.Text(`${length.toFixed(2)} m`, {
        left: textLeft,
        top: textTop,
        selectable: false,
        hoverCursor: toolActive === 'Draw' ? `url(${Pencil}) 1 17, auto` : 'auto',
        fontSize: 12,
        fontFamily: "Arial",
        fill: "black",
        name: objName,
        originX: "center",
        originY: "center",
        fontWeight: 700,
        stroke: "white",
        strokeWidth: 3
    });
    if (cursor) {
        textOverlay.hoverCursor = cursor
    }
    canvas.current?.add(textOverlay);
    canvas.current?.add(text);
    canvas.current.bringToFront(text);
};

export default showLineLength;
