import React, { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { BiSolidPencil } from 'react-icons/bi';
import { IoMdClose } from 'react-icons/io';
import { Groupstack } from '../../../../Helpers/constants/constant'; 

const DRAG_TYPE = 'floorItem';

const FloorItem = ({ plan, index, floorsArray, onEdit, onDelete, onReorder, onDropEnd }) => {
    const ref = useRef(null);

    const [{ handlerId }, drop] = useDrop({
        accept: DRAG_TYPE,
        drop: () => onDropEnd(), 
        collect: (monitor) => ({ handlerId: monitor.getHandlerId() }),
        hover(item, monitor) {
            if (!ref.current) return;

            const dragIndex  = item.index;
            const hoverIndex = index;
            if (dragIndex === hoverIndex) return;

            const hoverRect    = ref.current.getBoundingClientRect();
            const hoverMiddleY = (hoverRect.bottom - hoverRect.top) / 2;
            const clientOffset = monitor.getClientOffset();
            const hoverClientY = clientOffset.y - hoverRect.top;

            if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
            if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;
 
            const reordered = [...floorsArray];
            const [moved]   = reordered.splice(dragIndex, 1);
            reordered.splice(hoverIndex, 0, moved);
            onReorder(reordered);
            item.index = hoverIndex;
        },
    });

    const [{ isDragging }, drag] = useDrag({
        type: DRAG_TYPE,
        item: () => ({ index, id: plan.enc_id }),
        collect: (monitor) => ({ isDragging: monitor.isDragging() }),
    });

    drag(drop(ref));

    return (
        <div
            className="drag-wrpr mxx-3"
            style={{ opacity: isDragging ? 0 : 1 }}
            data-handler-id={handlerId}
            ref={ref}
        >
            <div className="drag-item" style={{ padding: '0 4px 0 0' }}>
                <div
                    className="magical-words"
                    style={{
                        height: 34, width: 34,
                        backgroundColor: '#e5e5e5',
                        borderRadius: 4,
                        paddingLeft: 2,
                        paddingTop: 2,
                    }}
                >
                    {Groupstack}
                </div>

                <div>
                    <p>{plan.floor_plan}</p>
                </div>

                <div className="flex-grow-1" />

                <div className="edit-square magical-words" onClick={() => onEdit(plan)}>
                    <BiSolidPencil fontSize={15} />
                </div>
            </div>

            <div
                className="ml-2 rounded-circle"
                onClick={() => onDelete(plan)}
                style={{ backgroundColor: '#E5E5E5', cursor: 'pointer', marginBottom: 8, padding: 4 }}
            >
                <IoMdClose fontSize={10} />
            </div>
        </div>
    );
};

export default FloorItem;