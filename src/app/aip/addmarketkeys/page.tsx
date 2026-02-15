/** @jsxImportSource @emotion/react */
'use client';

import React, { useState } from 'react';
import { css } from '@emotion/react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { getInvalidFields } from '@/utils/validator';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import HTTP from '@/lib/http';

interface ExchangeItem {
  exchange: string;
  name: string;
  url: string;
}

interface FormData {
  exchange: string;
  access_key: string;
  secret_key: string;
  desc: string;
}

interface InvalidFields {
  exchange?: string;
  access_key?: string;
  secret_key?: string;
  desc?: string;
}

const EXCHANGE_LIST: ExchangeItem[] = [
  { exchange: 'binance', name: 'Binance', url: 'https://www.binance.com' },
  { exchange: 'huobi', name: 'Huobi', url: 'https://www.huobi.com' },
  { exchange: 'okex', name: 'OKEx', url: 'https://www.okex.com' },
  { exchange: 'gateio', name: 'Gate.io', url: 'https://www.gate.io' },
  { exchange: 'bitfinex', name: 'Bitfinex', url: 'https://www.bitfinex.com' },
  { exchange: 'bibox', name: 'Bibox', url: 'https://www.bibox.com' },
];

export default function AddMarketKeysPage() {
  const { t } = useTranslation('');
  const router = useRouter();

  const [formData, setFormData] = useState<FormData>({
    exchange: '',
    access_key: '',
    secret_key: '',
    desc: '',
  });
  const [invalidFields, setInvalidFields] = useState<InvalidFields>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [alertMessage, setAlertMessage] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [open, setOpen] = useState(false);

  const rules = () => ({
    exchange: [{ required: true, message: t('validator.exchange_cant_empty') }],
    access_key: [
      { required: true, message: t('validator.key_cant_empty') },
      { max: 65, message: t('validator.input_too_long') },
    ],
    secret_key: [
      { required: true, message: t('validator.secret_cant_empty') },
      { max: 65, message: t('validator.input_too_long') },
    ],
    desc: [{ required: true, message: t('validator.desc_cant_empty') }],
  });

  function handleSelectExchange(exchange: string) {
    setFormData((prev) => ({ ...prev, exchange }));
    setInvalidFields((prev) => ({ ...prev, exchange: undefined }));
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setInvalidFields((prev) => ({ ...prev, [name]: undefined }));
  }

  async function handleSubmit() {
    if (isProcessing) return;

    const errors = await getInvalidFields(formData, rules());
    if (errors) {
      setInvalidFields(errors);
      return;
    }

    setIsProcessing(true);
    try {
      await HTTP.post('/v1/keys', formData);
      setAlertMessage({ type: 'success', message: t('prompt.key_validated_saved') });
      setOpen(true);
      setTimeout(() => {
        router.push('/aip/markets');
      }, 1500);
    } catch (error: any) {
      const msg = error?.message || t('prompt.error_occurs');
      setAlertMessage({ type: 'error', message: msg });
      setOpen(true);
      setIsProcessing(false);
    }
  }

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div css={pageStyle} className="container">
      <Snackbar
        open={open}
        autoHideDuration={6000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        {alertMessage ? (
          <Alert onClose={handleClose} severity={alertMessage.type}>
            {alertMessage.message}
          </Alert>
        ) : undefined}
      </Snackbar>
      <section className="section">
        <div className="box">
          <div className="box-header">
            <p className="is-size-6">{t('caption.new_exchange_apikey')}</p>
            <button type="button" className="button is-small" onClick={() => router.back()}>
              {t('action.go_back')}
            </button>
          </div>

          <div className="field">
            <label className="label">
              <span className="has-text-danger">*</span>
              {t('label.select')}
              {t('label.exchange')}
            </label>
            <div className="control">
              <ul className="exchange-list">
                {EXCHANGE_LIST.map((item) => (
                  <li
                    key={item.exchange}
                    className={`exchange-item ${formData.exchange === item.exchange ? 'active' : ''}`}
                  >
                    <button
                      type="button"
                      className="exchange-button"
                      onClick={() => handleSelectExchange(item.exchange)}
                      aria-label={`${t('label.exchange')}: ${item.name}`}
                      aria-pressed={formData.exchange === item.exchange}
                    >
                      <div className="exchange-title">
                        <img src={`/images/${item.exchange}.png`} alt={item.name} />
                        {item.name}
                      </div>
                      <p className="exchange-url">{item.url}</p>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            {invalidFields.exchange && <p className="help is-danger" role="alert" aria-live="polite">{invalidFields.exchange}</p>}
          </div>

          <div className="field">
            <label className="label">
              <span className="has-text-danger">*</span>
              {t('label.input')}
              {t('label.access_key')}
            </label>
            <div className="control">
              <input
                id="market-access-key"
                className="input key-input"
                type="text"
                name="access_key"
                value={formData.access_key}
                onChange={handleInputChange}
                placeholder={t('placeholder.access_key')}
                aria-label={t('label.access_key')}
              />
            </div>
            {invalidFields.access_key && (
              <p className="help is-danger" role="alert" aria-live="polite">{invalidFields.access_key}</p>
            )}
          </div>

          <div className="field">
            <label className="label">
              <span className="has-text-danger">*</span>
              {t('label.input')}
              {t('label.secret_key')}
            </label>
            <div className="control">
              <input
                id="market-secret-key"
                className="input key-input"
                type="text"
                name="secret_key"
                value={formData.secret_key}
                onChange={handleInputChange}
                placeholder={t('placeholder.secret_key')}
                aria-label={t('label.secret_key')}
              />
            </div>
            {invalidFields.secret_key && (
              <p className="help is-danger" role="alert" aria-live="polite">{invalidFields.secret_key}</p>
            )}
          </div>

          <div className="field">
            <label className="label">
              <span className="has-text-danger">*</span>
              {t('label.input')}
              {t('label.remark')}
            </label>
            <div className="control">
              <input
                id="market-desc"
                className="input key-input"
                type="text"
                name="desc"
                value={formData.desc}
                onChange={handleInputChange}
                placeholder={t('placeholder.remark')}
                aria-label={t('label.remark')}
              />
            </div>
            {invalidFields.desc && <p className="help is-danger" role="alert" aria-live="polite">{invalidFields.desc}</p>}
          </div>

          <div className="field is-grouped">
            <div className="control">
              <button
                type="button"
                className={`button is-link ${isProcessing ? 'is-loading' : ''}`}
                onClick={handleSubmit}
                disabled={isProcessing}
              >
                {t('action.confirm')}
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

const pageStyle = css`
  .box {
    margin: 0 auto;
    padding: 50px;
  }

  .box-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
  }

  .key-input {
    max-width: 600px;
  }

  .exchange-list {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .exchange-item {
    width: 168px;
    background-color: #f6f6f6;
    border-radius: 8px;
    border: 2px solid transparent;
    text-align: center;
    cursor: pointer;
    transition:
      border-color 0.2s,
      box-shadow 0.2s;
    overflow: hidden;
  }

  .exchange-item.active {
    border-color: #3273dc;
    box-shadow: 0 0 8px rgba(50, 115, 220, 0.4);
  }

  .exchange-button {
    display: block;
    width: 100%;
    padding: 16px;
    background: none;
    border: none;
    cursor: pointer;
    text-align: center;
  }

  .exchange-title {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
  }

  .exchange-title img {
    width: 22px;
  }

  .exchange-url {
    margin-top: 8px;
    font-size: 0.85em;
    color: #888;
  }

  @media screen and (max-width: 768px) {
    .box {
      padding: 30px 10px;
    }

    .key-input {
      max-width: 100%;
    }
  }
`;
