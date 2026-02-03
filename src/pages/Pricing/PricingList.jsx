import React, {  useState } from "react";
import {
    Card,
    Button
} from "reactstrap";
import { Link } from "react-router-dom";
import PricingTable from './PricingTable';
import { getRequest } from '../../hooks/axiosClient';
import Pricing from './Pricing';

function PricingList() {
    const [modal, setModal] = useState(false);
    const toggle = () => setModal(!modal);
    const [dataSource, setDataSource] = useState([]);
    const [tempTableList, setTempTableList] = useState([]);
    const [validation, setValidation] = useState(null);
    const [costValidation, setCostValidation] = useState('This field is required.');


    const initialFormValues = {
        name: '',
        basic_cost: '',
        basic_location_pins: '',
        basic_product_pins: '',
        additional_cost: '',
        additional_location_pins: '',
        additional_product_pins: '',
        is_default: 0,
        is_free_plan: 0,
    }

    const [pricingValues, setPricingValues] = useState(initialFormValues);
    const [noData, setNodata] = useState(false);

    const getPricingList = async () => {
        try {
            const response = await getRequest(`pricing`);
            const DataRes = response.data ?? [];
            const modifiedDataRes = DataRes?.map((item) => ({
                ...item,
                basic_cost: item?.basic_cost ? `$${item?.basic_cost}` : null,
                additional_cost: item?.additional_cost ? `$${item?.additional_cost}` : null,
            }));
            const sortedPlans = modifiedDataRes.sort((a, b) => b.is_free_plan - a.is_free_plan);
            setDataSource(sortedPlans); 
            setTempTableList(sortedPlans);
            console.log(sortedPlans, 'arrangedList')
            if (DataRes?.length == 0) {
                setNodata(true)
            } else {
                setNodata(false)
            }
        } catch (error) {
        }
    }


    return (
        <div className="text-[#1D1D1B] container-fluid">
            <div className="  flex justify-between " style={{ marginBottom: '16px' }}>
                <h5 className="f-w-600 heading-font" >Pro Pricing Plans</h5>
                <Link >
                    <Button
                        className="btn btn-primary"
                        htmlType="submit"
                        type=""
                        style={{ border: "0" }}
                        onClick={() => { toggle(); setPricingValues(initialFormValues); }}
                    >
                        Add New Plan
                    </Button>
                </Link>
            </div>
            <Pricing
                id={0}
                toggle={toggle}
                setModal={setModal}
                getPricingList={getPricingList}
                setPricingValues={setPricingValues}
                pricingValues={pricingValues}
                setValidation={setValidation}
                validation={validation}
                costValidation={costValidation}
                setCostValidation={setCostValidation}
            />
            <Card className="vh-70" style={{ padding: '20px' }} >
                <div className="">
                    <PricingTable
                        tempTableList={tempTableList}
                        setTempTableList={setTempTableList}
                        dataSource={dataSource}
                        setDataSource={setDataSource}
                        getPricingList={getPricingList}
                        modal={modal}
                        toggle={toggle}
                        setModal={setModal}
                        setPricingValues={setPricingValues}
                        pricingValues={pricingValues}
                        noData={noData}
                        setNodata={setNodata}
                    />
                </div>
            </Card>
        </div>
    );
}

export default PricingList;
