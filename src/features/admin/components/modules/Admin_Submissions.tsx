"use client";

import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  IconSearch, IconFileExport, IconEye, IconClose, IconChevronLeft, 
  IconChevronRight, IconEnvelope, IconImages, 
  IconSync, IconCheck, IconTrash, IconExternalLink,
  IconCheckCircle, IconExclamationCircle
} from '@/components/shared/Icons';
import { 
  Admin_Dropdown, Admin_ModuleHeader, Admin_StatCard, 
  Admin_ErrorBoundary, Admin_DeleteConfirmModal 
} from "@/features/admin/components";
import { supabase } from "@/lib/supabase";
import { exportToCSV, generateBccMailto } from "@/utils/adminHelpers";
import { initAdminPassword, executeAdminMutation } from "@/features/admin/actions";
import { ExhibitionSubmission } from "@/types/admin";
import { getImageUrl } from '@/utils/imageUrl';

interface Admin_SubmissionsProps {
  data: ExhibitionSubmission[];
  count: number;
  currentPage: number;
  searchTerm: string;
  filterCategory: string;
  onFilterChange: (filters: { page?: number; search?: string; category?: string; status?: string; payment?: string }) => void;
  onOpenDetails: (item: ExhibitionSubmission) => void;
  onOpenEmail?: (item: ExhibitionSubmission) => void;
}

