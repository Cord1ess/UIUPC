"use client";
import React from 'react';
import './PhotoGrid.css';

interface Photo {
  id: string | number;
  url: string;
  title?: string;
  facebookPost?: string;
}

interface PhotoGridProps {
  photos: Photo[];
  onPhotoClick: (photo: Photo) => void;
}

const PhotoGrid: React.FC<PhotoGridProps> = ({ photos, onPhotoClick }) => {
  if (photos.length === 0) {
    return (
      <div className="no-photos">
        <p>No photos found. Check back later!</p>
      </div>
    );
  }

  const handleFacebookClick = (e: React.MouseEvent, photo: Photo) => {
    e.stopPropagation();
    if (photo.facebookPost) {
      window.open(photo.facebookPost, '_blank', 'noopener,noreferrer');
    }
  };

  const handleImgError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    (e.target as HTMLImageElement).src = 'https://res.cloudinary.com/do0e8p5d2/image/upload/v1763054814/uiupc_HeroSlider1_d9kprm.jpg';
  };

  return (
    <div className="photo-grid">
      {photos.map(photo => (
        <div 
          key={photo.id} 
          className="photo-item"
          onClick={() => onPhotoClick(photo)}
        >
          <img 
            src={photo.url} 
            alt={photo.title || 'Photo'} 
            loading="lazy" 
            onError={handleImgError}
          />

          <div className="photo-overlay">
            <div className="photo-info">
              <h3>{photo.title || 'Untitled'}</h3>
              {photo.facebookPost && (
                <div 
                  className="facebook-text-link"
                  onClick={(e) => handleFacebookClick(e, photo)}
                >
                  <svg viewBox="0 0 24 24" width="14" height="14">
                    <path fill="white" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  <span>View Facebook Post</span>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PhotoGrid;
