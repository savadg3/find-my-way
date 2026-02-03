import React from 'react'

const PolyLinesContainer = ({ coordinates, mapDivSize, pointClickHandler, selKey, completed }) => {
    console.log(coordinates, 'poly   ')
    return (
        <svg
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
        >
            <polyline
                points={coordinates.map(({ x, y }) => `${mapDivSize.width / x},${mapDivSize.height / y}`).join(' ')}
                fill="blue"
                stroke="black"
                opacity={0.5}
                strokeWidth="0"
            />

            {coordinates.map((point, id) => {
                if (!coordinates[id + 1] && !completed) return
                const x1 = mapDivSize.width / point.x
                const y1 = mapDivSize.height / point.y
                const x2 = mapDivSize.width / (coordinates[id + 1] ? coordinates[id + 1].x : coordinates[0].x)
                const y2 = mapDivSize.height / (coordinates[id + 1] ? coordinates[id + 1].y : coordinates[0].y)
                return (<line x1={x1} y1={y1} x2={x2} y2={y2} stroke={"#24D134"} strokeWidth="1" />)
            })}

            {coordinates.map(point => <circle cx={mapDivSize.width / point.x} cy={mapDivSize.height / point.y} fill='red' r={3} />)}
        </svg>

    )
}

export default PolyLinesContainer