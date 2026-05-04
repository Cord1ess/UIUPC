"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'motion/react';
import { getImageUrl } from '@/utils/imageUrl';
import { IconArrowRight } from '@/components/shared/Icons';

interface PhotoShowcaseProps {
  photos: any[];
}

const PhotoShowcase: React.FC<PhotoShowcaseProps> = ({ photos }) => {
  if (!photos || photos.length === 0) return null;

  // Take only the first 5 photos
  const displayPhotos = photos.slice(0, 5);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {displayPhotos.map((photo, index) => (
        <motion.div
          key={photo.id || index}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "0px 0px -50px 0px" }}
          transition={{ 
            duration: 0.8, 
            delay: index * 0.1,
            ease: [0.23, 1, 0.32, 1] 
          }}
          className="group relative aspect-[4/5] overflow-hidden rounded-3xl bg-zinc-100 dark:bg-zinc-900 border border-black/5 dark:border-white/5 shadow-sm"
        >
          <Image
            src={getImageUrl(photo.url, 800, 80)}
            alt={photo.title || "Featured Photo"}
            fill
            className="object-cover transition-transform duration-1000 group-hover:scale-110"
          />
          {/* Subtle Overlay on Hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 p-8 flex flex-col justify-end">
            <h4 className="text-white text-xl font-black uppercase tracking-tighter leading-none mb-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
              {photo.title || "Untitled Fragment"}
            </h4>
            <p className="text-uiupc-orange text-[10px] font-black uppercase tracking-[0.2em] translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-75">
              {photo.photographer || "UIUPC Member"}
            </p>
          </div>
        </motion.div>
      ))}

      {/* 6th Card: View All */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "0px 0px -50px 0px" }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="relative aspect-[4/5] overflow-hidden rounded-3xl group"
      >
        <Link 
          href="/gallery"
          className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-uiupc-orange dark:hover:bg-uiupc-orange hover:text-white dark:hover:text-white transition-all duration-500 shadow-xl overflow-hidden"
        >
          {/* Decorative Pattern / Accent */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 dark:bg-black/5 rounded-full blur-3xl group-hover:bg-white/20 transition-all" />
          
          <div className="relative z-10 flex flex-col items-center gap-6">
             <div className="w-16 h-16 rounded-full border-2 border-current flex items-center justify-center group-hover:scale-110 group-hover:rotate-45 transition-all duration-500">
               <IconArrowRight size={24} className="-rotate-45 group-hover:rotate-0 transition-all" />
             </div>
             
             <div className="text-center">
               <span className="block text-[10px] font-black uppercase tracking-[0.4em] opacity-60 mb-2">Explore more</span>
               <h4 className="text-3xl font-black uppercase tracking-tighter leading-none">
                 View All<br />Photos
               </h4>
             </div>
          </div>
        </Link>
      </motion.div>
    </div>
  );
};

export default PhotoShowcase;
