/** @jsxImportSource @emotion/react */

'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import axios from 'axios';
import { useParams } from 'next/navigation';
import no_record from '@/assets/images/no_record.png';
import { css } from '@emotion/react';
import Pagination from '@/components/Pagination';
import util from '@/utils/util';
import Highcharts from 'highcharts';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

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
`;

interface DetailProps {
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
  status: string;
}

interface OrderProps {
  _id: string;
  created_at: string;
  symbol: string;
  price: string;
  amount: number;
  funds: string;
  record_amount: number;
  avg_price: number;
  base_total: number;
  value_total: number;
  cost: number;
}

interface OrderListProps {
  orders: OrderProps[];
}

interface ChartProps {
  id: string;
  categories: string[];
  series1: number[];
  series2: number[];
  series3: number[];
  max: number;
  min: number;
}

function OrderList({ orders }: OrderListProps): React.JSX.Element {
  const { t } = useTranslation('');
  // Handle page changes
  const [currentPage, setCurrentPage] = useState(1);
  const total = orders.length;
  const pageSize = 20;
  const indexOfLastItem = currentPage * pageSize;
  const indexOfFirstItem = indexOfLastItem - pageSize;
  const currentData = orders.slice(indexOfFirstItem, indexOfLastItem);

  const handleCurrentChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  return (
    <div className="table-wrapper">
      <table className="table is-fullwidth is-striped">
        <thead>
          <tr>
            <th>{t('title.commission_time')}</th>
            <th>{t('title.symbol')}</th>
            <th>{t('title.commission_price')}</th>
            <th>{t('title.commission_quantity')}</th>
            <th>{t('title.commission_amount')}</th>
            <th>{t('title.closed_quantity')}</th>
            <th>{t('title.closed_avg_price')}</th>
            <th>{t('title.closed_amount')}</th>
          </tr>
        </thead>
        <tbody>
          {currentData.map((row) => (
            // eslint-disable-next-line
            <tr key={row._id}>
              <td>{util.formatDate(row.created_at)}</td>
              <td>{row.symbol}</td>
              <td>{row.price}</td>
              <td>{row.amount}</td>
              <td>{row.funds}</td>
              <td>{util.formatNumber(row.record_amount, 8)}</td>
              <td>
                {row.avg_price === undefined
                  ? util.formatNumber(row.cost / row.record_amount, 8)
                  : util.formatNumber(row.avg_price, 8)}
              </td>
              <td>{row.cost}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <Pagination
        current={currentPage}
        total={total}
        pageSize={pageSize}
        showTotal={false}
        onPageChange={handleCurrentChange}
      />
    </div>
  );
}

function Chart({ id, categories, series1, series2, series3, max, min }: ChartProps) {
  const colors = Highcharts.getOptions().colors || [];
  useEffect(() => {
    Highcharts.chart({
      chart: {
        type: 'spline',
        renderTo: 'line-container',
      },
      title: {
        text: 'Investment Returns Chart',
      },
      subtitle: {
        text: 'Data source: xiaobao.io',
      },
      xAxis: {
        categories,
      },
      yAxis: [
        {
          title: {
            text: '',
          },
          labels: {
            // eslint-disable-next-line no-template-curly-in-string
            format: '${value}',
          },
          tickAmount: 8,
        },
        {
          title: {
            text: 'Profit Rate',
          },
          labels: {
            format: '{value}%',
          },
          max,
          min,
          tickAmount: 8,
          opposite: true,
        },
      ],
      plotOptions: {
        line: {
          dataLabels: {
            enabled: true,
          },
          enableMouseTracking: false,
          lineWidth: 1,
          marker: {
            radius: 0,
            states: {
              hover: {
                enabled: false,
                lineWidth: 1,
              },
            },
          },
        },
      },
      series: [
        {
          type: 'line',
          yAxis: 1,
          name: 'Profit Rate',
          data: series3,
          color: colors[8] || '#000000',
        },
        {
          type: 'line',
          name: 'Total Quote',
          data: series1,
        },
        {
          type: 'line',
          yAxis: 0,
          name: 'Total Value',
          data: series2,
        },
      ],
    });
  }, [id, categories, series1, series2, series3, max, min]);

  return <div id={id} />;
}

function StrategyDetails() {
  const { t } = useTranslation('');
  const { strategyId } = useParams();
  const [orders, setOrders] = useState<OrderProps[]>([]);
  const [details, setDetails] = useState<DetailProps>({
    _id: '',
    created_at: '',
    exchange: '',
    symbol: '',
    quote: '',
    quote_total: 0,
    price_native: '',
    price_total: 0,
    base: '',
    base_limit: 0,
    base_total: 0,
    profit: 0,
    profit_percentage: 0,
    stop_profit_percentage: 0,
    price_usd: '',
    status: '',
  });
  const [fontColor, setFontColor] = useState<string>('');

  // Props for chart
  const [baseTotal, setBaseTotal] = useState<number[]>([]);
  const [valueTotal, setValueTotal] = useState<number[]>([]);
  const [profitRate, setProfitRate] = useState<number[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [max, setMax] = useState(0);
  const [min, setMin] = useState(0);

  useEffect(() => {
    async function queryDetails() {
      try {
        const detailsResponse = await axios.get(`/api/v1/strategies/${strategyId}`);
        const { data } = detailsResponse.data;

        // Set variables
        if (data && data.info && data.symbolPrice) {
          const { info, symbolPrice } = data;
          info.price_usd = symbolPrice && symbolPrice.price_usd ? symbolPrice.price_usd : '';
          info.created_at = util.formatDate(info.created_at, 'yyyy-MM-dd HH:mm');
          info.base_total = util.formatNumber(info.base_total, 8);
          info.price_total = util.formatNumber(info.price_usd * info.quote_total, 8);
          info.quote_total = util.formatNumber(info.quote_total, 8);
          info.profit = util.formatNumber(info.price_total - info.base_total, 8);
          info.profit_percentage =
            parseInt(info.base_total, 8) === 0
              ? 0
              : util.formatNumber((info.profit / info.base_total) * 100, 2);

          setDetails(info);

          if (info.profit_percentage >= 0) {
            setFontColor('col-green');
          } else {
            setFontColor('col-red');
          }
        }
      } catch (error) {
        console.error(error);
      }
    }

    async function queryOrders() {
      try {
        const ordersResponse = await axios.get(`/api/v1/orders?strategy_id=${strategyId}`);
        const orderData = ordersResponse.data.data.list;
        setOrders(orderData);

        // Handle the chart update
        const newBaseTotal: number[] = [];
        const newValueTotal: number[] = [];
        const newProfitRate: number[] = [];
        const newCategories: string[] = [];

        orderData.forEach((v: OrderProps) => {
          newBaseTotal.push(+util.formatNumber(v.base_total, 2));
          newValueTotal.push(+util.formatNumber(v.value_total, 2));
          newProfitRate.push(
            +util.formatNumber((v.value_total - v.base_total) / v.value_total, 4) * 100
          );
          const date = util.formatDate(v.created_at, 'yy.MM.dd');
          newCategories.push(date);
        });

        setBaseTotal(newBaseTotal.reverse());
        setValueTotal(newValueTotal.reverse());
        setProfitRate(newProfitRate.reverse());
        setCategories(newCategories.reverse());

        const maxVal = Math.max(...newProfitRate);
        const minVal = Math.min(...newProfitRate);
        const b = maxVal - minVal * 1.4 - (maxVal - minVal);
        setMax(maxVal + b / 2);
        setMin(minVal - b / 2);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unkown Error';
        alert(message);
      }
    }
    queryDetails();
    queryOrders();
  }, []);

  // TODO  translate dynamically by i18n
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
                {/* eslint-disable-next-line */}
                <a>{t('caption.investment_details')}</a>
              </li>
            </ul>
          </div>
          {details ? (
            <>
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
                      {details.profit} {details.base}
                    </span>
                  </p>
                </div>
                <div className="column">
                  <p>
                    {t('label.stop_profit_rate')}:{' '}
                    <span>{details.stop_profit_percentage || 0} %</span>
                  </p>
                  <p>
                    {t('label.current_price')}:{' '}
                    <span>
                      {details.price_usd} {details.base}
                    </span>
                  </p>
                  <p className={fontColor}>
                    {t('label.profit_rate')}: <span>{details.profit_percentage} %</span>
                  </p>
                </div>
              </div>
              {orders.length > 0 && (
                <Chart
                  id="line-container"
                  categories={categories}
                  series1={baseTotal}
                  series2={valueTotal}
                  series3={profitRate}
                  max={max}
                  min={min}
                />
              )}
            </>
          ) : (
            <Image className="no-record" src={no_record} alt="No records found" />
          )}
          <div className="tabs">
            <ul>
              <li className="is-active">
                {/* eslint-disable-next-line */}
                <a>{t('caption.investment_orders')}</a>
              </li>
            </ul>
          </div>

          {orders && orders.length > 0 ? (
            <OrderList orders={orders} />
          ) : (
            <Image className="no-record" src={no_record} alt="No records found" />
          )}
        </div>
      </section>
    </div>
  );
}

export default StrategyDetails;
