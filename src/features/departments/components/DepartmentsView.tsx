"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'motion/react';
import { 
  IconSearch, IconLayerGroup, IconPalette, IconCamera, 
  IconArchive, IconUserCircle, IconChevronRight, IconCalendar 
} from '@/components/shared/Icons';
import ScrollRevealText from '@/components/motion/ScrollRevealText';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { getImageUrl } from '@/utils/imageUrl';
import Link from 'next/link';

// ─── CLUB STRUCTURE (Matches Admin) ────────────────────────────────
const DEPT_CONFIG = [
  { id: 'hr', name: 'HR', label: 'Human Resources', type: 'department', icon: <IconLayerGroup size={14} /> },
  { id: 'pr', name: 'PR', label: 'Public Relations', type: 'department', icon: <IconLayerGroup size={14} /> },
  { id: 'events', name: 'Events', label: 'Event Management', type: 'department', icon: <IconLayerGroup size={14} /> },
  { id: 'organizing', name: 'Organizing', label: 'Organizing Dept', type: 'department', icon: <IconLayerGroup size={14} /> },
  { id: 'design', name: 'Design', label: 'Design Team', type: 'team', icon: <IconPalette size={14} /> },
  { id: 'visual', name: 'Visual', label: 'Visual Team', type: 'team', icon: <IconCamera size={14} /> },
];

