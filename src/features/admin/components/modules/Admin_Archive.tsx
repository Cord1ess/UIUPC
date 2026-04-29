"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaArchive, 
  FaSearch, 
  FaCamera, 
  FaUser, 
  FaEye, 
  FaDownload, 
  FaChevronLeft, 
  FaChevronRight,
  FaFileImage,
  FaCalendarAlt,
  FaExternalLinkAlt
} from 'react-icons/fa';
import Image from 'next/image';
import { getImageUrl } from '@/utils/imageUrl';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { Admin_Dropdown } from "@/features/admin/components";

interface ExhibitionSubmission {
  id: string;
  event_id: string;
  photo_title: string;
  photo_url: string;
  category: string;
  gear_used?: string;
  status: string;
  photographer_name: string;
  created_at: string;
}

export const Admin_Archive: React.FC = () => {
  const { data: events } = useSupabaseData('events', { filters: { event_type: 'exhibition' } });
  const [selectedEventId, setSelectedEventId] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewingPhoto, setViewingPhoto] = useState<ExhibitionSubmission | null>(null);
  const [page, setPage] = useState(0);
  const pageSize = 12;

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
              placeholder="Search by photo title or photographer..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full py-5 pl-14 pr-8 bg-zinc-50 dark:bg-zinc-900/50 border border-transparent focus:border-uiupc-orange/30 rounded-2xl text-sm outline-none transition-all placeholder:text-zinc-400 font-medium" 
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex flex-col gap-1.5">
              <span className="text-[8px] font-black uppercase tracking-widest text-zinc-400 pl-4">Exhibition</span>
              <Admin_Dropdown 
                value={selectedEventId} 
                onChange={setSelectedEventId}
                options={[{ value: 'all', label: 'All Archived' }, ...(Array.isArray(events) ? events.map(e => ({ value: e.id, label: e.title })) : [])]}
                className="min-w-[200px]"
              />
            </div>
            <button className="px-8 h-14 mt-auto flex items-center gap-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-uiupc-orange hover:text-white transition-all shadow-sm">
              <FaDownload /> Bulk Export
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
                <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 whitespace-nowrap">Photo Asset</th>
                <th className="px-6 py-6 text-left text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 whitespace-nowrap">Photographer</th>
                <th className="px-6 py-6 text-left text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 whitespace-nowrap">Category</th>
                <th className="px-6 py-6 text-left text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 whitespace-nowrap">Status</th>
                <th className="px-8 py-6 text-right text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5">
              {isLoading ? (
                [...Array(6)].map((_, i) => <tr key={i} className="animate-pulse"><td colSpan={5} className="px-8 py-8"><div className="h-8 bg-zinc-50 dark:bg-zinc-900 rounded-xl" /></td></tr>)
              ) : (
                (submissions || []).filter(s => (s.photo_title || "").toLowerCase().includes(searchTerm.toLowerCase()) || (s.photographer_name || "").toLowerCase().includes(searchTerm.toLowerCase())).map((item: ExhibitionSubmission) => (
                  <motion.tr key={item.id} className="group hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition-all">
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-800 overflow-hidden shrink-0 border border-black/5 dark:border-white/5 group-hover:scale-105 transition-transform shadow-inner">
                          {item.photo_url ? <img src={getImageUrl(item.photo_url, 100, 60)} alt="" className="w-full h-full object-cover" /> : <FaFileImage className="text-zinc-300 mx-auto mt-4" />}
                        </div>
                        <div className="flex flex-col min-w-[200px]">
                          <span className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-tight truncate">{item.photo_title}</span>
                          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest truncate flex items-center gap-2"><FaCamera className="text-zinc-300" /> {item.gear_used || "Standard Gear"}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6 whitespace-nowrap">
                       <span className="text-[11px] font-black text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                         <FaUser className="text-uiupc-orange text-[10px]" /> {item.photographer_name}
                       </span>
                    </td>
                    <td className="px-6 py-6 whitespace-nowrap">
                       <span className="px-4 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800/50 text-zinc-500 dark:text-zinc-400 text-[9px] font-black uppercase tracking-widest border border-black/5 dark:border-white/5 w-fit">
                         {item.category}
                       </span>
                    </td>
                    <td className="px-6 py-6 whitespace-nowrap">
                       <span className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${item.status === 'archived' ? 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20' : 'bg-green-500/10 text-green-500 border-green-500/20'}`}>
                         {item.status}
                       </span>
                    </td>
                    <td className="px-8 py-6 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setViewingPhoto(item)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:bg-uiupc-orange hover:text-white transition-all"><FaEye className="text-xs" /></button>
                        <a href={item.photo_url} target="_blank" rel="noreferrer" className="w-10 h-10 flex items-center justify-center rounded-xl bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white transition-all"><FaExternalLinkAlt className="text-xs" /></a>
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
          <div className="flex flex-col"><p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Historical Ledger</p><p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Page {page + 1} of {totalPages} | Total {count} Records</p></div>
          <div className="flex items-center gap-3">
            <button disabled={page === 0} onClick={() => { setPage(p => Math.max(0, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="w-14 h-14 flex items-center justify-center rounded-2xl bg-white dark:bg-[#080808] border border-black/5 dark:border-white/5 text-zinc-400 disabled:opacity-20 hover:border-uiupc-orange hover:text-uiupc-orange shadow-sm transition-all"><FaChevronLeft className="text-xs" /></button>
            <button disabled={page >= totalPages - 1} onClick={() => { setPage(p => p + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="w-14 h-14 flex items-center justify-center rounded-2xl bg-white dark:bg-[#080808] border border-black/5 dark:border-white/5 text-zinc-400 disabled:opacity-20 hover:border-uiupc-orange hover:text-uiupc-orange shadow-sm transition-all"><FaChevronRight className="text-xs" /></button>
          </div>
        </div>
      )}

      {/* ── LIGHTBOX MODAL ────────────────────────────────────── */}
      <AnimatePresence>
        {viewingPhoto && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 md:p-12">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/95 backdrop-blur-2xl" onClick={() => setViewingPhoto(null)} />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative w-full max-w-6xl bg-zinc-950 rounded-[3rem] overflow-hidden flex flex-col lg:flex-row shadow-3xl border border-white/10">
              <div className="flex-[2] bg-black flex items-center justify-center p-4">
                <img src={getImageUrl(viewingPhoto.photo_url, 1600, 90)} alt={viewingPhoto.photo_title} className="max-w-full max-h-[80vh] object-contain rounded-2xl" />
              </div>
              <div className="flex-1 p-12 flex flex-col justify-between border-l border-white/10">
                <div className="space-y-12">
                  <div className="space-y-2">
                    <span className="text-uiupc-orange text-[10px] font-black uppercase tracking-[0.4em]">Archive Details</span>
                    <h3 className="text-4xl font-black uppercase tracking-tighter text-white leading-none">{viewingPhoto.photo_title}</h3>
                  </div>
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-zinc-400"><FaUser /></div>
                      <div><p className="text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-1">Photographer</p><p className="text-white font-black tracking-tight">{viewingPhoto.photographer_name}</p></div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-zinc-400"><FaCamera /></div>
                      <div><p className="text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-1">Technical Spec</p><p className="text-white font-black tracking-tight">{viewingPhoto.gear_used || 'Standard Gear'}</p></div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-4 pt-12">
                  <button onClick={() => window.open(viewingPhoto.photo_url, '_blank')} className="flex-1 py-5 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-uiupc-orange hover:text-white transition-all flex items-center justify-center gap-3"><FaDownload /> Full Res</button>
                  <button onClick={() => setViewingPhoto(null)} className="px-8 py-5 bg-white/5 text-zinc-400 rounded-2xl flex items-center justify-center hover:bg-white/10 transition-all">Close</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
