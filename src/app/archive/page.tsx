"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FaArchive, 
  FaHistory, 
  FaTrophy, 
  FaCameraRetro, 
  FaSearch, 
  FaFilter,
  FaChevronRight,
  FaExpand,
  FaDownload
} from "react-icons/fa";
import Image from "next/image";
import ScrollRevealText from "@/components/motion/ScrollRevealText";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import GlobalLoader from "@/components/shared/GlobalLoader";
import AchievementTimeline from "@/features/achievements/components/AchievementTimeline";
import { getImageUrl } from "@/utils/imageUrl";

// ============================================================
// Main Page Component
// ============================================================

const HistoricArchivePage = () => {
  const [activeTab, setActiveTab] = useState<"gallery" | "milestones" | "repository">("gallery");
  const { data: submissions, isLoading: subsLoading } = useSupabaseData('exhibition_submissions', { 
    filters: { status: 'selected' } 
  });
  const { data: events, isLoading: eventsLoading } = useSupabaseData('events', { 
    filters: { category: 'exhibition' } 
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEventId, setSelectedEventId] = useState("all");
  const [viewingPhoto, setViewingPhoto] = useState<any>(null);

  const filteredPhotos = useMemo(() => {
    return submissions.filter((sub: any) => {
      const matchesEvent = selectedEventId === "all" || sub.event_id === selectedEventId;
      const matchesSearch = sub.participant_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           sub.institute?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesEvent && matchesSearch;
    });
  }, [submissions, selectedEventId, searchTerm]);

  if (subsLoading || eventsLoading) return <GlobalLoader />;

  return (
    <div className="min-h-screen bg-[#f9f5ea] dark:bg-[#0a0a0a] transition-colors duration-500 pt-32 pb-40 overflow-x-hidden">
      {/* ── HERO SECTION ─────────────────────────────────────────── */}
      <section className="max-w-[1440px] mx-auto px-6 mb-32">
        <div className="flex flex-col lg:flex-row items-end justify-between gap-12">
          <div className="space-y-8 max-w-4xl">
            <div className="flex items-center gap-4">
              <span className="w-12 h-[1px] bg-uiupc-orange" />
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-400">The Living Legacy</span>
            </div>
            <ScrollRevealText 
              text="Historic Archive" 
              className="text-[12vw] md:text-[8vw] font-black uppercase tracking-tighter leading-[0.85] text-zinc-900 dark:text-white"
            />
            <p className="text-zinc-500 dark:text-zinc-400 font-medium text-lg md:text-xl leading-relaxed max-w-2xl font-serif italic">
              "A digital vault documenting the visual journey of UIUPC. From the first shutter click to global recognitions, our history is a curated mission of vision."
            </p>
          </div>
          
          {/* Navigation Tabs */}
          <div className="flex flex-wrap items-center gap-4 bg-white/50 dark:bg-white/5 backdrop-blur-xl p-2 rounded-2xl border border-black/5 dark:border-white/5">
            {[
              { id: "gallery", label: "Exhibition Hall", icon: <FaCameraRetro /> },
              { id: "milestones", label: "Milestones", icon: <FaTrophy /> },
              { id: "repository", label: "Repository", icon: <FaArchive /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-8 py-4 rounded-xl flex items-center gap-3 text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeTab === tab.id 
                    ? "bg-zinc-900 text-white dark:bg-white dark:text-black shadow-2xl" 
                    : "text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTENT SWITCHER ─────────────────────────────────────── */}
      <main className="max-w-[1440px] mx-auto px-6">
        <AnimatePresence mode="wait">
          {activeTab === "gallery" && (
            <motion.div 
              key="gallery"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-16"
            >
              {/* Filters */}
              <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="w-full md:w-[400px] relative group">
                  <FaSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-300 dark:text-zinc-700 transition-colors group-focus-within:text-uiupc-orange" />
                  <input 
                    type="text"
                    placeholder="Search photographer or school..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-16 pr-8 py-5 bg-white dark:bg-[#050505] rounded-[2rem] border border-black/5 dark:border-white/5 outline-none focus:border-uiupc-orange text-xs font-bold tracking-tight text-zinc-900 dark:text-white transition-all shadow-sm"
                  />
                </div>
                
                <select 
                  value={selectedEventId}
                  onChange={(e) => setSelectedEventId(e.target.value)}
                  className="px-8 py-5 bg-white dark:bg-[#050505] rounded-[2rem] border border-black/5 dark:border-white/5 outline-none focus:border-uiupc-orange text-[10px] font-black uppercase tracking-widest dark:text-white appearance-none cursor-pointer shadow-sm"
                >
                  <option value="all">All Shutter Stories</option>
                  {events.map((e: any) => (
                    <option key={e.id} value={e.id}>{e.title}</option>
                  ))}
                </select>
              </div>

              {/* Masonry Grid */}
              <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-8 space-y-8">
                {filteredPhotos.map((sub: any, idx: number) => (
                  <motion.div 
                    key={sub.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => setViewingPhoto(sub)}
                    className="break-inside-avoid group relative bg-white dark:bg-zinc-950 rounded-[2.5rem] overflow-hidden cursor-pointer shadow-2xl shadow-black/5 border border-black/5 dark:border-white/5"
                  >
                    <Image 
                      src={getImageUrl(sub.photo_url, 800, 80)}
                      alt={sub.participant_name}
                      width={800}
                      height={1000}
                      className="w-full h-auto object-cover transition-transform duration-1000 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 p-8 flex flex-col justify-end">
                      <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-500 space-y-2">
                        <span className="text-[8px] font-black uppercase tracking-[0.4em] text-uiupc-orange">Selected Work</span>
                        <h4 className="text-white font-black text-xl leading-tight">{sub.participant_name}</h4>
                        <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest">{sub.institute}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {filteredPhotos.length === 0 && (
                <div className="py-40 text-center space-y-6">
                  <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-900 rounded-[2.5rem] flex items-center justify-center mx-auto text-3xl text-zinc-300">
                    <FaArchive />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-400">No records match this query</p>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "milestones" && (
            <motion.div 
              key="milestones"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="mb-20 text-center max-w-2xl mx-auto space-y-4">
                 <h3 className="text-4xl font-black uppercase tracking-tighter dark:text-white">The Achievement Hall</h3>
                 <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Chronological records of prestige and growth.</p>
              </div>
              <AchievementTimeline />
            </motion.div>
          )}

          {activeTab === "repository" && (
            <motion.div 
              key="repository"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
               {events.map((e: any) => (
                 <div key={e.id} className="p-10 bg-white dark:bg-[#050505] rounded-[2.5rem] border border-black/5 dark:border-white/5 hover:border-uiupc-orange/30 transition-all group">
                    <div className="flex items-center justify-between mb-8">
                       <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-900 rounded-2xl flex items-center justify-center text-uiupc-orange">
                          <FaHistory />
                       </div>
                       <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{new Date(e.event_date).getFullYear()}</span>
                    </div>
                    <h4 className="text-2xl font-black uppercase tracking-tighter text-zinc-900 dark:text-white mb-2">{e.title}</h4>
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-8">{e.location}</p>
                    <button className="w-full py-4 border border-black/5 dark:border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-zinc-900 dark:hover:bg-white hover:text-white dark:hover:text-black transition-all flex items-center justify-center gap-3">
                       Enter Repository <FaChevronRight />
                    </button>
                 </div>
               ))}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ── LIGHTBOX ────────────────────────────────────────────── */}
      <AnimatePresence>
        {viewingPhoto && (
          <div className="fixed inset-0 z-[5000] flex items-center justify-center p-6 md:p-12">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/98 backdrop-blur-3xl"
              onClick={() => setViewingPhoto(null)}
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-6xl bg-zinc-950 rounded-[3rem] overflow-hidden flex flex-col lg:flex-row shadow-3xl border border-white/10"
            >
              <div className="flex-[2] bg-black flex items-center justify-center p-4">
                <Image 
                  src={getImageUrl(viewingPhoto.photo_url, 1600, 90)}
                  alt={viewingPhoto.participant_name}
                  width={1600}
                  height={1200}
                  className="max-w-full max-h-[85vh] object-contain"
                />
              </div>
              <div className="flex-1 p-12 flex flex-col justify-between border-l border-white/5">
                <div className="space-y-12">
                  <div className="space-y-4">
                    <span className="px-4 py-1.5 bg-uiupc-orange/10 text-uiupc-orange text-[8px] font-black uppercase tracking-widest rounded-full">Historical Asset</span>
                    <h3 className="text-4xl font-black uppercase tracking-tighter text-white">{viewingPhoto.participant_name}</h3>
                    <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">{viewingPhoto.institute}</p>
                  </div>
                  
                  <div className="space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Event Context</p>
                    <div className="p-6 bg-white/5 rounded-2xl border border-white/5">
                       <p className="text-white text-xs font-bold uppercase tracking-widest">
                         {events.find((e: any) => e.id === viewingPhoto.event_id)?.title || "Shutter Stories Archive"}
                       </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-12">
                  <button className="flex-1 py-5 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-uiupc-orange hover:text-white transition-all flex items-center justify-center gap-3">
                    <FaDownload /> Download Asset
                  </button>
                  <button onClick={() => setViewingPhoto(null)} className="w-20 py-5 bg-white/5 text-white rounded-2xl flex items-center justify-center hover:bg-white/10">
                    <FaExpand />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HistoricArchivePage;
