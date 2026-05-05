"use client";

import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { 
  IconSearch, IconFileExport, IconEye, IconCheck, IconClose, 
  IconChevronLeft, IconChevronRight, IconEnvelope, IconUserGraduate, 
  IconIdBadge, IconSpinner, IconCrown, IconHistory, IconUsers, 
  IconLayerGroup, IconFilter, IconTrash, IconCalendar, IconFolderOpen
} from '@/components/shared/Icons';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Admin_Dropdown, Admin_ModuleHeader, Admin_StatCard, 
  Admin_MembersFilterMenu, Admin_ErrorBoundary, Admin_DeleteConfirmModal,
  Admin_DrivePicker, Admin_MembersFolderSyncModal
} from "@/features/admin/components";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { supabase } from "@/lib/supabase";
import { exportToCSV, generateBccMailto } from "@/utils/adminHelpers";
import { Member } from "@/types/admin";
import { initAdminPassword, executeAdminMutation } from "@/features/admin/actions";
import { useRouter } from 'next/navigation';

interface MemberRowProps {
  item: Member;
  isSelected: boolean;
  toggleSelection: (id: string) => void;
  onViewDetails: (item: Member) => void;
  onEmailReply: (item: Member) => void;
  onUpdateStatus: (id: string, status: string) => void;
  onDelete: (item: Member) => void;
  onViewTrajectory?: (item: Member) => void;
  onPromote?: (item: Member) => void;
}

const MemberRow = React.memo(({ 
  item, isSelected, toggleSelection, onViewDetails, onEmailReply, 
  onUpdateStatus, onDelete, onViewTrajectory, onPromote 
}: MemberRowProps) => {
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
          <div className="w-9 h-9 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-[10px] font-black text-uiupc-orange overflow-hidden shrink-0">
            {(item.full_name || "?").charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[12px] font-black text-zinc-900 dark:text-white uppercase tracking-tight truncate">{item.full_name}</span>
            <span className="text-[9px] font-bold text-zinc-400 lowercase truncate">{item.email}</span>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 whitespace-nowrap hidden sm:table-cell">
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 text-[11px] font-black text-zinc-900 dark:text-white uppercase tracking-wider"><IconIdBadge size={10} className="text-uiupc-orange" /> {item.student_id}</div>
          <div className="flex items-center gap-1.5 text-[9px] font-bold text-zinc-400 uppercase tracking-widest"><IconUserGraduate size={9} className="text-zinc-300" /> {item.department}</div>
        </div>
      </td>
      <td className="px-3 py-3 whitespace-nowrap hidden md:table-cell">
        <span className="text-[10px] font-bold text-zinc-400 uppercase">{item.session}</span>
      </td>
      <td className="px-3 py-3 whitespace-nowrap">
        <span className={`px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-widest border ${
          item.status === 'approved' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
          item.status === 'rejected' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 
          'bg-amber-500/10 text-amber-500 border-amber-500/20'
        }`}>
          {item.status || "Pending"}
        </span>
      </td>
      <td className="px-4 py-3 text-right whitespace-nowrap">
        <div className="flex items-center justify-end gap-1.5 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
          {item.status === 'pending' && (
            <>
              <button onClick={() => onUpdateStatus(item.id, 'approved')} title="Approve" className="w-8 h-8 flex items-center justify-center rounded-lg bg-green-500 text-white shadow hover:brightness-110 transition-all"><IconCheck size={10} /></button>
              <button onClick={() => onUpdateStatus(item.id, 'rejected')} title="Reject" className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-500 text-white shadow hover:brightness-110 transition-all"><IconClose size={10} /></button>
            </>
          )}
          <button onClick={() => onViewDetails(item)} title="Details" className="w-8 h-8 flex items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:bg-uiupc-orange hover:text-white transition-all"><IconEye size={10} /></button>
          <button onClick={() => onEmailReply(item)} title="Email" className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white transition-all"><IconEnvelope size={10} /></button>
          {onViewTrajectory && (
            <button onClick={() => onViewTrajectory(item)} title="History" className="w-8 h-8 flex items-center justify-center rounded-lg bg-purple-500/10 text-purple-500 hover:bg-purple-500 hover:text-white transition-all"><IconHistory size={10} /></button>
          )}
          {onPromote && (
            <button onClick={() => onPromote(item)} title="Add to Committee" className="w-8 h-8 flex items-center justify-center rounded-lg bg-uiupc-orange/10 text-uiupc-orange hover:bg-uiupc-orange hover:text-white transition-all"><IconCrown size={10} /></button>
          )}
          <button onClick={() => onDelete(item)} title="Delete" className="w-8 h-8 flex items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-400 hover:bg-red-500 hover:text-white transition-all"><IconTrash size={10} /></button>
        </div>
      </td>
    </motion.tr>
  );
});
MemberRow.displayName = 'MemberRow';

