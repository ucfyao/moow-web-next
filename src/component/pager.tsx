import React, { useState, FC } from 'react';

interface Props {
  tableData: any[];
  onPageChange: (pageNumber: number) => void;
}

const Pager: FC<Props> = ({ tableData, onPageChange }) => {
  const itemsPerPage = 10;
  const totalPages = Math.ceil(tableData.length / itemsPerPage);
  const [currentPage, setCurrentPage] = useState(1);

  const handleClick = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    onPageChange(pageNumber); 
  };

  const renderPageNumbers = () => {
    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(
        <li key={i}>
          <a
            className={`pagination-link ${currentPage === i ? 'is-current' : ''}`}
            aria-label={`Goto page ${i}`}
            aria-current={currentPage === i ? 'page' : undefined}
            onClick={() => handleClick(i)}>
            {i}
          </a>
        </li>
      );
    }
    return pageNumbers;
  };

  return (
    <nav className="pagination is-small is-centered" style={{paddingTop:'20px'}} role="navigation" aria-label="pagination">
      <button
        className={`pagination-previous ${currentPage === 1 ? 'is-disabled' : ''}`}
        onClick={() => handleClick(currentPage - 1)}
        disabled={currentPage === 1}>
        Previous
      </button>
      <button
        className={`pagination-next ${currentPage === totalPages ? 'is-disabled' : ''}`}
        onClick={() => handleClick(currentPage + 1)}
        disabled={currentPage === totalPages}>
        Next page
      </button>
      <ul className="pagination-list">
        {renderPageNumbers()}
      </ul>
    </nav>
  );
};

export default Pager;
