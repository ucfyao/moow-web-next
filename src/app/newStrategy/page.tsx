'use client';

import React, { useState, useEffect } from 'react';
import styles from './New.module.css';  
import { fetchExchangeSymbolList } from "../utils/defines"; 
import Link from 'next/link';
import axios from 'axios';

interface UserMarketItem {
  user_market_id: string;
  exchange: string;
  key: string;
  secret: string;
}
interface SymbolItem {
  symbol: string;
  base: string;
  quote: string;
}
interface PlanType {
  type: string; 
  name: string;
}
interface PeriodType {
  periodType: string;
  name: string;
}
interface PeriodDataItem {
  value: number;
  label: string;
}
interface PeriodValue {
  daily: number[];
  weekly: number[];
  monthly: number[];
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
  period_value: PeriodValue;
  desc: string;
  stop_profit_percentage: number;
  drawdown: number;
}
interface InvalidFields {
  [key: string]: string;
}
interface NewStrategyProps {
  planId?: string;
  marketId?: string;
}

const NewStrategy: React.FC<NewStrategyProps> = ({ planId = "", marketId = ""}) => {
  const [userMarketList, setUserMarketList] = useState<UserMarketItem[]>([]);
  const [symbolList, setSymbolList] = useState<SymbolItem[]>([]);
  const planTypeList: PlanType[] = [
    { type: "1", name: "label.price_investment" }, 
    // { type: "2", name: "label.value_investment" }, 
  ];
  const periodList: PeriodType[] = [
    { periodType: "1", name: "label.daily" },
    { periodType: "2", name: "label.weekly" },
    { periodType: "3", name: "label.monthly" }
  ];
  const [periodDataList, setPeriodDataList] = useState<PeriodDataItem[]>([]);
  const periodDictionary: { [key: string]: { label: string; children: PeriodDataItem[] } } = {
    "1": {
      label: "Daily",
      children: Array.from({ length: 24 }, (_, i) => ({ value: i, label: `${i}:00` }))
    },
    "2": {
      label: "Weekly",
      children: [
        { value: 1, label: "Monday" },
        { value: 2, label: "Tuesday" },
        { value: 3, label: "Wednesday" },
        { value: 4, label: "Thursday" },
        { value: 5, label: "Friday" },
        { value: 6, label: "Saturday" },
        { value: 7, label: "Sunday" }
      ]
    }, 
    "3": {
      label: "Monthly",
      children: [
        { value: 1, label: "1st" },
        { value: 2, label: "2nd" },
        { value: 3, label: "3rd" },
        { value: 4, label: "4th" },
        { value: 5, label: "5th" },
        { value: 6, label: "6th" },
        { value: 7, label: "7th" },
        { value: 8, label: "8th" },
        { value: 9, label: "9th" },
        { value: 10, label: "10th" },
        { value: 11, label: "11th" },
        { value: 12, label: "12th" },
        { value: 13, label: "13th" },
        { value: 14, label: "14th" },
        { value: 15, label: "15th" },
        { value: 16, label: "16th" },
        { value: 17, label: "17th" },
        { value: 18, label: "18th" },
        { value: 19, label: "19th" },
        { value: 20, label: "20th" },
        { value: 21, label: "21st" },
        { value: 22, label: "22nd" },
        { value: 23, label: "23rd" },
        { value: 24, label: "24th" },
        { value: 25, label: "25th" },
        { value: 26, label: "26th" },
        { value: 27, label: "27th" },
        { value: 28, label: "28th" }
      ]
    }
  }
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
    period_value: {
      daily: [],
      weekly: [],
      monthly: [],
    },
    desc: "",
    stop_profit_percentage: 0,
    drawdown: 0
  });
  const [invalidFields, setInvalidFields] = useState<InvalidFields>({});

  useEffect(() => { 
    queryUserMarketList();   
    setSymbolList(fetchExchangeSymbolList(""));
  }, []);

  const desensitization = (val: string): string => {
    if (!val || val.length < 7) return val;
    return val.slice(0, 4) + "****" + val.slice(-3);
  };  
  
  const handleSelectUserMarket = (item: UserMarketItem) => {
    if (!item || typeof item !== "object") return;
    setFormData((prevFormData) => ({
      ...prevFormData,
      user_market_id: item.user_market_id,
      exchange: item.exchange,
      key: item.key,
      secret: item.secret,
      symbol: "",
      base: "",
      quote: ""
    }));
    const newSymbolList = fetchExchangeSymbolList(item.exchange);
    setSymbolList(newSymbolList);
  }

  const queryUserMarketList = async () => {
    try {
      // TODO: Replace the mock data with an actual API request when the API is ready. 
      // const response = await axios.get('http://127.0.0.1:3000/api/v1/keys');

      // mock data
      const response = {
        "data": {
          "list": [{
            "_id": "5b5ef21f07a93fb2244ce752",
            "uid" : "user",
            "exchange": "binance",
            "access_key": "your-access-key",
            "secret_show": "6ec2******5c7b",
            "secret_key": "your-secret-key",
            "desc": "Binance test",
            "is_deleted":"false",
            "created_at": "2018-07-30T11:10:23.238Z",
            "updated_at": "2018-07-30T11:10:23.238Z"
          }, {
            "_id": "5b63b788c4670f7a112aeb60",
            "uid" : "user",
            "exchange": "huobi",
            "access_key": "your-access-key",
            "secret_show": "6ec2******5c7b",
            "secret_key": "your-secret-key",
            "desc": "Huobi local investment",
            "is_deleted":"false",
            "created_at": "2018-08-03T02:01:44.229Z",
            "updated_at": "2018-08-03T02:01:44.229Z"
          }, {
            "_id": "5b696e975cec0d3e6fb989d9",
            "uid" : "user",
            "exchange": "fcoin",
            "access_key": "your-access-key",
            "secret_show": "6ec2******5c7b",
            "secret_key": "your-secret-key",
            "desc": "Fcoin investment",
            "is_deleted":"false",
            "created_at": "2018-08-07T10:04:07.259Z",
            "updated_at": "2018-08-07T10:04:07.259Z"
          }],
          "page_number": 1,
          "page_size": 9999,
          "total": 3
        },
        "message": "Success",
        "status": 200
      }

      if (response.data && Array.isArray(response.data.list)) {
        const userMarketList = response.data.list.map((item) => ({
          user_market_id: item._id,
          exchange: item.exchange,
          key: item.access_key,
          secret: item.secret_key,
        }));
        setUserMarketList(userMarketList);

        if (marketId) {
          const userMarket = userMarketList.find((element) => element.user_market_id === marketId);
          if (userMarket) {
            handleSelectUserMarket(userMarket);
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch user market list', error);
    }
  };  

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

  const handleSelectPeriod = (item: PeriodType) => {
    if (!item || typeof item !== "object") return; 
    const periodDataList = periodDictionary[item.periodType]?.children || [];
    setFormData({
      ...formData,
      period: item.periodType,
    });
    setPeriodDataList(periodDataList);
  };

  const handleCheckboxChange = (item: PeriodDataItem) => {
    if (!item || typeof item !== 'object') return;
    setFormData((prevFormData) => {
      const periodTypeKey = getPeriodTypeKey(prevFormData.period);
      const newPeriodValue = prevFormData.period_value[periodTypeKey].includes(item.value)
        ? prevFormData.period_value[periodTypeKey].filter((val) => val !== item.value)
        : [...prevFormData.period_value[periodTypeKey], item.value];
      return {
        ...prevFormData,
        period_value: {
          ...prevFormData.period_value,
          [periodTypeKey]: newPeriodValue,
        },
      };
    });
  };

  const getPeriodTypeKey = (period: string): keyof PeriodValue => {
    switch (period) {
      case '1':
        return 'daily';
      case '2':
        return 'weekly';
      case '3':
        return 'monthly';
      default:
        return 'daily';
    }
  };

  const currentPeriodValues = formData.period_value[getPeriodTypeKey(formData.period)];

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
                {userMarketList.map((item) => (
                  <li
                    key={item.exchange}
                    className={`styles[market-item] ${formData.user_market_id === item.user_market_id ? 'active' : ''} ${planId ? 'no-drop' : ''}`}
                    onClick={() => !planId && handleSelectUserMarket(item)}                
                  >
                    <p className="tit">
                      <img 
                        style={{ width: '22px', marginRight: '5px' }} 
                        src={`/images/${item.exchange}.png`}
                        alt={`${item.exchange} logo`} />
                      {item.exchange}
                    </p>
                    <p className="desc">Access Key: {desensitization(item.key)}</p>
                  </li>
                ))}
                <li className="more">
                  <Link href="/newmarket">
                    <i className="fa fa-plus"></i>
                    <span className="color-light-blue" style={{ cursor: "pointer" }}>action.new_exchange_apikey</span>
                  </Link>
                </li>
              </ul>
            </div>
            {invalidFields.user_market_id && (
              <p className="help is-danger">{invalidFields.user_market_id}</p>
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
              <input 
                className={styles.input} 
                type="number" 
                name="base_limit" 
                value={formData.base_limit} 
                onChange={handleInputChange} 
                placeholder='input_single_purchase_amount'/>
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
                {periodList.map((item) => (
                  <li
                    key={item.periodType} 
                    className={`styles['period-item'] ${formData.period === item.periodType ? 'active' : ''}`}
                    onClick={() => handleSelectPeriod(item)}
                  >
                    <p>{item.name}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="field">
            <div className={styles.control}>
              {periodDataList.map((item) => (
                <label className="checkbox" key={item.value}>
                  <input 
                    type="checkbox" 
                    value={item.value}
                    checked={currentPeriodValues.includes(item.value)}
                    onChange={() => handleCheckboxChange(item)}
                  />
                  {item.label}
                </label>                
              ))}
            </div>
            {(invalidFields.period || invalidFields.period_value) && (
              <p className="help is-danger">
                {invalidFields.period || invalidFields.period_value}
              </p>
            )}
          </div>

          <div className="field">
            <label className="label">label.stop_profit_rate</label>
            <div className={styles.control}>
              <input 
                className={styles.input} 
                type="number" 
                name="stop_profit_percentage" 
                value={formData.stop_profit_percentage} 
                onChange={handleInputChange} 
                placeholder='stop_profit_percentage'/>
            </div>
            {invalidFields.stop_profit_percentage && (
              <p className="help is-danger">{invalidFields.stop_profit_percentage}</p>
            )}
          </div>

          <div className="field">
            <label className="label">label.drawdown</label>
            <div className={styles.control}>
              <input 
                className={styles.input} 
                type="number" 
                name="drawdown" 
                value={formData.drawdown} 
                onChange={handleInputChange} 
                placeholder='drawdown_percentage' />
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
