"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { 
  FaSearch, 
  FaPlus, 
  FaUserTie, 
  FaChevronLeft, 
  FaChevronRight, 
  FaEdit, 
  FaTrash, 
  FaFacebook, 
  FaLinkedin,
  FaCrown,
  FaLayerGroup
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { Admin_Dropdown } from "@/features/admin/components";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { supabase } from "@/lib/supabase";
import { Admin_CommitteeModal } from "./Admin_CommitteeModal";

export const Admin_Committee: React.FC = () => {
  const { adminProfile } = useSupabaseAuth();
  const [page, setPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDept, setFilterDept] = useState("all");
  const [showUpsertModal, setShowUpsertModal] = useState(false);
  const [upsertItem, setUpsertItem] = useState<any>(null);
  const pageSize = 12;

  const filters = useMemo(() => {
    const f: Record<string, any> = {};
    if (filterDept !== "all") f.department = filterDept;
    return f;
  }, [filterDept]);

  const { data, count, isLoading, refetch } = useSupabaseData("committees", {
    page,
    pageSize,
    filters,
    orderBy: 'order_index',
    orderDesc: false,
  });

  const { data: allCommittee } = useSupabaseData("committees", { limit: 1000 });
  const departments = useMemo(() => {
    const d = new Set<string>();
    if (Array.isArray(allCommittee)) {
      allCommittee.forEach(item => (item.department || item.tag) && d.add(item.department || item.tag));
    }
    return Array.from(d).sort();
  }, [allCommittee]);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Remove this member?")) return;
    try {
      const { error } = await supabase.from("committees").delete().eq('id', id);
      if (error) throw error;
      refetch();
    } catch (err: any) {
      console.error("Delete failed:", err.message);
    }
  };

  const handleUpsert = async (id: string | null, recordData: any) => {
    try {
      const { error } = id 
        ? await supabase.from("committees").update(recordData).eq('id', id)
        : await supabase.from("committees").insert([recordData]);
      if (error) throw error;
      refetch();
      return { success: true };
    } catch (err: any) {
      return { success: false, message: err.message };
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
              placeholder="Search by name or portfolio..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full py-5 pl-14 pr-8 bg-zinc-50 dark:bg-zinc-900/50 border border-transparent focus:border-uiupc-orange/30 rounded-2xl text-sm outline-none transition-all placeholder:text-zinc-400 font-medium" 
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex flex-col gap-1.5">
              <span className="text-[8px] font-black uppercase tracking-widest text-zinc-400 pl-4">Portfolio</span>
              <Admin_Dropdown 
                value={filterDept} 
                onChange={setFilterDept}
                options={[{ value: 'all', label: 'All Portfolios' }, ...departments.map(d => ({ value: d, label: d }))]}
                className="min-w-[180px]"
              />
            </div>
            <button 
              onClick={() => { setUpsertItem(null); setShowUpsertModal(true); }}
              className="px-8 h-14 mt-auto flex items-center gap-3 bg-uiupc-orange text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-uiupc-orange/20 hover:brightness-110 transition-all"
            >
              <FaPlus /> Appoint Member
            </button>
          </div>
        </div>
      </div>

      {/* ── DATA TABLE ─────────────────────────────────────────── */}
      <div className="bg-white dark:bg-[#080808] rounded-[2.5rem] border border-black/5 dark:border-white/5 overflow-hidden shadow-sm">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-zinc-50 dark:bg-zinc-900/50">
                <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 whitespace-nowrap">Member Identity</th>
                <th className="px-6 py-6 text-left text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 whitespace-nowrap">Designation</th>
                <th className="px-6 py-6 text-left text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 whitespace-nowrap">Portfolio</th>
                <th className="px-6 py-6 text-left text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 whitespace-nowrap">Session</th>
                <th className="px-8 py-6 text-right text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5">
              {isLoading ? (
                [...Array(6)].map((_, i) => <tr key={i} className="animate-pulse"><td colSpan={5} className="px-8 py-8"><div className="h-8 bg-zinc-50 dark:bg-zinc-900 rounded-xl" /></td></tr>)
              ) : (
                (data || []).filter(m => (m.member_name || "").toLowerCase().includes(searchTerm.toLowerCase()) || (m.designation || "").toLowerCase().includes(searchTerm.toLowerCase())).map((item) => (
                  <motion.tr key={item.id} className="group hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition-all">
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-sm font-black text-uiupc-orange shadow-inner overflow-hidden">
                          {item.image_url || item.image ? <img src={item.image_url || item.image} alt="" className="w-full h-full object-cover" /> : <FaUserTie size={16} />}
                        </div>
                        <div className="flex flex-col min-w-[200px]">
                          <span className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-tight truncate">{item.member_name}</span>
                          <div className="flex items-center gap-3 mt-1">
                            {item.social_links?.facebook && <a href={item.social_links.facebook} target="_blank" rel="noreferrer" className="text-zinc-400 hover:text-blue-600"><FaFacebook size={10} /></a>}
                            {item.social_links?.linkedin && <a href={item.social_links.linkedin} target="_blank" rel="noreferrer" className="text-zinc-400 hover:text-blue-700"><FaLinkedin size={10} /></a>}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6 whitespace-nowrap">
                       <span className="text-[11px] font-black text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                         <FaCrown className="text-uiupc-orange text-[10px]" /> {item.designation}
                       </span>
                    </td>
                    <td className="px-6 py-6 whitespace-nowrap">
                       <span className="px-4 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800/50 text-zinc-500 dark:text-zinc-400 text-[9px] font-black uppercase tracking-widest border border-black/5 dark:border-white/5 flex items-center gap-2 w-fit">
                         <FaLayerGroup className="text-[10px]" /> {item.department || item.tag}
                       </span>
                    </td>
                    <td className="px-6 py-6 whitespace-nowrap">
                       <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{item.year || "N/A"}</span>
                    </td>
                    <td className="px-8 py-6 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => { setUpsertItem(item); setShowUpsertModal(true); }} className="w-10 h-10 flex items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:bg-uiupc-orange hover:text-white transition-all"><FaEdit className="text-xs" /></button>
                        <button onClick={() => handleDelete(item.id)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400 hover:bg-red-500 hover:text-white transition-all"><FaTrash className="text-xs" /></button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── PAGINATION ─────────────────────────────────────────── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-10 border-t border-black/5 dark:border-white/5">
          <div className="flex flex-col"><p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Leadership Tracker</p><p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Page {page + 1} of {totalPages} | Total {count} Appointees</p></div>
          <div className="flex items-center gap-3">
            <button disabled={page === 0} onClick={() => { setPage(p => Math.max(0, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="w-14 h-14 flex items-center justify-center rounded-2xl bg-white dark:bg-[#080808] border border-black/5 dark:border-white/5 text-zinc-400 disabled:opacity-20 hover:border-uiupc-orange hover:text-uiupc-orange shadow-sm transition-all"><FaChevronLeft className="text-xs" /></button>
            <button disabled={page >= totalPages - 1} onClick={() => { setPage(p => p + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="w-14 h-14 flex items-center justify-center rounded-2xl bg-white dark:bg-[#080808] border border-black/5 dark:border-white/5 text-zinc-400 disabled:opacity-20 hover:border-uiupc-orange hover:text-uiupc-orange shadow-sm transition-all"><FaChevronRight className="text-xs" /></button>
          </div>
        </div>
      )}

      <Admin_CommitteeModal isOpen={showUpsertModal} onClose={() => setShowUpsertModal(false)} item={upsertItem} onSave={handleUpsert} />
    </div>
  );
};
