"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaSearch, 
  FaFileExport, 
  FaEye, 
  FaTimes, 
  FaChevronLeft, 
  FaChevronRight, 
  FaEnvelope, 
  FaCamera, 
  FaUniversity,
  FaImages,
  FaSpinner
} from 'react-icons/fa';
import { Admin_Dropdown } from "@/features/admin/components";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { supabase } from "@/lib/supabase";
import { exportToCSV, generateBccMailto } from "@/utils/adminHelpers";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";

interface Admin_SubmissionsProps {
  onOpenDetails: (item: Record<string, any>) => void;
  onOpenEmail: (item: Record<string, any>) => void;
  forcedSession?: string;
}

const CategoryBadge = ({ category }: { category: string }) => {
  const styles: Record<string, string> = {
    single: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    story: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    mobile: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  };
  const cat = (category || "single").toLowerCase();
  return (
    <span className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${styles[cat] || styles.single}`}>
      {category || "Single"}
    </span>
  );
};

export const Admin_Submissions: React.FC<Admin_SubmissionsProps> = ({
  onOpenDetails, onOpenEmail, forcedSession = "all"
}) => {
  const { adminProfile } = useSupabaseAuth();
  const [page, setPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterPayment, setFilterPayment] = useState("all");
  const [sortBy] = useState("submitted_at");
  const [orderDesc] = useState(true);
  
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const pageSize = 12;

  // Sync with global filters
  useEffect(() => { setPage(0); }, [forcedSession, filterCategory, filterPayment]);

  const filters = useMemo(() => {
    const f: Record<string, any> = {};
    if (filterCategory !== "all") f.category = filterCategory;
    if (filterPayment !== "all") f.payment_status = filterPayment;
    if (forcedSession !== "all") f.session = forcedSession;
    return f;
  }, [filterCategory, filterPayment, forcedSession]);

  const { data, count, isLoading, refetch } = useSupabaseData("exhibition_submissions", {
    page,
    pageSize,
    filters,
    orderBy: sortBy,
    orderDesc,
  });

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this submission?")) return;
    try {
      const { error } = await supabase.from("exhibition_submissions").delete().eq('id', id);
      if (error) throw error;
      refetch();
    } catch (err: any) {
      console.error("Delete failed:", err.message);
    }
  };

  const handleBulkEmail = () => {
    if (selectedIds.size === 0) return;
    const emails = (Array.isArray(data) ? data : [])
      .filter(item => selectedIds.has(item.id))
      .map(m => m.email || m.Email)
      .filter(Boolean);
    
    if (emails.length === 0) return;
    generateBccMailto(emails, adminProfile?.email);
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
              placeholder="Search by participant or institution..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full py-5 pl-14 pr-8 bg-zinc-50 dark:bg-zinc-900/50 border border-transparent focus:border-uiupc-orange/30 rounded-2xl text-sm outline-none transition-all placeholder:text-zinc-400 font-medium" 
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex flex-col gap-1.5">
              <span className="text-[8px] font-black uppercase tracking-widest text-zinc-400 pl-4">Category</span>
              <Admin_Dropdown 
                value={filterCategory} 
                onChange={setFilterCategory}
                options={[
                  { value: 'all', label: 'All Categories' },
                  { value: 'Single', label: 'Single' },
                  { value: 'Story', label: 'Story' },
                  { value: 'Mobile', label: 'Mobile' }
                ]}
                className="min-w-[160px]"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-[8px] font-black uppercase tracking-widest text-zinc-400 pl-4">Payment</span>
              <Admin_Dropdown 
                value={filterPayment} 
                onChange={setFilterPayment}
                options={[
                  { value: 'all', label: 'Any Status' },
                  { value: 'paid', label: 'Paid' },
                  { value: 'unpaid', label: 'Unpaid' }
                ]}
                className="min-w-[160px]"
              />
            </div>
            <button 
              onClick={() => exportToCSV("submissions", data || [])} 
              className="px-8 h-14 mt-auto flex items-center gap-3 bg-uiupc-orange text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-uiupc-orange/20 hover:brightness-110 transition-all"
            >
              <FaFileExport /> Export
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
                <span className="text-[8px] font-bold text-zinc-500 uppercase">Submissions</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button onClick={handleBulkEmail} className="flex items-center gap-3 px-8 py-4 bg-uiupc-orange text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all"><FaEnvelope /><span>Send Email</span></button>
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
                  <input type="checkbox" className="w-5 h-5 rounded-lg border-zinc-300 text-uiupc-orange cursor-pointer" checked={Array.isArray(data) && data.length > 0 && selectedIds.size === data.length} onChange={(e) => e.target.checked ? setSelectedIds(new Set((data || []).map(i => i.id))) : setSelectedIds(new Set())} />
                </th>
                <th className="px-6 py-6 text-left text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 whitespace-nowrap">Participant</th>
                <th className="px-6 py-6 text-left text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 whitespace-nowrap">Institution</th>
                <th className="px-6 py-6 text-left text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 whitespace-nowrap">Photos</th>
                <th className="px-6 py-6 text-left text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 whitespace-nowrap">Category</th>
                <th className="px-8 py-6 text-right text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5">
              {isLoading ? (
                [...Array(6)].map((_, i) => <tr key={i} className="animate-pulse"><td colSpan={6} className="px-8 py-8"><div className="h-8 bg-zinc-50 dark:bg-zinc-900 rounded-xl" /></td></tr>)
              ) : (
                (data || []).filter(item => (item.full_name || "").toLowerCase().includes(searchTerm.toLowerCase()) || (item.institution || "").toLowerCase().includes(searchTerm.toLowerCase())).map((item) => (
                  <motion.tr key={item.id} className={`group hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition-all ${selectedIds.has(item.id) ? 'bg-uiupc-orange/[0.03]' : ''}`}>
                    <td className="px-8 py-6"><input type="checkbox" className="w-5 h-5 rounded-lg border-zinc-300 text-uiupc-orange cursor-pointer" checked={selectedIds.has(item.id)} onChange={() => { const s = new Set(selectedIds); if (s.has(item.id)) s.delete(item.id); else s.add(item.id); setSelectedIds(s); }} /></td>
                    <td className="px-6 py-6 whitespace-nowrap">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-sm font-black text-uiupc-orange shadow-inner truncate">{(item.full_name || "?").charAt(0)}</div>
                        <div className="flex flex-col min-w-[200px]">
                          <span className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-tight truncate">{item.full_name}</span>
                          <span className="text-[11px] font-bold text-zinc-400 lowercase truncate">{item.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-[11px] font-black text-zinc-900 dark:text-white uppercase tracking-wider">
                        <FaUniversity className="text-uiupc-orange text-[10px]" /> {item.institution || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-6 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                        <FaImages className="text-zinc-300" /> {Number(item.photo_count || 0) + Number(item.story_photo_count || 0)} Files
                      </div>
                    </td>
                    <td className="px-6 py-6 whitespace-nowrap"><CategoryBadge category={item.category} /></td>
                    <td className="px-8 py-6 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => onOpenDetails(item)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:bg-uiupc-orange hover:text-white transition-all"><FaEye className="text-xs" /></button>
                        <button onClick={() => onOpenEmail(item)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white transition-all"><FaEnvelope className="text-xs" /></button>
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
          <div className="flex flex-col"><p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Registry Status</p><p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Page {page + 1} of {totalPages} | Total {count} Entries</p></div>
          <div className="flex items-center gap-3">
            <button disabled={page === 0} onClick={() => { setPage(p => Math.max(0, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="w-14 h-14 flex items-center justify-center rounded-2xl bg-white dark:bg-[#080808] border border-black/5 dark:border-white/5 text-zinc-400 disabled:opacity-20 hover:border-uiupc-orange hover:text-uiupc-orange shadow-sm transition-all"><FaChevronLeft className="text-xs" /></button>
            <button disabled={page >= totalPages - 1} onClick={() => { setPage(p => p + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="w-14 h-14 flex items-center justify-center rounded-2xl bg-white dark:bg-[#080808] border border-black/5 dark:border-white/5 text-zinc-400 disabled:opacity-20 hover:border-uiupc-orange hover:text-uiupc-orange shadow-sm transition-all"><FaChevronRight className="text-xs" /></button>
          </div>
        </div>
      )}
    </div>
  );
};
