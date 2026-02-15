/** @jsxImportSource @emotion/react */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import no_record from '@/assets/images/no_record.png';
import { css } from '@emotion/react';
import Pagination from '@/components/Pagination';
import Skeleton from '@/components/Skeleton';
import ConfirmModal from '@/components/ConfirmModal';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import HTTP from '@/lib/http';
import util from '@/utils/util';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

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

  .action-buttons {
    display: flex;
    gap: 8px;
  }

  .no-record {
    width: 61px;
    margin: 60px auto;
    display: block;
  }

  .loading-container {
    text-align: center;
    padding: 60px 0;
    color: #999;
  }
`;

interface Strategy {
  _id: string;
  created_at: string;
  exchange: string;
  symbol: string;
  base_total: number;
  quote_total: number;
  price_native: number | string;
  profit: number | string;
  profit_percentage: number | string;
  status: number;
}

interface StrategyListResponse {
  data: {
    list: Strategy[];
    pageNumber: number;
    pageSize: number;
    total: number;
  };
}

const PAGE_SIZE = 20;

export default function StrategyList() {
  const { t } = useTranslation('');
  const router = useRouter();
  const [tableData, setTableData] = useState<Strategy[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });
  const [modal, setModal] = useState<{
    open: boolean;
    title: string;
    message: string;
    variant: 'danger' | 'warning' | 'info';
    onConfirm: () => void;
    loading: boolean;
  }>({ open: false, title: '', message: '', variant: 'info', onConfirm: () => {}, loading: false });

  const fetchStrategies = useCallback(
    async (page: number) => {
      setLoading(true);
      try {
        const res: StrategyListResponse = await HTTP.get('/v1/strategies', {
          params: { pageNumber: page, pageSize: PAGE_SIZE },
        });
        setTableData(res.data.list);
        setTotal(res.data.total);
      } catch (error: any) {
        console.error(error);
        setSnackbar({
          open: true,
          message: error?.message || t('prompt.operation_failed'),
          severity: 'error',
        });
      } finally {
        setLoading(false);
      }
    },
    [t],
  );

  useEffect(() => {
    fetchStrategies(currentPage);
  }, [currentPage, fetchStrategies]);

  function getStatusText(status: number): string {
    switch (status) {
      case 1:
        return `● ${t('title.status_normal')}`;
      case 2:
        return `■ ${t('title.status_stopped')}`;
      case 3:
        return t('title.status_deleted');
      default:
        return '';
    }
  }

  function switchStrategyStatus(strategy: Strategy) {
    const text = getStatusText(strategy.status);
    const newStatus = strategy.status === 1 ? 2 : 1;

    setModal({
      open: true,
      title: t('prompt.confirm_action'),
      message: t('prompt.confirm_switch_plan_status', { text }),
      variant: 'warning',
      loading: false,
      onConfirm: async () => {
        setModal((prev) => ({ ...prev, loading: true }));
        try {
          await HTTP.patch(`/v1/strategies/${strategy._id}`, { status: newStatus });
          setSnackbar({ open: true, message: t('prompt.operation_succeed'), severity: 'success' });
          fetchStrategies(currentPage);
        } catch (error: any) {
          console.error(error);
          setSnackbar({
            open: true,
            message: error?.message || t('prompt.operation_failed'),
            severity: 'error',
          });
        } finally {
          setModal((prev) => ({ ...prev, open: false, loading: false }));
        }
      },
    });
  }

  function deleteStrategy(strategy: Strategy) {
    setModal({
      open: true,
      title: t('prompt.confirm_action'),
      message: t('prompt.confirm_delete_strategy'),
      variant: 'danger',
      loading: false,
      onConfirm: async () => {
        setModal((prev) => ({ ...prev, loading: true }));
        try {
          await HTTP.delete(`/v1/strategies/${strategy._id}`);
          setSnackbar({ open: true, message: t('prompt.operation_succeed'), severity: 'success' });
          fetchStrategies(currentPage);
        } catch (error: any) {
          console.error(error);
          setSnackbar({
            open: true,
            message: error?.message || t('prompt.operation_failed'),
            severity: 'error',
          });
        } finally {
          setModal((prev) => ({ ...prev, open: false, loading: false }));
        }
      },
    });
  }

  function editStrategy(strategyId: string) {
    router.push(`/aip/addstrategy?strategyId=${strategyId}`);
  }

  function viewStrategy(strategyId: string) {
    router.push(`/aip/${strategyId}`);
  }

  function handlePageChange(newPage: number) {
    setCurrentPage(newPage);
  }

  function formatProfit(value: number | string): string {
    if (value === '-' || value === undefined || value === null) return '-';
    const num = Number(value);
    const formatted = util.formatNumber(num);
    if (num > 0) return `▲ ${formatted}`;
    if (num < 0) return `▼ ${formatted}`;
    return formatted;
  }

  function formatProfitPercentage(value: number | string): string {
    if (value === '-' || value === undefined || value === null) return '-';
    const num = Number(value);
    const formatted = util.formatNumber(num, 2, '%');
    if (num > 0) return `▲ ${formatted}`;
    if (num < 0) return `▼ ${formatted}`;
    return formatted;
  }

  function profitColorClass(value: number | string): string {
    if (value === '-' || value === undefined || value === null) return '';
    return Number(value) >= 0 ? 'has-text-success' : 'has-text-danger';
  }

  return (
    <div css={strategyListStyle} className="container">
      <section className="section">
        <div className="box">
          <Link href="/aip/addstrategy" className="tabs-more">
            {t('action.new_plan')}
          </Link>
          <div className="tabs">
            <ul>
              <li className="is-active">
                <a>{t('caption.investment_plans')}</a>
              </li>
            </ul>
          </div>

          <div className="table-wrapper">
            {loading ? (
              <div style={{ padding: '20px 0' }}>
                <Skeleton variant="text" count={5} height="2.5rem" />
              </div>
            ) : tableData && tableData.length > 0 ? (
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
                    <th style={{ width: '220px' }}>{t('title.operations')}</th>
                  </tr>
                </thead>

                <tbody>
                  {tableData.map((row) => (
                    <tr key={row._id}>
                      <td>{util.formatDate(row.created_at, 'yyyy/MM/dd HH:mm')}</td>
                      <td>{row.exchange}</td>
                      <td>{row.symbol}</td>
                      <td>{util.formatNumber(row.quote_total)}</td>
                      <td>{formatProfit(row.price_native)}</td>
                      <td>
                        {row.quote_total > 0
                          ? util.formatNumber(row.base_total / row.quote_total)
                          : '-'}
                      </td>
                      <td className={profitColorClass(row.profit)}>
                        {formatProfit(row.profit)}
                      </td>
                      <td className={profitColorClass(row.profit_percentage)}>
                        {formatProfitPercentage(row.profit_percentage)}
                      </td>
                      <td
                        className={row.status === 1 ? 'has-text-success' : 'has-text-danger'}
                      >
                        {getStatusText(row.status)}
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            type="button"
                            className="button is-small is-info is-outlined"
                            onClick={() => editStrategy(row._id)}
                          >
                            {t('action.edit')}
                          </button>
                          <button
                            type="button"
                            className={`button is-small ${row.status === 1 ? 'is-warning' : 'is-success'} is-outlined`}
                            onClick={() => switchStrategyStatus(row)}
                          >
                            {row.status === 1 ? t('action.disable') : t('action.enable')}
                          </button>
                          <button
                            type="button"
                            className="button is-small is-primary is-outlined"
                            onClick={() => viewStrategy(row._id)}
                          >
                            {t('action.view')}
                          </button>
                          <button
                            type="button"
                            className="button is-small is-danger is-outlined"
                            onClick={() => deleteStrategy(row)}
                          >
                            {t('action.delete')}
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
          {!loading && total > 0 && (
            <Pagination
              current={currentPage}
              total={total}
              pageSize={PAGE_SIZE}
              showTotal={false}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      </section>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      <ConfirmModal
        isOpen={modal.open}
        title={modal.title}
        message={modal.message}
        variant={modal.variant}
        loading={modal.loading}
        onConfirm={modal.onConfirm}
        onCancel={() => setModal((prev) => ({ ...prev, open: false }))}
      />
    </div>
  );
}
