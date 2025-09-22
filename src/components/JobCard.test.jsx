import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import JobCard from '../components/JobCard';

describe('JobCard', () => {
  const mockJob = {
    id: '1',
    title: 'Frontend Developer',
    company: 'Tech Corp',
    url: 'https://example.com/job/1',
    publishedDate: '2025-01-15T10:00:00Z',
    applicationDeadline: '2025-02-15T23:59:59Z',
    seniorityLevel: 'Junior',
    field: 'Tecnologia',
    employmentType: 'CLT',
    workplaceType: 'Remoto'
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders job information correctly', () => {
    render(<JobCard job={mockJob} />);

    expect(screen.getByText('Frontend Developer')).toBeInTheDocument();
    expect(screen.getByText('Tech Corp')).toBeInTheDocument();
    expect(screen.getByText('Junior')).toBeInTheDocument();
    expect(screen.getByText('Tecnologia')).toBeInTheDocument();
    expect(screen.getByText('CLT')).toBeInTheDocument();
    expect(screen.getByText('Remoto')).toBeInTheDocument();
  });

  it('formats published date correctly', () => {
    render(<JobCard job={mockJob} />);

    expect(screen.getByText('15/01/2025')).toBeInTheDocument();
  });

  it('displays application deadline when provided', () => {
    render(<JobCard job={mockJob} />);

    expect(screen.getByText('Prazo:')).toBeInTheDocument();
    expect(screen.getByText('15/02/2025')).toBeInTheDocument();
  });

  it('handles missing deadline gracefully', () => {
    const jobWithoutDeadline = { ...mockJob, applicationDeadline: null };
    render(<JobCard job={jobWithoutDeadline} />);

    expect(screen.queryByText('Prazo:')).not.toBeInTheDocument();
  });

  it('handles missing published date', () => {
    const jobWithoutDate = { ...mockJob, publishedDate: null };
    render(<JobCard job={jobWithoutDate} />);

    expect(screen.getByText('Não informado')).toBeInTheDocument();
  });

  it('opens job URL when apply button is clicked', () => {
    const windowOpenSpy = vi.spyOn(window, 'open');
    render(<JobCard job={mockJob} />);

    const applyButton = screen.getByText('Candidatar-se');
    fireEvent.click(applyButton);

    expect(windowOpenSpy).toHaveBeenCalledWith('https://example.com/job/1', '_blank');
  });

  it('applies correct CSS classes for seniority level', () => {
    render(<JobCard job={mockJob} />);

    const seniorityBadge = screen.getByText('Junior');
    expect(seniorityBadge).toHaveClass('seniority-badge', 'junior');
  });

  it('renders without optional badges when data is missing', () => {
    const minimalJob = {
      id: '2',
      title: 'Test Job',
      company: 'Test Company',
      url: 'https://example.com/job/2',
      publishedDate: '2025-01-15T10:00:00Z'
    };

    render(<JobCard job={minimalJob} />);

    expect(screen.getByText('Test Job')).toBeInTheDocument();
    expect(screen.getByText('Test Company')).toBeInTheDocument();
    expect(screen.queryByText('Junior')).not.toBeInTheDocument();
  });
});
