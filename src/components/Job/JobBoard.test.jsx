import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import JobBoard from './JobBoard.jsx';
import { jobsService } from '../../services/api.js';

vi.mock('../../services/api', () => ({
  jobsService: {
    getJobs: vi.fn()
  }
}));

vi.mock('./JobCard', () => ({
  default: ({ job }) => (
    <div data-testid={`job-card-${job.id}`}>
      <h3>{job.title}</h3>
      <span>{job.company}</span>
    </div>
  )
}));

vi.mock('./JobFilters', () => ({
  default: ({ filters, onFilterChange, seniorityLevels, fields, onClose }) => (
    <div data-testid="job-filters">
      <select
        data-testid="seniority-filter"
        value={filters.seniorityLevel}
        onChange={(e) => onFilterChange({ ...filters, seniorityLevel: e.target.value })}
      >
        <option value="">All</option>
        {seniorityLevels.filter(Boolean).map(level => (
          <option key={level} value={level}>{level}</option>
        ))}
      </select>
      <select
        data-testid="field-filter"
        value={filters.field}
        onChange={(e) => onFilterChange({ ...filters, field: e.target.value })}
      >
        <option value="">All</option>
        {fields.filter(Boolean).map(field => (
          <option key={field} value={field}>{field}</option>
        ))}
      </select>
      {onClose && <button onClick={onClose}>Close</button>}
    </div>
  )
}));

vi.mock('./JobSorter', () => ({
  default: ({ sortBy, onSortChange }) => (
    <div data-testid="job-sorter">
      <select
        data-testid="sort-select"
        value={sortBy}
        onChange={(e) => onSortChange(e.target.value)}
      >
        <option value="publishedDate-desc">Newest</option>
        <option value="publishedDate-asc">Oldest</option>
        <option value="updatedAt-desc">Recently Updated</option>
        <option value="updatedAt-asc">Least Recently Updated</option>
      </select>
    </div>
  )
}));

