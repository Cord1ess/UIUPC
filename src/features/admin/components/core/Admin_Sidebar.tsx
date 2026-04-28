"use client";

import React, { useEffect, useRef, memo } from 'react';
import { 
  FaThLarge, 
  FaUsers, 
  FaCalendarAlt, 
  FaArchive, 
  FaImages, 
  FaShieldAlt,
  FaWallet,
  FaHistory,
  FaUserCircle,
  FaNewspaper,
  FaCamera
} from 'react-icons/fa';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import myLogo from '@/assets/UIUPC Logo.svg';
import { motion, AnimatePresence } from 'framer-motion';

interface Admin_SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
}

const ADMIN_TABS = [
  { id: 'overview', label: 'Dashboard', icon: <FaThLarge /> },
  { id: 'membership', label: 'Members', icon: <FaUsers /> },
  { id: 'committee', label: 'Committees', icon: <FaUserCircle /> },
  { id: 'events', label: 'Events', icon: <FaCalendarAlt /> },
  { id: 'photos', label: 'Entries', icon: <FaCamera /> },
  { id: 'archives', label: 'Archives', icon: <FaArchive /> },
  { id: 'gallery', label: 'Gallery', icon: <FaImages /> },
  { id: 'blog', label: 'Blog', icon: <FaNewspaper /> },
  // CORE only tabs
  { id: 'finance', label: 'Finances', icon: <FaWallet />, coreOnly: true },
  { id: 'admins', label: 'Admins', icon: <FaShieldAlt />, coreOnly: true },
  { id: 'audit', label: 'Audit', icon: <FaHistory />, coreOnly: true },
];

export const Admin_Sidebar = memo(({ activeTab, setActiveTab }: Admin_SidebarProps) => {
  const { isCore } = useSupabaseAuth();
  const filteredTabs = ADMIN_TABS.filter(tab => !tab.coreOnly || isCore);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollContainerRef.current) {
      const activeElement = scrollContainerRef.current.querySelector(`[data-tab-id="${activeTab}"]`);
      if (activeElement) {
        activeElement.scrollIntoView({
          behavior: 'smooth',
          inline: 'center',
          block: 'nearest'
        });
      }
    }
  }, [activeTab]);

  return (
    <>
      {/* ─── DESKTOP SIDEBAR ───────────────────────────────────── */}
      <aside className="hidden lg:flex fixed top-0 left-0 w-72 h-screen flex-col bg-white dark:bg-[#050505] border-r border-black/5 dark:border-white/5 z-[110]">
        
        {/* Simplified Header */}
        <div className="p-10 pb-8 flex items-center gap-4">
          <img src={myLogo.src} alt="UIUPC Logo" className="w-10 h-10 object-contain" />
          <div className="flex flex-col">
             <span className="text-[16px] font-black uppercase tracking-tighter text-zinc-900 dark:text-white leading-none">UIUPC</span>
             <span className="text-[9px] font-black uppercase tracking-[0.2em] text-uiupc-orange mt-1">Admin Panel</span>
          </div>
        </div>

        {/* Extended Nav Links */}
        <nav className="flex-1 px-8 space-y-1 overflow-y-auto custom-scrollbar pb-10">
          <div className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-400 mb-4 px-4 opacity-50">Navigation</div>
          
          {filteredTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center text-left gap-4 px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] relative group transition-colors duration-200 ${
                  isActive ? 'text-uiupc-orange' : 'text-zinc-500 dark:text-zinc-400'
                }`}
              >
                {/* Simplified High-Performance Background */}
                {isActive && (
                  <motion.div 
                    layoutId="activeTabBackground"
                    className="absolute inset-0 bg-uiupc-orange/10 border border-uiupc-orange/20 rounded-2xl z-0 shadow-sm"
                    transition={{ type: "tween", ease: [0.4, 0, 0.2, 1], duration: 0.3 }}
                  />
                )}
                
                {isActive && (
                  <motion.div 
                    layoutId="activeTabIndicator"
                    className="absolute left-0 w-1.5 h-6 bg-uiupc-orange rounded-r-full z-10"
                    transition={{ type: "tween", ease: [0.4, 0, 0.2, 1], duration: 0.3 }}
                  />
                )}

                <span className={`text-xl z-10 transition-transform duration-300 ${isActive ? 'scale-110' : 'opacity-40 group-hover:opacity-100 group-hover:scale-110'}`}>
                  {tab.icon}
                </span>
                <span className="truncate z-10">{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* ─── MOBILE BOTTOM DOCK ────────────────────────────────── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[1000] bg-white dark:bg-[#080808] border-t border-black/5 dark:border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.15)]">
        <nav 
          ref={scrollContainerRef}
          className="flex items-center gap-1 px-2 py-4 h-24 overflow-x-auto no-scrollbar"
        >
          {filteredTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                data-tab-id={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center justify-center transition-all duration-300 h-full px-8 flex-shrink-0 rounded-2xl ${
                  isActive 
                    ? 'bg-uiupc-orange text-white' 
                    : 'text-zinc-500 dark:text-zinc-400'
                }`}
              >
                <span className="text-xl shrink-0">{tab.icon}</span>
                <AnimatePresence initial={false} mode="wait">
                  {isActive && (
                    <motion.span
                      initial={{ width: 0, opacity: 0, marginLeft: 0 }}
                      animate={{ width: 'auto', opacity: 1, marginLeft: 12 }}
                      exit={{ width: 0, opacity: 0, marginLeft: 0 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap overflow-hidden"
                    >
                      {tab.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            );
          })}
          <div className="flex-shrink-0 w-20" />
        </nav>
      </div>
    </>
  );
});

Admin_Sidebar.displayName = 'Admin_Sidebar';
