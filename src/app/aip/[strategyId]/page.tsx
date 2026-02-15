/** @jsxImportSource @emotion/react */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import no_record from '@/assets/images/no_record.png';
import { css } from '@emotion/react';
import Pagination from '@/components/Pagination';
import Skeleton from '@/components/Skeleton';
import ConfirmModal from '@/components/ConfirmModal';
import util from '@/utils/util';
import Highcharts from 'highcharts';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import HTTP from '@/lib/http';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

const strategyDetailStyle = css`
  .isNone {
    display: none;
  }

  p {
    font-size: 14px;
  }

  #line-container {
    width: 100%;
    min-height: 20.5rem;
  }

  .container {
    margin-top: 40px;
    margin-bottom: 60px;
    max-width: 1344px;
  }

  .tabs {
    margin-bottom: 1.5rem;
  }

  .tabs-more {
    padding-right: 30px;
  }

  .table {
    min-width: 800px;
    font-size: 0.85rem;
  }

  .table-wrapper {
    overflow-x: auto;
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

  .action-bar {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 1px solid #eee;
  }

  .action-bar .strategy-status {
    margin-left: auto;
    font-size: 14px;
    color: #666;
  }

  .action-bar .strategy-status .status-badge {
    display: inline-block;
    padding: 2px 10px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 600;
  }

  .action-bar .strategy-status .status-running {
    background: #e6f9ee;
    color: #23d160;
  }

  .action-bar .strategy-status .status-stopped {
    background: #fde8ec;
    color: #ff3860;
  }

  .chart-controls {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 12px;
  }
`;

interface StrategyDetail {
  _id: string;
  created_at: string;
  exchange: string;
  symbol: string;
  quote: string;
  quote_total: number;
  price_native: string;
  price_total: number;
  base: string;
  base_limit: number;
  base_total: number;
  profit: number;
  profit_percentage: number;
  stop_profit_percentage: number;
  price_usd: string;
  status: number;
}

interface Order {
  _id: string;
  created_at: string;
  symbol: string;
  side: string;
  price: string;
  amount: string;
  funds: string;
  record_amount: string;
  avg_price: string;
  base_total: number;
  value_total: number;
  cost: string;
}

interface OrderStats {
  totalOrders: number;
  buyOrders: number;
  sellOrders: number;
  totalInvested: number;
  totalValue: number;
}

interface ChartProps {
  id: string;
  categories: string[];
  series1: number[];
  series2: number[];
  series3: number[];
  max: number;
  min: number;
  t: (key: string) => string;
}

const PAGE_SIZE = 20;

function getChartHeight(): number {
  if (typeof window === 'undefined') return 400;
  return window.innerWidth < 768 ? 250 : 400;
}

function Chart({ id, categories, series1, series2, series3, max, min, t }: ChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<Highcharts.Chart | null>(null);
  const [chartHeight, setChartHeight] = useState(getChartHeight);

  useEffect(() => {
    let debounceTimer: ReturnType<typeof setTimeout>;

    function handleResize() {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        setChartHeight(getChartHeight());
        if (chartInstanceRef.current) {
          chartInstanceRef.current.reflow();
        }
      }, 200);
    }

    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(debounceTimer);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const colors = Highcharts.getOptions().colors || [];
    chartInstanceRef.current = Highcharts.chart(chartContainerRef.current, {
      chart: {
        type: 'spline',
        height: chartHeight,
        reflow: true,
      },
      title: {
        text: t('chart.investment_returns'),
      },
      subtitle: {
        text: t('chart.data_source'),
      },
      xAxis: {
        categories,
      },
      yAxis: [
        {
          title: { text: '' },
          labels: {
            format: '${value}',
          },
          tickAmount: 8,
        },
        {
          title: { text: t('chart.profit_rate') },
          labels: { format: '{value}%' },
          max,
          min,
          tickAmount: 8,
          opposite: true,
        },
      ],
      plotOptions: {
        line: {
          dataLabels: { enabled: true },
          enableMouseTracking: false,
          lineWidth: 1,
          marker: {
            radius: 0,
            states: { hover: { enabled: false, lineWidth: 1 } },
          },
        },
      },
      series: [
        {
          type: 'line',
          yAxis: 1,
          name: t('chart.profit_rate'),
          data: series3,
          color: colors[8] || '#000000',
        },
        {
          type: 'line',
          name: t('chart.total_invested'),
          data: series1,
        },
        {
          type: 'line',
          yAxis: 0,
          name: t('chart.total_value'),
          data: series2,
        },
      ],
      credits: { enabled: false },
    });

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, [id, categories, series1, series2, series3, max, min, t, chartHeight]);

  return <div ref={chartContainerRef} id={id} style={{ width: '100%' }} />;
}

