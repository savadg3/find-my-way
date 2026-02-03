import addConnectionBtwnEdges, { checkSubnodePathOrNot } from "./addConnectionBtwnEdges";
import { addNodePoint } from "./addNodeOrLine";
import { findObjectByEnc_id, findObjectById, removeFabricObjectsBId } from "./bringFabricObjects";
import { calculateDistance, isInsideRadius } from "./calculateDistance";
import drawLine from "./drawLine";
import { removeLine, removeNode } from "./removeLine&Node";
import { useCallback } from 'react';
import { debounce } from 'lodash';
import { highLightSelectedPaths } from "./pathComponent/highLightSelectedPaths";

const dragNodeOnMainPath = (node, mouse, graph, canvas, setSelTraversibleDetails, renderTraversiblePaths, evt, isActive = true) => {
    // console.log(node)
    removeFabricObjectsBId(canvas, "short_path");
    localStorage.removeItem("shortestPath")
    const connectedEdges = graph.edges[node.id];
    // console.log(connectedEdges,"connectedEdges")
    let keys = connectedEdges ? Object.keys(connectedEdges) : []
    if (connectedEdges) {
        if (Object.keys(connectedEdges).length >= 2 && keys.some(item => item.includes('_'))) {
            // console.log("condition one")
            let filteredConnectedEdges = removeLocationKeys(connectedEdges)
            // let filteredConnectedEdges = connectedEdges
            const checkSubPathOnly = Object.keys(filteredConnectedEdges)

            if (checkSubPathOnly?.length < 2) {
                /* Move subnode with only one connection */
                // console.log(node)
                graph.positions[node?.id] = mouse;
                node?.set({
                    left: graph.positions[node?.id].x,
                    top: graph.positions[node?.id].y
                })
                debouncedUpdateState(graph, setSelTraversibleDetails);
                renderTraversiblePaths("move");
                canvas.current.setActiveObject(node);
                const endNodeId = getOppositeNodeId(node?.id, graph);
            // console.log(endNodeId,"endNodeId")
                // console.log(checkSubPathOnly, "checkSubPathOnly")
                // moveWithAllNodes(mouse,node?.id,endNodeId,graph)
                return;
            } 
            const connectedNodes = Object.keys(connectedEdges)
            // console.log(checkSubPathOnly,"check subpath only")
            const findPin = connectedNodes.find((item) => item.includes('_'))
            let nearestLeft = graph.positions[Object.keys(filteredConnectedEdges)[0]]
            let nearestRight = graph.positions[Object.keys(filteredConnectedEdges)[1]]
            // console.log(node?.id, Object.keys(filteredConnectedEdges), 'node?.id')

            let changedPoint = interpolate(nearestLeft, nearestRight, mouse, graph.positions)

            graph.positions[node?.id] = changedPoint;
            // console.log(areObjectsEqual(changedPoint, nearestRight), 'filteredConnectedEdges')
            if (areObjectsEqual(changedPoint, nearestRight)) {
                let positionItem = findMatchingObject(graph.positions, changedPoint, node.id)
                let edgeItem = getFilteredData(graph.edges[Object.keys(positionItem)[0]], node.id)
                let newPosition = graph.positions[Object.keys(edgeItem)[0]]
                let newPoint = interpolate(nearestRight, newPosition, mouse, graph.positions)
                let nodesConnected = Object.keys(filteredConnectedEdges)
                let nodePosition = graph.positions[nodesConnected[1]]
                // console.log(node?.id,positionItem,edgeItem,newPosition,newPoint,nodesConnected,nodePosition,"positionItem,edgeItem,newPosition,newPoint,nodesConnected,nodePosition")

                let insideRadius = false
                insideRadius = isInsideRadius(mouse, nodePosition, node?.radius)
                if (!insideRadius) {
                    moveAndInterconnect(node, newPoint, filteredConnectedEdges, findPin, graph, canvas)
                }
            } else if (areObjectsEqual(changedPoint, nearestLeft)) {
                let positionItem = findMatchingObject(graph.positions, changedPoint, node.id)
                let edgeItem = getFilteredData(graph.edges[Object.keys(positionItem)[0]], node.id)
                let newPosition = graph.positions[Object.keys(edgeItem)[0]]
                // console.log(nearestRight, newPosition, 'interpolate')
                let newPoint = interpolate(nearestLeft, newPosition, mouse, graph.positions)
                let nodesConnected = Object.keys(filteredConnectedEdges)
                let nodePosition = graph.positions[nodesConnected[0]]
                let insideRadius = false
                insideRadius = isInsideRadius(mouse, nodePosition, node?.radius)
                if (!insideRadius) {
                    moveAndInterconnect(node, newPoint, filteredConnectedEdges, findPin, graph, canvas, 0)
                }

            } else {
                // console.log("no-item -matching")
            }
        }
        else if (Object.keys(connectedEdges).length === 1 && Object.keys(connectedEdges)[0].includes('_')) {
            // console.log("condition two")
            const newPosition = mouse;
            const startNodeId = node.id;
            graph.positions[startNodeId] = newPosition;
            // const intersectingPolyline = getIntersectingPolyline(canvas, newPosition);
            // console.log(intersectingPolyline, 'intersectingPolyline')

            const visitedNodes = [];
            const traverseGraph = (currentNode) => {
                if (visitedNodes.includes(currentNode)) return;
                visitedNodes.push(currentNode);
                // console.log(currentNode,graph,"currentNode")
                if (!currentNode) return;

                const edges = Object.keys(graph.edges[currentNode])
                    .filter(edge => !edge.includes('_') && !visitedNodes?.includes(edge));

                edges.forEach(nextNode => {
                    const pos1 = graph.positions[currentNode];
                    const pos2 = graph.positions[nextNode];

                    if (checkIfPointIntersectsLine(pos1, pos2, newPosition)) {
                        let path1 = findObjectById(`path$${currentNode}$${nextNode}`, canvas);
                        let path2 = findObjectById(`path$${nextNode}$${currentNode}`, canvas);
                        const line = path1 ?? path2
                        // console.log(line, startNodeId, 'line && startNodeId');
                        localStorage.setItem("connectedNodePoint", startNodeId)
                        if (line && startNodeId) {

                            ConnectSubpathToMainPath(line, startNodeId, newPosition, canvas, graph)
                        }
                        // console.log(objects,"subpath point")
                        return
                    } else {
                        let edges = Object.keys(graph.edges).filter(edge => !edge.includes('_') && !visitedNodes.includes(edge));
                        let nextNodeKeys = Object.keys(graph.edges[nextNode]).filter(edge => !edge.includes('_') && !visitedNodes.includes(edge));
                        // console.log(edges,visitedNodes,nextNodeKeys,'nextNodeKeys')
                        if (nextNodeKeys.length === 0) {
                            let nextNodeIndex = edges.indexOf(nextNode) + 1
                            traverseGraph(edges[nextNodeIndex]);
                            // console.log(edges[nextNodeIndex],"nextNodeKeys edges[nextNodeIndex]")
                            // console.log("nextNodeKeys if")
                        } else {
                            // console.log("nextNodeKeys else")
                            traverseGraph(nextNode);
                        }
                    }
                });
            };

            const checkIfPointIntersectsLine = (p1, p2, p) => {
                // Calculate if point p lies on the line segment between p1 and p2
                const dxc = p.x - p1.x;
                const dyc = p.y - p1.y;
                const dxl = p2.x - p1.x;
                const dyl = p2.y - p1.y;

                const cross = dxc * dyl - dyc * dxl;
                if (Math.abs(cross) > 50) return false; // not collinear

                const t = (dxc * dxl + dyc * dyl) / (dxl * dxl + dyl * dyl);
                return t >= 0 && t <= 1; // check if point is on the segment
            };

            traverseGraph(Object.keys(graph.edges)[0]);

        } else {
            // console.log("condition three")
            const newPosition = mouse;
            const startNodeId = node.id;
            graph.positions[startNodeId] = newPosition;

            const endNodeId = getOppositeNodeId(startNodeId, graph);
            // console.log(endNodeId,node.id,"endNodeId")

            let currentNodeId = startNodeId;
            let chain = [currentNodeId];
            if (Array.isArray(endNodeId)) {
                endNodeId?.map((endNodeId, i) => {
                    if (endNodeId) {
                        let pathArray = findAllPaths(graph.edges, startNodeId, endNodeId, [], startNodeId)
                        // console.log(pathArray, startNodeId, endNodeId, `pathbr ${i} startNodeId, endNodeId`)
                        // -----------------------------------
                        let newPositions = {};
                        let B = graph.positions[startNodeId];
                        let C = graph.positions[endNodeId];
                        pathArray.map((item) => {
                            for (let point in graph.positions) {
                                if (point !== startNodeId && point !== endNodeId && !point.includes("_") && pathArray.includes(point)) {
                                    // console.log(`startnodeId=${startNodeId}`,B, `point=${point}`, graph.positions[point])
                                    newPositions[point] = projectToLineBC(B, C, graph.positions[point], graph.positions);
                                } else {
                                    newPositions[point] = graph.positions[point];
                                }
                            }
                            // console.log(item,graph.positions[item],"item")
                        })
                        graph.positions = newPositions
                        // -----------------------------------
                    }
                })
            } else {
                while (currentNodeId !== endNodeId) {
                    const edges = graph.edges[currentNodeId];
                    const nextNodeId = Object.keys(edges).find(nodeId => !chain.includes(nodeId) && !nodeId.includes("_"));
                    if (nextNodeId) {
                        chain.push(nextNodeId);
                        currentNodeId = nextNodeId;
                    } else {
                        break;
                    }
                }

                const startPosition = graph.positions[startNodeId];
                const endPosition = graph.positions[endNodeId];

                const movementVector = {
                    x: newPosition?.x - startPosition?.x,
                    y: newPosition?.y - startPosition?.y
                };


                chain.forEach((nodeId) => {
                    if (nodeId === startNodeId) return;
                    if (nodeId === endNodeId) return;
                    if (nodeId.includes("_")) return;

                    const originalPosition = graph.positions[nodeId];

                    const distance = calculateDistance(startPosition, originalPosition);

                    const directionVector = {
                        x: endPosition?.x - startPosition?.x,
                        y: endPosition?.y - startPosition?.y
                    };

                    const magnitude = Math.sqrt(directionVector?.x ** 2 + directionVector?.y ** 2);
                    const normalizedDirection = {
                        x: directionVector?.x / magnitude,
                        y: directionVector?.y / magnitude
                    };

                    const newX = startPosition?.x + normalizedDirection?.x * distance;
                    const newY = startPosition?.y + normalizedDirection?.y * distance;

                    let poss = projectToLineBC(startPosition, endPosition, graph.positions[nodeId])
                    // console.log(nodeId,poss,{
                    //     x: graph.positions[nodeId].x,
                    //     y: newY + movementVector.y
                    // }, "node id")
                    graph.positions[nodeId] = poss;
                });

            }
            // moveWithAllNodes(newPosition,startNodeId,endNodeId,graph)
        }
    }

    graph.restorePositions(graph.positions);
    debouncedUpdateState(graph, setSelTraversibleDetails);
    renderTraversiblePaths("move");
    if (isActive) {
        canvas.current.setActiveObject(node);
    } else {
        canvas.current.discardActiveObject();
    }
};


