'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import '@/i18n';
import HTTP from '@/lib/http';
import util from '@/utils/util';
import Pagination from '@/components/Pagination';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

// --- Types ---

type PurchaseStatus = 'waiting' | 'success' | 'fail' | 'invalid';

interface Purchase {
  _id: string;
  user: string;
  eth_address: string;
  tx_hash: string;
  amount: number;
  status: PurchaseStatus;
  comment: string;
  email: string;
  ref: string;
  created_at: string;
  updated_at: string;
}

interface PurchaseDetail {
  _id: string;
  user: string;
  eth_address: string;
  tx_hash: string;
  amount: number;
  status: PurchaseStatus;
  comment: string;
  email: string;
}

type StatusFilter = 'all' | 'waiting' | 'success' | 'fail' | 'invalid';

// --- Constants ---

const PAGE_SIZE = 20;

// --- Module-level pure functions ---

function getStatusTagClass(status: PurchaseStatus): string {
  switch (status) {
    case 'waiting':
      return 'is-warning';
    case 'success':
      return 'is-success';
    case 'fail':
      return 'is-danger';
    case 'invalid':
      return 'is-dark';
    default:
      return 'is-light';
  }
}

function calculateVipMonths(amount: number): { months: number; hasBonus: boolean } {
  const baseMonths = amount * 10;
  if (baseMonths >= 2) {
    return { months: Math.floor(baseMonths * 1.2), hasBonus: true };
  }
  return { months: Math.floor(baseMonths), hasBonus: false };
}

function formatVipDuration(
  amount: number,
  t: (key: string, options?: Record<string, unknown>) => string,
): string {
  const { months, hasBonus } = calculateVipMonths(amount);
  const monthText =
    months === 1
      ? t('admin.purchase_promote_months_value_one', { months })
      : t('admin.purchase_promote_months_value', { months });
  return hasBonus ? `${monthText} ${t('admin.purchase_promote_bonus')}` : monthText;
}

// --- Component ---

