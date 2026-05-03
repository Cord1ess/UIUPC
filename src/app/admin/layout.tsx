"use client";

import React, { useEffect } from 'react';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { AdminDataProvider } from "@/contexts/AdminDataContext";
import { Admin_Sidebar } from '@/features/admin/components/core/Admin_Sidebar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useSupabaseAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Determine active tab from pathname (e.g., /admin/members -> membership)
  const getActiveTab = () => {
    if (pathname === '/admin') return 'overview';
    if (pathname.startsWith('/admin/members')) return 'membership';
    if (pathname.startsWith('/admin/committee')) return 'committee';
    if (pathname.startsWith('/admin/submissions')) return 'photos';
    if (pathname.startsWith('/admin/events')) return 'events';
    if (pathname.startsWith('/admin/finances')) return 'finance';
    return 'overview';
  };

  const activeTab = getActiveTab();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#f9f5ea] dark:bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-12 h-12 border-[3px] border-black/10 dark:border-white/10 border-t-uiupc-orange rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <AdminDataProvider>
      <div className="flex min-h-screen bg-[#f9f5ea] dark:bg-[#0a0a0a] transition-colors duration-500 pt-0 overflow-hidden">
        <Admin_Sidebar 
          activeTab={activeTab} 
          setActiveTab={(tab) => {
            // This is just for backward compatibility during transition
            const routes: Record<string, string> = {
              overview: '/admin',
              membership: '/admin/members',
              committee: '/admin/committee',
              photos: '/admin/submissions',
              events: '/admin/events',
              finance: '/admin/finances'
            };
            if (routes[tab]) router.push(routes[tab]);
          }} 
          isMobileMenuOpen={false} 
          setIsMobileMenuOpen={() => {}} 
        />
        
        <main className="flex-1 lg:ml-72 min-w-0 overflow-y-auto no-scrollbar h-screen">
          <div className="p-8">
            {children}
          </div>
        </main>
      </div>
    </AdminDataProvider>
  );
}
