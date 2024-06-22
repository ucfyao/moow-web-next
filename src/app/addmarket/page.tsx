"use client";

import React, { useState, useEffect, ChangeEvent } from 'react';
import { Layout, Button, message } from 'antd';
import axios from 'axios';
import RootLayout from '../layout';
import { useNavigate } from 'react-router-dom';

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

const AddApiKeyForm: React.FC = () => {
  const navigate = useNavigate(); 
  const [exchangeList, setExchangeList] = useState<Market[]>([]);
  const [formData, setFormData] = useState<FormData>({
    exchange: '',
    key: '',
    secret: '',
    desc: '',
  });
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    queryMarketList();
  }, []);

  const queryMarketList = async () => {
    // Need to be completed.
  };

  const handleSelectExchange = ( ) => {
    // Need to be completed.
  };

  const handleInputChange = ( ) => {
    // Need to be completed.
  };

  const handleAddMarket = async () => {
    // Need to be completed.
  };

  const goBack = () => {
    navigate(-1); 
  };

  return (
    <RootLayout>
      <div className="container mx-auto" style={{ marginTop: '70px', maxWidth: '1200px' }}>
        <section className="section">
          <div className="box">
            <div className="header">
              <p className="is-size-6 is-pulled-left" style={{ marginRight: '10px' }}>New Exchange API Key</p>
              <a onClick={goBack} className="is-pulled-right">Go Back</a>
            </div>
            <div className="field">
              <label className="label">Select Exchange</label>
              <div className="control">
                <ul className="choice is-clearfix">
                  {exchangeList.map((item) => (
                    <li
                      key={item.exchange}
                      className={`exchange-item ${formData.exchange === item.exchange ? 'active' : ''}`}
                      // onClick={() => handleSelectExchange(item.exchange)}
                    >
                      <p className="tit"><img style={{ width: '22px', marginRight: '5px' }} src={`/images/${item.exchange}.png`} alt={item.name} />{item.name}</p>
                      <p className="desc">{item.url}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="field">
              <label className="label">Access Key</label>
              <div className="control">
                <input className="input" type="text" name="key" value={formData.key} onChange={handleInputChange} placeholder="ACCESS KEY" />
              </div>
            </div>

            <div className="field">
              <label className="label">Secret Key</label>
              <div className="control">
                <input className="input" type="text" name="secret" value={formData.secret} onChange={handleInputChange} placeholder="SECRET KEY" />
              </div>
            </div>

            <div className="field">
              <label className="label">Remark</label>
              <div className="control">
                <input className="input" type="text" name="desc" value={formData.desc} onChange={handleInputChange} placeholder="REMARK" />
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

export default AddApiKeyForm;





