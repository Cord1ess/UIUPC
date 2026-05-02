"use client";

import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaSearch, 
  FaFileExport, 
  FaEye, 
  FaCheck, 
  FaTimes, 
  FaChevronLeft, 
  FaChevronRight, 
  FaEnvelope, 
  FaUserGraduate, 
  FaIdBadge,
  FaSpinner,
  FaCrown,
  FaHistory
} from 'react-icons/fa';
import { Admin_Dropdown } from "@/features/admin/components";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { useAdminData } from "@/contexts/AdminDataContext";
import { supabase } from "@/lib/supabase";
import { exportToCSV, generateBccMailto } from "@/utils/adminHelpers";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";

interface Admin_MembersProps {
  onViewDetails: (item: Record<string, any>) => void;
  onEmailReply: (item: Record<string, any>) => void;
  onPromoteToCommittee?: (item: Record<string, any>) => void;
  onViewTrajectory?: (item: Record<string, any>) => void;
  forcedSession?: string;
}

const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    pending: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    approved: "bg-green-500/10 text-green-500 border-green-500/20",
    rejected: "bg-red-500/10 text-red-500 border-red-500/20",
  };

  return (
    <span className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${styles[status.toLowerCase()] || styles.pending}`}>
      {status || "Pending"}
    </span>
  );
};

export const Admin_Members: React.FC<Admin_MembersProps> = ({
  onViewDetails, onEmailReply, onPromoteToCommittee, onViewTrajectory, forcedSession = "all"
}) => {
  const { adminProfile } = useSupabaseAuth();
  const [page, setPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDept, setFilterDept] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy] = useState("created_at");
  const [orderDesc] = useState(true);
  
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);
  const pageSize = 12;
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Reset page when global filters change
  useEffect(() => { setPage(0); }, [forcedSession, filterDept, filterStatus]);

  // Debounce search input (300ms)
  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setDebouncedSearch(value);
      setPage(0);
    }, 300);
  }, []);

  const filters = useMemo(() => {
    const f: Record<string, any> = {};
    if (filterStatus !== "all") f.status = filterStatus;
    if (filterDept !== "all") f.department = filterDept;
    if (forcedSession !== "all") f.session = forcedSession;
    return f;
  }, [filterStatus, filterDept, forcedSession]);

  const memberOptions = useMemo(() => ({
    page,
    pageSize,
    filters,
    orderBy: sortBy,
    orderDesc,
    search: debouncedSearch ? { columns: ['full_name', 'student_id', 'email'], term: debouncedSearch } : undefined,
  }), [page, pageSize, filters, sortBy, orderDesc, debouncedSearch]);

  const { data, count, isLoading, refetch } = useSupabaseData("members", memberOptions);

  const { members: allMembers } = useAdminData();
  
  const departments = useMemo(() => {
    const d = new Set<string>();
    if (Array.isArray(allMembers)) {
      allMembers.forEach(m => (m.department || m.Department) && d.add(m.department || m.Department));
    }
    return Array.from(d).sort();
  }, [allMembers]);

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase.from("members").update({ status }).eq('id', id);
      if (error) throw error;
      refetch();
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  const handleBulkUpdate = async (status: string) => {
    if (!window.confirm(`Mark ${selectedIds.size} applications as ${status}?`)) return;
    setIsBulkUpdating(true);
    try {
      const { error } = await supabase.from("members").update({ status }).in('id', Array.from(selectedIds));
      if (error) throw error;
      setSelectedIds(new Set());
      refetch();
    } catch (error: any) {
      alert("Bulk update failed: " + error.message);
    } finally {
      setIsBulkUpdating(false);
    }
  };

  const handleBulkEmail = () => {
    if (selectedIds.size === 0) return;
    const emails = (Array.isArray(data) ? data : [])
      .filter(item => selectedIds.has(item.id))
      .map(m => m.email || m.Email)
      .filter(Boolean);
    
    if (emails.length === 0) {
      alert("No emails found for selected members.");
      return;
    }
    generateBccMailto(emails, adminProfile?.email);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this member?")) return;
    try {
      const { error } = await supabase.from("members").delete().eq('id', id);
      if (error) throw error;
      refetch();
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  const totalPages = Math.ceil((count || 0) / pageSize);

  return (
    <div className="w-full space-y-8 min-w-0">
      {/* ── CLEAN FILTER BAR ───────────────────────────────────── */}
      <div className="w-full bg-white dark:bg-[#080808] p-6 rounded-[2.5rem] border border-black/5 dark:border-white/5 shadow-sm">
        <div className="flex flex-col xl:flex-row gap-6 items-stretch xl:items-center justify-between">
          <div className="relative flex-1 group">
            <FaSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-uiupc-orange transition-colors" />
            <input 
              type="text" 
              placeholder="Search by name or ID..." 
              value={searchTerm} 
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full py-5 pl-14 pr-8 bg-zinc-50 dark:bg-zinc-900/50 border border-transparent focus:border-uiupc-orange/30 rounded-2xl text-sm outline-none transition-all placeholder:text-zinc-400 font-medium" 
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex flex-col gap-1.5">
              <span className="text-[8px] font-black uppercase tracking-widest text-zinc-400 pl-4">Filter Status</span>
              <Admin_Dropdown 
                value={filterStatus} 
                onChange={setFilterStatus}
                options={[{ value: 'all', label: 'All Status' }, { value: 'pending', label: 'Pending' }, { value: 'approved', label: 'Approved' }, { value: 'rejected', label: 'Rejected' }]}
                className="min-w-[160px]"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-[8px] font-black uppercase tracking-widest text-zinc-400 pl-4">Department</span>
              <Admin_Dropdown 
                value={filterDept} 
                onChange={setFilterDept}
                options={[{ value: 'all', label: 'All Dept' }, ...departments.map(d => ({ value: d, label: d }))]}
                className="min-w-[160px]"
              />
            </div>
            <button 
              onClick={() => exportToCSV("membership", data || [])} 
              className="px-8 h-14 mt-auto flex items-center gap-3 bg-uiupc-orange text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-uiupc-orange/20 hover:brightness-110 transition-all"
            >
              <FaFileExport /> Download List
            </button>
          </div>
        </div>
      </div>

      {/* ── BULK ACTIONS ───────────────────────────────────────── */}
      <AnimatePresence>
        {selectedIds.size > 0 && (
          <motion.div 
            initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }}
            className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-8 px-10 py-6 bg-zinc-950 dark:bg-white rounded-[2.5rem] shadow-2xl border border-white/10 dark:border-black/10 backdrop-blur-xl"
          >
            <div className="flex items-center gap-5 pr-8 border-r border-white/10 dark:border-black/10">
              <div className="w-10 h-10 rounded-2xl bg-uiupc-orange flex items-center justify-center text-white text-[12px] font-black">{selectedIds.size}</div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest text-white dark:text-black">Selected</span>
                <span className="text-[8px] font-bold text-zinc-500 uppercase">Members</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button onClick={handleBulkEmail} className="flex items-center gap-3 px-8 py-4 bg-uiupc-orange text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all"><FaEnvelope /><span>Email</span></button>
              <button disabled={isBulkUpdating} onClick={() => handleBulkUpdate('approved')} className="flex items-center gap-3 px-8 py-4 bg-green-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all disabled:opacity-50">{isBulkUpdating ? <FaSpinner className="animate-spin" /> : <FaCheck />}<span>Approve</span></button>
              <button disabled={isBulkUpdating} onClick={() => handleBulkUpdate('rejected')} className="flex items-center gap-3 px-8 py-4 bg-red-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all disabled:opacity-50">{isBulkUpdating ? <FaSpinner className="animate-spin" /> : <FaTimes />}<span>Reject</span></button>
              <button onClick={() => setSelectedIds(new Set())} className="w-12 h-12 flex items-center justify-center text-zinc-500 hover:text-white dark:hover:text-black transition-colors"><FaTimes /></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── DATA TABLE ─────────────────────────────────────────── */}
      <div className="bg-white dark:bg-[#080808] rounded-[2.5rem] border border-black/5 dark:border-white/5 overflow-hidden shadow-sm">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-zinc-50 dark:bg-zinc-900/50">
                <th className="px-8 py-6 text-left w-20">
                  <input type="checkbox" className="w-5 h-5 rounded-lg border-zinc-300 text-uiupc-orange focus:ring-uiupc-orange transition-all cursor-pointer" checked={Array.isArray(data) && data.length > 0 && selectedIds.size === data.length} onChange={(e) => e.target.checked ? setSelectedIds(new Set((data || []).map(i => i.id))) : setSelectedIds(new Set())} />
                </th>
                <th className="px-6 py-6 text-left text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 whitespace-nowrap">Basic Info</th>
                <th className="px-6 py-6 text-left text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 whitespace-nowrap">Student Info</th>
                <th className="px-6 py-6 text-left text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 whitespace-nowrap">Academic Batch</th>
                <th className="px-6 py-6 text-left text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 whitespace-nowrap">Membership Status</th>
                <th className="px-8 py-6 text-right text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5">
              {isLoading ? (
                [...Array(6)].map((_, i) => <tr key={i} className="animate-pulse"><td colSpan={6} className="px-8 py-8"><div className="h-8 bg-zinc-50 dark:bg-zinc-900 rounded-xl" /></td></tr>)
              ) : !data || data.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 rounded-[2rem] bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center text-zinc-300 dark:text-zinc-600">
                        <FaSearch size={20} />
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                        No records found
                      </p>
                      <p className="text-[9px] text-zinc-500 max-w-xs">
                        Try adjusting your filters or search term.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                (data || []).map((item) => (
                  <motion.tr key={item.id} className={`group hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition-all ${selectedIds.has(item.id) ? 'bg-uiupc-orange/[0.03]' : ''}`}>
                    <td className="px-8 py-6"><input type="checkbox" className="w-5 h-5 rounded-lg border-zinc-300 text-uiupc-orange transition-all cursor-pointer" checked={selectedIds.has(item.id)} onChange={() => { const s = new Set(selectedIds); if (s.has(item.id)) s.delete(item.id); else s.add(item.id); setSelectedIds(s); }} /></td>
                    <td className="px-6 py-6 whitespace-nowrap">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-sm font-black text-uiupc-orange group-hover:scale-110 transition-transform shadow-inner">{(item.full_name || "?").charAt(0)}</div>
                        <div className="flex flex-col min-w-[200px]">
                          <span className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-tight truncate">{item.full_name}</span>
                          <span className="text-[11px] font-bold text-zinc-400 lowercase truncate">{item.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6 whitespace-nowrap">
                      <div className="flex flex-col gap-1 min-w-[150px]">
                        <div className="flex items-center gap-2 text-[11px] font-black text-zinc-900 dark:text-white uppercase tracking-wider"><FaIdBadge className="text-uiupc-orange text-[10px]" /> {item.student_id}</div>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-400 uppercase tracking-widest"><FaUserGraduate className="text-zinc-300 text-[9px]" /> {item.department}</div>
                      </div>
                    </td>
                    <td className="px-6 py-6 whitespace-nowrap">
                      <span className="px-4 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800/50 text-zinc-500 dark:text-zinc-400 text-[9px] font-black uppercase tracking-widest border border-black/5 dark:border-white/5">{item.session}</span>
                    </td>
                    <td className="px-6 py-6 whitespace-nowrap"><StatusBadge status={item.status || "pending"} /></td>
                    <td className="px-8 py-6 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                        {item.status === 'pending' && (
                          <><button onClick={() => handleUpdateStatus(item.id, 'approved')} className="w-10 h-10 flex items-center justify-center rounded-xl bg-green-500 text-white shadow-lg hover:scale-110 transition-all"><FaCheck className="text-xs" /></button><button onClick={() => handleUpdateStatus(item.id, 'rejected')} className="w-10 h-10 flex items-center justify-center rounded-xl bg-red-500 text-white shadow-lg hover:scale-110 transition-all"><FaTimes className="text-xs" /></button></>
                        )}
                        <button onClick={() => onViewDetails(item)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:bg-uiupc-orange hover:text-white transition-all"><FaEye className="text-xs" /></button>
                        <button onClick={() => onEmailReply(item)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white transition-all"><FaEnvelope className="text-xs" /></button>
                        {onViewTrajectory && (
                          <button onClick={() => onViewTrajectory(item)} title="View Committee History" className="w-10 h-10 flex items-center justify-center rounded-xl bg-purple-500/10 text-purple-500 hover:bg-purple-500 hover:text-white transition-all"><FaHistory className="text-xs" /></button>
                        )}
                        {onPromoteToCommittee && (
                          <button onClick={() => onPromoteToCommittee(item)} title="Add to Committee" className="w-10 h-10 flex items-center justify-center rounded-xl bg-uiupc-orange/10 text-uiupc-orange hover:bg-uiupc-orange hover:text-white transition-all"><FaCrown className="text-xs" /></button>
                        )}
                        <button onClick={() => handleDelete(item.id)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400 hover:bg-red-500 hover:text-white transition-all"><FaTimes className="text-xs" /></button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── PAGINATION ────────────────────────────────────────── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-10 border-t border-black/5 dark:border-white/5">
          <div className="flex flex-col"><p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Member Summary</p><p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Page {page + 1} of {totalPages} | Total {count} Records</p></div>
          <div className="flex items-center gap-3">
            <button disabled={page === 0} onClick={() => { setPage(p => Math.max(0, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="w-14 h-14 flex items-center justify-center rounded-2xl bg-white dark:bg-[#080808] border border-black/5 dark:border-white/5 text-zinc-400 disabled:opacity-20 hover:border-uiupc-orange hover:text-uiupc-orange transition-all shadow-sm"><FaChevronLeft className="text-xs" /></button>
            <button disabled={page >= totalPages - 1} onClick={() => { setPage(p => p + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="w-14 h-14 flex items-center justify-center rounded-2xl bg-white dark:bg-[#080808] border border-black/5 dark:border-white/5 text-zinc-400 disabled:opacity-20 hover:border-uiupc-orange hover:text-uiupc-orange transition-all shadow-sm"><FaChevronRight className="text-xs" /></button>
          </div>
        </div>
      )}
    </div>
  );
};