// function moveWithAllNodes(newPosition,startNodeId,endNodeId,graph) {
//     let currentNodeId = startNodeId;
//             let chain = [currentNodeId];
//             if (Array.isArray(endNodeId)) {
//                 endNodeId?.map((endNodeId, i) => {
//                     if (endNodeId) {
//                         let pathArray = findAllPaths(graph.edges, startNodeId, endNodeId, [], startNodeId)
//                         // console.log(pathArray, startNodeId, endNodeId, `pathbr ${i} startNodeId, endNodeId`)
//                         // -----------------------------------
//                         let newPositions = {};
//                         let B = graph.positions[startNodeId];
//                         let C = graph.positions[endNodeId];
//                         pathArray.map((item) => {
//                             for (let point in graph.positions) {
//                                 if (point !== startNodeId && point !== endNodeId && !point.includes("_") && pathArray.includes(point)) {
//                                     // console.log(`startnodeId=${startNodeId}`,B, `point=${point}`, graph.positions[point])
//                                     newPositions[point] = projectToLineBC(B, C, graph.positions[point], graph.positions);
//                                 } else {
//                                     newPositions[point] = graph.positions[point];
//                                 }
//                             }
//                             // console.log(item,graph.positions[item],"item")
//                         })
//                         graph.positions = newPositions
//                         // -----------------------------------
//                     }
//                 })
//             } else {
//                 while (currentNodeId !== endNodeId) {
//                     const edges = graph.edges[currentNodeId];
//                     const nextNodeId = Object.keys(edges).find(nodeId => !chain.includes(nodeId) && !nodeId.includes("_"));
//                     if (nextNodeId) {
//                         chain.push(nextNodeId);
//                         currentNodeId = nextNodeId;
//                     } else {
//                         break;
//                     }
//                 }

