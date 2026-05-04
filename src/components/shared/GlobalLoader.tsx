"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useRouter } from "next/navigation";
import { useLoaderStore } from "@/store/useLoaderStore";
import { buildImagePool, IMAGE_COUNT, failedUrls } from "@/features/home/components/hero/utils/constants";
import { getImageUrl } from "@/utils/imageUrl";

/**
 * TIERED PRELOADING STRATEGY:
 * 1. Critical: Hero Image + Basic UI (Required to hide loader)
 * 2. Secondary: Remaining background assets (Parallelized)
 * 3. Background: Other page chunks (Prefetched after loader hides)
 */

const CRITICAL_ASSETS_COUNT = 4;
const SECONDARY_ASSETS_COUNT = 8;
const BACKGROUND_PAGES = ["/events", "/gallery", "/departments", "/achievements", "/join"];

const GlobalLoader = () => {
  const router = useRouter();
  const { isLoaded, progress, setLoaded, setProgress, setAnimationComplete } = useLoaderStore();
  const [show, setShow] = useState(true);
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    let isCancelled = false;
    const pool = buildImagePool(IMAGE_COUNT);
    
    // Adaptive Resource Management: Detect connection speed
    // @ts-ignore - Network Information API
    const connection = typeof navigator !== 'undefined' ? (navigator.connection || navigator.mozConnection || navigator.webkitConnection) : null;
    const isSlowConnection = connection && (connection.saveData || /2g|3g/.test(connection.effectiveType));

    // Throttling assets based on network quality
    const criticalCount = CRITICAL_ASSETS_COUNT;
    const secondaryCount = isSlowConnection ? 2 : SECONDARY_ASSETS_COUNT;
    const activeBackgroundPages = isSlowConnection ? ["/events"] : BACKGROUND_PAGES;

    // Tier 1 & 2: Images
    const criticalUrls = Array.from(new Set(pool.slice(0, criticalCount).map(img => getImageUrl(img.url, 1200, 80))));
    const secondaryUrls = Array.from(new Set(pool.slice(criticalCount, criticalCount + secondaryCount).map(img => getImageUrl(img.url, 400, 70))));
    
    const allInitialUrls = [...criticalUrls, ...secondaryUrls];
    let loadedCount = 0;

    const updateProgress = () => {
      if (isCancelled) return;
      loadedCount++;
      const p = (loadedCount / allInitialUrls.length) * 100;
      setProgress(p);

      if (loadedCount === allInitialUrls.length) {
        finishInitialLoad();
      }
    };

    const finishInitialLoad = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const remaining = Math.max(0, 800 - elapsed);
      
      setTimeout(() => {
        if (isCancelled) return;
        setLoaded(true);
        startBackgroundWarming();
      }, remaining);
    };

    const startBackgroundWarming = () => {
      const warmer = () => {
        activeBackgroundPages.forEach((path, i) => {
          setTimeout(() => {
            if (!isCancelled) {
              try { router.prefetch(path); } catch (e) {}
            }
          }, i * 200);
        });
      };

      if ('requestIdleCallback' in window) {
        (window as any).requestIdleCallback(warmer, { timeout: 2000 });
      } else {
        setTimeout(warmer, 1000);
      }
    };

    // Parallel Loading Engine
    allInitialUrls.forEach(url => {
      const img = new Image();
      img.src = url;
      img.onload = updateProgress;
      img.onerror = () => {
        failedUrls.add(url);
        updateProgress();
      };
    });

    // Fail-safe Guardian: 5 seconds max
    const failSafe = setTimeout(() => {
      if (!isLoaded) finishInitialLoad();
    }, 5000);

    return () => {
      isCancelled = true;
      clearTimeout(failSafe);
    };
  }, [setLoaded, setProgress, router]);

  useEffect(() => {
    if (isLoaded) {
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
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center select-none"
        >
          <div className="flex flex-col items-center gap-10">
            <motion.h1 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-white text-5xl md:text-8xl font-black tracking-tighter uppercase whitespace-pre"
            >
              U I U P C
            </motion.h1>
            
            <div className="flex flex-col items-center gap-4">
              <div className="w-64 md:w-96 h-[2px] bg-white/10 rounded-full overflow-hidden relative">
                <motion.div
                  className="absolute top-0 left-0 h-full bg-uiupc-orange"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                />
              </div>
              <div className="flex justify-between w-full text-[10px] font-black uppercase tracking-widest text-white/30">
                <span>Synchronizing Systems</span>
                <span>{Math.round(progress)}%</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GlobalLoader;
