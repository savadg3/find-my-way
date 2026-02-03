import React from 'react'
import { Outlet } from 'react-router-dom'
import BuildProjectSideBar from './components/BuildProjectSideBar'
import './editMap.css'
const EditMap = () => {

    return (
        <div className='main-container' >
            <BuildProjectSideBar />
            <div>
                <Outlet />
            </div>
        </div>
    )
}

export default EditMap