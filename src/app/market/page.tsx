"use client";

import React, { useState, useEffect } from "react";
import { Layout, Menu, MenuProps, Button, Table, Modal, message } from "antd";
import axios from "axios";
import { ColumnsType } from "antd/lib/table";
import RootLayout from "../layout";

const { Header, Footer, Content } = Layout;

interface Market {
  exchange: string;
  accessKey: string;
  secretKey: string;
  action: string;
}

const MarketPage: React.FC = () => {
  const [data, setData] = useState<Market[]>([]);

  const newMarket = () => {
    // Handle the navigation to add market page，tbd

  };

  const removeMarket = (record: Market) => {
    // Handle the delete of API, tbd
  };

  const columns: ColumnsType<Market> = [
    {
      title: 'Exchange',
      dataIndex: 'exchange',
      key: 'exchange',
    },
    {
      title: 'Access Key',
      dataIndex: 'accessKey',
      key: 'accessKey',
    },
    {
      title: 'Secret Key',
      dataIndex: 'secretKey',
      key: 'secretKey',
    },
    {
      title: 'Actions',
      key: 'action',
      render: (_, record) => (
        <Button type="link" onClick={() => removeMarket(record)}>Delete</Button>
      ),
    },
  ];

  return (
    <RootLayout>
        <div className="container mx-auto" style={{ marginTop: '70px', maxWidth: '1200px' }}>
            <section className="section">
                <div className="box">
                  <div className="flex justify-between items-center mb-4">
                  <a>Exchange Key API Auth</a>
                    <div className="tabs">
                      <ul>
                        <li className="is-active"></li>
                        <li className="is-active"><a className="tabs-more" onClick={newMarket}>Add API Key</a></li>
                      </ul>
                    </div>
                  </div>
                <Table
                    columns={columns}
                    dataSource={data}
                    className="is-fullwidth is-striped"
                    style={{ minWidth: '800px', fontSize: '0.85rem' }}
                />
                </div>
            </section>
        </div>
    </RootLayout>
  );
};

export default MarketPage;
