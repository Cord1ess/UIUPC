"use client";

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaPlus, 
  FaPalette, 
  FaTrash,
  FaEdit,
  FaSearch,
  FaSpinner,
  FaLayerGroup,
  FaCamera,
  FaUsers,
  FaGlobe,
  FaStar,
  FaClipboardList
} from 'react-icons/fa';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { supabase } from "@/lib/supabase";

interface Department {
  id: string;
  name: string;
  display_name: string;
  description: string;
  icon: string;
  created_at: string;
}

const ICON_OPTIONS = [
  { value: 'FaPalette', label: 'Design/Palette', icon: <FaPalette /> },
  { value: 'FaCamera', label: 'Visual/Camera', icon: <FaCamera /> },
  { value: 'FaUsers', label: 'HR/Users', icon: <FaUsers /> },
  { value: 'FaGlobe', label: 'PR/Globe', icon: <FaGlobe /> },
  { value: 'FaStar', label: 'Event/Star', icon: <FaStar /> },
  { value: 'FaClipboardList', label: 'Organizing/List', icon: <FaClipboardList /> },
];

export const Admin_Departments: React.FC = () => {
  const { adminProfile } = useSupabaseAuth();
  const [isAdding, setIsAdding] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const { data, isLoading, refetch } = useSupabaseData("departments", {
    orderBy: 'display_name',
    orderDesc: false,
  });

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this department? This may affect members linked to it.")) return;
    try {
      const { error } = await supabase.from("departments").delete().eq('id', id);
      if (error) throw error;
      
      if (adminProfile) {
        await supabase.from('audit_logs').insert({
          admin_id: adminProfile.id,
          action: 'department_deleted',
          target_table: 'departments',
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
        ? await supabase.from("departments").update(formData).eq('id', id)
        : await supabase.from("departments").insert([formData]);

      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  };

  const filteredDepts = useMemo(() => {
    return (data || []).filter(item => 
      item.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
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
              placeholder="Search departments..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full py-5 pl-14 pr-8 bg-zinc-50 dark:bg-zinc-900/50 border border-transparent focus:border-uiupc-orange/30 rounded-2xl text-sm outline-none transition-all placeholder:text-zinc-400 font-medium" 
            />
          </div>
          <button 
            onClick={() => setIsAdding(true)} 
            className="px-8 h-14 flex items-center gap-3 bg-uiupc-orange text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-uiupc-orange/20 hover:brightness-110 transition-all"
          >
            <FaPlus /> New Department
          </button>
        </div>
      </div>

      {/* ── DEPARTMENT GRID ───────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          [...Array(6)].map((_, i) => (
            <div key={i} className="h-64 bg-white dark:bg-[#080808] rounded-[2.5rem] border border-black/5 dark:border-white/5 animate-pulse" />
          ))
        ) : (
          filteredDepts.map((dept) => (
            <motion.div 
              key={dept.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="group relative bg-white dark:bg-[#080808] p-8 rounded-[2.5rem] border border-black/5 dark:border-white/5 shadow-sm hover:shadow-xl hover:border-uiupc-orange/20 transition-all"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="w-14 h-14 rounded-2xl bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center text-2xl text-uiupc-orange border border-black/5 dark:border-white/5">
                  {ICON_OPTIONS.find(o => o.value === dept.icon)?.icon || <FaLayerGroup />}
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                  <button onClick={() => setEditingDept(dept)} className="p-3 bg-zinc-50 dark:bg-zinc-900 rounded-xl text-zinc-400 hover:text-uiupc-orange transition-colors"><FaEdit /></button>
                  <button onClick={() => handleDelete(dept.id)} className="p-3 bg-zinc-50 dark:bg-zinc-900 rounded-xl text-zinc-400 hover:text-red-500 transition-colors"><FaTrash /></button>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xl font-black uppercase tracking-tighter text-zinc-900 dark:text-white leading-none">{dept.display_name}</h4>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-uiupc-orange/60">{dept.name}</p>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed line-clamp-3 pt-4">{dept.description}</p>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* ── MODALS ────────────────────────────────────────────── */}
      <AnimatePresence>
        {(isAdding || editingDept) && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-2xl" onClick={() => { setIsAdding(false); setEditingDept(null); }} />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 40 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 40 }} className="relative w-full max-w-2xl bg-white dark:bg-[#080808] rounded-[3rem] p-8 md:p-14 border border-black/10 dark:border-white/10 shadow-3xl overflow-y-auto max-h-[90vh]">
              <div className="mb-14">
                <span className="text-uiupc-orange text-[10px] font-black uppercase tracking-[0.4em] mb-4 block">{editingDept ? 'Refine Architecture' : 'Expansion'}</span>
                <h3 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-zinc-900 dark:text-white">{editingDept ? 'Edit Dept' : 'New Dept'}</h3>
              </div>
              <DepartmentForm 
                initialData={editingDept || undefined} 
                onSuccess={() => { setIsAdding(false); setEditingDept(null); refetch(); }} 
                onCancel={() => { setIsAdding(false); setEditingDept(null); }} 
                onSave={handleUpsert} 
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
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
          <input type="text" required value={formData.display_name} onChange={(e) => setFormData({...formData, display_name: e.target.value})} className="w-full bg-zinc-50 dark:bg-zinc-900/50 border border-black/5 dark:border-white/5 p-5 rounded-2xl outline-none focus:border-uiupc-orange dark:text-white font-bold text-sm" placeholder="Human Resource" />
        </div>
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Slug (Unique Name)</label>
          <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value.toLowerCase().replace(/\s+/g, '-')})} className="w-full bg-zinc-50 dark:bg-zinc-900/50 border border-black/5 dark:border-white/5 p-5 rounded-2xl outline-none focus:border-uiupc-orange dark:text-white font-bold text-sm" placeholder="hr" />
        </div>
      </div>

      <div className="space-y-4">
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Icon Type</label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {ICON_OPTIONS.map(opt => (
            <button 
              key={opt.value} 
              type="button" 
              onClick={() => setFormData({...formData, icon: opt.value})}
              className={`p-4 rounded-2xl border flex items-center gap-3 transition-all ${formData.icon === opt.value ? 'bg-uiupc-orange/10 border-uiupc-orange text-uiupc-orange' : 'bg-transparent border-black/5 dark:border-white/5 text-zinc-400'}`}
            >
              <span className="text-lg">{opt.icon}</span>
              <span className="text-[9px] font-black uppercase tracking-widest">{opt.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Description</label>
        <textarea required value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full bg-zinc-50 dark:bg-zinc-900/50 border border-black/5 dark:border-white/5 p-5 rounded-2xl outline-none focus:border-uiupc-orange dark:text-white font-bold text-sm resize-none h-32" placeholder="Describe the mission of this department..." />
      </div>

      <div className="flex flex-col md:flex-row gap-4 pt-10 border-t border-black/5 dark:border-white/5">
        <button type="button" onClick={onCancel} className="flex-1 py-6 bg-zinc-100 dark:bg-zinc-900 text-zinc-500 text-[10px] font-black uppercase tracking-widest rounded-3xl hover:bg-zinc-200 transition-all">Cancel</button>
        <button type="submit" disabled={loading} className="flex-[2] py-6 bg-uiupc-orange text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-3xl shadow-2xl hover:translate-y-[-2px] transition-all disabled:opacity-50">{loading ? <FaSpinner className="animate-spin mx-auto" /> : (initialData ? 'Update Department' : 'Create Department')}</button>
      </div>
    </form>
  );
};
