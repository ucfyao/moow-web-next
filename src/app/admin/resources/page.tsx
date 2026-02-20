'use client';

import { type ReactNode, type KeyboardEvent, useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import '@/i18n';
import HTTP from '@/lib/http';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

// --- Types ---

interface Resource {
  _id: string;
  resource_pid: string;
  resource_code: string;
  resource_type: 'group' | 'menu' | 'interface';
  resource_name: string;
  resource_url: string;
  created_at: string;
  updated_at: string;
}

interface TreeNode extends Resource {
  children: TreeNode[];
}

interface ResourceFormData {
  resource_type: 'group' | 'menu' | 'interface';
  resource_pid: string;
  resource_code: string;
  resource_name: string;
  resource_url: string;
}

// --- Constants ---

const EMPTY_FORM: ResourceFormData = {
  resource_type: 'group',
  resource_pid: '',
  resource_code: '',
  resource_name: '',
  resource_url: '',
};

// --- Helpers ---

function flattenTree(nodes: TreeNode[]): Resource[] {
  const result: Resource[] = [];
  const walk = (list: TreeNode[]) => {
    for (const node of list) {
      result.push(node);
      if (node.children && node.children.length > 0) {
        walk(node.children);
      }
    }
  };
  walk(nodes);
  return result;
}

// --- Type Helpers ---

function getTypeTagClass(type: string): string {
  switch (type) {
    case 'group':
      return 'is-warning is-light';
    case 'menu':
      return 'is-info is-light';
    case 'interface':
      return 'is-success is-light';
    default:
      return 'is-light';
  }
}

function getTypeIcon(type: string): string {
  switch (type) {
    case 'group':
      return 'fa-folder';
    case 'menu':
      return 'fa-bars';
    case 'interface':
      return 'fa-plug';
    default:
      return 'fa-circle';
  }
}

// --- Component ---

export default function AdminResources() {
  const { t } = useTranslation();

  // Tree state
  const [tree, setTree] = useState<TreeNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  // Search
  const [searchKeyword, setSearchKeyword] = useState('');

  // All flat resources for parent select
  const [allResources, setAllResources] = useState<Resource[]>([]);

  // Form modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [formData, setFormData] = useState<ResourceFormData>(EMPTY_FORM);
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Delete confirmation
  const [confirmAction, setConfirmAction] = useState<{
    resourceId: string;
  } | null>(null);

  // Snackbar
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  // --- Data Fetching ---

  const fetchTree = useCallback(
    async (keyword?: string) => {
      setLoading(true);
      try {
        if (keyword) {
          // When searching, use the flat list endpoint
          const res: any = await HTTP.get('/api/v1/resources', {
            params: { keyword },
          });
          // Convert flat results to pseudo-tree (each as a root node)
          const list: Resource[] = res.data.list;
          const pseudoTree: TreeNode[] = list.map((r) => ({ ...r, children: [] }));
          setTree(pseudoTree);
          setAllResources(list);
        } else {
          const res: any = await HTTP.get('/api/v1/resources/tree');
          setTree(res.data.tree);
          setAllResources(flattenTree(res.data.tree));
          // Expand all top-level nodes by default on first load
          setExpandedIds((prev) => {
            if (prev.size === 0) {
              const topLevelIds = new Set<string>(res.data.tree.map((n: TreeNode) => n._id));
              return topLevelIds;
            }
            return prev;
          });
        }
      } catch (error: any) {
        console.error('Failed to fetch resources:', error);
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
    fetchTree();
  }, [fetchTree]);

  // --- Search ---

  const handleSearch = useCallback(() => {
    fetchTree(searchKeyword.trim() || undefined);
  }, [fetchTree, searchKeyword]);

  const handleSearchKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleSearch();
      }
    },
    [handleSearch],
  );

  // --- Expand/Collapse ---

  const handleToggleExpand = useCallback((nodeId: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  }, []);

  // --- Form Helpers ---

  const handleOpenCreate = useCallback(() => {
    setEditingResource(null);
    setFormData(EMPTY_FORM);
    setModalOpen(true);
  }, []);

  const handleOpenEdit = useCallback(
    async (resource: Resource) => {
      try {
        const res: any = await HTTP.get(`/api/v1/resources/${resource._id}`);
        const detail: Resource = res.data;
        setEditingResource(detail);
        setFormData({
          resource_type: detail.resource_type,
          resource_pid: detail.resource_pid || '',
          resource_code: detail.resource_code,
          resource_name: detail.resource_name,
          resource_url: detail.resource_url || '',
        });
        setModalOpen(true);
      } catch (error: any) {
        console.error('Failed to fetch resource detail:', error);
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
    setEditingResource(null);
    setFormData(EMPTY_FORM);
  }, []);

  const handleFormChange = useCallback(
    (field: keyof ResourceFormData, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  // --- Submit ---

  const handleSubmit = useCallback(async () => {
    if (!formData.resource_code.trim() || !formData.resource_name.trim()) return;
    setFormSubmitting(true);
    try {
      const body: any = {
        resource_type: formData.resource_type,
        resource_code: formData.resource_code.trim(),
        resource_name: formData.resource_name.trim(),
      };
      if (formData.resource_pid) {
        body.resource_pid = formData.resource_pid;
      }
      if (formData.resource_url.trim()) {
        body.resource_url = formData.resource_url.trim();
      }

      if (editingResource) {
        await HTTP.patch(`/api/v1/resources/${editingResource._id}`, body);
        setSnackbar({
          open: true,
          message: t('admin.resource_updated_success'),
          severity: 'success',
        });
      } else {
        await HTTP.post('/api/v1/resources', body);
        setSnackbar({
          open: true,
          message: t('admin.resource_created_success'),
          severity: 'success',
        });
      }

      handleCloseModal();
      fetchTree(searchKeyword.trim() || undefined);
    } catch (error: any) {
      console.error('Failed to save resource:', error);
      setSnackbar({
        open: true,
        message: error?.message || t('prompt.operation_failed'),
        severity: 'error',
      });
    } finally {
      setFormSubmitting(false);
    }
  }, [formData, editingResource, handleCloseModal, fetchTree, searchKeyword, t]);

  // --- Delete ---

  const handleDeleteClick = useCallback((resource: Resource) => {
    setConfirmAction({ resourceId: resource._id });
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!confirmAction) return;
    try {
      await HTTP.delete(`/api/v1/resources/${confirmAction.resourceId}`);
      setSnackbar({
        open: true,
        message: t('admin.resource_deleted'),
        severity: 'success',
      });
      fetchTree(searchKeyword.trim() || undefined);
    } catch (error: any) {
      console.error('Failed to delete resource:', error);
      const message =
        error?.status === 409 || error?.statusCode === 409
          ? t('admin.resource_in_use')
          : error?.message || t('prompt.operation_failed');
      setSnackbar({ open: true, message, severity: 'error' });
    } finally {
      setConfirmAction(null);
    }
  }, [confirmAction, fetchTree, searchKeyword, t]);

  const handleCloseSnackbar = useCallback(() => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  }, []);

  // --- Type Label Helpers ---

  const getTypeLabel = useCallback(
    (type: string): string => {
      switch (type) {
        case 'group':
          return t('admin.resource_type_group');
        case 'menu':
          return t('admin.resource_type_menu');
        case 'interface':
          return t('admin.resource_type_interface');
        default:
          return type;
      }
    },
    [t],
  );

  // --- Tree Renderer ---

  const renderTreeNode = useCallback(
    (node: TreeNode, level: number = 0): ReactNode => {
      const hasChildren = node.children && node.children.length > 0;
      const isExpanded = expandedIds.has(node._id);

      return (
        <div key={node._id} className="admin-tree-node">
          <div className="admin-tree-row" style={{ paddingLeft: `${0.75 + level * 1.25}rem` }}>
            {/* Expand/Collapse Toggle */}
            {hasChildren ? (
              <span
                className="admin-tree-toggle"
                onClick={() => handleToggleExpand(node._id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleToggleExpand(node._id);
                  }
                }}
                role="button"
                tabIndex={0}
              >
                <i className={`fa ${isExpanded ? 'fa-caret-down' : 'fa-caret-right'}`} />
              </span>
            ) : (
              <span className="admin-tree-toggle-placeholder" />
            )}

            {/* Type Icon */}
            <span className="admin-tree-icon">
              <i className={`fa ${getTypeIcon(node.resource_type)}`} />
            </span>

            {/* Name */}
            <span className="admin-tree-name">{node.resource_name}</span>

            {/* Code */}
            <span className="admin-tree-code">{node.resource_code}</span>

            {/* Type */}
            <span className="admin-tree-type">
              <span className={`tag is-small ${getTypeTagClass(node.resource_type)}`}>
                {getTypeLabel(node.resource_type)}
              </span>
            </span>

            {/* URL */}
            <span className="admin-tree-url">{node.resource_url || '-'}</span>

            {/* Actions */}
            <div className="admin-tree-actions">
              <button
                type="button"
                className="button is-small is-info is-outlined"
                onClick={() => handleOpenEdit(node)}
                title={t('action.edit')}
              >
                <span className="icon is-small">
                  <i className="fa fa-pencil" />
                </span>
              </button>
              <button
                type="button"
                className="button is-small is-danger is-outlined"
                onClick={() => handleDeleteClick(node)}
                title={t('action.delete')}
              >
                <span className="icon is-small">
                  <i className="fa fa-trash" />
                </span>
              </button>
            </div>
          </div>

          {/* Children */}
          {hasChildren && isExpanded && (
            <div className="admin-tree-children">
              {node.children.map((child) => renderTreeNode(child, level + 1))}
            </div>
          )}
        </div>
      );
    },
    [expandedIds, handleToggleExpand, getTypeLabel, handleOpenEdit, handleDeleteClick, t],
  );

  // --- Render ---

  return (
    <div>
      <h1 className="title is-4">{t('admin.resource_management')}</h1>

      {/* Toolbar: Search + Create */}
      <div className="admin-resources-toolbar">
        <div className="field has-addons">
          <div className="control has-icons-left" style={{ width: '300px' }}>
            <input
              className="input is-small"
              type="text"
              placeholder={t('admin.resource_search_placeholder')}
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
          <span>{t('admin.resource_create')}</span>
        </button>
      </div>

      {/* Resource Tree */}
      {loading ? (
        <div className="admin-resources-loading">
          <span className="icon is-large">
            <i className="fa fa-spinner fa-pulse fa-2x" />
          </span>
          <p>{t('admin.loading_resources')}</p>
        </div>
      ) : tree.length === 0 ? (
        <div className="admin-resources-empty">
          <span className="icon is-large has-text-grey-light">
            <i className="fa fa-lock fa-2x" />
          </span>
          <p className="has-text-grey">{t('admin.no_resources')}</p>
        </div>
      ) : (
        <div className="admin-tree-container">
          {tree.map((node) => renderTreeNode(node))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {modalOpen && (
        <div className="modal is-active">
          <div className="modal-background" onClick={handleCloseModal} />
          <div className="modal-card admin-resources-modal">
            <header className="modal-card-head">
              <p className="modal-card-title">
                {editingResource ? t('admin.resource_edit') : t('admin.resource_create')}
              </p>
              <button
                type="button"
                className="delete"
                aria-label="close"
                onClick={handleCloseModal}
              />
            </header>
            <section className="modal-card-body">
              {/* Resource Type */}
              <div className="field">
                <label className="label is-small">{t('admin.resource_type')} *</label>
                <div className="control">
                  <div className="select is-small is-fullwidth">
                    <select
                      value={formData.resource_type}
                      onChange={(e) => handleFormChange('resource_type', e.target.value)}
                    >
                      <option value="group">{t('admin.resource_type_group')}</option>
                      <option value="menu">{t('admin.resource_type_menu')}</option>
                      <option value="interface">{t('admin.resource_type_interface')}</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Parent Node */}
              <div className="field">
                <label className="label is-small">{t('admin.resource_parent')}</label>
                <div className="control">
                  <div className="select is-small is-fullwidth">
                    <select
                      value={formData.resource_pid}
                      onChange={(e) => handleFormChange('resource_pid', e.target.value)}
                    >
                      <option value="">{t('admin.resource_root')}</option>
                      {allResources
                        .filter((r) => !editingResource || r._id !== editingResource._id)
                        .map((r) => (
                          <option key={r._id} value={r._id}>
                            {r.resource_name} ({r.resource_code})
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Resource Code */}
              <div className="field">
                <label className="label is-small">{t('admin.resource_code')} *</label>
                <div className="control">
                  <input
                    className="input is-small"
                    type="text"
                    value={formData.resource_code}
                    onChange={(e) => handleFormChange('resource_code', e.target.value)}
                    placeholder={t('admin.resource_code')}
                  />
                </div>
              </div>

              {/* Resource Name */}
              <div className="field">
                <label className="label is-small">{t('admin.resource_name')} *</label>
                <div className="control">
                  <input
                    className="input is-small"
                    type="text"
                    value={formData.resource_name}
                    onChange={(e) => handleFormChange('resource_name', e.target.value)}
                    placeholder={t('admin.resource_name')}
                  />
                </div>
              </div>

              {/* Resource URL */}
              <div className="field">
                <label className="label is-small">{t('admin.resource_url')}</label>
                <div className="control">
                  <input
                    className="input is-small"
                    type="text"
                    value={formData.resource_url}
                    onChange={(e) => handleFormChange('resource_url', e.target.value)}
                    placeholder={t('admin.resource_url')}
                  />
                </div>
              </div>
            </section>
            <footer className="modal-card-foot">
              <div className="buttons">
                <button
                  type="button"
                  className={`button is-primary ${formSubmitting ? 'is-loading' : ''}`}
                  onClick={handleSubmit}
                  disabled={
                    !formData.resource_code.trim() ||
                    !formData.resource_name.trim() ||
                    formSubmitting
                  }
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
      {confirmAction && (
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
              <p>{t('admin.resource_delete_confirm')}</p>
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
