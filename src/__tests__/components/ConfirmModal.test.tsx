import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ConfirmModal from '@/components/ConfirmModal';

const defaultProps = {
  isOpen: true,
  title: 'Delete Item',
  message: 'Are you sure you want to delete this item?',
  onConfirm: vi.fn(),
  onCancel: vi.fn(),
};

describe('ConfirmModal', () => {
  it('renders when isOpen is true', () => {
    render(<ConfirmModal {...defaultProps} />);
    expect(screen.getByTestId('confirm-modal')).toBeInTheDocument();
    expect(screen.getByText('Delete Item')).toBeInTheDocument();
    expect(screen.getByText('Are you sure you want to delete this item?')).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    render(<ConfirmModal {...defaultProps} isOpen={false} />);
    expect(screen.queryByTestId('confirm-modal')).not.toBeInTheDocument();
  });

  it('uses default button text', () => {
    render(<ConfirmModal {...defaultProps} />);
    expect(screen.getByTestId('confirm-button')).toHaveTextContent('Confirm');
    expect(screen.getByTestId('cancel-button')).toHaveTextContent('Cancel');
  });

  it('uses custom button text', () => {
    render(<ConfirmModal {...defaultProps} confirmText="Yes, delete" cancelText="No, keep" />);
    expect(screen.getByTestId('confirm-button')).toHaveTextContent('Yes, delete');
    expect(screen.getByTestId('cancel-button')).toHaveTextContent('No, keep');
  });

  it('calls onConfirm when confirm button is clicked', () => {
    const onConfirm = vi.fn();
    render(<ConfirmModal {...defaultProps} onConfirm={onConfirm} />);
    fireEvent.click(screen.getByTestId('confirm-button'));
    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it('calls onCancel when cancel button is clicked', () => {
    const onCancel = vi.fn();
    render(<ConfirmModal {...defaultProps} onCancel={onCancel} />);
    fireEvent.click(screen.getByTestId('cancel-button'));
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('calls onCancel when backdrop is clicked', () => {
    const onCancel = vi.fn();
    render(<ConfirmModal {...defaultProps} onCancel={onCancel} />);
    fireEvent.click(screen.getByTestId('modal-backdrop'));
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('calls onCancel on Escape key press', () => {
    const onCancel = vi.fn();
    render(<ConfirmModal {...defaultProps} onCancel={onCancel} />);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('shows loading state on confirm button', () => {
    render(<ConfirmModal {...defaultProps} loading={true} />);
    const confirmBtn = screen.getByTestId('confirm-button');
    expect(confirmBtn.className).toContain('is-loading');
    expect(confirmBtn).toBeDisabled();
  });

  it('disables cancel button when loading', () => {
    render(<ConfirmModal {...defaultProps} loading={true} />);
    expect(screen.getByTestId('cancel-button')).toBeDisabled();
  });

  it('does not call onCancel on Escape when loading', () => {
    const onCancel = vi.fn();
    render(<ConfirmModal {...defaultProps} onCancel={onCancel} loading={true} />);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onCancel).not.toHaveBeenCalled();
  });

  it('does not call onCancel on backdrop click when loading', () => {
    const onCancel = vi.fn();
    render(<ConfirmModal {...defaultProps} onCancel={onCancel} loading={true} />);
    fireEvent.click(screen.getByTestId('modal-backdrop'));
    expect(onCancel).not.toHaveBeenCalled();
  });

  it('applies variant class to confirm button', () => {
    render(<ConfirmModal {...defaultProps} variant="danger" />);
    expect(screen.getByTestId('confirm-button').className).toContain('is-danger');
  });

  it('sets body overflow hidden when open', () => {
    render(<ConfirmModal {...defaultProps} />);
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('restores body overflow when closed', () => {
    const { rerender } = render(<ConfirmModal {...defaultProps} />);
    expect(document.body.style.overflow).toBe('hidden');
    rerender(<ConfirmModal {...defaultProps} isOpen={false} />);
    expect(document.body.style.overflow).toBe('');
  });
});
