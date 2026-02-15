/** @jsxImportSource @emotion/react */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { format } from 'date-fns';
import { css } from '@emotion/react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import Skeleton from '@/components/Skeleton';
import auth from '@/utils/auth';

const assetsPageStyle = css`
  &.container {
    margin-top: 40px;
    margin-bottom: 60px;
    max-width: 1344px;
  }

  .section + .section {
    padding-top: 0;
  }

  .title.is-5 {
    margin-bottom: 1.25rem;
    padding-bottom: 0.75rem;
    border-bottom: 1px solid #f0f0f0;
  }

  .info-item {
    display: flex;
    align-items: center;
    padding: 8px 0;
  }

  .info-label {
    color: #7a7a7a;
    min-width: 120px;
    font-size: 0.9rem;
  }

  .info-value {
    color: #363636;
    font-size: 0.9rem;
  }

  .summary-card {
    text-align: center;
    padding: 20px 10px;
    background: #fafafa;
    border-radius: 6px;
  }

  .summary-value {
    font-size: 1.5rem;
    font-weight: 600;
    color: #363636;
    margin-bottom: 6px;
  }

  .summary-label {
    font-size: 0.85rem;
    color: #7a7a7a;
  }

  .xbt-balance {
    display: flex;
    align-items: baseline;
    gap: 8px;
    padding: 16px 0;
  }

  .xbt-amount {
    font-size: 2rem;
    font-weight: 600;
    color: #363636;
  }

  .xbt-unit {
    font-size: 1rem;
    color: #7a7a7a;
  }
`;

interface UserProfile {
  _id: string;
  email: string;
  nick_name: string;
  vip_time_out_at: string;
  XBT: string;
  is_activated: boolean;
  invitation_code: string;
}

interface Strategy {
  _id: string;
  base_total: number;
  profit: number;
  status: number;
}

interface StrategySummary {
  totalCount: number;
  activeCount: number;
  totalInvestment: number;
  totalProfit: number;
}

export default function AssetsPage() {
  const { t } = useTranslation('');
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [summary, setSummary] = useState<StrategySummary>({
    totalCount: 0,
    activeCount: 0,
    totalInvestment: 0,
    totalProfit: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      router.push('/login');
      return;
    }

    const localUser = auth.getUser();
    if (!localUser?._id) {
      router.push('/login');
      return;
    }

    async function fetchData() {
      try {
        const token = auth.getToken();
        const headers: Record<string, string> = {};
        if (token) headers.token = token;
        if (localUser._id) headers.user_id = localUser._id;

        const [userRes, strategiesRes] = await Promise.all([
          axios.get(`/api/v1/users/${localUser._id}`, { headers }),
          axios.get('/api/v1/strategies', { headers }),
        ]);

        if (userRes.data?.data) {
          setUser(userRes.data.data);
        }

        const strategies: Strategy[] = strategiesRes.data?.data?.list || [];
        const activeStrategies = strategies.filter((s) => s.status === 1);
        const totalInvestment = strategies.reduce((sum, s) => sum + (s.base_total || 0), 0);
        const totalProfit = strategies.reduce((sum, s) => sum + (s.profit || 0), 0);

        setSummary({
          totalCount: strategies.length,
          activeCount: activeStrategies.length,
          totalInvestment,
          totalProfit,
        });
      } catch (error) {
        console.error('Failed to fetch assets data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [router]);

  const isVipActive = user?.vip_time_out_at
    ? new Date(user.vip_time_out_at) > new Date()
    : false;

  if (loading) {
    return (
      <div css={assetsPageStyle} className="container">
        <section className="section">
          <div className="box">
            <Skeleton variant="text" count={3} height="1.5rem" width="60%" />
          </div>
        </section>
        <section className="section">
          <div className="box">
            <div className="columns is-multiline">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="column is-one-quarter">
                  <div className="summary-card">
                    <Skeleton variant="text" height="1.5rem" width="60%" />
                    <Skeleton variant="text" height="0.85rem" width="80%" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div css={assetsPageStyle} className="container">
      {/* Account Info */}
      <section className="section">
        <div className="box">
          <h2 className="title is-5">{t('assets.account_info')}</h2>
          <div className="columns is-multiline">
            <div className="column is-half">
              <div className="info-item">
                <span className="info-label">{t('assets.email')}</span>
                <span className="info-value">{user?.email || '-'}</span>
              </div>
            </div>
            <div className="column is-half">
              <div className="info-item">
                <span className="info-label">{t('assets.nickname')}</span>
                <span className="info-value">{user?.nick_name || '-'}</span>
              </div>
            </div>
            <div className="column is-half">
              <div className="info-item">
                <span className="info-label">{t('assets.vip_status')}</span>
                <span className={`tag ${isVipActive ? 'is-success' : 'is-danger'}`}>
                  {isVipActive ? t('assets.vip_active') : t('assets.vip_expired')}
                </span>
              </div>
            </div>
            <div className="column is-half">
              <div className="info-item">
                <span className="info-label">{t('assets.vip_expiry')}</span>
                <span className="info-value">
                  {user?.vip_time_out_at
                    ? format(new Date(user.vip_time_out_at), 'yyyy/MM/dd HH:mm')
                    : '-'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Strategy Summary */}
      <section className="section">
        <div className="box">
          <h2 className="title is-5">{t('assets.strategy_summary')}</h2>
          <div className="columns is-multiline">
            <div className="column is-one-quarter">
              <div className="summary-card">
                <p className="summary-value">{summary.totalCount}</p>
                <p className="summary-label">{t('assets.total_strategies')}</p>
              </div>
            </div>
            <div className="column is-one-quarter">
              <div className="summary-card">
                <p className="summary-value has-text-info">{summary.activeCount}</p>
                <p className="summary-label">{t('assets.active_strategies')}</p>
              </div>
            </div>
            <div className="column is-one-quarter">
              <div className="summary-card">
                <p className="summary-value">{summary.totalInvestment.toFixed(2)} USDT</p>
                <p className="summary-label">{t('assets.total_investment')}</p>
              </div>
            </div>
            <div className="column is-one-quarter">
              <div className="summary-card">
                <p
                  className={`summary-value ${summary.totalProfit >= 0 ? 'has-text-success' : 'has-text-danger'}`}
                >
                  {summary.totalProfit > 0 ? '▲ +' : summary.totalProfit < 0 ? '▼ ' : ''}
                  {summary.totalProfit.toFixed(2)} USDT
                </p>
                <p className="summary-label">{t('assets.total_profit')}</p>
              </div>
            </div>
          </div>
          {summary.totalCount === 0 && (
            <div className="has-text-centered" style={{ padding: '20px 0' }}>
              <p className="has-text-grey">{t('assets.no_strategies')}</p>
              <Link
                href="/aip/addstrategy"
                className="button is-info is-small"
                style={{ marginTop: '10px' }}
              >
                {t('assets.create_strategy')}
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* XBT Balance */}
      <section className="section">
        <div className="box">
          <h2 className="title is-5">{t('assets.xbt_balance')}</h2>
          <div className="xbt-balance">
            <span className="xbt-amount">{user?.XBT || '0'}</span>
            <span className="xbt-unit">XBT</span>
          </div>
        </div>
      </section>
    </div>
  );
}
