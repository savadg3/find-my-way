import { removeFabricObjectsBId } from "./bringFabricObjects";

const removeNode = (id, removeLines, graph, canvas, isNode,callback=true) => {
    if (isNode) {
        // console.log(id,graph,"first")
    }
    //removeLines control if lines connected to node want to delete or not.
    removeFabricObjectsBId(canvas, id);
    let positions = graph.getPositions();
    let edges = graph.getEdges();
    // console.log(positions, edges, "first");

    delete positions[id]; //removing position
    graph.removeNode(id);
    // Remove sub node
    if (callback) {
        graph.removeSubnode(id)
        graph.removeConnectedMainPathNodes(id)
    }
    // graph.removeAutoConnectNode(id)
    

    graph.restoreNodes(new Set(Object.keys(positions)));

    if (edges[id] && removeLines) {
        // console.log(edges[id], 'edges[id]')
        Object.keys(edges[id]).forEach((key) => {
            // console.log(key, 'keykey')
            //to remove all lines connected to that node
            delete edges[key]?.[id];

            delete edges[id][key];

            removeFabricObjectsBId(canvas, `path$${key}$${id}`);
            removeFabricObjectsBId(canvas, `path$${id}$${key}`);

            // to remove nodes if no other line present
            if (Object.keys(edges[key])?.length === 0) {
                // if (!key.includes("_")) {
                    removeNode(key, false, graph, canvas,false,false);
                // }
            }
        });
        delete edges[id];
    }

    Object.keys(edges).forEach((key) => {
        if (Object.keys(edges[key])?.length === 0 || isNaN(Object.values(edges[key])[0])) {
            delete edges[key]; // Remove the edge if it becomes empty
        }
    });

    graph.restorePositions(positions);
    graph.restoreEdges(edges);
};

const removeLine = (id, graph, canvas, type) => {
    const key1 = id.split("$")[1];
    const key2 = id.split("$")[2];
    removeFabricObjectsBId(canvas, `path$${key1}$${key2}`);
    removeFabricObjectsBId(canvas, `path$${key2}$${key1}`);



    let edges = graph.getEdges();
    if (edges[key1]?.[key2]) {
        delete edges[key1][key2];
    }
    if (edges[key2]?.[key1]) {
        delete edges[key2][key1];
    }

    graph.restoreEdges(edges);
    // to remove nodes if no other line present
    if (!type) {
        if (edges[key1] && Object.keys(edges[key1])?.length === 0) {
            removeNode(key1, false, graph, canvas);
        }
        if (edges[key2] && Object.keys(edges[key2])?.length === 0) {
            removeNode(key2, false, graph, canvas);
        }
    }
};

export { removeNode, removeLine };