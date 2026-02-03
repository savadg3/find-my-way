import { IoMdClose } from "react-icons/io";
import { Button, Card, CardBody, Col, Label, Modal, ModalBody, Table, ModalHeader, Row } from "reactstrap";
import { additionalSvg, customRound, proSvg } from "../constants/constant";
import { getRequestForDownload } from "../../../../hooks/axiosClient";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import '../../BuildProject.css';
import { useState } from "react";

const UpgradeProModal = ({
    isOpen,
    toggle,
    // totalPinsUsed,
    planDetails,
    setStripeModal,
    projectSettings
}) => {
    return (
        <Modal isOpen={isOpen} toggle={toggle} size='sm' style={{ zIndex: '999999 !important', color: '#000' }} centered>
            <ModalHeader style={{ padding: '25px 25px 15px 25px', fontSize: '1.5rem' }}>
                <div className='d-flex justify-space-between'>
                    <span>
                        Upgrade!
                    </span>
                    <div className='ml-2  rounded-circle payment-close-btn' onClick={() => toggle()} >
                        <IoMdClose fontSize={15} />
                    </div>
                </div>
            </ModalHeader>
            <ModalBody style={{ padding: '0px 32px 32px 32px', fontSize: '0.875rem', fontWeight: '500' }}>
                <Card >
                    {/* <p>You've reached the maximum number of pins for your current plan:</p> */}
                    {/* <ul className='ulStyles' style={{ marginTop: '10px' }}>
                        <li>
                            <span className={`${totalPinsUsed?.used_locations == totalPinsUsed?.total_locations ? 'red' : ''}`}>{totalPinsUsed?.used_locations}</span>/{totalPinsUsed?.total_locations} Location Pins
                        </li>
                        <li>
                            <span className={`${totalPinsUsed?.used_products == totalPinsUsed?.total_products ? 'red' : ''}`}>{totalPinsUsed?.used_products}</span>/{totalPinsUsed?.total_products} Product Pins
                        </li>
                    </ul> */}
                    <p style={{ marginTop: '10px' }}>
                        Unlock the option to add more pins by upgrading.
                        {/* {((planDetails?.plan?.free_expired == 1) && (planDetails?.plan?.basic_expired == 0) && (planDetails?.plan?.additional_expired == 0)) ? 'Please upgrade your plan to increase your total pin limit.' : 'Please purchase additional pins to increase your total pin limit.'} */}
                    </p>

                    <Card className="cardContainer">

                        <CardBody className='greycard'>
                            <div className="svgContainer">
                                {((planDetails?.plan?.free_expired == 1) && (planDetails?.plan?.basic_expired == 0) && (planDetails?.plan?.additional_expired == 0)) ? proSvg : additionalSvg}

                            </div>
                            <h1 style={{ fontSize: '1.5rem', fontWeight: '600' }}>{(planDetails?.plan?.free_expired == 1 && planDetails?.plan?.basic_expired == 0 && planDetails?.plan?.additional_expired == 0) ? 'Pro' : (planDetails?.plan?.free_expired == 1 && planDetails?.plan?.basic_expired == 1 && planDetails?.plan?.additional_expired == 0) ? 'Additional' : 'Additional +'}</h1>
                            <ul className='ulStyles'>
                                <li>
                                    {
                                        (planDetails?.plan?.free_expired == 1 && planDetails?.plan?.basic_expired == 0 && planDetails?.plan?.additional_expired == 0)
                                            ?
                                            `$${customRound(((planDetails?.plan?.basic_cost) - ((planDetails?.plan?.basic_cost) * (planDetails?.plan?.discount / 100))), 2)}`
                                            :
                                            `$${customRound(((planDetails?.plan?.additional_cost) - ((planDetails?.plan?.additional_cost) * (planDetails?.plan?.discount / 100))), 2)}`} / month
                                </li>
                                <li>
                                    {(planDetails?.plan?.free_expired == 1 && planDetails?.plan?.basic_expired == 0 && planDetails?.plan?.additional_expired == 0) ? `${planDetails?.plan?.basic_location_pins}` : `${planDetails?.plan?.additional_location_pins}`}   Additional Location Pins
                                </li>
                                <li>
                                    {(planDetails?.plan?.free_expired == 1 && planDetails?.plan?.basic_expired == 0 && planDetails?.plan?.additional_expired == 0) ? `${planDetails?.plan?.basic_product_pins}` : `${planDetails?.plan?.additional_product_pins}`}  Additional Product Pins
                                </li>
                            </ul>
                        </CardBody>
                        <Button className={` ${(planDetails?.plan?.free_expired == 1) && (planDetails?.plan?.basic_expired == 0) && (planDetails?.plan?.additional_expired == 0) ? 'btn-warning ' : 'btn-successs'}`}
                            onClick={() => {
                                if ((planDetails?.plan?.free_expired == 1) && (planDetails?.plan?.basic_expired == 0) && (planDetails?.plan?.additional_expired == 0) && projectSettings?.status == 0) {
                                    toast.warning('Project is inactive! To upgrade to the pro plan, please activate your project.')
                                } else {
                                    setStripeModal(true)
                                }
                            }
                            }
                        >
                            Proceed to Payment
                        </Button>
                    </Card>
                </Card >
            </ModalBody>
        </Modal>
    )
}

export {
    UpgradeProModal,
}