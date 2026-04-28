"use client";

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaShieldAlt, 
  FaUserPlus, 
  FaTrash, 
  FaSync, 
  FaKey,
  FaEnvelope,
  FaSearch,
  FaChevronLeft,
  FaChevronRight,
  FaUserShield,
  FaFingerprint,
  FaTimes
} from 'react-icons/fa';
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { supabase } from "@/lib/supabase";
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';

export const Admin_Access: React.FC = () => {
  const { isCore } = useSupabaseAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [page, setPage] = useState(0);
  const pageSize = 12;

  const { data, count, isLoading, refetch } = useSupabaseData("admins", {
    page,
    pageSize,
    orderBy: 'role',
    orderDesc: false
  });

  const handleDelete = async (id: string, email: string) => {
    if (email === 'photographyclub@dccsa.uiu.ac.bd') return;
    if (!window.confirm(`Revoke access for ${email}?`)) return;
    try {
      const { error } = await supabase.from('admins').delete().eq('id', id);
      if (error) throw error;
      refetch();
    } catch (err: any) {
      console.error("Revoke failed:", err.message);
    }
  };

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
              placeholder="Search by name or email..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full py-5 pl-14 pr-8 bg-zinc-50 dark:bg-zinc-900/50 border border-transparent focus:border-uiupc-orange/30 rounded-2xl text-sm outline-none transition-all placeholder:text-zinc-400 font-medium" 
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button 
              onClick={() => setIsAdding(true)} 
              className="px-8 h-14 mt-auto flex items-center gap-3 bg-uiupc-orange text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-uiupc-orange/20 hover:brightness-110 transition-all"
            >
              <FaUserPlus /> Appoint Admin
            </button>
          </div>
        </div>
      </div>

      {/* ── DATA TABLE ─────────────────────────────────────────── */}
      <div className="bg-white dark:bg-[#080808] rounded-[2.5rem] border border-black/5 dark:border-white/5 overflow-hidden shadow-sm">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-zinc-50 dark:bg-zinc-900/50">
                <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 whitespace-nowrap">Admin Identity</th>
                <th className="px-6 py-6 text-left text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 whitespace-nowrap">Access Level</th>
                <th className="px-6 py-6 text-left text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 whitespace-nowrap">System ID</th>
                <th className="px-6 py-6 text-left text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 whitespace-nowrap">Security Status</th>
                <th className="px-8 py-6 text-right text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5">
              {isLoading ? (
                [...Array(3)].map((_, i) => <tr key={i} className="animate-pulse"><td colSpan={5} className="px-8 py-8"><div className="h-8 bg-zinc-50 dark:bg-zinc-900 rounded-xl" /></td></tr>)
              ) : (
                (data || []).filter(a => (a.display_name || "").toLowerCase().includes(searchTerm.toLowerCase()) || (a.email || "").toLowerCase().includes(searchTerm.toLowerCase())).map((item) => (
                  <motion.tr key={item.id} className="group hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition-all">
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-sm shadow-inner ${item.role === 'core' ? 'bg-uiupc-orange text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'}`}>
                          {item.role === 'core' ? <FaShieldAlt /> : <FaKey />}
                        </div>
                        <div className="flex flex-col min-w-[200px]">
                          <span className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-tight truncate">{item.display_name || "Club Administrator"}</span>
                          <span className="text-[11px] font-bold text-zinc-400 lowercase truncate flex items-center gap-2"><FaEnvelope className="text-[9px]" /> {item.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6 whitespace-nowrap">
                       <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border border-black/5 dark:border-white/5 flex items-center gap-2 w-fit ${item.role === 'core' ? 'bg-uiupc-orange/10 text-uiupc-orange' : 'bg-zinc-100 dark:bg-zinc-800/50 text-zinc-400'}`}>
                         <FaUserShield className="text-[10px]" /> {item.role}
                       </span>
                    </td>
                    <td className="px-6 py-6 whitespace-nowrap">
                       <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2"><FaFingerprint className="text-zinc-300" /> {item.id.split('-')[0]}</span>
                    </td>
                    <td className="px-6 py-6 whitespace-nowrap">
                       <div className="flex items-center gap-2">
                         <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                         <span className="text-[9px] font-black uppercase tracking-widest text-green-500">Verified Access</span>
                       </div>
                    </td>
                    <td className="px-8 py-6 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {item.role !== 'core' && (
                          <button onClick={() => handleDelete(item.id, item.email)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400 hover:bg-red-500 hover:text-white transition-all"><FaTrash className="text-xs" /></button>
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
        <div className="flex items-center justify-between pt-10 border-t border-black/5 dark:border-white/5">
          <div className="flex flex-col"><p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Personnel Ledger</p><p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Page {page + 1} of {totalPages} | Total {count} Administrators</p></div>
          <div className="flex items-center gap-3">
            <button disabled={page === 0} onClick={() => { setPage(p => Math.max(0, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="w-14 h-14 flex items-center justify-center rounded-2xl bg-white dark:bg-[#080808] border border-black/5 dark:border-white/5 text-zinc-400 disabled:opacity-20 hover:border-uiupc-orange hover:text-uiupc-orange shadow-sm transition-all"><FaChevronLeft className="text-xs" /></button>
            <button disabled={page >= totalPages - 1} onClick={() => { setPage(p => p + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="w-14 h-14 flex items-center justify-center rounded-2xl bg-white dark:bg-[#080808] border border-black/5 dark:border-white/5 text-zinc-400 disabled:opacity-20 hover:border-uiupc-orange hover:text-uiupc-orange shadow-sm transition-all"><FaChevronRight className="text-xs" /></button>
          </div>
        </div>
      )}

      {/* ── ADD MODAL ─────────────────────────────────────────── */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-2xl" onClick={() => setIsAdding(false)} />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative w-full max-w-xl bg-white dark:bg-[#080808] rounded-[3rem] p-12 border border-black/10 dark:border-white/10 shadow-3xl">
              <div className="mb-10 text-center">
                <div className="w-20 h-20 bg-uiupc-orange/10 rounded-[2rem] flex items-center justify-center text-3xl text-uiupc-orange mx-auto mb-6"><FaUserPlus /></div>
                <h3 className="text-3xl font-black uppercase tracking-tighter dark:text-white">Add Administrator</h3>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 mt-2">New security record</p>
              </div>
              <AddAdminForm onCancel={() => setIsAdding(false)} onSuccess={() => { setIsAdding(false); refetch(); }} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
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
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="space-y-4">
        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Email Address</label>
        <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-zinc-50 dark:bg-zinc-900/50 border border-black/5 dark:border-white/5 p-5 rounded-2xl outline-none focus:border-uiupc-orange dark:text-white font-bold transition-all" placeholder="admin@uiu.ac.bd" />
      </div>
      <div className="space-y-4">
        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Display Name</label>
        <input type="text" required value={formData.display_name} onChange={e => setFormData({...formData, display_name: e.target.value})} className="w-full bg-zinc-50 dark:bg-zinc-900/50 border border-black/5 dark:border-white/5 p-5 rounded-2xl outline-none focus:border-uiupc-orange dark:text-white font-bold transition-all" placeholder="Full Name" />
      </div>
      <div className="space-y-4">
        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Access Level</label>
        <div className="grid grid-cols-2 gap-4">
          <button type="button" onClick={() => setFormData({...formData, role: 'moderator'})} className={`py-4 rounded-2xl text-[9px] font-black uppercase tracking-widest border transition-all ${formData.role === 'moderator' ? 'bg-zinc-900 text-white dark:bg-white dark:text-black shadow-lg' : 'bg-transparent border-black/5 dark:border-white/5 text-zinc-400 hover:border-uiupc-orange/30'}`}>Moderator</button>
          <button type="button" onClick={() => setFormData({...formData, role: 'core'})} className={`py-4 rounded-2xl text-[9px] font-black uppercase tracking-widest border transition-all ${formData.role === 'core' ? 'bg-uiupc-orange text-white border-uiupc-orange shadow-lg' : 'bg-transparent border-black/5 dark:border-white/5 text-zinc-400 hover:border-uiupc-orange/30'}`}>Core Admin</button>
        </div>
      </div>
      <div className="flex gap-4 pt-6">
        <button type="button" onClick={onCancel} className="flex-1 py-5 bg-zinc-100 dark:bg-zinc-900 text-zinc-500 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-zinc-200 transition-all">Cancel</button>
        <button type="submit" disabled={loading} className="flex-[2] py-5 bg-uiupc-orange text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl hover:brightness-110 transition-all flex items-center justify-center gap-3">{loading ? <FaSync className="animate-spin" /> : <FaUserPlus />}{loading ? "Confirming..." : "Assign Access"}</button>
      </div>
    </form>
  );
};
