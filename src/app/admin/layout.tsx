'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import '@/i18n';
import auth from '@/utils/auth';
import HTTP from '@/lib/http';
import useUserStore from '@/store/user';
import { AdminContext, type Permission } from '@/contexts/AdminContext';
import './admin.scss';

const ALLOWED_ADMIN_ROLES = ['admin', 'super_admin'];

interface MenuItem {
  label: string;
  path: string;
  icon: string;
}

export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const userInfo = useUserStore((state) => state.userInfo);
  const setUserInfo = useUserStore((state) => state.setUserInfo);

  const [permission, setPermission] = useState<Permission>({ role: null, resources: [] });
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  const menuItems: MenuItem[] = useMemo(
    () => [
      { label: t('admin.dashboard'), path: '/admin', icon: 'fa-dashboard' },
      { label: t('admin.users'), path: '/admin/users', icon: 'fa-users' },
      { label: t('admin.roles'), path: '/admin/roles', icon: 'fa-shield' },
      { label: t('admin.resources'), path: '/admin/resources', icon: 'fa-lock' },
      { label: t('admin.purchases'), path: '/admin/purchases', icon: 'fa-shopping-cart' },
      { label: t('admin.rates'), path: '/admin/rates', icon: 'fa-line-chart' },
    ],
    [t],
  );

  const hasPermission = useCallback(
    (code: string): boolean => {
      if (!permission.role) return false;
      if (ALLOWED_ADMIN_ROLES.includes(permission.role.role_name)) return true;
      return permission.resources.some((r) => r.resource_code === code);
    },
    [permission],
  );

  useEffect(() => {
    let cancelled = false;

    async function checkPermissions() {
      // Step 1: Check authentication
      if (!auth.isAuthenticated()) {
        router.replace('/login');
        return;
      }

      try {
        // Step 2: Fetch permissions from backend
        const res: any = await HTTP.get('/api/v1/auth/permissions');
        if (cancelled) return;

        const data = res.data;
        const role = data?.role ?? null;
        const resources = data?.resources ?? [];

        // Step 3: Check if user has admin role
        if (!role || !ALLOWED_ADMIN_ROLES.includes(role.role_name)) {
          router.replace('/403');
          return;
        }

        // Step 4: Store permissions and authorize
        setPermission({ role, resources });
        setAuthorized(true);
      } catch {
        // API failure or non-zero status — redirect to login
        router.replace('/login');
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    checkPermissions();

    return () => {
      cancelled = true;
    };
  }, [router]);

  const handleLogout = async () => {
    if (!window.confirm(t('prompt.confirm_logout'))) return;
    try {
      await HTTP.post('/api/v1/auth/logout');
    } catch {
      // Silent fail — proceed with client-side logout
    }
    auth.logout();
    setUserInfo(null);
    router.push('/login');
  };

  const isActive = (path: string): boolean => {
    if (path === '/admin') return pathname === '/admin';
    return pathname.startsWith(path);
  };

  // Loading state
  if (loading) {
    return (
      <div className="admin-loading">
        <span className="icon is-large">
          <i className="fa fa-spinner fa-pulse fa-2x" />
        </span>
        <p className="admin-loading-text">{t('admin.loading')}</p>
      </div>
    );
  }

  // Not authorized — will redirect, render nothing
  if (!authorized) {
    return null;
  }

  return (
    <AdminContext.Provider value={{ permission, hasPermission }}>
      <div className="admin-wrapper">
        {/* Header */}
        <header className="admin-header">
          <div className="admin-header-left">
            <span className="icon">
              <i className="fa fa-cogs" />
            </span>
            <span className="admin-header-title">{t('admin.panel_title')}</span>
          </div>
          <div className="admin-header-right">
            <span className="admin-header-email">{userInfo?.email ?? ''}</span>
            <button className="button is-small is-light is-outlined" onClick={handleLogout}>
              <span className="icon is-small">
                <i className="fa fa-sign-out" />
              </span>
              <span>{t('sign_out')}</span>
            </button>
          </div>
        </header>

        {/* Body: Sidebar + Content */}
        <div className="admin-body">
          {/* Sidebar */}
          <aside className="admin-sidebar">
            <nav className="menu">
              <p className="menu-label">{t('admin.navigation')}</p>
              <ul className="menu-list">
                {menuItems.map((item) => (
                  <li key={item.path}>
                    <Link href={item.path} className={isActive(item.path) ? 'is-active' : ''}>
                      <span className="icon is-small">
                        <i className={`fa ${item.icon}`} />
                      </span>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="back-to-site">
                <ul className="menu-list">
                  <li>
                    <Link href="/">
                      <span className="icon is-small">
                        <i className="fa fa-arrow-left" />
                      </span>
                      {t('admin.back_to_site')}
                    </Link>
                  </li>
                </ul>
              </div>
            </nav>
          </aside>

          {/* Main Content */}
          <section className="admin-content">{children}</section>
        </div>
      </div>
    </AdminContext.Provider>
  );
}
