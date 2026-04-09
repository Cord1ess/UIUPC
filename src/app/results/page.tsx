"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
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
import Loading from "@/components/Loading";
import "./ResultsPage.css";

const ResultsPage = () => {
  const params = useParams();
  const eventId = params.eventId as string;
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState("single");
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  // Pagination & Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const registrationEndDate = new Date("2025-12-19");
  const isRegistrationClosed = new Date() > registrationEndDate;

  // Google Apps Script Web App URL
  const GOOGLE_SCRIPT_URL = process.env.NEXT_PUBLIC_GAS_RESULTS_PUBLIC || (process.env as any).REACT_APP_GAS_RESULTS_PUBLIC || "";

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
      if (!GOOGLE_SCRIPT_URL) return;
      try {
        setLoading(true);
        const url = `${GOOGLE_SCRIPT_URL}?action=getResults&eventId=${
          eventId || "shutter-stories"
        }&_=${new Date().getTime()}`;

        const response = await fetch(url, {
          method: "GET",
          headers: { Accept: "application/json" },
        });

        const data = await response.json();
        if (data.error) throw new Error(data.error);

        setResults(data);
        setError(null);
      } catch (err: any) {
        console.error("Error fetching results:", err);
        setError(err.message);
        if (!results) {
          setResults({ success: true, title: "Selected Participants", singlePhotos: [], stories: [] });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [eventId, GOOGLE_SCRIPT_URL]);

  // Filter and pagination logic
  const displayResults = useMemo(() => {
    if (!results) return [];
    const categoryResults = selectedCategory === "single" ? results.singlePhotos || [] : results.stories || [];
    const filtered = categoryResults.filter((item: any) => {
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

  const totalItems = displayResults.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const currentItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return displayResults.slice(startIndex, startIndex + itemsPerPage);
  }, [displayResults, currentPage, itemsPerPage]);

  const handlePageChange = (pageNumber: number) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    setCurrentPage(pageNumber);
    const tableContainer = document.querySelector(".results-table-container");
    if (tableContainer) tableContainer.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleSearch = (e: any) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handlePaymentSubmit = async (e: any) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const unitPrice = paymentData.category === "single" ? 1020 : 3060;
      const totalAmount = unitPrice * paymentData.photoCount;

      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        body: JSON.stringify({
          action: "submitPayment",
          data: { ...paymentData, totalAmount },
        }),
      });

      const result = await response.json();
      if (result.success) {
        alert(`✅ Payment submitted successfully!\nPayment ID: ${result.paymentId}`);
        setShowPaymentForm(false);
      } else {
        throw new Error(result.error || "Payment failed");
      }
    } catch (err: any) {
      alert(`❌ Error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setPaymentData({ ...paymentData, [name]: value });
  };

  if (loading) return <Loading />;

  return (
    <div className="results-page">
      <div className="container">
        <div className="quick-nav-buttons">
          <button className="back-btn" onClick={() => router.push("/events")}>
            <FaArrowLeft /> Back to Events
          </button>
        </div>

        <div className="results-header">
          <FaTrophy className="trophy-icon" />
          <h1>{results?.title || "Selected Participants"}</h1>
          <p className="results-subtitle">Congratulations to all selected participants!</p>
        </div>

        <div className="category-tabs">
          <button className={`category-tab ${selectedCategory === "single" ? "active" : ""}`} onClick={() => { setSelectedCategory("single"); setCurrentPage(1); setSearchQuery(""); }}>
            <FaCamera /> Single Photos
          </button>
          <button className={`category-tab ${selectedCategory === "stories" ? "active" : ""}`} onClick={() => { setSelectedCategory("stories"); setCurrentPage(1); setSearchQuery(""); }}>
            <FaImages /> Photo Stories
          </button>
        </div>

        <div className="search-container">
          <div className="search-input-wrapper">
            <FaSearch className="search-icon" />
            <input type="text" placeholder="Search..." value={searchQuery} onChange={handleSearch} className="search-input" />
          </div>
        </div>

        <div className="results-table-container">
          <table className="results-table">
            <thead>
              <tr><th>#</th><th>Name</th><th>Institute</th><th>Photos</th><th>Status</th></tr>
            </thead>
            <tbody>
              {currentItems.map((result: any, index: number) => (
                <tr key={result.id || index} className={result.selected ? "selected-row" : ""}>
                  <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                  <td>{result.name}</td>
                  <td>{result.institute}</td>
                  <td>{result.photos}</td>
                  <td><span className={`status-badge ${result.selected ? "selected" : "not-selected"}`}>{result.selected ? "Selected" : "Not Selected"}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="payment-section">
          <h2>Registration for Exhibition</h2>
          <button className="btn-primary" onClick={() => isRegistrationClosed ? alert("Registration closed") : setShowPaymentForm(!showPaymentForm)}>
            {showPaymentForm ? "Hide Form" : "Register Now"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultsPage;
