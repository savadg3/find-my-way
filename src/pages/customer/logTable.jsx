import React, {useState } from 'react';
import { Table } from 'reactstrap';
import CustomPagination from '../../components/constants/Pagination'
import {
    Row,
    Col,
} from "reactstrap";


const LogTable = ({
    dataSource, setDataSource,
    getCustomerLog
}) => {

    const [noData, setNodata] = useState(false);
    const itemsPerPage = 8;
    const [currentPage, setCurrentPage] = useState(1);
    const totalItems = dataSource?.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    // Function to handle page changes
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        getCustomerLog();
    };

    // Calculate the starting and ending indices of the current page's items
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
    const currentItems = dataSource?.slice(startIndex, endIndex);

    return (
        <>
            <Row className="mt-3">
                <Col md={12}>
                    <Table className=' custom-table'>
                        <thead>
                            <tr>
                                <th className='theadStyle'>Sl.No</th>
                                <th className='theadStyle'>Project Name</th>
                                <th className='theadStyle'>Activity Type</th>
                                <th className='theadStyle'>Basic Plan</th>
                                <th className='theadStyle'>Additional Plan</th>
                                <th className='theadStyle'>Ip Address</th>
                                <th className='theadStyle'>Date and Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(!noData) ?
                                currentItems.map((item, index) => (
                                    <tr key={index}>
                                        <td>{index + 1}</td>
                                        <td>{item?.project_name}</td>
                                        <td>{item?.type}</td>
                                        <td>{item?.is_basic}</td>
                                        <td> {item?.is_add ? `${item?.is_add} (${item?.add_count})` : ''}</td>
                                        <td>{item?.ip_address}</td>
                                        <td>{item?.accepted_at}</td>
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
export default LogTable;