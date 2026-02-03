import React, { useEffect, useState } from 'react';
import { Table, Badge } from 'reactstrap';
import { BiDotsVerticalRounded } from "react-icons/bi";
import { FiEdit } from "react-icons/fi";
import { RiDeleteBinLine } from "react-icons/ri";
import { BsFillStarFill } from 'react-icons/bs';
import { NavLink, useNavigate } from "react-router-dom";
import CustomPagination from '../../components/constants/Pagination'
import swal from 'sweetalert';
import { getRequest, deleteRequest } from '../../hooks/axiosClient';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import {
    Row,
    Card,
    Col,
    Button
} from "reactstrap";
import { FiSearch } from "react-icons/fi";
import Pricing from './Pricing';
import { MoreOutlined } from "@ant-design/icons";
import { toast } from 'react-toastify';


const PricingTable = ({
    tempTableList,
    setTempTableList,
    dataSource,
    setDataSource,
    getPricingList,
    setModal,
    modal,
    toggle,
    setPricingValues,
    pricingValues,
    noData,
    setNodata
}) => {

    const [isOpen, setIsOpen] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [editId, setEditId] = useState(null);
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

    useEffect(() => {
        getPricingList();
    }, [])

    const defaultChange = async (id) => {
        try {
            const response = await getRequest(`pricing/${id}/default`);
            const data = response.data ?? [];
            swal({
                text: data?.message,
                icon: "success",
            })
            getPricingList()
        } catch (error) {
        }
    }


    const defaultClick = (row) => {
        if (row?.is_default == 0) {
            swal({
                title: "Are you sure",
                text: "Want to change package?",
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
                            defaultChange(row?.enc_id)
                            break;
                        default:
                            break;
                    }
                });
        }
    }


    const EditClick = (item) => {
        setEditId(item?.enc_id)
        getPricingById(item?.enc_id)
    }

    const getPricingById = async (id) => {
        try {
            const response = await getRequest(`pricing/${id}`);
            const DataRes = response.data ?? [];
            let data = {
                ...DataRes,
                default_disabled: DataRes?.is_default
            }
            setPricingValues(data)
            setModal(true)
        } catch (error) {
            console.log(error);
        }
    }

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1)
        const currentValue = e.target.value;
        if (currentValue) {
            const value = e.target.value.toLowerCase();
            const colArray = ['additional_product_pins', 'additional_location_pins', 'name', 'additional_cost', 'basic_product_pins', 'basic_location_pins', 'basic_cost'];
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
                        deleteInvoice(row)
                        break;
                    default:
                        break;
                }
            });
    }

    const deleteInvoice = async (item) => {
        try {
            const response = await deleteRequest(`pricing/${item?.enc_id}`);
            const DataRes = response.data ?? [];
            toast.success(DataRes.message);
            getPricingList()
        } catch (error) {
            console.log(error);
        }
    }

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
                        <Table className='custom-table'>
                            <thead>
                                <tr>
                                    {/* <th className='theadStyle'>Free</th> */}
                                    <th className='theadStyle'>Default</th>
                                    <th className='theadStyle'>Name</th>
                                    <th className='theadStyle'>Base Package Cost</th>
                                    <th className='theadStyle'>Base Location Pins</th>
                                    <th className='theadStyle'>Base Product Pins</th>
                                    <th className='theadStyle'>Additional Pin Cost</th>
                                    <th className='theadStyle'>Additional Location Pins</th>
                                    <th className='theadStyle'>Additional Product Pins</th>
                                    <th className='theadStyle'></th>
                                </tr>
                            </thead>
                            <tbody>
                                {(!noData) ? (
                                    currentItems.map((item, index) => (
                                        <tr key={index} className="mt-3">
                                            <td>
                                                {item?.is_default == 1 &&
                                                    <span className={item?.is_default == 1 ? 'default' : 'not-default'} >
                                                        {item.is_default == 0 ? <BsFillStarFill /> : <BsFillStarFill />}
                                                    </span>
                                                }
                                            </td>
                                            <td><span >{item?.name} {item?.is_free_plan == 1 &&
                                                <Badge color='success' pill className="ml-1 freeb bg-success" >
                                                    Free
                                                </Badge>
                                            }</span> </td>
                                            <td>{(item?.basic_cost) ? `${(item?.basic_cost)}` : ''}</td>
                                            <td>{item?.basic_location_pins}</td>
                                            <td>{item?.basic_product_pins}</td>
                                            <td>{(item?.additional_cost) ? `${(item?.additional_cost)}` : ''}</td>
                                            <td>{item?.additional_location_pins}</td>
                                            <td>{item?.additional_product_pins}</td>
                                            <td>
                                                <div className='menus-div'>
                                                    <Dropdown isOpen={isOpen[index]} toggle={() => toggleDropdown(index)} className="dropdown-toggle">
                                                        <DropdownToggle caret>
                                                            <span className='menuIcon' style={{ padding: "13px 13px ", backgroundColor: "#dff1fa", borderRadius: "6px", color: "#26A3DB" }}>
                                                                <MoreOutlined style={{ fontSize: "16px", }} />
                                                            </span>
                                                        </DropdownToggle>
                                                        <DropdownMenu>
                                                            <DropdownItem onClick={() => EditClick(item)} className="d-flex align-items-center" >Edit</DropdownItem>
                                                            {(item?.customers_count == 0 && item?.is_free_plan == 0 && item?.is_default == 0) &&
                                                                <DropdownItem onClick={() => deleteClick(item)} className="d-flex align-items-center">Delete</DropdownItem>
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
                                            <td colSpan={7}><span >No data found.</span></td>
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
            <Pricing
                id={editId ?? 0}
                modal={modal}
                toggle={toggle}
                setModal={setModal}
                getPricingList={getPricingList}
                setPricingValues={setPricingValues}
                pricingValues={pricingValues}
            />
        </>
    )
}
export default PricingTable;