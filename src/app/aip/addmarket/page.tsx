/* eslint-disable jsx-a11y/label-has-associated-control */
/** @jsxImportSource @emotion/react */

'use client';

import React, { useState, useEffect, ChangeEvent } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
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
    background-color: hsl(0, 0%, 96.47058823529412%);
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
`;

interface ExchangeItem {
  exchange: string;
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

  const [exchangeList, setExchangeList] = useState([
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
  const [isProcessing, setIsProcessing] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Use get method to search all the marketlist
  const queryMarketList = async () => {
    try {
      const response = await axios.get('/'); // "/api/keys"
      // Check the response data and update the status
      if (response.data && Array.isArray(response.data.list)) {
        setExchangeList(response.data.list);
      }
    } catch (error) {
      console.error('Failed to fetch market list', error);
    }
  };

  const handleSelectExchange = (exchange: string) => {
    setFormData({ ...formData, exchange });
  };

  const handleInputChange = () => {
    // Need to be completed.
  };

  const handleAddMarket = async () => {
    // Need to be completed.
  };

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
    <div className="container mx-auto" style={{ marginTop: '70px', maxWidth: '1200px' }}>
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
          </div>

          <div className="field">
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
          </div>

          <div className="field">
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
          </div>

          <div className="field">
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
