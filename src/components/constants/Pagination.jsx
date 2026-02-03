import React from 'react';
import { Pagination, PaginationItem, PaginationLink } from 'reactstrap';
import { FaLessThan } from 'react-icons/fa';
import { FaGreaterThan } from 'react-icons/fa';



const CustomPagination = ({ currentPage, totalPages, onPageChange, itemsPerPage, tableData }) => {
    const isFirstPage = currentPage === 1;
    const isLastPage = currentPage === totalPages;
    const startIndex = (currentPage - 1) * itemsPerPage + 1;
    const endIndex = Math.min(startIndex + itemsPerPage - 1, tableData.length);
    const totalItems = tableData.length;

    return (
        <div className="pagination">
            <span className="results-info" style={{ fontSize: '0.875rem', color: '#212529' }}>
                {startIndex} - {endIndex} of {totalItems} Results
            </span>
            <Pagination>
                <PaginationItem disabled={isFirstPage}>
                    <PaginationLink onClick={() => onPageChange(currentPage - 1)} className='mr-2' style={{ fontSize: '0.875rem', borderRadius: '3px' }}>
                        <div className='d-flex' style={{ alignItems: 'center', }}>
                            {/* <FaLessThan className='mr-1' /> */}
                            Previous
                        </div>
                    </PaginationLink>
                </PaginationItem>
                {[...Array(totalPages)].map((_, page) => (
                    <PaginationItem key={page} active={currentPage === page + 1}>
                        <PaginationLink onClick={() => onPageChange(page + 1)} className='mr-2' style={{ fontSize: '0.875rem', borderRadius: '3px' }}>
                            {page + 1}
                        </PaginationLink>
                    </PaginationItem>
                ))}
                <PaginationItem disabled={(totalItems == 0) || isLastPage}>
                    <PaginationLink onClick={() => onPageChange(currentPage + 1)} style={{ fontSize: '0.875rem', borderRadius: '3px' }} >
                        <div className='d-flex' style={{ alignItems: 'center' }}>
                            Next
                            {/* <FaGreaterThan className='ml-1' /> */}
                        </div>
                    </PaginationLink>
                </PaginationItem>
            </Pagination>
        </div>
    );
};

export default CustomPagination;
