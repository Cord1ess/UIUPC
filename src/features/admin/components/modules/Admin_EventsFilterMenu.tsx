"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { IconChevronDown } from '@/components/shared/Icons';

interface Admin_EventsFilterMenuProps {
  currentStatus: string;
  currentCategory: string;
  onStatusChange: (val: string) => void;
  onCategoryChange: (val: string) => void;
}

export const Admin_EventsFilterMenu: React.FC<Admin_EventsFilterMenuProps> = ({
  currentStatus,
  currentCategory,
  onStatusChange,
  onCategoryChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const activeFiltersCount = [
    currentStatus !== 'all',
    currentCategory !== 'all',
  ].filter(Boolean).length;

  return (
    <div ref={containerRef} className="relative w-full">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-3 text-left outline-none group/btn"
      >
        <div className="flex flex-col min-w-0">
          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-900 dark:text-white truncate">
            Filter Options
          </span>
          <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mt-0.5">
            {activeFiltersCount > 0 ? `${activeFiltersCount} Active` : 'No Filters Active'}
          </span>
        </div>
        <div className={`w-6 h-6 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 transition-all ${isOpen ? 'rotate-180 bg-uiupc-orange/10 text-uiupc-orange' : 'group-hover/btn:bg-zinc-200 dark:group-hover/btn:bg-zinc-700'}`}>
          <IconChevronDown size={10} />
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute z-[100] right-0 sm:left-0 sm:right-auto top-full mt-4 w-64 bg-white dark:bg-[#0d0d0d] border border-black/5 dark:border-white/5 rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="p-4 space-y-6">
              {/* STATUS */}
              <div className="space-y-3">
                <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Status</span>
                <div className="grid grid-cols-2 gap-2">
                  {['all', 'upcoming', 'ongoing', 'completed'].map(opt => (
                    <button
                      key={opt}
                      onClick={() => { onStatusChange(opt); }}
                      className={`py-2 px-3 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all text-center border ${
                        currentStatus === opt 
                          ? 'bg-uiupc-orange/10 border-uiupc-orange/20 text-uiupc-orange' 
                          : 'bg-zinc-50 dark:bg-zinc-900 border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800'
                      }`}
                    >
                      {opt === 'all' ? 'All' : opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* CATEGORY */}
              <div className="space-y-3">
                <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Category</span>
                <div className="grid grid-cols-2 gap-2">
                  {['all', 'workshop', 'exhibition', 'contest', 'other'].map(opt => (
                    <button
                      key={opt}
                      onClick={() => { onCategoryChange(opt); }}
                      className={`py-2 px-3 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all text-center border ${
                        currentCategory === opt 
                          ? 'bg-blue-500/10 border-blue-500/20 text-blue-500' 
                          : 'bg-zinc-50 dark:bg-zinc-900 border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800'
                      }`}
                    >
                      {opt === 'all' ? 'All' : opt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            {(currentStatus !== 'all' || currentCategory !== 'all') && (
              <div className="p-3 bg-zinc-50 dark:bg-zinc-900/50 border-t border-black/5 dark:border-white/5">
                <button
                  onClick={() => { onStatusChange('all'); onCategoryChange('all'); setIsOpen(false); }}
                  className="w-full py-2 text-[9px] font-black uppercase tracking-widest text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
