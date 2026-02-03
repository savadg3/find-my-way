import React from 'react'

const PrimaryBtn = ({ label, onClick, containerClassName }) => {
    return (
        <div
            className={'p-2 text-white bg-primary2 rounded cursor-pointer ' + containerClassName}
            onClick={onClick}
        >
            {label}
        </div >
    )
}

export default PrimaryBtn