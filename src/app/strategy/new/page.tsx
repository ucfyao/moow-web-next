'use client';

import React, { useState, useEffect } from 'react';
import styles from './New.module.css';  
import { fetchExchangeSymbolList } from "../../utils/defines"; 
import Link from 'next/link';

interface SymbolItem {
  symbol: string;
  base: string;
  quote: string;
}

interface PlanType {
  type: string; 
  name: string;
}

interface FormData {
  user_market_id: string;
  exchange: string;
  key: string;
  secret: string;
  symbol: string;
  base: string;
  base_limit: number;
  quote: string;
  type: string;
  period: string;
  period_value: number[];
  desc: string;
  stop_profit_percentage: number;
  drawdown: number;
}

interface InvalidFields {
  [key: string]: string;
}

interface NewStrategyProps {
  planId?: string;
}

const NewStrategy: React.FC<NewStrategyProps> = ({ planId = "" }) => {
  const [symbolList, setSymbolList] = useState<SymbolItem[]>([]);
  const planTypeList: PlanType[] = [
    { type: "1", name: "label.price_investment" }, 
    // { type: "2", name: "label.value_investment" }, 
  ];

  const [formData, setFormData] = useState<FormData>({
    user_market_id: "",
    exchange: "",
    key: "",
    secret: "",
    symbol: "",
    base: "",
    base_limit: 0,
    quote: "",
    type: "1",
    period: "",
    period_value: [],
    desc: "",
    stop_profit_percentage: 0,
    drawdown: 0
  });

  const [invalidFields, setInvalidFields] = useState<InvalidFields>({});
  
  useEffect(() => { 
    setSymbolList(fetchExchangeSymbolList(""));
  }, []);

  const handleSelectSymbol = (item: SymbolItem) => {
    if (!item || typeof item !== "object") return;
    setFormData({
      ...formData,
      symbol: item.symbol,
      base: item.base,
      quote: item.quote
    });
  };

  const handleSelectPlanType = (item: PlanType) => {
    if (!item || typeof item !== "object") return;
    setFormData({
      ...formData,
      type: item.type
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {   
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: parseFloat(value) 
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
                  <Link href="/newmarket">
                    <i className="fa fa-plus"></i>
                    <span className="color-light-blue" style={{ cursor: "pointer" }}>action.new_exchange_apikey</span>
                  </Link>
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
              <ul className="choice is-clearfix is-flex">
                {symbolList.map((item) => (
                  <li 
                    key={item.symbol} 
                    className={`symbol-item ${formData.symbol === item.symbol ? 'active' : ''} ${planId ? 'no-drop' : ''}`}
                    onClick={() => !planId && handleSelectSymbol(item)}
                  >
                    <p>{item.symbol}</p>
                  </li>
                ))}
              </ul>
            </div>
            {invalidFields.symbol && <p className="help is-danger">{invalidFields.symbol}</p>}
            {formData.symbol && !planId && (
              <p className="help is-link">
                {`prompt.plan_tips base: ${formData.base} quote: ${formData.quote}`}
              </p>
            )}
            {planId && (
              <p className="help" style={{ color: '#ff9900', fontWeight: 'bold' }}>
                *label.not_modifiable
              </p>
            )}
          </div>

          <div className="field">
            <label className="label">
              <span className="has-text-danger">*</span>
              label.plan_type
            </label>
            <div className={styles.control}>
              <ul className="choice is-clearfix">

                {planTypeList.map((item) => (
                  <li 
                    key={item.type}  
                    className={`styles['plantype-item'] ${formData.type === item.type ? 'active' : ''}`} 
                    onClick={() => handleSelectPlanType(item)}
                  >
                    <p>{item.name}</p>
                  </li>
                ))}
              </ul>
            </div>
            {invalidFields.type && <p className="help is-danger">{invalidFields.type}</p>}
          </div>

          <div className="field">
            <label className="label">
              <span className="has-text-danger">*</span>
              label.single_purchase_amount
            </label>
            <div className={styles.control}>
              <input className={styles.input} type="number" name="base_limit" value={formData.base_limit} onChange={handleInputChange} placeholder='input_single_purchase_amount'/>
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
              <input className={styles.input} type="number" name="stop_profit_percentage" value={formData.stop_profit_percentage} onChange={handleInputChange} placeholder='stop_profit_percentage'/>
            </div>
            {invalidFields.stop_profit_percentage && (
              <p className="help is-danger">{invalidFields.stop_profit_percentage}</p>
            )}
          </div>

          <div className="field">
            <label className="label">label.drawdown</label>
            <div className={styles.control}>
              <input className={styles.input} type="number" name="drawdown" value={formData.drawdown} onChange={handleInputChange} placeholder='drawdown_percentage' />
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
              <button className="button is-danger button-pad">
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
