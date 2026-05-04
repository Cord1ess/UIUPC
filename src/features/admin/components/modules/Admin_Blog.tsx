"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { 
  IconNewspaper, IconPlus, IconSearch, IconChevronLeft, IconChevronRight, 
  IconPenNib, IconEye, IconEdit, IconTrash, IconCalendarAlt, IconTag, IconCheck 
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
import { initAdminPassword } from "@/features/admin/actions";

const BlogRow = React.memo(({ 
  item, onPreview, onEdit, onDelete 
}: { 
  item: any; onPreview: (post: any) => void; onEdit: (post: any) => void; onDelete: (post: any) => void 
}) => {
  return (
    <motion.tr className="group hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition-all border-b border-zinc-100 dark:border-zinc-800/50">
      <td className="px-8 py-6 whitespace-nowrap">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-sm font-black text-uiupc-orange shadow-inner shrink-0">
            <IconNewspaper size={16} />
          </div>
          <div className="flex flex-col min-w-[250px]">
            <span className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-tight truncate">{item.title}</span>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest truncate">{item.description?.slice(0, 40)}...</span>
          </div>
        </div>
      </td>
      <td className="px-6 py-6 whitespace-nowrap hidden sm:table-cell">
         <span className="text-[11px] font-black text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <IconPenNib size={10} className="text-uiupc-orange" /> {item.author?.split('@')[0]}
          </span>
      </td>
      <td className="px-6 py-6 whitespace-nowrap hidden md:table-cell">
         <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
            <IconCalendarAlt size={10} className="text-zinc-300" /> {new Date(item.date).toLocaleDateString()}
          </span>
      </td>
      <td className="px-6 py-6 whitespace-nowrap hidden lg:table-cell">
         <span className="px-4 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800/50 text-zinc-500 dark:text-zinc-400 text-[9px] font-black uppercase tracking-widest border border-zinc-200 dark:border-zinc-800/50 flex items-center gap-2 w-fit">
            <IconTag size={10} /> {item.tags?.split(',')[0] || "News"}
          </span>
      </td>
      <td className="px-8 py-6 text-right whitespace-nowrap">
        <div className="flex items-center justify-end gap-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
          <button onClick={() => onPreview(item)} title="Preview" className="w-10 h-10 flex items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:bg-uiupc-orange hover:text-white transition-all"><IconEye size={12} /></button>
          <button onClick={() => onEdit(item)} title="Edit" className="w-10 h-10 flex items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:bg-uiupc-orange hover:text-white transition-all"><IconEdit size={12} /></button>
          <button onClick={() => onDelete(item)} title="Delete" className="w-10 h-10 flex items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400 hover:bg-red-500 hover:text-white transition-all"><IconTrash size={12} /></button>
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
  const [filterAuthor, setFilterAuthor] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set());
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const pageSize = 12;

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    media: [{ type: "image", url: "", caption: "" }],
    tags: "",
  });

  useEffect(() => { initAdminPassword(); }, []);

  const filters = useMemo(() => {
    const f: Record<string, any> = {};
    if (filterAuthor !== "all") f.author = filterAuthor;
    return f;
  }, [filterAuthor]);

  const { data: posts, count, isLoading, refetch } = useSupabaseData("blog_posts", {
    page,
    pageSize,
    filters,
    orderBy: 'date',
    orderDesc: true,
  });

  const { data: allPosts } = useSupabaseData("blog_posts", { limit: 1000 });
  const authors = useMemo(() => {
    const auths = new Set<string>();
    if (Array.isArray(allPosts)) allPosts.forEach(post => post.author && auths.add(post.author));
    return Array.from(auths).sort();
  }, [allPosts]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleMediaChange = useCallback((index: number, field: string, value: string) => {
    setFormData((prev) => {
      const updatedMedia = [...prev.media];
      updatedMedia[index] = { ...updatedMedia[index], [field]: value };
      return { ...prev, media: updatedMedia };
    });
  }, []);

  const addMediaField = useCallback(() => {
    setFormData((prev) => ({ ...prev, media: [...prev.media, { type: "image", url: "", caption: "" }] }));
  }, []);

  const removeMediaField = useCallback((index: number) => {
    setFormData((prev) => {
      if (prev.media.length > 1) {
        return { ...prev, media: prev.media.filter((_, i) => i !== index) };
      }
      return prev;
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setUploading(true);
      const postData = {
        title: formData.title,
        description: formData.description,
        date: formData.date,
        media: formData.media.filter((m) => m.url.trim() !== ""),
        tags: formData.tags,
        author: user?.email,
        slug: formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      };

      const { error } = editingPost?.id 
        ? await supabase.from("blog_posts").update(postData).eq('id', editingPost.id)
        : await supabase.from("blog_posts").insert([postData]);

      if (error) throw error;
      setShowPostModal(false);
      resetForm();
      refetch();
    } catch (error: any) {
      alert("Action failed: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = useCallback((post: any) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      description: post.description,
      date: post.date,
      media: post.media?.length ? post.media : [{ type: "image", url: "", caption: "" }],
      tags: post.tags || "",
    });
    setShowPostModal(true);
  }, []);

  const handlePreview = useCallback((post: any) => {
    setPreviewPost(post);
    setShowPreviewModal(true);
  }, []);

  const resetForm = useCallback(() => {
    setFormData({
      title: "",
      description: "",
      date: new Date().toISOString().split("T")[0],
      media: [{ type: "image", url: "", caption: "" }],
      tags: "",
    });
    setEditingPost(null);
  }, []);

  const refreshData = useCallback(() => {
    setHiddenIds(new Set());
    refetch();
  }, [refetch]);

  const visibleData = useMemo(() => {
    const rawData = (posts || []).filter(p => !hiddenIds.has(p.id));
    if (!searchTerm) return rawData;
    return rawData.filter(p => (p.title || "").toLowerCase().includes(searchTerm.toLowerCase()));
  }, [posts, hiddenIds, searchTerm]);

  const totalPages = Math.ceil((count || 0) / pageSize);

  return (
    <div className="w-full space-y-8 min-w-0 relative z-10 isolate">
      <Admin_ModuleHeader 
        title="Blog"
        description="Write and manage articles, news, and stories."
      >
        <Admin_StatCard label="Total Articles" value={count} icon={<IconNewspaper size={20} />} />
        
        <div className="p-6 bg-white dark:bg-[#0d0d0d] border border-zinc-200 dark:border-zinc-800 rounded-2xl flex flex-col justify-between shadow-sm min-h-[140px] group">
          <p className="text-zinc-400 text-[10px] font-black uppercase tracking-widest">Author</p>
          <div className="flex items-end justify-between mt-auto">
            <div className="text-uiupc-orange text-4xl opacity-20 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500">
              <IconPenNib size={40} />
            </div>
            <div className="flex-1 ml-6 max-w-[200px]">
              <Admin_Dropdown 
                variant="minimal"
                label="Select Author"
                value={filterAuthor} 
                onChange={setFilterAuthor}
                options={[{ value: 'all', label: 'All Authors' }, ...authors.map(a => ({ value: a, label: a.split('@')[0] }))]}
                className="w-full"
              />
            </div>
          </div>
        </div>

        <Admin_StatCard label="Review Status" value="Online" icon={<IconCheck size={20} />} color="text-green-500" />
      </Admin_ModuleHeader>

      {/* ── FILTER BAR ─────────────────────────────────────────── */}
      <div className="w-full bg-white dark:bg-[#0d0d0d] p-3 sm:p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm relative z-10">
        <div className="flex flex-col lg:flex-row gap-6 items-stretch lg:items-center justify-between">
          <div className="relative flex-1 group min-w-[200px]">
            <IconSearch size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-uiupc-orange transition-colors" />
            <input 
              type="text" 
              placeholder="Search blog posts..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full py-4 pl-14 pr-8 bg-zinc-100 dark:bg-[#1a1a1a] border border-transparent focus:border-uiupc-orange/30 rounded-xl text-sm outline-none transition-all placeholder:text-zinc-400 font-medium" 
            />
          </div>
          <button 
            onClick={() => { resetForm(); setShowPostModal(true); }} 
            className="px-8 h-12 flex items-center gap-3 bg-uiupc-orange text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-uiupc-orange/20 hover:brightness-110 transition-all"
          >
            <IconPlus size={14} /> Publish Article
          </button>
        </div>
      </div>

      {/* ── DATA TABLE ─────────────────────────────────────────── */}
      <div className="bg-white dark:bg-[#0d0d0d] rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm relative z-10">
        <div className="overflow-x-auto min-h-[500px]">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-zinc-50 dark:bg-zinc-900/50">
                <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 whitespace-nowrap">Blog Title</th>
                <th className="px-6 py-6 text-left text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 whitespace-nowrap hidden sm:table-cell">Author</th>
                <th className="px-6 py-6 text-left text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 whitespace-nowrap hidden md:table-cell">Publication Date</th>
                <th className="px-6 py-6 text-left text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 whitespace-nowrap hidden lg:table-cell">Tags</th>
                <th className="px-8 py-6 text-right text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5">
              {isLoading ? (
                [...Array(6)].map((_, i) => <tr key={i} className="animate-pulse"><td colSpan={5} className="px-8 py-8"><div className="h-8 bg-zinc-50 dark:bg-zinc-900 rounded-xl" /></td></tr>)
              ) : (
                visibleData.map((item) => (
                  <BlogRow 
                    key={item.id} 
                    item={item} 
                    onPreview={handlePreview}
                    onEdit={handleEdit}
                    onDelete={setDeleteTarget}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── PAGINATION ─────────────────────────────────────────── */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-10 border-t border-black/5 dark:border-white/5">
          <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Blog Overview</p>
            <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Page {page + 1} of {totalPages} <span className="hidden sm:inline">| Total {count} Articles</span></p>
          </div>
          <div className="flex items-center gap-3">
            <button disabled={page === 0} onClick={() => setPage(p => Math.max(0, p - 1))} className="w-14 h-12 flex items-center justify-center rounded-xl bg-white dark:bg-[#080808] border border-black/5 dark:border-white/5 text-zinc-400 disabled:opacity-20 hover:border-uiupc-orange hover:text-uiupc-orange shadow-sm transition-all"><IconChevronLeft size={16} /></button>
            <button disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)} className="w-14 h-12 flex items-center justify-center rounded-xl bg-white dark:bg-[#080808] border border-black/5 dark:border-white/5 text-zinc-400 disabled:opacity-20 hover:border-uiupc-orange hover:text-uiupc-orange shadow-sm transition-all"><IconChevronRight size={16} /></button>
          </div>
        </div>
      )}

      {/* ── MODALS ─────────────────────────────────────────────── */}
      <Admin_ErrorBoundary>
        <AnimatePresence>
          {showPostModal && (
            <Admin_BlogPostModal
              formData={formData}
              editingPost={editingPost}
              uploading={uploading}
              onClose={() => { setShowPostModal(false); resetForm(); }}
              onSubmit={handleSubmit}
              onInputChange={handleInputChange}
              onMediaChange={handleMediaChange}
              onAddMedia={addMediaField}
              onRemoveMedia={removeMediaField}
            />
          )}
        </AnimatePresence>
      </Admin_ErrorBoundary>

      <Admin_ErrorBoundary>
        <AnimatePresence>
          {showPreviewModal && previewPost && (
            <Admin_BlogPreviewModal
              post={previewPost}
              onClose={() => setShowPreviewModal(false)}
              onEdit={(p) => { setShowPreviewModal(false); handleEdit(p); }}
            />
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

export default Admin_Blog;
