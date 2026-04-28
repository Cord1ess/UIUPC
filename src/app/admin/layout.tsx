"use client";

import React, { useEffect } from 'react';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useRouter } from 'next/navigation';
import GlobalLoader from '@/components/shared/GlobalLoader';

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
        <GlobalLoader />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f9f5ea] dark:bg-[#0a0a0a] transition-colors duration-500 pt-0">
      {children}
    </div>
  );
}
