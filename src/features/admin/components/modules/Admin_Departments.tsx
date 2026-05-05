"use client";

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  IconPlus, IconTrash, IconEdit, IconSearch, IconSpinner, 
  IconLayerGroup, IconCheck, IconArchive, IconUserCircle, 
  IconPalette, IconCamera, IconChevronRight, IconLink, IconFacebook, IconInstagram, IconLinkedin, IconExternalLink, IconImage
} from '@/components/shared/Icons';
import { 
  Admin_ErrorBoundary, Admin_DeleteConfirmModal, Admin_ModuleHeader, Admin_StatCard, Admin_DrivePicker, Admin_ModalPortal
} from "@/features/admin/components";
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { supabase } from "@/lib/supabase";
import { initAdminPassword, executeAdminMutation } from "@/features/admin/actions";
import { getImageUrl } from '@/utils/imageUrl';

// ─── CLUB STRUCTURE ───────────────────────────────────────────────
const DEPT_CONFIG = [
  { id: 'hr', name: 'HR', label: 'Human Resources', type: 'department', icon: <IconLayerGroup size={14} /> },
  { id: 'pr', name: 'PR', label: 'Public Relations', type: 'department', icon: <IconLayerGroup size={14} /> },
  { id: 'events', name: 'Events', label: 'Event Management', type: 'department', icon: <IconLayerGroup size={14} /> },
  { id: 'organizing', name: 'Organizing', label: 'Organizing Department', type: 'department', icon: <IconLayerGroup size={14} /> },
  { id: 'design', name: 'Design', label: 'Design Team', type: 'team', icon: <IconPalette size={14} /> },
  { id: 'visual', name: 'Visual', label: 'Visual Team', type: 'team', icon: <IconCamera size={14} /> },
];

