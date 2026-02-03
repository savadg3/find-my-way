import React, { useState } from 'react';
import { Table } from 'reactstrap';
import { useNavigate } from "react-router-dom";
import CustomPagination from '../../components/constants/Pagination'
import swal from 'sweetalert';
import { getRequest, deleteRequest } from '../../hooks/axiosClient';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import './agent.css'
import {
    Row,
    Col,
} from "reactstrap";
import { FiSearch } from "react-icons/fi";
import { MoreOutlined } from "@ant-design/icons";
import { toast } from 'react-toastify';
import { encode } from "../../helpers/utils";


const AgentTable = ({
    dataSource, getAgentById,
    tempTableList, setDataSource,
    getAgentList, setValidation,
    noData,
    setNodata
}) => {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const toggleDropdown = (index) => {
        const updatedOpenStates = [...isOpen];
        updatedOpenStates[index] = !updatedOpenStates[index];
        setIsOpen(updatedOpenStates);
    };
    const itemsPerPage = 8;
    const [currentPage, setCurrentPage] = useState(1);
    const totalItems = dataSource?.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    // Function to handle page changes
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const statusChange = async (id) => {
        try {
            const response = await getRequest(`agent/${id}/status`);
            const data = response.data ?? [];
            swal({
                text: data?.message,
                icon: "success",
            })
            getAgentList()
        } catch (error) {
            console.log(error);
        }
    }


    const StatusClick = (row) => {
        swal({
            title: "Are you sure",
            text: "You want to change status?",
            icon: "warning",
            buttons: [
                {
                    text: "No",
                    value: "No",
                    visible: true,
                    className: "btn-danger",
                    closeModal: true,
                },
                {
                    text: "Yes",
                    value: "Yes",
                    visible: true,
                    className: "btn-success",
                    closeModal: true,
                },
            ],
        })
            .then((value) => {
                switch (value) {
                    case "Yes":
                        statusChange(row?.enc_id)
                        break;
                    default:
                        break;
                }
            });
    }


    const deleteFunction = async (id) => {
        try {
            const response = await deleteRequest(`agent/${id}`);
            const data = response.data ?? [];
            toast.success(data?.message);
            getAgentList()
        } catch (error) {
            console.log(error);
        }
    }


    const deleteClick = (row) => {
        swal({
            title: "Are you sure you want to delete?",
            text: "This action is permanent and cannot be undone.",
            icon: "warning",
            buttons: [
                {
                    text: "No",
                    value: "No",
                    visible: true,
                    className: "btn-danger",
                    closeModal: true,
                },
                {
                    text: "Yes",
                    value: "Yes",
                    visible: true,
                    className: "btn-success",
                    closeModal: true,
                },
            ],
        })
            .then((value) => {
                switch (value) {
                    case "Yes":
                        deleteFunction(row?.enc_id)
                        break;
                    default:
                        break;
                }
            });
    }

    const EditClick = (item) => {
        getAgentById(item?.enc_id);
        setValidation(null)
    }

    const viewDashboard = (item) => {
        navigate(`/agent-portal/${encode(3)}/${encode(item?.enc_id)}`);
    }

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1)
        const currentValue = e.target.value;
        if (currentValue) {
            const value = e.target.value.toLowerCase();
            const colArray = ['email', 'business_name', 'name', 'contact', 'discount', 'commission_charge', 'agent_affliate_identifier'];
            const count = colArray.length;
            if (count > 0) {
                const filterData = tempTableList.filter((item) => {
                    let returnvalue = false;
                    for (let i = 0; i < count; i += 1) {
                        if (
                            (item[colArray[i]] &&
                                item[colArray[i]].toString().toLowerCase().indexOf(value) !==
                                -1) ||
                            !value
                        ) {
                            returnvalue = true;
                            return true;
                        }
                    }
                    return returnvalue;
                });
                if (filterData?.length == 0) {
                    setNodata(true)
                } else {
                    setNodata(false)
                }
                setDataSource(filterData);
            }
        } else {
            setDataSource(tempTableList);
            setNodata(false)
        }
    };

    // Calculate the starting and ending indices of the current page's items
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
    const currentItems = dataSource?.slice(startIndex, endIndex);

    return (
        <>
            <Row>
                <Col md={2}>
                    <div className="d-flex">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => handleSearchChange(e)}
                        />
                        <div
                            className="input-group-append"
                            style={{ marginLeft: "-36px" }}
                        >
                            <span
                                className="input-group-text"
                                style={{
                                    border: "none",
                                    backgroundColor: "transparent",
                                    padding: '4px'
                                }}
                            >
                                <FiSearch className="iconStyle" />
                            </span>
                        </div>
                    </div>
                </Col>
            </Row>
            <Row className="mt-3">
                <Col md={12}>
                    <div className='table-responsive' style={{ minHeight: '40vh' }}>
                        <Table className='custom-table '>
                            <thead>
                                <tr>
                                    <th className='theadStyle'>Status</th>
                                    <th className='theadStyle'>Business Name</th>
                                    <th className='theadStyle'>Display Name</th>
                                    <th className='theadStyle'>Contact Email</th>
                                    <th className='theadStyle'>Agent Affiliate Identifier </th>
                                    <th className='theadStyle'>Project Commission</th>
                                    <th className='theadStyle'>Customer Discount</th>
                                    <th className='theadStyle'>No of Customers</th>
                                    <th className='theadStyle'></th>
                                </tr>
                            </thead>
                            <tbody>
                                {(!noData) ? (
                                    currentItems.map((item, index) => (
                                        <tr key={index}>
                                            <td><span onClick={() => StatusClick(item)} className={item.status == 0 ? 'unpaid' : 'paid'}>{item.status == 0 ? 'Inactive' : 'Active'}</span></td>
                                            <td>{item.business_name}</td>
                                            <td>{item.name}</td>
                                            <td>{item.email}</td>
                                            <td>{item.agent_affliate_identifier}</td>
                                            <td>{item.commission_charge ? (`${item.commission_charge}`) : ''}</td>
                                            <td>{item.discount ? (`${item.discount}`) : ''}</td>
                                            <td>{item.customer_count}</td>
                                            <td>
                                                <div className='menus-div'>
                                                    <Dropdown isOpen={isOpen[index]} toggle={() => toggleDropdown(index)} className="dropdown-toggle">
                                                        <DropdownToggle caret>
                                                            <span className='menuIcon' style={{ padding: "13px 13px ", backgroundColor: "#dff1fa", borderRadius: "6px", color: "#26A3DB" }}>
                                                                <MoreOutlined style={{ fontSize: "16px", }} />
                                                            </span>
                                                        </DropdownToggle>
                                                        <DropdownMenu className='notification-editmenu' style={{position:'relative'}}>
                                                            <DropdownItem onClick={() => EditClick(item)} className="d-flex align-items-center" >Edit</DropdownItem>
                                                            <hr></hr>
                                                            <DropdownItem onClick={() => viewDashboard(item)} className="d-flex align-items-center" >View Dashboard</DropdownItem>
                                                            {item?.customer_count == 0 &&
                                                                <>
                                                                    <hr></hr>
                                                                    <DropdownItem onClick={() => deleteClick(item)} className="d-flex align-items-center" >Delete</DropdownItem>
                                                                </>
                                                            }
                                                        </DropdownMenu>
                                                    </Dropdown>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <>
                                        <tr >
                                            <td colSpan={8}><span >No data found.</span></td>
                                        </tr>
                                    </>
                                )}
                            </tbody>
                        </Table>
                    </div>
                    <CustomPagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                        tableData={dataSource}
                        itemsPerPage={itemsPerPage}
                    />
                </Col>
            </Row>
        </>
    )
}
export default AgentTable;