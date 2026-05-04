"use client";

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  IconArchive, IconSearch, IconCamera, IconUser, IconEye, IconDownload, 
  IconChevronLeft, IconChevronRight, IconFileImage, IconCalendarAlt, 
  IconExternalLink, IconCheck, IconClose, IconInbox 
} from '@/components/shared/Icons';
import { 
  Admin_ErrorBoundary, Admin_ModuleHeader, Admin_StatCard, Admin_Dropdown 
} from "@/features/admin/components";
import { getImageUrl } from '@/utils/imageUrl';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { initAdminPassword } from "@/features/admin/actions";

interface ExhibitionSubmission {
  id: string;
  event_id: string;
  photo_title: string;
  photo_url: string;
  category: string;
  gear_used?: string;
  status: string;
  participant_name: string;
  institute?: string;
  created_at: string;
}

const ArchiveRow = React.memo(({ 
  item, onView 
}: { 
  item: ExhibitionSubmission; onView: (item: ExhibitionSubmission) => void 
}) => {
  return (
    <motion.tr className="group hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition-all border-b border-zinc-100 dark:border-zinc-800/50">
      <td className="px-8 py-6 whitespace-nowrap">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-zinc-100 dark:bg-[#1a1a1a] overflow-hidden shrink-0 border border-zinc-200 dark:border-zinc-800 group-hover:scale-105 transition-transform shadow-inner">
            {item.photo_url ? (
              <img src={getImageUrl(item.photo_url, 100, 60)} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-zinc-300"><IconFileImage size={24} /></div>
            )}
          </div>
          <div className="flex flex-col min-w-[200px]">
            <span className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-tight truncate">{item.photo_title}</span>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest truncate flex items-center gap-2 mt-0.5"><IconCamera size={10} className="text-zinc-300 dark:text-zinc-700" /> {item.gear_used || "Standard Gear"}</span>
          </div>
        </div>
      </td>
      <td className="px-6 py-6 whitespace-nowrap hidden sm:table-cell">
         <span className="text-[11px] font-black text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <IconUser size={10} className="text-uiupc-orange" /> {item.participant_name}
         </span>
      </td>
      <td className="px-6 py-6 whitespace-nowrap hidden md:table-cell">
         <span className="px-4 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800/50 text-zinc-500 dark:text-zinc-400 text-[9px] font-black uppercase tracking-widest border border-zinc-200 dark:border-zinc-800/50 w-fit">
           {item.category}
         </span>
      </td>
      <td className="px-6 py-6 whitespace-nowrap hidden lg:table-cell">
         <span className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${item.status === 'archived' ? 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20' : 'bg-green-500/10 text-green-500 border-green-500/20'}`}>
           {item.status}
         </span>
      </td>
      <td className="px-8 py-6 text-right whitespace-nowrap">
        <div className="flex items-center justify-end gap-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
          <button onClick={() => onView(item)} title="View Detail" className="w-10 h-10 flex items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:bg-uiupc-orange hover:text-white transition-all shadow-sm border border-zinc-200 dark:border-zinc-800/50"><IconEye size={12} /></button>
          <a href={item.photo_url} target="_blank" rel="noreferrer" title="Open Link" className="w-10 h-10 flex items-center justify-center rounded-xl bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white transition-all border border-blue-500/20"><IconExternalLink size={12} /></a>
        </div>
      </td>
    </motion.tr>
  );
});
ArchiveRow.displayName = 'ArchiveRow';

export const Admin_Archive: React.FC = () => {
  const { data: events } = useSupabaseData('events', { filters: { event_type: 'exhibition' } });
  const [selectedEventId, setSelectedEventId] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewingPhoto, setViewingPhoto] = useState<ExhibitionSubmission | null>(null);
  const [page, setPage] = useState(0);
  const pageSize = 12;

  useEffect(() => { initAdminPassword(); }, []);

  const filters = useMemo(() => {
    const f: Record<string, any> = {};
    if (selectedEventId !== 'all') f.event_id = selectedEventId;
    return f;
  }, [selectedEventId]);

  const { data: submissions, count, isLoading } = useSupabaseData('exhibition_submissions', {
    page,
    pageSize,
    filters,
    orderBy: 'created_at',
    orderDesc: true
  });

  const visibleSubmissions = useMemo(() => {
    const rawData = submissions || [];
    if (!searchTerm) return rawData;
    return rawData.filter(s => 
      (s.photo_title || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
      (s.participant_name || "").toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [submissions, searchTerm]);

  const totalPages = Math.ceil((count || 0) / pageSize);

  return (
    <div className="w-full space-y-8 min-w-0 relative z-10 isolate">
      <Admin_ModuleHeader 
        title="Archive Vault"
        description="Preserved visual assets from past exhibitions and events."
      >
        <Admin_StatCard label="Total Assets" value={count} icon={<IconArchive size={20} />} />
        <Admin_StatCard label="Vault Status" value="Secure" icon={<IconCheck size={20} />} color="text-green-500" />
      </Admin_ModuleHeader>

      {/* ── FILTER BAR ─────────────────────────────────────────── */}
      <div className="w-full bg-white dark:bg-[#0d0d0d] p-3 sm:p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm relative z-10">
        <div className="flex flex-col lg:flex-row gap-6 items-stretch lg:items-center justify-between">
          <div className="relative flex-1 group min-w-[200px]">
            <IconSearch size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-uiupc-orange transition-colors" />
            <input 
              type="text" 
              placeholder="Search by title or artist..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full py-4 pl-14 pr-8 bg-zinc-100 dark:bg-[#1a1a1a] border border-transparent focus:border-uiupc-orange/30 rounded-xl text-sm font-bold outline-none transition-all placeholder:text-zinc-400 dark:text-white" 
            />
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex flex-col gap-1.5 min-w-[200px]">
              <span className="text-[8px] font-black uppercase tracking-widest text-zinc-400 pl-4">Exhibition Filter</span>
              <Admin_Dropdown 
                value={selectedEventId} 
                onChange={setSelectedEventId}
                options={[{ value: 'all', label: 'All Archived' }, ...(Array.isArray(events) ? events.map(e => ({ value: e.id, label: e.title })) : [])]}
              />
            </div>
            <button className="px-8 h-12 mt-auto flex items-center gap-3 bg-zinc-100 dark:bg-[#1a1a1a] text-zinc-400 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-uiupc-orange hover:text-white transition-all shadow-sm border border-zinc-200 dark:border-zinc-800/50">
              <IconDownload size={14} /> Bulk Export
            </button>
          </div>
        </div>
      </div>

      {/* ── DATA TABLE ─────────────────────────────────────────── */}
      <div className="bg-white dark:bg-[#0d0d0d] rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm relative z-10">
        <div className="overflow-x-auto min-h-[500px]">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-zinc-50 dark:bg-zinc-900/50">
                <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 whitespace-nowrap">Visual Asset</th>
                <th className="px-6 py-6 text-left text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 whitespace-nowrap hidden sm:table-cell">Photographer</th>
                <th className="px-6 py-6 text-left text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 whitespace-nowrap hidden md:table-cell">Category</th>
                <th className="px-6 py-6 text-left text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 whitespace-nowrap hidden lg:table-cell">Status</th>
                <th className="px-8 py-6 text-right text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5">
              {isLoading ? (
                [...Array(6)].map((_, i) => <tr key={i} className="animate-pulse"><td colSpan={5} className="px-8 py-8"><div className="h-10 bg-zinc-50 dark:bg-zinc-900 rounded-xl" /></td></tr>)
              ) : visibleSubmissions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                       <div className="w-16 h-16 rounded-[2rem] bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center text-zinc-300 dark:text-zinc-600"><IconInbox size={20} /></div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">No assets found in this category</p>
                    </div>
                  </td>
                </tr>
              ) : (
                visibleSubmissions.map((item: ExhibitionSubmission) => (
                  <ArchiveRow key={item.id} item={item} onView={setViewingPhoto} />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── PAGINATION ─────────────────────────────────────────── */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-10 border-t border-zinc-100 dark:border-zinc-800/50">
          <div className="text-center sm:text-left">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Exhibition History</p>
            <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Page {page + 1} of {totalPages} | Total {count} Records</p>
          </div>
          <div className="flex items-center gap-3">
            <button disabled={page === 0} onClick={() => { setPage(p => Math.max(0, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="w-14 h-14 flex items-center justify-center rounded-2xl bg-white dark:bg-[#0d0d0d] border border-zinc-200 dark:border-zinc-800 text-zinc-400 disabled:opacity-20 hover:border-uiupc-orange hover:text-uiupc-orange transition-all shadow-sm"><IconChevronLeft size={16} /></button>
            <button disabled={page >= totalPages - 1} onClick={() => { setPage(p => p + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="w-14 h-14 flex items-center justify-center rounded-2xl bg-white dark:bg-[#0d0d0d] border border-zinc-200 dark:border-zinc-800 text-zinc-400 disabled:opacity-20 hover:border-uiupc-orange hover:text-uiupc-orange transition-all shadow-sm"><IconChevronRight size={16} /></button>
          </div>
        </div>
      )}

      {/* ── LIGHTBOX MODAL ────────────────────────────────────── */}
      <Admin_ErrorBoundary>
        <AnimatePresence>
          {viewingPhoto && (
            <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 md:p-12">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/95 backdrop-blur-2xl" onClick={() => setViewingPhoto(null)} />
              <motion.div initial={{ scale: 0.9, opacity: 0, y: 40 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 40 }} className="relative w-full max-w-6xl bg-[#0a0a0a] rounded-[3rem] overflow-hidden flex flex-col lg:flex-row shadow-3xl border border-white/10 isolate">
                <div className="flex-[2] bg-black flex items-center justify-center p-4 min-h-[400px]">
                  <img src={getImageUrl(viewingPhoto.photo_url, 1600, 90)} alt={viewingPhoto.photo_title} className="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl shadow-white/5" />
                </div>
                <div className="flex-1 p-8 md:p-14 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-white/10">
                  <div className="space-y-12">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <span className="text-uiupc-orange text-[10px] font-black uppercase tracking-[0.4em]">Asset Details</span>
                        <h3 className="text-4xl font-black uppercase tracking-tighter text-white leading-tight">{viewingPhoto.photo_title}</h3>
                      </div>
                      <button onClick={() => setViewingPhoto(null)} className="w-12 h-12 rounded-2xl bg-white/5 text-zinc-400 hover:text-red-500 transition-all flex items-center justify-center lg:hidden">
                        <IconClose size={20} />
                      </button>
                    </div>
                    <div className="space-y-8">
                      <div className="flex items-center gap-6">
                        <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-zinc-400 border border-white/10"><IconUser size={20} /></div>
                        <div><p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">Participant</p><p className="text-white text-xl font-black tracking-tight">{viewingPhoto.participant_name}</p></div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-zinc-400 border border-white/10"><IconCamera size={20} /></div>
                        <div><p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">Equipment Used</p><p className="text-white text-xl font-black tracking-tight">{viewingPhoto.gear_used || 'Standard Gear'}</p></div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4 pt-12">
                    <button onClick={() => window.open(viewingPhoto.photo_url, '_blank')} className="flex-[2] py-5 bg-white text-black text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-uiupc-orange hover:text-white transition-all flex items-center justify-center gap-3 shadow-xl"><IconDownload size={14} /> Download Original</button>
                    <button onClick={() => setViewingPhoto(null)} className="flex-1 py-5 bg-white/5 text-zinc-400 text-[10px] font-black uppercase tracking-widest rounded-2xl flex items-center justify-center hover:bg-white/10 transition-all border border-white/5">Close</button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </Admin_ErrorBoundary>
    </div>
  );
};
