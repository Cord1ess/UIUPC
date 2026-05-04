"use client";

import React, { useEffect, useMemo } from 'react';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { AdminDataProvider } from "@/contexts/AdminDataContext";
import { Admin_Sidebar } from '@/features/admin/components/core/Admin_Sidebar';
import { motion, AnimatePresence } from 'motion/react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useSupabaseAuth();
  const router = useRouter();
  const pathname = usePathname();

  const activeTab = useMemo(() => {
    if (pathname === '/admin') return 'overview';
    if (pathname.startsWith('/admin/members')) return 'membership';
    if (pathname.startsWith('/admin/committee')) return 'committee';
    if (pathname.startsWith('/admin/submissions')) return 'photos';
    if (pathname.startsWith('/admin/events')) return 'events';
    if (pathname.startsWith('/admin/blog')) return 'blog';
    if (pathname.startsWith('/admin/gallery')) return 'gallery';
    if (pathname.startsWith('/admin/departments')) return 'departments';
    if (pathname.startsWith('/admin/achievements')) return 'achievements';
    if (pathname.startsWith('/admin/finances')) return 'finance';
    if (pathname.startsWith('/admin/audit')) return 'audit';
    if (pathname.startsWith('/admin/admins')) return 'admins';
    if (pathname.startsWith('/admin/event_map')) return 'event_map';
    return 'overview';
  }, [pathname]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0a0a0a] flex flex-col items-center justify-center relative overflow-hidden isolate">
        {/* Background Texture */}
        <div className="absolute inset-0 bg-grid-zinc-100/50 dark:bg-grid-white/[0.02] -z-10" />
        
        {/* Flare */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-uiupc-orange/5 blur-[120px] rounded-full -z-10" />

        <div className="relative">
          {/* Cinematic pulse rings */}
          <motion.div 
            animate={{ scale: [1, 1.6], opacity: [0.3, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
            className="absolute inset-0 rounded-full border-2 border-uiupc-orange"
          />
          <motion.div 
            animate={{ scale: [1, 1.3], opacity: [0.5, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 0.5 }}
            className="absolute inset-0 rounded-full border-2 border-uiupc-orange"
          />
          
          <div className="relative bg-white dark:bg-zinc-900 w-24 h-24 rounded-full flex items-center justify-center shadow-2xl border border-black/5 dark:border-white/5">
            <div className="w-12 h-12 border-4 border-zinc-100 dark:border-zinc-800 border-t-uiupc-orange rounded-full animate-spin" />
          </div>
        </div>

        <div className="mt-12 text-center space-y-3">
          <h2 className="text-3xl font-black uppercase tracking-tighter text-zinc-900 dark:text-white leading-none">
            Authenticating
          </h2>
          <p className="text-[10px] font-black uppercase tracking-[0.6em] text-zinc-400">
            Establishing Secure Session
          </p>
        </div>
      </div>
    );
  }

  return (
    <AdminDataProvider>
      <div className="flex min-h-screen bg-[#fcfcfc] dark:bg-[#0d0d0d] transition-colors duration-500 relative isolate">
        
        {/* Background Texture */}
        <div className="fixed inset-0 bg-grid-zinc-100/50 dark:bg-grid-white/[0.02] pointer-events-none -z-10" />
        
        <Admin_Sidebar 
          activeTab={activeTab} 
          isMobileMenuOpen={false} 
          setIsMobileMenuOpen={() => {}} 
        />
        
        <main className="flex-1 lg:ml-72 min-w-0 h-screen overflow-y-auto custom-scrollbar relative">
          <div>
            <AnimatePresence mode="wait">
               <motion.div
                 key={pathname}
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, y: -10 }}
                 transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
               >
                 {children}
               </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </AdminDataProvider>
  );
}
