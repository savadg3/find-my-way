import React, { useEffect } from 'react'
import { DragPreviewImage, useDrag } from 'react-dnd'

const NodeComp = ({ idx, pointClickHandler, node, mapDivSize, selKey, shortestNodes }) => {
    const [{ isDragging }, drag] = useDrag(
        () => ({
            type: 'node',
            item: { id: node.key, left: mapDivSize.width / node.x, top: mapDivSize.height / node.y },
            collect: (monitor) => ({
                isDragging: monitor.isDragging(),
            }),
        }),
        [node.key, node.x, node.y],
    )

    return (
        <div>
            <div
                ref={drag}
                key={idx}
                onClick={(e) => pointClickHandler(e,node.key)}
                style={{ top: mapDivSize.height / node.y, left: mapDivSize.width / node.x, borderRadius: 100, }}
                className={`z-10 h-3 w-3 absolute rounded-full -translate-y-1/2 -translate-x-1/2 bg-transparent border-2 ${selKey == node.key ? 'border-yellow-400' : shortestNodes.includes(node.key) ? 'border-primary1' : 'border-primary2'} cursor-pointer`}
            />
            <p
                className='absolute text-xs'
                style={{ top: (mapDivSize.height / node.y) + 5, left: mapDivSize.width / node.x, }}
            >{node.key}</p>
        </div>
    )
}

export default NodeComp
