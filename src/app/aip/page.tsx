/** @jsxImportSource @emotion/react */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Image from 'next/image';
import { format } from 'date-fns';
import no_record from '@/assets/images/no_record.png';
import { css } from '@emotion/react';
import Pagination from '@/components/Pagination';
import { useTranslation } from 'next-i18next';
// import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
// import { GetStaticProps } from 'next';

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

interface Strategy {
  _id: string;
  created_at: string;
  exchange: string;
  symbol: string;
  quote_total: number;
  price_native: string;
  base_total: number;
  profit: number;
  profit_percentage: number;
  status: number;
}

function StrayegyList() {
  const { t } = useTranslation('');
  const [tableData, setTableData] = useState<Strategy[]>([]);
  const router = useRouter();

  useEffect(() => {
    async function queryStrategies() {
      try {
        // TODO use baseURL instead of hardcode
        const response = await axios.get('/api/v1/strategies');
        setTableData(response.data.data.list);
      } catch (error) {
        console.error(error);
      }
    }
    queryStrategies();
  }, []);

  function getStatusText(status: number): string {
    switch (status) {
      case 1:
        return t('title.status_normal');
      case 2:
        return t('title.status_stopped');
      case 3:
        return t('title.status_deleted');
      default:
        return 'Unknown';
    }
  }

  function switchStrategyStatus(strategyId: string) {
    // eslint-disable-next-line
    const currentStrategy = tableData.find((item) => item._id === strategyId);
    if (!currentStrategy) return;

    const currentStatus = currentStrategy.status;
    const text = getStatusText(currentStatus);
    const newStatus = currentStatus === 1 ? 2 : 1;

    if (window.confirm(t('prompt.confirm_switch_plan_status', { text }))) {
      axios
        .patch(`/api/v1/strategies/${strategyId}`, { status: newStatus })
        .then((response) => {
          setTableData((prevData) =>
            prevData.map((item) =>
              // eslint-disable-next-line
              item._id === strategyId ? { ...item, status: newStatus } : item
            )
          );
          return response;
        })
        .catch((error) => {
          console.error(error);
          alert(error.message || t('prompt.operation_failed'));
        });
    }
  }

  function editStrategy(strategyId: string) {
    router.push(`/aip/addstrategy?strategyId=${strategyId}`);
  }

  function viewStrategy(strategyId: string) {
    router.push(`/aip/${strategyId}`);
  }

  // Handle page changes
  const [currentPage, setCurrentPage] = useState(1);
  const total = tableData ? tableData.length : 0;
  const pageSize = 10;

  const indexOfLastItem = currentPage * pageSize;
  const indexOfFirstItem = indexOfLastItem - pageSize;
  const currentData = tableData.slice(indexOfFirstItem, indexOfLastItem);

  const handleCurrentChange = (newPage: number): void => {
    setCurrentPage(newPage);
  };

  return (
    <div css={strategyListStyle} className="container">
      <section className="section">
        <div className="box">
          <a href="/aip/addstrategy" className="tabs-more">
            {t('action.new_plan')}
          </a>
          <div className="tabs">
            <ul>
              <li className="is-active">
                {/* eslint-disable-next-line */}
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
                  {currentData.map((row) => (
                    // eslint-disable-next-line
                    <tr key={row._id}>
                      <td>{format(new Date(row.created_at), 'yyyy/MM/dd HH:mm')}</td>
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
                        className={`${row.status === 1 ? 'has-text-success' : 'has-text-danger'}`}
                      >
                        {getStatusText(row.status)}
                      </td>

                      <td>
                        <div className="flex">
                          <button
                            type="button"
                            className="button is-small is-info is-outlined"
                            // eslint-disable-next-line
                            onClick={() => editStrategy(row._id)}
                          >
                            {t('action.edit')}
                          </button>
                          <button
                            type="button"
                            className={`button is-small
                                            ${row.status === 1 ? 'is-danger' : 'is-info'} is-outlined`}
                            // eslint-disable-next-line
                            onClick={() => switchStrategyStatus(row._id)}
                          >
                            {row.status === 1 ? t('action.disable') : t('action.enable')}
                          </button>
                          <button
                            type="button"
                            className="button is-small is-primary is-outlined"
                            // eslint-disable-next-line
                            onClick={() => viewStrategy(row._id)}
                          >
                            {t('action.view')}
                          </button>
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
}

// export const getStaticProps: GetStaticProps = async ({ locale }) => ({
//   props: {
//     ...(await serverSideTranslations(locale!, ['common'])),
//   },
// });

export default StrayegyList;
