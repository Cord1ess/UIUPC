"use client";

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { getCloudinaryUrl } from '@/features/home/components/hero/utils/constants';

interface PhotoShowcaseProps {
  photos: any[];
}

const PhotoShowcase: React.FC<PhotoShowcaseProps> = ({ photos }) => {
  if (!photos || photos.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      {photos.slice(0, 6).map((photo, index) => (
        <motion.div
          key={photo.id || index}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ 
            duration: 0.8, 
            delay: index * 0.1,
            ease: [0.23, 1, 0.32, 1] 
          }}
          className="group relative aspect-[4/5] overflow-hidden rounded-3xl bg-zinc-100 dark:bg-zinc-900 border border-black/5 dark:border-white/5"
        >
          <Image
            src={getCloudinaryUrl(photo.url, 800, 'auto:best')}
            alt={photo.title || "Featured Photo"}
            fill
            className="object-cover transition-transform duration-1000 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 p-8 flex flex-col justify-end">
            <h4 className="text-white text-xl font-black uppercase tracking-tighter leading-none mb-2">
              {photo.title || "Untitled Fragment"}
            </h4>
            <p className="text-uiupc-orange text-[10px] font-black uppercase tracking-[0.2em]">
              {photo.author || "UIUPC Visionary"}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default PhotoShowcase;
