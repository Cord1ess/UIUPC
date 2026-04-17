import React from 'react';

const EventsLoading = () => {
  return (
    <div className="min-h-screen bg-[#f9f5ea] dark:bg-[#121212] pt-32 pb-20 px-6">
      <div className="max-w-7xl mx-auto space-y-24">
        
        {/* Interactive Map Section Skeleton */}
        <div className="w-full h-[320px] md:h-[450px] bg-white dark:bg-zinc-900 rounded-3xl border border-black/5 dark:border-white/5 animate-pulse relative overflow-hidden flex flex-col items-center justify-center gap-6">
           <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800" />
           <div className="w-64 h-8 bg-zinc-100 dark:bg-zinc-800 rounded-xl" />
           <div className="w-48 h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full" />
        </div>

        {/* Feature Spotlight Section Skeleton */}
        <div className="flex flex-col md:flex-row items-center gap-16 md:gap-24">
           {/* Big Image Spot */}
           <div className="w-full md:w-[600px] aspect-square bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-black/5 dark:border-white/5 p-4 animate-pulse">
              <div className="w-full h-full bg-zinc-200 dark:bg-zinc-800 rounded-2xl" />
           </div>

           {/* Content Spot */}
           <div className="flex-1 space-y-10">
              <div className="space-y-4">
                 <div className="w-32 h-2 bg-uiupc-orange/20 rounded-full" />
                 <div className="w-[90%] h-12 md:h-16 bg-zinc-200 dark:bg-zinc-800 rounded-2xl" />
                 <div className="w-[60%] h-12 md:h-16 bg-zinc-200 dark:bg-zinc-800 rounded-2xl" />
              </div>
              
              <div className="flex gap-4">
                 <div className="w-32 h-6 bg-zinc-100 dark:bg-zinc-900 rounded-lg" />
                 <div className="w-32 h-6 bg-zinc-100 dark:bg-zinc-900 rounded-lg" />
              </div>

              <div className="w-64 h-32 bg-zinc-100 dark:bg-zinc-900 rounded-2xl" />

              <div className="w-56 h-16 bg-zinc-900 dark:bg-zinc-100 rounded-xl opacity-20" />
           </div>
        </div>

        {/* The Vault Grid Skeleton */}
        <div className="space-y-16">
           <div className="w-48 h-12 bg-zinc-200 dark:bg-zinc-800 rounded-xl animate-pulse mx-auto md:mx-0" />
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex flex-col bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-black/5 dark:border-white/5 overflow-hidden animate-pulse">
                   <div className="aspect-square bg-zinc-200 dark:bg-zinc-800" />
                   <div className="p-10 space-y-6">
                      <div className="w-full h-8 bg-zinc-100 dark:bg-zinc-800 rounded-xl" />
                      <div className="space-y-2">
                        <div className="w-2/3 h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full" />
                        <div className="w-1/2 h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full" />
                      </div>
                   </div>
                </div>
              ))}
           </div>
        </div>

      </div>
    </div>
  );
};

export default EventsLoading;
