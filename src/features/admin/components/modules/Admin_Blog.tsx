"use client";

import React, { useState, useMemo, useEffect } from "react";
import { 
  FaNewspaper, 
  FaPlus, 
  FaSearch, 
  FaChevronLeft, 
  FaChevronRight, 
  FaPenNib,
  FaEye,
  FaEdit,
  FaTrash,
  FaCalendarAlt,
  FaTag
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { Admin_Dropdown } from "@/features/admin/components";
import Admin_BlogPostModal from "./Admin_BlogPostModal";
import Admin_BlogPreviewModal from "./Admin_BlogPreviewModal";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { supabase } from "@/lib/supabase";

export const Admin_Blog: React.FC = () => {
  const { user, adminProfile } = useSupabaseAuth();
  const [showPostModal, setShowPostModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editingPost, setEditingPost] = useState<any>(null);
  const [previewPost, setPreviewPost] = useState<any>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [filterAuthor, setFilterAuthor] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const pageSize = 12;

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    media: [{ type: "image", url: "", caption: "" }],
    tags: "",
  });

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleMediaChange = (index: number, field: string, value: string) => {
    const updatedMedia = [...formData.media];
    updatedMedia[index] = { ...updatedMedia[index], [field]: value };
    setFormData((prev) => ({ ...prev, media: updatedMedia }));
  };

  const addMediaField = () => {
    setFormData((prev) => ({ ...prev, media: [...prev.media, { type: "image", url: "", caption: "" }] }));
  };

  const removeMediaField = (index: number) => {
    if (formData.media.length > 1) {
      setFormData((prev) => ({ ...prev, media: prev.media.filter((_, i) => i !== index) }));
    }
  };

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
      console.error("Post failed:", error.message);
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
      media: post.media?.length ? post.media : [{ type: "image", url: "", caption: "" }],
      tags: post.tags || "",
    });
    setShowPostModal(true);
  };

  const handlePreview = (post: any) => {
    setPreviewPost(post);
    setShowPreviewModal(true);
  };

  const handleDelete = async (postId: string) => {
    if (!window.confirm("Delete this blog post?")) return;
    try {
      const { error } = await supabase.from("blog_posts").delete().eq('id', postId);
      if (error) throw error;
      refetch();
    } catch (error: any) {
      console.error("Delete failed:", error.message);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      date: new Date().toISOString().split("T")[0],
      media: [{ type: "image", url: "", caption: "" }],
      tags: "",
    });
    setEditingPost(null);
  };

  const totalPages = Math.ceil((count || 0) / pageSize);

  return (
    <div className="w-full space-y-8 min-w-0">
      {/* ── CLEAN FILTER BAR ───────────────────────────────────── */}
      <div className="w-full bg-white dark:bg-[#080808] p-6 rounded-[2.5rem] border border-black/5 dark:border-white/5 shadow-sm">
        <div className="flex flex-col xl:flex-row gap-6 items-stretch xl:items-center justify-between">
          <div className="relative flex-1 group">
            <FaSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-uiupc-orange transition-colors" />
            <input 
              type="text" 
              placeholder="Search by title or author..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full py-5 pl-14 pr-8 bg-zinc-50 dark:bg-zinc-900/50 border border-transparent focus:border-uiupc-orange/30 rounded-2xl text-sm outline-none transition-all placeholder:text-zinc-400 font-medium" 
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex flex-col gap-1.5">
              <span className="text-[8px] font-black uppercase tracking-widest text-zinc-400 pl-4">Author</span>
              <Admin_Dropdown 
                value={filterAuthor} 
                onChange={setFilterAuthor}
                options={[{ value: 'all', label: 'All Authors' }, ...authors.map(a => ({ value: a, label: a.split('@')[0] }))]}
                className="min-w-[180px]"
              />
            </div>
            <button 
              onClick={() => { resetForm(); setShowPostModal(true); }} 
              className="px-8 h-14 mt-auto flex items-center gap-3 bg-uiupc-orange text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-uiupc-orange/20 hover:brightness-110 transition-all"
            >
              <FaPlus /> Write New Post
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
                <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 whitespace-nowrap">Blog Title</th>
                <th className="px-6 py-6 text-left text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 whitespace-nowrap">Written By</th>
                <th className="px-6 py-6 text-left text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 whitespace-nowrap">Date Published</th>
                <th className="px-6 py-6 text-left text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 whitespace-nowrap">Tags / Category</th>
                <th className="px-8 py-6 text-right text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5">
              {isLoading ? (
                [...Array(6)].map((_, i) => <tr key={i} className="animate-pulse"><td colSpan={5} className="px-8 py-8"><div className="h-8 bg-zinc-50 dark:bg-zinc-900 rounded-xl" /></td></tr>)
              ) : (
                (posts || []).filter(p => (p.title || "").toLowerCase().includes(searchTerm.toLowerCase())).map((item) => (
                  <motion.tr key={item.id} className="group hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition-all">
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-sm font-black text-uiupc-orange shadow-inner">
                          <FaNewspaper size={16} />
                        </div>
                        <div className="flex flex-col min-w-[250px]">
                          <span className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-tight truncate">{item.title}</span>
                          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest truncate">{item.description?.slice(0, 40)}...</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6 whitespace-nowrap">
                       <span className="text-[11px] font-black text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                         <FaPenNib className="text-uiupc-orange text-[10px]" /> {item.author?.split('@')[0]}
                       </span>
                    </td>
                    <td className="px-6 py-6 whitespace-nowrap">
                       <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                         <FaCalendarAlt className="text-zinc-300" /> {new Date(item.date).toLocaleDateString()}
                       </span>
                    </td>
                    <td className="px-6 py-6 whitespace-nowrap">
                       <span className="px-4 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800/50 text-zinc-500 dark:text-zinc-400 text-[9px] font-black uppercase tracking-widest border border-black/5 dark:border-white/5 flex items-center gap-2 w-fit">
                         <FaTag className="text-[10px]" /> {item.tags?.split(',')[0] || "News"}
                       </span>
                    </td>
                    <td className="px-8 py-6 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handlePreview(item)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:bg-uiupc-orange hover:text-white transition-all"><FaEye className="text-xs" /></button>
                        <button onClick={() => handleEdit(item)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:bg-uiupc-orange hover:text-white transition-all"><FaEdit className="text-xs" /></button>
                        <button onClick={() => handleDelete(item.id)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400 hover:bg-red-500 hover:text-white transition-all"><FaTrash className="text-xs" /></button>
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
          <div className="flex flex-col"><p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Blog Summary</p><p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Page {page + 1} of {totalPages} | Total {count} Articles</p></div>
          <div className="flex items-center gap-3">
            <button disabled={page === 0} onClick={() => { setPage(p => Math.max(0, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="w-14 h-14 flex items-center justify-center rounded-2xl bg-white dark:bg-[#080808] border border-black/5 dark:border-white/5 text-zinc-400 disabled:opacity-20 hover:border-uiupc-orange hover:text-uiupc-orange shadow-sm transition-all"><FaChevronLeft className="text-xs" /></button>
            <button disabled={page >= totalPages - 1} onClick={() => { setPage(p => p + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="w-14 h-14 flex items-center justify-center rounded-2xl bg-white dark:bg-[#080808] border border-black/5 dark:border-white/5 text-zinc-400 disabled:opacity-20 hover:border-uiupc-orange hover:text-uiupc-orange shadow-sm transition-all"><FaChevronRight className="text-xs" /></button>
          </div>
        </div>
      )}

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

      {showPreviewModal && previewPost && (
        <Admin_BlogPreviewModal
          post={previewPost}
          onClose={() => setShowPreviewModal(false)}
          onEdit={(p) => { setShowPreviewModal(false); handleEdit(p); }}
        />
      )}
    </div>
  );
};

export default Admin_Blog;
