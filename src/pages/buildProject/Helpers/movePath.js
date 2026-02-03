import { removeFabricObjectsBId } from "./bringFabricObjects";

const dragNodeAndItsPath = (node, mouse, graph, canvas, setSelTraversibleDetails, renderTraversiblePaths) => {
    removeFabricObjectsBId(canvas, "short_path");
    localStorage.removeItem("shortestPath")
    const connectedEdges = graph.edges[node.id];
    // console.log(graph.positions, "graph position")
    // console.log(graph.edges, "graph edges")
    // console.log(connectedEdges, "connectedEdges")
    if (connectedEdges) {
        if (Object.keys(connectedEdges).length > 2) {
            let filteredConnectedEdges = removeLocationKeys(connectedEdges)
            let nearestLeft = graph.positions[Object.keys(filteredConnectedEdges)[0]]
            let nearestRight = graph.positions[Object.keys(filteredConnectedEdges)[1]]
            let changedPoint = interpolate(nearestLeft, nearestRight, mouse)
            graph.positions[node?.id] = changedPoint;
            if (areObjectsEqual(changedPoint, nearestRight)) {
                let positionItem = Object.entries(graph.positions, changedPoint)
                    .filter(([key, value]) => areFilterObjectsEqual(value, changedPoint))
                    .reduce((acc, [key, value]) => {
                        acc[key] = value;
                        return acc;
                    }, {});
                let edgeItem = getFilteredPositions(graph.edges[Object.keys(positionItem)[0]], node.id)
                let newPosition = graph.positions[Object.keys(edgeItem)[0]]
                let newPoint = interpolate(nearestRight, newPosition, mouse)
                graph.positions[node?.id] = newPoint;
                graph.edges = updateEdges(positionItem, graph.edges)
            }
            // else
            //     if (areObjectsEqual(changedPoint, nearestLeft)) {
            //     let positionItem =  Object.entries(graph.positions,changedPoint)
            //     .filter(([key, value]) => areFilterObjectsEqual(value, changedPoint))
            //     .reduce((acc, [key, value]) => {
            //         acc[key] = value;
            //         return acc;
            //     }, {});
            //     let edgeItem = getFilteredPositions(graph.edges[Object.keys(positionItem)[0]],node.id)
            //     let newPosition = graph.positions[Object.keys(edgeItem)[0]]
            //     let newPoint = interpolate(nearestLeft, newPosition, mouse)
            //     graph.positions[node?.id] = newPoint;
            //     graph.edges = updateEdges(positionItem, graph.edges)
            //     }
            else {
                // console.log("no item  matching")
                let newPoint = interpolate(nearestLeft, nearestRight, mouse)
                graph.positions[node?.id] = newPoint;
            }
            // console.log(changedPoint,"changedPoint")
        }
    }
    graph.restoreEdges(graph.edges);
    graph.restorePositions(graph.positions);
    setSelTraversibleDetails((prev) => ({
        ...prev,
        edges_data: graph.edges,
        points_data: graph.positions,
        post: true
    }));
    renderTraversiblePaths("move");
    canvas.current.setActiveObject(node);
};
// to move the point through two lines on dragging the mouse
const interpolate = (start, end, position) => {
    const t = Math.min(
        Math.max(
            ((position?.x - start?.x) * (end?.x - start?.x) +
                (position?.y - start?.y) * (end?.y - start?.y)) /
            (Math.pow(end?.x - start?.x, 2) + Math.pow(end?.y - start?.y, 2)),
            0
        ),
        1
    );
    return {
        x: start?.x + t * (end?.x - start?.x),
        y: start?.y + t * (end?.y - start?.y),
    };
};
// Function to compare objects
const areFilterObjectsEqual = (obj1, obj2) => {
    return obj1.x === obj2.x && obj1.y === obj2.y;
};
// update the graph.edges with new value
const updateEdges = (itemgot, edgesTochange) => {
    const itemgotKeys = Object.keys(itemgot);
    if (itemgotKeys.length !== 2) {
        // throw new Error("itemgot must contain exactly two keys.");
        console.log("itemgot must contain exactly two keys.")
    }
    const [firstItem, secondItem] = itemgotKeys;
    // Extract values
    const var1 = edgesTochange[firstItem][secondItem];
    const var2Key = Object.keys(edgesTochange[firstItem]).find(key => key !== secondItem);
    const var2 = edgesTochange[firstItem][var2Key];
    const var3 = edgesTochange[secondItem][firstItem];
    const var4Key = Object.keys(edgesTochange[secondItem]).find(key => key !== firstItem && !key.startsWith('location'));
    const var4 = edgesTochange[secondItem][var4Key];
    console.log(firstItem, secondItem, var1, var2Key, var2, var3, var4Key, "firstItem, secondItem,var4,var1,var2Key,var2,var3,var4Key,var4 dfgdfgdfgdf")
    console.log(edgesTochange[secondItem][var4Key], edgesTochange[secondItem][var2Key], edgesTochange[var4Key][firstItem], edgesTochange[var4Key][firstItem], `edgesTochange[${secondItem}][${var4Key}], edgesTochange[${secondItem}][${var2Key}],edgesTochange[${var4Key}][${firstItem}],edgesTochange[${var4Key}][${firstItem}] dfgdfgdfgdf`)
    // Update edgesTochange[secondItem]
    delete edgesTochange[secondItem][var4Key];
    delete edgesTochange[var4Key][secondItem];
    edgesTochange[secondItem][var2Key] = var2;
    // Update edgesTochange[var4Key]
    delete edgesTochange[var4Key][firstItem];
    edgesTochange[var4Key][firstItem] = var3;
    console.log(edgesTochange, "edgesTochange")
    return edgesTochange;
}
// remove key starts with location from object
const removeLocationKeys = (obj) => {
    let filteredObj = {};
    for (const [key, value] of Object.entries(obj)) {
        if (!key.startsWith("location")) {
            filteredObj[key] = value;
        }
    }
    return filteredObj;
};
// filter graph.positions to get a graph.edge point
const getFilteredPositions = (data, keyname) => {
    return Object.entries(data)
        .filter(([key, value]) => key !== keyname)
        .reduce((acc, [key, value]) => {
            acc[key] = value;
            return acc;
        }, {});
};

// to check two object is equal or not
const areObjectsEqual = (obj1, obj2) => {
    // Check if both arguments are objects
    if (typeof obj1 !== 'object' || typeof obj2 !== 'object' || obj1 === null || obj2 === null) {
        return false;
    }
    // Get keys of both objects
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
    // Check if the number of keys is the same
    if (keys1.length !== keys2.length) {
        return false;
    }
    // Check if all keys and values are the same
    for (const key of keys1) {
        if (obj1[key] !== obj2[key]) {
            return false;
        }
    }
    return true;
};

export default  dragNodeAndItsPath 