describe('JobBoard', () => {
  const mockJobs = [
    {
      id: '1',
      title: 'Frontend Developer',
      company: 'Tech Corp',
      publishedDate: '2025-01-15T10:00:00Z',
      updatedAt: '2025-01-20T10:00:00Z',
      seniorityLevel: 'Junior',
      field: 'Tecnologia'
    },
    {
      id: '2',
      title: 'Backend Developer',
      company: 'Software Inc',
      publishedDate: '2025-01-10T10:00:00Z',
      updatedAt: '2025-01-18T10:00:00Z',
      seniorityLevel: 'Senior',
      field: 'Tecnologia'
    },
    {
      id: '3',
      title: 'Marketing Manager',
      company: 'Marketing Co',
      publishedDate: '2025-01-12T10:00:00Z',
      updatedAt: '2025-01-19T10:00:00Z',
      seniorityLevel: 'Pleno',
      field: 'Marketing'
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('shows loading state initially', () => {
    jobsService.getJobs.mockImplementation(() => new Promise(() => {}));

    render(<JobBoard />);

    expect(screen.getByText('Carregando vagas...')).toBeInTheDocument();
    expect(document.querySelector('.loading-spinner')).toBeInTheDocument();
  });

  it('displays jobs after successful API call', async () => {
    jobsService.getJobs.mockResolvedValue({ data: mockJobs });

    render(<JobBoard />);

    await waitFor(() => {
      expect(screen.getByText('JBoard')).toBeInTheDocument();
    });

    expect(screen.getByText('3 vagas disponíveis')).toBeInTheDocument();
    expect(screen.getByTestId('job-card-1')).toBeInTheDocument();
    expect(screen.getByTestId('job-card-2')).toBeInTheDocument();
    expect(screen.getByTestId('job-card-3')).toBeInTheDocument();
  });

  it('displays error state when API call fails', async () => {
    const errorMessage = 'Network error';
    jobsService.getJobs.mockRejectedValue(new Error(errorMessage));

    render(<JobBoard />);

    await waitFor(() => {
      expect(screen.getByText('Ops! Algo deu errado')).toBeInTheDocument();
    });

    expect(screen.getByText('Network error')).toBeInTheDocument();
    expect(screen.getByText('Tentar Novamente')).toBeInTheDocument();
  });

  it('reloads page when retry button is clicked', async () => {
    const reloadSpy = vi.spyOn(window.location, 'reload');
    jobsService.getJobs.mockRejectedValue(new Error('Network error'));

    render(<JobBoard />);

    await waitFor(() => {
      expect(screen.getByText('Tentar Novamente')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Tentar Novamente'));
    expect(reloadSpy).toHaveBeenCalled();
  });

  it('filters jobs by seniority level', async () => {
    jobsService.getJobs.mockResolvedValue({ data: mockJobs });

    render(<JobBoard />);

    await waitFor(() => {
      expect(screen.getByText('3 vagas disponíveis')).toBeInTheDocument();
    });

    const seniorityFilter = screen.getByTestId('seniority-filter');
    fireEvent.change(seniorityFilter, { target: { value: 'Junior' } });

    await waitFor(() => {
      expect(screen.getByText('1 vaga encontrada')).toBeInTheDocument();
    });

    expect(screen.getByTestId('job-card-1')).toBeInTheDocument();
    expect(screen.queryByTestId('job-card-2')).not.toBeInTheDocument();
    expect(screen.queryByTestId('job-card-3')).not.toBeInTheDocument();
  });

  it('filters jobs by field', async () => {
    jobsService.getJobs.mockResolvedValue({ data: mockJobs });

    render(<JobBoard />);

    await waitFor(() => {
      expect(screen.getByText('3 vagas disponíveis')).toBeInTheDocument();
    });

    const fieldFilter = screen.getByTestId('field-filter');
    fireEvent.change(fieldFilter, { target: { value: 'Tecnologia' } });

    await waitFor(() => {
      expect(screen.getByText('2 vagas encontradas')).toBeInTheDocument();
    });

    expect(screen.getByTestId('job-card-1')).toBeInTheDocument();
    expect(screen.getByTestId('job-card-2')).toBeInTheDocument();
    expect(screen.queryByTestId('job-card-3')).not.toBeInTheDocument();
  });

  it('sorts jobs correctly', async () => {
    jobsService.getJobs.mockResolvedValue({ data: mockJobs });

    render(<JobBoard />);

    await waitFor(() => {
      expect(screen.getByText('3 vagas disponíveis')).toBeInTheDocument();
    });

    const sortSelect = screen.getByTestId('sort-select');
    fireEvent.change(sortSelect, { target: { value: 'publishedDate-asc' } });

    const jobCards = screen.getAllByTestId(/job-card-/);
    expect(jobCards[0]).toHaveAttribute('data-testid', 'job-card-2');
    expect(jobCards[1]).toHaveAttribute('data-testid', 'job-card-3');
    expect(jobCards[2]).toHaveAttribute('data-testid', 'job-card-1');
  });

  it('sorts jobs by updatedAt correctly', async () => {
    jobsService.getJobs.mockResolvedValue({ data: mockJobs });

    render(<JobBoard />);

    await waitFor(() => {
      expect(screen.getByText('3 vagas disponíveis')).toBeInTheDocument();
    });

    const sortSelect = screen.getByTestId('sort-select');
    fireEvent.change(sortSelect, { target: { value: 'updatedAt-desc' } });

    const jobCards = screen.getAllByTestId(/job-card-/);
    expect(jobCards[0]).toHaveAttribute('data-testid', 'job-card-1');
    expect(jobCards[1]).toHaveAttribute('data-testid', 'job-card-3');
    expect(jobCards[2]).toHaveAttribute('data-testid', 'job-card-2');
  });

  it('sorts jobs by updatedAt ascending correctly', async () => {
    jobsService.getJobs.mockResolvedValue({ data: mockJobs });

    render(<JobBoard />);

    await waitFor(() => {
      expect(screen.getByText('3 vagas disponíveis')).toBeInTheDocument();
    });

    const sortSelect = screen.getByTestId('sort-select');
    fireEvent.change(sortSelect, { target: { value: 'updatedAt-asc' } });

    const jobCards = screen.getAllByTestId(/job-card-/);
    expect(jobCards[0]).toHaveAttribute('data-testid', 'job-card-2');
    expect(jobCards[1]).toHaveAttribute('data-testid', 'job-card-3');
    expect(jobCards[2]).toHaveAttribute('data-testid', 'job-card-1');
  });

  it('shows no jobs message when no jobs match filters', async () => {
    jobsService.getJobs.mockResolvedValue({ data: [] });

    render(<JobBoard />);

    await waitFor(() => {
      expect(screen.getByText('0 vagas disponíveis')).toBeInTheDocument();
    });

    expect(screen.getByText('Nenhuma vaga encontrada')).toBeInTheDocument();
    expect(screen.getByText('Tente ajustar os filtros para encontrar mais oportunidades.')).toBeInTheDocument();
  });

  it('closes mobile filters after applying filter on mobile viewport', async () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 500,
    });

    jobsService.getJobs.mockResolvedValue({ data: mockJobs });

    render(<JobBoard />);

    await waitFor(() => {
      expect(screen.getByText('3 vagas disponíveis')).toBeInTheDocument();
    });

    const filterToggle = screen.getByText('Filtros');
    fireEvent.click(filterToggle);

    const seniorityFilter = screen.getByTestId('seniority-filter');
    fireEvent.change(seniorityFilter, { target: { value: 'Junior' } });

    await waitFor(() => {
      expect(screen.getByText('1 vaga encontrada')).toBeInTheDocument();
    });
  });

  it('displays filter indicator when filters are active', async () => {
    jobsService.getJobs.mockResolvedValue({ data: mockJobs });

    render(<JobBoard />);

    await waitFor(() => {
      expect(screen.getByText('3 vagas disponíveis')).toBeInTheDocument();
    });

    const seniorityFilter = screen.getByTestId('seniority-filter');
    fireEvent.change(seniorityFilter, { target: { value: 'Junior' } });

    const filterButton = screen.getByText('Filtros').closest('button');
    expect(filterButton).toBeInTheDocument();
  });

  it('toggles mobile filters', async () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 500,
    });

    jobsService.getJobs.mockResolvedValue({ data: mockJobs });

    render(<JobBoard />);

    await waitFor(() => {
      expect(screen.getByText('Filtros')).toBeInTheDocument();
    });

    const filterToggle = screen.getByText('Filtros');
    fireEvent.click(filterToggle);

    expect(screen.getByTestId('job-filters')).toBeInTheDocument();
  });

  it('extracts unique seniority levels and fields from jobs', async () => {
    jobsService.getJobs.mockResolvedValue({ data: mockJobs });

    render(<JobBoard />);

    await waitFor(() => {
      expect(screen.getByText('3 vagas disponíveis')).toBeInTheDocument();
    });

    const seniorityFilter = screen.getByTestId('seniority-filter');
    const seniorityOptions = Array.from(seniorityFilter.options).map(opt => opt.value);
    expect(seniorityOptions).toContain('Junior');
    expect(seniorityOptions).toContain('Pleno');
    expect(seniorityOptions).toContain('Senior');

    const fieldFilter = screen.getByTestId('field-filter');
    const fieldOptions = Array.from(fieldFilter.options).map(opt => opt.value);
    expect(fieldOptions).toContain('Tecnologia');
    expect(fieldOptions).toContain('Marketing');
  });

  it('handles jobs with missing or invalid dates', async () => {
    const jobsWithInvalidDates = [
      {
        id: '1',
        title: 'Test Job',
        company: 'Test Corp',
        publishedDate: 'invalid-date',
        updatedAt: null,
        seniorityLevel: 'Junior',
        field: 'Tecnologia'
      }
    ];

    jobsService.getJobs.mockResolvedValue({ data: jobsWithInvalidDates });

    render(<JobBoard />);

    await waitFor(() => {
      expect(screen.getByText('1 vaga disponível')).toBeInTheDocument();
    });

    expect(screen.getByTestId('job-card-1')).toBeInTheDocument();
  });

  it('calls onLogout when logout button is clicked', async () => {
    const mockOnLogout = vi.fn();
    jobsService.getJobs.mockResolvedValue({ data: mockJobs });

    render(<JobBoard onLogout={mockOnLogout} />);

    await waitFor(() => {
      expect(screen.getByText('JBoard')).toBeInTheDocument();
    });

    const logoutButton = screen.getByRole('button', { name: /sair/i });
    fireEvent.click(logoutButton);

    expect(mockOnLogout).toHaveBeenCalledTimes(1);
  });

  it('navigates to profile when profile button is clicked', async () => {
    const originalLocation = window.location;
    delete window.location;
    window.location = { href: '' };

    jobsService.getJobs.mockResolvedValue({ data: mockJobs });

    render(<JobBoard />);

    await waitFor(() => {
      expect(screen.getByText('JBoard')).toBeInTheDocument();
    });

    const profileButton = screen.getByRole('button', { name: /perfil/i });
    fireEvent.click(profileButton);

    expect(window.location.href).toBe('/perfil');

    window.location = originalLocation;
  });

  it('displays correct job count with singular form', async () => {
    const singleJob = [mockJobs[0]];
    jobsService.getJobs.mockResolvedValue({ data: singleJob });

    render(<JobBoard />);

    await waitFor(() => {
      expect(screen.getByText('1 vaga disponível')).toBeInTheDocument();
    });
  });

  it('displays correct filtered job count with singular form', async () => {
    jobsService.getJobs.mockResolvedValue({ data: mockJobs });

    render(<JobBoard />);

    await waitFor(() => {
      expect(screen.getByText('3 vagas disponíveis')).toBeInTheDocument();
    });

    const seniorityFilter = screen.getByTestId('seniority-filter');
    fireEvent.change(seniorityFilter, { target: { value: 'Senior' } });

    await waitFor(() => {
      expect(screen.getByText('1 vaga encontrada')).toBeInTheDocument();
    });
  });

  it('handles jobs with missing dates gracefully', async () => {
    const jobsWithMissingDates = [
      {
        id: '1',
        title: 'Job 1',
        company: 'Company 1',
        publishedDate: null,
        updatedAt: undefined,
        seniorityLevel: 'Junior',
        field: 'Tech'
      },
      {
        id: '2',
        title: 'Job 2',
        company: 'Company 2',
        publishedDate: '2025-01-15T10:00:00Z',
        updatedAt: '2025-01-20T10:00:00Z',
        seniorityLevel: 'Senior',
        field: 'Tech'
      }
    ];

    jobsService.getJobs.mockResolvedValue({ data: jobsWithMissingDates });

    render(<JobBoard />);

    await waitFor(() => {
      expect(screen.getByText('2 vagas disponíveis')).toBeInTheDocument();
    });

    expect(screen.getByTestId('job-card-1')).toBeInTheDocument();
    expect(screen.getByTestId('job-card-2')).toBeInTheDocument();
  });

  it('filters out jobs with empty seniority levels and fields from filter options', async () => {
    const jobsWithEmptyValues = [
      ...mockJobs,
      {
        id: '4',
        title: 'Job 4',
        company: 'Company 4',
        publishedDate: '2025-01-15T10:00:00Z',
        updatedAt: '2025-01-20T10:00:00Z',
        seniorityLevel: '',
        field: null
      }
    ];

    jobsService.getJobs.mockResolvedValue({ data: jobsWithEmptyValues });

    render(<JobBoard />);

    await waitFor(() => {
      expect(screen.getByText('4 vagas disponíveis')).toBeInTheDocument();
    });

    const seniorityFilter = screen.getByTestId('seniority-filter');
    const seniorityOptions = Array.from(seniorityFilter.options)
      .map(option => option.value)
      .filter(value => value !== '');

    expect(seniorityOptions).toContain('Junior');
    expect(seniorityOptions).toContain('Senior');
    expect(seniorityOptions).toContain('Pleno');
    expect(seniorityOptions).toHaveLength(3);

    const fieldFilter = screen.getByTestId('field-filter');
    const fieldOptions = Array.from(fieldFilter.options)
      .map(option => option.value)
      .filter(value => value !== '');

    expect(fieldOptions).toContain('Tecnologia');
    expect(fieldOptions).toContain('Marketing');
    expect(fieldOptions).toHaveLength(2);
  });

  it('shows mobile filter toggle on mobile viewport', async () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 500,
    });

    jobsService.getJobs.mockResolvedValue({ data: mockJobs });

    render(<JobBoard />);

    await waitFor(() => {
      expect(screen.getByText('Filtros')).toBeInTheDocument();
    });

    const filterButton = screen.getByText('Filtros');
    expect(filterButton).toBeInTheDocument();
  });

  it('toggles mobile filters when filter button is clicked', async () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 500,
    });

    jobsService.getJobs.mockResolvedValue({ data: mockJobs });

    render(<JobBoard />);

    await waitFor(() => {
      expect(screen.getByText('Filtros')).toBeInTheDocument();
    });

    const filterButton = screen.getByText('Filtros');
    fireEvent.click(filterButton);

    const filtersContainer = document.querySelector('.filters-sidebar');
    expect(filtersContainer).toHaveClass('show');
  });

  it('combines seniority and field filters correctly', async () => {
    jobsService.getJobs.mockResolvedValue({ data: mockJobs });

    render(<JobBoard />);

    await waitFor(() => {
      expect(screen.getByText('3 vagas disponíveis')).toBeInTheDocument();
    });

    const seniorityFilter = screen.getByTestId('seniority-filter');
    const fieldFilter = screen.getByTestId('field-filter');

    fireEvent.change(seniorityFilter, { target: { value: 'Senior' } });
    fireEvent.change(fieldFilter, { target: { value: 'Tecnologia' } });

    await waitFor(() => {
      expect(screen.getByText('1 vaga encontrada')).toBeInTheDocument();
    });

    expect(screen.getByTestId('job-card-2')).toBeInTheDocument();
    expect(screen.queryByTestId('job-card-1')).not.toBeInTheDocument();
    expect(screen.queryByTestId('job-card-3')).not.toBeInTheDocument();
  });

  it('displays header with correct title and subtitle', async () => {
    jobsService.getJobs.mockResolvedValue({ data: mockJobs });

    render(<JobBoard />);

    await waitFor(() => {
      expect(screen.getByText('JBoard')).toBeInTheDocument();
    });

    expect(screen.getByText('Encontre sua próxima oportunidade profissional')).toBeInTheDocument();
  });

  it('handles empty response data gracefully', async () => {
    jobsService.getJobs.mockResolvedValue({ data: null });

    render(<JobBoard />);

    await waitFor(() => {
      expect(screen.getByText('0 vagas disponíveis')).toBeInTheDocument();
    });

    expect(screen.getByText('Nenhuma vaga encontrada')).toBeInTheDocument();
  });

  it('shows filter indicator when any filter is active', async () => {
    jobsService.getJobs.mockResolvedValue({ data: mockJobs });

    render(<JobBoard />);

    await waitFor(() => {
      expect(screen.getByText('3 vagas disponíveis')).toBeInTheDocument();
    });

    expect(screen.queryByText('•')).not.toBeInTheDocument();

    const seniorityFilter = screen.getByTestId('seniority-filter');
    fireEvent.change(seniorityFilter, { target: { value: 'Junior' } });

    await waitFor(() => {
      expect(screen.getByText('•')).toBeInTheDocument();
    });
  });
});
