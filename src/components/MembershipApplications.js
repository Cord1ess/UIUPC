"use client";
// components/MembershipApplications.js
import React, { useState } from "react";
import {
  FaEye,
  FaEnvelope,
  FaSync,
  FaSearch,
  FaFilter,
  FaDownload,
  FaFacebook,
} from "react-icons/fa";

const MembershipApplications = ({
  data,
  loading,
  searchTerm,
  filterStatus,
  onSearchChange,
  onFilterChange,
  onRefresh,
  onExport,
  onViewDetails,
  onUpdateStatus,
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
    const name = safeToString(item["Full Name"] || item.name);
    const email = safeToString(item.Email || item.email);
    const studentId = safeToString(item["Student ID"] || item.studentId);
    const department = safeToString(item.Department || item.department);
    const facebookLink = safeToString(
      item["Facebook Link"] || item.facebookLink
    );
    const status = safeToString(item.Status || item.status || "pending");

    const matchesSearch =
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      facebookLink.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "pending" && (!status || status === "pending")) ||
      (filterStatus === "approved" && status === "approved") ||
      (filterStatus === "rejected" && status === "rejected");

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
      approved: { class: "status-approved", text: "Approved" },
      rejected: { class: "status-rejected", text: "Rejected" },
      pending: { class: "status-pending", text: "Pending" },
    };

    const config = statusConfig[actualStatus] || statusConfig.pending;
    return (
      <span className={`status-badge ${config.class}`}>{config.text}</span>
    );
  };

  // In MembershipApplications.js - Replace the renderFacebookLink function
  const renderFacebookLink = (item) => {
    // Try multiple possible property names for Facebook link, including the exact header from your sheet
    const facebookLink =
      item["Facebook Profile Link"] || // This is the exact header from your sheet
      item["Facebook Link"] ||
      item["facebookLink"] ||
      item["Facebook"] ||
      item["facebook"] ||
      item["Facebook Profile"] ||
      item["facebookProfile"] ||
      item["FB Link"] ||
      item["fbLink"];

    if (
      !facebookLink ||
      facebookLink === "N/A" ||
      facebookLink === "" ||
      facebookLink === "Not provided"
    ) {
      return "Not provided";
    }

    // Ensure the link has proper protocol and is a valid URL
    let formattedLink = facebookLink.trim();

    // Remove any extra quotes or spaces
    formattedLink = formattedLink.replace(/['"]/g, "");

    if (
      !formattedLink.startsWith("http://") &&
      !formattedLink.startsWith("https://")
    ) {
      formattedLink = "https://" + formattedLink;
    }

    // Validate it's actually a Facebook URL
    if (
      !formattedLink.includes("facebook.com") &&
      !formattedLink.includes("fb.com")
    ) {
      // If it doesn't look like a Facebook URL, show it as text instead of link
      return (
        <span className="facebook-text" title={formattedLink}>
          {formattedLink}
        </span>
      );
    }

    return (
      <a
        href={formattedLink}
        target="_blank"
        rel="noopener noreferrer"
        className="facebook-link"
        title={formattedLink}
      >
        <FaFacebook /> View Profile
      </a>
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
          {filteredData.length} applications
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
                className={`pagination-btn ${
                  1 === currentPage ? "active" : ""
                }`}
              >
                1
              </button>
              {startPage > 2 && (
                <span className="pagination-ellipsis">...</span>
              )}
            </>
          )}

          {pageNumbers.map((number) => (
            <button
              key={number}
              onClick={() => paginate(number)}
              className={`pagination-btn ${
                number === currentPage ? "active" : ""
              }`}
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
    <div className="applications-container">
      {/* Controls */}
      <div className="admin-controls">
        <div className="search-filter-container">
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search by name, email, student ID, Facebook..."
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
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
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
                  <th>Full Name</th>
                  <th>Student ID</th>
                  <th>Department</th>
                  <th>Facebook Link</th>
                  <th>Experience Level</th>
                  <th>Payment Method</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((item, index) => (
                  <tr key={index} className="application-row">
                    <td className="timestamp">
                      {new Date(
                        item.Timestamp || item.timestamp
                      ).toLocaleDateString()}
                    </td>
                    <td className="name">{getProperty(item, "Full Name")}</td>
                    <td className="student-id">
                      {getProperty(item, "Student ID")}
                    </td>
                    <td className="department">
                      {getProperty(item, "Department")}
                    </td>
                    <td className="facebook-link">
                      {renderFacebookLink(item)}
                    </td>
                    <td className="experience">
                      {getProperty(item, "Experience Level")}
                    </td>
                    <td className="payment-method">
                      {getProperty(item, "Payment Method")}
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
                      {(!item.Status || item.Status === "pending") && (
                        <div className="status-actions">
                          <button
                            onClick={() => onUpdateStatus(item, "approved")}
                            className="btn-approve"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => onUpdateStatus(item, "rejected")}
                            className="btn-reject"
                          >
                            Reject
                          </button>
                        </div>
                      )}
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
              <p>No membership applications found in the system.</p>
              <p
                style={{
                  fontSize: "0.9rem",
                  color: "var(--text-muted)",
                  marginTop: "0.5rem",
                }}
              >
                Applications will appear here when students submit the join
                form.
              </p>
            </div>
          ) : (
            <div>
              <p>No applications found matching your search criteria.</p>
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

export default MembershipApplications;
