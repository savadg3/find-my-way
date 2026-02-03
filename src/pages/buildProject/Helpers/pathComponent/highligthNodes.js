import { bringFabricObjectsToFrontByName, removeFabricObjectsBId, removeFabricObjectsByName } from "../bringFabricObjects";

const highligthNodes = (canvas, projectSettings, shortestPath,showOtherNodes = true,graph) => {
    canvas.current.forEachObject(function (obj) {
        if (obj.name === "node") {
            if (shortestPath.includes(obj.id)) {
                if (
                    !shortestPath.includes(obj.id) ||
                    (shortestPath[0] !== obj.id &&
                        shortestPath[shortestPath.length - 1] !== obj.id)
                ) {
                    let newCircle = new fabric.Circle({
                        ...obj,
                        // fill: obj?.fill == 'rgba(0,255,0,0.5)' ? 'rgba(0,255,0,0.5)' : projectSettings?.navigation_color ?? "red"
                        fill: projectSettings?.navigation_color ?? "red",
                        name:"short_path_node",
                        lockMovementX: true,
                        lockMovementY: true,
                        lockRotation: true,
                        lockScalingX: true,
                        lockScalingY: true,
                        hasControls: false,
                        hasBorders: false,
                        strokeUniform: true
                    });
                    canvas.current.add(newCircle);
                    newCircle.bringToFront();
                }
                canvas.current.renderAll();
            } else {
                if (showOtherNodes) {
                    let color = obj.fill;
                    let id = obj.id
                    if (graph?.edges[id]) {
                        const hasOnePinOrNot = Object.keys(graph.edges[id]).filter(item => item.includes('_'));
                        if (hasOnePinOrNot?.length === 1 && Object.keys(graph.edges[id]).length > 2) {
                            color = "rgb(255, 172, 28,0.5)"
                        } else {
                            color = graph.subNode.includes(id) ? "rgba(0,255,0,0.5)" : "rgba(0,0,255,0.5)"
                        }
                    }
                    let newCircle = new fabric.Circle({
                        ...obj,
                        fill: color
                    });
                    removeFabricObjectsBId(canvas, obj.id);
                    canvas.current.remove(obj);
                    canvas.current.add(newCircle);
                    canvas.current.renderAll();
                }
            }
        }
    });
    bringFabricObjectsToFrontByName(canvas, "product");
    bringFabricObjectsToFrontByName(canvas, "location");
    bringFabricObjectsToFrontByName(canvas, "beacon");
    bringFabricObjectsToFrontByName(canvas, "amenity");
    bringFabricObjectsToFrontByName(canvas, "safety");
    bringFabricObjectsToFrontByName(canvas, "vertical");
};

export default highligthNodes;