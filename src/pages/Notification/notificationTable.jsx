import React, { useState } from 'react';
import { Table, Row, Col } from 'reactstrap';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
// import './billing.css'
import { MoreOutlined } from "@ant-design/icons";
import CustomPagination from '../../components/constants/Pagination'
import { getRequest, deleteRequest } from '../../hooks/axiosClient';
import { FiSearch } from "react-icons/fi";
import { toast } from 'react-toastify';


const NotificationTable = ({ dataSource, tempTableList, setDataSource, getNotificationById, getNotificationList, noData, setNodata }) => {

    const itemsPerPage = 8;
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const totalItems = dataSource.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const statusChange = async (id) => {
        try {
            const response = await getRequest(`notifications/${id}/status`);
            const data = response.data ?? [];
            swal({
                text: data?.message,
                icon: "success",
            })
            getNotificationList();
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
                        statusChange(row?.notification_id)
                        break;
                    default:
                        break;
                }
            });
    }

    const deleteFunction = async (id) => {
        try {
            const response = await deleteRequest(`notifications/${id}`);
            const data = response.data ?? [];
            toast.success(data?.message);
            getNotificationList();
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
                        deleteFunction(row?.notification_id)
                        break;
                    default:
                        break;
                }
            });
    }

    const EditClick = (item) => {
        getNotificationById(item.notification_id)

    }

    // Calculate the starting and ending indices of the current page's items
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
    const currentItems = dataSource.slice(startIndex, endIndex);

    const [isOpen, setIsOpen] = useState([]);
    const toggleDropdown = (index) => {
        const updatedOpenStates = [...isOpen];
        updatedOpenStates[index] = !updatedOpenStates[index];
        setIsOpen(updatedOpenStates);
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1)
        const currentValue = e.target.value;
        if (currentValue) {
            const value = e.target.value.toLowerCase();
            const colArray = ['heading'];
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

    return (
        <>
            <Row>
                <Col md={2}>
                    <div className="d-flex">
                        <input
                            type="text"
                            value={searchTerm}
                            className="form-control"
                            placeholder="Search..."
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
            <Row className='mt-3'>
                <Col md={12}>
                    <Table className='custom-table '>
                        <thead>
                            <tr>
                                <th className='theadStyle'>Status</th>
                                <th className='theadStyle'>Heading</th>
                                <th className='theadStyle'></th>
                            </tr>
                        </thead>
                        <tbody>
                            {(!noData) ? currentItems.map((item, index) => (
                                <tr key={index}>
                                    <td><span onClick={() => StatusClick(item)} className={item.status == 0 ? 'unpaid' : 'paid'}>{item.status == 0 ? 'Inactive' : 'Active'}</span></td>
                                    <td className='notification-heading'>
                                        <div className='d-flex'>
                                            <span className='content-center'> {item.heading}</span>
                                        </div></td>
                                    <td style={{ padding: '12px 12px 12px 35px' }}>
                                        <div className='menus-div'>
                                            <Dropdown isOpen={isOpen[index]} toggle={() => toggleDropdown(index)} className="dropdown-toggle-notification">
                                                <DropdownToggle caret>
                                                    <span className='menuIcon' style={{ padding: "13px 13px ", backgroundColor: "#dff1fa", borderRadius: "6px", color: "#26A3DB" }}>
                                                        <MoreOutlined style={{ fontSize: "16px", }} />
                                                    </span>
                                                </DropdownToggle>
                                                <DropdownMenu className='notification-editmenu'>
                                                    <DropdownItem onClick={() => EditClick(item)} className="d-flex align-items-center" >Edit</DropdownItem>
                                                    <hr></hr>
                                                    <DropdownItem onClick={() => deleteClick(item)} className="d-flex align-items-center">Delete</DropdownItem>
                                                </DropdownMenu>
                                            </Dropdown>
                                        </div>

                                    </td>
                                </tr>
                            )) : <>
                                <tr >
                                    <td colSpan={3}><span >No data found.</span></td>
                                </tr>
                            </>}
                        </tbody>
                    </Table>
                    <CustomPagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                        tableData={currentItems}
                        itemsPerPage={itemsPerPage}
                    />
                </Col>
            </Row>
        </>
    )
}
export default NotificationTable;