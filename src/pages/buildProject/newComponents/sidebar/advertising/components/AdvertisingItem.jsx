import React from 'react'; 
import { BiSolidPencil } from 'react-icons/bi';
import { IoMdClose } from 'react-icons/io';
import { Groupstack } from '../../../../Helpers/constants/constant'

function AdvertisingItem({ advertise, onEdit, onRemove }) {
  return (
    <div className="drag-wrpr mxx-3">
        <div className={`drag-item`} style={{paddingLeft:0}}>
            <div className='magical-words' style={{
                height: '34px',
                width: '34px',
                backgroundColor: '#e5e5e5',
                borderRadius: '4px',
                paddingLeft: '2px',
                paddingTop: '2px'
            }}>
                {Groupstack}
            </div>

            <div>
                <p>{advertise?.banner_name}</p>
            </div>

            <div className="flex-grow-1" /> 

            <div
                className="edit-square magical-words"
                onClick={() => onEdit(advertise)}
            >
                <BiSolidPencil fontSize={15} />
            </div>
        </div>

        <div
            className="ml-2 rounded-circle"
            onClick={() => onRemove(advertise)}
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
  )
}

export default AdvertisingItem