import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Profile from './Profile.jsx';
import { authService } from '../../services/auth.js';

vi.mock('../../services/auth', () => ({
  authService: {
    getUserRole: vi.fn(),
    getSkills: vi.fn(),
    addSkill: vi.fn(),
    removeSkill: vi.fn(),
    removeAllSkills: vi.fn(),
    updatePassword: vi.fn(),
    deleteAccount: vi.fn()
  }
}));

describe('Profile - Skills Auto Focus', () => {
  const mockOnLogout = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  it('foca automaticamente no input de habilidades para usuário premium', async () => {
    authService.getUserRole.mockReturnValue('premium');
    authService.getSkills.mockResolvedValue({ skills: [] });

    render(<Profile onLogout={mockOnLogout} />);

    await waitFor(() => {
      expect(authService.getSkills).toHaveBeenCalled();
    });

    const skillInput = screen.getByPlaceholderText('Digite uma nova habilidade');

    expect(skillInput).toBeInTheDocument();
    expect(skillInput).not.toBeDisabled();
  });

  it('não foca no input para usuário free', () => {
    authService.getUserRole.mockReturnValue('free');

    render(<Profile onLogout={mockOnLogout} />);

    const skillInput = screen.queryByPlaceholderText('Digite uma nova habilidade');
    expect(skillInput).not.toBeInTheDocument();
  });

  it('carrega skills automaticamente para usuário premium', async () => {
    const mockSkills = ['React', 'JavaScript', 'TypeScript'];
    authService.getUserRole.mockReturnValue('premium');
    authService.getSkills.mockResolvedValue({ skills: mockSkills });

    render(<Profile onLogout={mockOnLogout} />);

    await waitFor(() => {
      mockSkills.forEach(skill => {
        expect(screen.getByText(skill)).toBeInTheDocument();
      });
    });
  });

  it('não carrega skills para usuário free', () => {
    authService.getUserRole.mockReturnValue('free');

    render(<Profile onLogout={mockOnLogout} />);

    expect(authService.getSkills).not.toHaveBeenCalled();
    expect(screen.getByText(/atualize para o plano/i)).toBeInTheDocument();
  });

  it('adiciona nova habilidade com sucesso', async () => {
    authService.getUserRole.mockReturnValue('premium');
    authService.getSkills
      .mockResolvedValueOnce({ skills: [] })
      .mockResolvedValueOnce({ skills: ['React'] });
    authService.addSkill.mockResolvedValue({});

    render(<Profile onLogout={mockOnLogout} />);

    const skillInput = await screen.findByPlaceholderText('Digite uma nova habilidade');
    const addButton = screen.getByText('Adicionar');

    fireEvent.change(skillInput, { target: { value: 'React' } });
    fireEvent.click(addButton);

    expect(authService.addSkill).toHaveBeenCalledWith('React');

    await waitFor(() => {
      expect(screen.getByText('Habilidade cadastrada com sucesso!')).toBeInTheDocument();
    });
  });

  it('previne adicionar habilidade duplicada', async () => {
    authService.getUserRole.mockReturnValue('premium');
    authService.getSkills.mockResolvedValue({ skills: ['react'] });

    render(<Profile onLogout={mockOnLogout} />);

    const skillInput = await screen.findByPlaceholderText('Digite uma nova habilidade');
    const addButton = screen.getByText('Adicionar');

    fireEvent.change(skillInput, { target: { value: 'React' } });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('Esta habilidade já foi adicionada')).toBeInTheDocument();
    });

    expect(authService.addSkill).not.toHaveBeenCalled();
  });

  it('remove habilidade com sucesso', async () => {
    authService.getUserRole.mockReturnValue('premium');
    authService.getSkills
      .mockResolvedValueOnce({ skills: ['React', 'JavaScript'] })
      .mockResolvedValueOnce({ skills: ['JavaScript'] });
    authService.removeSkill.mockResolvedValue({});

    render(<Profile onLogout={mockOnLogout} />);

    await waitFor(() => {
      expect(screen.getByText('React')).toBeInTheDocument();
    });

    const skillItems = screen.getAllByRole('button').filter(btn =>
      btn.closest('.skill-item')?.textContent.includes('React')
    );
    const removeButton = skillItems.find(btn => btn.querySelector('svg'));

    fireEvent.click(removeButton);

    expect(authService.removeSkill).toHaveBeenCalledWith('React');

    await waitFor(() => {
      expect(screen.getByText('Skill removida com sucesso!')).toBeInTheDocument();
    });
  });

  it('remove todas as habilidades com confirmação', async () => {
    authService.getUserRole.mockReturnValue('premium');
    authService.getSkills
      .mockResolvedValueOnce({ skills: ['React', 'JavaScript'] })
      .mockResolvedValueOnce({ skills: [] });
    authService.removeAllSkills.mockResolvedValue({});

    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

    render(<Profile onLogout={mockOnLogout} />);

    const clearButton = await screen.findByText('Limpar habilidades');
    fireEvent.click(clearButton);

    expect(confirmSpy).toHaveBeenCalledWith('Tem certeza que deseja remover todas as skills?');
    expect(authService.removeAllSkills).toHaveBeenCalled();

    await waitFor(() => {
      expect(screen.getByText('Todas as skills foram removidas!')).toBeInTheDocument();
    });

    confirmSpy.mockRestore();
  });

  it('cancela remoção de todas as habilidades', async () => {
    authService.getUserRole.mockReturnValue('premium');
    authService.getSkills.mockResolvedValue({ skills: ['React', 'JavaScript'] });

    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);

    render(<Profile onLogout={mockOnLogout} />);

    const clearButton = await screen.findByText('Limpar habilidades');
    fireEvent.click(clearButton);

    expect(confirmSpy).toHaveBeenCalled();
    expect(authService.removeAllSkills).not.toHaveBeenCalled();

    confirmSpy.mockRestore();
  });

  it('exibe loading skeleton durante carregamento de skills', () => {
    authService.getUserRole.mockReturnValue('premium');
    authService.getSkills.mockReturnValue(new Promise(() => {}));

    render(<Profile onLogout={mockOnLogout} />);

    expect(document.querySelector('.loading-skeleton')).toBeInTheDocument();
    expect(document.querySelectorAll('.skeleton-item')).toHaveLength(3);
  });

  it('exibe mensagem quando não há habilidades', async () => {
    authService.getUserRole.mockReturnValue('premium');
    authService.getSkills.mockResolvedValue({ skills: [] });

    render(<Profile onLogout={mockOnLogout} />);

    await waitFor(() => {
      expect(screen.getByText(/nenhuma habilidade encontrada/i)).toBeInTheDocument();
    });
  });

  it('trata erro ao carregar skills', async () => {
    authService.getUserRole.mockReturnValue('premium');
    authService.getSkills.mockRejectedValue(new Error('Erro ao carregar'));

    render(<Profile onLogout={mockOnLogout} />);

    await waitFor(() => {
      expect(screen.getByText('Erro ao carregar')).toBeInTheDocument();
    });
  });

  it('trata erro ao adicionar skill', async () => {
    authService.getUserRole.mockReturnValue('premium');
    authService.getSkills.mockResolvedValue({ skills: [] });
    authService.addSkill.mockRejectedValue(new Error('Erro ao adicionar'));

    render(<Profile onLogout={mockOnLogout} />);

    const skillInput = await screen.findByPlaceholderText('Digite uma nova habilidade');
    const addButton = screen.getByText('Adicionar');

    fireEvent.change(skillInput, { target: { value: 'React' } });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('Erro ao adicionar')).toBeInTheDocument();
    });
  });

  it('limpa input após adicionar habilidade com sucesso', async () => {
    authService.getUserRole.mockReturnValue('premium');
    authService.getSkills
      .mockResolvedValueOnce({ skills: [] })
      .mockResolvedValueOnce({ skills: ['React'] });
    authService.addSkill.mockResolvedValue({});

    render(<Profile onLogout={mockOnLogout} />);

    const skillInput = await screen.findByPlaceholderText('Digite uma nova habilidade');
    const addButton = screen.getByText('Adicionar');

    fireEvent.change(skillInput, { target: { value: 'React' } });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(skillInput.value).toBe('');
    });
  });

  it('valida input vazio ao tentar adicionar skill', async () => {
    authService.getUserRole.mockReturnValue('premium');
    authService.getSkills.mockResolvedValue({ skills: [] });

    render(<Profile onLogout={mockOnLogout} />);

    const addButton = await screen.findByText('Adicionar');
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('Por favor, digite uma habilidade')).toBeInTheDocument();
    });

    expect(authService.addSkill).not.toHaveBeenCalled();
  });

  it('limpa mensagens de erro/sucesso ao digitar nova skill', async () => {
    authService.getUserRole.mockReturnValue('premium');
    authService.getSkills.mockResolvedValue({ skills: [] });

    render(<Profile onLogout={mockOnLogout} />);

    const addButton = await screen.findByText('Adicionar');
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('Por favor, digite uma habilidade')).toBeInTheDocument();
    });

    const skillInput = screen.getByPlaceholderText('Digite uma nova habilidade');
    fireEvent.change(skillInput, { target: { value: 'React' } });

    expect(skillInput.value).toBe('React');
    
    expect(screen.getByText('Por favor, digite uma habilidade')).toBeInTheDocument();
    expect(skillInput.value).toBe('React');
  });
});
