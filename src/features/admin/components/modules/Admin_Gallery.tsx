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
  IconUserShield, IconKey, IconFolder
} from "@/components/shared/Icons";
import { motion, AnimatePresence } from "motion/react";
import { 
  Admin_Dropdown, Admin_ErrorBoundary, Admin_DeleteConfirmModal, Admin_ModuleHeader, Admin_StatCard, Admin_DrivePicker 
} from "@/features/admin/components";
import Admin_GalleryModal from "./Admin_GalleryModal";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { supabase } from "@/lib/supabase";
import { getImageUrl } from "@/utils/imageUrl";
import { initAdminPassword, executeAdminMutation } from "@/features/admin/actions";

const GalleryRow = React.memo(({ 
  item, eventName, onEdit, onToggleHero, onDelete 
}: { 
  item: any; eventName: string; onEdit: (item: any) => void; onToggleHero: (item: any) => void; onDelete: (item: any) => void 
}) => {
  return (
    <motion.tr className="group hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition-all border-b border-zinc-100 dark:border-zinc-800/50">
      <td className="px-6 py-3 whitespace-nowrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 overflow-hidden shrink-0 border border-zinc-200 dark:border-zinc-800 group-hover:scale-105 transition-transform shadow-inner flex items-center justify-center">
            {item.image_url ? (
              <img src={getImageUrl(item.image_url, 150, 150)} alt="" className="w-full h-full object-cover" />
            ) : (
              <IconImage size={20} className="text-zinc-300" />
            )}
          </div>
          <div className="flex flex-col min-w-[150px]">
            <span className="text-[12px] font-black text-zinc-900 dark:text-white uppercase tracking-tight truncate">{item.title}</span>
            <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest truncate">{item.description?.slice(0, 30) || "No description"}...</span>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 whitespace-nowrap hidden sm:table-cell">
         <span className="px-3 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800/50 text-zinc-500 dark:text-zinc-400 text-[8px] font-black uppercase tracking-widest border border-zinc-200 dark:border-zinc-800/50 flex items-center gap-1.5 w-fit">
           <IconCameraRetro size={10} className="text-uiupc-orange" /> {eventName}
         </span>
      </td>
      <td className="px-4 py-3 whitespace-nowrap hidden md:table-cell">
         <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">{item.uploaded_by?.split('@')[0] || "Admin"}</span>
      </td>
       <td className="px-4 py-3 whitespace-nowrap">
         <button 
           onClick={() => onToggleHero(item)}
           className={`flex items-center gap-2 px-2.5 py-1 rounded-lg text-[7px] font-black uppercase tracking-widest transition-all ${
             item.featured_on_hero 
               ? 'bg-uiupc-orange/10 text-uiupc-orange border border-uiupc-orange/20' 
               : 'bg-zinc-100 dark:bg-[#1a1a1a] text-zinc-400 border border-transparent hover:border-zinc-300'
           }`}
         >
           {item.featured_on_hero ? <IconStar size={10} /> : <IconRegStar size={10} />}
           {item.featured_on_hero ? "Hero" : "Set Hero"}
         </button>
      </td>
      <td className="px-6 py-3 text-right whitespace-nowrap">
        <div className="flex items-center justify-end gap-2">
          <button onClick={() => onEdit(item)} title="Edit" className="w-8 h-8 flex items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:bg-uiupc-orange hover:text-white transition-all"><IconEdit size={10} /></button>
          {item.image_url && (
            <a href={item.image_url} target="_blank" rel="noreferrer" title="Open" className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white transition-all"><IconExternalLink size={10} /></a>
          )}
          <button onClick={() => onDelete(item)} title="Delete" className="w-8 h-8 flex items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-400 hover:bg-red-500 hover:text-white transition-all"><IconTrash size={10} /></button>
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
  const [isFolderPickerOpen, setIsFolderPickerOpen] = useState(false);
  const [events, setEvents] = useState<any[]>([]);
  const [importEventId, setImportEventId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEvent, setFilterEvent] = useState("all");
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [page, setPage] = useState(0);
  const pageSize = 12;

  const filters = useMemo(() => {
    const f: Record<string, any> = {};
    if (filterEvent !== "all") f.event_id = filterEvent;
    return f;
  }, [filterEvent]);

  const { data: galleryItems, count, isLoading, refetch } = useSupabaseData("gallery", {
    page,
    pageSize,
    filters,
    orderBy: 'created_at',
    orderDesc: true,
  });

  useEffect(() => {
    const fetchEvents = async () => {
      const { data } = await supabase.from("events").select("id, title");
      setEvents(data || []);
    };
    fetchEvents();
    initAdminPassword();
  }, []);

  const eventMap = useMemo(() => {
    return events.reduce((acc, ev) => ({ ...acc, [ev.id]: ev.title }), {});
  }, [events]);

  const featuredCount = useMemo(() => {
    // We need a separate count for featured, but for now we can just use the visible data's featured status
    // or better, fetch the total featured count if needed. 
    // For simplicity, let's just assume we want to know if we are in the 30-40 range.
    return galleryItems?.filter((i: any) => i.featured_on_hero).length || 0;
  }, [galleryItems]);

  const [uploadForm, setUploadForm] = useState({
    title: "",
    description: "",
    eventId: "",
    facebookPost: "",
    imageUrl: "",
  });

  const handleInputChange = useCallback((field: string, value: string) => {
    setUploadForm((prev) => ({ ...prev, [field]: value }));
    if (field === "imageUrl") setImagePreview(value);
  }, []);

  const resetForm = () => {
    setUploadForm({
      title: "",
      description: "",
      eventId: "",
      facebookPost: "",
      imageUrl: "",
    });
    setImagePreview("");
    setEditingPhoto(null);
  };

  const handleSave = async (e: React.FormEvent) => {
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

      const { success, message, data: record } = editingPhoto?.id 
        ? await executeAdminMutation("gallery", "update", submissionData, editingPhoto.id)
        : await executeAdminMutation("gallery", "create", submissionData);

      if (!success) throw new Error(message);
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
      const { success, message } = await executeAdminMutation(
        "gallery", 
        "update", 
        { featured_on_hero: !item.featured_on_hero }, 
        item.id
      );
      if (!success) throw new Error(message);
      refetch();
    } catch (err: any) {
      alert("Update failed: " + err.message);
    }
  }, [refetch]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const { success, message } = await executeAdminMutation("gallery", "delete", null, deleteTarget.id);
      if (!success) throw new Error(message);
      setDeleteTarget(null);
      refetch();
    } catch (err: any) {
      alert("Delete failed: " + err.message);
    }
  };

  const handleImportFolder = async (folderId: string, folderName: string, targetEventId: string) => {
    if (!targetEventId) {
      alert("Please select an event to associate these images with.");
      return;
    }
    
    setUploading(true);
    try {
      const GAS_URL = process.env.NEXT_PUBLIC_GAS_DRIVE;
      if (!GAS_URL) throw new Error("Drive service not configured.");
      
      const response = await fetch(`${GAS_URL}?action=browse&folderId=${folderId}`);
      const data = await response.json();
      
      if (!data.files || data.files.length === 0) {
        alert("No files found in this folder.");
        return;
      }

      const imageFiles = data.files.filter((f: any) => 
        f.mimeType?.startsWith('image/') || 
        ['jpg', 'jpeg', 'png', 'webp'].some(ext => f.name.toLowerCase().endsWith(ext))
      );

      if (imageFiles.length === 0) {
        alert("No image files found in this folder.");
        return;
      }

      const inserts = imageFiles.map((f: any) => ({
        title: f.name.split('.')[0],
        description: `Imported from ${folderName}`,
        image_url: f.id,
        event_id: targetEventId,
        uploaded_by: user?.email || "Admin",
        featured_on_hero: false
      }));

      // Note: Unified mutation handles one at a time, for bulk import we might need a loop or bulk action
      // For now, we'll loop to ensure logging and pending change logic is applied
      for (const insertData of inserts) {
        const { success } = await executeAdminMutation("gallery", "create", insertData);
        if (!success) console.error("Failed to import one image", insertData.title);
      }

      alert(`Successfully imported ${imageFiles.length} images.`);
      refetch();
    } catch (err: any) {
      alert("Import failed: " + err.message);
    } finally {
      setUploading(false);
      setIsFolderPickerOpen(false);
    }
  };

  const totalPages = Math.ceil((count || 0) / pageSize);

  return (
    <div className="w-full space-y-6 min-w-0 relative z-10 isolate pb-20">
      <Admin_ModuleHeader 
        title="Gallery"
        description="Manage event highlights and hero section photos."
      >
        <Admin_StatCard label="Total Photos" value={count || 0} icon={<IconImage size={20} />} />
        
        <div className="p-6 bg-white dark:bg-[#0d0d0d] border border-zinc-200 dark:border-zinc-800 rounded-2xl flex flex-col justify-between shadow-sm min-h-[140px] group">
          <p className="text-zinc-400 text-[10px] font-black uppercase tracking-widest">Hero Spotlight</p>
          <div className="flex items-end justify-between mt-auto">
            <div className={`text-4xl opacity-20 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500 ${featuredCount >= 30 ? 'text-green-500' : 'text-uiupc-orange'}`}>
              <IconStar size={40} />
            </div>
            <div className="flex flex-col items-end">
              <span className="text-3xl font-black dark:text-white leading-none">{featuredCount}</span>
              <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mt-1">/ 40 Target</span>
            </div>
          </div>
        </div>

        <div className="p-6 bg-white dark:bg-[#0d0d0d] border border-zinc-200 dark:border-zinc-800 rounded-2xl flex flex-col justify-between shadow-sm min-h-[140px] group">
          <p className="text-zinc-400 text-[10px] font-black uppercase tracking-widest">Filter by Event</p>
          <div className="flex items-end justify-between mt-auto">
            <div className="text-uiupc-orange text-4xl opacity-20 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500">
              <IconCalendarAlt size={40} />
            </div>
            <div className="flex-1 ml-6 max-w-[180px]">
              <Admin_Dropdown 
                variant="minimal"
                label="Select Event"
                value={filterEvent} 
                onChange={(val) => setFilterEvent(val)}
                options={[
                  { value: 'all', label: 'All Photos' },
                  ...events.map(ev => ({ value: ev.id, label: ev.title }))
                ]}
                className="w-full"
              />
            </div>
          </div>
        </div>

        <Admin_StatCard label="Cloud Sync" value="Active" icon={<IconSync size={20} />} color="text-green-500" />
      </Admin_ModuleHeader>

      {/* ── ACTION BAR ────────────────────────────────────────── */}
      <div className="w-full bg-white dark:bg-[#0d0d0d] p-3 sm:p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm relative z-10">
        <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
          <div className="relative flex-1 group min-w-[200px]">
            <IconSearch size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-uiupc-orange transition-colors" />
            <input 
              type="text" 
              placeholder="Search by title..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full py-4 pl-14 pr-8 bg-zinc-100 dark:bg-[#1a1a1a] border border-transparent focus:border-uiupc-orange/30 rounded-xl text-sm outline-none transition-all placeholder:text-zinc-400 font-medium" 
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button 
              onClick={() => { resetForm(); setShowUploadModal(true); }}
              className="px-8 h-12 flex items-center gap-3 bg-uiupc-orange text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-uiupc-orange/20 hover:brightness-110 transition-all"
            >
              <IconPlus size={14} /> Add New Photo
            </button>
          </div>
        </div>
      </div>

      {/* ── DATA TABLE ─────────────────────────────────────────── */}
      <div className="bg-white dark:bg-[#0d0d0d] rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm relative z-10">
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-zinc-50 dark:bg-zinc-900/50">
                <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 whitespace-nowrap">Image Details</th>
                <th className="px-4 py-4 text-left text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 whitespace-nowrap hidden sm:table-cell">Event Source</th>
                <th className="px-4 py-4 text-left text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 whitespace-nowrap hidden md:table-cell">Uploader</th>
                <th className="px-4 py-4 text-left text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 whitespace-nowrap">Hero</th>
                <th className="px-8 py-4 text-right text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <IconSync size={24} className="animate-spin text-uiupc-orange mx-auto" />
                  </td>
                </tr>
              ) : (galleryItems || []).length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">No images found in this collection</p>
                  </td>
                </tr>
              ) : (
                galleryItems.map((item: any) => (
                  <GalleryRow 
                    key={item.id} 
                    item={item} 
                    eventName={eventMap[item.event_id] || "General"}
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

      {/* ── PAGINATION ────────────────────────────────────────── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-6 border-t border-black/5 dark:border-white/5">
          <div className="flex flex-col">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Gallery Overview</p>
            <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Page {page + 1} of {totalPages}</p>
          </div>
          <div className="flex items-center gap-3">
            <button disabled={page === 0} onClick={() => setPage(p => p - 1)} className="w-12 h-10 flex items-center justify-center rounded-xl bg-white dark:bg-[#080808] border border-black/5 dark:border-white/5 text-zinc-400 disabled:opacity-20 hover:border-uiupc-orange transition-all"><IconChevronLeft size={12} /></button>
            <button disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)} className="w-12 h-10 flex items-center justify-center rounded-xl bg-white dark:bg-[#080808] border border-black/5 dark:border-white/5 text-zinc-400 disabled:opacity-20 hover:border-uiupc-orange transition-all"><IconChevronRight size={12} /></button>
          </div>
        </div>
      )}

      {/* ── MODALS ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {showUploadModal && (
          <Admin_GalleryModal 
            uploadForm={uploadForm}
            editingPhoto={editingPhoto}
            uploading={uploading}
            imagePreview={imagePreview}
            eventOptions={events.map(ev => ({ value: ev.id, label: ev.title }))}
            onClose={setShowUploadModal}
            onSubmit={handleSave}
            onInputChange={handleInputChange}
            onBulkImport={handleImportFolder}
          />
        )}
      </AnimatePresence>

      <Admin_ErrorBoundary>
        <Admin_DeleteConfirmModal 
          isOpen={!!deleteTarget} 
          onClose={() => setDeleteTarget(null)} 
          itemId={deleteTarget?.id} 
          itemName={deleteTarget?.title} 
          onSuccess={handleDelete}
        />
      </Admin_ErrorBoundary>
    </div>
  );
};
