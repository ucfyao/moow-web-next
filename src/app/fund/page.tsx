/** @jsxImportSource @emotion/react */
'use client';

import { css } from '@emotion/react';
import { useTranslation } from 'react-i18next';

const fundStyle = css`
  .fund-container {
    max-width: 1024px;
    margin: 2rem auto;
    padding: 0 1.5rem;
  }
  .fund-card {
    margin-bottom: 2rem;
    padding: 1.5rem;
  }
  .fund-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }
  .fund-name {
    font-size: 1.3rem;
    font-weight: 600;
  }
  .fund-status {
    color: #48c774;
    font-weight: 500;
  }
  .fund-metrics {
    display: flex;
    gap: 2rem;
    flex-wrap: wrap;
    margin-bottom: 1rem;
  }
  .metric-item {
    text-align: center;
  }
  .metric-label {
    font-size: 0.85rem;
    color: #7a7a7a;
  }
  .metric-value {
    font-size: 1.1rem;
    font-weight: 600;
  }
  .positive {
    color: #48c774;
  }
  .negative {
    color: #f14668;
  }
  .fund-placeholder {
    height: 200px;
    background: #f5f5f5;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #b5b5b5;
  }
`;

export default function FundPage() {
  const { t } = useTranslation('');

  const funds = [
    {
      name: t('b10_index_fund'),
      status: t('status_open') || 'Open',
      metrics: [
        { label: t('change_24h') || '24h', value: '+2.3%', positive: true },
        { label: t('change_week') || '7d', value: '-1.2%', positive: false },
        { label: t('change_month') || '30d', value: '+8.7%', positive: true },
      ],
      size: '125,000 USDT',
    },
    {
      name: t('xiaobao_fund'),
      status: t('status_open') || 'Open',
      metrics: [
        { label: t('change_24h') || '24h', value: '+0.8%', positive: true },
        { label: t('change_week') || '7d', value: '+3.5%', positive: true },
        { label: t('change_month') || '30d', value: '+12.1%', positive: true },
      ],
      size: '80,000 USDT',
    },
  ];

  return (
    <div css={fundStyle}>
      <div className="fund-container">
        <h1 className="title is-4">{t('index_fund')}</h1>

        {funds.map((fund, idx) => (
          <div key={idx} className="box fund-card">
            <div className="fund-header">
              <span className="fund-name">{fund.name}</span>
              <span className="fund-status">{fund.status}</span>
            </div>

            <div className="fund-metrics">
              {fund.metrics.map((m, i) => (
                <div key={i} className="metric-item">
                  <div className="metric-label">{m.label}</div>
                  <div className={`metric-value ${m.positive ? 'positive' : 'negative'}`}>
                    {m.value}
                  </div>
                </div>
              ))}
              <div className="metric-item">
                <div className="metric-label">{t('fund_size')}</div>
                <div className="metric-value">{fund.size}</div>
              </div>
            </div>

            <div className="fund-placeholder">
              Chart placeholder — integrate Highcharts when backend fund API is available
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
