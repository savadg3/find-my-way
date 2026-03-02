import React from 'react';
import { useDrag } from 'react-dnd';
import { BiSolidPencil } from 'react-icons/bi';
import { IoMdClose } from 'react-icons/io';
import { ChangeSvgColorPassingBE } from '../../../../CustomSvg';
import UndraggedDiv from '../../../../Helpers/modal/UndraggedDiv';

const SafetyItem = ({ safety, index, onEdit, onRemove }) => {
    const canDrag = !safety?.positions || safety?.positions === null;

    const [{ isDragging }, drag] = useDrag({
        type: 'safetypin',
        item: () => ({ index, id: safety.enc_id, safety }),
        canDrag: () => canDrag,
        collect: (monitor) => ({ isDragging: monitor.isDragging() }),
    });

    return (
        <div className="drag-wrpr mxx-3">
            <div className={`drag-item ${canDrag && 'can-drag'}`}>
                <div className="magical-words" ref={drag}>
                    <div dangerouslySetInnerHTML={{ __html: ChangeSvgColorPassingBE(safety?.path, safety?.safety_color) }} />
                    <p>
                        {safety.safety_name}
                        {safety?.floor_plan && ` (${safety.floor_plan})`}
                    </p>
                </div>

                <div className="flex-grow-1" />

                {canDrag && <UndraggedDiv pinName="safety" />}

                <div
                    className="edit-square magical-words"
                    onClick={() => onEdit(safety)}
                >
                    <BiSolidPencil fontSize={15} />
                </div>
            </div>

            <div
                className="ml-2 rounded-circle"
                onClick={() => onRemove(safety, canDrag)}
                style={{
                    backgroundColor: '#E5E5E5',
                    cursor: 'pointer',
                    marginBottom: 8,
                    padding: 4,
                }}
            >
                <IoMdClose fontSize={10} />
            </div>
        </div>
    );
};

export default SafetyItem; 