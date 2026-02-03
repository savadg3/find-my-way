import React, { useEffect } from 'react';
import { Row, Card, Col, Button } from 'reactstrap';
import LogoIco from "../assets/icons/Logo.svg";
import { getCurrentUser,encode } from '../helpers/utils';
import { NavLink, useNavigate } from "react-router-dom";

const Error = () => {
    const role = getCurrentUser()?.user?.role_id;
    const user = getCurrentUser();

    const navigate = useNavigate();

    useEffect(() => {
        document.body.classList.add('background');
        document.body.classList.add('no-footer');

        return () => {
            document.body.classList.remove('background');
            document.body.classList.remove('no-footer');
        };

    }, []);

    const goHome = () => {
        if (role) {
            switch (role) {
                case 1:
                  navigate("/admin");
                  break;
                case 2:
                  navigate("/dashboard");
                  break;
                case 3:
                  navigate(`/agent-portal/${encode(user?.user?.role_id)}/${encode(user?.user?.common_id)}`);
                  break;
                default:
                  break;
              }
        } else {
            navigate("/");
        }
       

    }

    return (
        <>
            <div className="justify-content-center align-items-center vertical-center container">
                <div className="row" style={{ width: "100%" }}>
                    <div className=" ">
                        <Row className="h-100">
                            <Col xxs="12" md="6" className="mx-auto my-auto">
                                <Card className="auth-card magical-words ">
                                    <div className="position-relative image-side " />
                                    <div className="err-form">
                                        <div className='magical-words mb-3'>
                                            <img
                                                src={LogoIco}
                                                alt="logo"
                                                className='image-logo'
                                            />
                                        </div>


                                        <h1 className=" f-w-600  magical-words " style={{fontSize:'2.5rem'}} >404 Error</h1>
                                        <p className="mb-0 text-muted text-small mb-0 magical-words" style={{fontSize:'0.875rem'}}>
                                            We can't find the page you're looking for.
                                        </p>
                                        <div className='magical-words mt-4'>
                                            <Button className='btn btn-primary ' onClick={goHome}>
                                                Back to home
                                            </Button>
                                        </div>

                                    </div>
                                </Card>
                            </Col>
                        </Row>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Error;
