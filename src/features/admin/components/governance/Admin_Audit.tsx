"use client";

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  IconHistory, IconSearch, IconUserShield, IconDatabase, IconClock, 
  IconChevronDown, IconShieldAlt, IconChevronLeft, IconChevronRight, 
  IconFingerprint, IconTerminal, IconCheck, IconLock 
} from '@/components/shared/Icons';
import { 
  Admin_ErrorBoundary, Admin_ModuleHeader, Admin_StatCard 
} from "@/features/admin/components";
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { initAdminPassword } from "@/features/admin/actions";

const AuditRow = React.memo(({ 
  item, isExpanded, onToggle 
}: { 
  item: any; isExpanded: boolean; onToggle: () => void 
}) => {
  const isCritical = (item.action || "").includes('delete') || (item.action || "").includes('purge');
  const isCreation = (item.action || "").includes('create') || (item.action || "").includes('add');

  return (
    <React.Fragment>
      <motion.tr 
        onClick={onToggle}
        className={`group hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition-all cursor-pointer border-b border-zinc-100 dark:border-zinc-800/50 ${isExpanded ? 'bg-uiupc-orange/[0.03]' : ''}`}
      >
        <td className="px-8 py-6 whitespace-nowrap">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-sm shadow-inner border border-zinc-200 dark:border-zinc-800 ${isCritical ? 'bg-red-500/10 text-red-500' : isCreation ? 'bg-green-500/10 text-green-500' : 'bg-blue-500/10 text-blue-500'}`}>
              <IconTerminal size={14} />
            </div>
            <div className="flex flex-col min-w-[200px]">
              <span className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-tight truncate">{(item.action || "Event").replace(/_/g, ' ')}</span>
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest truncate flex items-center gap-2 mt-0.5"><IconFingerprint size={12} className="text-zinc-300 dark:text-zinc-700" /> {item.id.split('-')[0]}</span>
            </div>
          </div>
        </td>
        <td className="px-6 py-6 whitespace-nowrap hidden sm:table-cell">
           <span className="text-[11px] font-black text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
             <IconUserShield size={10} className="text-uiupc-orange" /> {item.admin_id ? `Admin ${item.admin_id.slice(0, 5)}` : "System"}
           </span>
        </td>
        <td className="px-6 py-6 whitespace-nowrap hidden md:table-cell">
           <span className="px-4 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800/50 text-zinc-500 dark:text-zinc-400 text-[9px] font-black uppercase tracking-widest border border-zinc-200 dark:border-zinc-800/50 flex items-center gap-2 w-fit">
             <IconDatabase size={10} /> {(item.target_table || "system").replace(/_/g, ' ')}
           </span>
        </td>
        <td className="px-6 py-6 whitespace-nowrap hidden lg:table-cell">
           <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2"><IconClock size={12} className="text-zinc-300 dark:text-zinc-700" /> {new Date(item.created_at).toLocaleString()}</span>
        </td>
        <td className="px-8 py-6 text-right whitespace-nowrap">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 ml-auto border border-zinc-200 dark:border-zinc-800/50 ${isExpanded ? 'bg-uiupc-orange text-white rotate-180 border-uiupc-orange' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-300'}`}>
            <IconChevronDown size={12} />
          </div>
        </td>
      </motion.tr>
      <AnimatePresence>
        {isExpanded && (
          <tr>
            <td colSpan={5} className="p-0 border-none">
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="bg-zinc-50 dark:bg-[#0a0a0a] p-10 border-t border-zinc-100 dark:border-zinc-800/50 overflow-hidden shadow-inner">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Original Data</p>
                    <pre className="p-8 bg-white dark:bg-black rounded-3xl border border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-500 font-mono overflow-auto max-h-[400px] custom-scrollbar shadow-sm">
                      {item.old_data ? JSON.stringify(item.old_data, null, 4) : "// No record change history"}
                    </pre>
                  </div>
                  <div className="space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Final Data</p>
                    <pre className={`p-8 rounded-3xl border text-[11px] font-mono overflow-auto max-h-[400px] custom-scrollbar shadow-sm ${isCritical ? 'bg-red-500/[0.02] border-red-500/20 text-red-700/60' : 'bg-green-500/[0.02] border-green-500/20 text-zinc-700 dark:text-zinc-300'}`}>
                      {item.new_data ? JSON.stringify(item.new_data, null, 4) : "// Purged Record State"}
                    </pre>
                  </div>
                </div>
              </motion.div>
            </td>
          </tr>
        )}
      </AnimatePresence>
    </React.Fragment>
  );
});
AuditRow.displayName = 'AuditRow';

