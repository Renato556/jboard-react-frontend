import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import JobFilters from '../components/JobFilters';

describe('JobFilters', () => {
  const mockProps = {
    filters: {
      seniorityLevel: '',
      field: ''
    },
    onFilterChange: vi.fn(),
    seniorityLevels: ['Junior', 'Pleno', 'Senior'],
    fields: ['Tecnologia', 'Marketing', 'Vendas'],
    onClose: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders filter title and selects', () => {
    render(<JobFilters {...mockProps} />);

    expect(screen.getByText('Filtros')).toBeInTheDocument();
    expect(screen.getByLabelText('Nível de Senioridade')).toBeInTheDocument();
    expect(screen.getByLabelText('Área de Atuação')).toBeInTheDocument();
  });

  it('renders seniority level options correctly', () => {
    render(<JobFilters {...mockProps} />);

    expect(screen.getByText('Todos os níveis')).toBeInTheDocument();
    expect(screen.getByText('Junior')).toBeInTheDocument();
    expect(screen.getByText('Pleno')).toBeInTheDocument();
    expect(screen.getByText('Senior')).toBeInTheDocument();
  });

  it('renders field options correctly', () => {
    render(<JobFilters {...mockProps} />);

    expect(screen.getByText('Todas as áreas')).toBeInTheDocument();
    expect(screen.getByText('Tecnologia')).toBeInTheDocument();
    expect(screen.getByText('Marketing')).toBeInTheDocument();
    expect(screen.getByText('Vendas')).toBeInTheDocument();
  });

  it('calls onFilterChange when seniority level is changed', () => {
    render(<JobFilters {...mockProps} />);

    const senioritySelect = screen.getByLabelText('Nível de Senioridade');
    fireEvent.change(senioritySelect, { target: { value: 'Junior' } });

    expect(mockProps.onFilterChange).toHaveBeenCalledWith({
      seniorityLevel: 'Junior',
      field: ''
    });
  });

  it('calls onFilterChange when field is changed', () => {
    render(<JobFilters {...mockProps} />);

    const fieldSelect = screen.getByLabelText('Área de Atuação');
    fireEvent.change(fieldSelect, { target: { value: 'Tecnologia' } });

    expect(mockProps.onFilterChange).toHaveBeenCalledWith({
      seniorityLevel: '',
      field: 'Tecnologia'
    });
  });

  it('displays clear filters button when filters are applied', () => {
    const propsWithFilters = {
      ...mockProps,
      filters: {
        seniorityLevel: 'Junior',
        field: 'Tecnologia'
      }
    };

    render(<JobFilters {...propsWithFilters} />);

    expect(screen.getByText('Limpar Filtros')).toBeInTheDocument();
  });

  it('does not display clear filters button when no filters are applied', () => {
    render(<JobFilters {...mockProps} />);

    expect(screen.queryByText('Limpar Filtros')).not.toBeInTheDocument();
  });

  it('clears filters when clear button is clicked', () => {
    const propsWithFilters = {
      ...mockProps,
      filters: {
        seniorityLevel: 'Junior',
        field: 'Tecnologia'
      }
    };

    render(<JobFilters {...propsWithFilters} />);

    const clearButton = screen.getByText('Limpar Filtros');
    fireEvent.click(clearButton);

    expect(mockProps.onFilterChange).toHaveBeenCalledWith({
      seniorityLevel: '',
      field: ''
    });
  });

  it('renders close button when onClose prop is provided', () => {
    render(<JobFilters {...mockProps} />);

    const closeButton = document.querySelector('.close-filters-btn');
    expect(closeButton).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    render(<JobFilters {...mockProps} />);

    const closeButton = document.querySelector('.close-filters-btn');
    fireEvent.click(closeButton);

    expect(mockProps.onClose).toHaveBeenCalled();
  });

  it('does not render close button when onClose prop is not provided', () => {
    const propsWithoutClose = { ...mockProps, onClose: undefined };
    render(<JobFilters {...propsWithoutClose} />);

    expect(screen.queryByRole('button', { name: /close/i })).not.toBeInTheDocument();
  });

  it('reflects current filter values in selects', () => {
    const propsWithFilters = {
      ...mockProps,
      filters: {
        seniorityLevel: 'Senior',
        field: 'Marketing'
      }
    };

    render(<JobFilters {...propsWithFilters} />);

    const senioritySelect = screen.getByLabelText('Nível de Senioridade');
    const fieldSelect = screen.getByLabelText('Área de Atuação');

    expect(senioritySelect.value).toBe('Senior');
    expect(fieldSelect.value).toBe('Marketing');
  });
});
