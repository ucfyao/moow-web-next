'use client';

import React from 'react';
import styles from './New.module.css';
import { useState } from 'react';   

const NewStrategy = () => {
  const [formData, setFormData] = useState({
    user_market_id: "",
    exchange: "",
    key: "",
    secret: "",
    symbol: "",
    base: "",
    base_limit: "",
    quote: "",
    type: "1",
    period: "",
    period_value: [],
    desc: "",
    stop_profit_percentage: "",
    drawdown: ""
  });
  const [invalidFields, setInvalidFields] = useState({});
  
  const handleInputChange = (e) => {   
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };  
  
  return (
    <div className="container">
      <section className={styles.section}>
        <div className={styles.box}>
          <div className="header">
            <p>
              <span>caption.new_plan</span><br />
              <span>caption.edit_plan</span>
            </p>
            <a>action.go_back</a>
          </div>

          <div className="field">
            <label className="label">
              <span className="has-text-danger">*</span>
              label.exchange_apikey
            </label>
            <div className={styles.control}>
              <ul className="choice is-clearfix">
                <li>
                  <p className="tit">
                    <img style={{ width: '22px', marginRight: '5px' }} src="" />
                    huobi
                  </p>
                  <p className="desc">Access Key: 1</p>
                </li>
                <li className="more">
                  <router-link to="/aip/addmarket">
                    <i className="fa fa-plus"></i>
                    <span className="color-light-blue" style={{ cursor: "pointer" }}>action.new_exchange_apikey</span>
                  </router-link>
                </li>
              </ul>
            </div>
            <p className="help is-danger">invalidFields.user_market_id</p>
            <p className="help" style={{ color: '#ff9900', fontWeight: 'bold' }}>*label.not_modifiable</p>
          </div>

          <div className="field">
            <label className="label">
              <span className="has-text-danger">*</span>
              label.symbol
            </label>
            <div className={styles.control}>
              <ul className="choice is-clearfix">
                <p>BTC/USDT</p>
              </ul>
            </div>
            <p className="help is-danger">invalidFields.symbol</p>
            <p className="help is-link">prompt.plan_tips</p>
            <p className="help" style={{ color: '#ff9900', fontWeight: 'bold' }}>*label.not_modifiable</p>
          </div>

          <div className="field">
            <label className="label">
              <span className="has-text-danger">*</span>
              label.plan_type
            </label>
            <div className={styles.control}>
              <ul className="choice is-clearfix">
                <li className={styles['plantype-item']}>
                  <p>item.name</p>
                </li>
              </ul>
            </div>
            <p className="help is-danger">invalidFields.type</p>
          </div>

          <div className="field">
            <label className="label">
              <span className="has-text-danger">*</span>
              label.single_purchase_amount
            </label>
            <div className={styles.control}>
              <input className={styles.input} type="text" name="base_limit" value={formData.base_limit} onChange={handleInputChange} placeholder='input_single_purchase_amount'/>
            </div>
            {invalidFields.base_limit && (
              <p className="help is-danger">{invalidFields.base_limit}</p>
            )}
          </div>

          <div className="field">
            <label className="label">
              <span className="has-text-danger">*</span>
              label.plan_period
            </label>
            <div className={styles.control}>
              <ul className="choice is-clearfix">
                <li>
                  <p>Daily</p>
                </li>
              </ul>
            </div>
          </div>

          <div className="field">
            <div className={styles.control}>
              <label className="checkbox">
                <input type="checkbox" />
                0:00
              </label>
            </div>
            <p className="help is-danger">invalidFields.period ||
              invalidFields.period_value
            </p>
          </div>

          <div className="field">
            <label className="label">label.stop_profit_rate</label>
            <div className={styles.control}>
              <input className={styles.input} type="text" name="stop_profit_percentage" value={formData.stop_profit_percentage} onChange={handleInputChange} placeholder='stop_profit_percentage'/>
            </div>
            {invalidFields.drawdownstop_profit_percentage && (
              <p className="help is-danger">{invalidFields.stop_profit_percentage}</p>
            )}
          </div>

          <div className="field">
            <label className="label">label.drawdown</label>
            <div className={styles.control}>
              <input className={styles.input} type="text" name="drawdown" value={formData.drawdown} onChange={handleInputChange} placeholder='drawdown_percentage' />
            </div>
            {invalidFields.drawdown && (
              <p className="help is-danger">{invalidFields.drawdown}</p>
            )}
          </div>

          <div className="field is-grouped">
            <div className={styles.control}>
              <button className="button is-link button-pad">
                action.modify || action.submit
              </button>
              <button class="button is-danger button-pad">
                action.delete
              </button>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
};

export default NewStrategy;
