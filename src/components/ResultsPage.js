// components/ResultsPage.js
import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaTrophy,
  FaArrowLeft,
  FaCheckCircle,
  FaCamera,
  FaImages,
  FaSpinner,
  FaSearch,
  FaAngleLeft,
  FaAngleRight,
  FaAngleDoubleLeft,
  FaAngleDoubleRight,
} from "react-icons/fa";
import Loading from "./Loading";
import "./ResultsPage.css";

const ResultsPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("single");
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Pagination & Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const registrationEndDate = new Date("2025-12-19");
  const isRegistrationClosed = new Date() > registrationEndDate;

  // Google Apps Script Web App URL - FIXED URL (remove any trailing slashes)
  const GOOGLE_SCRIPT_URL = process.env.REACT_APP_GAS_RESULTS_PUBLIC;

  // Payment form state
  const [paymentData, setPaymentData] = useState({
    name: "",
    email: "",
    phone: "",
    institute: "",
    category: "single",
    photoCount: 1,
    tshirtSize: "M",
    address: "",
    paymentMethod: "bkash01",
    transactionId: "",
    eventId: eventId || "shutter-stories",
  });

  // Fetch results from Google Sheets
  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);

        // Build the URL with parameters
        const baseUrl = GOOGLE_SCRIPT_URL;
        const url = `${baseUrl}?action=getResults&eventId=${
          eventId || "shutter-stories"
        }&_=${new Date().getTime()}`;

        const response = await fetch(url, {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
          mode: "cors",
          credentials: "omit",
        });

        const responseText = await response.text();

        if (!response.ok) {
          console.error("HTTP error:", response.status);
          if (responseText) {
            try {
              const errorData = JSON.parse(responseText);
              throw new Error(
                errorData.error || `HTTP ${response.status}: ${responseText}`
              );
            } catch (e) {
              throw new Error(
                `HTTP ${response.status}: ${responseText.substring(0, 100)}`
              );
            }
          } else {
            throw new Error(
              `HTTP error ${response.status}: ${response.statusText}`
            );
          }
        }

        let data;
        try {
          data = JSON.parse(responseText);
        } catch (parseError) {
          throw new Error("Invalid JSON response from server");
        }

        if (data.error) {
          console.error("API error:", data.error);
          throw new Error(data.error);
        }

        setResults(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching results:", err);
        setError(err.message);

        // Use empty state instead of massive mock data
        if (!results) {
          setResults({
            success: true,
            title: "Selected Participants",
            singlePhotos: [],
            stories: [],
          });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [eventId]);

  // Filter and pagination logic
  const displayResults = useMemo(() => {
    if (!results) return [];

    const categoryResults =
      selectedCategory === "single"
        ? results.singlePhotos || []
        : results.stories || [];

    // Filter by search query
    const filtered = categoryResults.filter((item) => {
      if (!searchQuery.trim()) return true;

      const query = searchQuery.toLowerCase();
      return (
        item.name.toLowerCase().includes(query) ||
        item.institute.toLowerCase().includes(query) ||
        item.photos.toString().includes(query) ||
        (item.selected ? "selected" : "not selected").includes(query)
      );
    });

    return filtered;
  }, [results, selectedCategory, searchQuery]);

  // Calculate pagination
  const totalItems = displayResults.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Get current page items
  const currentItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return displayResults.slice(startIndex, endIndex);
  }, [displayResults, currentPage, itemsPerPage]);

  // Handle page change
  const handlePageChange = (pageNumber) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    setCurrentPage(pageNumber);
    // Scroll to top of table
    const tableContainer = document.querySelector(".results-table-container");
    if (tableContainer) {
      tableContainer.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Handle search
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const unitPrice = paymentData.category === "single" ? 1020 : 3060;
      const totalAmount = unitPrice * paymentData.photoCount;

      const paymentPayload = {
        name: paymentData.name,
        email: paymentData.email,
        phone: paymentData.phone,
        institute: paymentData.institute,
        category: paymentData.category,
        photoCount: paymentData.photoCount,
        tshirtSize: paymentData.tshirtSize,
        address: paymentData.address,
        paymentMethod: paymentData.paymentMethod,
        transactionId: paymentData.transactionId,
        totalAmount: totalAmount,
        eventId: paymentData.eventId,
      };

      const url = GOOGLE_SCRIPT_URL;
      const response = await fetch(url, {
        method: "POST",
        body: JSON.stringify({
          action: "submitPayment",
          data: paymentPayload,
        }),
      });

      const result = await response.json();

      if (result.success) {
        alert(
          `✅ Payment submitted successfully!\nPayment ID: ${result.paymentId}\nWe will verify your transaction.`
        );

        setPaymentData({
          name: "",
          email: "",
          phone: "",
          institute: "",
          category: "single",
          photoCount: 1,
          tshirtSize: "M",
          address: "",
          paymentMethod: "bkash01",
          transactionId: "",
          eventId: eventId || "shutter-stories",
        });

        setShowPaymentForm(false);
      } else {
        throw new Error(result.error || "Payment failed");
      }
    } catch (err) {
      console.error("Payment error:", err);
      alert(
        `❌ Error: ${err.message}\n\nPlease save your details and contact support.`
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPaymentData({
      ...paymentData,
      [name]: value,
    });
  };

  if (loading) {
    return (
      <div className="results-page">
        <div className="container">
          <div className="loading-container">
            <Loading message="Loading results..." />
          </div>
        </div>
      </div>
    );
  }

  if (error && !results) {
    return (
      <div className="results-page">
        <div className="container">
          <div className="error-state">
            <p>Error: {error}</p>
            <button onClick={() => navigate("/events")} className="btn-primary">
              Back to Events
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="results-page">
      <div className="container">
        <div className="quick-nav-buttons">
          <button className="back-btn" onClick={() => navigate("/events")}>
            <FaArrowLeft /> Back to Events
          </button>

          <button
            className="jump-to-registration-btn"
            onClick={() => {
              const paymentSection = document.querySelector(".payment-section");
              if (paymentSection) {
                paymentSection.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                });
                // Optionally open the registration form automatically
                // if (!showPaymentForm) {
                //   setTimeout(() => {
                //     setShowPaymentForm(true);
                //   }, 500);
                // }
              }
            }}
          >
            <FaCheckCircle /> Jump to Registration
          </button>
        </div>

        <div className="results-header">
          <FaTrophy className="trophy-icon" />
          <h1>{results?.title || "Selected Participants"}</h1>
          <p className="results-subtitle">
            Congratulations to all selected participants for the exhibition!
          </p>
        </div>

        <div className="category-tabs">
          <button
            className={`category-tab ${
              selectedCategory === "single" ? "active" : ""
            }`}
            onClick={() => {
              setSelectedCategory("single");
              setCurrentPage(1);
              setSearchQuery("");
            }}
          >
            <FaCamera /> Single Photos
          </button>
          <button
            className={`category-tab ${
              selectedCategory === "stories" ? "active" : ""
            }`}
            onClick={() => {
              setSelectedCategory("stories");
              setCurrentPage(1);
              setSearchQuery("");
            }}
          >
            <FaImages /> Photo Stories
          </button>
        </div>

        {/* Search Bar */}
        <div className="search-container">
          <div className="search-input-wrapper">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder={`Search ${
                selectedCategory === "single"
                  ? "Single Photos"
                  : "Photo Stories"
              } by name, institute, or status...`}
              value={searchQuery}
              onChange={handleSearch}
              className="search-input"
            />
            {searchQuery && (
              <button
                className="clear-search-btn"
                onClick={() => setSearchQuery("")}
                aria-label="Clear search"
              >
                &times;
              </button>
            )}
          </div>
          <div className="search-info">
            <span className="results-count">
              Showing {currentItems.length} of {totalItems} results
              {searchQuery && ` for "${searchQuery}"`}
            </span>
          </div>
        </div>

        <div className="results-table-container">
          <table className="results-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Institute</th>
                <th>Photos</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length > 0 ? (
                currentItems.map((result, index) => {
                  const globalIndex =
                    (currentPage - 1) * itemsPerPage + index + 1;
                  return (
                    <tr
                      key={result.id}
                      className={result.selected ? "selected-row" : ""}
                    >
                      <td className="index-cell">{globalIndex}</td>
                      <td>{result.name}</td>
                      <td>{result.institute}</td>
                      <td>{result.photos}</td>
                      <td className="status-cell">
                        <span
                          className={`status-badge ${
                            result.selected ? "selected" : "not-selected"
                          }`}
                        >
                          {result.selected ? "Selected" : "Not Selected"}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    style={{ textAlign: "center", padding: "2rem" }}
                  >
                    {searchQuery
                      ? `No results found for "${searchQuery}"`
                      : "No results found for this category."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="pagination-controls">
              <button
                className="pagination-btn first-page"
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
                aria-label="First page"
              >
                <FaAngleDoubleLeft />
              </button>
              <button
                className="pagination-btn prev-page"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                aria-label="Previous page"
              >
                <FaAngleLeft /> Prev
              </button>

              <div className="page-numbers">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((page) => {
                    // Show first, last, current, and pages around current
                    if (page === 1 || page === totalPages) return true;
                    if (Math.abs(page - currentPage) <= 2) return true;
                    return false;
                  })
                  .map((page, index, array) => {
                    // Add ellipsis for gaps
                    const showEllipsis =
                      index > 0 && page - array[index - 1] > 1;
                    return (
                      <React.Fragment key={page}>
                        {showEllipsis && (
                          <span className="page-ellipsis">...</span>
                        )}
                        <button
                          className={`page-number ${
                            currentPage === page ? "active" : ""
                          }`}
                          onClick={() => handlePageChange(page)}
                        >
                          {page}
                        </button>
                      </React.Fragment>
                    );
                  })}
              </div>

              <button
                className="pagination-btn next-page"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                aria-label="Next page"
              >
                Next <FaAngleRight />
              </button>
              <button
                className="pagination-btn last-page"
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
                aria-label="Last page"
              >
                <FaAngleDoubleRight />
              </button>
            </div>
          )}
        </div>

        {/* Payment Section - Remains the same */}
        <div className="payment-section">
          {/* ... (payment section code remains exactly as you have it) ... */}
          <div className="payment-header">
            <h2>Registration for Exhibition</h2>
            <p className="payment-subtitle">
              Selected participants can register to participate in the
              exhibition. Fees cover exhibition costs and certificate
              processing.
            </p>
          </div>

          <div className="price-cards">
            <div className="price-card">
              <h3>Single Photo</h3>
              <div className="price">1,020 BDT</div>
              <p>Per photo for exhibition</p>
              <ul className="price-features">
                <li>
                  <FaCheckCircle /> Exhibition Display
                </li>
                <li>
                  <FaCheckCircle /> Participation Certificate
                </li>
                <li>
                  <FaCheckCircle /> Photo Frame + Event T-Shirt + Goodies
                </li>
                <li>
                  <FaCheckCircle /> Prize Money for Winners
                </li>
              </ul>
            </div>
            <div className="price-card featured">
              <h3>Photo Story</h3>
              <div className="price">3,060 BDT</div>
              <p>Per story (6-12 photos)</p>
              <ul className="price-features">
                <li>
                  <FaCheckCircle /> Full Story Display
                </li>
                <li>
                  <FaCheckCircle /> Participation Certificate
                </li>
                <li>
                  <FaCheckCircle /> Photo Frame + Event T-Shirt + Goodies
                </li>
                <li>
                  <FaCheckCircle /> Prize Money for Winners
                </li>
              </ul>
            </div>
          </div>

          <button
            className="btn-primary payment-toggle-btn"
            onClick={() => {
              if (isRegistrationClosed) {
                alert("Sorry! Registration is closed.");
              } else {
                setShowPaymentForm(!showPaymentForm);
              }
            }}
            disabled={submitting}
          >
            {showPaymentForm
              ? "Hide Registration Form"
              : "Register for Exhibition"}
          </button>

          {/* <button
            className="btn-primary payment-toggle-btn"
            onClick={() => setShowPaymentForm(!showPaymentForm)}
            disabled={submitting}
          >
            {showPaymentForm
              ? "Hide Registration Form"
              : "Register for Exhibition"}
          </button> */}

          {showPaymentForm && (
            <form className="payment-form" onSubmit={handlePaymentSubmit}>
              <h3>Registration & Payment Form</h3>

              <div className="form-grid">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={paymentData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter your full name"
                    disabled={submitting}
                  />
                </div>

                <div className="form-group">
                  <label>Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    value={paymentData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter your email"
                    disabled={submitting}
                  />
                </div>

                <div className="form-group">
                  <label>Phone Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={paymentData.phone}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter your phone number"
                    disabled={submitting}
                  />
                </div>

                <div className="form-group">
                  <label>Institute Name *</label>
                  <input
                    type="text"
                    name="institute"
                    value={paymentData.institute}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter your institute name"
                    disabled={submitting}
                  />
                </div>

                <div className="form-group">
                  <label>Photo Category *</label>
                  <select
                    name="category"
                    value={paymentData.category}
                    onChange={handleInputChange}
                    required
                    disabled={submitting}
                  >
                    <option value="single">
                      Single Photo - 1,020 BDT per photo
                    </option>
                    <option value="stories">
                      Photo Story - 3,060 BDT per story
                    </option>
                  </select>
                </div>

                <div className="form-group">
                  <label>How many photos/stories? *</label>
                  <input
                    type="number"
                    name="photoCount"
                    value={paymentData.photoCount}
                    onChange={handleInputChange}
                    min="1"
                    max="10"
                    required
                    disabled={submitting}
                  />
                  <small>Maximum 10 entries per person</small>
                </div>

                <div className="form-group">
                  <label>T-Shirt Size *</label>
                  <select
                    name="tshirtSize"
                    value={paymentData.tshirtSize}
                    onChange={handleInputChange}
                    required
                    disabled={submitting}
                  >
                    <option value="S">Small (S)</option>
                    <option value="M">Medium (M)</option>
                    <option value="L">Large (L)</option>
                    <option value="XL">Extra Large (XL)</option>
                    <option value="XXL">Double Extra Large (XXL)</option>
                  </select>
                </div>

                <div className="form-group full-width">
                  <label>Home Address *</label>
                  <textarea
                    name="address"
                    value={paymentData.address}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter your complete address for shipping"
                    rows="3"
                    disabled={submitting}
                  />
                </div>

                <div className="form-group">
                  <label>Payment Method *</label>
                  <select
                    name="paymentMethod"
                    value={paymentData.paymentMethod}
                    onChange={handleInputChange}
                    required
                    disabled={submitting}
                  >
                    <option value="bkash01">
                      Bkash01: 01885661159 (Personal)
                    </option>
                    <option value="bkash02">
                      Bkash02: 01679861740 (Personal)
                    </option>
                    <option value="nagad">Nagad: 01679861740 (Personal)</option>
                    <option value="rocket">
                      Rocket: 01679861740 (Personal)
                    </option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Transaction ID *</label>
                  <input
                    type="text"
                    name="transactionId"
                    value={paymentData.transactionId}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter your transaction ID"
                    disabled={submitting}
                  />
                </div>
              </div>

              <div className="payment-summary">
                <h4>Payment Summary</h4>
                <div className="summary-row">
                  <span>Category:</span>
                  <span>
                    {paymentData.category === "single"
                      ? "Single Photo"
                      : "Photo Story"}
                  </span>
                </div>
                <div className="summary-row">
                  <span>Quantity:</span>
                  <span>{paymentData.photoCount}</span>
                </div>
                <div className="summary-row">
                  <span>Price per item:</span>
                  <span>
                    {paymentData.category === "single" ? "1,020" : "3,060"} BDT
                  </span>
                </div>
                <div className="summary-row total">
                  <span>Total Amount:</span>
                  <span>
                    {paymentData.category === "single"
                      ? (1020 * paymentData.photoCount).toLocaleString()
                      : (3060 * paymentData.photoCount).toLocaleString()}{" "}
                    BDT
                  </span>
                </div>
              </div>

              <div className="payment-instructions">
                <h4>Payment Instructions:</h4>
                <ol>
                  <li>Send money to the selected payment number</li>
                  <li>Keep the transaction ID safe</li>
                  <li>Enter the transaction ID in the form</li>
                  <li>Submit the form after payment</li>
                  <li>We will verify payment within 24 hours</li>
                  <li>
                    For any queries: 01783503006 (Md Zobaer Ahmed - Act. Head of
                    HR, UIU)
                  </li>
                </ol>
              </div>

              <button
                type="submit"
                className="btn-primary submit-payment-btn"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <FaSpinner className="spinner" /> Submitting...
                  </>
                ) : (
                  "Submit Payment"
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResultsPage;
