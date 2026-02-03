import React, { useEffect, useState } from 'react'
import {
    Row,
    Card,
    Col,
    Modal,
    ModalBody,
} from "reactstrap";
import "./auth.css";
import { CountdownCircleTimer } from 'react-countdown-circle-timer';

const TimeoutModal = ({ modal, setModal, setLoginAttempts, setShowTime, showTime }) => {

    const [seconds, setSeconds] = useState(0);

    const TimerRun = () => {
        const timer = setInterval(() => {
            setSeconds(prevSeconds => {
                if (prevSeconds === 0) {
                    clearInterval(timer);
                    setShowTime(false)
                    setLoginAttempts(0)
                    setModal(false);
                    setSeconds(0)
                }
                return prevSeconds > 0 ? prevSeconds - 1 : 0;
            });
        }, 1000);
        return () => clearInterval(timer);
    }

    useEffect(() => {
        if (showTime) {
            TimerRun();
            setSeconds(30)
        }
    }, [showTime]);


    return (
        <>
            <Modal isOpen={modal} toggle={() => setModal(false)} style={{ zIndex: '999999 !important', maxWidth: '320px' }}  centered backdrop="static">
                <ModalBody style={{ height: 'auto' }}>
                    <Card >
                        <Row>
                            <Col style={{ textAlign: '-webkit-center' }}>
                                <div className='mb-3'>
                                    <span className='f-w-600 '>
                                        Too many attempts. Try again in
                                    </span>
                                </div>
                                <CountdownCircleTimer
                                    isPlaying={showTime}
                                    duration={180}
                                    colors={['#26a3db']}
                                    colorsTime={[30]}
                                    onComplete={() => ({ shouldRepeat: true, delay: 1 })}
                                    size={100}
                                >
                                    {({ remainingTime }) => (
                                        <div className="text-center">
                                            <span className="timer">{remainingTime} sec</span>
                                        </div>
                                    )}
                                </CountdownCircleTimer>
                            </Col>
                        </Row>
                    </Card>
                </ModalBody>
            </Modal>
        </>
    )
}
export default TimeoutModal;