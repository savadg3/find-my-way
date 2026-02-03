import React from 'react';
import OTPInput from 'react-otp-input';
import "./auth.css";

const OtpComponent = ({ otp, handleOtpChange }) => {


    const renderInput = (inputProps) => (
        <input
            {...inputProps}
            type="number"
            maxLength="1"
            className='code'
        />
    );

    return (
        <div className='row'>
            <div className='col-lg-12 pad-input'>
                <div className="code-container">
                    <OTPInput
                        justifyContent='center'
                        onChange={handleOtpChange}
                        value={otp}
                        numInputs={6}
                        // numInputs={4}
                        isInputNum
                        inputStyle={{ width: '100%', height: '80px' }}
                        containerStyle={{ justifyContent: 'center' }}
                        placeholder='0000'
                        shouldAutoFocus
                        renderInput={renderInput} 
                    />
                </div>
            </div>
        </div>
    );
};

export default OtpComponent;
