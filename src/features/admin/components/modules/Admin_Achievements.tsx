"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  IconTrophy, IconPlus, IconEdit, IconTrash, 
  IconSearch, IconClose, IconSync, IconExternalLink,
  IconArchive
} from '@/components/shared/Icons';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { supabase } from '@/lib/supabase';
import { Admin_DrivePicker, Admin_ModuleHeader, Admin_StatCard, Admin_ModalPortal } from "@/features/admin/components";
import { getImageUrl } from '@/utils/imageUrl';
import { executeAdminMutation } from "@/features/admin/actions";

export const Admin_Achievements: React.FC = () => {
  const { data: achievements, isLoading, refetch } = useSupabaseData("achievements", { orderBy: 'created_at', orderDesc: true });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDrivePickerOpen, setIsDrivePickerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [form, setForm] = useState({
    title: "",
    description: "",
    year: new Date().getFullYear().toString(),
    category: "Award",
    image_url: "",
    recipient: "",
  });

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setForm({
      title: item.title,
      description: item.description,
      year: item.year || new Date().getFullYear().toString(),
      category: item.category || "Award",
      image_url: item.image_url,
      recipient: item.recipient || "",
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this achievement?")) return;
    const { success, message } = await executeAdminMutation("achievements", "delete", null, id);
    if (!success) alert(message);
    else refetch();
  };

  const handleSave = async () => {
    if (!form.title) return alert("Title is required");
    setIsSaving(true);

    try {
      const payload = { ...form };
      const { success, message } = editingItem 
        ? await executeAdminMutation("achievements", "update", payload, editingItem.id)
        : await executeAdminMutation("achievements", "create", payload);

      if (!success) throw new Error(message);
      
      setIsModalOpen(false);
      setEditingItem(null);
      setForm({ title: "", description: "", year: new Date().getFullYear().toString(), category: "Award", image_url: "", recipient: "" });
      refetch();
      alert(editingItem ? "Achievement updated!" : "New achievement added!");
    } catch (err: any) {
      alert("Save failed: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const filteredItems = (achievements || []).filter((item: any) => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full space-y-6 min-w-0">
      {/* ── HEADER & ACTIONS ────────────────────────────────────── */}
      <Admin_ModuleHeader 
        title="Achievements Archive"
        description="Manage and showcase the club's major milestones."
      >
        <Admin_StatCard label="Total Achievements" value={(achievements || []).length} icon={<IconTrophy />} />
        
        <div className="p-6 bg-white dark:bg-[#0d0d0d] border border-zinc-200 dark:border-zinc-800 rounded-2xl flex flex-col justify-between shadow-sm min-h-[140px] group relative z-10">
          <p className="text-zinc-400 text-[10px] font-black uppercase tracking-widest">Quick Actions</p>
          <div className="flex items-end justify-between mt-auto">
            <div className="text-uiupc-orange text-4xl opacity-20 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500">
              <IconTrophy size={40} />
            </div>
            <div className="flex-1 ml-6">
              <button 
                onClick={() => { setEditingItem(null); setForm({ title: "", description: "", year: new Date().getFullYear().toString(), category: "Award", image_url: "", recipient: "" }); setIsModalOpen(true); }}
                className="w-full h-12 flex items-center justify-center gap-3 bg-uiupc-orange text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-uiupc-orange/20 hover:brightness-110 transition-all"
              >
                <IconPlus size={14} /> Add Achievement
              </button>
            </div>
          </div>
        </div>
      </Admin_ModuleHeader>

      {/* ── SEARCH & FILTER BAR ──────────────────────────────────────── */}
      <div className="w-full bg-white dark:bg-[#0d0d0d] p-3 sm:p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm relative z-10">
        <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
          <div className="relative flex-1 group min-w-[200px]">
            <IconSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-uiupc-orange transition-colors" />
            <input 
              type="text" 
              placeholder="Search achievements..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full py-4 pl-14 pr-8 bg-zinc-100 dark:bg-[#1a1a1a] border border-transparent focus:border-uiupc-orange/30 rounded-xl text-sm outline-none transition-all placeholder:text-zinc-400 font-medium" 
            />
          </div>
        </div>
      </div>

      {/* ── ACHIEVEMENTS TABLE ───────────────────────────────────── */}
      <div className="bg-white dark:bg-[#0d0d0d] rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm relative z-10">
        <div className="overflow-x-auto min-h-[500px]">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-zinc-50 dark:bg-zinc-900/50">
                <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-[0.15em] text-zinc-400 whitespace-nowrap w-20">Image</th>
                <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-[0.15em] text-zinc-400 whitespace-nowrap">Achievement Details</th>
                <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-[0.15em] text-zinc-400 whitespace-nowrap hidden sm:table-cell w-32">Created</th>
                <th className="px-4 py-3 text-right text-[10px] font-black uppercase tracking-[0.15em] text-zinc-400 w-24">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="py-20 text-center">
                    <IconSync size={32} className="animate-spin mx-auto text-uiupc-orange" />
                  </td>
                </tr>
              ) : filteredItems.map((item: any) => (
                <tr key={item.id} className="group hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors border-b border-zinc-100 dark:border-zinc-800/50">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                      {item.image_url ? (
                        <img src={getImageUrl(item.image_url, 100, 100)} className="w-full h-full object-cover" alt="" />
                      ) : (
                        <IconArchive size={20} className="text-zinc-300 dark:text-zinc-600" />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col min-w-0">
                      <span className="text-[12px] font-black text-zinc-900 dark:text-white uppercase tracking-tight truncate max-w-sm">
                        {item.title}
                      </span>
                      <span className="text-[9px] font-bold text-zinc-400 line-clamp-1 max-w-sm mt-0.5">{item.description}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap hidden sm:table-cell">
                     <span className="text-[10px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">
                      {new Date(item.created_at).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleEdit(item)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:bg-uiupc-orange hover:text-white transition-all"><IconEdit size={10} /></button>
                      <button onClick={() => handleDelete(item.id)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-400 hover:bg-red-500 hover:text-white transition-all"><IconTrash size={10} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {!isLoading && filteredItems.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-20 text-center text-[10px] font-black uppercase tracking-widest text-zinc-300">No achievements found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── MODAL ────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isModalOpen && (
          <Admin_ModalPortal>
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
              onClick={() => !isSaving && setIsModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-[3rem] overflow-hidden shadow-2xl border border-white/10 max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
              <div className="p-8 md:p-12 space-y-8">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-black uppercase tracking-tight text-zinc-900 dark:text-white">
                    {editingItem ? "Edit Achievement" : "Add Achievement"}
                  </h3>
                  <button onClick={() => setIsModalOpen(false)} className="w-12 h-12 rounded-2xl bg-zinc-50 dark:bg-zinc-800 text-zinc-400 hover:text-red-500 flex items-center justify-center transition-all">
                    <IconClose size={16} />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Title */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Achievement Title</label>
                      <input 
                        type="text" 
                        value={form.title} 
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                        placeholder="e.g. Best Club Award"
                        className="w-full px-6 py-4 bg-[#f9f5ea] dark:bg-black/40 rounded-2xl text-sm font-bold outline-none border border-transparent focus:border-uiupc-orange/20 dark:text-white"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Recipient / Group</label>
                      <input 
                        type="text" 
                        value={form.recipient} 
                        onChange={(e) => setForm({ ...form, recipient: e.target.value })}
                        placeholder="e.g. UIUPC Core"
                        className="w-full px-6 py-4 bg-[#f9f5ea] dark:bg-black/40 rounded-2xl text-sm font-bold outline-none border border-transparent focus:border-uiupc-orange/20 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Year</label>
                      <input 
                        type="text" 
                        value={form.year} 
                        onChange={(e) => setForm({ ...form, year: e.target.value })}
                        className="w-full px-6 py-4 bg-[#f9f5ea] dark:bg-black/40 rounded-2xl text-sm font-bold outline-none border border-transparent focus:border-uiupc-orange/20 dark:text-white"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Category</label>
                      <select 
                        value={form.category} 
                        onChange={(e) => setForm({ ...form, category: e.target.value })}
                        className="w-full px-6 py-4 bg-[#f9f5ea] dark:bg-black/40 rounded-2xl text-sm font-bold outline-none border border-transparent focus:border-uiupc-orange/20 dark:text-white"
                      >
                        <option value="Award">Award</option>
                        <option value="Recognition">Recognition</option>
                        <option value="Milestone">Milestone</option>
                        <option value="Competition">Competition</option>
                      </select>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Description / Details</label>
                    <textarea 
                      value={form.description} 
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      placeholder="Describe the achievement in detail..."
                      rows={4}
                      className="w-full px-6 py-4 bg-[#f9f5ea] dark:bg-black/40 rounded-2xl text-sm font-bold outline-none border border-transparent focus:border-uiupc-orange/20 dark:text-white resize-none"
                    />
                  </div>

                  {/* Image Picker */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Feature Photo</label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={form.image_url} 
                        onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                        placeholder="Google Drive Image ID"
                        className="flex-1 px-6 py-4 bg-[#f9f5ea] dark:bg-black/40 rounded-2xl text-xs font-mono outline-none border border-transparent focus:border-uiupc-orange/20 dark:text-white"
                      />
                      <button 
                        type="button"
                        onClick={() => setIsDrivePickerOpen(true)}
                        className="px-8 bg-zinc-200 dark:bg-zinc-800 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-uiupc-orange hover:text-white transition-all"
                      >
                        Pick
                      </button>
                    </div>
                    {form.image_url && (
                      <div className="mt-4 w-24 h-24 rounded-2xl overflow-hidden border border-black/5 dark:border-white/5">
                        <img src={getImageUrl(form.image_url, 100, 100)} className="w-full h-full object-cover" alt="Preview" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button 
                    disabled={isSaving}
                    onClick={handleSave}
                    className="px-12 py-5 bg-uiupc-orange text-white text-[11px] font-black uppercase tracking-widest rounded-2xl hover:scale-105 transition-all shadow-xl disabled:opacity-50 disabled:hover:scale-100 flex items-center gap-3"
                  >
                    {isSaving ? <IconSync className="animate-spin" size={16} /> : <IconPlus size={16} />}
                    {editingItem ? "Update Achievement" : "Publish Achievement"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
          </Admin_ModalPortal>
        )}
      </AnimatePresence>

      {/* ── DRIVE PICKER MODAL ─────────────────────────────────────── */}
      <Admin_DrivePicker 
        isOpen={isDrivePickerOpen} 
        onClose={() => setIsDrivePickerOpen(false)} 
        onSelect={(id) => {
          setForm({ ...form, image_url: id });
          setIsDrivePickerOpen(false);
        }}
      />
    </div>
  );
};


