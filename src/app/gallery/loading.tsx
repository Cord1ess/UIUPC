import React from 'react';

const GalleryLoading = () => {
  return (
    <div className="min-h-screen bg-[#f9f5ea] dark:bg-[#121212] pt-32 px-6 pb-20">
      <div className="max-w-7xl mx-auto space-y-16">
        {/* Title Center */}
        <div className="flex flex-col items-center gap-6 mb-20">
           <div className="w-64 h-16 md:h-20 bg-zinc-200 dark:bg-zinc-800 rounded-3xl animate-pulse" />
           <div className="w-[80%] md:w-[400px] h-3 bg-zinc-100 dark:bg-zinc-900 rounded-full animate-pulse" />
        </div>

        {/* Masonry Skeleton Grid */}
        <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
           {[...Array(9)].map((_, i) => (
             <div 
               key={i} 
               className="break-inside-avoid bg-white dark:bg-zinc-900 border border-black/5 dark:border-white/5 rounded-[2.5rem] overflow-hidden"
               style={{ height: `${[300, 450, 380, 520, 290, 410, 360, 480, 330][i % 9]}px` }}
             >
                <div className="w-full h-full bg-zinc-200 dark:bg-zinc-800 animate-pulse relative">
                   {/* Abstract Detail pulse inside card */}
                   <div className="absolute bottom-10 left-10 space-y-3 w-2/3">
                      <div className="w-full h-3 bg-zinc-300 dark:bg-zinc-700 rounded-full" />
                      <div className="w-1/2 h-2 bg-zinc-300 dark:bg-zinc-700 rounded-full opacity-50" />
                   </div>
                </div>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
};

export default GalleryLoading;
