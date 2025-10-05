import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import JobCard from './JobCard.jsx';
import { authService } from '../../services/auth.js';

vi.mock('../../services/auth', () => ({
  authService: {
    getUserRole: vi.fn()
  }
}));

describe('JobCard', () => {
  const mockJob = {
    id: 1,
    title: 'Desenvolvedor Frontend',
    company: 'Tech Company',
    url: 'https://example.com/job/1',
    publishedDate: '2024-01-15',
    applicationDeadline: '2024-02-15',
    seniorityLevel: 'Mid',
    field: 'Tecnologia',
    employmentType: 'CLT',
    workplaceType: 'Remoto'
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // eslint-disable-next-line no-undef
    global.open = vi.fn();
    console.log = vi.fn();
  });

  it('renders job information correctly', () => {
    authService.getUserRole.mockReturnValue('free');
    render(<JobCard job={mockJob} />);

    expect(screen.getByText('Desenvolvedor Frontend')).toBeInTheDocument();
    expect(screen.getByText('Tech Company')).toBeInTheDocument();
    // Test for date in expected format (will be 14/01/2024 due to timezone)
    expect(screen.getByText(/14\/01\/2024|15\/01\/2024/)).toBeInTheDocument();
    expect(screen.getByText(/14\/02\/2024|15\/02\/2024/)).toBeInTheDocument();
    expect(screen.getByText('Mid')).toBeInTheDocument();
    expect(screen.getByText('Tecnologia')).toBeInTheDocument();
    expect(screen.getByText('CLT')).toBeInTheDocument();
    expect(screen.getByText('Remoto')).toBeInTheDocument();
  });

  it('renders job with minimal information', () => {
    const minimalJob = {
      id: 2,
      title: 'Desenvolvedor Backend',
      company: 'Simple Company',
      url: 'https://example.com/job/2',
      publishedDate: '2024-01-20'
    };

    authService.getUserRole.mockReturnValue('free');
    render(<JobCard job={minimalJob} />);

    expect(screen.getByText('Desenvolvedor Backend')).toBeInTheDocument();
    expect(screen.getByText('Simple Company')).toBeInTheDocument();
    expect(screen.getByText(/19\/01\/2024|20\/01\/2024/)).toBeInTheDocument();
    expect(screen.queryByText(/prazo/i)).not.toBeInTheDocument();
  });

  it('opens job URL when apply button is clicked', () => {
    authService.getUserRole.mockReturnValue('free');
    render(<JobCard job={mockJob} />);

    const applyButton = screen.getByRole('button', { name: /candidatar-se/i });
    fireEvent.click(applyButton);

    // eslint-disable-next-line no-undef
    expect(global.open).toHaveBeenCalledWith('https://example.com/job/1', '_blank');
  });

  describe('AI Analysis button for free users', () => {
    beforeEach(() => {
      authService.getUserRole.mockReturnValue('free');
    });

    it('renders disabled AI analysis button for free users', () => {
      render(<JobCard job={mockJob} />);

      const aiButton = screen.getByRole('button', { name: /analisar usando ia/i });
      expect(aiButton).toBeInTheDocument();
      expect(aiButton).toBeDisabled();
      expect(aiButton).toHaveClass('disabled');
    });

    it('shows lock icon for free users', () => {
      render(<JobCard job={mockJob} />);

      const aiButton = screen.getByRole('button', { name: /analisar usando ia/i });
      const lockIcon = aiButton.querySelector('svg rect[x="3"][y="11"]');
      expect(lockIcon).toBeInTheDocument();
    });

    it('shows premium tooltip for free users', () => {
      render(<JobCard job={mockJob} />);

      const aiButton = screen.getByRole('button', { name: /analisar usando ia/i });
      expect(aiButton).toHaveAttribute('title', 'Recurso disponível apenas para usuários Premium');
    });

    it('does not trigger action when clicked as free user', () => {
      render(<JobCard job={mockJob} />);

      const aiButton = screen.getByRole('button', { name: /analisar usando ia/i });
      fireEvent.click(aiButton);

      expect(console.log).not.toHaveBeenCalled();
    });
  });

  describe('AI Analysis button for premium users', () => {
    beforeEach(() => {
      authService.getUserRole.mockReturnValue('premium');
    });

    it('renders enabled AI analysis button for premium users', () => {
      render(<JobCard job={mockJob} />);

      const aiButton = screen.getByRole('button', { name: /analisar usando ia/i });
      expect(aiButton).toBeInTheDocument();
      expect(aiButton).not.toBeDisabled();
      expect(aiButton).not.toHaveClass('disabled');
    });

    it('shows star/AI icon for premium users', () => {
      render(<JobCard job={mockJob} />);

      const aiButton = screen.getByRole('button', { name: /analisar usando ia/i });
      const starIcon = aiButton.querySelector('svg path[d*="M12 2L"]');
      expect(starIcon).toBeInTheDocument();
    });

    it('shows AI analysis tooltip for premium users', () => {
      render(<JobCard job={mockJob} />);

      const aiButton = screen.getByRole('button', { name: /analisar usando ia/i });
      expect(aiButton).toHaveAttribute('title', 'Analisar vaga usando IA');
    });

    it('triggers AI analysis when clicked as premium user', () => {
      render(<JobCard job={mockJob} />);

      const aiButton = screen.getByRole('button', { name: /analisar usando ia/i });
      fireEvent.click(aiButton);

      expect(console.log).toHaveBeenCalledWith('Analisar vaga com IA:', 'Desenvolvedor Frontend');
    });
  });

  describe('Button layout and styling', () => {
    it('renders both action buttons in correct container', () => {
      authService.getUserRole.mockReturnValue('premium');
      render(<JobCard job={mockJob} />);

      const jobActions = document.querySelector('.job-actions');
      expect(jobActions).toBeInTheDocument();

      const applyButton = screen.getByRole('button', { name: /candidatar-se/i });
      const aiButton = screen.getByRole('button', { name: /analisar usando ia/i });

      expect(jobActions).toContainElement(applyButton);
      expect(jobActions).toContainElement(aiButton);
    });

    it('applies correct CSS classes to AI button based on user role', () => {
      authService.getUserRole.mockReturnValue('free');
      const { rerender } = render(<JobCard job={mockJob} />);

      let aiButton = screen.getByRole('button', { name: /analisar usando ia/i });
      expect(aiButton).toHaveClass('ai-analyze-button', 'disabled');

      authService.getUserRole.mockReturnValue('premium');
      rerender(<JobCard job={mockJob} />);

      aiButton = screen.getByRole('button', { name: /analisar usando ia/i });
      expect(aiButton).toHaveClass('ai-analyze-button');
      expect(aiButton).not.toHaveClass('disabled');
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes for disabled AI button', () => {
      authService.getUserRole.mockReturnValue('free');
      render(<JobCard job={mockJob} />);

      const aiButton = screen.getByRole('button', { name: /analisar usando ia/i });
      expect(aiButton).toHaveAttribute('disabled');
      expect(aiButton).toHaveAttribute('title');
    });

    it('has proper ARIA attributes for enabled AI button', () => {
      authService.getUserRole.mockReturnValue('premium');
      render(<JobCard job={mockJob} />);

      const aiButton = screen.getByRole('button', { name: /analisar usando ia/i });
      expect(aiButton).not.toHaveAttribute('disabled');
      expect(aiButton).toHaveAttribute('title');
    });

    it('maintains apply button accessibility', () => {
      authService.getUserRole.mockReturnValue('free');
      render(<JobCard job={mockJob} />);

      const applyButton = screen.getByRole('button', { name: /candidatar-se/i });
      expect(applyButton).not.toHaveAttribute('disabled');
      expect(applyButton).toBeVisible();
    });
  });

  describe('Badge rendering', () => {
    it('applies correct CSS class for seniority level', () => {
      authService.getUserRole.mockReturnValue('free');
      render(<JobCard job={mockJob} />);

      const seniorityBadge = screen.getByText('Mid');
      expect(seniorityBadge).toHaveClass('seniority-badge', 'mid');
    });

    it('handles different seniority levels', () => {
      const jobs = [
        { ...mockJob, seniorityLevel: 'Junior' },
        { ...mockJob, seniorityLevel: 'Senior' },
        { ...mockJob, seniorityLevel: 'Lead' }
      ];

      authService.getUserRole.mockReturnValue('free');

      jobs.forEach(job => {
        const { unmount } = render(<JobCard job={job} />);
        const badge = screen.getByText(job.seniorityLevel);
        expect(badge).toHaveClass('seniority-badge', job.seniorityLevel.toLowerCase());
        unmount();
      });
    });

    it('renders all badge types correctly', () => {
      authService.getUserRole.mockReturnValue('free');
      render(<JobCard job={mockJob} />);

      expect(screen.getByText('Mid')).toHaveClass('seniority-badge');
      expect(screen.getByText('Tecnologia')).toHaveClass('field-badge');
      expect(screen.getByText('CLT')).toHaveClass('employment-badge');
      expect(screen.getByText('Remoto')).toHaveClass('workplace-badge');
    });

    it('does not render badges when fields are missing', () => {
      const jobWithoutBadges = {
        id: 3,
        title: 'Test Job',
        company: 'Test Company',
        url: 'https://test.com',
        publishedDate: '2024-01-01'
      };

      authService.getUserRole.mockReturnValue('free');
      render(<JobCard job={jobWithoutBadges} />);

      expect(screen.queryByText('Mid')).not.toBeInTheDocument();
      expect(screen.queryByText('Tecnologia')).not.toBeInTheDocument();
      expect(screen.queryByText('CLT')).not.toBeInTheDocument();
      expect(screen.queryByText('Remoto')).not.toBeInTheDocument();
    });
  });

  describe('Edge cases', () => {
    it('handles undefined user role gracefully', () => {
      authService.getUserRole.mockReturnValue(undefined);
      render(<JobCard job={mockJob} />);

      const aiButton = screen.getByRole('button', { name: /analisar usando ia/i });
      expect(aiButton).toBeDisabled();
      expect(aiButton).toHaveClass('disabled');
    });

    it('handles null user role gracefully', () => {
      authService.getUserRole.mockReturnValue(null);
      render(<JobCard job={mockJob} />);

      const aiButton = screen.getByRole('button', { name: /analisar usando ia/i });
      expect(aiButton).toBeDisabled();
      expect(aiButton).toHaveClass('disabled');
    });

    it('handles empty job object gracefully', () => {
      const emptyJob = { title: '', company: '', url: '' };

      authService.getUserRole.mockReturnValue('free');
      expect(() => render(<JobCard job={emptyJob} />)).not.toThrow();
    });
  });
});
