import React,{useState} from 'react';
import { Card, CardBody, Button } from 'reactstrap';
import PaymentForm from '../../components/stripe/payment';



const AddCard = ({getCardDetails}) => {


    const [stripeModal, setStripeModal] = useState(false);
    const toggleStripe = () => setStripeModal(!stripeModal);

    return (
        <>
            <Card className='addCard-Card'>
                <CardBody className='align-content-center'>
                    <h5 className='add-card-text'>Add Your First Card For Payment</h5>
                    <p className='mt-2 text-center' style={{fontSize:'0.875rem'}}>This card will be used by default for billing.</p>
                    <Button className= "btn btn-primary mt-4" onClick={()=>{toggleStripe()}} >Add Card Details</Button>
                </CardBody>
            </Card>
            <PaymentForm
                toggleStripe={toggleStripe}
                stripeModal={stripeModal}
                from='billing'
                getCardDetails={getCardDetails}
            />
        </>
    )
}
export default AddCard;
