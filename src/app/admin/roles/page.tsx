'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import '@/i18n';
import HTTP from '@/lib/http';
import util from '@/utils/util';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

// --- Types ---

interface Role {
  _id: string;
  role_name: string;
  role_description: string;
  resource: string[];
  created_at: string;
  updated_at: string;
}

interface TreeNode {
  _id: string;
  resource_pid: string;
  resource_code: string;
  resource_type: 'group' | 'menu' | 'interface';
  resource_name: string;
  resource_url: string;
  created_at: string;
  updated_at: string;
  children: TreeNode[];
}

interface RoleFormData {
  role_name: string;
  role_description: string;
  resource: string[];
}

// --- Constants ---

const EMPTY_FORM: RoleFormData = {
  role_name: '',
  role_description: '',
  resource: [],
};

// --- Component ---

export default function AdminRoles() {
  const { t } = useTranslation();

  // List state
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);

  // Search
  const [searchKeyword, setSearchKeyword] = useState('');

  // Resource tree for assignment
  const [resourceTree, setResourceTree] = useState<TreeNode[]>([]);

  // Form modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [formData, setFormData] = useState<RoleFormData>(EMPTY_FORM);
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Delete confirmation
  const [confirmAction, setConfirmAction] = useState<{
    open: boolean;
    roleId: string;
  } | null>(null);

  // Snackbar
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  // --- Data Fetching ---

  const fetchRoles = useCallback(
    async (keyword?: string) => {
      setLoading(true);
      try {
        const params: any = {};
        if (keyword) params.keyword = keyword;
        const res: any = await HTTP.get('/api/v1/roles', { params });
        setRoles(res.data.list);
      } catch (error: any) {
        console.error('Failed to fetch roles:', error);
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

  const fetchResourceTree = useCallback(async () => {
    try {
      const res: any = await HTTP.get('/api/v1/resources/tree');
      setResourceTree(res.data.tree);
    } catch (error: any) {
      console.error('Failed to fetch resource tree:', error);
    }
  }, []);

  useEffect(() => {
    fetchRoles();
    fetchResourceTree();
  }, [fetchRoles, fetchResourceTree]);

  // --- Search ---

  const handleSearch = useCallback(() => {
    fetchRoles(searchKeyword.trim() || undefined);
  }, [fetchRoles, searchKeyword]);

  const handleSearchKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleSearch();
      }
    },
    [handleSearch],
  );

  // --- Form Helpers ---

  const handleOpenCreate = useCallback(() => {
    setEditingRole(null);
    setFormData(EMPTY_FORM);
    setModalOpen(true);
  }, []);

  const handleOpenEdit = useCallback(
    async (role: Role) => {
      try {
        const res: any = await HTTP.get(`/api/v1/roles/${role._id}`);
        const detail: Role = res.data;
        setEditingRole(detail);
        setFormData({
          role_name: detail.role_name,
          role_description: detail.role_description || '',
          resource: detail.resource || [],
        });
        setModalOpen(true);
      } catch (error: any) {
        console.error('Failed to fetch role detail:', error);
        setSnackbar({
          open: true,
          message: error?.message || t('prompt.operation_failed'),
          severity: 'error',
        });
      }
    },
    [t],
  );

  const handleCloseModal = useCallback(() => {
    setModalOpen(false);
    setEditingRole(null);
    setFormData(EMPTY_FORM);
  }, []);

  const handleFormChange = useCallback((field: keyof RoleFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleToggleResource = useCallback((resourceId: string) => {
    setFormData((prev) => {
      const isSelected = prev.resource.includes(resourceId);
      return {
        ...prev,
        resource: isSelected
          ? prev.resource.filter((id) => id !== resourceId)
          : [...prev.resource, resourceId],
      };
    });
  }, []);

  // --- Submit ---

  const handleSubmit = useCallback(async () => {
    if (!formData.role_name.trim()) return;
    setFormSubmitting(true);
    try {
      const body: any = {
        role_name: formData.role_name.trim(),
        role_description: formData.role_description.trim(),
        resource: formData.resource,
      };

      if (editingRole) {
        await HTTP.patch(`/api/v1/roles/${editingRole._id}`, body);
        setSnackbar({
          open: true,
          message: t('admin.role_updated_success'),
          severity: 'success',
        });
      } else {
        await HTTP.post('/api/v1/roles', body);
        setSnackbar({
          open: true,
          message: t('admin.role_created_success'),
          severity: 'success',
        });
      }

      handleCloseModal();
      fetchRoles(searchKeyword.trim() || undefined);
    } catch (error: any) {
      console.error('Failed to save role:', error);
      setSnackbar({
        open: true,
        message: error?.message || t('prompt.operation_failed'),
        severity: 'error',
      });
    } finally {
      setFormSubmitting(false);
    }
  }, [formData, editingRole, handleCloseModal, fetchRoles, searchKeyword, t]);

  // --- Delete ---

  const handleDeleteClick = useCallback((role: Role) => {
    setConfirmAction({ open: true, roleId: role._id });
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!confirmAction) return;
    try {
      await HTTP.delete(`/api/v1/roles/${confirmAction.roleId}`);
      setSnackbar({
        open: true,
        message: t('admin.role_deleted'),
        severity: 'success',
      });
      fetchRoles(searchKeyword.trim() || undefined);
    } catch (error: any) {
      console.error('Failed to delete role:', error);
      const message =
        error?.status === 409 || error?.statusCode === 409
          ? t('admin.role_in_use')
          : error?.message || t('prompt.operation_failed');
      setSnackbar({ open: true, message, severity: 'error' });
    } finally {
      setConfirmAction(null);
    }
  }, [confirmAction, fetchRoles, searchKeyword, t]);

  const handleCloseSnackbar = useCallback(() => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  }, []);

  // --- Tree Checkbox Renderer ---

  const renderTreeCheckbox = useMemo(() => {
    const renderNode = (node: TreeNode, level: number = 0): React.ReactNode => {
      const isChecked = formData.resource.includes(node._id);
      const typeIcon =
        node.resource_type === 'group'
          ? 'fa-folder'
          : node.resource_type === 'menu'
            ? 'fa-bars'
            : 'fa-plug';

      return (
        <div key={node._id} className="admin-tree-checkbox-node">
          <label className="admin-tree-checkbox-row" style={{ paddingLeft: `${level * 1.25}rem` }}>
            <input
              type="checkbox"
              checked={isChecked}
              onChange={() => handleToggleResource(node._id)}
            />
            <span className="icon is-small">
              <i className={`fa ${typeIcon}`} />
            </span>
            <span>{node.resource_name}</span>
            <span style={{ color: '#999', fontSize: '0.75rem', marginLeft: '0.25rem' }}>
              ({node.resource_code})
            </span>
          </label>
          {node.children &&
            node.children.length > 0 &&
            node.children.map((child) => renderNode(child, level + 1))}
        </div>
      );
    };

    return resourceTree.map((node) => renderNode(node));
  }, [resourceTree, formData.resource, handleToggleResource]);

  // --- Render ---

  return (
    <div>
      <h1 className="title is-4">{t('admin.role_management')}</h1>

      {/* Toolbar: Search + Create */}
      <div className="admin-roles-toolbar">
        <div className="field has-addons">
          <div className="control has-icons-left" style={{ width: '300px' }}>
            <input
              className="input is-small"
              type="text"
              placeholder={t('admin.role_search_placeholder')}
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

        <button type="button" className="button is-small is-primary" onClick={handleOpenCreate}>
          <span className="icon is-small">
            <i className="fa fa-plus" />
          </span>
          <span>{t('admin.role_create')}</span>
        </button>
      </div>

      {/* Role List Table */}
      {loading ? (
        <div className="admin-roles-loading">
          <span className="icon is-large">
            <i className="fa fa-spinner fa-pulse fa-2x" />
          </span>
          <p>{t('admin.loading_roles')}</p>
        </div>
      ) : roles.length === 0 ? (
        <div className="admin-roles-empty">
          <span className="icon is-large has-text-grey-light">
            <i className="fa fa-shield fa-2x" />
          </span>
          <p className="has-text-grey">{t('admin.no_roles')}</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="table is-fullwidth is-hoverable is-narrow admin-roles-table">
            <thead>
              <tr>
                <th>{t('admin.role_name')}</th>
                <th>{t('admin.role_description')}</th>
                <th>{t('admin.role_resource_count')}</th>
                <th>{t('admin.role_created')}</th>
                <th>{t('admin.role_actions')}</th>
              </tr>
            </thead>
            <tbody>
              {roles.map((role) => (
                <tr key={role._id}>
                  <td>
                    <strong>{role.role_name}</strong>
                  </td>
                  <td>{role.role_description || '-'}</td>
                  <td>
                    <span className="tag is-info is-light">
                      {role.resource ? role.resource.length : 0}
                    </span>
                  </td>
                  <td>{util.formatDate(role.created_at, 'yyyy-MM-dd HH:mm')}</td>
                  <td>
                    <div className="admin-roles-actions">
                      <button
                        type="button"
                        className="button is-small is-info is-outlined"
                        onClick={() => handleOpenEdit(role)}
                        title={t('action.edit')}
                      >
                        <span className="icon is-small">
                          <i className="fa fa-pencil" />
                        </span>
                      </button>
                      <button
                        type="button"
                        className="button is-small is-danger is-outlined"
                        onClick={() => handleDeleteClick(role)}
                        title={t('action.delete')}
                      >
                        <span className="icon is-small">
                          <i className="fa fa-trash" />
                        </span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create/Edit Modal */}
      {modalOpen && (
        <div className="modal is-active">
          <div className="modal-background" onClick={handleCloseModal} />
          <div className="modal-card admin-roles-modal">
            <header className="modal-card-head">
              <p className="modal-card-title">
                {editingRole ? t('admin.role_edit') : t('admin.role_create')}
              </p>
              <button
                type="button"
                className="delete"
                aria-label="close"
                onClick={handleCloseModal}
              />
            </header>
            <section className="modal-card-body">
              {/* Role Name */}
              <div className="field">
                <label className="label is-small">{t('admin.role_name')} *</label>
                <div className="control">
                  <input
                    className="input is-small"
                    type="text"
                    value={formData.role_name}
                    onChange={(e) => handleFormChange('role_name', e.target.value)}
                    placeholder={t('admin.role_name')}
                  />
                </div>
              </div>

              {/* Role Description */}
              <div className="field">
                <label className="label is-small">{t('admin.role_description')}</label>
                <div className="control">
                  <textarea
                    className="textarea is-small"
                    value={formData.role_description}
                    onChange={(e) => handleFormChange('role_description', e.target.value)}
                    placeholder={t('admin.role_description')}
                    rows={3}
                  />
                </div>
              </div>

              {/* Resource Assignment */}
              <div className="field">
                <label className="label is-small">
                  {t('admin.select_resources')}
                  <span style={{ color: '#999', fontWeight: 'normal', marginLeft: '0.5rem' }}>
                    ({formData.resource.length})
                  </span>
                </label>
                <div className="admin-tree-checkbox-container">{renderTreeCheckbox}</div>
              </div>
            </section>
            <footer className="modal-card-foot">
              <div className="buttons">
                <button
                  type="button"
                  className={`button is-primary ${formSubmitting ? 'is-loading' : ''}`}
                  onClick={handleSubmit}
                  disabled={!formData.role_name.trim() || formSubmitting}
                >
                  {t('action.confirm')}
                </button>
                <button type="button" className="button" onClick={handleCloseModal}>
                  {t('action.cancel')}
                </button>
              </div>
            </footer>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmAction && confirmAction.open && (
        <div className="modal is-active">
          <div className="modal-background" onClick={() => setConfirmAction(null)} />
          <div className="modal-card" style={{ maxWidth: '420px' }}>
            <header className="modal-card-head">
              <p className="modal-card-title">{t('title.confirm_operation')}</p>
              <button
                type="button"
                className="delete"
                aria-label="close"
                onClick={() => setConfirmAction(null)}
              />
            </header>
            <section className="modal-card-body">
              <p>{t('admin.role_delete_confirm')}</p>
            </section>
            <footer className="modal-card-foot">
              <div className="buttons">
                <button type="button" className="button is-danger" onClick={handleConfirmDelete}>
                  {t('action.confirm')}
                </button>
                <button type="button" className="button" onClick={() => setConfirmAction(null)}>
                  {t('action.cancel')}
                </button>
              </div>
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