//                 const startPosition = graph.positions[startNodeId];
//                 const endPosition = graph.positions[endNodeId];

//                 const movementVector = {
//                     x: newPosition?.x - startPosition?.x,
//                     y: newPosition?.y - startPosition?.y
//                 };


//                 chain.forEach((nodeId) => {
//                     if (nodeId === startNodeId) return;
//                     if (nodeId === endNodeId) return;
//                     if (nodeId.includes("_")) return;

//                     const originalPosition = graph.positions[nodeId];

//                     const distance = calculateDistance(startPosition, originalPosition);

//                     const directionVector = {
//                         x: endPosition?.x - startPosition?.x,
//                         y: endPosition?.y - startPosition?.y
//                     };

//                     const magnitude = Math.sqrt(directionVector?.x ** 2 + directionVector?.y ** 2);
//                     const normalizedDirection = {
//                         x: directionVector?.x / magnitude,
//                         y: directionVector?.y / magnitude
//                     };

//                     const newX = startPosition?.x + normalizedDirection?.x * distance;
//                     const newY = startPosition?.y + normalizedDirection?.y * distance;

//                     let poss = projectToLineBC(startPosition, endPosition, graph.positions[nodeId])
//                     // console.log(nodeId,poss,{
//                     //     x: graph.positions[nodeId].x,
//                     //     y: newY + movementVector.y
//                     // }, "node id")
//                     graph.positions[nodeId] = poss;
//                 });

//             }
// }




const debouncedUpdateState = debounce((graph, setSelTraversibleDetails) => {
    setSelTraversibleDetails((prev) => ({
        ...prev,
        points_data: graph.positions,
        post: true
    }));
}, 2000);



const filterObject = (inputObj) => {
    // Create a new object to store the filtered results
    let filteredObj = {};

    // Iterate through each key in the input object
    for (const [key, value] of Object.entries(inputObj)) {
        // If the key doesn't start with "location" and none of the nested keys start with "location"
        if (!key.includes('_') && !Object.keys(value).some(k => k.includes('_'))) {
            filteredObj[key] = value; // Add it to the filtered object
        }
    }

    return filteredObj;
};

function getOppositeNodeId(startNodeId, graph) {
    // console.log(startNodeId, graph,"startNodeId, graph loop")
    let array = graph.edges
    const filteredArray = filterObject(array)
    let currentNodeId = startNodeId;
    let visited = new Set();
    
    // console.log(filteredArray,graph.edges[currentNodeId],currentNodeId,"filteredArray,graph.edges[currentNodeId]")
    while (true) {
        visited.add(currentNodeId);
        const edges = graph.edges[currentNodeId];
        // console.log(Object.keys(edges), "sdfjdsfjsdbfsjdbfsdjfbsdjk")
        
        function findNextNodeItem(node,currentNodeId) {
            // console.log(node)
            let itemEdge = graph.edges[node]
            let itemEdgeKeys = Object.keys(itemEdge)
            let haskeyItems = itemEdgeKeys.filter((item) => !item.includes("_") && item !== currentNodeId)
            // console.log(itemEdgeKeys,haskeyItems,haskeyItems.length > 0,"itemEdgeKeys.some(item => !item.includes")
            return haskeyItems.length > 0
        } 

        const nextNodeId = Object.keys(edges).find(
            nodeId => !visited.has(nodeId) && !nodeId?.includes("_") && findNextNodeItem(nodeId,currentNodeId)
        );
// console.log(nextNodeId,edges,currentNodeId,"next node id")
        const nextnode = nextNodeId in filteredArray
        const connectedNodes = Object.keys(graph.edges[startNodeId])

        if (nextnode) {
            if (connectedNodes?.length === 1) {
                // console.log(connectedNodes,"connected nodes length")
                return nextNodeId;
            } else {
                let nodeEdge = { ...graph.edges[startNodeId] }
                let resultArray = []
                // console.log(nodeEdge,connectedNodes,startNodeId,"nodeEdge,connectedNodes,startNodeId")
                Object.keys(nodeEdge).map((item) => {
                    let lastnode = findLastNode(item, graph.edges, startNodeId)
                    resultArray.push(lastnode)
                })
                return resultArray;
            }
        } else if (!nextNodeId) {
            return currentNodeId;
        }

        currentNodeId = nextNodeId;
    }
}

// ------------------------------------------------------

