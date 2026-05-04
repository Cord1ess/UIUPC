"use client";

import React, { use } from 'react';
import { motion } from 'motion/react';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { Member } from '@/types';
import { IconChevronLeft, IconFacebook, IconInstagram, IconGlobe, IconPalette, IconCamera, IconQuoteLeft } from '@/components/shared/Icons';
import Link from 'next/link';
import { getImageUrl } from '@/utils/imageUrl';

export default function MemberPortfolioPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = use(params);
  const { data: members } = useSupabaseData<Member>("members");

  const member = members?.find(m => m.username === username);

  if (!member) return null;

  return (
    <main className="min-h-screen pt-32 pb-20 px-6 max-w-7xl mx-auto">
      {/* Back Button */}
      <Link href="/departments" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-400 hover:text-uiupc-orange transition-colors mb-12">
        <IconChevronLeft size={12} /> Back
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        {/* Left: Identity */}
        <div className="lg:col-span-4 space-y-10">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="aspect-square rounded-[3rem] overflow-hidden bg-zinc-100 dark:bg-zinc-900 border border-black/5 dark:border-white/5"
          >
            <img src={getImageUrl(member.image, 600)} className="w-full h-full object-cover" alt={member.name} />
          </motion.div>

          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-black uppercase tracking-tighter dark:text-white leading-none">{member.name}</h1>
              <p className="mt-3 text-uiupc-orange text-xs font-black uppercase tracking-[0.3em]">{member.role}</p>
            </div>

            <div className="flex items-center gap-4">
              {member.social_links.facebook && (
                <a href={member.social_links.facebook} target="_blank" className="w-10 h-10 flex items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-900 text-zinc-400 hover:text-uiupc-orange transition-all">
                  <IconFacebook size={18} />
                </a>
              )}
              {member.social_links.instagram && (
                <a href={member.social_links.instagram} target="_blank" className="w-10 h-10 flex items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-900 text-zinc-400 hover:text-uiupc-orange transition-all">
                  <IconInstagram size={18} />
                </a>
              )}
              {member.social_links.portfolio && (
                <a href={member.social_links.portfolio} target="_blank" className="w-10 h-10 flex items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-900 text-zinc-400 hover:text-uiupc-orange transition-all">
                  <IconGlobe size={18} />
                </a>
              )}
            </div>

            <div className="pt-8 border-t border-black/5 dark:border-white/5">
              <div className="flex gap-4">
                <IconQuoteLeft size={32} className="text-uiupc-orange/20 flex-shrink-0" />
                <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium italic leading-relaxed">
                  {member.bio || "Dedicated creator pushing the visual boundaries of UIUPC through innovative design and perspective."}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Showcase */}
        <div className="lg:col-span-8 space-y-12">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-3 text-sm font-black uppercase tracking-[0.2em] dark:text-white">
              <IconPalette size={16} className="text-uiupc-orange" /> Work Showcase
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {member.works && member.works.length > 0 ? (
              member.works.map((work: any, i: number) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="group relative aspect-[4/5] bg-zinc-100 dark:bg-zinc-900 rounded-[2rem] overflow-hidden border border-black/5 dark:border-white/5"
                >
                  <img src={getImageUrl(work.image, 800)} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt={work.title} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-8">
                    <p className="text-[10px] text-uiupc-orange font-black uppercase tracking-[0.3em] mb-2">{work.type || 'Project'}</p>
                    <h3 className="text-xl font-black text-white uppercase tracking-tight leading-tight">{work.title}</h3>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-2 py-32 text-center bg-zinc-50 dark:bg-zinc-900/50 rounded-[3rem] border border-dashed border-black/10 dark:border-white/10">
                <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center mx-auto mb-6 text-zinc-300">
                  <IconPalette size={24} />
                </div>
                <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest">No showcase items yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
