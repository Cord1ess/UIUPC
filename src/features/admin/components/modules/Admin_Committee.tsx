"use client";

import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
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
  FaLayerGroup,
  FaCalendarAlt,
  FaIdBadge,
  FaFileExport,
  FaTimes,
  FaGripVertical,
  FaCheck,
  FaSpinner,
  FaClone,
  FaFolderOpen,
  FaUsers,
  FaFilter
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { Admin_Dropdown, Admin_ModuleHeader, Admin_StatCard, Admin_FilterMenu } from "@/features/admin/components";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { supabase } from "@/lib/supabase";
import { Admin_CommitteeModal } from "./Admin_CommitteeModal";
import { Admin_MemberTrajectory } from "./Admin_MemberTrajectory";
import { Admin_CommitteeManagerModal } from "./Admin_CommitteeManagerModal";
import { useAdminData } from "@/contexts/AdminDataContext";
import { getImageUrl } from "@/utils/imageUrl";
import { exportToCSV } from "@/utils/adminHelpers";
import { Admin_CommitteeFolderSyncModal } from "./Admin_CommitteeFolderSyncModal";
import { 
  upsertCommitteeMember, 
  deleteCommitteeMember 
} from "@/features/admin/actions";
import { CommitteeMember } from "@/types/admin";

