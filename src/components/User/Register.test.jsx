import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Register from './Register.jsx';
import { authService } from '../../services/auth.js';

vi.mock('../../services/auth', () => ({
  authService: {
    register: vi.fn()
  }
}));

describe('Register', () => {
  const mockOnRegisterSuccess = vi.fn();
  const mockOnBackToLogin = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders register form with all required elements', () => {
    render(<Register onRegisterSuccess={mockOnRegisterSuccess} onBackToLogin={mockOnBackToLogin} />);

    expect(screen.getByText('Job Board')).toBeInTheDocument();
    expect(screen.getByText('Criar nova conta')).toBeInTheDocument();
    expect(screen.getByLabelText('Usuário:')).toBeInTheDocument();
    expect(screen.getByLabelText('Senha:')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Criar' })).toBeInTheDocument();
    expect(screen.getByText('Já tem uma conta?')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Voltar ao Login' })).toBeInTheDocument();
  });

  it('updates form fields when user types', () => {
    render(<Register onRegisterSuccess={mockOnRegisterSuccess} onBackToLogin={mockOnBackToLogin} />);

    const usernameInput = screen.getByLabelText('Usuário:');
    const passwordInput = screen.getByLabelText('Senha:');

    fireEvent.change(usernameInput, { target: { value: 'newuser' } });
    fireEvent.change(passwordInput, { target: { value: 'newpass' } });

    expect(usernameInput.value).toBe('newuser');
    expect(passwordInput.value).toBe('newpass');
  });

  it('toggles password visibility when toggle button is clicked', () => {
    render(<Register onRegisterSuccess={mockOnRegisterSuccess} onBackToLogin={mockOnBackToLogin} />);

    const passwordInput = screen.getByLabelText('Senha:');
    const toggleButton = screen.getByRole('button', { name: '' });

    expect(passwordInput.type).toBe('password');

    fireEvent.click(toggleButton);
    expect(passwordInput.type).toBe('text');

    fireEvent.click(toggleButton);
    expect(passwordInput.type).toBe('password');
  });

  it('shows error when submitting with empty fields', async () => {
    render(<Register onRegisterSuccess={mockOnRegisterSuccess} onBackToLogin={mockOnBackToLogin} />);

    const submitButton = screen.getByRole('button', { name: 'Criar' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Por favor, preencha todos os campos')).toBeInTheDocument();
    });

    expect(authService.register).not.toHaveBeenCalled();
    expect(mockOnRegisterSuccess).not.toHaveBeenCalled();
  });

  it('shows error when submitting with only username', async () => {
    render(<Register onRegisterSuccess={mockOnRegisterSuccess} onBackToLogin={mockOnBackToLogin} />);

    const usernameInput = screen.getByLabelText('Usuário:');
    const submitButton = screen.getByRole('button', { name: 'Criar' });

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Por favor, preencha todos os campos')).toBeInTheDocument();
    });

    expect(authService.register).not.toHaveBeenCalled();
  });

  it('shows error when submitting with only password', async () => {
    render(<Register onRegisterSuccess={mockOnRegisterSuccess} onBackToLogin={mockOnBackToLogin} />);

    const passwordInput = screen.getByLabelText('Senha:');
    const submitButton = screen.getByRole('button', { name: 'Criar' });

    fireEvent.change(passwordInput, { target: { value: 'testpass' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Por favor, preencha todos os campos')).toBeInTheDocument();
    });

    expect(authService.register).not.toHaveBeenCalled();
  });

  it('accepts password with exactly 3 characters', async () => {
    authService.register.mockResolvedValue();
    render(<Register onRegisterSuccess={mockOnRegisterSuccess} onBackToLogin={mockOnBackToLogin} />);

    const usernameInput = screen.getByLabelText('Usuário:');
    const passwordInput = screen.getByLabelText('Senha:');
    const submitButton = screen.getByRole('button', { name: 'Criar' });

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'abc' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(authService.register).toHaveBeenCalledWith('testuser', 'abc');
      expect(mockOnRegisterSuccess).toHaveBeenCalled();
    });
  });

  it('successfully registers user and calls onRegisterSuccess', async () => {
    authService.register.mockResolvedValue();
    render(<Register onRegisterSuccess={mockOnRegisterSuccess} onBackToLogin={mockOnBackToLogin} />);

    const usernameInput = screen.getByLabelText('Usuário:');
    const passwordInput = screen.getByLabelText('Senha:');
    const submitButton = screen.getByRole('button', { name: 'Criar' });

    fireEvent.change(usernameInput, { target: { value: 'newuser' } });
    fireEvent.change(passwordInput, { target: { value: 'newpass123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(authService.register).toHaveBeenCalledWith('newuser', 'newpass123');
      expect(mockOnRegisterSuccess).toHaveBeenCalled();
    });
  });

  it('shows error message when registration fails', async () => {
    const errorMessage = 'Um usuário já existe com esse nome';
    authService.register.mockRejectedValue(new Error(errorMessage));
    render(<Register onRegisterSuccess={mockOnRegisterSuccess} onBackToLogin={mockOnBackToLogin} />);

    const usernameInput = screen.getByLabelText('Usuário:');
    const passwordInput = screen.getByLabelText('Senha:');
    const submitButton = screen.getByRole('button', { name: 'Criar' });

    fireEvent.change(usernameInput, { target: { value: 'existinguser' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    expect(mockOnRegisterSuccess).not.toHaveBeenCalled();
  });

  it('shows loading state during registration attempt', async () => {
    authService.register.mockImplementation(() => new Promise(() => {}));
    render(<Register onRegisterSuccess={mockOnRegisterSuccess} onBackToLogin={mockOnBackToLogin} />);

    const usernameInput = screen.getByLabelText('Usuário:');
    const passwordInput = screen.getByLabelText('Senha:');
    const submitButton = screen.getByRole('button', { name: 'Criar' });

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'testpass' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Criando...' })).toBeInTheDocument();
    });

    expect(usernameInput).toBeDisabled();
    expect(passwordInput).toBeDisabled();
    expect(submitButton).toBeDisabled();
  });

  it('calls onBackToLogin when back button is clicked', () => {
    render(<Register onRegisterSuccess={mockOnRegisterSuccess} onBackToLogin={mockOnBackToLogin} />);

    const backButton = screen.getByRole('button', { name: 'Voltar ao Login' });
    fireEvent.click(backButton);

    expect(mockOnBackToLogin).toHaveBeenCalledTimes(1);
  });

  it('clears error message when user starts typing in username field', async () => {
    render(<Register onRegisterSuccess={mockOnRegisterSuccess} onBackToLogin={mockOnBackToLogin} />);

    const submitButton = screen.getByRole('button', { name: 'Criar' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Por favor, preencha todos os campos')).toBeInTheDocument();
    });

    const usernameInput = screen.getByLabelText('Usuário:');
    fireEvent.change(usernameInput, { target: { value: 'test' } });

    expect(screen.queryByText('Por favor, preencha todos os campos')).not.toBeInTheDocument();
  });

  it('clears error message when user starts typing in password field', async () => {
    render(<Register onRegisterSuccess={mockOnRegisterSuccess} onBackToLogin={mockOnBackToLogin} />);

    const submitButton = screen.getByRole('button', { name: 'Criar' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Por favor, preencha todos os campos')).toBeInTheDocument();
    });

    const passwordInput = screen.getByLabelText('Senha:');
    fireEvent.change(passwordInput, { target: { value: 'test' } });

    expect(screen.queryByText('Por favor, preencha todos os campos')).not.toBeInTheDocument();
  });

  it('disables back button during loading', async () => {
    authService.register.mockImplementation(() => new Promise(() => {}));
    render(<Register onRegisterSuccess={mockOnRegisterSuccess} onBackToLogin={mockOnBackToLogin} />);

    const usernameInput = screen.getByLabelText('Usuário:');
    const passwordInput = screen.getByLabelText('Senha:');
    const submitButton = screen.getByRole('button', { name: 'Criar' });
    const backButton = screen.getByRole('button', { name: 'Voltar ao Login' });

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'testpass' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(backButton).toBeDisabled();
    });
  });

  it('disables password toggle during loading', async () => {
    authService.register.mockImplementation(() => new Promise(() => {}));
    render(<Register onRegisterSuccess={mockOnRegisterSuccess} onBackToLogin={mockOnBackToLogin} />);

    const usernameInput = screen.getByLabelText('Usuário:');
    const passwordInput = screen.getByLabelText('Senha:');
    const submitButton = screen.getByRole('button', { name: 'Criar' });
    const toggleButton = screen.getByRole('button', { name: '' });

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'testpass' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(toggleButton).toBeDisabled();
    });
  });

  it('handles empty string password correctly', async () => {
    render(<Register onRegisterSuccess={mockOnRegisterSuccess} onBackToLogin={mockOnBackToLogin} />);

    const usernameInput = screen.getByLabelText('Usuário:');
    const passwordInput = screen.getByLabelText('Senha:');
    const submitButton = screen.getByRole('button', { name: 'Criar' });

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: '' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Por favor, preencha todos os campos')).toBeInTheDocument();
    });

    expect(authService.register).not.toHaveBeenCalled();
  });

  it('handles empty string username correctly', async () => {
    render(<Register onRegisterSuccess={mockOnRegisterSuccess} onBackToLogin={mockOnBackToLogin} />);

    const usernameInput = screen.getByLabelText('Usuário:');
    const passwordInput = screen.getByLabelText('Senha:');
    const submitButton = screen.getByRole('button', { name: 'Criar' });

    fireEvent.change(usernameInput, { target: { value: '' } });
    fireEvent.change(passwordInput, { target: { value: 'testpass' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Por favor, preencha todos os campos')).toBeInTheDocument();
    });

    expect(authService.register).not.toHaveBeenCalled();
  });

  it('preserves form data after failed registration attempt', async () => {
    authService.register.mockRejectedValue(new Error('Registration failed'));
    render(<Register onRegisterSuccess={mockOnRegisterSuccess} onBackToLogin={mockOnBackToLogin} />);

    const usernameInput = screen.getByLabelText('Usuário:');
    const passwordInput = screen.getByLabelText('Senha:');
    const submitButton = screen.getByRole('button', { name: 'Criar' });

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'testpass' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Registration failed')).toBeInTheDocument();
    });

    expect(usernameInput.value).toBe('testuser');
    expect(passwordInput.value).toBe('testpass');
  });
});
