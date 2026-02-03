import { fabric } from "fabric";

const controllPan = (evt, canvas) => {
    var delta = new fabric.Point(evt.e.movementX, evt.e.movementY);
    canvas.current.relativePan(delta);
    canvas.current.defaultCursor = "grab";
    canvas.current.hoverCursor = "grab";
    canvas.current.forEachObject(function (obj) {
        if (obj.name === "backgroundRect") {
            obj.set("hoverCursor", "grab");
            obj.set("defaultCursor", "grab");
        }
    });
    canvas.current.renderAll();
};

export default controllPan;