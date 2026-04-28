"use client";

import React from "react";
import { FaCalendar, FaTag, FaEdit } from "react-icons/fa";

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
  post,
  onClose,
  onEdit,
}) => {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white dark:bg-[#080808] border border-black/5 dark:border-white/5 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-black/5 dark:border-white/5 flex items-center justify-between bg-zinc-50/50 dark:bg-white/[0.02]">
          <h3 className="text-xl font-black uppercase tracking-tighter dark:text-white truncate pr-4">Preview: {post.title}</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl bg-zinc-100 dark:bg-white/5 text-zinc-500 hover:bg-uiupc-orange hover:text-white transition-all text-xl shrink-0">
            ×
          </button>
        </div>

        <div className="p-0 overflow-y-auto flex-1 custom-scrollbar">
          <div className="flex flex-col">
            {post.media && post.media.length > 0 && (
              <div className="w-full h-64 sm:h-80 relative bg-zinc-100 dark:bg-zinc-900 border-b border-black/5 dark:border-white/5">
                <img
                  src={post.media[0].url}
                  alt={post.media[0].caption || post.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
            )}

            <div className="p-6 space-y-6">
              <div className="space-y-4">
                <h2 className="text-2xl font-black uppercase tracking-tighter dark:text-white">{post.title}</h2>
                <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-zinc-400">
                  <span className="flex items-center gap-2 bg-zinc-100 dark:bg-white/5 px-3 py-1.5 rounded-lg">
                    <FaCalendar className="text-uiupc-orange" /> {new Date(post.date).toLocaleDateString()}
                  </span>
                  {post.tags && (
                    <span className="flex items-center gap-2 bg-zinc-100 dark:bg-white/5 px-3 py-1.5 rounded-lg">
                      <FaTag className="text-uiupc-orange" /> {post.tags}
                    </span>
                  )}
                </div>
              </div>

              <div className="p-6 bg-zinc-50 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-2xl">
                <p className="text-sm dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">{post.description}</p>
              </div>

              {post.media && post.media.length > 1 && (
                <div className="space-y-4 pt-4 border-t border-black/5 dark:border-white/5">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">More Photos ({post.media.length - 1})</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {post.media.slice(1).map((media, index) => (
                      <div key={index} className="aspect-square rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-900 border border-black/5 dark:border-white/5">
                        <img 
                          src={media.url} 
                          alt={media.caption} 
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none";
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-black/5 dark:border-white/5 flex items-center justify-end gap-3 bg-zinc-50/50 dark:bg-white/[0.02]">
          <button onClick={onClose} className="px-6 h-12 flex items-center justify-center rounded-xl bg-zinc-100 dark:bg-white/5 text-zinc-600 dark:text-zinc-300 text-[10px] font-black uppercase tracking-widest hover:bg-zinc-200 dark:hover:bg-white/10 transition-all">
            Close
          </button>
          <button
            onClick={() => {
              onClose();
              onEdit(post);
            }}
            className="px-6 h-12 flex items-center gap-2 rounded-xl bg-uiupc-orange text-white text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all shadow-lg shadow-uiupc-orange/10"
          >
            <FaEdit /> Edit
          </button>
        </div>
      </div>
    </div>
  );
};

export default Admin_BlogPreviewModal;
