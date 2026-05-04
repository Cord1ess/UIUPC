"use client";

import React, { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'motion/react';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { getImageUrl } from '@/utils/imageUrl';
import ImagePreviewModal from '@/features/home/components/hero/ImagePreviewModal';
import ScrollRevealText from '@/components/motion/ScrollRevealText';
import { IconFilter, IconExpandAlt, IconFacebook, IconThLarge, IconColumns, IconSearch, IconChevronDown } from '@/components/shared/Icons';

const CATEGORIES = [
  { id: 'all', name: 'All Photos' },
  { id: 'friday_exposure', name: 'Friday Exposure' },
  { id: 'photo_adda', name: 'Photo Adda' },
  { id: 'photo_walk', name: 'Photo Walk' },
  { id: 'exhibition', name: 'Exhibitions' },
  { id: 'workshop', name: 'Workshops' },
];

const ITEMS_PER_PAGE = 12;

const GalleryView: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [layoutMode, setLayoutMode] = useState<'square' | 'masonry'>('square');
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  const [isPaused, setIsPaused] = useState(true);
  const [isToolVisible, setIsToolVisible] = useState(true);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  
  const { scrollY } = useScroll();

  // Fetch standard gallery photos
  const { data: galleryPhotos, isLoading: galleryLoading } = useSupabaseData('gallery');
  // Fetch exhibition archives
  const { data: exhibitionPhotos, isLoading: exhibitionLoading } = useSupabaseData('exhibition_submissions');

  const allPhotos = useMemo(() => {
    const formattedGallery = (galleryPhotos || []).map((p: any) => ({
      id: p.id,
      url: p.image_url,
      title: p.title,
      description: p.description,
      category: p.category, // e.g., 'friday_exposure'
      facebookPost: p.facebook_url,
      type: 'gallery',
      timestamp: p.created_at
    }));

    const formattedExhibition = (exhibitionPhotos || []).map((p: any) => ({
      id: p.id,
      url: p.photo_url,
      title: p.photo_title,
      description: `By ${p.photographer_name}`,
      category: 'exhibition',
      facebookPost: null,
      type: 'exhibition',
      timestamp: p.created_at
    }));

    return [...formattedGallery, ...formattedExhibition].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [galleryPhotos, exhibitionPhotos]);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() || 0;
    if (latest > previous && latest > 300) {
      setIsToolVisible(false);
    } else {
      setIsToolVisible(true);
    }
  });

  // Sync visible count when filters change
  useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE);
  }, [activeFilter, searchQuery]);

  const filteredPhotos = useMemo(() => {
    let result = allPhotos;
    
    // Remove failed images
    result = result.filter(p => !failedImages.has(p.url));

    // Category Filter
    if (activeFilter !== 'all') {
      result = result.filter(p => p.category === activeFilter);
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
  }, [activeFilter, searchQuery, allPhotos, failedImages]);

  const visiblePhotos = useMemo(() => {
    return filteredPhotos.slice(0, visibleCount);
  }, [filteredPhotos, visibleCount]);

  if (galleryLoading || exhibitionLoading) {
    return (
      <div className="py-40 flex flex-col items-center gap-6">
        <div className="w-12 h-12 border-4 border-uiupc-orange border-t-transparent rounded-full animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Loading moments...</p>
      </div>
    );
  }

  const sortedPhotos = filteredPhotos; // Alias for consistency in handlers

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

  const handleImageError = (url: string) => {
    setFailedImages(prev => new Set(prev).add(url));
  };

  const getCategoryName = (categoryId: string) => {
    return CATEGORIES.find(c => c.id === categoryId)?.name || 'Photography';
  };

  return (
    <div className="w-full">
      {/* ── UNIFIED DISCOVERY BAR (Centered & Smart Sticky) ───────────────── */}
      <section className="pb-4 flex justify-center px-2 md:px-0">
        <motion.div 
          initial={{ y: 0, opacity: 1 }}
          animate={{ 
            y: isToolVisible ? 0 : -100, 
            opacity: isToolVisible ? 1 : 0 
          }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className={`
            w-full max-w-4xl bg-white dark:bg-zinc-950 border border-black/10 dark:border-white/10 
            rounded-2xl md:rounded-[2rem] shadow-xl md:sticky md:top-24 z-50 overflow-hidden
            ${!isToolVisible && 'pointer-events-none'}
          `}
        >
          {/* Row 1: Search */}
          <div className="relative group border-b border-black/5 dark:border-white/5">
            <IconSearch size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-300 dark:text-zinc-600 transition-colors group-focus-within:text-uiupc-orange" />
            <input 
              type="text"
              placeholder="Search moments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-14 pr-6 py-4 md:py-5 bg-transparent text-[10px] md:text-sm font-black uppercase tracking-widest outline-none dark:text-white"
            />
          </div>

          {/* Row 2: Categories */}
          <div className="flex items-center bg-[#f9f5ea]/30 dark:bg-white/[0.02] px-6 py-2 border-b border-black/5 dark:border-white/5">
            <span className="shrink-0 text-[10px] font-black uppercase tracking-widest text-zinc-400 mr-4">Filters:</span>
            <div className="flex-1 flex gap-6 overflow-x-auto no-scrollbar py-1">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveFilter(cat.id)}
                  className="relative shrink-0 group py-1"
                >
                  <span className={`text-[10px] font-black uppercase tracking-[0.2em] transition-colors ${
                    activeFilter === cat.id 
                      ? 'text-uiupc-orange' 
                      : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200'
                  }`}>
                    {cat.name}
                  </span>
                  {activeFilter === cat.id && (
                    <motion.div 
                      layoutId="activeFilter"
                      className="absolute -bottom-1 left-0 right-0 h-[1px] bg-uiupc-orange rounded-full"
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Row 3: Layout Arrangement */}
          <div className="flex items-center justify-between px-6 py-2 bg-zinc-50/50 dark:bg-black/20">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Arrangement:</span>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setLayoutMode('square')}
                className={`flex items-center gap-2 px-3 md:px-4 py-1.5 rounded-xl transition-all ${layoutMode === 'square' ? 'bg-white dark:bg-zinc-800 text-uiupc-orange shadow-sm' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300'}`}
              >
                <IconThLarge size={12} />
                <span className="text-[10px] font-black uppercase tracking-widest">Square</span>
              </button>
              <button 
                onClick={() => setLayoutMode('masonry')}
                className={`flex items-center gap-2 px-3 md:px-4 py-1.5 rounded-xl transition-all ${layoutMode === 'masonry' ? 'bg-white dark:bg-zinc-800 text-uiupc-orange shadow-sm' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300'}`}
              >
                <IconColumns size={12} />
                <span className="text-[10px] font-black uppercase tracking-widest">Masonry</span>
              </button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Main Content Area (Standardized Precise Gaps) */}
      <div className={`transition-all duration-500 pb-12 ${
        layoutMode === 'masonry' 
          ? 'columns-2 md:columns-3 lg:columns-4 gap-3 md:gap-6' 
          : 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6'
      }`}>
        <AnimatePresence mode="popLayout">
          {visiblePhotos.map((photo, index) => (
            <motion.div
              layout
              key={photo.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
              className={`
                group relative overflow-hidden rounded-lg md:rounded-xl cursor-pointer
                ${layoutMode === 'square' ? 'aspect-square' : 'break-inside-avoid mb-3 md:mb-6 shadow-sm hover:shadow-xl transition-shadow'}
              `}
              onClick={() => handleOpenModal(index)}
            >
              <Image 
                src={getImageUrl(photo.url, 800, 80)}
                alt={photo.title || 'Gallery image'}
                width={800}
                height={layoutMode === 'square' ? 800 : ((photo as any).isHorizontal ? 600 : 1000)}
                className={`w-full h-auto object-cover transition-transform duration-700 group-hover:scale-110 ${layoutMode === 'square' ? 'h-full' : ''}`}
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                onError={() => handleImageError(photo.url)}
              />
              
              {/* Overlay Metadata */}
              <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">
                <span className="inline-block px-3 py-1 bg-uiupc-orange/80 backdrop-blur-md rounded-full text-[8px] font-black uppercase tracking-widest text-white mb-3">
                  {getCategoryName(photo.category)}
                </span>
                <h4 className="text-white text-xs font-black uppercase tracking-widest leading-tight">
                  {photo.title || 'Perspective'}
                </h4>
              </div>

              {/* Expand Icon Control */}
              <div className="absolute top-4 right-4 w-10 h-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-[-10px] group-hover:translate-y-0">
                <IconExpandAlt size={12} />
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
                  <IconFacebook size={14} />
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
            <IconFilter size={24} className="text-zinc-400" />
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
               <IconChevronDown size={14} className="text-zinc-400 group-hover:text-uiupc-orange transition-colors group-hover:animate-bounce" />
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
          isHorizontal: (sortedPhotos[selectedPhotoIndex] as any).isHorizontal || false,
          facebookPost: sortedPhotos[selectedPhotoIndex].facebookPost
        } as any : null}
        nextImageUrl={selectedPhotoIndex !== null && selectedPhotoIndex < sortedPhotos.length - 1 ? getImageUrl(sortedPhotos[selectedPhotoIndex + 1].url, 1600, 90) : undefined}
        prevImageUrl={selectedPhotoIndex !== null && selectedPhotoIndex > 0 ? getImageUrl(sortedPhotos[selectedPhotoIndex - 1].url, 1600, 90) : undefined}
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
