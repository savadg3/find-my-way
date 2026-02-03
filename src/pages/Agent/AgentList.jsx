import React, { useEffect, useState } from "react";
import {
  Row,
  Card,
  Col,
  Button
} from "reactstrap";
import { FiSearch } from "react-icons/fi";
import { Link } from "react-router-dom";

import './agent.css'
import AgentTable from './agentTable';
import { getRequest } from '../../hooks/axiosClient';
import AgentAdd from "./AgentAdd";

function AgentList() {
  const initialFormValues = {
    business_name: '',
    first_name: '',
    last_name: '',
    address: '',
    contact: '',
    email: '',
    commission_charge: '',
    coupon_code: '',
    discount: '',
    account_name: '',
    bank_name: '',
    bsb_number: '',
    account_number: '',
    coupon: 'no',
    status: 1,
    l_name: '',
    f_name:''
  }

  const [modal, setModal] = useState(false);
  const toggle = () => setModal(!modal);
  const [dataSource, setDataSource] = useState([]);
  const [tempTableList, setTempTableList] = useState([]);
  const [values, setValues] = useState(initialFormValues);
  const [agentId, setAgentId] = useState(null);
  const [validation, setValidation] = useState(null);
  const [noData, setNodata] = useState(false);

  const getAgentById = async (id) => {
    try {
      const response = await getRequest(`agent/${id}`);
      const DataRes = response.data ?? [];
      setAgentId(DataRes.enc_id);
      toggle()
      const contact = response?.data?.user_data?.contact;
      let maskContact = '';
      if (contact !== null && !contact.includes(" ")) {
        maskContact = `${contact?.substring(0, 4)} ${contact?.substring(4, 7)} ${contact?.substring(7, contact?.length)}`;
      } else {
        maskContact = contact
      }
      let data = {
        id: DataRes.enc_id,
        user_id: DataRes.enc_user_id,
        first_name: DataRes.user_data?.name,
        abn: DataRes?.abn,
        address: DataRes.user_data?.address,
        email: DataRes.user_data?.email,
        // contact: maskContact,
        contact: DataRes?.user_data?.contact,
        account_name: DataRes?.account_name,
        account_number: DataRes?.account_number,
        // bank_name: DataRes?.bank_name,
        bsb_number: DataRes?.bsb_number,
        business_name: DataRes?.business_name,
        commission_charge: DataRes?.commission_charge,
        coupon_code: DataRes?.coupon_code,
        discount: DataRes?.discount,
        status: DataRes?.status,
        f_name: DataRes?.f_name,
        l_name: DataRes?.l_name,
        // coupon: isCoupen
      }
      setValues(data)
    } catch (error) {
      console.log(error);
    } finally {
    }
  }

  const getAgentList = async () => {
    try {
      const response = await getRequest(`agent`);
      const DataRes = response.data ?? [];
      DataRes?.forEach(element => {
        element.name = element.user_data?.name,
          element.email = element.user_data?.email,
          element.contact = element.user_data?.contact,
          element.discount =element?.discount ? `${element?.discount}%` : '',
          element.commission_charge = element?.commission_charge ? `${element?.commission_charge}%` : ''

      });
      if (DataRes?.length == 0) {
        setNodata(true)
      } else {
        setNodata(false)
      }
      setDataSource(DataRes);
      setTempTableList(DataRes);
    } catch (error) {
      //console.log(error);
    }
  }

  useEffect(() => {
    getAgentList();
  }, [])


  // Create a table instance using react-table hooks
  return (
    <div className="text-[#1D1D1B] container-fluid">
      <div className=" flex justify-between " style={{marginBottom:'16px'}}>
        <h5 className="f-w-600 heading-font" >Agents</h5>
        <Link >
          <Button
            className="btn btn-primary"
            htmlType="submit"
            type=""
            style={{ border: "0", }}
            onClick={() => { setValues(initialFormValues); setValidation(null); toggle(); setAgentId(null) }}
          >
            Add New Agent
          </Button>
        </Link>
      </div>
      <Card className="vh-70 " style={{padding:'20px'}} >
        <AgentTable
          dataSource={dataSource} getAgentById={getAgentById} getAgentList={getAgentList} setValidation={setValidation} validation={validation}
          tempTableList={tempTableList} setDataSource={setDataSource} noData={noData}
          setNodata={setNodata}
        />
      </Card>
      <AgentAdd
        id={0}
        modal={modal}
        toggle={toggle}
        setModal={setModal}
        getAgentById={getAgentById}
        setValues={setValues}
        values={values}
        agentId={agentId}
        getAgentList={getAgentList}
        setValidation={setValidation}
        validation={validation}
      />
    </div>
  );
}

export default AgentList;
