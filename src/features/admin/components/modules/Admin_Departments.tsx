"use client";

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  IconPlus, IconPalette, IconTrash, IconEdit, IconSearch, IconSpinner, 
  IconLayerGroup, IconCamera, IconUsers, IconGlobe, IconStar, IconClipboardList, IconCheck 
} from '@/components/shared/Icons';
import { 
  Admin_ErrorBoundary, Admin_DeleteConfirmModal, Admin_ModuleHeader, Admin_StatCard 
} from "@/features/admin/components";
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { supabase } from "@/lib/supabase";
import { initAdminPassword } from "@/features/admin/actions";

interface Department {
  id: string;
  name: string;
  display_name: string;
  description: string;
  icon: string;
  created_at: string;
}

const ICON_OPTIONS = [
  { value: 'FaPalette', label: 'Design/Palette', icon: <IconPalette size={16} /> },
  { value: 'FaCamera', label: 'Visual/Camera', icon: <IconCamera size={16} /> },
  { value: 'FaUsers', label: 'HR/Users', icon: <IconUsers size={16} /> },
  { value: 'FaGlobe', label: 'PR/Globe', icon: <IconGlobe size={16} /> },
  { value: 'FaStar', label: 'Event/Star', icon: <IconStar size={16} /> },
  { value: 'FaClipboardList', label: 'Organizing/List', icon: <IconClipboardList size={16} /> },
];

