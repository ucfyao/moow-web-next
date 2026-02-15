/** @jsxImportSource @emotion/react */
'use client';

import React, { useState, useEffect, useCallback, ChangeEvent, FormEvent } from 'react';
import { css } from '@emotion/react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import HTTP from '@/lib/http';
import util from '@/utils/util';
import Pagination from '@/components/Pagination';
import Skeleton from '@/components/Skeleton';
import ConfirmModal from '@/components/ConfirmModal';
import EmptyState from '@/components/EmptyState';

interface ExchangeKey {
  _id: string;
  exchange: string;
  access_key: string;
  secret_show: string;
  desc: string;
  created_at: string;
}

const PAGE_SIZE = 20;

export default function MarketsPage() {
  const { t } = useTranslation('');
  const [keys, setKeys] = useState<ExchangeKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });
  const [modal, setModal] = useState<{
    open: boolean;
    title: string;
    message: string;
    variant: 'danger' | 'warning' | 'info';
    onConfirm: () => void;
    loading: boolean;
  }>({ open: false, title: '', message: '', variant: 'info', onConfirm: () => {}, loading: false });

  const fetchKeys = useCallback(
    async (page: number, search: string) => {
      setLoading(true);
      try {
        const res = await HTTP.get('/v1/keys', {
          params: { pageNumber: page, pageSize: PAGE_SIZE, search },
        });
        setKeys(res.data?.list || []);
        setTotal(res.data?.total || 0);
      } catch (error: any) {
        const msg = error?.message || t('prompt.error_occurs');
        setSnackbar({ open: true, message: msg, severity: 'error' });
      } finally {
        setLoading(false);
      }
    },
    [t],
  );

  useEffect(() => {
    fetchKeys(currentPage, searchTerm);
  }, [currentPage, fetchKeys, searchTerm]);

  const handleDelete = (key: ExchangeKey) => {
    setModal({
      open: true,
      title: t('prompt.confirm_action'),
      message: t('prompt.confirm_delete_market', { exchange: key.exchange }),
      variant: 'danger',
      loading: false,
      onConfirm: async () => {
        setModal((prev) => ({ ...prev, loading: true }));
        try {
          await HTTP.delete(`/v1/keys/${key._id}`);
          setSnackbar({ open: true, message: t('prompt.operation_succeed'), severity: 'success' });
          if (keys.length === 1 && currentPage > 1) {
            setCurrentPage(currentPage - 1);
          } else {
            fetchKeys(currentPage, searchTerm);
          }
        } catch (error: any) {
          const msg = error?.message || t('prompt.operation_failed');
          setSnackbar({ open: true, message: msg, severity: 'error' });
        } finally {
          setModal((prev) => ({ ...prev, open: false, loading: false }));
        }
      },
    });
  };

  function handlePageChange(newPage: number) {
    setCurrentPage(newPage);
  }

  function handleSearchChange(e: ChangeEvent<HTMLInputElement>) {
    setSearchTerm(e.target.value);
  }

  function handleSearchSubmit(e: FormEvent) {
    e.preventDefault();
    setCurrentPage(1);
    fetchKeys(1, searchTerm);
  }

  return (
    <div css={pageStyle} className="container">
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
      <section className="section">
        <div className="box">
          <div className="box-header">
            <div className="tabs">
              <ul>
                <li className="is-active">
                  <a>{t('caption.market_api_keys')}</a>
                </li>
              </ul>
            </div>
            <Link href="/aip/addmarketkeys" className="button is-link is-small">
              {t('action.new_exchange_apikey')}
            </Link>
          </div>
          <form className="search-bar" onSubmit={handleSearchSubmit}>
            <div className="field has-addons">
              <div className="control is-expanded">
                <input
                  className="input is-small"
                  type="text"
                  placeholder={t('placeholder.search_exchange')}
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
              </div>
              <div className="control">
                <button type="submit" className="button is-link is-small">
                  {t('action.confirm')}
                </button>
              </div>
            </div>
          </form>
          {loading ? (
            <div style={{ padding: '20px 0' }}>
              <Skeleton variant="text" count={5} height="2.5rem" />
            </div>
          ) : keys.length === 0 ? (
            <EmptyState
              title={t('empty.no_exchange_keys')}
              description={t('empty.add_exchange_key')}
              actionText={t('action.new_exchange_apikey')}
              actionHref="/aip/addmarketkeys"
            />
          ) : (
            <div className="table-container">
              <table
                className="table is-fullwidth is-striped"
                style={{ minWidth: '800px', fontSize: '0.85rem' }}
              >
                <thead>
                  <tr>
                    <th>{t('title.exchange')}</th>
                    <th>{t('label.access_key')}</th>
                    <th>{t('label.secret_key')}</th>
                    <th>{t('label.creation_time')}</th>
                    <th>{t('title.operations')}</th>
                  </tr>
                </thead>
                <tbody>
                  {keys.map((key) => (
                    <tr key={key._id}>
                      <td>{key.exchange}</td>
                      <td>{key.access_key}</td>
                      <td>{key.secret_show}</td>
                      <td>{util.formatDate(key.created_at)}</td>
                      <td>
                        <button
                          className="button is-small is-link is-outlined"
                          onClick={() => handleDelete(key)}
                        >
                          {t('action.delete')}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {!loading && total > 0 && (
            <Pagination
              current={currentPage}
              total={total}
              pageSize={PAGE_SIZE}
              showTotal={false}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      </section>

      <ConfirmModal
        isOpen={modal.open}
        title={modal.title}
        message={modal.message}
        variant={modal.variant}
        loading={modal.loading}
        onConfirm={modal.onConfirm}
        onCancel={() => setModal((prev) => ({ ...prev, open: false }))}
      />
    </div>
  );
}

const pageStyle = css`
  .box-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  .box-header .tabs {
    margin-bottom: 0;
  }

  .search-bar {
    margin-bottom: 1rem;
  }

  .py-4 {
    padding: 2rem 0;
  }
`;
