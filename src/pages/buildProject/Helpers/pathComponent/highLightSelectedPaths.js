import { checkSubnodePathOrNot } from "../addConnectionBtwnEdges";
import { findObjectById } from "../bringFabricObjects";

const highLightSelectedPaths = (canvas, objs, color, graph) => {
    canvas.current.getObjects().forEach((a) => {
        if (a.name === 'path' && objs.includes(a)) {
            a.set('stroke', color);
        } else if (a.name === 'path') {
            // console.log(a.id, 'highLightSelectedPaths')
            const key1 = a?.id.split("$")[1];
            const key2 = a?.id.split("$")[2];
            const color = checkSubnodePathOrNot(key1, key2, graph, a?.id)
                // ? "green" : 'black'
            a.set('stroke', color);
            // if (graph.subNode.includes(key1) && graph.subNode.includes(key2)) {
            //     a.set('stroke', 'green');
            // } else {
            //     a.set('stroke', 'black');
            // }

        }
    });
    canvas.current.renderAll();
}

const nodeLinesSelected = (obj, graph, canvas) => {
    const newColor = '#e78fbc';
    console.log(obj, 'select-node')
    let edges = graph.getEdges();
    let id = obj?.id
    if (edges[id]) {
        console.log(edges[id], 'edges[id]')
        Object.keys(edges[id]).forEach((key) => {
            const line1 = findObjectById(`path$${key}$${id}`, canvas)
            const line2 = findObjectById(`path$${id}$${key}`, canvas)
            const connectedLine = []
            connectedLine.push(line1)
            connectedLine.push(line2)
            // console.log(connectedLine, 'connectedLine')
            highLightSelectedPaths(canvas, connectedLine, newColor, graph)
        });
    }
}
export { highLightSelectedPaths, nodeLinesSelected };