// ─── MEMBER WORK GALLERY ──────────────────────────────────────────
const MemberWorkGallery = ({ person, onClose }: { person: any; onClose: () => void }) => {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const { data: works, refetch } = useSupabaseData("portfolio_works", {
    filters: { portfolio_id: person.id },
    orderBy: 'created_at',
    orderDesc: true
  });

  const handleAddWork = async (id: string) => {
    try {
      const { success, message } = await executeAdminMutation("portfolio_works", "create", {
        portfolio_id: person.id,
        image_url: id,
        title: "Work Showcase"
      });
      if (!success) throw new Error(message);
      refetch();
    } catch (err: any) {
      alert("Failed to add work: " + err.message);
    }
  };

  const handleDeleteWork = async (workId: string) => {
    try {
      const { success, message } = await executeAdminMutation("portfolio_works", "delete", null, workId);
      if (!success) throw new Error(message);
      refetch();
    } catch (err: any) {
      alert("Failed to delete work: " + err.message);
    }
  };

  return (
    <Admin_ModalPortal>
      <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4 md:p-10">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={onClose} />
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
          className="relative w-full max-w-5xl bg-white dark:bg-[#0d0d0d] rounded-[3rem] border border-zinc-200 dark:border-zinc-800 shadow-3xl flex flex-col overflow-hidden max-h-[90vh]"
        >
          <div className="p-10 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-[#0a0a0a]">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-uiupc-orange">
                <img src={getImageUrl(person.profile_image, 100, 100)} alt="" className="w-full h-full object-cover" />
              </div>
              <div>
                <h3 className="text-2xl font-black uppercase tracking-tight dark:text-white">{person.full_name}</h3>
                <p className="text-[10px] font-black uppercase tracking-widest text-uiupc-orange">Gallery of Work</p>
              </div>
            </div>
            <div className="flex gap-4">
              <button onClick={() => setIsPickerOpen(true)} className="px-8 h-12 bg-uiupc-orange text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-uiupc-orange/20 hover:brightness-110 transition-all flex items-center gap-2">
                <IconPlus size={14} /> Add New Work
              </button>
              <button onClick={onClose} className="w-12 h-12 rounded-xl bg-white dark:bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-red-500 transition-all border border-zinc-200 dark:border-zinc-800">
                <IconPlus size={20} className="rotate-45" />
              </button>
            </div>
          </div>

          <div className="p-10 overflow-y-auto flex-1 custom-scrollbar">
            {works && works.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {works.map((work: any) => (
                  <div key={work.id} className="group relative aspect-square rounded-2xl overflow-hidden border border-zinc-100 dark:border-zinc-800 shadow-sm hover:shadow-xl transition-all bg-zinc-100 dark:bg-zinc-900">
                    <img src={getImageUrl(work.image_url, 400, 400)} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt="" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button onClick={() => handleDeleteWork(work.id)} className="w-10 h-10 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-all">
                        <IconTrash size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-32 text-center">
                <IconImage size={40} className="mx-auto text-zinc-200 dark:text-zinc-800 mb-4" />
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">No images added to this portfolio yet</p>
              </div>
            )}
          </div>
        </motion.div>
        
        <Admin_DrivePicker 
          isOpen={isPickerOpen} 
          onClose={() => setIsPickerOpen(false)} 
          onSelect={(id) => {
            handleAddWork(id);
            setIsPickerOpen(false);
          }}
          title="Select Work Image"
        />
      </div>
    </Admin_ModalPortal>
  );
};

export const Admin_Departments: React.FC = () => {
  const { user } = useSupabaseAuth();
  const [activeDeptId, setActiveDeptId] = useState('hr');
  const [activeTab, setActiveTab] = useState<'archive' | 'portfolio'>('archive');
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isDrivePickerOpen, setIsDrivePickerOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<any>(null);

  // Form State
  const [archiveForm, setArchiveForm] = useState({ title: "", description: "", image_url: "", tags: "" });
  const [portfolioForm, setPortfolioForm] = useState({ 
    full_name: "", bio: "", profile_image: "", 
    facebook_url: "", instagram_url: "", linkedin_url: "", behance_url: "" 
  });

  useEffect(() => { initAdminPassword(); }, []);

  const activeDept = DEPT_CONFIG.find(d => d.id === activeDeptId);
  const isTeam = activeDept?.type === 'team';

  const { data: archivePosts, isLoading: archiveLoading, refetch: refetchArchive } = useSupabaseData("department_posts", {
    filters: { dept_id: activeDeptId },
    orderBy: 'created_at',
    orderDesc: true
  });

  const { data: portfolios, isLoading: portfolioLoading, refetch: refetchPortfolio } = useSupabaseData("portfolios", {
    filters: { team_id: activeDeptId },
    orderBy: 'full_name',
    orderDesc: false
  });

  const resetForms = () => {
    setArchiveForm({ title: "", description: "", image_url: "", tags: "" });
    setPortfolioForm({ full_name: "", bio: "", profile_image: "", facebook_url: "", instagram_url: "", linkedin_url: "", behance_url: "" });
    setEditingItem(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (activeTab === 'portfolio' && !portfolioForm.full_name.trim()) {
      alert("Please enter the member's full name.");
      return;
    }
    if (activeTab === 'archive' && !archiveForm.title.trim()) {
      alert("Please enter a title for the post.");
      return;
    }

    setUploading(true);
    try {
      if (activeTab === 'archive') {
        const payload = { ...archiveForm, dept_id: activeDeptId };
        const { success, message } = editingItem 
          ? await executeAdminMutation("department_posts", "update", payload, editingItem.id)
          : await executeAdminMutation("department_posts", "create", payload);
        
        if (!success) throw new Error(message);
        refetchArchive();
      } else {
        const cleanName = portfolioForm.full_name.trim();
        // New Slug Logic: All lowercase, remove all spaces and special characters
        const slug = cleanName.toLowerCase()
          .replace(/ /g, '')
          .replace(/[^\w]+/g, '');
        
        const payload = { 
          full_name: cleanName,
          bio: portfolioForm.bio,
          profile_image: portfolioForm.profile_image,
          facebook_url: portfolioForm.facebook_url,
          instagram_url: portfolioForm.instagram_url,
          linkedin_url: portfolioForm.linkedin_url,
          behance_url: portfolioForm.behance_url,
          team_id: activeDeptId, 
          slug 
        };

        const { success, message } = editingItem 
          ? await executeAdminMutation("portfolios", "update", payload, editingItem.id)
          : await executeAdminMutation("portfolios", "create", payload);

        if (!success) throw new Error(message);
        
        // Success feedback
        alert(editingItem ? "Success! Profile updated." : "Success! New member published.");
        
        refetchPortfolio();
      }
      setIsModalOpen(false);
      resetForms();
    } catch (err: any) {
      alert("Save failed: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const table = activeTab === 'archive' ? "department_posts" : "portfolios";
      const { success, message } = await executeAdminMutation(table as any, "delete", null, deleteTarget.id);
      if (!success) throw new Error(message);
      activeTab === 'archive' ? refetchArchive() : refetchPortfolio();
      setDeleteTarget(null);
    } catch (err: any) {
      alert("Delete failed: " + err.message);
    }
  };

  return (
    <div className="w-full space-y-8 min-w-0 relative z-10 isolate pb-20">
      <Admin_ModuleHeader 
        title="Departments & Teams"
        description="Select a department to manage its archive or team portfolios."
      >
        <Admin_StatCard label="Total Archive Posts" value={archivePosts?.length || 0} icon={<IconArchive size={20} />} />
        <Admin_StatCard label="Active Portfolios" value={portfolios?.length || 0} icon={<IconUserCircle size={20} />} color="text-uiupc-orange" />
      </Admin_ModuleHeader>

      {/* ── DEPARTMENT SELECTOR ───────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3 bg-zinc-100 dark:bg-zinc-900/50 p-2 rounded-[2rem] border border-zinc-200 dark:border-zinc-800">
        {DEPT_CONFIG.map(dept => (
          <button
            key={dept.id}
            onClick={() => { setActiveDeptId(dept.id); if (dept.type === 'department') setActiveTab('archive'); }}
            className={`
              px-6 py-3 rounded-2xl flex items-center gap-3 text-[10px] font-black uppercase tracking-widest transition-all
              ${activeDeptId === dept.id 
                ? 'bg-white dark:bg-zinc-800 text-uiupc-orange shadow-sm border border-zinc-200 dark:border-zinc-700' 
                : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}
            `}
          >
            {dept.icon} {dept.name}
          </button>
        ))}
      </div>

      {/* ── SECTION SWITCHER ─────────────────────────── */}
      {isTeam && (
        <div className="flex items-center gap-8 border-b border-zinc-100 dark:border-zinc-800 px-4">
          <button onClick={() => setActiveTab('archive')} className={`py-4 relative text-[11px] font-black uppercase tracking-widest ${activeTab === 'archive' ? 'text-zinc-900 dark:text-white' : 'text-zinc-400'}`}>
            Department Archive {activeTab === 'archive' && <motion.div layoutId="deptTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-uiupc-orange" />}
          </button>
          <button onClick={() => setActiveTab('portfolio')} className={`py-4 relative text-[11px] font-black uppercase tracking-widest ${activeTab === 'portfolio' ? 'text-zinc-900 dark:text-white' : 'text-zinc-400'}`}>
            Member Portfolios {activeTab === 'portfolio' && <motion.div layoutId="deptTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-uiupc-orange" />}
          </button>
        </div>
      )}

      {/* ── SEARCH & ADD ────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 group w-full">
          <IconSearch size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-uiupc-orange transition-colors" />
          <input 
            type="text" 
            placeholder={`Search ${activeTab === 'archive' ? 'posts' : 'members'}...`} 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full py-4 pl-14 pr-8 bg-white dark:bg-[#0d0d0d] border border-zinc-200 dark:border-zinc-800 focus:border-uiupc-orange/30 rounded-2xl text-sm outline-none transition-all font-medium" 
          />
        </div>
        <button 
          onClick={() => { resetForms(); setIsModalOpen(true); }}
          className="px-8 h-12 flex items-center gap-3 bg-uiupc-orange text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-uiupc-orange/20 hover:brightness-110 transition-all w-full lg:w-auto justify-center"
        >
          <IconPlus size={14} /> Add {activeTab === 'archive' ? 'New Post' : 'New Member'}
        </button>
      </div>

      {/* ── LISTING GRID ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeTab === 'archive' ? (
          archivePosts?.map((post: any) => (
            <motion.div key={post.id} layout className="group bg-white dark:bg-[#0d0d0d] rounded-[2rem] border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm hover:shadow-xl transition-all">
              <div className="aspect-[16/9] bg-zinc-100 dark:bg-zinc-900 relative overflow-hidden">
                {post.image_url ? (
                  <img src={getImageUrl(post.image_url, 400, 225)} className="w-full h-full object-cover transition-transform group-hover:scale-105" alt="" />
                ) : (
                   <div className="w-full h-full flex items-center justify-center text-zinc-300"><IconArchive size={32} /></div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button onClick={() => { setEditingItem(post); setArchiveForm(post); setIsModalOpen(true); }} className="w-12 h-12 rounded-full bg-white text-zinc-900 flex items-center justify-center hover:bg-uiupc-orange hover:text-white transition-all"><IconEdit size={16} /></button>
                  <button onClick={() => setDeleteTarget(post)} className="w-12 h-12 rounded-full bg-white text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"><IconTrash size={16} /></button>
                </div>
              </div>
              <div className="p-6 space-y-2">
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-uiupc-orange">{activeDept?.label}</span>
                <h4 className="text-sm font-black uppercase tracking-tight dark:text-white">{post.title}</h4>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest line-clamp-2">{post.description}</p>
              </div>
            </motion.div>
          ))
        ) : (
          portfolios?.map((person: any) => (
            <motion.div key={person.id} layout className="group bg-white dark:bg-[#0d0d0d] rounded-[2rem] border border-zinc-200 dark:border-zinc-800 p-8 shadow-sm hover:shadow-xl transition-all flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full bg-zinc-100 dark:bg-zinc-900 mb-6 overflow-hidden border-2 border-zinc-200 dark:border-zinc-800">
                {person.profile_image ? (
                  <img src={getImageUrl(person.profile_image, 200, 200)} className="w-full h-full object-cover" alt="" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-300"><IconUserCircle size={40} /></div>
                )}
              </div>
              <h4 className="text-lg font-black uppercase tracking-tighter dark:text-white mb-1">{person.full_name}</h4>
              <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-6">{activeDept?.label}</p>
              <div className="flex items-center gap-3 mb-8">
                {person.facebook_url && <IconFacebook size={12} className="text-zinc-400" />}
                {person.instagram_url && <IconInstagram size={12} className="text-zinc-400" />}
                {person.linkedin_url && <IconLinkedin size={12} className="text-zinc-400" />}
                {person.behance_url && <IconExternalLink size={12} className="text-zinc-400" />}
              </div>
              <div className="w-full pt-6 border-t border-zinc-100 dark:border-zinc-800 flex gap-2">
                <button onClick={() => { setEditingItem(person); setPortfolioForm(person); setIsModalOpen(true); }} className="flex-1 py-3 bg-zinc-100 dark:bg-zinc-800 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-uiupc-orange hover:text-white transition-all">Edit Info</button>
                <button onClick={() => { setSelectedPerson(person); setShowGallery(true); }} className="flex-1 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-[9px] font-black uppercase tracking-widest hover:border-uiupc-orange hover:text-uiupc-orange transition-all">Manage Work</button>
                <button onClick={() => window.open(`/${activeDeptId}/${person.slug}`, '_blank')} className="w-10 py-3 bg-zinc-100 dark:bg-zinc-800 rounded-xl text-zinc-500 hover:bg-zinc-200 flex items-center justify-center transition-all"><IconChevronRight size={14} /></button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* ── MEMBER GALLERY MODAL ───────────────────────────────────── */}
      <AnimatePresence>
        {showGallery && selectedPerson && (
          <MemberWorkGallery 
            person={selectedPerson} 
            onClose={() => setShowGallery(false)} 
          />
        )}
      </AnimatePresence>

      {/* ── CREATE/EDIT MODAL ────────────────────────────────────────── */}
      <AnimatePresence>
        {isModalOpen && (
          <Admin_ModalPortal>
            <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
              <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="relative w-full max-w-2xl bg-white dark:bg-[#0d0d0d] rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 shadow-3xl overflow-hidden max-h-[90vh] flex flex-col"
              >
                <div className="p-8 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                  <h3 className="text-xl font-black uppercase tracking-tight dark:text-white">{editingItem ? 'Edit' : 'Add New'} {activeTab === 'archive' ? 'Post' : 'Member'}</h3>
                  <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-red-500"><IconPlus size={24} className="rotate-45" /></button>
                </div>
                <form onSubmit={handleSave} className="p-8 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
                  {activeTab === 'archive' ? (
                    <>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Post Title</label>
                        <input type="text" value={archiveForm.title} onChange={e => setArchiveForm({...archiveForm, title: e.target.value})} required className="w-full p-4 bg-zinc-50 dark:bg-zinc-900 border border-transparent focus:border-uiupc-orange rounded-xl text-sm font-bold outline-none dark:text-white" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Description</label>
                        <textarea value={archiveForm.description} onChange={e => setArchiveForm({...archiveForm, description: e.target.value})} rows={4} className="w-full p-4 bg-zinc-50 dark:bg-zinc-900 border border-transparent focus:border-uiupc-orange rounded-xl text-sm font-bold outline-none dark:text-white resize-none" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Image (Drive ID)</label>
                        <div className="flex gap-2">
                          <input type="text" value={archiveForm.image_url} onChange={e => setArchiveForm({...archiveForm, image_url: e.target.value})} className="flex-1 p-4 bg-zinc-50 dark:bg-zinc-900 border border-transparent focus:border-uiupc-orange rounded-xl text-xs font-mono outline-none dark:text-white" />
                          <button type="button" onClick={() => setIsDrivePickerOpen(true)} className="px-6 bg-zinc-200 dark:bg-zinc-800 text-[10px] font-black uppercase tracking-widest rounded-xl">Pick</button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Member Name</label>
                          <input type="text" value={portfolioForm.full_name} onChange={e => setPortfolioForm({...portfolioForm, full_name: e.target.value})} required className="w-full p-4 bg-zinc-50 dark:bg-zinc-900 border border-transparent focus:border-uiupc-orange rounded-xl text-sm font-bold outline-none dark:text-white" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Profile Photo (Drive ID)</label>
                          <div className="flex gap-2">
                            <input type="text" value={portfolioForm.profile_image} onChange={e => setPortfolioForm({...portfolioForm, profile_image: e.target.value})} className="flex-1 p-4 bg-zinc-50 dark:bg-zinc-900 border border-transparent focus:border-uiupc-orange rounded-xl text-xs font-mono outline-none dark:text-white" />
                            <button type="button" onClick={() => setIsDrivePickerOpen(true)} className="px-4 bg-zinc-200 dark:bg-zinc-800 text-[9px] font-black uppercase tracking-widest rounded-xl">Pick</button>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Member Bio</label>
                        <textarea value={portfolioForm.bio} onChange={e => setPortfolioForm({...portfolioForm, bio: e.target.value})} rows={3} className="w-full p-4 bg-zinc-50 dark:bg-zinc-900 border border-transparent focus:border-uiupc-orange rounded-xl text-sm font-bold outline-none dark:text-white resize-none" />
                      </div>
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Facebook URL</label>
                          <input type="text" value={portfolioForm.facebook_url} onChange={e => setPortfolioForm({...portfolioForm, facebook_url: e.target.value})} className="w-full p-3 bg-zinc-50 dark:bg-zinc-900 border border-transparent rounded-xl text-xs outline-none dark:text-white" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Instagram URL</label>
                          <input type="text" value={portfolioForm.instagram_url} onChange={e => setPortfolioForm({...portfolioForm, instagram_url: e.target.value})} className="w-full p-3 bg-zinc-50 dark:bg-zinc-900 border border-transparent rounded-xl text-xs outline-none dark:text-white" />
                        </div>
                      </div>
                    </>
                  )}
                  <button type="submit" disabled={uploading} className="w-full py-5 bg-uiupc-orange text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl hover:translate-y-[-2px] transition-all disabled:opacity-50">
                    {uploading ? <IconSpinner className="animate-spin mx-auto" /> : (editingItem ? 'Save Changes' : 'Publish')}
                  </button>
                </form>
              </motion.div>
            </div>
          </Admin_ModalPortal>
        )}
      </AnimatePresence>

      <Admin_DrivePicker 
        isOpen={isDrivePickerOpen} 
        onClose={() => setIsDrivePickerOpen(false)} 
        onSelect={(id) => {
          if (activeTab === 'archive') setArchiveForm({...archiveForm, image_url: id});
          else setPortfolioForm({...portfolioForm, profile_image: id});
          setIsDrivePickerOpen(false);
        }}
      />

      <Admin_ErrorBoundary>
        <Admin_DeleteConfirmModal 
          isOpen={!!deleteTarget} 
          onClose={() => setDeleteTarget(null)} 
          itemId={deleteTarget?.id} 
          itemName={deleteTarget?.title || deleteTarget?.full_name} 
          onSuccess={handleDelete}
        />
      </Admin_ErrorBoundary>
    </div>
  );
};
