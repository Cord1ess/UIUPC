// components/FilterBar.js
import React from 'react';
import './FilterBar.css';

const FilterBar = ({ events, activeFilter, onFilterChange }) => {
  return (
    <div className="filter-bar">
      <div className="filter-group">
        <h3>Filter by event:</h3>
        <div className="filter-options">
          <button 
            className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
            onClick={() => onFilterChange('all')}
          >
            All Photos
          </button>
          
          <div className="filter-dropdown">
            <select 
              value={activeFilter}
              onChange={(e) => onFilterChange(e.target.value)}
            >
              <option value="all">All Events</option>
              {events.map(event => (
                <option key={event.id} value={event.id}>
                  {event.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;