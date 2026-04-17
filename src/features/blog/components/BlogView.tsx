"use client";

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import { FaSearch, FaFilter, FaNewspaper, FaFacebookMessenger, FaBullhorn } from 'react-icons/fa';
import BlogCard from './BlogCard';
import ScrollRevealText from '@/components/motion/ScrollRevealText';

interface BlogViewProps {
  initialPosts: any[];
}

const BlogView: React.FC<BlogViewProps> = ({ initialPosts }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [isToolVisible, setIsToolVisible] = useState(true);

  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() || 0;
    if (latest > previous && latest > 300) {
      setIsToolVisible(false);
    } else {
      setIsToolVisible(true);
    }
  });

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
      {/* ── ZONE 1: HERO & DISCOVERY ─────────────────────────────────── */}
      <section className="pt-32 pb-6 px-6 relative">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-start justify-between gap-12">
          {/* Static Branding (Left) */}
          <div className="flex-1 space-y-8">
            <ScrollRevealText 
              text="News & Updates" 
              className="text-[10vw] md:text-[5vw] font-black uppercase tracking-tighter leading-[0.85] text-zinc-900 dark:text-white"
            />
            <p className="max-w-xl text-zinc-500 dark:text-zinc-400 font-medium text-base md:text-lg leading-relaxed">
              Stories, tutorials, and behind-the-scenes updates. Your direct connection to the UIU Photography Club community.
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
            {/* Search Input */}
            <div className="relative group border-b border-black/5 dark:border-white/5">
              <FaSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-300 dark:text-zinc-600 transition-colors group-focus-within:text-uiupc-orange" />
              <input 
                type="text"
                placeholder="Search stories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-14 pr-6 py-4 bg-transparent text-sm font-bold tracking-tight outline-none dark:text-white"
              />
            </div>

            {/* Category Tabs */}
            <div className="flex items-center bg-[#f9f5ea]/30 dark:bg-white/[0.02] px-6 py-2 overflow-x-auto no-scrollbar">
              <div className="flex gap-8">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className="relative py-3 group flex items-center gap-2 whitespace-nowrap"
                  >
                    <span className={`text-[10px] transition-colors duration-300 ${activeTab === tab.id ? 'text-uiupc-orange' : 'text-zinc-400'}`}>
                      {tab.icon}
                    </span>
                    <span className={`text-[10px] font-black uppercase tracking-[0.2em] transition-colors ${
                      activeTab === tab.id 
                        ? 'text-zinc-900 dark:text-white' 
                        : 'text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-200'
                    }`}>
                      {tab.label}
                    </span>
                    {activeTab === tab.id && (
                      <motion.div 
                        layoutId="activeTabBlog"
                        className="absolute bottom-0 left-0 right-0 h-[1px] bg-uiupc-orange"
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── ZONE 3: FEED CONTENT ─────────────────────────────────────── */}
      <section className="px-6 pt-4">
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
