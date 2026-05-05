"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { 
  IconNewspaper, IconPlus, IconSearch, IconChevronLeft, IconChevronRight, 
  IconPenNib, IconEye, IconEdit, IconTrash, IconCalendarAlt, IconTag, IconCheck,
  IconFacebook, IconInstagram, IconLinkedin, IconSync
} from "@/components/shared/Icons";
import { motion, AnimatePresence } from "motion/react";
import { 
  Admin_Dropdown, Admin_ErrorBoundary, Admin_DeleteConfirmModal, Admin_ModuleHeader, Admin_StatCard 
} from "@/features/admin/components";
import Admin_BlogPostModal from "./Admin_BlogPostModal";
import Admin_BlogPreviewModal from "./Admin_BlogPreviewModal";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { supabase } from "@/lib/supabase";
import { initAdminPassword, executeAdminMutation } from "@/features/admin/actions";
import { getImageUrl } from "@/utils/imageUrl";

const BlogRow = React.memo(({ 
  item, onPreview, onEdit, onDelete 
}: { 
  item: any; onPreview: (post: any) => void; onEdit: (post: any) => void; onDelete: (post: any) => void 
}) => {
  return (
    <motion.tr className="group hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition-all border-b border-zinc-100 dark:border-zinc-800/50">
      <td className="px-6 py-3 whitespace-nowrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-xs font-black text-uiupc-orange shadow-inner shrink-0 overflow-hidden">
            {item.media?.[0]?.url ? (
               <img src={getImageUrl(item.media[0].url, 100, 100)} alt="" className="w-full h-full object-cover" />
            ) : (
               <IconNewspaper size={16} />
            )}
          </div>
          <div className="flex flex-col min-w-[200px]">
            <span className="text-[12px] font-black text-zinc-900 dark:text-white uppercase tracking-tight truncate">{item.title}</span>
            <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest truncate">{item.description?.slice(0, 30)}...</span>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 whitespace-nowrap hidden sm:table-cell">
         <span className="text-[10px] font-black text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <IconPenNib size={10} className="text-uiupc-orange" /> {item.author_email?.split('@')[0] || item.author?.split('@')[0] || "Admin"}
          </span>
      </td>
      <td className="px-4 py-3 whitespace-nowrap hidden md:table-cell">
         <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
            <IconCalendarAlt size={10} className="text-zinc-300" /> {new Date(item.date).toLocaleDateString()}
          </span>
      </td>
      <td className="px-4 py-3 whitespace-nowrap hidden lg:table-cell">
        <div className="flex items-center gap-2">
          {item.facebook_url && <IconFacebook size={12} className="text-blue-600 opacity-40 group-hover:opacity-100 transition-opacity" />}
          {item.instagram_url && <IconInstagram size={12} className="text-pink-500 opacity-40 group-hover:opacity-100 transition-opacity" />}
          {item.linkedin_url && <IconLinkedin size={12} className="text-blue-500 opacity-40 group-hover:opacity-100 transition-opacity" />}
          {!item.facebook_url && !item.instagram_url && !item.linkedin_url && <span className="text-[8px] text-zinc-300 font-bold uppercase tracking-tighter">Internal Only</span>}
        </div>
      </td>
      <td className="px-6 py-3 text-right whitespace-nowrap">
        <div className="flex items-center justify-end gap-2">
          <button onClick={() => onPreview(item)} title="Preview" className="w-8 h-8 flex items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:bg-uiupc-orange hover:text-white transition-all"><IconEye size={10} /></button>
          <button onClick={() => onEdit(item)} title="Edit" className="w-8 h-8 flex items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:bg-uiupc-orange hover:text-white transition-all"><IconEdit size={10} /></button>
          <button onClick={() => onDelete(item)} title="Delete" className="w-8 h-8 flex items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-400 hover:bg-red-500 hover:text-white transition-all"><IconTrash size={10} /></button>
        </div>
      </td>
    </motion.tr>
  );
});
BlogRow.displayName = 'BlogRow';

