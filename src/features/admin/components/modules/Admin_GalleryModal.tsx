"use client";

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { IconClose, IconSync, IconUpload, IconCamera, IconLink, IconFacebook } from "@/components/shared/Icons";
import { Admin_DrivePicker, Admin_ModalPortal } from "@/features/admin/components";
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
  eventOptions: { value: string; label: string }[];
  onClose: (show: boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
  onInputChange: (field: string, value: string) => void;
  onBulkImport: (folderId: string, folderName: string, eventId: string) => void;
}

const Admin_GalleryModal: React.FC<Admin_GalleryModalProps> = ({
  uploadForm, editingPhoto, uploading, imagePreview, eventOptions, onClose, onSubmit, onInputChange, onBulkImport
}) => {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isBulkPickerOpen, setIsBulkPickerOpen] = useState(false);

  return (
    <Admin_ModalPortal>
      <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 md:p-10">
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/80 backdrop-blur-2xl"
          onClick={() => onClose(false)}
        />
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 40 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 40 }}
        className="relative w-full max-w-4xl bg-white dark:bg-[#0d0d0d] rounded-[3rem] border border-zinc-200 dark:border-zinc-800 shadow-3xl flex flex-col md:flex-row overflow-hidden max-h-[90vh]"
      >
        {/* Left Side: Preview (Desktop) */}
        <div className="hidden md:flex md:w-2/5 bg-zinc-50 dark:bg-[#0a0a0a] border-r border-zinc-200 dark:border-zinc-800 items-center justify-center p-10 overflow-hidden relative">
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
                  src={getImageUrl(imagePreview, 800, 800)} 
                  alt="Preview" 
                  className="w-full h-full object-cover rounded-[2rem] shadow-2xl"
                />
              </motion.div>
            ) : (
              <div className="flex flex-col items-center gap-4 text-zinc-300 dark:text-zinc-700">
                <IconCamera size={60} />
                <span className="text-[10px] font-black uppercase tracking-[0.4em]">Image Preview</span>
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Side: Form */}
        <div className="flex-1 p-8 md:p-14 overflow-y-auto custom-scrollbar bg-white dark:bg-[#0d0d0d]">
          <div className="mb-12 flex items-center justify-between">
            <div>
              <span className="text-uiupc-orange text-[10px] font-black uppercase tracking-[0.4em] mb-4 block">Gallery Collection</span>
              <h3 className="text-4xl font-black uppercase tracking-tighter dark:text-white leading-none">
                {editingPhoto ? "Edit Image" : "New Image"}
              </h3>
            </div>
            {!editingPhoto && (
              <button 
                type="button"
                onClick={() => setIsBulkPickerOpen(true)}
                className="px-6 py-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-zinc-200 transition-all border border-zinc-200 dark:border-zinc-800"
              >
                Bulk Import Folder
              </button>
            )}
          </div>

          <form onSubmit={onSubmit} className="space-y-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Title</label>
              <input 
                type="text" required value={uploadForm.title}
                onChange={(e) => onInputChange("title", e.target.value)}
                className="w-full bg-transparent border-b-2 border-zinc-100 dark:border-zinc-800 py-4 outline-none focus:border-uiupc-orange dark:text-white text-2xl font-black transition-all"
                placeholder="Image title..."
              />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Description</label>
              <textarea 
                value={uploadForm.description}
                onChange={(e) => onInputChange("description", e.target.value)}
                className="w-full bg-zinc-100 dark:bg-[#1a1a1a] p-5 rounded-2xl outline-none focus:border-uiupc-orange dark:text-white font-bold h-24 resize-none transition-all text-sm"
                placeholder="Optional details..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-3">
                 <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Category</label>
                 <select 
                    required value={uploadForm.eventId}
                    onChange={(e) => onInputChange("eventId", e.target.value)}
                    className="w-full bg-zinc-100 dark:bg-[#1a1a1a] border border-transparent p-4 rounded-xl outline-none focus:border-uiupc-orange dark:text-white font-bold transition-all text-sm"
                 >
                   <option value="">Select Category</option>
                   {eventOptions.map(opt => (
                     <option key={opt.value} value={opt.value}>{opt.label}</option>
                   ))}
                 </select>
               </div>
               <div className="space-y-3">
                 <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Social Link</label>
                 <div className="relative">
                   <IconFacebook size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500" />
                   <input 
                      type="url" value={uploadForm.facebookPost}
                      onChange={(e) => onInputChange("facebookPost", e.target.value)}
                      className="w-full bg-zinc-100 dark:bg-[#1a1a1a] border border-transparent py-4 pl-12 pr-4 rounded-xl outline-none focus:border-uiupc-orange dark:text-white font-bold transition-all text-sm"
                      placeholder="Facebook URL..."
                   />
                 </div>
               </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Image Source</label>
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <IconLink size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input 
                    type="text" required value={uploadForm.imageUrl}
                    onChange={(e) => onInputChange("imageUrl", e.target.value)}
                    className="w-full bg-zinc-100 dark:bg-[#1a1a1a] border border-transparent py-4 pl-12 pr-4 rounded-xl outline-none focus:border-uiupc-orange dark:text-white font-bold transition-all text-sm"
                    placeholder="Drive ID or direct URL..."
                  />
                </div>
                <button 
                  type="button" 
                  onClick={() => setIsPickerOpen(true)}
                  className="px-6 py-4 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-uiupc-orange rounded-xl text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap"
                >
                  Browse Drive
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-10 border-t border-zinc-100 dark:border-zinc-800">
              <button 
                type="button" onClick={onClose}
                className="flex-1 py-5 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all"
              >
                Cancel
              </button>
              <button 
                type="submit" disabled={uploading}
                className="flex-[2] py-5 bg-uiupc-orange text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-uiupc-orange/20 hover:translate-y-[-2px] active:translate-y-0 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {uploading ? <IconSync size={14} className="animate-spin" /> : <IconUpload size={14} />}
                {uploading ? 'Processing...' : (editingPhoto ? 'Save Changes' : 'Upload to Gallery')}
              </button>
            </div>

            <Admin_DrivePicker
              isOpen={isPickerOpen}
              onClose={() => setIsPickerOpen(false)}
              onSelect={(fileId) => {
                onInputChange("imageUrl", fileId);
              }}
              title="Select Gallery Image"
            />

            <Admin_DrivePicker
              isOpen={isBulkPickerOpen}
              onClose={() => setIsBulkPickerOpen(false)}
              onSelect={(folderId, _, folderName) => {
                onBulkImport(folderId, folderName, uploadForm.eventId);
              }}
              title="Select Event Folder to Import"
              allowFolderSelection={true}
            />
          </form>
        </div>
      </motion.div>
    </div>
    </Admin_ModalPortal>
  );
};

export default Admin_GalleryModal;
