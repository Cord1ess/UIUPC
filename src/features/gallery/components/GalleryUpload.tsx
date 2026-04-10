"use client";

import React, { useState, useEffect } from "react";
import { FaPlus, FaSync, FaImages, FaSearch, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import Loading from "@/components/Loading";
import GalleryList from "./GalleryList";
import GalleryModal from "./GalleryModal";
import "./GalleryUpload.css";

interface GalleryUploadProps {
  user: any;
  scripts: Record<string, string>;
  onUploadSuccess?: () => void;
}

const GalleryUpload: React.FC<GalleryUploadProps> = ({ user, scripts, onUploadSuccess }) => {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState("");
  const [galleryPhotos, setGalleryPhotos] = useState<any[]>([]);
  const [filteredPhotos, setFilteredPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingPhoto, setEditingPhoto] = useState<any>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [photosPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");

  const [uploadForm, setUploadForm] = useState({
    title: "",
    description: "",
    eventId: "",
    facebookPost: "",
    imageUrl: "",
  });

  const fetchGalleryPhotos = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${scripts.gallery}?action=getGallery`);
      const result = await response.json();

      if (result.status === "success") {
        const photos = result.data || [];
        const sortedPhotos = photos.sort(
          (a: any, b: any) => new Date(b.uploadedAt || b.timestamp).getTime() - new Date(a.uploadedAt || a.timestamp).getTime()
        );
        setGalleryPhotos(sortedPhotos);
        setFilteredPhotos(sortedPhotos);
      } else {
        throw new Error(result.message || "Failed to fetch gallery photos");
      }
    } catch (err: any) {
      console.error("Error fetching gallery photos:", err);
      setError("Unable to load gallery photos: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGalleryPhotos();
  }, []);

  const getEventName = (eventId: string) => {
    const events: Record<string, string> = {
      "1": "Friday Exposure",
      "2": "Photo Adda",
      "3": "Photo Walk",
      "4": "Exhibitions Visit",
      "5": "Workshops & Talks",
      "6": "Shutter Stories"
    };
    return events[eventId] || "Unknown Event";
  };

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredPhotos(galleryPhotos);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = galleryPhotos.filter(
        (photo) =>
          photo.title.toLowerCase().includes(term) ||
          photo.description.toLowerCase().includes(term) ||
          (photo.tags && photo.tags.toLowerCase().includes(term)) ||
          (photo.uploadedBy && photo.uploadedBy.toLowerCase().includes(term)) ||
          getEventName(photo.eventId).toLowerCase().includes(term)
      );
      setFilteredPhotos(filtered);
    }
    setCurrentPage(1);
  }, [searchTerm, galleryPhotos]);

  const indexOfLastPhoto = currentPage * photosPerPage;
  const indexOfFirstPhoto = indexOfLastPhoto - photosPerPage;
  const currentPhotos = filteredPhotos.slice(indexOfFirstPhoto, indexOfLastPhoto);
  const totalPages = Math.ceil(filteredPhotos.length / photosPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const handleInputChange = (field: string, value: string) => {
    setUploadForm((prev) => ({ ...prev, [field]: value }));
    if (field === "imageUrl") setImagePreview(value);
  };

  const handleGalleryUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadForm.title || !uploadForm.imageUrl || !uploadForm.eventId) {
      alert("Please fill in Title, Image URL, and Event");
      return;
    }

    try {
      setUploading(true);
      const submissionData: Record<string, string> = {
        action: editingPhoto ? "updateGallery" : "addToGallery",
        title: uploadForm.title,
        description: uploadForm.description,
        eventId: uploadForm.eventId,
        facebookPost: uploadForm.facebookPost,
        imageUrl: uploadForm.imageUrl,
        uploadedBy: user.email,
        timestamp: new Date().toISOString(),
      };

      if (editingPhoto) submissionData.photoId = editingPhoto.id;

      const response = await fetch(scripts.gallery, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(submissionData),
      });

      const result = await response.json();
      if (result.status === "success") {
        alert(`Photo ${editingPhoto ? "updated" : "added"} successfully!`);
        setShowUploadModal(false);
        resetForm();
        fetchGalleryPhotos();
        if (onUploadSuccess) onUploadSuccess();
      } else {
        throw new Error(result.message || "Failed.");
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (photo: any) => {
    setEditingPhoto(photo);
    setUploadForm({
      title: photo.title,
      description: photo.description,
      eventId: photo.eventId,
      facebookPost: photo.facebookPost,
      imageUrl: photo.url || photo.imageUrl,
    });
    setImagePreview(photo.url || photo.imageUrl);
    setShowUploadModal(true);
  };

  const handleDelete = async (photoId: string) => {
    if (!window.confirm("Delete this photo? Cannot be undone.")) return;
    try {
      const response = await fetch(scripts.gallery, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ action: "deleteFromGallery", photoId, deletedBy: user.email }),
      });
      const result = await response.json();
      if (result.status === "success") {
        alert("Photo deleted!");
        fetchGalleryPhotos();
      } else {
        throw new Error(result.message || "Failed to delete.");
      }
    } catch (err: any) {
      alert(`Failed to delete: ${err.message}`);
    }
  };

  const resetForm = () => {
    setUploadForm({ title: "", description: "", eventId: "", facebookPost: "", imageUrl: "" });
    setImagePreview("");
    setEditingPhoto(null);
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

  if (loading) return <div className="gallery-upload-container"><Loading /></div>;

  return (
    <div className="gallery-upload-container">
      <div className="gallery-upload">
        <div className="gallery-header">
          <h2><FaImages /> Gallery Management</h2>
          <p>Upload and manage gallery photos</p>
        </div>

        <div className="gallery-controls">
          <div className="gallery-stats">
            <span>Total Photos: <strong>{galleryPhotos.length}</strong></span>
            <span>Showing: <strong>{filteredPhotos.length}</strong></span>
          </div>
          <div className="gallery-actions">
            <button onClick={fetchGalleryPhotos} className="btn-secondary" disabled={loading}><FaSync /> Refresh</button>
            <button onClick={() => { resetForm(); setShowUploadModal(true); }} className="btn-primary"><FaPlus /> Add Photo</button>
          </div>
        </div>

        <div className="gallery-search">
          <div className="search-container">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search photos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            {searchTerm && <button onClick={() => setSearchTerm("")} className="search-clear">×</button>}
          </div>
        </div>

        {error && (
          <div className="error-message">
            <p>{error}</p>
            <button onClick={fetchGalleryPhotos} className="btn-secondary">Try Again</button>
          </div>
        )}

        {filteredPhotos.length === 0 ? (
          <div className="no-photos">
            <FaImages size={48} />
            <h3>No Photos Found</h3>
          </div>
        ) : (
          <>
            <GalleryList
              photos={currentPhotos}
              userEmail={user.email}
              onEdit={handleEdit}
              onDelete={handleDelete}
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

        {showUploadModal && (
          <GalleryModal
            uploadForm={uploadForm}
            editingPhoto={editingPhoto}
            uploading={uploading}
            imagePreview={imagePreview}
            onClose={() => { setShowUploadModal(false); resetForm(); }}
            onSubmit={handleGalleryUpload}
            onInputChange={handleInputChange}
          />
        )}
      </div>
    </div>
  );
};

export default GalleryUpload;
