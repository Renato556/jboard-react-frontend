import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Profile from './Profile.jsx';
import { authService } from '../../services/auth.js';

vi.mock('../services/auth', () => ({
  authService: {
    updatePassword: vi.fn(),
    deleteAccount: vi.fn()
  }
}));

describe('Profile', () => {
  const mockOnLogout = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(window, 'history', {
      value: { back: vi.fn() },
      writable: true
    });
  });

  it('renders profile header with title and back button', () => {
    render(<Profile onLogout={mockOnLogout} />);

    expect(screen.getByText('Meu Perfil')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /voltar/i })).toBeInTheDocument();
    expect(screen.getByText('Segurança da Conta')).toBeInTheDocument();
  });

  it('renders action buttons for password change and account deletion', () => {
    render(<Profile onLogout={mockOnLogout} />);

    expect(screen.getByRole('button', { name: /alterar senha/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /deletar conta/i })).toBeInTheDocument();
  });

  it('navigates back when back button is clicked', () => {
    render(<Profile onLogout={mockOnLogout} />);

    const backButton = screen.getByRole('button', { name: /voltar/i });
    fireEvent.click(backButton);

    expect(window.history.back).toHaveBeenCalled();
  });

  it('shows password change form when alterar senha button is clicked', () => {
    render(<Profile onLogout={mockOnLogout} />);

    const changePasswordButton = screen.getByRole('button', { name: /alterar senha/i });
    fireEvent.click(changePasswordButton);

    expect(screen.getByRole('heading', { name: /alterar senha/i })).toBeInTheDocument();
    expect(screen.getByLabelText('Senha Atual:')).toBeInTheDocument();
    expect(screen.getByLabelText('Nova Senha:')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirmar Nova Senha:')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancelar/i })).toBeInTheDocument();
  });

  it('hides password change form when cancelar button is clicked', () => {
    render(<Profile onLogout={mockOnLogout} />);

    fireEvent.click(screen.getByRole('button', { name: /alterar senha/i }));
    expect(screen.getByRole('heading', { name: /alterar senha/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /cancelar/i }));
    expect(screen.queryByRole('heading', { name: /alterar senha/i })).not.toBeInTheDocument();
  });

  it('shows delete confirmation when deletar conta button is clicked', () => {
    render(<Profile onLogout={mockOnLogout} />);

    const deleteButton = screen.getByRole('button', { name: /deletar conta/i });
    fireEvent.click(deleteButton);

    expect(screen.getByText('Deletar Conta')).toBeInTheDocument();
    expect(screen.getByText('Atenção!')).toBeInTheDocument();
    expect(screen.getByText('Esta ação é irreversível. Todos os seus dados serão permanentemente removidos.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sim, deletar minha conta/i })).toBeInTheDocument();
  });

  it('hides delete confirmation when cancelar button is clicked', () => {
    render(<Profile onLogout={mockOnLogout} />);

    fireEvent.click(screen.getByRole('button', { name: /deletar conta/i }));
    expect(screen.getByRole('heading', { name: /deletar conta/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /cancelar/i }));
    expect(screen.queryByRole('heading', { name: /deletar conta/i })).not.toBeInTheDocument();
  });

  it('updates password form fields when user types', () => {
    render(<Profile onLogout={mockOnLogout} />);

    fireEvent.click(screen.getByRole('button', { name: /alterar senha/i }));

    const oldPasswordInput = screen.getByLabelText('Senha Atual:');
    const newPasswordInput = screen.getByLabelText('Nova Senha:');
    const confirmPasswordInput = screen.getByLabelText('Confirmar Nova Senha:');

    fireEvent.change(oldPasswordInput, { target: { value: 'oldpass' } });
    fireEvent.change(newPasswordInput, { target: { value: 'newpass' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'newpass' } });

    expect(oldPasswordInput.value).toBe('oldpass');
    expect(newPasswordInput.value).toBe('newpass');
    expect(confirmPasswordInput.value).toBe('newpass');
  });

  it('toggles old password visibility when toggle button is clicked', () => {
    render(<Profile onLogout={mockOnLogout} />);

    fireEvent.click(screen.getByRole('button', { name: /alterar senha/i }));

    const oldPasswordInput = screen.getByLabelText('Senha Atual:');
    const toggleButtons = screen.getAllByRole('button', { name: '' });
    const oldPasswordToggle = toggleButtons[0];

    expect(oldPasswordInput.type).toBe('password');

    fireEvent.click(oldPasswordToggle);
    expect(oldPasswordInput.type).toBe('text');

    fireEvent.click(oldPasswordToggle);
    expect(oldPasswordInput.type).toBe('password');
  });

  it('toggles new password visibility when toggle button is clicked', () => {
    render(<Profile onLogout={mockOnLogout} />);

    fireEvent.click(screen.getByRole('button', { name: /alterar senha/i }));

    const newPasswordInput = screen.getByLabelText('Nova Senha:');
    const toggleButtons = screen.getAllByRole('button', { name: '' });
    const newPasswordToggle = toggleButtons[1];

    expect(newPasswordInput.type).toBe('password');

    fireEvent.click(newPasswordToggle);
    expect(newPasswordInput.type).toBe('text');

    fireEvent.click(newPasswordToggle);
    expect(newPasswordInput.type).toBe('password');
  });

  it('shows error when submitting password change with empty fields', async () => {
    render(<Profile onLogout={mockOnLogout} />);

    fireEvent.click(screen.getByRole('button', { name: /alterar senha/i }));
    fireEvent.click(screen.getByRole('button', { name: /alterar senha$/i }));

    await waitFor(() => {
      expect(screen.getByText('Por favor, preencha todos os campos')).toBeInTheDocument();
    });

    expect(authService.updatePassword).not.toHaveBeenCalled();
  });

  it('shows error when new password and confirmation do not match', async () => {
    render(<Profile onLogout={mockOnLogout} />);

    fireEvent.click(screen.getByRole('button', { name: /alterar senha/i }));

    fireEvent.change(screen.getByLabelText('Senha Atual:'), { target: { value: 'oldpass' } });
    fireEvent.change(screen.getByLabelText('Nova Senha:'), { target: { value: 'newpass' } });
    fireEvent.change(screen.getByLabelText('Confirmar Nova Senha:'), { target: { value: 'different' } });

    fireEvent.click(screen.getByRole('button', { name: /alterar senha$/i }));

    await waitFor(() => {
      expect(screen.getByText('A nova senha e a confirmação não coincidem')).toBeInTheDocument();
    });

    expect(authService.updatePassword).not.toHaveBeenCalled();
  });

  it('shows error when new password is same as old password', async () => {
    render(<Profile onLogout={mockOnLogout} />);

    fireEvent.click(screen.getByRole('button', { name: /alterar senha/i }));

    fireEvent.change(screen.getByLabelText('Senha Atual:'), { target: { value: 'samepass' } });
    fireEvent.change(screen.getByLabelText('Nova Senha:'), { target: { value: 'samepass' } });
    fireEvent.change(screen.getByLabelText('Confirmar Nova Senha:'), { target: { value: 'samepass' } });

    fireEvent.click(screen.getByRole('button', { name: /alterar senha$/i }));

    await waitFor(() => {
      expect(screen.getByText('A nova senha deve ser diferente da senha atual')).toBeInTheDocument();
    });

    expect(authService.updatePassword).not.toHaveBeenCalled();
  });

  it('successfully updates password and shows success message', async () => {
    authService.updatePassword.mockResolvedValue();
    render(<Profile onLogout={mockOnLogout} />);

    fireEvent.click(screen.getByRole('button', { name: /alterar senha/i }));

    fireEvent.change(screen.getByLabelText('Senha Atual:'), { target: { value: 'oldpass' } });
    fireEvent.change(screen.getByLabelText('Nova Senha:'), { target: { value: 'newpass' } });
    fireEvent.change(screen.getByLabelText('Confirmar Nova Senha:'), { target: { value: 'newpass' } });

    fireEvent.click(screen.getByRole('button', { name: /alterar senha$/i }));

    await waitFor(() => {
      expect(authService.updatePassword).toHaveBeenCalledWith('oldpass', 'newpass');
      expect(screen.getByText('Senha alterada com sucesso!')).toBeInTheDocument();
    });

    expect(screen.queryByRole('heading', { name: /alterar senha/i })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /alterar senha/i }));
    expect(screen.getByLabelText('Senha Atual:').value).toBe('');
    expect(screen.getByLabelText('Nova Senha:').value).toBe('');
    expect(screen.getByLabelText('Confirmar Nova Senha:').value).toBe('');
  });

  it('shows error message when password update fails', async () => {
    const errorMessage = 'Senha atual incorreta';
    authService.updatePassword.mockRejectedValue(new Error(errorMessage));
    render(<Profile onLogout={mockOnLogout} />);

    fireEvent.click(screen.getByRole('button', { name: /alterar senha/i }));

    fireEvent.change(screen.getByLabelText('Senha Atual:'), { target: { value: 'wrongpass' } });
    fireEvent.change(screen.getByLabelText('Nova Senha:'), { target: { value: 'newpass' } });
    fireEvent.change(screen.getByLabelText('Confirmar Nova Senha:'), { target: { value: 'newpass' } });

    fireEvent.click(screen.getByRole('button', { name: /alterar senha$/i }));

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('shows loading state during password update', async () => {
    authService.updatePassword.mockImplementation(() => new Promise(() => {}));
    render(<Profile onLogout={mockOnLogout} />);

    fireEvent.click(screen.getByRole('button', { name: /alterar senha/i }));

    fireEvent.change(screen.getByLabelText('Senha Atual:'), { target: { value: 'oldpass' } });
    fireEvent.change(screen.getByLabelText('Nova Senha:'), { target: { value: 'newpass' } });
    fireEvent.change(screen.getByLabelText('Confirmar Nova Senha:'), { target: { value: 'newpass' } });

    fireEvent.click(screen.getByRole('button', { name: /alterar senha$/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /alterando\.\.\./i })).toBeInTheDocument();
    });

    expect(screen.getByLabelText('Senha Atual:')).toBeDisabled();
    expect(screen.getByLabelText('Nova Senha:')).toBeDisabled();
    expect(screen.getByLabelText('Confirmar Nova Senha:')).toBeDisabled();
  });

  it('successfully deletes account and calls onLogout', async () => {
    authService.deleteAccount.mockResolvedValue();
    render(<Profile onLogout={mockOnLogout} />);

    fireEvent.click(screen.getByRole('button', { name: /deletar conta/i }));
    fireEvent.click(screen.getByRole('button', { name: /sim, deletar minha conta/i }));

    await waitFor(() => {
      expect(authService.deleteAccount).toHaveBeenCalled();
      expect(mockOnLogout).toHaveBeenCalled();
    });
  });

  it('shows error message when account deletion fails', async () => {
    const errorMessage = 'Erro no servidor';
    authService.deleteAccount.mockRejectedValue(new Error(errorMessage));
    render(<Profile onLogout={mockOnLogout} />);

    fireEvent.click(screen.getByRole('button', { name: /deletar conta/i }));
    fireEvent.click(screen.getByRole('button', { name: /sim, deletar minha conta/i }));

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    expect(mockOnLogout).not.toHaveBeenCalled();
    expect(screen.queryByRole('heading', { name: /deletar conta/i })).not.toBeInTheDocument();
  });

  it('shows loading state during account deletion', async () => {
    authService.deleteAccount.mockImplementation(() => new Promise(() => {}));
    render(<Profile onLogout={mockOnLogout} />);

    fireEvent.click(screen.getByRole('button', { name: /deletar conta/i }));
    fireEvent.click(screen.getByRole('button', { name: /sim, deletar minha conta/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /deletando\.\.\./i })).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: /deletando\.\.\./i })).toBeDisabled();
  });

  it('clears messages when switching between sections', () => {
    render(<Profile onLogout={mockOnLogout} />);

    fireEvent.click(screen.getByRole('button', { name: /alterar senha/i }));
    fireEvent.click(screen.getByRole('button', { name: /alterar senha$/i }));

    expect(screen.getByText('Por favor, preencha todos os campos')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /deletar conta/i }));

    expect(screen.queryByText('Por favor, preencha todos os campos')).not.toBeInTheDocument();
  });

  it('clears error and success messages when typing in password fields', async () => {
    render(<Profile onLogout={mockOnLogout} />);

    fireEvent.click(screen.getByRole('button', { name: /alterar senha/i }));
    fireEvent.click(screen.getByRole('button', { name: /alterar senha$/i }));

    await waitFor(() => {
      expect(screen.getByText('Por favor, preencha todos os campos')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText('Senha Atual:'), { target: { value: 'test' } });

    expect(screen.queryByText('Por favor, preencha todos os campos')).not.toBeInTheDocument();
  });

  it('disables action buttons during loading', async () => {
    authService.updatePassword.mockImplementation(() => new Promise(() => {}));
    render(<Profile onLogout={mockOnLogout} />);

    fireEvent.click(screen.getByRole('button', { name: /alterar senha/i }));

    fireEvent.change(screen.getByLabelText('Senha Atual:'), { target: { value: 'oldpass' } });
    fireEvent.change(screen.getByLabelText('Nova Senha:'), { target: { value: 'newpass' } });
    fireEvent.change(screen.getByLabelText('Confirmar Nova Senha:'), { target: { value: 'newpass' } });

    fireEvent.click(screen.getByRole('button', { name: /alterar senha$/i }));

    await waitFor(() => {
      const actionButtons = screen.getAllByRole('button').filter(btn =>
        btn.textContent.includes('Alterar Senha') || btn.textContent.includes('Deletar Conta')
      );
      actionButtons.forEach(button => {
        expect(button).toBeDisabled();
      });
    });
  });

  it('disables password toggle buttons during loading', async () => {
    authService.updatePassword.mockImplementation(() => new Promise(() => {}));
    render(<Profile onLogout={mockOnLogout} />);

    fireEvent.click(screen.getByRole('button', { name: /alterar senha/i }));

    fireEvent.change(screen.getByLabelText('Senha Atual:'), { target: { value: 'oldpass' } });
    fireEvent.change(screen.getByLabelText('Nova Senha:'), { target: { value: 'newpass' } });
    fireEvent.change(screen.getByLabelText('Confirmar Nova Senha:'), { target: { value: 'newpass' } });

    const toggleButtons = screen.getAllByRole('button', { name: '' });

    fireEvent.click(screen.getByRole('button', { name: /alterar senha$/i }));

    await waitFor(() => {
      toggleButtons.forEach(button => {
        expect(button).toBeDisabled();
      });
    });
  });
});
