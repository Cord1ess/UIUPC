"use client";

import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { 
  IconPlus, IconCalendarAlt, IconMapMarker, IconTrash, IconEdit, 
  IconSearch, IconChevronLeft, IconChevronRight, IconGlobe, IconSpinner, 
  IconLayerGroup, IconFilter, IconImages, IconCheck, IconClose, IconMap 
} from '@/components/shared/Icons';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Admin_Dropdown, Admin_DrivePicker, Admin_ModuleHeader, 
  Admin_StatCard, Admin_ErrorBoundary, Admin_DeleteConfirmModal 
} from "@/features/admin/components";
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from "@/lib/supabase";
import { getImageUrl } from "@/utils/imageUrl";
import { initAdminPassword } from "@/features/admin/actions";

interface ClubEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  image: string;
  event_type: 'workshop' | 'exhibition' | 'contest' | 'other';
  status: 'upcoming' | 'ongoing' | 'completed';
  registration_link?: string;
  created_at: string;
  is_mapped?: boolean;
  latitude?: number;
  longitude?: number;
  map_icon_type?: string;
}

interface Admin_EventsProps {
  initialData: ClubEvent[];
  count: number;
  filterStatus: string;
  filterCategory: string;
  searchTerm: string;
  currentPage: number;
  onFilterChange: (filters: any) => void;
}

const EventStatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    upcoming: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    ongoing: "bg-green-500/10 text-green-500 border-green-500/20",
    completed: "bg-zinc-500/10 text-zinc-500 border-zinc-500/20",
  };
  return (
    <span className={`px-4 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-widest border ${styles[status] || styles.upcoming}`}>
      {status}
    </span>
  );
};

