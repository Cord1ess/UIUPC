"use client";

import React from "react";
import Image from "next/image";
import { FaImages, FaCalendar, FaUser, FaEye, FaEdit, FaTrash } from "react-icons/fa";

interface GalleryPhoto {
  id: string;
  title: string;
  description: string;
  eventId: string;
  facebookPost?: string;
  url?: string;
  imageUrl?: string;
  uploadedBy?: string;
  uploadedAt?: string;
  timestamp?: string;
}

interface GalleryListProps {
  photos: GalleryPhoto[];
  userEmail: string;
  onEdit: (photo: GalleryPhoto) => void;
  onDelete: (id: string) => void;
}

const GalleryList: React.FC<GalleryListProps> = ({
  photos,
  userEmail,
  onEdit,
  onDelete,
}) => {
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

  const truncateDescription = (description: string, maxLength = 100) => {
    if (!description) return "No description";
    if (description.length <= maxLength) return description;
    return description.substring(0, maxLength) + "...";
  };

  return (
    <div className="gallery-photos-container">
      <div className="gallery-photos-grid">
        {photos.map((photo) => (
          <div key={photo.id} className="gallery-photo-card">
            <div className="photo-preview" style={{ position: "relative", width: "100%", height: "200px" }}>
              <Image
                src={photo.url || photo.imageUrl || ""}
                alt={photo.title}
                fill
                style={{ objectFit: 'cover' }}
                unoptimized={true}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = "none";
                  if (target.nextSibling) {
                    (target.nextSibling as HTMLElement).style.display = "flex";
                  }
                }}
              />
              <div className="image-error" style={{ display: 'none' }}>
                <FaImages size={24} />
                <span>Image not available</span>
              </div>
            </div>

            <div className="photo-content">
              <h3 className="photo-title">{photo.title}</h3>
              <p className="photo-description">
                {truncateDescription(photo.description)}
              </p>

              <div className="photo-meta">
                <span className="photo-event">
                  <FaCalendar /> {getEventName(photo.eventId)}
                </span>
                <span className="photo-date">
                  {new Date(photo.uploadedAt || photo.timestamp || Date.now()).toLocaleDateString()}
                </span>
              </div>

              <div className="photo-footer">
                <span className="photo-author">
                  <FaUser /> by {photo.uploadedBy || userEmail}
                </span>
                <span className="photo-id">
                  ID: {photo.id}
                </span>
              </div>
            </div>

            <div className="photo-actions">
              <button
                onClick={() => window.open(photo.url || photo.imageUrl, '_blank')}
                className="btn-view"
                title="View Image"
              >
                <FaEye />
              </button>
              <button
                onClick={() => onEdit(photo)}
                className="btn-edit"
                title="Edit Photo"
              >
                <FaEdit />
              </button>
              {photo.facebookPost && (
                <button
                  onClick={() => window.open(photo.facebookPost, '_blank')}
                  className="btn-facebook"
                  title="View Facebook Post"
                >
                  FB
                </button>
              )}
              <button
                onClick={() => onDelete(photo.id)}
                className="btn-delete"
                title="Delete Photo"
              >
                <FaTrash />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default React.memo(GalleryList);
