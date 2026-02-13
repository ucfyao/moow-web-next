import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Tip from '@/components/Tip';

describe('Tip', () => {
  it('renders content text correctly', () => {
    render(<Tip content="Hello tooltip" />);
    expect(screen.getByText('Hello tooltip')).toBeInTheDocument();
  });

  it('renders JSX content', () => {
    render(<Tip content={<strong>Bold tip</strong>} />);
    expect(screen.getByText('Bold tip')).toBeInTheDocument();
  });

  it('renders poptip structure', () => {
    const { container } = render(<Tip content="Test" />);
    expect(container.querySelector('.poptip-popper')).toBeInTheDocument();
    expect(container.querySelector('.poptip-arrow')).toBeInTheDocument();
    expect(container.querySelector('.poptip-body-content')).toBeInTheDocument();
  });
});
