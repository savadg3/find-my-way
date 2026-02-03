import React,{useState} from 'react';
import { Card, CardBody, Row, Col, Button } from 'reactstrap';
import { Link } from 'react-router-dom';
import './billing.css';
import PaymentForm from '../../components/stripe/payment';



const CardDetailsList = ({ cardDetails,getCardDetails }) => {
    function capitalizeFirstLetter(string) {
        return string?.charAt(0).toUpperCase() + string?.slice(1);
    }
    const [stripeModal, setStripeModal] = useState(false);
  const toggleStripe = () => setStripeModal(!stripeModal);
    return (
        <>
            <Card className='card-details-list-card'>
                <CardBody>
                    <Row>
                        <Col sm={6}>
                            <p className='visa' style={{fontSize:'1rem'}} >{capitalizeFirstLetter(cardDetails?.brand)} </p>
                            <p className='card-number mt-1' style={{fontSize:'0.875rem'}}>************{cardDetails?.last4}</p>
                            <p className='visa' style={{fontSize:'1rem'}} >Expiry: <span className='card-number ' style={{fontSize:'0.875rem'}}> {cardDetails?.exp_month < 10 ? `0${cardDetails?.exp_month}` : cardDetails?.exp_month.toString()}/{cardDetails?.exp_year}</span></p>
                        </Col>
                        <Col sm={6} className='show-center '>
                            <div className='d-flex'>
                                <Link >
                                    <Button className="btn btn-primary ml-2" onClick={()=>{toggleStripe()}}  >Update</Button>
                                </Link>
                            </div>
                        </Col>
                    </Row>
                </CardBody>
            </Card>
            <PaymentForm
                toggleStripe={toggleStripe}
                stripeModal={stripeModal}
                planDetails={cardDetails}
                from='billing'
                getCardDetails={getCardDetails}
                fromUpgrade={false}
            />
        </>
    )
}
export default CardDetailsList;