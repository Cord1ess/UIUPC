"use client";

import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  IconSearch, IconFileExport, IconEye, IconClose, IconChevronLeft, 
  IconChevronRight, IconEnvelope, IconUniversity, IconImages, 
  IconSpinner, IconStar, IconRegStar, IconCheck, IconUsers, IconFilter 
} from '@/components/shared/Icons';
import { 
  Admin_Dropdown, Admin_ModuleHeader, Admin_StatCard, 
  Admin_ErrorBoundary, Admin_DeleteConfirmModal 
} from "@/features/admin/components";
import { supabase } from "@/lib/supabase";
// import { Admin_CommitteeManagerModal } from "./Admin_CommitteeManagerModal";
import { exportToCSV, generateBccMailto } from "@/utils/adminHelpers";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { ExhibitionSubmission } from "@/types/admin";
import { initAdminPassword } from "@/features/admin/actions";

interface Admin_SubmissionsProps {
  data: ExhibitionSubmission[];
  count: number;
  currentPage: number;
  searchTerm: string;
  filterCategory: string;
  onFilterChange: (filters: { page?: number; search?: string; category?: string }) => void;
  onOpenDetails: (item: ExhibitionSubmission) => void;
  onOpenEmail?: (item: ExhibitionSubmission) => void;
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

const SubmissionRow = React.memo(({ 
  item, isSelected, toggleSelection, onOpenDetails, onOpenEmail, onToggleHero, onDelete 
}: { 
  item: ExhibitionSubmission; isSelected: boolean; toggleSelection: (id: string) => void; 
  onOpenDetails: (item: ExhibitionSubmission) => void; 
  onOpenEmail?: (item: ExhibitionSubmission) => void;
  onToggleHero: (item: ExhibitionSubmission) => void;
  onDelete: (item: ExhibitionSubmission) => void;
}) => {
  return (
    <motion.tr className={`group hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition-all ${isSelected ? 'bg-uiupc-orange/[0.03]' : ''} border-b border-zinc-100 dark:border-zinc-800/50`}>
      <td className="px-8 py-4 w-20">
        <input 
          type="checkbox" 
          className="w-5 h-5 rounded-lg border-zinc-300 text-uiupc-orange cursor-pointer transition-all" 
          checked={isSelected} 
          onChange={() => toggleSelection(item.id)} 
        />
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-sm font-black text-uiupc-orange shadow-inner truncate shrink-0">
            {(item.participant_name || "?").charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col min-w-[200px]">
            <span className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-tight truncate">{item.participant_name}</span>
            <span className="text-[11px] font-bold text-zinc-400 lowercase truncate tracking-tight">Participant</span>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap hidden sm:table-cell">
        <div className="flex items-center gap-2 text-[11px] font-black text-zinc-900 dark:text-white uppercase tracking-wider">
          <IconUniversity size={10} className="text-uiupc-orange" /> {item.institute || "N/A"}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
         <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{item.photo_title || "Untitled"}</span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap hidden lg:table-cell">
         <button 
           onClick={() => onToggleHero(item)}
           className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all ${
             item.featured_on_hero 
               ? 'bg-uiupc-orange/10 text-uiupc-orange border border-uiupc-orange/20' 
               : 'bg-zinc-100 dark:bg-[#1a1a1a] text-zinc-400 border border-transparent hover:border-zinc-300'
           }`}
         >
           {item.featured_on_hero ? <IconStar size={10} /> : <IconRegStar size={10} />}
           {item.featured_on_hero ? "Featured" : "Feature on Home"}
         </button>
      </td>
      <td className="px-6 py-4 whitespace-nowrap"><CategoryBadge category={item.category} /></td>
      <td className="px-8 py-4 text-right whitespace-nowrap">
        <div className="flex items-center justify-end gap-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
          <button onClick={() => onOpenDetails(item)} title="Details" className="w-10 h-10 flex items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:bg-uiupc-orange hover:text-white transition-all"><IconEye size={12} /></button>
          {onOpenEmail && (
            <button onClick={() => onOpenEmail(item)} title="Email" className="w-10 h-10 flex items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:bg-blue-500 hover:text-white transition-all"><IconEnvelope size={12} /></button>
          )}
          <button onClick={() => onDelete(item)} title="Delete" className="w-10 h-10 flex items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400 hover:bg-red-500 hover:text-white transition-all"><IconClose size={12} /></button>
        </div>
      </td>
    </motion.tr>
  );
});
SubmissionRow.displayName = 'SubmissionRow';

export const Admin_Submissions: React.FC<Admin_SubmissionsProps> = ({
  data, count, currentPage, searchTerm, filterCategory, onFilterChange, onOpenDetails, onOpenEmail
}) => {
  const { adminProfile } = useSupabaseAuth();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isSelectAllMode, setIsSelectAllMode] = useState(false);
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set());
  const [deleteTarget, setDeleteTarget] = useState<ExhibitionSubmission | null>(null);

  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { initAdminPassword(); }, []);

  const handleSearchInput = useCallback((value: string) => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      onFilterChange({ search: value, page: 0 });
    }, 400);
  }, [onFilterChange]);

  const handleToggleHero = async (item: ExhibitionSubmission) => {
    try {
      const { error } = await supabase
        .from("exhibition_submissions")
        .update({ featured_on_hero: !item.featured_on_hero })
        .eq('id', item.id);
      if (error) throw error;
      onFilterChange({});
    } catch (err: any) {
      alert("Action failed: " + err.message);
    }
  };

  const handleBulkEmail = () => {
    const targetItems = isSelectAllMode ? data : data.filter(item => selectedIds.has(item.id));
    const emails = targetItems
      .map(m => m.email)
      .filter((e): e is string => !!e && e.includes('@'));
    
    if (emails.length === 0) {
      alert("No valid emails found for selected entries.");
      return;
    }
    generateBccMailto(emails, adminProfile?.email);
  };

  const handleSelectAll = useCallback((checked: boolean) => {
    setIsSelectAllMode(checked);
    setSelectedIds(new Set());
  }, []);

  const handleToggleSelection = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const refreshData = useCallback(() => {
    setSelectedIds(new Set());
    setIsSelectAllMode(false);
    setHiddenIds(new Set());
    onFilterChange({});
  }, [onFilterChange]);

  const visibleData = useMemo(() => {
    return data.filter(item => !hiddenIds.has(item.id));
  }, [data, hiddenIds]);

  const pageSize = 12;
  const totalPages = Math.ceil((count || 0) / pageSize);
  const instituteCount = new Set(data.map(item => item.institute)).size;

  return (
    <div className="w-full space-y-6 min-w-0 relative z-10 isolate">
      <Admin_ModuleHeader 
        title="Exhibition"
        description="Manage gallery submissions and featured photos."
      >
        <Admin_StatCard label="Total Entries" value={count} icon={<IconImages size={20} />} />
        
        <div className="p-6 bg-white dark:bg-[#0d0d0d] border border-zinc-200 dark:border-zinc-800 rounded-2xl flex flex-col justify-between shadow-sm min-h-[140px] group">
          <p className="text-zinc-400 text-[10px] font-black uppercase tracking-widest">Filter Category</p>
          <div className="flex items-end justify-between mt-auto">
            <div className="text-uiupc-orange text-4xl opacity-20 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500">
              <IconFilter size={40} />
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

        <Admin_StatCard label="Institutions" value={instituteCount} icon={<IconUniversity size={20} />} />
        <Admin_StatCard label="Review Status" value="Online" icon={<IconCheck size={20} />} color="text-green-500" />
      </Admin_ModuleHeader>

      {/* ── FILTER BAR ─────────────────────────────────────────── */}
      <div className="w-full bg-white dark:bg-[#0d0d0d] p-3 sm:p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm relative z-10">
        <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
          <div className="relative flex-1 group min-w-[200px]">
            <IconSearch size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-uiupc-orange transition-colors" />
            <input 
              type="text" 
              placeholder="Search entries..." 
              defaultValue={searchTerm} 
              onChange={(e) => handleSearchInput(e.target.value)}
              className="w-full py-4 pl-14 pr-8 bg-zinc-100 dark:bg-[#1a1a1a] border border-transparent focus:border-uiupc-orange/30 rounded-xl text-sm outline-none transition-all placeholder:text-zinc-400 font-medium" 
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button 
              onClick={() => exportToCSV("submissions", data)} 
              className="px-8 h-12 flex items-center gap-3 bg-uiupc-orange text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-uiupc-orange/20 hover:brightness-110 transition-all"
            >
              <IconFileExport size={14} /> Export List
            </button>
          </div>
        </div>
      </div>

      {/* ── BULK ACTIONS ───────────────────────────────────────── */}
      <AnimatePresence>
        {(selectedIds.size > 0 || isSelectAllMode) && (
          <motion.div 
            initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }}
            className="fixed bottom-28 sm:bottom-12 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 sm:gap-6 px-4 sm:px-10 py-3 sm:py-4 bg-zinc-950 dark:bg-white rounded-2xl shadow-2xl border border-zinc-800 dark:border-zinc-200"
          >
            <div className="flex items-center gap-3 sm:gap-5 pr-4 sm:pr-8 border-r border-white/10 dark:border-black/10">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-uiupc-orange flex items-center justify-center text-white text-[10px] sm:text-[12px] font-black">
                {isSelectAllMode ? count : selectedIds.size}
              </div>
              <div className="flex flex-col">
                <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-white dark:text-black">Selected</span>
                <span className="text-[7px] sm:text-[8px] font-bold text-zinc-500 uppercase">Submissions</span>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <button onClick={handleBulkEmail} className="flex items-center gap-2 px-6 py-4 bg-uiupc-orange text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all"><IconEnvelope size={12} /><span>Email All</span></button>
              <button onClick={() => { setSelectedIds(new Set()); setIsSelectAllMode(false); }} className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-zinc-500 hover:text-white dark:hover:text-black transition-colors"><IconClose size={14} /></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── DATA TABLE ─────────────────────────────────────────── */}
      <div className="bg-white dark:bg-[#0d0d0d] rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm relative z-10">
        <div className="overflow-x-auto min-h-[500px]">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-zinc-50 dark:bg-zinc-900/50">
                <th className="px-8 py-4 text-left w-20">
                  <input 
                    type="checkbox" 
                    className="w-5 h-5 rounded-lg border-zinc-300 text-uiupc-orange transition-all cursor-pointer" 
                    checked={isSelectAllMode || (selectedIds.size > 0 && selectedIds.size >= count)} 
                    onChange={(e) => handleSelectAll(e.target.checked)} 
                  />
                </th>
                <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 whitespace-nowrap">Full Name</th>
                <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 whitespace-nowrap hidden sm:table-cell">Institution</th>
                <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 whitespace-nowrap hidden md:table-cell">Photo Title</th>
                <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 whitespace-nowrap hidden lg:table-cell">Hero Status</th>
                <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 whitespace-nowrap">Category</th>
                <th className="px-8 py-4 text-right text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5">
              {visibleData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 rounded-[2rem] bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center text-zinc-300 dark:text-zinc-600"><IconSearch size={20} /></div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">No submissions found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                visibleData.map((item) => (
                  <SubmissionRow 
                    key={item.id} 
                    item={item} 
                    isSelected={selectedIds.has(item.id) || isSelectAllMode}
                    toggleSelection={handleToggleSelection}
                    onOpenDetails={onOpenDetails}
                    onOpenEmail={onOpenEmail}
                    onToggleHero={handleToggleHero}
                    onDelete={setDeleteTarget}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── PAGINATION ────────────────────────────────────────── */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-10 border-t border-black/5 dark:border-white/5">
          <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Exhibition Overview</p>
            <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Page {currentPage + 1} of {totalPages} <span className="hidden sm:inline">| Total {count} Entries</span></p>
          </div>
          <div className="flex items-center gap-3">
            <button disabled={currentPage === 0} onClick={() => onFilterChange({ page: Math.max(0, currentPage - 1) })} className="w-14 h-12 flex items-center justify-center rounded-xl bg-white dark:bg-[#080808] border border-black/5 dark:border-white/5 text-zinc-400 disabled:opacity-20 hover:border-uiupc-orange hover:text-uiupc-orange transition-all shadow-sm"><IconChevronLeft size={12} /></button>
            <button disabled={currentPage >= totalPages - 1} onClick={() => onFilterChange({ page: currentPage + 1 })} className="w-14 h-12 flex items-center justify-center rounded-xl bg-white dark:bg-[#080808] border border-black/5 dark:border-white/5 text-zinc-400 disabled:opacity-20 hover:border-uiupc-orange hover:text-uiupc-orange transition-all shadow-sm"><IconChevronRight size={12} /></button>
          </div>
        </div>
      )}

      {/* ── MODALS ─────────────────────────────────────────────── */}
      <Admin_ErrorBoundary>
        <Admin_DeleteConfirmModal 
          isOpen={!!deleteTarget} 
          onClose={() => setDeleteTarget(null)} 
          itemId={deleteTarget?.id} 
          itemName={deleteTarget?.participant_name} 
          onSuccess={() => {
            if (deleteTarget) setHiddenIds(prev => new Set(prev).add(deleteTarget.id));
            refreshData();
          }}
        />
      </Admin_ErrorBoundary>
    </div>
  );
};
