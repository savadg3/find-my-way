import React from 'react';
import ReactDOM from 'react-dom/client';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import '@stripe/stripe-js';
import { environmentaldatas } from './constant/defaultValues';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import App from './App.jsx';
import reportWebVitals from './reportWebVitals';
import 'bootstrap/dist/css/bootstrap.min.css';
// import setupInterceptors from './helpers/apiErrorHandler';

const { stripe_link } = environmentaldatas 

/* Live stripe */
// const stripePromise = loadStripe('pk_live_51OdhWmFhAySQ56kxodp3bOjvuiFWTdvlNWOU9t1NKFQ1ES1MquIG0YncgH1MT2D5c24zOt7sJH6aOKCx4dj9PtAq00VZHSwnwo');
/* Demo stripe */
// const stripePromise = loadStripe('pk_test_51NfzpSEm0mCpznqQw3lNNjH4pTo27YbciL0lCsv1UWzcZmIVmK8hHoLURk8ILxMDYdCHq1nl2KPyklPsWo6J36NO00qxYsHUpL');
const stripePromise = loadStripe(stripe_link);

const appearance = {
  theme: 'stripe',
};
// const options = {
//   clientSecret:'seti_1Ofi2DEm0mCpznqQtTGCRlpS_secret_PUhRNdCfDl12Zeih2dFI7m166pfogxX',
//   appearance
// };
// setupInterceptors();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Elements stripe={stripePromise}  >
      <App />
    </Elements>

  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
