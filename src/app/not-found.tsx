"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaCamera, FaSearch } from 'react-icons/fa';
import ScrollRevealText from '@/components/motion/ScrollRevealText';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#f9f5ea] dark:bg-[#0a0a0a] transition-colors duration-500 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      {/* Cinematic Viewfinder Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-10 w-20 h-20 border-t-2 border-l-2 border-zinc-200 dark:border-white/10" />
        <div className="absolute top-10 right-10 w-20 h-20 border-t-2 border-r-2 border-zinc-200 dark:border-white/10" />
        <div className="absolute bottom-10 left-10 w-20 h-20 border-b-2 border-l-2 border-zinc-200 dark:border-white/10" />
        <div className="absolute bottom-10 right-10 w-20 h-20 border-b-2 border-r-2 border-zinc-200 dark:border-white/10" />
        
        {/* Center Crosshair */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-px bg-uiupc-orange/30" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-px h-8 bg-uiupc-orange/30" />
      </div>

      <div className="relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-[0.3em] mb-12"
        >
          <FaSearch /> Error 404
        </motion.div>

        <div className="mb-12">
            <ScrollRevealText 
              text="Frame Lost" 
              className="text-[12vw] md:text-[8vw] font-black uppercase tracking-tighter leading-[0.85] text-zinc-900 dark:text-white"
            />
        </div>

        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="max-w-md mx-auto text-zinc-500 dark:text-zinc-400 font-medium text-lg md:text-xl leading-relaxed mb-16"
        >
          The scene you're looking for was either moved out of frame or never existed in this timeline.
        </motion.p>

        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.4 }}
           className="flex flex-col sm:flex-row items-center justify-center gap-6"
        >
           <Link 
             href="/" 
             className="px-10 py-5 bg-zinc-900 dark:bg-white text-white dark:text-black text-[10px] font-black uppercase tracking-[0.3em] rounded-full hover:bg-uiupc-orange hover:text-white dark:hover:bg-uiupc-orange transition-all transform hover:scale-110 active:scale-95 shadow-2xl"
           >
             Return to Base
           </Link>
           <Link 
             href="/events" 
             className="px-10 py-5 bg-transparent border border-black/10 dark:border-white/10 text-zinc-600 dark:text-zinc-400 text-[10px] font-black uppercase tracking-[0.3em] rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-all"
           >
             Browse Events
           </Link>
        </motion.div>
      </div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 opacity-20 flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400">
        <FaCamera /> UIUPC Editorial Standard
      </div>
    </div>
  );
}
