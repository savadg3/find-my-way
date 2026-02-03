import { fabric } from "fabric";


const addPins = (canvas, mouse, pinIcon, name, setState, seldetails, submitID) => {
    fabric.loadSVGFromString(
        pinIcon,
        function (objects, options) {
            let obj = fabric.util.groupSVGElements(objects, options);
            obj.set({
                left: mouse?.x - obj.width / 2,
                top: mouse?.y - obj.height / 2,
                name: name,
                lockRotation: true,
                lockScalingX: true,
                lockScalingY: true,
                hoverCursor: "grab",
                hasControls: false,
                hasBorders: false
            });
            canvas.current.add(obj).renderAll();
            setState((prev) => ({
                ...prev,
                position: { x: mouse?.x, y: mouse?.y }
            }));
            console.log(obj,'obj')
            if (seldetails?.enc_id) {
                document.getElementById(submitID)?.click();
            }
            // canvasBackgroundImageHandler(null);
        }
    );
}
export default addPins;