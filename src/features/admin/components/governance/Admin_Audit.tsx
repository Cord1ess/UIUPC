"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaHistory, 
  FaSearch, 
  FaUserShield, 
  FaDatabase, 
  FaClock, 
  FaChevronDown,
  FaShieldAlt,
  FaChevronLeft,
  FaChevronRight,
  FaFingerprint,
  FaTerminal
} from 'react-icons/fa';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';

export const Admin_Audit: React.FC = () => {
  const { isCore } = useSupabaseAuth();
  const [page, setPage] = useState(0);
  const pageSize = 20;
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data: logs, count, isLoading } = useSupabaseData('audit_logs', { 
    orderBy: 'created_at', 
    orderDesc: true,
    page,
    pageSize,
  });
  
  const totalPages = Math.ceil((count || 0) / pageSize);

  if (!isCore) {
    return (
      <div className="py-32 text-center bg-red-500/5 rounded-[3rem] border border-red-500/10">
        <FaShieldAlt className="text-4xl text-red-500/20 mx-auto mb-6" />
        <h3 className="text-xl font-black uppercase tracking-tighter text-red-500 mb-2">Access Restricted</h3>
        <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em]">Core Admins Only</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8 min-w-0">
      {/* ── CLEAN FILTER BAR ───────────────────────────────────── */}
      <div className="w-full bg-white dark:bg-[#080808] p-6 rounded-[2.5rem] border border-black/5 dark:border-white/5 shadow-sm">
        <div className="flex flex-col xl:flex-row gap-6 items-stretch xl:items-center justify-between">
          <div className="relative flex-1 group">
            <FaSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-uiupc-orange transition-colors" />
            <input 
              type="text" 
              placeholder="Search by action or table name..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full py-5 pl-14 pr-8 bg-zinc-50 dark:bg-zinc-900/50 border border-transparent focus:border-uiupc-orange/30 rounded-2xl text-sm outline-none transition-all placeholder:text-zinc-400 font-medium" 
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
             <div className="flex items-center gap-2 px-6 py-4 bg-zinc-100 dark:bg-zinc-900 rounded-2xl border border-black/5 dark:border-white/5">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Forensic Engine Live</span>
             </div>
          </div>
        </div>
      </div>

      {/* ── DATA TABLE ─────────────────────────────────────────── */}
      <div className="bg-white dark:bg-[#080808] rounded-[2.5rem] border border-black/5 dark:border-white/5 overflow-hidden shadow-sm">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-zinc-50 dark:bg-zinc-900/50">
                <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 whitespace-nowrap">System Action</th>
                <th className="px-6 py-6 text-left text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 whitespace-nowrap">Admin Actor</th>
                <th className="px-6 py-6 text-left text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 whitespace-nowrap">Target Module</th>
                <th className="px-6 py-6 text-left text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 whitespace-nowrap">Timestamp</th>
                <th className="px-8 py-6 text-right text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Trace</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5">
              {isLoading ? (
                [...Array(6)].map((_, i) => <tr key={i} className="animate-pulse"><td colSpan={5} className="px-8 py-8"><div className="h-8 bg-zinc-50 dark:bg-zinc-900 rounded-xl" /></td></tr>)
              ) : (
                (logs || []).filter(l => (l.action || "").toLowerCase().includes(searchTerm.toLowerCase()) || (l.target_table || "").toLowerCase().includes(searchTerm.toLowerCase())).map((item) => {
                  const isCritical = (item.action || "").includes('delete') || (item.action || "").includes('purge');
                  const isCreation = (item.action || "").includes('create') || (item.action || "").includes('add');
                  
                  return (
                    <React.Fragment key={item.id}>
                      <motion.tr 
                        onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                        className={`group hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition-all cursor-pointer ${expandedId === item.id ? 'bg-uiupc-orange/[0.03]' : ''}`}
                      >
                        <td className="px-8 py-6 whitespace-nowrap">
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-sm shadow-inner ${isCritical ? 'bg-red-500/10 text-red-500' : isCreation ? 'bg-green-500/10 text-green-500' : 'bg-blue-500/10 text-blue-500'}`}>
                              <FaTerminal size={14} />
                            </div>
                            <div className="flex flex-col min-w-[200px]">
                              <span className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-tight truncate">{(item.action || "Event").replace(/_/g, ' ')}</span>
                              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest truncate flex items-center gap-2"><FaFingerprint className="text-zinc-300" /> {item.id.split('-')[0]}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-6 whitespace-nowrap">
                           <span className="text-[11px] font-black text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                             <FaUserShield className="text-uiupc-orange text-[10px]" /> {item.admin_id ? `Admin ${item.admin_id.slice(0, 5)}` : "System"}
                           </span>
                        </td>
                        <td className="px-6 py-6 whitespace-nowrap">
                           <span className="px-4 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800/50 text-zinc-500 dark:text-zinc-400 text-[9px] font-black uppercase tracking-widest border border-black/5 dark:border-white/5 flex items-center gap-2 w-fit">
                             <FaDatabase className="text-[10px]" /> {(item.target_table || "system").replace(/_/g, ' ')}
                           </span>
                        </td>
                        <td className="px-6 py-6 whitespace-nowrap">
                           <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2"><FaClock className="text-zinc-300" /> {new Date(item.created_at).toLocaleString()}</span>
                        </td>
                        <td className="px-8 py-6 text-right whitespace-nowrap">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 ml-auto ${expandedId === item.id ? 'bg-uiupc-orange text-white rotate-180' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-300'}`}>
                            <FaChevronDown className="text-xs" />
                          </div>
                        </td>
                      </motion.tr>
                      <AnimatePresence>
                        {expandedId === item.id && (
                          <tr>
                            <td colSpan={5} className="p-0 border-none">
                              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="bg-zinc-50 dark:bg-zinc-950/50 p-10 border-t border-black/5 dark:border-white/5 overflow-hidden">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                  <div className="space-y-4">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Previous State</p>
                                    <pre className="p-8 bg-white dark:bg-black rounded-3xl border border-black/5 dark:border-white/5 text-[11px] text-zinc-500 font-mono overflow-auto max-h-[300px] custom-scrollbar shadow-inner">
                                      {item.old_data ? JSON.stringify(item.old_data, null, 4) : "// No historical data"}
                                    </pre>
                                  </div>
                                  <div className="space-y-4">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Modified State</p>
                                    <pre className={`p-8 rounded-3xl border text-[11px] font-mono overflow-auto max-h-[300px] custom-scrollbar shadow-inner ${isCritical ? 'bg-red-500/[0.02] border-red-500/10 text-red-700/60' : 'bg-green-500/[0.02] border-green-500/10 text-zinc-700 dark:text-zinc-300'}`}>
                                      {item.new_data ? JSON.stringify(item.new_data, null, 4) : "// Deleted Record"}
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
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── PAGINATION ─────────────────────────────────────────── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-10 border-t border-black/5 dark:border-white/5">
          <div className="flex flex-col"><p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Forensic Ledger</p><p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Page {page + 1} of {totalPages} | Showing {logs?.length || 0} Events</p></div>
          <div className="flex items-center gap-3">
            <button disabled={page === 0} onClick={() => { setPage(p => Math.max(0, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="w-14 h-14 flex items-center justify-center rounded-2xl bg-white dark:bg-[#080808] border border-black/5 dark:border-white/5 text-zinc-400 disabled:opacity-20 hover:border-uiupc-orange hover:text-uiupc-orange shadow-sm transition-all"><FaChevronLeft className="text-xs" /></button>
            <button disabled={page >= totalPages - 1} onClick={() => { setPage(p => p + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="w-14 h-14 flex items-center justify-center rounded-2xl bg-white dark:bg-[#080808] border border-black/5 dark:border-white/5 text-zinc-400 disabled:opacity-20 hover:border-uiupc-orange hover:text-uiupc-orange shadow-sm transition-all"><FaChevronRight className="text-xs" /></button>
          </div>
        </div>
      )}
    </div>
  );
};
