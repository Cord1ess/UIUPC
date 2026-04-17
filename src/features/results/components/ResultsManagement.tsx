"use client";

import React, { useState, useEffect } from "react";
import { FaSync, FaExclamationTriangle, FaTrophy, FaMoneyBillWave, FaCheck, FaEnvelope, FaSearch } from "react-icons/fa";
import GlobalLoader from "@/components/shared/GlobalLoader";
import ResultsTable from "./ResultsTable";
import PaymentsTable from "./PaymentsTable";
import ResultModal from "./ResultModal";
import PaymentModal from "./PaymentModal";
import "./ResultsManagement.css";

interface ResultsManagementProps {
  scripts: Record<string, string>;
  user: any;
  onUpdate?: () => void;
}

const ResultsManagement: React.FC<ResultsManagementProps> = ({ scripts, user, onUpdate }) => {
  const [results, setResults] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState("shutter-stories");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedResult, setSelectedResult] = useState<any>(null);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [currentResultsPage, setCurrentResultsPage] = useState(1);
  const [currentPaymentsPage, setCurrentPaymentsPage] = useState(1);
  const itemsPerPage = 10;

  const [newResult, setNewResult] = useState<any>({
    eventId: "shutter-stories",
    name: "",
    institute: "",
    category: "single",
    photos: 1,
    selected: true,
    status: "selected",
  });

  const events = [
    { id: "shutter-stories", name: "Shutter Stories Chapter IV" },
    { id: "event-2", name: "Photo Exhibition 2024" },
    { id: "event-3", name: "Annual Competition" },
  ];

  useEffect(() => {
    fetchResults();
    fetchPayments();
  }, [selectedEvent, refreshTrigger]);

  const fetchResults = async () => {
    try {
      setLoading(true);
      const url = `${scripts.results}?action=getAllResults&eventId=${selectedEvent}&t=${Date.now()}`;
      const response = await fetch(url);
      const result = await response.json();
      if (result.success) {
        setResults(Array.isArray(result.data) ? result.data : []);
        setError(null);
      } else {
        throw new Error(result.error);
      }
    } catch (err: any) {
      console.error("Error fetching results:", err);
      setError(`Failed to load results: ${err.message}`);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPayments = async () => {
    try {
      const url = `${scripts.results}?action=getAllPayments&eventId=${selectedEvent}&t=${Date.now()}`;
      const response = await fetch(url);
      const result = await response.json();
      if (result.success) {
        setPayments(Array.isArray(result.data) ? result.data : []);
      }
    } catch (err) {
      console.error("Error fetching payments:", err);
      setPayments([]);
    }
  };

  const handleAddResult = async (data: any) => {
    try {
      const queryParams = new URLSearchParams({
        action: "addResult",
        ...data,
        eventId: selectedEvent,
        t: Date.now().toString(),
      }).toString();

      const response = await fetch(`${scripts.results}?${queryParams}`);
      const result = await response.json();
      if (result.success) {
        alert("Result added successfully!");
        setRefreshTrigger(p => p + 1);
        setShowResultsModal(false);
      } else {
        alert("Failed: " + result.error);
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  const handleUpdateResult = async (resultId: string, updatedData: any) => {
    try {
      const formData = new FormData();
      formData.append("action", "updateResult");
      formData.append("resultId", resultId);
      formData.append("data", JSON.stringify(updatedData));
      await fetch(scripts.results, { method: "POST", mode: "no-cors", body: formData });
      alert("Update submitted!");
      setRefreshTrigger(p => p + 1);
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  const handleDeleteResult = async (resultId: string) => {
    if (!window.confirm("Delete this result?")) return;
    try {
      const formData = new FormData();
      formData.append("action", "deleteResult");
      formData.append("resultId", resultId);
      await fetch(scripts.results, { method: "POST", mode: "no-cors", body: formData });
      alert("Delete submitted!");
      setRefreshTrigger(p => p + 1);
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  const handleUpdatePaymentStatus = async (paymentId: string, status: string) => {
    try {
      const queryParams = new URLSearchParams({
        action: "updatePaymentStatus",
        paymentId,
        status,
        t: Date.now().toString(),
      }).toString();
      const response = await fetch(`${scripts.results}?${queryParams}`);
      const result = await response.json();
      if (result.success) {
        alert("Payment status updated!");
        fetchPayments();
      } else {
        alert("Failed: " + result.error);
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  const handleSendEmail = async (paymentId: string, paymentData: any) => {
    if (!window.confirm(`Send confirmation email to ${paymentData.email}?`)) return;
    try {
      const url = `${scripts.results}?action=sendPaymentEmail&paymentId=${paymentId}&t=${Date.now()}`;
      const response = await fetch(url);
      const result = await response.json();
      if (result.success) alert("✅ Email sent!");
      else alert("❌ Failed: " + result.error);
    } catch (err: any) {
      alert("❌ Error: " + err.message);
    }
  };

  const exportCSV = (data: any[], filename: string) => {
    if (!data.length) return alert("No data to export");
    const headers = Object.keys(data[0]);
    const csvContent = [headers.join(","), ...data.map(r => headers.map(h => `"${r[h]}"`).join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${filename}.csv`;
    link.click();
  };

  if (loading && !results.length) return <GlobalLoader />;

  return (
    <div className="results-management">
      <div className="control-panel-header">
        <h2>Results & Payment Management</h2>
        <div className="stats-summary">
          <div className="stat-card">
            <FaTrophy />
            <div className="stat-content"><h3>{results.length}</h3><p>Results</p></div>
          </div>
          <div className="stat-card">
            <FaMoneyBillWave />
            <div className="stat-content"><h3>{payments.length}</h3><p>Payments</p></div>
          </div>
        </div>
      </div>

      <div className="filters-container">
        <div className="filter-group">
          <select value={selectedEvent} onChange={(e) => setSelectedEvent(e.target.value)}>
            {events.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>
        </div>
        <div className="filter-group">
          <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
            <option value="all">All Categories</option>
            <option value="single">Single Photo</option>
            <option value="story">Photo Story</option>
          </select>
        </div>
        <div className="search-group">
          <FaSearch />
          <input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
        <button className="btn-secondary" onClick={() => setRefreshTrigger(p => p + 1)}><FaSync /> Refresh</button>
      </div>

      <ResultsTable 
        results={results}
        selectedCategory={selectedCategory}
        currentResultsPage={currentResultsPage}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentResultsPage}
        onEdit={(r) => { setSelectedResult(r); setShowResultsModal(true); }}
        onDelete={handleDeleteResult}
        onAddResult={() => setShowResultsModal(true)}
        onExport={() => exportCSV(results, "results")}
      />

      <PaymentsTable 
        payments={payments}
        currentPage={currentPaymentsPage}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPaymentsPage}
        onViewDetails={(p) => { setSelectedPayment(p); setShowPaymentModal(true); }}
        onVerify={(id) => handleUpdatePaymentStatus(id, "confirmed")}
        onReject={(id) => handleUpdatePaymentStatus(id, "rejected")}
        onSendEmail={handleSendEmail}
        onExport={() => exportCSV(payments, "payments")}
      />

      {showResultsModal && (
        <ResultModal 
          selectedResult={selectedResult}
          newResult={newResult}
          onClose={() => { setShowResultsModal(false); setSelectedResult(null); }}
          onSave={(data) => selectedResult ? handleUpdateResult(selectedResult.id, data) : handleAddResult(data)}
          onInputChange={(field, value) => selectedResult ? setSelectedResult({...selectedResult, [field]: value}) : setNewResult({...newResult, [field]: value})}
        />
      )}

      {showPaymentModal && (
        <PaymentModal 
          payment={selectedPayment}
          onClose={() => { setShowPaymentModal(false); setSelectedPayment(null); }}
          onVerify={(id) => handleUpdatePaymentStatus(id, "confirmed")}
          onReject={(id) => handleUpdatePaymentStatus(id, "rejected")}
          onSendEmail={handleSendEmail}
        />
      )}
    </div>
  );
};

export default ResultsManagement;
