"use client";

import React, { useEffect } from 'react';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useRouter } from 'next/navigation';
import GlobalLoader from '@/components/shared/GlobalLoader';
import { AdminDataProvider } from "@/contexts/AdminDataContext";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useSupabaseAuth();

  const router = useRouter();

  // Unified Auth Guard for all admin pages
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
      <div className="flex min-h-screen bg-[#f9f5ea] dark:bg-[#0a0a0a] transition-colors duration-500 pt-0">
        {children}
      </div>
    </AdminDataProvider>
  );
}
