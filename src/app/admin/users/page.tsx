'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import '@/i18n';
import HTTP from '@/lib/http';
import util from '@/utils/util';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

// --- Types ---

interface User {
  _id: string;
  seq_id: number;
  nick_name: string;
  email: string;
  role: string | null;
  is_activated: boolean;
  is_deleted: boolean;
  XBT: string;
  vip_time_out_at: string | null;
  last_login_time: string | null;
  created_at: string;
}

interface UserDetail extends User {
  real_name?: string;
  mobile?: string;
  instagram?: string;
  invitation_code?: string;
  invite_reward?: string | number;
  invite_total?: string | number;
  last_login_ip?: string;
}

interface RoleOption {
  value: string;
  label: string;
}

interface Invitation {
  email: string;
  created_at: string;
}

type StatusFilter = 'all' | 'active' | 'deleted';

// --- Constants ---

const PAGE_SIZE = 20;

// --- Component ---

export default function AdminUsers() {
  const { t } = useTranslation();

  // List state
  const [users, setUsers] = useState<User[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchKeyword, setSearchKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  // Roles
  const [roles, setRoles] = useState<RoleOption[]>([]);

  // Detail modal
  const [detailUser, setDetailUser] = useState<UserDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [inviter, setInviter] = useState<string | null>(null);
  const [invitations, setInvitations] = useState<Invitation[]>([]);

  // Role editing
  const [editingRoleUserId, setEditingRoleUserId] = useState<number | null>(null);
  const [editingRoleValue, setEditingRoleValue] = useState<string>('');

  // Confirmation
  const [confirmAction, setConfirmAction] = useState<{
    open: boolean;
    message: string;
    onConfirm: () => void;
  }>({ open: false, message: '', onConfirm: () => {} });

  // Snackbar
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  // --- Data Fetching ---

  const fetchUsers = useCallback(async (page: number) => {
    setLoading(true);
    try {
      const res: any = await HTTP.get('/api/v1/users', {
        params: { pageNumber: page, pageSize: PAGE_SIZE },
      });
      setUsers(res.data.list);
      setTotal(res.data.total);
    } catch (error: any) {
      console.error('Failed to fetch users:', error);
      setSnackbar({
        open: true,
        message: error?.message || t('prompt.operation_failed'),
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, [t]);

  const fetchRoles = useCallback(async () => {
    try {
      const res: any = await HTTP.get('/api/v1/roles/droplist');
      setRoles(res.data.list);
    } catch (error: any) {
      console.error('Failed to fetch roles:', error);
    }
  }, []);

  useEffect(() => {
    fetchUsers(currentPage);
  }, [currentPage, fetchUsers]);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  // --- Client-side filtering ---

  const filteredUsers = useMemo(() => {
    let result = users;

    // Status filter
    if (statusFilter === 'active') {
      result = result.filter((u) => !u.is_deleted);
    } else if (statusFilter === 'deleted') {
      result = result.filter((u) => u.is_deleted);
    }

    // Search filter
    if (searchKeyword.trim()) {
      const keyword = searchKeyword.trim().toLowerCase();
      result = result.filter(
        (u) =>
          u.email.toLowerCase().includes(keyword) ||
          u.nick_name.toLowerCase().includes(keyword),
      );
    }

    return result;
  }, [users, statusFilter, searchKeyword]);

  // --- Pagination ---

  const totalPages = Math.ceil(total / PAGE_SIZE) || 1;

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const paginationRange = useMemo(() => {
    const pages: (number | string)[] = [];
    const maxVisible = 7;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      if (currentPage > 4) {
        pages.push('start-ellipsis');
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 3) {
        pages.push('end-ellipsis');
      }
      pages.push(totalPages);
    }

    return pages;
  }, [totalPages, currentPage]);

  // --- Role helpers ---

  const getRoleLabel = useCallback(
    (roleId: string | null): string => {
      if (!roleId) return t('admin.user_no_role');
      const role = roles.find((r) => r.value === roleId);
      return role ? role.label : t('admin.user_no_role');
    },
    [roles, t],
  );

  // --- VIP helpers ---

  const isVipActive = useCallback((vipDate: string | null): boolean => {
    if (!vipDate) return false;
    return new Date(vipDate) > new Date();
  }, []);

  // --- Actions ---

  const handleViewDetail = useCallback(
    async (user: User) => {
      setDetailModalOpen(true);
      setDetailLoading(true);
      setDetailUser(null);
      setInviter(null);
      setInvitations([]);

      try {
        const [userRes, inviterRes, invitationsRes]: any[] = await Promise.all([
          HTTP.get(`/api/v1/users/${user.seq_id}`),
          HTTP.get(`/api/v1/users/${user.seq_id}`, { params: { inviter: true } }),
          HTTP.get(`/api/v1/users/${user.seq_id}`, { params: { invitations: true } }),
        ]);

        setDetailUser(userRes.data);
        setInviter(inviterRes.data?.inviter || null);
        setInvitations(invitationsRes.data?.invitations || []);
      } catch (error: any) {
        console.error('Failed to fetch user detail:', error);
        setSnackbar({
          open: true,
          message: error?.message || t('prompt.operation_failed'),
          severity: 'error',
        });
      } finally {
        setDetailLoading(false);
      }
    },
    [t],
  );

  const handleCloseDetail = useCallback(() => {
    setDetailModalOpen(false);
    setDetailUser(null);
  }, []);

  const handleStartEditRole = useCallback((user: User) => {
    setEditingRoleUserId(user.seq_id);
    setEditingRoleValue(user.role || '');
  }, []);

  const handleCancelEditRole = useCallback(() => {
    setEditingRoleUserId(null);
    setEditingRoleValue('');
  }, []);

  const handleSaveRole = useCallback(
    async (user: User) => {
      try {
        await HTTP.patch(`/api/v1/users/${user.seq_id}`, {
          role: editingRoleValue || null,
        });
        setSnackbar({ open: true, message: t('admin.role_updated'), severity: 'success' });
        setEditingRoleUserId(null);
        setEditingRoleValue('');
        fetchUsers(currentPage);
      } catch (error: any) {
        console.error('Failed to update role:', error);
        setSnackbar({
          open: true,
          message: error?.message || t('prompt.operation_failed'),
          severity: 'error',
        });
      }
    },
    [editingRoleValue, currentPage, fetchUsers, t],
  );

  const handleToggleDelete = useCallback(
    (user: User) => {
      const isDeleting = !user.is_deleted;
      setConfirmAction({
        open: true,
        message: isDeleting ? t('admin.confirm_delete') : t('admin.confirm_restore'),
        onConfirm: async () => {
          try {
            await HTTP.patch(`/api/v1/users/${user.seq_id}`, {
              is_deleted: isDeleting,
            });
            setSnackbar({
              open: true,
              message: isDeleting ? t('admin.user_deleted') : t('admin.user_restored'),
              severity: 'success',
            });
            fetchUsers(currentPage);
          } catch (error: any) {
            console.error('Failed to toggle user delete:', error);
            setSnackbar({
              open: true,
              message: error?.message || t('prompt.operation_failed'),
              severity: 'error',
            });
          } finally {
            setConfirmAction((prev) => ({ ...prev, open: false }));
          }
        },
      });
    },
    [currentPage, fetchUsers, t],
  );

  const handleCloseSnackbar = useCallback(() => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  }, []);

  // --- Render ---

  return (
    <div>
      <h1 className="title is-4">{t('admin.user_management')}</h1>

      {/* Toolbar: Search + Status Filter */}
      <div className="admin-users-toolbar">
        <div className="field has-addons">
          <div className="control has-icons-left" style={{ width: '300px' }}>
            <input
              className="input is-small"
              type="text"
              placeholder={t('admin.search_placeholder')}
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
            />
            <span className="icon is-small is-left">
              <i className="fa fa-search" />
            </span>
          </div>
        </div>

        <div className="field">
          <div className="control">
            <div className="select is-small">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              >
                <option value="all">{t('admin.filter_all')}</option>
                <option value="active">{t('admin.filter_active')}</option>
                <option value="deleted">{t('admin.filter_deleted')}</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* User List Table */}
      {loading ? (
        <div className="admin-users-loading">
          <span className="icon is-large">
            <i className="fa fa-spinner fa-pulse fa-2x" />
          </span>
          <p>{t('admin.loading_users')}</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="admin-users-empty">
          <span className="icon is-large has-text-grey-light">
            <i className="fa fa-users fa-2x" />
          </span>
          <p className="has-text-grey">{t('admin.no_users')}</p>
        </div>
      ) : (
        <>
          <div className="table-container">
            <table className="table is-fullwidth is-hoverable is-narrow admin-users-table">
              <thead>
                <tr>
                  <th>{t('admin.user_id')}</th>
                  <th>{t('admin.user_email')}</th>
                  <th>{t('admin.user_nickname')}</th>
                  <th>{t('admin.user_role')}</th>
                  <th>{t('admin.user_status')}</th>
                  <th>{t('admin.user_vip_expiry')}</th>
                  <th>{t('admin.user_last_login')}</th>
                  <th>{t('admin.user_created')}</th>
                  <th>{t('admin.user_actions')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user._id} className={user.is_deleted ? 'admin-user-deleted-row' : ''}>
                    <td>{user.seq_id}</td>
                    <td>{user.email}</td>
                    <td>{user.nick_name}</td>
                    <td>
                      {editingRoleUserId === user.seq_id ? (
                        <div className="admin-role-edit">
                          <div className="select is-small">
                            <select
                              value={editingRoleValue}
                              onChange={(e) => setEditingRoleValue(e.target.value)}
                            >
                              <option value="">{t('admin.user_no_role')}</option>
                              {roles.map((role) => (
                                <option key={role.value} value={role.value}>
                                  {role.label}
                                </option>
                              ))}
                            </select>
                          </div>
                          <button
                            type="button"
                            className="button is-small is-success"
                            onClick={() => handleSaveRole(user)}
                            title={t('action.confirm')}
                          >
                            <span className="icon is-small">
                              <i className="fa fa-check" />
                            </span>
                          </button>
                          <button
                            type="button"
                            className="button is-small is-light"
                            onClick={handleCancelEditRole}
                            title={t('action.cancel')}
                          >
                            <span className="icon is-small">
                              <i className="fa fa-times" />
                            </span>
                          </button>
                        </div>
                      ) : (
                        <span
                          className="tag is-light is-clickable"
                          onClick={() => handleStartEditRole(user)}
                          title={t('action.edit')}
                        >
                          {getRoleLabel(user.role)}
                          <span className="icon is-small" style={{ marginLeft: '4px' }}>
                            <i className="fa fa-pencil" style={{ fontSize: '0.7em' }} />
                          </span>
                        </span>
                      )}
                    </td>
                    <td>
                      {user.is_deleted ? (
                        <span className="tag is-danger is-light">{t('admin.filter_deleted')}</span>
                      ) : (
                        <span className="tag is-success is-light">{t('admin.filter_active')}</span>
                      )}
                    </td>
                    <td>
                      {user.vip_time_out_at ? (
                        <span
                          className={
                            isVipActive(user.vip_time_out_at)
                              ? 'has-text-success'
                              : 'has-text-grey'
                          }
                        >
                          {util.formatDate(user.vip_time_out_at, 'yyyy-MM-dd')}
                        </span>
                      ) : (
                        <span className="has-text-grey-light">-</span>
                      )}
                    </td>
                    <td>
                      {user.last_login_time
                        ? util.formatDate(user.last_login_time, 'yyyy-MM-dd HH:mm')
                        : '-'}
                    </td>
                    <td>{util.formatDate(user.created_at, 'yyyy-MM-dd HH:mm')}</td>
                    <td>
                      <div className="admin-user-actions">
                        <button
                          type="button"
                          className="button is-small is-info is-outlined"
                          onClick={() => handleViewDetail(user)}
                          title={t('action.view')}
                        >
                          <span className="icon is-small">
                            <i className="fa fa-eye" />
                          </span>
                        </button>
                        {user.is_deleted ? (
                          <button
                            type="button"
                            className="button is-small is-success is-outlined"
                            onClick={() => handleToggleDelete(user)}
                            title={t('admin.confirm_restore')}
                          >
                            <span className="icon is-small">
                              <i className="fa fa-undo" />
                            </span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="button is-small is-danger is-outlined"
                            onClick={() => handleToggleDelete(user)}
                            title={t('admin.confirm_delete')}
                          >
                            <span className="icon is-small">
                              <i className="fa fa-trash" />
                            </span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {total > PAGE_SIZE && (
            <nav
              className="pagination is-centered is-small"
              role="navigation"
              aria-label="pagination"
              style={{ marginTop: '1rem' }}
            >
              <button
                type="button"
                className="pagination-previous"
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
              >
                {t('pager.prev')}
              </button>
              <button
                type="button"
                className="pagination-next"
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
              >
                {t('pager.next')}
              </button>
              <ul className="pagination-list">
                {paginationRange.map((item, idx) => {
                  if (typeof item === 'string') {
                    return (
                      <li key={item}>
                        <span className="pagination-ellipsis">&hellip;</span>
                      </li>
                    );
                  }
                  return (
                    <li key={idx}>
                      <button
                        type="button"
                        className={`pagination-link ${currentPage === item ? 'is-current' : ''}`}
                        onClick={() => handlePageChange(item)}
                      >
                        {item}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>
          )}
        </>
      )}

      {/* Confirmation Modal */}
      {confirmAction.open && (
        <div className="modal is-active">
          <div className="modal-background" onClick={() => setConfirmAction((prev) => ({ ...prev, open: false }))} />
          <div className="modal-card" style={{ maxWidth: '420px' }}>
            <header className="modal-card-head">
              <p className="modal-card-title">{t('title.confirm_operation')}</p>
              <button
                type="button"
                className="delete"
                aria-label="close"
                onClick={() => setConfirmAction((prev) => ({ ...prev, open: false }))}
              />
            </header>
            <section className="modal-card-body">
              <p>{confirmAction.message}</p>
            </section>
            <footer className="modal-card-foot">
              <div className="buttons">
                <button
                  type="button"
                  className="button is-danger"
                  onClick={confirmAction.onConfirm}
                >
                  {t('action.confirm')}
                </button>
                <button
                  type="button"
                  className="button"
                  onClick={() => setConfirmAction((prev) => ({ ...prev, open: false }))}
                >
                  {t('action.cancel')}
                </button>
              </div>
            </footer>
          </div>
        </div>
      )}

      {/* User Detail Modal */}
      {detailModalOpen && (
        <div className="modal is-active">
          <div className="modal-background" onClick={handleCloseDetail} />
          <div className="modal-card admin-user-detail-modal">
            <header className="modal-card-head">
              <p className="modal-card-title">{t('admin.user_detail')}</p>
              <button
                type="button"
                className="delete"
                aria-label="close"
                onClick={handleCloseDetail}
              />
            </header>
            <section className="modal-card-body">
              {detailLoading ? (
                <div className="has-text-centered" style={{ padding: '2rem' }}>
                  <span className="icon is-large">
                    <i className="fa fa-spinner fa-pulse fa-2x" />
                  </span>
                </div>
              ) : detailUser ? (
                <div className="admin-user-detail-content">
                  {/* Account Information */}
                  <h2 className="subtitle is-6 admin-detail-section-title">
                    <span className="icon is-small">
                      <i className="fa fa-user" />
                    </span>
                    {t('admin.user_account_info')}
                  </h2>
                  <div className="admin-detail-grid">
                    <div className="admin-detail-item">
                      <span className="admin-detail-label">{t('admin.user_id')}</span>
                      <span className="admin-detail-value">{detailUser.seq_id}</span>
                    </div>
                    <div className="admin-detail-item">
                      <span className="admin-detail-label">{t('admin.user_email')}</span>
                      <span className="admin-detail-value">{detailUser.email}</span>
                    </div>
                    <div className="admin-detail-item">
                      <span className="admin-detail-label">{t('admin.user_nickname')}</span>
                      <span className="admin-detail-value">{detailUser.nick_name || '-'}</span>
                    </div>
                    <div className="admin-detail-item">
                      <span className="admin-detail-label">{t('admin.user_real_name')}</span>
                      <span className="admin-detail-value">{detailUser.real_name || '-'}</span>
                    </div>
                    <div className="admin-detail-item">
                      <span className="admin-detail-label">{t('admin.user_mobile')}</span>
                      <span className="admin-detail-value">{detailUser.mobile || '-'}</span>
                    </div>
                    <div className="admin-detail-item">
                      <span className="admin-detail-label">{t('admin.user_instagram')}</span>
                      <span className="admin-detail-value">{detailUser.instagram || '-'}</span>
                    </div>
                    <div className="admin-detail-item">
                      <span className="admin-detail-label">{t('admin.user_role')}</span>
                      <span className="admin-detail-value">
                        <span className="tag is-info is-light">
                          {getRoleLabel(detailUser.role)}
                        </span>
                      </span>
                    </div>
                    <div className="admin-detail-item">
                      <span className="admin-detail-label">{t('admin.user_status')}</span>
                      <span className="admin-detail-value">
                        {detailUser.is_deleted ? (
                          <span className="tag is-danger is-light">
                            {t('admin.user_deleted_status')}
                          </span>
                        ) : (
                          <span className="tag is-success is-light">
                            {t('admin.user_active')}
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="admin-detail-item">
                      <span className="admin-detail-label">{t('admin.user_activated')}</span>
                      <span className="admin-detail-value">
                        {detailUser.is_activated ? (
                          <span className="tag is-success is-light">{t('admin.user_yes')}</span>
                        ) : (
                          <span className="tag is-warning is-light">{t('admin.user_no')}</span>
                        )}
                      </span>
                    </div>
                    <div className="admin-detail-item">
                      <span className="admin-detail-label">{t('admin.user_created')}</span>
                      <span className="admin-detail-value">
                        {util.formatDate(detailUser.created_at, 'yyyy-MM-dd HH:mm')}
                      </span>
                    </div>
                    <div className="admin-detail-item">
                      <span className="admin-detail-label">{t('admin.user_last_login')}</span>
                      <span className="admin-detail-value">
                        {detailUser.last_login_time
                          ? util.formatDate(detailUser.last_login_time, 'yyyy-MM-dd HH:mm')
                          : '-'}
                      </span>
                    </div>
                    <div className="admin-detail-item">
                      <span className="admin-detail-label">{t('admin.user_last_login_ip')}</span>
                      <span className="admin-detail-value">
                        {detailUser.last_login_ip || '-'}
                      </span>
                    </div>
                  </div>

                  {/* VIP & Balance */}
                  <h2 className="subtitle is-6 admin-detail-section-title">
                    <span className="icon is-small">
                      <i className="fa fa-star" />
                    </span>
                    VIP & {t('admin.user_balance')}
                  </h2>
                  <div className="admin-detail-grid">
                    <div className="admin-detail-item">
                      <span className="admin-detail-label">{t('admin.user_vip_expiry')}</span>
                      <span className="admin-detail-value">
                        {detailUser.vip_time_out_at ? (
                          <>
                            {util.formatDate(detailUser.vip_time_out_at, 'yyyy-MM-dd HH:mm')}
                            {isVipActive(detailUser.vip_time_out_at) ? (
                              <span className="tag is-success is-light" style={{ marginLeft: '8px' }}>
                                {t('admin.user_vip_active')}
                              </span>
                            ) : (
                              <span className="tag is-danger is-light" style={{ marginLeft: '8px' }}>
                                {t('admin.user_vip_expired')}
                              </span>
                            )}
                          </>
                        ) : (
                          '-'
                        )}
                      </span>
                    </div>
                    <div className="admin-detail-item">
                      <span className="admin-detail-label">{t('admin.user_balance')}</span>
                      <span className="admin-detail-value admin-xbt-value">
                        {detailUser.XBT || '0'}
                      </span>
                    </div>
                  </div>

                  {/* Referral Info */}
                  <h2 className="subtitle is-6 admin-detail-section-title">
                    <span className="icon is-small">
                      <i className="fa fa-share-alt" />
                    </span>
                    {t('admin.user_referral_info')}
                  </h2>
                  <div className="admin-detail-grid">
                    <div className="admin-detail-item">
                      <span className="admin-detail-label">{t('admin.user_invite_code')}</span>
                      <span className="admin-detail-value">
                        {detailUser.invitation_code || '-'}
                      </span>
                    </div>
                    <div className="admin-detail-item">
                      <span className="admin-detail-label">{t('admin.user_invite_reward')}</span>
                      <span className="admin-detail-value">
                        {detailUser.invite_reward ?? '-'}
                      </span>
                    </div>
                    <div className="admin-detail-item">
                      <span className="admin-detail-label">{t('admin.user_invite_total')}</span>
                      <span className="admin-detail-value">
                        {detailUser.invite_total ?? '-'}
                      </span>
                    </div>
                    <div className="admin-detail-item">
                      <span className="admin-detail-label">{t('admin.user_inviter')}</span>
                      <span className="admin-detail-value">{inviter || '-'}</span>
                    </div>
                  </div>

                  {/* Invitations */}
                  <h2 className="subtitle is-6 admin-detail-section-title">
                    <span className="icon is-small">
                      <i className="fa fa-envelope" />
                    </span>
                    {t('admin.user_invitations')}
                  </h2>
                  {invitations.length > 0 ? (
                    <table className="table is-fullwidth is-narrow is-hoverable">
                      <thead>
                        <tr>
                          <th>{t('admin.user_invitation_email')}</th>
                          <th>{t('admin.user_invitation_date')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {invitations.map((inv, idx) => (
                          <tr key={idx}>
                            <td>{inv.email}</td>
                            <td>{util.formatDate(inv.created_at, 'yyyy-MM-dd HH:mm')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p className="has-text-grey-light" style={{ fontSize: '0.85rem' }}>
                      {t('admin.user_no_invitations')}
                    </p>
                  )}
                </div>
              ) : null}
            </section>
            <footer className="modal-card-foot">
              <button type="button" className="button" onClick={handleCloseDetail}>
                {t('action.cancel')}
              </button>
            </footer>
          </div>
        </div>
      )}

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
