"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import type { User, Session } from '@supabase/supabase-js';
import type { AdminRole } from '@/types/admin';

// Re-export for convenience
export type { AdminRole };

// ============================================================
// Role → Permitted Pages mapping
// ============================================================
const ROLE_PAGE_ACCESS: Record<AdminRole, string[]> = {
  core: ['all'],
  hr: ['overview', 'membership', 'committee'],
  pr: ['overview', 'blog', 'gallery', 'achievements'],
  event: ['overview', 'events', 'event_map', 'photos'],
  organizer: ['overview', 'events', 'finance'],
  design: ['overview', 'departments'],
  visual: ['overview', 'departments'],
  alumni_advisor: ['overview'],
};

export function canAccessPage(role: AdminRole | undefined, pageId: string): boolean {
  if (!role) return false;
  const allowed = ROLE_PAGE_ACCESS[role];
  return allowed.includes('all') || allowed.includes(pageId);
}

// ============================================================
// Types
// ============================================================

export interface AdminProfile {
  id: string;
  email: string;
  display_name: string;
  role: AdminRole;
  is_active: boolean;
}

interface SupabaseAuthContextType {
  user: User | null;
  session: Session | null;
  adminProfile: AdminProfile | null;
  loading: boolean;
  isCore: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  changePassword: (newPassword: string) => Promise<{ error: string | null }>;
}

// ============================================================
// Context
// ============================================================

const SupabaseAuthContext = createContext<SupabaseAuthContextType | undefined>(undefined);

export function useSupabaseAuth() {
  const context = useContext(SupabaseAuthContext);
  if (context === undefined) {
    throw new Error('useSupabaseAuth must be used within a SupabaseAuthProvider');
  }
  return context;
}

// ============================================================
// Provider
// ============================================================

interface ProviderProps {
  children: ReactNode;
}

export function SupabaseAuthProvider({ children }: ProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [adminProfile, setAdminProfile] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const lastFetchedEmailRef = React.useRef<string | null>(null);

  // Fetch admin profile from the admins table
  const fetchAdminProfile = async (email: string, mounted: boolean) => {
    // Avoid redundant fetches if the email hasn't changed
    if (lastFetchedEmailRef.current === email && adminProfile) return;
    
    try {
      const { data, error } = await supabase
        .from('admins')
        .select('*')
        .eq('email', email)
        .maybeSingle();

      if (!mounted) return;

      if (error) {
        // Silently handle AbortErrors or typical race condition cancellations
        if (error.message?.includes('AbortError') || error.message?.includes('broken by another request')) {
          return;
        }
        console.error('Supabase error fetching admin profile:', error.message);
        setAdminProfile(null);
        return;
      }

      if (!data) {
        setAdminProfile(null);
        return;
      }

      lastFetchedEmailRef.current = email;
      setAdminProfile({
        id: data.id,
        email: data.email,
        display_name: data.display_name,
        role: data.role as AdminRole,
        is_active: data.is_active,
      });
    } catch (err) {
      if (mounted) {
        console.error('Unexpected error in fetchAdminProfile:', err);
      }
    }
  };

  useEffect(() => {
    let mounted = true;

    // Listen for auth changes - this is the source of truth
    // It also handles the initial session check on mount
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        const currentUser = session?.user ?? null;
        setSession(session);
        setUser(currentUser);

        if (currentUser?.email) {
          await fetchAdminProfile(currentUser.email, mounted);
        } else {
          lastFetchedEmailRef.current = null;
          setAdminProfile(null);
        }
        
        setLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { error: error.message };
    }
    return { error: null };
  };

  // Sign out
  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setAdminProfile(null);
  };

  // Change password (for logged-in admins)
  const changePassword = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      return { error: error.message };
    }
    return { error: null };
  };

  const value: SupabaseAuthContextType = {
    user,
    session,
    adminProfile,
    loading,
    isCore: adminProfile?.role === 'core',
    signIn,
    signOut,
    changePassword,
  };

  return (
    <SupabaseAuthContext.Provider value={value}>
      {children}
    </SupabaseAuthContext.Provider>
  );
}
