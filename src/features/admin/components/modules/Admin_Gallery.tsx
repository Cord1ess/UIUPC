"use client";

import React, { useState, useMemo, useEffect } from "react";
import { 
  FaPlus, 
  FaSearch, 
  FaChevronLeft, 
  FaChevronRight, 
  FaImage,
  FaExternalLinkAlt,
  FaEdit,
  FaTrash,
  FaCameraRetro
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { Admin_Dropdown } from "@/features/admin/components";
import Admin_GalleryModal from "./Admin_GalleryModal";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { supabase } from "@/lib/supabase";

export const Admin_Gallery: React.FC = () => {
  const { user, adminProfile } = useSupabaseAuth();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState("");
  const [editingPhoto, setEditingPhoto] = useState<any>(null);
  const [filterEvent, setFilterEvent] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const pageSize = 12;

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

  const getEventName = (eventId: string) => EVENT_MAP[eventId] || "General Gallery";

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

  const handleInputChange = (field: string, value: string) => {
    setUploadForm((prev) => ({ ...prev, [field]: value }));
    if (field === "imageUrl") setImagePreview(value);
  };

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
      console.error("Upload failed:", err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (photo: any) => {
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
  };

  const handlePhotoDelete = async (photoId: string) => {
    if (!window.confirm("Delete asset?")) return;
    try {
      const { error } = await supabase.from("gallery").delete().eq('id', photoId);
      if (error) throw error;
      refetch();
    } catch (err: any) {
      console.error("Delete failed:", err.message);
    }
  };

  const resetForm = () => {
    setUploadForm({ title: "", description: "", eventId: "", facebookPost: "", imageUrl: "" });
    setImagePreview("");
    setEditingPhoto(null);
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
              placeholder="Search by title or description..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full py-5 pl-14 pr-8 bg-zinc-50 dark:bg-zinc-900/50 border border-transparent focus:border-uiupc-orange/30 rounded-2xl text-sm outline-none transition-all placeholder:text-zinc-400 font-medium" 
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex flex-col gap-1.5">
              <span className="text-[8px] font-black uppercase tracking-widest text-zinc-400 pl-4">Exhibition</span>
              <Admin_Dropdown 
                value={filterEvent} 
                onChange={setFilterEvent}
                options={[{ value: 'all', label: 'All Categories' }, ...Object.entries(EVENT_MAP).map(([id, name]) => ({ value: id, label: name }))]}
                className="min-w-[200px]"
              />
            </div>
            <button 
              onClick={() => { resetForm(); setShowUploadModal(true); }} 
              className="px-8 h-14 mt-auto flex items-center gap-3 bg-uiupc-orange text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-uiupc-orange/20 hover:brightness-110 transition-all"
            >
              <FaPlus /> Upload Asset
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
                <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 whitespace-nowrap">Media Asset</th>
                <th className="px-6 py-6 text-left text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 whitespace-nowrap">Exhibition Category</th>
                <th className="px-6 py-6 text-left text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 whitespace-nowrap">Uploader</th>
                <th className="px-6 py-6 text-left text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 whitespace-nowrap">Date Added</th>
                <th className="px-8 py-6 text-right text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5">
              {isLoading ? (
                [...Array(6)].map((_, i) => <tr key={i} className="animate-pulse"><td colSpan={5} className="px-8 py-8"><div className="h-8 bg-zinc-50 dark:bg-zinc-900 rounded-xl" /></td></tr>)
              ) : (
                (photos || []).filter(p => (p.title || "").toLowerCase().includes(searchTerm.toLowerCase())).map((item) => (
                  <motion.tr key={item.id} className="group hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition-all">
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-800 overflow-hidden shrink-0 border border-black/5 dark:border-white/5 group-hover:scale-105 transition-transform shadow-inner">
                          {item.image_url ? <img src={item.image_url} alt="" className="w-full h-full object-cover" /> : <FaImage className="text-zinc-300 mx-auto mt-4" />}
                        </div>
                        <div className="flex flex-col min-w-[200px]">
                          <span className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-tight truncate">{item.title}</span>
                          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest truncate">{item.description?.slice(0, 30) || "No description"}...</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6 whitespace-nowrap">
                       <span className="px-4 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800/50 text-zinc-500 dark:text-zinc-400 text-[9px] font-black uppercase tracking-widest border border-black/5 dark:border-white/5 flex items-center gap-2 w-fit">
                         <FaCameraRetro className="text-uiupc-orange text-[10px]" /> {getEventName(item.event_id)}
                       </span>
                    </td>
                    <td className="px-6 py-6 whitespace-nowrap">
                       <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{item.uploaded_by?.split('@')[0] || "Admin"}</span>
                    </td>
                    <td className="px-6 py-6 whitespace-nowrap">
                       <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{new Date(item.created_at).toLocaleDateString()}</span>
                    </td>
                    <td className="px-8 py-6 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleEdit(item)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:bg-uiupc-orange hover:text-white transition-all"><FaEdit className="text-xs" /></button>
                        {item.image_url && (
                          <a href={item.image_url} target="_blank" rel="noreferrer" className="w-10 h-10 flex items-center justify-center rounded-xl bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white transition-all"><FaExternalLinkAlt className="text-xs" /></a>
                        )}
                        <button onClick={() => handlePhotoDelete(item.id)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400 hover:bg-red-500 hover:text-white transition-all"><FaTrash className="text-xs" /></button>
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
          <div className="flex flex-col"><p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Media Tracker</p><p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Page {page + 1} of {totalPages} | Total {count} Assets</p></div>
          <div className="flex items-center gap-3">
            <button disabled={page === 0} onClick={() => { setPage(p => Math.max(0, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="w-14 h-14 flex items-center justify-center rounded-2xl bg-white dark:bg-[#080808] border border-black/5 dark:border-white/5 text-zinc-400 disabled:opacity-20 hover:border-uiupc-orange hover:text-uiupc-orange shadow-sm transition-all"><FaChevronLeft className="text-xs" /></button>
            <button disabled={page >= totalPages - 1} onClick={() => { setPage(p => p + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="w-14 h-14 flex items-center justify-center rounded-2xl bg-white dark:bg-[#080808] border border-black/5 dark:border-white/5 text-zinc-400 disabled:opacity-20 hover:border-uiupc-orange hover:text-uiupc-orange shadow-sm transition-all"><FaChevronRight className="text-xs" /></button>
          </div>
        </div>
      )}

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
    </div>
  );
};

export default Admin_Gallery;
