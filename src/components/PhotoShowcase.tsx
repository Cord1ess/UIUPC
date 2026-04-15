// components/PhotoShowcase.tsx
"use client";

import React from 'react';
import Link from 'next/link';
import { useTheme } from '@/contexts/ThemeContext';

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
  const defaultPhotos: Photo[] = [
    {
      id: 1,
      url: "https://res.cloudinary.com/do0e8p5d2/image/upload/v1772526242/Artboard_1-100_u1jtvp.jpg",
      title: "Campus Life",
      photographerName: "UIUPC Studio"
    },
    {
      id: 2,
      url: "https://res.cloudinary.com/do0e8p5d2/image/upload/v1772527923/Post_air114.jpg",
      title: "Event Coverage",
      photographerName: "Team UIUPC"
    },
    {
      id: 3,
      url: "https://res.cloudinary.com/do0e8p5d2/image/upload/v1762799836/Blog5_lbkrue.png",
      title: "Artistic Frames",
      photographerName: "Member Showcase"
    },
    {
      id: 4,
      url: "https://res.cloudinary.com/do0e8p5d2/image/upload/v1763054814/uiupc_HeroSlider1_d9kprm.jpg",
      title: "Annual Exhibition",
      photographerName: "Gallery Dept"
    },
    {
      id: 5,
      url: "https://images.unsplash.com/photo-1551818255-e6e10975bc17?auto=format&fit=crop&w=800&q=80",
      title: "Workshop Moments",
      photographerName: "Training Team"
    },
    {
      id: 6,
      url: "https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=800&q=80",
      title: "Street Photography",
      photographerName: "Photo Walk"
    }
  ];

  const featuredPhotos = photos.length > 0 ? photos : defaultPhotos;
  const { theme } = useTheme();

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
        {featuredPhotos.map(photo => (
          <div 
            key={photo.id} 
            className={`group relative aspect-[4/3] ${theme === 'dark' ? 'bg-zinc-800' : 'bg-gray-100'} overflow-hidden shadow-m3-1 dark:shadow-none hover:shadow-m3-3 dark:hover:shadow-uiupc-orange/10 rounded-slight transition-all duration-300 hover:shadow-m3-3 hover:-translate-y-1 border border-black/[0.03] dark:border-white/[0.05]`}
          >
            <img 
              src={photo.url} 
              alt={photo.title} 
              loading="lazy" 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://res.cloudinary.com/do0e8p5d2/image/upload/v1763054814/uiupc_HeroSlider1_d9kprm.jpg';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8 translate-y-8 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100 backdrop-blur-[2px]">
              <h4 className="text-white text-xl font-black uppercase tracking-tight mb-2">
                {photo.title}
              </h4>
              <div className="flex items-center gap-3">
                 <div className="w-6 h-[1px] bg-uiupc-orange" />
                 <p className="text-uiupc-orange text-[10px] font-black uppercase tracking-[0.2em]">
                  {photo.photographerName}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="text-center">
        <Link 
          href="/gallery" 
          className="inline-flex px-12 py-4 bg-black dark:bg-zinc-800 text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-full shadow-md hover:shadow-xl transition-all hover:bg-zinc-800 dark:hover:bg-zinc-700 hover:-translate-y-0.5"
        >
          View Full Gallery
        </Link>
      </div>
    </div>
  );
};

export default PhotoShowcase;
