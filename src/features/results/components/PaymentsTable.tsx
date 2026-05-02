"use client";

import React from "react";
import { FaMoneyBillWave, FaEye, FaCheck, FaTimes, FaEnvelope, FaChevronLeft, FaChevronRight, FaDownload } from "react-icons/fa";
import { Payment } from "@/types";

interface PaymentsTableProps {
  payments: Payment[];
  currentPage: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onViewDetails: (payment: Payment) => void;
  onVerify: (id: string) => void;
  onReject: (id: string) => void;
  onSendEmail: (id: string, data: Payment) => void;
  onExport: () => void;
}

const PaymentsTable: React.FC<PaymentsTableProps> = ({
  payments,
  currentPage,
  itemsPerPage,
  onPageChange,
  onViewDetails,
  onVerify,
  onReject,
  onSendEmail,
  onExport
}) => {
  const totalPages = Math.ceil(payments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPayments = payments.slice(startIndex, startIndex + itemsPerPage);

  const renderPagination = () => {
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
        <span className="pagination-info">Page {currentPage} of {totalPages}</span>
        <button
          className="pagination-btn"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <FaChevronRight />
        </button>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-black uppercase tracking-tighter dark:text-white flex items-center gap-2">
          <FaMoneyBillWave className="text-green-500" /> Payment Records <span className="text-zinc-400 text-sm">({payments.length})</span>
        </h3>
        <div className="flex items-center gap-3">
          <button onClick={onExport} disabled={payments.length === 0} className="px-6 h-10 flex items-center gap-2 bg-white dark:bg-[#080808] border border-black/5 dark:border-white/5 text-zinc-600 dark:text-zinc-300 rounded-xl text-[10px] font-black uppercase tracking-widest hover:text-uiupc-orange disabled:opacity-50 transition-all">
            <FaDownload /> Download List
          </button>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full border-separate border-spacing-y-3">
          <thead>
            <tr className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">
              <th className="px-6 pb-2 text-left">Date</th>
              <th className="px-6 pb-2 text-left">Name</th>
              <th className="px-6 pb-2 text-left">Payment ID</th>
              <th className="px-6 pb-2 text-left">Amount Paid</th>
              <th className="px-6 pb-2 text-left">Verify Status</th>
              <th className="px-6 pb-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedPayments.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-12 text-[10px] font-black uppercase tracking-widest text-zinc-400">No payments found.</td></tr>
            ) : (
              paginatedPayments.map((payment, index) => {
                const status = (payment.status || 'pending').toLowerCase();
                return (
                  <tr key={payment.id || index} className="group">
                    <td className="px-6 py-5 bg-white dark:bg-[#080808] border-y border-l border-black/5 dark:border-white/5 rounded-l-2xl text-[10px] font-bold text-zinc-400">
                      {payment.timestamp ? new Date(payment.timestamp).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-5 bg-white dark:bg-[#080808] border-y border-black/5 dark:border-white/5 text-sm font-black text-zinc-900 dark:text-white uppercase tracking-tight">{payment.name}</td>
                    <td className="px-6 py-5 bg-white dark:bg-[#080808] border-y border-black/5 dark:border-white/5 text-[10px] font-bold text-zinc-400 font-mono tracking-widest">{payment.transactionId}</td>
                    <td className="px-6 py-5 bg-white dark:bg-[#080808] border-y border-black/5 dark:border-white/5 text-xs font-black text-green-500">{payment.amount} BDT</td>
                    <td className="px-6 py-5 bg-white dark:bg-[#080808] border-y border-black/5 dark:border-white/5">
                      <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                        status === 'verified' || status === 'confirmed' ? 'bg-green-500/10 text-green-500' :
                        status === 'rejected' ? 'bg-red-500/10 text-red-500' : 'bg-orange-500/10 text-orange-500'
                      }`}>
                        {status}
                      </span>
                    </td>
                    <td className="px-6 py-5 bg-white dark:bg-[#080808] border-y border-r border-black/5 dark:border-white/5 rounded-r-2xl text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => onViewDetails(payment)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:bg-uiupc-orange hover:text-white transition-all" title="View Details"><FaEye className="text-xs" /></button>
                        {status !== "verified" && status !== "confirmed" && (
                          <button onClick={() => onVerify(payment.id)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white transition-all" title="Verify Payment"><FaCheck className="text-xs" /></button>
                        )}
                        {status !== "rejected" && (
                          <button onClick={() => onReject(payment.id)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all" title="Reject"><FaTimes className="text-xs" /></button>
                        )}
                        <button onClick={() => onSendEmail(payment.id, payment)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white transition-all" title="Send Confirmation Email"><FaEnvelope className="text-xs" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden grid grid-cols-1 gap-4">
        {paginatedPayments.map((payment, i) => {
          const status = (payment.status || 'pending').toLowerCase();
          return (
            <div key={i} className="p-6 bg-white dark:bg-[#080808] border border-black/5 dark:border-white/5 rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-tight">{payment.name}</div>
                <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                  status === 'verified' || status === 'confirmed' ? 'bg-green-500/10 text-green-500' :
                  status === 'rejected' ? 'bg-red-500/10 text-red-500' : 'bg-orange-500/10 text-orange-500'
                }`}>
                  {status}
                </span>
              </div>
              <div className="flex justify-between items-center text-[10px] font-bold text-zinc-400">
                <span className="font-mono uppercase tracking-widest">{payment.transactionId}</span>
                <span className="text-green-500">{payment.amount} BDT</span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => onViewDetails(payment)} className="flex-1 py-2 text-center rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-500 text-[10px] font-black uppercase tracking-widest hover:bg-uiupc-orange hover:text-white transition-all">View</button>
                {status !== "verified" && status !== "confirmed" && (
                  <button onClick={() => onVerify(payment.id)} className="flex-1 py-2 text-center rounded-lg bg-green-500/10 text-green-500 text-[10px] font-black uppercase tracking-widest hover:bg-green-500 hover:text-white transition-all">Verify</button>
                )}
                {status !== "rejected" && (
                  <button onClick={() => onReject(payment.id)} className="flex-1 py-2 text-center rounded-lg bg-red-500/10 text-red-500 text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">Reject</button>
                )}
                <button onClick={() => onSendEmail(payment.id, payment)} className="w-8 py-2 text-center rounded-lg bg-blue-500/10 text-blue-500 text-[10px] font-black uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all flex items-center justify-center"><FaEnvelope /></button>
              </div>
            </div>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Page {currentPage} of {totalPages}</p>
          <div className="flex items-center gap-2">
            <button disabled={currentPage === 1} onClick={() => onPageChange(currentPage - 1)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white dark:bg-[#080808] border border-black/5 dark:border-white/5 text-zinc-400 disabled:opacity-30 hover:border-uiupc-orange hover:text-uiupc-orange transition-all"><FaChevronLeft className="text-xs" /></button>
            <button disabled={currentPage === totalPages} onClick={() => onPageChange(currentPage + 1)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white dark:bg-[#080808] border border-black/5 dark:border-white/5 text-zinc-400 disabled:opacity-30 hover:border-uiupc-orange hover:text-uiupc-orange transition-all"><FaChevronRight className="text-xs" /></button>
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(PaymentsTable);
