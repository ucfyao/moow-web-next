'use client';

import React, { useState, useEffect } from 'react';

const orderList: React.FC = () => {
  const [data, setData] = useState([]);

  return(
  <div className="container">
    <section className="section">
      <div className="box">
        <a className="tabs-more" href='/strategies'>'action.go_back'</a>
          <div className="tabs">
            <ul>
              <li className="is-active"><a>'caption.investment_details'</a></li>
            </ul>
      </div>

      <div className="columns">
        <div className="column">
          <p>'label.single_purchase_amount'<span>details.base_limit details.base</span></p>
          <p>'label.total_purchased' <span>details.base_total details.base</span></p>
          {/* <p :class=fontColor>{{$t('label.current_value')}}: <span>{{details.price_total}} {{details.base}}</span></p> */}
        </div>
        <div className="column">
          <p>'label.creation_time': <span>details.createdAt</span></p>
          <p>'label.quantity_bought': <span>details.quote_total details.quote</span></p>
          {/* <p :class=fontColor>{{$t('label.profit')}}: <span>{{details.profit}} {{details.base}}</span></p> */}
        </div>
        <div className="column">
          <p>'label.stop_profit_rate' <span>details.stop_profit_percentage || 0 %</span></p>
          <p>'label.current_price' <span>details.price_usd details.base</span></p>
          {/* <p :class=fontColor>{{$t('label.profit_rate')}}: <span>{{details.profit_percentage}}%</span></p> */}
        </div>
      </div>

      <div className={orderList.length ? 'order-line' : 'isNone order-line'} id="line-container">
      </div>
      <div className="tabs">
        <ul>
          <li className="is-active"><a>'caption.investment_orders'</a></li>
        </ul>
      </div>
      
      <table className='table is-fullwidth is-striped'  style={{ minWidth: '800px', fontSize: '0.85rem' }}>
        <thead>
          <tr>
            <th>Create At</th>
            <th>Pair</th>
            <th>Price</th>
            <th>Quantity</th>
            <th>Price</th>
            <th>Amount</th>
            <th>Ave Price</th>
            <th>Total</th>
          </tr>
        </thead>
        
        <tbody>
        </tbody>
      </table>
    
      </div>
    </section>
  </div>
  );
};

export default orderList;