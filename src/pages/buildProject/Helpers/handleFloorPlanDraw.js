import changeSelectionAllObjs from "./changeSelectionAllObjs";

export default handleFloorPlanDraw = (canvas, event) => {
    changeSelectionAllObjs(false, "tracing");
    let mouse = canvas.current.getPointer(event.e);
    let coords = { x: mouse?.x, y: mouse?.y };
};