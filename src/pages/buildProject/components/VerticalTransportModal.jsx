
import React, { useEffect } from 'react';
import {
    Card,
 Row, Col,
    Input,
    Modal,
    ModalBody,
} from 'reactstrap';
import { IoMdClose } from 'react-icons/io';

const VerticalTransportModal = ({
    setModal, modal, toggle,
    verticalTransport,
    ChangeSvgColorPassingBE,
    onSelectVerticalTransport,
    selFloorData,
    destinationData,
    currentFloorVTS,
    handleWheelchairCheck,
    isWheechairChecked,
    close,
    allVerticalTransports,
    handleShowtransportsInModal
}) => {

    useEffect(()=>{
        handleShowtransportsInModal(isWheechairChecked)
    },[modal,isWheechairChecked])

    return (
        <>
            <Modal isOpen={modal} toggle={toggle} size='md' style={{ zIndex: '999999 !important', minWidth: '600px' }} backdrop='static' centered>
                <span className='modal-close-icon' >
                    <div onClick={() => {
                        close()
                    }} className='ml-4 p-1 rounded-circle' style={{ backgroundColor: '#E5E5E5', cursor: 'pointer', }} >
                        <IoMdClose style={{ fontSize: '10px' }} />
                    </div></span>
                <ModalBody >
                    <Card >
                        <form
                            className="av-tooltip tooltip-label-bottom formGroups text-center"
                        >
                            <Row className=''>
                                <Col sm={12}  >
                                    <h5 className=" mb-2" style={{ fontSize: '18px', fontWeight: '700' }}>Your destination is on {destinationData?.floor_plan}
                                    </h5>
                                    <p style={{ color: '#000', fontSize: '14px', fontWeight: '500' }}>Please select your preferred vertical transport method to reach your destination.</p>
                                    <div className='d-flex justify-content-center mt-3'>
                                        {verticalTransport?.length > 0 &&
                                            verticalTransport?.map((item) => (
                                                <div className={`card icon-div mr-5 ${item?.noAccess && 'manageOpacity'}`}
                                                    key={item?.vtd_id}
                                                    onClick={() => {
                                                        onSelectVerticalTransport(item,allVerticalTransports);
                                                    }}
                                                >
                                                    <div dangerouslySetInnerHTML={{ __html: ChangeSvgColorPassingBE(item?.path, "#374046") }} />
                                                    <span style={{ color: '#000', fontSize: '14px', marginTop: '3px' }}>{item?.name}</span>
                                                </div>
                                            ))}
                                    </div>
                                </Col>
                            </Row>
                            <Row className='mt-4 text-start'>
                                <Col md={12}>
                                    <div className='row'>
                                        <div className='col-sm-12 text-center'>
                                            <div className="checkbox-wrapper">
                                                <div className="d-flex justify-content-center f-12">
                                                    <span className='mr-4' style={{ fontSize: "1rem" }}> Accessibile access required</span>
                                                    <Input type="checkbox"
                                                        name='is_wheelchair'
                                                        checked = {isWheechairChecked}
                                                        style={{ cursor: 'pointer' }}
                                                        onChange={(e) => {
                                                            handleWheelchairCheck(e)
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Col>
                            </Row>
                        </form >
                    </Card >
                </ModalBody >
            </Modal >
        </>
    );
}

export default VerticalTransportModal;
