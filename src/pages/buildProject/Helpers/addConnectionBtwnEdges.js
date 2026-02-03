import drawLine from "./drawLine";

export function checkSubnodePathOrNot(key1, key2, graph, name) {
    
    return getLineColor(key1, key2,graph)

    if (graph.subPathline.includes(name)) {
        return "green"
    } else if(graph.connectionPathline.includes(name)){
        return "rgb(251,179,80)"
    } else if(graph.connectedMainPathNodes.includes(name)){
        return "black"
    }

    let keyArray = [key1, key2]
    let isSubpath = keyArray.every(element => graph.subNode.includes(element))
        && keyArray.some(element => !graph.connectedMainPathNodes.includes(element))
    // if (istrue) {
        let ismainpathConnectednode = keyArray.every(element => graph.connectedMainPathNodes.includes(element))
        // if (!istrue) {
            let ispin = [key1,key2].find((item) => item.includes("_"))
           let isOnispinandotherissubpoath = ispin ? keyArray.some(element => graph.subNode.includes(element) && element != ispin) : false
        // }
    // }
    // console.log(key1, key2, isSubpath, ismainpathConnectednode, isOnispinandotherissubpoath, ispin, "key1,key2,isSubpath,ismainpathConnectednode,isOnispinandotherissubpoath,ispin")
    if (isOnispinandotherissubpoath) {
        // console.log(key1, key2, isOnispinandotherissubpoath,"isOnispinandotherissubpoath")
        return "green"
    }
    else if (ismainpathConnectednode) {
        // console.log(key1, key2,  ismainpathConnectednode, "ismainpathConnectednode")
        return "black"
    }
    else if (isSubpath) {
        // console.log(key1, key2, isSubpath, "key1,key2,isSubpath")
        return "green"
    }
    return "black"
}

function getLineColor(pointA, pointB, graph) {
    
    // if ((graph.subNode.includes(pointA) && pointA.includes("_") && graph.autoConnectNode.includes(pointB)) || (graph.subNode.includes(pointB) && pointB.includes("_") && graph.autoConnectNode.includes(pointA))) {
    if ((graph.subNode.includes(pointA) && pointA.includes("_") && graph.autoConnectNode.includes(pointB)) || (graph.subNode.includes(pointB) && pointB.includes("_") && graph.autoConnectNode.includes(pointA))) {
        return "rgb(255, 172, 28,0.5)"
    }
    if ((graph.subNode.includes(pointA) && pointA.includes("_") && graph.subNode.includes(pointB)) || (graph.subNode.includes(pointB) && pointB.includes("_") && graph.subNode.includes(pointA))) {
        return "green"
    }
        
    if ((graph.subNode.includes(pointA) && !graph.connectedMainPathNodes.includes(pointA) && graph.connectedMainPathNodes.includes(pointB)) || (graph.subNode.includes(pointB) && !graph.connectedMainPathNodes.includes(pointB) && graph.connectedMainPathNodes.includes(pointA))) {
        return "green";
    }

    if (!graph.subNode.includes(pointA) && !graph.subNode.includes(pointB)) {
        return "black";
    }
    if (
        (!graph.subNode.includes(pointA) && graph.connectedMainPathNodes.includes(pointB)) ||
        (graph.connectedMainPathNodes.includes(pointA) && !graph.subNode.includes(pointB))
    ) {
        return "black";
    }
    if (
        (graph.subNode.includes(pointA) && graph.connectedMainPathNodes.includes(pointB)) ||
        (graph.connectedMainPathNodes.includes(pointA) && graph.subNode.includes(pointB))
    ) {
        return "black";
    }
    if (graph.subNode.includes(pointA) && graph.subNode.includes(pointB)) {
        return "green";
    }
    // return "unknown"; // Default case if none of the conditions match
    return "black";
}

const addConnectionBtwnEdges = (key1, key2, graph, canvas,type) => {
    // console.log(key1, key2,type,"key1, key2")
    const selKey = key1;
    const key = key2;
    const posits = graph?.getPositions();
    let position1 = posits[selKey];
    let position2 = posits[key];
    graph?.addEdge(selKey, key);

    // const color = graph.subNode.includes(selKey) && graph.subNode.includes(key) ? "green" : 'black'
    const color = checkSubnodePathOrNot(key1, key2, graph, `path$${selKey}$${key}`)
        // ? "green" : 'black'
    // console.log(checkSubnodePathOrNot(key1,key2,graph),"checkSubnodePathOrNot(key1,key2,graph)")
    drawLine(position1, position2, "path", `path$${selKey}$${key}`, canvas, color);


};
export default addConnectionBtwnEdges;