"use client";
import React, { useState, useMemo } from "react";
import {
  FaEye,
  FaSearch,
  FaFacebook,
  FaChevronLeft,
  FaChevronRight,
  FaCheck,
  FaTimes,
  FaEnvelope,
} from "react-icons/fa";

interface MembershipApplicationsProps {
  data: any[];
  loading: boolean;
  searchTerm: string;
  filterStatus: string;
  onSearchChange: (value: string) => void;
  onFilterChange: (value: string) => void;
  onRefresh: () => void;
  onExport: () => void;
  onViewDetails: (item: any) => void;
  onUpdateStatus: (item: any, status: string) => void;
  onEmailReply: (item: any) => void;
  connectionTest: any;
}

const MembershipApplications: React.FC<MembershipApplicationsProps> = ({
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
  const itemsPerPage = 10;

  // Safe string conversion helper
  const safeToString = (value: any): string => {
    if (value === null || value === undefined) return "";
    if (typeof value === "string") return value;
    if (typeof value === "number") return value.toString();
    return String(value);
  };

  const getProperty = (item: any, property: string): string => {
    const possibleKeys = [
      property,
      property.toLowerCase(),
      property.toUpperCase(),
      property.replace(/\s+/g, ""),
      property.replace(/\s+/g, "").toLowerCase(),
    ];
    for (const key of possibleKeys) {
      if (item[key] !== undefined && item[key] !== null && item[key] !== "") {
        return safeToString(item[key]);
      }
    }
    return "N/A";
  };

  // Filter data
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const name = safeToString(item["Full Name"] || item.name);
      const email = safeToString(item.Email || item.email);
      const studentId = safeToString(item["Student ID"] || item.studentId);
      const department = safeToString(item.Department || item.department);
      const status = safeToString(item.Status || item.status || "pending");

      const term = searchTerm.toLowerCase();
      const matchesSearch =
        !searchTerm ||
        name.toLowerCase().includes(term) ||
        email.toLowerCase().includes(term) ||
        studentId.toLowerCase().includes(term) ||
        department.toLowerCase().includes(term);

      const matchesStatus =
        filterStatus === "all" ||
        (filterStatus === "pending" && (!status || status === "pending")) ||
        (filterStatus === "approved" && status === "approved") ||
        (filterStatus === "rejected" && status === "rejected");

      return matchesSearch && matchesStatus;
    });
  }, [data, searchTerm, filterStatus]);

  // Reset page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const currentItems = filteredData.slice(startIdx, startIdx + itemsPerPage);

  const getStatusBadge = (status: string) => {
    const s = safeToString(status || "pending");
    const config: Record<string, { bg: string; text: string; border: string; label: string }> = {
      approved: { bg: "bg-emerald-500/10", text: "text-emerald-500", border: "border-emerald-500/20", label: "Approved" },
      rejected: { bg: "bg-red-500/10", text: "text-red-500", border: "border-red-500/20", label: "Rejected" },
      pending:  { bg: "bg-amber-500/10", text: "text-amber-500", border: "border-amber-500/20", label: "Pending" },
    };
    const c = config[s] || config.pending;
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${c.bg} ${c.text} ${c.border}`}>
        {c.label}
      </span>
    );
  };

  const renderFacebookLink = (item: any) => {
    const facebookLink =
      item["Facebook Profile Link"] ||
      item["Facebook Link"] ||
      item["facebookLink"] ||
      item["Facebook"] ||
      item["facebook"] ||
      item["Facebook Profile"] ||
      item["FB Link"];

    if (!facebookLink || facebookLink === "N/A" || facebookLink === "" || facebookLink === "Not provided") {
      return <span className="text-zinc-400 text-xs">—</span>;
    }

    let formatted = facebookLink.trim().replace(/['"]/g, "");
    if (!formatted.startsWith("http://") && !formatted.startsWith("https://")) {
      formatted = "https://" + formatted;
    }

    if (!formatted.includes("facebook.com") && !formatted.includes("fb.com")) {
      return <span className="text-zinc-400 text-xs truncate max-w-[120px]" title={formatted}>{formatted}</span>;
    }

    return (
      <a
        href={formatted}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-blue-500 hover:text-blue-400 text-xs font-bold transition-colors"
        title={formatted}
      >
        <FaFacebook /> Profile
      </a>
    );
  };

  // Pagination page numbers
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);

      if (currentPage <= 3) { start = 2; end = maxVisible; }
      if (currentPage >= totalPages - 2) { start = totalPages - maxVisible + 1; end = totalPages - 1; }

      if (start > 2) pages.push("...");
      for (let i = start; i <= end; i++) pages.push(i);
      if (end < totalPages - 1) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  const statusCounts = useMemo(() => {
    const counts = { all: data.length, pending: 0, approved: 0, rejected: 0 };
    data.forEach((item) => {
      const s = safeToString(item.Status || item.status || "pending");
      if (s === "approved") counts.approved++;
      else if (s === "rejected") counts.rejected++;
      else counts.pending++;
    });
    return counts;
  }, [data]);

  return (
    <div className="space-y-8">
      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <FaSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400 text-sm pointer-events-none" />
          <input
            type="text"
            placeholder="Search by name, email, student ID..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full py-4 pl-12 pr-5 bg-white dark:bg-[#080808] border border-black/5 dark:border-white/5 rounded-2xl text-sm text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 focus:outline-none focus:border-uiupc-orange focus:ring-2 focus:ring-uiupc-orange/10 transition-all"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 flex-wrap">
          {(["all", "pending", "approved", "rejected"] as const).map((status) => (
            <button
              key={status}
              onClick={() => onFilterChange(status)}
              className={`px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                filterStatus === status
                  ? "bg-uiupc-orange text-white border-uiupc-orange shadow-lg shadow-uiupc-orange/20"
                  : "bg-white dark:bg-[#080808] text-zinc-500 dark:text-zinc-400 border-black/5 dark:border-white/5 hover:border-uiupc-orange/30"
              }`}
            >
              {status === "all" ? "All" : status} ({statusCounts[status]})
            </button>
          ))}
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">
          {filteredData.length} Application{filteredData.length !== 1 ? "s" : ""} Found
        </p>
        {(searchTerm || filterStatus !== "all") && (
          <button
            onClick={() => { onSearchChange(""); onFilterChange("all"); }}
            className="text-[10px] font-black uppercase tracking-widest text-uiupc-orange hover:underline"
          >
            Clear Filters
          </button>
        )}
      </div>

      {filteredData.length > 0 ? (
        <>
          {/* Desktop Table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full" style={{ borderSpacing: "0 8px", borderCollapse: "separate" }}>
              <thead>
                <tr>
                  <th className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">#</th>
                  <th className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Name</th>
                  <th className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Student ID</th>
                  <th className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Department</th>
                  <th className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Facebook</th>
                  <th className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Payment</th>
                  <th className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Status</th>
                  <th className="px-5 py-3 text-right text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((item, index) => {
                  const isPending = !item.Status || item.Status === "pending";
                  return (
                    <tr key={index} className="group">
                      <td className="py-5 px-5 bg-white dark:bg-[#080808] border-y border-l border-black/5 dark:border-white/[0.03] rounded-l-2xl text-xs text-zinc-400 font-bold group-hover:border-uiupc-orange/20 transition-colors">
                        {startIdx + index + 1}
                      </td>
                      <td className="py-5 px-5 bg-white dark:bg-[#080808] border-y border-black/5 dark:border-white/[0.03] group-hover:border-uiupc-orange/20 transition-colors">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-zinc-900 dark:text-white">{getProperty(item, "Full Name")}</span>
                          <span className="text-[10px] text-zinc-400 mt-0.5">{getProperty(item, "Email")}</span>
                        </div>
                      </td>
                      <td className="py-5 px-5 bg-white dark:bg-[#080808] border-y border-black/5 dark:border-white/[0.03] group-hover:border-uiupc-orange/20 transition-colors">
                        <span className="inline-flex px-2.5 py-1 rounded-lg bg-uiupc-orange/5 text-uiupc-orange text-xs font-bold font-mono">
                          {getProperty(item, "Student ID")}
                        </span>
                      </td>
                      <td className="py-5 px-5 bg-white dark:bg-[#080808] border-y border-black/5 dark:border-white/[0.03] text-xs text-zinc-500 dark:text-zinc-400 group-hover:border-uiupc-orange/20 transition-colors">
                        {getProperty(item, "Department")}
                      </td>
                      <td className="py-5 px-5 bg-white dark:bg-[#080808] border-y border-black/5 dark:border-white/[0.03] group-hover:border-uiupc-orange/20 transition-colors">
                        {renderFacebookLink(item)}
                      </td>
                      <td className="py-5 px-5 bg-white dark:bg-[#080808] border-y border-black/5 dark:border-white/[0.03] text-xs text-zinc-500 dark:text-zinc-400 group-hover:border-uiupc-orange/20 transition-colors">
                        {getProperty(item, "Payment Method")}
                      </td>
                      <td className="py-5 px-5 bg-white dark:bg-[#080808] border-y border-black/5 dark:border-white/[0.03] group-hover:border-uiupc-orange/20 transition-colors">
                        {getStatusBadge(item.Status || item.status)}
                      </td>
                      <td className="py-5 px-5 bg-white dark:bg-[#080808] border-y border-r border-black/5 dark:border-white/[0.03] rounded-r-2xl group-hover:border-uiupc-orange/20 transition-colors">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => onViewDetails(item)}
                            className="w-9 h-9 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 hover:bg-uiupc-orange hover:text-white transition-all text-xs"
                            title="View Details"
                          >
                            <FaEye />
                          </button>
                          {isPending && (
                            <>
                              <button
                                onClick={() => onUpdateStatus(item, "approved")}
                                className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all text-xs"
                                title="Approve"
                              >
                                <FaCheck />
                              </button>
                              <button
                                onClick={() => onUpdateStatus(item, "rejected")}
                                className="w-9 h-9 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-all text-xs"
                                title="Reject"
                              >
                                <FaTimes />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => onEmailReply(item)}
                            className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 hover:bg-blue-500 hover:text-white transition-all text-xs"
                            title="Send Email"
                          >
                            <FaEnvelope />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card Layout */}
          <div className="lg:hidden space-y-4">
            {currentItems.map((item, index) => {
              const isPending = !item.Status || item.Status === "pending";
              return (
                <div
                  key={index}
                  className="bg-white dark:bg-[#080808] border border-black/5 dark:border-white/[0.03] rounded-2xl p-5 space-y-4 hover:border-uiupc-orange/20 transition-all"
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-zinc-900 dark:text-white truncate">
                        {getProperty(item, "Full Name")}
                      </h4>
                      <p className="text-[10px] text-zinc-400 mt-0.5 truncate">{getProperty(item, "Email")}</p>
                    </div>
                    {getStatusBadge(item.Status || item.status)}
                  </div>

                  {/* Card Body */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-1">Student ID</p>
                      <span className="inline-flex px-2 py-0.5 rounded-md bg-uiupc-orange/5 text-uiupc-orange text-xs font-bold font-mono">
                        {getProperty(item, "Student ID")}
                      </span>
                    </div>
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-1">Department</p>
                      <p className="text-xs text-zinc-600 dark:text-zinc-300">{getProperty(item, "Department")}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-1">Payment</p>
                      <p className="text-xs text-zinc-600 dark:text-zinc-300">{getProperty(item, "Payment Method")}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-1">Facebook</p>
                      {renderFacebookLink(item)}
                    </div>
                  </div>

                  {/* Card Footer Actions */}
                  <div className="flex items-center gap-2 pt-3 border-t border-black/5 dark:border-white/5">
                    <button
                      onClick={() => onViewDetails(item)}
                      className="flex-1 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 text-[10px] font-black uppercase tracking-widest text-center hover:bg-uiupc-orange hover:text-white transition-all"
                    >
                      View Details
                    </button>
                    {isPending && (
                      <>
                        <button
                          onClick={() => onUpdateStatus(item, "approved")}
                          className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all"
                        >
                          <FaCheck />
                        </button>
                        <button
                          onClick={() => onUpdateStatus(item, "rejected")}
                          className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-all"
                        >
                          <FaTimes />
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => onEmailReply(item)}
                      className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 hover:bg-blue-500 hover:text-white transition-all"
                    >
                      <FaEnvelope />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-black/5 dark:border-white/5">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                Page {currentPage} of {totalPages} · Showing {startIdx + 1}–{Math.min(startIdx + itemsPerPage, filteredData.length)} of {filteredData.length}
              </p>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="w-10 h-10 rounded-xl bg-white dark:bg-[#080808] border border-black/5 dark:border-white/5 flex items-center justify-center text-zinc-500 disabled:opacity-30 disabled:cursor-not-allowed hover:border-uiupc-orange hover:text-uiupc-orange transition-all"
                >
                  <FaChevronLeft className="text-xs" />
                </button>

                {getPageNumbers().map((page, i) =>
                  typeof page === "string" ? (
                    <span key={`ellipsis-${i}`} className="w-10 h-10 flex items-center justify-center text-zinc-400 text-xs">
                      ···
                    </span>
                  ) : (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-10 h-10 rounded-xl text-xs font-bold transition-all ${
                        page === currentPage
                          ? "bg-uiupc-orange text-white shadow-lg shadow-uiupc-orange/20"
                          : "bg-white dark:bg-[#080808] border border-black/5 dark:border-white/5 text-zinc-500 hover:border-uiupc-orange hover:text-uiupc-orange"
                      }`}
                    >
                      {page}
                    </button>
                  )
                )}

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="w-10 h-10 rounded-xl bg-white dark:bg-[#080808] border border-black/5 dark:border-white/5 flex items-center justify-center text-zinc-500 disabled:opacity-30 disabled:cursor-not-allowed hover:border-uiupc-orange hover:text-uiupc-orange transition-all"
                >
                  <FaChevronRight className="text-xs" />
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-16 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto text-2xl text-zinc-300 dark:text-zinc-600">
            <FaSearch />
          </div>
          <p className="text-sm font-bold text-zinc-500 dark:text-zinc-400">
            {data.length === 0
              ? "No applications received yet."
              : "No applications match your filters."}
          </p>
          {(searchTerm || filterStatus !== "all") && (
            <button
              onClick={() => { onSearchChange(""); onFilterChange("all"); }}
              className="px-6 py-3 rounded-xl bg-uiupc-orange/10 text-uiupc-orange text-[10px] font-black uppercase tracking-widest hover:bg-uiupc-orange hover:text-white transition-all"
            >
              Clear Filters
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default MembershipApplications;
