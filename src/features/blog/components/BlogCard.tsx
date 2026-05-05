"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { IconShareAlt, IconFacebook, IconInstagram, IconLinkedin, IconClock, IconTag, IconArrowRight } from '@/components/shared/Icons';
import BlogCarousel from './BlogCarousel';

interface BlogCardProps {
  post: {
    id: string | number;
    title: string;
    description: string;
    media: any[];
    date: string;
    category?: string;
    facebook_url?: string;
    instagram_url?: string;
    linkedin_url?: string;
    author_email?: string;
  };
  index: number;
}

const BlogCard: React.FC<BlogCardProps> = ({ post, index }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isEven = index % 2 === 0;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: post.description.substring(0, 100),
        url: window.location.href,
      });
    }
  };

  // Safe date parsing for different formats
  const dateObj = new Date(post.date);
  const dateDay = dateObj.getDate() || '';
  const dateMonth = dateObj.toLocaleString('en-US', { month: 'short' }) || '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      className={`group flex flex-col md:flex-row gap-12 md:gap-24 items-stretch py-24 md:py-32 border-b border-black/5 dark:border-white/5 last:border-none ${
        !isEven ? 'md:flex-row-reverse' : ''
      }`}
    >
      {/* Media Side - High Fidelity Stack */}
      <div className="w-full md:w-[55%] relative shrink-0">
        <div className="absolute -top-12 -left-8 md:-left-12 z-20 pointer-events-none">
          <span className="text-[120px] font-black leading-none text-black/[0.03] dark:text-white/[0.03] select-none">
            {String(index + 1).padStart(2, '0')}
          </span>
        </div>
        
        <motion.div 
          className="relative z-10 h-full"
          whileHover={{ scale: 1.01 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <BlogCarousel media={post.media} />
        </motion.div>
        
        {/* Floating Date Badge */}
        <div className={`absolute -bottom-6 ${isEven ? 'right-6 md:-right-6' : 'left-6 md:-left-6'} z-30 p-5 bg-white dark:bg-zinc-900 shadow-2xl rounded-2xl border border-black/5 dark:border-white/5 flex flex-col items-center justify-center min-w-[80px]`}>
          <span className="text-2xl font-black text-zinc-900 dark:text-white leading-none mb-1">{dateDay}</span>
          <span className="text-[10px] font-black uppercase tracking-widest text-uiupc-orange">{dateMonth}</span>
        </div>
      </div>

      {/* Content Side - Editorial Focus */}
      <div className="w-full md:w-[45%] flex flex-col justify-center space-y-8">
        <div className="flex items-center gap-6">
          <span className="px-4 py-1.5 rounded-full bg-uiupc-orange/10 border border-uiupc-orange/20 text-[9px] font-black uppercase tracking-[0.3em] text-uiupc-orange">
            {post.category || post.tags || "Update"}
          </span>
          <div className="h-px flex-1 bg-black/10 dark:bg-white/10" />
        </div>

        <h2 className="text-3xl min-[400px]:text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tighter text-zinc-900 dark:text-white leading-[0.85] break-words">
          {post.title}
        </h2>

        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.p 
              key={isExpanded ? 'expanded' : 'collapsed'}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`text-zinc-600 dark:text-zinc-400 text-lg md:text-xl leading-relaxed font-medium ${!isExpanded ? 'line-clamp-4' : ''}`}
            >
              {post.description}
            </motion.p>
          </AnimatePresence>
          
          {post.description.length > 250 && (
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-8 flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.4em] text-zinc-900 dark:text-white hover:text-uiupc-orange transition-all group/btn"
            >
              <div className="w-8 h-[2px] bg-uiupc-orange transition-all group-hover/btn:w-16" />
              <span>{isExpanded ? "Show Less" : "Read More"}</span>
              <IconArrowRight size={10} className={`transition-transform ${isExpanded ? '-rotate-90' : 'group-hover/btn:translate-x-2'}`} />
            </button>
          )}
        </div>

        {/* Footer Actions - Premium Typography with multi-social support */}
        <div className="pt-10 flex flex-wrap items-center gap-8 border-t border-black/5 dark:border-white/5">
          {post.facebook_url && (
            <motion.a 
              whileHover={{ y: -2 }}
              href={post.facebook_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-zinc-900 dark:text-white hover:text-uiupc-orange transition-all"
            >
              <IconFacebook size={16} />
              <span className="hidden sm:inline">Facebook</span>
            </motion.a>
          )}
          {post.instagram_url && (
            <motion.a 
              whileHover={{ y: -2 }}
              href={post.instagram_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-zinc-900 dark:text-white hover:text-pink-500 transition-all"
            >
              <IconInstagram size={16} />
              <span className="hidden sm:inline">Instagram</span>
            </motion.a>
          )}
          {post.linkedin_url && (
            <motion.a 
              whileHover={{ y: -2 }}
              href={post.linkedin_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-zinc-900 dark:text-white hover:text-blue-500 transition-all"
            >
              <IconLinkedin size={16} />
              <span className="hidden sm:inline">LinkedIn</span>
            </motion.a>
          )}
          
          <div className="h-4 w-px bg-black/5 dark:bg-white/5 hidden sm:block" />

          <motion.button 
            whileHover={{ x: 5 }}
            onClick={handleShare}
            className="flex items-center gap-3 text-[9px] font-black uppercase tracking-[0.25em] text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-all"
          >
            <IconShareAlt size={16} />
            <span>Share</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default BlogCard;
