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
  FaHistory,
  FaUsers,
  FaLayerGroup,
  FaFilter
} from 'react-icons/fa';
import { Admin_Dropdown, Admin_ModuleHeader, Admin_StatCard } from "@/features/admin/components";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { supabase } from "@/lib/supabase";
import { exportToCSV, generateBccMailto } from "@/utils/adminHelpers";
import { Member } from "@/types/admin";
import { 
  approveMember, 
  rejectMember, 
  deleteMember, 
} from "@/features/admin/actions";

interface Admin_MembersProps {
  data: Member[];
  count: number;
  currentPage: number;
  searchTerm: string;
  filterDept: string;
  filterStatus: string;
  departments: string[];
  onFilterChange: (filters: { page?: number; search?: string; dept?: string; status?: string }) => void;
  onViewDetails: (item: Record<string, any>) => void;
  onEmailReply: (item: Record<string, any>) => void;
  onPromoteToCommittee?: (item: Record<string, any>) => void;
  onViewTrajectory?: (item: Record<string, any>) => void;
}

export const Admin_Members: React.FC<Admin_MembersProps> = ({
  data, 
  count, 
  currentPage,
  searchTerm,
  filterDept,
  filterStatus,
  departments,
  onFilterChange,
  onViewDetails, 
  onEmailReply, 
  onPromoteToCommittee, 
  onViewTrajectory
}) => {
  const { adminProfile } = useSupabaseAuth();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);
  const pageSize = 12;
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearchInput = (value: string) => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      onFilterChange({ search: value, page: 0 });
    }, 400);
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      if (status === 'approved') await approveMember(id);
      else if (status === 'rejected') await rejectMember(id);
    } catch (err: any) {
      alert("Action failed: " + err.message);
    }
  };

  const handleBulkUpdate = async (status: string) => {
    if (!window.confirm(`Mark ${selectedIds.size} applications as ${status}?`)) return;
    setIsBulkUpdating(true);
    try {
      await Promise.all(Array.from(selectedIds).map(id => 
        status === 'approved' ? approveMember(id) : rejectMember(id)
      ));
      setSelectedIds(new Set());
    } catch (error: any) {
      alert("Bulk update failed: " + error.message);
    } finally {
      setIsBulkUpdating(false);
    }
  };

  const handleBulkEmail = () => {
    if (selectedIds.size === 0) return;
    const emails = data
      .filter(item => selectedIds.has(item.id))
      .map(m => m.email)
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
      await deleteMember(id);
    } catch (err: any) {
      alert("Delete failed: " + err.message);
    }
  };

  const totalPages = Math.ceil((count || 0) / pageSize);
  const deptCount = new Set(data.map(item => item.department)).size;

  return (
    <div className="w-full space-y-6 min-w-0">
      <Admin_ModuleHeader 
        title="Members"
        description="Review and manage member applications."
      >
        <Admin_StatCard label="Total Records" value={count} icon={<FaUsers />} />
        
        {/* Status Filter Card */}
        <div className="p-6 bg-white dark:bg-[#080808] border border-black/5 dark:border-white/5 rounded-2xl flex flex-col justify-between shadow-sm min-h-[140px] group">
          <p className="text-zinc-400 text-[10px] font-black uppercase tracking-widest">Filter Status</p>
          <div className="flex items-end justify-between mt-auto">
            <div className="text-uiupc-orange text-4xl opacity-20 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500">
              <FaFilter />
            </div>
            <div className="flex-1 ml-6 max-w-[180px]">
              <Admin_Dropdown 
                variant="minimal"
                label="Application Status"
                value={filterStatus} 
                onChange={(val) => onFilterChange({ status: val, page: 0 })}
                options={[{ value: 'all', label: 'All Status' }, { value: 'pending', label: 'Pending' }, { value: 'approved', label: 'Approved' }, { value: 'rejected', label: 'Rejected' }]}
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Department Filter Card */}
        <div className="p-6 bg-white dark:bg-[#080808] border border-black/5 dark:border-white/5 rounded-2xl flex flex-col justify-between shadow-sm min-h-[140px] group">
          <p className="text-zinc-400 text-[10px] font-black uppercase tracking-widest">Department</p>
          <div className="flex items-end justify-between mt-auto">
            <div className="text-blue-500 text-4xl opacity-20 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500">
              <FaLayerGroup />
            </div>
            <div className="flex-1 ml-6 max-w-[180px]">
              <Admin_Dropdown 
                variant="minimal"
                label="Select Dept"
                value={filterDept} 
                onChange={(val) => onFilterChange({ dept: val, page: 0 })}
                options={[{ value: 'all', label: 'All Dept' }, ...departments.map(d => ({ value: d, label: d }))]}
                className="w-full"
              />
            </div>
          </div>
        </div>

        <Admin_StatCard label="Departments" value={deptCount} icon={<FaLayerGroup />} />
      </Admin_ModuleHeader>

      {/* ── CLEAN FILTER BAR ───────────────────────────────────── */}
      <div className="w-full bg-white dark:bg-[#080808] p-4 rounded-2xl border border-black/5 dark:border-white/5 shadow-sm">
        <div className="flex flex-col xl:flex-row gap-4 items-stretch xl:items-center justify-between">
          <div className="relative flex-1 group">
            <FaSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-uiupc-orange transition-colors" />
            <input 
              type="text" 
              placeholder="Search by name or ID..." 
              defaultValue={searchTerm} 
              onChange={(e) => handleSearchInput(e.target.value)}
              className="w-full py-4 pl-14 pr-8 bg-zinc-50 dark:bg-zinc-900/50 border border-transparent focus:border-uiupc-orange/30 rounded-xl text-sm outline-none transition-all placeholder:text-zinc-400 font-medium" 
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button 
              onClick={() => exportToCSV("membership", data)} 
              className="px-8 h-12 flex items-center gap-3 bg-uiupc-orange text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-uiupc-orange/20 hover:brightness-110 transition-all"
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
            className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-6 px-10 py-4 bg-zinc-950 dark:bg-white rounded-2xl shadow-2xl border border-white/10 dark:border-black/10 backdrop-blur-xl"
          >
            <div className="flex items-center gap-5 pr-8 border-r border-white/10 dark:border-black/10">
              <div className="w-10 h-10 rounded-xl bg-uiupc-orange flex items-center justify-center text-white text-[12px] font-black">{selectedIds.size}</div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest text-white dark:text-black">Selected</span>
                <span className="text-[8px] font-bold text-zinc-500 uppercase">Members</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button onClick={handleBulkEmail} className="flex items-center gap-3 px-8 py-4 bg-uiupc-orange text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all"><FaEnvelope /><span>Email</span></button>
              <button disabled={isBulkUpdating} onClick={() => handleBulkUpdate('approved')} className="flex items-center gap-3 px-8 py-4 bg-green-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all disabled:opacity-50">{isBulkUpdating ? <FaSpinner className="animate-spin" /> : <FaCheck />}<span>Approve</span></button>
              <button disabled={isBulkUpdating} onClick={() => handleBulkUpdate('rejected')} className="flex items-center gap-3 px-8 py-4 bg-red-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all disabled:opacity-50">{isBulkUpdating ? <FaSpinner className="animate-spin" /> : <FaTimes />}<span>Reject</span></button>
              <button onClick={() => setSelectedIds(new Set())} className="w-12 h-12 flex items-center justify-center text-zinc-500 hover:text-white dark:hover:text-black transition-colors"><FaTimes /></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── DATA TABLE ─────────────────────────────────────────── */}
      <div className="bg-white dark:bg-[#080808] rounded-2xl border border-black/5 dark:border-white/5 overflow-hidden shadow-sm">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-zinc-50 dark:bg-zinc-900/50">
                <th className="px-8 py-4 text-left w-20">
                  <input type="checkbox" className="w-5 h-5 rounded-lg border-zinc-300 text-uiupc-orange focus:ring-uiupc-orange transition-all cursor-pointer" checked={data.length > 0 && selectedIds.size === data.length} onChange={(e) => e.target.checked ? setSelectedIds(new Set(data.map(i => i.id))) : setSelectedIds(new Set())} />
                </th>
                <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 whitespace-nowrap">Basic Info</th>
                <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 whitespace-nowrap">Student Info</th>
                <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 whitespace-nowrap">Academic Batch</th>
                <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 whitespace-nowrap">Membership Status</th>
                <th className="px-8 py-4 text-right text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5">
              {data.length === 0 ? (
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
                data.map((item) => (
                  <motion.tr key={item.id} className={`group hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition-all ${selectedIds.has(item.id) ? 'bg-uiupc-orange/[0.03]' : ''}`}>
                    <td className="px-8 py-4"><input type="checkbox" className="w-5 h-5 rounded-lg border-zinc-300 text-uiupc-orange transition-all cursor-pointer" checked={selectedIds.has(item.id)} onChange={() => { const s = new Set(selectedIds); if (s.has(item.id)) s.delete(item.id); else s.add(item.id); setSelectedIds(s); }} /></td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-sm font-black text-uiupc-orange group-hover:scale-110 transition-transform shadow-inner">{(item.member_name || "?").charAt(0)}</div>
                        <div className="flex flex-col min-w-[200px]">
                          <span className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-tight truncate">{item.member_name}</span>
                          <span className="text-[11px] font-bold text-zinc-400 lowercase truncate">{item.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1 min-w-[150px]">
                        <div className="flex items-center gap-2 text-[11px] font-black text-zinc-900 dark:text-white uppercase tracking-wider"><FaIdBadge className="text-uiupc-orange text-[10px]" /> {item.student_id}</div>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-400 uppercase tracking-widest"><FaUserGraduate className="text-zinc-300 text-[9px]" /> {item.department}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-4 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800/50 text-zinc-500 dark:text-zinc-400 text-[9px] font-black uppercase tracking-widest border border-black/5 dark:border-white/5">{item.session}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${
                        item.status === 'approved' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
                        item.status === 'rejected' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 
                        'bg-amber-500/10 text-amber-500 border-amber-500/20'
                      }`}>
                        {item.status || "Pending"}
                      </span>
                    </td>
                    <td className="px-8 py-4 text-right whitespace-nowrap">
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
          <div className="flex flex-col"><p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Member Summary</p><p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Page {currentPage + 1} of {totalPages} | Total {count} Records</p></div>
          <div className="flex items-center gap-3">
            <button disabled={currentPage === 0} onClick={() => onFilterChange({ page: Math.max(0, currentPage - 1) })} className="w-14 h-12 flex items-center justify-center rounded-xl bg-white dark:bg-[#080808] border border-black/5 dark:border-white/5 text-zinc-400 disabled:opacity-20 hover:border-uiupc-orange hover:text-uiupc-orange transition-all shadow-sm"><FaChevronLeft className="text-xs" /></button>
            <button disabled={currentPage >= totalPages - 1} onClick={() => onFilterChange({ page: currentPage + 1 })} className="w-14 h-12 flex items-center justify-center rounded-xl bg-white dark:bg-[#080808] border border-black/5 dark:border-white/5 text-zinc-400 disabled:opacity-20 hover:border-uiupc-orange hover:text-uiupc-orange transition-all shadow-sm"><FaChevronRight className="text-xs" /></button>
          </div>
        </div>
      )}
    </div>
  );
};
