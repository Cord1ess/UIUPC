import React from 'react';
import GalleryView from '@/features/discovery/components/GalleryView';
import ScrollRevealText from '@/components/motion/ScrollRevealText';
import ModernHero from '@/features/home/components/hero/ModernHero';

export const metadata = {
  title: 'Gallery | UIUPC',
  description: 'Explore the visual legacy of United International University Photography Club.',
};

const GalleryPage = () => {
  return (
    <main className="min-h-screen bg-[#f9f5ea] dark:bg-[#0a0a0a] transition-colors duration-500 overflow-x-hidden">
      {/* Dynamic Hero Section */}
      <ModernHero />

      <div className="max-w-7xl mx-auto px-6 py-20 relative z-20">
        {/* Gallery Content Title (Tightened Gap) */}
        <div className="flex flex-col items-center text-center mb-16">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-[1px] w-8 bg-uiupc-orange" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">The Visual Archive</span>
            <div className="h-[1px] w-8 bg-uiupc-orange" />
          </div>
          
          <ScrollRevealText 
            text="Exhibition Gallery"
            as="h2"
            className="text-6xl md:text-8xl font-black text-zinc-900 dark:text-white mb-6 uppercase tracking-tighter leading-none"
          />
          <p className="max-w-xl text-zinc-600 dark:text-zinc-400 text-sm md:text-base font-medium leading-relaxed">
            Every frame tells a story. Journey through the chapters of UIU Photography Club 
            and witness the art of capturing light.
          </p>
        </div>

        {/* Gallery View (Client Component — manages its own data) */}
        <GalleryView />
      </div>
    </main>
  );
};

export default GalleryPage;
