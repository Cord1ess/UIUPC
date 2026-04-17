"use client";

import React, { useState, useMemo } from 'react';
import { FaSearch, FaFilter, FaSync, FaFileExport, FaEye, FaCheck, FaTimes, FaClock, FaChevronLeft, FaChevronRight, FaFileAlt, FaEnvelope } from 'react-icons/fa';
import GlobalLoader from '@/components/shared/GlobalLoader';

interface MembershipApplicationsProps {
  data: any[];
  loading: boolean;
  searchTerm: string;
  filterStatus: string;
  onSearchChange: (value: string) => void;
  onFilterChange: (value: string) => void;
  onRefresh: () => void | Promise<any>;
  onExport: () => void;
  onViewDetails: (item: Record<string, any>) => void;
  onEmailReply: (item: Record<string, any>) => void;
  onUpdateStatus: (id: string, status: string) => void | Promise<void>;
}

export const MembershipApplications: React.FC<MembershipApplicationsProps> = ({
  data, loading, searchTerm, filterStatus,
  onSearchChange, onFilterChange, onRefresh, onExport, onViewDetails, onEmailReply, onUpdateStatus
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredData = useMemo(() => {
    if (!Array.isArray(data)) return [];
    return data.filter(item => {
      const name = String(item["Full Name"] || item.name || "").toLowerCase();
      const email = String(item.Email || item.email || "").toLowerCase();
      const studentId = String(item["Student ID"] || item.studentId || "").toLowerCase();
      const matchesSearch = name.includes(searchTerm.toLowerCase()) || email.includes(searchTerm.toLowerCase()) || studentId.includes(searchTerm.toLowerCase());
      const status = String(item.Status || item.status || "pending").toLowerCase();
      const matchesFilter = filterStatus === "all" || status === filterStatus.toLowerCase();
      return matchesSearch && matchesFilter;
    });
  }, [data, searchTerm, filterStatus]);

  const sortedData = useMemo(() => {
    return [...filteredData].sort((a, b) => new Date(b.Timestamp || b.timestamp).getTime() - new Date(a.Timestamp || a.timestamp).getTime());
  }, [filteredData]);

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const currentItems = sortedData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (loading && data.length === 0) return <GlobalLoader />;

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row gap-6 items-stretch lg:items-center justify-between">
        <div className="relative flex-1">
          <FaSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
          <input type="text" placeholder="Filter by name, email, or student ID..." value={searchTerm} onChange={(e) => onSearchChange(e.target.value)}
            className="w-full py-4 pl-12 pr-6 bg-white dark:bg-[#080808] border border-black/5 dark:border-white/5 rounded-2xl text-sm outline-none focus:border-uiupc-orange transition-all" />
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-3 bg-white dark:bg-[#080808] border border-black/5 dark:border-white/5 rounded-2xl px-4 py-2">
            <FaFilter className="text-uiupc-orange text-xs" />
            <select value={filterStatus} onChange={(e) => onFilterChange(e.target.value)}
              className="bg-transparent text-[10px] font-black uppercase tracking-widest outline-none dark:text-white">
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <button onClick={onRefresh} className="w-12 h-12 flex items-center justify-center bg-white dark:bg-[#080808] border border-black/5 dark:border-white/5 rounded-2xl text-zinc-400 hover:text-uiupc-orange transition-all">
            <FaSync className={loading ? 'animate-spin' : ''} />
          </button>
          <button onClick={onExport} className="px-6 h-12 flex items-center gap-2 bg-uiupc-orange text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all shadow-lg shadow-uiupc-orange/10">
            <FaFileExport /> Export
          </button>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full border-separate border-spacing-y-3">
          <thead>
            <tr className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">
              <th className="px-6 pb-2 text-left">Applicant</th>
              <th className="px-6 pb-2 text-left">ID &amp; Dept</th>
              <th className="px-6 pb-2 text-left">Date</th>
              <th className="px-6 pb-2 text-left">Status</th>
              <th className="px-6 pb-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((item, i) => {
              const status = (item.Status || item.status || "pending").toLowerCase();
              return (
                <tr key={i} className="group">
                  <td className="px-6 py-5 bg-white dark:bg-[#080808] border-y border-l border-black/5 dark:border-white/5 rounded-l-2xl">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-xs font-black text-zinc-400">
                        {(item["Full Name"] || item.name || "?").charAt(0)}
                      </div>
                      <div className="space-y-0.5">
                        <div className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-tight">{item["Full Name"] || item.name}</div>
                        <div className="text-[10px] font-bold text-zinc-400 truncate max-w-[150px]">{item.Email || item.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 bg-white dark:bg-[#080808] border-y border-black/5 dark:border-white/5">
                    <div className="text-[10px] font-black text-zinc-900 dark:text-white uppercase tracking-widest">{item["Student ID"] || item.studentId}</div>
                    <div className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">{item.Department || item.department}</div>
                  </td>
                  <td className="px-6 py-5 bg-white dark:bg-[#080808] border-y border-black/5 dark:border-white/5">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-400">
                      <FaClock className="text-[8px]" />
                      {new Date(item.Timestamp || item.timestamp).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-5 bg-white dark:bg-[#080808] border-y border-black/5 dark:border-white/5">
                    <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                      status === 'approved' ? 'bg-green-500/10 text-green-500' :
                      status === 'rejected' ? 'bg-red-500/10 text-red-500' : 'bg-orange-500/10 text-orange-500'
                    }`}>{status}</span>
                  </td>
                  <td className="px-6 py-5 bg-white dark:bg-[#080808] border-y border-r border-black/5 dark:border-white/5 rounded-r-2xl text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => onViewDetails(item)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:bg-uiupc-orange hover:text-white transition-all"><FaEye className="text-xs" /></button>
                      <button onClick={() => onEmailReply(item)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white transition-all"><FaEnvelope className="text-xs" /></button>
                      <button onClick={() => onUpdateStatus(item.id || item.Timestamp, 'approved')} className="w-8 h-8 flex items-center justify-center rounded-lg bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white transition-all"><FaCheck className="text-xs" /></button>
                      <button onClick={() => onUpdateStatus(item.id || item.Timestamp, 'rejected')} className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all"><FaTimes className="text-xs" /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden grid grid-cols-1 gap-4">
        {currentItems.map((item, i) => {
          const status = (item.Status || item.status || "pending").toLowerCase();
          return (
            <div key={i} className="p-6 bg-white dark:bg-[#080808] border border-black/5 dark:border-white/5 rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-tight">{item["Full Name"] || item.name}</div>
                <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                  status === 'approved' ? 'bg-green-500/10 text-green-500' :
                  status === 'rejected' ? 'bg-red-500/10 text-red-500' : 'bg-orange-500/10 text-orange-500'
                }`}>{status}</span>
              </div>
              <div className="text-[10px] font-bold text-zinc-400">{item.Email || item.email}</div>
              <div className="flex items-center gap-2">
                <button onClick={() => onViewDetails(item)} className="flex-1 py-2 text-center rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-500 text-[10px] font-black uppercase tracking-widest hover:bg-uiupc-orange hover:text-white transition-all">View</button>
                <button onClick={() => onEmailReply(item)} className="flex-1 py-2 text-center rounded-lg bg-blue-500/10 text-blue-500 text-[10px] font-black uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all">Email</button>
                <button onClick={() => onUpdateStatus(item.id || item.Timestamp, 'approved')} className="flex-1 py-2 text-center rounded-lg bg-green-500/10 text-green-500 text-[10px] font-black uppercase tracking-widest hover:bg-green-500 hover:text-white transition-all">Approve</button>
                <button onClick={() => onUpdateStatus(item.id || item.Timestamp, 'rejected')} className="flex-1 py-2 text-center rounded-lg bg-red-500/10 text-red-500 text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">Reject</button>
              </div>
            </div>
          );
        })}
      </div>

      {sortedData.length === 0 && !loading && (
        <div className="py-24 text-center space-y-4">
          <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-900 rounded-2xl flex items-center justify-center mx-auto text-2xl text-zinc-300"><FaFileAlt /></div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">No applications found</p>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-8 border-t border-black/5 dark:border-white/5">
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Page {currentPage} of {totalPages}</p>
          <div className="flex items-center gap-2">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => Math.max(1, p - 1))} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white dark:bg-[#080808] border border-black/5 dark:border-white/5 text-zinc-400 disabled:opacity-30 hover:border-uiupc-orange hover:text-uiupc-orange transition-all"><FaChevronLeft className="text-xs" /></button>
            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white dark:bg-[#080808] border border-black/5 dark:border-white/5 text-zinc-400 disabled:opacity-30 hover:border-uiupc-orange hover:text-uiupc-orange transition-all"><FaChevronRight className="text-xs" /></button>
          </div>
        </div>
      )}
    </div>
  );
};

// Removed default export
