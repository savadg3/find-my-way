import React, { useState } from 'react'
import FloorPlanDtls from './FloorPlanDtls';

const PolyLinesContainer = ({ selFloorPlanDtls, coordinates, mapDivSize, pointClickHandler, selKey, completed, setPolygons, id, projectSettings }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [lineCenter, setLineCenter] = useState({ x: 100, y: 100 });
    const controlPoint1 = { x: lineCenter.x - 50, y: lineCenter.y };
    const controlPoint2 = { x: lineCenter.x + 50, y: lineCenter.y };

    function deCasteljauQuadratic(p0, p1, p2, t) {
        const x = (1 - t) * (1 - t) * p0[0] + 2 * (1 - t) * t * p1[0] + t * t * p2[0];
        const y = (1 - t) * (1 - t) * p0[1] + 2 * (1 - t) * t * p1[1] + t * t * p2[1];
        return [x, y];
    }

    function drawQuadraticBezierCurve(startPoint, controlPoint, endPoint) {

        let d = `M${startPoint[0]},${startPoint[1]}`;

        for (let t = 0; t <= 1; t += 0.01) {
            const [x, y] = deCasteljauQuadratic(startPoint, controlPoint, endPoint, t);
            d += ` L${x},${y}`;
        }

        return d
    }

    const handleMouseMove = (e) => {
        e.stopPropagation()
        if (isDragging) {
            console.log('herer')
            // Get the mouse position relative to the SVG container
            const svgContainer = e.currentTarget;
            const point = svgContainer.createSVGPoint();
            point.x = e.clientX;
            point.y = e.clientY;
            const cursorPoint = point.matrixTransform(svgContainer.getScreenCTM().inverse());

            // Update the line's center coordinates
            // setLineCenter({ x: cursorPoint.x, y: cursorPoint.y });
            let tempCoordinates = [...coordinates]
            tempCoordinates[isDragging].xa = cursorPoint.x - 50
            tempCoordinates[isDragging].ya = cursorPoint.y
            tempCoordinates[isDragging].xb = cursorPoint.x + 50
            tempCoordinates[isDragging].yb = cursorPoint.y
            console.log(tempCoordinates)

            setPolygons(prev => { prev[id] = coordinates; return prev })
        }
    };

    return (
        <svg
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 25 }}

            onMouseMove={handleMouseMove}
        >
            {/* Color Filling */}
            <polyline
                points={coordinates.map(({ x, y }) => `${mapDivSize.width / x},${mapDivSize.height / y}`).join(' ')}
                fill={selFloorPlanDtls?.fill_color ?? projectSettings?.fill_color}
                opacity={0.5}
                strokeWidth="0"

            />

            {/* Lines */}
            {coordinates.map((point, idx) => {
                if (!coordinates[idx + 1] && !completed) return
                const x1 = mapDivSize.width / point.x
                const y1 = mapDivSize.height / point.y
                const x2 = mapDivSize.width / (coordinates[idx + 1] ? coordinates[idx + 1].x : coordinates[0].x)
                const y2 = mapDivSize.height / (coordinates[idx + 1] ? coordinates[idx + 1].y : coordinates[0].y)
                const xa = point.xa ? mapDivSize.width / point.xa : x1
                const ya = point.ya ? mapDivSize.height / point.ya : y1
                return (
                    <path
                        d={drawQuadraticBezierCurve([x1, y1], [xa, ya], [x2, y2])}
                        fill="transparent"
                        stroke={selFloorPlanDtls?.border_color ?? projectSettings?.border_color}
                        strokeWidth={selFloorPlanDtls?.border_thick ?? projectSettings?.border_thick}
                    />
                )
            })}
            {!completed && coordinates.map(point => <circle cx={mapDivSize.width / point.x} cy={mapDivSize.height / point.y} fill='black' r={3} className='cursor-pointer ' />)}
        </svg>

    )
}

export default PolyLinesContainer


