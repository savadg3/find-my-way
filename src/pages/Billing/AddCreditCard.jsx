import React, { useState } from 'react';
import { Card, CardBody, Button, Label, Row, Col, Input, InputGroup, InputGroupText } from 'reactstrap';
import { FaCreditCard } from 'react-icons/fa';
import { AiOutlineInfoCircle } from 'react-icons/ai';
import { Link } from 'react-router-dom';

import './billing.css'



const AddCreditCard = () => {

    const [expiry, setExpiry] = useState('');

    const handleExpiryChange = (event) => {
        const { value } = event.target;
        // Check if the value matches the pattern MM / YY
        if (/^\d{0,2}(\s*\/\s*)?\d{0,2}$/.test(value)) {
            setExpiry(value);
        } else if (value === '' || value === ' ' || value === '/') {
            // Allow clearing the field and handling single character deletions
            setExpiry(value.replace(/[\s/]/g, ''));
        }
    };

    const formatExpiry = () => {
        const cleanedExpiry = expiry.replace(/\s/g, ''); // Remove any spaces
        if (cleanedExpiry.length > 2) {
            // Insert a space between month and year
            return `${cleanedExpiry.slice(0, 2)} / ${cleanedExpiry.slice(2)}`;
        } else if (cleanedExpiry.length > 0) {
            return cleanedExpiry;
        } else {
            return '';
        }
    };

    return (
        <>
            <Card style={{ minHeight: '70vh' }}>
                <CardBody >
                    <div className='d-flex ' style={{ justifyContent: 'center' }}>
                        <form
                            className="av-tooltip tooltip-label-bottom formGroups"
                            style={{ width: "35%" }} >
                            <div className='text-center'>
                                <h5 className='add-credit-card-heading'>Add Credit Card</h5>
                            </div>
                            <Row className='mt-4'>
                                <Col md={12}>
                                    <Label className="form-labels">Card Holder Name</Label>
                                    <Input className="form-control" type="text" />
                                </Col>
                            </Row>
                            <Row className='mt-2'>
                                <Col md={12}>
                                    <Label className="form-labels">Card Number</Label>
                                    <div className='d-flex'>
                                        <div className='input-group-append' style={{ marginRight: "-35px" }}>
                                            <span
                                                className="input-group-text"
                                                style={{
                                                    border: "none",
                                                    backgroundColor: "transparent",
                                                    position: 'relative',
                                                    zIndex: 100
                                                }}
                                            >
                                                <FaCreditCard />
                                            </span>
                                        </div>
                                        <Input className="form-control cardNumberInput" type="text" />
                                    </div>

                                    {/* <InputGroup>
                                        <InputGroupText addonType="prepend">
                                            <FaCreditCard />
                                        </InputGroupText>
                                        <Input type="text" className="form-control"     />
                                    </InputGroup> */}
                                </Col>
                            </Row>
                            <Row className='mt-2'>
                                <Col md={6}>
                                    <Label className="form-labels">Expiry</Label>
                                    <Input
                                        className="form-control expiryInput"
                                        type="text"
                                        placeholder="MM     /     YY"
                                    // value={formatExpiry()}
                                    // onChange={handleExpiryChange}
                                    />
                                </Col>
                                <Col md={6}>
                                    <Label className="form-labels d-flex" style={{ alignItems: 'center' }}>CVV <AiOutlineInfoCircle className='ml-2' style={{ fontSize: '15px' }} /> </Label>
                                    <Input
                                        className="form-control "
                                        type="text"
                                    />
                                </Col>
                            </Row>
                            <Row className='mt-2'>
                                <Col md={12} className='text-center'>
                                    <Link to='/billing/2'>
                                        <Button className="btn btn-primary mt-4">Add Credit Card</Button>
                                    </Link>
                                    <div className='mt-3'>
                                        <Link className=' goBack' to='/billing/1'>GO BACK</Link>
                                    </div>
                                </Col>
                            </Row>
                        </form>
                    </div>
                </CardBody>
            </Card>
        </>
    )
}
export default AddCreditCard;
