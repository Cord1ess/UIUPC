import React from 'react';

const EventsSkeleton = () => {
  return (
    <div className="animate-pulse space-y-12 py-32 md:py-24 px-6">
      <div className="max-w-7xl mx-auto space-y-20">
        
        {/* Zone 0: Map Skeleton */}
        <div className="w-full h-[75vh] md:h-[600px] bg-zinc-100 dark:bg-zinc-900/80 rounded-3xl border border-black/5 dark:border-white/5 relative overflow-hidden">
           <div className="absolute inset-0 bg-gradient-to-br from-uiupc-orange/5 to-transparent opacity-30" />
        </div>

        {/* Zone 1: Upcoming Events Skeleton */}
        <div className="flex flex-col md:flex-row items-center gap-12 md:gap-20">
          <div className="w-full md:w-[600px] aspect-square bg-zinc-100 dark:bg-zinc-900/80 rounded-2xl border border-black/5 dark:border-white/5" />
          <div className="flex-1 space-y-6">
            <div className="h-12 w-3/4 bg-zinc-100 dark:bg-zinc-900/80 rounded-lg" />
            <div className="flex gap-4">
              <div className="h-4 w-24 bg-zinc-100 dark:bg-zinc-900/80 rounded-md" />
              <div className="h-4 w-32 bg-zinc-100 dark:bg-zinc-900/80 rounded-md" />
            </div>
            <div className="h-24 w-full bg-zinc-100 dark:bg-zinc-900/80 rounded-xl" />
            <div className="h-14 w-48 bg-zinc-100 dark:bg-zinc-900/80 rounded-xl" />
          </div>
        </div>

        {/* Zone 2: Concluded Skeleton */}
        <div className="space-y-10">
          <div className="flex justify-between items-end">
            <div className="h-12 w-1/2 bg-zinc-100 dark:bg-zinc-900/80 rounded-lg" />
            <div className="h-6 w-32 bg-zinc-100 dark:bg-zinc-900/80 rounded-md" />
          </div>
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="w-full lg:w-[600px] aspect-square bg-zinc-100 dark:bg-zinc-900/80 rounded-2xl" />
            <div className="flex-1 space-y-6">
              <div className="h-16 w-full bg-zinc-100 dark:bg-zinc-900/80 rounded-lg" />
              <div className="h-20 w-3/4 bg-zinc-100 dark:bg-zinc-900/80 rounded-lg" />
              <div className="flex gap-4">
                <div className="h-14 w-40 bg-zinc-100 dark:bg-zinc-900/80 rounded-xl" />
                <div className="h-14 w-40 bg-zinc-100 dark:bg-zinc-900/80 rounded-xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Zone 3: The Vault Grid Skeleton */}
        <div className="space-y-10">
           <div className="h-16 w-48 bg-zinc-100 dark:bg-zinc-900/80 rounded-lg mx-auto" />
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
             {[1, 2, 3].map((i) => (
               <div key={i} className="flex flex-col gap-6">
                 <div className="aspect-square bg-zinc-100 dark:bg-zinc-900/80 rounded-2xl" />
                 <div className="h-8 w-3/4 bg-zinc-100 dark:bg-zinc-900/80 rounded-lg" />
                 <div className="h-4 w-1/2 bg-zinc-100 dark:bg-zinc-900/80 rounded-md" />
                 <div className="h-12 w-full bg-zinc-100 dark:bg-zinc-900/80 rounded-xl mt-auto" />
               </div>
             ))}
           </div>
        </div>

      </div>
    </div>
  );
};

export default EventsSkeleton;
