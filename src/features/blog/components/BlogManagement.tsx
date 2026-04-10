"use client";

import React, { useState, useEffect } from "react";
import { FaNewspaper, FaPlus, FaSync, FaSearch, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import Loading from "@/components/Loading";
import BlogList from "./BlogList";
import BlogPostModal from "./BlogPostModal";
import BlogPreviewModal from "./BlogPreviewModal";
import "./BlogManagement.css";

interface BlogManagementProps {
  user: any;
  scripts: Record<string, string>;
  onUploadSuccess?: () => void;
}

const BlogManagement: React.FC<BlogManagementProps> = ({ user, scripts, onUploadSuccess }) => {
  const [blogPosts, setBlogPosts] = useState<any[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPostModal, setShowPostModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editingPost, setEditingPost] = useState<any>(null);
  const [previewPost, setPreviewPost] = useState<any>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    media: [{ type: "image", url: "", caption: "" }],
    tags: "",
  });

  const fetchBlogPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${scripts.blog}?action=getBlogPosts`);
      const result = await response.json();

      if (result.status === "success") {
        const sortedPosts = (result.data || []).sort(
          (a: any, b: any) =>
            new Date(b.date || b.timestamp).getTime() - new Date(a.date || a.timestamp).getTime()
        );
        setBlogPosts(sortedPosts);
        setFilteredPosts(sortedPosts);
      } else {
        throw new Error(result.message || "Failed to fetch blog posts");
      }
    } catch (error: any) {
      console.error("Error fetching blog posts:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogPosts();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredPosts(blogPosts);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = blogPosts.filter(
        (post) =>
          post.title.toLowerCase().includes(term) ||
          post.description.toLowerCase().includes(term) ||
          (post.tags && post.tags.toLowerCase().includes(term)) ||
          (post.author && post.author.toLowerCase().includes(term))
      );
      setFilteredPosts(filtered);
    }
    setCurrentPage(1);
  }, [searchTerm, blogPosts]);

  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

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
        author: user.email,
        timestamp: new Date().toISOString(),
      };
      if (editingPost) submissionData.postId = editingPost.id;

      const response = await fetch(scripts.blog, {
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
        if (onUploadSuccess) onUploadSuccess();
      } else {
        throw new Error(result.message || "Failed.");
      }
    } catch (error: any) {
      alert(`Error: ${error.message}`);
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
      const response = await fetch(scripts.blog, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ action: "deleteBlogPost", postId, deletedBy: user.email }),
      });
      const result = await response.json();
      if (result.status === "success") {
        alert("Blog post deleted successfully!");
        fetchBlogPosts();
      } else {
        throw new Error(result.message || "Failed to delete.");
      }
    } catch (error: any) {
      alert(`Failed to delete: ${error.message}`);
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

  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);
    } else {
      const startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
      const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
      for (let i = startPage; i <= endPage; i++) pageNumbers.push(i);
    }
    return pageNumbers;
  };

  if (loading) {
    return <div className="blog-management"><Loading /></div>;
  }

  return (
    <div className="blog-management-container">
      <div className="blog-management">
        <div className="blog-header">
          <h2><FaNewspaper /> Blog Management</h2>
          <p>Create and manage blog posts</p>
        </div>

        <div className="blog-controls">
          <div className="blog-stats">
            <span>Total Posts: <strong>{blogPosts.length}</strong></span>
            <span>Showing: <strong>{filteredPosts.length}</strong></span>
          </div>
          <div className="blog-actions">
            <button onClick={fetchBlogPosts} className="btn-secondary" disabled={loading}><FaSync /> Refresh</button>
            <button onClick={() => { resetForm(); setShowPostModal(true); }} className="btn-primary"><FaPlus /> New Post</button>
          </div>
        </div>

        <div className="blog-search">
          <div className="search-container">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            {searchTerm && <button onClick={() => setSearchTerm("")} className="search-clear">×</button>}
          </div>
        </div>

        {error && (
          <div className="error-message">
            <p>Error: {error}</p>
            <button onClick={fetchBlogPosts} className="btn-secondary">Try Again</button>
          </div>
        )}

        {filteredPosts.length === 0 ? (
          <div className="no-posts">
            <FaNewspaper size={48} />
            <h3>No Posts Found</h3>
          </div>
        ) : (
          <>
            <BlogList 
              posts={currentPosts} 
              onPreview={handlePreview} 
              onEdit={handleEdit} 
              onDelete={handleDelete} 
              userEmail={user.email} 
            />
            {totalPages > 1 && (
              <div className="pagination-container">
                <div className="pagination-controls">
                  <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} className="pagination-btn">
                    <FaChevronLeft /> Prev
                  </button>
                  <div className="pagination-numbers">
                    {getPageNumbers().map(num => (
                      <button key={num} onClick={() => paginate(num)} className={`pagination-number ${currentPage === num ? "active" : ""}`}>
                        {num}
                      </button>
                    ))}
                  </div>
                  <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages} className="pagination-btn">
                    Next <FaChevronRight />
                  </button>
                </div>
              </div>
            )}
          </>
        )}

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
    </div>
  );
};

export default BlogManagement;
