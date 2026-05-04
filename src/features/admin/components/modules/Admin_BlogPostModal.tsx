"use client";

import React, { useState, useCallback } from "react";
import { IconSync, IconPlus, IconImage, IconClose } from "@/components/shared/Icons";
import { motion, AnimatePresence } from "motion/react";
import { Admin_DrivePicker } from "@/features/admin/components";
import { getImageUrl } from "@/utils/imageUrl";

interface Media {
  type: string;
  url: string;
  caption?: string;
}

interface BlogPostFormData {
  title: string;
  description: string;
  date: string;
  tags: string;
  media: Media[];
}

interface Admin_BlogPostModalProps {
  formData: BlogPostFormData;
  editingPost: any;
  uploading: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onMediaChange: (index: number, field: string, value: string) => void;
  onAddMedia: () => void;
  onRemoveMedia: (index: number) => void;
}

const Admin_BlogPostModal: React.FC<Admin_BlogPostModalProps> = ({
  formData, editingPost, uploading, onClose, onSubmit, onInputChange, onMediaChange, onAddMedia, onRemoveMedia
}) => {
  const [pickerIndex, setPickerIndex] = useState<number | null>(null);

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 md:p-10">
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/80 backdrop-blur-2xl"
        onClick={onClose}
      />
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 40 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 40 }}
        className="relative w-full max-w-3xl bg-white dark:bg-[#0d0d0d] rounded-[3rem] border border-zinc-200 dark:border-zinc-800 shadow-3xl flex flex-col overflow-hidden max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-8 md:p-12 border-b border-zinc-100 dark:border-zinc-800/50 flex items-center justify-between bg-zinc-50 dark:bg-[#0a0a0a] shrink-0">
          <div className="space-y-1">
            <span className="text-uiupc-orange text-[10px] font-black uppercase tracking-[0.4em] block">Journalism</span>
            <h3 className="text-3xl font-black uppercase tracking-tighter dark:text-white leading-none">
              {editingPost ? "Edit Article" : "New Article"}
            </h3>
          </div>
          <button onClick={onClose} className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white dark:bg-[#1a1a1a] text-zinc-400 hover:text-red-500 hover:bg-red-500/5 transition-all shadow-sm border border-zinc-200 dark:border-zinc-800">
            <IconClose size={20} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-8 md:p-12 overflow-y-auto flex-1 custom-scrollbar space-y-10 bg-white dark:bg-[#0d0d0d]">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Headline</label>
              <input
                type="text" name="title" value={formData.title} onChange={onInputChange} required
                className="w-full bg-transparent border-b-2 border-zinc-100 dark:border-zinc-800 py-4 outline-none focus:border-uiupc-orange dark:text-white text-2xl font-black transition-all"
                placeholder="Enter article headline..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Publication Date</label>
                <input
                  type="date" name="date" value={formData.date} onChange={onInputChange} required
                  className="w-full bg-zinc-100 dark:bg-[#1a1a1a] p-4 rounded-xl outline-none focus:border-uiupc-orange dark:text-white font-bold text-sm"
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Tags</label>
                <input
                  type="text" name="tags" value={formData.tags} onChange={onInputChange}
                  className="w-full bg-zinc-100 dark:bg-[#1a1a1a] p-4 rounded-xl outline-none focus:border-uiupc-orange dark:text-white font-bold text-sm"
                  placeholder="e.g. news, events, workshop"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Content Overview</label>
              <textarea
                name="description" value={formData.description} onChange={onInputChange} required rows={6}
                className="w-full bg-zinc-100 dark:bg-[#1a1a1a] p-5 rounded-2xl outline-none focus:border-uiupc-orange dark:text-white font-bold resize-none text-sm transition-all"
                placeholder="Write the article content..."
              />
            </div>

            <div className="space-y-6">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Media Assets</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {formData.media.map((media, index) => (
                  <div key={index} className="p-6 bg-zinc-50 dark:bg-[#1a1a1a] border border-zinc-200 dark:border-zinc-800 rounded-3xl space-y-4 relative group">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Asset {index + 1}</span>
                      {formData.media.length > 1 && (
                        <button type="button" onClick={() => onRemoveMedia(index)} className="text-red-500 hover:text-red-600 transition-colors"><IconClose size={12} /></button>
                      )}
                    </div>

                    <div className="flex gap-4">
                      {media.url && (
                        <div className="w-16 h-16 shrink-0 rounded-xl overflow-hidden bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                          <img src={getImageUrl(media.url, 150, 150)} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="flex-1 space-y-2">
                        <div className="flex gap-2">
                          <input
                            type="text" placeholder="Drive ID..." value={media.url}
                            onChange={(e) => onMediaChange(index, "url", e.target.value)}
                            className="flex-1 p-3 bg-white dark:bg-[#0d0d0d] border border-transparent rounded-lg text-[10px] font-bold outline-none focus:border-uiupc-orange transition-all"
                          />
                          <button type="button" onClick={() => setPickerIndex(index)} className="px-3 py-2 bg-zinc-200 dark:bg-zinc-800 text-zinc-500 hover:text-uiupc-orange rounded-lg text-[8px] font-black uppercase tracking-widest transition-all">Pick</button>
                        </div>
                        <input
                          type="text" placeholder="Caption..." value={media.caption || ""}
                          onChange={(e) => onMediaChange(index, "caption", e.target.value)}
                          className="w-full p-3 bg-white dark:bg-[#0d0d0d] border border-transparent rounded-lg text-[10px] font-bold outline-none focus:border-uiupc-orange transition-all"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <button 
                  type="button" onClick={onAddMedia} 
                  className="p-6 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl text-zinc-400 text-[10px] font-black uppercase tracking-widest hover:border-uiupc-orange hover:text-uiupc-orange transition-all flex flex-col items-center justify-center gap-2"
                >
                  <IconPlus size={20} /> Add Asset
                </button>
              </div>
            </div>
          </div>

          <div className="p-8 md:p-12 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-end gap-4 bg-zinc-50 dark:bg-[#0a0a0a] shrink-0">
            <button
              type="button" onClick={onClose} disabled={uploading}
              className="px-8 h-14 rounded-2xl bg-zinc-200 dark:bg-zinc-800 text-zinc-500 text-[10px] font-black uppercase tracking-widest hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-all"
            >
              Discard
            </button>
            <button type="submit" disabled={uploading} className="px-10 h-14 rounded-2xl bg-uiupc-orange text-white text-[10px] font-black uppercase tracking-[0.2em] hover:brightness-110 transition-all shadow-xl shadow-uiupc-orange/20 disabled:opacity-50 flex items-center gap-3">
              {uploading ? <IconSync size={14} className="animate-spin" /> : <IconPlus size={14} />}
              {uploading ? "Processing..." : (editingPost ? "Save Changes" : "Publish Article")}
            </button>
          </div>
        </form>
      </motion.div>
      
      <Admin_DrivePicker
        isOpen={pickerIndex !== null}
        onClose={() => setPickerIndex(null)}
        onSelect={(fileId) => {
          if (pickerIndex !== null) {
            onMediaChange(pickerIndex, "url", fileId);
            setPickerIndex(null);
          }
        }}
        title="Select Article Media"
      />
    </div>
  );
};

export default Admin_BlogPostModal;
