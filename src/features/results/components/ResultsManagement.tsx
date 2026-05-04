"use client";

import React, { useState, useEffect } from "react";
import { IconSync, IconExclamationTriangle, IconTrophy, IconMoneyBillWave, IconCheck, IconEnvelope, IconSearch } from "@/components/shared/Icons";

import { Result, Payment } from "@/types";
import ResultsTable from "./ResultsTable";
import PaymentsTable from "./PaymentsTable";
import ResultModal from "./ResultModal";
import PaymentModal from "./PaymentModal";

interface ResultsManagementProps {
  scripts: Record<string, string>;
  user: {
    email?: string;
    id?: string;
    [key: string]: any;
  } | null;
  onUpdate?: () => void;
}

import { supabase } from "@/lib/supabase";

const ResultsManagement: React.FC<ResultsManagementProps> = ({ scripts, user, onUpdate }) => {
  const [results, setResults] = useState<Result[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState("shutter-stories");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedResult, setSelectedResult] = useState<Result | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [currentResultsPage, setCurrentResultsPage] = useState(1);
  const [currentPaymentsPage, setCurrentPaymentsPage] = useState(1);
  const itemsPerPage = 10;

  const [newResult, setNewResult] = useState<Partial<Result>>({
    name: "",
    institute: "",
    category: "single",
    photos: 1,
    selected: true,
    status: "selected",
  });

  const events = [
    { id: "shutter-stories", name: "Shutter Stories Chapter IV" },
  ];

  useEffect(() => {
    fetchResults();
    fetchPayments();
  }, [selectedEvent, refreshTrigger]);

  const fetchResults = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('results')
        .select('*')
        .eq('event_id', selectedEvent)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const mapped = (data || []).map(r => ({
        id: r.id,
        name: r.participant_name,
        institute: r.institute,
        category: r.category,
        photos: r.photo_count,
        status: r.status,
        selected: r.selected
      }));

      setResults(mapped);
      setError(null);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error("Error fetching results:", err);
      setError(`Failed to load results: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchPayments = async () => {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('event_id', selectedEvent)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mapped = (data || []).map(p => ({
        id: p.id,
        name: p.name,
        email: p.email,
        phone: p.phone,
        institute: p.institute,
        category: p.category,
        photoCount: p.photo_count,
        tshirtSize: p.tshirt_size,
        address: p.address,
        paymentMethod: p.payment_method,
        transactionId: p.transaction_id,
        amount: p.amount,
        status: p.status,
        timestamp: p.timestamp || p.created_at,
        eventId: p.event_id
      }));

      setPayments(mapped);
    } catch (err) {
      console.error("Error fetching payments:", err);
    }
  };

  const handleAddResult = async (data: Partial<Result>) => {
    try {
      const { error } = await supabase.from('results').insert([{
        event_id: selectedEvent,
        participant_name: data.name,
        institute: data.institute,
        category: data.category,
        photo_count: data.photos,
        status: data.status,
        selected: data.selected
      }]);

      if (error) throw error;
      alert("Result added successfully!");
      setRefreshTrigger(p => p + 1);
      setShowResultsModal(false);
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  const handleUpdateResult = async (resultId: string, updatedData: Partial<Result>) => {
    try {
      const { error } = await supabase.from('results').update({
        participant_name: updatedData.name,
        institute: updatedData.institute,
        category: updatedData.category,
        photo_count: updatedData.photos,
        status: updatedData.status,
        selected: updatedData.selected
      }).eq('id', resultId);

      if (error) throw error;
      alert("Result updated!");
      setRefreshTrigger(p => p + 1);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      alert("Error: " + errorMessage);
    }
  };

  const handleDeleteResult = async (resultId: string) => {
    if (!window.confirm("Delete this result?")) return;
    try {
      const { error } = await supabase.from('results').delete().eq('id', resultId);
      if (error) throw error;
      alert("Result deleted!");
      setRefreshTrigger(p => p + 1);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      alert("Error: " + errorMessage);
    }
  };

  const handleUpdatePaymentStatus = async (paymentId: string, status: string) => {
    try {
      const { error } = await supabase.from('payments').update({ status }).eq('id', paymentId);
      if (error) throw error;
      alert(`Payment ${status}!`);
      fetchPayments();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      alert("Error: " + errorMessage);
    }
  };

  const handleSendEmail = async (paymentId: string, paymentData: Payment) => {
    if (!window.confirm(`Send confirmation email to ${paymentData.email}?`)) return;
    try {
      // NOTE: Email sending still requires a server-side trigger (like a GAS or Edge Function)
      // For now, we'll keep the GAS call for emails OR suggest an Edge Function
      const url = `${scripts.results}?action=sendPaymentEmail&paymentId=${paymentId}&t=${Date.now()}`;
      const response = await fetch(url);
      const result = await response.json();
      if (result.success) alert("✅ Email sent!");
      else alert("❌ Failed: " + result.error);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      alert("❌ Error: " + errorMessage);
    }
  };

  const exportCSV = (data: (Result | Payment)[], filename: string) => {
    if (!data.length) return alert("No data to export");
    const headers = Object.keys(data[0]) as (keyof (Result | Payment))[];
    const csvContent = [headers.join(","), ...data.map(r => headers.map(h => `"${(r as any)[h]}"`).join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${filename}.csv`;
    link.click();
  };

  if (loading && !results.length) {
    return (
      <div className="w-full py-32 flex items-center justify-center">
        <IconSync size={40} className="animate-spin text-uiupc-orange" />
      </div>
    );
  }

  return (
    <div className="w-full space-y-8 min-w-0">
      {/* Search & Actions Header */}
      <div className="w-full bg-zinc-100 dark:bg-[#050505] p-4 md:p-6 rounded-3xl border border-black/5 dark:border-white/5">
        <div className="flex flex-col lg:flex-row gap-6 items-stretch lg:items-center justify-between">
        <div className="relative flex-1">
          <IconSearch size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
          <input 
            type="text" 
            placeholder="Search..." 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full py-4 pl-12 pr-6 bg-white dark:bg-[#080808] border border-black/5 dark:border-white/5 rounded-2xl text-sm outline-none focus:border-uiupc-orange transition-all" 
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200">
              ×
            </button>
          )}
        </div>
        <div className="flex items-center gap-3">
          <select 
            value={selectedEvent} 
            onChange={(e) => setSelectedEvent(e.target.value)}
            className="h-10 px-4 rounded-xl bg-white dark:bg-[#080808] border border-black/5 dark:border-white/5 text-xs outline-none focus:border-uiupc-orange"
          >
            {events.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>
          <select 
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="h-10 px-4 rounded-xl bg-white dark:bg-[#080808] border border-black/5 dark:border-white/5 text-xs outline-none focus:border-uiupc-orange"
          >
            <option value="all">All Submission Types</option>
            <option value="single">Single Photos</option>
            <option value="story">Photo Stories</option>
          </select>
          <button 
            onClick={() => setRefreshTrigger(p => p + 1)} 
            className="h-10 px-4 rounded-xl bg-white dark:bg-[#080808] border border-black/5 dark:border-white/5 text-zinc-600 dark:text-zinc-300 hover:text-uiupc-orange dark:hover:text-uiupc-orange transition-all flex items-center gap-2 text-xs font-bold"
          >
            <IconSync size={12} /> Update Data
          </button>
        </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-6 bg-zinc-100 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-2xl flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-2">
            <IconTrophy size={20} className="text-uiupc-orange" />
            <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Total Entries</h3>
          </div>
          <p className="text-3xl font-black">{results.length}</p>
        </div>
        <div className="p-6 bg-zinc-100 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-2xl flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-2">
            <IconMoneyBillWave size={20} className="text-green-500" />
            <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Paid Accounts</h3>
          </div>
          <p className="text-3xl font-black">{payments.length}</p>
        </div>
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
