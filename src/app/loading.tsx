import React from 'react';

const HomepageLoading = () => {
  return (
    <div className="min-h-screen bg-[#f9f5ea] dark:bg-[#121212] overflow-hidden">
      {/* ── ZONE 0: HERO SKELETON ────────────────────────── */}
      <section className="relative w-full h-screen flex items-center justify-center pt-20 px-6">
        {/* Abstract Grid Decor (Same as DynamicGrid for continuity) */}
        <div className="absolute inset-0 opacity-10 dark:opacity-20 pointer-events-none bg-grid-giant" />
        
        <div className="max-w-7xl w-full flex flex-col md:flex-row items-center gap-16 md:gap-24 relative z-10">
          {/* Left Text Block skeleton */}
          <div className="flex-1 space-y-10">
            <div className="space-y-4">
              {/* Overline */}
              <div className="w-48 h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full animate-pulse" />
              {/* Title Lines */}
              <div className="space-y-3">
                <div className="w-[90%] h-16 md:h-20 bg-zinc-200 dark:bg-zinc-800 rounded-2xl animate-pulse" />
                <div className="w-[70%] h-16 md:h-20 bg-zinc-200 dark:bg-zinc-800 rounded-2xl animate-pulse delay-75" />
              </div>
            </div>

            {/* Subtext */}
            <div className="space-y-2">
              <div className="w-full h-4 bg-zinc-200 dark:bg-zinc-800 rounded-lg animate-pulse delay-100" />
              <div className="w-[85%] h-4 bg-zinc-200 dark:bg-zinc-800 rounded-lg animate-pulse delay-150" />
            </div>

            {/* Buttons */}
            <div className="flex flex-wrap gap-4 pt-4">
              <div className="w-44 h-14 bg-uiupc-orange/20 rounded-xl animate-pulse" />
              <div className="w-44 h-14 bg-zinc-200 dark:bg-zinc-800 rounded-xl animate-pulse delay-200" />
            </div>
          </div>

          {/* Right Image Block skeleton */}
          <div className="w-full md:w-[600px] aspect-[4/5] bg-zinc-200 dark:bg-zinc-800 rounded-[2.5rem] animate-pulse relative">
            <div className="absolute top-8 right-8 w-24 h-24 rounded-full border-4 border-uiupc-orange/30 animate-spin-slow opacity-20" />
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-6 h-10 border-2 border-zinc-200 dark:border-zinc-800 rounded-full flex justify-center p-1">
          <div className="w-1 h-2 bg-uiupc-orange rounded-full animate-bounce" />
        </div>
      </section>

      {/* ── ZONE 1: STATISTICS PULSE ────────────────────── */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between gap-12">
           {[1, 2, 3, 4].map((i) => (
             <div key={i} className="flex flex-col items-center gap-4">
               <div className="w-24 h-12 bg-zinc-200 dark:bg-zinc-800 rounded-xl animate-pulse" />
               <div className="w-20 h-2 bg-zinc-100 dark:bg-zinc-900 rounded-full animate-pulse" />
             </div>
           ))}
        </div>
      </section>
    </div>
  );
};

export default HomepageLoading;
