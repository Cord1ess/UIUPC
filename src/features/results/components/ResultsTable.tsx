"use client";

import React from "react";
import { FaTrophy, FaEdit, FaTrash, FaChevronLeft, FaChevronRight, FaDownload } from "react-icons/fa";
import { Result } from "@/types";

interface ResultsTableProps {
  results: Result[];
  selectedCategory: string;
  currentResultsPage: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onEdit: (result: Result) => void;
  onDelete: (id: string) => void;
  onAddResult: () => void;
  onExport: () => void;
}

const ResultsTable: React.FC<ResultsTableProps> = ({
  results,
  selectedCategory,
  currentResultsPage,
  itemsPerPage,
  onPageChange,
  onEdit,
  onDelete,
  onAddResult,
  onExport
}) => {
  const filteredResults = results.filter(result => 
    selectedCategory === "all" || result.category === selectedCategory
  );

  const totalPages = Math.ceil(filteredResults.length / itemsPerPage);
  const startIndex = (currentResultsPage - 1) * itemsPerPage;
  const paginatedResults = filteredResults.slice(startIndex, startIndex + itemsPerPage);

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    return (
      <div className="pagination">
        <button
          className="pagination-btn"
          onClick={() => onPageChange(currentResultsPage - 1)}
          disabled={currentResultsPage === 1}
        >
          <FaChevronLeft />
        </button>
        <span className="pagination-info">Page {currentResultsPage} of {totalPages}</span>
        <button
          className="pagination-btn"
          onClick={() => onPageChange(currentResultsPage + 1)}
          disabled={currentResultsPage === totalPages}
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
          <FaTrophy className="text-uiupc-orange" /> Entry Records <span className="text-zinc-400 text-sm">({filteredResults.length})</span>
        </h3>
        <div className="flex items-center gap-3">
          <button onClick={onAddResult} className="px-6 h-10 flex items-center gap-2 bg-uiupc-orange text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all">
            Add Result
          </button>
          <button onClick={onExport} disabled={results.length === 0} className="px-6 h-10 flex items-center gap-2 bg-white dark:bg-[#080808] border border-black/5 dark:border-white/5 text-zinc-600 dark:text-zinc-300 rounded-xl text-[10px] font-black uppercase tracking-widest hover:text-uiupc-orange disabled:opacity-50 transition-all">
            <FaDownload /> Download List
          </button>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full border-separate border-spacing-y-3">
          <thead>
            <tr className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">
              <th className="px-6 pb-2 text-left">Ref ID</th>
              <th className="px-6 pb-2 text-left">Name</th>
              <th className="px-6 pb-2 text-left">University / School</th>
              <th className="px-6 pb-2 text-left">Photo Count</th>
              <th className="px-6 pb-2 text-left">Selection Status</th>
              <th className="px-6 pb-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedResults.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-12 text-[10px] font-black uppercase tracking-widest text-zinc-400">No results found.</td></tr>
            ) : (
              paginatedResults.map((result, index) => (
                <tr key={result.id || index} className="group">
                  <td className="px-6 py-5 bg-white dark:bg-[#080808] border-y border-l border-black/5 dark:border-white/5 rounded-l-2xl text-[10px] font-bold text-zinc-400">{result.id}</td>
                  <td className="px-6 py-5 bg-white dark:bg-[#080808] border-y border-black/5 dark:border-white/5 text-sm font-black text-zinc-900 dark:text-white uppercase tracking-tight">{result.name || "No name"}</td>
                  <td className="px-6 py-5 bg-white dark:bg-[#080808] border-y border-black/5 dark:border-white/5 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{result.institute || "No institute"}</td>
                  <td className="px-6 py-5 bg-white dark:bg-[#080808] border-y border-black/5 dark:border-white/5 text-xs font-black dark:text-white">{result.photos || 1}</td>
                  <td className="px-6 py-5 bg-white dark:bg-[#080808] border-y border-black/5 dark:border-white/5">
                    <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                      result.status === "selected" ? "bg-green-500/10 text-green-500" : "bg-zinc-100 dark:bg-white/5 text-zinc-500 dark:text-zinc-400"
                    }`}>
                      {result.status === "selected" ? "Selected" : "Not Selected"}
                    </span>
                  </td>
                  <td className="px-6 py-5 bg-white dark:bg-[#080808] border-y border-r border-black/5 dark:border-white/5 rounded-r-2xl text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => onEdit(result)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white transition-all"><FaEdit className="text-xs" /></button>
                      <button onClick={() => onDelete(result.id)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all"><FaTrash className="text-xs" /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden grid grid-cols-1 gap-4">
        {paginatedResults.map((result, i) => (
          <div key={i} className="p-6 bg-white dark:bg-[#080808] border border-black/5 dark:border-white/5 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-tight">{result.name || "No name"}</div>
              <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                result.status === "selected" ? "bg-green-500/10 text-green-500" : "bg-zinc-100 dark:bg-white/5 text-zinc-500 dark:text-zinc-400"
              }`}>
                {result.status === "selected" ? "Selected" : "Not Selected"}
              </span>
            </div>
            <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{result.institute || "No institute"}</div>
            <div className="flex items-center gap-2">
              <button onClick={() => onEdit(result)} className="flex-1 py-2 text-center rounded-lg bg-blue-500/10 text-blue-500 text-[10px] font-black uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all">Edit</button>
              <button onClick={() => onDelete(result.id)} className="flex-1 py-2 text-center rounded-lg bg-red-500/10 text-red-500 text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">Delete</button>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Page {currentResultsPage} of {totalPages}</p>
          <div className="flex items-center gap-2">
            <button disabled={currentResultsPage === 1} onClick={() => onPageChange(currentResultsPage - 1)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white dark:bg-[#080808] border border-black/5 dark:border-white/5 text-zinc-400 disabled:opacity-30 hover:border-uiupc-orange hover:text-uiupc-orange transition-all"><FaChevronLeft className="text-xs" /></button>
            <button disabled={currentResultsPage === totalPages} onClick={() => onPageChange(currentResultsPage + 1)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white dark:bg-[#080808] border border-black/5 dark:border-white/5 text-zinc-400 disabled:opacity-30 hover:border-uiupc-orange hover:text-uiupc-orange transition-all"><FaChevronRight className="text-xs" /></button>
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(ResultsTable);
