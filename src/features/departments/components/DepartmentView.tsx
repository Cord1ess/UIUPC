"use client";

import React from 'react';
import { motion } from 'motion/react';
import { IconArchive, IconCalendar, IconChevronRight, IconArrowLeft, IconLayerGroup } from '@/components/shared/Icons';
import Link from 'next/link';
import { getImageUrl } from '@/utils/imageUrl';

interface DepartmentViewProps {
  deptName: string;
  deptLabel: string;
  posts: any[];
}

const DepartmentView: React.FC<DepartmentViewProps> = ({ deptName, deptLabel, posts }) => {
  return (
    <div className="min-h-screen bg-[#f9f5ea] dark:bg-[#0a0a0a] pb-32">
      {/* ── HEADER ───────────────────────────────────────────── */}
      <header className="pt-32 pb-20 px-6 border-b border-black/5 dark:border-white/5 bg-white/30 dark:bg-black/30 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-uiupc-orange transition-colors">
              <IconArrowLeft size={14} /> Back to Home
            </Link>
            <div>
              <div className="flex items-center gap-3 text-uiupc-orange mb-4">
                <IconLayerGroup size={20} />
                <span className="text-[12px] font-black uppercase tracking-[0.3em]">Department</span>
              </div>
              <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter text-zinc-900 dark:text-white leading-[0.85]">
                {deptName}
              </h1>
            </div>
          </div>
          <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest max-w-sm">
            {deptLabel}. Exploring the archive and updates from our dedicated team.
          </p>
        </div>
      </header>

      {/* ── ARCHIVE LIST ──────────────────────────────────────── */}
      <section className="mt-20 px-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-10 mb-16">
          <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 shrink-0">Department Journal</h2>
          <div className="h-px flex-1 bg-black/10 dark:bg-white/10" />
          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{posts.length} entries</span>
        </div>

        {posts && posts.length > 0 ? (
          <div className="space-y-4">
            {posts.map((post, idx) => (
              <motion.div 
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                className="group relative bg-white dark:bg-zinc-900/50 rounded-[2rem] border border-black/5 dark:border-white/5 p-6 md:p-10 flex flex-col md:flex-row gap-10 items-center hover:shadow-2xl hover:shadow-black/5 dark:hover:shadow-white/5 transition-all"
              >
                {/* Thumbnail */}
                <div className="w-full md:w-64 aspect-video md:aspect-square rounded-2xl overflow-hidden shrink-0 bg-zinc-100 dark:bg-zinc-800">
                  {post.image_url ? (
                    <img src={getImageUrl(post.image_url, 400, 400)} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-300 dark:text-zinc-700"><IconArchive size={40} /></div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-uiupc-orange">
                    <IconCalendar size={12} />
                    {new Date(post.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </div>
                  <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-zinc-900 dark:text-white leading-tight">
                    {post.title}
                  </h3>
                  <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 leading-relaxed line-clamp-3">
                    {post.description}
                  </p>
                </div>

                {/* Action */}
                <div className="shrink-0">
                  <div className="w-16 h-16 rounded-full border border-black/10 dark:border-white/10 flex items-center justify-center group-hover:bg-uiupc-orange group-hover:border-uiupc-orange group-hover:text-white transition-all text-zinc-400">
                    <IconChevronRight size={24} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="py-40 text-center bg-white/50 dark:bg-white/5 rounded-[3rem] border border-dashed border-black/10 dark:border-white/10">
            <IconArchive size={48} className="mx-auto text-zinc-200 dark:text-zinc-800 mb-6" />
            <h3 className="text-lg font-black uppercase tracking-widest text-zinc-400">No archive posts found</h3>
            <p className="text-sm font-medium text-zinc-500 mt-2">Updates from this department will appear here soon.</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default DepartmentView;
