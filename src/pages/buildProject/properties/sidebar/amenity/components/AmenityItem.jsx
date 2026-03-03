import React from 'react';
import { useDrag } from 'react-dnd';
import { BiSolidPencil } from 'react-icons/bi';
import { IoMdClose } from 'react-icons/io';
import { AmminitySvg, ChangeSvgColorPassingBE } from '../../../../CustomSvg';
import UndraggedDiv from '../../../../Helpers/modal/UndraggedDiv';

const AmenityItem = ({ amenity, index, onEdit, onRemove }) => {
    const canDrag = !amenity?.positions || amenity?.positions === null;

    const [{ isDragging }, drag] = useDrag({
        type: 'amenitypin',
        item: () => ({ index, id: amenity.enc_id, amenity }),
        canDrag: () => canDrag,
        collect: (monitor) => ({ isDragging: monitor.isDragging() }),
    });

    return (
        <div className="drag-wrpr mxx-3">
            <div className={`drag-item ${canDrag && 'can-drag'}`}>
                <div className="magical-words" ref={drag}>
                    <div dangerouslySetInnerHTML={{ __html: ChangeSvgColorPassingBE(amenity?.path, amenity?.amenity_color) }} />
                    <p>
                        {amenity.amenity_name}
                        {amenity?.floor_plan && ` (${amenity.floor_plan})`}
                    </p>
                </div>

                <div className="flex-grow-1" />

                {canDrag && <UndraggedDiv pinName="amenity" />}

                <div
                    className="edit-square magical-words"
                    onClick={() => onEdit(amenity)}
                >
                    <BiSolidPencil fontSize={15} />
                </div>
            </div>

            <div
                className="ml-2 rounded-circle"
                onClick={() => onRemove(amenity, canDrag)}
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

export default AmenityItem; 