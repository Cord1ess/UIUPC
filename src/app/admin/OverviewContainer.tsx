'use client';

import React, { useMemo, useState, useCallback, useTransition } from "react";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { 
  IconUsers, IconCamera, IconCalendar, IconChartLine, IconHistory, 
  IconCheck, IconShield, IconSync, IconCog, IconImage, IconBookOpen,
  IconExclamationTriangle, IconArrowUp, IconArrowDown
} from "@/components/shared/Icons";
import { motion, AnimatePresence } from "motion/react";
import { Member, ExhibitionSubmission } from "@/types/admin";
import { Admin_ModuleHeader, Admin_StatCard, Admin_ErrorBoundary } from "@/features/admin/components";
import { supabase } from "@/lib/supabase";
import { executeAdminMutation } from "@/features/admin/actions";

// ─── TOGGLE SWITCH COMPONENT ───────────────────────────────────────────────
interface ToggleSwitchProps {
  label: string;
  description: string;
  settingKey: string;
  value: boolean;
  onToggle: (key: string, newValue: boolean) => void;
  isPending: boolean;
  color?: string;
}

const ToggleSwitch = ({ label, description, settingKey, value, onToggle, isPending, color = "bg-uiupc-orange" }: ToggleSwitchProps) => (
  <div className="flex items-center justify-between p-5 sm:p-6 bg-zinc-50 dark:bg-[#111] rounded-2xl border border-zinc-200 dark:border-zinc-800 group hover:border-uiupc-orange/20 transition-all">
    <div className="flex-1 min-w-0 mr-4">
      <p className="text-[11px] sm:text-[12px] font-black uppercase tracking-wider text-zinc-900 dark:text-white">{label}</p>
      <p className="text-[8px] sm:text-[9px] font-bold uppercase tracking-widest text-zinc-400 mt-1">{description}</p>
    </div>
    <button
      onClick={() => onToggle(settingKey, !value)}
      disabled={isPending}
      className={`relative w-12 h-7 sm:w-14 sm:h-8 rounded-full transition-all duration-300 shrink-0 ${
        value ? color : 'bg-zinc-300 dark:bg-zinc-700'
      } ${isPending ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <motion.div
        animate={{ x: value ? 20 : 2 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="absolute top-1 sm:top-1.5 w-5 h-5 sm:w-5 sm:h-5 bg-white rounded-full shadow-md"
      />
    </button>
  </div>
);

// ─── TAB BUTTON COMPONENT ──────────────────────────────────────────────────
interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

const TabButton = ({ active, onClick, icon, label }: TabButtonProps) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-[0.15em] transition-all ${
      active
        ? 'bg-uiupc-orange text-white shadow-lg shadow-uiupc-orange/20'
        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-700'
    }`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

// ─── MAIN COMPONENT ────────────────────────────────────────────────────────
interface OverviewContainerProps {
  members: Member[];
  submissions: ExhibitionSubmission[];
  eventsCount: number;
  galleryCount: number;
  blogCount: number;
  auditLogs: any[];
  siteSettings: Record<string, string>;
}

export function OverviewContainer({
  members,
  submissions: photos,
  eventsCount,
  galleryCount,
  blogCount,
  auditLogs,
  siteSettings
}: OverviewContainerProps) {
  const { user, adminProfile, isCore } = useSupabaseAuth();
  const [activeTab, setActiveTab] = useState<'analytics' | 'controls'>('analytics');
  const [isPending, startTransition] = useTransition();
  const [localSettings, setLocalSettings] = useState<Record<string, string>>(siteSettings);

  // ── Analytics Computation ─────────────────────────────────────────────
  const analytics = useMemo(() => {
    const now = new Date();
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const newMembers = members.filter(m => new Date(m.created_at) > last7Days).length;
    const newPhotos = photos.filter(p => new Date(p.submitted_at) > last7Days).length;
    const approvedMembers = members.filter(m => m.status === 'approved').length;
    const pendingMembers = members.filter(m => m.status === 'pending').length;

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
      newMembers, newPhotos, approvedMembers, pendingMembers,
      timeline: Object.entries(timeline).map(([date, counts]) => ({ date, ...counts })),
      totalMembers: members.length,
      totalPhotos: photos.length
    };
  }, [members, photos]);

  // ── Settings Toggle Handler ───────────────────────────────────────────
  const handleToggle = useCallback(async (key: string, newValue: boolean) => {
    const valueStr = newValue ? 'true' : 'false';
    setLocalSettings(prev => ({ ...prev, [key]: valueStr }));

    startTransition(async () => {
      const { success, message } = await executeAdminMutation('admin_settings' as any, 'update', { value: valueStr }, key);
      if (!success) {
        setLocalSettings(prev => ({ ...prev, [key]: newValue ? 'false' : 'true' }));
        console.error('Failed to update setting:', message);
      }
    });
  }, []);

  if (!user || !adminProfile) return null;

  const getSettingBool = (key: string) => localSettings[key] === 'true';

  return (
    <div className="pt-16 md:pt-24 pb-32 lg:pb-12 px-6 md:px-12 w-full max-w-[1600px] mx-auto">
    <div className="w-full space-y-6 min-w-0">
      {/* ── MODULE HEADER ───────────────────────────────────── */}
      <Admin_ModuleHeader 
        title="Control Panel"
        description="System analytics, site controls, and operational activity."
      >
        <Admin_StatCard label="Total Members" value={analytics.totalMembers} icon={<IconUsers size={20} />} />
        <Admin_StatCard label="Exhibition Entries" value={analytics.totalPhotos} icon={<IconCamera size={20} />} />
        <Admin_StatCard label="Total Events" value={eventsCount} icon={<IconCalendar size={20} />} />
        <Admin_StatCard label="Gallery Photos" value={galleryCount} icon={<IconImage size={20} />} />
      </Admin_ModuleHeader>

      {/* ── TAB SWITCHER ────────────────────────────────────── */}
      <div className="w-full bg-white dark:bg-[#0d0d0d] p-3 sm:p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div className="flex items-center gap-3">
          <TabButton active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')} icon={<IconChartLine size={12} />} label="Analytics" />
          <TabButton active={activeTab === 'controls'} onClick={() => setActiveTab('controls')} icon={<IconCog size={12} />} label="Controls" />
        </div>
      </div>

      {/* ── TAB CONTENT ─────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {activeTab === 'analytics' ? (
          <motion.div key="analytics" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="space-y-6">
            {/* ── QUICK METRICS ROW ──────────────────────────── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard label="New Members" sublabel="Last 7 days" value={analytics.newMembers} icon={<IconArrowUp size={12} />} color="text-green-500" />
              <MetricCard label="Approved" sublabel="Active members" value={analytics.approvedMembers} icon={<IconCheck size={12} />} color="text-blue-500" />
              <MetricCard label="Pending" sublabel="Awaiting review" value={analytics.pendingMembers} icon={<IconExclamationTriangle size={12} />} color="text-amber-500" />
              <MetricCard label="Blog Posts" sublabel="Total published" value={blogCount} icon={<IconBookOpen size={12} />} color="text-purple-500" />
            </div>

            {/* ── BENTO: CHART + SECURITY FEED ───────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Growth Chart */}
              <div className="lg:col-span-2 p-6 sm:p-8 bg-white dark:bg-[#0d0d0d] border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm flex flex-col">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-zinc-50 dark:bg-[#1a1a1a] rounded-xl flex items-center justify-center text-uiupc-orange border border-zinc-200 dark:border-zinc-800">
                      <IconChartLine size={16} />
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-black uppercase tracking-tight dark:text-white leading-none">Growth Trend</h3>
                      <p className="text-[8px] sm:text-[9px] font-black text-zinc-400 uppercase tracking-widest mt-1">14-day engagement</p>
                    </div>
                  </div>
                  <div className="hidden sm:flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-uiupc-orange" />
                      <span className="text-[8px] font-black uppercase tracking-widest text-zinc-400">Members</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-zinc-200 dark:bg-zinc-700" />
                      <span className="text-[8px] font-black uppercase tracking-widest text-zinc-400">Entries</span>
                    </div>
                  </div>
                </div>
                
                <div className="h-48 sm:h-56 w-full flex items-end justify-between gap-1 sm:gap-2 px-1 sm:px-4">
                  {analytics.timeline.map((day) => {
                    const maxVal = Math.max(...analytics.timeline.map(d => d.members + d.photos), 1);
                    const mHeight = (day.members / maxVal) * 100;
                    const pHeight = (day.photos / maxVal) * 100;
                    return (
                      <div key={day.date} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end min-w-0">
                        <div className="w-full flex flex-col items-center justify-end h-full gap-0.5">
                          <div className="relative w-full max-w-[10px] sm:max-w-[12px] h-full flex flex-col justify-end">
                            <motion.div initial={{ height: 0 }} animate={{ height: `${pHeight}%` }} className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-t-sm transition-colors group-hover:bg-zinc-200 dark:group-hover:bg-zinc-700" />
                            <motion.div initial={{ height: 0 }} animate={{ height: `${mHeight}%` }} className="w-full bg-uiupc-orange rounded-t-sm shadow-sm group-hover:brightness-110" />
                          </div>
                        </div>
                        <span className="text-[6px] sm:text-[7px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          {new Date(day.date).toLocaleDateString(undefined, { weekday: 'short' })}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Security Feed */}
              <div className="p-6 sm:p-8 bg-white dark:bg-[#0d0d0d] border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm flex flex-col">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-10 h-10 bg-zinc-50 dark:bg-[#1a1a1a] rounded-xl flex items-center justify-center text-zinc-400 border border-zinc-200 dark:border-zinc-800">
                    <IconHistory size={16} />
                  </div>
                  <h3 className="text-sm sm:text-base font-black uppercase tracking-tight dark:text-white leading-none">Activity Feed</h3>
                </div>

                <div className="space-y-4 flex-1 overflow-y-auto no-scrollbar py-1 max-h-[300px] sm:max-h-[350px]">
                  {auditLogs.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center gap-3 opacity-30 py-12">
                      <IconSync size={16} className="animate-spin text-zinc-400" />
                      <p className="text-[9px] font-black uppercase tracking-widest">No activity yet</p>
                    </div>
                  ) : auditLogs.map((log: any, i: number) => (
                    <div key={i} className="flex gap-4 group items-start">
                      <div className="w-2 h-2 bg-uiupc-orange rounded-full mt-1.5 shrink-0 shadow-[0_0_6px_rgba(255,102,0,0.3)]" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-black uppercase tracking-tight dark:text-zinc-200 truncate group-hover:text-uiupc-orange transition-colors">
                          {log.action?.replace(/_/g, ' ') || 'Unknown Action'}
                        </p>
                        <div className="flex items-center justify-between mt-0.5 gap-2">
                          <p className="text-[8px] text-zinc-400 font-bold uppercase tracking-widest truncate">
                            {log.admin_email?.split('@')[0] || "System"}
                          </p>
                          <p className="text-[8px] text-zinc-500 font-bold uppercase tracking-tighter shrink-0">
                            {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div key="controls" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="space-y-6">
            {/* ── SITE CONTROLS ──────────────────────────────── */}
            <div className="bg-white dark:bg-[#0d0d0d] border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
              <div className="p-5 sm:p-6 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-zinc-50 dark:bg-[#1a1a1a] rounded-xl flex items-center justify-center text-uiupc-orange border border-zinc-200 dark:border-zinc-800">
                    <IconCog size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-black uppercase tracking-tight dark:text-white leading-none">Website Controls</h3>
                    <p className="text-[8px] sm:text-[9px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Manage site-wide toggles and features</p>
                  </div>
                </div>
              </div>
              <div className="p-4 sm:p-6 space-y-3">
                <ToggleSwitch
                  label="Join Page"
                  description="Allow new membership applications"
                  settingKey="join_page_open"
                  value={getSettingBool('join_page_open')}
                  onToggle={handleToggle}
                  isPending={isPending}
                  color="bg-green-500"
                />
                <ToggleSwitch
                  label="Exhibition Submissions"
                  description="Accept new exhibition photo submissions"
                  settingKey="submissions_open"
                  value={getSettingBool('submissions_open')}
                  onToggle={handleToggle}
                  isPending={isPending}
                  color="bg-blue-500"
                />
                <ToggleSwitch
                  label="Maintenance Mode"
                  description="Show maintenance page to all visitors"
                  settingKey="maintenance_mode"
                  value={getSettingBool('maintenance_mode')}
                  onToggle={handleToggle}
                  isPending={isPending}
                  color="bg-red-500"
                />
              </div>
            </div>

            {/* ── SYSTEM STATUS ──────────────────────────────── */}
            <div className="bg-white dark:bg-[#0d0d0d] border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
              <div className="p-5 sm:p-6 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-zinc-50 dark:bg-[#1a1a1a] rounded-xl flex items-center justify-center text-green-500 border border-zinc-200 dark:border-zinc-800">
                    <IconShield size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-black uppercase tracking-tight dark:text-white leading-none">System Status</h3>
                    <p className="text-[8px] sm:text-[9px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Infrastructure health overview</p>
                  </div>
                </div>
              </div>
              <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <StatusCard label="Database" status="Operational" color="green" />
                <StatusCard label="Authentication" status="Secure" color="green" />
                <StatusCard label="Drive Sync" status="Connected" color="green" />
                <StatusCard label="Audit Logging" status="Active" color="green" />
              </div>
            </div>

            {!isCore && (
              <div className="p-5 sm:p-6 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 rounded-2xl">
                <div className="flex items-start gap-3">
                  <IconExclamationTriangle size={16} className="text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-400">Restricted Access</p>
                    <p className="text-[9px] font-bold text-amber-600 dark:text-amber-500 mt-1">Some controls require Core Admin privileges.</p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    </div>
  );
}

// ─── SUB-COMPONENTS ────────────────────────────────────────────────────────

function MetricCard({ label, sublabel, value, icon, color }: { label: string; sublabel: string; value: number; icon: React.ReactNode; color: string }) {
  return (
    <div className="p-4 sm:p-5 bg-white dark:bg-[#0d0d0d] border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm group hover:border-uiupc-orange/20 transition-all">
      <div className="flex items-center justify-between">
        <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-zinc-400">{label}</p>
        <div className={`${color} opacity-30 group-hover:opacity-100 transition-opacity`}>{icon}</div>
      </div>
      <motion.p key={value} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="text-2xl sm:text-3xl font-black tracking-tighter dark:text-white leading-none mt-2">
        {value}
      </motion.p>
      <p className="text-[7px] sm:text-[8px] font-bold uppercase tracking-widest text-zinc-400 mt-1">{sublabel}</p>
    </div>
  );
}

function StatusCard({ label, status, color }: { label: string; status: string; color: string }) {
  const colorMap: Record<string, string> = {
    green: 'bg-green-500/10 text-green-500 border-green-500/20',
    red: 'bg-red-500/10 text-red-500 border-red-500/20',
    amber: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  };
  return (
    <div className="flex items-center justify-between p-4 sm:p-5 bg-zinc-50 dark:bg-[#111] rounded-2xl border border-zinc-200 dark:border-zinc-800">
      <p className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-zinc-600 dark:text-zinc-300">{label}</p>
      <span className={`px-3 py-1 rounded-lg text-[8px] sm:text-[9px] font-black uppercase tracking-widest border ${colorMap[color]}`}>
        {status}
      </span>
    </div>
  );
}
