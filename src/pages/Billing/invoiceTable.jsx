import React, { useState } from 'react';
import { Table, Row, Col } from 'reactstrap';
import './billing.css'
import CustomPagination from '../../components/constants/Pagination'
import { getRequestForDownload } from '../../hooks/axiosClient';
import { toast } from "react-toastify";
import { FiSearch } from "react-icons/fi";
import { MoreOutlined } from "@ant-design/icons";
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import { getCurrentUser } from "../../helpers/utils";
import { DownloadForPdf } from '../../helpers/functions';



const InvoiceTable = ({ tableData, setTableData, tempTableList, noData, setNodata }) => {

    const dummyData = tableData
    const role_id = getCurrentUser()?.user?.role_id;
    const itemsPerPage = 8;
    const [currentPage, setCurrentPage] = useState(1);
    const totalItems = dummyData.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const [searchTerm, setSearchTerm] = useState('');
    // Function to handle page changes
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };
    const [isOpen, setIsOpen] = useState([]);
    const toggleDropdown = (index) => {
        const updatedOpenStates = [...isOpen];
        updatedOpenStates[index] = !updatedOpenStates[index];
        setIsOpen(updatedOpenStates);
    };
    // Calculate the starting and ending indices of the current page's items
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
    const currentItems = dummyData.slice(startIndex, endIndex);

    const downloadInvoice = async (item, type) => {
        let param = type == 0 ? `agent-invoice/${item?.id}` : `download-invoice/${item?.id}`
        try {
            const response = await getRequestForDownload(param);
            if (response.status === 200) {
                console.log(response)
                const dataRes = response.data;
                const pdfName = type == 0 ? item?.rcti_no : item?.invoice_no
                DownloadForPdf(dataRes,pdfName)
                toast.success('Invoice downloaded successfully.');
            } else {
                console.error("Failed to download invoice. Server returned:", response.status, response.data);
                // Handle the error appropriately, e.g., show a notification or log the error.
            }
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
            const colArray = ['invoice_no', 'rcti_no', 'invoice_date', 'customer_name', 'used_prod', 'used_loc', 'paid_amount', 'project_name'];
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
                setTableData(filterData);
            }
        } else {
            setTableData(tempTableList);
            setNodata(false)
        }
    };

    return (
        <div >
            {role_id == 1 &&
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
            }
            <Row className='mt-3'>
                <Col md={12}>
                    <div className='table-responsive' style={{minHeight:'40vh'}}>
                        <Table className='custom-table '>
                            <thead>
                                <tr>
                                    <th className='theadStyle'>Status</th>
                                    <th className='theadStyle'>Invoice#</th>
                                    {role_id == 1 &&
                                        <th className='theadStyle'>RCTI Number</th>
                                    }
                                    <th className='theadStyle'>Invoice Date</th>
                                    <th className='theadStyle'>Customer Name</th>
                                    <th className='theadStyle'>Project Name</th>
                                    <th className='theadStyle'>No of Location Pins Used</th>
                                    <th className='theadStyle'>No of Product Pins Used</th>
                                    <th className='theadStyle'>Amount</th>
                                    <th className='theadStyle'>Download</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentItems?.length > 0 ? currentItems.map((item, index) => (
                                    <tr key={index}>
                                        <td><span className={'paid'}>{'Paid'}</span></td>
                                        <td>{item?.invoice_no}</td>
                                        {role_id == 1 &&
                                            <td>{item?.rcti_no}</td>
                                        }
                                        <td>{item?.invoice_date}</td>
                                        <td>{item?.customer_name}</td>
                                        <td>{item?.project_name}</td>
                                        <td>{item?.used_loc}</td>
                                        <td>{item?.used_prod}</td>
                                        <td>{item?.paid_amount}</td>
                                        <td>
                                            <div className='menus-div'>
                                                <Dropdown isOpen={isOpen[index]} toggle={() => toggleDropdown(index)} className="dropdown-toggle">
                                                    <DropdownToggle caret>
                                                        <span className='menuIcon' style={{ padding: "13px 13px ", backgroundColor: "#dff1fa", borderRadius: "6px", color: "#26A3DB" }}>
                                                            <MoreOutlined style={{ fontSize: "16px", }} />
                                                        </span>
                                                    </DropdownToggle>
                                                    <DropdownMenu className='notification-editmenu' style={{position:'relative'}}>
                                                        {((item?.rcti_no !== null) && (role_id == 1)) &&
                                                            <>
                                                                <DropdownItem onClick={() => downloadInvoice(item, 0)} className="d-flex align-items-center" >Agent Invoice</DropdownItem>
                                                                <hr></hr>
                                                            </>
                                                        }
                                                        <DropdownItem onClick={() => downloadInvoice(item, 1)} className="d-flex align-items-center" >Customer Invoice</DropdownItem>
                                                    </DropdownMenu>
                                                </Dropdown>
                                            </div>
                                        </td>
                                    </tr>
                                )) :
                                    <tr >
                                        <td colSpan={9}><span >No data found.</span></td>
                                    </tr>
                                }
                            </tbody>
                        </Table>
                    </div>
                    <CustomPagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                        tableData={dummyData}
                        itemsPerPage={itemsPerPage}
                    />
                </Col>
            </Row>
        </div>
    )
}
export default InvoiceTable;