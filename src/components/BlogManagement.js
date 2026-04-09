"use client";
// components/BlogManagement.js
import React, { useState, useEffect } from "react";
import {
  FaNewspaper,
  FaPlus,
  FaEdit,
  FaTrash,
  FaEye,
  FaSync,
  FaCalendar,
  FaTag,
  FaSearch,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import Loading from "./Loading";
import "./BlogManagement.css";

const BlogManagement = ({ user, scripts, onUploadSuccess }) => {
  const [blogPosts, setBlogPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPostModal, setShowPostModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [previewPost, setPreviewPost] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage] = useState(10);

  // Search state
  const [searchTerm, setSearchTerm] = useState("");

  // Form state
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

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.status === "success") {
        const sortedPosts = (result.data || []).sort(
          (a, b) =>
            new Date(b.date || b.timestamp) - new Date(a.date || a.timestamp)
        );
        setBlogPosts(sortedPosts);
        setFilteredPosts(sortedPosts);
      } else {
        throw new Error(result.message || "Failed to fetch blog posts");
      }
    } catch (error) {
      console.error("Error fetching blog posts:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogPosts();
  }, []);

  // Filter posts based on search term
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredPosts(blogPosts);
    } else {
      const filtered = blogPosts.filter(
        (post) =>
          post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          post.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (post.tags &&
            post.tags.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (post.author &&
            post.author.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredPosts(filtered);
    }
    setCurrentPage(1); // Reset to first page when search changes
  }, [searchTerm, blogPosts]);

  // Pagination logic
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleMediaChange = (index, field, value) => {
    const updatedMedia = [...formData.media];
    updatedMedia[index] = {
      ...updatedMedia[index],
      [field]: value,
    };
    setFormData((prev) => ({
      ...prev,
      media: updatedMedia,
    }));
  };

  const addMediaField = () => {
    setFormData((prev) => ({
      ...prev,
      media: [...prev.media, { type: "image", url: "", caption: "" }],
    }));
  };

  const removeMediaField = (index) => {
    if (formData.media.length > 1) {
      const updatedMedia = formData.media.filter((_, i) => i !== index);
      setFormData((prev) => ({
        ...prev,
        media: updatedMedia,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.description.trim()) {
      alert("Please fill in all required fields (Title and Description)");
      return;
    }

    // Validate media URLs
    const validMedia = formData.media.filter(
      (media) => media.url.trim() !== ""
    );
    if (validMedia.length === 0) {
      alert("Please add at least one media URL");
      return;
    }

    try {
      setUploading(true);

      const submissionData = {
        action: editingPost ? "updateBlogPost" : "addBlogPost",
        title: formData.title,
        description: formData.description,
        date: formData.date,
        media: JSON.stringify(validMedia),
        tags: formData.tags,
        author: user.email,
        timestamp: new Date().toISOString(),
      };

      if (editingPost) {
        submissionData.postId = editingPost.id;
      }

      const response = await fetch(scripts.blog, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams(submissionData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.status === "success") {
        alert(`Blog post ${editingPost ? "updated" : "added"} successfully!`);
        setShowPostModal(false);
        resetForm();
        fetchBlogPosts();
        if (onUploadSuccess) onUploadSuccess();
      } else {
        throw new Error(
          result.message ||
            `Failed to ${editingPost ? "update" : "add"} blog post`
        );
      }
    } catch (error) {
      console.error("Error submitting blog post:", error);
      alert(
        `Failed to ${editingPost ? "update" : "add"} blog post: ` +
          error.message
      );
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (post) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      description: post.description,
      date: post.date,
      media:
        post.media && post.media.length > 0
          ? post.media
          : [{ type: "image", url: "", caption: "" }],
      tags: post.tags || "",
    });
    setShowPostModal(true);
  };

  const handlePreview = (post) => {
    setPreviewPost(post);
    setShowPreviewModal(true);
  };

  const handleDelete = async (postId) => {
    if (
      !confirm(
        "Are you sure you want to delete this blog post? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const response = await fetch(scripts.blog, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          action: "deleteBlogPost",
          postId: postId,
          deletedBy: user.email,
        }),
      });

      const result = await response.json();

      if (result.status === "success") {
        alert("Blog post deleted successfully!");
        fetchBlogPosts();
      } else {
        throw new Error(result.message || "Failed to delete blog post");
      }
    } catch (error) {
      console.error("Error deleting blog post:", error);
      alert("Failed to delete blog post: " + error.message);
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

  const handleNewPost = () => {
    resetForm();
    setShowPostModal(true);
  };

  const truncateDescription = (description, maxLength = 120) => {
    if (description.length <= maxLength) return description;
    return description.substring(0, maxLength) + "...";
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      const startPage = Math.max(
        1,
        currentPage - Math.floor(maxVisiblePages / 2)
      );
      const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
    }

    return pageNumbers;
  };

  if (loading) {
    return (
      <div className="blog-management">
        <div className="blog-header">
          <h2>Blog Management</h2>
        </div>
        <Loading />
      </div>
    );
  }

  return (
    <div className="blog-management-container">
      <div className="blog-management">
        <div className="blog-header">
          <h2>
            <FaNewspaper /> Blog Management
          </h2>
          <p>Create and manage blog posts for the website</p>
        </div>

        <div className="blog-controls">
          <div className="blog-stats">
            <span>
              Total Posts: <strong>{blogPosts.length}</strong>
            </span>
            <span>
              Showing: <strong>{filteredPosts.length}</strong>
            </span>
            <span>
              Latest Post:{" "}
              <strong>
                {blogPosts.length > 0
                  ? new Date(blogPosts[0].date).toLocaleDateString()
                  : "None"}
              </strong>
            </span>
          </div>

          <div className="blog-actions">
            <button
              onClick={fetchBlogPosts}
              className="btn-secondary"
              disabled={loading}
            >
              <FaSync /> Refresh
            </button>
            <button onClick={handleNewPost} className="btn-primary">
              <FaPlus /> New Post
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="blog-search">
          <div className="search-container">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search posts by title, description, tags, or author..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="search-input"
            />
            {searchTerm && (
              <button onClick={clearSearch} className="search-clear">
                ×
              </button>
            )}
          </div>
          {searchTerm && (
            <div className="search-results-info">
              Found {filteredPosts.length} post
              {filteredPosts.length !== 1 ? "s" : ""} matching "{searchTerm}"
            </div>
          )}
        </div>

        {error && (
          <div className="error-message">
            <p>Error loading blog posts: {error}</p>
            <button onClick={fetchBlogPosts} className="btn-secondary">
              Try Again
            </button>
          </div>
        )}

        {filteredPosts.length === 0 ? (
          <div className="no-posts">
            <FaNewspaper size={48} />
            <h3>
              {searchTerm ? "No Matching Posts Found" : "No Blog Posts Yet"}
            </h3>
            <p>
              {searchTerm
                ? "Try adjusting your search terms or clear the search to see all posts."
                : "Start by creating your first blog post!"}
            </p>
            {!searchTerm && (
              <button onClick={handleNewPost} className="btn-primary">
                <FaPlus /> Create First Post
              </button>
            )}
            {searchTerm && (
              <button onClick={clearSearch} className="btn-secondary">
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="blog-posts-grid-container">
              <div className="blog-posts-grid">
                {currentPosts.map((post) => (
                  <div key={post.id} className="blog-post-card">
                    {post.media && post.media.length > 0 && (
                      <div className="post-media-preview">
                        <img
                          src={post.media[0].url}
                          alt={post.media[0].caption || post.title}
                          onClick={() => handlePreview(post)}
                        />
                        <div className="media-count">
                          {post.media.length}{" "}
                          {post.media.length === 1 ? "media" : "media"}
                        </div>
                      </div>
                    )}

                    <div className="post-content">
                      <h3 className="post-title">{post.title}</h3>
                      <p className="post-description">
                        {truncateDescription(post.description)}
                      </p>

                      <div className="post-meta">
                        <span className="post-date">
                          <FaCalendar />{" "}
                          {new Date(post.date).toLocaleDateString()}
                        </span>
                        {post.tags && (
                          <span className="post-tags">
                            <FaTag /> {post.tags}
                          </span>
                        )}
                      </div>

                      <div className="post-footer">
                        <span className="post-author">
                          by {post.author || user.email}
                        </span>
                        <span className="post-id">
                          ID: {post.id.substring(0, 8)}...
                        </span>
                      </div>
                    </div>

                    <div className="post-actions">
                      <button
                        onClick={() => handlePreview(post)}
                        className="btn-view"
                        title="Preview Post"
                      >
                        <FaEye />
                      </button>
                      <button
                        onClick={() => handleEdit(post)}
                        className="btn-edit"
                        title="Edit Post"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="btn-delete"
                        title="Delete Post"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination-container">
                <div className="pagination-info">
                  Showing {indexOfFirstPost + 1}-
                  {Math.min(indexOfLastPost, filteredPosts.length)} of{" "}
                  {filteredPosts.length} posts
                </div>
                <div className="pagination-controls">
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="pagination-btn"
                  >
                    <FaChevronLeft /> Previous
                  </button>

                  <div className="pagination-numbers">
                    {getPageNumbers().map((number) => (
                      <button
                        key={number}
                        onClick={() => paginate(number)}
                        className={`pagination-number ${
                          currentPage === number ? "active" : ""
                        }`}
                      >
                        {number}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="pagination-btn"
                  >
                    Next <FaChevronRight />
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Blog Post Modal */}
        {showPostModal && (
          <div className="modal-overlay">
            <div className="modal-content blog-post-modal">
              <div className="modal-header">
                <h3>
                  {editingPost ? "Edit Blog Post" : "Create New Blog Post"}
                </h3>
                <button
                  onClick={() => {
                    setShowPostModal(false);
                    resetForm();
                  }}
                  className="modal-close"
                  disabled={uploading}
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit} className="blog-post-form">
                <div className="modal-body">
                  <div className="form-group">
                    <label>Title *</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="Enter blog post title"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Description *</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Enter blog post description"
                      rows="3"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Publish Date *</label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Tags</label>
                    <input
                      type="text"
                      name="tags"
                      value={formData.tags}
                      onChange={handleInputChange}
                      placeholder="tag1, tag2, tag3"
                    />
                    <small>Separate tags with commas</small>
                  </div>

                  <div className="form-group">
                    <label>Media</label>
                    {formData.media.map((media, index) => (
                      <div key={index} className="media-field-group">
                        <div className="media-field-header">
                          <span>Media {index + 1}</span>
                          {formData.media.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeMediaField(index)}
                              className="btn-remove-media"
                            >
                              Remove
                            </button>
                          )}
                        </div>

                        <select
                          value={media.type}
                          onChange={(e) =>
                            handleMediaChange(index, "type", e.target.value)
                          }
                          className="media-type-select"
                        >
                          <option value="image">Image</option>
                          <option value="video">Video</option>
                        </select>

                        <input
                          type="url"
                          placeholder="Enter media URL"
                          value={media.url}
                          onChange={(e) =>
                            handleMediaChange(index, "url", e.target.value)
                          }
                          className="media-url-input"
                        />

                        <input
                          type="text"
                          placeholder="Caption (optional)"
                          value={media.caption}
                          onChange={(e) =>
                            handleMediaChange(index, "caption", e.target.value)
                          }
                          className="media-caption-input"
                        />
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={addMediaField}
                      className="btn-add-media"
                    >
                      + Add Another Media
                    </button>
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPostModal(false);
                      resetForm();
                    }}
                    className="btn-secondary"
                    disabled={uploading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={uploading}
                  >
                    {uploading ? (
                      <>
                        <FaSync className="spinner" />
                        {editingPost ? "Updating..." : "Publishing..."}
                      </>
                    ) : (
                      <>
                        <FaPlus />
                        {editingPost ? "Update Post" : "Publish Post"}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Preview Modal */}
        {showPreviewModal && previewPost && (
          <div className="modal-overlay">
            <div className="modal-content blog-preview-modal">
              <div className="modal-header">
                <h3>Preview: {previewPost.title}</h3>
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="modal-close"
                >
                  ×
                </button>
              </div>

              <div className="modal-body">
                <div className="preview-content">
                  {previewPost.media && previewPost.media.length > 0 && (
                    <div className="preview-media">
                      <img
                        src={previewPost.media[0].url}
                        alt={previewPost.media[0].caption || previewPost.title}
                      />
                    </div>
                  )}

                  <div className="preview-details">
                    <h2>{previewPost.title}</h2>
                    <div className="preview-meta">
                      <span className="preview-date">
                        <FaCalendar />{" "}
                        {new Date(previewPost.date).toLocaleDateString()}
                      </span>
                      {previewPost.tags && (
                        <span className="preview-tags">
                          <FaTag /> {previewPost.tags}
                        </span>
                      )}
                    </div>
                    <p className="preview-description">
                      {previewPost.description}
                    </p>

                    {previewPost.media && previewPost.media.length > 1 && (
                      <div className="preview-media-gallery">
                        <h4>
                          Additional Media ({previewPost.media.length - 1})
                        </h4>
                        <div className="media-thumbnails">
                          {previewPost.media.slice(1).map((media, index) => (
                            <div key={index} className="media-thumbnail">
                              <img src={media.url} alt={media.caption} />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="btn-secondary"
                >
                  Close Preview
                </button>
                <button
                  onClick={() => {
                    setShowPreviewModal(false);
                    handleEdit(previewPost);
                  }}
                  className="btn-primary"
                >
                  <FaEdit /> Edit Post
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogManagement;
