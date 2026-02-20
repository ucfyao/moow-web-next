'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import '@/i18n';
import HTTP from '@/lib/http';
import util from '@/utils/util';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

// --- Types ---

interface Rate {
  _id: string;
  currency: string;
  frate: number;
  created_at: string;
  updated_at: string;
}

// --- Constants & Module-level pure functions ---

const VIRTUAL_COINS = ['btc', 'eth', 'ltc', 'bch'];

function isVirtualCoin(currency: string): boolean {
  return VIRTUAL_COINS.includes(currency.toLowerCase());
}

function getCurrencyIcon(currency: string): string {
  switch (currency.toLowerCase()) {
    case 'btc':
      return 'fa-bitcoin';
    case 'eth':
      return 'fa-diamond';
    case 'ltc':
      return 'fa-bolt';
    case 'bch':
      return 'fa-cube';
    case 'usd':
      return 'fa-dollar';
    case 'eur':
      return 'fa-eur';
    case 'jpy':
      return 'fa-jpy';
    case 'krw':
      return 'fa-krw';
    case 'rub':
      return 'fa-rub';
    case 'cny':
      return 'fa-cny';
    default:
      return 'fa-money';
  }
}

function formatRate(rate: number, currency: string): string {
  if (isVirtualCoin(currency)) {
    return rate.toFixed(2);
  }
  return rate.toFixed(4);
}

// --- Component ---

export default function AdminRates() {
  const { t } = useTranslation();

  // List state
  const [rates, setRates] = useState<Rate[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter
  const [searchKeyword, setSearchKeyword] = useState('');

  // Snackbar
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  // --- Data Fetching ---

  const fetchRates = useCallback(async () => {
    setLoading(true);
    try {
      const res: any = await HTTP.get('/api/v1/rates');
      setRates(res.data.list);
    } catch (error: any) {
      console.error('Failed to fetch rates:', error);
      setSnackbar({
        open: true,
        message: error?.message || t('prompt.operation_failed'),
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchRates();
  }, [fetchRates]);

  // --- Client-side filtering ---

  const filteredRates = useMemo(() => {
    if (!searchKeyword.trim()) return rates;
    const keyword = searchKeyword.trim().toLowerCase();
    return rates.filter((r) => r.currency.toLowerCase().includes(keyword));
  }, [rates, searchKeyword]);

  // --- Handlers ---

  const handleCloseSnackbar = useCallback(() => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  }, []);

  // --- Render ---

  return (
    <div>
      <h1 className="title is-4">{t('admin.rate_management')}</h1>

      {/* Toolbar: Search + Refresh */}
      <div className="admin-rates-toolbar">
        <div className="field has-addons">
          <div className="control has-icons-left" style={{ width: '300px' }}>
            <input
              className="input is-small"
              type="text"
              placeholder={t('admin.rate_search_placeholder')}
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
            />
            <span className="icon is-small is-left">
              <i className="fa fa-search" />
            </span>
          </div>
        </div>

        <button
          type="button"
          className="button is-small is-info is-outlined"
          onClick={fetchRates}
          disabled={loading}
        >
          <span className="icon is-small">
            <i className={`fa fa-refresh ${loading ? 'fa-spin' : ''}`} />
          </span>
          <span>{t('admin.rate_refresh')}</span>
        </button>
      </div>

      {/* Rates Table */}
      {loading ? (
        <div className="admin-rates-loading">
          <span className="icon is-large">
            <i className="fa fa-spinner fa-pulse fa-2x" />
          </span>
          <p>{t('admin.loading_rates')}</p>
        </div>
      ) : filteredRates.length === 0 ? (
        <div className="admin-rates-empty">
          <span className="icon is-large has-text-grey-light">
            <i className="fa fa-exchange fa-2x" />
          </span>
          <p className="has-text-grey">{t('admin.no_rates')}</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="table is-fullwidth is-hoverable is-narrow admin-rates-table">
            <thead>
              <tr>
                <th>{t('admin.rate_currency')}</th>
                <th>{t('admin.rate_type')}</th>
                <th>{t('admin.rate_exchange_rate')}</th>
                <th>{t('admin.rate_updated')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredRates.map((rate) => (
                <tr key={rate._id}>
                  <td>
                    <span className="admin-rates-currency">
                      <span className="icon is-small">
                        <i className={`fa ${getCurrencyIcon(rate.currency)}`} />
                      </span>
                      {rate.currency.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    {isVirtualCoin(rate.currency) ? (
                      <span className="tag is-info">{t('admin.rate_type_virtual')}</span>
                    ) : (
                      <span className="tag is-light">{t('admin.rate_type_legal')}</span>
                    )}
                  </td>
                  <td>
                    <span className="admin-rates-value">
                      {formatRate(rate.frate, rate.currency)}
                    </span>
                  </td>
                  <td>{util.formatDate(rate.updated_at, 'yyyy-MM-dd HH:mm')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
}
