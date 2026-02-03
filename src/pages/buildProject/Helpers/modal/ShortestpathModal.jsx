import { Modal, ModalBody, Button, Row, Col, Label, Spinner } from 'reactstrap';


import React from 'react'

function ShortestpathModal({pathModal,TransportModaltoggle,closeTransportModal,submitTransportModal}) {
  return (
    <Modal isOpen={pathModal} toggle={TransportModaltoggle} style={{ zIndex: '999999 !important' }} backdrop={'static'} centered>      
        <ModalBody style={{ padding: '30px',textAlign: "center", fontWeight: 600 }} className='confirm-to-go-back'>
            <p>
            The chosen vertical transport cannot reach the destination. However, we have found the shortest route. Would you like to proceed?
            </p>
            <div className='d-flex justify-content-center gap-3 mt-3'> 
                
                <Button
                className="btn btn-primary cancel-button m-auto" 
                block
                onClick={closeTransportModal}
                >
                No
                </Button>

                <Button
                className="btn btn-primary m-auto" 
                block
                onClick={submitTransportModal}
                >
                Yes
                </Button>
            </div> 
        </ModalBody >
    </Modal >
  )
}

export default ShortestpathModal
