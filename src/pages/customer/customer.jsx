import React, {  useState } from "react";
import {
  Card,
  Button
} from "reactstrap";
import { Link } from "react-router-dom";
import CustomerTable from './customerTable';
import AddCustomer from './addCustomer';

function CustomerList() {
  const [modal, setModal] = useState(false);
  const toggle = () => setModal(!modal);
  const [submitted, setSubmitted] = useState(false);
  return (

    <div className="text-[#1D1D1B] container-fluid">
      <div className=" flex justify-between " style={{marginBottom:'16px'}}>
        <h5 className="f-w-600 heading-font" >Customers</h5>
        <Link >
          <Button
            className="btn btn-primary"
            htmlType="submit"
            type=""
            style={{ border: "0", }}
            onClick={toggle}
          >
            Add New Customer
          </Button>
        </Link>
      </div>
      <Card className="vh-70" style={{ padding:'20px'}} >

      <div className="">
      <CustomerTable submitted={submitted} setSubmitted={setSubmitted} />
        </div>
        </Card>
      <AddCustomer
        id={0}
        modal={modal}
        setModal={setModal}
        toggle={toggle}
        setSubmitted={setSubmitted}
      />
    </div>
  );
}

export default CustomerList;
