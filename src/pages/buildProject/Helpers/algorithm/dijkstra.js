class PriorityQueue {
    constructor() {
        this.elements = [];
    }

    enqueue(element, priority) {
        const node = { element, priority };
        this.elements.push(node);
        this.heapifyUp();
    }

    dequeue() {
        if (this.isEmpty()) {
            return null;
        }

        const min = this.elements[0];
        const last = this.elements.pop();
        if (!this.isEmpty()) {
            this.elements[0] = last;
            this.heapifyDown();
        }
        return min;
    }
    isEmpty() {
        return this.elements.length === 0;
    }
    heapifyUp() {
        let index = this.elements.length - 1;
        const node = this.elements[index];

        while (index > 0) {
            const parentIndex = Math.floor((index - 1) / 2);
            const parent = this.elements[parentIndex];

            if (node.priority >= parent.priority) {
                break;
            }

            this.elements[parentIndex] = node;
            this.elements[index] = parent;
            index = parentIndex;
        }
    }
    heapifyDown() {
        let index = 0;
        const length = this.elements.length;
        const node = this.elements[index];
        while (true) {
            let leftChildIndex = 2 * index + 1;
            let rightChildIndex = 2 * index + 2;
            let leftChild, rightChild;
            let swapIndex = null;
            if (leftChildIndex < length) {
                leftChild = this.elements[leftChildIndex];
                if (leftChild.priority < node.priority) {
                    swapIndex = leftChildIndex;
                }
            }
            if (rightChildIndex < length) {
                rightChild = this.elements[rightChildIndex];
                if (
                    (swapIndex === null && rightChild.priority < node.priority) ||
                    (swapIndex !== null && rightChild.priority < leftChild.priority)
                ) {
                    swapIndex = rightChildIndex;
                }
            }
            if (swapIndex === null) {
                break;
            }
            this.elements[index] = this.elements[swapIndex];
            this.elements[swapIndex] = node;
            index = swapIndex;
        }
    }
}


// original function
// function dijkstra(graph, startNode, endNode) {
//     const distances = {};
//     const visited = {};
//     const previous = {};
//     const priorityQueue = new PriorityQueue();

//     for (const node of graph.nodes) {
//         if (node === startNode) {
//             distances[node] = 0;
//             priorityQueue?.enqueue(node, 0);
//         } else {
//             distances[node] = Infinity;
//         }
//         visited[node] = false;
//         previous[node] = null;
//     }

//     while (!priorityQueue?.isEmpty()) {
//         const { element: currentNode } = priorityQueue?.dequeue();

//         if (currentNode === endNode) {
//             const path = [];
//             let node = currentNode;
//             while (node !== null) {
//                 path?.unshift(node);
//                 node = previous[node];
//             }
//             return path;
//         }

//         if (visited[currentNode]) {
//             continue;
//         }

//         visited[currentNode] = true;

//         const neighbors = graph?.getNeighbors(currentNode);
//         for (const neighbor of neighbors) {
//             const distance =
//                 distances[currentNode] + graph?.edges[currentNode][neighbor];

//             if (distance < distances[neighbor]) {
//                 distances[neighbor] = distance;
//                 previous[neighbor] = currentNode;
//                 priorityQueue?.enqueue(neighbor, distance);
//             }
//         }
//     }

//     // No path found
//     return null;
// }


// new code to prioritise main path
function dijkstra(graph, startNode, endNode) {
    let prioritisedpath = prioritiseMainpath(graph, startNode, endNode)
    if (!prioritisedpath) {
        return normalPathFinding(graph, startNode, endNode)
    }
    return prioritisedpath
}

