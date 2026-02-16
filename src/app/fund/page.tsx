/** @jsxImportSource @emotion/react */
'use client';

import { useState, useEffect, useRef } from 'react';
import { css } from '@emotion/react';
import { useTranslation } from 'react-i18next';
import Highcharts from 'highcharts';
import HTTP from '@/lib/http';

interface BtcHistoryItem {
  date: string;
  close: number;
}

const fundStyle = css`
  .fund-container {
    max-width: 1024px;
    margin: 2rem auto;
    padding: 0 1.5rem;
  }
  .fund-card {
    margin-bottom: 2rem;
    padding: 1.5rem;
    &:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
    }
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
  .fund-chart {
    min-height: 280px;
    margin-top: 0.5rem;
  }
`;

function FundChart({
  data,
  color,
  label,
}: {
  data: BtcHistoryItem[];
  color: string;
  label: string;
}) {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartRef.current || data.length === 0) return;

    const categories = data.map((d) => d.date);
    const prices = data.map((d) => d.close);

    Highcharts.chart(chartRef.current, {
      chart: {
        type: 'area',
        zooming: {
          type: 'x',
          resetButton: {
            position: { align: 'right', verticalAlign: 'top', x: -10, y: 10 },
          },
        },
      },
      title: { text: undefined },
      subtitle: { text: 'BTC/USDT' },
      xAxis: {
        categories,
        tickInterval: Math.ceil(categories.length / 6),
        labels: { rotation: -45 },
      },
      yAxis: {
        title: { text: label },
        labels: { format: '${value:,.0f}' },
      },
      tooltip: {
        shared: true,
        crosshairs: true,
        headerFormat: '<b>{point.key}</b><br/>',
        pointFormat:
          '<span style="color:{series.color}">\u25CF</span> {series.name}: <b>${point.y:,.2f}</b><br/>',
      },
      plotOptions: {
        area: {
          fillOpacity: 0.15,
          marker: { enabled: false },
          lineWidth: 2,
        },
      },
      series: [
        {
          type: 'area',
          name: label,
          data: prices,
          color,
        },
      ],
      accessibility: {
        description: 'Fund performance chart showing BTC price history',
      },
      credits: { enabled: false },
    });
  }, [data, color, label]);

  return <div ref={chartRef} className="fund-chart" aria-label={label} role="img" />;
}

export default function FundPage() {
  const { t } = useTranslation('');
  const [btcHistory, setBtcHistory] = useState<BtcHistoryItem[]>([]);

  useEffect(() => {
    HTTP.get('/v1/public/btc-history', { params: { limit: 365 } })
      .then((res: any) => {
        if (res?.data?.list?.length) {
          setBtcHistory(res.data.list);
        }
        return res;
      })
      .catch(() => {
        // silently fail
      });
  }, []);

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
      color: '#3273dc',
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
      color: '#48c774',
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

            {btcHistory.length > 0 ? (
              <FundChart data={btcHistory} color={fund.color} label={t('home.btc_price')} />
            ) : (
              <div
                style={{
                  height: 200,
                  background: '#f5f5f5',
                  borderRadius: 6,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#b5b5b5',
                }}
              >
                {t('prompt.loading')}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
