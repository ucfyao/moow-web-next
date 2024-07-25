/** @jsxImportSource @emotion/react */

'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import { getInvalidFields } from '@/utils/validator';
import { css } from '@emotion/react';

const styles = css`
  .box {
    margin: 0 auto;
    padding: 50px;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  }

  .input {
    width: 100%;
    max-width: 600px;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 16px;
    margin-bottom: 16px;
  }

  .exchangeItem {
    width: 168px;
    flex: 1 1 auto;
    max-width: 200px;
    padding: 16px;
    background-color: rgb(246, 246, 246);
    border-radius: 8px;
    text-align: center;
    cursor: pointer;
    transition:
      transform 0.3s,
      box-shadow 0.3s;
    margin-bottom: 16px;
  }

  .active {
    border-color: #007bff;
    box-shadow: 0 0 10px rgba(0, 123, 255, 0.5);
  }

  .choice {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
  }

  .tit {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .desc {
    margin-top: 8px;
    font-size: 0.9em;
  }

  .img {
    width: 22px;
    margin-right: 5px;
  }

  .error {
    color: red;
    font-size: 12px;
    margin-top: -12px;
    margin-bottom: 12px;
  }
`;

interface ExchangeItem {
  exchange: string;
  name: string;
  url: string;
}

interface FormData {
  exchange: string;
  key: string;
  secret: string;
  desc: string;
}

interface InvalidFields {
  exchange?: string;
  key?: string;
  secret?: string;
  desc?: string;
}

function Newmarket() {
  const router = useRouter();

  const [exchangeList, setExchangeList] = useState<ExchangeItem[]>([
    { exchange: 'binance', name: 'Binance', url: 'https://www.binance.com' },
    { exchange: 'huobi', name: 'HuoBi', url: 'https://www.huobi.com' },
    { exchange: 'okex', name: 'OKEx', url: 'https://www.okex.com' },
  ]);

  const [formData, setFormData] = useState<FormData>({
    exchange: '',
    key: '',
    secret: '',
    desc: '',
  });
  const [invalidFields, setInvalidFields] = useState<InvalidFields>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Use get method to search all the marketlist
  async function queryMarketList() {
    try {
      const response = await axios.post('/', {});
      if (response.data && Array.isArray(response.data.list)) {
        setExchangeList(
          response.data.list.map((item: any) => ({
            exchange: item.exchange,
            name: item.name,
            url: item.url,
          }))
        );
      }
    } catch (error) {
      console.error('Failed to fetch market list', error);
    }
  }

  function handleSelectExchange(exchange: string) {
    setFormData((prevFormData) => ({ ...prevFormData, exchange }));
  }

  // Process changes to the input box and update the corresponding data state.
  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  }

  async function handleAddMarket() {
    if (isProcessing) return;

    try {
      const newInvalidFields = await getInvalidFields(formData, rules());
      if (newInvalidFields) {
        setInvalidFields(newInvalidFields);
        return;
      }

      setIsProcessing(true);
      const response = await axios.post('/', formData);
      setIsProcessing(false);
      // alert('Market added successfully');
      if (response.data && response.data.id) {
        router.push({
          pathname: '/',
          query: { marketId: response.data.id },
        });
      } else {
        router.push({ pathname: '/' });
      }
    } catch (error) {
      console.error('Failed to add market', error);
      // alert('An error occurred while adding the market');
      setIsProcessing(false);
    }
  }

  useEffect(() => {
    setIsClient(true);
    queryMarketList();
  }, []);

  const goBack = () => {
    router.back();
  };

  if (!isClient) {
    // Show empty content when server rendering to avoid hydration errors
    return null;
  }

  return (
    <div
      css={styles}
      className="container mx-auto"
      style={{ marginTop: '70px', maxWidth: '1200px' }}
    >
      <section className="section">
        <div className="box">
          <div className="header">
            <p className="is-size-6 is-pulled-left" style={{ marginRight: '10px' }}>
              New Exchange API Key
            </p>
            <button type="button" onClick={goBack} className="is-pulled-right">
              Go Back
            </button>
          </div>
          <div className="field">
            {/* eslint-disable-next-line */}
            <label className="label" htmlFor="exchange-select">
              Select Exchange
            </label>
            <div className="control">
              <ul className="choice">
                {exchangeList.map((item) => (
                  <li
                    key={item.exchange}
                    className={`exchangeItem ${formData.exchange === item.exchange ? 'active' : ''}`}
                  >
                    <button
                      type="button"
                      className="tit"
                      onClick={() => handleSelectExchange(item.exchange)}
                    >
                      <img className="img" src={`/images/${item.exchange}.png`} alt={item.name} />
                      {item.name}
                    </button>
                    <p className="desc">{item.url}</p>
                  </li>
                ))}
              </ul>
            </div>
            {invalidFields.exchange && <p className="error">{invalidFields.exchange}</p>}
          </div>

          <div className="field">
            {/* eslint-disable-next-line */}
            <label className="label">Access Key</label>
            <div className="control">
              <input
                className="input"
                type="text"
                name="key"
                value={formData.key}
                onChange={handleInputChange}
                placeholder="ACCESS KEY"
              />
            </div>
            {invalidFields.key && <p className="error">{invalidFields.key}</p>}
          </div>

          <div className="field">
            {/* eslint-disable-next-line */}
            <label className="label">Secret Key</label>
            <div className="control">
              <input
                className="input"
                type="text"
                name="secret"
                value={formData.secret}
                onChange={handleInputChange}
                placeholder="SECRET KEY"
              />
            </div>
            {invalidFields.secret && <p className="error">{invalidFields.secret}</p>}
          </div>

          <div className="field">
            {/* eslint-disable-next-line */}
            <label className="label">Remark</label>
            <div className="control">
              <input
                className="input"
                type="text"
                name="desc"
                value={formData.desc}
                onChange={handleInputChange}
                placeholder="REMARK"
              />
            </div>
            {invalidFields.desc && <p className="error">{invalidFields.desc}</p>}
          </div>

          <div className="field is-grouped">
            <div className="control">
              <button
                type="button"
                className={`button is-link button-pad ${isProcessing ? 'is-loading' : ''}`}
                onClick={handleAddMarket}
                disabled={isProcessing}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Newmarket;