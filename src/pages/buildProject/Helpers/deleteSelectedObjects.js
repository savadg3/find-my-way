import addConnectionBtwnEdges from "./addConnectionBtwnEdges";
import { removeFabricObjectsBId } from "./bringFabricObjects";
import drawLine from "./drawLine";
import { removeLine, removeNode } from "./removeLine&Node";


const deleteObjects = (
    canvas, graph, setSelTraversibleDetails,
    setToolTraversible, setSelectedPaths,
    checkPinConnectOrNot, isNode = false,
    deleteSubPath
) => {
    let objs = canvas.current.getActiveObjects();
    // console.log(objs, "connectedNodes")

    objs.forEach((a) => {
        if (a.name == "path") {
            const key1 = a?.id?.split("$")[1];
            const key2 = a?.id?.split("$")[2];
            if (a?.id) {
                graph.removeAutoConnectNode(key1)
                graph.removeAutoConnectNode(key2)
            }
            removeLine(a.id, graph, canvas);

          
            deleteSubPathCondition(objs, deleteSubPath)
        } else if (a.name == "node") {
            if (Object.keys(graph?.edges).length > 0 && Object.keys(graph?.edges).some(key => key.includes(a?.id))) {
                console.log(graph?.edges[a?.id], a?.id, 'connectedNodes')
                let connectedNodes = graph?.edges[a?.id] ? Object.keys(graph?.edges[a?.id]) : []
                console.log(connectedNodes, 'connectedNodes')
                const containsUnderscore = connectedNodes?.some(item => item.includes('_'));
                if (containsUnderscore) {
                    deleteSubPath(a)
                    // console.log(connectedNodes, 'connectedNodes')
                    // const othernodes = connectedNodes?.filter((item) => !item.includes('_'))
                    // const pinNode = connectedNodes?.filter((item) => item.includes('_'))
                    // let positions = graph.getPositions();
                    // let edges = graph.getEdges();
                    removeNode(a.id, true, graph, canvas);
                    graph.removeAutoConnectNode(a.id)

                    // const node1 = othernodes[0]
                    // const node2 = othernodes[1]
                    // const node1Position =graph?.positions[node1]
                    // const node2Position = graph?.positions[node2]
                    // console.log("delete selected object  ndoes")
                    // if (node1 && node2) {
                    //     addConnectionBtwnEdges(node1, node2, graph, canvas);
                    //     if (node1.includes("_") || node2.includes("_")) { 
                    //         drawLine(
                    //             node1Position,
                    //             node2Position,
                    //             "path",
                    //             `path$${node1}$${node2}`,
                    //             canvas,"green"
                    //         );
                    //     } else {

                    //         drawLine(
                    //             node1Position,
                    //             node2Position,
                    //             "path",
                    //             `path$${node1}$${node2}`,
                    //             canvas
                    //         );
                    //     }
                    // }
                    // graph.restorePositions(positions);
                    // graph.restoreEdges(edges);
                    // console.log(othernodes,'othernodes')
                } else {
                    removeNode(a.id, true, graph, canvas, isNode);
                }
            } else {
                removeNode(a.id, true, graph, canvas, isNode);
            }
        }
        if (['path', 'node']?.includes(a?.name)) {
            removeFabricObjectsBId(canvas, a.id);
        }
    });

    setSelTraversibleDetails((prev) => ({
        ...prev,
        edges_data: graph.getEdges(),
        points_data: graph.getPositions(),
        post: true
    }));
    if (objs?.length > 0) {
        setToolTraversible("Select");
        setSelectedPaths(false);
    }
    // renderTraversiblePaths()
    canvas.current.discardActiveObject();
    canvas.current.renderAll();
    checkPinConnectOrNot();
};

const deleteSubPathCondition = (objs, deleteSubPath) => {
    // if (objs?.length === 2 && objs.every(item => item.name === "path")) {
    //     console.log(objs, 'deleteSubPathCondition')
    //     const key1 = objs[0]?.id.split("$")[1];
    //     const key2 = objs[0]?.id.split("$")[2];
    //     const key3 = objs[1]?.id.split("$")[1];
    //     const key4 = objs[1]?.id.split("$")[2];
    //     if (key1 === key4 && key2 === key3) {
    //         console.log(objs, 'deleteSubPathCondition')
    //         deleteSubPath(objs[1])
    //     }
    // } else
    if (objs?.length === 1 && objs.every(item => item.name === "path")) {
        deleteSubPath(objs[0])
    }
}
export default deleteObjects;