import React from 'react';
import { useDrag } from 'react-dnd';
import { BiSolidPencil } from 'react-icons/bi';
import { IoMdClose } from 'react-icons/io';
import { LocationSvg } from '../../../../CustomSvg';
import UndraggedDiv from '../../../../Helpers/modal/UndraggedDiv';

const LocationItem = ({ location, index, onEdit, onRemove }) => {
    const canDrag = !location?.positions || location?.positions === null;

    const [{ isDragging }, drag] = useDrag({
        type: 'LocationPin',
        item: () => ({ index, id: location.enc_id, location }),
        canDrag: () => canDrag,
        collect: (monitor) => ({ isDragging: monitor.isDragging() }),
    });

    return (
        <div className="drag-wrpr mxx-3">
            <div className={`drag-item ${canDrag && 'can-drag'}`}>
                <div className="magical-words" ref={drag}>
                    <LocationSvg color={location.location_color ?? '#6A6D73'} />
                    <p>
                        {location.location_name}
                        {location?.floor_plan && ` (${location.floor_plan})`}
                    </p>
                </div>

                <div className="flex-grow-1" />

                {canDrag && <UndraggedDiv pinName="location" />}

                <div
                    className="edit-square magical-words"
                    onClick={() => onEdit(location)}
                >
                    <BiSolidPencil fontSize={15} />
                </div>
            </div>

            <div
                className="ml-2 rounded-circle"
                onClick={() => onRemove(location, canDrag)}
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

export default LocationItem;