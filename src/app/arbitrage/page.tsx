/** @jsxImportSource @emotion/react */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { css } from '@emotion/react';
import { useTranslation } from 'react-i18next';
import HTTP from '@/lib/http';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

const arbitrageStyle = css`
  .container {
    margin-top: 40px;
    margin-bottom: 60px;
    max-width: 1344px;
  }

  .filter-bar {
    display: flex;
    gap: 16px;
    align-items: center;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
  }

  .filter-bar .field {
    margin-bottom: 0;
  }

  .table {
    font-size: 0.85rem;
  }

  thead,
  th {
    background-color: #fafafa;
    color: #4f6475;
    font-weight: 400;
  }

  td {
    vertical-align: middle;
  }

  .diff-high {
    color: #23d160;
    font-weight: 600;
  }

  .diff-low {
    color: #ff3860;
  }

  .auto-refresh-label {
    font-size: 0.8rem;
    color: #999;
  }

  .loading-container {
    text-align: center;
    padding: 60px 0;
    color: #999;
  }
`;

interface Ticker {
  exchange: string;
  symbol: string;
  bid: number;
  ask: number;
  last: number;
}

interface Opportunity {
  symbol: string;
  from: Ticker;
  to: Ticker;
  diff: string;
  rawdiff: number;
}

const REFRESH_INTERVAL = 30000; // 30 seconds

export default function ArbitragePage() {
  const { t } = useTranslation();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [minProfit, setMinProfit] = useState(1);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  const fetchOpportunities = useCallback(async () => {
    try {
      const res: any = await HTTP.get('/v1/arbitrage/opportunities', {
        params: { minProfit },
      });
      if (res?.data?.list) {
        setOpportunities(res.data.list);
        setLastUpdated(new Date().toLocaleTimeString());
      }
    } catch (error: any) {
      console.error(error);
      setSnackbar({
        open: true,
        message: error?.message || t('prompt.operation_failed'),
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, [minProfit, t]);

  useEffect(() => {
    fetchOpportunities();
    const interval = setInterval(fetchOpportunities, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchOpportunities]);

  function getDiffClass(rawdiff: number): string {
    if (rawdiff >= 3) return 'diff-high';
    if (rawdiff < 0) return 'diff-low';
    return '';
  }

  return (
    <div css={arbitrageStyle} className="container">
      <section className="section">
        <div className="box">
          <h4 className="title is-4">{t('title.arbitrage_opportunities')}</h4>

          <div className="filter-bar">
            <div className="field">
              <label className="label is-small">{t('label.min_profit')} %</label>
              <div className="control">
                <input
                  className="input is-small"
                  type="number"
                  value={minProfit}
                  min={0}
                  step={0.5}
                  onChange={(e) => setMinProfit(parseFloat(e.target.value) || 0)}
                  style={{ width: '100px' }}
                />
              </div>
            </div>
            <div className="field">
              <label className="label is-small">&nbsp;</label>
              <button
                className="button is-small is-info"
                onClick={() => {
                  setLoading(true);
                  fetchOpportunities();
                }}
              >
                {t('action.refresh')}
              </button>
            </div>
            {lastUpdated && (
              <span className="auto-refresh-label">
                {t('label.last_updated')}: {lastUpdated} ({t('label.auto_refresh_30s')})
              </span>
            )}
          </div>

          <div className="table-wrapper">
            {loading ? (
              <div className="loading-container">{t('prompt.loading')}</div>
            ) : opportunities.length > 0 ? (
              <table className="table is-fullwidth is-striped is-hoverable">
                <thead>
                  <tr>
                    <th>{t('title.symbol')}</th>
                    <th>{t('title.buy_from')}</th>
                    <th>{t('title.buy_price')}</th>
                    <th>{t('title.sell_to')}</th>
                    <th>{t('title.sell_price')}</th>
                    <th>{t('title.diff_percent')}</th>
                  </tr>
                </thead>
                <tbody>
                  {opportunities.map((opp, idx) => (
                    <tr key={`${opp.symbol}-${idx}`}>
                      <td>
                        <strong>{opp.symbol}</strong>
                      </td>
                      <td>{opp.from.exchange}</td>
                      <td>{opp.from.ask?.toFixed(2)}</td>
                      <td>{opp.to.exchange}</td>
                      <td>{opp.to.bid?.toFixed(2)}</td>
                      <td className={getDiffClass(opp.rawdiff)}>{opp.diff}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="notification is-light">
                {t('prompt.no_arbitrage_opportunities')}
              </div>
            )}
          </div>
        </div>
      </section>

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
    </div>
  );
}
