import React, { useCallback, useEffect, useState } from 'react'
import PrimaryBtn from '../../components/buttons/PrimaryBtn';
import EdgeLine from '../../components/EdgeLine';
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import NodeComp from './components/NodeComp';
import { useDrop } from 'react-dnd'
import PolyLinesContainer from './components/PolyLinesContainer';
class Graph {
    constructor() {
        this.nodes = new Set();
        this.edges = {};
        this.positions = {};
    }

    addNode(node) {
        this.nodes.add(node);
        this.edges[node] = {};
    }

    addEdge(node1, node2) {
        let position1 = this.positions[node1]
        let position2 = this.positions[node2]
        const distance = Math.sqrt((position1?.x - position2?.x) ** 2 + (position1?.y - position2?.y) ** 2)
        this.edges[node1][node2] = distance;
        this.edges[node2][node1] = distance;
    }

    addPosition(node, x, y) {
        this.positions[node] = { x, y }
    }


    getNeighbors(node) {
        return Object.keys(this.edges[node]);
    }

    updateAllEdges(edges) {
        this.edges = edges
    }
}

const graph = new Graph();

const MainComp = () => {

    const [posits, setPosits] = useState([])
    const [type, setType] = useState()
    const [counts, setCounts] = useState(0)
    const [selKey, setSelKey] = useState()
    const [source, setSource] = useState()
    const [destination, setDestination] = useState()
    const [shortestNodes, setShortestNodes] = useState([])
    const [drawEdges, setDrawEdges] = useState([])
    const [mapDivSize, setMapDivSize] = useState({ width: 0, height: 0 })
    const [floorPlan, setFloorPlan] = useState('')
    const [polygons, setPolygons] = useState([])
    const [tempPolygon, setTempPolygon] = useState([])
    const moveBox = useCallback(
        (key, left, top) => {
            onDragFinished(key, left, top)

        },
        [posits, setPosits, drawEdges, setDrawEdges],
    )

    const [, drop] = useDrop(
        () => ({
            accept: 'node',
            drop(item, monitor) {
                const delta = monitor.getDifferenceFromInitialOffset()
                const left = (item.left + delta.x)
                const top = (item.top + delta.y)
                moveBox(item.id, left, top) 
                return undefined
            },
        }),
        [moveBox],
    )

    function dijkstra(graph, startNode, endNode) {
        const distances = {};
        const visited = {};
        const previous = {};
        const priorityQueue = new PriorityQueue();

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

            if (currentNode === endNode) {
                const path = [];
                let node = currentNode;
                while (node !== null) {
                    path.unshift(node);
                    node = previous[node];
                }
                return path;
            }

            if (visited[currentNode]) {
                continue;
            }

            visited[currentNode] = true;

            const neighbors = graph.getNeighbors(currentNode);
            for (const neighbor of neighbors) {
                const distance = distances[currentNode] + graph.edges[currentNode][neighbor];

                if (distance < distances[neighbor]) {
                    distances[neighbor] = distance;
                    previous[neighbor] = currentNode;
                    priorityQueue.enqueue(neighbor, distance);
                }
            }
        }

        // No path found
        return null;
    }

    // Priority queue implementation using a binary heap
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




    const generateNodeName = () => {
        const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const newUserName = [];
        let counter = counts;

        do {
            newUserName.unshift(alphabet[counter % 26]);
            counter = Math.floor(counter / 26) - 1;
        } while (counter >= 0);

        return newUserName.join('');
    };

    const onMouseClick = (e) => {


        const { clientWidth, clientHeight } = window.document.getElementById('map-div')

        if (!mapDivSize.height) { // inorder to set size if its not loaded early
            setMapDivSize({ height: clientHeight, width: clientWidth })
        }

        const absPosX = e.nativeEvent.offsetX;
        const absPosY = e.nativeEvent.offsetY;

        const relPosX = (clientWidth / absPosX)
        const relPosY = (clientHeight / absPosY)

        if (relPosX > clientWidth || relPosY > clientHeight) return

        if (type == 'add') {
            let nodeName = generateNodeName()
            e.stopPropagation();
            graph.addNode((nodeName).toString())
            graph.addPosition(nodeName, relPosX, relPosY)

            const tempPosits = JSON.parse(JSON.stringify(graph.positions))
            setPosits((prev) => ({ ...prev, [nodeName]: { x: relPosX, y: relPosY } }))
            setCounts(prev => prev + 1)

        } else if (type == 'polygon') {
            console.log({ x: relPosX, y: relPosY })
            if (tempPolygon.length > 0 && isInsideRadius({ x: relPosX, y: relPosY }, tempPolygon[0])) {
                setPolygons(prev => [...prev, tempPolygon])
                setTempPolygon([])
            } else {

                setTempPolygon(prev => [...prev, { x: relPosX, y: relPosY }])
            }

        }


    }

    const isInsideRadius = (cod1, cod2) => {
        const dx = mapDivSize.width / cod2?.x - mapDivSize.width / cod1?.x;
        const dy = mapDivSize.height / cod2?.y - mapDivSize.height / cod1?.y;
        const distance = Math.sqrt((dx * dx) + (dy * dy));

        return distance <= 4;



    }

    const onDragFinished = (key, left, top) => {
        const absPosX = left;
        const absPosY = top;

        const relPosX = mapDivSize.width / absPosX
        const relPosY = mapDivSize.height / absPosY

        graph.addPosition(key, relPosX, relPosY)
        setPosits({ ...graph.positions })


        let tempGraphEdges = JSON.parse(JSON.stringify({ ...graph.edges }))
        let keyEdges = JSON.parse(JSON.stringify({ ...graph.edges[key] }))
        Object.keys(keyEdges).forEach(item => {
            let position1 = graph.positions[key]
            let position2 = graph.positions[item]
            const distance = Math.sqrt((position1?.x - position2?.x) ** 2 + (position1?.y - position2?.y) ** 2)
            keyEdges[item] = distance
            tempGraphEdges[item][key] = distance

        })
        graph.updateAllEdges({ ...tempGraphEdges, [key]: keyEdges })


        let tempEdges = [...drawEdges]

        drawEdges.forEach((a, index) => {
            if (tempEdges[index].key1 == key) {
                tempEdges[index].x1 = relPosX
                tempEdges[index].y1 = relPosY
                console.log(tempEdges[index], 'index')
            }
            if (tempEdges[index].key2 == key) {
                tempEdges[index].x2 = relPosX
                tempEdges[index].y2 = relPosY
            }
        })
        if (tempEdges.length) {
            setDrawEdges([...tempEdges])

        }

    }

    const handleResize = () => {
        console.log('happp')
        const { clientWidth, clientHeight } = window.document.getElementById('map-div')
        setMapDivSize({ height: clientHeight, width: clientWidth })
    }

    const pointClickHandler = (e, key) => {
        console.log('here')
        e.stopPropagation()
        if (type == 'add') return
        if (!selKey) {
            setSelKey(key)
        } else {
            if (type == 'edge') {
                graph.addEdge(selKey, key)
                let position1 = posits[selKey]
                let position2 = posits[key]
                setDrawEdges(prev => [...prev, { x1: position1.x, y1: position1.y, x2: position2.x, y2: position2.y, key1: selKey, key2: key }])
            } else if (type == 'path') {
                findShortestRoute(key)
            }
            setSelKey()

        }

    }

    const findShortestRoute = () => {
        if (source == destination) return
        if (!source) setSource('A')
        if (!destination) return
        const shortestPath = dijkstra(graph, source, destination);
        setShortestNodes([...shortestPath])
    }

    const getFloorDetails = () => {
        const floorDtls = localStorage.getItem('map')

        console.log(floorDtls)
        if (floorDtls) {
            setFloorPlan(JSON.parse(floorDtls))
        }
    }


    useEffect(() => {

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };

    }, [])

    useEffect(() => {
        getFloorDetails()
    }, [])


    return (
        <div className='w-full h-full'>
            <div className='p-2 flex items-center justify-end gap-3' >
                <PrimaryBtn label='Add Polygon' onClick={() => setType('polygon')} />
                <PrimaryBtn label='Add Point' onClick={() => setType('add')} />
                <PrimaryBtn label='Add Edge' onClick={() => setType('edge')} />
                <select value={source} onChange={(e) => setSource(e.target.value)}>
                    {Object.entries(posits).map(([key, value]) => ({
                        key,
                        ...value,
                    })).map(node => <option value={node.key}>{node.key}</option>)}

                </select>
                <select value={destination} onChange={(e) => setDestination(e.target.value)}>
                    {Object.entries(posits).map(([key, value]) => ({
                        key,
                        ...value,
                    })).map(node => <option value={node.key}>{node.key}</option>)}

                </select>
                <PrimaryBtn label='Show Path' onClick={() => findShortestRoute()} />

            </div>
            <div
                ref={drop}
                onClick={onMouseClick}
            >

                <div
                    id='map-div'
                    className='relative bg-center w-full bg-contain'
                    style={{
                        height: 'auto', width: '100%', backgroundSize: 'cover', backgroundRepeat: 'no-repeat'
                    }} >

                    <img src={floorPlan?.floorPlan} style={{ height: '100%', width: '100%' }} />
                    {drawEdges.map(ed => <EdgeLine x1={mapDivSize.width / ed.x1} y1={mapDivSize.height / ed.y1} x2={mapDivSize.width / ed.x2} y2={mapDivSize.height / ed.y2} selected={shortestNodes.includes(ed.key1) && shortestNodes.includes(ed.key2)} />)}

                    {Object.entries(posits).map(([key, value]) => ({
                        key,
                        ...value,
                    })).map((node, idx) =>
                        <NodeComp idx={idx} pointClickHandler={pointClickHandler} node={node} mapDivSize={mapDivSize} selKey={selKey} shortestNodes={shortestNodes} />
                    )}
                    {polygons.map(p => <PolyLinesContainer coordinates={p} mapDivSize={mapDivSize} completed />)}
                    <PolyLinesContainer coordinates={tempPolygon} mapDivSize={mapDivSize} />

                </div>
            </div>
        </div >
    )
}




const AddLocations = () => {


    return (
        <DndProvider backend={HTML5Backend}>
            <MainComp />
        </DndProvider>
    )
}


export default AddLocations