export const Admin_Submissions: React.FC<Admin_SubmissionsProps> = ({ 
  data, count, currentPage, searchTerm, filterCategory, onFilterChange 
}) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isSelectAllMode, setIsSelectAllMode] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ExhibitionSubmission | null>(null);
  const [detailedItem, setDetailedItem] = useState<ExhibitionSubmission | null>(null);

  // ─── ACTIONS ─────────────────────────────────────────────────────────────
  const handleToggleSelection = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelectedIds(newSelected);
    setIsSelectAllMode(false);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = new Set(data.map(item => item.id));
      setSelectedIds(allIds);
      setIsSelectAllMode(true);
    } else {
      setSelectedIds(new Set());
      setIsSelectAllMode(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: 'selected' | 'rejected') => {
    const { success } = await executeAdminMutation("exhibition_submissions", "update", { status }, id);
    if (success) onFilterChange({}); // Trigger refresh
  };

  const handleUpdatePayment = async (id: string, payment_status: 'paid' | 'unpaid') => {
    const { success } = await executeAdminMutation("exhibition_submissions", "update", { payment_status }, id);
    if (success) onFilterChange({}); // Trigger refresh
  };

  const handleBulkEmail = () => {
    const emails = data
      .filter(item => isSelectAllMode || selectedIds.has(item.id))
      .map(item => item.email)
      .filter(Boolean) as string[];
    
    if (emails.length === 0) return alert("No emails selected");
    window.location.href = generateBccMailto(emails, "Exhibition Update | UIUPC");
  };

  const totalPages = Math.ceil(count / 12);

  return (
    <div className="space-y-8">
      {/* ── HEADER ────────────────────────────────────────────── */}
      <Admin_ModuleHeader 
        title="Exhibition Engine" 
        subtitle="Review and curate photo submissions for the club's upcoming showcase."
      >
        <div className="flex gap-4">
          <Admin_StatCard label="Total Submissions" value={count} icon={<IconImages size={20} />} />
        </div>
      </Admin_ModuleHeader>

      {/* ── TOOLBAR ────────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
        <div className="relative flex-1 group w-full">
          <IconSearch size={14} className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-300 dark:text-zinc-600 transition-colors group-focus-within:text-uiupc-orange" />
          <input 
            type="text"
            placeholder="Search participants or photo titles..."
            defaultValue={searchTerm}
            onChange={(e) => onFilterChange({ search: e.target.value, page: 0 })}
            className="w-full pl-14 pr-6 py-4 bg-white dark:bg-zinc-950 border border-black/5 dark:border-white/5 rounded-2xl text-sm font-bold tracking-tight outline-none focus:border-uiupc-orange/20 dark:text-white shadow-sm"
          />
        </div>
        
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <Admin_Dropdown 
            label="Category"
            value={filterCategory}
            onChange={(val) => onFilterChange({ category: val, page: 0 })}
            options={[
              { value: 'all', label: 'All Categories' },
              { value: 'Single', label: 'Single' },
              { value: 'Story', label: 'Story' },
              { value: 'Mobile', label: 'Mobile' }
            ]}
          />
          <button 
            onClick={() => exportToCSV("submissions", data)}
            className="px-8 h-12 flex items-center gap-3 bg-uiupc-orange text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-uiupc-orange/20 hover:brightness-110 transition-all"
          >
            <IconFileExport size={14} /> Export List
          </button>
        </div>
      </div>

      {/* ── DATA TABLE ─────────────────────────────────────────── */}
      <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-black/5 dark:border-white/5 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f9f5ea] dark:bg-black/40 text-[10px] font-black uppercase tracking-widest text-zinc-400">
                <th className="px-8 py-5 w-20">
                  <input 
                    type="checkbox" 
                    checked={isSelectAllMode || (selectedIds.size > 0 && selectedIds.size >= data.length)}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="w-5 h-5 rounded-lg border-zinc-300 text-uiupc-orange transition-all cursor-pointer"
                  />
                </th>
                <th className="px-8 py-5">Photo</th>
                <th className="px-8 py-5">Participant</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5">Payment</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5">
              {data.map((item) => (
                <tr key={item.id} className="group hover:bg-[#f9f5ea]/30 dark:hover:bg-white/[0.02] transition-colors">
                  <td className="px-8 py-6">
                    <input 
                      type="checkbox" 
                      checked={selectedIds.has(item.id)}
                      onChange={() => handleToggleSelection(item.id)}
                      className="w-5 h-5 rounded-lg border-zinc-300 text-uiupc-orange transition-all cursor-pointer"
                    />
                  </td>
                  <td className="px-8 py-6">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 cursor-pointer" onClick={() => setDetailedItem(item)}>
                      <img src={getImageUrl(item.photo_url, 100, 100)} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" alt="" />
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <h4 className="text-sm font-black uppercase tracking-tight text-zinc-900 dark:text-white truncate max-w-[200px]">{item.participant_name}</h4>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest truncate max-w-[200px]">{item.institute}</p>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                      item.status === 'selected' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                      item.status === 'rejected' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                      'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 border-transparent'
                    }`}>
                      {item.status || 'pending'}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <button 
                      onClick={() => handleUpdatePayment(item.id, item.payment_status === 'paid' ? 'unpaid' : 'paid')}
                      className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${
                        item.payment_status === 'paid' 
                        ? 'bg-uiupc-orange text-white shadow-lg' 
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'
                      }`}
                    >
                      {item.payment_status || 'unpaid'}
                    </button>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => setDetailedItem(item)} className="p-2 text-zinc-300 hover:text-uiupc-orange transition-colors"><IconEye size={18} /></button>
                      <button onClick={() => setDeleteTarget(item)} className="p-2 text-zinc-300 hover:text-zinc-600 transition-colors"><IconTrash size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {data.length === 0 && (
                <tr><td colSpan={6} className="py-20 text-center text-[10px] font-black uppercase tracking-widest text-zinc-300">No submissions found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── PAGINATION ────────────────────────────────────────── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-8 border-t border-black/5 dark:border-white/5">
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Page {currentPage + 1} of {totalPages}</p>
          <div className="flex items-center gap-3">
            <button disabled={currentPage === 0} onClick={() => onFilterChange({ page: currentPage - 1 })} className="w-12 h-12 flex items-center justify-center rounded-xl bg-white dark:bg-zinc-900 border border-black/5 text-zinc-400 disabled:opacity-20"><IconChevronLeft size={12} /></button>
            <button disabled={currentPage >= totalPages - 1} onClick={() => onFilterChange({ page: currentPage + 1 })} className="w-12 h-12 flex items-center justify-center rounded-xl bg-white dark:bg-zinc-900 border border-black/5 text-zinc-400 disabled:opacity-20"><IconChevronRight size={12} /></button>
          </div>
        </div>
      )}

      {/* ── BULK ACTIONS ───────────────────────────────────────── */}
      <AnimatePresence>
        {(selectedIds.size > 0 || isSelectAllMode) && (
          <motion.div 
            initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }}
            className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[100] px-10 py-5 bg-zinc-900 dark:bg-white rounded-[2.5rem] shadow-2xl flex items-center gap-8 border border-white/10"
          >
            <div className="flex flex-col">
              <span className="text-[11px] font-black uppercase tracking-widest text-white dark:text-black">{selectedIds.size} Selected</span>
              <span className="text-[8px] font-bold text-zinc-500 uppercase">Submissions</span>
            </div>
            <button onClick={handleBulkEmail} className="px-8 py-3 bg-uiupc-orange text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:scale-105 transition-all">
              <IconEnvelope size={14} className="inline mr-2" /> Bulk Email
            </button>
            <button onClick={() => { setSelectedIds(new Set()); setIsSelectAllMode(false); }} className="p-2 text-zinc-500 hover:text-white dark:hover:text-black transition-colors"><IconClose size={18} /></button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── DETAILS MODAL ────────────────────────────────────────── */}
      <AnimatePresence>
        {detailedItem && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setDetailedItem(null)} />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-5xl bg-white dark:bg-zinc-950 rounded-[3rem] overflow-hidden shadow-2xl border border-white/10 flex flex-col md:flex-row max-h-[90vh]"
            >
              <div className="w-full md:w-3/5 bg-zinc-100 dark:bg-zinc-900 p-8 flex items-center justify-center relative group">
                <img src={getImageUrl(detailedItem.photo_url, 1200, 1200)} className="w-full h-auto max-h-full object-contain rounded-2xl shadow-2xl transition-transform duration-700 group-hover:scale-[1.02]" alt="" />
              </div>
              <div className="flex-1 p-10 space-y-8 overflow-y-auto custom-scrollbar">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-black uppercase tracking-tight text-zinc-900 dark:text-white leading-none">{detailedItem.photo_title}</h3>
                  <button onClick={() => setDetailedItem(null)} className="text-zinc-400 hover:text-uiupc-orange transition-colors"><IconClose size={24} /></button>
                </div>

                <div className="grid grid-cols-2 gap-8 border-b border-black/5 dark:border-white/5 pb-8">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Participant</label>
                    <p className="text-sm font-bold dark:text-white uppercase">{detailedItem.participant_name}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Category</label>
                    <p className="text-sm font-bold dark:text-white uppercase tracking-tighter">{detailedItem.category}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-uiupc-orange">Exhibition Status</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => handleUpdateStatus(detailedItem.id, 'selected')}
                      className={`py-4 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${detailedItem.status === 'selected' ? 'bg-green-500 text-white' : 'bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white'}`}
                    >
                      Select
                    </button>
                    <button 
                      onClick={() => handleUpdateStatus(detailedItem.id, 'rejected')}
                      className={`py-4 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${detailedItem.status === 'rejected' ? 'bg-red-500 text-white' : 'bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white'}`}
                    >
                      Reject
                    </button>
                  </div>
                </div>

                <div className="p-6 bg-[#f9f5ea] dark:bg-white/[0.03] rounded-2xl border border-black/5 dark:border-white/5 space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-uiupc-orange">Payment Insight</h4>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Transaction ID</span>
                    <span className="text-xs font-mono font-bold dark:text-white">{detailedItem.transaction_id || 'NOT PROVIDED'}</span>
                  </div>
                  <button 
                    onClick={() => handleUpdatePayment(detailedItem.id, detailedItem.payment_status === 'paid' ? 'unpaid' : 'paid')}
                    className={`w-full py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${detailedItem.payment_status === 'paid' ? 'bg-uiupc-orange text-white' : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400'}`}
                  >
                    Mark as {detailedItem.payment_status === 'paid' ? 'Unpaid' : 'Paid'}
                  </button>
                </div>

                <div className="pt-4">
                  <a 
                    href={`https://drive.google.com/file/d/${detailedItem.photo_url}/view`} 
                    target="_blank" rel="noopener noreferrer"
                    className="w-full py-4 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-[10px] font-black uppercase tracking-widest rounded-xl text-center hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                  >
                    <IconExternalLink size={14} /> Open High-Res Drive Source
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── DELETE CONFIRM ────────────────────────────────────────── */}
      <Admin_ErrorBoundary>
        <Admin_DeleteConfirmModal 
          isOpen={!!deleteTarget} 
          onClose={() => setDeleteTarget(null)} 
          itemId={deleteTarget?.id} 
          itemName={deleteTarget?.participant_name} 
          onSuccess={() => { setDeleteTarget(null); onFilterChange({}); }}
          onConfirm={async () => {
            return await executeAdminMutation("exhibition_submissions", "delete", null, deleteTarget?.id);
          }}
        />
      </Admin_ErrorBoundary>
    </div>
  );
};
