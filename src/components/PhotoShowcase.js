// components/PhotoShowcase.js
"use client";

import React from 'react';
import Link from 'next/link';
import './PhotoShowcase.css';

const PhotoShowcase = ({ photos = [] }) => {
  const featuredPhotos = photos.slice(0, 6);

  return (
    <section className="showcase-section">
      <div className="container">
        <div className="section-header">
          <h2>Featured Photos</h2>
          <p>A glimpse of our members' amazing work</p>
        </div>
        
        <div className="showcase-grid">
          {featuredPhotos.map(photo => (
            <div key={photo.id} className="showcase-item">
              <img 
                src={photo.url} 
                alt={photo.title} 
                loading="lazy" 
                onError={(e) => {
                  e.target.src = 'https://res.cloudinary.com/do0e8p5d2/image/upload/v1762121162/uiupc_HeroSlider3_wrpuvz.jpg';
                }}
              />
              <div className="showcase-overlay">
                <h4>{photo.title}</h4>
                <p>By {photo.photographerName}</p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="showcase-actions">
          <Link href="/gallery" className="btn-primary">View Full Gallery</Link>
        </div>
      </div>
    </section>
  );
};

export default PhotoShowcase;
