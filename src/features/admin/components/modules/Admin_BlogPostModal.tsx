"use client";

import React from "react";
import { FaSync, FaPlus } from "react-icons/fa";

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
  formData,
  editingPost,
  uploading,
  onClose,
  onSubmit,
  onInputChange,
  onMediaChange,
  onAddMedia,
  onRemoveMedia,
}) => {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white dark:bg-[#080808] border border-black/5 dark:border-white/5 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-black/5 dark:border-white/5 flex items-center justify-between bg-zinc-50/50 dark:bg-white/[0.02]">
          <h3 className="text-xl font-black uppercase tracking-tighter dark:text-white">
            {editingPost ? "Edit Blog Post" : "New Post"}
          </h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl bg-zinc-100 dark:bg-white/5 text-zinc-500 hover:bg-uiupc-orange hover:text-white transition-all text-xl" disabled={uploading}>
            ×
          </button>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 overflow-y-auto flex-1 custom-scrollbar space-y-6">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={onInputChange}
                placeholder="Enter blog post title"
                required
                className="w-full p-4 bg-zinc-50 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-xl text-sm outline-none focus:border-uiupc-orange transition-all"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={onInputChange}
                placeholder="Enter blog post description"
                rows={4}
                required
                className="w-full p-4 bg-zinc-50 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-xl text-sm outline-none focus:border-uiupc-orange transition-all resize-y"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Publish Date *</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={onInputChange}
                required
                className="w-full p-4 bg-zinc-50 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-xl text-sm outline-none focus:border-uiupc-orange transition-all"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Tags</label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={onInputChange}
                placeholder="tag1, tag2, tag3"
                className="w-full p-4 bg-zinc-50 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-xl text-sm outline-none focus:border-uiupc-orange transition-all"
              />
              <small className="text-xs text-zinc-400">Separate tags with commas</small>
            </div>

            <div className="flex flex-col gap-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Media</label>
              <div className="space-y-4">
                {formData.media.map((media, index) => (
                  <div key={index} className="p-4 bg-zinc-50 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-2xl space-y-4">
                    <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-3">
                      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Media {index + 1}</span>
                      {formData.media.length > 1 && (
                        <button
                          type="button"
                          onClick={() => onRemoveMedia(index)}
                          className="px-3 py-1 rounded-lg bg-red-500/10 text-red-500 text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <select
                      value={media.type}
                      onChange={(e) => onMediaChange(index, "type", e.target.value)}
                      className="w-full p-3 bg-white dark:bg-[#080808] border border-black/5 dark:border-white/5 rounded-xl text-sm outline-none focus:border-uiupc-orange transition-all"
                    >
                      <option value="image">Image</option>
                      <option value="video">Video</option>
                    </select>

                    <input
                      type="url"
                      placeholder="Enter media URL"
                      value={media.url}
                      onChange={(e) => onMediaChange(index, "url", e.target.value)}
                      className="w-full p-3 bg-white dark:bg-[#080808] border border-black/5 dark:border-white/5 rounded-xl text-sm outline-none focus:border-uiupc-orange transition-all"
                    />

                    <input
                      type="text"
                      placeholder="Caption (optional)"
                      value={media.caption || ""}
                      onChange={(e) => onMediaChange(index, "caption", e.target.value)}
                      className="w-full p-3 bg-white dark:bg-[#080808] border border-black/5 dark:border-white/5 rounded-xl text-sm outline-none focus:border-uiupc-orange transition-all"
                    />
                  </div>
                ))}
              </div>

              <button 
                type="button" 
                onClick={onAddMedia} 
                className="w-full p-4 border border-dashed border-black/10 dark:border-white/10 rounded-2xl text-zinc-500 dark:text-zinc-400 text-sm font-bold hover:bg-zinc-50 dark:hover:bg-white/5 hover:text-uiupc-orange hover:border-uiupc-orange transition-all flex items-center justify-center gap-2"
              >
                <FaPlus /> Add Another Media
              </button>
            </div>
          </div>

          <div className="p-6 border-t border-black/5 dark:border-white/5 flex items-center justify-end gap-3 bg-zinc-50/50 dark:bg-white/[0.02]">
            <button
              type="button"
              onClick={onClose}
              disabled={uploading}
              className="px-6 h-12 flex items-center justify-center rounded-xl bg-zinc-100 dark:bg-white/5 text-zinc-600 dark:text-zinc-300 text-[10px] font-black uppercase tracking-widest hover:bg-zinc-200 dark:hover:bg-white/10 transition-all"
            >
              Cancel
            </button>
            <button type="submit" disabled={uploading} className="px-6 h-12 flex items-center gap-2 rounded-xl bg-uiupc-orange text-white text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all shadow-lg shadow-uiupc-orange/10 disabled:opacity-50">
              {uploading ? (
                <>
                  <FaSync className="animate-spin text-sm" />
                  {editingPost ? "Updating..." : "Publishing..."}
                </>
              ) : (
                <>
                  <FaPlus className="text-sm" />
                  {editingPost ? "Save Changes" : "Publish"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Admin_BlogPostModal;
