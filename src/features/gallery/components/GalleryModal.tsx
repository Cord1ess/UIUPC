"use client";

import React from "react";
import { FaTimes, FaSync, FaUpload } from "react-icons/fa";

interface UploadForm {
  title: string;
  description: string;
  eventId: string;
  facebookPost: string;
  imageUrl: string;
}

interface GalleryModalProps {
  uploadForm: UploadForm;
  editingPhoto: any;
  uploading: boolean;
  imagePreview: string;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onInputChange: (field: string, value: string) => void;
}

const GalleryModal: React.FC<GalleryModalProps> = ({
  uploadForm,
  editingPhoto,
  uploading,
  imagePreview,
  onClose,
  onSubmit,
  onInputChange,
}) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>{editingPhoto ? "Edit Photo" : "Add Photo to Gallery"}</h3>
          <button
            onClick={onClose}
            className="modal-close"
            disabled={uploading}
          >
            <FaTimes />
          </button>
        </div>
        <div className="modal-body">
          <form onSubmit={onSubmit} className="upload-form">
            <div className="form-group">
              <label>Title *</label>
              <input
                type="text"
                value={uploadForm.title}
                onChange={(e) => onInputChange("title", e.target.value)}
                placeholder="Enter photo title"
                required
                disabled={uploading}
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                value={uploadForm.description}
                onChange={(e) => onInputChange("description", e.target.value)}
                placeholder="Enter photo description"
                rows={4}
                disabled={uploading}
              />
            </div>

            <div className="form-group">
              <label>Event *</label>
              <select
                value={uploadForm.eventId}
                onChange={(e) => onInputChange("eventId", e.target.value)}
                required
                disabled={uploading}
              >
                <option value="">Select an event</option>
                <option value="1">Friday Exposure</option>
                <option value="2">Photo Adda</option>
                <option value="3">Photo Walk</option>
                <option value="4">Exhibitions Visit</option>
                <option value="5">Workshops & Talks</option>
                <option value="6">Shutter Stories</option>
              </select>
            </div>

            <div className="form-group">
              <label>Facebook Post URL</label>
              <input
                type="url"
                value={uploadForm.facebookPost}
                onChange={(e) => onInputChange("facebookPost", e.target.value)}
                placeholder="https://facebook.com/..."
                disabled={uploading}
              />
            </div>

            <div className="form-group">
              <label>Image URL *</label>
              <input
                type="url"
                value={uploadForm.imageUrl}
                onChange={(e) => onInputChange("imageUrl", e.target.value)}
                placeholder="https://res.cloudinary.com/..."
                required
                disabled={uploading}
              />
              {imagePreview && (
                <div className="image-preview">
                  <p>Preview:</p>
                  <img
                    src={imagePreview}
                    alt="Preview"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
              )}
              <small style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>
                Supported: Cloudinary, Imgur, or direct image URLs
              </small>
            </div>

            <div className="form-actions">
              <button
                type="button"
                onClick={onClose}
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
                {uploading ? <FaSync className="spinner" /> : <FaUpload />}
                {uploading ? (editingPhoto ? "Updating..." : "Uploading...") : (editingPhoto ? "Update Photo" : "Upload to Gallery")}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default GalleryModal;
