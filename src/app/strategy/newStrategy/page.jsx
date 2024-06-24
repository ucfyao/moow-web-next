'use client';

import React from 'react';

const NewStrategy = () => {
  return (
    <div className="container">
      <section className="section">
        <div className="box">
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
            <div className="control">
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
            <div className="control">
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
            <div className="control">
              <ul className="choice is-clearfix">
                <li className="plantype-item">
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
            <div className="control">
              <input className="input" type="text" />
            </div>
            <p className="help is-danger" >(invalidFields.base_limit)</p>
          </div>

          <div className="field">
            <label className="label">
              <span className="has-text-danger">*</span>
              label.plan_period
            </label>
            <div className="control">
              <ul className="choice is-clearfix">
                <li>
                  <p>Daily</p>
                </li>
              </ul>
            </div>
          </div>

          <div className="field">
            <div className="control">
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
            <div className="control">
              <input className="input" type="text" />
            </div>
            <p className="help is-danger">
              invalidFields.stop_profit_percentage
            </p>
          </div>

          <div className="field">
            <label className="label">label.drawdown</label>
            <div className="control">
              <input className="input" type="text" />
              <p className="help is-danger">
                invalidFields.drawdown
              </p>
            </div>
          </div>

          <div className="field is-grouped">
            <div className="control">
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