const DepartmentsView: React.FC = () => {
  const [activeDeptId, setActiveDeptId] = useState('hr');
  const [searchQuery, setSearchQuery] = useState("");
  const [isToolVisible, setIsToolVisible] = useState(true);
  const { scrollY } = useScroll();

  // Smart Tool Visibility (Matches Committee Pattern)
  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() || 0;
    if (latest > previous && latest > 300) setIsToolVisible(false);
    else setIsToolVisible(true);
  });

  const activeDept = useMemo(() => DEPT_CONFIG.find(d => d.id === activeDeptId), [activeDeptId]);

  // Fetch Archives for Departments
  const { data: archivePosts, isLoading: archiveLoading } = useSupabaseData("department_posts", {
    filters: { dept_id: activeDeptId },
    orderBy: 'created_at',
    orderDesc: true,
    enabled: activeDept?.type === 'department'
  });

  // Fetch Portfolios for Teams
  const { data: portfolios, isLoading: portfolioLoading } = useSupabaseData("portfolios", {
    filters: { team_id: activeDeptId },
    orderBy: 'full_name',
    orderDesc: false,
    enabled: activeDept?.type === 'team'
  });

  return (
    <div className="min-h-screen bg-[#f9f5ea] dark:bg-[#0a0a0a] pb-32">
      {/* ── ZONE 1: HERO & DISCOVERY ─────────────────────────────────── */}
      <section className="pt-32 pb-6 px-6 relative">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-start justify-between gap-12">
          {/* Static Branding */}
          <div className="flex-1 space-y-8">
            <ScrollRevealText 
              text="Our Departments" 
              className="text-[10vw] md:text-[6vw] font-black uppercase tracking-tighter leading-[0.85] text-zinc-900 dark:text-white"
            />
            <p className="max-w-xl text-zinc-500 dark:text-zinc-400 font-medium text-base md:text-lg leading-relaxed">
              The architecture of United International University Photography Club. Select a unit below to explore their archive or meet the creative teams.
            </p>
          </div>

          {/* Unified Tool Hub (Right - Smart Sticky) */}
          <motion.div 
            initial={{ y: 0, opacity: 1 }}
            animate={{ y: isToolVisible ? 0 : -100, opacity: isToolVisible ? 1 : 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className={`
              w-full lg:w-[440px] bg-white dark:bg-zinc-950 border border-black/10 dark:border-white/10 
              rounded-[2.5rem] shadow-xl lg:sticky lg:top-24 z-50 overflow-hidden
              ${!isToolVisible && 'pointer-events-none'}
            `}
          >
            <div className="relative group border-b border-black/5 dark:border-white/5">
              <IconSearch size={14} className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-300 dark:text-zinc-600 transition-colors group-focus-within:text-uiupc-orange" />
              <input 
                type="text"
                placeholder="Search updates or members..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-14 pr-6 py-5 bg-transparent text-sm font-bold tracking-tight outline-none dark:text-white"
              />
            </div>

            <div className="bg-[#f9f5ea]/30 dark:bg-white/[0.02] p-6 space-y-4">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 block mb-2">Select Unit:</span>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-2 gap-3">
                {DEPT_CONFIG.map((dept) => (
                  <button
                    key={dept.id}
                    onClick={() => { setActiveDeptId(dept.id); setSearchQuery(""); }}
                    className={`
                      px-4 py-3 rounded-2xl flex items-center gap-3 transition-all border
                      ${activeDeptId === dept.id 
                        ? 'bg-white dark:bg-zinc-800 text-uiupc-orange border-black/10 dark:border-white/10 shadow-sm' 
                        : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 border-transparent'}
                    `}
                  >
                    <span className="text-zinc-400 group-hover:text-uiupc-orange">{dept.icon}</span>
                    <span className="text-[10px] font-black uppercase tracking-widest">{dept.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── ZONE 2: DYNAMIC CONTENT ─────────────────────────────────── */}
      <section className="mt-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-10 mb-16">
            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 shrink-0">
              {activeDept?.type === 'department' ? 'Department Journal' : 'Team Members'}
            </h2>
            <div className="h-px flex-1 bg-black/10 dark:bg-white/10" />
          </div>

          {activeDept?.type === 'department' ? (
            <div className="space-y-6">
              {archivePosts?.map((post: any, idx: number) => (
                <motion.div 
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.05 }}
                  className="group bg-white dark:bg-zinc-950 rounded-[2.5rem] border border-black/5 dark:border-white/5 p-6 md:p-8 flex flex-col md:flex-row gap-8 items-center hover:shadow-2xl transition-all"
                >
                  <div className="w-full md:w-48 aspect-square rounded-2xl overflow-hidden shrink-0 bg-[#f9f5ea] dark:bg-zinc-900">
                    {post.image_url ? (
                      <img src={getImageUrl(post.image_url, 400, 400)} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" alt="" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-200"><IconArchive size={40} /></div>
                    )}
                  </div>
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-widest text-uiupc-orange">
                      <IconCalendar size={12} />
                      {new Date(post.created_at).toLocaleDateString()}
                    </div>
                    <h3 className="text-xl md:text-2xl font-black uppercase tracking-tight text-zinc-900 dark:text-white leading-tight">{post.title}</h3>
                    <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 leading-relaxed line-clamp-2">{post.description}</p>
                  </div>
                  <div className="shrink-0 w-12 h-12 rounded-full border border-black/5 dark:border-white/5 flex items-center justify-center group-hover:bg-uiupc-orange group-hover:text-white transition-all">
                    <IconChevronRight size={20} />
                  </div>
                </motion.div>
              ))}
              {(!archivePosts || archivePosts.length === 0) && !archiveLoading && (
                <div className="py-20 text-center text-zinc-300 uppercase text-[10px] font-black tracking-widest">No entries yet for this department</div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
              {portfolios?.map((member: any, idx: number) => (
                <motion.div 
                  key={member.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: idx * 0.05 }}
                  className="group flex flex-col items-center text-center"
                >
                  <Link href={`/${activeDeptId}/${member.slug}`} className="relative aspect-[3/4] w-full overflow-hidden rounded-[20px] mb-10 bg-zinc-100 dark:bg-zinc-900 border border-black/5 dark:border-white/5 transition-all duration-1000 ease-[0.16, 1, 0.3, 1] group-hover:rounded-[40px] group-hover:shadow-[0_40px_100px_rgba(0,0,0,0.1)] dark:group-hover:shadow-[0_40px_100px_rgba(0,0,0,0.4)]">
                    {member.profile_image ? (
                      <img src={getImageUrl(member.profile_image, 400, 533)} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 ease-[0.16, 1, 0.3, 1] group-hover:scale-110" alt="" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-200"><IconUserCircle size={60} /></div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    <div className="absolute inset-0 flex flex-col items-center justify-end p-8 translate-y-8 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-700 ease-[0.16, 1, 0.3, 1]">
                      <span className="text-white text-[9px] font-black uppercase tracking-[0.2em] px-6 py-3 bg-uiupc-orange rounded-full">View Portfolio</span>
                    </div>
                  </Link>
                  <div className="space-y-3 px-4 w-full">
                    <div className="flex flex-col items-center gap-1">
                      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-uiupc-orange mb-1">Member</p>
                      <h3 className="text-2xl md:text-3xl font-black text-zinc-900 dark:text-white leading-[0.9] uppercase tracking-tighter">{member.full_name}</h3>
                    </div>
                    <div className="h-[1px] w-12 bg-black/5 dark:bg-white/5 mx-auto transition-all duration-700 group-hover:w-24 group-hover:bg-uiupc-orange/30" />
                    <p className="text-[9px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.25em]">{activeDept?.label}</p>
                  </div>
                </motion.div>
              ))}
              {(!portfolios || portfolios.length === 0) && !portfolioLoading && (
                <div className="py-20 col-span-full text-center text-zinc-300 uppercase text-[10px] font-black tracking-widest">No members found for this team</div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default DepartmentsView;
