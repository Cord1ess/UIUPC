// components/PhotoSubmissions.js
import React, { useState } from "react";
import {
  FaEye,
  FaEnvelope,
  FaExternalLinkAlt,
  FaSync,
  FaSearch,
  FaFilter,
  FaDownload,
} from "react-icons/fa";

const PhotoSubmissions = ({
  data,
  loading,
  searchTerm,
  filterStatus,
  onSearchChange,
  onFilterChange,
  onRefresh,
  onExport,
  onViewDetails,
  onEmailReply,
  connectionTest,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Safe string conversion helper
  const safeToString = (value) => {
    if (value === null || value === undefined) return "";
    if (typeof value === "string") return value;
    if (typeof value === "number") return value.toString();
    return String(value);
  };

  // Filter data
  const filteredData = data.filter((item) => {
    const name = safeToString(item["Name"] || item["Full Name"] || item.name);
    const email = safeToString(item["Email"] || item.email);
    const phone = safeToString(item["Phone"] || item.phone);
    const institution = safeToString(item["Institution"] || item.institution);
    const status = safeToString(item["Status"] || item.status || "IN_PROGRESS");

    const matchesSearch =
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      institution.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "all" ||
      status.toLowerCase().includes(filterStatus.toLowerCase());

    return matchesSearch && matchesStatus;
  });

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const getProperty = (item, property) => {
    const possibleKeys = [
      property,
      property.toLowerCase(),
      property.toUpperCase(),
      property.replace(/\s+/g, ""),
      property.replace(/\s+/g, "").toLowerCase(),
      property.replace(/\s+/g, "").toUpperCase(),
    ];

    for (const key of possibleKeys) {
      if (item[key] !== undefined && item[key] !== null && item[key] !== "") {
        return safeToString(item[key]);
      }
    }

    return "N/A";
  };

  const getStatusBadge = (status) => {
    const actualStatus = safeToString(status || "pending");
    const statusConfig = {
      COMPLETED: { class: "status-approved", text: "Completed" },
      REJECTED: { class: "status-rejected", text: "Rejected" },
      IN_PROGRESS: { class: "status-pending", text: "In Progress" },
    };

    const config = statusConfig[actualStatus] || statusConfig.IN_PROGRESS;
    return (
      <span className={`status-badge ${config.class}`}>{config.text}</span>
    );
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pageNumbers = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <div className="pagination-container">
        <div className="pagination-info">
          Showing {indexOfFirstItem + 1}-
          {Math.min(indexOfLastItem, filteredData.length)} of{" "}
          {filteredData.length} submissions
        </div>
        <div className="pagination-controls">
          <button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            className="pagination-btn"
          >
            ←
          </button>

          {startPage > 1 && (
            <>
              <button
                onClick={() => paginate(1)}
                className={`pagination-btn ${1 === currentPage ? "active" : ""}`}
              >
                1
              </button>
              {startPage > 2 && <span className="pagination-ellipsis">...</span>}
            </>
          )}

          {pageNumbers.map((number) => (
            <button
              key={number}
              onClick={() => paginate(number)}
              className={`pagination-btn ${number === currentPage ? "active" : ""}`}
            >
              {number}
            </button>
          ))}

          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && (
                <span className="pagination-ellipsis">...</span>
              )}
              <button
                onClick={() => paginate(totalPages)}
                className={`pagination-btn ${
                  totalPages === currentPage ? "active" : ""
                }`}
              >
                {totalPages}
              </button>
            </>
          )}

          <button
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="pagination-btn"
          >
            →
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="submissions-container">
      {/* Controls */}
      <div className="admin-controls">
        <div className="search-filter-container">
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search by name, email, phone, institution..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filter-controls">
            <FaFilter className="filter-icon" />
            <select
              value={filterStatus}
              onChange={(e) => onFilterChange(e.target.value)}
              className="status-filter"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="in_progress">In Progress</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        <div className="action-buttons">
          <button
            onClick={onRefresh}
            className="btn-secondary refresh-btn"
            disabled={loading}
          >
            <FaSync className={loading ? "spinner" : ""} />
            Refresh
          </button>
          <button
            onClick={onExport}
            className="btn-primary export-btn"
            disabled={filteredData.length === 0}
          >
            <FaDownload />
            Export CSV
          </button>
        </div>
      </div>

      {/* Data Table */}
      {filteredData.length > 0 ? (
        <>
          <div className="applications-table-container">
            <table className="applications-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Institution</th>
                  <th>Category</th>
                  <th>Photos</th>
                  <th>Folder</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((item, index) => (
                  <tr key={index} className="application-row">
                    <td className="timestamp">
                      {new Date(
                        item.Timestamp || item.timestamp || item["Timestamp"]
                      ).toLocaleDateString()}
                    </td>
                    <td className="name">{getProperty(item, "Name")}</td>
                    <td className="email">{getProperty(item, "Email")}</td>
                    <td className="phone">{getProperty(item, "Phone")}</td>
                    <td className="institution">
                      {getProperty(item, "Institution")}
                    </td>
                    <td className="category">{getProperty(item, "Category")}</td>
                    <td className="photo-count">
                      {getProperty(item, "Photo Count")} /{" "}
                      {getProperty(item, "Story Photo Count")}
                    </td>
                    <td className="folder-url">
                      {getProperty(item, "Folder URL") &&
                      getProperty(item, "Folder URL") !== "N/A" ? (
                        <a
                          href={getProperty(item, "Folder URL")}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-view"
                          title="Open Folder"
                        >
                          <FaExternalLinkAlt />
                        </a>
                      ) : (
                        "N/A"
                      )}
                    </td>
                    <td className="status">
                      {getStatusBadge(item.Status || item.status)}
                    </td>
                    <td className="actions">
                      <button
                        onClick={() => onViewDetails(item)}
                        className="btn-view"
                        title="View Details"
                      >
                        <FaEye />
                      </button>
                      <button
                        onClick={() => onEmailReply(item)}
                        className="btn-email"
                        title="Send Email"
                        disabled={connectionTest?.status === "error"}
                      >
                        <FaEnvelope />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {renderPagination()}
        </>
      ) : (
        <div className="no-applications">
          {data.length === 0 ? (
            <div>
              <p>No photo submissions found in the system.</p>
              <p
                style={{
                  fontSize: "0.9rem",
                  color: "var(--text-muted)",
                  marginTop: "0.5rem",
                }}
              >
                Submissions will appear here when participants submit photos.
              </p>
            </div>
          ) : (
            <div>
              <p>No submissions found matching your search criteria.</p>
              {(searchTerm || filterStatus !== "all") && (
                <button
                  onClick={() => {
                    onSearchChange("");
                    onFilterChange("all");
                  }}
                  className="btn-secondary"
                  style={{ marginTop: "1rem" }}
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PhotoSubmissions;