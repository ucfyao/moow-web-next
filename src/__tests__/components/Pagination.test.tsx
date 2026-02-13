import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Pagination from '@/components/Pagination';

describe('Pagination', () => {
  const defaultProps = {
    current: 1,
    total: 50,
    pageSize: 10,
    showTotal: false,
    onPageChange: vi.fn(),
  };

  it('renders page 1 button', () => {
    render(<Pagination {...defaultProps} />);
    expect(screen.getByTitle('1')).toBeInTheDocument();
  });

  it('renders last page button', () => {
    render(<Pagination {...defaultProps} />);
    // 50 items / 10 per page = 5 pages
    expect(screen.getByTitle('5')).toBeInTheDocument();
  });

  it('disables previous button on first page', () => {
    render(<Pagination {...defaultProps} current={1} />);
    const prevButton = screen.getByTitle('pager.prev').querySelector('button');
    expect(prevButton).toBeDisabled();
  });

  it('disables next button on last page', () => {
    render(<Pagination {...defaultProps} current={5} />);
    const nextButton = screen.getByTitle('pager.next').querySelector('button');
    expect(nextButton).toBeDisabled();
  });

  it('calls onPageChange when clicking a page number', () => {
    const onPageChange = vi.fn();
    render(<Pagination {...defaultProps} onPageChange={onPageChange} current={1} />);

    const page2Button = screen.getByTitle('2');
    fireEvent.click(page2Button.querySelector('button')!);

    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it('calls onPageChange when clicking next', () => {
    const onPageChange = vi.fn();
    render(<Pagination {...defaultProps} onPageChange={onPageChange} current={1} />);

    const nextButton = screen.getByTitle('pager.next').querySelector('button');
    fireEvent.click(nextButton!);

    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it('shows total count when showTotal is false', () => {
    render(<Pagination {...defaultProps} showTotal={false} />);
    expect(screen.getByText('50', { exact: false })).toBeInTheDocument();
  });
});