function getLeftAndRightValues(arr, value) {
    const index = arr.indexOf(value);

    if (index === -1) {
        return `Value ${value} is not present in the array.`;
    }

    const leftValue = index > 0 ? arr[index - 1] : null;
    const rightValue = index < arr.length - 1 ? arr[index + 1] : null;

    return [leftValue, rightValue];
}

// function findAllPaths(edge, start, end, path = []) {
//     path = path.concat(start); // Add the current node to the path

//     if (start === end) {
//         return [path]; // If start is equal to end, return the path
//     }

//     if (!edge[start]) {
//         return []; // If the start node is not in the edge, return an empty array
//     }

//     let paths = [];
//     for (let neighbor in edge[start]) {
//         if (!path.includes(neighbor)) { 
//             let newPaths = findAllPaths(edge, neighbor, end, path);
//             for (let newPath of newPaths) {
//                 paths.push(newPath); 
//             }
//         }
//     }

//     return paths.flat();
// }

function findAllPaths(edge, start, end, path = [], startNodeId) {
    path = path.concat(start);

    if (start === end) {
        return [path];
    }
    // if (start === startNodeId && reccuring) {
    //     // D == C
    //     return [];
    // }

    if (!edge[start]) {
        return [];
    }

    if (!Object.keys(edge[start]).some(item => item.includes('_')) && start !== startNodeId) {
        return [];
    }


    let paths = [];
    for (let neighbor in edge[start]) {
        if (!path.includes(neighbor) && !neighbor.includes("_")) {
            let newPaths = findAllPaths(edge, neighbor, end, path, startNodeId, true);
            for (let newPath of newPaths) {
                paths.push(newPath);
            }
        }
    }

    return paths.flat();
}

function projectToLineBC(B, C, P) {
    // console.log(positions,"B,C,P")

    // Vector BC
    let BCx = C.x - B.x;
    let BCy = C.y - B.y;

    // Vector BP (from B to P)
    let BPx = P.x - B.x;
    let BPy = P.y - B.y;

    // Dot products
    let dotProductBP_BC = BPx * BCx + BPy * BCy;
    let dotProductBC_BC = BCx * BCx + BCy * BCy;

    // Scalar t for the projection
    let t = dotProductBP_BC / dotProductBC_BC;

    // Clamp t between 0 and 1 to ensure the point is between B and C
    t = Math.max(0, Math.min(1, t));

    // New projected point
    let newX = B.x + t * BCx;
    let newY = B.y + t * BCy;

    // Ensure P does not coincide with B by enforcing a small offset
    const minDistance = 0.1; // Minimum distance between P and B

    // Calculate the distance between the new point and B
    let distanceToB = Math.sqrt((newX - B.x) ** 2 + (newY - B.y) ** 2);

    // If the distance is too small, move the point slightly towards C
    if (distanceToB < minDistance) {
        // Calculate the direction vector (normalize BC)
        let magnitudeBC = Math.sqrt(BCx * BCx + BCy * BCy);
        let unitBCx = BCx / magnitudeBC; // Unit vector in BC direction (x-component)
        let unitBCy = BCy / magnitudeBC; // Unit vector in BC direction (y-component)

        // Adjust newX and newY to maintain minimum distance from B
        newX = B.x + minDistance * unitBCx;
        newY = B.y + minDistance * unitBCy;
    }

    // Check the distance to C
    let distanceToC = Math.sqrt((newX - C.x) ** 2 + (newY - C.y) ** 2);

    // If too close to C, adjust P away from C towards B
    if (distanceToC < minDistance) {
        let magnitudeCB = Math.sqrt(BCx * BCx + BCy * BCy); // magnitude is the same as BC
        let unitCBx = -BCx / magnitudeCB; // Unit vector from C to B (x-component)
        let unitCBy = -BCy / magnitudeCB; // Unit vector from C to B (y-component)

        // Adjust newX and newY to maintain minimum distance from C
        newX = C.x + minDistance * unitCBx;
        newY = C.y + minDistance * unitCBy;
    }

    return { x: newX, y: newY };
}

function findLastNode(start, edge, centerPoint) {
    // console.log(start, edge, centerPoint, "start,edge,centerPoint")
    let checked = [centerPoint, start];
    let current = start;
    // console.log(Object.keys(edge[current]),`Object.keys(edge[${current}])`)
    if (!Object.keys(edge[current]).some(item => item.includes('_'))) {
        return current;
    }
    while (true) {
        // Get neighbors that don't include "_"
        let neighbors = Object.keys(edge[current]).filter(key => !key.includes("_"));

        // Check if there is a neighbor that doesn't have any sub-neighbors with "_"
        let nextNode = neighbors.find(key => {
            if (key === centerPoint) return false;
            let subNeighbors = Object.keys(edge[key] || {});
            return subNeighbors.every(subKey => !subKey.includes("_"));
        });
        // console.log(neighbors, nextNode,"neighbour nextNode")
        if (nextNode) {
            // If a node with no sub-neighbors containing "_" is found, return it
            return nextNode;
        }

        // Find the first unvisited neighbor
        nextNode = neighbors.find(key => !checked.includes(key));

        if (!nextNode) {
            // If there are no unvisited neighbors, return the current node
            return current;
        }

        // Update the current node and add it to the checked array
        checked.push(nextNode);
        current = nextNode;
    }
}



// ------------------------------------------------------


// to find all the main path nodes connected to the point
const filterObjectKeys = (objectToCheck, filterItems) => {
    const filterKeys = new Set(Object.keys(filterItems)); // Create a set of filterItem keys

    // Iterate over the keys in objectToCheck
    for (let key in objectToCheck) {
        if (!filterKeys.has(key)) {
            delete objectToCheck[key]; // Remove the key if it's not in filterItems
        }
    }

    return objectToCheck;
}

