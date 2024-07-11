"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import RootLayout from "../layout";
import Link from 'next/link'


interface Market {
  exchange: string;
  accessKey: string;
  secretKey: string;
  action: string;
}

const MarketPage = () => {
  const [data, setData] = useState([
    {
      exchange: 'Binance',
      accessKey: 'abc123',
      secretKey: 'def456',
      action: 'Edit'
    },
    {
      exchange: 'Coinbase',
      accessKey: 'xyz789',
      secretKey: 'uvw012',
      action: 'Edit'
    }
  ]);

  const newMarket = () => {
    // Handle the navigation to add market page，tbd

  };

  const removeMarket = (record: Market) => {
    // Handle the delete of API, tbd
  };

  return (
    <RootLayout>
        <div className="container mx-auto" style={{ marginTop: '70px', maxWidth: '1200px' }}>
            <section className="section">
                <div className="box">
                  <div className="flex justify-between items-center mb-4">
                  <a className="text-blue-600 border-b-2 border-blue-600 pb-1">Exchange Key API Auth</a>
                  <div className="column has-text-right">
                    <Link href="/newmarket" legacyBehavior>
                      <a className="text-blue-600 hover:text-black">Add API Key</a>
                    </Link>
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
                        {data.map((record, index) => (
                          <tr key={index}>
                            <td>{record.exchange}</td>
                            <td>{record.accessKey}</td>
                            <td>{record.secretKey}</td>
                            <td>
                              <button className="button is-link is-small" onClick={() => removeMarket(record)}>Delete</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
            </section>
        </div>
    </RootLayout>
  );
};

export default MarketPage;
