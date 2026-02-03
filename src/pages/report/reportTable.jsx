import React, { useState } from 'react';
import { Table } from 'reactstrap';
import CustomPagination from '../../components/constants/Pagination'



const ReportTable = ({ listData, from }) => {

    const dummyData = listData
    const itemsPerPage = 8;
    const [currentPage, setCurrentPage] = useState(1);
    const totalItems = dummyData.length;
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
                        {from !== 'ad' &&
                            <th className='theadStyle'>Type</th>
                        }
                        <th className='theadStyle'>Name</th>
                        <th className='theadStyle'>Views</th>
                        <th className='theadStyle'>Interactions</th>
                    </tr>
                </thead>
                <tbody>
                    {currentItems?.length > 0 ? currentItems.map((item, index) => (
                        <tr key={index}>
                            {from !== 'ad' &&
                                <td>{item?.type}</td>
                            }
                            <td>{from !== 'ad' ? item?.name : item?.banner_name}</td>
                            <td>{item.total_views}</td>
                            <td>{item.total_interactions}</td>
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
export default ReportTable;