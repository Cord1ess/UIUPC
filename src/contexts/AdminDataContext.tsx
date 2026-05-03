"use client";

import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { useSupabaseAuth } from "./SupabaseAuthContext";
import { supabase } from "@/lib/supabase";

interface AdminDataContextType {
  members: any[];
  events: any[];
  submissions: any[];
  departments: any[];
  achievements: any[];
  auditLogs: any[];
  finances: any[];
  committees: any[];
  isLoading: boolean;
  isRefreshing: boolean;
  refreshAll: () => Promise<void>;
  connectionStatus: "online" | "offline" | "degraded";
}

const AdminDataContext = createContext<AdminDataContextType | undefined>(undefined);

export const AdminDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, adminProfile } = useSupabaseAuth();
  const [connectionStatus, setConnectionStatus] = useState<"online" | "offline" | "degraded">("online");

  // Preload primary datasets - DISABLED for massive tables (Moved to Server Components)
  const memOptions = useMemo(() => ({ 
    limit: 1, 
    enabled: false 
  }), []);
  
  const { data: members, isLoading: memLoading, isRefreshing: memRef, refetch: refetchMem } = useSupabaseData("members", memOptions);

  const eventOptions = useMemo(() => ({ 
    enabled: !!user && !!adminProfile 
  }), [user, adminProfile]);
  
  const { data: events, isLoading: evLoading, isRefreshing: evRef, refetch: refetchEvents } = useSupabaseData("events", eventOptions);

  const subOptions = useMemo(() => ({ 
    limit: 1, 
    enabled: false 
  }), []);
  
  const { data: submissions, isLoading: subLoading, isRefreshing: subRef, refetch: refetchSub } = useSupabaseData("exhibition_submissions", subOptions);

  const deptOptions = useMemo(() => ({ 
    enabled: !!user && !!adminProfile 
  }), [user, adminProfile]);
  
  const { data: departments, isLoading: deptLoading, isRefreshing: deptRef, refetch: refetchDepts } = useSupabaseData("departments", deptOptions);

  const achOptions = useMemo(() => ({ 
    enabled: !!user && !!adminProfile 
  }), [user, adminProfile]);
  
  const { data: achievements, isLoading: achLoading, isRefreshing: achRef, refetch: refetchAch } = useSupabaseData("achievements", achOptions);

  const auditOptions = useMemo(() => ({ 
    limit: 50, 
    enabled: !!user && !!adminProfile 
  }), [user, adminProfile]);
  
  const { data: auditLogs, isLoading: auditLoading, isRefreshing: auditRef, refetch: refetchAudit } = useSupabaseData("audit_logs", auditOptions);

  const finOptions = useMemo(() => ({ 
    limit: 50, 
    enabled: !!user && !!adminProfile 
  }), [user, adminProfile]);
  
  const { data: finances, isLoading: finLoading, isRefreshing: finRef, refetch: refetchFin } = useSupabaseData("finances", finOptions);

  const comOptions = useMemo(() => ({ 
    limit: 1, 
    enabled: false 
  }), []);
  
  const { data: committees, isLoading: comLoading, isRefreshing: comRef, refetch: refetchCom } = useSupabaseData("committees", comOptions);

  // We only wait for small datasets now
  const isLoading = evLoading || deptLoading || achLoading || auditLoading || finLoading;
  const isRefreshing = evRef || deptRef || achRef || auditRef || finRef;

  const refreshAll = useCallback(async () => {
    try {
      await Promise.all([
        refetchMem(),
        refetchEvents(),
        refetchSub(),
        refetchDepts(),
        refetchAch(),
        refetchAudit(),
        refetchFin(),
        refetchCom()
      ]);
    } catch (error) {
      console.error("Failed to refresh admin data:", error);
    }
  }, [refetchMem, refetchEvents, refetchSub, refetchDepts, refetchAch, refetchAudit, refetchFin, refetchCom]);

  // Robust connection heartbeat
  useEffect(() => {
    if (!user) return;

    const checkConnection = async () => {
      try {
        const { error } = await supabase.from('site_settings').select('count', { count: 'exact', head: true }).limit(1);
        if (error) throw error;
        setConnectionStatus("online");
      } catch (err) {
        setConnectionStatus("degraded");
      }
    };

    const interval = setInterval(checkConnection, 30000); // Check every 30s
    
    const handleOnline = () => setConnectionStatus("online");
    const handleOffline = () => setConnectionStatus("offline");

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [user]);

  const value = useMemo(() => ({
    members,
    events,
    submissions,
    departments,
    achievements,
    auditLogs,
    finances,
    committees,
    isLoading,
    isRefreshing,
    refreshAll,
    connectionStatus
  }), [members, events, submissions, departments, achievements, auditLogs, finances, committees, isLoading, isRefreshing, refreshAll, connectionStatus]);

  return (
    <AdminDataContext.Provider value={value}>
      {children}
    </AdminDataContext.Provider>
  );
};

export const useAdminData = () => {
  const context = useContext(AdminDataContext);
  if (context === undefined) {
    throw new Error("useAdminData must be used within an AdminDataProvider");
  }
  return context;
};
