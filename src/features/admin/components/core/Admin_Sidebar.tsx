"use client";

import React, { useEffect, useRef, memo, useMemo } from 'react';
import { 
  IconDashboard, IconUsers, IconCalendar, IconFileAlt, IconImages, 
  IconShield, IconWallet, IconHistory, IconUserCircle, IconNewspaper, 
  IconCamera, IconMap, IconLayerGroup, IconAward
} from '@/components/shared/Icons';
import { useSupabaseAuth, canAccessPage } from '@/contexts/SupabaseAuthContext';
import myLogo from '@/assets/UIUPC Logo.svg';
import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';

interface Admin_SidebarProps {
  activeTab: string;
  setActiveTab?: (tab: string) => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
}

const ADMIN_TABS = [
  { id: 'overview', label: 'Overview', icon: <IconDashboard />, href: '/admin' },
  { id: 'membership', label: 'Members', icon: <IconUsers />, href: '/admin/members' },
  { id: 'committee', label: 'Committee', icon: <IconUserCircle />, href: '/admin/committee' },
  { id: 'events', label: 'Events', icon: <IconCalendar />, href: '/admin/events' },
  { id: 'event_map', label: 'Live Map', icon: <IconMap />, href: '/admin/event_map' },
  { id: 'photos', label: 'Exhibition', icon: <IconCamera />, href: '/admin/submissions' },
  { id: 'gallery', label: 'Gallery', icon: <IconImages />, href: '/admin/gallery' },
  { id: 'blog', label: 'Blog', icon: <IconNewspaper />, href: '/admin/blog' },
  { id: 'departments', label: 'Departments', icon: <IconLayerGroup />, href: '/admin/departments' },
  { id: 'achievements', label: 'Achievements', icon: <IconAward />, href: '/admin/achievements' },
  { id: 'finance', label: 'Finance', icon: <IconWallet />, href: '/admin/finances' },
  { id: 'admins', label: 'Admins', icon: <IconShield />, href: '/admin/admins' },
  { id: 'audit', label: 'Audit', icon: <IconHistory />, href: '/admin/audit' },
];

export const Admin_Sidebar = memo(({ activeTab }: Admin_SidebarProps) => {
  const { adminProfile } = useSupabaseAuth();
  
  const filteredTabs = useMemo(() => {
    return ADMIN_TABS.filter(tab => canAccessPage(adminProfile?.role, tab.id));
  }, [adminProfile?.role]);

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
      <aside className="hidden lg:flex fixed top-0 left-0 w-72 h-screen flex-col bg-white dark:bg-[#0d0d0d] border-r border-zinc-200 dark:border-zinc-800 z-[110] shadow-sm">
        
        <div className="p-10 pb-12 flex items-center gap-4">
          <img src={myLogo.src} alt="UIUPC Logo" className="w-10 h-10 object-contain" />
          <div className="flex flex-col">
             <span className="text-[16px] font-black uppercase tracking-tighter text-zinc-900 dark:text-white leading-none">UIUPC</span>
             <span className="text-[9px] font-black uppercase tracking-[0.2em] text-uiupc-orange mt-1">Admin Panel</span>
          </div>
        </div>

        <nav className="flex-1 px-8 space-y-1 overflow-y-auto custom-scrollbar pb-10">
          <div className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-400 mb-6 px-6 opacity-50">Navigation Hub</div>
          
          {filteredTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <Link 
                key={tab.id}
                href={tab.href}
                className={`w-full flex items-center text-left gap-4 px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] relative group transition-all duration-300 ${
                  isActive ? 'text-uiupc-orange' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                {isActive && (
                  <motion.div 
                    layoutId="activeTabBackground"
                    className="absolute inset-0 bg-uiupc-orange/10 border border-uiupc-orange/20 rounded-2xl z-0 shadow-inner"
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
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* ─── MOBILE BOTTOM DOCK ────────────────────────────────── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[1000] bg-white dark:bg-[#0d0d0d] border-t border-zinc-200 dark:border-zinc-800 shadow-[0_-10px_40px_rgba(0,0,0,0.15)]">
        <nav 
          ref={scrollContainerRef}
          className="flex items-center gap-1 px-2 py-4 h-24 overflow-x-auto no-scrollbar"
        >
          {filteredTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <Link
                key={tab.id}
                href={tab.href}
                data-tab-id={tab.id}
                className={`flex items-center justify-center transition-all duration-300 h-full px-8 flex-shrink-0 rounded-2xl ${
                  isActive 
                    ? 'bg-uiupc-orange text-white shadow-lg shadow-uiupc-orange/20' 
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
              </Link>
            );
          })}
          <div className="flex-shrink-0 w-20" />
        </nav>
      </div>
    </>
  );
});

Admin_Sidebar.displayName = 'Admin_Sidebar';
