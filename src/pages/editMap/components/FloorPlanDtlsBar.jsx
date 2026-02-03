import React, { useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import PrimaryBtn from '../../../components/buttons/PrimaryBtn'

const FloorPlanDtlsBar = ({ selectedImage, setSelectedImage, onSubmit }) => {

    const navigate = useNavigate()

    const ref = useRef()

    const onSelectFile = (e) => {
        const pic = e.target.files[0]
        if (!pic) return

        setSelectedImage(URL.createObjectURL(pic))

    }

    return (
        <div className='p-3 bg-red-50 w-72 h-72' >
            <p>Add Floor</p>
            <PrimaryBtn label='Select image' onClick={() => ref.current.click()} />
            <input hidden type='file' ref={ref} onChange={onSelectFile} />
            <PrimaryBtn onClick={onSubmit} label='Submit' containerClassName='mt-5' />
        </div>
    )
}

export default FloorPlanDtlsBar

