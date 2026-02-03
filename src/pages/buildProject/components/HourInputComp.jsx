import React, { useState } from 'react'
import SwitchComponent from '../../../components/switch/SwitchComponent'

const HourInputComp = ({
    day, hourData,
    setHourData,
    setIsError, setFieldValue,
    setIsDirty
}) => {
    let hours = { ...hourData }

    const [alertVisible, setAlertVisible] = useState(''); // State for showing/hiding alert

    const onToggle = (e) => {
        console.log(hours, day);
        setFieldValue(`${day.toLowerCase()}`, hours[day])
        setIsDirty(true)
     

        if (!hours[day]) {
            hours[day] = { from: '09:00:00', to: '17:30:00' };
            setFieldValue(`${day.toLowerCase()}`, hours[day])

        } else {
            setAlertVisible();
            setFieldValue(`${day.toLowerCase()}`, "undefined")
            delete hours?.[day]
            setIsError(false)

        }
        setHourData({ ...hours });
    }

    const parseTimeToMinutes = (time) => {
        if (!time) {
            return 0;
        }
        const [hours, minutes] = time.split(':').map(Number);
        return hours * 60 + minutes;
    };

    const onValueChange = (value, type) => {
        hours[day] = hours[day] ?? {}
        hours[day][type] = value ?? '';
        setFieldValue(`${day.toLowerCase()}_${type}`, hours[day][type]);
        setIsDirty(true)
        // Check if both 'from' and 'to' times are defined
        if (hours[day]?.from && hours[day]?.to) {
            const fromMinutes = type === 'to' ? parseTimeToMinutes(hours[day].from) : parseTimeToMinutes(value);
            const toMinutes = type === 'to' ? parseTimeToMinutes(value) : parseTimeToMinutes(hours[day].to);
            if (toMinutes <= fromMinutes) {
                setIsError(true)
                setAlertVisible('End time must be greater than start time.');
            } else {
                setIsError(false)
                setAlertVisible();
            }
        }
        setHourData({ ...hours })
    }

    return (<div style={{ marginBottom: '10px' }}>
        <div className='hour-wrpr' >
            <SwitchComponent checked={hours[day] != undefined} onChange={(e) => onToggle(e)} />
            <p style={{ width: 70, fontWeight: '400' }} >{day}</p>
            {hours[day] != undefined ? (
                <><div className='row'>
                    <div className='col-sm-12'>
                        <div className='row' >
                            <div className='col-sm-6' style={{ paddingLeft: '10px', paddingRight: '0px' }}>
                                <input style={{ marginRight: 4, appearance: 'none', padding: '4px !important' }} className='form-control hr-input' value={hourData?.[day]?.from ?? ''} type='time' onChange={(e) => onValueChange(e.target.value, 'from')} />
                            </div>
                            <div className='col-sm-6' style={{ paddingLeft: '0px', paddingRight: '10px' }}>
                                <p style={{ fontWeight: '400' }}>To</p>
                                <div className='form-group'>
                                    <input
                                        style={{ marginLeft: 4, padding: '4px !important' }}
                                        className='form-control hr-input' value={hourData?.[day]?.to ?? ''}
                                        type='time' title=""
                                        onChange={(e) => onValueChange(e.target.value, 'to')}
                                    /><br></br>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                </>
            ) : (
                <div style={{ gap: 0, width: '70%' }} >
                    <input className='form-control' value={'Closed'} readOnly style={{ background: '#red !important' }}  onKeyDown={(e) => {
                                                                if (e.key === 'Enter') {
                                                                    e.preventDefault(); 
                                                                }
                                                            }}/>
                </div>
            )}
        </div >
        {alertVisible && (
            <div className='row'>

                <div className='col-sm-12 '>
                    <div className="text-danger float-right">{alertVisible}</div>
                </div>
            </div>
        )}
    </div>
    )
}

export default HourInputComp