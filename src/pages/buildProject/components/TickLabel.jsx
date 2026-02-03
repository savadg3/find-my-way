import React from 'react'
import { Label } from 'reactstrap'
import CheckIco from '../../../assets/icons/check.png'
const TickLabel = ({ label, showTick }) => {
    return (
        <div className='pl-heading mt-2' >
            <Label for="exampleName" className="form-labels">{label}</Label>
            {showTick && <img src={CheckIco} alt='' style={{marginTop:'0px !important'}}/>}
        </div>
    )
}

export default TickLabel