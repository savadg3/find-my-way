import React from 'react';
import { useDrag } from 'react-dnd';
import { BiSolidPencil } from 'react-icons/bi';
import { IoMdClose } from 'react-icons/io';
import { BeaconSvg } from '../../../../CustomSvg';
import UndraggedDiv from '../../../../Helpers/modal/UndraggedDiv';

const BeaconItem = ({ beacon, index, onEdit, onRemove }) => {
    const canDrag = !beacon?.positions || beacon?.positions === null;

    const [{ isDragging }, drag] = useDrag({
        type: 'beaconpin',
        item: () => ({ index, id: beacon.enc_id, beacon }),
        canDrag: () => canDrag,
        collect: (monitor) => ({ isDragging: monitor.isDragging() }),
    });

    return (
        <div className="drag-wrpr mxx-3">
            <div className={`drag-item ${canDrag && 'can-drag'}`}>
                <div className="magical-words" ref={drag}>
                    <BeaconSvg color={beacon.beacon_color ?? '#6A6D73'} />
                    <p>
                        {beacon.beacon_name}
                        {beacon?.floor_plan && ` (${beacon.floor_plan})`}
                    </p>
                </div>

                <div className="flex-grow-1" />

                {canDrag && <UndraggedDiv pinName="beacon" />}

                <div
                    className="edit-square magical-words"
                    onClick={() => onEdit(beacon)}
                >
                    <BiSolidPencil fontSize={15} />
                </div>
            </div>

            <div
                className="ml-2 rounded-circle"
                onClick={() => onRemove(beacon, canDrag)}
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

export default BeaconItem; 