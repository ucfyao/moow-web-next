/** @jsxImportSource @emotion/react */

'use client';

import { useState, useEffect, useCallback, ChangeEvent } from 'react';
import { css } from '@emotion/react';
import Pagination from '@/components/Pagination';
import Skeleton from '@/components/Skeleton';
import EmptyState from '@/components/EmptyState';
import util from '@/utils/util';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import HTTP from '@/lib/http';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

const ordersPageStyle = css`
  .container {
    margin-top: 40px;
    margin-bottom: 60px;
    max-width: 1344px;
  }

  .tabs {
    margin-bottom: 1.5rem;
  }

  .table-wrapper {
    overflow-x: auto;
  }

  .table {
    min-width: 1050px;
    font-size: 0.85rem;
  }

  thead,
  th {
    background-color: #fafafa;
    color: #4f6475;
    font-weight: 400;
  }

  tr {
    color: #4a4a4a;
  }

  td {
    vertical-align: middle;
    text-align: center;
  }

  .no-record {
    width: 61px;
    margin: 60px auto;
    display: block;
  }

  .loading-container {
    text-align: center;
    padding: 60px 0;
    color: #999;
  }

  .stats-box {
    display: flex;
    gap: 24px;
    flex-wrap: wrap;
    padding: 16px 0;
    margin-bottom: 16px;
    border-bottom: 1px solid #eee;
  }

  .stat-item {
    text-align: center;
    min-width: 120px;
  }

  .stat-label {
    font-size: 12px;
    color: #999;
    margin-bottom: 4px;
  }

  .stat-value {
    font-size: 16px;
    font-weight: 600;
    color: #363636;
  }

  .side-buy {
    color: #23d160;
    font-weight: 600;
  }

  .side-sell {
    color: #ff3860;
    font-weight: 600;
  }

  .filters-bar {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 1px solid #eee;
  }

  .filters-bar .select select,
  .filters-bar .select {
    font-size: 0.85rem;
  }

  .profit-positive {
    color: #23d160;
    font-weight: 600;
  }

  .profit-negative {
    color: #ff3860;
    font-weight: 600;
  }
`;

interface Order {
  _id: string;
  strategy_id: string;
  created_at: string;
  symbol: string;
  side: string;
  price: string;
  amount: string;
  funds: string;
  record_amount: string;
  avg_price: string;
  cost: string;
  base_total: number;
  value_total: number;
  profit: number;
  profit_percentage: number;
}

interface Strategy {
  _id: string;
  exchange: string;
  symbol: string;
}

interface OrderStatistics {
  total_orders: number;
  buy_count: number;
  sell_count: number;
  total_buy_cost: number;
  total_sell_revenue: number;
  total_profit: number;
}

const PAGE_SIZE = 20;

