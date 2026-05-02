"use client";

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaPlus, 
  FaTrophy, 
  FaTrash,
  FaEdit,
  FaSearch,
  FaSpinner,
  FaAward,
  FaImage,
  FaCalendarAlt,
  FaUserCircle
} from 'react-icons/fa';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { supabase } from "@/lib/supabase";
import { Admin_DrivePicker } from "@/features/admin/components";
import { getImageUrl } from "@/utils/imageUrl";

interface Achievement {
  id: string;
  title: string;
  description: string;
  year: string;
  category: string;
  image_url: string;
  recipient: string;
  order_index: number;
}

export const Admin_Achievements: React.FC = () => {
  const { adminProfile } = useSupabaseAuth();
  const [isAdding, setIsAdding] = useState(false);
  const [editingItem, setEditingItem] = useState<Achievement | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const { data, isLoading, refetch } = useSupabaseData("achievements", {
    orderBy: 'year',
    orderDesc: true,
  });

  const handleDelete = async (id: string) => {
    if (!window.confirm("Remove this achievement from history?")) return;
    try {
      const { error } = await supabase.from("achievements").delete().eq('id', id);
      if (error) throw error;
      
      if (adminProfile) {
        await supabase.from('audit_logs').insert({
          admin_id: adminProfile.id,
          action: 'achievement_deleted',
          target_table: 'achievements',
          target_id: id
        });
      }
      refetch();
    } catch (err: any) {
      console.error("Delete failed:", err.message);
    }
  };

  const handleUpsert = async (id: string | null, formData: any) => {
    try {
      const { error } = id 
        ? await supabase.from("achievements").update(formData).eq('id', id)
        : await supabase.from("achievements").insert([formData]);

      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  };

  const filteredItems = useMemo(() => {
    return (data || []).filter(item => 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.recipient.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [data, searchTerm]);

  return (
    <div className="w-full space-y-8 min-w-0">
      {/* ── HEADER & SEARCH ───────────────────────────────────── */}
      <div className="w-full bg-white dark:bg-[#080808] p-6 rounded-[2.5rem] border border-black/5 dark:border-white/5 shadow-sm">
        <div className="flex flex-col xl:flex-row gap-6 items-stretch xl:items-center justify-between">
          <div className="relative flex-1 group">
            <FaSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-uiupc-orange transition-colors" />
            <input 
              type="text" 
              placeholder="Search achievements..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full py-5 pl-14 pr-8 bg-zinc-50 dark:bg-zinc-900/50 border border-transparent focus:border-uiupc-orange/30 rounded-2xl text-sm outline-none transition-all placeholder:text-zinc-400 font-medium" 
            />
          </div>
          <button 
            onClick={() => setIsAdding(true)} 
            className="px-8 h-14 flex items-center gap-3 bg-uiupc-orange text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-uiupc-orange/20 hover:brightness-110 transition-all"
          >
            <FaPlus /> New Achievement
          </button>
        </div>
      </div>

      {/* ── LIST ──────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-[#080808] rounded-[2.5rem] border border-black/5 dark:border-white/5 overflow-hidden shadow-sm">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-zinc-50 dark:bg-zinc-900/50">
                <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Achievement</th>
                <th className="px-6 py-6 text-left text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Year</th>
                <th className="px-6 py-6 text-left text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Category</th>
                <th className="px-6 py-6 text-left text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Recipient</th>
                <th className="px-8 py-6 text-right text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5">
              {isLoading ? (
                [...Array(5)].map((_, i) => <tr key={i} className="animate-pulse"><td colSpan={5} className="px-8 py-8"><div className="h-10 bg-zinc-50 dark:bg-zinc-900 rounded-xl" /></td></tr>)
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id} className="group hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition-all">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        {item.image_url ? (
                          <img src={getImageUrl(item.image_url, 100, 70)} className="w-12 h-12 rounded-xl object-cover" />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-uiupc-orange/10 flex items-center justify-center text-uiupc-orange"><FaTrophy /></div>
                        )}
                        <span className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-tight">{item.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-6 text-sm font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">{item.year}</td>
                    <td className="px-6 py-6">
                       <span className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 text-[8px] font-black uppercase tracking-widest rounded-lg border border-black/5 dark:border-white/5">{item.category}</span>
                    </td>
                    <td className="px-6 py-6 text-xs font-bold text-zinc-500 dark:text-zinc-400">{item.recipient}</td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setEditingItem(item)} className="p-3 bg-zinc-50 dark:bg-zinc-900 rounded-xl text-zinc-400 hover:text-uiupc-orange transition-colors"><FaEdit /></button>
                        <button onClick={() => handleDelete(item.id)} className="p-3 bg-zinc-50 dark:bg-zinc-900 rounded-xl text-zinc-400 hover:text-red-500 transition-colors"><FaTrash /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── MODALS ────────────────────────────────────────────── */}
      <AnimatePresence>
        {(isAdding || editingItem) && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-2xl" onClick={() => { setIsAdding(false); setEditingItem(null); }} />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 40 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 40 }} className="relative w-full max-w-2xl bg-white dark:bg-[#080808] rounded-[3rem] p-8 md:p-14 border border-black/10 dark:border-white/10 shadow-3xl overflow-y-auto max-h-[90vh]">
              <div className="mb-14">
                <span className="text-uiupc-orange text-[10px] font-black uppercase tracking-[0.4em] mb-4 block">Legacy Registry</span>
                <h3 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-zinc-900 dark:text-white">{editingItem ? 'Update Milestones' : 'New Award'}</h3>
              </div>
              <AchievementForm 
                initialData={editingItem || undefined} 
                onSuccess={() => { setIsAdding(false); setEditingItem(null); refetch(); }} 
                onCancel={() => { setIsAdding(false); setEditingItem(null); }} 
                onSave={handleUpsert} 
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const AchievementForm: React.FC<{ initialData?: Achievement; onSuccess: () => void; onCancel: () => void; onSave: (id: string | null, data: any) => Promise<any> }> = ({ initialData, onSuccess, onCancel, onSave }) => {
  const [loading, setLoading] = useState(false);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    year: initialData?.year || new Date().getFullYear().toString(),
    category: initialData?.category || 'Award',
    recipient: initialData?.recipient || 'UIUPC',
    image_url: initialData?.image_url || '',
    order_index: initialData?.order_index || 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const result = await onSave(initialData?.id || null, formData);
    if (result?.success) onSuccess();
    else alert(result?.message || "Operation failed");
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      <div className="space-y-3">
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Achievement Title</label>
        <input type="text" required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full bg-zinc-50 dark:bg-zinc-900/50 border border-black/5 dark:border-white/5 p-5 rounded-2xl outline-none focus:border-uiupc-orange dark:text-white font-bold text-sm" placeholder="Club of the Year" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Year</label>
          <div className="relative">
            <FaCalendarAlt className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input type="text" required value={formData.year} onChange={(e) => setFormData({...formData, year: e.target.value})} className="w-full pl-12 pr-6 py-5 bg-zinc-50 dark:bg-zinc-900/50 border border-black/5 dark:border-white/5 rounded-2xl outline-none focus:border-uiupc-orange dark:text-white font-bold text-sm" placeholder="2024" />
          </div>
        </div>
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Category</label>
          <div className="relative">
            <FaAward className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full pl-12 pr-6 py-5 bg-zinc-50 dark:bg-zinc-900/50 border border-black/5 dark:border-white/5 rounded-2xl outline-none focus:border-uiupc-orange dark:text-white font-bold text-sm appearance-none">
              <option value="Award">Award</option>
              <option value="Exhibition">Exhibition</option>
              <option value="Milestone">Milestone</option>
              <option value="Recognition">Recognition</option>
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Recipient / Group</label>
        <div className="relative">
          <FaUserCircle className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input type="text" required value={formData.recipient} onChange={(e) => setFormData({...formData, recipient: e.target.value})} className="w-full pl-12 pr-6 py-5 bg-zinc-50 dark:bg-zinc-900/50 border border-black/5 dark:border-white/5 rounded-2xl outline-none focus:border-uiupc-orange dark:text-white font-bold text-sm" placeholder="UIUPC Visual Dept" />
        </div>
      </div>

      <div className="space-y-3">
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Visual Proof (Drive ID)</label>
        <div className="flex gap-4">
           <input type="text" value={formData.image_url} onChange={(e) => setFormData({...formData, image_url: e.target.value})} className="flex-1 bg-zinc-50 dark:bg-zinc-900/50 border border-black/5 dark:border-white/5 p-5 rounded-2xl outline-none focus:border-uiupc-orange dark:text-white font-bold text-sm" placeholder="Paste Drive ID..." />
           <button type="button" onClick={() => setIsPickerOpen(true)} className="p-5 bg-zinc-100 dark:bg-zinc-800 rounded-2xl text-zinc-400 hover:text-uiupc-orange transition-colors"><FaImage /></button>
        </div>
      </div>

      <div className="space-y-3">
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Impact Description</label>
        <textarea required value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full bg-zinc-50 dark:bg-zinc-900/50 border border-black/5 dark:border-white/5 p-5 rounded-2xl outline-none focus:border-uiupc-orange dark:text-white font-bold text-sm resize-none h-24" placeholder="Briefly describe the achievement..." />
      </div>

      <div className="flex flex-col md:flex-row gap-4 pt-10 border-t border-black/5 dark:border-white/5">
        <button type="button" onClick={onCancel} className="flex-1 py-6 bg-zinc-100 dark:bg-zinc-900 text-zinc-500 text-[10px] font-black uppercase tracking-widest rounded-3xl hover:bg-zinc-200 transition-all">Cancel</button>
        <button type="submit" disabled={loading} className="flex-[2] py-6 bg-uiupc-orange text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-3xl shadow-2xl hover:translate-y-[-2px] transition-all disabled:opacity-50">{loading ? <FaSpinner className="animate-spin mx-auto" /> : (initialData ? 'Save Changes' : 'Record Achievement')}</button>
      </div>

      <Admin_DrivePicker 
        isOpen={isPickerOpen} 
        onClose={() => setIsPickerOpen(false)} 
        onSelect={(id, url, name) => setFormData({...formData, image_url: id})} 
        title="Select Achievement Photo"
      />
    </form>
  );
};
