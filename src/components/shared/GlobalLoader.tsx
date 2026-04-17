"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLoaderStore } from "@/store/useLoaderStore";
import { buildImagePool, IMAGE_COUNT, getCloudinaryUrl, failedUrls } from "@/features/home/components/hero/utils/constants";

const GlobalLoader = () => {
  const { isLoaded, progress, setLoaded, setProgress, setAnimationComplete } = useLoaderStore();
  const [show, setShow] = useState(true);

  useEffect(() => {
    // Only fetch unique URLs, mapped to their low-res variant for insanely fast preloading
    const urls = Array.from(new Set(buildImagePool(IMAGE_COUNT).map(img => getCloudinaryUrl(img.url, 320, 'auto:eco'))));
    let loadedCount = 0;

    urls.forEach(url => {
      const img = new Image();
      img.src = url;
      img.onload = () => {
        loadedCount++;
        setProgress((loadedCount / urls.length) * 100);
        if (loadedCount === urls.length) {
          setLoaded(true);
        }
      };
      img.onerror = () => {
        failedUrls.add(url);
        loadedCount++;
        setProgress((loadedCount / urls.length) * 100);
        if (loadedCount === urls.length) {
          setLoaded(true);
        }
      };
    });
    
    if (urls.length === 0) setLoaded(true);
  }, [setLoaded, setProgress]);

  useEffect(() => {
    if (isLoaded) {
      // Small delay before unmounting for smooth exit
      const t = setTimeout(() => setShow(false), 800);
      return () => clearTimeout(t);
    }
  }, [isLoaded]);

  return (
    <AnimatePresence onExitComplete={() => setAnimationComplete(true)}>
      {show && (
        <motion.div
          key="global-loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center select-none"
        >
          <div className="flex flex-col items-center gap-8">
            <h1 className="text-white text-5xl md:text-7xl font-black tracking-tighter uppercase whitespace-pre">
              U I U P C
            </h1>
            <div className="w-48 md:w-64 h-[2px] bg-white/20 rounded-full overflow-hidden relative">
              <motion.div
                className="absolute top-0 left-0 h-full bg-uiupc-orange"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              />
            </div>
            <div className="text-white/50 text-sm font-black uppercase tracking-widest">
              {Math.round(progress)}%
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GlobalLoader;
