"use client";

import React from "react";
import { FaSync, FaPlus } from "react-icons/fa";

interface Media {
  type: string;
  url: string;
  caption?: string;
}

interface BlogPostFormData {
  title: string;
  description: string;
  date: string;
  tags: string;
  media: Media[];
}

interface BlogPostModalProps {
  formData: BlogPostFormData;
  editingPost: any;
  uploading: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onMediaChange: (index: number, field: string, value: string) => void;
  onAddMedia: () => void;
  onRemoveMedia: (index: number) => void;
}

const BlogPostModal: React.FC<BlogPostModalProps> = ({
  formData,
  editingPost,
  uploading,
  onClose,
  onSubmit,
  onInputChange,
  onMediaChange,
  onAddMedia,
  onRemoveMedia,
}) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content blog-post-modal">
        <div className="modal-header">
          <h3>{editingPost ? "Edit Blog Post" : "Create New Blog Post"}</h3>
          <button onClick={onClose} className="modal-close" disabled={uploading}>
            ×
          </button>
        </div>

        <form onSubmit={onSubmit} className="blog-post-form">
          <div className="modal-body">
            <div className="form-group">
              <label>Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={onInputChange}
                placeholder="Enter blog post title"
                required
              />
            </div>

            <div className="form-group">
              <label>Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={onInputChange}
                placeholder="Enter blog post description"
                rows={3}
                required
              />
            </div>

            <div className="form-group">
              <label>Publish Date *</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={onInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Tags</label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={onInputChange}
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
                        onClick={() => onRemoveMedia(index)}
                        className="btn-remove-media"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <select
                    value={media.type}
                    onChange={(e) => onMediaChange(index, "type", e.target.value)}
                    className="media-type-select"
                  >
                    <option value="image">Image</option>
                    <option value="video">Video</option>
                  </select>

                  <input
                    type="url"
                    placeholder="Enter media URL"
                    value={media.url}
                    onChange={(e) => onMediaChange(index, "url", e.target.value)}
                    className="media-url-input"
                  />

                  <input
                    type="text"
                    placeholder="Caption (optional)"
                    value={media.caption || ""}
                    onChange={(e) => onMediaChange(index, "caption", e.target.value)}
                    className="media-caption-input"
                  />
                </div>
              ))}

              <button type="button" onClick={onAddMedia} className="btn-add-media">
                + Add Another Media
              </button>
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={uploading}
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={uploading}>
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
  );
};

export default BlogPostModal;
