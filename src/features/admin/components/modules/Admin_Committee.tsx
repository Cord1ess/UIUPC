"use client";

import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { 
  IconSearch, IconPlus, IconUserTie, IconChevronLeft, IconChevronRight, 
  IconEdit, IconTrash, IconCalendar, IconFileExport, IconClose, 
  IconSpinner, IconFolderOpen, IconUsers, IconFilter, IconEye
} from '@/components/shared/Icons';
import { motion, AnimatePresence } from 'motion/react';
import { Admin_Dropdown, Admin_ModuleHeader, Admin_StatCard, Admin_FilterMenu, Admin_DrivePicker, Admin_ErrorBoundary } from "@/features/admin/components";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { supabase } from "@/lib/supabase";
import { Admin_CommitteeModal } from "./Admin_CommitteeModal";
import { Admin_MemberTrajectory } from "./Admin_MemberTrajectory";
import { Admin_CommitteePreviewModal } from "./Admin_CommitteePreviewModal";
import { Admin_DeleteConfirmModal } from "./Admin_DeleteConfirmModal";
// import { Admin_CommitteeManagerModal } from "./Admin_CommitteeManagerModal";
import { getImageUrl } from "@/utils/imageUrl";
import { exportToCSV } from "@/utils/adminHelpers";
import { Admin_CommitteeFolderSyncModal } from "./Admin_CommitteeFolderSyncModal";
import { upsertCommitteeMember, initAdminPassword } from "@/features/admin/actions";
import { CommitteeMember } from "@/types/admin";

interface CommitteeRowProps {
  item: CommitteeMember;
  isSelected: boolean;
  toggleSelection: (id: string) => void;
  onUpsert: (item: CommitteeMember) => void;
  onDelete: (item: CommitteeMember) => void;
  onPreview: (item: CommitteeMember) => void;
}

