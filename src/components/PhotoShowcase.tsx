// components/PhotoShowcase.tsx
"use client";

import React from 'react';
import Link from 'next/link';

interface Photo {
  id: string | number;
  url: string;
  title: string;
  photographerName: string;
}

interface PhotoShowcaseProps {
  photos?: Photo[];
}

const PhotoShowcase: React.FC<PhotoShowcaseProps> = ({ photos = [] }) => {
  const featuredPhotos = photos.slice(0, 6);

  return (
    <section className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black text-black uppercase tracking-tighter mb-4">
            Featured Photos
          </h2>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">A glimpse of our members' amazing work</p>
          <div className="w-24 h-1 bg-uiupc-orange mx-auto mt-6"></div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 mb-16">
          {featuredPhotos.map(photo => (
            <div 
              key={photo.id} 
              className="group relative aspect-[4/3] bg-gray-100 overflow-hidden border border-black/10 transition-all duration-300 hover:border-uiupc-orange shadow-sm hover:shadow-xl"
            >
              <img 
                src={photo.url} 
                alt={photo.title} 
                loading="lazy" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://res.cloudinary.com/do0e8p5d2/image/upload/v1763054814/uiupc_HeroSlider1_d9kprm.jpg';
                }}
              />
              <div className="absolute inset-0 bg-black/60 flex flex-col justify-end p-6 translate-y-full transition-transform duration-500 group-hover:translate-y-0 backdrop-blur-sm">
                <h4 className="text-white text-xl font-black uppercase tracking-tight mb-1">
                  {photo.title}
                </h4>
                <p className="text-uiupc-orange text-sm font-black uppercase tracking-widest">
                  By {photo.photographerName}
                </p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center">
          <Link 
            href="/gallery" 
            className="inline-flex px-10 py-5 bg-uiupc-orange text-white font-black uppercase tracking-widest border-2 border-uiupc-orange transition-all hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[8px_8px_0_rgba(0,0,0,0.15)] active:translate-x-0 active:translate-y-0"
          >
            View Full Gallery
          </Link>
        </div>
      </div>
    </section>
  );
};

export default PhotoShowcase;
