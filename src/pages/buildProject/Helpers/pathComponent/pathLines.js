const pathLine = (canvas, nodes, projectSettings, shortestPath) => {
    let zoom = canvas.current.getZoom()
    shortestPath.forEach((p, id) => {
        if (id < shortestPath.length - 1) {
            let points = [
                nodes[p].x,
                nodes[p].y,
                nodes[shortestPath[id + 1]].x,
                nodes[shortestPath[id + 1]].y
            ];
            let line = new fabric.Line(points, {
                // strokeWidth: projectSettings?.navigation_thick ?? 1,
                strokeWidth: zoom == 1 ? projectSettings?.navigation_thick ?? 1 : zoom <= 0.9 ? 8 : zoom <= 6 ? 3 : zoom <= 13 ? 2 : zoom <= 30 ? 1 : 3,
                stroke: projectSettings?.navigation_color ?? "red",
                selectable: false,
                name: "short_path",
                id: "short_path",
                originX: "center",
                originY: "center",
                hoverCursor: "auto",
                lockMovementX: true,
                lockMovementY: true,
                lockRotation: true,
                lockScalingX: true,
                lockScalingY: true,
                hasControls: false,
                hasBorders: false,
            });
            canvas.current.add(line).renderAll();
        }
    });
}
export default pathLine;