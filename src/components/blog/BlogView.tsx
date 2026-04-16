"use client";

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSearch, FaFilter, FaNewspaper, FaFacebookMessenger, FaBullhorn } from 'react-icons/fa';
import BlogCard from './BlogCard';
import ScrollRevealText from '@/components/home/ScrollRevealText';

interface BlogViewProps {
  initialPosts: any[];
}

const BlogView: React.FC<BlogViewProps> = ({ initialPosts }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const filteredPosts = useMemo(() => {
    let result = initialPosts;

    if (activeTab !== "all") {
      result = result.filter(post => {
        const cat = (post.category || "Official").toLowerCase();
        if (activeTab === "social") return !!post.facebookLink;
        if (activeTab === "news") return cat.includes("news") || cat.includes("official");
        return cat.includes(activeTab);
      });
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(post => 
        post.title.toLowerCase().includes(q) || 
        post.description.toLowerCase().includes(q)
      );
    }

    return result;
  }, [initialPosts, activeTab, searchQuery]);

  const tabs = [
    { id: "all", label: "All Stories", icon: <FaNewspaper /> },
    { id: "news", label: "Official News", icon: <FaBullhorn /> },
    { id: "social", label: "Social Feed", icon: <FaFacebookMessenger /> },
  ];

  return (
    <div className="min-h-screen bg-[#f9f5ea] dark:bg-[#0a0a0a] pb-32">
      {/* ── ZONE 1: HERO ─────────────────────────────────────────────── */}
      <section className="pt-32 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          <ScrollRevealText 
            text="News & Updates" 
            className="text-[10vw] md:text-[5vw] font-black uppercase tracking-tighter leading-[0.85] text-zinc-900 dark:text-white"
          />
          <div className="mt-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <p className="max-w-xl text-zinc-500 dark:text-zinc-400 font-medium text-base md:text-lg leading-relaxed">
              Stories, tutorials, and behind-the-scenes updates. Your direct connection to the UIU Photography Club community.
            </p>
            
            {/* Search Input */}
            <div className="relative w-full md:w-80 group">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300 dark:text-zinc-600 transition-colors group-focus-within:text-uiupc-orange" />
              <input 
                type="text"
                placeholder="Search stories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-6 py-4 bg-white dark:bg-zinc-950 border border-black/5 dark:border-white/5 rounded-full text-sm font-bold tracking-tight outline-none focus:ring-2 focus:ring-uiupc-orange/20 focus:border-uiupc-orange transition-all shadow-sm group-hover:shadow-md"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── ZONE 2: CATEGORY NAV ──────────────────────────────────────── */}
      <section className="sticky top-24 z-50 mb-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center border-b border-black/5 dark:border-white/5">
            <div className="flex gap-8 md:gap-16">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="relative py-4 group flex items-center gap-2"
                >
                  <span className={`text-xs transition-colors duration-300 ${activeTab === tab.id ? 'text-uiupc-orange' : 'text-zinc-400'}`}>
                    {tab.icon}
                  </span>
                  <span className={`text-[10px] md:text-xs font-black uppercase tracking-[0.2em] transition-colors ${
                    activeTab === tab.id 
                      ? 'text-zinc-900 dark:text-white' 
                      : 'text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-200'
                  }`}>
                    {tab.label}
                  </span>
                  {activeTab === tab.id && (
                    <motion.div 
                      layoutId="activeTabBlog"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-uiupc-orange"
                    />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── ZONE 3: FEED CONTENT ─────────────────────────────────────── */}
      <section className="px-6">
        <div className="max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab + searchQuery}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col"
            >
              {filteredPosts.length > 0 ? (
                filteredPosts.map((post, idx) => (
                  <BlogCard key={post.id} post={post} index={idx} />
                ))
              ) : (
                <div className="py-32 text-center space-y-4">
                  <FaFilter className="mx-auto text-4xl text-zinc-200 dark:text-zinc-800" />
                  <p className="text-zinc-400 font-bold uppercase tracking-widest text-xs">No matching posts found</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
};

export default BlogView;
