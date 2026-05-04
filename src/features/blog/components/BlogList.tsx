"use client";

import React from "react";
import Image from "next/image";
import { IconCalendar, IconTag, IconEye, IconEdit, IconTrash } from "@/components/shared/Icons";

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
  timestamp?: string;
  author: string;
  tags?: string;
  media?: Media[];
}

interface BlogListProps {
  posts: BlogPost[];
  onPreview: (post: BlogPost) => void;
  onEdit: (post: BlogPost) => void;
  onDelete: (id: string) => void;
  userEmail: string;
}

const BlogList: React.FC<BlogListProps> = ({
  posts,
  onPreview,
  onEdit,
  onDelete,
  userEmail,
}) => {
  const truncateDescription = (description: string, maxLength = 120) => {
    if (description.length <= maxLength) return description;
    return description.substring(0, maxLength) + "...";
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {posts.map((post) => (
        <div key={post.id} className="group bg-white dark:bg-[#080808] border border-black/5 dark:border-white/5 rounded-3xl overflow-hidden flex flex-col transition-all hover:border-uiupc-orange/50 hover:shadow-[0_0_30px_rgba(255,107,0,0.1)]">
          {post.media && post.media.length > 0 ? (
            <div 
              className="relative w-full h-48 cursor-pointer overflow-hidden bg-black/5 dark:bg-white/5"
              onClick={() => onPreview(post)}
            >
              <Image
                src={post.media[0].url}
                alt={post.media[0].caption || post.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                unoptimized={true}
              />
              <div className="absolute top-4 right-4 px-3 py-1 bg-black/50 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest rounded-xl">
                {post.media.length} Photos
              </div>
            </div>
          ) : (
             <div className="relative w-full h-48 bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center">
                <IconEye size={40} className="text-zinc-300 dark:text-zinc-700" />
             </div>
          )}

          <div className="p-6 flex flex-col flex-1">
            <h3 className="text-lg font-black uppercase tracking-tighter mb-2 line-clamp-1 dark:text-white group-hover:text-uiupc-orange transition-colors">{post.title}</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6 line-clamp-2">
              {truncateDescription(post.description)}
            </p>

            <div className="flex flex-wrap gap-2 mb-6">
              <span className="px-3 py-1 bg-zinc-100 dark:bg-white/5 text-zinc-500 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-widest rounded-xl flex items-center gap-2">
                <IconCalendar size={12} /> {new Date(post.date).toLocaleDateString()}
              </span>
              {post.tags && (
                <span className="px-3 py-1 bg-uiupc-orange/10 text-uiupc-orange text-[10px] font-bold uppercase tracking-widest rounded-xl flex items-center gap-2">
                  <IconTag size={12} /> {post.tags}
                </span>
              )}
            </div>

            <div className="mt-auto pt-6 border-t border-black/5 dark:border-white/5 flex items-center justify-between">
              <div className="flex flex-col">
                 <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Author</span>
                 <span className="text-xs font-bold text-zinc-900 dark:text-white truncate max-w-[120px]">{post.author || userEmail}</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onPreview(post)}
                  className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-white/5 text-zinc-500 dark:text-zinc-400 hover:bg-blue-500 hover:text-white flex items-center justify-center transition-all"
                  title="Preview Post"
                >
                   <IconEye size={12} />
                </button>
                <button
                  onClick={() => onEdit(post)}
                  className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-white/5 text-zinc-500 dark:text-zinc-400 hover:bg-uiupc-orange hover:text-white flex items-center justify-center transition-all"
                  title="Edit Post"
                >
                   <IconEdit size={12} />
                </button>
                <button
                  onClick={() => onDelete(post.id)}
                  className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-white/5 text-zinc-500 dark:text-zinc-400 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all"
                  title="Delete Post"
                >
                   <IconTrash size={12} />
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default React.memo(BlogList);
