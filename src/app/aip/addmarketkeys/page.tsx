/** @jsxImportSource @emotion/react */

'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
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
    padding: 0;
    background-color: rgb(246, 246, 246);
    border-radius: 8px;
    text-align: center;
    cursor: pointer;
    transition:
      transform 0.3s,
      box-shadow 0.3s;
    margin-bottom: 16px;
    overflow: hidden;
  }

  .exchangeButton {
    display: block;
    width: 100%;
    padding: 16px;
    background: none;
    border: none;
    cursor: pointer;
    text-align: center;
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

  .button-back {
    background-color: #007bff;
    color: white;
    border: none;
    padding: 4px 14px;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s;
  }

  .button-back:hover {
    background-color: #0056b3;
  }
`;

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

function Newmarket() {
  const router = useRouter();

  const [exchangeList, setExchangeList] = useState<ExchangeItem[]>([
    { exchange: 'binance', name: 'Binance', url: 'https://www.binance.com' },
    { exchange: 'huobi', name: 'HuoBi', url: 'https://www.huobi.com' },
    { exchange: 'okex', name: 'OKEx', url: 'https://www.okex.com' },
  ]);

  const [formData, setFormData] = useState<FormData>({
    exchange: '',
    access_key: '',
    secret_key: '',
    desc: '',
  });
  const [invalidFields, setInvalidFields] = useState<InvalidFields>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Defining form validation rules
  const rules = () => {
    return {
      exchange: [
        {
          required: true,
          message: "Exchange can't be empty",
        },
      ],
      key: [
        {
          required: true,
          message: "Access Key can't be empty",
        },
        {
          max: 65,
          message: 'Input is too long',
        }
      ],
      secret: [
        {
          required: true,
          message: "Secret Key can't be empty",
        },
        {
          max: 65,
          message: 'Input is too long',
        }
      ],
      desc: [
        {
          required: true,
          message: "Remark can't be empty",
        }
      ]
    };
  };

  // Use get method to search all the marketlist
  async function queryMarketList() {
    try {
      const response = await axios.get('http://127.0.0.1:3000/api/v1/markets', {});
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
      console.log('Invalid fields:', newInvalidFields);
      if (newInvalidFields) {
        setInvalidFields(newInvalidFields);
        return;
      }

      setIsProcessing(true);
      console.log('Sending request with formData:', formData);
      const response = await axios.post('http://127.0.0.1:3000/api/v1/keys', {
        access_key: formData.access_key,
        exchange: formData.exchange,
        secret_key: formData.secret_key,
        desc: formData.desc,
      });
      setIsProcessing(false);

      console.log('Response from API:', response.data);
      alert('Market added successfully');
      // if (response.data && response.data.id) {
      if (response.data && response.data.data.exchangeKey && response.data.data.exchangeKey._id) {
        console.log('Market added, redirecting to /addstrategy');
        router.back();
        // router.push({
        //   pathname: '/aip/addstrategy',//改成返回上一页，不要用绝对路径
        //   query: { marketId: response.data.data.exchangeKey._id },
        //   // query: { marketId: response.data.id },
        // });
      } else {
        console.log('No market ID, redirecting to /markets');
        router.push({ pathname: '/aip/markets' });
      }
    } catch (error) {
      console.error('Failed to add market', error);
      alert('An error occurred while adding the market');
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
            <button type="button" onClick={goBack} className="is-pulled-right button-back">
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
                      className="exchangeButton"
                      onClick={() => handleSelectExchange(item.exchange)}
                    >
                      <div className="tit">
                        <img className="img" src={`/images/${item.exchange}.png`} alt={item.name} />
                        {item.name}
                      </div>
                      <p className="desc">{item.url}</p>
                    </button>
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
                name="access_key"
                value={formData.access_key}
                onChange={handleInputChange}
                placeholder="ACCESS KEY"
              />
            </div>
            {invalidFields.access_key && <p className="error">{invalidFields.access_key}</p>}
          </div>

          <div className="field">
            {/* eslint-disable-next-line */}
            <label className="label">Secret Key</label>
            <div className="control">
              <input
                className="input"
                type="text"
                name="secret_key"
                value={formData.secret_key}
                onChange={handleInputChange}
                placeholder="SECRET KEY"
              />
            </div>
            {invalidFields.secret_key && <p className="error">{invalidFields.secret_key}</p>}
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