function prioritiseMainpath(graph, startNode, endNode) {
    const distances = {};
    const visited = {};
    const previous = {};
    const priorityQueue = new PriorityQueue();
    let nodes = [...graph.nodes]
    // let allNodeExceptSubNodeWithoutPinFilter = nodes.filter((item) => (!graph?.subNode?.includes(item) || graph?.connectedMainPathNodes.includes(item))
    // // || item.includes("_")
    // )
    // console.log(allNodeExceptSubNodeWithoutPinFilter,"allNodeExceptSubNodeWithoutPinFilter");
    // let allNodeExceptSubNode = allNodeExceptSubNodeWithoutPinFilter.filter((item) => !item.includes("location" || "product") || (item == startNode || item ==  endNode))
    
    // let nearestmainPathConnectionForStart = findNearestPathToConnectedMain(graph,startNode,allNodeExceptSubNode) || []
    // let nearestmainPathConnectionForEnd = findNearestPathToConnectedMain(graph, endNode, allNodeExceptSubNode) || []
    
    let mainpathNodes = nodes.filter((item) =>
        !(graph?.subNode?.includes(item) && !graph?.connectedMainPathNodes?.includes(item)
            // && ![...nearestmainPathConnectionForStart, ...nearestmainPathConnectionForEnd].includes(item)
        )
    )

    mainpathNodes = mainpathNodes?.filter((item) => !item.includes("location" || "product") || (item == startNode || item ==  endNode))

    // console.log(allNodeExceptSubNode, mainpathNodes);

    // if (nearestmainPathConnectionForStart?.length > 1) {
    //     let startkeyNodes = graph?.getNeighbors(startNode);
    //     let filterstartkeys = startkeyNodes.filter((item) => {
    //         if (graph.subNode.includes(item)) {
    //             return !nearestmainPathConnectionForStart.includes(item);
    //         }
    //         return false;
    //     });
    //     mainpathNodes = mainpathNodes.filter((item) => !filterstartkeys.includes(item))
    // }

    // if (nearestmainPathConnectionForEnd?.length > 1) {
    //     let endkeyNodes = graph?.getNeighbors(endNode);
    //     let filterendKeys = endkeyNodes.filter((item) => {
    //         if (graph.subNode.includes(item)) {
    //           return !nearestmainPathConnectionForEnd.includes(item);
    //         }
    //         return false;
    //       });
    //     mainpathNodes = mainpathNodes.filter((item) => !filterendKeys.includes(item))
    // }
    
    for (const node of mainpathNodes) {
        distances[node] = node === startNode ? 0 : Infinity;
        visited[node] = false;
        previous[node] = null;

        // console.log(node,startNode,"node,startNode");
        
        if (node === startNode) {
            priorityQueue?.enqueue(node, 0);
        }
    }

    while (!priorityQueue?.isEmpty()) {
        const { element: currentNode } = priorityQueue?.dequeue();

        if (currentNode === endNode) {
            const path = [];
            let node = currentNode;
            while (node !== null) {
                path?.unshift(node);
                node = previous[node];
            }
            return path;
        }

        if (visited[currentNode]) {
            continue;
        }

        visited[currentNode] = true;

        let neighbors = graph?.getNeighbors(currentNode);
        // if (currentNode === endNode && [startNode, endNode].every((item) => graph.subNode.includes(item)) && Object.keys(graph.edges[startNode]).includes(endNode)) continue
        if (currentNode === startNode && neighbors.includes(endNode) && [startNode, endNode].every((item) => graph.subNode.includes(item)) ) {
            neighbors = neighbors.filter(item => item != endNode)
        }

        if (currentNode === endNode && neighbors.includes(endNode) && [startNode, endNode].every((item) => graph.subNode.includes(item)) ) {
            neighbors = neighbors.filter(item => item != startNode)
        }
        
        for (const neighbor of neighbors) {
            if (visited[neighbor]) continue; 
            const distance = distances[currentNode] + graph?.edges[currentNode][neighbor];
            if (distance < distances[neighbor]) {
                distances[neighbor] = distance;
                previous[neighbor] = currentNode;
                priorityQueue?.enqueue(neighbor, distance);
            }
        }
    }

    return null;  // No path found
}

function normalPathFinding(graph, startNode, endNode) {
    const distances = {};
    const visited = {};
    const previous = {};
    const priorityQueue = new PriorityQueue();

    for (const node of graph.nodes) {
        if (node === startNode) {
            distances[node] = 0;
            priorityQueue?.enqueue(node, 0);
        } else {
            distances[node] = Infinity;
        }
        visited[node] = false;
        previous[node] = null;
    }

    while (!priorityQueue?.isEmpty()) {
        const { element: currentNode } = priorityQueue?.dequeue();

        if (currentNode === endNode) {
            const path = [];
            let node = currentNode;
            while (node !== null) {
                path?.unshift(node);
                node = previous[node];
            }
            return path;
        }

        if (visited[currentNode]) {
            continue;
        }

        visited[currentNode] = true;

        const neighbors = graph?.getNeighbors(currentNode);
        for (const neighbor of neighbors) {
            const distance =
                distances[currentNode] + graph?.edges[currentNode][neighbor];

            if (distance < distances[neighbor]) {
                distances[neighbor] = distance;
                previous[neighbor] = currentNode;
                priorityQueue?.enqueue(neighbor, distance);
            }
        }
    }

    // No path found
    return null;
}

function findNearestPathToConnectedMain(graph, startNode, connectedMainPathNodes) {
    const distances = {};
    const visited = {};
    const previous = {};
    const priorityQueue = new PriorityQueue();
    const results = [];

    // Initialize distances, visited, and previous arrays 
    for (const node of graph.nodes) {
        if (node === startNode) {
            distances[node] = 0;
            priorityQueue.enqueue(node, 0);
        } else {
            distances[node] = Infinity;
        }
        visited[node] = false;
        previous[node] = null;
    }

    while (!priorityQueue.isEmpty()) {
        const { element: currentNode } = priorityQueue.dequeue();

        // If we've reached any of the connectedMainPathNodes, store the path and distance
        if (connectedMainPathNodes.includes(currentNode)) {
            const path = [];
            let node = currentNode;
            while (node !== null) {
                path.unshift(node);
                node = previous[node];
            }
            results.push({ path, length: distances[currentNode] });

            // Mark the current node as visited but don't exit the loop
            visited[currentNode] = true;
            continue;
        }

        if (visited[currentNode]) continue;

        visited[currentNode] = true;

        const neighbors = graph.edges[currentNode]
            ? Object.keys(graph.edges[currentNode])
            : [];
        for (const neighbor of neighbors) {
            if (visited[neighbor]) continue;

            const distance =
                distances[currentNode] + graph.edges[currentNode][neighbor];

            if (distance < distances[neighbor]) {
                distances[neighbor] = distance;
                previous[neighbor] = currentNode;
                priorityQueue.enqueue(neighbor, distance);
            }
        }
    }

    // Find the shortest path from the results
    if (results.length === 0) {
        return []; // No path found
    }

    let shortestpath = results.reduce((shortest, current) =>
        current.length < shortest.length ? current : shortest
    )

    return shortestpath?.path
}

// new code over


export { dijkstra, PriorityQueue };
