import React, { useState, useEffect } from 'react';
import { useTranslation } from 'next-i18next';

interface PaginationProps {
  current: number;
  total: number;
  pageSize?: number;
  showTotal: boolean;
  onPageChange: (newPage: number) => void;
}

function Pagination({
  current = 1,
  total = 0,
  pageSize = 10,
  showTotal = false,
  onPageChange,
}: PaginationProps) {
  const { t } = useTranslation('');
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

  function changePage(page: number) {
    if (currentPage !== page) {
      setCurrentPage(page);
      onPageChange(page);
    }
  }

  function prev() {
    if (currentPage > 1) {
      changePage(currentPage - 1);
    }
  }

  function next() {
    if (currentPage < allPages) {
      changePage(currentPage + 1);
    }
  }

  return (
    <nav className="pagination is-centered is-small" role="navigation" aria-label="pagination">
      <ul className="pagination-list">
        {!showTotal && (
          <span>
            {t('pager.total')} {total} {total <= 1 ? t('pager.item') : t('pager.items')}
          </span>
        )}
        <li title={t('pager.prev')}>
          <button
            type="button"
            className="pagination-link pagination-previous"
            onClick={prev}
            disabled={currentPage === 1}
          >
            &lt;
          </button>
        </li>
        <li title="1">
          <button
            type="button"
            className={`pagination-link ${currentPage === 1 ? 'is-current' : ''}`}
            onClick={() => changePage(1)}
          >
            1
          </button>
        </li>
        {currentPage > 5 && (
          <li>
            <span className="pagination-ellipsis">&hellip;</span>
          </li>
        )}
        {currentPage === 5 && (
          <li title={(currentPage - 3).toString()}>
            <button
              type="button"
              className="pagination-link"
              onClick={() => changePage(currentPage - 3)}
            >
              {currentPage - 3}
            </button>
          </li>
        )}
        {currentPage - 2 > 1 && (
          <li title={(currentPage - 2).toString()}>
            <button
              type="button"
              className="pagination-link"
              onClick={() => changePage(currentPage - 2)}
            >
              {currentPage - 2}
            </button>
          </li>
        )}
        {currentPage - 1 > 1 && (
          <li title={(currentPage - 1).toString()}>
            <button
              type="button"
              className="pagination-link"
              onClick={() => changePage(currentPage - 1)}
            >
              {currentPage - 1}
            </button>
          </li>
        )}
        {currentPage !== 1 && currentPage !== allPages && (
          <li title={currentPage.toString()}>
            <button type="button" className="pagination-link is-current">
              {currentPage}
            </button>
          </li>
        )}
        {currentPage + 1 < allPages && (
          <li title={(currentPage + 1).toString()}>
            <button
              type="button"
              className="pagination-link"
              onClick={() => changePage(currentPage + 1)}
            >
              {currentPage + 1}
            </button>
          </li>
        )}
        {currentPage + 2 < allPages && (
          <li title={(currentPage + 2).toString()}>
            <button
              type="button"
              className="pagination-link"
              onClick={() => changePage(currentPage + 2)}
            >
              {currentPage + 2}
            </button>
          </li>
        )}
        {allPages - currentPage === 4 && (
          <li title={(currentPage + 3).toString()}>
            <button
              type="button"
              className="pagination-link"
              onClick={() => changePage(currentPage + 3)}
            >
              {currentPage + 3}
            </button>
          </li>
        )}
        {allPages - currentPage >= 5 && (
          <li>
            <span className="pagination-ellipsis">&hellip;</span>
          </li>
        )}
        {allPages > 1 && (
          <li title={allPages.toString()}>
            <button
              type="button"
              className={`pagination-link ${currentPage === allPages ? 'is-current' : ''}`}
              onClick={() => changePage(allPages)}
            >
              {allPages}
            </button>
          </li>
        )}
        <li title={t('pager.next')}>
          <button
            type="button"
            className="pagination-link pagination-next"
            disabled={currentPage === allPages}
            onClick={next}
          >
            &gt;
          </button>
        </li>
      </ul>
    </nav>
  );
}

export default Pagination;
