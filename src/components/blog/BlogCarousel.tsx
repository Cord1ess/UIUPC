"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

interface MediaItem {
  type: 'image' | 'video';
  url: string;
  caption?: string;
}

interface BlogCarouselProps {
  media: MediaItem[];
}

const BlogCarousel: React.FC<BlogCarouselProps> = ({ media }) => {
  const [index, setIndex] = useState(0);

  if (!media || media.length === 0) return null;

  const next = () => setIndex((prev) => (prev + 1) % media.length);
  const prev = () => setIndex((prev) => (prev - 1 + media.length) % media.length);

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-black/5 dark:border-white/5 group">
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
          className="absolute inset-0"
        >
          {media[index].type === 'image' ? (
            <img 
              src={media[index].url} 
              alt={media[index].caption || "Blog media"} 
              className="w-full h-full object-cover"
            />
          ) : (
            <video 
              src={media[index].url} 
              className="w-full h-full object-cover" 
              autoPlay muted loop playsInline
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      {media.length > 1 && (
        <>
          <div className="absolute inset-0 flex items-center justify-between p-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              onClick={(e) => { e.preventDefault(); prev(); }}
              className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white hover:text-black transition-all"
            >
              <FaChevronLeft />
            </button>
            <button 
              onClick={(e) => { e.preventDefault(); next(); }}
              className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white hover:text-black transition-all"
            >
              <FaChevronRight />
            </button>
          </div>

          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5">
            {media.map((_, i) => (
              <div 
                key={i} 
                className={`h-1 rounded-full transition-all duration-300 ${i === index ? 'w-6 bg-uiupc-orange' : 'w-1 bg-white/40'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default BlogCarousel;
