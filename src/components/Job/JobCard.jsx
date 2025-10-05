import React from 'react';
import { authService } from '../../services/auth.js';
import './JobCard.css';

const JobCard = ({ job }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const handleApply = () => {
    window.open(job.url, '_blank');
  };

  const handleAnalyzeWithAI = () => {
    // TODO: Implementar análise com IA
    console.log('Analisar vaga com IA:', job.title);
  };

  const userRole = authService.getUserRole();
  const isPremium = userRole === 'premium';

  return (
    <div className="job-card">
      <div className="job-card-header">
        <h3 className="job-title">{job.title}</h3>
        <span className="job-company">{job.company}</span>

        <div className="badges-container">
          {job.seniorityLevel && (
            <span className={`seniority-badge ${job.seniorityLevel?.toLowerCase()}`}>
              {job.seniorityLevel}
            </span>
          )}
          {job.field && (
            <span className="field-badge">{job.field}</span>
          )}
          {job.employmentType && (
            <span className="employment-badge">{job.employmentType}</span>
          )}
          {job.workplaceType && (
            <span className="workplace-badge">{job.workplaceType}</span>
          )}
        </div>
      </div>

      <div className="job-details">
        <div className="job-detail-row">
          <span className="detail-label">Publicado em:</span>
          <span className="published-date">{formatDate(job.publishedDate)}</span>
        </div>

        {job.updatedAt && (
            <div className="job-detail-row">
                <span className="detail-label">Atualizada em:</span>
                <span className="deadline">{formatDate(job.updatedAt)}</span>
            </div>
        )}

        {job.applicationDeadline && (
          <div className="job-detail-row">
            <span className="detail-label">Prazo:</span>
            <span className="deadline">{formatDate(job.applicationDeadline)}</span>
          </div>
        )}
      </div>

      <div className="job-actions">
        <button className="apply-button" onClick={handleApply}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M16 13H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M16 17H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M10 9H9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Candidatar-se
        </button>

        <button
          className={`ai-analyze-button ${!isPremium ? 'disabled' : ''}`}
          onClick={isPremium ? handleAnalyzeWithAI : undefined}
          disabled={!isPremium}
          title={!isPremium ? 'Recurso disponível apenas para usuários Premium' : 'Analisar vaga usando IA'}
        >
          {!isPremium ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
              <circle cx="12" cy="16" r="1" stroke="currentColor" strokeWidth="2"/>
              <path d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11" stroke="currentColor" strokeWidth="2"/>
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
          Analisar usando IA
        </button>
      </div>
    </div>
  );
};

export default JobCard;
