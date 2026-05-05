"use client";

import React from 'react';
import { motion } from 'motion/react';
import { IconTrophy, IconCalendar, IconArrowLeft, IconArrowRight } from '@/components/shared/Icons';
import ScrollRevealText from '@/components/motion/ScrollRevealText';
import { getImageUrl } from '@/utils/imageUrl';
import Link from 'next/link';

interface AchievementsViewProps {
  achievements: any[];
}

const AchievementsView: React.FC<AchievementsViewProps> = ({ achievements }) => {
  return (
    <div className="min-h-screen bg-[#f9f5ea] dark:bg-[#0a0a0a] pb-32">
      {/* ── HEADER: EDITORIAL BRANDING ─────────────────────────────────── */}
      <section className="pt-32 pb-16 px-6 relative">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-start justify-between gap-12">
          <div className="flex-1 space-y-8">
            <Link href="/" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-uiupc-orange transition-colors">
              <IconArrowLeft size={14} /> Back to Home
            </Link>
            <ScrollRevealText 
              text="The UIUPC Legacy" 
              className="text-[10vw] md:text-[6vw] font-black uppercase tracking-tighter leading-[0.85] text-zinc-900 dark:text-white"
            />
            <p className="max-w-xl text-zinc-500 dark:text-zinc-400 font-medium text-base md:text-lg leading-relaxed">
              Celebrating the milestones, awards, and breakthroughs that define our journey as a community.
            </p>
          </div>
          <div className="hidden lg:flex flex-col items-end text-right space-y-2 shrink-0">
             <div className="flex items-center gap-4 text-uiupc-orange mb-2">
                <IconTrophy size={20} />
                <span className="text-[12px] font-black uppercase tracking-[0.4em]">Archive</span>
             </div>
             <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{achievements.length} Verified Entries</span>
          </div>
        </div>
      </section>

      {/* ── ACHIEVEMENT LIST: ALTERNATING EDITORIAL ───────────────────────── */}
      <section className="px-6 max-w-7xl mx-auto space-y-0">
        {achievements && achievements.length > 0 ? (
          achievements.map((item, idx) => {
            const isEven = idx % 2 === 0;
            return (
              <motion.div 
                key={item.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                className={`group flex flex-col md:flex-row gap-12 md:gap-24 items-stretch py-24 md:py-32 border-b border-black/5 dark:border-white/5 last:border-none ${
                  !isEven ? 'md:flex-row-reverse' : ''
                }`}
              >
                {/* Media Side */}
                <div className="w-full md:w-[55%] relative shrink-0">
                  <div className="absolute -top-12 -left-8 md:-left-12 z-20 pointer-events-none">
                    <span className="text-[120px] font-black leading-none text-black/[0.03] dark:text-white/[0.03] select-none uppercase tracking-tighter">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                  </div>
                  
                  <motion.div 
                    className="relative z-10 aspect-[16/10] rounded-[2.5rem] overflow-hidden bg-white dark:bg-zinc-900 border border-black/5 dark:border-white/5 shadow-xl transition-all duration-1000 group-hover:rounded-[3.5rem] group-hover:shadow-2xl"
                    whileHover={{ scale: 1.01 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  >
                    {item.image_url ? (
                      <img src={getImageUrl(item.image_url, 1200, 800)} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-105" alt={item.title} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-100 dark:text-zinc-800"><IconTrophy size={80} /></div>
                    )}
                  </motion.div>
                  
                  {/* Floating Year Badge */}
                  <div className={`absolute -bottom-6 ${isEven ? 'right-6 md:-right-6' : 'left-6 md:-left-6'} z-30 p-5 bg-white dark:bg-zinc-900 shadow-2xl rounded-2xl border border-black/5 dark:border-white/5 flex flex-col items-center justify-center min-w-[80px]`}>
                    <span className="text-2xl font-black text-zinc-900 dark:text-white leading-none mb-1">{item.year}</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-uiupc-orange">Legacy</span>
                  </div>
                </div>

                {/* Content Side */}
                <div className="w-full md:w-[45%] flex flex-col justify-center space-y-8">
                  <div className="flex items-center gap-6">
                    <span className="px-4 py-1.5 rounded-full bg-uiupc-orange/10 border border-uiupc-orange/20 text-[9px] font-black uppercase tracking-[0.3em] text-uiupc-orange">
                      {item.category || 'Achievement'}
                    </span>
                    <div className="h-px flex-1 bg-black/10 dark:bg-white/10" />
                  </div>

                  <div className="space-y-4">
                    <h2 className="text-3xl min-[400px]:text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tighter text-zinc-900 dark:text-white leading-[0.85] break-words">
                      {item.title}
                    </h2>
                    {item.recipient && (
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Awarded to: {item.recipient}</p>
                    )}
                  </div>

                  <p className="text-zinc-600 dark:text-zinc-400 text-lg md:text-xl leading-relaxed font-medium">
                    {item.description}
                  </p>

                  <div className="pt-4">
                    <button className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.2em] text-uiupc-orange group/btn">
                      Explore Details <IconArrowRight size={14} className="transition-transform group-hover/btn:translate-x-2" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })
        ) : (
          <div className="py-40 text-center">
            <IconTrophy size={48} className="mx-auto text-zinc-200 dark:text-zinc-800 mb-6" />
            <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">The cabinet is empty</h3>
          </div>
        )}
      </section>
    </div>
  );
};

export default AchievementsView;