export const Admin_Blog: React.FC = () => {
  const { user } = useSupabaseAuth();
  const [showPostModal, setShowPostModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editingPost, setEditingPost] = useState<any>(null);
  const [previewPost, setPreviewPost] = useState<any>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const pageSize = 12;

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    media: [{ type: "image", url: "", caption: "" }],
    tags: "",
    facebook_url: "",
    instagram_url: "",
    linkedin_url: "",
  });

  useEffect(() => { initAdminPassword(); }, []);

  const { data: posts, count, isLoading, refetch } = useSupabaseData("blog_posts", {
    page,
    pageSize,
    orderBy: 'date',
    orderDesc: true,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleMediaChange = (index: number, field: string, value: string) => {
    const newMedia = [...formData.media];
    newMedia[index] = { ...newMedia[index], [field]: value };
    setFormData(prev => ({ ...prev, media: newMedia }));
  };

  const handleAddMedia = () => {
    setFormData(prev => ({ ...prev, media: [...prev.media, { type: "image", url: "", caption: "" }] }));
  };

  const handleRemoveMedia = (index: number) => {
    setFormData(prev => ({ ...prev, media: prev.media.filter((_, i) => i !== index) }));
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      date: new Date().toISOString().split("T")[0],
      media: [{ type: "image", url: "", caption: "" }],
      tags: "",
      facebook_url: "",
      instagram_url: "",
      linkedin_url: "",
    });
    setEditingPost(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    try {
      const postData = {
        ...formData,
        author_email: user?.email,
      };

      const { success, message } = editingPost 
        ? await executeAdminMutation("blog_posts", "update", postData, editingPost.id)
        : await executeAdminMutation("blog_posts", "create", postData);

      if (!success) throw new Error(message);
      setShowPostModal(false);
      resetForm();
      refetch();
    } catch (err: any) {
      alert("Error saving post: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (post: any) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      description: post.description,
      date: post.date,
      media: post.media || [{ type: "image", url: "", caption: "" }],
      tags: post.tags || "",
      facebook_url: post.facebook_url || "",
      instagram_url: post.instagram_url || "",
      linkedin_url: post.linkedin_url || "",
    });
    setShowPostModal(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const { success, message } = await executeAdminMutation("blog_posts", "delete", null, deleteTarget.id);
      if (!success) throw new Error(message);
      setDeleteTarget(null);
      refetch();
    } catch (err: any) {
      alert("Error deleting post: " + err.message);
    }
  };

  const filteredPosts = useMemo(() => {
    return posts?.filter(post => 
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.description.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];
  }, [posts, searchTerm]);

  const totalPages = Math.ceil((count || 0) / pageSize);

  return (
    <div className="w-full space-y-6 min-w-0 relative z-10 isolate pb-20">
      <Admin_ModuleHeader 
        title="Blog & News"
        description="Manage journalism, special announcements, and social cross-posts."
      >
        <Admin_StatCard label="Total Articles" value={count || 0} icon={<IconNewspaper size={20} />} />
        <Admin_StatCard label="Cross-Posted" value={posts?.filter(p => p.facebook_url || p.instagram_url || p.linkedin_url).length || 0} icon={<IconFacebook size={20} />} color="text-blue-500" />
        <Admin_StatCard label="Internal Only" value={posts?.filter(p => !p.facebook_url && !p.instagram_url && !p.linkedin_url).length || 0} icon={<IconTag size={20} />} color="text-zinc-400" />
      </Admin_ModuleHeader>

      {/* ── ACTION BAR ────────────────────────────────────────── */}
      <div className="w-full bg-white dark:bg-[#0d0d0d] p-3 sm:p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm relative z-10">
        <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
          <div className="relative flex-1 group min-w-[200px]">
            <IconSearch size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-uiupc-orange transition-colors" />
            <input 
              type="text" 
              placeholder="Search articles..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full py-4 pl-14 pr-8 bg-zinc-100 dark:bg-[#1a1a1a] border border-transparent focus:border-uiupc-orange/30 rounded-xl text-sm outline-none transition-all placeholder:text-zinc-400 font-medium" 
            />
          </div>
          <button 
            onClick={() => { resetForm(); setShowPostModal(true); }}
            className="px-8 h-12 flex items-center gap-3 bg-uiupc-orange text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-uiupc-orange/20 hover:brightness-110 transition-all"
          >
            <IconPlus size={14} /> New Article
          </button>
        </div>
      </div>

      {/* ── DATA TABLE ─────────────────────────────────────────── */}
      <div className="bg-white dark:bg-[#0d0d0d] rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm relative z-10">
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-zinc-50 dark:bg-zinc-900/50">
                <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 whitespace-nowrap">Headline & Summary</th>
                <th className="px-4 py-4 text-left text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 whitespace-nowrap hidden sm:table-cell">Author</th>
                <th className="px-4 py-4 text-left text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 whitespace-nowrap hidden md:table-cell">Published</th>
                <th className="px-4 py-4 text-left text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 whitespace-nowrap hidden lg:table-cell">Social Sync</th>
                <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <IconSync size={24} className="animate-spin text-uiupc-orange mx-auto" />
                  </td>
                </tr>
              ) : filteredPosts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">No articles found in the journal</p>
                  </td>
                </tr>
              ) : (
                filteredPosts.map((item: any) => (
                  <BlogRow 
                    key={item.id} 
                    item={item} 
                    onPreview={(post) => { setPreviewPost(post); setShowPreviewModal(true); }}
                    onEdit={handleEdit}
                    onDelete={setDeleteTarget}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── PAGINATION ────────────────────────────────────────── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-6 border-t border-black/5 dark:border-white/5">
          <div className="flex flex-col">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Journal Overview</p>
            <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Page {page + 1} of {totalPages}</p>
          </div>
          <div className="flex items-center gap-3">
            <button disabled={page === 0} onClick={() => setPage(p => p - 1)} className="w-12 h-10 flex items-center justify-center rounded-xl bg-white dark:bg-[#080808] border border-black/5 dark:border-white/5 text-zinc-400 disabled:opacity-20 hover:border-uiupc-orange transition-all"><IconChevronLeft size={12} /></button>
            <button disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)} className="w-12 h-10 flex items-center justify-center rounded-xl bg-white dark:bg-[#080808] border border-black/5 dark:border-white/5 text-zinc-400 disabled:opacity-20 hover:border-uiupc-orange transition-all"><IconChevronRight size={12} /></button>
          </div>
        </div>
      )}

      {/* ── MODALS ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {showPostModal && (
          <Admin_BlogPostModal 
            formData={formData}
            editingPost={editingPost}
            uploading={uploading}
            onClose={setShowPostModal}
            onSubmit={handleSubmit}
            onInputChange={handleInputChange}
            onMediaChange={handleMediaChange}
            onAddMedia={handleAddMedia}
            onRemoveMedia={handleRemoveMedia}
          />
        )}
        {showPreviewModal && (
          <Admin_BlogPreviewModal 
            post={previewPost}
            onClose={() => setShowPreviewModal(false)}
          />
        )}
      </AnimatePresence>

      <Admin_ErrorBoundary>
        <Admin_DeleteConfirmModal 
          isOpen={!!deleteTarget} 
          onClose={() => setDeleteTarget(null)} 
          itemId={deleteTarget?.id} 
          itemName={deleteTarget?.title} 
          onSuccess={handleDelete}
        />
      </Admin_ErrorBoundary>
    </div>
  );
};
