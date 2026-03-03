import React from 'react'; 
import { BiSolidPencil } from 'react-icons/bi';
import { IoMdClose } from 'react-icons/io';
import { ChangeSvgColorPassingBE } from '../../../../CustomSvg'; 

const VerticalItem = ({ vertical, onEdit, onRemove }) => { 

    return (
        <div className="drag-wrpr mxx-3">
            <div className={`drag-item `}>
                <div className="magical-words">
                    <div dangerouslySetInnerHTML={{ __html: ChangeSvgColorPassingBE(vertical?.path, vertical?.vt_color) }} />
                    <p>
                        {vertical.vt_name}
                        {vertical?.floor_plan && ` (${vertical.floor_plan})`}
                    </p>
                </div>

                <div className="flex-grow-1" />

                <div
                    className="edit-square magical-words"
                    onClick={() => onEdit(vertical)}
                >
                    <BiSolidPencil fontSize={15} />
                </div>
            </div>

            <div
                className="ml-2 rounded-circle"
                onClick={() => onRemove(vertical)}
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

export default VerticalItem; 