import React from 'react';
import { createPortal } from 'react-dom';
import './AnalysisModal.css';
import { useNavigate } from "react-router-dom";

const AnalysisModal = ({ isOpen, onClose, analysis, error, isLoading }) => {
  const navigate = useNavigate();
  if (!isOpen) return null;

  const formatAnalysisMessage = (message) => {
    if (!message) return '';
    return message.replace(/\n/g, '<br />');
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleGoToProfile = () => {
    onClose();
    navigate('/perfil');
  };

  const isSkillsError = error && error.statusCode === 400;

  const modalContent = (
    <div className="analysis-modal-backdrop" onClick={handleBackdropClick}>
      <div className="analysis-modal-container">
        <div className="analysis-modal-header">
          <h2>Análise da Vaga com IA</h2>
          <button className="analysis-close-button" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        <div className="analysis-modal-body">
          {isLoading && (
            <div className="analysis-loading-container">
              <div className="analysis-loading-spinner"></div>
              <p>Analisando vaga com IA...</p>
              <p className="analysis-loading-subtitle">Isso pode levar alguns segundos</p>
            </div>
          )}

          {error && !isLoading && (
            <div className="analysis-error-container">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="#e74c3c" strokeWidth="2"/>
                <path d="M15 9L9 15" stroke="#e74c3c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9 9L15 15" stroke="#e74c3c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <h3>Erro na Análise</h3>
              <p>{error.message || error}</p>
              {isSkillsError && (
                <button className="analysis-profile-button" onClick={handleGoToProfile}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Cadastrar Habilidades
                </button>
              )}
            </div>
          )}

          {analysis && !isLoading && !error && (
            <div className="analysis-result-container">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" stroke="#27ae60" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <h3>Análise Concluída</h3>
              <div className="analysis-content">
                <div
                  className="analysis-message"
                  dangerouslySetInnerHTML={{
                    __html: formatAnalysisMessage(analysis.message || analysis)
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default AnalysisModal;
