import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import JobSorter from '../components/JobSorter';

describe('JobSorter', () => {
  const mockProps = {
    sortBy: 'publishedDate-desc',
    onSortChange: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders sort label and select element', () => {
    render(<JobSorter {...mockProps} />);

    expect(screen.getByText('Ordenar por:')).toBeInTheDocument();
    expect(screen.getByLabelText('Ordenar por:')).toBeInTheDocument();
  });

  it('renders all sort options', () => {
    render(<JobSorter {...mockProps} />);

    expect(screen.getByText('Mais recentes (publicação)')).toBeInTheDocument();
    expect(screen.getByText('Mais antigas (publicação)')).toBeInTheDocument();
    expect(screen.getByText('Atualizadas recentemente')).toBeInTheDocument();
    expect(screen.getByText('Atualizadas há mais tempo')).toBeInTheDocument();
  });

  it('displays the current sort value', () => {
    render(<JobSorter {...mockProps} />);

    const select = screen.getByLabelText('Ordenar por:');
    expect(select.value).toBe('publishedDate-desc');
  });

  it('calls onSortChange when sort option is changed', () => {
    render(<JobSorter {...mockProps} />);

    const select = screen.getByLabelText('Ordenar por:');
    fireEvent.change(select, { target: { value: 'updatedAt-desc' } });

    expect(mockProps.onSortChange).toHaveBeenCalledWith('updatedAt-desc');
  });

  it('reflects different sort values correctly', () => {
    const { rerender } = render(<JobSorter {...mockProps} />);

    expect(screen.getByLabelText('Ordenar por:').value).toBe('publishedDate-desc');

    rerender(<JobSorter sortBy="publishedDate-asc" onSortChange={mockProps.onSortChange} />);
    expect(screen.getByLabelText('Ordenar por:').value).toBe('publishedDate-asc');

    rerender(<JobSorter sortBy="updatedAt-desc" onSortChange={mockProps.onSortChange} />);
    expect(screen.getByLabelText('Ordenar por:').value).toBe('updatedAt-desc');
  });

  it('has correct option values', () => {
    render(<JobSorter {...mockProps} />);

    const select = screen.getByLabelText('Ordenar por:');
    const options = Array.from(select.options);

    expect(options).toHaveLength(4);
    expect(options[0].value).toBe('publishedDate-desc');
    expect(options[1].value).toBe('publishedDate-asc');
    expect(options[2].value).toBe('updatedAt-desc');
    expect(options[3].value).toBe('updatedAt-asc');
  });
});
