"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

// ============================================================
// Types
// ============================================================

export type AdminRole = 'core' | 'hr' | 'pr' | 'event' | 'organizer' | 'design' | 'visual';

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

  // Fetch admin profile from the admins table
  const fetchAdminProfile = async (email: string) => {
    const { data, error } = await supabase
      .from('admins')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (error) {
      console.error('Supabase error fetching admin profile:', error.message, error.details, error.hint);
      setAdminProfile(null);
      return;
    }

    if (!data) {
      console.warn('Admin profile not found in database for email:', email);
      setAdminProfile(null);
      return;
    }

    setAdminProfile({
      id: data.id,
      email: data.email,
      display_name: data.display_name,
      role: data.role as AdminRole,
      is_active: data.is_active,
    });
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user?.email) {
        fetchAdminProfile(session.user.email);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user?.email) {
          await fetchAdminProfile(session.user.email);
        } else {
          setAdminProfile(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
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
