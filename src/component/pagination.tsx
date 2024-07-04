import React, { useState, useEffect } from 'react';

interface PaginationProps {
  current: number;
  total: number;
  pageSize: number;
  showTotal: boolean;
  onPageChange: (newPage: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  current,
  total,
  pageSize,
  showTotal,
  onPageChange,
}) => {
  const [currentPage, setCurrentPage] = useState(current);
  const [currentPageSize, setCurrentPageSize] = useState(pageSize);

  const allPages = Math.ceil(total / currentPageSize) || 1;

  useEffect(() => {
    setCurrentPage(current);
  }, [current]);

  useEffect(() => {
    setCurrentPageSize(pageSize);
  }, [pageSize]);

  useEffect(() => {
    const maxPage = Math.ceil(total / currentPageSize);
    if (maxPage < currentPage && maxPage > 0) {
      setCurrentPage(maxPage);
    }
  }, [total, currentPage, currentPageSize]);

  const changePage = (page: number) => {
    if (currentPage !== page) {
      setCurrentPage(page);
      onPageChange(page);
    }
  };

  const prev = () => {
    if (currentPage > 1) {
      changePage(currentPage - 1);
    }
  };

  const next = () => {
    if (currentPage < allPages) {
      changePage(currentPage + 1);
    }
  };

  return (
    <nav
      className="pagination is-centered is-small"
      role="navigation"
      aria-label="pagination"
      style={{ marginTop: '10px' }}
    >
      <ul className="pagination-list">
        {!showTotal && (
          <span>
            Total {total} {total <= 1 ? 'item' : 'items'}
          </span>
        )}
        <li title="Previous" onClick={prev}>
          <button className="pagination-link pagination-previous" disabled={currentPage === 1}>
            &lt;
          </button>
        </li>
        <li title="1" onClick={() => changePage(1)}>
          <button className={`pagination-link ${currentPage === 1 ? 'is-current' : ''}`}>1</button>
        </li>
        {currentPage > 5 && (
          <li>
            <span className="pagination-ellipsis">&hellip;</span>
          </li>
        )}
        {currentPage === 5 && (
          <li title={(currentPage - 3).toString()} onClick={() => changePage(currentPage - 3)}>
            <button className="pagination-link">{currentPage - 3}</button>
          </li>
        )}
        {currentPage - 2 > 1 && (
          <li title={(currentPage - 2).toString()} onClick={() => changePage(currentPage - 2)}>
            <button className="pagination-link">{currentPage - 2}</button>
          </li>
        )}
        {currentPage - 1 > 1 && (
          <li title={(currentPage - 1).toString()} onClick={() => changePage(currentPage - 1)}>
            <button className="pagination-link">{currentPage - 1}</button>
          </li>
        )}
        {currentPage !== 1 && currentPage !== allPages && (
          <li title={currentPage.toString()}>
            <button className="pagination-link is-current">{currentPage}</button>
          </li>
        )}
        {currentPage + 1 < allPages && (
          <li title={(currentPage + 1).toString()} onClick={() => changePage(currentPage + 1)}>
            <button className="pagination-link">{currentPage + 1}</button>
          </li>
        )}
        {currentPage + 2 < allPages && (
          <li title={(currentPage + 2).toString()} onClick={() => changePage(currentPage + 2)}>
            <button className="pagination-link">{currentPage + 2}</button>
          </li>
        )}
        {allPages - currentPage === 4 && (
          <li title={(currentPage + 3).toString()} onClick={() => changePage(currentPage + 3)}>
            <button className="pagination-link">{currentPage + 3}</button>
          </li>
        )}
        {allPages - currentPage >= 5 && (
          <li>
            <span className="pagination-ellipsis">&hellip;</span>
          </li>
        )}
        {allPages > 1 && (
          <li title={allPages.toString()} onClick={() => changePage(allPages)}>
            <button className={`pagination-link ${currentPage === allPages ? 'is-current' : ''}`}>
              {allPages}
            </button>
          </li>
        )}
        <li title="Next" onClick={next}>
          <button className="pagination-link pagination-next" disabled={currentPage === allPages}>
            &gt;
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default Pagination;
