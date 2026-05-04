"use client";

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  IconPlus, IconTrophy, IconTrash, IconEdit, IconSearch, IconSpinner, 
  IconAward, IconImage, IconCalendarAlt, IconUserCircle, IconCheck 
} from '@/components/shared/Icons';
import { 
  Admin_ErrorBoundary, Admin_DeleteConfirmModal, Admin_ModuleHeader, 
  Admin_StatCard, Admin_DrivePicker 
} from "@/features/admin/components";
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { supabase } from "@/lib/supabase";
import { getImageUrl } from "@/utils/imageUrl";
import { initAdminPassword } from "@/features/admin/actions";

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

const AchievementRow = React.memo(({ 
  item, onEdit, onDelete 
}: { 
  item: Achievement; onEdit: (item: Achievement) => void; onDelete: (item: Achievement) => void 
}) => {
  return (
    <motion.tr className="group hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition-all border-b border-zinc-100 dark:border-zinc-800/50">
      <td className="px-8 py-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-800 overflow-hidden shrink-0 border border-zinc-200 dark:border-zinc-800 shadow-inner flex items-center justify-center group-hover:scale-105 transition-transform">
            {item.image_url ? (
              <img src={getImageUrl(item.image_url, 150, 150)} className="w-full h-full object-cover" alt="" />
            ) : (
              <IconTrophy size={20} className="text-uiupc-orange" />
            )}
          </div>
          <div className="flex flex-col min-w-[200px]">
            <span className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-tight">{item.title}</span>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest truncate">{item.description?.slice(0, 40)}...</span>
          </div>
        </div>
      </td>
      <td className="px-6 py-6 text-sm font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-[0.2em] hidden sm:table-cell">{item.year}</td>
      <td className="px-6 py-6 hidden md:table-cell">
         <span className="px-4 py-1.5 bg-zinc-100 dark:bg-zinc-800/50 text-[9px] font-black uppercase tracking-widest rounded-xl border border-zinc-200 dark:border-zinc-800/50 flex items-center gap-2 w-fit text-zinc-500">
           <IconAward size={10} className="text-uiupc-orange" /> {item.category}
         </span>
      </td>
      <td className="px-6 py-6 text-[10px] font-bold text-zinc-400 uppercase tracking-widest hidden lg:table-cell">{item.recipient}</td>
      <td className="px-8 py-6 text-right whitespace-nowrap">
        <div className="flex items-center justify-end gap-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
          <button onClick={() => onEdit(item)} title="Edit" className="w-10 h-10 flex items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:bg-uiupc-orange hover:text-white transition-all"><IconEdit size={12} /></button>
          <button onClick={() => onDelete(item)} title="Delete" className="w-10 h-10 flex items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400 hover:bg-red-500 hover:text-white transition-all"><IconTrash size={12} /></button>
        </div>
      </td>
    </motion.tr>
  );
});
AchievementRow.displayName = 'AchievementRow';

