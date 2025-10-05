import React from 'react';
import './JobSorter.css';

const JobSorter = ({ sortBy, onSortChange }) => {
  const sortOptions = [
    { value: 'publishedDate-desc', label: 'Mais novas' },
    { value: 'publishedDate-asc', label: 'Mais antigas' },
    { value: 'updatedAt-desc', label: 'Atualizadas recentemente' },
    { value: 'updatedAt-asc', label: 'Atualizadas há mais tempo' }
  ];

  return (
    <div className="job-sorter">
      <label htmlFor="sort-select" className="sort-label">
        Ordenar por:
      </label>
      <select
        id="sort-select"
        className="sort-select"
        value={sortBy}
        onChange={(e) => onSortChange(e.target.value)}
      >
        {sortOptions.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default JobSorter;
