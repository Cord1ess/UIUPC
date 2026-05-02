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
import DynamicGrid from '@/components/shared/DynamicGrid';
import ImagePreviewModal from "./ImagePreviewModal";
import { useLoaderStore } from "@/store/useLoaderStore";
import { useTimelineEngine } from "./hooks/useTimelineEngine";
import { fetchHeroImages } from "@/lib/fetchers";
import { useInteractionSystem } from "./hooks/useInteractionSystem";
import ScrollRevealText from '@/components/motion/ScrollRevealText';
import { IMAGE_WIDTH, IMAGE_HEIGHT, failedUrls, type HeroImage } from "./utils/constants";
import { getImageUrl } from "@/utils/imageUrl";

const ModernHero: React.FC = () => {
  // ── Modal & Playback State ──────────────────────────────
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(-1);
  const [originRect, setOriginRect] = useState<DOMRect | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dynamicImages, setDynamicImages] = useState<HeroImage[]>([]);

  // ── Fetch Data ──────────────────────────────────────────
  useEffect(() => {
    const loadImages = async () => {
      const images = await fetchHeroImages();
      if (images.length > 0) {
        setDynamicImages(images);
      }
    };
    loadImages();
  }, []);

  // ── Engine ──────────────────────────────────────────────
  const { 
    tick, 
    phase, 
    imagePool, 
    setDragVelocity, 
    setHoveredIndex,
    seekToImage
  } = useTimelineEngine(isPaused, dynamicImages);

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

        // Double-Buffered LOD Swapping (Zero-Flicker)
        if (entry.focusFactor > 0.4) {
          const baseUrl = imagePool[entry.imageIndex]?.url;
          const highResUrl = baseUrl ? getImageUrl(baseUrl, 1200, 85) : null;
          if (highResUrl && !failedUrls.has(highResUrl)) {
            const highResImg = el.querySelector(".high-res") as HTMLImageElement;
            if (highResImg && highResImg.dataset.lod !== "high" && highResImg.dataset.fetching !== "true") {
              highResImg.dataset.fetching = "true";
              
              const preloader = new window.Image();
              preloader.src = highResUrl;
              preloader.onload = () => {
                highResImg.src = highResUrl;
                highResImg.dataset.lod = "high";
                highResImg.style.opacity = "1";
              };
              preloader.onerror = () => {
                failedUrls.add(highResUrl);
                highResImg.dataset.fetching = "false";
              };
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
        {imagePool.map((image, index) => {
          const initUrl = getImageUrl(image.url, 320, 70);
          // LCP Hero Preload Injection
          if (index === 0 && typeof window !== "undefined") {
            const link = document.createElement("link");
            link.rel = "preload";
            link.as = "image";
            link.href = initUrl;
            (link as any).fetchPriority = "high";
            document.head.appendChild(link);
          }

          return (
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
                src={initUrl}
                alt={image.title}
                className="base-layer w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                draggable={false}
                loading="eager"
                decoding="async"
                {...({ fetchPriority: "high" } as any)}
              />
              <img
                alt={image.title}
                className="high-res absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-300 pointer-events-none"
                draggable={false}
                loading="lazy"
                decoding="async"
                data-lod="low"
              />
              <div className="absolute inset-0 bg-transparent" /> { /* Shield for layout/focus factor checks */ }
            </div>
          );
        })}
      </div>

      {/* Preview Modal */}
      <ImagePreviewModal
        image={selectedImageIndex >= 0 ? imagePool[selectedImageIndex] : null}
        nextImageUrl={selectedImageIndex >= 0 ? getImageUrl(imagePool[(selectedImageIndex + 1) % imagePool.length].url, 1600, 90) : undefined}
        prevImageUrl={selectedImageIndex >= 0 ? getImageUrl(imagePool[(selectedImageIndex - 1 + imagePool.length) % imagePool.length].url, 1600, 90) : undefined}
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
