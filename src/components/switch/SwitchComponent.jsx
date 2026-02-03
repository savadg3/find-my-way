import React from 'react'
import Switch from 'rc-switch';
import 'rc-switch/assets/index.css'; 

const SwitchComponent = ({ defaultChecked, checked, onChange }) => {
    return (
        <div>
            <Switch checked={checked} defaultChecked={defaultChecked} onChange={onChange} />
        </div>
    )
}

export default SwitchComponent