"use client";

import React from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
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

  React.useEffect(() => {
    if (isAnimationComplete && mapLoaded && !isReady) {
      setIsReady(true);
    }
  }, [isAnimationComplete, mapLoaded, isReady]);

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
        <MapComponent 
          events={events} 
          isAdminMode={false} 
          onReady={() => setMapLoaded(true)}
        />
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