function getNonMatchingItems(objectToCheck, selectedObjectKey, filterItems) {
    // console.log(objectToCheck, selectedObjectKey, filterItems, "objectToCheck, selectedObjectKey, filterItems")
    const selectedObject = filterItems[selectedObjectKey]; // Get the selected object in filterItems
    const result = {}; // To store non-matching items

    objectToCheck.forEach(key => {
        if (!selectedObject.hasOwnProperty(key)) {
            if (filterItems.hasOwnProperty(key)) {
                result[key] = filterItems[key]; // Add non-matching key to result
            }
        }
    });
    // Object.keys(result)

    return Object.keys(result);
}

const getPrevAndNextKeys = (array, key) => {
    const keys = Object.keys(array);
    const index = keys.indexOf(key);

    const prevKey = index > 0 ? keys[index - 1] : null;
    const nextKey = index < keys.length - 1 ? keys[index + 1] : null;

    return [prevKey, nextKey];
};

const getItemPosition = (item, key) => {
    const keys = Object.keys(item);
    const index = keys.indexOf(key);

    // Return the position (index) if the key is found, otherwise return -1
    return index !== -1 ? index : null;
    // if (item.hasOwnProperty(key)) {
    //     return item[key];
    // } else {
    //     return `Key '${key}' not found in the item.`;
    // }
}

const getFirstAndThirdValues = (item, index) => {
    const keys = Object.keys(item);
    index = 2
    // first value  = 2 - 2 = 0 item[0]
    // second value  = 2 -2 = 1 item [2]

    // console.log(index)
    if (keys.length >= 3) {
        const firstKey = keys[0];
        const thirdKey = keys[2];
        return { firstKey, thirdKey };
    } else {
        return "The object doesn't have enough keys.";
    }
}

// ------------------------





const moveAndInterconnect = (node, newPoint, connectedEdges, findPin, graph, canvas, index = 1) => {

    // console.log(node, newPoint, connectedEdges, findPin,"node, newPoint, connectedEdges, findPin")
    const connectedNodes = Object.keys(connectedEdges)
    let foundKey = Object.keys(graph.positions).find(k => 
        graph.positions[k].x === newPoint.x && graph.positions[k].y === newPoint.y
    );
    // console.log(connectedNodes, foundKey, connectedEdges, "djbfgsdjkbfgsdjkgsdjbfg")
    
    if (foundKey) {
        let items = Object.keys(graph.edges[foundKey])
        let filterItems = items.filter((name) => !name.includes("_") && name != node?.id)
        if (filterItems.length < 1) { 
            return
        }
    }

    // console.log(connectedNodes, newPoint,foundKey, 'connectedEdges')
    graph.addNode(node.id);
    graph.addPosition(node.id, newPoint.x, newPoint.y);
   
    addConnectionBtwnEdges(connectedNodes[0], connectedNodes[1], graph, canvas);  

    if (findPin) {
        const [name, id] = findPin.split('_');
        const pin = findObjectByEnc_id(id, name, canvas)
        const nextNodeLines = findConnectedLines(connectedNodes[index], graph, canvas)
        // console.log(nextNodeLines,"nextNodeLines");

        const filterLines = nextNodeLines
            ?.filter((item) => !item?.id.includes('_'))
        // console.log(nextNodeLines,filterLines, 'connectedNodes[index]')
        let edgeConnected = graph.edges[connectedNodes[index]]
        const checkNodeLength = Object.keys(edgeConnected).filter((item) => item !== node.id)
        const closestLine = findClosestLine(newPoint.x, newPoint.y, filterLines);
        if (closestLine) {
            const closestLineId = closestLine?.id
            // console.log(closestLineId, "closest line")
            const [node1, node2] = closestLineId?.split("$")?.slice(1);

            if (checkNodeLength?.length !== 1 && node?.id !== node1 && node?.id !== node2) {
                createNodeBtwPolyline(node.id, newPoint, closestLine, pin, graph, canvas)
            }
        } else {
            // console.log('no closestLine')
        }

    }
}

function findConnectedLines(node, graph, canvas) {
    // console.log(node, "node")
    let edges = graph.getEdges();
    let pathSet = new Set();
    // nodes.forEach((node) => {
    let id = node;
    // if (edges[id]) {
    Object.keys(edges[id]).forEach((key) => {
        let path1 = findObjectById(`path$${key}$${id}`, canvas);
        let path2 = findObjectById(`path$${id}$${key}`, canvas);
        if (path1) {
            pathSet.add(path1);
        }
        // if (path2) {
        //     pathSet.add(path2);
        // }
    });
    // }
    // });
    // console.log(Array.from(pathSet), "Array.from(pathSet)")
    return Array.from(pathSet);
}

const ConnectSubpathToMainPath = (line, selectedNode, mouse, canvas, graph) => {

    // onCreateNode(mouse, selectedNode?.id);
    // removeFabricObjectsByName(canvas,'line_starter_poly')
    // addConnectionBtwnEdges(key1, key2, graph, canvas);
    // console.log(line, "linesadfasdsa")
    const [node1, node2] = line?.id?.split("$")?.slice(1);
    // let node1position = posits[node1];
    // let node2position = posits[node2];

    graph.addNode(node1);
    graph.addEdge(selectedNode, node1);
    graph.addEdge(node2, selectedNode);
    removeLine(line?.id, graph, canvas, "nodeBTWline");

    // // console.log(graph,"graph");
    // console.log("view floorplan  ndoes")
    // drawLine(
    //     { x: mouse.x, y: mouse.y },
    //     node1position,
    //     "path",
    //     `path$${node1}$${nodeName}`,
    //     canvas
    // );
    // drawLine(
    //     { x: mouse.x, y: mouse.y },
    //     node2position,
    //     "path",
    //     `path$${node}$${nodeName}`,
    //     canvas
    // );
    // stopPathDrawing(); 


    let connectedPoint = findObjectById(selectedNode, canvas)
    let objects = [connectedPoint]

    const nodes = objects.filter(obj => obj?.name === 'node');
    if (nodes?.length > 0) {
        let edges = graph.getEdges();
        let pathArray = [];
        nodes.forEach((node) => {
            let id = node.id;
            if (edges[id]) {
                Object.keys(edges[id]).forEach((key) => {
                    let path1 = findObjectById(`path$${key}$${id}`, canvas);
                    let path2 = findObjectById(`path$${id}$${key}`, canvas);
                    if (path1) {
                        pathArray.push(path1);
                    }
                    if (path2) {
                        pathArray.push(path2);
                    }
                });
            }
        });
        const newColor = "#e78fbc";
        highLightSelectedPaths(canvas, pathArray, newColor, graph);
    } else {
        const newColor = "#f595c4";
        highLightSelectedPaths(canvas, objects, newColor, graph);
    }
};

