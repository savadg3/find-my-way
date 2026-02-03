
import { removeFabricObjectsBId } from "./bringFabricObjects";
import { removeNode } from "./removeLine&Node";
import { checkPinConnection } from "./renderObjs";

const removeEmptyNode = (canvas, graph, activeTab, isCommonSidebarVisible) => {
    // Finding entries with empty dictionaries
    const edges = graph.getEdges();
    const emptyDicts = Object.entries(edges).filter(([key, value]) => Object.keys(value).length === 0);
    emptyDicts.forEach(([key, value]) => {
        removeNode(key, true, graph, canvas);
        removeFabricObjectsBId(canvas, key);
        checkPinConnection(canvas, graph, activeTab, isCommonSidebarVisible)
        // canvas.current?.renderAll();
    });
};

// Export the function
export { removeEmptyNode };