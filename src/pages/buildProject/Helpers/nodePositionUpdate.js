import { calculateDistance } from "./calculateDistance";

const nodePositionUpdate = (pinName, pinDetails, newPosition, graph, setSelTraversibleDetails) => {
    if (graph?.positions && Object.keys(graph?.positions).length > 0) {
        const nodeId = `${pinName}_${pinDetails?.enc_id}`;
        console.log(pinName,pinDetails?.enc_id);

        if (graph.positions[nodeId] && nodeId) {
            // Update node position
            graph.positions[nodeId] = newPosition;

            // Update edges connected to the node
            if (graph.edges[nodeId]) {
                Object.keys(graph.edges[nodeId])?.forEach((neighbor) => {
                    graph.edges[nodeId][neighbor] = calculateDistance(
                        newPosition,
                        graph.positions[neighbor]
                    );
                    graph.edges[neighbor][nodeId] = calculateDistance(
                        graph.positions[neighbor],
                        newPosition
                    );
                });
    
                setSelTraversibleDetails((prev) => ({
                    ...prev,
                    edges_data: graph.edges,
                    points_data: graph.positions,
                    post: true
                }));
                
            }

        } else {
            // console.log(
            //     `Node with enc_id ${pinDetails?.enc_id} not found in graph positions.`
            // );
        }
    } else {
        // console.log("no change");
    }
};

export default nodePositionUpdate;