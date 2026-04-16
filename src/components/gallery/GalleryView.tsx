"use client";

import React, { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Photo } from '@/hooks/useFirebaseData';
import { getCloudinaryUrl } from '@/components/hero/utils/constants';
import ImagePreviewModal from '@/components/hero/ImagePreviewModal';
import { FaFilter, FaExpandAlt, FaFacebook, FaThLarge, FaColumns, FaSearch, FaChevronDown } from 'react-icons/fa';

interface GalleryViewProps {
  initialPhotos: Photo[];
}

const CATEGORIES = [
  { id: 'all', name: 'All Photos' },
  { id: '1', name: 'Friday Exposure' },
  { id: '2', name: 'Photo Adda' },
  { id: '3', name: 'Photo Walk' },
  { id: '4', name: 'Exhibitions Visit' },
  { id: '5', name: 'Workshops & Talks' },
  { id: '6', name: 'Shutter Stories' },
];

const ITEMS_PER_PAGE = 12;

const GalleryView: React.FC<GalleryViewProps> = ({ initialPhotos }) => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [layoutMode, setLayoutMode] = useState<'square' | 'masonry'>('square');
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  const [isPaused, setIsPaused] = useState(true);

  // Sync visible count when filters change
  useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE);
  }, [activeFilter, searchQuery]);

  const filteredPhotos = useMemo(() => {
    let result = initialPhotos;
    
    // Category Filter
    if (activeFilter !== 'all') {
      result = result.filter(p => p.eventId === activeFilter);
    }
    
    // Search Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => 
        (p.title?.toLowerCase().includes(q)) || 
        (p.description?.toLowerCase().includes(q))
      );
    }
    
    return result;
  }, [activeFilter, searchQuery, initialPhotos]);

  const sortedPhotos = useMemo(() => {
    return [...filteredPhotos].sort((a, b) => {
      const idA = parseInt(a.id) || 0;
      const idB = parseInt(b.id) || 0;
      return idB - idA;
    });
  }, [filteredPhotos]);

  const visiblePhotos = useMemo(() => {
    return sortedPhotos.slice(0, visibleCount);
  }, [sortedPhotos, visibleCount]);

  const handleOpenModal = (index: number) => {
    setSelectedPhotoIndex(index);
  };

  const handleCloseModal = () => {
    setSelectedPhotoIndex(null);
  };

  const nextImage = () => {
    setSelectedPhotoIndex(prev => prev !== null ? (prev + 1) % sortedPhotos.length : null);
  };

  const prevImage = () => {
    setSelectedPhotoIndex(prev => prev !== null ? (prev - 1 + sortedPhotos.length) % sortedPhotos.length : null);
  };

  const loadMore = () => {
    setVisibleCount(prev => prev + ITEMS_PER_PAGE);
  };

  const getCategoryName = (id: string) => {
    return CATEGORIES.find(c => c.id === id)?.name || 'Photography';
  };

  return (
    <div className="w-full">
      {/* Featured Controls (Search & Layout) */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8 px-4">
        {/* Search */}
        <div className="relative w-full md:w-80 group">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-uiupc-orange transition-colors" />
          <input 
            type="text"
            placeholder="Search moments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-zinc-900 border border-black/5 dark:border-white/5 rounded-xl text-xs font-bold uppercase tracking-widest focus:outline-none focus:border-uiupc-orange/50 transition-all shadow-sm"
          />
        </div>

        {/* Layout Switcher */}
        <div className="flex items-center bg-white dark:bg-zinc-900 p-1.5 rounded-xl border border-black/5 dark:border-white/5 shadow-sm">
          <button 
            onClick={() => setLayoutMode('square')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${layoutMode === 'square' ? 'bg-[#f9f5ea] dark:bg-zinc-800 text-uiupc-orange' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300'}`}
          >
            <FaThLarge className="text-xs" />
            <span className="text-[9px] font-black uppercase tracking-widest">Square</span>
          </button>
          <button 
            onClick={() => setLayoutMode('masonry')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${layoutMode === 'masonry' ? 'bg-[#f9f5ea] dark:bg-zinc-800 text-uiupc-orange' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300'}`}
          >
            <FaColumns className="text-xs" />
            <span className="text-[9px] font-black uppercase tracking-widest">Masonry</span>
          </button>
        </div>
      </div>

      {/* Category Navigation (Sticky - Single Line) */}
      <div className="sticky top-24 z-40 mb-16 p-2 bg-[#f9f5ea]/80 dark:bg-[#121212]/80 backdrop-blur-xl rounded-full border border-black/5 dark:border-white/5 shadow-md max-w-7xl mx-auto">
        <div className="flex items-center justify-center gap-1 md:gap-6 py-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveFilter(cat.id)}
              className={`whitespace-nowrap px-6 py-2.5 text-[9px] font-black uppercase tracking-[0.2em] rounded-full transition-all ${
                activeFilter === cat.id
                  ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-lg'
                  : 'bg-transparent text-zinc-500 hover:text-uiupc-orange'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className={`transition-all duration-500 ${layoutMode === 'masonry' ? 'columns-2 md:columns-3 lg:columns-4 gap-6' : 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8'}`}>
        <AnimatePresence mode="popLayout">
          {visiblePhotos.map((photo, index) => (
            <motion.div
              layout
              key={photo.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
              className={`group relative overflow-hidden rounded-2xl cursor-pointer mb-6 ${layoutMode === 'square' ? 'aspect-square mb-0' : 'break-inside-avoid shadow-lg'}`}
              onClick={() => handleOpenModal(index)}
            >
              <Image 
                src={getCloudinaryUrl(photo.url, 800, 'auto:best')}
                alt={photo.title || 'Gallery image'}
                width={800}
                height={layoutMode === 'square' ? 800 : (photo.isHorizontal ? 600 : 1000)}
                className={`w-full h-auto object-cover transition-transform duration-700 group-hover:scale-110 ${layoutMode === 'square' ? 'h-full' : ''}`}
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              />
              
              {/* Overlay Metadata */}
              <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">
                <span className="inline-block px-3 py-1 bg-uiupc-orange/80 backdrop-blur-md rounded-full text-[8px] font-black uppercase tracking-widest text-white mb-3">
                  {getCategoryName(photo.eventId)}
                </span>
                <h4 className="text-white text-xs font-black uppercase tracking-widest leading-tight">
                  {photo.title || 'Perspective'}
                </h4>
              </div>

              {/* Expand Icon Control */}
              <div className="absolute top-4 right-4 w-10 h-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-[-10px] group-hover:translate-y-0">
                <FaExpandAlt className="text-xs" />
              </div>

              {/* Facebook Link (if exists) */}
              {photo.facebookPost && (
                <a 
                  href={photo.facebookPost}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="absolute top-4 left-4 w-10 h-10 bg-black/20 backdrop-blur-md border border-white/10 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-uiupc-orange"
                >
                  <FaFacebook className="text-sm" />
                </a>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {sortedPhotos.length === 0 && (
        <div className="py-32 text-center">
          <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-6">
            <FaFilter className="text-zinc-400" />
          </div>
          <h3 className="text-2xl font-black text-zinc-900 dark:text-white uppercase tracking-tighter mb-2">No Moments Found</h3>
          <p className="text-zinc-500 dark:text-zinc-400 text-[10px] font-black uppercase tracking-widest">Adjust your search or category filters.</p>
        </div>
      )}

      {/* Load More Button */}
      {visiblePhotos.length < sortedPhotos.length && (
        <div className="mt-20 flex flex-col items-center">
            <div className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 mb-8 mb-6">
                Viewing {visiblePhotos.length} of {sortedPhotos.length}
            </div>
          <button 
            onClick={loadMore}
            className="group flex flex-col items-center gap-4 transition-all active:scale-95"
          >
            <div className="w-16 h-16 bg-white dark:bg-zinc-900 rounded-full flex items-center justify-center border border-black/5 dark:border-white/5 shadow-xl group-hover:border-uiupc-orange transition-all">
               <FaChevronDown className="text-zinc-400 group-hover:text-uiupc-orange transition-colors group-hover:animate-bounce" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 group-hover:text-uiupc-orange">Explore More moments</span>
          </button>
        </div>
      )}

      {/* Lightbox Modal */}
      <ImagePreviewModal 
        image={selectedPhotoIndex !== null ? { 
          id: parseInt(sortedPhotos[selectedPhotoIndex].id) || 0, 
          url: sortedPhotos[selectedPhotoIndex].url,
          title: sortedPhotos[selectedPhotoIndex].title || '',
          photographer: 'UIUPC',
          isHorizontal: sortedPhotos[selectedPhotoIndex].isHorizontal || false,
          facebookPost: sortedPhotos[selectedPhotoIndex].facebookPost
        } as any : null}
        nextImageUrl={selectedPhotoIndex !== null && selectedPhotoIndex < sortedPhotos.length - 1 ? getCloudinaryUrl(sortedPhotos[selectedPhotoIndex + 1].url, 1600, 'auto:best') : undefined}
        prevImageUrl={selectedPhotoIndex !== null && selectedPhotoIndex > 0 ? getCloudinaryUrl(sortedPhotos[selectedPhotoIndex - 1].url, 1600, 'auto:best') : undefined}
        isOpen={selectedPhotoIndex !== null}
        onClose={handleCloseModal}
        onNext={nextImage}
        onPrev={prevImage}
        isPaused={isPaused}
        onTogglePause={() => setIsPaused(!isPaused)}
        originRect={null}
      />
    </div>
  );
};

export default GalleryView;
