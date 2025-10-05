import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Login from './Login.jsx';
import { authService } from '../../services/auth.js';

vi.mock('../services/auth', () => ({
  authService: {
    login: vi.fn()
  }
}));

vi.mock('./Register', () => ({
  default: ({ onRegisterSuccess, onBackToLogin }) => (
    <div data-testid="register-component">
      <button onClick={onRegisterSuccess}>Register Success</button>
      <button onClick={onBackToLogin}>Back to Login</button>
    </div>
  )
}));

describe('Login', () => {
  const mockOnLoginSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders login form with all required elements', () => {
    render(<Login onLoginSuccess={mockOnLoginSuccess} />);

    expect(screen.getByText('Job Board')).toBeInTheDocument();
    expect(screen.getByText('Faça seu login')).toBeInTheDocument();
    expect(screen.getByLabelText('Usuário:')).toBeInTheDocument();
    expect(screen.getByLabelText('Senha:')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Entrar' })).toBeInTheDocument();
    expect(screen.getByText('Ainda não tem uma conta?')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cadastrar' })).toBeInTheDocument();
  });

  it('updates form fields when user types', () => {
    render(<Login onLoginSuccess={mockOnLoginSuccess} />);

    const usernameInput = screen.getByLabelText('Usuário:');
    const passwordInput = screen.getByLabelText('Senha:');

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'testpass' } });

    expect(usernameInput.value).toBe('testuser');
    expect(passwordInput.value).toBe('testpass');
  });

  it('shows error when submitting with empty fields', async () => {
    render(<Login onLoginSuccess={mockOnLoginSuccess} />);

    const submitButton = screen.getByRole('button', { name: 'Entrar' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Por favor, preencha todos os campos')).toBeInTheDocument();
    });

    expect(authService.login).not.toHaveBeenCalled();
    expect(mockOnLoginSuccess).not.toHaveBeenCalled();
  });

  it('shows error when submitting with only username', async () => {
    render(<Login onLoginSuccess={mockOnLoginSuccess} />);

    const usernameInput = screen.getByLabelText('Usuário:');
    const submitButton = screen.getByRole('button', { name: 'Entrar' });

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Por favor, preencha todos os campos')).toBeInTheDocument();
    });
  });

  it('shows error when submitting with only password', async () => {
    render(<Login onLoginSuccess={mockOnLoginSuccess} />);

    const passwordInput = screen.getByLabelText('Senha:');
    const submitButton = screen.getByRole('button', { name: 'Entrar' });

    fireEvent.change(passwordInput, { target: { value: 'testpass' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Por favor, preencha todos os campos')).toBeInTheDocument();
    });
  });

  it('calls authService and onLoginSuccess when login is successful', async () => {
    authService.login.mockResolvedValue({ success: true });
    render(<Login onLoginSuccess={mockOnLoginSuccess} />);

    const usernameInput = screen.getByLabelText('Usuário:');
    const passwordInput = screen.getByLabelText('Senha:');
    const submitButton = screen.getByRole('button', { name: 'Entrar' });

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'testpass' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(authService.login).toHaveBeenCalledWith('testuser', 'testpass');
      expect(mockOnLoginSuccess).toHaveBeenCalled();
    });
  });

  it('shows error message when login fails', async () => {
    const errorMessage = 'Credenciais inválidas';
    authService.login.mockRejectedValue(new Error(errorMessage));
    render(<Login onLoginSuccess={mockOnLoginSuccess} />);

    const usernameInput = screen.getByLabelText('Usuário:');
    const passwordInput = screen.getByLabelText('Senha:');
    const submitButton = screen.getByRole('button', { name: 'Entrar' });

    fireEvent.change(usernameInput, { target: { value: 'wronguser' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpass' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    expect(mockOnLoginSuccess).not.toHaveBeenCalled();
  });

  it('shows loading state during login attempt', async () => {
    authService.login.mockImplementation(() => new Promise(() => {}));
    render(<Login onLoginSuccess={mockOnLoginSuccess} />);

    const usernameInput = screen.getByLabelText('Usuário:');
    const passwordInput = screen.getByLabelText('Senha:');
    const submitButton = screen.getByRole('button', { name: 'Entrar' });

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'testpass' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Entrando...' })).toBeInTheDocument();
    });

    expect(usernameInput).toBeDisabled();
    expect(passwordInput).toBeDisabled();
    expect(submitButton).toBeDisabled();
  });

  it('toggles password visibility when toggle button is clicked', () => {
    render(<Login onLoginSuccess={mockOnLoginSuccess} />);

    const passwordInput = screen.getByLabelText('Senha:');
    const toggleButton = screen.getByRole('button', { name: '' });

    expect(passwordInput.type).toBe('password');

    fireEvent.click(toggleButton);
    expect(passwordInput.type).toBe('text');

    fireEvent.click(toggleButton);
    expect(passwordInput.type).toBe('password');
  });

  it('clears error message when user starts typing', async () => {
    render(<Login onLoginSuccess={mockOnLoginSuccess} />);

    const submitButton = screen.getByRole('button', { name: 'Entrar' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Por favor, preencha todos os campos')).toBeInTheDocument();
    });

    const usernameInput = screen.getByLabelText('Usuário:');
    fireEvent.change(usernameInput, { target: { value: 'test' } });

    expect(screen.queryByText('Por favor, preencha todos os campos')).not.toBeInTheDocument();
  });

  it('clears success message when user starts typing', async () => {
    render(<Login onLoginSuccess={mockOnLoginSuccess} />);

    fireEvent.click(screen.getByRole('button', { name: 'Cadastrar' }));
    expect(screen.getByTestId('register-component')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Register Success'));

    await waitFor(() => {
      expect(screen.getByText('Cadastro criado com sucesso! Faça login com suas credenciais.')).toBeInTheDocument();
    });

    const usernameInput = screen.getByLabelText('Usuário:');
    fireEvent.change(usernameInput, { target: { value: 'test' } });

    expect(screen.queryByText('Cadastro criado com sucesso! Faça login com suas credenciais.')).not.toBeInTheDocument();
  });

  it('shows register component when create account button is clicked', () => {
    render(<Login onLoginSuccess={mockOnLoginSuccess} />);

    const createAccountButton = screen.getByRole('button', { name: 'Cadastrar' });
    fireEvent.click(createAccountButton);

    expect(screen.getByTestId('register-component')).toBeInTheDocument();
    expect(screen.queryByText('Faça seu login')).not.toBeInTheDocument();
  });

  it('returns to login from register when back button is clicked', () => {
    render(<Login onLoginSuccess={mockOnLoginSuccess} />);

    fireEvent.click(screen.getByRole('button', { name: 'Cadastrar' }));
    expect(screen.getByTestId('register-component')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Back to Login'));

    expect(screen.getByText('Faça seu login')).toBeInTheDocument();
    expect(screen.queryByTestId('register-component')).not.toBeInTheDocument();
  });

  it('shows success message and clears form after successful registration', async () => {
    render(<Login onLoginSuccess={mockOnLoginSuccess} />);

    const usernameInput = screen.getByLabelText('Usuário:');
    const passwordInput = screen.getByLabelText('Senha:');

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'testpass' } });

    fireEvent.click(screen.getByRole('button', { name: 'Cadastrar' }));
    fireEvent.click(screen.getByText('Register Success'));

    await waitFor(() => {
      expect(screen.getByText('Cadastro criado com sucesso! Faça login com suas credenciais.')).toBeInTheDocument();
    });

    expect(screen.getByText('Faça seu login')).toBeInTheDocument();
    expect(screen.getByLabelText('Usuário:').value).toBe('');
    expect(screen.getByLabelText('Senha:').value).toBe('');
  });

  it('clears error when returning from register', async () => {
    authService.login.mockRejectedValue(new Error('Login error'));
    render(<Login onLoginSuccess={mockOnLoginSuccess} />);

    const usernameInput = screen.getByLabelText('Usuário:');
    const passwordInput = screen.getByLabelText('Senha:');
    const submitButton = screen.getByRole('button', { name: 'Entrar' });

    fireEvent.change(usernameInput, { target: { value: 'test' } });
    fireEvent.change(passwordInput, { target: { value: 'test' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Login error')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Cadastrar' }));
    fireEvent.click(screen.getByText('Back to Login'));

    expect(screen.queryByText('Login error')).not.toBeInTheDocument();
  });

  it('disables create account button during loading', async () => {
    authService.login.mockImplementation(() => new Promise(() => {}));
    render(<Login onLoginSuccess={mockOnLoginSuccess} />);

    const usernameInput = screen.getByLabelText('Usuário:');
    const passwordInput = screen.getByLabelText('Senha:');
    const submitButton = screen.getByRole('button', { name: 'Entrar' });
    const createAccountButton = screen.getByRole('button', { name: 'Cadastrar' });

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'testpass' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(createAccountButton).toBeDisabled();
    });
  });

  it('disables password toggle during loading', async () => {
    authService.login.mockImplementation(() => new Promise(() => {}));
    render(<Login onLoginSuccess={mockOnLoginSuccess} />);

    const usernameInput = screen.getByLabelText('Usuário:');
    const passwordInput = screen.getByLabelText('Senha:');
    const submitButton = screen.getByRole('button', { name: 'Entrar' });
    const toggleButton = screen.getByRole('button', { name: '' });

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'testpass' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(toggleButton).toBeDisabled();
    });
  });
});
