"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminData } from "@/hooks/useAdminData";
import { ADMIN_SCRIPTS } from "@/features/admin/config";
import GalleryList from "@/features/gallery/components/GalleryList";
import GalleryModal from "@/features/gallery/components/GalleryModal";
import GlobalLoader from "@/components/shared/GlobalLoader";
import {
  FaSearch,
  FaSync,
  FaPlus,
  FaChevronLeft,
  FaChevronRight,
  FaImages,
} from "react-icons/fa";
import ScrollRevealText from "@/components/motion/ScrollRevealText";

const GalleryAdminPage = () => {
  const { user } = useAuth();

  // Data state
  const { data: galleryPhotos, isLoading: loading, error, refetch: fetchGalleryPhotos } = useAdminData("gallery", ADMIN_SCRIPTS.gallery);

  // UI state
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const photosPerPage = 10;

  // Modal state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<any>(null);
  const [imagePreview, setImagePreview] = useState("");

  const [uploadForm, setUploadForm] = useState({
    title: "",
    description: "",
    eventId: "",
    facebookPost: "",
    imageUrl: "",
  });

  const getEventName = (eventId: string) => {
    const events: Record<string, string> = {
      "1": "Friday Exposure",
      "2": "Photo Adda",
      "3": "Photo Walk",
      "4": "Exhibitions Visit",
      "5": "Workshops & Talks",
      "6": "Shutter Stories",
    };
    return events[eventId] || "Unknown Event";
  };

  // ── Filtering & Pagination ──
  const filteredPhotos = useMemo(() => {
    if (!searchTerm.trim()) return galleryPhotos;
    const term = searchTerm.toLowerCase();
    return galleryPhotos.filter(
      (photo) =>
        String(photo.title || "").toLowerCase().includes(term) ||
        String(photo.description || "").toLowerCase().includes(term) ||
        String(photo.tags || "").toLowerCase().includes(term) ||
        String(photo.uploadedBy || "").toLowerCase().includes(term) ||
        getEventName(String(photo.eventId)).toLowerCase().includes(term)
    );
  }, [galleryPhotos, searchTerm]);

  useEffect(() => setCurrentPage(1), [searchTerm]);

  const totalPages = Math.ceil(filteredPhotos.length / photosPerPage);
  const startIdx = (currentPage - 1) * photosPerPage;
  const currentPhotos = filteredPhotos.slice(startIdx, startIdx + photosPerPage);

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
        uploadedBy: user!.email || "",
        timestamp: new Date().toISOString(),
      };
      if (editingPhoto) submissionData.photoId = editingPhoto.id;

      const response = await fetch(ADMIN_SCRIPTS.gallery, {
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
      const response = await fetch(ADMIN_SCRIPTS.gallery, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ action: "deleteFromGallery", photoId, deletedBy: user!.email || "" }),
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

  if (!user) return <GlobalLoader />;

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-4">
          <ScrollRevealText
            text="Gallery"
            className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none text-zinc-900 dark:text-white"
          />
          <p className="text-zinc-500 dark:text-zinc-400 font-medium text-sm md:text-base uppercase tracking-widest">
            Upload and manage gallery photos.
          </p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => fetchGalleryPhotos()}
            className="px-6 py-3 bg-white dark:bg-zinc-900 border border-black/5 dark:border-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest text-zinc-600 dark:text-zinc-400 hover:bg-black/5 dark:hover:bg-white/5 transition-all flex items-center gap-2"
          >
            <FaSync className={loading ? "animate-spin" : ""} /> Refresh
          </button>
          <button
            onClick={() => { resetForm(); setShowUploadModal(true); }}
            className="px-6 py-3 bg-uiupc-orange text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all flex items-center gap-2 shadow-lg shadow-uiupc-orange/20"
          >
            <FaPlus /> Add Photo
          </button>
        </div>
      </div>

      {/* Search & Stats */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
        <div className="relative flex-1">
          <FaSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400 text-sm pointer-events-none" />
          <input
            type="text"
            placeholder="Search photos by title, event, uploader..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full py-4 pl-12 pr-5 bg-white dark:bg-[#080808] border border-black/5 dark:border-white/5 rounded-2xl text-sm text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 focus:outline-none focus:border-uiupc-orange focus:ring-2 focus:ring-uiupc-orange/10 transition-all"
          />
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
            {filteredPhotos.length} photo{filteredPhotos.length !== 1 ? "s" : ""}
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
          <GlobalLoader />
        ) : error ? (
          <div className="text-center py-16 space-y-4">
            <p className="text-sm text-red-500">{error}</p>
            <button onClick={() => fetchGalleryPhotos()} className="px-6 py-3 rounded-xl bg-uiupc-orange/10 text-uiupc-orange text-[10px] font-black uppercase tracking-widest hover:bg-uiupc-orange hover:text-white transition-all">
              Try Again
            </button>
          </div>
        ) : filteredPhotos.length === 0 ? (
          <div className="text-center py-16 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto text-2xl text-zinc-300 dark:text-zinc-600">
              <FaImages />
            </div>
            <p className="text-sm font-bold text-zinc-500 dark:text-zinc-400">
              {galleryPhotos.length === 0 ? "No photos in the gallery yet. Add your first one!" : "No photos match your search."}
            </p>
          </div>
        ) : (
          <>
            <GalleryList
              photos={currentPhotos}
              userEmail={user.email || ""}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 mt-8 border-t border-black/5 dark:border-white/5">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                  Page {currentPage} of {totalPages} · Showing {startIdx + 1}–{Math.min(startIdx + photosPerPage, filteredPhotos.length)} of {filteredPhotos.length}
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

      {/* Modal */}
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
  );
};

export default GalleryAdminPage;
