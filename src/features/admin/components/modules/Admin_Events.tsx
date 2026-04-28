"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaPlus, 
  FaCalendarAlt, 
  FaMapMarkerAlt, 
  FaTrash,
  FaEdit,
  FaSearch,
  FaSync,
  FaChevronLeft,
  FaChevronRight,
  FaExternalLinkAlt,
  FaGlobe,
  FaSpinner,
  FaLayerGroup
} from 'react-icons/fa';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { Admin_Dropdown } from "@/features/admin/components";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { supabase } from "@/lib/supabase";

interface ClubEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  cover_image: string;
  event_type: 'workshop' | 'exhibition' | 'contest' | 'other';
  status: 'upcoming' | 'ongoing' | 'completed';
  registration_link?: string;
  created_at: string;
}

const EventStatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    upcoming: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    ongoing: "bg-green-500/10 text-green-500 border-green-500/20",
    completed: "bg-zinc-500/10 text-zinc-500 border-zinc-500/20",
  };
  return (
    <span className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${styles[status] || styles.upcoming}`}>
      {status}
    </span>
  );
};

export const Admin_Events: React.FC = () => {
  const { adminProfile } = useSupabaseAuth();
  const [isAdding, setIsAdding] = useState(false);
  const [editingEvent, setEditingEvent] = useState<ClubEvent | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [page, setPage] = useState(0);
  const pageSize = 12;

  const filters = useMemo(() => {
    const f: Record<string, any> = {};
    if (filterStatus !== "all") f.status = filterStatus;
    if (filterCategory !== "all") f.event_type = filterCategory;
    return f;
  }, [filterStatus, filterCategory]);

  const { data, count, isLoading, refetch } = useSupabaseData("events", {
    page,
    pageSize,
    filters,
    orderBy: 'date',
    orderDesc: true,
  });

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this event?")) return;
    try {
      const { error } = await supabase.from("events").delete().eq('id', id);
      if (error) throw error;
      if (adminProfile) {
        await supabase.from('audit_logs').insert({
          admin_id: adminProfile.id,
          action: 'event_deleted',
          target_table: 'events',
          target_id: id
        });
      }
      refetch();
    } catch (err: any) {
      console.error("Delete failed:", err.message);
    }
  };

  const handleUpsert = async (id: string | null, formData: any) => {
    try {
      const { error } = id 
        ? await supabase.from("events").update(formData).eq('id', id)
        : await supabase.from("events").insert([formData]);

      if (error) throw error;
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
              placeholder="Search by title..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full py-5 pl-14 pr-8 bg-zinc-50 dark:bg-zinc-900/50 border border-transparent focus:border-uiupc-orange/30 rounded-2xl text-sm outline-none transition-all placeholder:text-zinc-400 font-medium" 
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex flex-col gap-1.5">
              <span className="text-[8px] font-black uppercase tracking-widest text-zinc-400 pl-4">Status</span>
              <Admin_Dropdown 
                value={filterStatus} 
                onChange={setFilterStatus}
                options={[{ value: 'all', label: 'All Status' }, { value: 'upcoming', label: 'Upcoming' }, { value: 'ongoing', label: 'Ongoing' }, { value: 'completed', label: 'Completed' }]}
                className="min-w-[150px]"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-[8px] font-black uppercase tracking-widest text-zinc-400 pl-4">Category</span>
              <Admin_Dropdown 
                value={filterCategory} 
                onChange={setFilterCategory}
                options={[{ value: 'all', label: 'All Categories' }, { value: 'workshop', label: 'Workshop' }, { value: 'exhibition', label: 'Exhibition' }, { value: 'contest', label: 'Contest' }]}
                className="min-w-[150px]"
              />
            </div>
            <button 
              onClick={() => setIsAdding(true)} 
              className="px-8 h-14 mt-auto flex items-center gap-3 bg-uiupc-orange text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-uiupc-orange/20 hover:brightness-110 transition-all"
            >
              <FaPlus /> New Event
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
                <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 whitespace-nowrap">Event Identity</th>
                <th className="px-6 py-6 text-left text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 whitespace-nowrap">Schedule & Venue</th>
                <th className="px-6 py-6 text-left text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 whitespace-nowrap">Category</th>
                <th className="px-6 py-6 text-left text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 whitespace-nowrap">Status</th>
                <th className="px-8 py-6 text-right text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5">
              {isLoading ? (
                [...Array(6)].map((_, i) => <tr key={i} className="animate-pulse"><td colSpan={5} className="px-8 py-8"><div className="h-8 bg-zinc-50 dark:bg-zinc-900 rounded-xl" /></td></tr>)
              ) : (
                (data || []).filter(item => (item.title || "").toLowerCase().includes(searchTerm.toLowerCase())).map((item: ClubEvent) => (
                  <motion.tr key={item.id} className="group hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition-all">
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-sm font-black text-uiupc-orange shadow-inner truncate">{(item.title || "?").charAt(0)}</div>
                        <div className="flex flex-col min-w-[200px]">
                          <span className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-tight truncate">{item.title}</span>
                          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest truncate">{item.event_type} session</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6 whitespace-nowrap">
                      <div className="flex flex-col gap-1 min-w-[150px]">
                        <div className="flex items-center gap-2 text-[11px] font-black text-zinc-900 dark:text-white uppercase tracking-wider"><FaCalendarAlt className="text-uiupc-orange text-[10px]" /> {new Date(item.date).toLocaleDateString()}</div>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-400 uppercase tracking-widest"><FaMapMarkerAlt className="text-zinc-300 text-[9px]" /> {item.location}</div>
                      </div>
                    </td>
                    <td className="px-6 py-6 whitespace-nowrap">
                       <span className="px-4 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800/50 text-zinc-500 dark:text-zinc-400 text-[9px] font-black uppercase tracking-widest border border-black/5 dark:border-white/5 flex items-center gap-2 w-fit">
                         <FaLayerGroup className="text-[10px]" /> {item.event_type}
                       </span>
                    </td>
                    <td className="px-6 py-6 whitespace-nowrap"><EventStatusBadge status={item.status} /></td>
                    <td className="px-8 py-6 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setEditingEvent(item)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:bg-uiupc-orange hover:text-white transition-all"><FaEdit className="text-xs" /></button>
                        {item.registration_link && (
                          <a href={item.registration_link} target="_blank" rel="noopener noreferrer" className="w-10 h-10 flex items-center justify-center rounded-xl bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white transition-all"><FaGlobe className="text-xs" /></a>
                        )}
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

      {/* ── PAGINATION ────────────────────────────────────────── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-10 border-t border-black/5 dark:border-white/5">
          <div className="flex flex-col"><p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Events Tracker</p><p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Page {page + 1} of {totalPages} | Total {count} Sessions</p></div>
          <div className="flex items-center gap-3">
            <button disabled={page === 0} onClick={() => { setPage(p => Math.max(0, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="w-14 h-14 flex items-center justify-center rounded-2xl bg-white dark:bg-[#080808] border border-black/5 dark:border-white/5 text-zinc-400 disabled:opacity-20 hover:border-uiupc-orange hover:text-uiupc-orange shadow-sm transition-all"><FaChevronLeft className="text-xs" /></button>
            <button disabled={page >= totalPages - 1} onClick={() => { setPage(p => p + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="w-14 h-14 flex items-center justify-center rounded-2xl bg-white dark:bg-[#080808] border border-black/5 dark:border-white/5 text-zinc-400 disabled:opacity-20 hover:border-uiupc-orange hover:text-uiupc-orange shadow-sm transition-all"><FaChevronRight className="text-xs" /></button>
          </div>
        </div>
      )}

      {/* ── MODALS ────────────────────────────────────────────── */}
      <AnimatePresence>
        {(isAdding || editingEvent) && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-2xl" onClick={() => { setIsAdding(false); setEditingEvent(null); }} />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 40 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 40 }} className="relative w-full max-w-3xl bg-white dark:bg-[#080808] rounded-[3rem] p-8 md:p-14 border border-black/10 dark:border-white/10 shadow-3xl overflow-y-auto max-h-[90vh] custom-scrollbar">
              <div className="mb-14 text-center md:text-left">
                <span className="text-uiupc-orange text-[10px] font-black uppercase tracking-[0.4em] mb-4 block">{editingEvent ? 'Refine Event' : 'New Session'}</span>
                <h3 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-zinc-900 dark:text-white">{editingEvent ? 'Edit Event' : 'Create Event'}</h3>
              </div>
              <EventForm initialData={editingEvent || undefined} onSuccess={() => { setIsAdding(false); setEditingEvent(null); refetch(); }} onCancel={() => { setIsAdding(false); setEditingEvent(null); }} onSave={handleUpsert} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const EventForm: React.FC<{ initialData?: ClubEvent; onSuccess: () => void; onCancel: () => void; onSave: (id: string | null, data: any) => Promise<any> }> = ({ initialData, onSuccess, onCancel, onSave }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    date: initialData?.date ? new Date(initialData.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    location: initialData?.location || 'UIU Campus',
    event_type: initialData?.event_type || 'workshop',
    status: initialData?.status || 'upcoming',
    cover_image: initialData?.cover_image || '',
    registration_link: initialData?.registration_link || ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const result = await onSave(initialData?.id || null, formData);
    if (result?.success) onSuccess();
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      <div className="space-y-3">
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Event Title</label>
        <input type="text" required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full bg-transparent border-b-2 border-black/5 dark:border-white/5 py-5 outline-none focus:border-uiupc-orange dark:text-white text-3xl font-black transition-colors" placeholder="e.g. Shutter Stories V" />
      </div>
      <div className="space-y-3">
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Description</label>
        <textarea required value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full bg-transparent border-b-2 border-black/5 dark:border-white/5 py-5 outline-none focus:border-uiupc-orange dark:text-white font-bold resize-none h-32 text-lg transition-colors" placeholder="Objective and details..." />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="space-y-4">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Category</label>
          <div className="grid grid-cols-2 gap-4">
             {(['workshop', 'exhibition', 'contest', 'other'] as const).map(cat => (
               <button key={cat} type="button" onClick={() => setFormData({...formData, event_type: cat})} className={`py-4 rounded-2xl text-[9px] font-black uppercase tracking-widest border transition-all ${formData.event_type === cat ? 'bg-uiupc-orange text-white border-uiupc-orange shadow-lg' : 'bg-transparent border-black/5 dark:border-white/5 text-zinc-400'}`}>{cat}</button>
             ))}
          </div>
        </div>
        <div className="space-y-4">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Status</label>
          <div className="grid grid-cols-3 gap-3">
             {(['upcoming', 'ongoing', 'completed'] as const).map(stat => (
               <button key={stat} type="button" onClick={() => setFormData({...formData, status: stat})} className={`py-4 rounded-2xl text-[8px] font-black uppercase tracking-widest border transition-all ${formData.status === stat ? 'bg-uiupc-orange text-white border-uiupc-orange shadow-lg' : 'bg-transparent border-black/5 dark:border-white/5 text-zinc-400'}`}>{stat}</button>
             ))}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Date</label>
          <input type="date" required value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} className="w-full bg-zinc-50 dark:bg-zinc-900/50 border border-black/5 dark:border-white/5 p-5 rounded-2xl outline-none focus:border-uiupc-orange dark:text-white font-bold" />
        </div>
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Location</label>
          <input type="text" required value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} className="w-full bg-zinc-50 dark:bg-zinc-900/50 border border-black/5 dark:border-white/5 p-5 rounded-2xl outline-none focus:border-uiupc-orange dark:text-white font-bold" />
        </div>
      </div>
      <div className="flex flex-col md:flex-row gap-4 pt-10 border-t border-black/5 dark:border-white/5">
        <button type="button" onClick={onCancel} className="flex-1 py-6 bg-zinc-100 dark:bg-zinc-900 text-zinc-500 text-[10px] font-black uppercase tracking-widest rounded-3xl hover:bg-zinc-200 transition-all">Cancel</button>
        <button type="submit" disabled={loading} className="flex-[2] py-6 bg-uiupc-orange text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-3xl shadow-2xl hover:translate-y-[-2px] transition-all disabled:opacity-50">{loading ? <FaSpinner className="animate-spin mx-auto" /> : (initialData ? 'Update Event' : 'Create Event')}</button>
      </div>
    </form>
  );
};
