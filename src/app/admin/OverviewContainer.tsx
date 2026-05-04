'use client';

import React, { useMemo } from "react";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { 
  IconUsers, IconCamera, IconCalendar, IconDatabase, IconChartLine, IconHistory, IconCheck, IconLock, IconSync, IconShield 
} from "@/components/shared/Icons";
import { motion } from "motion/react";
import { Member, ExhibitionSubmission } from "@/types/admin";
import { 
  Admin_ModuleHeader, Admin_StatCard, Admin_ErrorBoundary 
} from "@/features/admin/components";

interface OverviewContainerProps {
  members: Member[];
  submissions: ExhibitionSubmission[];
  eventsCount: number;
  auditLogs: any[];
}

export function OverviewContainer({
  members,
  submissions: photos,
  eventsCount,
  auditLogs
}: OverviewContainerProps) {
  const { user, adminProfile } = useSupabaseAuth();

  const analytics = useMemo(() => {
    const now = new Date();
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const newMembers = members.filter(m => new Date(m.created_at) > last7Days).length;
    const newPhotos = photos.filter(p => new Date(p.submitted_at) > last7Days).length;

    const timeline: Record<string, { members: number, photos: number }> = {};
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      timeline[dateStr] = { members: 0, photos: 0 };
    }

    members.forEach(m => {
      const date = (m.created_at || "").split('T')[0];
      if (timeline[date]) timeline[date].members++;
    });
    photos.forEach(p => {
      const date = (p.submitted_at || "").split('T')[0];
      if (timeline[date]) timeline[date].photos++;
    });

    return {
      newMembers,
      newPhotos,
      timeline: Object.entries(timeline).map(([date, counts]) => ({ date, ...counts })),
      totalMembers: members.length,
      totalPhotos: photos.length
    };
  }, [members, photos]);

  if (!user || !adminProfile) return null;

  return (
    <div className="pt-16 md:pt-24 pb-12 px-6 md:px-12 w-full max-w-[1600px] mx-auto space-y-12 relative z-10 isolate">
      {/* ── MODULE HEADER ───────────────────────────────────── */}
      <Admin_ModuleHeader 
        title="Overview"
        description="System metrics and operational activity hub."
      >
        <Admin_StatCard label="Total Membership" value={analytics.totalMembers} icon={<IconUsers size={20} />} />
        <Admin_StatCard label="Exhibition Entries" value={analytics.totalPhotos} icon={<IconCamera size={20} />} />
        <Admin_StatCard label="Active Events" value={eventsCount} icon={<IconCalendar size={20} />} />
        <Admin_StatCard label="Sync Health" value="Secure" icon={<IconCheck size={20} />} color="text-green-500" />
      </Admin_ModuleHeader>

      {/* ── BENTO ANALYTICS ─────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Growth Chart */}
         <div className="lg:col-span-2 p-10 bg-white dark:bg-[#0d0d0d] border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-12">
               <div className="flex items-center gap-5">
                  <div className="w-12 h-12 bg-zinc-50 dark:bg-[#1a1a1a] rounded-2xl flex items-center justify-center text-uiupc-orange border border-zinc-200 dark:border-zinc-800 shadow-inner">
                     <IconChartLine size={20} />
                  </div>
                  <div>
                     <h3 className="text-xl font-black uppercase tracking-tight dark:text-white leading-none">Membership Growth</h3>
                     <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mt-2">14-day engagement analysis</p>
                  </div>
               </div>
               <div className="hidden sm:flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-uiupc-orange" />
                    <span className="text-[8px] font-black uppercase tracking-widest text-zinc-400">Members</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-zinc-200 dark:bg-zinc-800" />
                    <span className="text-[8px] font-black uppercase tracking-widest text-zinc-400">Entries</span>
                  </div>
               </div>
            </div>
            
            <div className="h-64 w-full flex items-end justify-between gap-2 px-4">
               {analytics.timeline.map((day) => {
                 const maxVal = Math.max(...analytics.timeline.map(d => d.members + d.photos), 1);
                 const mHeight = (day.members / maxVal) * 100;
                 const pHeight = (day.photos / maxVal) * 100;

                 return (
                   <div key={day.date} className="flex-1 flex flex-col items-center gap-3 group h-full justify-end">
                      <div className="w-full flex flex-col items-center justify-end h-full gap-1">
                         <div className="relative w-full max-w-[12px] h-full flex flex-col justify-end">
                            <motion.div initial={{ height: 0 }} animate={{ height: `${pHeight}%` }} className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-t-md transition-colors group-hover:bg-zinc-200 dark:group-hover:bg-zinc-700" />
                            <motion.div initial={{ height: 0 }} animate={{ height: `${mHeight}%` }} className="w-full bg-uiupc-orange rounded-t-md shadow-sm group-hover:brightness-110" />
                         </div>
                      </div>
                      <span className="text-[7px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity">
                         {new Date(day.date).toLocaleDateString(undefined, { weekday: 'short' })}
                      </span>
                   </div>
                 );
               })}
            </div>
         </div>

         {/* Activity Log */}
         <div className="p-10 bg-white dark:bg-[#0d0d0d] border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] shadow-sm flex flex-col">
            <div className="flex items-center gap-5 mb-10">
               <div className="w-12 h-12 bg-zinc-50 dark:bg-[#1a1a1a] rounded-2xl flex items-center justify-center text-zinc-400 border border-zinc-200 dark:border-zinc-800 shadow-inner">
                  <IconHistory size={20} />
               </div>
               <h3 className="text-xl font-black uppercase tracking-tight dark:text-white leading-none">Security Feed</h3>
            </div>

            <div className="space-y-8 flex-1 overflow-y-auto no-scrollbar py-2 min-h-[300px]">
               {auditLogs.length === 0 ? (
                 <div className="h-full flex flex-col items-center justify-center text-center gap-4 opacity-30">
                    <IconSync size={20} className="animate-spin text-zinc-400" />
                    <p className="text-[9px] font-black uppercase tracking-widest">Polling Activity...</p>
                 </div>
               ) : auditLogs.map((log: any, i: number) => (
                 <div key={i} className="flex gap-5 group items-start">
                    <div className="w-2 h-2 bg-uiupc-orange rounded-full mt-1.5 shrink-0 shadow-[0_0_8px_rgba(255,102,0,0.3)]" />
                    <div className="flex-1 min-w-0">
                       <p className="text-[10px] font-black uppercase tracking-tighter dark:text-zinc-200 truncate group-hover:text-uiupc-orange transition-colors">
                          {log.action.replace(/_/g, ' ')}
                       </p>
                       <div className="flex items-center justify-between mt-1">
                          <p className="text-[8px] text-zinc-400 font-bold uppercase tracking-widest">
                             {log.admin_email?.split('@')[0] || "System"}
                          </p>
                          <p className="text-[8px] text-zinc-500 font-bold uppercase tracking-tighter">
                             {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                       </div>
                    </div>
                 </div>
               ))}
            </div>
            
            <button className="mt-10 w-full h-12 bg-zinc-50 dark:bg-[#1a1a1a] rounded-2xl text-[9px] font-black uppercase tracking-[0.3em] text-zinc-400 hover:text-uiupc-orange transition-all border border-zinc-200 dark:border-zinc-800/50 shadow-sm">
               View Full Ledger
            </button>
         </div>
      </div>

      {/* ── QUICK ACCESS FOOTER ────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 opacity-80 hover:opacity-100 transition-opacity duration-500">
         <div className="p-8 bg-white dark:bg-[#0d0d0d] border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] flex items-center justify-between group cursor-pointer hover:border-uiupc-orange/20">
            <div className="flex items-center gap-5">
               <div className="w-10 h-10 rounded-xl bg-zinc-50 dark:bg-[#1a1a1a] flex items-center justify-center text-zinc-400 group-hover:text-uiupc-orange transition-colors"><IconShield size={18} /></div>
               <div>
                  <p className="text-[10px] font-black uppercase tracking-widest dark:text-white">Access Governance</p>
                  <p className="text-[8px] font-bold uppercase tracking-widest text-zinc-500 mt-1">Manage administrative permissions</p>
               </div>
            </div>
            <IconLock size={18} className="text-zinc-200 dark:text-zinc-800" />
         </div>
         <div className="p-8 bg-white dark:bg-[#0d0d0d] border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] flex items-center justify-between group cursor-pointer hover:border-uiupc-orange/20">
            <div className="flex items-center gap-5">
               <div className="w-10 h-10 rounded-xl bg-zinc-50 dark:bg-[#1a1a1a] flex items-center justify-center text-zinc-400 group-hover:text-uiupc-orange transition-colors"><IconDatabase size={18} /></div>
               <div>
                  <p className="text-[10px] font-black uppercase tracking-widest dark:text-white">System Integrity</p>
                  <p className="text-[8px] font-bold uppercase tracking-widest text-zinc-500 mt-1">Database health & synchronization</p>
               </div>
            </div>
            <IconCheck size={18} className="text-zinc-200 dark:text-zinc-800" />
         </div>
      </div>
    </div>
  );
}
