'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Image from 'next/image';
import { format } from 'date-fns';
import no_record from '../../assets/images/no_record.png';
import style from '../styles/strategies.module.css';
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
      className="container"
      style={{ marginTop: '40px', marginBottom: '60px', maxWidth: '1344px' }}
    >
      <section className="section">
        <div className="box">
          <a href="/strategy/new" className="tabs-more" style={{ paddingRight: '30px' }}>
            {' '}
            Create New Plan{' '}
          </a>
          <div className="tabs" style={{ marginBottom: '1.5rem' }}>
            <ul>
              {' '}
              <li className="is-active">
                <a> Investment Plans </a>
              </li>
            </ul>
          </div>

          <div className={style.table_wrapper}>
            {tableData && tableData.length > 0 ? (
              <table
                className="table is-fullwidth is-striped"
                style={{ minWidth: '1050px', fontSize: '0.85rem' }}
              >
                <thead className={style.thead}>
                  <tr className={style.tr}>
                    <th className={style.th} style={{ width: '150px' }}>
                      Create Time
                    </th>
                    <th className={style.th}>Exchange</th>
                    <th className={style.th}>Symbol</th>
                    <th className={style.th}>Quote Total</th>
                    <th className={style.th}>Price</th>
                    <th className={style.th}>Average Price</th>
                    <th className={style.th}>Profit</th>
                    <th className={style.th}>Profit Rate</th>
                    <th className={style.th}>Status</th>
                    <th className={style.th}>Operations</th>
                  </tr>
                </thead>

                <tbody>
                  {currentData.map((row, index) => (
                    <tr key={index}>
                      <td className={style.td}>
                        {format(new Date(row.createdAt), 'yyyy/MM/dd HH:mm')}
                      </td>
                      <td className={style.td}>{row.exchange}</td>
                      <td className={style.td}>{row.symbol}</td>
                      <td className={style.td}>{row.quote_total}</td>
                      <td className={style.td}>{row.price_native}</td>
                      <td className={style.td}>{(row.base_total / row.quote_total).toString()}</td>
                      <td
                        className={`${style.td} ${row.profit >= 0 ? 'has-text-success' : 'has-text-danger'}`}
                      >
                        {row.profit}
                      </td>
                      <td
                        className={`${style.td} row.profit_percentage >= 0 ? 'has-text-success' : 'has-text-danger'}`}
                      >
                        {row.profit_percentage}%
                      </td>
                      <td
                        className={`${style.td} row.status === '1' ? 'has-text-success' : 'has-text-danger'}`}
                      >
                        {getStatusText(row.status)}
                      </td>

                      <td className={style.td}>
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
              <Image className={style.no_record} src={no_record} alt="No records found" />
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

export default StrayegyList;
