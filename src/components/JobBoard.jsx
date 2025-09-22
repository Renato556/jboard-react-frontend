import React, { useState, useEffect, useMemo } from 'react';
import { jobsService } from '../services/api';
import JobCard from './JobCard';
import JobFilters from './JobFilters';
import JobSorter from './JobSorter';
import './JobBoard.css';

const JobBoard = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('publishedDate-desc');
  const [filters, setFilters] = useState({
    seniorityLevel: '',
    field: ''
  });

  useEffect(() => {
    const loadJobs = async () => {
      try {
        setLoading(true);
        const response = await jobsService.getJobs();
        setJobs(response.data || []);
        setError(null);
      } catch (err) {
        setError(err.message);
        console.error('Erro ao carregar vagas:', err);
      } finally {
        setLoading(false);
      }
    };

    loadJobs();
  }, []);

  const seniorityLevels = useMemo(() => {
    const levels = [...new Set(jobs.map(job => job.seniorityLevel).filter(Boolean))];
    return levels.sort();
  }, [jobs]);

  const fields = useMemo(() => {
    const fieldsList = [...new Set(jobs.map(job => job.field).filter(Boolean))];
    return fieldsList.sort();
  }, [jobs]);

  const sortedAndFilteredJobs = useMemo(() => {
    const filtered = jobs.filter(job => {
      const matchesSeniority = !filters.seniorityLevel || job.seniorityLevel === filters.seniorityLevel;
      const matchesField = !filters.field || job.field === filters.field;
      return matchesSeniority && matchesField;
    });

    const sortJobs = (jobsArray, sortCriteria) => {
      const [field, direction] = sortCriteria.split('-');

      return [...jobsArray].sort((a, b) => {
        let dateA, dateB;

        if (field === 'publishedDate') {
          dateA = new Date(a.publishedDate);
          dateB = new Date(b.publishedDate);
        } else if (field === 'updatedAt') {
          dateA = new Date(a.updatedAt);
          dateB = new Date(b.updatedAt);
        }

        if (isNaN(dateA)) dateA = new Date(0);
        if (isNaN(dateB)) dateB = new Date(0);

        if (direction === 'desc') {
          return dateB - dateA;
        } else {
          return dateA - dateB;
        }
      });
    };

    return sortJobs(filtered, sortBy);
  }, [jobs, filters, sortBy]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    if (window.innerWidth <= 768) {
      setShowFilters(false);
    }
  };

  const handleSortChange = (newSortBy) => {
    setSortBy(newSortBy);
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  if (loading) {
    return (
      <div className="job-board">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Carregando vagas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="job-board">
        <div className="error-container">
          <h2>Ops! Algo deu errado</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="retry-button">
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="job-board">
      <header className="job-board-header">
        <div className="header-content">
          <h1 className="main-title">JBoard</h1>
          <p className="main-subtitle">Encontre sua próxima oportunidade profissional</p>
          <div className="stats">
            <span className="stat-item">
              {jobs.length} {jobs.length === 1 ? 'vaga disponível' : 'vagas disponíveis'}
            </span>
            {sortedAndFilteredJobs.length !== jobs.length && (
              <span className="stat-item filtered">
                {sortedAndFilteredJobs.length} {sortedAndFilteredJobs.length === 1 ? 'vaga encontrada' : 'vagas encontradas'}
              </span>
            )}
          </div>

          <button className="mobile-filter-toggle" onClick={toggleFilters}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 7H21L19 12V18C19 18.5523 18.5523 19 18 19H6C5.44772 19 5 18.5523 5 18V12L3 7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M8 7V5C8 3.89543 8.89543 3 10 3H14C15.1046 3 16 3.89543 16 5V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Filtros
            {(filters.seniorityLevel || filters.field) && <span className="filter-indicator">•</span>}
          </button>
        </div>
      </header>

      <div className="job-board-content">
        <aside className={`filters-sidebar ${showFilters ? 'show' : ''}`}>
          <JobFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            seniorityLevels={seniorityLevels}
            fields={fields}
            onClose={() => setShowFilters(false)}
          />

          {showFilters && <div className="mobile-filter-overlay" onClick={() => setShowFilters(false)}></div>}
        </aside>

        <main className="jobs-main">
          <JobSorter
            sortBy={sortBy}
            onSortChange={handleSortChange}
          />

          {sortedAndFilteredJobs.length === 0 ? (
            <div className="no-jobs-container">
              <h3>Nenhuma vaga encontrada</h3>
              <p>Tente ajustar os filtros para encontrar mais oportunidades.</p>
            </div>
          ) : (
            <div className="jobs-list">
              {sortedAndFilteredJobs.map(job => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default JobBoard;