const CommitteeRow = React.memo(({ item, isSelected, toggleSelection, onUpsert, onDelete, onPreview }: CommitteeRowProps) => {
  return (
    <motion.tr 
      className={`group hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all ${isSelected ? 'bg-uiupc-orange/10' : ''} border-b border-zinc-100 dark:border-zinc-800/50`}
    >
      <td className="px-4 py-3 whitespace-nowrap w-10">
        <input 
          type="checkbox" 
          className="w-4 h-4 rounded border-zinc-300 text-uiupc-orange transition-all cursor-pointer" 
          checked={isSelected} 
          onChange={() => toggleSelection(item.id)} 
        />
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-xs font-black text-uiupc-orange overflow-hidden shrink-0">
            {(item.image_url || item.image) && item.image_url !== 'PLACEHOLDER' ? (
              <img src={getImageUrl((item.image_url || item.image)!, 80, 50)} alt="" loading="lazy" decoding="async" className="w-full h-full object-cover" />
            ) : (
              <span className="text-[10px]">{(item.member_name || "?").split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()}</span>
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[12px] font-black text-zinc-900 dark:text-white uppercase tracking-tight truncate">{item.member_name}</span>
            {item.email && <span className="text-[9px] font-bold text-zinc-400 lowercase truncate">{item.email}</span>}
          </div>
        </div>
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        <div className="flex flex-col">
          <span className="text-[11px] font-black text-zinc-900 dark:text-white uppercase tracking-wider">{item.designation}</span>
          {item.club_department && <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">{item.club_department}</span>}
        </div>
      </td>
      <td className="px-3 py-3 whitespace-nowrap hidden lg:table-cell">
        <span className="text-[10px] font-black text-zinc-500 dark:text-zinc-400 uppercase">{item.blood_group || "—"}</span>
      </td>
      <td className="px-3 py-3 whitespace-nowrap hidden sm:table-cell">
        <span className="text-[10px] font-bold text-zinc-600 dark:text-zinc-300">{item.phone || "—"}</span>
      </td>
      <td className="px-3 py-3 whitespace-nowrap hidden md:table-cell">
        <span className="text-[10px] font-bold text-zinc-400">{item.year || "—"}</span>
      </td>
      <td className="px-4 py-3 text-right whitespace-nowrap">
        <div className="flex items-center justify-end gap-1.5 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
          <button onClick={() => onPreview(item)} title="Preview" className="w-8 h-8 flex items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:bg-blue-500 hover:text-white transition-all"><IconEye size={10} /></button>
          <button onClick={() => onUpsert(item)} title="Edit" className="w-8 h-8 flex items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:bg-uiupc-orange hover:text-white transition-all"><IconEdit size={10} /></button>
          <button onClick={() => onDelete(item)} title="Delete" className="w-8 h-8 flex items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-400 hover:bg-red-500 hover:text-white transition-all"><IconTrash size={10} /></button>
        </div>
      </td>
    </motion.tr>
  );
});
CommitteeRow.displayName = 'CommitteeRow';


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
  allDepartments: string[];
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
  allDepartments,
  onFilterChange
}) => {
  const { adminProfile } = useSupabaseAuth();
  const [showUpsertModal, setShowUpsertModal] = useState(false);
  const [upsertItem, setUpsertItem] = useState<CommitteeMember | null>(null);
  const [trajectoryStudentId, setTrajectoryStudentId] = useState<string | null>(null);
  const [showFolderSyncModal, setShowFolderSyncModal] = useState(false);
  const [isDrivePickerOpen, setIsDrivePickerOpen] = useState(false);
  const [selectedSyncFolder, setSelectedSyncFolder] = useState<{id: string, name: string} | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isSelectAllMode, setIsSelectAllMode] = useState(false);
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set());
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewItem, setPreviewItem] = useState<CommitteeMember | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CommitteeMember | null>(null);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [bulkDeleteIds, setBulkDeleteIds] = useState<string[]>([]);
  
  const pageSize = 12;
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Seed admin password on first mount
  useEffect(() => { initAdminPassword(); }, []);

  const handleSearchInput = useCallback((value: string) => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      onFilterChange({ search: value, page: 0 });
    }, 400);
  }, [onFilterChange]);

  // Optimized Select-All: toggle a flag instead of fetching all IDs immediately
  const handleSelectAll = useCallback((checked: boolean) => {
    setIsSelectAllMode(checked);
    setSelectedIds(new Set()); // Reset individual selections when toggling bulk mode
  }, []);

  // Filter out hidden items (optimistic UI)
  const visibleData = useMemo(() => {
    return data.filter(item => !hiddenIds.has(item.id));
  }, [data, hiddenIds]);

  // Memoized row callbacks to prevent re-renders
  const handleToggleSelection = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const handleOpenUpsert = useCallback((item: CommitteeMember) => {
    setUpsertItem(item); setShowUpsertModal(true);
  }, []);

  const handleOpenDelete = useCallback((item: CommitteeMember) => {
    setDeleteTarget(item);
  }, []);

  const handleOpenPreview = useCallback((item: CommitteeMember) => {
    setPreviewItem(item); setShowPreviewModal(true);
  }, []);

  const refreshData = useCallback(() => {
    setSelectedIds(new Set());
    setIsSelectAllMode(false);
    setHiddenIds(new Set());
    onFilterChange({});
  }, [onFilterChange]);

  const handleUpsert = async (id: string | null, recordData: any) => {
    const result = await upsertCommitteeMember({ ...recordData, id: id || undefined });
    return result;
  };

  const totalPages = Math.ceil((count || 0) / pageSize);

  return (
    <div className="w-full space-y-6 min-w-0">
      <Admin_ModuleHeader 
        title="Committee"
        description="Manage all committee members and sessions."
      >
        <Admin_StatCard label="Total Members" value={count} icon={<IconUsers />} />
        
        {/* Quick Filters Card */}
        <div className="p-6 bg-white dark:bg-[#0d0d0d] border border-zinc-200 dark:border-zinc-800 rounded-2xl flex flex-col justify-between shadow-sm min-h-[140px] group relative z-10">
          <p className="text-zinc-400 text-[10px] font-black uppercase tracking-widest">Quick Filters</p>
          <div className="flex items-end justify-between mt-auto">
            <div className="text-uiupc-orange text-4xl opacity-20 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500">
              <IconFilter size={40} />
            </div>
            <div className="flex-1 ml-6 max-w-[200px]">
              <Admin_FilterMenu 
                currentDept={filterDept}
                currentCategory={filterCategory}
                currentSort={sortOrder}
                currentLink={filterLink}
                departments={allDepartments}
                onDeptChange={(val) => onFilterChange({ dept: val, page: 0 })}
                onCategoryChange={(val) => onFilterChange({ category: val, page: 0 })}
                onSortChange={(val) => onFilterChange({ sort: val, page: 0 })}
                onLinkChange={(val) => onFilterChange({ link: val, page: 0 })}
              />
            </div>
          </div>
        </div>

        {/* Committee Year Card */}
        <div className="p-6 bg-white dark:bg-[#0d0d0d] border border-zinc-200 dark:border-zinc-800 rounded-2xl flex flex-col justify-between shadow-sm min-h-[140px] group relative z-10">
          <p className="text-zinc-400 text-[10px] font-black uppercase tracking-widest">Committee Year</p>
          <div className="flex items-end justify-between mt-auto">
            <div className="text-blue-500 text-4xl opacity-20 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500">
              <IconCalendar size={40} />
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

        {/* Drive Sync Card */}
        <div className="p-6 bg-white dark:bg-[#0d0d0d] border border-zinc-200 dark:border-zinc-800 rounded-2xl flex flex-col justify-between shadow-sm min-h-[140px] group relative z-10">
          <p className="text-zinc-400 text-[10px] font-black uppercase tracking-widest">Drive Sync</p>
          <div className="flex items-end justify-between mt-auto">
            <div className="text-purple-500 text-4xl opacity-20 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500">
              <IconFolderOpen size={40} />
            </div>
            <div className="flex-1 ml-6 max-w-[180px]">
              <button 
                onClick={() => setIsDrivePickerOpen(true)}
                className="w-full h-12 flex items-center justify-center gap-3 bg-purple-500/10 text-purple-500 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-purple-500 hover:text-white transition-all"
              >
                Sync Session Folder
              </button>
            </div>
          </div>
        </div>
      </Admin_ModuleHeader>

      {/* ── FILTER BAR ─────────────────────────────────────────── */}
      <div className="w-full bg-white dark:bg-[#0d0d0d] p-3 sm:p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm relative z-10">
        <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
          <div className="relative flex-1 group min-w-[200px]">
            <IconSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-uiupc-orange transition-colors" />
            <input 
              type="text" 
              placeholder="Search members..." 
              defaultValue={searchTerm} 
              onChange={(e) => handleSearchInput(e.target.value)}
              className="w-full py-4 pl-14 pr-8 bg-zinc-100 dark:bg-[#1a1a1a] border border-transparent focus:border-uiupc-orange/30 rounded-xl text-sm outline-none transition-all placeholder:text-zinc-400 font-medium" 
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button 
              onClick={() => exportToCSV("committee", data)} 
              className="px-6 h-12 flex items-center gap-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all"
            >
              <IconFileExport size={12} /> Export
            </button>

            <button 
              onClick={() => { setUpsertItem(null); setShowUpsertModal(true); }}
              className="px-8 h-12 flex items-center gap-3 bg-uiupc-orange text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-uiupc-orange/20 hover:brightness-110 transition-all"
            >
              <IconPlus size={12} /> Add New
            </button>
          </div>
        </div>
      </div>

      {/* ── BULK ACTIONS ───────────────────────────────────────── */}
      <AnimatePresence>
        {selectedIds.size > 0 && (
          <motion.div 
            initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }}
            className="fixed bottom-28 sm:bottom-12 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 sm:gap-6 px-4 sm:px-10 py-3 sm:py-4 bg-zinc-950 dark:bg-white rounded-2xl shadow-2xl border border-zinc-800 dark:border-zinc-200"
          >
            <div className="flex items-center gap-3 sm:gap-5 pr-4 sm:pr-8 border-r border-white/10 dark:border-black/10">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-uiupc-orange flex items-center justify-center text-white text-[10px] sm:text-[12px] font-black">{selectedIds.size}</div>
              <div className="flex flex-col">
                <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-white dark:text-black">Selected</span>
                <span className="text-[7px] sm:text-[8px] font-bold text-zinc-500 uppercase">Members</span>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <button onClick={() => setShowBulkDeleteModal(true)} className="flex items-center gap-2 sm:gap-3 px-4 sm:px-8 py-3 sm:py-4 bg-red-500 text-white rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all"><IconTrash size={16} /><span>Delete <span className="hidden sm:inline">Selected</span></span></button>
              <button onClick={() => setSelectedIds(new Set())} className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-zinc-500 hover:text-white dark:hover:text-black transition-colors"><IconClose /></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── MAIN TABLE ────────────────────────────────────────── */}
      <div className="bg-white dark:bg-[#0d0d0d] rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm relative z-10">
        <div className="overflow-x-auto min-h-[500px]">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-zinc-50 dark:bg-zinc-900/50">
                <th className="px-4 py-3 text-left w-10">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 rounded border-zinc-300 text-uiupc-orange transition-all cursor-pointer" 
                    checked={isSelectAllMode || (selectedIds.size > 0 && selectedIds.size >= count)} 
                    onChange={(e) => handleSelectAll(e.target.checked)} 
                  />
                </th>
                <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-[0.15em] text-zinc-400 whitespace-nowrap">Member Name</th>
                <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-[0.15em] text-zinc-400 whitespace-nowrap">Designation</th>
                <th className="px-3 py-3 text-left text-[10px] font-black uppercase tracking-[0.15em] text-zinc-400 whitespace-nowrap hidden lg:table-cell">Blood</th>
                <th className="px-3 py-3 text-left text-[10px] font-black uppercase tracking-[0.15em] text-zinc-400 whitespace-nowrap hidden sm:table-cell">Phone</th>
                <th className="px-3 py-3 text-left text-[10px] font-black uppercase tracking-[0.15em] text-zinc-400 whitespace-nowrap hidden md:table-cell">Year</th>
                <th className="px-4 py-3 text-right text-[10px] font-black uppercase tracking-[0.15em] text-zinc-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5">
              {visibleData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 rounded-[2rem] bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center text-zinc-300 dark:text-zinc-600"><IconSearch size={20} /></div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">No records found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                visibleData.map((item) => (
                  <CommitteeRow 
                    key={item.id} 
                    item={item} 
                    isSelected={selectedIds.has(item.id) || isSelectAllMode}
                    toggleSelection={handleToggleSelection}
                    onUpsert={handleOpenUpsert}
                    onDelete={handleOpenDelete}
                    onPreview={handleOpenPreview}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── PAGINATION ─────────────────────────────────────────── */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-10 border-t border-black/5 dark:border-white/5">
          <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Committee Summary</p>
            <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Page {currentPage + 1} of {totalPages} <span className="hidden sm:inline">| Total {count} Members</span></p>
          </div>
          <div className="flex items-center gap-3">
            <button disabled={currentPage === 0} onClick={() => onFilterChange({ page: Math.max(0, currentPage - 1) })} className="w-14 h-12 flex items-center justify-center rounded-xl bg-white dark:bg-[#080808] border border-black/5 dark:border-white/5 text-zinc-400 disabled:opacity-20 hover:border-uiupc-orange hover:text-uiupc-orange shadow-sm transition-all"><IconChevronLeft size={16} /></button>
            <button disabled={currentPage >= totalPages - 1} onClick={() => onFilterChange({ page: currentPage + 1 })} className="w-14 h-12 flex items-center justify-center rounded-xl bg-white dark:bg-[#080808] border border-black/5 dark:border-white/5 text-zinc-400 disabled:opacity-20 hover:border-uiupc-orange hover:text-uiupc-orange shadow-sm transition-all"><IconChevronRight size={16} /></button>
          </div>
        </div>
      )}

      {/* ── MODALS ─────────────────────────────────────────────── */}
      <Admin_ErrorBoundary>
        <Admin_CommitteeModal isOpen={showUpsertModal} onClose={() => setShowUpsertModal(false)} item={upsertItem} onSave={handleUpsert} />
      </Admin_ErrorBoundary>

      <Admin_ErrorBoundary>
        <Admin_CommitteePreviewModal isOpen={showPreviewModal} onClose={() => setShowPreviewModal(false)} item={previewItem} />
      </Admin_ErrorBoundary>

      <Admin_ErrorBoundary>
        <Admin_DeleteConfirmModal
          isOpen={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          itemId={deleteTarget?.id}
          itemName={deleteTarget?.member_name}
          onSuccess={() => {
            if (deleteTarget) setHiddenIds(prev => new Set(prev).add(deleteTarget.id));
            refreshData();
          }}
        />
      </Admin_ErrorBoundary>

      <Admin_ErrorBoundary>
        <Admin_DeleteConfirmModal
          isOpen={showBulkDeleteModal}
          onClose={() => { setShowBulkDeleteModal(false); setBulkDeleteIds([]); }}
          bulkIds={bulkDeleteIds.length > 0 ? bulkDeleteIds : Array.from(selectedIds)}
          onSuccess={() => {
            const idsToHide = bulkDeleteIds.length > 0 ? bulkDeleteIds : Array.from(selectedIds);
            setHiddenIds(prev => {
              const next = new Set(prev);
              idsToHide.forEach(id => next.add(id));
              return next;
            });
            refreshData();
          }}
        />
      </Admin_ErrorBoundary>

      <Admin_ErrorBoundary>
        <Admin_MemberTrajectory isOpen={!!trajectoryStudentId} onClose={() => setTrajectoryStudentId(null)} studentId={trajectoryStudentId} />
      </Admin_ErrorBoundary>
      
      <Admin_ErrorBoundary>
        <Admin_DrivePicker
          isOpen={isDrivePickerOpen}
          onClose={() => setIsDrivePickerOpen(false)}
          allowFolderSelection={true}
          title="Select Committee Folder"
          onSelect={(id, url, name) => {
            setSelectedSyncFolder({ id, name });
            setShowFolderSyncModal(true);
          }}
        />
      </Admin_ErrorBoundary>

      <Admin_ErrorBoundary>
        {showFolderSyncModal && selectedSyncFolder && (
          <Admin_CommitteeFolderSyncModal 
            isOpen={showFolderSyncModal} 
            onClose={() => {
              setShowFolderSyncModal(false);
              setSelectedSyncFolder(null);
            }} 
            currentYear={filterYear}
            folderInfo={selectedSyncFolder}
            onSuccess={refreshData}
          />
        )}
      </Admin_ErrorBoundary>
    </div>
  );
};