export default function AdminPurchases() {
  const { t } = useTranslation();

  // List state
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchKeyword, setSearchKeyword] = useState('');
  const [submittedKeyword, setSubmittedKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  // Detail modal
  const [detailPurchase, setDetailPurchase] = useState<PurchaseDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  // Edit modal
  const [editPurchase, setEditPurchase] = useState<Purchase | null>(null);
  const [editStatus, setEditStatus] = useState<PurchaseStatus>('waiting');
  const [editComment, setEditComment] = useState('');

  // Promote confirmation
  const [promoteAction, setPromoteAction] = useState<{
    purchaseId: string;
    email: string;
    amount: number;
  } | null>(null);

  // Submitting (double-click protection)
  const [submitting, setSubmitting] = useState(false);

  // Snackbar
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  // --- Data Fetching ---

  const fetchPurchases = useCallback(
    async (page: number, keyword: string) => {
      setLoading(true);
      try {
        const res: any = await HTTP.get('/api/v1/purchases', {
          params: { pageNumber: page, pageSize: PAGE_SIZE, keyword: keyword || undefined },
        });
        setPurchases(res.data.list);
        setTotal(res.data.total);
      } catch (error: any) {
        console.error('Failed to fetch purchases:', error);
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
    fetchPurchases(currentPage, submittedKeyword);
  }, [currentPage, submittedKeyword, fetchPurchases]);

  // --- Client-side filtering ---

  const filteredPurchases = useMemo(() => {
    if (statusFilter === 'all') return purchases;
    return purchases.filter((p) => p.status === statusFilter);
  }, [purchases, statusFilter]);

  // --- Pagination ---

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  // --- Search ---

  const handleSearch = useCallback(() => {
    setCurrentPage(1);
    setSubmittedKeyword(searchKeyword.trim());
  }, [searchKeyword]);

  const handleSearchKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        handleSearch();
      }
    },
    [handleSearch],
  );

  // --- Actions ---

  const handleViewDetail = useCallback(
    async (purchase: Purchase) => {
      setDetailModalOpen(true);
      setDetailLoading(true);
      setDetailPurchase(null);

      try {
        const res: any = await HTTP.get(`/api/v1/purchases/${purchase._id}`);
        setDetailPurchase(res.data);
      } catch (error: any) {
        console.error('Failed to fetch purchase detail:', error);
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
    setDetailPurchase(null);
  }, []);

  const handleOpenEdit = useCallback((purchase: Purchase) => {
    setEditPurchase(purchase);
    setEditStatus(purchase.status);
    setEditComment(purchase.comment || '');
  }, []);

  const handleCloseEdit = useCallback(() => {
    setEditPurchase(null);
    setEditStatus('waiting');
    setEditComment('');
  }, []);

  const handleSaveEdit = useCallback(async () => {
    if (!editPurchase) return;
    setSubmitting(true);
    try {
      await HTTP.patch(`/api/v1/purchases/${editPurchase._id}`, {
        status: editStatus,
        comment: editComment,
      });
      setSnackbar({
        open: true,
        message: t('admin.purchase_update_success'),
        severity: 'success',
      });
      handleCloseEdit();
      fetchPurchases(currentPage, submittedKeyword);
    } catch (error: any) {
      console.error('Failed to update purchase:', error);
      setSnackbar({
        open: true,
        message: error?.message || t('prompt.operation_failed'),
        severity: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  }, [editPurchase, editStatus, editComment, currentPage, submittedKeyword, fetchPurchases, handleCloseEdit, t]);

  const handleOpenPromote = useCallback((purchase: Purchase) => {
    setPromoteAction({
      purchaseId: purchase._id,
      email: purchase.email,
      amount: purchase.amount,
    });
  }, []);

  const handleConfirmPromote = useCallback(async () => {
    if (!promoteAction) return;
    setSubmitting(true);
    try {
      await HTTP.post(`/api/v1/purchases/${promoteAction.purchaseId}/promote`);
      setSnackbar({
        open: true,
        message: t('admin.purchase_promote_success'),
        severity: 'success',
      });
      fetchPurchases(currentPage, submittedKeyword);
    } catch (error: any) {
      console.error('Failed to promote purchase:', error);
      setSnackbar({
        open: true,
        message: error?.message || t('prompt.operation_failed'),
        severity: 'error',
      });
    } finally {
      setSubmitting(false);
      setPromoteAction(null);
    }
  }, [promoteAction, currentPage, submittedKeyword, fetchPurchases, t]);

  const handleCloseSnackbar = useCallback(() => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  }, []);

  // --- Render ---

  return (
    <div>
      <h1 className="title is-4">{t('admin.purchase_management')}</h1>

      {/* Toolbar: Search + Status Filter */}
      <div className="admin-purchases-toolbar">
        <div className="field has-addons">
          <div className="control has-icons-left" style={{ width: '360px' }}>
            <input
              className="input is-small"
              type="text"
              placeholder={t('admin.purchase_search_placeholder')}
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onKeyDown={handleSearchKeyDown}
            />
            <span className="icon is-small is-left">
              <i className="fa fa-search" />
            </span>
          </div>
          <div className="control">
            <button type="button" className="button is-small is-info" onClick={handleSearch}>
              <span className="icon is-small">
                <i className="fa fa-search" />
              </span>
            </button>
          </div>
        </div>

        <div className="field">
          <div className="control">
            <div className="select is-small">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              >
                <option value="all">{t('admin.purchase_filter_all')}</option>
                <option value="waiting">{t('admin.purchase_filter_waiting')}</option>
                <option value="success">{t('admin.purchase_filter_success')}</option>
                <option value="fail">{t('admin.purchase_filter_fail')}</option>
                <option value="invalid">{t('admin.purchase_filter_invalid')}</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Purchase List Table */}
      {loading ? (
        <div className="admin-purchases-loading">
          <span className="icon is-large">
            <i className="fa fa-spinner fa-pulse fa-2x" />
          </span>
          <p>{t('admin.loading_purchases')}</p>
        </div>
      ) : filteredPurchases.length === 0 ? (
        <div className="admin-purchases-empty">
          <span className="icon is-large has-text-grey-light">
            <i className="fa fa-shopping-cart fa-2x" />
          </span>
          <p className="has-text-grey">{t('admin.no_purchases')}</p>
        </div>
      ) : (
        <>
          <div className="table-container">
            <table className="table is-fullwidth is-hoverable is-narrow admin-purchases-table">
              <thead>
                <tr>
                  <th>{t('admin.purchase_email')}</th>
                  <th>{t('admin.purchase_eth_address')}</th>
                  <th>{t('admin.purchase_tx_hash')}</th>
                  <th>{t('admin.purchase_amount')}</th>
                  <th>{t('admin.purchase_status')}</th>
                  <th>{t('admin.purchase_comment')}</th>
                  <th>{t('admin.purchase_created')}</th>
                  <th>{t('admin.purchase_actions')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredPurchases.map((purchase) => (
                  <tr key={purchase._id}>
                    <td>{purchase.email}</td>
                    <td className="admin-purchases-hash">{purchase.eth_address}</td>
                    <td className="admin-purchases-hash">{purchase.tx_hash}</td>
                    <td>{purchase.amount}</td>
                    <td>
                      <span className={`tag ${getStatusTagClass(purchase.status)}`}>
                        {t(`admin.purchase_status_${purchase.status}`)}
                      </span>
                    </td>
                    <td className="admin-purchases-comment">{purchase.comment || '-'}</td>
                    <td>{util.formatDate(purchase.created_at, 'yyyy-MM-dd HH:mm')}</td>
                    <td>
                      <div className="admin-purchases-actions">
                        <button
                          type="button"
                          className="button is-small is-info is-outlined"
                          onClick={() => handleViewDetail(purchase)}
                          title={t('action.view')}
                        >
                          <span className="icon is-small">
                            <i className="fa fa-eye" />
                          </span>
                        </button>
                        <button
                          type="button"
                          className="button is-small is-warning is-outlined"
                          onClick={() => handleOpenEdit(purchase)}
                          title={t('action.edit')}
                        >
                          <span className="icon is-small">
                            <i className="fa fa-pencil" />
                          </span>
                        </button>
                        {purchase.status === 'waiting' && (
                          <button
                            type="button"
                            className="button is-small is-success is-outlined"
                            onClick={() => handleOpenPromote(purchase)}
                            title={t('admin.purchase_promote')}
                          >
                            <span className="icon is-small">
                              <i className="fa fa-arrow-up" />
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
            <div style={{ marginTop: '1rem' }}>
              <Pagination
                current={currentPage}
                total={total}
                pageSize={PAGE_SIZE}
                showTotal={false}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </>
      )}

      {/* Promote Confirmation Modal */}
      {promoteAction && (
        <div className="modal is-active">
          <div className="modal-background" onClick={() => setPromoteAction(null)} />
          <div className="modal-card" style={{ maxWidth: '480px' }}>
            <header className="modal-card-head">
              <p className="modal-card-title">{t('admin.purchase_promote_title')}</p>
              <button
                type="button"
                className="delete"
                aria-label="close"
                onClick={() => setPromoteAction(null)}
              />
            </header>
            <section className="modal-card-body">
              <div className="content">
                <div className="admin-detail-grid">
                  <div className="admin-detail-item">
                    <span className="admin-detail-label">{t('admin.purchase_promote_user')}</span>
                    <span className="admin-detail-value">{promoteAction.email}</span>
                  </div>
                  <div className="admin-detail-item">
                    <span className="admin-detail-label">
                      {t('admin.purchase_promote_amount')}
                    </span>
                    <span className="admin-detail-value">{promoteAction.amount}</span>
                  </div>
                  <div className="admin-detail-item">
                    <span className="admin-detail-label">
                      {t('admin.purchase_promote_months')}
                    </span>
                    <span className="admin-detail-value">
                      {formatVipDuration(promoteAction.amount, t)}
                    </span>
                  </div>
                </div>
                <article className="message is-warning" style={{ marginTop: '1rem' }}>
                  <div className="message-body">{t('admin.purchase_promote_warning')}</div>
                </article>
              </div>
            </section>
            <footer className="modal-card-foot">
              <div className="buttons">
                <button
                  type="button"
                  className={`button is-success ${submitting ? 'is-loading' : ''}`}
                  disabled={submitting}
                  onClick={handleConfirmPromote}
                >
                  {t('admin.purchase_promote_confirm')}
                </button>
                <button type="button" className="button" onClick={() => setPromoteAction(null)}>
                  {t('action.cancel')}
                </button>
              </div>
            </footer>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editPurchase && (
        <div className="modal is-active">
          <div className="modal-background" onClick={handleCloseEdit} />
          <div className="modal-card" style={{ maxWidth: '480px' }}>
            <header className="modal-card-head">
              <p className="modal-card-title">{t('admin.purchase_edit')}</p>
              <button
                type="button"
                className="delete"
                aria-label="close"
                onClick={handleCloseEdit}
              />
            </header>
            <section className="modal-card-body">
              <div className="field">
                <label className="label is-small">{t('admin.purchase_status')}</label>
                <div className="control">
                  <div className="select is-fullwidth">
                    <select value={editStatus} onChange={(e) => setEditStatus(e.target.value as PurchaseStatus)}>
                      <option value="waiting">{t('admin.purchase_status_waiting')}</option>
                      <option value="success">{t('admin.purchase_status_success')}</option>
                      <option value="fail">{t('admin.purchase_status_fail')}</option>
                      <option value="invalid">{t('admin.purchase_status_invalid')}</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="field">
                <label className="label is-small">{t('admin.purchase_comment')}</label>
                <div className="control">
                  <textarea
                    className="textarea"
                    rows={3}
                    value={editComment}
                    onChange={(e) => setEditComment(e.target.value)}
                  />
                </div>
              </div>
            </section>
            <footer className="modal-card-foot">
              <div className="buttons">
                <button
                  type="button"
                  className={`button is-success ${submitting ? 'is-loading' : ''}`}
                  disabled={submitting}
                  onClick={handleSaveEdit}
                >
                  {t('action.confirm')}
                </button>
                <button type="button" className="button" onClick={handleCloseEdit}>
                  {t('action.cancel')}
                </button>
              </div>
            </footer>
          </div>
        </div>
      )}

      {/* Purchase Detail Modal */}
      {detailModalOpen && (
        <div className="modal is-active">
          <div className="modal-background" onClick={handleCloseDetail} />
          <div className="modal-card admin-purchases-modal">
            <header className="modal-card-head">
              <p className="modal-card-title">{t('admin.purchase_detail')}</p>
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
              ) : detailPurchase ? (
                <div className="admin-detail-grid">
                  <div className="admin-detail-item">
                    <span className="admin-detail-label">{t('admin.purchase_email')}</span>
                    <span className="admin-detail-value">{detailPurchase.email}</span>
                  </div>
                  <div className="admin-detail-item">
                    <span className="admin-detail-label">{t('admin.purchase_eth_address')}</span>
                    <span className="admin-detail-value">{detailPurchase.eth_address}</span>
                  </div>
                  <div className="admin-detail-item">
                    <span className="admin-detail-label">{t('admin.purchase_tx_hash')}</span>
                    <span className="admin-detail-value">{detailPurchase.tx_hash}</span>
                  </div>
                  <div className="admin-detail-item">
                    <span className="admin-detail-label">{t('admin.purchase_amount')}</span>
                    <span className="admin-detail-value">{detailPurchase.amount}</span>
                  </div>
                  <div className="admin-detail-item">
                    <span className="admin-detail-label">{t('admin.purchase_status')}</span>
                    <span className="admin-detail-value">
                      <span className={`tag ${getStatusTagClass(detailPurchase.status)}`}>
                        {t(`admin.purchase_status_${detailPurchase.status}`)}
                      </span>
                    </span>
                  </div>
                  <div className="admin-detail-item">
                    <span className="admin-detail-label">{t('admin.purchase_comment')}</span>
                    <span className="admin-detail-value">{detailPurchase.comment || '-'}</span>
                  </div>
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
