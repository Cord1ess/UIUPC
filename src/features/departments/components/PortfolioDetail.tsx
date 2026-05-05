"use client";

import React from 'react';
import { motion } from 'motion/react';
import { 
  IconFacebook, IconInstagram, IconLinkedin, IconExternalLink, 
  IconArrowLeft, IconPalette, IconCamera 
} from '@/components/shared/Icons';
import Link from 'next/link';
import { getImageUrl } from '@/utils/imageUrl';

interface PortfolioDetailProps {
  person: any;
  works: any[];
  teamType: 'design' | 'visual';
}

const PortfolioDetail: React.FC<PortfolioDetailProps> = ({ person, works, teamType }) => {
  return (
    <div className="min-h-screen bg-[#f9f5ea] dark:bg-[#0a0a0a] pb-32">
      {/* ── HEADER NAVIGATION ───────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-8 flex justify-between items-center pointer-events-none">
        <Link 
          href={`/${teamType}`}
          className="w-12 h-12 bg-white dark:bg-zinc-900 rounded-full border border-black/5 dark:border-white/5 flex items-center justify-center text-zinc-900 dark:text-white pointer-events-auto hover:bg-uiupc-orange hover:text-white transition-all shadow-xl"
        >
          <IconArrowLeft size={20} />
        </Link>
        <div className="px-6 py-3 bg-white dark:bg-zinc-900 rounded-full border border-black/5 dark:border-white/5 flex items-center gap-3 shadow-xl pointer-events-auto">
          {teamType === 'design' ? <IconPalette size={16} className="text-uiupc-orange" /> : <IconCamera size={16} className="text-uiupc-orange" />}
          <span className="text-[10px] font-black uppercase tracking-[0.2em] dark:text-white">
            {teamType} Team Portfolio
          </span>
        </div>
      </nav>

      {/* ── PROFILE SECTION ─────────────────────────────────────── */}
      <section className="pt-40 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row gap-12 md:gap-24 items-center md:items-start">
          {/* Large Profile Photo */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full md:w-[400px] shrink-0"
          >
            <div className="aspect-[4/5] bg-zinc-200 dark:bg-zinc-900 rounded-[3rem] overflow-hidden border-8 border-white dark:border-zinc-800 shadow-2xl relative">
              {person.profile_image ? (
                <img src={getImageUrl(person.profile_image, 800, 1000)} alt={person.full_name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-300"><IconPalette size={80} /></div>
              )}
            </div>
          </motion.div>

          {/* Biography & Socials */}
          <div className="flex-1 space-y-10 py-6 text-center md:text-left">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-black uppercase tracking-tighter text-zinc-900 dark:text-white leading-[0.85] mb-6">
                {person.full_name}
              </h1>
              <p className="text-lg md:text-xl text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed max-w-2xl">
                {person.bio || "Member of the UIU Photography Club Team. Dedicated to capturing and creating visual stories for our community."}
              </p>
            </motion.div>

            {/* Social Links */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex items-center justify-center md:justify-start gap-6"
            >
              {person.facebook_url && (
                <a href={person.facebook_url} target="_blank" rel="noopener noreferrer" className="w-14 h-14 rounded-2xl bg-white dark:bg-zinc-900 border border-black/5 dark:border-white/5 flex items-center justify-center text-zinc-400 hover:text-uiupc-orange hover:border-uiupc-orange/30 transition-all shadow-lg hover:shadow-xl">
                  <IconFacebook size={24} />
                </a>
              )}
              {person.instagram_url && (
                <a href={person.instagram_url} target="_blank" rel="noopener noreferrer" className="w-14 h-14 rounded-2xl bg-white dark:bg-zinc-900 border border-black/5 dark:border-white/5 flex items-center justify-center text-zinc-400 hover:text-pink-500 hover:border-pink-500/30 transition-all shadow-lg hover:shadow-xl">
                  <IconInstagram size={24} />
                </a>
              )}
              {person.linkedin_url && (
                <a href={person.linkedin_url} target="_blank" rel="noopener noreferrer" className="w-14 h-14 rounded-2xl bg-white dark:bg-zinc-900 border border-black/5 dark:border-white/5 flex items-center justify-center text-zinc-400 hover:text-blue-500 hover:border-blue-500/30 transition-all shadow-lg hover:shadow-xl">
                  <IconLinkedin size={24} />
                </a>
              )}
              {person.behance_url && (
                <a href={person.behance_url} target="_blank" rel="noopener noreferrer" className="w-14 h-14 rounded-2xl bg-white dark:bg-zinc-900 border border-black/5 dark:border-white/5 flex items-center justify-center text-zinc-400 hover:text-blue-600 hover:border-blue-600/30 transition-all shadow-lg hover:shadow-xl">
                  <IconExternalLink size={24} />
                </a>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── WORKS GALLERY ────────────────────────────────────────── */}
      <section className="mt-32 px-6 max-w-7xl mx-auto space-y-16">
        <div className="flex items-center gap-10">
          <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 shrink-0">Selected Works</h2>
          <div className="h-px flex-1 bg-black/10 dark:bg-white/10" />
        </div>

        {works && works.length > 0 ? (
          <div className="columns-1 md:columns-2 lg:columns-3 gap-12 space-y-12">
            {works.map((work, idx) => (
              <motion.div 
                key={work.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.8, delay: (idx % 3) * 0.1 }}
                className="break-inside-avoid"
              >
                <div className="group relative rounded-[2rem] overflow-hidden border border-black/5 dark:border-white/5 shadow-xl bg-white dark:bg-zinc-950">
                  <img src={getImageUrl(work.image_url, 800)} alt={work.title || "Showcase"} className="w-full h-auto transition-transform duration-1000 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-8">
                    <p className="text-[9px] font-black uppercase tracking-widest text-white">{work.title || "Personal Showcase"}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="py-40 text-center">
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">This member hasn't added any work to their portfolio yet.</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default PortfolioDetail;