function computeOrderStats(orders: Order[]): OrderStats {
  let buyOrders = 0;
  let sellOrders = 0;
  let totalInvested = 0;
  let totalValue = 0;

  orders.forEach((order) => {
    if (order.side === 'buy') buyOrders++;
    else if (order.side === 'sell') sellOrders++;
    totalInvested = Math.max(totalInvested, order.base_total || 0);
    totalValue = Math.max(totalValue, order.value_total || 0);
  });

  return {
    totalOrders: orders.length,
    buyOrders,
    sellOrders,
    totalInvested,
    totalValue,
  };
}

export default function StrategyDetails() {
  const { t } = useTranslation('');
  const router = useRouter();
  const { strategyId } = useParams();
  const [orders, setOrders] = useState<Order[]>([]);
  const [details, setDetails] = useState<StrategyDetail | null>(null);
  const [fontColor, setFontColor] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [orderStats, setOrderStats] = useState<OrderStats>({
    totalOrders: 0,
    buyOrders: 0,
    sellOrders: 0,
    totalInvested: 0,
    totalValue: 0,
  });
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

  // Chart data
  const [baseTotal, setBaseTotal] = useState<number[]>([]);
  const [valueTotal, setValueTotal] = useState<number[]>([]);
  const [profitRate, setProfitRate] = useState<number[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [chartMax, setChartMax] = useState(0);
  const [chartMin, setChartMin] = useState(0);
  const [timeRange, setTimeRange] = useState<number | null>(null); // null = all

  // Filtered chart data by time range
  const sliceCount = timeRange !== null ? Math.min(timeRange, categories.length) : categories.length;
  const startIdx = categories.length - sliceCount;
  const filteredCategories = categories.slice(startIdx);
  const filteredBaseTotal = baseTotal.slice(startIdx);
  const filteredValueTotal = valueTotal.slice(startIdx);
  const filteredProfitRate = profitRate.slice(startIdx);
  const filteredMax =
    filteredProfitRate.length > 0 ? Math.max(...filteredProfitRate) : chartMax;
  const filteredMin =
    filteredProfitRate.length > 0 ? Math.min(...filteredProfitRate) : chartMin;
  const filteredB = filteredMax - filteredMin * 1.4 - (filteredMax - filteredMin);
  const filteredChartMax = filteredMax + filteredB / 2;
  const filteredChartMin = filteredMin - filteredB / 2;

  // Order pagination
  const [currentPage, setCurrentPage] = useState(1);
  const indexOfLastItem = currentPage * PAGE_SIZE;
  const indexOfFirstItem = indexOfLastItem - PAGE_SIZE;
  const currentOrders = orders.slice(indexOfFirstItem, indexOfLastItem);

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

  const showSuccess = useCallback((message: string) => {
    setSnackbar({ open: true, message, severity: 'success' });
  }, []);

  function handleManualBuy() {
    setModal({
      open: true,
      title: t('strategy.manual_buy'),
      message: t('strategy.confirm_manual_buy'),
      variant: 'info',
      loading: false,
      onConfirm: async () => {
        setModal((prev) => ({ ...prev, loading: true }));
        setActionLoading(true);
        try {
          await HTTP.post(`/v1/strategies/${strategyId}/execute-buy`);
          showSuccess(t('strategy.buy_success'));
        } catch (error: any) {
          showError(error);
        } finally {
          setActionLoading(false);
          setModal((prev) => ({ ...prev, open: false, loading: false }));
        }
      },
    });
  }

  function handleManualSell() {
    setModal({
      open: true,
      title: t('strategy.manual_sell'),
      message: t('strategy.confirm_manual_sell'),
      variant: 'info',
      loading: false,
      onConfirm: async () => {
        setModal((prev) => ({ ...prev, loading: true }));
        setActionLoading(true);
        try {
          await HTTP.post(`/v1/strategies/${strategyId}/execute-sell`);
          showSuccess(t('strategy.sell_success'));
        } catch (error: any) {
          showError(error);
        } finally {
          setActionLoading(false);
          setModal((prev) => ({ ...prev, open: false, loading: false }));
        }
      },
    });
  }

  function handleEdit() {
    router.push(`/aip/addstrategy?strategyId=${strategyId}`);
  }

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [detailRes, ordersRes]: [any, any] = await Promise.all([
          HTTP.get(`/v1/strategies/${strategyId}`),
          HTTP.get('/v1/orders', { params: { strategy_id: strategyId } }),
        ]);

        // Process strategy details
        if (detailRes.data?.info) {
          const { info, symbolPrice } = detailRes.data;
          info.price_usd = symbolPrice?.price_usd ?? '';
          info.created_at = util.formatDate(info.created_at, 'yyyy-MM-dd HH:mm');
          const rawBaseTotal = Number(info.base_total);
          const rawQuoteTotal = Number(info.quote_total);
          const priceUsd = Number(info.price_usd);
          info.base_total = util.formatNumber(rawBaseTotal, 8);
          info.price_total = util.formatNumber(priceUsd * rawQuoteTotal, 8);
          info.quote_total = util.formatNumber(rawQuoteTotal, 8);
          const profitVal = Number(info.price_total) - Number(info.base_total);
          info.profit = util.formatNumber(profitVal, 8);
          info.profit_percentage =
            rawBaseTotal === 0 ? 0 : util.formatNumber((profitVal / rawBaseTotal) * 100, 2);
          setDetails(info);
          setFontColor(Number(info.profit_percentage) >= 0 ? 'has-text-success' : 'has-text-danger');
        }

        // Process orders
        const orderData: Order[] = ordersRes.data?.list ?? [];
        setOrders(orderData);
        setOrderStats(computeOrderStats(orderData));

        // Build chart data
        if (orderData.length > 0) {
          const newBaseTotal: number[] = [];
          const newValueTotal: number[] = [];
          const newProfitRate: number[] = [];
          const newCategories: string[] = [];

          orderData.forEach((v) => {
            newBaseTotal.push(+util.formatNumber(v.base_total, 2));
            newValueTotal.push(+util.formatNumber(v.value_total, 2));
            const valTotal = v.value_total || 0;
            const rate = valTotal !== 0 ? ((valTotal - v.base_total) / valTotal) * 100 : 0;
            newProfitRate.push(+util.formatNumber(rate, 4));
            newCategories.push(util.formatDate(v.created_at, 'yy.MM.dd'));
          });

          const reversed1 = newBaseTotal.reverse();
          const reversed2 = newValueTotal.reverse();
          const reversed3 = newProfitRate.reverse();
          const reversedCat = newCategories.reverse();

          setBaseTotal(reversed1);
          setValueTotal(reversed2);
          setProfitRate(reversed3);
          setCategories(reversedCat);

          const maxVal = Math.max(...reversed3);
          const minVal = Math.min(...reversed3);
          const b = maxVal - minVal * 1.4 - (maxVal - minVal);
          setChartMax(maxVal + b / 2);
          setChartMin(minVal - b / 2);
        }
      } catch (error: any) {
        console.error(error);
        showError(error);
      } finally {
        setLoading(false);
      }
    }

    if (strategyId) {
      fetchData();
    }
  }, [strategyId, showError]);

  function handlePageChange(newPage: number) {
    setCurrentPage(newPage);
  }

  if (loading) {
    return (
      <div className="container" css={strategyDetailStyle}>
        <section className="section">
          <div className="box">
            <Skeleton variant="rect" width="100%" height="400px" />
            <div style={{ marginTop: '20px' }}>
              <Skeleton variant="text" count={5} height="2.5rem" />
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="container" css={strategyDetailStyle}>
      <section className="section">
        <div className="box">
          <Link className="tabs-more is-pulled-right" href="/aip">
            {t('action.go_back')}
          </Link>
          <div className="tabs">
            <ul>
              <li className="is-active">
                <a>{t('caption.investment_details')}</a>
              </li>
            </ul>
          </div>

          {details ? (
            <>
              <div className="action-bar">
                <button
                  type="button"
                  className="button is-success is-small"
                  disabled={actionLoading || details.status !== 1}
                  onClick={handleManualBuy}
                >
                  {actionLoading ? t('strategy.executing') : t('strategy.manual_buy')}
                </button>
                <button
                  type="button"
                  className="button is-danger is-small"
                  disabled={actionLoading || details.status !== 1}
                  onClick={handleManualSell}
                >
                  {actionLoading ? t('strategy.executing') : t('strategy.manual_sell')}
                </button>
                <button
                  type="button"
                  className="button is-info is-small is-outlined"
                  onClick={handleEdit}
                >
                  {t('action.edit')}
                </button>
                <div className="strategy-status">
                  {t('strategy.status')}:{' '}
                  <span
                    className={`status-badge ${details.status === 1 ? 'status-running' : 'status-stopped'}`}
                  >
                    {details.status === 1
                      ? `● ${t('strategy.status_running')}`
                      : `■ ${t('strategy.status_stopped')}`}
                  </span>
                </div>
              </div>

              <div className="columns">
                <div className="column">
                  <p>
                    {t('label.single_purchase_amount')}:{' '}
                    <span>
                      {details.base_limit} {details.base}
                    </span>
                  </p>
                  <p>
                    {t('label.total_purchased')}:{' '}
                    <span>
                      {details.base_total} {details.base}
                    </span>
                  </p>
                  <p className={fontColor}>
                    {t('label.current_value')}:{' '}
                    <span>
                      {Number(details.profit) > 0 ? '▲' : Number(details.profit) < 0 ? '▼' : ''}{' '}
                      {details.price_total} {details.base}
                    </span>
                  </p>
                </div>
                <div className="column">
                  <p>
                    {t('label.creation_time')}: <span>{details.created_at}</span>
                  </p>
                  <p>
                    {t('label.quantity_bought')}:{' '}
                    <span>
                      {details.quote_total} {details.quote}
                    </span>
                  </p>
                  <p className={fontColor}>
                    {t('label.profit')}:{' '}
                    <span>
                      {Number(details.profit) > 0 ? '▲' : Number(details.profit) < 0 ? '▼' : ''}{' '}
                      {details.profit} {details.base}
                    </span>
                  </p>
                </div>
                <div className="column">
                  <p>
                    {t('label.stop_profit_rate')}:{' '}
                    <span>{details.stop_profit_percentage || 0}%</span>
                  </p>
                  <p>
                    {t('label.current_price')}:{' '}
                    <span>
                      {details.price_usd} {details.base}
                    </span>
                  </p>
                  <p className={fontColor}>
                    {t('label.profit_rate')}:{' '}
                    <span>
                      {Number(details.profit_percentage) > 0 ? '▲' : Number(details.profit_percentage) < 0 ? '▼' : ''}{' '}
                      {details.profit_percentage}%
                    </span>
                  </p>
                </div>
              </div>

              {orders.length > 0 && (
                <>
                  <div className="chart-controls">
                    <div className="buttons has-addons">
                      <button
                        type="button"
                        className={`button is-small ${timeRange === 7 ? 'is-info is-selected' : ''}`}
                        onClick={() => setTimeRange(7)}
                      >
                        7{t('chart.days')}
                      </button>
                      <button
                        type="button"
                        className={`button is-small ${timeRange === 30 ? 'is-info is-selected' : ''}`}
                        onClick={() => setTimeRange(30)}
                      >
                        30{t('chart.days')}
                      </button>
                      <button
                        type="button"
                        className={`button is-small ${timeRange === 90 ? 'is-info is-selected' : ''}`}
                        onClick={() => setTimeRange(90)}
                      >
                        90{t('chart.days')}
                      </button>
                      <button
                        type="button"
                        className={`button is-small ${timeRange === null ? 'is-info is-selected' : ''}`}
                        onClick={() => setTimeRange(null)}
                      >
                        {t('chart.all')}
                      </button>
                    </div>
                  </div>
                  <Chart
                    id="line-container"
                    categories={filteredCategories}
                    series1={filteredBaseTotal}
                    series2={filteredValueTotal}
                    series3={filteredProfitRate}
                    max={filteredChartMax}
                    min={filteredChartMin}
                    t={t}
                  />
                </>
              )}
            </>
          ) : (
            <Image className="no-record" src={no_record} alt="No records found" />
          )}

          {/* Order Statistics */}
          {orders.length > 0 && (
            <div className="stats-box">
              <div className="stat-item">
                <div className="stat-label">{t('order.total_orders')}</div>
                <div className="stat-value">{orderStats.totalOrders}</div>
              </div>
              <div className="stat-item">
                <div className="stat-label">{t('order.buy_orders')}</div>
                <div className="stat-value side-buy">{orderStats.buyOrders}</div>
              </div>
              <div className="stat-item">
                <div className="stat-label">{t('order.sell_orders')}</div>
                <div className="stat-value side-sell">{orderStats.sellOrders}</div>
              </div>
              <div className="stat-item">
                <div className="stat-label">{t('order.total_invested')}</div>
                <div className="stat-value">{util.formatNumber(orderStats.totalInvested, 2)}</div>
              </div>
              <div className="stat-item">
                <div className="stat-label">{t('order.total_value')}</div>
                <div className="stat-value">{util.formatNumber(orderStats.totalValue, 2)}</div>
              </div>
            </div>
          )}

          {/* Order List */}
          <div className="tabs">
            <ul>
              <li className="is-active">
                <a>{t('caption.investment_orders')}</a>
              </li>
            </ul>
          </div>

          {orders.length > 0 ? (
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
                          : util.formatNumber(Number(row.cost) / Number(row.record_amount), 8)}
                      </td>
                      <td>{row.cost}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <Pagination
                current={currentPage}
                total={orders.length}
                pageSize={PAGE_SIZE}
                showTotal={false}
                onPageChange={handlePageChange}
              />
            </div>
          ) : (
            <Image className="no-record" src={no_record} alt="No records found" />
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
