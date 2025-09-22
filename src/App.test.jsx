import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

vi.mock('./components/JobBoard', () => ({
  default: () => <div data-testid="job-board">JobBoard Component</div>
}));

describe('App', () => {
  it('renders the JobBoard component', () => {
    render(<App />);

    expect(screen.getByTestId('job-board')).toBeInTheDocument();
  });
});
