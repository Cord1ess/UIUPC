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
  Admin_StatCard, Admin_ErrorBoundary, Admin_DeleteConfirmModal,
  Admin_EventsFilterMenu, Admin_ModalPortal
} from "@/features/admin/components";
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from "@/lib/supabase";
import { getImageUrl } from "@/utils/imageUrl";
import { initAdminPassword, executeAdminMutation } from "@/features/admin/actions";

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
  tags?: string[];
  countdown_target?: string | null;
  show_in_more_events?: boolean;
  event_images?: string[];
  gallery_folder_id?: string | null;
  has_timer?: boolean;
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
      <td className="px-4 py-3 whitespace-nowrap">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-xs font-black text-uiupc-orange shadow-inner shrink-0">
            {(item.title || "?").charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col min-w-[150px]">
            <span className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-tight truncate">{item.title}</span>
            <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest truncate">{item.event_type}</span>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 whitespace-nowrap hidden sm:table-cell">
        <div className="flex flex-col gap-0.5 min-w-[120px]">
          <div className="flex items-center gap-1.5 text-[10px] font-black text-zinc-900 dark:text-white uppercase tracking-wider"><IconCalendarAlt size={8} className="text-uiupc-orange" /> {new Date(item.date).toLocaleDateString()}</div>
          <div className="flex items-center gap-1.5 text-[9px] font-bold text-zinc-400 uppercase tracking-widest"><IconMapMarker size={8} className="text-zinc-300" /> {item.location}</div>
        </div>
      </td>
      <td className="px-4 py-3 whitespace-nowrap hidden md:table-cell">
         <div className="flex flex-col gap-1">
           <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Tags</span>
           <div className="flex gap-1 flex-wrap max-w-[150px]">
             {item.tags && item.tags.length > 0 ? item.tags.slice(0, 2).map((tag, i) => (
               <span key={i} className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-[8px] font-bold text-zinc-400 uppercase">{tag}</span>
             )) : <span className="text-[8px] text-zinc-300">No Tags</span>}
             {item.tags && item.tags.length > 2 && <span className="text-[8px] text-zinc-400">+{item.tags.length - 2}</span>}
           </div>
         </div>
      </td>
      <td className="px-4 py-3 whitespace-nowrap"><EventStatusBadge status={item.status} /></td>
      <td className="px-4 py-3 text-right whitespace-nowrap">
        <div className="flex items-center justify-end gap-1.5 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
          <button onClick={() => onEdit(item)} title="Edit" className="w-8 h-8 flex items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:bg-uiupc-orange hover:text-white transition-all"><IconEdit size={10} /></button>
          {item.registration_link && (
            <a href={item.registration_link} target="_blank" rel="noopener noreferrer" title="Registration Link" className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white transition-all"><IconGlobe size={10} /></a>
          )}
          <button onClick={() => onDelete(item)} title="Delete" className="w-8 h-8 flex items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-400 hover:bg-red-500 hover:text-white transition-all"><IconTrash size={10} /></button>
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
      const { success, message } = id 
        ? await executeAdminMutation("events", "update", formData, id)
        : await executeAdminMutation("events", "create", formData);

      if (!success) throw new Error(message);
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
        
        <div className="p-6 bg-white dark:bg-[#0d0d0d] border border-zinc-200 dark:border-zinc-800 rounded-2xl flex flex-col justify-between shadow-sm min-h-[140px] group relative z-20">
          <p className="text-zinc-400 text-[10px] font-black uppercase tracking-widest">Quick Filters</p>
          <div className="flex items-end justify-between mt-auto">
            <div className="text-uiupc-orange text-4xl opacity-20 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500">
              <IconFilter size={40} />
            </div>
            <div className="flex-1 ml-6 max-w-[180px]">
              <Admin_EventsFilterMenu
                currentStatus={filterStatus}
                currentCategory={filterCategory}
                onStatusChange={(val) => onFilterChange({ status: val, page: 0 })}
                onCategoryChange={(val) => onFilterChange({ category: val, page: 0 })}
              />
            </div>
          </div>
        </div>

        <Admin_StatCard label="Mapped Pins" value={mappedCount} icon={<IconMap size={20} />} color="text-blue-500" />

        <Admin_StatCard label="Upcoming Events" value={data.filter(e => e.status === 'upcoming').length} icon={<IconCalendarAlt size={20} />} color="text-green-500" />
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
                <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 whitespace-nowrap">Event Info</th>
                <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 whitespace-nowrap hidden sm:table-cell">Date & Location</th>
                <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 whitespace-nowrap hidden md:table-cell">Tags</th>
                <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 whitespace-nowrap">Status</th>
                <th className="px-4 py-3 text-right text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5">
              {visibleData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-16 text-center">
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
        <Admin_ModalPortal>
          <AnimatePresence>
            {(isAdding || editingEvent) && (
              <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-10">
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
        </Admin_ModalPortal>
      </Admin_ErrorBoundary>

      <Admin_ErrorBoundary>
        <Admin_DeleteConfirmModal
          isOpen={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={async (password: string) => {
            const { validateAdminPassword } = await import('@/features/admin/actions');
            const validation = await validateAdminPassword(password);
            if (!validation.valid) {
              return { success: false, message: validation.error || "Incorrect password" };
            }
            if (deleteTarget) {
              const { success, message } = await executeAdminMutation("events", "delete", null, deleteTarget.id);
              if (!success) return { success: false, message };
              onFilterChange({});
              setDeleteTarget(null);
              return { success: true, message: "Event deleted successfully" };
            }
            return { success: false, message: "No target specified" };
          }}
          title="Delete Event"
          description={`Are you sure you want to delete "${deleteTarget?.title}"?`}
        />
      </Admin_ErrorBoundary>
    </div>
  );
};

const EventForm: React.FC<{ initialData?: ClubEvent; onSuccess: () => void; onCancel: () => void; onSave: (id: string | null, data: any) => Promise<any> }> = ({ initialData, onSuccess, onCancel, onSave }) => {
  const [loading, setLoading] = useState(false);
  const [isImagePickerOpen, setIsImagePickerOpen] = useState(false);
  const [pickingType, setPickingType] = useState<'cover' | 'highlights'>('cover');
  const [isFolderPickerOpen, setIsFolderPickerOpen] = useState(false);
  const [tagsInput, setTagsInput] = useState(initialData?.tags?.join(', ') || '');

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
    map_icon_type: initialData?.map_icon_type || 'workshop',
    has_timer: initialData?.has_timer || false,
    countdown_target: initialData?.countdown_target || '',
    show_in_more_events: initialData?.show_in_more_events ?? true,
    event_images: initialData?.event_images || [],
    gallery_folder_id: initialData?.gallery_folder_id || null,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const finalData = {
      ...formData,
      tags: tagsInput.split(',').map(t => t.trim()).filter(Boolean)
    };
    const result = await onSave(initialData?.id || null, finalData);
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
              <input type="text" value={formData.image} onChange={(e) => setFormData({...formData, image: e.target.value})} className="flex-1 bg-zinc-100 dark:bg-[#1a1a1a] border border-transparent p-4 rounded-xl outline-none focus:border-uiupc-orange dark:text-white font-bold text-xs" placeholder="Drive File ID..." />
              <button 
                type="button" 
                onClick={() => {
                  const currentOnSelect = isImagePickerOpen; // This is a hack to use the same picker for cover image
                  // Actually, let's just define a state for what we are picking
                  setPickingType('cover');
                  setIsImagePickerOpen(true);
                }} 
                className="px-5 py-4 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-uiupc-orange rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"
              >
                Browse
              </button>
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
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Tags (Comma Separated)</label>
          <input type="text" value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} className="w-full bg-zinc-100 dark:bg-[#1a1a1a] p-5 rounded-2xl outline-none focus:border-uiupc-orange dark:text-white font-bold text-sm" placeholder="e.g. flagship, upcoming, featured" />
        </div>
        <div className="space-y-3 flex flex-col justify-between">
           <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Vault Display</label>
           <div className="flex items-center justify-between p-5 bg-zinc-100 dark:bg-[#1a1a1a] rounded-2xl h-full">
             <span className="text-xs font-bold dark:text-white">Show in "More Events"</span>
             <button 
               type="button" 
               onClick={() => setFormData({...formData, show_in_more_events: !formData.show_in_more_events})}
               className={`w-14 h-8 rounded-full relative transition-colors duration-300 ${formData.show_in_more_events ? 'bg-uiupc-orange' : 'bg-zinc-200 dark:bg-zinc-800'}`}
             >
               <motion.div animate={{ x: formData.show_in_more_events ? 24 : 4 }} className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-sm" />
             </button>
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
            <h4 className="text-sm font-black uppercase tracking-tight dark:text-white">Countdown Timer</h4>
            <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Enable live countdown for this event</p>
          </div>
          <button 
            type="button" 
            onClick={() => setFormData({...formData, has_timer: !formData.has_timer})}
            className={`w-14 h-8 rounded-full relative transition-colors duration-300 ${formData.has_timer ? 'bg-uiupc-orange' : 'bg-zinc-200 dark:bg-zinc-800'}`}
          >
            <motion.div animate={{ x: formData.has_timer ? 24 : 4 }} className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-sm" />
          </button>
        </div>

        {formData.has_timer && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
             <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Target Timestamp</label>
             <input 
               type="datetime-local" 
               value={formData.countdown_target || ''} 
               onChange={(e) => setFormData({...formData, countdown_target: e.target.value})} 
               className="w-full bg-white dark:bg-[#1a1a1a] p-5 rounded-2xl outline-none focus:border-uiupc-orange dark:text-white font-bold" 
             />
          </motion.div>
        )}
      </div>

      {formData.status === 'completed' && (
        <div className="p-8 bg-blue-50/30 dark:bg-blue-500/5 rounded-3xl border border-blue-100/50 dark:border-blue-500/10 space-y-8">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h4 className="text-sm font-black uppercase tracking-tight dark:text-white text-blue-600 dark:text-blue-400">Post-Event Gallery</h4>
              <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Sync photos and highlights for this event</p>
            </div>
            <div className="flex gap-3">
              <button 
                type="button" 
                onClick={() => setIsFolderPickerOpen(true)}
                className="px-6 py-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-zinc-200 transition-all shadow-sm"
              >
                Select Drive Folder
              </button>
              {formData.gallery_folder_id && (
                <button 
                  type="button" 
                  onClick={async () => {
                    if (!initialData?.id) {
                      alert("Please save the event first before syncing the gallery.");
                      return;
                    }
                    setLoading(true);
                    try {
                      const GAS_URL = process.env.NEXT_PUBLIC_GAS_DRIVE;
                      const response = await fetch(`${GAS_URL}?action=browse&folderId=${formData.gallery_folder_id}`);
                      const data = await response.json();
                      const imageFiles = data.files?.filter((f: any) => 
                        f.mimeType?.startsWith('image/') || 
                        ['jpg', 'jpeg', 'png', 'webp'].some(ext => f.name.toLowerCase().endsWith(ext))
                      ) || [];

                      if (imageFiles.length === 0) {
                        alert("No images found in the selected folder.");
                        return;
                      }

                      const inserts = imageFiles.map((f: any) => ({
                        title: f.name.split('.')[0],
                        description: `Gallery for ${formData.title}`,
                        image_url: f.id,
                        event_id: initialData.id,
                        uploaded_by: user?.email || "Admin",
                        featured_on_hero: false
                      }));

                      if (inserts.length > 0) {
                        const { success, message } = await executeAdminMutation("gallery", "create", inserts[0]); // NOTE: This currently only creates one, a limitation of the unified mutation
                      }
                      alert(`Successfully synced ${imageFiles.length} photos to the Gallery!`);
                    } catch (err: any) {
                      alert("Sync failed: " + err.message);
                    } finally {
                      setLoading(false);
                    }
                  }}
                  className="px-6 py-3 bg-blue-500 text-white text-[9px] font-black uppercase tracking-widest rounded-xl hover:brightness-110 transition-all shadow-lg shadow-blue-500/20"
                >
                  Sync Photos to Gallery
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Gallery Folder ID</label>
              <input type="text" value={formData.gallery_folder_id || ''} readOnly className="w-full bg-white dark:bg-[#1a1a1a] p-5 rounded-2xl outline-none text-zinc-400 font-mono text-[10px]" placeholder="No folder selected" />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Highlights Count</label>
              <div className="flex items-center justify-between p-5 bg-white dark:bg-[#1a1a1a] rounded-2xl h-[62px]">
                <span className="text-xs font-bold dark:text-white">{formData.event_images.length} Images Picked</span>
                <button 
                  type="button" 
                  onClick={() => {
                    setPickingType('highlights');
                    setIsImagePickerOpen(true);
                  }} 
                  className="text-[10px] font-black uppercase tracking-widest text-blue-500 hover:underline"
                >
                  Add More
                </button>
              </div>
            </div>
          </div>

          {formData.event_images.length > 0 && (
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
              {formData.event_images.map((id, index) => (
                <div key={id} className="relative aspect-square rounded-lg overflow-hidden border border-black/5 dark:border-white/5 group">
                  <img src={getImageUrl(id, 100, 100)} className="w-full h-full object-cover" alt="Highlight" />
                  <button 
                    type="button" 
                    onClick={() => setFormData({...formData, event_images: formData.event_images.filter((_, i) => i !== index)})}
                    className="absolute inset-0 bg-red-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <IconTrash size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

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
        isOpen={isImagePickerOpen}
        onClose={() => setIsImagePickerOpen(false)}
        onSelect={(fileId, fileUrl, name) => {
          if (pickingType === 'cover') {
            setFormData({ ...formData, image: fileId });
          } else {
            if (!formData.event_images.includes(fileId)) {
              setFormData({ ...formData, event_images: [...formData.event_images, fileId] });
            }
          }
        }}
        title={pickingType === 'cover' ? "Select Cover Image" : "Select Event Highlights"}
      />

      <Admin_DrivePicker
        isOpen={isFolderPickerOpen}
        onClose={() => setIsFolderPickerOpen(false)}
        onSelect={(fileId, fileUrl, name) => {
          setFormData({ ...formData, gallery_folder_id: fileId });
        }}
        title="Select Event Gallery Folder"
        allowFolderSelection={true}
      />
    </form>
  );
};