export const Admin_Achievements: React.FC = () => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingItem, setEditingItem] = useState<Achievement | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set());
  const [deleteTarget, setDeleteTarget] = useState<Achievement | null>(null);

  useEffect(() => { initAdminPassword(); }, []);

  const { data, isLoading, refetch } = useSupabaseData("achievements", {
    orderBy: 'year',
    orderDesc: true,
  });

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

  const refreshData = useCallback(() => {
    setHiddenIds(new Set());
    refetch();
  }, [refetch]);

  const visibleData = useMemo(() => {
    const rawData = (data || []).filter(item => !hiddenIds.has(item.id));
    if (!searchTerm) return rawData;
    return rawData.filter(item => 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.recipient.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [data, hiddenIds, searchTerm]);

  return (
    <div className="w-full space-y-8 min-w-0 relative z-10 isolate">
      <Admin_ModuleHeader 
        title="Achievements"
        description="Record and showcase club milestones and awards."
      >
        <Admin_StatCard label="Total Records" value={data?.length || 0} icon={<IconTrophy size={20} />} />
        <Admin_StatCard label="Review Status" value="Online" icon={<IconCheck size={20} />} color="text-green-500" />
      </Admin_ModuleHeader>

      {/* ── FILTER BAR ─────────────────────────────────────────── */}
      <div className="w-full bg-white dark:bg-[#0d0d0d] p-3 sm:p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm relative z-10">
        <div className="flex flex-col lg:flex-row gap-6 items-stretch lg:items-center justify-between">
          <div className="relative flex-1 group min-w-[200px]">
            <IconSearch size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-uiupc-orange transition-colors" />
            <input 
              type="text" 
              placeholder="Search achievements..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full py-4 pl-14 pr-8 bg-zinc-100 dark:bg-[#1a1a1a] border border-transparent focus:border-uiupc-orange/30 rounded-xl text-sm outline-none transition-all placeholder:text-zinc-400 font-medium" 
            />
          </div>
          <button 
            onClick={() => setIsAdding(true)} 
            className="px-8 h-12 flex items-center gap-3 bg-uiupc-orange text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-uiupc-orange/20 hover:brightness-110 transition-all"
          >
            <IconPlus size={14} /> New Achievement
          </button>
        </div>
      </div>

      {/* ── DATA TABLE ─────────────────────────────────────────── */}
      <div className="bg-white dark:bg-[#0d0d0d] rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm relative z-10">
        <div className="overflow-x-auto min-h-[500px]">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-zinc-50 dark:bg-zinc-900/50">
                <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 whitespace-nowrap">Achievement Info</th>
                <th className="px-6 py-6 text-left text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 whitespace-nowrap hidden sm:table-cell">Year</th>
                <th className="px-6 py-6 text-left text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 whitespace-nowrap hidden md:table-cell">Category</th>
                <th className="px-6 py-6 text-left text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 whitespace-nowrap hidden lg:table-cell">Recipient</th>
                <th className="px-8 py-6 text-right text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5">
              {isLoading ? (
                [...Array(5)].map((_, i) => <tr key={i} className="animate-pulse"><td colSpan={5} className="px-8 py-8"><div className="h-10 bg-zinc-50 dark:bg-zinc-900 rounded-xl" /></td></tr>)
              ) : visibleData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 rounded-[2rem] bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center text-zinc-300 dark:text-zinc-600"><IconSearch size={20} /></div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">No achievements found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                visibleData.map((item) => (
                  <AchievementRow 
                    key={item.id} 
                    item={item} 
                    onEdit={setEditingItem}
                    onDelete={setDeleteTarget}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── MODALS ────────────────────────────────────────────── */}
      <Admin_ErrorBoundary>
        <AnimatePresence>
          {(isAdding || editingItem) && (
            <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 md:p-10">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-2xl" onClick={() => { setIsAdding(false); setEditingItem(null); }} />
              <motion.div initial={{ scale: 0.9, opacity: 0, y: 40 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 40 }} className="relative w-full max-w-2xl bg-white dark:bg-[#0d0d0d] rounded-[3rem] p-8 md:p-14 border border-zinc-200 dark:border-zinc-800 shadow-3xl overflow-y-auto max-h-[90vh] custom-scrollbar">
                <div className="mb-14 text-center md:text-left">
                  <span className="text-uiupc-orange text-[10px] font-black uppercase tracking-[0.4em] mb-4 block">{editingItem ? 'Achievement Record' : 'Legacy Addition'}</span>
                  <h3 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-zinc-900 dark:text-white leading-none">{editingItem ? 'Edit Award' : 'Record Award'}</h3>
                </div>
                <AchievementForm 
                  initialData={editingItem || undefined} 
                  onSuccess={() => { setIsAdding(false); setEditingItem(null); refreshData(); }} 
                  onCancel={() => { setIsAdding(false); setEditingItem(null); }} 
                  onSave={handleUpsert} 
                />
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </Admin_ErrorBoundary>

      <Admin_ErrorBoundary>
        <Admin_DeleteConfirmModal 
          isOpen={!!deleteTarget} 
          onClose={() => setDeleteTarget(null)} 
          itemId={deleteTarget?.id} 
          itemName={deleteTarget?.title} 
          onSuccess={() => {
            if (deleteTarget) setHiddenIds(prev => new Set(prev).add(deleteTarget.id));
            refreshData();
          }}
        />
      </Admin_ErrorBoundary>
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
        <input type="text" required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full bg-transparent border-b-2 border-zinc-100 dark:border-zinc-800 py-4 outline-none focus:border-uiupc-orange dark:text-white text-2xl font-black transition-all" placeholder="e.g. Club of the Year" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Year</label>
          <input type="text" required value={formData.year} onChange={(e) => setFormData({...formData, year: e.target.value})} className="w-full bg-zinc-100 dark:bg-[#1a1a1a] p-5 rounded-2xl outline-none focus:border-uiupc-orange dark:text-white font-bold text-sm" placeholder="2024" />
        </div>
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Category</label>
          <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full bg-zinc-100 dark:bg-[#1a1a1a] p-5 rounded-2xl outline-none focus:border-uiupc-orange dark:text-white font-bold text-sm">
            <option value="Award">Award</option>
            <option value="Exhibition">Exhibition</option>
            <option value="Milestone">Milestone</option>
            <option value="Recognition">Recognition</option>
          </select>
        </div>
      </div>

      <div className="space-y-3">
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Recipient</label>
        <input type="text" required value={formData.recipient} onChange={(e) => setFormData({...formData, recipient: e.target.value})} className="w-full bg-zinc-100 dark:bg-[#1a1a1a] p-5 rounded-2xl outline-none focus:border-uiupc-orange dark:text-white font-bold text-sm" placeholder="e.g. UIUPC Visual Dept" />
      </div>

      <div className="space-y-3">
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Achievement Image</label>
        <div className="flex gap-4">
           <input type="text" value={formData.image_url} onChange={(e) => setFormData({...formData, image_url: e.target.value})} className="flex-1 bg-zinc-100 dark:bg-[#1a1a1a] border border-transparent p-5 rounded-2xl outline-none focus:border-uiupc-orange dark:text-white font-bold text-sm transition-all" placeholder="Drive ID..." />
           <button type="button" onClick={() => setIsPickerOpen(true)} className="px-6 py-4 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-uiupc-orange rounded-xl text-[9px] font-black uppercase tracking-widest transition-all">Select</button>
        </div>
      </div>

      <div className="space-y-3">
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Description</label>
        <textarea required value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full bg-zinc-100 dark:bg-[#1a1a1a] p-6 rounded-[2rem] outline-none focus:border-uiupc-orange dark:text-white font-bold text-sm resize-none h-32 transition-all" placeholder="Mission and scope of this achievement..." />
      </div>

      <div className="flex flex-col md:flex-row gap-4 pt-10 border-t border-zinc-100 dark:border-zinc-800">
        <button type="button" onClick={onCancel} className="flex-1 py-6 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 text-[10px] font-black uppercase tracking-widest rounded-3xl hover:bg-zinc-200 transition-all">Discard</button>
        <button type="submit" disabled={loading} className="flex-[2] py-6 bg-uiupc-orange text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-3xl shadow-2xl hover:translate-y-[-2px] transition-all disabled:opacity-50">{loading ? <IconSpinner size={16} className="animate-spin mx-auto" /> : (initialData ? 'Save Changes' : 'Record Achievement')}</button>
      </div>

      <Admin_DrivePicker 
        isOpen={isPickerOpen} 
        onClose={() => setIsPickerOpen(false)} 
        onSelect={(id) => setFormData({...formData, image_url: id})} 
        title="Select Achievement Media"
      />
    </form>
  );
};
