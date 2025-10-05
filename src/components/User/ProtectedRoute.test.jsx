import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute.jsx';
import { authService } from '../../services/auth.js';

vi.mock('../../services/auth', () => ({
  authService: {
    isAuthenticated: vi.fn()
  }
}));

const MockProtectedContent = () => <div>Protected Content</div>;

const renderProtectedRoute = (isAuthenticated = true, children = <MockProtectedContent />) => {
  authService.isAuthenticated.mockReturnValue(isAuthenticated);

  return render(
    <MemoryRouter initialEntries={['/protected']}>
      <ProtectedRoute>{children}</ProtectedRoute>
    </MemoryRouter>
  );
};

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders children when user is authenticated', () => {
    renderProtectedRoute(true);

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('redirects to login when user is not authenticated', () => {
    renderProtectedRoute(false);

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('calls authService.isAuthenticated to check authentication status', () => {
    renderProtectedRoute(true);

    expect(authService.isAuthenticated).toHaveBeenCalledTimes(1);
  });

  it('renders multiple children when authenticated', () => {
    const multipleChildren = (
      <>
        <div>First Child</div>
        <div>Second Child</div>
      </>
    );

    renderProtectedRoute(true, multipleChildren);

    expect(screen.getByText('First Child')).toBeInTheDocument();
    expect(screen.getByText('Second Child')).toBeInTheDocument();
  });

  it('renders null children when authenticated', () => {
    renderProtectedRoute(true, null);

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('renders undefined children when authenticated', () => {
    authService.isAuthenticated.mockReturnValue(true);

    render(
      <MemoryRouter initialEntries={['/protected']}>
        <ProtectedRoute>{undefined}</ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('redirects when authService returns falsy values', () => {
    const falsyValues = [false, null, undefined, 0, '', NaN];

    falsyValues.forEach(falsyValue => {
      authService.isAuthenticated.mockReturnValue(falsyValue);

      const { unmount } = render(
        <MemoryRouter initialEntries={['/protected']}>
          <ProtectedRoute>
            <MockProtectedContent />
          </ProtectedRoute>
        </MemoryRouter>
      );

      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
      unmount();
    });
  });

  it('renders children when authService returns truthy values', () => {
    const truthyValues = [true, 1, 'token', {}, []];

    truthyValues.forEach(truthyValue => {
      authService.isAuthenticated.mockReturnValue(truthyValue);

      const { unmount } = render(
        <MemoryRouter initialEntries={['/protected']}>
          <ProtectedRoute>
            <MockProtectedContent />
          </ProtectedRoute>
        </MemoryRouter>
      );

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
      unmount();
    });
  });

  it('works with functional children', () => {
    const functionalChild = () => <div>Functional Child</div>;

    renderProtectedRoute(true, functionalChild());

    expect(screen.getByText('Functional Child')).toBeInTheDocument();
  });

  it('handles complex nested children when authenticated', () => {
    const complexChildren = (
      <div>
        <h1>Title</h1>
        <section>
          <p>Content paragraph</p>
          <button>Action Button</button>
        </section>
      </div>
    );

    renderProtectedRoute(true, complexChildren);

    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Content paragraph')).toBeInTheDocument();
    expect(screen.getByText('Action Button')).toBeInTheDocument();
  });

  it('does not render children when not authenticated regardless of child type', () => {
    const complexChildren = (
      <div>
        <h1>Should Not Render</h1>
        <button>Should Not Render</button>
      </div>
    );

    renderProtectedRoute(false, complexChildren);

    expect(screen.queryByText('Should Not Render')).not.toBeInTheDocument();
  });
});
