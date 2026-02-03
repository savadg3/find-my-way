import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import SettingsIco from '../../../assets/icons/settings.svg'
import FloorIco from '../../../assets/icons/floorplan.svg'
const BuildProjectSideBar = () => {

    const { pathname } = useLocation()
    const navigate = useNavigate()

    const IconBtn = ({ path, icon }) => {
        const selected = path.split('/')[2] == pathname.split('/')[2]
        return (
            <div onClick={() => navigate(path)} className={`icon-btn ${selected && 'selected'}`} >
                <img src={icon} style={{fill:'red'}} />
            </div>
        )
    }

    return (
        <div className='bp-sideBar' >
            <IconBtn path='/edit-map' icon={SettingsIco} />
            <IconBtn path='/edit-map/add-floor' icon={FloorIco} />
        </div>
    )
}

export default BuildProjectSideBar