export const Admin_Departments: React.FC = () => {
  const { adminProfile } = useSupabaseAuth();
  const [isAdding, setIsAdding] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set());
  const [deleteTarget, setDeleteTarget] = useState<Department | null>(null);

  useEffect(() => { initAdminPassword(); }, []);

  const { data, isLoading, refetch } = useSupabaseData("departments", {
    orderBy: 'display_name',
    orderDesc: false,
  });

  const handleUpsert = async (id: string | null, formData: any) => {
    try {
      const { error } = id 
        ? await supabase.from("departments").update(formData).eq('id', id)
        : await supabase.from("departments").insert([formData]);

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
      item.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [data, hiddenIds, searchTerm]);

  return (
    <div className="w-full space-y-8 min-w-0 relative z-10 isolate">
      <Admin_ModuleHeader 
        title="Departments"
        description="Organize club structure and departmental teams."
      >
        <Admin_StatCard label="Active Departments" value={data?.length || 0} icon={<IconLayerGroup size={20} />} />
        <Admin_StatCard label="Review Status" value="Online" icon={<IconCheck size={20} />} color="text-green-500" />
      </Admin_ModuleHeader>

      {/* ── FILTER BAR ─────────────────────────────────────────── */}
      <div className="w-full bg-white dark:bg-[#0d0d0d] p-3 sm:p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm relative z-10">
        <div className="flex flex-col lg:flex-row gap-6 items-stretch lg:items-center justify-between">
          <div className="relative flex-1 group min-w-[200px]">
            <IconSearch size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-uiupc-orange transition-colors" />
            <input 
              type="text" 
              placeholder="Search departments..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full py-4 pl-14 pr-8 bg-zinc-100 dark:bg-[#1a1a1a] border border-transparent focus:border-uiupc-orange/30 rounded-xl text-sm outline-none transition-all placeholder:text-zinc-400 font-medium" 
            />
          </div>
          <button 
            onClick={() => setIsAdding(true)} 
            className="px-8 h-12 flex items-center gap-3 bg-uiupc-orange text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-uiupc-orange/20 hover:brightness-110 transition-all"
          >
            <IconPlus size={14} /> New Department
          </button>
        </div>
      </div>

      {/* ── DEPARTMENT GRID ───────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
        {isLoading ? (
          [...Array(6)].map((_, i) => (
            <div key={i} className="h-64 bg-white dark:bg-[#0d0d0d] rounded-[2rem] border border-zinc-200 dark:border-zinc-800 animate-pulse" />
          ))
        ) : visibleData.length === 0 ? (
          <div className="col-span-full py-20 bg-white dark:bg-[#0d0d0d] rounded-[2rem] border border-zinc-200 dark:border-zinc-800 flex flex-col items-center gap-4">
             <div className="w-16 h-16 rounded-full bg-zinc-50 dark:bg-[#1a1a1a] flex items-center justify-center text-zinc-300"><IconSearch size={20} /></div>
             <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">No departments found</p>
          </div>
        ) : (
          visibleData.map((dept) => (
            <motion.div 
              key={dept.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="group relative bg-white dark:bg-[#0d0d0d] p-8 rounded-[2rem] border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-xl hover:border-uiupc-orange/20 transition-all"
            >
              <div className="flex justify-between items-start mb-8">
                <div className="w-16 h-16 rounded-2xl bg-zinc-50 dark:bg-[#1a1a1a] flex items-center justify-center text-2xl text-uiupc-orange border border-zinc-200 dark:border-zinc-800 shadow-inner">
                  {ICON_OPTIONS.find(o => o.value === dept.icon)?.icon || <IconLayerGroup size={24} />}
                </div>
                <div className="flex gap-2 md:opacity-0 group-hover:opacity-100 transition-all">
                  <button onClick={() => setEditingDept(dept)} className="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl text-zinc-400 hover:text-uiupc-orange hover:bg-uiupc-orange/10 transition-colors border border-transparent hover:border-uiupc-orange/20"><IconEdit size={12} /></button>
                  <button onClick={() => setDeleteTarget(dept)} className="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl text-zinc-400 hover:text-red-500 hover:bg-red-500/10 transition-colors border border-transparent hover:border-red-500/20"><IconTrash size={12} /></button>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-2xl font-black uppercase tracking-tighter text-zinc-900 dark:text-white leading-none">{dept.display_name}</h4>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-uiupc-orange/60">{dept.name}</p>
                <div className="pt-4">
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed line-clamp-3">{dept.description}</p>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* ── MODALS ────────────────────────────────────────────── */}
      <Admin_ErrorBoundary>
        <AnimatePresence>
          {(isAdding || editingDept) && (
            <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 md:p-10">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-2xl" onClick={() => { setIsAdding(false); setEditingDept(null); }} />
              <motion.div initial={{ scale: 0.9, opacity: 0, y: 40 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 40 }} className="relative w-full max-w-2xl bg-white dark:bg-[#0d0d0d] rounded-[3rem] p-8 md:p-14 border border-zinc-200 dark:border-zinc-800 shadow-3xl overflow-y-auto max-h-[90vh] custom-scrollbar">
                <div className="mb-14 text-center md:text-left">
                  <span className="text-uiupc-orange text-[10px] font-black uppercase tracking-[0.4em] mb-4 block">{editingDept ? 'Department Profile' : 'New Assignment'}</span>
                  <h3 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-zinc-900 dark:text-white leading-none">{editingDept ? 'Edit Dept' : 'Create Dept'}</h3>
                </div>
                <DepartmentForm 
                  initialData={editingDept || undefined} 
                  onSuccess={() => { setIsAdding(false); setEditingDept(null); refreshData(); }} 
                  onCancel={() => { setIsAdding(false); setEditingDept(null); }} 
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
          itemName={deleteTarget?.display_name} 
          onSuccess={() => {
            if (deleteTarget) setHiddenIds(prev => new Set(prev).add(deleteTarget.id));
            refreshData();
          }}
        />
      </Admin_ErrorBoundary>
    </div>
  );
};

const DepartmentForm: React.FC<{ initialData?: Department; onSuccess: () => void; onCancel: () => void; onSave: (id: string | null, data: any) => Promise<any> }> = ({ initialData, onSuccess, onCancel, onSave }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    display_name: initialData?.display_name || '',
    description: initialData?.description || '',
    icon: initialData?.icon || 'FaPalette',
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Display Name</label>
          <input type="text" required value={formData.display_name} onChange={(e) => setFormData({...formData, display_name: e.target.value})} className="w-full bg-transparent border-b-2 border-zinc-100 dark:border-zinc-800 py-4 outline-none focus:border-uiupc-orange dark:text-white text-2xl font-black transition-all" placeholder="e.g. Human Resource" />
        </div>
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Internal ID</label>
          <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value.toLowerCase().replace(/\s+/g, '-')})} className="w-full bg-zinc-100 dark:bg-[#1a1a1a] p-5 rounded-2xl outline-none focus:border-uiupc-orange dark:text-white font-bold text-sm transition-all" placeholder="e.g. hr" />
        </div>
      </div>

      <div className="space-y-4">
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Visual Icon</label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {ICON_OPTIONS.map(opt => (
            <button 
              key={opt.value} 
              type="button" 
              onClick={() => setFormData({...formData, icon: opt.value})}
              className={`p-5 rounded-2xl border flex flex-col items-center gap-3 transition-all ${formData.icon === opt.value ? 'bg-uiupc-orange text-white border-uiupc-orange shadow-lg' : 'bg-zinc-50 dark:bg-[#1a1a1a] border-zinc-100 dark:border-zinc-800 text-zinc-400'}`}
            >
              <span className="text-2xl">{opt.icon}</span>
              <span className="text-[8px] font-black uppercase tracking-widest text-center">{opt.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Description</label>
        <textarea required value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full bg-zinc-100 dark:bg-[#1a1a1a] p-6 rounded-[2rem] outline-none focus:border-uiupc-orange dark:text-white font-bold text-sm resize-none h-32 transition-all" placeholder="Mission and scope of this department..." />
      </div>

      <div className="flex flex-col md:flex-row gap-4 pt-10 border-t border-zinc-100 dark:border-zinc-800">
        <button type="button" onClick={onCancel} className="flex-1 py-6 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 text-[10px] font-black uppercase tracking-widest rounded-3xl hover:bg-zinc-200 transition-all">Discard</button>
        <button type="submit" disabled={loading} className="flex-[2] py-6 bg-uiupc-orange text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-3xl shadow-2xl hover:translate-y-[-2px] transition-all disabled:opacity-50">{loading ? <IconSpinner size={16} className="animate-spin mx-auto" /> : (initialData ? 'Save Changes' : 'Create Department')}</button>
      </div>
    </form>
  );
};
