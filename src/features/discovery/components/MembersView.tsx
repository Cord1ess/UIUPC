"use client";

import React, { useState, useMemo, useEffect } from 'react';

import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import { FaSearch, FaHistory, FaSpinner } from 'react-icons/fa';
import MemberCard from './MemberCard';
import ScrollRevealText from '@/components/motion/ScrollRevealText';
import { useSupabaseData } from '@/hooks/useSupabaseData';

const MembersView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeYear, setActiveYear] = useState<string | null>(null);
  const [isToolVisible, setIsToolVisible] = useState(true);
  const { scrollY } = useScroll();

  const { data: dbData, isLoading } = useSupabaseData("committees", { orderBy: 'order_index', orderDesc: false });

  const committeeData = useMemo(() => {
    return (Array.isArray(dbData) ? dbData : []).map(m => ({
      id: m.id,
      name: m.member_name,
      role: m.designation,
      department: m.department, 
      profileImage: m.image_url,
      tag: m.tag || (m.designation === "Executive Member" ? "Executives" : "Core"), 
      session: m.year,
      facebook: m.social_links?.facebook,
      instagram: m.social_links?.instagram,
      linkedin: m.social_links?.linkedin,
      website: m.social_links?.website
    }));
  }, [dbData]);

  const archiveYears = useMemo(() => {
    const years = new Set<string>();
    committeeData.forEach(m => {
      const y = m.session;
      if (y) years.add(String(y));
    });
    // Sort years descending (Current first)
    return Array.from(years).sort((a, b) => b.localeCompare(a));
  }, [committeeData]);

  // Set default active year to latest session
  useEffect(() => {
    if (archiveYears.length > 0 && !activeYear) {
      setActiveYear(archiveYears[0]);
    }
  }, [archiveYears, activeYear]);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() || 0;
    if (latest > previous && latest > 300) {
      setIsToolVisible(false);
    } else {
      setIsToolVisible(true);
    }
  });

  const groupMembers = (list: any[]) => {
    const core = list.filter(m => m.tag === "Core");
    const othersByTag: Record<string, any[]> = {};
    
    list.filter(m => m.tag !== "Core").forEach(m => {
      const tag = m.tag || "Others";
      if (!othersByTag[tag]) othersByTag[tag] = [];
      othersByTag[tag].push(m);
    });

    const hierarchy = ["Design", "Organizers", "Public Relations", "Human Resources", "Event", "Executives"];
    
    const sortedTags = Object.keys(othersByTag).sort((a, b) => {
      const idxA = hierarchy.indexOf(a);
      const idxB = hierarchy.indexOf(b);
      return (idxA > -1 ? idxA : 99) - (idxB > -1 ? idxB : 99);
    });

    return { core, othersByTag, sortedTags };
  };

  const currentYearData = useMemo(() => {
    if (!activeYear) return { core: [], othersByTag: {}, sortedTags: [] };
    const members = committeeData.filter(m => String(m.session) === activeYear);
    return groupMembers(members);
  }, [committeeData, activeYear]);

  const filteredData = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query || !activeYear) return null;

    const source = committeeData.filter(m => String(m.session) === activeYear);

    return source.filter(m => 
      (m.name || "").toLowerCase().includes(query) || 
      (m.department || m.tag || "").toLowerCase().includes(query) ||
      (m.role || "").toLowerCase().includes(query)
    );
  }, [searchQuery, activeYear, committeeData]);

  if (isLoading && archiveYears.length === 0) {
    return (
      <div className="min-h-screen bg-[#f9f5ea] dark:bg-[#0a0a0a] flex items-center justify-center">
        <FaSpinner className="animate-spin text-4xl text-uiupc-orange" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9f5ea] dark:bg-[#0a0a0a] pb-32">
      {/* ── ZONE 1: HERO & DISCOVERY ─────────────────────────────────── */}
      <section className="pt-32 pb-6 px-6 relative">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-start justify-between gap-12">
          {/* Static Branding (Left) */}
          <div className="flex-1 space-y-8">
            <ScrollRevealText 
              text="UIUPC Community" 
              className="text-[10vw] md:text-[5vw] font-black uppercase tracking-tighter leading-[0.85] text-zinc-900 dark:text-white"
            />
            <p className="max-w-xl text-zinc-500 dark:text-zinc-400 font-medium text-base md:text-lg leading-relaxed">
              Consolidating a legacy of visionaries and storytellers. From current leadership to the pioneers who built our foundation.
            </p>
          </div>

          {/* Unified Tool Hub (Right - Smart Sticky) */}
          <motion.div 
            initial={{ y: 0, opacity: 1 }}
            animate={{ 
              y: isToolVisible ? 0 : -100, 
              opacity: isToolVisible ? 1 : 0 
            }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className={`
              w-full lg:w-[440px] bg-white dark:bg-zinc-950 border border-black/10 dark:border-white/10 
              rounded-3xl shadow-xl lg:sticky lg:top-24 z-50 overflow-hidden
              ${!isToolVisible && 'pointer-events-none'}
            `}
          >
            {/* Search Input (No bottom margin) */}
            <div className="relative group border-b border-black/5 dark:border-white/5">
              <FaSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-300 dark:text-zinc-600 transition-colors group-focus-within:text-uiupc-orange" />
              <input 
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-14 pr-6 py-4 bg-transparent text-sm font-bold tracking-tight outline-none dark:text-white"
              />
            </div>

            {/* Integrated Year Selector (No top padding gap) */}
            <div className="flex items-center bg-[#f9f5ea]/30 dark:bg-white/[0.02] px-5 py-2">
              <span className="shrink-0 text-[10px] md:text-xs font-black uppercase tracking-widest text-zinc-400 mr-4">Committees:</span>
              <div className="flex-1 flex gap-6 overflow-x-auto no-scrollbar py-1">
                {archiveYears.map((year, idx) => (
                  <button
                    key={year}
                    onClick={() => { setActiveYear(year); setSearchQuery(""); }}
                    className="relative shrink-0 group"
                  >
                    <span className={`text-[10px] md:text-xs font-black uppercase tracking-[0.2em] transition-colors ${
                      activeYear === year 
                        ? 'text-uiupc-orange' 
                        : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200'
                    }`}>
                      {idx === 0 ? "Current" : year}
                    </span>
                    {activeYear === year && (
                      <motion.div 
                        layoutId="activeYear"
                        className="absolute -bottom-1 left-0 right-0 h-[1px] bg-uiupc-orange rounded-full"
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── ZONE 3: CONTENT ───────────────────────────────────────────── */}
      <section className="px-6 pt-4">
        <div className="max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            {/* SEARCH RESULTS VIEW */}
            {searchQuery && (
              <motion.div 
                key="search-results"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="space-y-8"
              >
                <div className="text-center mb-12">
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400">
                    Results for "{searchQuery}" in {activeYear}
                  </span>
                </div>
                {filteredData && filteredData.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 md:gap-x-8 gap-y-12">
                    {filteredData.map(m => <MemberCard key={m.id} member={m} />)}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <p className="text-zinc-400 font-bold uppercase tracking-widest text-xs">No matches found in this committee</p>
                  </div>
                )}
              </motion.div>
            )}

            {/* DEFAULT VIEW: CATEGORIZED GRID (Works for both 2026 and archives) */}
            {!searchQuery && activeYear && (
              <motion.div 
                key={`view-${activeYear}`}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="space-y-20"
              >
                {/* YEAR HERO (Only for archives) */}
                {activeYear !== archiveYears[0] && (
                  <div className="flex flex-col items-center text-center space-y-3 mb-20">
                    <FaHistory className="text-uiupc-orange text-3xl opacity-20" />
                    <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-zinc-900 dark:text-white">
                      UIUPC Previous Committee
                    </h2>
                    <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Documenting the foundations of UIUPC ({activeYear})</p>
                  </div>
                )}

                {/* CORE TEAM SECTION */}
                <div className="space-y-10">
                  <div className="text-left">
                    <ScrollRevealText 
                      text="Core" 
                      className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-zinc-900 dark:text-white leading-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-4 md:gap-x-8 gap-y-12">
                    {currentYearData.core.map((m, idx) => (
                      <MemberCard key={m.id || m.Timestamp} member={m} priority={idx < 5} />
                    ))}
                  </div>
                </div>

                {/* DEPARTMENT SECTIONS (Sorted) */}
                {currentYearData.sortedTags.map((tagName) => {
                  const members = currentYearData.othersByTag[tagName];
                  return (
                    <div key={tagName} className="space-y-10">
                      <div className="text-left">
                        <ScrollRevealText 
                          text={tagName} 
                          className="text-2xl md:text-4xl font-black uppercase tracking-tighter text-zinc-900 dark:text-white leading-none"
                        />
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 md:gap-x-8 gap-y-12">
                        {members.map(m => <MemberCard key={m.id || m.Timestamp} member={m} />)}
                      </div>
                    </div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* ── ZONE 4: JOIN CTA ─────────────────────────────────────────── */}
      <section className="mt-40 px-6">
        <div className="max-w-7xl mx-auto bg-zinc-950 rounded-[2rem] md:rounded-[3rem] p-8 md:p-24 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-uiupc-orange via-transparent to-transparent scale-150" />
          </div>
          
          <div className="relative z-10">
            <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter mb-8 max-w-2xl mx-auto leading-none">
              The story is just beginning.
            </h2>
            <p className="text-zinc-400 font-medium text-lg mb-12 max-w-lg mx-auto leading-relaxed">
              Step from behind the lens and into the spotlight. Join the largest creative community at UIU.
            </p>
            <a 
              href="/join" 
              className="inline-flex items-center px-10 py-5 bg-white text-black text-[10px] font-black uppercase tracking-[0.3em] rounded-full hover:bg-uiupc-orange hover:text-white transition-all transform hover:scale-110 active:scale-95 shadow-2xl"
            >
              Become a Member
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default MembersView;
