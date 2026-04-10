"use client";

import React from "react";
import { FaTrophy, FaEdit, FaTrash, FaChevronLeft, FaChevronRight, FaDownload } from "react-icons/fa";

interface Result {
  id: string;
  name: string;
  institute: string;
  photos: number;
  status: string;
  selected: boolean;
  category: string;
}

interface ResultsTableProps {
  results: Result[];
  selectedCategory: string;
  currentResultsPage: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onEdit: (result: Result) => void;
  onDelete: (id: string) => void;
  onAddResult: () => void;
  onExport: () => void;
}

const ResultsTable: React.FC<ResultsTableProps> = ({
  results,
  selectedCategory,
  currentResultsPage,
  itemsPerPage,
  onPageChange,
  onEdit,
  onDelete,
  onAddResult,
  onExport
}) => {
  const filteredResults = results.filter(result => 
    selectedCategory === "all" || result.category === selectedCategory
  );

  const totalPages = Math.ceil(filteredResults.length / itemsPerPage);
  const startIndex = (currentResultsPage - 1) * itemsPerPage;
  const paginatedResults = filteredResults.slice(startIndex, startIndex + itemsPerPage);

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    return (
      <div className="pagination">
        <button
          className="pagination-btn"
          onClick={() => onPageChange(currentResultsPage - 1)}
          disabled={currentResultsPage === 1}
        >
          <FaChevronLeft />
        </button>
        <span className="pagination-info">Page {currentResultsPage} of {totalPages}</span>
        <button
          className="pagination-btn"
          onClick={() => onPageChange(currentResultsPage + 1)}
          disabled={currentResultsPage === totalPages}
        >
          <FaChevronRight />
        </button>
      </div>
    );
  };

  return (
    <div className="table-container">
      <div className="table-header">
        <h3><FaTrophy /> Results Management ({filteredResults.length})</h3>
        <div className="table-actions">
          <button className="btn-primary" onClick={onAddResult}>Add New Result</button>
          <button className="btn-secondary" onClick={onExport} disabled={results.length === 0}>
            <FaDownload /> Export CSV
          </button>
        </div>
      </div>

      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Institute</th>
              <th>Photos</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedResults.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center' }}>No results found.</td></tr>
            ) : (
              paginatedResults.map((result, index) => (
                <tr key={result.id || index} className={result.selected ? "selected-row" : ""}>
                  <td>{result.id}</td>
                  <td>{result.name || "No name"}</td>
                  <td>{result.institute || "No institute"}</td>
                  <td>{result.photos || 1}</td>
                  <td>
                    <span className={`status-badge ${result.status}`}>
                      {result.status === "selected" ? "Selected" : "Not Selected"}
                    </span>
                  </td>
                  <td className="actions-cell">
                    <button className="action-btn edit-btn" onClick={() => onEdit(result)} title="Edit"><FaEdit /></button>
                    <button className="action-btn delete-btn" onClick={() => onDelete(result.id)} title="Delete"><FaTrash /></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {renderPagination()}
    </div>
  );
};

export default React.memo(ResultsTable);
