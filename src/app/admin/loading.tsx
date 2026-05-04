"use client";

import React from 'react';
import { motion } from 'motion/react';
import { IconSpinner } from '@/components/shared/Icons';

export default function AdminLoading() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-6">
      <div className="relative">
        {/* Cinematic pulse rings */}
        <motion.div 
          animate={{ scale: [1, 1.5], opacity: [0.3, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
          className="absolute inset-0 rounded-full border-2 border-uiupc-orange"
        />
        <motion.div 
          animate={{ scale: [1, 1.2], opacity: [0.5, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 0.5 }}
          className="absolute inset-0 rounded-full border-2 border-uiupc-orange"
        />
        
        {/* Main centered spinner */}
        <div className="relative bg-white dark:bg-zinc-900 w-20 h-20 rounded-full flex items-center justify-center shadow-2xl border border-black/5 dark:border-white/5">
          <IconSpinner size={32} className="text-uiupc-orange animate-spin-slow" />
        </div>
      </div>

      <div className="mt-12 text-center space-y-4">
        <motion.h2 
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-2xl font-black uppercase tracking-tighter text-zinc-900 dark:text-white"
        >
          Synchronizing Vision
        </motion.h2>
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-400">
          Fetching secure assets...
        </p>
      </div>

      {/* Decorative scanning line */}
      <div className="mt-16 w-48 h-1 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden relative">
        <motion.div 
          animate={{ x: [-200, 200] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 w-24 bg-gradient-to-r from-transparent via-uiupc-orange to-transparent"
        />
      </div>
    </div>
  );
}
