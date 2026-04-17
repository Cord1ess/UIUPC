"use client";

import React, { useState, useMemo } from 'react';
import { FaSearch, FaFilter, FaEye, FaEnvelope, FaClock, FaChevronLeft, FaChevronRight, FaCamera, FaFileAlt } from 'react-icons/fa';
import GlobalLoader from '@/components/shared/GlobalLoader';

interface PhotoSubmissionsProps {
  data: any[];
  loading: boolean;
  searchTerm: string;
  filterStatus: string;
  onSearchChange: (value: string) => void;
  onFilterChange: (value: string) => void;
  onRefresh: () => void | Promise<any>;
  onExport: () => void;
  onViewDetails: (item: any) => void;
  onEmailReply: (item: any) => void;
}

export const PhotoSubmissions: React.FC<PhotoSubmissionsProps> = ({
  data, loading, searchTerm, filterStatus,
  onSearchChange, onFilterChange, onRefresh, onExport, onViewDetails, onEmailReply
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredData = useMemo(() => {
    if (!Array.isArray(data)) return [];
    return data.filter(item => {
      const name = String(item.Name || item.name || item["Full Name"] || "").toLowerCase();
      const email = String(item.Email || item.email || "").toLowerCase();
      const category = String(item.Category || item.category || "").toLowerCase();
      const matchesSearch = name.includes(searchTerm.toLowerCase()) || email.includes(searchTerm.toLowerCase()) || category.includes(searchTerm.toLowerCase());
      const status = String(item.Status || item.status || "pending").toLowerCase();
      const matchesFilter = filterStatus === "all" || status === filterStatus.toLowerCase();
      return matchesSearch && matchesFilter;
    });
  }, [data, searchTerm, filterStatus]);

  const sortedData = useMemo(() => {
    return [...filteredData].sort((a, b) => {
      const tA = new Date(a.Timestamp || a.timestamp || a["Timestamp"]).getTime();
      const tB = new Date(b.Timestamp || b.timestamp || b["Timestamp"]).getTime();
      return tB - tA;
    });
  }, [filteredData]);

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const currentItems = sortedData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (loading && data.length === 0) return <GlobalLoader />;

  return (
    <div className="space-y-8">
      {/* Search & Filter */}
      <div className="flex flex-col lg:flex-row gap-6 items-stretch lg:items-center justify-between">
        <div className="relative flex-1">
          <FaSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
          <input type="text" placeholder="Search by name, email, or category..." value={searchTerm} onChange={(e) => onSearchChange(e.target.value)}
            className="w-full py-4 pl-12 pr-6 bg-white dark:bg-[#080808] border border-black/5 dark:border-white/5 rounded-2xl text-sm outline-none focus:border-uiupc-orange transition-all" />
        </div>
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
      </div>

      {/* Desktop Table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full border-separate border-spacing-y-3">
          <thead>
            <tr className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">
              <th className="px-6 pb-2 text-left">Participant</th>
              <th className="px-6 pb-2 text-left">Category</th>
              <th className="px-6 pb-2 text-left">Photos</th>
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
                      <div className="w-10 h-10 rounded-xl bg-uiupc-orange/10 flex items-center justify-center text-uiupc-orange">
                        <FaCamera className="text-xs" />
                      </div>
                      <div className="space-y-0.5">
                        <div className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-tight">{item.Name || item.name || item["Full Name"]}</div>
                        <div className="text-[10px] font-bold text-zinc-400 truncate max-w-[180px]">{item.Email || item.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 bg-white dark:bg-[#080808] border-y border-black/5 dark:border-white/5">
                    <span className="px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-[9px] font-black uppercase tracking-widest text-zinc-600 dark:text-zinc-300">
                      {item.Category || item.category || "N/A"}
                    </span>
                  </td>
                  <td className="px-6 py-5 bg-white dark:bg-[#080808] border-y border-black/5 dark:border-white/5">
                    <div className="text-sm font-black text-zinc-900 dark:text-white">{item["Photo Count"] || item.photoCount || "0"}</div>
                    <div className="text-[9px] font-bold text-zinc-400">+ {item["Story Photo Count"] || item.storyPhotoCount || "0"} story</div>
                  </td>
                  <td className="px-6 py-5 bg-white dark:bg-[#080808] border-y border-black/5 dark:border-white/5">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-400">
                      <FaClock className="text-[8px]" />
                      {new Date(item.Timestamp || item.timestamp || item["Timestamp"]).toLocaleDateString()}
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
                <div className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-tight">{item.Name || item.name || item["Full Name"]}</div>
                <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                  status === 'approved' ? 'bg-green-500/10 text-green-500' :
                  status === 'rejected' ? 'bg-red-500/10 text-red-500' : 'bg-orange-500/10 text-orange-500'
                }`}>{status}</span>
              </div>
              <div className="text-[10px] font-bold text-zinc-400">{item.Email || item.email} · {item.Category || item.category}</div>
              <div className="flex items-center gap-2">
                <button onClick={() => onViewDetails(item)} className="flex-1 py-2 text-center rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-500 text-[10px] font-black uppercase tracking-widest hover:bg-uiupc-orange hover:text-white transition-all">Details</button>
                <button onClick={() => onEmailReply(item)} className="flex-1 py-2 text-center rounded-lg bg-blue-500/10 text-blue-500 text-[10px] font-black uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all">Email</button>
              </div>
            </div>
          );
        })}
      </div>

      {sortedData.length === 0 && !loading && (
        <div className="py-24 text-center space-y-4">
          <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-900 rounded-2xl flex items-center justify-center mx-auto text-2xl text-zinc-300"><FaFileAlt /></div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">No submissions found</p>
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