const EventRow = React.memo(({ 
  item, onEdit, onDelete 
}: { 
  item: ClubEvent; onEdit: (item: ClubEvent) => void; onDelete: (item: ClubEvent) => void 
}) => {
  return (
    <motion.tr className="group hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition-all border-b border-zinc-100 dark:border-zinc-800/50">
      <td className="px-8 py-4 whitespace-nowrap">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-sm font-black text-uiupc-orange shadow-inner shrink-0">
            {(item.title || "?").charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col min-w-[200px]">
            <span className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-tight truncate">{item.title}</span>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest truncate">{item.event_type}</span>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap hidden sm:table-cell">
        <div className="flex flex-col gap-1 min-w-[150px]">
          <div className="flex items-center gap-2 text-[11px] font-black text-zinc-900 dark:text-white uppercase tracking-wider"><IconCalendarAlt size={10} className="text-uiupc-orange" /> {new Date(item.date).toLocaleDateString()}</div>
          <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-400 uppercase tracking-widest"><IconMapMarker size={9} className="text-zinc-300" /> {item.location}</div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
         <span className="px-4 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800/50 text-zinc-500 dark:text-zinc-400 text-[9px] font-black uppercase tracking-widest border border-black/5 dark:border-white/5 flex items-center gap-2 w-fit">
            <IconLayerGroup size={10} /> {item.event_type}
          </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap"><EventStatusBadge status={item.status} /></td>
      <td className="px-8 py-4 text-right whitespace-nowrap">
        <div className="flex items-center justify-end gap-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
          <button onClick={() => onEdit(item)} title="Edit" className="w-10 h-10 flex items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:bg-uiupc-orange hover:text-white transition-all"><IconEdit size={12} /></button>
          {item.registration_link && (
            <a href={item.registration_link} target="_blank" rel="noopener noreferrer" title="Registration Link" className="w-10 h-10 flex items-center justify-center rounded-xl bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white transition-all"><IconGlobe size={12} /></a>
          )}
          <button onClick={() => onDelete(item)} title="Delete" className="w-10 h-10 flex items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400 hover:bg-red-500 hover:text-white transition-all"><IconTrash size={12} /></button>
        </div>
      </td>
    </motion.tr>
  );
});
EventRow.displayName = 'EventRow';

export const Admin_Events: React.FC<Admin_EventsProps> = ({ 
  initialData: data, count, filterStatus, filterCategory, searchTerm, currentPage, onFilterChange 
}) => {
  const { adminProfile } = useSupabaseAuth();
  const [isAdding, setIsAdding] = useState(false);
  const [editingEvent, setEditingEvent] = useState<ClubEvent | null>(null);
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set());
  const [deleteTarget, setDeleteTarget] = useState<ClubEvent | null>(null);
  
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { initAdminPassword(); }, []);

  const handleSearchInput = useCallback((val: string) => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      onFilterChange({ search: val, page: 0 });
    }, 400);
  }, [onFilterChange]);

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

  const refreshData = useCallback(() => {
    setHiddenIds(new Set());
    onFilterChange({});
  }, [onFilterChange]);

  const visibleData = useMemo(() => {
    return data.filter(item => !hiddenIds.has(item.id));
  }, [data, hiddenIds]);

  const pageSize = 12;
  const totalPages = Math.ceil((count || 0) / pageSize);
  const mappedCount = data.filter(e => e.is_mapped).length;

  return (
    <div className="w-full space-y-6 min-w-0 relative z-10 isolate">
      <Admin_ModuleHeader 
        title="Events"
        description="Manage workshops, contests, and exhibitions."
      >
        <Admin_StatCard label="Total Events" value={count} icon={<IconCalendarAlt size={20} />} />
        
        <div className="p-6 bg-white dark:bg-[#0d0d0d] border border-zinc-200 dark:border-zinc-800 rounded-2xl flex flex-col justify-between shadow-sm min-h-[140px] group">
          <p className="text-zinc-400 text-[10px] font-black uppercase tracking-widest">Filter Status</p>
          <div className="flex items-end justify-between mt-auto">
            <div className="text-uiupc-orange text-4xl opacity-20 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500">
              <IconFilter size={40} />
            </div>
            <div className="flex-1 ml-6 max-w-[180px]">
              <Admin_Dropdown 
                variant="minimal"
                label="Event Status"
                value={filterStatus} 
                onChange={(val) => onFilterChange({ status: val, page: 0 })}
                options={[{ value: 'all', label: 'All Status' }, { value: 'upcoming', label: 'Upcoming' }, { value: 'ongoing', label: 'Ongoing' }, { value: 'completed', label: 'Completed' }]}
                className="w-full"
              />
            </div>
          </div>
        </div>

        <div className="p-6 bg-white dark:bg-[#0d0d0d] border border-zinc-200 dark:border-zinc-800 rounded-2xl flex flex-col justify-between shadow-sm min-h-[140px] group">
          <p className="text-zinc-400 text-[10px] font-black uppercase tracking-widest">Category</p>
          <div className="flex items-end justify-between mt-auto">
            <div className="text-blue-500 text-4xl opacity-20 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500">
              <IconLayerGroup size={40} />
            </div>
            <div className="flex-1 ml-6 max-w-[180px]">
              <Admin_Dropdown 
                variant="minimal"
                label="Select Category"
                value={filterCategory} 
                onChange={(val) => onFilterChange({ category: val, page: 0 })}
                options={[{ value: 'all', label: 'All Categories' }, { value: 'workshop', label: 'Workshop' }, { value: 'exhibition', label: 'Exhibition' }, { value: 'contest', label: 'Contest' }]}
                className="w-full"
              />
            </div>
          </div>
        </div>

        <Admin_StatCard label="Mapped Pins" value={mappedCount} icon={<IconMap size={20} />} color="text-blue-500" />
      </Admin_ModuleHeader>

      {/* ── FILTER BAR ─────────────────────────────────────────── */}
      <div className="w-full bg-white dark:bg-[#0d0d0d] p-3 sm:p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm relative z-10">
        <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
          <div className="relative flex-1 group min-w-[200px]">
            <IconSearch size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-uiupc-orange transition-colors" />
            <input 
              type="text" 
              placeholder="Search events..." 
              defaultValue={searchTerm} 
              onChange={(e) => handleSearchInput(e.target.value)}
              className="w-full py-4 pl-14 pr-8 bg-zinc-100 dark:bg-[#1a1a1a] border border-transparent focus:border-uiupc-orange/30 rounded-xl text-sm outline-none transition-all placeholder:text-zinc-400 font-medium" 
            />
          </div>
          <button 
            onClick={() => setIsAdding(true)} 
            className="px-8 h-12 flex items-center gap-3 bg-uiupc-orange text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-uiupc-orange/20 hover:brightness-110 transition-all"
          >
            <IconPlus size={14} /> New Event
          </button>
        </div>
      </div>

      {/* ── DATA TABLE ─────────────────────────────────────────── */}
      <div className="bg-white dark:bg-[#0d0d0d] rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm relative z-10">
        <div className="overflow-x-auto min-h-[500px]">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-zinc-50 dark:bg-zinc-900/50">
                <th className="px-8 py-4 text-left text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 whitespace-nowrap">Event Info</th>
                <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 whitespace-nowrap hidden sm:table-cell">Date & Location</th>
                <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 whitespace-nowrap hidden md:table-cell">Event Type</th>
                <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 whitespace-nowrap">Status</th>
                <th className="px-8 py-4 text-right text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5">
              {visibleData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 rounded-[2rem] bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center text-zinc-300 dark:text-zinc-600"><IconSearch size={20} /></div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">No events found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                visibleData.map((item) => (
                  <EventRow 
                    key={item.id} 
                    item={item} 
                    onEdit={setEditingEvent}
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
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Event Summary</p>
            <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Page {currentPage + 1} of {totalPages} <span className="hidden sm:inline">| Total {count} Events</span></p>
          </div>
          <div className="flex items-center gap-3">
            <button disabled={currentPage === 0} onClick={() => onFilterChange({ page: Math.max(0, currentPage - 1) })} className="w-14 h-12 flex items-center justify-center rounded-xl bg-white dark:bg-[#080808] border border-black/5 dark:border-white/5 text-zinc-400 disabled:opacity-20 hover:border-uiupc-orange hover:text-uiupc-orange transition-all shadow-sm"><IconChevronLeft size={16} /></button>
            <button disabled={currentPage >= totalPages - 1} onClick={() => onFilterChange({ page: currentPage + 1 })} className="w-14 h-12 flex items-center justify-center rounded-xl bg-white dark:bg-[#080808] border border-black/5 dark:border-white/5 text-zinc-400 disabled:opacity-20 hover:border-uiupc-orange hover:text-uiupc-orange transition-all shadow-sm"><IconChevronRight size={16} /></button>
          </div>
        </div>
      )}

      {/* ── MODALS ────────────────────────────────────────────── */}
      <Admin_ErrorBoundary>
        <AnimatePresence>
          {(isAdding || editingEvent) && (
            <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 md:p-10">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-2xl" onClick={() => { setIsAdding(false); setEditingEvent(null); }} />
              <motion.div initial={{ scale: 0.9, opacity: 0, y: 40 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 40 }} className="relative w-full max-w-3xl bg-white dark:bg-[#0d0d0d] rounded-[3rem] p-8 md:p-14 border border-zinc-200 dark:border-zinc-800 shadow-3xl overflow-y-auto max-h-[90vh] custom-scrollbar">
                <div className="mb-14 text-center md:text-left">
                  <span className="text-uiupc-orange text-[10px] font-black uppercase tracking-[0.4em] mb-4 block">{editingEvent ? 'Refine Session' : 'New Session'}</span>
                  <h3 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-zinc-900 dark:text-white leading-none">{editingEvent ? 'Edit Event' : 'Create Event'}</h3>
                </div>
                <EventForm 
                  initialData={editingEvent || undefined} 
                  onSuccess={() => { setIsAdding(false); setEditingEvent(null); refreshData(); }} 
                  onCancel={() => { setIsAdding(false); setEditingEvent(null); }} 
                  onSave={handleUpsert} 
                />
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </Admin_ErrorBoundary>

      <Admin_ErrorBoundary>
        <Admin_DeleteConfirmModal 
          isOpen={!!deleteTarget} 
          onClose={() => setDeleteTarget(null)} 
          itemId={deleteTarget?.id} 
          itemName={deleteTarget?.title} 
          onSuccess={() => {
            if (deleteTarget) setHiddenIds(prev => new Set(prev).add(deleteTarget.id));
            refreshData();
          }}
        />
      </Admin_ErrorBoundary>
    </div>
  );
};

const EventForm: React.FC<{ initialData?: ClubEvent; onSuccess: () => void; onCancel: () => void; onSave: (id: string | null, data: any) => Promise<any> }> = ({ initialData, onSuccess, onCancel, onSave }) => {
  const [loading, setLoading] = useState(false);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    date: initialData?.date ? new Date(initialData.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    location: initialData?.location || 'UIU Campus',
    event_type: initialData?.event_type || 'workshop',
    status: initialData?.status || 'upcoming',
    image: initialData?.image || '',
    registration_link: initialData?.registration_link || '',
    is_mapped: initialData?.is_mapped || false,
    latitude: initialData?.latitude || 0,
    longitude: initialData?.longitude || 0,
    map_icon_type: initialData?.map_icon_type || 'workshop'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const result = await onSave(initialData?.id || null, formData);
    if (result?.success) onSuccess();
    else alert(result?.message || 'Save failed');
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      <div className="space-y-3">
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Event Title</label>
        <input type="text" required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full bg-transparent border-b-2 border-zinc-100 dark:border-zinc-800 py-5 outline-none focus:border-uiupc-orange dark:text-white text-3xl font-black transition-colors" placeholder="e.g. Shutter Stories V" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Cover Image</label>
          <div className="flex flex-col gap-4">
            {formData.image && (
              <div className="w-full h-32 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-[#1a1a1a]">
                 <img src={getImageUrl(formData.image, 400, 200)} className="w-full h-full object-cover" alt="Preview" />
              </div>
            )}
            <div className="flex gap-2">
              <input type="text" value={formData.image} onChange={(e) => setFormData({...formData, image: e.target.value})} className="flex-1 bg-zinc-100 dark:bg-[#1a1a1a] border border-transparent p-4 rounded-xl outline-none focus:border-uiupc-orange dark:text-white font-bold text-xs" placeholder="Drive ID..." />
              <button type="button" onClick={() => setIsPickerOpen(true)} className="px-5 py-4 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-uiupc-orange rounded-xl text-[9px] font-black uppercase tracking-widest transition-all">Browse</button>
            </div>
          </div>
        </div>
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Description</label>
          <textarea required value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full bg-zinc-100 dark:bg-[#1a1a1a] p-5 rounded-2xl outline-none focus:border-uiupc-orange dark:text-white font-bold resize-none h-32 text-sm transition-colors" placeholder="Event details..." />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="space-y-4">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Category</label>
          <div className="grid grid-cols-2 gap-3">
             {(['workshop', 'exhibition', 'contest', 'other'] as const).map(cat => (
               <button key={cat} type="button" onClick={() => setFormData({...formData, event_type: cat})} className={`py-4 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${formData.event_type === cat ? 'bg-uiupc-orange text-white border-uiupc-orange shadow-lg' : 'bg-transparent border-zinc-200 dark:border-zinc-800 text-zinc-400'}`}>{cat}</button>
             ))}
          </div>
        </div>
        <div className="space-y-4">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Status</label>
          <div className="grid grid-cols-3 gap-3">
             {(['upcoming', 'ongoing', 'completed'] as const).map(stat => (
               <button key={stat} type="button" onClick={() => setFormData({...formData, status: stat})} className={`py-4 rounded-xl text-[8px] font-black uppercase tracking-widest border transition-all ${formData.status === stat ? 'bg-uiupc-orange text-white border-uiupc-orange shadow-lg' : 'bg-transparent border-zinc-200 dark:border-zinc-800 text-zinc-400'}`}>{stat}</button>
             ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Date</label>
          <input type="date" required value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} className="w-full bg-zinc-100 dark:bg-[#1a1a1a] p-5 rounded-2xl outline-none focus:border-uiupc-orange dark:text-white font-bold" />
        </div>
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Location</label>
          <input type="text" required value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} className="w-full bg-zinc-100 dark:bg-[#1a1a1a] p-5 rounded-2xl outline-none focus:border-uiupc-orange dark:text-white font-bold" />
        </div>
      </div>

      <div className="p-8 bg-zinc-50 dark:bg-[#0a0a0a] rounded-3xl border border-zinc-100 dark:border-zinc-800 space-y-8">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h4 className="text-sm font-black uppercase tracking-tight dark:text-white">World Map Pin</h4>
            <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Pin this event to the interactive map</p>
          </div>
          <button 
            type="button" 
            onClick={() => setFormData({...formData, is_mapped: !formData.is_mapped})}
            className={`w-14 h-8 rounded-full relative transition-colors duration-300 ${formData.is_mapped ? 'bg-uiupc-orange' : 'bg-zinc-200 dark:bg-zinc-800'}`}
          >
            <motion.div 
              animate={{ x: formData.is_mapped ? 24 : 4 }}
              className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-sm"
            />
          </button>
        </div>

        {formData.is_mapped && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-8 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Latitude</label>
                  <input type="number" step="any" value={formData.latitude} onChange={(e) => setFormData({...formData, latitude: parseFloat(e.target.value)})} className="w-full bg-white dark:bg-[#1a1a1a] border border-transparent p-5 rounded-2xl outline-none focus:border-uiupc-orange dark:text-white font-bold" />
               </div>
               <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Longitude</label>
                  <input type="number" step="any" value={formData.longitude} onChange={(e) => setFormData({...formData, longitude: parseFloat(e.target.value)})} className="w-full bg-white dark:bg-[#1a1a1a] border border-transparent p-5 rounded-2xl outline-none focus:border-uiupc-orange dark:text-white font-bold" />
               </div>
            </div>
          </motion.div>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-4 pt-10 border-t border-zinc-100 dark:border-zinc-800">
        <button type="button" onClick={onCancel} className="flex-1 py-6 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 text-[10px] font-black uppercase tracking-widest rounded-3xl hover:bg-zinc-200 transition-all">Cancel</button>
        <button type="submit" disabled={loading} className="flex-[2] py-6 bg-uiupc-orange text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-3xl shadow-2xl hover:translate-y-[-2px] transition-all disabled:opacity-50">{loading ? <IconSpinner size={16} className="animate-spin mx-auto" /> : (initialData ? 'Save Changes' : 'Create Event')}</button>
      </div>

      <Admin_DrivePicker
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onSelect={(fileId, fileUrl, name) => {
          setFormData({ ...formData, image: fileId });
        }}
        title="Select Event Image"
      />
    </form>
  );
};
