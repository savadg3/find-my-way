import React, { useEffect } from 'react';
import axios from 'axios';
import { NavLink, useNavigate } from "react-router-dom";

const api = axios.create({
    baseURL: 'http://13.55.48.164/api',
});
const ApiErrorHandler = ({ children }) => {
    // const navigate=useNavigate()

    useEffect(() => {
        console.log("Response:",api.interceptors.response);

    const apiInterceptor = api.interceptors.response.use(
      (response) => {
        console.log("Response:", response);
        return response;
      },
      (error) => {
        console.error("Error:", error);
        if (error.response && error.response.status === 403) {
            console.log('Forbidden request detected');
            // navigate('/')
          // Navigate or handle the forbidden request
        }
        return Promise.reject(error);
      }
    );

    return () => {
      // Clean up the interceptor on component unmount
      axios.interceptors.response.eject(apiInterceptor);
    };
  }, [children]);

  return <>{children}</>;
};

export default ApiErrorHandler;