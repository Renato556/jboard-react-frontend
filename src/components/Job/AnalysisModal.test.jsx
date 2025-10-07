import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AnalysisModal from './AnalysisModal.jsx';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

vi.mock('react-dom', async () => {
  const actual = await vi.importActual('react-dom');
  return {
    ...actual,
    createPortal: (children) => children
  };
});

const RouterWrapper = ({ children }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe('AnalysisModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    analysis: null,
    error: null,
    isLoading: false
  };

  beforeEach(() => {
    vi.clearAllMocks();
    document.body.innerHTML = '';
    document.body.className = '';
    document.body.style.overflow = '';
  });

  it('não renderiza quando isOpen é false', () => {
    render(
      <RouterWrapper>
        <AnalysisModal {...defaultProps} isOpen={false} />
      </RouterWrapper>
    );

    expect(screen.queryByText('Análise da Vaga com IA')).not.toBeInTheDocument();
  });

  it('renderiza o modal quando isOpen é true', () => {
    render(
      <RouterWrapper>
        <AnalysisModal {...defaultProps} />
      </RouterWrapper>
    );

    expect(screen.getByText('Análise da Vaga com IA')).toBeInTheDocument();
  });

  it('exibe loading quando isLoading é true', () => {
    render(
      <RouterWrapper>
        <AnalysisModal {...defaultProps} isLoading={true} />
      </RouterWrapper>
    );

    expect(screen.getByText('Analisando vaga com IA...')).toBeInTheDocument();
    expect(screen.getByText('Isso pode levar alguns segundos')).toBeInTheDocument();
    expect(document.querySelector('.analysis-loading-spinner')).toBeInTheDocument();
  });

  it('exibe mensagem de erro quando há erro', () => {
    const errorMessage = 'Erro ao analisar a vaga';
    render(
      <RouterWrapper>
        <AnalysisModal {...defaultProps} error={{ message: errorMessage }} />
      </RouterWrapper>
    );

    expect(screen.getByText('Erro na Análise')).toBeInTheDocument();
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('exibe botão para cadastrar habilidades quando erro é 400', () => {
    const error = {
      message: 'Você precisa cadastrar suas habilidades',
      statusCode: 400
    };

    render(
      <RouterWrapper>
        <AnalysisModal {...defaultProps} error={error} />
      </RouterWrapper>
    );

    expect(screen.getByText('Cadastrar Habilidades')).toBeInTheDocument();
  });

  it('não exibe botão para cadastrar habilidades quando erro não é 400', () => {
    const error = {
      message: 'Token inválido',
      statusCode: 401
    };

    render(
      <RouterWrapper>
        <AnalysisModal {...defaultProps} error={error} />
      </RouterWrapper>
    );

    expect(screen.queryByText('Cadastrar Habilidades')).not.toBeInTheDocument();
  });

  it('navega para /perfil quando clica no botão de cadastrar habilidades', async () => {
    const error = {
      message: 'Você precisa cadastrar suas habilidades',
      statusCode: 400
    };
    const onClose = vi.fn();

    render(
      <RouterWrapper>
        <AnalysisModal {...defaultProps} error={error} onClose={onClose} />
      </RouterWrapper>
    );

    const cadastrarButton = screen.getByText('Cadastrar Habilidades');
    fireEvent.click(cadastrarButton);

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith('/perfil');
  });

  it('exibe análise concluída quando há resultado', () => {
    const analysis = {
      message: 'Esta vaga é adequada para seu perfil.\nRecomendamos que se candidate.'
    };

    render(
      <RouterWrapper>
        <AnalysisModal {...defaultProps} analysis={analysis} />
      </RouterWrapper>
    );

    expect(screen.getByText('Análise Concluída')).toBeInTheDocument();
  });

  it('formata quebras de linha na mensagem de análise', () => {
    const analysis = {
      message: 'Primeira linha\nSegunda linha'
    };

    render(
      <RouterWrapper>
        <AnalysisModal {...defaultProps} analysis={analysis} />
      </RouterWrapper>
    );

    const messageElement = document.querySelector('.analysis-message');
    expect(messageElement.innerHTML).toContain('Primeira linha<br>Segunda linha');
  });

  it('formata travessões como bullet points', () => {
    const analysis = {
      message: '— Item 1\n– Item 2\n- Item 3'
    };

    render(
      <RouterWrapper>
        <AnalysisModal {...defaultProps} analysis={analysis} />
      </RouterWrapper>
    );

    const messageElement = document.querySelector('.analysis-message');
    expect(messageElement).toBeInTheDocument();
    expect(messageElement.innerHTML).toContain('Item 1');
    expect(messageElement.innerHTML).toContain('Item 2');
    expect(messageElement.innerHTML).toContain('Item 3');
  });

  it('fecha modal quando clica no botão X', () => {
    const onClose = vi.fn();

    render(
      <RouterWrapper>
        <AnalysisModal {...defaultProps} onClose={onClose} />
      </RouterWrapper>
    );

    const closeButton = screen.getByRole('button');
    fireEvent.click(closeButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('fecha modal quando clica no backdrop', () => {
    const onClose = vi.fn();

    render(
      <RouterWrapper>
        <AnalysisModal {...defaultProps} onClose={onClose} />
      </RouterWrapper>
    );

    const backdrop = document.querySelector('.analysis-modal-backdrop');
    fireEvent.click(backdrop);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('não fecha modal quando clica no conteúdo', () => {
    const onClose = vi.fn();

    render(
      <RouterWrapper>
        <AnalysisModal {...defaultProps} onClose={onClose} />
      </RouterWrapper>
    );

    const container = document.querySelector('.analysis-modal-container');
    fireEvent.click(container);

    expect(onClose).not.toHaveBeenCalled();
  });

  it('suporta análise como string simples', () => {
    render(
      <RouterWrapper>
        <AnalysisModal {...defaultProps} analysis="Análise como string" />
      </RouterWrapper>
    );

    expect(screen.getByText('Análise Concluída')).toBeInTheDocument();
  });

  it('suporta erro como string simples', () => {
    render(
      <RouterWrapper>
        <AnalysisModal {...defaultProps} error="Erro como string" />
      </RouterWrapper>
    );

    expect(screen.getByText('Erro na Análise')).toBeInTheDocument();
    expect(screen.getByText('Erro como string')).toBeInTheDocument();
  });

  it('testa bloqueio de scroll através de props', () => {
    const { rerender } = render(
      <RouterWrapper>
        <AnalysisModal {...defaultProps} isOpen={false} />
      </RouterWrapper>
    );

    expect(screen.queryByText('Análise da Vaga com IA')).not.toBeInTheDocument();

    rerender(
      <RouterWrapper>
        <AnalysisModal {...defaultProps} isOpen={true} />
      </RouterWrapper>
    );

    expect(screen.getByText('Análise da Vaga com IA')).toBeInTheDocument();
  });
});
