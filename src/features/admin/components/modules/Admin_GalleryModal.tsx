"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaSync, FaUpload, FaCamera, FaLink, FaFacebook } from "react-icons/fa";
import { Admin_DrivePicker } from "@/features/admin/components";
import { getImageUrl } from "@/utils/imageUrl";

interface UploadForm {
  title: string;
  description: string;
  eventId: string;
  facebookPost: string;
  imageUrl: string;
}

interface Admin_GalleryModalProps {
  uploadForm: UploadForm;
  editingPhoto: any;
  uploading: boolean;
  imagePreview: string;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onInputChange: (field: string, value: string) => void;
}

const Admin_GalleryModal: React.FC<Admin_GalleryModalProps> = ({
  uploadForm,
  editingPhoto,
  uploading,
  imagePreview,
  onClose,
  onSubmit,
  onInputChange,
}) => {
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const EVENT_OPTIONS = [
    { value: "1", label: "Friday Exposure" },
    { value: "2", label: "Photo Adda" },
    { value: "3", label: "Photo Walk" },
    { value: "4", label: "Exhibitions Visit" },
    { value: "5", label: "Workshops & Talks" },
    { value: "6", label: "Shutter Stories" }
  ];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-2xl z-[100] flex items-center justify-center p-4 md:p-10">
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0"
        onClick={onClose}
      />
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 40 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 40 }}
        className="relative w-full max-w-4xl bg-white dark:bg-[#0a0a0a] rounded-[3rem] border border-black/10 dark:border-white/10 shadow-3xl flex flex-col md:flex-row overflow-hidden max-h-[90vh]"
      >
        {/* Left Side: Preview (Desktop) */}
        <div className="hidden md:flex md:w-2/5 bg-zinc-50 dark:bg-zinc-900/50 border-r border-black/5 dark:border-white/5 items-center justify-center p-10 overflow-hidden relative">
          <AnimatePresence mode="wait">
            {imagePreview ? (
              <motion.div 
                key={imagePreview}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="w-full h-full relative flex items-center justify-center"
              >
                <img 
                  src={getImageUrl(imagePreview, 800, 80)} 
                  alt="Preview" 
                  className="w-full h-full object-cover rounded-[2rem] shadow-2xl"
                  onError={(e) => (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=800'}
                />
              </motion.div>
            ) : (
              <div className="flex flex-col items-center gap-4 text-zinc-300 dark:text-zinc-700">
                <FaCamera className="text-6xl" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em]">Image Preview</span>
              </div>
            )}
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
        </div>

        {/* Right Side: Form */}
        <div className="flex-1 p-8 md:p-14 overflow-y-auto custom-scrollbar">
          <div className="mb-12">
            <span className="text-uiupc-orange text-[10px] font-black uppercase tracking-[0.4em] mb-4 block">Gallery Photo</span>
            <h3 className="text-4xl font-black uppercase tracking-tighter dark:text-white">
              {editingPhoto ? "Edit Photo" : "New Photo"}
            </h3>
          </div>

          <form onSubmit={onSubmit} className="space-y-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Title</label>
              <input 
                type="text" required value={uploadForm.title}
                onChange={(e) => onInputChange("title", e.target.value)}
                className="w-full bg-transparent border-b-2 border-black/5 dark:border-white/5 py-4 outline-none focus:border-uiupc-orange dark:text-white text-2xl font-black transition-all"
                placeholder="Photo title..."
              />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Description</label>
              <textarea 
                value={uploadForm.description}
                onChange={(e) => onInputChange("description", e.target.value)}
                className="w-full bg-transparent border-b-2 border-black/5 dark:border-white/5 py-4 outline-none focus:border-uiupc-orange dark:text-white font-bold h-24 resize-none transition-all"
                placeholder="Add a description (optional)..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-3">
                 <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Event</label>
                 <select 
                    required value={uploadForm.eventId}
                    onChange={(e) => onInputChange("eventId", e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-900/50 border border-black/5 dark:border-white/5 p-4 rounded-2xl outline-none focus:border-uiupc-orange dark:text-white font-bold transition-all"
                 >
                   <option value="">Select Event</option>
                   {EVENT_OPTIONS.map(opt => (
                     <option key={opt.value} value={opt.value}>{opt.label}</option>
                   ))}
                 </select>
               </div>
               <div className="space-y-3">
                 <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Facebook Post</label>
                 <div className="relative">
                   <FaFacebook className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500" />
                   <input 
                      type="url" value={uploadForm.facebookPost}
                      onChange={(e) => onInputChange("facebookPost", e.target.value)}
                      className="w-full bg-zinc-50 dark:bg-zinc-900/50 border border-black/5 dark:border-white/5 py-4 pl-12 pr-4 rounded-2xl outline-none focus:border-uiupc-orange dark:text-white font-bold transition-all text-sm"
                      placeholder="Post URL..."
                   />
                 </div>
               </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Image Source</label>
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <FaLink className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input 
                    type="text" required value={uploadForm.imageUrl}
                    onChange={(e) => onInputChange("imageUrl", e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-900/50 border border-black/5 dark:border-white/5 py-4 pl-12 pr-4 rounded-2xl outline-none focus:border-uiupc-orange dark:text-white font-bold transition-all text-sm"
                    placeholder="Drive ID or direct link..."
                  />
                </div>
                <button 
                  type="button" 
                  onClick={() => setIsPickerOpen(true)}
                  className="px-6 py-4 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-uiupc-orange hover:bg-uiupc-orange/10 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap"
                >
                  Browse Drive
                </button>
              </div>
              <p className="text-[9px] font-medium text-zinc-500 italic mt-2">Paste a Google Drive ID, direct URL, or browse from your Drive.</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-10 border-t border-black/5 dark:border-white/5">
              <button 
                type="button" onClick={onClose}
                className="flex-1 py-5 bg-zinc-100 dark:bg-zinc-900 text-zinc-500 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-all"
              >
                Cancel
              </button>
              <button 
                type="submit" disabled={uploading}
                className="flex-[2] py-5 bg-uiupc-orange text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-uiupc-orange/20 hover:translate-y-[-2px] active:translate-y-0 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {uploading ? <FaSync className="animate-spin" /> : <FaUpload />}
                {uploading ? 'Uploading...' : (editingPhoto ? 'Save Changes' : 'Upload Photo')}
              </button>
            </div>

            <Admin_DrivePicker
              isOpen={isPickerOpen}
              onClose={() => setIsPickerOpen(false)}
              onSelect={(fileId) => {
                onInputChange("imageUrl", fileId);
              }}
              title="Select Gallery Photo"
            />
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default Admin_GalleryModal;
