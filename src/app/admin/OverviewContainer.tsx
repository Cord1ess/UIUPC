'use client';

import React, { useMemo, useState } from "react";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { 
  FaUsers, 
  FaCamera, 
  FaShieldAlt,
  FaCalendarAlt,
  FaEnvelope,
  FaClock,
  FaChartLine,
  FaHistory,
  FaDatabase,
  FaSync
} from "react-icons/fa";
import ScrollRevealText from "@/components/motion/ScrollRevealText";
import { motion } from "framer-motion";
import { Member, ExhibitionSubmission } from "@/types/admin";

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
  const [isSyncing, setIsSyncing] = useState(false);

  const analytics = useMemo(() => {
    const now = new Date();
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const newMembers = members.filter(m => new Date(m.created_at) > last7Days).length;
    const newPhotos = photos.filter(p => new Date(p.submitted_at || p.created_at) > last7Days).length;

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
      const date = (p.submitted_at || p.created_at || "").split('T')[0];
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
    <div className="w-full space-y-16 min-w-0 pb-20">
      <div className="space-y-4">
        <ScrollRevealText 
          text="Dashboard" 
          className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none text-zinc-900 dark:text-white"
        />
        <div className="flex flex-wrap items-center gap-x-8 gap-y-3 pt-2">
           <div className="flex items-center gap-2.5 text-[10px] font-black uppercase tracking-[0.2em] text-uiupc-orange">
              <FaShieldAlt className="text-xs" />
              <span>{adminProfile.role} Administrator</span>
           </div>
           <div className="flex items-center gap-2.5 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
              <FaEnvelope className="text-xs text-zinc-300" />
              <span>{user.email}</span>
           </div>
           <div className="flex items-center gap-2.5 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
              <FaClock className="text-xs text-zinc-300" />
              <span>Session: Active</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         {[
           { label: "Club Members", value: analytics.totalMembers, sub: `+${analytics.newMembers} new`, icon: <FaUsers />, color: 'orange' },
           { label: "Submissions", value: analytics.totalPhotos, sub: `+${analytics.newPhotos} new`, icon: <FaCamera />, color: 'orange' },
           { label: "Active Events", value: eventsCount, sub: "Live Session", icon: <FaCalendarAlt />, color: 'green' },
           { label: "Database", value: "Synced", sub: isSyncing ? "Syncing..." : "Live Data", icon: <FaDatabase />, color: 'green', isDb: true },
         ].map((stat, i) => (
           <motion.div
             key={stat.label}
             initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
             className={`p-8 bg-white dark:bg-[#080808] border border-black/5 dark:border-white/5 rounded-[2.5rem] flex flex-col justify-between shadow-sm hover:shadow-xl hover:translate-y-[-4px] transition-all duration-500 group relative ${stat.color === 'green' ? 'hover:border-green-500/20' : 'hover:border-uiupc-orange/20'}`}
           >
             <div className="flex items-center justify-between mb-8">
                <p className="text-zinc-400 text-[10px] font-black uppercase tracking-widest">{stat.label}</p>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 ${stat.color === 'green' ? 'bg-green-500/10 text-green-500' : 'bg-uiupc-orange/10 text-uiupc-orange'}`}>
                   {stat.icon}
                </div>
             </div>
             
             <div className="flex items-end justify-between">
                <div className="space-y-1">
                   <p className="text-4xl font-black tracking-tighter dark:text-white leading-none">
                     {stat.value === "Synced" ? (isSyncing ? "..." : "Live") : stat.value}
                   </p>
                   <p className={`text-[9px] font-black uppercase tracking-widest ${stat.color === 'green' ? 'text-green-500' : 'text-uiupc-orange'}`}>
                      {stat.sub}
                   </p>
                </div>
             </div>
           </motion.div>
         ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 p-10 bg-white dark:bg-[#080808] border border-black/5 dark:border-white/5 rounded-[2.5rem] shadow-sm space-y-10">
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-uiupc-orange/10 rounded-xl flex items-center justify-center text-uiupc-orange">
                     <FaChartLine />
                  </div>
                  <div>
                     <h3 className="text-lg font-black uppercase tracking-tight dark:text-white">Registration Timeline</h3>
                     <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Growth metrics over last 14 days</p>
                  </div>
               </div>
            </div>
            
            <div className="h-64 w-full flex items-end justify-between gap-1 px-4 relative">
               {analytics.timeline.map((day) => {
                 const maxVal = Math.max(...analytics.timeline.map(d => d.members + d.photos), 1);
                 const mHeight = (day.members / maxVal) * 100;
                 const pHeight = (day.photos / maxVal) * 100;

                 return (
                   <div key={day.date} className="flex-1 flex flex-col items-center gap-1 group relative">
                      <div className="w-full flex flex-col items-center justify-end h-48 gap-0.5">
                         <motion.div initial={{ height: 0 }} animate={{ height: `${mHeight}%` }} className="w-full max-w-[12px] bg-uiupc-orange rounded-t-md" />
                         <motion.div initial={{ height: 0 }} animate={{ height: `${pHeight}%` }} className="w-full max-w-[12px] bg-zinc-100 dark:bg-zinc-800 rounded-t-md" />
                      </div>
                   </div>
                 );
               })}
            </div>
         </div>

         <div className="p-10 bg-white dark:bg-[#080808] border border-black/5 dark:border-white/5 rounded-[2.5rem] shadow-sm space-y-8">
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 bg-zinc-50 dark:bg-zinc-900 rounded-xl flex items-center justify-center text-zinc-400">
                  <FaHistory />
               </div>
               <h3 className="text-lg font-black uppercase tracking-tight dark:text-white">Live Pulse</h3>
            </div>

            <div className="space-y-8">
               {auditLogs.map((log: any, i: number) => (
                 <div key={i} className="flex gap-4 group">
                    <div className="flex flex-col items-center">
                       <div className="w-2 h-2 bg-uiupc-orange rounded-full group-hover:scale-125 transition-transform" />
                       <div className="flex-1 w-px bg-black/5 dark:bg-white/5 mt-2" />
                    </div>
                    <div className="flex-1 min-w-0">
                       <p className="text-[10px] font-black uppercase tracking-tighter dark:text-zinc-200 truncate">
                          {log.action.replace(/_/g, ' ')}
                       </p>
                       <p className="text-[9px] text-zinc-500 font-medium mt-0.5 truncate">
                          by {log.admin_email.split('@')[0]}
                       </p>
                    </div>
                 </div>
               ))}
            </div>
         </div>
      </div>
    </div>
  );
}
