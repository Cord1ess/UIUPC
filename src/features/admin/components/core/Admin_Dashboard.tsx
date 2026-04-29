"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import dynamic from "next/dynamic";
import { Admin_DetailsModal } from "./Admin_DetailsModal";
import { Admin_EmailModal } from "./Admin_EmailModal";
import GlobalLoader from "@/components/shared/GlobalLoader";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { useAdminActions } from "@/features/admin/hooks/useAdminActions";
import { useRouter } from "next/navigation";
import ScrollRevealText from "@/components/motion/ScrollRevealText";
import { motion, AnimatePresence } from "framer-motion";
import { Admin_Dropdown } from "./Admin_Dropdown";

import {
  FaSync,
  FaUsers,
  FaPowerOff,
  FaCalendarAlt,
  FaCheckCircle,
  FaDatabase,
  FaWallet,
  FaNewspaper,
  FaImage,
  FaShieldAlt,
  FaHistory,
  FaArchive
} from "react-icons/fa";

const LocalLoader = () => (
  <div className="w-full py-32 flex flex-col items-center justify-center gap-6">
    <div className="w-10 h-10 border-4 border-uiupc-orange/10 border-t-uiupc-orange rounded-full animate-spin" />
    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Initializing Module...</p>
  </div>
);

// Dynamic Imports for all modernized modules
const Admin_Members = dynamic(() => import("../modules/Admin_Members").then(mod => mod.Admin_Members), { loading: () => <LocalLoader />, ssr: false });
const Admin_Submissions = dynamic(() => import("../modules/Admin_Submissions").then(mod => mod.Admin_Submissions), { loading: () => <LocalLoader />, ssr: false });
const Admin_Blog = dynamic(() => import("../modules/Admin_Blog"), { loading: () => <LocalLoader />, ssr: false });
const Admin_Events = dynamic(() => import("../modules/Admin_Events").then(mod => mod.Admin_Events), { loading: () => <LocalLoader />, ssr: false });
const Admin_Gallery = dynamic(() => import("../modules/Admin_Gallery"), { loading: () => <LocalLoader />, ssr: false });
const Admin_Committee = dynamic(() => import("../modules/Admin_Committee").then(mod => mod.Admin_Committee), { loading: () => <LocalLoader />, ssr: false });
const Admin_Finance = dynamic(() => import("../governance/Admin_Finance").then(mod => mod.Admin_Finance), { loading: () => <LocalLoader />, ssr: false });
const Admin_Audit = dynamic(() => import("../governance/Admin_Audit").then(mod => mod.Admin_Audit), { loading: () => <LocalLoader />, ssr: false });
const Admin_Archive = dynamic(() => import("../modules/Admin_Archive").then(mod => mod.Admin_Archive), { loading: () => <LocalLoader />, ssr: false });
const Admin_Access = dynamic(() => import("../governance/Admin_Access").then(mod => mod.Admin_Access), { loading: () => <LocalLoader />, ssr: false });

