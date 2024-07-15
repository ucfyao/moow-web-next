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
import Chart from '@/components/Chart';

interface DetailProps {
  _id: string;
  created_at: string;
  exchange: string;
  symbol: string;
  quote: number;
  quote_total: number;
  price_native: string;
  price_total: string;
  base: string;
  base_limit: string;
  base_total: number;
  profit: number;
  profit_percentage: number;
  stop_profit_percentage: number;
  price_usd: number;
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

const strategyDetails: React.FC = () => {
  const { strategyId } = useParams();
  const [orders, setOrders] = useState<OrderProps[]>([]);
  const [details, setDetails] = useState<DetailProps | undefined>(undefined);
  const [fontColor, setFontColor] = useState<string>('');

  // Props for chart
  const [baseTotal, setBaseTotal] = useState<number[]>([]);
  const [valueTotal, setValueTotal] = useState<number[]>([]);
  const [profitRate, setProfitRate] = useState<number[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [max, setMax] = useState(0);
  const [min, setMin] = useState(0);

  useEffect(() => {
    const queryDetails = async () => {
      try {
        const detailsResponse = await axios.get(`/api/v1/strategies/${strategyId}`);
        const data = detailsResponse.data.data;

        // Set variables
        if (data) {
          const info = data.info;
          // TODO  complete symbol exchange model in back-end
          // const symbol_price = data.symbol_price;
          info.price_usd = 10; // TODO  update later
          info.created_at = util.formatDate(info.created_at, 'yy-MM-dd HH:mm');
          info.base_total = util.formatNumber(info.base_total, 8);
          info.price_total = util.formatNumber(info.price_usd * info.quote_total, 8);
          info.quote_total = util.formatNumber(info.quote_total, 8);
          info.profit = util.formatNumber(info.price_total - info.base_total, 8);
          info.profit_percentage =
            parseInt(info.base_total) === 0
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
    };
    const queryOrders = async () => {
      try {
        const ordersResponse = await axios.get(`/api/v1/orders?strategy_id=${strategyId}`);
        const orderData = ordersResponse.data.data.list;
        setOrders(orderData);

        // Handle the chart update
        const newBaseTotal: number[] = [];
        const newValueTotal: number[] = [];
        const newProfitRate: number[] = [];
        const newCategories: string[] = [];

        orderData.forEach((v) => {
          newBaseTotal.push(+util.formatNumber(v.base_total, 2));
          newValueTotal.push(+util.formatNumber(v.value_total, 2));
          newProfitRate.push(
            +util.formatNumber((v.value_total - v.base_total) / v.value_total, 4) * 100
          );
          let date = util.formatDate(v.created_at, 'yy.MM.dd');
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

        // test
        setCategories([
          'Jan',
          'Feb',
          'Mar',
          'Apr',
          'May',
          'Jun',
          'Jul',
          'Aug',
          'Sep',
          'Oct',
          'Nov',
          'Dec',
        ]);
        setBaseTotal([1, 3, 2, 4, 5, 6, 8, 7, 9, 6, 5, 4]);
        setValueTotal([2, 4, 3, 5, 6, 7, 9, 8, 10, 7, 6, 5]);
        setProfitRate([1, 2, 1, 3, 4, 5, 7, 6, 8, 5, 4, 3]);
        setMax(10);
        setMin(0);
      } catch (error) {
        const message = error.message ? error.message : 'Unkown Error';
        alert(message);
      }
    };
    queryDetails();
    queryOrders();
  }, []);

  const OrderList: React.FC<{ orders: any[] }> = () => {
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
              <th>Commission Time</th>
              <th>Symbol</th>
              <th>Commission Price</th>
              <th>Commission Quantity</th>
              <th>Commission Amount</th>
              <th>Closed Quantity</th>
              <th>Closed Ave Price</th>
              <th>Closed Amount</th>
            </tr>
          </thead>
          <tbody>
            {currentData.map((row, index) => (
              <tr key={index}>
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
  };

  // TODO  translate dynamically by i18n
  return (
    <div className="container" css={strategyDetailStyle}>
      <section className="section">
        <div className="box">
          <a className="tabs-more is-pulled-right" href="/strategies">
            Go Back
          </a>
          <div className="tabs">
            <ul>
              <li className="is-active">
                <a>Investment Details</a>
              </li>
            </ul>
          </div>
          {details ? (
            <>
              <div className="columns">
                <div className="column">
                  <p>
                    Single Purchase Amount:{' '}
                    <span>
                      {details.base_limit} {details.base}
                    </span>
                  </p>
                  <p>
                    Total Purchased:{' '}
                    <span>
                      {details.base_total} {details.base}
                    </span>
                  </p>
                  <p className={fontColor}>
                    Current Value:{' '}
                    <span>
                      {details.price_total} {details.base}
                    </span>
                  </p>
                </div>
                <div className="column">
                  <p>
                    Creation Time: <span>{details.created_at}</span>
                  </p>
                  <p>
                    Quantity Bought:{' '}
                    <span>
                      {details.quote_total} {details.quote}
                    </span>
                  </p>
                  <p className={fontColor}>
                    Profit:{' '}
                    <span>
                      {details.profit} {details.base}
                    </span>
                  </p>
                </div>
                <div className="column">
                  <p>
                    Stop Profit Rate: <span>{details.stop_profit_percentage || 0} %</span>
                  </p>
                  <p>
                    Current Price:{' '}
                    <span>
                      {details.price_usd} {details.base}
                    </span>
                  </p>
                  <p className={fontColor}>
                    Profit Rate: <span>{details.profit_percentage} %</span>
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
                <a>Order History</a>
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
};

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

export default strategyDetails;
