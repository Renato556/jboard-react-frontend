import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';
import { authService } from './services/auth';

vi.mock('./services/auth', () => ({
  authService: {
    logout: vi.fn(),
    isAuthenticated: vi.fn(() => true)
  }
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn()
  };
});

vi.mock('./components/Job/JobBoard', () => ({
  default: ({ onLogout }) => (
    <div data-testid="job-board">
      JobBoard Component
      <button onClick={onLogout}>Test Logout</button>
    </div>
  )
}));

vi.mock('./components/User/Login', () => ({
  default: ({ onLoginSuccess }) => (
    <div data-testid="login-component">
      Login Component
      <button onClick={onLoginSuccess}>Test Login Success</button>
    </div>
  )
}));

vi.mock('./components/User/Profile', () => ({
  default: ({ onLogout }) => (
    <div data-testid="profile-component">
      Profile Component
      <button onClick={onLogout}>Test Profile Logout</button>
    </div>
  )
}));

vi.mock('./components/User/ProtectedRoute', () => ({
  default: ({ children }) => (
    <div data-testid="protected-route">{children}</div>
  )
}));

const renderAppWithRouter = (initialEntries = ['/']) => {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <App />
    </MemoryRouter>
  );
};

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('redirects to login when accessing root path', async () => {
    renderAppWithRouter(['/']);

    await waitFor(() => {
      expect(screen.getByTestId('login-component')).toBeInTheDocument();
    });
  });

  it('redirects to login when accessing unknown path', async () => {
    renderAppWithRouter(['/unknown-route']);

    await waitFor(() => {
      expect(screen.getByTestId('login-component')).toBeInTheDocument();
    });
  });

  it('renders login component on login route', async () => {
    renderAppWithRouter(['/login']);

    await waitFor(() => {
      expect(screen.getByTestId('login-component')).toBeInTheDocument();
    });
  });

  it('renders protected home route with job board', async () => {
    renderAppWithRouter(['/home']);

    await waitFor(() => {
      expect(screen.getByTestId('protected-route')).toBeInTheDocument();
      expect(screen.getByTestId('job-board')).toBeInTheDocument();
    });
  });

  it('renders protected profile route with profile component', async () => {
    renderAppWithRouter(['/perfil']);

    await waitFor(() => {
      expect(screen.getByTestId('protected-route')).toBeInTheDocument();
      expect(screen.getByTestId('profile-component')).toBeInTheDocument();
    });
  });

  it('calls authService logout when logout is triggered from home', async () => {
    renderAppWithRouter(['/home']);

    await waitFor(() => {
      expect(screen.getByTestId('job-board')).toBeInTheDocument();
    });

    const logoutButton = screen.getByText('Test Logout');
    fireEvent.click(logoutButton);

    expect(authService.logout).toHaveBeenCalledTimes(1);
  });

  it('calls authService logout when logout is triggered from profile', async () => {
    renderAppWithRouter(['/perfil']);

    await waitFor(() => {
      expect(screen.getByTestId('profile-component')).toBeInTheDocument();
    });

    const profileLogoutButton = screen.getByText('Test Profile Logout');
    fireEvent.click(profileLogoutButton);

    expect(authService.logout).toHaveBeenCalledTimes(1);
  });

  it('passes correct props to Login component', async () => {
    renderAppWithRouter(['/login']);

    await waitFor(() => {
      expect(screen.getByTestId('login-component')).toBeInTheDocument();
      expect(screen.getByText('Test Login Success')).toBeInTheDocument();
    });
  });

  it('passes correct props to JobBoard component', async () => {
    renderAppWithRouter(['/home']);

    await waitFor(() => {
      expect(screen.getByTestId('job-board')).toBeInTheDocument();
      expect(screen.getByText('Test Logout')).toBeInTheDocument();
    });
  });

  it('passes correct props to Profile component', async () => {
    renderAppWithRouter(['/perfil']);

    await waitFor(() => {
      expect(screen.getByTestId('profile-component')).toBeInTheDocument();
      expect(screen.getByText('Test Profile Logout')).toBeInTheDocument();
    });
  });

  it('wraps home route with ProtectedRoute component', async () => {
    renderAppWithRouter(['/home']);

    await waitFor(() => {
      expect(screen.getByTestId('protected-route')).toBeInTheDocument();
      expect(screen.getByTestId('job-board')).toBeInTheDocument();
    });
  });

  it('wraps profile route with ProtectedRoute component', async () => {
    renderAppWithRouter(['/perfil']);

    await waitFor(() => {
      expect(screen.getByTestId('protected-route')).toBeInTheDocument();
      expect(screen.getByTestId('profile-component')).toBeInTheDocument();
    });
  });

  it('does not wrap login route with ProtectedRoute', async () => {
    renderAppWithRouter(['/login']);

    await waitFor(() => {
      expect(screen.getByTestId('login-component')).toBeInTheDocument();
      expect(screen.queryByTestId('protected-route')).not.toBeInTheDocument();
    });
  });

  it('maintains correct route structure for all defined paths', async () => {
    const routes = ['/login', '/home', '/perfil'];

    for (const route of routes) {
      const { unmount } = renderAppWithRouter([route]);

      await waitFor(() => {
        if (route === '/login') {
          expect(screen.getByTestId('login-component')).toBeInTheDocument();
        } else {
          expect(screen.getByTestId('protected-route')).toBeInTheDocument();
        }
      });

      unmount();
    }
  });

  it('handles navigation between different routes correctly', async () => {
    const { unmount } = renderAppWithRouter(['/login']);

    await waitFor(() => {
      expect(screen.getByTestId('login-component')).toBeInTheDocument();
    });

    unmount();

    const { unmount: unmount2 } = renderAppWithRouter(['/home']);

    await waitFor(() => {
      expect(screen.getByTestId('job-board')).toBeInTheDocument();
    });

    unmount2();
  });

  it('renders all routes with correct components', async () => {
    const routeComponentPairs = [
      ['/login', 'login-component'],
      ['/home', 'job-board'],
      ['/perfil', 'profile-component']
    ];

    for (const [route, testId] of routeComponentPairs) {
      const { unmount } = renderAppWithRouter([route]);

      await waitFor(() => {
        expect(screen.getByTestId(testId)).toBeInTheDocument();
      });

      unmount();
    }
  });
});
