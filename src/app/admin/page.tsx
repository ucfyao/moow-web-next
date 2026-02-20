'use client';

import { useTranslation } from 'react-i18next';
import '@/i18n';

export default function AdminDashboard() {
  const { t } = useTranslation();

  const stats = [
    { label: t('admin.total_users'), value: '--', icon: 'fa-users', color: 'is-primary' },
    { label: t('admin.active_strategies'), value: '--', icon: 'fa-line-chart', color: 'is-success' },
    { label: t('admin.total_orders'), value: '--', icon: 'fa-shopping-cart', color: 'is-info' },
    { label: t('admin.todays_new_users'), value: '--', icon: 'fa-user-plus', color: 'is-warning' },
  ];

  return (
    <div>
      <h1 className="title is-4">{t('admin.dashboard')}</h1>
      <p className="subtitle is-6">{t('admin.dashboard_subtitle')}</p>

      <div className="admin-dashboard-cards">
        {stats.map((stat) => (
          <div key={stat.label} className="card admin-stat-card">
            <div className="card-content">
              <div className="media">
                <div className="media-left">
                  <span className={`icon is-large has-text-${stat.color.replace('is-', '')}`}>
                    <i className={`fa ${stat.icon} fa-2x`} />
                  </span>
                </div>
                <div className="media-content">
                  <p className="stat-value">{stat.value}</p>
                  <p className="stat-label">{stat.label}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