export default function OrderHistory() {
  const { t } = useTranslation('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [statistics, setStatistics] = useState<OrderStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  // Filters
  const [selectedStrategy, setSelectedStrategy] = useState('');
  const [selectedSide, setSelectedSide] = useState('');

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  const showError = useCallback(
    (error: any) => {
      setSnackbar({
        open: true,
        message: error?.message || t('prompt.operation_failed'),
        severity: 'error',
      });
    },
    [t],
  );

  // Fetch strategies for the filter dropdown
  useEffect(() => {
    async function fetchStrategies() {
      try {
        const res: any = await HTTP.get('/v1/strategies', {
          params: { pageNumber: 1, pageSize: 999 },
        });
        setStrategies(res.data?.list ?? []);
      } catch {
        // Silently fail - filter dropdown will just be empty
      }
    }
    fetchStrategies();
  }, []);

  // Fetch statistics
  useEffect(() => {
    async function fetchStatistics() {
      try {
        const res: any = await HTTP.get('/v1/orders/statistics');
        setStatistics(res.data ?? null);
      } catch {
        // Silently fail - stats will just not show
      }
    }
    fetchStatistics();
  }, []);

  // Fetch orders when strategy filter changes
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (selectedStrategy) {
        params.strategy_id = selectedStrategy;
      }
      const res: any = await HTTP.get('/v1/orders', { params });
      setOrders(res.data?.list ?? []);
      setCurrentPage(1);
    } catch (error: any) {
      showError(error);
    } finally {
      setLoading(false);
    }
  }, [selectedStrategy, showError]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Client-side filtering by side
  const filteredOrders = selectedSide
    ? orders.filter((o) => o.side === selectedSide)
    : orders;

  // Client-side pagination
  const totalFiltered = filteredOrders.length;
  const indexOfLast = currentPage * PAGE_SIZE;
  const indexOfFirst = indexOfLast - PAGE_SIZE;
  const currentOrders = filteredOrders.slice(indexOfFirst, indexOfLast);

  function handlePageChange(newPage: number) {
    setCurrentPage(newPage);
  }

  function handleStrategyChange(e: ChangeEvent<HTMLSelectElement>) {
    setSelectedStrategy(e.target.value);
    setCurrentPage(1);
  }

  function handleSideChange(e: ChangeEvent<HTMLSelectElement>) {
    setSelectedSide(e.target.value);
    setCurrentPage(1);
  }

  function getStrategyLabel(strategy: Strategy): string {
    return `${strategy.exchange} - ${strategy.symbol}`;
  }

  function profitClass(value: number): string {
    if (value > 0) return 'profit-positive';
    if (value < 0) return 'profit-negative';
    return '';
  }

  function formatProfitWithIndicator(value: number, decimals: number = 2, suffix: string = ''): string {
    const formatted = util.formatNumber(value, decimals, suffix);
    if (value > 0) return `▲ ${formatted}`;
    if (value < 0) return `▼ ${formatted}`;
    return formatted;
  }

  if (loading) {
    return (
      <div className="container" css={ordersPageStyle}>
        <section className="section">
          <div className="box">
            <div style={{ padding: '20px 0' }}>
              <Skeleton variant="text" count={5} height="2.5rem" />
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="container" css={ordersPageStyle}>
      <section className="section">
        <div className="box">
          <Link className="is-pulled-right" href="/aip">
            {t('action.go_back')}
          </Link>
          <div className="tabs">
            <ul>
              <li className="is-active">
                <a>{t('orders.page_title')}</a>
              </li>
            </ul>
          </div>

          {/* Summary Statistics */}
          {statistics && (
            <div className="stats-box">
              <div className="stat-item">
                <div className="stat-label">{t('order.total_orders')}</div>
                <div className="stat-value">{statistics.total_orders}</div>
              </div>
              <div className="stat-item">
                <div className="stat-label">{t('order.buy_orders')}</div>
                <div className="stat-value side-buy">{statistics.buy_count}</div>
              </div>
              <div className="stat-item">
                <div className="stat-label">{t('order.sell_orders')}</div>
                <div className="stat-value side-sell">{statistics.sell_count}</div>
              </div>
              <div className="stat-item">
                <div className="stat-label">{t('order.total_invested')}</div>
                <div className="stat-value">
                  {util.formatNumber(statistics.total_buy_cost, 2)}
                </div>
              </div>
              <div className="stat-item">
                <div className="stat-label">{t('orders.total_revenue')}</div>
                <div className="stat-value">
                  {util.formatNumber(statistics.total_sell_revenue, 2)}
                </div>
              </div>
              <div className="stat-item">
                <div className="stat-label">{t('orders.total_profit')}</div>
                <div className={`stat-value ${profitClass(statistics.total_profit)}`}>
                  {formatProfitWithIndicator(statistics.total_profit, 2)}
                </div>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="filters-bar">
            <div className="select is-small">
              <select value={selectedStrategy} onChange={handleStrategyChange}>
                <option value="">{t('orders.all_strategies')}</option>
                {strategies.map((s) => (
                  <option key={s._id} value={s._id}>
                    {getStrategyLabel(s)}
                  </option>
                ))}
              </select>
            </div>
            <div className="select is-small">
              <select value={selectedSide} onChange={handleSideChange}>
                <option value="">{t('orders.all_sides')}</option>
                <option value="buy">{t('order.buy')}</option>
                <option value="sell">{t('order.sell')}</option>
              </select>
            </div>
          </div>

          {/* Order Table */}
          {filteredOrders.length > 0 ? (
            <div className="table-wrapper">
              <table className="table is-fullwidth is-striped">
                <thead>
                  <tr>
                    <th>{t('title.commission_time')}</th>
                    <th>{t('title.symbol')}</th>
                    <th>{t('order.side')}</th>
                    <th>{t('title.commission_price')}</th>
                    <th>{t('title.commission_quantity')}</th>
                    <th>{t('title.commission_amount')}</th>
                    <th>{t('title.closed_quantity')}</th>
                    <th>{t('title.closed_avg_price')}</th>
                    <th>{t('title.closed_amount')}</th>
                    <th>{t('title.profit')}</th>
                    <th>{t('title.profit_percentage')}</th>
                  </tr>
                </thead>
                <tbody>
                  {currentOrders.map((row) => (
                    <tr key={row._id}>
                      <td>{util.formatDate(row.created_at, 'yyyy-MM-dd HH:mm')}</td>
                      <td>{row.symbol}</td>
                      <td className={row.side === 'buy' ? 'side-buy' : 'side-sell'}>
                        {row.side === 'buy' ? t('order.buy') : t('order.sell')}
                      </td>
                      <td>{row.price}</td>
                      <td>{row.amount}</td>
                      <td>{row.funds}</td>
                      <td>{util.formatNumber(Number(row.record_amount), 8)}</td>
                      <td>
                        {row.avg_price
                          ? util.formatNumber(Number(row.avg_price), 8)
                          : Number(row.record_amount)
                            ? util.formatNumber(
                                Number(row.cost) / Number(row.record_amount),
                                8,
                              )
                            : '-'}
                      </td>
                      <td>{row.cost}</td>
                      <td className={profitClass(row.profit)}>
                        {formatProfitWithIndicator(row.profit, 2)}
                      </td>
                      <td className={profitClass(row.profit_percentage)}>
                        {formatProfitWithIndicator(row.profit_percentage, 2, '%')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <Pagination
                current={currentPage}
                total={totalFiltered}
                pageSize={PAGE_SIZE}
                showTotal={false}
                onPageChange={handlePageChange}
              />
            </div>
          ) : (
            <EmptyState
              title={t('empty.no_orders')}
              description={t('empty.orders_will_appear')}
              actionText={t('empty.view_strategies')}
              actionHref="/aip"
            />
          )}
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