interface Admin_MembersProps {
  data: Member[];
  count: number;
  currentPage: number;
  searchTerm: string;
  filterDept: string;
  filterStatus: string;
  filterYear: string;
  sortOrder: "asc" | "desc";
  departments: string[];
  availableYears: string[];
  onFilterChange: (filters: { page?: number; search?: string; dept?: string; status?: string; year?: string; sort?: "asc" | "desc" }) => void;
  onViewDetails: (item: Member) => void;
  onEmailReply: (item: Member) => void;
  onPromoteToCommittee?: (item: Member) => void;
  onViewTrajectory?: (item: Member) => void;
}

export const Admin_Members: React.FC<Admin_MembersProps> = ({
  data, count, currentPage, searchTerm, filterDept, filterStatus, filterYear, sortOrder, departments, availableYears,
  onFilterChange, onViewDetails, onEmailReply, onPromoteToCommittee, onViewTrajectory
}) => {
  const { adminProfile } = useSupabaseAuth();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isSelectAllMode, setIsSelectAllMode] = useState(false);
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set());
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Member | null>(null);

  const [isDrivePickerOpen, setIsDrivePickerOpen] = useState(false);
  const [isFolderSyncOpen, setIsFolderSyncOpen] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<{ id: string, name: string } | null>(null);

  const pageSize = 12;
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { initAdminPassword(); }, []);

  const handleSearchInput = useCallback((value: string) => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      onFilterChange({ search: value, page: 0 });
    }, 400);
  }, [onFilterChange]);

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const { success, message } = await executeAdminMutation("members", "update", { status }, id);
      if (!success) throw new Error(message);
      onFilterChange({});
    } catch (err: any) {
      alert("Action failed: " + err.message);
    }
  };

  const handleBulkUpdate = async (status: string) => {
    setIsBulkUpdating(true);
    try {
      const idsToUpdate = isSelectAllMode ? [] : Array.from(selectedIds);
      // Note: Full bulk update would need a server action that accepts filters
      // For simplicity here, we use the selected IDs
      await Promise.all(idsToUpdate.map(id => 
        executeAdminMutation("members", "update", { status }, id)
      ));
      setSelectedIds(new Set());
      setIsSelectAllMode(false);
    } catch (error: any) {
      alert("Bulk update failed: " + error.message);
    } finally {
      setIsBulkUpdating(false);
    }
  };

  const handleBulkEmail = () => {
    const emails = data
      .filter(item => selectedIds.has(item.id) || isSelectAllMode)
      .map(m => m.email)
      .filter(Boolean);
    
    if (emails.length === 0) {
      alert("No emails found for selected members.");
      return;
    }
    generateBccMailto(emails, adminProfile?.email);
  };

  const refreshData = useCallback(() => {
    setSelectedIds(new Set());
    setIsSelectAllMode(false);
    setHiddenIds(new Set());
    onFilterChange({});
  }, [onFilterChange]);

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

  const visibleData = useMemo(() => {
    return data.filter(item => !hiddenIds.has(item.id));
  }, [data, hiddenIds]);

  const totalPages = Math.ceil((count || 0) / pageSize);
  const deptCount = departments.length;

  return (
    <div className="w-full space-y-6 min-w-0 relative z-10 isolate">
      <Admin_ModuleHeader 
        title="Members"
        description="Review and manage member applications."
      >
        <Admin_StatCard label="Total Records" value={count} icon={<IconUsers size={20} />} />
        
        {/* Quick Filters Card */}
        <div className="p-6 bg-white dark:bg-[#0d0d0d] border border-zinc-200 dark:border-zinc-800 rounded-2xl flex flex-col justify-between shadow-sm min-h-[140px] group relative z-30">
          <p className="text-zinc-400 text-[10px] font-black uppercase tracking-widest">Quick Filters</p>
          <div className="flex items-end justify-between mt-auto">
            <div className="text-uiupc-orange text-4xl opacity-20 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500">
              <IconFilter size={40} />
            </div>
            <div className="flex-1 ml-6 max-w-[200px]">
              <Admin_MembersFilterMenu 
                currentDept={filterDept}
                currentStatus={filterStatus}
                currentSort={sortOrder}
                departments={departments}
                onDeptChange={(val) => onFilterChange({ dept: val, page: 0 })}
                onStatusChange={(val) => onFilterChange({ status: val, page: 0 })}
                onSortChange={(val) => onFilterChange({ sort: val, page: 0 })}
              />
            </div>
          </div>
        </div>

        {/* Session Year Card */}
        <div className="p-6 bg-white dark:bg-[#0d0d0d] border border-zinc-200 dark:border-zinc-800 rounded-2xl flex flex-col justify-between shadow-sm min-h-[140px] group relative z-20">
          <p className="text-zinc-400 text-[10px] font-black uppercase tracking-widest">Session Year</p>
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
                options={[{ value: 'all', label: 'All Sessions' }, ...availableYears.map(s => ({ value: s, label: s }))]}
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
            <IconSearch size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-uiupc-orange transition-colors" />
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
              onClick={() => exportToCSV("membership", data)} 
              className="px-8 h-12 flex items-center gap-3 bg-uiupc-orange text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-uiupc-orange/20 hover:brightness-110 transition-all"
            >
              <IconFileExport size={14} /> Download List
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
                <span className="text-[7px] sm:text-[8px] font-bold text-zinc-500 uppercase">Members</span>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <button onClick={handleBulkEmail} className="flex items-center gap-2 px-4 py-3 bg-uiupc-orange text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:brightness-110 transition-all"><IconEnvelope size={12} /><span>Email</span></button>
              <button disabled={isBulkUpdating} onClick={() => handleBulkUpdate('approved')} className="flex items-center gap-2 px-4 py-3 bg-green-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:brightness-110 transition-all disabled:opacity-50">{isBulkUpdating ? <IconSpinner size={12} className="animate-spin" /> : <IconCheck size={12} />}<span>Approve</span></button>
              <button disabled={isBulkUpdating} onClick={() => handleBulkUpdate('rejected')} className="flex items-center gap-2 px-4 py-3 bg-red-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:brightness-110 transition-all disabled:opacity-50">{isBulkUpdating ? <IconSpinner size={12} className="animate-spin" /> : <IconClose size={12} />}<span>Reject</span></button>
              <button onClick={() => { setSelectedIds(new Set()); setIsSelectAllMode(false); }} className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-zinc-500 hover:text-white dark:hover:text-black transition-colors"><IconClose size={14} /></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── DATA TABLE ─────────────────────────────────────────── */}
      <div className="bg-white dark:bg-[#0d0d0d] rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm relative z-10">
        <div className="overflow-x-auto min-h-[400px]">
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
                <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 whitespace-nowrap">Basic Info</th>
                <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 whitespace-nowrap hidden sm:table-cell">Student Info</th>
                <th className="px-3 py-3 text-left text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 whitespace-nowrap hidden md:table-cell">Batch</th>
                <th className="px-3 py-3 text-left text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 whitespace-nowrap">Status</th>
                <th className="px-4 py-3 text-right text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5">
              {visibleData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 rounded-[2rem] bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center text-zinc-300 dark:text-zinc-600"><IconSearch size={20} /></div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">No records found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                visibleData.map((item) => (
                  <MemberRow 
                    key={item.id} 
                    item={item} 
                    isSelected={selectedIds.has(item.id) || isSelectAllMode}
                    toggleSelection={handleToggleSelection}
                    onViewDetails={onViewDetails}
                    onEmailReply={onEmailReply}
                    onUpdateStatus={handleUpdateStatus}
                    onDelete={setDeleteTarget}
                    onViewTrajectory={onViewTrajectory}
                    onPromote={onPromoteToCommittee}
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
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Member Summary</p>
            <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Page {currentPage + 1} of {totalPages} <span className="hidden sm:inline">| Total {count} Records</span></p>
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
          onConfirm={async (password: string) => {
            return await executeAdminMutation("members", "delete", null, deleteTarget?.id, password);
          }}
          title="Delete Member"
          description={`Are you sure you want to delete ${deleteTarget?.full_name}?`}
        />

        <Admin_DrivePicker
          isOpen={isDrivePickerOpen}
          onClose={() => setIsDrivePickerOpen(false)}
          onSelect={(id, url, name) => {
            if (url === 'FOLDER') {
              setSelectedFolder({ id, name });
              setIsDrivePickerOpen(false);
              setIsFolderSyncOpen(true);
            } else {
              alert("Please select a folder, not a file.");
            }
          }}
          allowFolderSelection={true}
          title="Select Session Folder"
        />

        {selectedFolder && (
          <Admin_MembersFolderSyncModal
            isOpen={isFolderSyncOpen}
            onClose={() => {
              setIsFolderSyncOpen(false);
              setSelectedFolder(null);
            }}
            currentYear={filterYear}
            folderInfo={selectedFolder}
            onSuccess={() => onFilterChange({})}
          />
        )}
      </Admin_ErrorBoundary>
    </div>
  );
};
