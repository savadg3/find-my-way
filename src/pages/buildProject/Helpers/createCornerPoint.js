// createCornerPoint.js

import { fabric } from 'fabric';

const createCornerPoint = (canvas, coords, name, pts, Pencil) => {
    const cornerPoint = new fabric.Circle({
        radius: 5,
        fill: pts.length === 0 ? "rgba(255, 0, 0, 0.5)" : "rgba(0,0,255,0.5)",
        left: coords?.x,
        top: coords?.y,
        originX: "center",
        originY: "center",
        selectable: pts.length === 0,
        name: name,
        id: `corner_point_${pts.length + 1}`,
        hoverCursor: `url(${Pencil}) 1 17, auto`
    });

    canvas?.current?.add(cornerPoint);
};

export default createCornerPoint;
