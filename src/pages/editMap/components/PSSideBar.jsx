import { Field, Formik } from 'formik'
import React, { useEffect, useRef, useState } from 'react'
import CheckIco from '../../../assets/icons/check.png'
import BoderThickIco from '../../../assets/icons/border_thickness.png'
import DropDown from '../../../components/constants/DropDown'
import { Button } from 'bootstrap'
import ColorSelectorComp from './ColorSelectorComp'
const PSSideBar = () => {

    const [projectSettings, setProjectSettings] = useState({})

    const logoSelectRef = useRef()

    const getProjectSettings = async () => {
        const data = localStorage.getItem('projectSettings')
        if (!data) return
        setProjectSettings(JSON.parse(data))
    }

    const onSubmit = (values) => {
        const logo = URL.createObjectURL(values.logo)
        localStorage.setItem('projectSettings', JSON.stringify({ ...values, logo }))

    }
  

    const BorderWidthComp = ({ label, value, onChange, name }) => {

        return (
            <div className='color-input-wrpr pt-2' >
                <p className='label color-label' >{label}</p>
                <div className=' input-wrpr' >
                    <img src={BoderThickIco} alt='' className='color-picker' style={{ backgroundColor: value }} />
                    {/* <input type='color' value={value} style={{ position: 'absolute' }} name={name} ref={selectorRef} onChange={onChange} hidden /> */}
                    <input
                        value={value}
                        onChange={onChange}
                        // className="form-control"
                        type="number"
                        name={name}
                    />
                </div>
            </div>
        )
    }


    useEffect(() => {
        getProjectSettings()
    }, [])


    return (
        <div className='ps-sideb-bar' >
            <h1 className='p-3'>Project Settings</h1>
            {/* <hr /> */}

            <div className='sub' >


                <Formik
                    initialValues={{...projectSettings}}
                    // validationSchema={{}}
                    onSubmit={onSubmit}
                    enableReinitialize
                >
                    {({
                        errors,
                        values,
                        touched,
                        handleSubmit,
                        handleChange,
                        setFieldValue
                    }) => (
                        <form
                            className="av-tooltip tooltip-label-bottom formGroups"
                            onSubmit={handleSubmit}
                        >
                            <h2 style={{ marginTop: 0 }} >Details</h2>
                            <p className='label' >Name</p>
                            <Field
                                className="form-control"
                                type="text"
                                placeholder="Enter Name"
                                name="name"
                                autoComplete="off"
                                value={values?.name}
                                onChange={handleChange}
                            />

                            <div className='pl-heading' >
                                <p className='label' >Project Logo</p>
                                {values.logo && <img src={CheckIco} />}
                            </div>
                            <div className='select-logo' onClick={() => logoSelectRef.current.click()} >
                                <p>+</p>
                            </div>
                            <input type='file' ref={logoSelectRef} hidden onChange={handleChange} value={values.logo} name='logo' />

                            <h2>Filter Categories</h2>
                            <p className='label' >Location Tags</p>
                            <DropDown
                                options={[{ id: 1, value: 'Retail', name: 'Retail' }, { id: 2, name: 'Clothing', value: 'Clothing' },]}
                                multi
                                onChange={(values) => setFieldValue('locationTags', () => values.map(a => a.name))}
                            />
                            <p className='label' >Product Tags</p>
                            <DropDown
                                options={[{ id: 1, name: 'Tools', value: 'Tools' }, { id: 2, name: 'Snacks', value: 'Snacks' },]}
                                multi
                                onChange={(values) => setFieldValue('productTags', () => values.map(a => a.name))}
                            />

                            <h2>Default Styles</h2>
                            {[{ label: 'Map Background Colour', name: 'mbc' },
                            { label: 'Building Fill Colour', name: 'bfc' },].map(item => <ColorSelectorComp label={item.label} value={values[item.name] ?? '#320101'} name={item.name} onChange={handleChange} />)}
                            <BorderWidthComp label='Building Border Thickness' value={values['bbt'] ?? 0} name={'bbt'} onChange={handleChange} />
                            {/* // {label: , name: 'mbc' }, */}
                            {[{ label: 'Building Border Colour', name: 'bbc' },
                            { label: 'Inactive Pin Colour', name: 'ipc' },
                            { label: 'Active Starting Pin Colour', name: 'aspc' },
                            { label: 'Active Destination Pin Colour (Location)', name: 'adpcl' },
                            { label: 'Active Destination Pin Colour (Product)', name: 'adpcp' },
                            { label: 'QR Code Beacon Primary Colour', name: 'qbpc' },
                            { label: 'Amenity Pin Colour', name: 'apc' },
                            { label: 'Safety Pin Colour', name: 'spc' },
                            { label: 'Level Change Pin Colour', name: 'lpc' },
                            { label: 'Navigation Path Colour', name: 'npc' },
                            ].map(item => <ColorSelectorComp label={item.label} value={values[item.name] ?? '#320101'} name={item.name} onChange={handleChange} />)}

                           
                        </form>
                    )}
                </Formik>



            </div>
        </div>
    )
}

export default PSSideBar