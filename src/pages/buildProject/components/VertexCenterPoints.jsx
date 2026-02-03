import React from 'react'
import { useDrag } from 'react-dnd'

const VertecCenterPoints = ({ mapDivSize, id, idx, point, coordinates }) => {

    const x1 = mapDivSize.width / point.x
    const y1 = mapDivSize.height / point.y
    const x2 = mapDivSize.width / (coordinates[idx + 1] ? coordinates[idx + 1].x : coordinates[0].x)
    const y2 = mapDivSize.height / (coordinates[idx + 1] ? coordinates[idx + 1].y : coordinates[0].y)
    const xa = point.xa ? mapDivSize.width / point.xa : null
    const ya = point.ya ? mapDivSize.height / point.ya : null
    const [{ isDragging }, drag] = useDrag(
        () => ({
            type: 'node',
            item: { type: 'VCP', id, idx: idx, left: mapDivSize.width / point.x, top: mapDivSize.height / point.y },
            collect: (monitor) => ({
                isDragging: monitor.isDragging(),
            }),
        }),
        [idx, point.x, point.y],
    )
    return (
        <div
            ref={drag}
            key={idx}
            // onClick={(e) => pointClickHandler(e, point.key,)}
            style={{ left: xa ?? (x1 + x2) / 2, top: ya ?? (y1 + y2) / 2, borderRadius: 100, }}
            className={`z-30 h-3 w-3 absolute rounded-full -translate-y-1/2 -translate-x-1/2 bg-transparent border-2 border-red-400 cursor-pointer`}
        />
    )
}

export default VertecCenterPoints