/** @jsxImportSource @emotion/react */
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Image from 'next/image';
import { format } from 'date-fns';
import no_record from '../../assets/images/no_record.png';
import { css } from '@emotion/react';
import Pagination from '../../component/pagination';
import '../globals.scss';

interface Strategy {
  _id: string;
  createdAt: string;
  exchange: string;
  symbol: string;
  quote_total: number;
  price_native: string;
  base_total: number;
  profit: number;
  profit_percentage: number;
  status: string;
}

const StrayegyList: React.FC = () => {
  const [tableData, setTableData] = useState<Strategy[]>([]);
  const router = useRouter();

  useEffect(() => {
    const queryStrategies = async () => {
      try {
        // todo: use baseURL instead of hardcode
        const response = await axios.get('http://127.0.0.1:3001/api/v1/strategies');
        setTableData(response.data.data);
      } catch (error) {
        console.error(error);
      }
    };
    queryStrategies();
  }, []);

  const getStatusText = (status: string): string => {
    switch (status) {
      case '1':
        return 'Normal';
      case '2':
        return 'Stopped';
      case '3':
        return 'Deleted';
      default:
        return 'Unknown';
    }
  };

  const switchStrategyStatus = (strategyId: string) => {
    setTableData((prevData: Strategy[]) =>
      prevData.map((strategy: Strategy) =>
        strategy._id === strategyId
          ? { ...strategy, status: strategy.status === '1' ? '2' : '1' }
          : strategy
      )
    );
  };

  const editStrategy = (strategyId: string) => {
    console.log('edit');
  };

  const viewStrategy = (strategyId: string) => {
    router.push(`/strategies/${strategyId}`);
  };

  // Handle page changes
  const [currentPage, setCurrentPage] = useState(1);
  const total = tableData.length;
  const pageSize = 10;

  const indexOfLastItem = currentPage * pageSize;
  const indexOfFirstItem = indexOfLastItem - pageSize;
  const currentData = tableData.slice(indexOfFirstItem, indexOfLastItem);

  const handleCurrentChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  return (
    <div
      css={strategyListStyle}
      className="container"
    >
      <section className="section">
        <div className="box">
          <a href="/strategy/new" className="tabs-more">
            Create New Plan
          </a>
          <div className="tabs">
            <ul>
              <li className="is-active">
                <a> Investment Plans </a>
              </li>
            </ul>
          </div>

          <div className="table-wrapper">
            {tableData && tableData.length > 0 ? (
              <table className="table is-fullwidth is-striped">
                <thead>
                  <tr>
                    <th style={{ width: '150px' }}>
                      Create Time
                    </th>
                    <th>Exchange</th>
                    <th>Symbol</th>
                    <th>Quote Total</th>
                    <th>Price</th>
                    <th>Average Price</th>
                    <th>Profit</th>
                    <th>Profit Rate</th>
                    <th style={{ width: '80px' }}>Status</th>
                    <th style={{ width: '180px' }}>Operations</th>
                  </tr>
                </thead>

                <tbody>
                  {currentData.map((row, index) => (
                    <tr key={index}>
                      <td>{format(new Date(row.createdAt), 'yyyy/MM/dd HH:mm')}</td>
                      <td>{row.exchange}</td>
                      <td>{row.symbol}</td>
                      <td>{row.quote_total}</td>
                      <td>{row.price_native}</td>
                      <td>{(row.base_total / row.quote_total).toString()}</td>
                      <td
                        className={`${row.profit >= 0 ? 'has-text-success' : 'has-text-danger'}`}
                      >
                        {row.profit}
                      </td>
                      <td
                        className={`${row.profit_percentage >= 0 ? 'has-text-success' : 'has-text-danger'}`}
                      >
                        {row.profit_percentage}%
                      </td>
                      <td
                        className={`${row.status === '1' ? 'has-text-success' : 'has-text-danger'}`}
                      >
                        {getStatusText(row.status)}
                      </td>

                      <td>
                        <div className="flex">
                          <a
                            className="button is-small is-info is-outlined"
                            onClick={() => editStrategy(row._id)}
                          >
                            Edit
                          </a>
                          <a
                            className={`button is-small 
                                            ${row.status === '1' ? 'is-danger' : 'is-info'} is-outlined`}
                            onClick={() => switchStrategyStatus(row._id)}
                          >
                            {row.status === '1' ? 'Disable' : 'Enable'}
                          </a>
                          <a
                            className="button is-small is-primary is-outlined"
                            onClick={() => viewStrategy(row._id)}
                          >
                            View
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <Image className="no-record" src={no_record} alt="No records found" />
            )}
          </div>
          <Pagination
            current={currentPage}
            total={total}
            pageSize={pageSize}
            showTotal={false}
            onPageChange={handleCurrentChange}
          />
        </div>
      </section>
    </div>
  );
};
const strategyListStyle = css`
  .container {
    margin-top: 40px;
    margin-bottom: 60px;
    max-width: 1344px
  }

  .tabs{
    margin-bottom: 1.5rem
  }

  .tabs-more {
    padding-right: 30px
  }

  .table-wrapper {
    overflow-x: auto;
  }

  .table {
    min-width: 1050px;
    font-size: 0.85rem;
  }

  thead, th {
    background-color: #fafafa;
    color: #4f6475;
    font-weight: 400;
  }

  tr {
    color: #4a4a4a;
  }

  td {
    vertical-align: middle;
  }

  div.button + .button {
    margin-left: 10px;
  }

  .no-record {
    width: 61px;
    margin: 60px auto;
    display: block;
  }
`;

export default StrayegyList;