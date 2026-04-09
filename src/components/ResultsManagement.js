"use client";
// src/components/ResultsManagement.js
import React, { useState, useEffect } from "react";
import {
  FaEye,
  FaEdit,
  FaTrash,
  FaCheck,
  FaTimes,
  FaMoneyBillWave,
  FaTrophy,
  FaUser,
  FaUniversity,
  FaImage,
  FaSearch,
  FaDownload,
  FaSync,
  FaCalendar,
  FaPhone,
  FaEnvelope,
  FaHome,
  FaTshirt,
  FaExclamationTriangle,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import Loading from "./Loading";
import "./ResultsManagement.css";

const ResultsManagement = ({ scripts, user, onUpdate }) => {
  const [results, setResults] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState("shutter-stories");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedResult, setSelectedResult] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);


  // Pagination states
  const [currentResultsPage, setCurrentResultsPage] = useState(1);
  const [currentPaymentsPage, setCurrentPaymentsPage] = useState(1);
  const itemsPerPage = 10;

  // New result form state
  const [newResult, setNewResult] = useState({
    eventId: "shutter-stories",
    name: "",
    institute: "",
    category: "single",
    photos: 1,
    selected: true,
    status: "selected",
  });

  // Events list
  const events = [
    { id: "shutter-stories", name: "Shutter Stories Chapter IV" },
    { id: "event-2", name: "Photo Exhibition 2024" },
    { id: "event-3", name: "Annual Competition" },
  ];



  // Fetch results and payments
  useEffect(() => {
    fetchResults();
    fetchPayments();
  }, [selectedEvent, refreshTrigger]);

  const fetchResults = async () => {
    try {
      setLoading(true);
      setError(null);

      const url = `${scripts.results}?action=getAllResults&eventId=${selectedEvent}&t=${Date.now()}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.success) {
        const resultsData = Array.isArray(result.data) ? result.data : [];
        setResults(resultsData);
        setError(null);
      } else {
        throw new Error(result.error || "API returned error");
      }
    } catch (error) {
      console.error("Error fetching results:", error);
      setError(`Failed to load results: ${error.message}`);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPayments = async () => {
    try {
      const url = `${scripts.results}?action=getAllPayments&eventId=${selectedEvent}&t=${Date.now()}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.success) {
        const paymentsData = Array.isArray(result.data) ? result.data : [];
        setPayments(paymentsData);
      } else {
        throw new Error(result.error || "API returned error");
      }
    } catch (error) {
      console.error("Error fetching payments:", error);
      setPayments([]);
    }
  };

  // Filter results - ensure results is an array
  const filteredResults = Array.isArray(results)
    ? results.filter((result) => {
        if (selectedCategory !== "all" && result.category !== selectedCategory)
          return false;
        if (selectedStatus !== "all" && result.status !== selectedStatus)
          return false;
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          return (
            (result.name && result.name.toLowerCase().includes(query)) ||
            (result.institute &&
              result.institute.toLowerCase().includes(query)) ||
            (result.status && result.status.toLowerCase().includes(query))
          );
        }
        return true;
      })
    : [];

  // Separate results by category
  const singleResults = filteredResults.filter(
    (result) => result.category === "single"
  );
  const storyResults = filteredResults.filter(
    (result) => result.category === "story"
  );

  // Filter and sort payments - show pending first, then by timestamp
  const filteredPayments = Array.isArray(payments)
    ? payments
        .filter((payment) => {
          if (searchQuery) {
            const query = searchQuery.toLowerCase();
            return (
              (payment.name && payment.name.toLowerCase().includes(query)) ||
              (payment.email && payment.email.toLowerCase().includes(query)) ||
              (payment.transactionId &&
                payment.transactionId.toLowerCase().includes(query))
            );
          }
          return true;
        })
        .sort((a, b) => {
          // Sort by status: pending first, then confirmed, then rejected
          const statusOrder = {
            pending: 0,
            confirmed: 1,
            rejected: 2,
            verified: 1,
          };
          const aStatus = (a.status || "pending")
            .toString()
            .toLowerCase()
            .trim();
          const bStatus = (b.status || "pending")
            .toString()
            .toLowerCase()
            .trim();

          // If status is the same, sort by timestamp (newest first)
          if (statusOrder[aStatus] === statusOrder[bStatus]) {
            return new Date(b.timestamp || 0) - new Date(a.timestamp || 0);
          }

          return statusOrder[aStatus] - statusOrder[bStatus];
        })
    : [];

  // Pagination logic for results
  const totalResultsPages = Math.ceil(filteredResults.length / itemsPerPage);
  const startResultsIndex = (currentResultsPage - 1) * itemsPerPage;
  const endResultsIndex = startResultsIndex + itemsPerPage;
  const paginatedResults = filteredResults.slice(
    startResultsIndex,
    endResultsIndex
  );

  // Pagination logic for single category results
  const singleResultsStartIndex = (currentResultsPage - 1) * itemsPerPage;
  const singleResultsEndIndex = singleResultsStartIndex + itemsPerPage;
  const paginatedSingleResults = singleResults.slice(
    singleResultsStartIndex,
    singleResultsEndIndex
  );
  const totalSingleResultsPages = Math.ceil(
    singleResults.length / itemsPerPage
  );

  // Pagination logic for story category results
  const storyResultsStartIndex = (currentResultsPage - 1) * itemsPerPage;
  const storyResultsEndIndex = storyResultsStartIndex + itemsPerPage;
  const paginatedStoryResults = storyResults.slice(
    storyResultsStartIndex,
    storyResultsEndIndex
  );
  const totalStoryResultsPages = Math.ceil(storyResults.length / itemsPerPage);

  // Pagination logic for payments
  const totalPaymentsPages = Math.ceil(filteredPayments.length / itemsPerPage);
  const startPaymentsIndex = (currentPaymentsPage - 1) * itemsPerPage;
  const endPaymentsIndex = startPaymentsIndex + itemsPerPage;
  const paginatedPayments = filteredPayments.slice(
    startPaymentsIndex,
    endPaymentsIndex
  );

  // Pagination component
  const Pagination = ({ currentPage, totalPages, onPageChange, dataType }) => {
    if (totalPages <= 1) return null;

    return (
      <div className="pagination">
        <button
          className="pagination-btn"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <FaChevronLeft />
        </button>

        <span className="pagination-info">
          Page {currentPage} of {totalPages}
        </span>

        <button
          className="pagination-btn"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <FaChevronRight />
        </button>

        <span className="pagination-count">
          Showing{" "}
          {dataType === "results"
            ? filteredResults.length
            : filteredPayments.length}{" "}
          items
        </span>
      </div>
    );
  };

  // Handle adding a new result
  const handleAddResult = async () => {
    try {
      // Validate required fields
      if (!newResult.name || !newResult.name.trim()) {
        alert("Name is required!");
        return;
      }

      if (!newResult.institute || !newResult.institute.trim()) {
        alert("Institute is required!");
        return;
      }

      // Prepare data in the exact format the backend expects
      const requestData = {
        name: newResult.name.trim(),
        institute: newResult.institute.trim(),
        photos: parseInt(newResult.photos) || 1,
        selected: newResult.selected,
        category: newResult.category,
        status: newResult.status,
        eventId: selectedEvent,
      };

      // Use GET request with URL parameters (works better with Google Apps Script)
      const queryParams = new URLSearchParams({
        action: "addResult",
        name: requestData.name,
        institute: requestData.institute,
        photos: requestData.photos,
        selected: requestData.selected,
        category: requestData.category,
        status: requestData.status,
        eventId: requestData.eventId,
        t: Date.now(), // Cache buster
      }).toString();

      const url = `${scripts.results}?${queryParams}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });

      const responseText = await response.text();

      let result;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        console.error("Failed to parse response:", parseError);
        throw new Error("Invalid response from server");
      }

      if (result.success) {
        alert("Result added successfully!");
        setRefreshTrigger((prev) => prev + 1);
        // Reset form
        setNewResult({
          eventId: "shutter-stories",
          name: "",
          institute: "",
          category: "single",
          photos: 1,
          selected: true,
          status: "selected",
        });
      } else {
        alert("Failed to add result: " + (result.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Error adding result:", error);

      if (error.message.includes("Failed to fetch")) {
        alert(`Network error: Cannot connect to the server. Please check:
        1. Is the server running?
        2. Is the correct API URL configured?
        3. Are there any CORS issues? (Check browser console)
        
        Current API URL: ${scripts.results}`);
      } else {
        alert("Error adding result: " + error.message);
      }
    }
  };

  // Handle updating a result
  const handleUpdateResult = async (resultId, updatedData) => {
    try {
      const formData = new FormData();
      formData.append("action", "updateResult");
      formData.append("resultId", resultId);
      formData.append("data", JSON.stringify(updatedData));

      await fetch(scripts.results, {
        method: "POST",
        mode: "no-cors",
        body: formData,
      });

      alert("Update submitted. Refreshing data...");
      setRefreshTrigger((prev) => prev + 1);
    } catch (error) {
      console.error("Error updating result:", error);
      alert("Error updating result. Check console for details.");
    }
  };

  // Handle deleting a result
  const handleDeleteResult = async (resultId) => {
    if (!window.confirm("Are you sure you want to delete this result?")) {
      return;
    }

    try {
      const formData = new FormData();
      formData.append("action", "deleteResult");
      formData.append("resultId", resultId);

      await fetch(scripts.results, {
        method: "POST",
        mode: "no-cors",
        body: formData,
      });

      alert("Delete submitted. Refreshing data...");
      setRefreshTrigger((prev) => prev + 1);
    } catch (error) {
      console.error("Error deleting result:", error);
      alert("Error deleting result. Check console for details.");
    }
  };

  // Handle updating payment status
  const handleUpdatePaymentStatus = async (paymentId, status) => {
    try {
      // First, update the local state optimistically
      const updatedPayments = payments.map((payment) => {
        if (payment.id === paymentId) {
          return {
            ...payment,
            status: status,
            // For consistency with your data structure
            status: status === "verified" ? "confirmed" : status,
          };
        }
        return payment;
      });

      // Update UI immediately
      setPayments(updatedPayments);

      // Then send to server
      const queryParams = new URLSearchParams({
        action: "updatePaymentStatus",
        paymentId: paymentId,
        status: status,
        t: Date.now(),
      }).toString();

      const url = `${scripts.results}?${queryParams}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });

      const responseText = await response.text();

      let result;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        console.error("Failed to parse response:", parseError);
        // Keep the optimistic update, but log the error
        console.warn(
          "Payment status updated locally but server response unclear"
        );
        return;
      }

      if (result.success) {
        // Optional: Refresh from server to ensure consistency
        setTimeout(() => {
          fetchPayments();
        }, 1000);
      } else {
        // Revert optimistic update if server fails
        console.error("Server failed to update payment:", result.error);
        alert(`Failed to update payment: ${result.error}`);

        // Revert the optimistic update by refreshing from server
        fetchPayments();
      }
    } catch (error) {
      console.error("Error updating payment status:", error);
      alert("Error updating payment status: " + error.message);

      // Revert optimistic update by refreshing from server
      fetchPayments();
    }
  };

  // Export to CSV function
  const exportToCSV = (data, filename) => {
    if (!data || data.length === 0) {
      alert("No data to export");
      return;
    }

    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(","),
      ...data.map((row) =>
        headers
          .map((header) => {
            const value = row[header];
            // Handle special characters and commas
            if (
              typeof value === "string" &&
              (value.includes(",") ||
                value.includes('"') ||
                value.includes("\n"))
            ) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
          })
          .join(",")
      ),
    ];

    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("hidden", "");
    a.setAttribute("href", url);
    a.setAttribute(
      "download",
      `${filename}_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Connection test function
  const testConnection = async () => {
    try {
      const response = await fetch(
        `${scripts.results}?action=test&t=${Date.now()}`
      );
      const result = await response.json();
      if (result.success) {
        alert("Connection test successful!");
      } else {
        alert("Connection test failed: " + (result.error || "Unknown error"));
      }
    } catch (error) {
      alert("Connection test failed: " + error.message);
    }
  };



  // Handle sending payment confirmation email with GET request
  const handleSendPaymentEmailGET = async (paymentId, paymentData) => {
    if (
      !window.confirm(
        `Send payment confirmation email to ${paymentData.email}?`
      )
    ) {
      return;
    }

    try {
      const url = `${
        scripts.results
      }?action=sendPaymentEmail&paymentId=${paymentId}&t=${Date.now()}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });

      const responseText = await response.text();

      try {
        const result = JSON.parse(responseText);

        if (result.success) {
          alert("✅ Confirmation email sent successfully!");
        } else {
          // Show more detailed error message
          const errorMsg =
            result.error || result.data?.error || "Unknown error";
          console.error("❌ Email sending failed:", errorMsg);
          alert(`❌ Failed to send email: ${errorMsg}`);
        }
      } catch (parseError) {
        console.error("Failed to parse response:", parseError);
        alert(
          "⚠️ Email sent but server response was not clear. Check server logs."
        );
      }
    } catch (error) {
      console.error("❌ Network error sending email:", error);
      alert(`❌ Network error sending email: ${error.message}`);
    }
  };

  const renderResultsTable = () => {
    return (
      <div className="table-container">
        <div className="table-header">
          <h3>
            <FaTrophy /> Results Management ({filteredResults.length})
          </h3>
          <div className="table-actions">
            <button
              className="btn-primary"
              onClick={() => setShowResultsModal(true)}
            >
              Add New Result
            </button>
            <button
              className="btn-secondary"
              onClick={() => exportToCSV(results, "results")}
              disabled={results.length === 0}
            >
              <FaDownload /> Export CSV
            </button>
          </div>
        </div>

        {/* Single Photo Results Section */}
        {selectedCategory === "all" || selectedCategory === "single" ? (
          <div className="results-section">
            <h4 className="section-title">
              Single Photo Entries ({singleResults.length})
            </h4>
            {singleResults.length === 0 ? (
              <div className="no-data-message">
                No single photo entries found.
              </div>
            ) : (
              <>
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
                      {paginatedSingleResults.map((result, index) => (
                        <tr
                          key={result.id || index}
                          className={result.selected ? "selected-row" : ""}
                        >
                          <td>{result.id}</td>
                          <td>{result.name || "No name"}</td>
                          <td>{result.institute || "No institute"}</td>
                          <td>{result.photos || 1}</td>
                          <td>
                            <span className={`status-badge ${result.status}`}>
                              {result.status === "selected"
                                ? "Selected"
                                : result.status === "not-selected"
                                ? "Not Selected"
                                : result.status || "Unknown"}
                            </span>
                          </td>
                          <td className="actions-cell">
                            <button
                              className="action-btn edit-btn"
                              onClick={() => {
                                setSelectedResult(result);
                                setShowResultsModal(true);
                              }}
                              title="Edit"
                            >
                              <FaEdit />
                            </button>
                            <button
                              className="action-btn delete-btn"
                              onClick={() => handleDeleteResult(result.id)}
                              title="Delete"
                            >
                              <FaTrash />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <Pagination
                  currentPage={currentResultsPage}
                  totalPages={totalSingleResultsPages}
                  onPageChange={setCurrentResultsPage}
                  dataType="results"
                />
              </>
            )}
          </div>
        ) : null}

        {/* Photo Story Results Section */}
        {selectedCategory === "all" || selectedCategory === "story" ? (
          <div className="results-section">
            <h4 className="section-title">
              Photo Story Entries ({storyResults.length})
            </h4>
            {storyResults.length === 0 ? (
              <div className="no-data-message">
                No photo story entries found.
              </div>
            ) : (
              <>
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
                      {paginatedStoryResults.map((result, index) => (
                        <tr
                          key={result.id || index}
                          className={result.selected ? "selected-row" : ""}
                        >
                          <td>{result.id}</td>
                          <td>{result.name || "No name"}</td>
                          <td>{result.institute || "No institute"}</td>
                          <td>{result.photos || 1}</td>
                          <td>
                            <span className={`status-badge ${result.status}`}>
                              {result.status === "selected"
                                ? "Selected"
                                : result.status === "not-selected"
                                ? "Not Selected"
                                : result.status || "Unknown"}
                            </span>
                          </td>
                          <td className="actions-cell">
                            <button
                              className="action-btn edit-btn"
                              onClick={() => {
                                setSelectedResult(result);
                                setShowResultsModal(true);
                              }}
                              title="Edit"
                            >
                              <FaEdit />
                            </button>
                            <button
                              className="action-btn delete-btn"
                              onClick={() => handleDeleteResult(result.id)}
                              title="Delete"
                            >
                              <FaTrash />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <Pagination
                  currentPage={currentResultsPage}
                  totalPages={totalStoryResultsPages}
                  onPageChange={setCurrentResultsPage}
                  dataType="results"
                />
              </>
            )}
          </div>
        ) : null}

        {/* Combined view for specific category selection */}
        {selectedCategory !== "all" &&
        selectedCategory !== "single" &&
        selectedCategory !== "story" ? (
          <div className="results-section">
            {filteredResults.length === 0 ? (
              <div className="no-data-message">
                No results found matching the selected criteria.
              </div>
            ) : (
              <>
                <div className="table-responsive">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Institute</th>
                        <th>Category</th>
                        <th>Photos</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedResults.map((result, index) => (
                        <tr
                          key={result.id || index}
                          className={result.selected ? "selected-row" : ""}
                        >
                          <td>{result.id}</td>
                          <td>{result.name || "No name"}</td>
                          <td>{result.institute || "No institute"}</td>
                          <td>
                            <span
                              className={`category-badge ${result.category}`}
                            >
                              {result.category === "single"
                                ? "Single Photo"
                                : result.category === "story"
                                ? "Photo Story"
                                : result.category || "Unknown"}
                            </span>
                          </td>
                          <td>{result.photos || 1}</td>
                          <td>
                            <span className={`status-badge ${result.status}`}>
                              {result.status === "selected"
                                ? "Selected"
                                : result.status === "not-selected"
                                ? "Not Selected"
                                : result.status || "Unknown"}
                            </span>
                          </td>
                          <td className="actions-cell">
                            <button
                              className="action-btn edit-btn"
                              onClick={() => {
                                setSelectedResult(result);
                                setShowResultsModal(true);
                              }}
                              title="Edit"
                            >
                              <FaEdit />
                            </button>
                            <button
                              className="action-btn delete-btn"
                              onClick={() => handleDeleteResult(result.id)}
                              title="Delete"
                            >
                              <FaTrash />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <Pagination
                  currentPage={currentResultsPage}
                  totalPages={totalResultsPages}
                  onPageChange={setCurrentResultsPage}
                  dataType="results"
                />
              </>
            )}
          </div>
        ) : null}
      </div>
    );
  };

  const renderPaymentsTable = () => {
    // Calculate counts for stats
    const pendingPaymentsCount = filteredPayments.filter(
      (p) => p.status && p.status.toLowerCase().trim() === "pending"
    ).length;

    const confirmedPaymentsCount = filteredPayments.filter(
      (p) => p.status && p.status.toLowerCase().trim() === "confirmed"
    ).length;

    return (
      <div className="table-container">
        <div className="table-header">
          <h3>
            <FaMoneyBillWave /> Payment Management ({filteredPayments.length})
            <span className="status-summary">
              <span className="confirmed-count">
                {confirmedPaymentsCount} Confirmed
              </span>
              <span className="pending-count">
                {pendingPaymentsCount} Pending
              </span>
            </span>
          </h3>
          <div className="table-actions">
            <button
              className="btn-secondary"
              onClick={() => exportToCSV(payments, "payments")}
              disabled={payments.length === 0}
            >
              <FaDownload /> Export CSV
            </button>
          </div>
        </div>

        {filteredPayments.length === 0 ? (
          <div className="no-data-message">No payments found.</div>
        ) : (
          <>
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Category</th>
                    <th>Amount</th>
                    <th>Transaction ID</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedPayments.map((payment) => {
                    // Normalize status for comparison
                    const normalizedStatus = payment.status
                      ? payment.status.toString().toLowerCase().trim()
                      : "pending";

                    return (
                      <tr key={payment.id || Math.random()}>
                        <td>{payment.id}</td>
                        <td>{payment.name}</td>
                        <td>{payment.email}</td>
                        <td>
                          <span
                            className={`category-badge ${payment.category}`}
                          >
                            {payment.category === "single" ? "Single" : "Story"}
                          </span>
                        </td>
                        <td>{payment.totalAmount?.toLocaleString()} BDT</td>
                        <td>
                          <code>{payment.transactionId}</code>
                        </td>
                        <td>
                          <span className={`status-badge ${normalizedStatus}`}>
                            {normalizedStatus === "pending"
                              ? "Pending"
                              : normalizedStatus === "rejected"
                              ? "Rejected"
                              : normalizedStatus === "confirmed"
                              ? "Confirmed"
                              : normalizedStatus}
                          </span>
                        </td>
                        <td className="actions-cell">
                          <button
                            className="action-btn view-btn"
                            onClick={() => {
                              setSelectedPayment(payment);
                              setShowPaymentModal(true);
                            }}
                            title="View Details"
                          >
                            <FaEye />
                          </button>

                          {/* Email Button - Show only for pending payments */}
                          {normalizedStatus === "pending" && (
                            <button
                              className="action-btn email-btn"
                              onClick={() => {
                                handleSendPaymentEmailGET(payment.id, payment);
                              }}
                              title="Send Confirmation Email"
                              style={{
                                border: "2px solid #17a2b8",
                                background: "rgba(23, 162, 184, 0.3)",
                                margin: "0 2px",
                                color: "#fff",
                                fontWeight: "bold",
                              }}
                            >
                              <FaEnvelope />
                            </button>
                          )}

                          {/* Show verify/reject buttons only for pending payments */}
                          {normalizedStatus === "pending" && (
                            <>
                              <button
                                className="action-btn reject-btn"
                                onClick={() => {
                                  handleUpdatePaymentStatus(
                                    payment.id,
                                    "rejected"
                                  );
                                }}
                                title="Reject Payment"
                              >
                                <FaTimes />
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <Pagination
              currentPage={currentPaymentsPage}
              totalPages={totalPaymentsPages}
              onPageChange={setCurrentPaymentsPage}
              dataType="payments"
            />
          </>
        )}
      </div>
    );
  };

  const renderResultsModal = () => (
    <div className="modal-overlay">
      <div className="modal-content large-modal">
        <div className="modal-header">
          <h3>{selectedResult ? "Edit Result" : "Add New Result"}</h3>
          <button
            className="modal-close"
            onClick={() => {
              setShowResultsModal(false);
              setSelectedResult(null);
            }}
          >
            ×
          </button>
        </div>
        <div className="modal-body">
          <div className="form-grid">
            <div className="form-group">
              <label>Name *</label>
              <input
                type="text"
                value={selectedResult ? selectedResult.name : newResult.name}
                onChange={(e) =>
                  selectedResult
                    ? setSelectedResult({
                        ...selectedResult,
                        name: e.target.value,
                      })
                    : setNewResult({ ...newResult, name: e.target.value })
                }
                required
              />
            </div>
            <div className="form-group">
              <label>Institute *</label>
              <input
                type="text"
                value={
                  selectedResult
                    ? selectedResult.institute
                    : newResult.institute
                }
                onChange={(e) =>
                  selectedResult
                    ? setSelectedResult({
                        ...selectedResult,
                        institute: e.target.value,
                      })
                    : setNewResult({ ...newResult, institute: e.target.value })
                }
                required
              />
            </div>
            <div className="form-group">
              <label>Category *</label>
              <select
                value={
                  selectedResult ? selectedResult.category : newResult.category
                }
                onChange={(e) =>
                  selectedResult
                    ? setSelectedResult({
                        ...selectedResult,
                        category: e.target.value,
                      })
                    : setNewResult({ ...newResult, category: e.target.value })
                }
              >
                <option value="single">Single Photo</option>
                <option value="story">Photo Story</option>
              </select>
            </div>
            <div className="form-group">
              <label>Number of Photos</label>
              <input
                type="number"
                min="1"
                value={
                  selectedResult ? selectedResult.photos : newResult.photos
                }
                onChange={(e) =>
                  selectedResult
                    ? setSelectedResult({
                        ...selectedResult,
                        photos: parseInt(e.target.value) || 1,
                      })
                    : setNewResult({
                        ...newResult,
                        photos: parseInt(e.target.value) || 1,
                      })
                }
              />
            </div>
            <div className="form-group">
              <label>Status</label>
              <select
                value={
                  selectedResult ? selectedResult.status : newResult.status
                }
                onChange={(e) =>
                  selectedResult
                    ? setSelectedResult({
                        ...selectedResult,
                        status: e.target.value,
                      })
                    : setNewResult({ ...newResult, status: e.target.value })
                }
              >
                <option value="selected">Selected</option>
                <option value="not-selected">Not Selected</option>
                <option value="pending">Pending</option>
              </select>
            </div>
            <div className="form-group">
              <label>Selected for Exhibition</label>
              <div className="checkbox-group">
                <input
                  type="checkbox"
                  checked={
                    selectedResult
                      ? selectedResult.selected
                      : newResult.selected
                  }
                  onChange={(e) =>
                    selectedResult
                      ? setSelectedResult({
                          ...selectedResult,
                          selected: e.target.checked,
                        })
                      : setNewResult({
                          ...newResult,
                          selected: e.target.checked,
                        })
                  }
                />
                <span>Mark as selected</span>
              </div>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button
            className="btn-secondary"
            onClick={() => {
              setShowResultsModal(false);
              setSelectedResult(null);
            }}
          >
            Cancel
          </button>
          <button
            className="btn-primary"
            onClick={() => {
              if (selectedResult) {
                handleUpdateResult(selectedResult.id, selectedResult);
              } else {
                handleAddResult();
              }
              setShowResultsModal(false);
              setSelectedResult(null);
            }}
          >
            {selectedResult ? "Update Result" : "Add Result"}
          </button>
        </div>
      </div>
    </div>
  );

  const renderPaymentModal = () => (
    <div className="modal-overlay">
      <div className="modal-content large-modal">
        <div className="modal-header">
          <h3>Payment Details</h3>
          <button
            className="modal-close"
            onClick={() => {
              setShowPaymentModal(false);
              setSelectedPayment(null);
            }}
          >
            ×
          </button>
        </div>
        <div className="modal-body">
          {selectedPayment && (
            <div className="payment-details">
              <div className="detail-row">
                <div className="detail-label">
                  <FaUser /> Name:
                </div>
                <div className="detail-value">{selectedPayment.name}</div>
              </div>
              <div className="detail-row">
                <div className="detail-label">
                  <FaEnvelope /> Email:
                </div>
                <div className="detail-value">{selectedPayment.email}</div>
              </div>
              <div className="detail-row">
                <div className="detail-label">
                  <FaPhone /> Phone:
                </div>
                <div className="detail-value">{selectedPayment.phone}</div>
              </div>
              <div className="detail-row">
                <div className="detail-label">
                  <FaUniversity /> Institute:
                </div>
                <div className="detail-value">{selectedPayment.institute}</div>
              </div>
              <div className="detail-row">
                <div className="detail-label">
                  <FaImage /> Category:
                </div>
                <div className="detail-value">
                  {selectedPayment.category === "single"
                    ? "Single Photo"
                    : "Photo Story"}
                </div>
              </div>
              <div className="detail-row">
                <div className="detail-label">Quantity:</div>
                <div className="detail-value">{selectedPayment.photoCount}</div>
              </div>
              <div className="detail-row">
                <div className="detail-label">
                  <FaTshirt /> T-Shirt Size:
                </div>
                <div className="detail-value">{selectedPayment.tshirtSize}</div>
              </div>
              <div className="detail-row">
                <div className="detail-label">
                  <FaHome /> Address:
                </div>
                <div className="detail-value">{selectedPayment.address}</div>
              </div>
              <div className="detail-row">
                <div className="detail-label">Payment Method:</div>
                <div className="detail-value">
                  {selectedPayment.paymentMethod === "bkash01"
                    ? "Bkash: 01885661159"
                    : selectedPayment.paymentMethod === "bkash02"
                    ? "Bkash: 01679861740"
                    : selectedPayment.paymentMethod === "nagad"
                    ? "Nagad: 01679861740"
                    : selectedPayment.paymentMethod === "rocket"
                    ? "Rocket: 01679861740"
                    : selectedPayment.paymentMethod}
                </div>
              </div>
              <div className="detail-row">
                <div className="detail-label">Transaction ID:</div>
                <div className="detail-value">
                  <code>{selectedPayment.transactionId}</code>
                </div>
              </div>
              <div className="detail-row">
                <div className="detail-label">Total Amount:</div>
                <div className="detail-value">
                  {selectedPayment.totalAmount?.toLocaleString()} BDT
                </div>
              </div>
              <div className="detail-row">
                <div className="detail-label">
                  <FaCalendar /> Submitted:
                </div>
                <div className="detail-value">
                  {new Date(selectedPayment.timestamp).toLocaleString()}
                </div>
              </div>
              <div className="detail-row">
                <div className="detail-label">Status:</div>
                <div className="detail-value">
                  <span className={`status-badge ${selectedPayment.status}`}>
                    {selectedPayment.status === "confiremed"
                      ? "Confirmed"
                      : selectedPayment.status === "pending"
                      ? "Pending"
                      : selectedPayment.status === "rejected"
                      ? "Rejected"
                      : selectedPayment.status}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button
            className="btn-secondary"
            onClick={() => {
              setShowPaymentModal(false);
              setSelectedPayment(null);
            }}
          >
            Close
          </button>

          {/* Email button in modal */}
          {selectedPayment && selectedPayment.status === "pending" && (
            <button
              className="btn-primary email-btn"
              onClick={() => {
                handleSendPaymentEmailGET(selectedPayment.id, selectedPayment);
                setShowPaymentModal(false);
                setSelectedPayment(null);
              }}
              style={{
                background: "rgba(23, 162, 184, 0.15)",
                border: "1px solid rgba(23, 162, 184, 0.3)",
                color: "#17a2b8",
              }}
            >
              <FaEnvelope /> Send Confirmation Email
            </button>
          )}

          {selectedPayment && selectedPayment.status === "pending" && (
            <>
              {/* <button
                className="btn-primary approve-btn"
                onClick={() => {
                  handleUpdatePaymentStatus(selectedPayment.id, "verified");
                  setShowPaymentModal(false);
                  setSelectedPayment(null);
                }}
              >
                <FaCheck /> Verify Payment
              </button> */}
              <button
                className="btn-primary reject-btn"
                onClick={() => {
                  handleUpdatePaymentStatus(selectedPayment.id, "rejected");
                  setShowPaymentModal(false);
                  setSelectedPayment(null);
                }}
              >
                <FaTimes /> Reject Payment
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return <Loading message="Loading results and payments..." />;
  }

  return (
    <div className="results-management">
      {/* Control Panel Header */}
      <div className="control-panel-header">
        <h2>Results & Payment Management</h2>

        {error && (
          <div className="connection-status error">
            <FaExclamationTriangle />
            <div className="status-message">
              <strong>Connection Issue:</strong> {error}
            </div>
            <div className="status-actions">
              <button className="btn-small" onClick={testConnection}>
                Test Connection
              </button>
              <button
                className="btn-small"
                onClick={() => setRefreshTrigger((prev) => prev + 1)}
              >
                Retry
              </button>
            </div>
          </div>
        )}



        <div className="stats-summary">
          <div className="stat-card">
            <FaTrophy />
            <div className="stat-content">
              <h3>{results.length}</h3>
              <p>Total Results</p>
            </div>
          </div>
          <div className="stat-card">
            <FaMoneyBillWave />
            <div className="stat-content">
              <h3>{payments.length}</h3>
              <p>Total Payments</p>
            </div>
          </div>
          <div className="stat-card">
            <FaCheck />
            <div className="stat-content">
              <h3>
                {
                  payments.filter(
                    (p) =>
                      p.status &&
                      p.status.toString().toLowerCase().trim() === "confirmed"
                  ).length
                }
              </h3>
              <p>Confirmed Payments</p>
            </div>
          </div>
          <div className="stat-card">
            <FaEnvelope />
            <div className="stat-content">
              <h3>
                {
                  payments.filter(
                    (p) =>
                      p.status &&
                      p.status.toString().toLowerCase().trim() === "pending"
                  ).length
                }
              </h3>
              <p>Pending (Emailable)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="filters-container">
        <div className="filter-group">
          <label>Select Event:</label>
          <select
            value={selectedEvent}
            onChange={(e) => {
              setSelectedEvent(e.target.value);
              setCurrentResultsPage(1);
              setCurrentPaymentsPage(1);
            }}
          >
            {events.map((event) => (
              <option key={event.id} value={event.id}>
                {event.name}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Category:</label>
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setCurrentResultsPage(1);
            }}
          >
            <option value="all">All Categories</option>
            <option value="single">Single Photo</option>
            <option value="story">Photo Story</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Status:</label>
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setCurrentResultsPage(1);
            }}
          >
            <option value="all">All Status</option>
            <option value="selected">Selected</option>
            <option value="not-selected">Not Selected</option>
            <option value="pending">Pending</option>
          </select>
        </div>

        <div className="search-group">
          <FaSearch />
          <input
            type="text"
            placeholder="Search by name, institute, email..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentResultsPage(1);
              setCurrentPaymentsPage(1);
            }}
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery("");
                setCurrentResultsPage(1);
                setCurrentPaymentsPage(1);
              }}
              className="clear-search"
            >
              ×
            </button>
          )}
        </div>

        <button
          className="btn-secondary"
          onClick={() => {
            setRefreshTrigger((prev) => prev + 1);
            setCurrentResultsPage(1);
            setCurrentPaymentsPage(1);
          }}
          style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
        >
          <FaSync /> Refresh
        </button>
      </div>

      {/* Results Section */}
      {renderResultsTable()}

      {/* Payments Section */}
      {renderPaymentsTable()}

      {/* Modals */}
      {showResultsModal && renderResultsModal()}
      {showPaymentModal && renderPaymentModal()}
    </div>
  );
};

export default ResultsManagement;
