import React, { useEffect, useState } from 'react';
import { Button, Col, Label, Modal, ModalHeader, ModalBody, Row, Table } from 'reactstrap';
import { environmentaldatas } from '../../constant/defaultValues';
import CustomDropdown from '../common/CustomDropDown';
import CustomDropdown2 from '../common/CustomDropDown2';
import CommonDropdown from '../common/CommonDropdown';

const baseURL = environmentaldatas;

const ProjectLinksModalComponent = ({ modal, toggle, setModal, panel }) => {

    const [options, setOptions] = useState([]);
    const [value, setValue] = useState({});

    useEffect(() => {
        if (modal == true) {
            setOptions((prev) => {
                return panel?.beacon_data.map((el) => ({ ...el, value: el.enc_id, label: el.beacon_name }))
            });
        }


    }, [modal])


    const onChangeBeacon = (e) => {
        setValue(e) 
    }


    return (
        <Modal isOpen={modal} toggle={() => { toggle(); setOptions([]); setValue({}) }} size='lg' style={{ zIndex: '999999 !important' }} centered>
            <ModalHeader toggle={toggle} style={{ padding: '33px 32px 0px 32px' }}>
                Project Links
            </ModalHeader>
            <ModalBody className="modalbody-padding" >
                <Row className='mt-2' >
                    <Col md={6}>

                        <Label className='form-labels'>Select QR Code Beacon</Label>
                        <CommonDropdown name='agent' options={options} value={Object.keys(value).length > 0 ? value : null} onChange={(e) => { onChangeBeacon(e) }} />


                    </Col>
                </Row>
                <Row className='mt-3'>
                    <Col md={12}>
                        <div className="table-responsive">
                            <Table className="custom-table">
                                <thead>
                                    <tr>
                                        <th className='theadStyle'>Link</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(value?.qr_link) ? (
                                        <tr >
                                            <td className='d-flex'>
                                                <div className='input-group' style={{ padding: '0px ', border: 'none' }}>
                                                    <input type="text" className="form-control" placeholder="Enter project link" readOnly value={value?.qr_link} />
                                                    < div className='input-group-append'>
                                                        <button className="btn btn-sm buttoninfo " onClick={() => { navigator.clipboard.writeText(value?.qr_link) }}>Click here to copy link</button>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>

                                    ) : (
                                        <tr>
                                            <td colSpan="3">No links are available. Please select a QR Code Beacon.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </Table>
                        </div>
                    </Col>
                </Row>
                <Row className="mt-3 mb-3">
                    <Col md={12}>
                        <Button color="secondary" className="btn btnCancel float-right" onClick={() => { toggle(); setOptions([]); setValue({}) }}>
                            Cancel
                        </Button>
                    </Col>
                </Row>
            </ModalBody>
        </Modal>

    )
}

export default ProjectLinksModalComponent;