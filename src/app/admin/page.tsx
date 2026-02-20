'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import '@/i18n';
import HTTP from '@/lib/http';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

// --- Types ---

interface DashboardStats {
  totalUsers: string;
  totalPurchases: string;
  totalRoles: string;
  totalResources: string;
}

// --- Component ---

export default function AdminDashboard() {
  const { t } = useTranslation();

  // Stats state
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: '--',
    totalPurchases: '--',
    totalRoles: '--',
    totalResources: '--',
  });
  const [loading, setLoading] = useState(true);

  // Snackbar
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  // --- Data Fetching ---

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const results = await Promise.allSettled([
        HTTP.get('/api/v1/users', { params: { pageSize: 1 } }),
        HTTP.get('/api/v1/purchases', { params: { pageSize: 1 } }),
        HTTP.get('/api/v1/roles'),
        HTTP.get('/api/v1/resources'),
      ]);

      const newStats: DashboardStats = {
        totalUsers: '--',
        totalPurchases: '--',
        totalRoles: '--',
        totalResources: '--',
      };

      if (results[0].status === 'fulfilled') {
        const res: any = results[0].value;
        newStats.totalUsers = String(res.data.total ?? '--');
      }

      if (results[1].status === 'fulfilled') {
        const res: any = results[1].value;
        newStats.totalPurchases = String(res.data.total ?? '--');
      }

      if (results[2].status === 'fulfilled') {
        const res: any = results[2].value;
        newStats.totalRoles = String(res.data.list?.length ?? '--');
      }

      if (results[3].status === 'fulfilled') {
        const res: any = results[3].value;
        newStats.totalResources = String(res.data.list?.length ?? '--');
      }

      setStats(newStats);
    } catch (error: any) {
      console.error('Failed to fetch dashboard stats:', error);
      setSnackbar({
        open: true,
        message: error?.message || t('prompt.operation_failed'),
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // --- Handlers ---

  const handleCloseSnackbar = useCallback(() => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  }, []);

  // --- Stat card config ---

  const statCards = [
    {
      key: 'users',
      label: t('admin.dashboard_total_users'),
      value: stats.totalUsers,
      icon: 'fa-users',
      color: 'primary',
    },
    {
      key: 'purchases',
      label: t('admin.dashboard_total_purchases'),
      value: stats.totalPurchases,
      icon: 'fa-shopping-cart',
      color: 'info',
    },
    {
      key: 'roles',
      label: t('admin.dashboard_total_roles'),
      value: stats.totalRoles,
      icon: 'fa-shield',
      color: 'success',
    },
    {
      key: 'resources',
      label: t('admin.dashboard_total_resources'),
      value: stats.totalResources,
      icon: 'fa-lock',
      color: 'warning',
    },
  ];

  // --- Render ---

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 className="title is-4">{t('admin.dashboard')}</h1>
          <p className="subtitle is-6">{t('admin.dashboard_subtitle')}</p>
        </div>
        <button
          type="button"
          className="button is-small is-info is-outlined"
          onClick={fetchStats}
          disabled={loading}
        >
          <span className="icon is-small">
            <i className={`fa fa-refresh ${loading ? 'fa-spin' : ''}`} />
          </span>
          <span>{t('action.refresh')}</span>
        </button>
      </div>

      <div className="admin-dashboard-cards">
        {statCards.map((stat) => (
          <div key={stat.key} className="card admin-stat-card">
            <div className="card-content">
              <div className="media">
                <div className="media-left">
                  <span className={`icon is-large has-text-${stat.color}`}>
                    <i className={`fa ${stat.icon} fa-2x`} />
                  </span>
                </div>
                <div className="media-content">
                  {loading ? (
                    <p className="stat-value">
                      <span className="icon">
                        <i className="fa fa-spinner fa-pulse" />
                      </span>
                    </p>
                  ) : (
                    <p className="stat-value">{stat.value}</p>
                  )}
                  <p className="stat-label">{stat.label}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
}
