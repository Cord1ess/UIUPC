"use client";

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaSearch, 
  FaFileExport, 
  FaEye, 
  FaTimes, 
  FaChevronLeft, 
  FaChevronRight, 
  FaEnvelope, 
  FaUniversity,
  FaImages,
  FaSpinner,
  FaStar,
  FaRegStar,
  FaCheck,
  FaUsers,
  FaFilter
} from 'react-icons/fa';
import { Admin_Dropdown, Admin_ModuleHeader, Admin_StatCard } from "@/features/admin/components";
import { supabase } from "@/lib/supabase";
import { exportToCSV, generateBccMailto } from "@/utils/adminHelpers";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { ExhibitionSubmission } from "@/types/admin";

interface Admin_SubmissionsProps {
  data: ExhibitionSubmission[];
  count: number;
  currentPage: number;
  searchTerm: string;
  filterCategory: string;
  onFilterChange: (filters: { page?: number; search?: string; category?: string }) => void;
  onOpenDetails: (item: Record<string, any>) => void;
  onOpenEmail: (item: Record<string, any>) => void;
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
  data,
  count,
  currentPage,
  searchTerm,
  filterCategory,
  onFilterChange,
  onOpenDetails, 
  onOpenEmail
}) => {
  const { adminProfile } = useSupabaseAuth();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const pageSize = 12;
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearchInput = (value: string) => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      onFilterChange({ search: value, page: 0 });
    }, 400);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this submission?")) return;
    try {
      const { error } = await supabase.from("exhibition_submissions").delete().eq('id', id);
      if (error) throw error;
      onFilterChange({});
    } catch (err: any) {
      console.error("Delete failed:", err.message);
    }
  };

  const handleToggleHero = async (item: any) => {
    try {
      const { error } = await supabase
        .from("exhibition_submissions")
        .update({ featured_on_hero: !item.featured_on_hero })
        .eq('id', item.id);
      if (error) throw error;
      onFilterChange({});
    } catch (err: any) {
      console.error("Toggle hero failed:", err.message);
    }
  };

  const handleBulkEmail = () => {
    if (selectedIds.size === 0) return;
    const emails = data
      .filter(item => selectedIds.has(item.id))
      .map(m => m.participant_name) 
      .filter(Boolean);
    
    if (emails.length === 0) return;
    generateBccMailto(emails, adminProfile?.email);
  };

  const totalPages = Math.ceil((count || 0) / pageSize);
  const instituteCount = new Set(data.map(item => item.institution)).size;

  return (
    <div className="w-full space-y-6 min-w-0">
      <Admin_ModuleHeader 
        title="Submissions"
        description="Manage exhibition photo submissions."
      >
        <Admin_StatCard label="Total Entries" value={count} icon={<FaImages />} />
        
        {/* Category Filter Card */}
        <div className="p-6 bg-white dark:bg-[#080808] border border-black/5 dark:border-white/5 rounded-2xl flex flex-col justify-between shadow-sm min-h-[140px] group">
          <p className="text-zinc-400 text-[10px] font-black uppercase tracking-widest">Category</p>
          <div className="flex items-end justify-between mt-auto">
            <div className="text-uiupc-orange text-4xl opacity-20 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500">
              <FaFilter />
            </div>
            <div className="flex-1 ml-6 max-w-[180px]">
              <Admin_Dropdown 
                variant="minimal"
                label="Photo Category"
                value={filterCategory} 
                onChange={(val) => onFilterChange({ category: val, page: 0 })}
                options={[
                  { value: 'all', label: 'All Categories' },
                  { value: 'Single', label: 'Single' },
                  { value: 'Story', label: 'Story' },
                  { value: 'Mobile', label: 'Mobile' }
                ]}
                className="w-full"
              />
            </div>
          </div>
        </div>

        <Admin_StatCard label="Institutions" value={instituteCount} icon={<FaUniversity />} />
        <Admin_StatCard label="Database" value="Connected" icon={<FaCheck />} color="text-green-500" />
      </Admin_ModuleHeader>

      <div className="w-full bg-white dark:bg-[#080808] p-4 rounded-2xl border border-black/5 dark:border-white/5 shadow-sm">
        <div className="flex flex-col xl:flex-row gap-4 items-stretch xl:items-center justify-between">
          <div className="relative flex-1 group">
            <FaSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-uiupc-orange transition-colors" />
            <input 
              type="text" 
              placeholder="Search by participant or institution..." 
              defaultValue={searchTerm} 
              onChange={(e) => handleSearchInput(e.target.value)}
              className="w-full py-4 pl-14 pr-8 bg-zinc-50 dark:bg-zinc-900/50 border border-transparent focus:border-uiupc-orange/30 rounded-xl text-sm outline-none transition-all placeholder:text-zinc-400 font-medium" 
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button 
              onClick={() => exportToCSV("submissions", data)} 
              className="px-8 h-12 flex items-center gap-3 bg-uiupc-orange text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-uiupc-orange/20 hover:brightness-110 transition-all"
            >
              <FaFileExport /> Download List
            </button>
          </div>
        </div>
      </div>

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
                <span className="text-[8px] font-bold text-zinc-500 uppercase">Submissions</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button onClick={handleBulkEmail} className="flex items-center gap-3 px-8 py-4 bg-uiupc-orange text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all"><FaEnvelope /><span>Send Email</span></button>
              <button onClick={() => setSelectedIds(new Set())} className="w-12 h-12 flex items-center justify-center text-zinc-500 hover:text-white dark:hover:text-black transition-colors"><FaTimes /></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white dark:bg-[#080808] rounded-2xl border border-black/5 dark:border-white/5 overflow-hidden shadow-sm">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-zinc-50 dark:bg-zinc-900/50">
                <th className="px-8 py-4 text-left w-20">
                  <input type="checkbox" className="w-5 h-5 rounded-lg border-zinc-300 text-uiupc-orange cursor-pointer" checked={data.length > 0 && selectedIds.size === data.length} onChange={(e) => e.target.checked ? setSelectedIds(new Set(data.map(i => i.id))) : setSelectedIds(new Set())} />
                </th>
                <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 whitespace-nowrap">Full Name</th>
                <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 whitespace-nowrap">University</th>
                <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 whitespace-nowrap">Photo Count</th>
                <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 whitespace-nowrap">Event Type</th>
                <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 whitespace-nowrap">Show on Home Page</th>
                <th className="px-8 py-4 text-right text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5">
              {data.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-8 py-20 text-center text-[10px] font-black uppercase tracking-widest text-zinc-400">No records found</td>
                </tr>
              ) : (
                data.map((item) => (
                  <motion.tr key={item.id} className={`group hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition-all ${selectedIds.has(item.id) ? 'bg-uiupc-orange/[0.03]' : ''}`}>
                    <td className="px-8 py-4"><input type="checkbox" className="w-5 h-5 rounded-lg border-zinc-300 text-uiupc-orange cursor-pointer" checked={selectedIds.has(item.id)} onChange={() => { const s = new Set(selectedIds); if (s.has(item.id)) s.delete(item.id); else s.add(item.id); setSelectedIds(s); }} /></td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-sm font-black text-uiupc-orange shadow-inner truncate">{(item.participant_name || "?").charAt(0)}</div>
                        <div className="flex flex-col min-w-[200px]">
                          <span className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-tight truncate">{item.participant_name}</span>
                          <span className="text-[11px] font-bold text-zinc-400 lowercase truncate tracking-tight">Participant</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-[11px] font-black text-zinc-900 dark:text-white uppercase tracking-wider">
                        <FaUniversity className="text-uiupc-orange text-[10px]" /> {item.institution || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                       {item.photo_title || "Untitled"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                       <button 
                         onClick={() => handleToggleHero(item)}
                         className={`flex items-center gap-2 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest transition-all ${
                           item.featured_on_hero 
                             ? 'bg-uiupc-orange/10 text-uiupc-orange border border-uiupc-orange/20' 
                             : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 border border-transparent hover:border-zinc-300'
                         }`}
                       >
                         {item.featured_on_hero ? <FaStar /> : <FaRegStar />}
                         {item.featured_on_hero ? "Featured" : "Show on Home"}
                       </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap"><CategoryBadge category={item.category} /></td>
                    <td className="px-8 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => onOpenDetails(item)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:bg-uiupc-orange hover:text-white transition-all"><FaEye className="text-xs" /></button>
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

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-10 border-t border-black/5 dark:border-white/5">
          <div className="flex flex-col"><p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Submission Tracker</p><p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Page {currentPage + 1} of {totalPages} | Total {count} Submissions</p></div>
          <div className="flex items-center gap-3">
            <button disabled={currentPage === 0} onClick={() => onFilterChange({ page: Math.max(0, currentPage - 1) })} className="w-14 h-12 flex items-center justify-center rounded-xl bg-white dark:bg-[#080808] border border-black/5 dark:border-white/5 text-zinc-400 disabled:opacity-20 hover:border-uiupc-orange hover:text-uiupc-orange transition-all shadow-sm"><FaChevronLeft className="text-xs" /></button>
            <button disabled={currentPage >= totalPages - 1} onClick={() => onFilterChange({ page: currentPage + 1 })} className="w-14 h-12 flex items-center justify-center rounded-xl bg-white dark:bg-[#080808] border border-black/5 dark:border-white/5 text-zinc-400 disabled:opacity-20 hover:border-uiupc-orange hover:text-uiupc-orange transition-all shadow-sm"><FaChevronRight className="text-xs" /></button>
          </div>
        </div>
      )}
    </div>
  );
};
