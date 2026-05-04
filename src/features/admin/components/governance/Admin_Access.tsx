"use client";

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  IconShieldAlt, IconUserPlus, IconTrash, IconSync, IconKey, IconEnvelope, 
  IconSearch, IconChevronLeft, IconChevronRight, IconUserShield, IconFingerprint, 
  IconClose, IconCheck, IconLock 
} from '@/components/shared/Icons';
import { 
  Admin_ErrorBoundary, Admin_ModuleHeader, Admin_StatCard 
} from "@/features/admin/components";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { supabase } from "@/lib/supabase";
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { initAdminPassword } from "@/features/admin/actions";

export const Admin_Access: React.FC = () => {
  const { isCore } = useSupabaseAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [page, setPage] = useState(0);
  const pageSize = 12;

  useEffect(() => { initAdminPassword(); }, []);

  const { data, count, isLoading, refetch } = useSupabaseData("admins", {
    page,
    pageSize,
    orderBy: 'role',
    orderDesc: false
  });

  const handleDelete = async (id: string, email: string) => {
    if (email === 'photographyclub@dccsa.uiu.ac.bd') return;
    if (!window.confirm(`Revoke administrative access for ${email}?`)) return;
    try {
      const { error } = await supabase.from('admins').delete().eq('id', id);
      if (error) throw error;
      refetch();
    } catch (err: any) {
      alert("Revocation failed: " + err.message);
    }
  };

  const visibleData = useMemo(() => {
    const rawData = data || [];
    if (!searchTerm) return rawData;
    return rawData.filter(a => 
      (a.display_name || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
      (a.email || "").toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [data, searchTerm]);

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
        title="Access Control"
        description="Manage administrative permissions and security levels."
      >
        <Admin_StatCard label="Total Administrators" value={count} icon={<IconShieldAlt size={16} />} />
        <Admin_StatCard label="Security Status" value="Verified" icon={<IconCheck size={16} />} color="text-green-500" />
      </Admin_ModuleHeader>

      {/* ── FILTER BAR ─────────────────────────────────────────── */}
      <div className="w-full bg-white dark:bg-[#0d0d0d] p-3 sm:p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm relative z-10">
        <div className="flex flex-col lg:flex-row gap-6 items-stretch lg:items-center justify-between">
          <div className="relative flex-1 group min-w-[200px]">
            <IconSearch size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-uiupc-orange transition-colors" />
            <input 
              type="text" 
              placeholder="Search by name or email..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full py-4 pl-14 pr-8 bg-zinc-100 dark:bg-[#1a1a1a] border border-transparent focus:border-uiupc-orange/30 rounded-xl text-sm outline-none transition-all placeholder:text-zinc-400 font-medium" 
            />
          </div>
          <button 
            onClick={() => setIsAdding(true)} 
            className="px-8 h-12 flex items-center gap-3 bg-uiupc-orange text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-uiupc-orange/20 hover:brightness-110 transition-all"
          >
            <IconUserPlus size={14} /> Grant Access
          </button>
        </div>
      </div>

      {/* ── DATA TABLE ─────────────────────────────────────────── */}
      <div className="bg-white dark:bg-[#0d0d0d] rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm relative z-10">
        <div className="overflow-x-auto min-h-[500px]">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-zinc-50 dark:bg-zinc-900/50">
                <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 whitespace-nowrap">Administrator Profile</th>
                <th className="px-6 py-6 text-left text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 whitespace-nowrap hidden sm:table-cell">Permission Level</th>
                <th className="px-6 py-6 text-left text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 whitespace-nowrap hidden md:table-cell">System ID</th>
                <th className="px-6 py-6 text-left text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 whitespace-nowrap hidden lg:table-cell">Security Status</th>
                <th className="px-8 py-6 text-right text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5">
              {isLoading ? (
                [...Array(3)].map((_, i) => <tr key={i} className="animate-pulse"><td colSpan={5} className="px-8 py-8"><div className="h-10 bg-zinc-50 dark:bg-zinc-900 rounded-xl" /></td></tr>)
              ) : visibleData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 rounded-[2rem] bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center text-zinc-300 dark:text-zinc-600"><IconSearch size={20} /></div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">No administrators found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                visibleData.map((item) => (
                  <motion.tr key={item.id} className="group hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition-all border-b border-zinc-100 dark:border-zinc-800/50">
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-lg shadow-inner border border-zinc-200 dark:border-zinc-800 ${item.role === 'core' ? 'bg-uiupc-orange text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'}`}>
                          {item.role === 'core' ? <IconShieldAlt size={20} /> : <IconKey size={20} />}
                        </div>
                        <div className="flex flex-col min-w-[200px]">
                          <span className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-tight truncate">{item.display_name || "Club Administrator"}</span>
                          <span className="text-[10px] font-bold text-zinc-400 lowercase truncate flex items-center gap-2 mt-0.5"><IconEnvelope size={9} /> {item.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6 whitespace-nowrap hidden sm:table-cell">
                       <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border border-zinc-200 dark:border-zinc-800/50 flex items-center gap-2 w-fit ${item.role === 'core' ? 'bg-uiupc-orange/10 text-uiupc-orange' : 'bg-zinc-100 dark:bg-zinc-800/50 text-zinc-400'}`}>
                         <IconUserShield size={10} /> {item.role}
                       </span>
                    </td>
                    <td className="px-6 py-6 whitespace-nowrap hidden md:table-cell">
                       <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2"><IconFingerprint size={12} className="text-zinc-300 dark:text-zinc-700" /> {item.id.split('-')[0]}</span>
                    </td>
                    <td className="px-6 py-6 whitespace-nowrap hidden lg:table-cell">
                       <div className="flex items-center gap-3">
                         <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.4)]" />
                         <span className="text-[9px] font-black uppercase tracking-widest text-green-500">Verified Access</span>
                       </div>
                    </td>
                    <td className="px-8 py-6 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                        {item.role !== 'core' && (
                          <button onClick={() => handleDelete(item.id, item.email)} title="Revoke Access" className="w-10 h-10 flex items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400 hover:bg-red-500 hover:text-white transition-all"><IconTrash size={12} /></button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
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
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Administrator Directory</p>
            <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Page {page + 1} of {totalPages} | Total {count} Administrators</p>
          </div>
          <div className="flex items-center gap-3">
            <button disabled={page === 0} onClick={() => { setPage(p => Math.max(0, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="w-14 h-14 flex items-center justify-center rounded-2xl bg-white dark:bg-[#0d0d0d] border border-zinc-200 dark:border-zinc-800 text-zinc-400 disabled:opacity-20 hover:border-uiupc-orange hover:text-uiupc-orange transition-all shadow-sm"><IconChevronLeft size={12} /></button>
            <button disabled={page >= totalPages - 1} onClick={() => { setPage(p => p + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="w-14 h-14 flex items-center justify-center rounded-2xl bg-white dark:bg-[#0d0d0d] border border-zinc-200 dark:border-zinc-800 text-zinc-400 disabled:opacity-20 hover:border-uiupc-orange hover:text-uiupc-orange transition-all shadow-sm"><IconChevronRight size={12} /></button>
          </div>
        </div>
      )}

      {/* ── ADD MODAL ─────────────────────────────────────────── */}
      <Admin_ErrorBoundary>
        <AnimatePresence>
          {isAdding && (
            <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 md:p-10">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-2xl" onClick={() => setIsAdding(false)} />
              <motion.div initial={{ scale: 0.9, opacity: 0, y: 40 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 40 }} className="relative w-full max-w-xl bg-white dark:bg-[#0d0d0d] rounded-[3rem] p-12 border border-zinc-200 dark:border-zinc-800 shadow-3xl overflow-hidden isolate">
                <div className="mb-12 text-center">
                  <div className="w-20 h-20 bg-uiupc-orange/10 rounded-[2rem] flex items-center justify-center text-3xl text-uiupc-orange mx-auto mb-8 border border-uiupc-orange/20 shadow-inner"><IconUserPlus size={32} /></div>
                  <h3 className="text-4xl font-black uppercase tracking-tighter dark:text-white leading-none">Grant Access</h3>
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 mt-4">Security Record Creation</p>
                </div>
                <AddAdminForm onCancel={() => setIsAdding(false)} onSuccess={() => { setIsAdding(false); refetch(); }} />
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </Admin_ErrorBoundary>
    </div>
  );
};

const AddAdminForm: React.FC<{ onCancel: () => void; onSuccess: () => void }> = ({ onCancel, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ email: '', display_name: '', role: 'moderator' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.from('admins').insert([formData]);
      if (error) throw error;
      onSuccess();
    } catch (err: any) {
      alert("Assignment failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      <div className="space-y-4">
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Email Address</label>
        <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-zinc-100 dark:bg-[#1a1a1a] p-5 rounded-2xl outline-none focus:border-uiupc-orange dark:text-white font-bold transition-all text-sm" placeholder="admin@uiu.ac.bd" />
      </div>
      <div className="space-y-4">
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Administrator Name</label>
        <input type="text" required value={formData.display_name} onChange={e => setFormData({...formData, display_name: e.target.value})} className="w-full bg-zinc-100 dark:bg-[#1a1a1a] p-5 rounded-2xl outline-none focus:border-uiupc-orange dark:text-white font-bold transition-all text-sm" placeholder="Full Name" />
      </div>
      <div className="space-y-4">
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Permission Level</label>
        <div className="grid grid-cols-2 gap-4">
          <button type="button" onClick={() => setFormData({...formData, role: 'moderator'})} className={`h-14 rounded-2xl text-[9px] font-black uppercase tracking-widest border transition-all ${formData.role === 'moderator' ? 'bg-zinc-900 text-white dark:bg-white dark:text-black shadow-lg shadow-black/20' : 'bg-transparent border-zinc-100 dark:border-zinc-800 text-zinc-400 hover:border-uiupc-orange/30'}`}>Moderator</button>
          <button type="button" onClick={() => setFormData({...formData, role: 'core'})} className={`h-14 rounded-2xl text-[9px] font-black uppercase tracking-widest border transition-all ${formData.role === 'core' ? 'bg-uiupc-orange text-white border-uiupc-orange shadow-lg shadow-uiupc-orange/20' : 'bg-transparent border-zinc-100 dark:border-zinc-800 text-zinc-400 hover:border-uiupc-orange/30'}`}>Core Admin</button>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-4 pt-10 border-t border-zinc-100 dark:border-zinc-800/50">
        <button type="button" onClick={onCancel} className="flex-1 h-14 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-zinc-200 transition-all">Discard</button>
        <button type="submit" disabled={loading} className="flex-[2] h-14 bg-uiupc-orange text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-uiupc-orange/20 hover:brightness-110 transition-all flex items-center justify-center gap-3 disabled:opacity-50">
          {loading ? <IconSync size={14} className="animate-spin" /> : <IconUserPlus size={14} />}
          {loading ? "Processing..." : "Confirm Grant"}
        </button>
      </div>
    </form>
  );
};
