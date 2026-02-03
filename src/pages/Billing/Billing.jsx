import React, {  useState } from 'react';
import { useParams } from 'react-router-dom';
import { Nav, NavItem, NavLink, Row, Col, Card, CardBody, TabContent, TabPane } from 'reactstrap';
import InvoiceList from './invoiceList';
import CardDetails from './CardDetails';
import { getCurrentUser } from "../../helpers/utils";
import FailedHistory from './FailedHistory';


const Billing = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('1');
  const role = getCurrentUser()?.user?.role_id;
  const toggle = (tab) => {
    if (activeTab !== tab) setActiveTab(tab);
  };

  return (
    <div className="container-fluid">
      <h5 className="f-w-600 headingmargin heading-font" >Billing</h5>
      <Card className='vh-70' style={{ padding: '20px' }}>
        <CardBody>
          <Nav tabs className="mb-4">
            <NavItem>
              <NavLink
                className={activeTab === '1' ? 'active' : ''}
                onClick={() => {
                  toggle('1');
                }}
              >
                Invoices
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                className={activeTab === '3' ? 'active' : ''}
                onClick={() => {
                  toggle('3');
                }}
              >
                Failed History
              </NavLink>
            </NavItem>
            {role !== 1 &&
              <NavItem>
                <NavLink
                  className={activeTab === '2' ? 'active' : ''}
                  onClick={() => {
                    toggle('2');
                  }}
                >
                  Card Details
                </NavLink>
              </NavItem>
            }
          </Nav>
          <TabContent activeTab={activeTab}>
            <TabPane tabId="1">
              <Row>
                <Col sm="12">
                  <InvoiceList />
                </Col>
              </Row>
            </TabPane>
            <TabPane tabId="2">
              <CardDetails activeTab={activeTab} params={id} />
            </TabPane>
            <TabPane tabId="3">
              <Row>
                <Col sm="12">
                  <FailedHistory />
                </Col>
              </Row>
            </TabPane>
          </TabContent>
        </CardBody>
      </Card>
    </div>
  );
};

export default Billing;
