// components/Lightbox.js
import React from 'react';
import './Lightbox.css';

const Lightbox = ({ photo, onClose }) => {
  if (!photo) return null;

  const formatUploadDate = (uploadedAt) => {
    if (!uploadedAt) return 'Unknown date';
    
    try {
      const date = new Date(uploadedAt);
      return date.toLocaleDateString();
    } catch (error) {
      return 'Invalid date';
    }
  };

  const handleFacebookClick = (e) => {
    e.stopPropagation();
    if (photo.facebookPost) {
      window.open(photo.facebookPost, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="lightbox-overlay" onClick={onClose}>
      <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
        <button className="lightbox-close" onClick={onClose}>×</button>
        <div className="lightbox-image">
          <img src={photo.url} alt={photo.title} />
        </div>
        <div className="lightbox-info">
          <h3>{photo.title || 'Untitled'}</h3>
          {photo.description && (
            <p className="description">{photo.description}</p>
          )}
          <div className="photo-meta">
            <span className="upload-date">
              Uploaded: {formatUploadDate(photo.uploadedAt)}
            </span>
          </div>
          
          {/* Facebook link in lightbox */}
          {photo.facebookPost && (
            <div className="facebook-link-container">
              <button 
                className="facebook-link-btn"
                onClick={handleFacebookClick}
              >
                <svg viewBox="0 0 24 24" width="16" height="16">
                  <path fill="white" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                View Facebook Post
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Lightbox;