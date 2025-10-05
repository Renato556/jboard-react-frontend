import React from 'react';
import './JobFilters.css';

const JobFilters = ({ filters, onFilterChange, seniorityLevels, fields, onClose }) => {
  const handleSeniorityChange = (e) => {
    onFilterChange({
      ...filters,
      seniorityLevel: e.target.value
    });
  };

  const handleFieldChange = (e) => {
    onFilterChange({
      ...filters,
      field: e.target.value
    });
  };

  const clearFilters = () => {
    onFilterChange({
      seniorityLevel: '',
      field: ''
    });
  };

  return (
    <div className="job-filters">
      <div className="filters-header">
        <h3 className="filters-title">Filtros</h3>
        {onClose && (
          <button className="close-filters-btn" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}
      </div>

      <div className="filter-group">
        <label htmlFor="seniority-filter" className="filter-label">
          Nível de Senioridade
        </label>
        <select
          id="seniority-filter"
          className="filter-select"
          value={filters.seniorityLevel}
          onChange={handleSeniorityChange}
        >
          <option value="">Todos os níveis</option>
          {seniorityLevels.map(level => (
            <option key={level} value={level}>{level}</option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label htmlFor="field-filter" className="filter-label">
          Área de Atuação
        </label>
        <select
          id="field-filter"
          className="filter-select"
          value={filters.field}
          onChange={handleFieldChange}
        >
          <option value="">Todas as áreas</option>
          {fields.map(field => (
            <option key={field} value={field}>{field}</option>
          ))}
        </select>
      </div>

      {(filters.seniorityLevel || filters.field) && (
        <button className="clear-filters-btn" onClick={clearFilters}>
          Limpar Filtros
        </button>
      )}
    </div>
  );
};

export default JobFilters;
