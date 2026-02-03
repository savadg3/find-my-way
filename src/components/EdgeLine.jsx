import React from 'react'

const EdgeLine = ({ x1, y1, x2, y2, selected }) => {
    const distance = Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2)
    const angle = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);
    const midpointX = (x1 + x2) / 2;
    const midpointY = (y1 + y2) / 2;
    return (
        <>
           
            <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
            {/* <text
                style={{
                    dominantBaseline: 'middle',
                    textAnchor: 'middle',
                    fontSize: 10,
                }}
                x={(x1 + x2) / 2} y={(y1 + y2 - 15  ) / 2} >
                {distance.toFixed(0)}
            </text> */}
                <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={selected ? '#26A3DB' : "#24D134"} strokeWidth="2" />
            </svg>
        </>

    )
}

export default EdgeLine