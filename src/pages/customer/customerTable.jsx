import React, { useEffect, useState } from 'react';
import { Table } from 'reactstrap';
import { useNavigate } from "react-router-dom";
import CustomPagination from '../../components/constants/Pagination'
import swal from 'sweetalert';
import { getRequest, deleteRequest } from '../../hooks/axiosClient';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import {
    Row,
    Col,
} from "reactstrap";
import { FiSearch } from "react-icons/fi";
import AddCustomer from './addCustomer';
import { MoreOutlined } from "@ant-design/icons";
import { encode } from '../../helpers/utils';
import { toast } from 'react-toastify';


const CustomerTable = ({ setSubmitted, submitted }) => {
    const navigate = useNavigate();
    const [modal, setModal] = useState(false);
    const toggle = () => setModal(!modal);
    const [dataSource, setDataSource] = useState([]);
    const [isOpen, setIsOpen] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [tempTableList, setTempTableList] = useState([]);
    const [noData, setNodata] = useState(false);
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
        setSearchTerm('');
        getCustomersList();
    };
    const [editId, setEditId] = useState(null);

    const getCustomersList = async () => {
        try {
            const response = await getRequest(`customers`);
            const DataRes = response?.data?.data ?? [];
            DataRes?.forEach(element => {
                element.contact = element?.user_data?.enc_id,
                    element.email = element?.user_data?.email,
                    element.name = element?.user_data?.name
            });
            if (DataRes?.length == 0) {
                setNodata(true)
            } else {
                setNodata(false)
            }
            setDataSource(DataRes);
            setTempTableList(DataRes);
            setSubmitted(false)
        } catch (error) {
        }
    }

    useEffect(() => {
        getCustomersList();
    }, [submitted])

    const statusChange = async (id) => {
        try {
            const response = await getRequest(`customers/${id}/status`);
            const data = response.data ?? [];
            swal({
                text: data?.message,
                icon: "success",
            })
            getCustomersList()
            setEditId(null)
        } catch (error) {
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
            const response = await deleteRequest(`customers/${id}`);
            const data = response.data ?? [];
            toast.success(data?.message);
            getCustomersList()
            setEditId(null)
        } catch (error) {
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
        setEditId(item?.enc_id)
        setModal(true)

    }

    const logClick = (item) => {
        navigate(`/log/${encode(item?.enc_id)}`)
    }

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
        const currentValue = e.target.value;
        if (currentValue) {
            const value = e.target.value.toLowerCase();
            const colArray = ['plan', 'no_of_projects_count', 'name', 'agent_name', 'contact', 'email'];
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
                        <Table className=' custom-table'>
                            <thead>
                                <tr>
                                    <th className='theadStyle'>Status</th>
                                    <th className='theadStyle'>Email</th>
                                    <th className='theadStyle'>Name</th>
                                    <th className='theadStyle'>Agent</th>
                                    <th className='theadStyle'>Projects</th>
                                    <th className='theadStyle'>Pricing Plan</th>
                                    <th className='theadStyle'></th>
                                </tr>
                            </thead>
                            <tbody>
                                {(!noData) ?
                                    currentItems.map((item, index) => (
                                        <tr key={index}>
                                            <td><span onClick={() => StatusClick(item)} className={item.status == 0 ? 'unpaid' : 'paid'}>{item.status == 0 ? 'Inactive' : 'Active'}</span></td>
                                            <td>{item?.email}</td>
                                            <td>{item?.name}</td>
                                            <td>{item?.agent_name}</td>
                                            <td>{item?.no_of_projects_count}</td>
                                            <td>{item?.plan}</td>
                                            <td>
                                                <div className='menus-div'>
                                                    <Dropdown isOpen={isOpen[index]} toggle={() => toggleDropdown(index)} className="dropdown-toggle">
                                                        <DropdownToggle caret>
                                                            <span className='menuIcon' style={{ padding: "13px 13px ", backgroundColor: "#dff1fa", borderRadius: "6px", color: "#26A3DB" }}>
                                                                <MoreOutlined style={{ fontSize: "16px", }} />
                                                            </span>
                                                        </DropdownToggle>
                                                        <DropdownMenu style={{ position: 'relative' }}>
                                                            {item?.no_of_logs_count > 0 &&
                                                                <>
                                                                    <DropdownItem onClick={() => logClick(item)} className="d-flex align-items-center" >Log</DropdownItem>
                                                                    <hr></hr>
                                                                </>
                                                            }
                                                            <DropdownItem onClick={() => EditClick(item)} className="d-flex align-items-center" >Edit</DropdownItem>
                                                            <hr></hr>
                                                            <DropdownItem onClick={() => deleteClick(item)} className="d-flex align-items-center">Delete</DropdownItem>
                                                        </DropdownMenu>
                                                    </Dropdown>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                    ) :
                                    <>
                                        <tr >
                                            <td colSpan={7}><span >No data found.</span></td>
                                        </tr>
                                    </>}
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
            <AddCustomer
                modal={modal}
                setModal={setModal}
                toggle={toggle}
                setSubmitted={setSubmitted}
                id={editId ?? 0}
                setEditId={setEditId}
                getCustomersList={getCustomersList}
            />
        </>
    )
}
export default CustomerTable;