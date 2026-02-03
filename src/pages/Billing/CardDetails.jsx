import React, { useEffect, useState } from 'react';
import AddCard from './addCard';
import CardDetailsList from './CardDetailsList'
import { getCurrentUser } from '../../helpers/utils';
import {  getRequest } from '../../hooks/axiosClient';
import {  Row, Col } from 'reactstrap';

const CardDetails = ({ activeTab, params }) => {
    const user = getCurrentUser()?.user;
    const [cardDetails, setCardDetails] = useState();
    const [list, setList] = useState(true);

    useEffect(() => {
        getCardDetails();
    }, []);

    const getCardDetails = async () => {
        try {
            const response = await getRequest(`card-details/${user?.common_id}`);
            const data = response.data ?? [];
            setCardDetails(data);
            if (data?.type == null) {
                setList(false)

            } else {
                setList(true)
           }

        } catch (error) {
            console.log(error);
        } finally {
            // setLoading(false)
        }
    }

    return (
        <>
            {!list ?
                <Row>
                    <Col sm="12" className={'align-content-center'}>
                        <AddCard getCardDetails={getCardDetails} />
                    </Col>
                </Row>
                :
                <Row>
                    <Col sm="12">
                    <CardDetailsList cardDetails={cardDetails} getCardDetails={getCardDetails}/>
                    </Col>
                    </Row>
            }
        </>
    )
}
export default CardDetails;
