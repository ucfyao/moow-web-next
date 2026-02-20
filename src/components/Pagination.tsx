import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';

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

  const allPages = Math.ceil(total / pageSize) || 1;

  function changePage(page: number) {
    if (current !== page) {
      onPageChange(page);
    }
  }

  function prev() {
    if (current > 1) {
      changePage(current - 1);
    }
  }

  function next() {
    if (current < allPages) {
      changePage(current + 1);
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
            disabled={current === 1}
          >
            &lt;
          </button>
        </li>
        <li title="1">
          <button
            type="button"
            className={`pagination-link ${current === 1 ? 'is-current' : ''}`}
            onClick={() => changePage(1)}
          >
            1
          </button>
        </li>
        {current > 5 && (
          <li>
            <span className="pagination-ellipsis">&hellip;</span>
          </li>
        )}
        {current === 5 && (
          <li title={(current - 3).toString()}>
            <button
              type="button"
              className="pagination-link"
              onClick={() => changePage(current - 3)}
            >
              {current - 3}
            </button>
          </li>
        )}
        {current - 2 > 1 && (
          <li title={(current - 2).toString()}>
            <button
              type="button"
              className="pagination-link"
              onClick={() => changePage(current - 2)}
            >
              {current - 2}
            </button>
          </li>
        )}
        {current - 1 > 1 && (
          <li title={(current - 1).toString()}>
            <button
              type="button"
              className="pagination-link"
              onClick={() => changePage(current - 1)}
            >
              {current - 1}
            </button>
          </li>
        )}
        {current !== 1 && current !== allPages && (
          <li title={current.toString()}>
            <button type="button" className="pagination-link is-current">
              {current}
            </button>
          </li>
        )}
        {current + 1 < allPages && (
          <li title={(current + 1).toString()}>
            <button
              type="button"
              className="pagination-link"
              onClick={() => changePage(current + 1)}
            >
              {current + 1}
            </button>
          </li>
        )}
        {current + 2 < allPages && (
          <li title={(current + 2).toString()}>
            <button
              type="button"
              className="pagination-link"
              onClick={() => changePage(current + 2)}
            >
              {current + 2}
            </button>
          </li>
        )}
        {allPages - current === 4 && (
          <li title={(current + 3).toString()}>
            <button
              type="button"
              className="pagination-link"
              onClick={() => changePage(current + 3)}
            >
              {current + 3}
            </button>
          </li>
        )}
        {allPages - current >= 5 && (
          <li>
            <span className="pagination-ellipsis">&hellip;</span>
          </li>
        )}
        {allPages > 1 && (
          <li title={allPages.toString()}>
            <button
              type="button"
              className={`pagination-link ${current === allPages ? 'is-current' : ''}`}
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
            disabled={current === allPages}
            onClick={next}
          >
            &gt;
          </button>
        </li>
      </ul>
    </nav>
  );
}

export default memo(Pagination);
