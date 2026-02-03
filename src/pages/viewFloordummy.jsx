import React, { useEffect, useRef } from 'react';
import { fabric } from 'fabric';

const AutoConnectComponent = () => {
    const canvasRef = useRef(null);
    const polylineRef = useRef(null);
    const pointsRef = useRef([
        { x: 100, y: 100 },  // Point A
        { x: 400, y: 300 }   // Point B
    ]);

    useEffect(() => {
        const canvas = new fabric.Canvas(canvasRef.current);

        // Utility function to find the nearest point on the line segment
        const nearestPointOnLine = (p1, p2, point) => {
            const A = point.x - p1.x;
            const B = point.y - p1.y;
            const C = p2.x - p1.x;
            const D = p2.y - p1.y;

            const dot = A * C + B * D;
            const lenSq = C * C + D * D;
            const param = lenSq !== 0 ? dot / lenSq : -1;

            let nearestPoint;
            if (param < 0) {
                nearestPoint = p1;
            } else if (param > 1) {
                nearestPoint = p2;
            } else {
                nearestPoint = {
                    x: p1.x + param * C,
                    y: p1.y + param * D
                };
            }

            return nearestPoint;
        };

        // Utility function to calculate the distance between two points
        const distance = (p1, p2) => {
            const dx = p1.x - p2.x;
            const dy = p1.y - p2.y;
            return Math.sqrt(dx * dx + dy * dy);
        };

        // Initial polyline
        const polyline = new fabric.Polyline(pointsRef.current, {
            stroke: 'black',
            strokeWidth: 2,
            fill: 'transparent',
            selectable: false
        });
        polylineRef.current = polyline;
        canvas.add(polyline);

        // Randomly placed pins
        const pins = [];
        for (let i = 0; i < 5; i++) {
            const pin = new fabric.Circle({
                left: Math.random() * 500,
                top: Math.random() * 500,
                radius: 5,
                fill: 'red',
                selectable: false
            });
            pins.push(pin);
            canvas.add(pin);
        }

        // Function to find the nearest point on the line segment
        const getNearestPointOnLine = (pinPos, points) => {
            let nearestPoint = null;
            let minDistance = Infinity;
            for (let i = 0; i < points.length - 1; i++) {
                const p1 = points[i];
                const p2 = points[i + 1];
                const nearest = nearestPointOnLine(p1, p2, pinPos);
                const dist = distance(pinPos, nearest);
                if (dist < minDistance) {
                    nearestPoint = nearest;
                    minDistance = dist;
                }
            }
            return nearestPoint;
        };

        // Function to split the line segment at the nearest point
        const splitLineSegment = (points, nearestPoint) => {
            for (let i = 0; i < points.length - 1; i++) {
                const p1 = points[i];
                const p2 = points[i + 1];
                const nearest = nearestPointOnLine(p1, p2, nearestPoint);
                if (nearest.x === nearestPoint.x && nearest.y === nearestPoint.y) {
                    points.splice(i + 1, 0, nearestPoint);
                    break;
                }
            }
            return points;
        };

        // Update the polyline with new points
        const updatePolyline = (polyline, points) => {
            polyline.set({ points });
            polyline.setCoords(); // Update the polyline coordinates
            canvas.requestRenderAll(); // Re-render the canvas
        };

        // Handle pin connections
        const connectPins = () => {
            pins.forEach(pin => {
                const pinPos = { x: pin.left + pin.radius, y: pin.top + pin.radius }; // Adjusted for the pin's radius
                const nearestPoint = getNearestPointOnLine(pinPos, pointsRef.current);
                pointsRef.current = splitLineSegment(pointsRef.current, nearestPoint);
                updatePolyline(polylineRef.current, pointsRef.current);
            });
        };

        // Create movable nodes for each point in the polyline
        const createMovableNodes = (points) => {
            points.forEach((point, index) => {
                const node = new fabric.Circle({
                    left: point.x,
                    top: point.y,
                    radius: 6,
                    fill: 'blue',
                    selectable: true,
                    hasControls: false, // Disable scaling/rotation
                    lockScalingX: true,
                    lockScalingY: true
                });
                canvas.add(node);
 
                // Update polyline when a node is moved
                
            });
      };
       
      canvas.on('move', function (e) {
        const movedPoint = pointsRef.current[index];
        movedPoint.x = e.target.left;
        movedPoint.y = e.target.top;
        updatePolyline(polylineRef.current, pointsRef.current);
    });  

        // Create nodes for the initial points
        createMovableNodes(pointsRef.current);

        // Connect pins when the button is clicked
        document.getElementById('connectPinButton').onclick = connectPins;

        // Clean up on component unmount
        return () => {
            canvas.dispose();
        };
    }, []);

    return (
        <div>
            <canvas ref={canvasRef} width={600} height={600} style={{ border: '1px solid #ccc' }} />
            <button id="connectPinButton">Connect Pins</button>
        </div>
    );
};

export default AutoConnectComponent;
