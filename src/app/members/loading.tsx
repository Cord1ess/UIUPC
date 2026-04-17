import React from 'react';

const MembersLoading = () => {
  return (
    <div className="min-h-screen bg-[#f9f5ea] dark:bg-[#121212] pt-32 pb-20 px-6">
      <div className="max-w-7xl mx-auto space-y-20">
        {/* Title Block */}
        <div className="flex flex-col items-center text-center gap-6">
           <div className="w-80 h-16 md:h-24 bg-zinc-200 dark:bg-zinc-800 rounded-3xl animate-pulse" />
           <div className="w-64 h-3 bg-zinc-100 dark:bg-zinc-900 rounded-full animate-pulse" />
        </div>

        {/* Categories Bar */}
        <div className="flex justify-center gap-4 mb-12">
           {[1, 2, 3].map((i) => (
             <div key={i} className="w-32 h-10 bg-zinc-100 dark:bg-zinc-900 rounded-lg animate-pulse" />
           ))}
        </div>

        {/* Members Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
           {[...Array(8)].map((_, i) => (
             <div key={i} className="bg-white dark:bg-zinc-900 rounded-[2rem] border border-black/5 dark:border-white/5 overflow-hidden animate-pulse">
                <div className="aspect-[4/5] bg-zinc-200 dark:bg-zinc-800" />
                <div className="p-8 space-y-4">
                   <div className="w-full h-6 bg-zinc-100 dark:bg-zinc-800 rounded-lg" />
                   <div className="w-2/3 h-4 bg-zinc-100 dark:bg-zinc-800 rounded-lg opacity-60" />
                </div>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
};

export default MembersLoading;