export const Admin_Audit: React.FC = () => {
  const { isCore } = useSupabaseAuth();
  const [page, setPage] = useState(0);
  const pageSize = 20;
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => { initAdminPassword(); }, []);

  const { data: logs, count, isLoading } = useSupabaseData('audit_logs', { 
    orderBy: 'created_at', 
    orderDesc: true,
    page,
    pageSize,
  });

  const visibleLogs = useMemo(() => {
    const rawData = logs || [];
    if (!searchTerm) return rawData;
    return rawData.filter(l => 
      (l.action || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
      (l.target_table || "").toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [logs, searchTerm]);
  
  const totalPages = Math.ceil((count || 0) / pageSize);

  if (!isCore) {
    return (
      <div className="py-32 text-center bg-white dark:bg-[#0d0d0d] rounded-[3rem] border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mx-auto mb-8 border border-red-500/20 shadow-inner">
          <IconLock size={32} />
        </div>
        <h3 className="text-2xl font-black uppercase tracking-tighter dark:text-white mb-2">Access Restricted</h3>
        <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.4em]">Core Administration Only</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8 min-w-0 relative z-10 isolate">
      <Admin_ModuleHeader 
        title="Security Audit"
        description="Inspect system-wide operational events and data mutations."
      >
        <Admin_StatCard label="Total Events Logged" value={count} icon={<IconHistory size={16} />} />
        <Admin_StatCard label="System Integrity" value="Verified" icon={<IconCheck size={16} />} color="text-green-500" />
      </Admin_ModuleHeader>

      {/* ── FILTER BAR ─────────────────────────────────────────── */}
      <div className="w-full bg-white dark:bg-[#0d0d0d] p-3 sm:p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm relative z-10">
        <div className="flex flex-col lg:flex-row gap-6 items-stretch lg:items-center justify-between">
          <div className="relative flex-1 group min-w-[200px]">
            <IconSearch size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-uiupc-orange transition-colors" />
            <input 
              type="text" 
              placeholder="Search by event or resource..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full py-4 pl-14 pr-8 bg-zinc-100 dark:bg-[#1a1a1a] border border-transparent focus:border-uiupc-orange/30 rounded-xl text-sm font-bold outline-none transition-all placeholder:text-zinc-400 dark:text-white" 
            />
          </div>
          <div className="flex items-center gap-3 px-6 py-4 bg-zinc-50 dark:bg-[#0a0a0a] rounded-2xl border border-zinc-100 dark:border-zinc-800/50 shadow-inner">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.4)]" />
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500">Security Monitoring Active</span>
          </div>
        </div>
      </div>

      {/* ── DATA TABLE ─────────────────────────────────────────── */}
      <div className="bg-white dark:bg-[#0d0d0d] rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm relative z-10">
        <div className="overflow-x-auto min-h-[600px]">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-zinc-50 dark:bg-zinc-900/50">
                <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 whitespace-nowrap">Operational Event</th>
                <th className="px-6 py-6 text-left text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 whitespace-nowrap hidden sm:table-cell">Initiator</th>
                <th className="px-6 py-6 text-left text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 whitespace-nowrap hidden md:table-cell">Affected Resource</th>
                <th className="px-6 py-6 text-left text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 whitespace-nowrap hidden lg:table-cell">Timestamp</th>
                <th className="px-8 py-6 text-right text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Trace</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5">
              {isLoading ? (
                [...Array(6)].map((_, i) => <tr key={i} className="animate-pulse"><td colSpan={5} className="px-8 py-8"><div className="h-10 bg-zinc-50 dark:bg-zinc-900 rounded-xl" /></td></tr>)
              ) : visibleLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 rounded-[2rem] bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center text-zinc-300 dark:text-zinc-600"><IconSearch size={20} /></div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">No events detected</p>
                    </div>
                  </td>
                </tr>
              ) : (
                visibleLogs.map((item) => (
                  <AuditRow 
                    key={item.id} 
                    item={item} 
                    isExpanded={expandedId === item.id}
                    onToggle={() => setExpandedId(expandedId === item.id ? null : item.id)}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── PAGINATION ─────────────────────────────────────────── */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-10 border-t border-zinc-100 dark:border-zinc-800/50">
          <div className="text-center sm:text-left">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Event History</p>
            <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Page {page + 1} of {totalPages} | Showing {logs?.length || 0} Records</p>
          </div>
          <div className="flex items-center gap-3">
            <button disabled={page === 0} onClick={() => { setPage(p => Math.max(0, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="w-14 h-14 flex items-center justify-center rounded-2xl bg-white dark:bg-[#0d0d0d] border border-zinc-200 dark:border-zinc-800 text-zinc-400 disabled:opacity-20 hover:border-uiupc-orange hover:text-uiupc-orange transition-all shadow-sm"><IconChevronLeft size={12} /></button>
            <button disabled={page >= totalPages - 1} onClick={() => { setPage(p => p + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="w-14 h-14 flex items-center justify-center rounded-2xl bg-white dark:bg-[#0d0d0d] border border-zinc-200 dark:border-zinc-800 text-zinc-400 disabled:opacity-20 hover:border-uiupc-orange hover:text-uiupc-orange transition-all shadow-sm"><IconChevronRight size={12} /></button>
          </div>
        </div>
      )}
    </div>
  );
};
