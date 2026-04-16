"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaShareAlt, FaFacebook, FaClock, FaTag, FaArrowRight } from 'react-icons/fa';
import BlogCarousel from './BlogCarousel';

interface BlogCardProps {
  post: {
    id: string | number;
    title: string;
    description: string;
    media: any[];
    date: string;
    category?: string;
    facebookLink?: string;
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className={`group flex flex-col md:flex-row gap-8 md:gap-16 items-start py-12 md:py-20 border-b border-black/5 dark:border-white/5 last:border-none ${
        !isEven ? 'md:flex-row-reverse' : ''
      }`}
    >
      {/* Media Side */}
      <div className="w-full md:w-1/2 shrink-0">
        <motion.div 
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <BlogCarousel media={post.media} />
        </motion.div>
      </div>

      {/* Content Side */}
      <div className="w-full md:w-1/2 space-y-6 md:pt-4">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <FaClock className="text-[10px] text-zinc-400" />
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
              {post.date}
            </span>
          </div>
          <div className="h-4 w-px bg-black/10 dark:bg-white/10" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-uiupc-orange">
            {post.category || "Official"}
          </span>
        </div>

        <h2 className="text-2xl min-[400px]:text-3xl md:text-4xl lg:text-5xl font-black uppercase tracking-tighter text-zinc-900 dark:text-white leading-[0.9] break-words">
          {post.title}
        </h2>

        <div className="relative">
          <p className={`text-zinc-600 dark:text-zinc-400 text-base md:text-lg leading-relaxed ${!isExpanded ? 'line-clamp-4' : ''}`}>
            {post.description}
          </p>
          {post.description.length > 250 && (
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-900 dark:text-white hover:text-uiupc-orange transition-colors group/btn"
            >
              <span>{isExpanded ? "Show Less" : "Read Full Story"}</span>
              <FaArrowRight className={`text-[8px] transition-transform ${isExpanded ? '-rotate-90' : 'group-hover/btn:translate-x-1'}`} />
            </button>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-8 flex items-center gap-8">
          {post.facebookLink && (
            <a 
              href={post.facebookLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-900 dark:text-white hover:text-uiupc-orange transition-colors"
            >
              <FaFacebook />
              <span>Facebook</span>
            </a>
          )}
          
          <button 
            onClick={handleShare}
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
          >
            <FaShareAlt />
            <span>Share Story</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default BlogCard;
