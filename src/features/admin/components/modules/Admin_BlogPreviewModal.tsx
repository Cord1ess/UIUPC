"use client";

import React from "react";
import { IconCalendar, IconTag, IconEdit, IconClose } from "@/components/shared/Icons";
import { motion } from "motion/react";
import { getImageUrl } from "@/utils/imageUrl";

interface Media {
  type: string;
  url: string;
  caption?: string;
}

interface BlogPost {
  id: string;
  title: string;
  description: string;
  date: string;
  tags?: string;
  media?: Media[];
}

interface Admin_BlogPreviewModalProps {
  post: BlogPost;
  onClose: () => void;
  onEdit: (post: BlogPost) => void;
}

const Admin_BlogPreviewModal: React.FC<Admin_BlogPreviewModalProps> = ({
  post, onClose, onEdit
}) => {
  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 md:p-10">
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/80 backdrop-blur-2xl"
        onClick={onClose}
      />
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 40 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 40 }}
        className="relative w-full max-w-4xl bg-white dark:bg-[#0d0d0d] rounded-[3rem] border border-zinc-200 dark:border-zinc-800 shadow-3xl flex flex-col overflow-hidden max-h-[90vh]"
      >
        <div className="p-8 md:p-12 border-b border-zinc-100 dark:border-zinc-800/50 flex items-center justify-between bg-zinc-50 dark:bg-[#0a0a0a] shrink-0">
          <h3 className="text-xl font-black uppercase tracking-tighter dark:text-white truncate pr-10">Editorial Preview</h3>
          <button onClick={onClose} className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white dark:bg-[#1a1a1a] text-zinc-400 hover:text-red-500 transition-all border border-zinc-200 dark:border-zinc-800">
            <IconClose size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar bg-white dark:bg-[#0d0d0d]">
          <div className="flex flex-col">
            {post.media && post.media.length > 0 && (
              <div className="w-full h-64 sm:h-96 relative bg-zinc-100 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 overflow-hidden">
                <img
                  src={getImageUrl(post.media[0].url, 1200, 800)}
                  alt={post.media[0].caption || post.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
                {post.media[0].caption && (
                  <div className="absolute bottom-6 left-8 bg-black/40 backdrop-blur-xl px-4 py-2 rounded-xl border border-white/10">
                    <p className="text-[10px] font-bold text-white uppercase tracking-widest">{post.media[0].caption}</p>
                  </div>
                )}
              </div>
            )}

            <div className="p-8 md:p-14 space-y-10">
              <div className="space-y-6">
                <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter dark:text-white leading-tight">{post.title}</h2>
                <div className="flex flex-wrap items-center gap-4 text-[10px] font-black uppercase tracking-widest">
                  <span className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800/50 px-5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-500">
                    <IconCalendar size={10} className="text-uiupc-orange" /> {new Date(post.date).toLocaleDateString()}
                  </span>
                  {post.tags && (
                    <span className="flex items-center gap-2 bg-uiupc-orange/10 text-uiupc-orange px-5 py-2.5 rounded-xl border border-uiupc-orange/20">
                      <IconTag size={10} /> {post.tags}
                    </span>
                  )}
                </div>
              </div>

              <div className="prose prose-zinc dark:prose-invert max-w-none">
                <p className="text-lg text-zinc-600 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap font-medium">{post.description}</p>
              </div>

              {post.media && post.media.length > 1 && (
                <div className="space-y-6 pt-10 border-t border-zinc-100 dark:border-zinc-800">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Supporting Media</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                    {post.media.slice(1).map((media, index) => (
                      <div key={index} className="aspect-video rounded-[2rem] overflow-hidden bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 group relative">
                        <img 
                          src={getImageUrl(media.url, 400, 300)} 
                          alt={media.caption} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
                           <p className="text-[8px] font-black text-white uppercase tracking-widest text-center">{media.caption || "Asset View"}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-8 md:p-12 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-end gap-4 bg-zinc-50 dark:bg-[#0a0a0a] shrink-0">
          <button onClick={onClose} className="px-8 h-14 rounded-2xl bg-zinc-200 dark:bg-zinc-800 text-zinc-500 text-[10px] font-black uppercase tracking-widest hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-all">
            Close
          </button>
          <button
            onClick={() => { onClose(); onEdit(post); }}
            className="px-10 h-14 rounded-2xl bg-uiupc-orange text-white text-[10px] font-black uppercase tracking-[0.2em] hover:brightness-110 transition-all shadow-xl shadow-uiupc-orange/20 flex items-center gap-3"
          >
            <IconEdit size={14} /> Edit Article
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Admin_BlogPreviewModal;