const createNodeBtwPolyline = (nodeName, mouse, lineData, pin, graph, canvas) => {
    // console.log(graph?.connectedMainPathNodes, "graph.connectedMainPathNodes,nodeName")
    let isLineConnectedInLine = graph?.connectedMainPathNodes?.includes(nodeName);
    let isLineIsSubPath = graph?.subNode?.includes(nodeName);
    const [node1, node2] = lineData?.id.split("$").slice(1);

    // console.log(lineData?.id,"line data");
    const isnode1IsSubpath = graph?.subNode?.includes(node1);
    const isnode1ConnectedInLine = graph?.connectedMainPathNodes?.includes(node1);
    const isnode2IsSubpath = graph?.subNode?.includes(node2);
    const isnode2ConnectedInLine = graph?.connectedMainPathNodes?.includes(node2);
   
    const isSubnode = graph.subNode.includes(nodeName)
    removeNode(nodeName, true, graph, canvas); 
    if (isSubnode) {
        graph.addSubnode(nodeName);
    }
    // console.log(isSubnode,nodeName,lineData.id, 'graph')
    
    const positions = graph.positions;
    
    if (lineData) {
        const [node1, node2] = lineData?.id.split("$").slice(1);
        let node1position = positions[node1];
        let node2position = positions[node2];
        const color = graph.subNode.includes(nodeName) ? "rgba(0,255,0,0.5)" : "rgba(0,0,255,0.5)"
        let node = addNodePoint(mouse, nodeName, color);
        let zoom = canvas?.current?.getZoom()
        // if (zoom) {
        //     node.set({ scaleX: 1/zoom,scaleY: 1/zoom });
        //   }
        canvas.current.add(node);
        graph.addNode(nodeName);
        
        if ((isnode1IsSubpath && !isnode1ConnectedInLine) && (isnode2IsSubpath && !isnode2ConnectedInLine)) {
            // console.log((isnode1IsSubpath && !isnode1ConnectedInLine) && (isnode2IsSubpath && !isnode2ConnectedInLine),"(isnode1IsSubpath && !isnode1ConnectedInLine) && (isnode2IsSubpath && !isnode2ConnectedInLine)")
        } else if ((isnode1ConnectedInLine || !isnode2ConnectedInLine) || (!isnode1ConnectedInLine || isnode2ConnectedInLine)) {
            graph.addConnectedMainPathNodes(nodeName);
            // console.log((isnode1ConnectedInLine || !isnode2ConnectedInLine) || (!isnode1ConnectedInLine || isnode2ConnectedInLine),"(isnode1ConnectedInLine || !isnode2ConnectedInLine) || (!isnode1ConnectedInLine || isnode2ConnectedInLine)")
        } else if (!isnode1IsSubpath && !isnode2IsSubpath) { 
            graph.addConnectedMainPathNodes(nodeName);
        }
        else {
            // console.log("else")
        }

        if (isLineIsSubPath) {
            graph.addSubnode(nodeName);
        }
        graph.addPosition(nodeName, mouse.x, mouse.y);
        let center = pin?.getCenterPoint();
        const pinNodeName = `${pin?.name}_${pin?.enc_id}`
        graph.addNode(pinNodeName);
        graph.addPosition(pinNodeName, center.x, center.y);

        graph.addNode(node1);
        if (isnode1IsSubpath) {
            graph.addSubnode(node1);
        }
        if (isnode1ConnectedInLine) {
            graph.addConnectedMainPathNodes(node1)
        }
        graph.addEdge(nodeName, node1);
        graph.addEdge(node2, nodeName);
        if (isnode2IsSubpath) {
            graph.addSubnode(node2);
        }
        if (isnode2ConnectedInLine) {
            graph.addConnectedMainPathNodes(node2)
        }
        addConnectionBtwnEdges(pinNodeName, nodeName, graph, canvas);


        // addConnectionBtwnEdges(nodeName, node2, graph, canvas);
        // console.log(lineData.id,"lineData.id")
        removeLine(lineData.id, graph, canvas, "nodeBTWline");
        // const lineColor = graph.subNode.includes(node1) && graph.subNode.includes(nodeName) ? "green" : 'black'
        // const lineColor = checkSubnodePathOrNot(node1, nodeName, graph,`path$${node1}$${nodeName}`) ? "green" : 'black'
        const lineColor1 = checkSubnodePathOrNot(node1, nodeName, graph,`path$${node1}$${nodeName}`)
        const lineColor2 = checkSubnodePathOrNot(node1, nodeName, graph,`path$${nodeName}$${node1}`)
        drawLine(
            node1position,
            { x: mouse.x, y: mouse.y },
            "path",
            `path$${node1}$${nodeName}`,
            canvas,
            lineColor1
        );
        drawLine(
            { x: mouse.x, y: mouse.y },
            node2position,
            "path",
            `path$${nodeName}$${node1}`,
            canvas,
            lineColor2
        );

    }
};

// remove key starts with location from object 
const removeLocationKeys = (obj) => {
    let filteredObj = {};
    for (const [key, value] of Object.entries(obj)) {
        if (!key?.includes("_")) {
            filteredObj[key] = value;
        }
    }

    return filteredObj;
};

