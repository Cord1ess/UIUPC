"use client";

import React from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'motion/react';
import { UIUPCEvent } from '@/types';
import { useLoaderStore } from '@/store/useLoaderStore';
import { usePageStore } from '@/store/usePageStore';

const MapComponent = dynamic(
  () => import('@/features/admin/components/modules/InteractiveEventMap').then((mod) => mod.InteractiveEventMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-900 rounded-3xl">
         <span className="text-zinc-500 font-bold uppercase text-[8px] tracking-[0.4em] opacity-50">Initializing Portal...</span>
      </div>
    ),
  }
);

interface EventMapWrapperProps {
  events: UIUPCEvent[];
}

export default function EventMapWrapper({ events }: EventMapWrapperProps) {
  const { isAnimationComplete } = useLoaderStore();
  const alreadyVisited = usePageStore((state) => state.visitedPaths.has('/events'));
  
  // We want the UI to be ready to animate instantly
  const [isReady, setIsReady] = React.useState(alreadyVisited);
  const [mapLoaded, setMapLoaded] = React.useState(alreadyVisited);
  const [isActivated, setIsActivated] = React.useState(alreadyVisited);

  React.useEffect(() => {
    if (isAnimationComplete && (mapLoaded || !isActivated) && !isReady) {
      setIsReady(true);
    }
  }, [isAnimationComplete, mapLoaded, isReady, isActivated]);

  return (
    <motion.div 
      initial={{ scale: 0.98, opacity: 0 }}
      animate={isReady ? { scale: 1, opacity: 1 } : {}}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      style={{ willChange: 'transform, opacity' }}
      className="w-full h-full bg-zinc-50 dark:bg-zinc-900 rounded-3xl overflow-hidden relative border border-black/5 dark:border-white/5 shadow-lg"
    >
      <motion.div 
        initial={{ scale: 1.1, opacity: 0 }}
        animate={isReady ? { scale: 1, opacity: 1 } : {}}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        style={{ willChange: 'transform' }}
        className="w-full h-full"
      >
        {isActivated ? (
          <MapComponent 
            events={events} 
            isAdminMode={false} 
            onReady={() => setMapLoaded(true)}
          />
        ) : (
          <div className="w-full h-full relative group">
            {/* High-end static backdrop (Placeholder) */}
            <div className="absolute inset-0 bg-[url('https://basemaps.cartocdn.com/rastertiles/voyager_nolabels/14/12101/7118.png')] bg-cover bg-center grayscale opacity-30 dark:opacity-20" />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 z-10">
               <button 
                 onClick={() => setIsActivated(true)}
                 className="px-8 py-4 bg-zinc-900 dark:bg-white text-white dark:text-black text-[10px] font-black uppercase tracking-[0.2em] rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all group-hover:bg-uiupc-orange group-hover:text-white"
               >
                 Launch Interactive Map
               </button>
               <p className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest opacity-50">Exploration portal • 42MB Engine</p>
            </div>
          </div>
        )}
      </motion.div>

      {/* Zero-lag overlay for smoother hydration */}
      {!isReady && (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center pointer-events-none z-[5]"
        >
          <span className="text-[8px] font-black uppercase tracking-[0.3em] text-zinc-400">Loading Map...</span>
        </motion.div>
      )}
    </motion.div>
  );
}
