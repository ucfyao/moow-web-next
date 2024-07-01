/** @jsxImportSource @emotion/react */
"use client";

import React, { useState, useEffect, ChangeEvent } from 'react';
import { Layout, Button, message } from 'antd';
import axios from 'axios';
import RootLayout from '../layout';
import { useRouter } from 'next/navigation';
import { css } from '@emotion/react';
// import "../styles/newmarket.css"

// const { Header, Footer, Content } = Layout;

interface Market {
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

const NewmarketForm: React.FC = () => {
  const router = useRouter();

  const [exchangeList, setExchangeList] = useState([
    { exchange: 'binance', name: 'Binance', url: 'https://www.binance.com' },
    { exchange: 'huobi', name: 'HuoBi', url: 'https://www.huobi.com' },
    { exchange: 'okex', name: 'OKEx', url: 'https://www.okex.com' }
  ]);

  const [formData, setFormData] = useState<FormData>({
    exchange: '',
    key: '',
    secret: '',
    desc: '',
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    queryMarketList();
  }, []);

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

  const handleInputChange = ( ) => {
    // Need to be completed.
  };

  const handleAddMarket = async () => {
    // Need to be completed.
  };

  const goBack = () => {
    router.back();
  };

  if (!isClient) {
    // Show empty content when server rendering to avoid hydration errors
    return null;
  }

   const styleBox = css`
  margin: 0 auto;
  padding: 50px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
`;
  
  const styleInput = css`
    width: 100%;
    max-width: 600px;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 16px;
    margin-bottom: 16px;
`;

  const exchangeItemStyle = css`
  width: 168px;
  flex: 1 1 auto;
  max-width: 200px;
  padding: 16px;
  background-color: rgb(246, 246, 246);
  border-radius: 8px;
  text-align: center;
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
  margin-bottom: 16px;
`;
  
  const activeStyle = css`
  border-color: #007bff;
  box-shadow: 0 0 10px rgba(0, 123, 255, 0.5);
`;
  
  const choiceStyle = css`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
`;
  
  const titStyle = css`
  display: flex;
  align-items: center;
  justify-content: center;
`;
  
  const descStyle = css`
  margin-top: 8px;
  font-size: 0.9em;
`;
  const imgStyle = css`
  width: 22px;
  margin-right: 5px;
`;


  return (
    <RootLayout>
      <div className="container mx-auto" style={{ marginTop: '70px', maxWidth: '1200px' }}>
        <section className="section">
          <div css={styleBox}>
            <div className="header">
              <p className="is-size-6 is-pulled-left" style={{ marginRight: '10px' }}>New Exchange API Key</p>
              <a onClick={goBack} className="is-pulled-right">Go Back</a>
            </div>
            <div className="field">
              <label className="label">Select Exchange</label>
              <div className="control">
                <ul css={choiceStyle}>
                  {exchangeList.map((item) => (
                    <li
                      key={item.exchange}
                      css={[exchangeItemStyle, formData.exchange === item.exchange && activeStyle]}
                      onClick={() => handleSelectExchange(item.exchange)}
                    >
                      <p css={titStyle}>
                        <img css={imgStyle} src={`/images/${item.exchange}.png`} alt={item.name} />
                        {item.name}
                      </p>
                      <p css={descStyle}>{item.url}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="field">
              <label className="label">Access Key</label>
              <div className="control">
                <input css={styleInput} type="text" name="key" value={formData.key} onChange={handleInputChange} placeholder="ACCESS KEY" />
              </div>
            </div>

            <div className="field">
              <label className="label">Secret Key</label>
              <div className="control">
                <input css={styleInput} type="text" name="secret" value={formData.secret} onChange={handleInputChange} placeholder="SECRET KEY" />
              </div>
            </div>

            <div className="field">
              <label className="label">Remark</label>
              <div className="control">
                <input css={styleInput} type="text" name="desc" value={formData.desc} onChange={handleInputChange} placeholder="REMARK" />
              </div>
            </div>

            <div className="field is-grouped">
              <div className="control">
                <button
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
    </RootLayout>
  );
};

export default NewmarketForm;





