import React, { useEffect, useState, useRef } from 'react';
import { PaymentElement, CardElement, CardCvcElement, CardExpiryElement, CardNumberElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { getRequest, postRequest } from '../../hooks/axiosClient';
import { getCurrentUser, getIP } from '../../helpers/utils';
import {
  Row,
  Card,
  Label,
  Col,
  CardBody,
  Button, Modal, ModalBody, Spinner, Input
} from "reactstrap";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loader from '../common/Loader';
import axios from 'axios';

const PaymentForm = ({
  stripeModal,
  toggleStripe,
  planDetails,
  project_id,
  activeTab,
  onSideBarIconClick,
  from,
  handlePublish,
  fromStatus,
  statusChange,
  getCardDetails,
  loadingPublish,
  setLoadingPublish,
  fromUpgrade,
  getProjectlist,
  setUpgradeProModal

}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [clientSecret, setClientSecret] = useState(null);
  const [setupId, setSetupId] = useState(null);
  const cardNumberRef = useRef(null);
  const cardExpiryRef = useRef(null);
  const cardcvcRef = useRef(null);
  const [errors, setErrors] = useState({
    cardNumber: '',
    cardExpiry: '',
    cardCvc: '',
  });
  const [isUpdate, setIsUpdate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isAccepted, setIsAccepted] = useState(false);



  const customerId = getCurrentUser()?.user?.common_id;

  const getIntentKey = async () => {
    try {

      const request = getRequest(`setup-intent/${customerId}`)
      const response = await request;
      // clientSecret = response?.data?.client_secret;
      setClientSecret(response?.data?.client_secret);
      setSetupId(response?.data?.setup_id);
      // stripe.retrieveSetupIntent(clientSecret).then(({ setupIntent }) => {
      //   console.log(setupIntent,'paymentIntent')
      //   switch (setupIntent.status) {
      //     case "succeeded":
      //       // setMessage("Payment succeeded!");
      //       break;
      //     case "processing":
      //       // setMessage("Your payment is processing.");
      //       break;
      //     case "requires_payment_method":
      //       // setMessage("Your payment was not successful, please try again.");
      //       break;
      //     default:
      //       // setMessage("Something went wrong.");
      //       break;
      //   }
      // });

    } catch (error) {
      console.log(error)
    }
  }
  // const [ip, setIP] = useState('');

  // const getIP = async () => {
  //   const res = await axios.get('https://geolocation-db.com/json/')
  //   console.log(res.data);
  //   setIP(res.data.IPv4)
  //   console.log(ip)

  // }

  useEffect(() => {
    if (stripeModal == true) {
      setLoading(false)
      setIsAccepted(false);
      getIntentKey();
      setIsUpdate(false);
      // getIP();

      if (cardNumberRef.current) {
        cardNumberRef.current.focus();
      }
    }

  }, [stripeModal]);

  useEffect(() => {
    // if (cardNumberRef?.current) {
    //   elements.getElement(CardNumberElement)?.update({ value: planDetails?.card.last4 });
    // }
    // if (cardExpiryRef?.current) {
    //   elements.getElement(CardExpiryElement)?.update({ value: `${planDetails?.card?.exp_month}/${planDetails?.card?.exp_year} `});
    // }


  }, [cardcvcRef, cardExpiryRef, cardNumberRef]);
  // useEffect(() => {
  //   if (!clientSecret) {
  //     return;
  //   }
  //   console.log(clientSecret,'clientsecret');

  //   stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
  //     console.log(paymentIntent,'paymentIntent')
  //     switch (paymentIntent.status) {
  //       case "succeeded":
  //         setMessage("Payment succeeded!");
  //         break;
  //       case "processing":
  //         setMessage("Your payment is processing.");
  //         break;
  //       case "requires_payment_method":
  //         setMessage("Your payment was not successful, please try again.");
  //         break;
  //       default:
  //         setMessage("Something went wrong.");
  //         break;
  //     }
  //   });
  // }, []);

  const postPaymentMethod = async (pmid) => {
    setLoading(true)

    const ip = await getIP();

    let data = {
      customer_id: customerId,
      pm_id: pmid,
      setup_id: setupId
    }
    try {
      const request = postRequest(`payment-method`, data)
      const response = await request;
      console.log(response, 'response')
      if (response?.type == 1) {

        if (from == 'billing') {
          toast.success(response?.response?.data?.message);
          getCardDetails();
          toggleStripe();

        } else {
          if (from == 'project' && fromStatus == false && fromUpgrade == false) {
            if (setLoadingPublish) {
              setLoadingPublish(true)
            }
            toast.success(response?.response?.data?.message);
            handlePublish(project_id, planDetails, isAccepted, ip);
            toggleStripe();
            setLoading(false)
          } else if (from == 'project' && fromStatus == true) {
            toast.success(response?.response?.data?.message);
            statusChange(project_id, planDetails, isAccepted, ip);
            setLoading(false);
            // toggleStripe();
          }
          // else if (from == 'project' && (fromUpgrade && fromUpgrade == true)) {
          //   toast.success(response?.response?.data?.message);
          //   postChangePlan(response?.response?.data?.message);

          // }
          else {
            // toast.success(response?.response?.data?.message);

            postChangePlan(response?.response?.data?.message);
          }
        }




      } else {
        console.log('error here');
        // toggleStripe();

        // postChangePlan();

        toast.error(response?.errormessage)
        setLoading(false);

      }

      // postChangePlan();

    } catch (error) {
      console.log(error)
    } finally {
      // setLoading(false)
    }
  }

  const postChangePlan = async (alert) => {
    console.log('is here')
    setLoading(true);

    const ip = await getIP();

    let data = {
      project_id: project_id,
      free_expired: planDetails?.plan?.free_expired,
      basic_expired: planDetails?.plan?.basic_expired,
      additional_expired: planDetails?.plan?.additional_expired,
      is_accepted: isAccepted == true ? 1 : 0,
      ip_address: ip
    }
    try {
      const request = postRequest(`change-plan`, data)
      const response = await request;
      console.log(response, 'response')
      if (response?.type == 1) {
        if (fromUpgrade == true) {
          setLoading(false);
          toggleStripe();
          getProjectlist();
          setUpgradeProModal(false)
        } else {
          onSideBarIconClick(activeTab);
          if (alert) {
            toast.success(alert)
          }
          setLoading(false);
          toggleStripe();
        }

      } else {
        toast.error(response?.errormessage)
        setLoading(false);
      }


    } catch (error) {
      console.log(error)
    } finally {
      // setLoading(false);
      // toggleStripe();


    }
  }


  const handleCardNumberChange = (event) => {
    if (event.error) {
      setErrors((prevErrors) => ({ ...prevErrors, cardNumber: event.error.message }));
    } else {
      setErrors((prevErrors) => ({ ...prevErrors, cardNumber: '' }));
    }
  };

  const handleCardExpiryChange = (event) => {
    if (event.error) {
      setErrors((prevErrors) => ({ ...prevErrors, cardExpiry: event.error.message }));
    } else {
      setErrors((prevErrors) => ({ ...prevErrors, cardExpiry: '' }));
    }
  };

  const handleCardCvcChange = (event) => {
    if (event.error) {
      setErrors((prevErrors) => ({ ...prevErrors, cardCvc: event.error.message }));
    } else {
      setErrors((prevErrors) => ({ ...prevErrors, cardCvc: '' }));
    }
  };


  useEffect(() => {
    if (!elements) {
      console.error("Elements not available.");
      return;
    }
    const cardNumberElement = elements.getElement(CardNumberElement);
    const cardExpiryElement = elements.getElement(CardExpiryElement);
    const cardCvcElement = elements.getElement(CardCvcElement);

    if (cardNumberElement) {
      console.log(cardNumberElement)
      cardNumberElement.on('change', handleCardNumberChange);
    }
    if (cardExpiryElement) {
      cardExpiryElement.on('change', handleCardExpiryChange);
    }
    if (cardCvcElement) {
      cardCvcElement.on('change', handleCardCvcChange);
    }

    // Detach event listeners on component unmount
    return () => {
      if (cardNumberElement) {
        cardNumberElement.off('change', handleCardNumberChange);
      }
      if (cardExpiryElement) {
        cardExpiryElement.off('change', handleCardExpiryChange);
      }
      if (cardCvcElement) {
        cardCvcElement.off('change', handleCardCvcChange);
      }
    };
  }, [elements]);

  const handleSubmit = async (event) => {
    setLoading(true)
    event.preventDefault();
    console.log(stripe, elements, 'stripe')
    if (!stripe || !elements) {
      return;
    }

    // try {
    //   // if (planDetails?.plan?.is_card == 0) {
    //     console.log("Client Secret:", clientSecret); 
    //     const { setupIntent, error } = await stripe.confirmSetup({
    //       elements,
    //       confirmParams: {
    //         return_url: "http://localhost:3000/view-floor/Wpmbk5ezJn",
    //       },
    //     });
    //     console.log(setupIntent)
    //     if (setupIntent) {
    //       const paymentMethodId = setupIntent.payment_method;
    //       console.log(paymentMethodId, 'paymentmethodid')
    //     } else {
    //       // Handle errors
    //     }


    //     if (error.type === "card_error" || error.type === "validation_error") {
    //       // setMessage(error.message);
    //     } else {
    //       // setMessage("An unexpected error occurred.");
    //     }
    //   // } else if (planDetails?.plan?.is_card == 1) {
    //     // Handle condition when is_card is 1
    //   //   console.log("Processing condition when is_card is 1");

    //   //   // Retrieve the existing Payment Method ID associated with the customer
    //   //   const customerPaymentMethods = await stripe.paymentMethods.list({
    //   //     customer: customerId,
    //   //     type: 'card', // Adjust the type based on your payment methods
    //   //   });

    //   //   const paymentMethodId = customerPaymentMethods.data[0].id; // Adjust this based on your logic
    //   //   console.log(paymentMethodId,'paymentmethodid')

    //   //   // Use the existing Payment Method directly for further transactions
    //   //   // ... (See steps below)
    //   // } else {
    //   //   // Handle other conditions if needed
    //   //   console.log("Handling other conditions");
    //   // }
    // }
    // catch (error) {
    //   console.error(error);
    // }

    // const { setupIntent, error } = await stripe.confirmCardSetup({
    //     clientSecret: clientSecret,  // Add this line
    //     payment_method: {
    //         card: elements.getElement(CardElement),

    //     },
    // });
    // console.log(error,setupIntent)

    // if (error) {
    //     console.error(error);
    // } else {
    //     onSuccess(setupIntent); // Pass the setup intent to the parent component
    // }

    // try {
    //   const cardSetupIntent = await stripe.setupIntents.create({
    //     payment_method_types: ['card'],
    //     // ... other SetupIntent parameters
    //   });
    //   console.log('Card SetupIntent created:', cardSetupIntent);
    //   // Handle client-side confirmation or redirect to redirect URL
    // } catch (error) {
    //   console.error('Error creating card SetupIntent:', error);
    //   // Handle errors gracefully
    // }

    const cardNumberElement = elements.getElement(CardNumberElement);
    const cardExpiryElement = elements.getElement(CardExpiryElement);
    const cardCvcElement = elements.getElement(CardCvcElement);

    // Check if any of the card details are empty
    if (!cardNumberElement || !cardExpiryElement || !cardCvcElement) {
      setErrors({
        cardNumber: 'Please enter your card number',
        cardExpiry: 'Please enter your card expiry date',
        cardCvc: 'Please enter your card CVC',
      });
      setLoading(false)

      return;
    }

    // Reset errors
    setErrors({
      cardNumber: '',
      cardExpiry: '',
      cardCvc: '',
    });


    const { paymentMethod, error: paymentError } = await stripe.createPaymentMethod({
      type: 'card',
      card: elements.getElement(CardNumberElement),
    });
    if (paymentError) {
      console.log(paymentError)
      // setError(paymentError.message);
      setErrors({
        cardNumber: paymentError.paymentMethod ? '' : paymentError.message,
        cardExpiry: paymentError.paymentMethod ? '' : paymentError.paymentMethod?.card?.exp_month ? '' : 'Invalid expiry date',
        cardCvc: paymentError.paymentMethod ? '' : paymentError.paymentMethod?.card?.cvc ? '' : 'Invalid CVC',
      });
      setLoading(false)

    } else {
      postPaymentMethod(paymentMethod.id);

      // Send paymentMethod.id to your server for storage
      // setIsLoading(false); // Assuming successful response from server
      // Display success message to user
    }
  };


  const paymentElementOptions = {
    layout: "tabs"
  }
  const cardElementOptions = {
    style: {
      base: {
        fontSize: '11.12px',
        color: '#1d1d4b',
        '::placeholder': {
          color: '#d5d4d4',
        },
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
      },
      invalid: {
        color: '#9e2146',
      },
    },
  };
  const update = () => {
    setIsUpdate(true);
    setErrors({
      cardNumber: '',
      cardExpiry: '',
      cardCvc: '',
    });

  }
  const proceed = async () => {
    setLoading(true)

    const ip = await getIP();
    console.log(ip)
    if (from == 'project' && fromStatus == false && fromUpgrade == false) {
      if (setLoadingPublish) {
        setLoadingPublish(true)
      }
      // return
      handlePublish(project_id, planDetails, isAccepted, ip);
      toggleStripe();


    } else if (from == 'project' && fromStatus == true) {
      statusChange(project_id, planDetails, isAccepted, ip);
      // toggleStripe();

    } else {
      if (isAccepted) {
        postChangePlan();
      }
    }
    setErrors({
      cardNumber: '',
      cardExpiry: '',
      cardCvc: '',
    });


  }
  const back = () => {
    setIsAccepted(false)
    setIsUpdate(false);
    setErrors({
      cardNumber: '',
      cardExpiry: '',
      cardCvc: '',
    });

  }

  function capitalizeFirstLetter(string) {
    return string?.charAt(0).toUpperCase() + string?.slice(1);
  }

  const dateFormat = (inputDate) => {
    const date = new Date(inputDate);

    const day = date.getDate();
    const monthIndex = date.getMonth();
    const year = date.getFullYear();

    const monthNamesAbbreviated = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    const monthNameAbbreviated = monthNamesAbbreviated[monthIndex];

    const formattedDate = `${day} ${monthNameAbbreviated} ${year}`;
    return inputDate ? formattedDate : ''

  }

  function customRound(value, decimals) {
    const factor = Math.pow(10, decimals + 1); // Adding an extra decimal place to check the third decimal digit
    const adjustedValue = Math.floor(value * factor); // Temporarily truncate the value to avoid rounding issues

    const thirdDecimalDigit = adjustedValue % 10; // Get the third decimal digit
    const roundedValue = thirdDecimalDigit >= 5
      ? Math.ceil(value * Math.pow(10, decimals)) / Math.pow(10, decimals)
      : Math.floor(value * Math.pow(10, decimals)) / Math.pow(10, decimals);

    const stringValue = roundedValue.toFixed(decimals);

    // Split the string value into integer and decimal parts
    const [integerPart, decimalPart] = stringValue.split('.');

    // If decimalPart is null or empty, append '.00' to the integerPart
    if (!decimalPart) {
      return `${integerPart}.00`;
    } else {
      // If decimalPart has only one digit, append '0' to make it two digits
      if (decimalPart.length === 1) {
        return `${integerPart}.${decimalPart}0`;
      } else {
        return stringValue;
      }
    }
  }

  return (
    <>
      <Modal isOpen={stripeModal} toggle={toggleStripe} size='sm' style={{ zIndex: '999999 !important', color: '#000' }} centered backdrop={loading ? 'static' : true}>
        <ModalBody>
          {from != 'billing' ?
            <Row>
              <Col sm={12}>
                <div className='plan-detail-div' style={{ fontSize: '0.875rem' }}>
                  <span style={{ color: '#1D1D1B', fontWeight: '500' }}>Your Subscription</span>
                  <div className='d-flex justify-content-between' style={{ color: '#6A6D73', fontSize: '12px' }} >
                    <span>
                      {(planDetails?.plan?.free_expired == 1 && planDetails?.plan?.basic_expired == 0 && planDetails?.plan?.additional_expired == 0) ? 'Pro Plan' : (planDetails?.plan?.free_expired == 1 && planDetails?.plan?.basic_expired == 1 && planDetails?.plan?.additional_expired == 0) ? `${from == 'project' ? 'Pro ' : 'Pro + Additional Pins'} ` : `Pro + Additional Pins (x${planDetails?.plan?.additional_count})`}
                    </span>
                    
                    <span>
                      {
                        (planDetails?.plan?.free_expired == 1 && planDetails?.plan?.basic_expired == 0 && planDetails?.plan?.additional_expired == 0)
                          ?
                          `$${customRound(((planDetails?.plan?.basic_cost) - ((planDetails?.plan?.basic_cost) * (planDetails?.plan?.discount / 100))), 2)}`
                          :
                          (planDetails?.plan?.free_expired == 1 && planDetails?.plan?.basic_expired == 1 && planDetails?.plan?.additional_expired == 0)
                            ?
                            `$${from == 'project' ? (customRound(((planDetails?.plan?.basic_cost) - ((planDetails?.plan?.basic_cost) * (planDetails?.plan?.discount / 100))), 2))
                              :
                              (customRound(((planDetails?.plan?.additional_cost) - ((planDetails?.plan?.additional_cost) * (planDetails?.plan?.discount / 100))), 2))}`
                            : `$${from == 'project' ? (customRound(((planDetails?.plan?.basic_cost + (planDetails?.plan?.additional_cost * planDetails?.plan?.additional_count)) - ((planDetails?.plan?.basic_cost + (planDetails?.plan?.additional_cost * planDetails?.plan?.additional_count)) * (planDetails?.plan?.discount / 100))), 2))
                              : (
                                customRound(((planDetails?.plan?.additional_cost * planDetails?.plan?.additional_count) - ((planDetails?.plan?.additional_cost * planDetails?.plan?.additional_count) * (planDetails?.plan?.discount / 100))
                                ), 2))}`} billed monthly

                      {/* {(planDetails?.plan?.free_expired == 1 && planDetails?.plan?.basic_expired == 0 && planDetails?.plan?.additional_expired == 0) ? `$${(planDetails?.plan?.basic_cost) * (planDetails?.plan?.discount / 100)}` : (planDetails?.plan?.free_expired == 1 && planDetails?.plan?.basic_expired == 1 && planDetails?.plan?.additional_expired == 0) ? `$${from == 'project' ? ((planDetails?.plan?.basic_cost + planDetails?.plan?.additional_cost) * (planDetails?.plan?.discount / 100)) : (planDetails?.plan?.additional_cost) * (planDetails?.plan?.discount / 100)}` : `$${from == 'project' ? (((planDetails?.plan?.basic_cost + (planDetails?.plan?.additional_cost * planDetails?.plan?.additional_count)) * (planDetails?.plan?.discount / 100))) : ((planDetails?.plan?.additional_cost * planDetails?.plan?.additional_count) * (planDetails?.plan?.discount / 100))}`} billed monthly */}
                    </span>
                  </div>
                  <hr className='mt-2 mb-2'>
                  </hr>
                  <div className='d-flex justify-content-between' style={{ color: '#1D1D1B', fontWeight: '500' }}>
                    <span>
                      Total
                    </span>
                    <span>
                      {
                        (planDetails?.plan?.free_expired == 1 && planDetails?.plan?.basic_expired == 0 && planDetails?.plan?.additional_expired == 0)
                          ?
                          `$${customRound(((planDetails?.plan?.basic_cost) - ((planDetails?.plan?.basic_cost) * (planDetails?.plan?.discount / 100))), 2)}`
                          :
                          (planDetails?.plan?.free_expired == 1 && planDetails?.plan?.basic_expired == 1 && planDetails?.plan?.additional_expired == 0)
                            ?
                            `$${from == 'project' ?
                              (customRound(((planDetails?.plan?.basic_cost) - ((planDetails?.plan?.basic_cost) * (planDetails?.plan?.discount / 100))), 2))
                              :
                              (customRound(((planDetails?.plan?.additional_cost) - ((planDetails?.plan?.additional_cost) * (planDetails?.plan?.discount / 100))), 2))}`
                            :
                            `$${from == 'project' ?
                              (customRound(((planDetails?.plan?.basic_cost + (planDetails?.plan?.additional_cost * planDetails?.plan?.additional_count)) - ((planDetails?.plan?.basic_cost + (planDetails?.plan?.additional_cost * planDetails?.plan?.additional_count)) * (planDetails?.plan?.discount / 100))), 2))
                              :
                              (customRound(((planDetails?.plan?.additional_cost * planDetails?.plan?.additional_count) - ((planDetails?.plan?.additional_cost * planDetails?.plan?.additional_count) * (planDetails?.plan?.discount / 100))), 2))}`
                      }

                      {/* {(planDetails?.plan?.free_expired == 1 && planDetails?.plan?.basic_expired == 0 && planDetails?.plan?.additional_expired == 0) ? `$${((planDetails?.plan?.basic_cost) * (planDetails?.plan?.discount / 100)).toFixed(2)}` : (planDetails?.plan?.free_expired == 1 && planDetails?.plan?.basic_expired == 1 && planDetails?.plan?.additional_expired == 0) ? `$${from == 'project' ? (((planDetails?.plan?.basic_cost + planDetails?.plan?.additional_cost) * (planDetails?.plan?.discount / 100)).toFixed(2)) : ((planDetails?.plan?.additional_cost) * (planDetails?.plan?.discount / 100)).toFixed(2)}` : `$${from == 'project' ? (((planDetails?.plan?.basic_cost + (planDetails?.plan?.additional_cost * planDetails?.plan?.additional_count)) * (planDetails?.plan?.discount / 100)).toFixed(2)) : ((planDetails?.plan?.additional_cost * planDetails?.plan?.additional_count) * (planDetails?.plan?.discount / 100)).toFixed(2)}`} billed monthly */}

                      {/* {(planDetails?.plan?.free_expired == 1 && planDetails?.plan?.basic_expired == 0 && planDetails?.plan?.additional_expired == 0) ? `$${planDetails?.plan?.basic_cost}` : (planDetails?.plan?.free_expired == 1 && planDetails?.plan?.basic_expired == 1 && planDetails?.plan?.additional_expired == 0) ? `$${planDetails?.plan?.basic_cost + planDetails?.plan?.additional_cost}` : `$${planDetails?.plan?.basic_cost + (planDetails?.plan?.additional_cost * planDetails?.plan?.additional_count)}`} */}

                      {/* {(planDetails?.plan?.free_expired == 1 && planDetails?.plan?.basic_expired == 0 && planDetails?.plan?.additional_expired == 0) ? `$${planDetails?.plan?.basic_cost}` : `$${planDetails?.plan?.additional_cost}`} */}
                    </span>
                  </div>
                </div>
              </Col>
            </Row >
            :
            <Row>
              <Col sm={12}>
                <span>
                  <h5 className="f-w-600 " style={{ fontSize: '1.5rem' }}>  Add Card Details</h5>

                </span>
              </Col>
            </Row>
          }

          {(planDetails?.plan?.is_card == 0 || isUpdate || from == 'billing') ?

            <form onSubmit={handleSubmit} className="mt-4">
              {/* <PaymentElement options={paymentElementOptions} /> */}
              <Row >
                <Col sm={12}>
                  <div className="stripe-input-container" ref={cardNumberRef}>
                    <CardNumberElement options={{
                      style: {
                        base: {
                          border: '1px solid #F5F6F7 !important',
                          borderRadius: '6px',
                          padding: '10px',
                          fontSize: '14px',
                        },
                      },
                      placeholder: 'Card Number',
                    }} />
                  </div>
                  <div className='text-danger'>{errors.cardNumber}</div>

                </Col>


              </Row>
              <Row className='mt-2'>
                <Col sm={6} >
                  <div className="stripe-input-container" ref={cardExpiryRef}>
                    <CardExpiryElement
                      options={{
                        style: {
                          base: {
                            border: '1px solid #F5F6F7 !important',
                            borderRadius: '6px',
                            padding: '10px',
                            fontSize: '14px',
                          },
                        },
                      }} />
                  </div>
                  <div className='text-danger'>{errors.cardExpiry}</div>


                </Col>
                <Col sm={6} >
                  <div className="stripe-input-container" ref={cardcvcRef}>
                    <CardCvcElement
                      options={{
                        style: {
                          base: {
                            border: '1px solid #F5F6F7 !important',
                            borderRadius: '6px',
                            padding: '10px',
                            fontSize: '14px',
                          },
                        },

                      }} />
                  </div>
                  <div className='text-danger'>{errors.cardCvc}</div>



                </Col>
              </Row>
              {(from !== "billing") &&
                <div className='row mt-2'>

                  <div className='col-sm-12 d-flex align-items-center justify-center'>
                    <Input type="checkbox"
                      style={{ cursor: 'pointer', marginRight: '12px' }}
                      className="check-bx float-right"
                      checked={isAccepted}
                      onChange={(e) => {
                        setIsAccepted(e.target.checked)
                      }}
                    />
                    <Label for="exampleName" className="T-C ">I have read and agree to the <a style={{ color: '#26a3db' }} href="https://fmw.app/subscription-terms/" target="_blank">Subscription Terms.</a> </Label>

                  </div>

                  {/* <div className='col-sm-10'>
                    <Label for="exampleName" className="T-C ">I have read and agree to the <a style={{ color: '#26a3db' }} href="https://fmw.app/subscription-terms/" target="_blank">Subscription Terms.</a> </Label>
                  </div> */}
                </div>
              }

              {/* <input type="text"/> */}
              {(planDetails?.plan?.is_card == 1 && from != 'billing') ?
                <>
                  {/* <div className='row mt-1'>

                    <div className='col-sm-2 d-flex align-items-center justify-center'>
                      <Input type="checkbox"
                        style={{ cursor: 'pointer' }}
                        className="check-bx float-right"
                        checked={false} />
                    </div>
                    <div className='col-sm-10'>
                    <Label for="exampleName" className="T-C ">I have read and agree to the <a style={{ color: '#26a3db' }} href="https://fmw.app/subscription-terms/" >Subscription Terms.</a> </Label>
                    </div>
                  </div> */}
                  <Row className='mt-3'>
                    <Col sm={6}>
                      <Button className='  btn-scndry' style={{ width: '100%', padding: '7px 17px' }} onClick={back} disabled={loading}>
                        Back
                      </Button>
                    </Col>
                    <Col sm={6}>
                      <Button type="submit" className='  btn-primary' style={{ width: '100%' }} disabled={!stripe || loading || (!isAccepted)}>
                        {loading ? (
                          <>
                            <p style={{ opacity: '0', position: 'relative' }}>Subscribe</p>
                            <Spinner
                              className="ml-2 spinner-style"
                              color="light"
                            />

                          </>
                        ) : 'Subscribe'}

                      </Button>
                    </Col>
                  </Row>
                </>
                :
                <>
                  {from == "project" &&
                    <p className=' mt-3' style={{ fontSize: '13px', fontWeight: '500' }}>
                      Your plan will be upgraded immediately and your new billing cycle will begin on {dateFormat(planDetails?.recurring_date)}
                    </p>
                  }
                  {/* <div className='row mt-1'>

                    <div className='col-sm-2 d-flex align-items-center justify-center'>
                      <Input type="checkbox"
                        style={{ cursor: 'pointer' }}
                        className="check-bx float-right"
                        checked={false} />
                    </div>
                    <div className='col-sm-10'>
                    <Label for="exampleName" className="T-C ">I have read and agree to the <a style={{ color: '#26a3db' }} href="https://fmw.app/subscription-terms/" >Subscription Terms.</a> </Label>
                    </div>
                  </div> */}
                  <Button type="submit" className=' mt-3 btn-primary' style={{ width: '100%' }} disabled={!stripe || loading || (!isAccepted && from != 'billing')}>
                    {loading ? (
                      <>
                        <p style={{ opacity: '0', position: 'relative' }}>{from == 'billing' ? 'Submit' : 'Subscribe'}</p>
                        <Spinner
                          className="ml-2 spinner-style"
                          color="light"
                        />

                      </>
                    ) : <>
                      {from == 'billing' ? 'Submit' : 'Subscribe'}
                    </>
                    }

                  </Button>
                </>

              }



            </form>
            :
            <>


              <Card className='card-details-list-card mt-3'>
                <CardBody>
                  <Row>

                    <Col sm={7}>
                      <p className='visa' >{capitalizeFirstLetter(planDetails?.card?.brand)} </p>
                      <p className='card-number mt-1'>************{planDetails?.card?.last4}</p>
                      <p className='visa'  >Expiry: <span className='card-number '> {planDetails?.card?.exp_month < 10 ? `0${planDetails?.card?.exp_month}` : planDetails?.card?.exp_month.toString()}/{planDetails?.card?.exp_year}</span></p>
                    </Col>
                    <Col sm={5} className='show-center '>
                      <div className='d-flex'>

                        <span className="update ml-2" onClick={() => {
                          update();
                          setIsAccepted(false)
                        }}
                          disabled={loading}
                        >Update</span>
                      </div>
                    </Col>
                  </Row>
                </CardBody>
              </Card>
              {from == "project" &&
                <p className=' mt-3' style={{ fontSize: '13px', fontWeight: '500' }}>
                  Your plan will be upgraded immediately and your new billing cycle will begin on {dateFormat(planDetails?.recurring_date)}
                </p>
              }
              {/* {(from !== "project" && from !== "billing") && */}
              <div className='row mt-2'>

                <div className='col-sm-12 d-flex align-items-center justify-center'>
                  <Input type="checkbox"
                    style={{ cursor: 'pointer', marginRight: '12px' }}
                    className="check-bx float-right"
                    checked={isAccepted}
                    onChange={(e) => {
                      setIsAccepted(e.target.checked)
                    }}
                  />
                  <Label for="exampleName" className="T-C">I have read and agree to the <a style={{ color: '#26a3db' }} href="https://fmw.app/subscription-terms/" target="_blank">Subscription Terms.</a> </Label>

                </div>
                {/* <div className='col-sm-10'>
                  <Label for="exampleName" className="T-C ">I have read and agree to the <a style={{ color: '#26a3db' }} href="https://fmw.app/subscription-terms/" target="_blank">Subscription Terms.</a> </Label>
                </div> */}
                {/* {!isAccepted  ? (
                    <div className="text-danger mt-1">
                      This field is required.
                    </div>
                  ) : null} */}
              </div>
              {/* } */}

              <Button className=' mt-3 btn-primary' style={{ width: '100%' }} onClick={proceed} disabled={!isAccepted || loading} >
                {loading ? (
                  <>
                    <p style={{ opacity: '0', position: 'relative' }}>{'Subscribe'}</p>
                    <Spinner
                      className="ml-2 spinner-style"
                      color="light"
                    />

                  </>
                ) : <>
                  {'Subscribe'}
                </>
                }

              </Button>
            </>
          }


        </ModalBody>
      </Modal>
      {loadingPublish &&
        <Modal isOpen={true} size="sm" className="loading-modal" style={{ zIndex: '9999999 !important', maxWidth: '200px', backgroundColor: 'transparent' }} centered>
          <ModalBody >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

              <Loader />
            </div>
          </ModalBody>
        </Modal>
      }
    </>
  );
};

export default PaymentForm;