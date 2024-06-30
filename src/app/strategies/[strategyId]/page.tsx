"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import axios from 'axios';
import { useParams } from 'next/navigation';
import no_record from '../../../assets/images/no_record.png';
import '../../styles/orders.css';
import util from '../../../utils/util';

const strategyDetails: React.FC = () => {
  const { strategyId } = useParams();
  const [ orders, setOrders ] = useState([]);
  const [ details, setDetails ] = useState([]);

  useEffect(() => {
    const queryDetails = async () => {
        try {
            // todo: use baseURL instead of hardcode
            const detailsResponse = await axios.get(`http://127.0.0.1:3001/api/v1/strategies/${strategyId}`);
            setDetails(detailsResponse.data.data.info);
        } catch (error) {
            console.error(error);
        }
    };
    const queryOrders = async () => {
        try {
            // todo: use baseURL instead of hardcode
            const ordersResponse = await axios.get(`http://127.0.0.1:3001/api/v1/orders?strategy_id=${strategyId}`);
            setOrders(ordersResponse.data.data.list);
        } catch (error) {
            console.error(error);
        }
    };
    queryDetails();
    queryOrders();
  }, []);

  const OrderList: React.FC<{ orders: any[] }> = () => {

    return (
      <table className='table is-fullwidth is-striped'  style={{ minWidth: '800px', fontSize: '0.85rem' }}>
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
          {orders.map((row, index) => (
            <tr key={index}>
              <td style={{ textAlign: 'center' }}>{util.formatDate(row.createdAt)}</td>
              <td style={{ textAlign: 'center' }}>{row.symbol}</td>
              <td style={{ textAlign: 'center' }}>{row.price}</td>
              <td style={{ textAlign: 'center' }}>{row.amount}</td>
              <td style={{ textAlign: 'center' }}>{row.funds}</td>
              <td style={{ textAlign: 'center' }}>{util.formatNumber(row.record_amount, 8)}</td>
              <td style={{ textAlign: 'center' }}>
              {row.avg_price === undefined
                  ? util.formatNumber(row.cost / row.record_amount,8)
                  : util.formatNumber(row.avg_price, 8)}
              </td>
              <td style={{ textAlign: 'center' }}>{row.cost}</td>
            </tr>
          ))}
        </tbody>
    </table>
    );
  };

  // todo: translate dynamically by i18n
  return(
  <div className="container">
    <section className="section">
      <div className="box">
        <a className="tabs-more is-pulled-right" href='/strategies'>Go Back</a>
        <div className="tabs">
          <ul>
            <li className="is-active"><a>Investment Details</a></li>
          </ul>
        </div>

        <div className="columns">
          <div className="column">
            <p>single_purchase_amount: <span>{details.base_limit} {details.base}</span></p>
            <p>total_purchased: <span>{details.base_total} {details.base}</span></p>
            <p className={details.profit_percentage >= 0 ? 'has-text-success' : 'has-text-danger'}>current_value: <span>{details.price_total} {details.base}</span></p>
          </div>
          <div className="column">
            <p>creation_time: <span>{details.createdAt}</span></p>
            <p>quantity_bought: <span>{details.quote_total} {details.quote}</span></p>
            <p className={details.profit_percentage >= 0 ? 'has-text-success' : 'has-text-danger'}>profit: <span>{details.profit} {details.base}</span></p>
          </div>
          <div className="column">
            <p>stop_profit_rate: <span>{details.stop_profit_percentage||0} %</span></p>
            <p>current_price: <span>{details.price_usd} {details.base}</span></p>
            <p className={details.profit_percentage >= 0 ? 'has-text-success' : 'has-text-danger'}>profit_rate: <span>{details.profit_percentage}%</span></p>
          </div>
        </div>

        <div className="tabs">
          <ul>
            <li className="is-active"><a>Order History</a></li>
          </ul>
        </div>

        <div className='table-wrapper'>
          {orders && orders.length > 0 ? (
            <OrderList orders={orders} />
          ) : (
            <Image src={no_record} alt='No records found' />
          )}
        </div>
      </div>
    </section>
  </div>
  );
};

export default strategyDetails;