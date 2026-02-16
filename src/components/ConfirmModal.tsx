/** @jsxImportSource @emotion/react */
'use client';

import { useEffect, useCallback } from 'react';
import { css } from '@emotion/react';

const modalContentStyle = css`
  max-width: 480px;
  width: 90%;
  animation: slideUp 300ms ease-out;
`;

const modalCardFootStyle = css`
  justify-content: flex-end;
  gap: 8px;
`;

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

const variantButtonClass: Record<string, string> = {
  danger: 'is-danger',
  warning: 'is-warning',
  info: 'is-info',
};

function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'info',
  onConfirm,
  onCancel,
  loading = false,
}: ConfirmModalProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loading) {
        onCancel();
      }
    },
    [onCancel, loading],
  );

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  const handleBackdropClick = () => {
    if (!loading) {
      onCancel();
    }
  };

  return (
    <div className={`modal ${isOpen ? 'is-active' : ''}`} data-testid="confirm-modal">
      <div className="modal-background" onClick={handleBackdropClick} data-testid="modal-backdrop" />
      <div className="modal-card" css={modalContentStyle}>
        <header className="modal-card-head">
          <p className="modal-card-title">{title}</p>
          <button
            className="delete"
            aria-label="close"
            onClick={onCancel}
            disabled={loading}
            type="button"
          />
        </header>
        <section className="modal-card-body">
          <p>{message}</p>
        </section>
        <footer className="modal-card-foot" css={modalCardFootStyle}>
          <button
            className="button"
            onClick={onCancel}
            disabled={loading}
            type="button"
            data-testid="cancel-button"
          >
            {cancelText}
          </button>
          <button
            className={`button ${variantButtonClass[variant] || 'is-info'} ${loading ? 'is-loading' : ''}`}
            onClick={onConfirm}
            disabled={loading}
            type="button"
            data-testid="confirm-button"
          >
            {confirmText}
          </button>
        </footer>
      </div>
    </div>
  );
}

export default ConfirmModal;
