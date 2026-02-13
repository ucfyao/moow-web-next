/** @jsxImportSource @emotion/react */

'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { css } from '@emotion/react';
import { fetchExchangeSymbolList } from '@/utils/defines';
import Link from 'next/link';
import axios from 'axios';
import { getInvalidFields } from '@/utils/validator';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';

// Define CSS styles using Emotion
const newStrategyStyle = css`
  .box {
    margin: 0 auto;
    padding: 30px 50px 50px;
  }

  .no-drop {
    cursor: no-drop;
  }

  .control label {
    margin-right: 10px;
    width: 100px;
  }

  .input {
    width: 600px;
  }

  .market-item {
    width: 200px;
  }

  .plantype-item {
    width: 150px;
  }

  .period-item {
    width: 120px;
  }

  @media screen and (max-width: 768px) {
    .section {
      padding: 20px 0;
    }

    .box {
      padding: 30px 10px;
    }
  }
`;

// Define interfaces for various data types
interface UserMarketItem {
  _id: string;
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
interface FormData {
  user_market_id: string;
  exchange: string;
  key: string;
  secret: string;
  symbol: string;
  base: string;
  base_limit: number | undefined;
  quote: string;
  type: string;
  period: string;
  period_value: number[];
  desc: string;
  stop_profit_percentage: number | undefined;
  drawdown: number | undefined;
}
interface InvalidFields {
  user_market_id?: string;
  symbol?: string;
  base_limit?: string;
  type?: string;
  period?: string;
  period_value?: string;
  stop_profit_percentage?: string;
  drawdown?: string;
}

function NewStrategy() {
  const searchParams = useSearchParams();
  const strategyId = searchParams.get('strategyId') || '';
  const marketId = searchParams.get('marketId') || '';
  const { t } = useTranslation('');
  const [userMarketList, setUserMarketList] = useState<UserMarketItem[]>([]);
  const [symbolList, setSymbolList] = useState<SymbolItem[]>([]);
  const planTypeList: PlanType[] = [
    { type: '1', name: t('label.price_investment') },
    // { type: '2', name: t('label.value_investment') },
  ];
  const periodList: PeriodType[] = [
    { periodType: '1', name: t('label.daily') },
    { periodType: '2', name: t('label.weekly') },
    { periodType: '3', name: t('label.monthly') },
  ];
  const [periodDataList, setPeriodDataList] = useState<PeriodDataItem[]>([]);
  const periodDictionary: { [key: string]: { label: string; children: PeriodDataItem[] } } = {
    '1': {
      label: 'Daily',
      children: Array.from({ length: 24 }, (_, i) => ({ value: i, label: `${i}:00` })),
    },
    '2': {
      label: 'Weekly',
      children: [
        { value: 1, label: 'Monday' },
        { value: 2, label: 'Tuesday' },
        { value: 3, label: 'Wednesday' },
        { value: 4, label: 'Thursday' },
        { value: 5, label: 'Friday' },
        { value: 6, label: 'Saturday' },
        { value: 7, label: 'Sunday' },
      ],
    },
    '3': {
      label: 'Monthly',
      children: [
        { value: 1, label: '1st' },
        { value: 2, label: '2nd' },
        { value: 3, label: '3rd' },
        { value: 4, label: '4th' },
        { value: 5, label: '5th' },
        { value: 6, label: '6th' },
        { value: 7, label: '7th' },
        { value: 8, label: '8th' },
        { value: 9, label: '9th' },
        { value: 10, label: '10th' },
        { value: 11, label: '11th' },
        { value: 12, label: '12th' },
        { value: 13, label: '13th' },
        { value: 14, label: '14th' },
        { value: 15, label: '15th' },
        { value: 16, label: '16th' },
        { value: 17, label: '17th' },
        { value: 18, label: '18th' },
        { value: 19, label: '19th' },
        { value: 20, label: '20th' },
        { value: 21, label: '21st' },
        { value: 22, label: '22nd' },
        { value: 23, label: '23rd' },
        { value: 24, label: '24th' },
        { value: 25, label: '25th' },
        { value: 26, label: '26th' },
        { value: 27, label: '27th' },
        { value: 28, label: '28th' },
      ],
    },
  };

  // Define initial form data state
  const [formData, setFormData] = useState<FormData>({
    user_market_id: '',
    exchange: '',
    key: '',
    secret: '',
    symbol: '',
    base: '',
    base_limit: undefined,
    quote: '',
    type: '1',
    period: '',
    period_value: [],
    desc: '',
    stop_profit_percentage: undefined,
    drawdown: undefined,
  });

  const [invalidFields, setInvalidFields] = useState<InvalidFields>({});
  const [isCreate, setIsCreate] = useState(true); // Track if it's a new strategy
  const [isProcessing, setIsProcessing] = useState(false); // Track if form submission is in progress
  const [isDelete, setIsDelete] = useState(false); // Track if delete action is in progress
  const router = useRouter();

  function handleSelectPeriod(item: PeriodType) {
    if (!item || typeof item !== 'object') return;
    const newPeriodDataList = periodDictionary[item.periodType]?.children || [];
    setFormData((prevFormData) => ({
      ...prevFormData,
      period: item.periodType,
      period_value: [],
    }));
    setPeriodDataList(newPeriodDataList);
  }

  function handleCheckboxChange(item: PeriodDataItem) {
    if (!item || typeof item !== 'object') return;
    setFormData((prevFormData) => {
      const newPeriodValue = prevFormData.period_value.includes(item.value)
        ? prevFormData.period_value.filter((val) => val !== item.value)
        : [...prevFormData.period_value, item.value];
      return {
        ...prevFormData,
        period_value: newPeriodValue,
      };
    });
  }

  // Fetch strategy details if editing an existing strategy
  async function getStrategy() {
    if (!strategyId) {
      return;
    }

    try {
      // TODO  use baseURL instead of hardcode
      const requestUrl = `http://127.0.0.1:3000/api/v1/strategies/${strategyId}`;
      const response = await axios.get(requestUrl);
      const { data } = response;
      if (data) {
        setFormData((prevFormData) => ({
          ...prevFormData,
          ...data,
          stop_profit_percentage: data.stop_profit_percentage || undefined,
          drawdown: data.drawdown || undefined,
        }));
        setIsCreate(false);
        handleSelectPeriod({
          periodType: data.period,
          name: '',
        });

        if (data.period_value) {
          data.period_value.forEach((value: number) => {
            handleCheckboxChange({ value, label: '' });
          });
        }
      }
    } catch (error) {
      console.error('Failed to fetch plan', error);
    }
  }

  function handleSelectUserMarket(item: UserMarketItem) {
    if (!item || typeof item !== 'object') return;
    setFormData((prevFormData) => ({
      ...prevFormData,
      // eslint-disable-next-line
      user_market_id: item._id,
      exchange: item.exchange,
      key: item.key,
      secret: item.secret,
      symbol: '',
      base: '',
      quote: '',
    }));
    const newSymbolList = fetchExchangeSymbolList(item.exchange);
    setSymbolList(newSymbolList);
  }

  // Fetch user market list
  async function queryUserMarketList() {
    try {
      // TODO Replace the mock data with an actual API request when the API is ready.
      // const response = await axios.get('http://127.0.0.1:3000/api/v1/keys');

      // mock data
      const response = {
        data: {
          list: [
            {
              _id: '5b5ef21f07a93fb2244ce752',
              uid: 'user',
              exchange: 'binance',
              access_key: 'your-access-key',
              secret_show: '6ec2******5c7b',
              secret_key: 'your-secret-key',
              desc: 'Binance test',
              is_deleted: 'false',
              created_at: '2018-07-30T11:10:23.238Z',
              updated_at: '2018-07-30T11:10:23.238Z',
            },
            {
              _id: '5b63b788c4670f7a112aeb60',
              uid: 'user',
              exchange: 'huobi',
              access_key: 'your-access-key',
              secret_show: '6ec2******5c7b',
              secret_key: 'your-secret-key',
              desc: 'Huobi local investment',
              is_deleted: 'false',
              created_at: '2018-08-03T02:01:44.229Z',
              updated_at: '2018-08-03T02:01:44.229Z',
            },
            {
              _id: '5b696e975cec0d3e6fb989d9',
              uid: 'user',
              exchange: 'fcoin',
              access_key: 'your-access-key',
              secret_show: '6ec2******5c7b',
              secret_key: 'your-secret-key',
              desc: 'Fcoin investment',
              is_deleted: 'false',
              created_at: '2018-08-07T10:04:07.259Z',
              updated_at: '2018-08-07T10:04:07.259Z',
            },
          ],
          page_number: 1,
          page_size: 9999,
          total: 3,
        },
        message: 'Success',
        status: 200,
      };

      if (response.data && Array.isArray(response.data.list)) {
        const newUserMarketList = response.data.list.map(
          (item: {
            _id: string;
            exchange: string;
            access_key: string;
            secret_key: string;
            uid: string;
          }) => ({
            // eslint-disable-next-line
            _id: item._id,
            exchange: item.exchange,
            key: item.access_key,
            secret: item.secret_key,
            user: item.uid,
          })
        );
        setUserMarketList(newUserMarketList);

        if (marketId) {
          // eslint-disable-next-line
          const userMarket = userMarketList.find((element) => element._id === marketId);
          if (userMarket) {
            handleSelectUserMarket(userMarket);
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch user market list', error);
    }
  }

  useEffect(() => {
    getStrategy();
    queryUserMarketList();
    setSymbolList(fetchExchangeSymbolList(''));

    /* 
    The following part (marketId) was commented out in the previous project.
    The following part could be tested with mock url:
    http://localhost:3001/newStrategy?marketId=5b63b788c4670f7a112aeb60
    */
    // const query = new URLSearchParams(window.location.search);
    // const marketIdQuery = query.get('marketId');
    // if (marketIdQuery) {
    //   setFormData((prevFormData) => ({
    //     ...prevFormData,
    //     user_market_id: marketIdQuery,
    //   }));
    // }
  }, [strategyId]);

  function validateOptionalInteger(rule: any, value: any, callback: any): void {
    if (value === undefined || value === '') {
      callback();
    } else if (/^[1-9]+\d*$/.test(value)) {
      callback();
    } else {
      callback(new Error(t('validator.must_positive_integer')));
    }
  }

  // Define validation rules
  function rules() {
    return {
      user_market_id: [
        {
          required: true,
          message: t('validator.cant_empty'),
          trigger: 'change',
        },
      ],
      symbol: [
        {
          required: true,
          message: t('validator.cant_empty'),
          trigger: 'change',
        },
      ],
      base_limit: [
        {
          type: 'integer',
          required: true,
          pattern: /^[1-9]+\d*$/,
          message: t('validator.must_positive_integer'),
          trigger: 'change',
          min: 1,
          transform(value: string) {
            return parseFloat(value);
          },
        },
      ],
      type: [
        {
          required: true,
          message: t('validator.cant_empty'),
          trigger: 'blur',
        },
      ],
      period: [
        {
          required: true,
          message: t('validator.cant_empty'),
          trigger: 'blur',
        },
      ],
      period_value: [
        {
          type: 'array',
          required: true,
          min: 1,
          message: t('validator.cant_empty'),
          trigger: 'blur',
        },
      ],
      stop_profit_percentage: [
        {
          type: 'integer',
          validator: validateOptionalInteger,
          trigger: 'change',
        },
      ],
      drawdown: [
        {
          type: 'integer',
          validator: validateOptionalInteger,
          trigger: 'change',
        },
      ],
    };
  }

  function goBack() {
    router.back();
  }

  // Desensitize sensitive data
  function desensitization(val: string): string {
    if (!val || val.length < 7) return val;
    return `${val.slice(0, 4)}****${val.slice(-3)}`;
  }

  function handleSelectSymbol(item: SymbolItem) {
    if (!item || typeof item !== 'object') return;
    setFormData((prevFormData) => ({
      ...prevFormData,
      symbol: item.symbol,
      base: item.base,
      quote: item.quote,
    }));
  }

  function handleSelectPlanType(item: PlanType) {
    if (!item || typeof item !== 'object') return;
    setFormData((prevFormData) => ({
      ...prevFormData,
      type: item.type,
    }));
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value === '' ? undefined : Number(value),
    }));
  }

  // Handle form submission to create or update an investment plan
  async function handleCreateInvestmentPlan() {
    if (isProcessing) return;

    const newInvalidFields = await getInvalidFields(formData, rules());
    if (newInvalidFields) {
      setInvalidFields(newInvalidFields);
      return;
    }
    setIsProcessing(true);
    try {
      const requestMethod = strategyId ? 'patch' : 'post';
      // TODO  use baseURL instead of hardcode
      const requestUrl = strategyId
        ? `http://127.0.0.1:3000/api/v1/strategies/${strategyId}`
        : 'http://127.0.0.1:3000/api/v1/strategies';
      const requestData = formData;
      const response = await axios({
        method: requestMethod,
        url: requestUrl,
        data: requestData,
      });
      console.log(response);
      setIsProcessing(false);
      router.push('/aip');
    } catch (error) {
      const errorMessage = (error as Error).message || t('prompt.error_occurs');
      alert(errorMessage);
      setIsProcessing(false);
    }
  }

  // Handle form submission to delete an investment plan (soft delete)
  async function handleDeleteInvestmentPlan() {
    if (isDelete) return; // Prevent multiple submissions by checking if deletion is already in progress
    setIsDelete(true); // Set isDelete to true to indicate the deletion process has started

    const confirmed = window.confirm(
      `${t('prompt.confirm_switch_plan_status')} ${t('action.delete')}`
    );
    if (!confirmed) {
      setIsDelete(false); // If user cancels the deletion, reset isDelete to false and exit the function
      return;
    }

    try {
      // TODO  use baseURL instead of hardcode
      const requestData = {
        _id: formData.user_market_id,
        status: '3',
      };
      const requestUrl = `http://127.0.0.1:3000/api/v1/strategies/${strategyId}`;
      const response = await axios.patch(requestUrl, requestData);
      console.log(response);
      setIsDelete(false); // Reset isDelete to false to indicate the deletion process has completed
      router.push('/strategies');
    } catch (error) {
      const errorMessage = (error as Error).message || t('prompt.error_occurs');
      alert(errorMessage);
      setIsDelete(false); // Reset isDelete to false to allow the user to attempt deletion again if needed
    }
  }

  return (
    <div css={newStrategyStyle} className="container">
      <section className="section">
        <div className="box">
          <div className="header">
            <p className="is-size-6 is-pulled-left" style={{ marginRight: '10px' }}>
              {isCreate ? (
                <span>{t('caption.new_plan')}</span>
              ) : (
                <span>{t('caption.edit_plan')}</span>
              )}
            </p>
            <button
              type="button"
              onClick={goBack}
              className="is-pulled-right is-link"
              style={{
                background: 'none',
                border: 'none',
                padding: '0',
                cursor: 'pointer',
              }}
            >
              {t('action.go_back')}
            </button>
          </div>

          <div className="field">
            {/* eslint-disable-next-line */}
            <label className="label">
              <span className="has-text-danger">*</span>
              {t('label.select')}
              {t('label.exchange_apikey')}
            </label>
            <div className="control">
              <ul className="choice is-clearfix">
                {userMarketList.map((item) => (
                  <li
                    key={item.exchange}
                    // eslint-disable-next-line
                    className={`styles[market-item] ${formData.user_market_id === item._id ? 'active' : ''} ${strategyId ? 'no-drop' : ''}`}
                  >
                    <button
                      type="button"
                      onClick={() => !strategyId && handleSelectUserMarket(item)}
                    >
                      <p className="tit">
                        <Image
                          style={{ width: '22px', marginRight: '5px' }}
                          src={`/images/${item.exchange}.png`}
                          alt={`${item.exchange} logo`}
                          width={22}
                          height={22}
                        />
                        {item.exchange}
                      </p>
                      <p className="desc">Access Key: {desensitization(item.key)}</p>
                    </button>
                  </li>
                ))}
                <li className="more">
                  <Link href="/aip/addmarketkeys">
                    {/* eslint-disable-next-line */}
                    <i className="fa fa-plus"></i>
                    <span className="color-light-blue" style={{ cursor: 'pointer' }}>
                      {t('action.new_exchange_apikey')}
                    </span>
                  </Link>
                </li>
              </ul>
            </div>
            {invalidFields.user_market_id && (
              <p className="help is-danger">{invalidFields.user_market_id}</p>
            )}
            {strategyId && (
              <p className="help" style={{ color: '#ff9900', fontWeight: 'bold' }}>
                *{t('label.not_modifiable')}
              </p>
            )}
          </div>

          <div className="field">
            {/* eslint-disable-next-line */}
            <label className="label">
              <span className="has-text-danger">*</span>
              {t('label.select')}
              {t('label.symbol')}
            </label>
            <div className="control">
              <ul className="choice is-clearfix is-flex">
                {symbolList.map((item) => (
                  <li
                    key={item.symbol}
                    className={`symbol-item ${formData.symbol === item.symbol ? 'active' : ''} ${strategyId ? 'no-drop' : ''}`}
                  >
                    <button type="button" onClick={() => !strategyId && handleSelectSymbol(item)}>
                      <p>{item.symbol}</p>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            {invalidFields.symbol && <p className="help is-danger">{invalidFields.symbol}</p>}
            {formData.symbol && !strategyId && (
              <p className="help is-link">
                {t('prompt.plan_tips')}
                {` base: ${formData.base} quote: ${formData.quote}`}
              </p>
            )}
            {strategyId && (
              <p className="help" style={{ color: '#ff9900', fontWeight: 'bold' }}>
                *{t('label.not_modifiable')}
              </p>
            )}
          </div>

          <div className="field">
            {/* eslint-disable-next-line */}
            <label className="label">
              <span className="has-text-danger">*</span>
              {t('label.select')}
              {t('label.plan_type')}
            </label>
            <div className="control">
              <ul className="choice is-clearfix">
                {planTypeList.map((item) => (
                  <li
                    key={item.type}
                    className={`styles['plantype-item'] ${formData.type === item.type ? 'active' : ''}`}
                  >
                    <button type="button" onClick={() => handleSelectPlanType(item)}>
                      <p>{item.name}</p>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            {invalidFields.type && <p className="help is-danger">{invalidFields.type}</p>}
          </div>

          <div className="field">
            {/* eslint-disable-next-line */}
            <label className="label" htmlFor="singleAmountInput">
              <span className="has-text-danger">*</span>
              {t('label.input')}
              {t('label.single_purchase_amount')}
            </label>
            <div className="control">
              <input
                id="singleAmountInput"
                className="input"
                type="number"
                name="base_limit"
                value={formData.base_limit !== undefined ? formData.base_limit : ''}
                onChange={handleInputChange}
                placeholder={t('placeholder.input_single_purchase_amount')}
              />
            </div>
            {invalidFields.base_limit && (
              <p className="help is-danger">{invalidFields.base_limit}</p>
            )}
          </div>

          <div className="field">
            {/* eslint-disable-next-line */}
            <label className="label">
              <span className="has-text-danger">*</span>
              {t('label.select')}
              {t('label.plan_period')}
            </label>
            <div className="control">
              <ul className="choice is-clearfix">
                {periodList.map((item) => (
                  <li
                    key={item.periodType}
                    className={`styles['period-item'] ${formData.period === item.periodType ? 'active' : ''}`}
                  >
                    <button type="button" onClick={() => handleSelectPeriod(item)}>
                      <p>{item.name}</p>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="field">
            <div className="control">
              {periodDataList.map((item) => (
                <label className="checkbox" key={item.value} htmlFor={`period_${item.value}`}>
                  <input
                    id={`period_${item.value}`}
                    type="checkbox"
                    value={item.value}
                    checked={formData.period_value.includes(item.value)}
                    onChange={() => handleCheckboxChange(item)}
                  />
                  {item.label}
                </label>
              ))}
            </div>
            {(invalidFields.period && !formData.period) ||
            (invalidFields.period_value && formData.period_value.length === 0) ? (
              <p className="help is-danger">{invalidFields.period || invalidFields.period_value}</p>
            ) : null}{' '}
            {(invalidFields.period && !formData.period) ||
            (invalidFields.period_value && formData.period_value.length === 0) ? (
              <p className="help is-danger">{invalidFields.period || invalidFields.period_value}</p>
            ) : null}
          </div>

          <div className="field">
            {/* eslint-disable-next-line */}
            <label className="label" htmlFor="stopInput">
              {t('label.input')}
              {t('label.stop_profit_rate')}
            </label>
            <div className="control">
              <input
                id="stopInput"
                className="input"
                type="number"
                name="stop_profit_percentage"
                value={
                  formData.stop_profit_percentage !== undefined
                    ? formData.stop_profit_percentage
                    : ''
                }
                onChange={handleInputChange}
                placeholder={t('placeholder.stop_profit_percentage')}
              />
            </div>
            {invalidFields.stop_profit_percentage && (
              <p className="help is-danger">{invalidFields.stop_profit_percentage}</p>
            )}
          </div>

          <div className="field">
            {/* eslint-disable-next-line */}
            <label className="label" htmlFor="drawdownInput">
              {t('label.input')}
              {t('label.drawdown')}
            </label>
            <div className="control">
              <input
                id="drawdownInput"
                className="input"
                type="number"
                name="drawdown"
                value={formData.drawdown !== undefined ? formData.drawdown : ''}
                onChange={handleInputChange}
                placeholder={t('placeholder.drawdown_percentage')}
              />
            </div>
            {invalidFields.drawdown && <p className="help is-danger">{invalidFields.drawdown}</p>}
          </div>

          <div className="field is-grouped">
            <div className="control">
              <button
                type="button"
                className={`button is-link button-pad ${isProcessing ? 'is-loading' : ''}`}
                onClick={handleCreateInvestmentPlan}
                disabled={isProcessing}
              >
                {strategyId ? t('action.modify') : t('action.submit')}
              </button>
              {strategyId && (
                <button
                  type="button"
                  className={`button is-danger button-pad ${isDelete ? 'is-loading' : ''}`}
                  onClick={handleDeleteInvestmentPlan}
                  disabled={isDelete}
                >
                  {t('action.delete')}
                </button>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function NewStrategyPage() {
  return (
    <Suspense>
      <NewStrategy />
    </Suspense>
  );
}
