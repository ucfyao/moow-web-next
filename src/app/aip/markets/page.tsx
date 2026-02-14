/** @jsxImportSource @emotion/react */
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { css } from '@emotion/react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import HTTP from '@/lib/http';
import util from '@/utils/util';

interface ExchangeKey {
  _id: string;
  exchange: string;
  access_key: string;
  secret_show: string;
  desc: string;
  created_at: string;
}

export default function MarketsPage() {
  const { t } = useTranslation('');
  const [keys, setKeys] = useState<ExchangeKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [alertMessage, setAlertMessage] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [open, setOpen] = useState(false);

  const fetchKeys = useCallback(async () => {
    try {
      const res = await HTTP.get('/v1/keys');
      setKeys(res.data?.list || []);
    } catch (error: any) {
      const msg = error?.message || t('prompt.error_occurs');
      setAlertMessage({ type: 'error', message: msg });
      setOpen(true);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchKeys();
  }, [fetchKeys]);

  const handleDelete = async (key: ExchangeKey) => {
    const confirmed = window.confirm(
      t('prompt.confirm_delete_market', { exchange: key.exchange }),
    );
    if (!confirmed) return;

    try {
      await HTTP.delete(`/v1/keys/${key._id}`);
      setAlertMessage({ type: 'success', message: t('prompt.operation_succeed') });
      setOpen(true);
      fetchKeys();
    } catch (error: any) {
      const msg = error?.message || t('prompt.operation_failed');
      setAlertMessage({ type: 'error', message: msg });
      setOpen(true);
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div css={pageStyle} className="container">
      <Snackbar
        open={open}
        autoHideDuration={6000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        {alertMessage ? (
          <Alert onClose={handleClose} severity={alertMessage.type}>
            {alertMessage.message}
          </Alert>
        ) : undefined}
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
          {loading ? (
            <p className="has-text-centered py-4">{t('prompt.loading')}</p>
          ) : keys.length === 0 ? (
            <p className="has-text-centered has-text-grey py-4">
              {t('prompt.no_exchange_keys')}
            </p>
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
        </div>
      </section>
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

  .py-4 {
    padding: 2rem 0;
  }
`;
