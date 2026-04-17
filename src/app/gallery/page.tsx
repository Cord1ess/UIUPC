import React, { Suspense } from 'react';
import { fetchGalleryPhotos } from '@/lib/fetchers';
import GalleryView from '@/components/gallery/GalleryView';
import ScrollRevealText from '@/components/home/ScrollRevealText';

export const metadata = {
  title: 'Gallery | UIUPC',
  description: 'Explore the visual legacy of United International University Photography Club.',
};

const GalleryPage = () => {
  return (
    <main className="min-h-screen bg-[#f9f5ea] dark:bg-[#121212] transition-colors duration-500 pt-32 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section (Tightened Gap) */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-[1px] w-8 bg-uiupc-orange" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">The Visual Archive</span>
            <div className="h-[1px] w-8 bg-uiupc-orange" />
          </div>
          
          <ScrollRevealText 
            text="Photo Gallery"
            as="h1"
            className="text-6xl md:text-8xl font-black text-zinc-900 dark:text-white mb-6 uppercase tracking-tighter leading-none"
          />
          <p className="max-w-xl text-zinc-600 dark:text-zinc-400 text-sm md:text-base font-medium leading-relaxed">
            Every frame tells a story. Journey through the chapters of UIU Photography Club 
            and witness the art of capturing light.
          </p>
        </div>

        {/* Gallery View (Client Layer with Streaming) */}
        <Suspense fallback={
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="aspect-square bg-zinc-200 dark:bg-zinc-800 rounded-2xl" />
            ))}
          </div>
        }>
          <GalleryContent />
        </Suspense>
      </div>
    </main>
  );
};

const GalleryContent = async () => {
  const photos = await fetchGalleryPhotos();
  return <GalleryView initialPhotos={photos} />;
};

export default GalleryPage;