// to move the point through two lines on dragging the mouse
const filterKeysWithUnderscore = (obj) => {
    const result = {};
    for (const key in obj) {
        if (key.includes('_')) {
            result[key] = obj[key];
        }
    }
    return result;
};

// Function to compare two points
const pointsAreEqual = (point1, point2) => {
    return point1?.x === point2?.x && point1?.y === point2?.y;
};

// Main interpolate function
const interpolate = (start, end, position, graph) => {
    const filteredData = filterKeysWithUnderscore(graph);
    // console.log('Filtered Data:', filteredData);
    // console.log('Start:', start, 'End:', end, 'Position:', position);

    let startInFilteredData = false;
    let endInFilteredData = false;

    // Check if start point is in filteredData
    for (const key in filteredData) {
        if (pointsAreEqual(filteredData[key], start)) {
            startInFilteredData = true;
            break;
        }
    }

    // Check if end point is in filteredData
    for (const key in filteredData) {
        if (pointsAreEqual(filteredData[key], end)) {
            endInFilteredData = true;
            break;
        }
    }

    // If one of the points is in the filtered data, return the other point
    if (startInFilteredData) {
        // console.log('Start is in filtered data, returning End:', end);
        return end;
    } else if (endInFilteredData) {
        // console.log('End is in filtered data, returning Start:', start);
        return start;
    }

    // Proceed with interpolation if neither point is in the filtered data
    const dx = end?.x - start?.x;
    const dy = end?.y - start?.y;
    const denominator = Math.pow(dx, 2) + Math.pow(dy, 2);

    // Check if start and end are the same point
    if (denominator === 0) {
        // console.log('Start and end points are identical, returning start point.');
        return {
            x: start?.x,
            y: start?.y,
        };
    }

    const t = Math.min(
        Math.max(
            ((position?.x - start?.x) * dx + (position?.y - start?.y) * dy) / denominator,
            0
        ),
        1
    );

    const result = {
        x: start?.x + t * dx,
        y: start?.y + t * dy,
    };

    // console.log('Calculated t:', t, 'Result point:', result);

    return result;
};

// to get the matching object from graph position to get the graph edges
const findMatchingObject = (data, targetValue, keyname) => {
    for (const key in data) {
        if (data.hasOwnProperty(key)) {
            const value = data[key];
            if (value.x === targetValue.x && value.y === targetValue.y && key !== keyname) {
                return { [key]: value };
            }
        }
    }
    return null;
};

