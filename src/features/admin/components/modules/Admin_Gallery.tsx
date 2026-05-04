"use client";

import React, { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { 
  IconPlus, IconSearch, IconChevronLeft, IconChevronRight, IconImage,
  IconExternalLink, IconTrash, IconCameraRetro, IconStar, IconRegStar, IconEdit, IconCheck,
  IconArchive, IconClose, IconColumns, IconSun, IconAdjust, IconThermometerHalf, IconEyeDropper,
  IconFire, IconTint, IconMagic, IconUndo, IconCheckCircle, IconFile, IconCalendarAlt,
  IconCamera, IconMicrochip, IconCrosshairs, IconBullseye, IconFingerprint, IconUserEdit,
  IconCopyright, IconTag, IconArrowUp, IconArrowDown, IconWallet, IconFileInvoiceDollar,
  IconReceipt, IconSync, IconMoneyBillWave, IconChartPie, IconLock, IconShieldAlt,
  IconUserShield, IconKey
} from "@/components/shared/Icons";
import { motion, AnimatePresence } from "motion/react";
import { 
  Admin_Dropdown, Admin_ErrorBoundary, Admin_DeleteConfirmModal, Admin_ModuleHeader, Admin_StatCard 
} from "@/features/admin/components";
import Admin_GalleryModal from "./Admin_GalleryModal";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { supabase } from "@/lib/supabase";
import { getImageUrl } from "@/utils/imageUrl";
import { initAdminPassword } from "@/features/admin/actions";

const GalleryRow = React.memo(({ 
  item, onEdit, onToggleHero, onDelete 
}: { 
  item: any; onEdit: (item: any) => void; onToggleHero: (item: any) => void; onDelete: (item: any) => void 
}) => {
  const EVENT_MAP: Record<string, string> = {
    "1": "Friday Exposure",
    "2": "Photo Adda",
    "3": "Photo Walk",
    "4": "Exhibitions Visit",
    "5": "Workshops & Talks",
    "6": "Shutter Stories"
  };
  const getEventName = (eventId: string) => EVENT_MAP[eventId] || "General";

  return (
    <motion.tr className="group hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition-all border-b border-zinc-100 dark:border-zinc-800/50">
      <td className="px-8 py-6 whitespace-nowrap">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-800 overflow-hidden shrink-0 border border-zinc-200 dark:border-zinc-800 group-hover:scale-105 transition-transform shadow-inner flex items-center justify-center">
            {item.image_url ? (
              <img src={getImageUrl(item.image_url, 150, 150)} alt="" className="w-full h-full object-cover" />
            ) : (
              <IconImage size={24} className="text-zinc-300" />
            )}
          </div>
          <div className="flex flex-col min-w-[200px]">
            <span className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-tight truncate">{item.title}</span>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest truncate">{item.description?.slice(0, 30) || "No description"}...</span>
          </div>
        </div>
      </td>
      <td className="px-6 py-6 whitespace-nowrap hidden sm:table-cell">
         <span className="px-4 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800/50 text-zinc-500 dark:text-zinc-400 text-[9px] font-black uppercase tracking-widest border border-zinc-200 dark:border-zinc-800/50 flex items-center gap-2 w-fit">
           <IconCameraRetro size={10} className="text-uiupc-orange" /> {getEventName(item.event_id)}
         </span>
      </td>
      <td className="px-6 py-6 whitespace-nowrap hidden md:table-cell">
         <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{item.uploaded_by?.split('@')[0] || "Admin"}</span>
      </td>
       <td className="px-6 py-6 whitespace-nowrap">
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
      <td className="px-6 py-6 whitespace-nowrap hidden lg:table-cell">
         <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{new Date(item.created_at).toLocaleDateString()}</span>
      </td>
      <td className="px-8 py-6 text-right whitespace-nowrap">
        <div className="flex items-center justify-end gap-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
          <button onClick={() => onEdit(item)} title="Edit" className="w-10 h-10 flex items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:bg-uiupc-orange hover:text-white transition-all"><IconEdit size={12} /></button>
          {item.image_url && (
            <a href={item.image_url} target="_blank" rel="noreferrer" title="Open Image" className="w-10 h-10 flex items-center justify-center rounded-xl bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white transition-all"><IconExternalLink size={12} /></a>
          )}
          <button onClick={() => onDelete(item)} title="Delete" className="w-10 h-10 flex items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400 hover:bg-red-500 hover:text-white transition-all"><IconTrash size={12} /></button>
        </div>
      </td>
    </motion.tr>
  );
});
GalleryRow.displayName = 'GalleryRow';

export const Admin_Gallery: React.FC = () => {
  const { user } = useSupabaseAuth();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState("");
  const [editingPhoto, setEditingPhoto] = useState<any>(null);
  const [filterEvent, setFilterEvent] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set());
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const pageSize = 12;

  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [uploadForm, setUploadForm] = useState({
    title: "",
    description: "",
    eventId: "",
    facebookPost: "",
    imageUrl: "",
  });

  const EVENT_MAP: Record<string, string> = {
    "1": "Friday Exposure",
    "2": "Photo Adda",
    "3": "Photo Walk",
    "4": "Exhibitions Visit",
    "5": "Workshops & Talks",
    "6": "Shutter Stories"
  };

  useEffect(() => { initAdminPassword(); }, []);

  const filters = useMemo(() => {
    const f: Record<string, any> = {};
    if (filterEvent !== "all") f.event_id = filterEvent;
    return f;
  }, [filterEvent]);

  const { data: photos, count, isLoading, refetch } = useSupabaseData("gallery", {
    page,
    pageSize,
    filters,
    orderBy: 'created_at',
    orderDesc: true,
  });

  const handleInputChange = useCallback((field: string, value: string) => {
    setUploadForm((prev) => ({ ...prev, [field]: value }));
    if (field === "imageUrl") setImagePreview(value);
  }, []);

  const handleAdmin_Gallery = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setUploading(true);
      const submissionData = {
        title: uploadForm.title,
        description: uploadForm.description,
        event_id: uploadForm.eventId,
        facebook_post: uploadForm.facebookPost,
        image_url: uploadForm.imageUrl,
        uploaded_by: user?.email,
      };

      const { error } = editingPhoto?.id 
        ? await supabase.from("gallery").update(submissionData).eq('id', editingPhoto.id)
        : await supabase.from("gallery").insert([submissionData]);

      if (error) throw error;
      setShowUploadModal(false);
      resetForm();
      refetch();
    } catch (err: any) {
      alert("Save failed: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = useCallback((photo: any) => {
    setEditingPhoto(photo);
    setUploadForm({
      title: photo.title || "",
      description: photo.description || "",
      eventId: photo.event_id || "",
      facebookPost: photo.facebook_post || "",
      imageUrl: photo.image_url || "",
    });
    setImagePreview(photo.image_url || "");
    setShowUploadModal(true);
  }, []);

  const handleToggleHero = useCallback(async (item: any) => {
    try {
      const { error } = await supabase
        .from("gallery")
        .update({ featured_on_hero: !item.featured_on_hero })
        .eq('id', item.id);
      if (error) throw error;
      refetch();
    } catch (err: any) {
      alert("Toggle failed: " + err.message);
    }
  }, [refetch]);

  const resetForm = useCallback(() => {
    setUploadForm({ title: "", description: "", eventId: "", facebookPost: "", imageUrl: "" });
    setImagePreview("");
    setEditingPhoto(null);
  }, []);

  const refreshData = useCallback(() => {
    setHiddenIds(new Set());
    refetch();
  }, [refetch]);

  const visibleData = useMemo(() => {
    const rawData = (photos || []).filter(p => !hiddenIds.has(p.id));
    if (!searchTerm) return rawData;
    return rawData.filter(p => 
      (p.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.description || "").toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [photos, hiddenIds, searchTerm]);

  const totalPages = Math.ceil((count || 0) / pageSize);

  return (
    <div className="w-full space-y-8 min-w-0 relative z-10 isolate">
      <Admin_ModuleHeader 
        title="Gallery"
        description="Curate public gallery and manage featured photos."
      >
        <Admin_StatCard label="Total Photos" value={count} icon={<IconImage size={20} />} />
        
        <div className="p-6 bg-white dark:bg-[#0d0d0d] border border-zinc-200 dark:border-zinc-800 rounded-2xl flex flex-col justify-between shadow-sm min-h-[140px] group">
          <p className="text-zinc-400 text-[10px] font-black uppercase tracking-widest">Category</p>
          <div className="flex items-end justify-between mt-auto">
            <div className="text-uiupc-orange text-4xl opacity-20 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500">
              <IconCameraRetro size={40} />
            </div>
            <div className="flex-1 ml-6 max-w-[200px]">
              <Admin_Dropdown 
                variant="minimal"
                label="Event Source"
                value={filterEvent} 
                onChange={setFilterEvent}
                options={[{ value: 'all', label: 'All Categories' }, ...Object.entries(EVENT_MAP).map(([id, name]) => ({ value: id, label: name }))]}
                className="w-full"
              />
            </div>
          </div>
        </div>

        <Admin_StatCard label="Featured" value={photos?.filter(p => p.featured_on_hero).length || 0} icon={<IconStar size={20} />} />
        <Admin_StatCard label="Review Status" value="Online" icon={<IconCheck size={20} />} color="text-green-500" />
      </Admin_ModuleHeader>

      {/* ── FILTER BAR ─────────────────────────────────────────── */}
      <div className="w-full bg-white dark:bg-[#0d0d0d] p-3 sm:p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm relative z-10">
        <div className="flex flex-col lg:flex-row gap-6 items-stretch lg:items-center justify-between">
          <div className="relative flex-1 group min-w-[200px]">
            <IconSearch size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-uiupc-orange transition-colors" />
            <input 
              type="text" 
              placeholder="Search gallery..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full py-4 pl-14 pr-8 bg-zinc-100 dark:bg-[#1a1a1a] border border-transparent focus:border-uiupc-orange/30 rounded-xl text-sm outline-none transition-all placeholder:text-zinc-400 font-medium" 
            />
          </div>
          <button 
            onClick={() => { resetForm(); setShowUploadModal(true); }} 
            className="px-8 h-12 flex items-center gap-3 bg-uiupc-orange text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-uiupc-orange/20 hover:brightness-110 transition-all"
          >
            <IconPlus size={14} /> Save to Gallery
          </button>
        </div>
      </div>

      {/* ── DATA TABLE ─────────────────────────────────────────── */}
      <div className="bg-white dark:bg-[#0d0d0d] rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm relative z-10">
        <div className="overflow-x-auto min-h-[500px]">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-zinc-50 dark:bg-zinc-900/50">
                <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 whitespace-nowrap">Photo Info</th>
                <th className="px-6 py-6 text-left text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 whitespace-nowrap hidden sm:table-cell">Event Source</th>
                <th className="px-6 py-6 text-left text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 whitespace-nowrap hidden md:table-cell">Added By</th>
                <th className="px-6 py-6 text-left text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 whitespace-nowrap">Hero Status</th>
                <th className="px-6 py-6 text-left text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 whitespace-nowrap hidden lg:table-cell">Date Added</th>
                <th className="px-8 py-6 text-right text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5">
              {isLoading ? (
                [...Array(6)].map((_, i) => <tr key={i} className="animate-pulse"><td colSpan={6} className="px-8 py-8"><div className="h-8 bg-zinc-50 dark:bg-zinc-900 rounded-xl" /></td></tr>)
              ) : (
                visibleData.map((item) => (
                  <GalleryRow 
                    key={item.id} 
                    item={item} 
                    onEdit={handleEdit}
                    onToggleHero={handleToggleHero}
                    onDelete={setDeleteTarget}
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
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Gallery Overview</p>
            <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Page {page + 1} of {totalPages} <span className="hidden sm:inline">| Total {count} Photos</span></p>
          </div>
          <div className="flex items-center gap-3">
            <button disabled={page === 0} onClick={() => { setPage(p => Math.max(0, p - 1)); }} className="w-14 h-12 flex items-center justify-center rounded-xl bg-white dark:bg-[#080808] border border-black/5 dark:border-white/5 text-zinc-400 disabled:opacity-20 hover:border-uiupc-orange hover:text-uiupc-orange shadow-sm transition-all"><IconChevronLeft size={12} /></button>
            <button disabled={page >= totalPages - 1} onClick={() => { setPage(p => p + 1); }} className="w-14 h-12 flex items-center justify-center rounded-xl bg-white dark:bg-[#080808] border border-black/5 dark:border-white/5 text-zinc-400 disabled:opacity-20 hover:border-uiupc-orange hover:text-uiupc-orange shadow-sm transition-all"><IconChevronRight size={12} /></button>
          </div>
        </div>
      )}

      {/* ── MODALS ─────────────────────────────────────────────── */}
      <Admin_ErrorBoundary>
        <AnimatePresence>
          {showUploadModal && (
            <Admin_GalleryModal
              uploadForm={uploadForm}
              editingPhoto={editingPhoto}
              uploading={uploading}
              imagePreview={imagePreview}
              onClose={() => { setShowUploadModal(false); resetForm(); }}
              onSubmit={handleAdmin_Gallery}
              onInputChange={handleInputChange}
            />
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

export default Admin_Gallery;
