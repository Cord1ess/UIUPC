"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminData } from "@/hooks/useAdminData";
import { ADMIN_SCRIPTS } from "@/features/admin/config";
import BlogList from "@/features/blog/components/BlogList";
import BlogPostModal from "@/features/blog/components/BlogPostModal";
import BlogPreviewModal from "@/features/blog/components/BlogPreviewModal";
import Loading from "@/components/Loading";
import {
  FaSearch,
  FaSync,
  FaPlus,
  FaChevronLeft,
  FaChevronRight,
  FaNewspaper,
} from "react-icons/fa";
import ScrollRevealText from "@/components/home/ScrollRevealText";

const BlogAdminPage = () => {
  const { user } = useAuth();

  // Data state
  const { data: blogPosts, isLoading: loading, error, refetch: fetchBlogPosts } = useAdminData("blog", ADMIN_SCRIPTS.blog);

  // UI state
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 10;

  // Modal state
  const [showPostModal, setShowPostModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editingPost, setEditingPost] = useState<any>(null);
  const [previewPost, setPreviewPost] = useState<any>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    media: [{ type: "image", url: "", caption: "" }],
    tags: "",
  });

  // ── Filtering & Pagination ──
  const filteredPosts = useMemo(() => {
    if (!searchTerm.trim()) return blogPosts;
    const term = searchTerm.toLowerCase();
    return blogPosts.filter(
      (post) =>
        post.title?.toLowerCase().includes(term) ||
        post.description?.toLowerCase().includes(term) ||
        post.tags?.toLowerCase().includes(term) ||
        post.author?.toLowerCase().includes(term)
    );
  }, [blogPosts, searchTerm]);

  useEffect(() => setCurrentPage(1), [searchTerm]);

  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const startIdx = (currentPage - 1) * postsPerPage;
  const currentPosts = filteredPosts.slice(startIdx, startIdx + postsPerPage);

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const max = 5;
    if (totalPages <= max + 2) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      let s = Math.max(2, currentPage - 1);
      let e = Math.min(totalPages - 1, currentPage + 1);
      if (currentPage <= 3) { s = 2; e = max; }
      if (currentPage >= totalPages - 2) { s = totalPages - max + 1; e = totalPages - 1; }
      if (s > 2) pages.push("...");
      for (let i = s; i <= e; i++) pages.push(i);
      if (e < totalPages - 1) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  // ── CRUD Handlers ──
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleMediaChange = (index: number, field: string, value: string) => {
    const updated = [...formData.media];
    updated[index] = { ...updated[index], [field]: value };
    setFormData((prev) => ({ ...prev, media: updated }));
  };

  const addMediaField = () => {
    setFormData((prev) => ({
      ...prev,
      media: [...prev.media, { type: "image", url: "", caption: "" }],
    }));
  };

  const removeMediaField = (index: number) => {
    if (formData.media.length > 1) {
      setFormData((prev) => ({
        ...prev,
        media: prev.media.filter((_, i) => i !== index),
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) {
      alert("Please fill in Title and Description.");
      return;
    }
    const validMedia = formData.media.filter((m) => m.url.trim() !== "");
    if (validMedia.length === 0) {
      alert("Please add at least one media URL.");
      return;
    }
    try {
      setUploading(true);
      const submissionData: Record<string, string> = {
        action: editingPost ? "updateBlogPost" : "addBlogPost",
        title: formData.title,
        description: formData.description,
        date: formData.date,
        media: JSON.stringify(validMedia),
        tags: formData.tags,
        author: user!.email || "",
        timestamp: new Date().toISOString(),
      };
      if (editingPost) submissionData.postId = editingPost.id;

      const response = await fetch(ADMIN_SCRIPTS.blog, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(submissionData),
      });
      const result = await response.json();
      if (result.status === "success") {
        alert(`Blog post ${editingPost ? "updated" : "added"} successfully!`);
        setShowPostModal(false);
        resetForm();
        fetchBlogPosts();
      } else {
        throw new Error(result.message || "Failed.");
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
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
    if (!window.confirm("Delete this blog post? Cannot be undone.")) return;
    try {
      const response = await fetch(ADMIN_SCRIPTS.blog, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ action: "deleteBlogPost", postId, deletedBy: user!.email || "" }),
      });
      const result = await response.json();
      if (result.status === "success") {
        alert("Blog post deleted successfully!");
        fetchBlogPosts();
      } else {
        throw new Error(result.message || "Failed to delete.");
      }
    } catch (err: any) {
      alert(`Failed to delete: ${err.message}`);
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

  if (!user) return <Loading />;

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-4">
          <ScrollRevealText
            text="Blog & News"
            className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none text-zinc-900 dark:text-white"
          />
          <p className="text-zinc-500 dark:text-zinc-400 font-medium text-sm md:text-base uppercase tracking-widest">
            Create and manage blog posts.
          </p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => fetchBlogPosts()}
            className="px-6 py-3 bg-white dark:bg-zinc-900 border border-black/5 dark:border-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest text-zinc-600 dark:text-zinc-400 hover:bg-black/5 dark:hover:bg-white/5 transition-all flex items-center gap-2"
          >
            <FaSync className={loading ? "animate-spin" : ""} /> Refresh
          </button>
          <button
            onClick={() => { resetForm(); setShowPostModal(true); }}
            className="px-6 py-3 bg-uiupc-orange text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all flex items-center gap-2 shadow-lg shadow-uiupc-orange/20"
          >
            <FaPlus /> New Post
          </button>
        </div>
      </div>

      {/* Search & Stats */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
        <div className="relative flex-1">
          <FaSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400 text-sm pointer-events-none" />
          <input
            type="text"
            placeholder="Search posts by title, tags, author..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full py-4 pl-12 pr-5 bg-white dark:bg-[#080808] border border-black/5 dark:border-white/5 rounded-2xl text-sm text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 focus:outline-none focus:border-uiupc-orange focus:ring-2 focus:ring-uiupc-orange/10 transition-all"
          />
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
            {filteredPosts.length} post{filteredPosts.length !== 1 ? "s" : ""}
          </span>
          {searchTerm && (
            <button onClick={() => setSearchTerm("")} className="text-[10px] font-black uppercase tracking-widest text-uiupc-orange hover:underline">
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="bg-[#ffffff] dark:bg-[#050505] rounded-2xl border border-black/5 dark:border-white/5 overflow-hidden shadow-3xl shadow-black/5 p-6 md:p-10">
        {loading ? (
          <Loading />
        ) : error ? (
          <div className="text-center py-16 space-y-4">
            <p className="text-sm text-red-500">{error}</p>
            <button onClick={() => fetchBlogPosts()} className="px-6 py-3 rounded-xl bg-uiupc-orange/10 text-uiupc-orange text-[10px] font-black uppercase tracking-widest hover:bg-uiupc-orange hover:text-white transition-all">
              Try Again
            </button>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-16 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto text-2xl text-zinc-300 dark:text-zinc-600">
              <FaNewspaper />
            </div>
            <p className="text-sm font-bold text-zinc-500 dark:text-zinc-400">
              {blogPosts.length === 0 ? "No blog posts yet. Create your first one!" : "No posts match your search."}
            </p>
          </div>
        ) : (
          <>
            <BlogList
              posts={currentPosts}
              onPreview={handlePreview}
              onEdit={handleEdit}
              onDelete={handleDelete}
              userEmail={user.email || ""}
            />

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 mt-8 border-t border-black/5 dark:border-white/5">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                  Page {currentPage} of {totalPages} · Showing {startIdx + 1}–{Math.min(startIdx + postsPerPage, filteredPosts.length)} of {filteredPosts.length}
                </p>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="w-10 h-10 rounded-xl bg-white dark:bg-[#080808] border border-black/5 dark:border-white/5 flex items-center justify-center text-zinc-500 disabled:opacity-30 disabled:cursor-not-allowed hover:border-uiupc-orange hover:text-uiupc-orange transition-all"
                  >
                    <FaChevronLeft className="text-xs" />
                  </button>
                  {getPageNumbers().map((page, i) =>
                    typeof page === "string" ? (
                      <span key={`e-${i}`} className="w-10 h-10 flex items-center justify-center text-zinc-400 text-xs">···</span>
                    ) : (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-10 h-10 rounded-xl text-xs font-bold transition-all ${
                          page === currentPage
                            ? "bg-uiupc-orange text-white shadow-lg shadow-uiupc-orange/20"
                            : "bg-white dark:bg-[#080808] border border-black/5 dark:border-white/5 text-zinc-500 hover:border-uiupc-orange hover:text-uiupc-orange"
                        }`}
                      >
                        {page}
                      </button>
                    )
                  )}
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="w-10 h-10 rounded-xl bg-white dark:bg-[#080808] border border-black/5 dark:border-white/5 flex items-center justify-center text-zinc-500 disabled:opacity-30 disabled:cursor-not-allowed hover:border-uiupc-orange hover:text-uiupc-orange transition-all"
                  >
                    <FaChevronRight className="text-xs" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      {showPostModal && (
        <BlogPostModal
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
        <BlogPreviewModal
          post={previewPost}
          onClose={() => setShowPreviewModal(false)}
          onEdit={(p) => { setShowPreviewModal(false); handleEdit(p); }}
        />
      )}
    </div>
  );
};

export default BlogAdminPage;
