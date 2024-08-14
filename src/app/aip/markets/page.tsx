'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Modal, Button, message } from 'antd';

interface Market {
  id: string;
  exchange: string;
  access_key: string;
  secret_key: string;
  action: string;
}

function MarketPage() {
  const [data, setData] = useState<Market[]>([]);
  // const [data, setData] = useState<Market[]>([
  //   {
  //     id: '1',
  //     exchange: 'Binance',
  //     accessKey: 'abc123',
  //     secretKey: 'def456',
  //     action: 'Edit',
  //   },
  //   {
  //     id: '2',
  //     exchange: 'Coinbase',
  //     accessKey: 'xyz789',
  //     secretKey: 'uvw012',
  //     action: 'Edit',
  //   },
  // ]);
  const router = useRouter();

  const queryUserMarketList = async (showDeleted = true) => {
    try {
      const response = await axios.get('/api/v1/keys', {
        params: {
          showDeleted: showDeleted.toString(),
        },
      });
      if (response.data) {
        setData(response.data.data.list);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    queryUserMarketList();
  }, []);

  queryUserMarketList(true);

  const newMarket = () => {
    // Handle the navigation to add market page，tbd
    router.push('/aip/addmarketkeys');
  };

  const removeMarket = (record: Market) => {
    // Handle the delete of API, tbd
    Modal.confirm({
      title: 'Confirm Operation',
      content: `Are you sure you want to delete the exchange ${record.exchange}`,
      okText: 'Confirm',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await axios.delete(`/api/v1/keys/${record._id}`);
          message.success('Operation successful');
          queryUserMarketList();
        } catch (error) {
          message.error(error.message || 'Operation failed');
        }
      }
    });
  };

  return (
    <div className="container mx-auto" style={{ marginTop: '70px', maxWidth: '1200px' }}>
      <section className="section">
        <div className="box">
          <div className="flex justify-between items-center mb-4">
            <span className="text-blue-600 border-b-2 border-blue-600 pb-1">
              Exchange Key API Auth
            </span>
            <div className="column has-text-right">
              <Button type="primary" onClick={newMarket}>
                Add API Key
              </Button>
              {/* <Link href="/aip/addmarketkeys" legacyBehavior>
                <a href="/aip/addmarketkeys" className="text-blue-600 hover:text-black">
                  Add API Key
                </a>
              </Link> */}
            </div>
          </div>
          <div className="table-container">
            <table className="table is-fullwidth is-striped">
              <thead>
                <tr>
                  <th>Exchanges</th>
                  <th>Access Key</th>
                  <th>Secret Key</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data && data.length > 0 ? (
                  data.map((record) => (
                    <tr key={record.id}>
                      <td>{record.exchange}</td>
                      <td>{record.access_key}</td>
                      <td>{record.secret_key}</td>
                      <td>
                        <button
                          className="button is-link is-small"
                          onClick={() => removeMarket(record)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4">No data available</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}

export default MarketPage;