const CommitteeRow = ({ item, isSelected, toggleSelection, onUpsert, onDelete, openTrajectory }: any) => {
  return (
    <motion.tr 
      className={`group hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition-all ${isSelected ? 'bg-uiupc-orange/[0.03]' : ''}`}
    >
      <td className="px-6 py-4 whitespace-nowrap w-12">
        <input 
          type="checkbox" 
          className="w-5 h-5 rounded-lg border-zinc-300 text-uiupc-orange transition-all cursor-pointer" 
          checked={isSelected} 
          onChange={toggleSelection} 
        />
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-sm font-black text-uiupc-orange shadow-inner overflow-hidden">
            {(item.image_url || item.image) && item.image_url !== 'PLACEHOLDER' ? (
              <img 
                src={getImageUrl(item.image_url || item.image, 100, 50)} 
                alt="" 
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover" 
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-uiupc-orange/20 to-uiupc-orange/5 text-uiupc-orange font-black text-sm">
                {(item.member_name || "?").split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()}
              </div>
            )}
          </div>
          <div className="flex flex-col min-w-[150px]">
            <span className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-tight truncate">{item.member_name}</span>
            <div className="flex items-center gap-3 mt-1">
              {item.social_links?.facebook && <a href={item.social_links.facebook} target="_blank" rel="noreferrer" className="text-zinc-400 hover:text-blue-600"><FaFacebook size={10} /></a>}
              {item.social_links?.linkedin && <a href={item.social_links.linkedin} target="_blank" rel="noreferrer" className="text-zinc-400 hover:text-blue-700"><FaLinkedin size={10} /></a>}
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
         <span className="text-[11px] font-black text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
           <FaCrown className="text-uiupc-orange text-[10px]" /> {item.designation}
         </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
         <span className="px-4 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800/50 text-zinc-500 dark:text-zinc-400 text-[9px] font-black uppercase tracking-widest border border-black/5 dark:border-white/5 flex items-center gap-2 w-fit">
           <FaLayerGroup className="text-[10px]" /> {item.department || item.tag}
         </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
         <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{item.year || "N/A"}</span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {item.student_id ? (
          <button
            onClick={() => openTrajectory(item.student_id)}
            className="text-[10px] font-bold text-uiupc-orange hover:underline uppercase tracking-widest flex items-center gap-2"
          >
            <FaIdBadge className="text-[10px]" /> {item.student_id}
          </button>
        ) : (
          <span className="text-[9px] font-bold text-zinc-400 italic">Not linked</span>
        )}
      </td>
      <td className="px-8 py-4 text-right whitespace-nowrap">
        <div className="flex items-center justify-end gap-2 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
          <button onClick={() => onUpsert(item)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:bg-uiupc-orange hover:text-white transition-all"><FaEdit className="text-xs" /></button>
          <button onClick={() => onDelete(item.id)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400 hover:bg-red-500 hover:text-white transition-all"><FaTrash className="text-xs" /></button>
        </div>
      </td>
    </motion.tr>
  );
};


interface Admin_CommitteeProps {
  data: CommitteeMember[];
  count: number;
  currentPage: number;
  searchTerm: string;
  filterYear: string;
  filterDept: string;
  filterCategory: string;
  filterLink: string;
  sortOrder: "asc" | "desc";
  availableYears: string[];
  onFilterChange: (filters: { 
    page?: number; 
    search?: string; 
    year?: string; 
    dept?: string;
    category?: string;
    link?: string;
    sort?: "asc" | "desc";
  }) => void;
}

export const Admin_Committee: React.FC<Admin_CommitteeProps> = ({ 
  data, 
  count, 
  currentPage,
  searchTerm,
  filterYear,
  filterDept,
  filterCategory,
  filterLink,
  sortOrder,
  availableYears,
  onFilterChange
}) => {
  const { adminProfile } = useSupabaseAuth();
  // ... (rest of state)
  const [showUpsertModal, setShowUpsertModal] = useState(false);
  const [upsertItem, setUpsertItem] = useState<any>(null);
  const [trajectoryStudentId, setTrajectoryStudentId] = useState<string | null>(null);
  const [showFolderSyncModal, setShowFolderSyncModal] = useState(false);
  
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  
  const pageSize = 12;
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearchInput = (value: string) => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      onFilterChange({ search: value, page: 0 });
    }, 400);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Remove this member?")) return;
    try {
      await deleteCommitteeMember(id);
    } catch (err: any) {
      console.error("Delete failed:", err.message);
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Delete ${selectedIds.size} selected members?`)) return;
    setIsBulkDeleting(true);
    try {
      await Promise.all(Array.from(selectedIds).map(id => deleteCommitteeMember(id)));
      setSelectedIds(new Set());
    } catch (err: any) {
      alert("Bulk delete failed: " + err.message);
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const handleUpsert = async (id: string | null, recordData: any) => {
    try {
      await upsertCommitteeMember({ ...recordData, id: id || undefined });
      return { success: true };
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  };

  const totalPages = Math.ceil((count || 0) / pageSize);
  const deptCount = new Set(data.filter(i => i.department).map(item => item.department)).size;

  const departments = useMemo(() => {
    const d = new Set<string>();
    data.forEach(item => item.department && d.add(item.department));
    return Array.from(d).sort();
  }, [data]);

  return (
    <div className="w-full space-y-6 min-w-0">
      <Admin_ModuleHeader 
        title="Committee"
        description="Manage all committee members and sessions."
      >
        <Admin_StatCard label="Total Members" value={count} icon={<FaUsers />} />
        
        {/* Quick Filters Card */}
        <div className="p-6 bg-white dark:bg-[#080808] border border-black/5 dark:border-white/5 rounded-2xl flex flex-col justify-between shadow-sm min-h-[140px] group">
          <p className="text-zinc-400 text-[10px] font-black uppercase tracking-widest">Quick Filters</p>
          <div className="flex items-end justify-between mt-auto">
            <div className="text-uiupc-orange text-4xl opacity-20 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500">
              <FaFilter />
            </div>
            <div className="flex-1 ml-6 max-w-[200px]">
              <Admin_FilterMenu 
                currentDept={filterDept}
                currentCategory={filterCategory}
                currentSort={sortOrder}
                currentLink={filterLink}
                departments={departments}
                onDeptChange={(val) => onFilterChange({ dept: val, page: 0 })}
                onCategoryChange={(val) => onFilterChange({ category: val, page: 0 })}
                onSortChange={(val) => onFilterChange({ sort: val, page: 0 })}
                onLinkChange={(val) => onFilterChange({ link: val, page: 0 })}
              />
            </div>
          </div>
        </div>

        {/* Committee Year Card */}
        <div className="p-6 bg-white dark:bg-[#080808] border border-black/5 dark:border-white/5 rounded-2xl flex flex-col justify-between shadow-sm min-h-[140px] group">
          <p className="text-zinc-400 text-[10px] font-black uppercase tracking-widest">Committee Year</p>
          <div className="flex items-end justify-between mt-auto">
            <div className="text-blue-500 text-4xl opacity-20 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500">
              <FaCalendarAlt />
            </div>
            <div className="flex-1 ml-6 max-w-[180px]">
              <Admin_Dropdown 
                variant="minimal"
                label="Select Session"
                value={filterYear} 
                onChange={(val) => onFilterChange({ year: val, page: 0 })}
                options={[{ value: 'all', label: 'All Records' }, ...availableYears.map(s => ({ value: s, label: s }))]}
                className="w-full"
              />
            </div>
          </div>
        </div>

        <Admin_StatCard label="Departments" value={deptCount} icon={<FaLayerGroup />} />
      </Admin_ModuleHeader>

      {/* ── FILTER BAR ─────────────────────────────────────────── */}
      <div className="w-full bg-white dark:bg-[#080808] p-4 rounded-2xl border border-black/5 dark:border-white/5 shadow-sm">
        <div className="flex flex-col xl:flex-row gap-4 items-stretch xl:items-center justify-between">
          <div className="relative flex-1 group">
            <FaSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-uiupc-orange transition-colors" />
            <input 
              type="text" 
              placeholder="Search by name or portfolio..." 
              defaultValue={searchTerm} 
              onChange={(e) => handleSearchInput(e.target.value)}
              className="w-full py-4 pl-14 pr-8 bg-zinc-50 dark:bg-zinc-900/50 border border-transparent focus:border-uiupc-orange/30 rounded-xl text-sm outline-none transition-all placeholder:text-zinc-400 font-medium" 
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button 
              onClick={() => exportToCSV("committee", data)} 
              className="px-6 h-12 flex items-center gap-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all"
            >
              <FaFileExport /> Export
            </button>

            <button 
              onClick={() => setShowFolderSyncModal(true)}
              className="px-6 h-12 flex items-center gap-3 bg-blue-500/10 text-blue-500 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-blue-500 hover:text-white transition-all"
              title="Link entire folder to this committee year"
            >
              <FaFolderOpen /> Link Folder
            </button>

            <button 
              onClick={() => { setUpsertItem(null); setShowUpsertModal(true); }}
              className="px-8 h-12 flex items-center gap-3 bg-uiupc-orange text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-uiupc-orange/20 hover:brightness-110 transition-all"
            >
              <FaPlus /> Add New
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
              <button disabled={isBulkDeleting} onClick={handleBulkDelete} className="flex items-center gap-3 px-8 py-4 bg-red-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all disabled:opacity-50">{isBulkDeleting ? <FaSpinner className="animate-spin" /> : <FaTrash />}<span>Delete Selected</span></button>
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
                <th className="px-6 py-4 text-left w-12">
                  <input 
                    type="checkbox" 
                    className="w-5 h-5 rounded-lg border-zinc-300 text-uiupc-orange focus:ring-uiupc-orange transition-all cursor-pointer" 
                    checked={data.length > 0 && selectedIds.size === data.length} 
                    onChange={(e) => e.target.checked ? setSelectedIds(new Set(data.map(i => i.id))) : setSelectedIds(new Set())} 
                  />
                </th>
                <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 whitespace-nowrap">Leader Name</th>
                <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 whitespace-nowrap">Title / Position</th>
                <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 whitespace-nowrap">Executive Role / Dept</th>
                <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 whitespace-nowrap">Year</th>
                <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 whitespace-nowrap">Identity Link</th>
                <th className="px-8 py-4 text-right text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5">
              {data.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 rounded-[2rem] bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center text-zinc-300 dark:text-zinc-600"><FaSearch size={20} /></div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">No records found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                data.map((item) => (
                  <CommitteeRow 
                    key={item.id} 
                    item={item} 
                    isSelected={selectedIds.has(item.id)}
                    toggleSelection={() => { const s = new Set(selectedIds); if (s.has(item.id)) s.delete(item.id); else s.add(item.id); setSelectedIds(s); }}
                    onUpsert={() => { setUpsertItem(item); setShowUpsertModal(true); }}
                    onDelete={() => handleDelete(item.id)}
                    openTrajectory={(id: string) => setTrajectoryStudentId(id)}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── PAGINATION ─────────────────────────────────────────── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-10 border-t border-black/5 dark:border-white/5">
          <div className="flex flex-col"><p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Committee Summary</p><p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Page {currentPage + 1} of {totalPages} | Total {count} Members</p></div>
          <div className="flex items-center gap-3">
            <button disabled={currentPage === 0} onClick={() => onFilterChange({ page: Math.max(0, currentPage - 1) })} className="w-14 h-12 flex items-center justify-center rounded-xl bg-white dark:bg-[#080808] border border-black/5 dark:border-white/5 text-zinc-400 disabled:opacity-20 hover:border-uiupc-orange hover:text-uiupc-orange shadow-sm transition-all"><FaChevronLeft className="text-xs" /></button>
            <button disabled={currentPage >= totalPages - 1} onClick={() => onFilterChange({ page: currentPage + 1 })} className="w-14 h-12 flex items-center justify-center rounded-xl bg-white dark:bg-[#080808] border border-black/5 dark:border-white/5 text-zinc-400 disabled:opacity-20 hover:border-uiupc-orange hover:text-uiupc-orange shadow-sm transition-all"><FaChevronRight className="text-xs" /></button>
          </div>
        </div>
      )}

      <Admin_CommitteeModal isOpen={showUpsertModal} onClose={() => setShowUpsertModal(false)} item={upsertItem} onSave={handleUpsert} />
      <Admin_MemberTrajectory isOpen={!!trajectoryStudentId} onClose={() => setTrajectoryStudentId(null)} studentId={trajectoryStudentId} />
      <Admin_CommitteeFolderSyncModal isOpen={showFolderSyncModal} onClose={() => setShowFolderSyncModal(false)} currentYear={filterYear} onSuccess={() => onFilterChange({})} />
    </div>
  );
};
