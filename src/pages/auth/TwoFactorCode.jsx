import React, { useEffect, useState } from 'react';
import { Card, Button, CardBody, CardTitle, Spinner } from 'reactstrap';
import { Formik } from 'formik';
import { NavLink, useParams, useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import { postRequest, getRequest } from '../../hooks/axiosClient';
import Hashids from 'hashids';
import OtpComponent from './otp';
import LogoIco from "../../assets/icons/Logo.svg";
import "./auth.css";
import { setCurrentUser, getCurrentUser, encode } from '../../helpers/utils';
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const SignupSchema = Yup.object().shape({
    otp: Yup.string(),
});

const TwoFactorCode = () => {
    const [otp, setOtp] = useState('');
    const navigate = useNavigate();

    const initialFormValues = {
        otp: '',
    };

    const hashids = new Hashids('', 10);
    const { userId } = useParams();
    const id = +hashids.decode(userId)
    const [ip, setIP] = useState('');
    const [loading, setLoading] = useState(false);

    const getData = async () => {
        try {
            const res = await fetch('https://api.ipify.org?format=json');
            const data = await res.json();
            setIP(data.ip);
        } catch (error) {
            console.error('Failed to fetch IP address:', error);
        }
    }

    useEffect(() => {
        getData();
    }, [])

    const handleVerify = async () => {
        setLoading(true)
        try {
            const data = {
                id,
                otp,
                ip_address: ip
            }
            const response = await postRequest('verify-otp', data);
            const loginData = response.response?.data ?? [];
            handleResponse(response, loginData)
        }
        catch (error) {
            console.log(error);
        } finally {
            setLoading(false)
        }
    }

    const handleResponse = (response, loginData) => {
        if (response.type === 2) {
            toast.error(response.errormessage);
        } else if (loginData?.user?.role_id === 3) {
            setCurrentUser(loginData);
            navigate(`/agent-portal/${encode(loginData?.user?.role_id)}/${encode(loginData?.user?.common_id)}`)
        } else if (loginData?.user?.role_id === 2) {
            setCurrentUser(loginData);
            navigate('/dashboard')
        } else {
            setCurrentUser(loginData);
            navigate('/admin')
        }
    }

    const resendCode = async () => {
        try {
            const response = await getRequest(`resend-otp/${id}`);
            toast.success(response.data.message);
        } catch (error) {
            console.log(error);
        }
    }

    const handleOtpChange = (values, setFieldValue) => {
        setFieldValue('otp', values)
        setOtp(values)
    };

    return (
        <div className="justify-content-center align-items-center vertical-center container">
            <div className="row justify-content-center two-factor-row" >
                <div className="col-md-10  align-card-center">
                    <Card className="auth-card">
                        <CardBody>
                            <div className="forms">
                                <div className="img-center-register" >
                                    <img
                                        src={LogoIco}
                                        alt="logo"
                                        className="image-logo"
                                    />
                                </div>
                                <CardTitle className=" text-center" style={{ marginBottom: ' 10.52px' }}>
                                    <h5
                                        style={{
                                            color: "#1D1D1B",
                                            fontSize: "19.64px",
                                            fontWeight: 'bold'
                                        }}
                                    >
                                        Email two factor authentication
                                    </h5>
                                </CardTitle>
                                <p className='text-center f-16'>Your verification code has been sent to
                                    <span style={{ color: "#26a3db" }}>{getCurrentUser()?.user?.mobile ? ` *****${getCurrentUser().user.mobile.slice(-4)}` : ''}</span>.
                                    {" "}Please enter it below to login to the dashboard</p>
                                
                                <Formik
                                    initialValues={initialFormValues}
                                    validationSchema={SignupSchema}
                                    onSubmit={(values) => {
                                        handleVerify(values);
                                    }}>
                                    {({ handleSubmit, setFieldValue }) => (
                                        <form onSubmit={handleSubmit}>
                                            <OtpComponent setOtp={setOtp} otp={otp} handleOtpChange={(e) => handleOtpChange(e, setFieldValue)} />
                                            <div className="row  ">
                                                <div className="col-lg-12 col-md-12 col-12 text-center ">
                                                    <Button className="btn btn-primary" type="submit" disabled={(otp?.length !== 6) || loading} htmlType="submit">
                                                        {loading ? (
                                                            <>
                                                                <p style={{ opacity: '0', position: 'relative' }}>Verify and Log In</p>
                                                                <Spinner
                                                                    className="ml-2 spinner-style"
                                                                    color="light"
                                                                />

                                                            </>
                                                        ) : 'Verify and Log In'}
                                                    </Button>
                                                </div>
                                            </div>
                                            <div className="row mt-3">
                                                <div className="col-lg-12 col-md-12 col-12 pad-input text-center pl-0" role="button" tabIndex={0}  >
                                                    <p className='f-16'><span className='f-w-600 resend' style={{ cursor: 'pointer' }} onClick={resendCode}>Resend verification code</span></p>
                                                </div>
                                            </div>
                                            <div style={{ fontSize: '0.875rem', textAlign: 'center' }} className=' mt-3 pb-3'>
                                                <NavLink className="forgot-pass-link " to="/">
                                                    <span className='link'>Back to Log In</span>
                                                </NavLink>
                                            </div>
                                        </form>
                                    )}
                                </Formik>
                            </div>
                        </CardBody>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default TwoFactorCode;
