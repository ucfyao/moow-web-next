/** @jsxImportSource @emotion/react */
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Image from 'next/image';
import { format } from 'date-fns';
import no_record from '@/assets/images/no_record.png';
import { css } from '@emotion/react';
import Pagination from '@/components/Pagination';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GetStaticProps } from 'next';

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
  const { t } = useTranslation('common');
  const [tableData, setTableData] = useState<Strategy[]>([]);
  const router = useRouter();

  useEffect(() => {
    const queryStrategies = async () => {
      try {
        // todo: use baseURL instead of hardcode
        const response = await axios.get('/api/v1/strategies');
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
        return t('title.status_normal');
      case '2':
        return t('title.status_stopped');
      case '3':
        return t('title.status_deleted');
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
    <div css={strategyListStyle} className="container">
      <section className="section">
        <div className="box">
          <a href="/strategy/new" className="tabs-more">
            {t('action.new_plan')}
          </a>
          <div className="tabs">
            <ul>
              <li className="is-active">
                <a>{t('caption.investment_plans')}</a>
              </li>
            </ul>
          </div>

          <div className="table-wrapper">
            {tableData && tableData.length > 0 ? (
              <table className="table is-fullwidth is-striped">
                <thead>
                  <tr>
                    <th style={{ width: '150px' }}>{t('title.create_time')}</th>
                    <th>{t('title.exchange')}</th>
                    <th>{t('title.symbol')}</th>
                    <th>{t('title.quote_total')}</th>
                    <th>{t('title.price_native')}</th>
                    <th>{t('title.price_average')}</th>
                    <th>{t('title.profit')}</th>
                    <th>{t('title.profit_percentage')}</th>
                    <th style={{ width: '80px' }}>{t('title.status')}</th>
                    <th style={{ width: '180px' }}>{t('title.operations')}</th>
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
                      <td className={`${row.profit >= 0 ? 'has-text-success' : 'has-text-danger'}`}>
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
                            {t('action.edit')}
                          </a>
                          <a
                            className={`button is-small
                                            ${row.status === '1' ? 'is-danger' : 'is-info'} is-outlined`}
                            onClick={() => switchStrategyStatus(row._id)}
                          >
                            {row.status === '1' ? t('action.disable') : t('action.enable')}
                          </a>
                          <a
                            className="button is-small is-primary is-outlined"
                            onClick={() => viewStrategy(row._id)}
                          >
                            {t('action.view')}
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
    max-width: 1344px;
  }

  .tabs {
    margin-bottom: 1.5rem;
  }

  .tabs-more {
    padding-right: 30px;
  }

  .table-wrapper {
    overflow-x: auto;
  }

  .table {
    min-width: 1050px;
    font-size: 0.85rem;
  }

  thead,
  th {
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

// export const getStaticProps: GetStaticProps = async ({ locale }) => ({
//   props: {
//     ...(await serverSideTranslations(locale!, ['common'])),
//   },
// });

export default StrayegyList;
