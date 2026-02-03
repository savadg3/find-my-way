import React, { useState } from 'react';
import { Table } from 'reactstrap';
import CustomPagination from '../../components/constants/Pagination'



const ReportVisitorTable = ({ data }) => {

    const dummyData = data
    const itemsPerPage = 8;
    const [currentPage, setCurrentPage] = useState(1);
    const totalItems = dummyData?.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    // Function to handle page changes
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    // Calculate the starting and ending indices of the current page's items
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
    const currentItems = dummyData.slice(startIndex, endIndex);

    return (
        <>
            <div className='table-responsive'>
                <Table className='custom-table'>
                    <thead>
                        <tr>
                            <th className='theadStyle'>QR Code Beacon</th>
                            <th className='theadStyle'>Interactions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentItems?.length > 0 ? currentItems.map((item, index) => (
                            <tr key={index}>
                                <td>{item?.beacon_name}</td>
                                <td>{item?.count}</td>
                            </tr>
                        )) :
                            <tr >
                                <td colSpan={4}><span >No data found.</span></td>
                            </tr>}
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
        </>
    )
}
export default ReportVisitorTable;