export const Admin_Dashboard = ({ forcedTab }: { forcedTab?: string }) => {
  const { user, adminProfile, loading: authLoading } = useSupabaseAuth();
  const router = useRouter();

  const [dataType, setDataType] = useState(forcedTab || "membership");
  const [selectedSession, setSelectedSession] = useState("all");
  const [refreshKey, setRefreshKey] = useState(0);
  
  const [isToggling, setIsToggling] = useState(false);
  const [toggleFeedback, setToggleFeedback] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  const [selectedItem, setSelectedItem] = useState<Record<string, any> | null>(null);
  const [selectedEmailItem, setSelectedEmailItem] = useState<Record<string, any> | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);

  useEffect(() => { if (forcedTab) setDataType(forcedTab); }, [forcedTab]);
  useEffect(() => { if (!authLoading && !user) router.push("/login"); }, [user, authLoading, router]);

  const { data: members, refetch: refetchMem } = useSupabaseData("members", { limit: 5000 });
  const { data: subs, refetch: refetchSubs } = useSupabaseData("exhibition_submissions", { limit: 5000 });
  const { data: finances } = useSupabaseData("finances", { limit: 1000 });
  
  const sessions = useMemo(() => {
    const s = new Set<string>();
    if (Array.isArray(members)) members.forEach(m => m.session && s.add(m.session));
    return Array.from(s).sort();
  }, [members]);

  const balance = useMemo(() => {
    if (!Array.isArray(finances)) return 0;
    return finances.reduce((sum, t) => sum + (t.type === 'income' ? Number(t.amount) : -Number(t.amount)), 0);
  }, [finances]);

  const refreshDashboard = useCallback(async () => {
    setIsSyncing(true);
    setSyncFeedback(null);
    try {
      await Promise.all([refetchMem(), refetchSubs()]);
      setRefreshKey(prev => prev + 1);
      setSyncFeedback("Synced!");
      setTimeout(() => setSyncFeedback(null), 2000);
    } catch (e) {
      setSyncFeedback("Error");
      setTimeout(() => setSyncFeedback(null), 2000);
    } finally {
      setIsSyncing(false);
    }
  }, [refetchMem, refetchSubs]);

  const {
    admin_SubmissionsStatus,
    admin_MembersStatus,
    fetchAdmin_SubmissionsStatus,
    fetchAdmin_MembersStatus,
    handleToggleAdmin_Submissions,
    handleToggleAdmin_Members,
  } = useAdminActions({ user, adminProfile, dataType, onRefresh: refreshDashboard });

  useEffect(() => {
    if (user) { 
      fetchAdmin_MembersStatus(); 
      fetchAdmin_SubmissionsStatus(); 
    }
  }, [user, fetchAdmin_MembersStatus, fetchAdmin_SubmissionsStatus]);

  const onToggleStatus = async () => {
    setIsToggling(true);
    setToggleFeedback("Updating...");
    const current = dataType === "membership" ? admin_MembersStatus : admin_SubmissionsStatus;
    const result = dataType === "membership" 
      ? await handleToggleAdmin_Members(current) 
      : await handleToggleAdmin_Submissions(current);
    
    if (result?.success) setToggleFeedback(`Turned ${result.status === 'enabled' ? 'ON' : 'OFF'}`);
    else setToggleFeedback("Failed");
    setTimeout(() => setToggleFeedback(null), 2000);
    setIsToggling(false);
  };

  const getModuleInfo = () => {
    switch (dataType) {
      case "membership": return { label: "Total Members", value: members?.length || 0, icon: <FaUsers />, toggle: "Join Page" };
      case "photos": return { label: "Submissions", value: subs?.length || 0, icon: <FaImage />, toggle: "Entry Portal" };
      case "finances": return { label: "Balance", value: `৳${balance.toLocaleString()}`, icon: <FaWallet />, toggle: null };
      case "blog": return { label: "Articles", value: "Live", icon: <FaNewspaper />, toggle: "Public View" };
      case "events": return { label: "Schedule", value: "Active", icon: <FaCalendarAlt />, toggle: null };
      case "gallery": return { label: "Assets", value: "Cloud", icon: <FaImage />, toggle: null };
      case "audit": return { label: "System Logs", value: "Recording", icon: <FaHistory />, toggle: null };
      case "archive": return { label: "Archives", value: "Historical", icon: <FaArchive />, toggle: null };
      case "admins": return { label: "Personnel", value: "Secure", icon: <FaShieldAlt />, toggle: null };
      default: return { label: "Records", value: 0, icon: <FaDatabase />, toggle: null };
    }
  };

  const moduleInfo = getModuleInfo();
  const isEnabled = dataType === "membership" ? admin_MembersStatus === "enabled" : admin_SubmissionsStatus === "enabled";

  if (authLoading) return <GlobalLoader />;
  if (!user) return null;

  return (
    <div className="flex flex-col w-full min-h-screen">
      <div className="flex flex-col gap-4 mb-12">
        <ScrollRevealText
          text={dataType.charAt(0).toUpperCase() + dataType.slice(1).replace(/_/g, ' ')}
          className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-zinc-900 dark:text-white leading-none"
        />
        <p className="text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-widest text-[10px] pl-1 border-l-2 border-uiupc-orange">
          Command Center: Managed by {adminProfile?.role || 'authorized'} personnel.
        </p>
      </div>

      <div className="space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* 1. Main Stat */}
          <div className="p-8 bg-white dark:bg-[#080808] border border-black/5 dark:border-white/5 rounded-[2.5rem] flex flex-col justify-between shadow-sm group">
            <p className="text-zinc-400 text-[10px] font-black uppercase tracking-widest">{moduleInfo.label}</p>
            <div className="flex items-end justify-between mt-4">
               <motion.p key={String(moduleInfo.value)} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-4xl font-black tracking-tighter dark:text-white leading-none uppercase">
                 {moduleInfo.value}
               </motion.p>
               <div className="text-uiupc-orange text-xl group-hover:scale-110 transition-transform">{moduleInfo.icon}</div>
            </div>
          </div>

          {/* 2. Global Toggle (if applicable) */}
          {moduleInfo.toggle ? (
            <div className={`p-8 rounded-[2.5rem] flex flex-col justify-between border transition-all duration-500 shadow-sm relative group ${isEnabled ? 'bg-green-500/[0.03] border-green-500/20' : 'bg-red-500/[0.03] border-red-500/20'}`}>
              <p className={`text-[10px] font-black uppercase tracking-widest ${isEnabled ? 'text-green-500' : 'text-red-500'}`}>{moduleInfo.toggle}</p>
              <div className="flex items-center justify-between mt-4">
                 <span className="text-lg font-black uppercase tracking-tighter dark:text-white">{isEnabled ? 'ENABLED' : 'DISABLED'}</span>
                 <button disabled={isToggling} onClick={onToggleStatus} className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all text-white shadow-xl ${isEnabled ? "bg-green-500" : "bg-red-500"}`}>
                   <FaPowerOff className="text-sm" />
                 </button>
              </div>
            </div>
          ) : (
            <div className="p-8 bg-white dark:bg-[#080808] border border-black/5 dark:border-white/5 rounded-[2.5rem] flex flex-col justify-between shadow-sm">
               <p className="text-zinc-400 text-[10px] font-black uppercase tracking-widest">Module Status</p>
               <div className="flex items-center gap-3 mt-4">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-lg font-black uppercase tracking-tighter dark:text-white">OPERATIONAL</span>
               </div>
            </div>
          )}

          {/* 3. Session Selection */}
          <div className="p-8 bg-white dark:bg-[#080808] border border-black/5 dark:border-white/5 rounded-[2.5rem] flex flex-col justify-between shadow-sm">
            <p className="text-zinc-400 text-[10px] font-black uppercase tracking-widest">Active Session</p>
            <div className="mt-4 flex items-center gap-3">
               <div className="w-10 h-10 bg-zinc-50 dark:bg-zinc-900 rounded-xl flex items-center justify-center text-zinc-400"><FaCalendarAlt /></div>
               <Admin_Dropdown 
                 value={selectedSession} 
                 onChange={setSelectedSession}
                 options={[{ value: 'all', label: 'All Records' }, ...sessions.map(s => ({ value: s, label: s }))]}
                 className="flex-1"
               />
            </div>
          </div>

          {/* 4. Global Cloud Sync */}
          <div className="p-8 bg-white dark:bg-[#080808] border border-black/5 dark:border-white/5 rounded-[2.5rem] flex flex-col justify-between shadow-sm group">
             <div className="flex items-center justify-between">
                <p className="text-zinc-400 text-[10px] font-black uppercase tracking-widest">Database Sync</p>
                <button disabled={isSyncing} onClick={refreshDashboard} className={`w-10 h-10 bg-zinc-50 dark:bg-zinc-900 border border-black/5 dark:border-white/5 rounded-xl flex items-center justify-center text-zinc-400 hover:text-uiupc-orange transition-all ${isSyncing ? 'animate-spin' : ''}`}>
                  <FaSync className="text-[12px]" />
                </button>
             </div>
             <div className="flex flex-col mt-4">
                <p className={`text-2xl font-black tracking-tighter uppercase flex items-center gap-3 ${isSyncing ? 'text-zinc-400' : 'text-green-500'}`}>
                  {syncFeedback || "LIVE"}
                </p>
             </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={dataType + refreshKey} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="w-full">
            {dataType === "membership" && <Admin_Members onViewDetails={(item) => { setSelectedItem(item); setShowDetailsModal(true); }} onEmailReply={(item) => { setSelectedEmailItem(item); setShowEmailModal(true); }} forcedSession={selectedSession} />}
            {dataType === "photos" && <Admin_Submissions onOpenDetails={(item) => { setSelectedItem(item); setShowDetailsModal(true); }} onOpenEmail={(item) => { setSelectedEmailItem(item); setShowEmailModal(true); }} />}
            {dataType === "blog" && <Admin_Blog />}
            {dataType === "events" && <Admin_Events />}
            {dataType === "gallery" && <Admin_Gallery />}
            {dataType === "committee" && <Admin_Committee />}
            {dataType === "finances" && <Admin_Finance />}
            {dataType === "audit" && <Admin_Audit />}
            {dataType === "archive" && <Admin_Archive />}
            {dataType === "admins" && <Admin_Access />}
          </motion.div>
        </AnimatePresence>
      </div>

      <Admin_DetailsModal isOpen={showDetailsModal} onClose={() => setShowDetailsModal(false)} item={selectedItem} dataType={dataType} />
      <Admin_EmailModal isOpen={showEmailModal} onClose={() => setShowEmailModal(false)} item={selectedEmailItem} onSend={async () => {}} sending={false} />
    </div>
  );
};
