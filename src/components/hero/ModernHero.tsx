/**
 * ModernHero.tsx — Main hero section with direct DOM manipulation for 60fps.
 *
 * KEY ARCHITECTURE: The rAF loop lives here. It calls engine.tick() which
 * returns computed transforms, then applies them directly to DOM elements
 * via refs. No React re-renders during animation.
 *
 * Fixes applied:
 *  1. Path follows user's drawn curve (gentle dip, not sine wave)
 *  2. No overlap outside focus zone (train-like flow)
 *  3. Images SPREAD OUT inside focus zone (not clumped)
 *  4. Smooth, non-jittery movement via direct DOM writes
 *  5. No blur on any images
 *  6. Smaller text overlay
 */

"use client";

import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import DynamicGrid from "../ui/DynamicGrid";
import ImagePreviewModal from "./ImagePreviewModal";
import { useLoaderStore } from "@/store/useLoaderStore";
import { useTimelineEngine } from "./hooks/useTimelineEngine";
import { useInteractionSystem } from "./hooks/useInteractionSystem";
import ScrollRevealText from "../home/ScrollRevealText";
import { IMAGE_WIDTH, IMAGE_HEIGHT, getCloudinaryUrl, failedUrls, type HeroImage } from "./utils/constants";

const ModernHero: React.FC = () => {
  // ── Modal & Playback State ──────────────────────────────
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(-1);
  const [originRect, setOriginRect] = useState<DOMRect | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ── Engine ──────────────────────────────────────────────
  const { 
    tick, 
    phase, 
    imagePool, 
    setDragVelocity, 
    setHoveredIndex,
    seekToImage
  } = useTimelineEngine(isPaused);

  // ── DOM Refs for direct manipulation ────────────────────
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const rafRef = useRef<number>(0);
  const isInViewRef = useRef(false);

  // ── Intersection Suspender ──────────────────────────────
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      isInViewRef.current = entry.isIntersecting;
    }, { rootMargin: "50% 0px 50% 0px" });

    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // ── Interaction ─────────────────────────────────────────
  const interactionCallbacks = useMemo(
    () => ({ setDragVelocity }),
    [setDragVelocity]
  );
  const { onPointerDown, gridOffset } = useInteractionSystem(interactionCallbacks);

  const isAnimationComplete = useLoaderStore(state => state.isAnimationComplete);

  // ── Main Animation Loop (direct DOM writes) ────────────
  useEffect(() => {
    if (!isAnimationComplete) return;

    const animate = (now: number) => {
      if (!isInViewRef.current) {
        // Suspend rendering to save battery/cpu if out of view
        rafRef.current = requestAnimationFrame(animate);
        return;
      }

      const container = containerRef.current;
      if (!container) {
        rafRef.current = requestAnimationFrame(animate);
        return;
      }

      const vw = container.clientWidth;
      const vh = container.clientHeight;

      // Get computed entries from engine (no React state involved)
      const entries = tick(now, vw, vh);

      // Dynamic scaling: images maintain their size relative to a 1440px width viewport on desktop.
      // On mobile, we use a different baseline to ensure they remain large enough.
      const isMobile = vw < 768;
      const globalScale = isMobile 
        ? Math.max(0.50, Math.min(vw / 400, 1.2)) 
        : Math.max(0.45, Math.min(vw / 1440, 1.2));

      // Apply transforms directly to DOM elements
      for (const entry of entries) {
        const el = imageRefs.current[entry.imageIndex];
        if (!el) continue;

        // Performance: Viewport Culling & VRAM Optimization
        if (!entry.isVisible) {
          if (el.style.willChange !== "auto") el.style.willChange = "auto";
          if (el.style.display !== "none") el.style.display = "none";
          continue;
        }

        if (el.style.willChange !== "transform, opacity") el.style.willChange = "transform, opacity";
        if (el.style.display !== "block") el.style.display = "block";

        const tx = entry.x - IMAGE_WIDTH / 2;
        const ty = entry.y - IMAGE_HEIGHT / 2;

        const finalScale = entry.scale * globalScale;

        // LOD Progressive Resolution Swapping — skip if base URL is known-broken
        if (entry.focusFactor > 0.4) {
          const baseUrl = imagePool[entry.imageIndex]?.url;
          const highResUrl = baseUrl ? getCloudinaryUrl(baseUrl, 1200, "auto:best") : null;
          if (highResUrl && !failedUrls.has(highResUrl) && !failedUrls.has(getCloudinaryUrl(baseUrl, 400, "auto:eco"))) {
            const imgEl = el.querySelector("img");
            if (imgEl && imgEl.dataset.lod !== "high") {
              imgEl.src = highResUrl;
              imgEl.dataset.lod = "high";
            }
          }
        }

        // Force hardware acceleration with translate3d
        el.style.transform = `translate3d(${tx}px, ${ty}px, 0) scale(${finalScale}) rotate(${entry.rotation}deg)`;
        el.style.opacity = entry.opacity.toString();
        el.style.zIndex = entry.zIndex.toString();

        // Shadow intensity based on focus
        const shadowSize = 4 + entry.focusFactor * 16;
        const shadowAlpha = 0.06 + entry.focusFactor * 0.15;
        el.style.boxShadow = `0 ${shadowSize}px ${shadowSize * 2}px rgba(0,0,0,${shadowAlpha})`;
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [isAnimationComplete, tick]);

  // ── Image click handler ─────────────────────────────────
  const handleImageClick = useCallback(
    (index: number, e: React.MouseEvent) => {
      const rect = e.currentTarget.getBoundingClientRect();
      setOriginRect(rect);
      setSelectedImageIndex(index);
      setIsModalOpen(true);
    },
    []
  );

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setIsPaused(false);
  }, []);

  const nextImage = useCallback(() => {
    setSelectedImageIndex((prev) => {
      const next = (prev + 1) % imagePool.length;
      seekToImage(next);
      return next;
    });
  }, [imagePool.length, seekToImage]);

  const prevImage = useCallback(() => {
    setSelectedImageIndex((prev) => {
      const next = (prev - 1 + imagePool.length) % imagePool.length;
      seekToImage(next);
      return next;
    });
  }, [imagePool.length, seekToImage]);

  const togglePause = useCallback(() => setIsPaused((p) => !p), []);

  return (
    <section
      ref={containerRef}
      className="relative w-full h-[110vh] overflow-hidden select-none bg-transparent"
      onPointerDown={onPointerDown}
      style={{ cursor: "grab", touchAction: "none" }}
    >
      {/* Dynamic Background Bulge Lens — Warps the grid underneath */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none transition-transform duration-1000 ease-out"
        style={{
          maskImage: "radial-gradient(ellipse at 50% 50%, black 0%, transparent 60%)",
          WebkitMaskImage: "radial-gradient(ellipse at 50% 50%, black 0%, transparent 60%)",
          transform: "scale(1.1)", // Creates the dimensional bulging effect
          opacity: 0.9
        }}
      >
        <DynamicGrid isLens={true} />
      </div>

      {/* Image Stream — rendered once, updated via refs */}
      <div 
        className={`absolute inset-0 z-10 pointer-events-none transition-opacity duration-700 py-20`}
      >
        {imagePool.map((image, index) => (
          <div
            key={image.id}
            ref={(el) => { imageRefs.current[index] = el; }}
            className="absolute top-0 left-0 pointer-events-auto"
            style={{
              width: IMAGE_WIDTH,
              height: IMAGE_HEIGHT,
              borderRadius: 6,
              overflow: "hidden",
              willChange: "transform, opacity",
              backfaceVisibility: "hidden",
              transform: "translate3d(-100vw, -100vh, 0)", // Start off-screen
              opacity: 0, // Start invisible
            }}
            onClick={(e) => handleImageClick(index, e)}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <img
              src={getCloudinaryUrl(image.url, 400, "auto:eco")} // Default to low res init
              alt={image.title}
              data-lod="low"
              className="w-full h-full object-cover"
              draggable={false}
              loading="eager"
              onError={(e) => {
                const imgEl = e.currentTarget;
                failedUrls.add(imgEl.src);
                // Hide the entire card so it doesn't show a broken image placeholder
                const card = imgEl.parentElement;
                if (card) card.style.display = "none";
              }}
            />
          </div>
        ))}
      </div>

      {/* Bottom-Left Text Overlay — REFINED */}
      <div className="absolute bottom-12 left-8 md:bottom-20 md:left-14 z-30 max-w-4xl pointer-events-auto">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.2 }}
          className="flex items-center gap-2 mb-2"
        >
          <div className="w-6 h-[1px] bg-uiupc-orange" />
          <span className="text-[8px] font-black text-zinc-900 dark:text-zinc-400 uppercase tracking-[0.4em]">
            Established 2005
          </span>
          <div className="w-6 h-[1px] bg-uiupc-orange" />
        </motion.div>

        <div className="mb-3">
          <div className="overflow-visible">
            <ScrollRevealText 
              text="Welcome to"
              delayOffset={1.6}
              className="text-2xl md:text-4xl font-black text-zinc-900 dark:text-white uppercase tracking-tighter leading-tight"
            />
          </div>
          <div className="overflow-visible">
            <ScrollRevealText 
              text="UIU Photography Club"
              delayOffset={2.0}
              className="text-2xl md:text-4xl font-black text-zinc-900 dark:text-white uppercase tracking-tighter leading-tight"
            />
          </div>
        </div>

        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 3.2, duration: 1 }}
          className="text-zinc-700 dark:text-zinc-400 text-[10px] md:text-xs font-medium leading-relaxed mb-6 max-w-sm"
        >
          We are a community of passionate photographers at United International University dedicated to exploring the art of photography, sharing knowledge, and capturing campus life.
        </motion.p>

        <div className="flex items-center gap-5">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 3.2, duration: 0.5 }}
          >
            <Link
              href="/join"
              className="inline-flex items-center gap-2 px-6 py-3 bg-black dark:bg-zinc-800 text-white text-[9px] font-black uppercase tracking-widest hover:bg-uiupc-orange dark:hover:bg-uiupc-orange transition-all rounded-sm shadow-md hover:-translate-y-0.5"
            >
              Join Club
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 3.5 }}
          >
            <Link
              href="/gallery"
              className="text-[9px] font-black text-zinc-900 dark:text-zinc-500 uppercase tracking-widest hover:text-uiupc-orange dark:hover:text-white transition-colors"
            >
              Gallery
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Preview Modal */}
      <ImagePreviewModal
        image={selectedImageIndex >= 0 ? imagePool[selectedImageIndex] : null}
        isOpen={isModalOpen}
        onClose={closeModal}
        originRect={originRect}
        onNext={nextImage}
        onPrev={prevImage}
        isPaused={isPaused}
        onTogglePause={togglePause}
      />
    </section>
  );
};

export default ModernHero;
