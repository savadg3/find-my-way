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

// function dijkstraWithLength(graph, startNode, endNode) {
//     const distances = {};
//     const visited = {};
//     const previous = {};
//     const priorityQueue = new PriorityQueue();

//     for (const node of graph.nodes) {
//         if (node === startNode) {
//             distances[node] = 0;
//             priorityQueue.enqueue(node, 0);
//         } else {
//             distances[node] = Infinity;
//         }
//         visited[node] = false;
//         previous[node] = null;
//     }

//     while (!priorityQueue.isEmpty()) {
//         const { element: currentNode } = priorityQueue.dequeue();

//         if (currentNode === endNode) {
//             const path = [];
//             let node = currentNode;
//             while (node !== null) {
//                 path.unshift(node);
//                 node = previous[node];
//             }
//             return { path, length: distances[currentNode] };
//         }

//         if (visited[currentNode]) {
//             continue;
//         }

//         visited[currentNode] = true;

//         const neighbors = graph.getNeighbors(currentNode);
//         for (const neighbor of neighbors) {
//             const distance =
//                 distances[currentNode] + graph.edges[currentNode][neighbor];

//             if (distance < distances[neighbor]) {
//                 distances[neighbor] = distance;
//                 previous[neighbor] = currentNode;
//                 priorityQueue.enqueue(neighbor, distance);
//             }
//         }
//     }

//     // No path found
//     return null;
// }



function dijkstraWithLength(combinedGraph, startNode, endNode) {
  const distances = {};
  const visited = {};
  const previous = {};
  const priorityQueue = new PriorityQueue();

  combinedGraph.nodes.forEach(node => {
    distances[node] = Infinity;
    visited[node] = false;
    previous[node] = null;
  });
  distances[startNode] = 0;
  priorityQueue.enqueue(startNode, 0);

  while (!priorityQueue.isEmpty()) {
    const { element: currentNode } = priorityQueue.dequeue();

    if (currentNode === endNode) {
      const path = [];
      let node = currentNode;
      while (node !== null) {
        path.unshift(node);
        node = previous[node];
      }

      // Generate the floorwiseList with extracted floor IDs
      const floorwiseList = [];
      let currentFloor = null;
      let currentFloorGroup = [];

      for (let i = 0; i < path.length; i++) {
        const [floor, ...rest] = path[i].split("_"); // Extract floor and remaining part
        const nodeWithoutFloor = rest.join("_"); // Remove the floor prefix
        const floorId = floor.startsWith("f") ? floor.slice(1) : floor; // Remove first "f" if it exists

        if (floorId !== currentFloor) {
          if (currentFloorGroup.length > 0) {
            floorwiseList.push({ [currentFloor]: currentFloorGroup });
          }
          currentFloor = floorId;
          currentFloorGroup = [];
        }
        currentFloorGroup.push(nodeWithoutFloor);
      }

      if (currentFloorGroup.length > 0) {
        floorwiseList.push({ [currentFloor]: currentFloorGroup });
      }

      return { path, length: distances[currentNode], floorwiseList };
    }

    if (visited[currentNode]) continue;
    visited[currentNode] = true;

    const neighbors = Object.keys(combinedGraph.edges[currentNode] || {});
    neighbors.forEach(neighbor => {
      if (visited[neighbor]) return;

      const alt = distances[currentNode] + combinedGraph.edges[currentNode][neighbor];
      if (alt < distances[neighbor]) {
        distances[neighbor] = alt;
        previous[neighbor] = currentNode;
        priorityQueue.enqueue(neighbor, alt);
      }
    });
  }

  return null; 
}



export { dijkstraWithLength, PriorityQueue };
