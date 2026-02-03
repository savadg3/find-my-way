import React, { useState } from 'react';
import { Table, Row, Col } from 'reactstrap';
import './billing.css'
import CustomPagination from '../../components/constants/Pagination'
import { FiSearch } from "react-icons/fi";
import {  getCurrentUser } from "../../helpers/utils";



const FailedHistoryTable = ({ tableData, setTableData, tempTableList, noData, setNodata }) => {

    const dummyData = tableData
    const role_id = getCurrentUser()?.user?.role_id;
    const itemsPerPage = 8;
    const [currentPage, setCurrentPage] = useState(1);
    const totalItems = dummyData.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const [searchTerm, setSearchTerm] = useState('');
    // const [nodata, setNodata] = useState('');

    // Function to handle page changes
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };
    // Calculate the starting and ending indices of the current page's items
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
    const currentItems = dummyData.slice(startIndex, endIndex);

   

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1)
        const currentValue = e.target.value;
        if (currentValue) {
            const value = e.target.value.toLowerCase();
            const colArray = ['date', 'amount', 'customer_name', 'reason', 'project_name'];
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
                    <div className='table-responsive' style={{ minHeight: '40vh' }}>
                        <Table className='custom-table '>
                            <thead>
                                <tr>
                                    <th className='theadStyle'>Date</th>
                                    <th className='theadStyle'>Amount</th>
                                    <th className='theadStyle'>Customer Name</th>
                                    <th className='theadStyle'>Project Name</th>
                                    <th className='theadStyle'>Reason</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentItems?.length > 0 ? currentItems.map((item, index) => (
                                    <tr key={index}>
                                        <td>{item?.date}</td>
                                        <td>{item?.amount}</td>
                                        <td>{item?.customer_name}</td>
                                        <td>{item?.project_name}</td>
                                        <td>{item?.reason}</td>
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
export default FailedHistoryTable;