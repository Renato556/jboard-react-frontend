import React from 'react';
import './JobCard.css';

const JobCard = ({ job }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'Não informado';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const handleApply = () => {
    window.open(job.url, '_blank');
  };

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

        {job.applicationDeadline && (
          <div className="job-detail-row">
            <span className="detail-label">Prazo:</span>
            <span className="deadline">{formatDate(job.applicationDeadline)}</span>
          </div>
        )}
      </div>

      <button className="apply-button" onClick={handleApply}>
        Candidatar-se
      </button>
    </div>
  );
};

export default JobCard;
