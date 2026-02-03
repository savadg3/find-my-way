class Graph {
    constructor() {
        this.nodes = new Set();
        this.edges = {};
        this.positions = {};
        this.highligthNodes = [];
        this.subNode = [];
        // this.mainPath = new Set();
        // this.subPath = new Set();
        this.connectedMainPathNodes = [];
        this.autoConnectNode = [];
    }

    addNode(node) {
        this.nodes.add(node);
        if (!this.edges[node]) {
            this.edges[node] = {};
        }
    }

    removeNode(node) {
        this.nodes.delete(node);
    }
    removePosition(position) {
        this.nodes.delete(node);
    }
    addEdge(node1, node2) {
        let position1 = this.positions[node1];
        let position2 = this.positions[node2];
        const distance = Math.sqrt(
            (position1?.x - position2?.x) ** 2 + (position1?.y - position2?.y) ** 2
        );
        this.edges[`${node1}`][`${node2}`] = distance;
        this.edges[`${node2}`][`${node1}`] = distance;
    }

    addPosition(node, x, y) {
        this.positions[node] = { x, y };
    }
    restoreEdges(edges) {
        this.edges = edges ?? {};
    }
    restorePositions(positions) {
        this.positions = positions ?? {};
    }
    restoreNodes(nodes) {
        this.nodes = nodes ?? new Set();
    }

    getNeighbors(node) {
        // console.log(this.edges,node,"node")
        if (this.edges[node]) {
            return Object.keys(this.edges[node]);
        } else {
            console.log("this.edges[node] is not present ")
            return [];
        }
    }

    updateAllEdges(edges) {
        this.edges = edges;
    }

    removeEdge(node1, node2) {
        if (this.edges[node1] && this.edges[node1][node2]) {
            delete this.edges[node1][node2];
        }
        if (this.edges[node2] && this.edges[node2][node1]) {
            delete this.edges[node2][node1];
        }
    }

    getPositions() {
        return this.positions;
    }
    
    getEdges() {
        return this.edges;
    }

    highlightNode(node) {
        if (!this.highligthNodes.includes(node)) {
            this.highligthNodes.push(node);
        }
    }
    getHighlightNode() {
        return this.highligthNodes;
    }
    restoreHighlightNode(nodes) {
        this.highligthNodes = nodes ?? [];
    }

    addSubnode(node) {
        if (!this.subNode.includes(node)) {
            this.subNode.push(node);
        }
    }

    removeSubnode(node) {
        const index = this.subNode.indexOf(node);
        if (index !== -1) {
            this.subNode.splice(index, 1);
        }
    }

    restoreSubnode(nodes) {
        this.subNode = nodes ?? [];
    }

    getSubNode() {
        return this.subNode;
    }
    
    addConnectedMainPathNodes(node) {
        if (!this.connectedMainPathNodes.includes(node)) {
            this.connectedMainPathNodes.push(node);
        }
    }

    removeConnectedMainPathNodes(node) {
        const index = this.connectedMainPathNodes.indexOf(node);
        if (index !== -1) {
            this.connectedMainPathNodes.splice(index, 1);
        }
    }

    restoreConnectedMainPathNodes(nodes) {
        this.connectedMainPathNodes = nodes ?? [];
    }

    getConnectedMainPathNodes() {
        return this.connectedMainPathNodes;
    }
    
    addAutoConnectNode(node) {
        if (!this.autoConnectNode.includes(node)) {
            this.autoConnectNode.push(node);
        }
    }

    removeAutoConnectNode(node) {
        const index = this.autoConnectNode.indexOf(node);
        if (index !== -1) {
            this.autoConnectNode.splice(index, 1);
        }
    }

    restoreAutoConnectNode(nodes) {
        this.autoConnectNode = nodes ?? [];
    }

    getAutoConnectNode() {
        return this.autoConnectNode;
    }

}

export default Graph;