// filter graph.positions to get a graph.edge point
const getFilteredData = (data, keyname) => {
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


const getDistanceFromPointToLine = (px, py, x1, y1, x2, y2) => {
    const A = px - x1;
    const B = py - y1;
    const C = x2 - x1;
    const D = y2 - y1;

    const dot = A * C + B * D;
    const len_sq = C * C + D * D;
    const param = len_sq !== 0 ? dot / len_sq : -1;

    let xx, yy;

    if (param < 0) {
        xx = x1;
        yy = y1;
    } else if (param > 1) {
        xx = x2;
        yy = y2;
    } else {
        xx = x1 + param * C;
        yy = y1 + param * D;
    }

    const dx = px - xx;
    const dy = py - yy;
    return Math.sqrt(dx * dx + dy * dy);
};

// Find the line closest to the mouse point
const findClosestLine = (mouseX, mouseY, linesArray) => {
    // console.log(mouseX, mouseY, linesArray, "nodmouseX, mouseY, linesArraye")
    let closestLine = null;
    let minDistance = Infinity;

    linesArray.forEach((line) => {
        const distance = getDistanceFromPointToLine(mouseX, mouseY, line.x1, line.y1, line.x2, line.y2);
        if (distance < minDistance) {
            minDistance = distance;
            closestLine = line;
        }
    });

    return closestLine;
};


const dragPathAndItsNodes = (line, mouse, graph, canvas, setSelTraversibleDetails, renderTraversiblePaths) => {
    removeFabricObjectsBId(canvas, "short_path");
    localStorage.removeItem("shortestPath")

    // Extract node names from line id
    const lineIdParts = line.id.split("$");
    const node1Name = lineIdParts[1];
    const node2Name = lineIdParts[2];

    // Calculate the midpoint of the line
    const midpoint = {
        x: (line.x1 + line.x2) / 2,
        y: (line.y1 + line.y2) / 2
    };

    // Calculate the delta movement
    const deltaX = mouse.x - midpoint.x;
    const deltaY = mouse.y - midpoint.y;

    // Determine which node(s) to move
    let stationaryNodeName, movingNodeName;

    if (node1Name.includes("_") && node2Name.includes("_")) {
        // If both nodes have underscores, move both
        stationaryNodeName = null;
        movingNodeName = null;
    } else if (node1Name.includes("_")) {
        stationaryNodeName = node1Name;
        movingNodeName = node2Name;
    } else if (node2Name.includes("_")) {
        stationaryNodeName = node2Name;
        movingNodeName = node1Name;
    } else {
        // If neither node has underscores, move both
        stationaryNodeName = null;
        movingNodeName = null;
    }

    // Move the nodes based on the determined conditions
    if (movingNodeName) {
        // Only one node is moving
        const newMovingNodePosition = {
            x: graph.positions[movingNodeName].x + deltaX,
            y: graph.positions[movingNodeName].y + deltaY,
        };
        graph.positions[movingNodeName] = newMovingNodePosition;

        // Update distances for the connected edges of the moving node
        const connectedEdgesMovingNode = graph.edges[movingNodeName];
        if (connectedEdgesMovingNode) {
            Object.keys(connectedEdgesMovingNode).forEach((connectedNodeId) => {
                const distance = calculateDistance(newMovingNodePosition, graph.positions[connectedNodeId]);
                graph.edges[movingNodeName][connectedNodeId] = distance;
                graph.edges[connectedNodeId][movingNodeName] = distance;
            });
        }
    } else {
        // Both nodes are moving
        const newNode1Position = {
            x: graph.positions[node1Name].x + deltaX,
            y: graph.positions[node1Name].y + deltaY,
        };
        const newNode2Position = {
            x: graph.positions[node2Name].x + deltaX,
            y: graph.positions[node2Name].y + deltaY,
        };

        graph.positions[node1Name] = newNode1Position;
        graph.positions[node2Name] = newNode2Position;

        // Update distances for the connected edges of both nodes
        const connectedEdgesNode1 = graph.edges[node1Name];
        if (connectedEdgesNode1) {
            Object.keys(connectedEdgesNode1).forEach((connectedNodeId) => {
                const distance = calculateDistance(newNode1Position, graph.positions[connectedNodeId]);
                graph.edges[node1Name][connectedNodeId] = distance;
                graph.edges[connectedNodeId][node1Name] = distance;
            });
        }

        const connectedEdgesNode2 = graph.edges[node2Name];
        if (connectedEdgesNode2) {
            Object.keys(connectedEdgesNode2).forEach((connectedNodeId) => {
                const distance = calculateDistance(newNode2Position, graph.positions[connectedNodeId]);
                graph.edges[node2Name][connectedNodeId] = distance;
                graph.edges[connectedNodeId][node2Name] = distance;
            });
        }
    }

    // Restore the graph data and update the UI
    graph.restoreEdges(graph.edges);
    graph.restorePositions(graph.positions);
    setSelTraversibleDetails((prev) => ({
        ...prev,
        edges_data: graph.edges,
        points_data: graph.positions,
        post: true
    }));
    renderTraversiblePaths("move");
    canvas.current.setActiveObject(line);
};

function onNodePositionChange(selectedNode, graph) {
    const selectedPosition = graph.positions[selectedNode?.id];

    // Function to calculate if three points are in a straight line
    function isStraightLine(node1, node2, node3) {
        const pos1 = graph.positions[node1];
        const pos2 = graph.positions[node2];
        const pos3 = graph.positions[node3];

        // Check if the slope between node1 and node2 is the same as between node2 and node3
        return (pos2.y - pos1.y) * (pos3.x - pos2.x) === (pos3.y - pos2.y) * (pos2.x - pos1.x);
    }

    // Find the last node in the straight line
    let endNode = null;
    for (const nodeId in graph.positions) {
        if (nodeId !== selectedNode.id && !nodeId.includes('_')) {
            let allNodesInLine = [selectedNode.id];
            let currentNode = selectedNode.id;

            // Keep checking for nodes in the straight line
            while (true) {
                let nextNode = null;
                for (const connectedNodeId in graph.edges[currentNode]) {
                    if (connectedNodeId !== selectedNode.id && isStraightLine(selectedNode.id, currentNode, connectedNodeId)) {
                        nextNode = connectedNodeId;
                        break;
                    }
                }
                if (!nextNode) break;
                allNodesInLine.push(nextNode);
                currentNode = nextNode;
            }

            if (allNodesInLine.length > 1 && (!endNode || allNodesInLine.length > endNode.length)) {
                endNode = allNodesInLine;
            }
        }
    }

    if (!endNode) return;

    // Reposition the nodes between selectedNode and the endNode
    const selectedPos = graph.positions[selectedNode.id];
    const endPos = graph.positions[endNode[endNode.length - 1]];

    const deltaX = (endPos.x - selectedPos.x) / (endNode.length - 1);
    const deltaY = (endPos.y - selectedPos.y) / (endNode.length - 1);

    for (let i = 1; i < endNode.length - 1; i++) {
        const nodeId = endNode[i];
        if (!nodeId.includes('_')) {  // Ignore nodes with '_' in their name
            graph.positions[nodeId] = {
                x: selectedPos.x + deltaX * i,
                y: selectedPos.y + deltaY * i,
            };
        }
    }

    // Optionally, update the positions for connected edges here if needed
    Object.keys(graph.edges).forEach((nodeId) => {
        Object.keys(graph.edges[nodeId]).forEach((connectedNodeId) => {
            const distance = calculateDistance(
                graph.positions[nodeId],
                graph.positions[connectedNodeId]
            );
            graph.edges[nodeId][connectedNodeId] = distance;
            graph.edges[connectedNodeId][nodeId] = distance;
        });
    });
}

function getIntersectingPolyline(canvas, newPosition) {
    const { x, y } = newPosition;
    const point = new fabric.Point(x, y);

    let intersectingLine = null;

    // Iterate through all objects on the canvas
    canvas.current.forEachObject((object) => {
        if (object.name === 'path') {
            const p1 = new fabric.Point(object.left + object.x1, object.top + object.y1);
            const p2 = new fabric.Point(object.left + object.x2, object.top + object.y2);

            if (isPointOnLineSegment(p1, p2, point)) {
                intersectingLine = object; // Store the line object
                return false; // Stop iteration
            }
        }
    });

    return intersectingLine;
}

// Utility function to check if a point is on a line segment
function isPointOnLineSegment(p1, p2, point) {
    const crossProduct = (point.y - p1.y) * (p2.x - p1.x) - (point.x - p1.x) * (p2.y - p1.y);

    // Check if point is on the infinite line defined by p1 and p2
    if (Math.abs(crossProduct) > Number.EPSILON) {
        return false;
    }

    // Check if point is within the segment bounds
    const dotProduct = (point.x - p1.x) * (p2.x - p1.x) + (point.y - p1.y) * (p2.y - p1.y);
    if (dotProduct < 0) {
        return false;
    }

    const squaredLength = (p2.x - p1.x) * (p2.x - p1.x) + (p2.y - p1.y) * (p2.y - p1.y);
    if (dotProduct > squaredLength) {
        return false;
    }

    return true;
}

export {
    // dragNodeAndItsPath,
    dragNodeOnMainPath,
    dragPathAndItsNodes
};