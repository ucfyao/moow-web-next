/** @jsxImportSource @emotion/react */

'use client';

import React, { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { css } from '@emotion/react';
import Link from 'next/link';
import { getInvalidFields } from '@/utils/validator';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';
import HTTP from '@/lib/http';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

const addStrategyStyle = css`
  .box {
    margin: 0 auto;
    padding: 30px 50px 50px;
  }

  .no-drop {
    cursor: no-drop;
  }

  .control label.checkbox {
    margin-right: 10px;
  }

  .input {
    width: 600px;
    max-width: 100%;
  }

  .market-item {
    width: 200px;
  }

  .symbol-item {
    width: auto;
    min-width: 120px;
  }

  .plantype-item {
    width: 150px;
  }

  .period-item {
    width: 120px;
  }

  .choice button {
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    width: 100%;
    text-align: left;
  }

  .button-pad {
    margin-right: 10px;
  }

  .loading-container {
    text-align: center;
    padding: 60px 0;
    color: #999;
  }

  @media screen and (max-width: 768px) {
    .section {
      padding: 20px 0;
    }

    .box {
      padding: 30px 10px;
    }

    .input {
      width: 100%;
    }
  }
`;

interface UserMarketItem {
  _id: string;
  exchange: string;
  name?: string;
  access_key: string;
  secret_key: string;
}

interface SymbolItem {
  symbol: string;
  base: string;
  quote: string;
  exchange: string;
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

interface StrategyFormData {
  _id?: string;
  user_market_id: string;
  exchange: string;
  key: string;
  secret: string;
  symbol: string;
  base: string;
  quote: string;
  base_limit: string;
  type: string;
  period: string;
  period_value: number[];
  stop_profit_percentage: string;
  drawdown: string;
}

interface InvalidFields {
  [key: string]: string | undefined;
}

const WEEKDAY_KEYS = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
];

function buildPeriodDictionary(
  t: (key: string) => string,
): Record<string, { children: PeriodDataItem[] }> {
  return {
    '1': {
      children: Array.from({ length: 24 }, (_, i) => ({
        value: i,
        label: t(`period.hour_${i}`),
      })),
    },
    '2': {
      children: WEEKDAY_KEYS.map((key, i) => ({
        value: i + 1,
        label: t(`period.${key}`),
      })),
    },
    '3': {
      children: Array.from({ length: 28 }, (_, i) => ({
        value: i + 1,
        label: t(`period.day_${i + 1}`),
      })),
    },
  };
}

function desensitize(val: string): string {
  if (!val || val.length < 7) return val;
  return `${val.slice(0, 4)}****${val.slice(-3)}`;
}

const INITIAL_FORM_DATA: StrategyFormData = {
  user_market_id: '',
  exchange: '',
  key: '',
  secret: '',
  symbol: '',
  base: '',
  quote: '',
  base_limit: '',
  type: '1',
  period: '',
  period_value: [],
  stop_profit_percentage: '',
  drawdown: '',
};

function AddStrategy() {
  const searchParams = useSearchParams();
  const strategyId = searchParams.get('strategyId') || '';
  const marketId = searchParams.get('marketId') || '';
  const { t } = useTranslation('');
  const router = useRouter();

  const allSymbolsRef = useRef<SymbolItem[]>([]);
  const [userMarketList, setUserMarketList] = useState<UserMarketItem[]>([]);
  const [symbolList, setSymbolList] = useState<SymbolItem[]>([]);
  const [formData, setFormData] = useState<StrategyFormData>(INITIAL_FORM_DATA);
  const [periodDataList, setPeriodDataList] = useState<PeriodDataItem[]>([]);
  const [invalidFields, setInvalidFields] = useState<InvalidFields>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  const periodDictionary = buildPeriodDictionary(t);

  const planTypeList: PlanType[] = [
    { type: '1', name: t('label.price_investment') },
  ];

  const periodList: PeriodType[] = [
    { periodType: '1', name: t('label.daily') },
    { periodType: '2', name: t('label.weekly') },
    { periodType: '3', name: t('label.monthly') },
  ];

  function showError(message: string) {
    setSnackbar({ open: true, message, severity: 'error' });
  }

  function showSuccess(message: string) {
    setSnackbar({ open: true, message, severity: 'success' });
  }

  function handleSelectPeriod(periodType: string, periodValue?: number[]) {
    const children = periodDictionary[periodType]?.children || [];
    setFormData((prev) => ({
      ...prev,
      period: periodType,
      period_value: periodValue || [],
    }));
    setPeriodDataList(children);
  }

  function handleCheckboxChange(value: number) {
    setFormData((prev) => {
      const newPeriodValue = prev.period_value.includes(value)
        ? prev.period_value.filter((v) => v !== value)
        : [...prev.period_value, value];
      return { ...prev, period_value: newPeriodValue };
    });
  }

  function handleSelectUserMarket(item: UserMarketItem) {
    setFormData((prev) => ({
      ...prev,
      user_market_id: item._id,
      exchange: item.exchange,
      key: item.access_key,
      secret: item.secret_key,
      symbol: '',
      base: '',
      quote: '',
    }));
    setSymbolList(
      allSymbolsRef.current.filter((s) => s.exchange === item.exchange),
    );
    setInvalidFields((prev) => ({ ...prev, user_market_id: undefined }));
  }

  function handleSelectSymbol(item: SymbolItem) {
    setFormData((prev) => ({
      ...prev,
      symbol: item.symbol,
      base: item.base,
      quote: item.quote,
    }));
    setInvalidFields((prev) => ({ ...prev, symbol: undefined }));
  }

  function handleSelectPlanType(item: PlanType) {
    setFormData((prev) => ({ ...prev, type: item.type }));
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setInvalidFields((prev) => ({ ...prev, [name]: undefined }));
  }

  function validationRules() {
    return {
      user_market_id: [
        { required: true, message: t('validator.cant_empty'), trigger: 'change' },
      ],
      symbol: [{ required: true, message: t('validator.cant_empty'), trigger: 'change' }],
      base_limit: [
        {
          required: true,
          pattern: /^[1-9]\d*$/,
          message: t('validator.must_positive_integer'),
          trigger: 'change',
        },
      ],
      type: [{ required: true, message: t('validator.cant_empty'), trigger: 'blur' }],
      period: [{ required: true, message: t('validator.cant_empty'), trigger: 'blur' }],
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
          validator(rule: any, value: any, callback: any) {
            if (value === '' || value === undefined) {
              callback();
            } else if (/^[1-9]\d*$/.test(value)) {
              callback();
            } else {
              callback(new Error(t('validator.must_positive_integer')));
            }
          },
          trigger: 'change',
        },
      ],
      drawdown: [
        {
          validator(rule: any, value: any, callback: any) {
            if (value === '' || value === undefined) {
              callback();
            } else if (/^[1-9]\d*$/.test(value)) {
              callback();
            } else {
              callback(new Error(t('validator.must_positive_integer')));
            }
          },
          trigger: 'change',
        },
      ],
    };
  }

  const fetchUserMarketList = useCallback(async () => {
    try {
      const res: any = await HTTP.get('/v1/keys');
      const list = res?.data?.list || [];
      setUserMarketList(list);

      if (marketId && list.length > 0) {
        const found = list.find((item: UserMarketItem) => item._id === marketId);
        if (found) {
          handleSelectUserMarket(found);
        }
      }
    } catch (error: any) {
      console.error('Failed to fetch exchange keys:', error);
      showError(error?.message || t('prompt.error_occurs'));
    }
  }, [marketId, t]);

  const fetchStrategy = useCallback(async () => {
    if (!strategyId) return;
    setLoading(true);
    try {
      const res: any = await HTTP.get(`/v1/strategies/${strategyId}`);
      const data = res?.data?.info;
      if (data) {
        setFormData({
          _id: data._id,
          user_market_id: data.user_market_id || '',
          exchange: data.exchange || '',
          key: '',
          secret: '',
          symbol: data.symbol || '',
          base: data.base || '',
          quote: data.quote || '',
          base_limit: data.base_limit != null ? String(data.base_limit) : '',
          type: data.type != null ? String(data.type) : '1',
          period: data.period != null ? String(data.period) : '',
          period_value: data.period_value || [],
          stop_profit_percentage:
            data.stop_profit_percentage != null ? String(data.stop_profit_percentage) : '',
          drawdown: data.drawdown != null ? String(data.drawdown) : '',
        });

        if (data.exchange) {
          setSymbolList(
            allSymbolsRef.current.filter((s) => s.exchange === data.exchange),
          );
        }

        if (data.period) {
          handleSelectPeriod(String(data.period), data.period_value || []);
        }
      }
    } catch (error: any) {
      console.error('Failed to fetch strategy:', error);
      showError(error?.message || t('prompt.error_occurs'));
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [strategyId, t]);

  useEffect(() => {
    async function init() {
      // Fetch symbols first (needed by market selection and strategy loading)
      try {
        const res: any = await HTTP.get('/v1/symbols');
        const list = res?.data?.list || [];
        allSymbolsRef.current = list;
      } catch (error: any) {
        console.error('Failed to fetch symbols:', error);
      }
      // Then fetch keys and strategy (they depend on symbols being loaded)
      fetchUserMarketList();
      fetchStrategy();
    }
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit() {
    if (isProcessing) return;

    setInvalidFields({});
    const errors = await getInvalidFields(formData, validationRules());
    if (errors) {
      setInvalidFields(errors as InvalidFields);
      return;
    }

    setIsProcessing(true);
    try {
      if (strategyId) {
        // Update: only send editable fields
        const updatePayload: any = {
          base_limit: Number(formData.base_limit),
          period: formData.period,
          period_value: formData.period_value,
        };
        if (formData.stop_profit_percentage !== '') {
          updatePayload.stop_profit_percentage = Number(formData.stop_profit_percentage);
        }
        if (formData.drawdown !== '') {
          updatePayload.drawdown = Number(formData.drawdown);
        }
        await HTTP.patch(`/v1/strategies/${strategyId}`, updatePayload);
      } else {
        // Create: send all required fields including key/secret
        const createPayload: any = {
          user_market_id: formData.user_market_id,
          exchange: formData.exchange,
          key: formData.key,
          secret: formData.secret,
          symbol: formData.symbol,
          base: formData.base,
          quote: formData.quote,
          base_limit: Number(formData.base_limit),
          type: formData.type,
          period: formData.period,
          period_value: formData.period_value,
        };
        if (formData.stop_profit_percentage !== '') {
          createPayload.stop_profit_percentage = Number(formData.stop_profit_percentage);
        }
        if (formData.drawdown !== '') {
          createPayload.drawdown = Number(formData.drawdown);
        }
        await HTTP.post('/v1/strategies', createPayload);
      }
      showSuccess(t('prompt.operation_succeed'));
      router.push('/aip');
    } catch (error: any) {
      showError(error?.message || t('prompt.error_occurs'));
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleDelete() {
    if (isDeleting || !strategyId) return;

    if (!window.confirm(t('prompt.confirm_delete_strategy'))) {
      return;
    }

    setIsDeleting(true);
    try {
      await HTTP.delete(`/v1/strategies/${strategyId}`);
      showSuccess(t('prompt.operation_succeed'));
      router.push('/aip');
    } catch (error: any) {
      showError(error?.message || t('prompt.error_occurs'));
    } finally {
      setIsDeleting(false);
    }
  }

  if (loading) {
    return (
      <div css={addStrategyStyle} className="container">
        <section className="section">
          <div className="loading-container">{t('prompt.loading')}</div>
        </section>
      </div>
    );
  }

  return (
    <div css={addStrategyStyle} className="container">
      <section className="section">
        <div className="box">
          <div className="header">
            <p className="is-size-6 is-pulled-left" style={{ marginRight: '10px' }}>
              {strategyId ? t('caption.edit_plan') : t('caption.new_plan')}
            </p>
            <button
              type="button"
              onClick={() => router.back()}
              className="is-pulled-right"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3273dc' }}
            >
              {t('action.go_back')}
            </button>
          </div>

          {/* Exchange API Key Selection */}
          <div className="field">
            <label className="label">
              <span className="has-text-danger">*</span>
              {t('label.select')}
              {t('label.exchange_apikey')}
            </label>
            <div className="control">
              <ul className="choice is-clearfix">
                {userMarketList.map((item) => (
                  <li
                    key={item._id}
                    className={`market-item ${formData.user_market_id === item._id ? 'active' : ''} ${strategyId ? 'no-drop' : ''}`}
                  >
                    <button
                      type="button"
                      onClick={() => !strategyId && handleSelectUserMarket(item)}
                    >
                      <p className="tit">
                        <Image
                          style={{ width: '22px', marginRight: '5px' }}
                          src={`/images/${item.exchange}.png`}
                          alt={item.exchange}
                          width={22}
                          height={22}
                        />
                        {item.name || item.exchange}
                      </p>
                      <p className="desc">Access Key: {desensitize(item.access_key)}</p>
                    </button>
                  </li>
                ))}
                <li className="more">
                  <Link href="/aip/addmarketkeys">
                    <i className="fa fa-plus" />
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

          {/* Symbol Selection */}
          <div className="field">
            <label className="label">
              <span className="has-text-danger">*</span>
              {t('label.select')}
              {t('label.symbol')}
            </label>
            <div className="control">
              <ul className="choice is-clearfix">
                {symbolList.map((item) => (
                  <li
                    key={item.symbol}
                    className={`symbol-item ${formData.symbol === item.symbol ? 'active' : ''} ${strategyId ? 'no-drop' : ''}`}
                  >
                    <button
                      type="button"
                      onClick={() => !strategyId && handleSelectSymbol(item)}
                    >
                      <p>{item.symbol}</p>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            {invalidFields.symbol && <p className="help is-danger">{invalidFields.symbol}</p>}
            {formData.symbol && !strategyId && (
              <p className="help is-link">
                {t('prompt.plan_tips', { base: formData.base, quote: formData.quote })}
              </p>
            )}
            {strategyId && (
              <p className="help" style={{ color: '#ff9900', fontWeight: 'bold' }}>
                *{t('label.not_modifiable')}
              </p>
            )}
          </div>

          {/* Plan Type Selection */}
          <div className="field">
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
                    className={`plantype-item ${formData.type === item.type ? 'active' : ''}`}
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

          {/* Single Purchase Amount */}
          <div className="field">
            <label className="label" htmlFor="baseLimitInput">
              <span className="has-text-danger">*</span>
              {t('label.input')}
              {t('label.single_purchase_amount')}
            </label>
            <div className="control">
              <input
                id="baseLimitInput"
                className="input"
                type="text"
                name="base_limit"
                value={formData.base_limit}
                onChange={handleInputChange}
                placeholder={t('placeholder.input_single_purchase_amount')}
              />
            </div>
            {invalidFields.base_limit && (
              <p className="help is-danger">{invalidFields.base_limit}</p>
            )}
          </div>

          {/* Period Selection */}
          <div className="field">
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
                    className={`period-item ${formData.period === item.periodType ? 'active' : ''}`}
                  >
                    <button type="button" onClick={() => handleSelectPeriod(item.periodType)}>
                      <p>{item.name}</p>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Period Value Checkboxes */}
          {periodDataList.length > 0 && (
            <div className="field">
              <div className="control">
                {periodDataList.map((item) => (
                  <label className="checkbox" key={item.value} htmlFor={`period_${item.value}`}>
                    <input
                      id={`period_${item.value}`}
                      type="checkbox"
                      checked={formData.period_value.includes(item.value)}
                      onChange={() => handleCheckboxChange(item.value)}
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
          )}

          {/* Stop Profit Percentage */}
          <div className="field">
            <label className="label" htmlFor="stopProfitInput">
              {t('label.input')}
              {t('label.stop_profit_rate')}
            </label>
            <div className="control">
              <input
                id="stopProfitInput"
                className="input"
                type="text"
                name="stop_profit_percentage"
                value={formData.stop_profit_percentage}
                onChange={handleInputChange}
                placeholder={t('placeholder.stop_profit_percentage')}
              />
            </div>
            {invalidFields.stop_profit_percentage && (
              <p className="help is-danger">{invalidFields.stop_profit_percentage}</p>
            )}
          </div>

          {/* Drawdown Percentage */}
          <div className="field">
            <label className="label" htmlFor="drawdownInput">
              {t('label.input')}
              {t('label.drawdown')}
            </label>
            <div className="control">
              <input
                id="drawdownInput"
                className="input"
                type="text"
                name="drawdown"
                value={formData.drawdown}
                onChange={handleInputChange}
                placeholder={t('placeholder.drawdown_percentage')}
              />
            </div>
            {invalidFields.drawdown && (
              <p className="help is-danger">{invalidFields.drawdown}</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="field is-grouped">
            <div className="control">
              <button
                type="button"
                className={`button is-link button-pad ${isProcessing ? 'is-loading' : ''}`}
                onClick={handleSubmit}
                disabled={isProcessing}
              >
                {strategyId ? t('action.modify') : t('action.submit')}
              </button>
              {strategyId && (
                <button
                  type="button"
                  className={`button is-danger button-pad ${isDeleting ? 'is-loading' : ''}`}
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {t('action.delete')}
                </button>
              )}
            </div>
          </div>
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
    </div>
  );
}

export default function AddStrategyPage() {
  return (
    <Suspense>
      <AddStrategy />
    </Suspense>
  );
}
