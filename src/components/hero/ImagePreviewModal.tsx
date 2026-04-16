/**
 * ImagePreviewModal.tsx — Refined Full-screen preview overlay.
 *
 * KEY UPDATES:
 *  1. Conditional Animation: Zoom-from-origin on open, smooth cross-fade on navigation.
 *  2. Enhanced Pause UI: Clear "Resume/Pause" status button.
 *  3. Navigation Sync: Timeline in background shifts with modal navigation.
 *  4. Clean Backdrop: No blur, 60% tint.
 */

"use client";

import React, { useEffect, useCallback, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { IoPause, IoPlay, IoChevronBack, IoChevronForward, IoShareOutline, IoDownloadOutline } from "react-icons/io5";
import { getCloudinaryUrl } from "./utils/constants";
import type { HeroImage } from "./utils/constants";

interface ImagePreviewModalProps {
  image: HeroImage | null;
  isOpen: boolean;
  onClose: () => void;
  originRect: DOMRect | null;
  onNext: () => void;
  onPrev: () => void;
  isPaused: boolean;
  onTogglePause: () => void;
  nextImageUrl?: string;
  prevImageUrl?: string;
}

const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({
  image,
  isOpen,
  onClose,
  originRect,
  onNext,
  onPrev,
  isPaused,
  onTogglePause,
  nextImageUrl,
  prevImageUrl,
}) => {
  const isFirstRender = useRef(true);
  const [shareStatus, setShareStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Close on ESC
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onNext();
      if (e.key === "ArrowLeft") onPrev();
    },
    [onClose, onNext, onPrev]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    } else {
      isFirstRender.current = true;
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleKeyDown]);

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!image) return;
    
    const shareData = {
      title: image.title,
      text: `Check out this shot from UIU Photography Club: ${image.title}`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        setShareStatus('success');
      } else {
        // Fallback: Copy to clipboard
        await navigator.clipboard.writeText(window.location.href);
        setShareStatus('success');
        setTimeout(() => setShareStatus('idle'), 2000);
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  // Preload next/prev images for snappy navigation
  useEffect(() => {
    if (!isOpen) return;
    
    if (nextImageUrl) {
      const img = new Image();
      img.src = nextImageUrl;
    }
    if (prevImageUrl) {
      const img = new Image();
      img.src = prevImageUrl;
    }
  }, [isOpen, nextImageUrl, prevImageUrl]);

  const animationVariants = useMemo(() => {
    if (!originRect || typeof window === "undefined") {
      return {
        initial: { opacity: 0, scale: 0.9 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.95 }
      };
    }

    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const initialScale = originRect.width / 400;

    return {
      initial: {
        x: originRect.left + originRect.width / 2 - centerX,
        y: originRect.top + originRect.height / 2 - centerY,
        scale: initialScale,
        opacity: 0,
      },
      animate: {
        x: 0,
        y: 0,
        scale: 1,
        opacity: 1,
      },
      exit: {
        opacity: 0,
        scale: 0.9,
      }
    };
  }, [originRect]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence 
      onExitComplete={() => { isFirstRender.current = true; }}
    >
      {isOpen && image && (
        <motion.div
          className="fixed inset-0 z-[99999] flex items-center justify-center p-4 outline-none overflow-y-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Backdrop — High contrast, no blur */}
          <motion.div
            className="absolute inset-0 bg-black/80"
            onClick={onClose}
          />

          {/* Navigation: Left */}
          <button
            onClick={(e) => { e.stopPropagation(); isFirstRender.current = false; onPrev(); }}
            className="fixed left-4 md:left-12 z-50 p-4 text-white/30 hover:text-white transition-all group"
          >
            <IoChevronBack className="text-4xl md:text-6xl group-active:scale-90 transition-transform" />
          </button>

          {/* Navigation: Right */}
          <button
            onClick={(e) => { e.stopPropagation(); isFirstRender.current = false; onNext(); }}
            className="fixed right-4 md:right-12 z-50 p-4 text-white/30 hover:text-white transition-all group"
          >
            <IoChevronForward className="text-4xl md:text-6xl group-active:scale-90 transition-transform" />
          </button>


          {/* Main Image View */}
          <motion.div
            key={image.id}
            className="relative z-10 w-full max-w-[95vw] md:max-w-4xl flex flex-col items-center pointer-events-none py-10"
            variants={animationVariants}
            initial={isFirstRender.current ? "initial" : false}
            animate="animate"
            onAnimationComplete={() => { isFirstRender.current = false; }}
            transition={isFirstRender.current 
              ? { type: "spring", damping: 25, stiffness: 200 }
              : { duration: 0 }
            }
          >
            <div className="relative group overflow-hidden rounded-xl shadow-[0_40px_100px_rgba(0,0,0,0.6)] pointer-events-auto bg-zinc-900/10 dark:bg-zinc-800/10">
              {/* Internal Pause/Play Toggle */}
              <button
                onClick={(e) => { e.stopPropagation(); onTogglePause(); }}
                className={`absolute top-6 right-6 z-50 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border border-white/20 shadow-xl ${
                  isPaused 
                    ? 'bg-uiupc-orange text-white scale-110' 
                    : 'bg-black/20 backdrop-blur-md text-white/80 hover:bg-black/50'
                }`}
              >
                {isPaused ? <IoPlay className="text-lg ml-0.5" /> : <IoPause className="text-lg" />}
              </button>

              <img
                src={image.url ? getCloudinaryUrl(image.url, 1600, "auto:best") : ''}
                alt={image.title}
                className="max-w-full max-h-[60vh] w-auto h-auto object-contain select-none shadow-inner"
              />
            </div>

            {/* Info Overlay */}
            <div className="mt-8 text-center px-4 w-full max-w-2xl pointer-events-auto">
              <h3 className="text-white text-2xl md:text-4xl font-black uppercase tracking-tight drop-shadow-2xl leading-none mb-4">
                {image.title}
              </h3>
              <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.5em] mb-8">
                Captured by {image.photographer} 
              </p>

              {/* Action Toolbar */}
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button 
                  onClick={handleShare}
                  className="px-6 py-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-full text-white text-[9px] font-black uppercase tracking-widest flex items-center gap-3 hover:bg-white/10 hover:border-white/20 transition-all active:scale-95"
                >
                  <IoShareOutline className="text-sm" /> 
                  {shareStatus === 'success' ? 'Link Copied' : 'Share moment'}
                </button>
                
                {image.facebookPost && (
                  <a 
                    href={image.facebookPost}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="px-6 py-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-full text-white text-[9px] font-black uppercase tracking-widest flex items-center gap-3 hover:bg-uiupc-orange hover:border-uiupc-orange transition-all active:scale-95"
                  >
                    <IoPlay className="rotate-[-45deg] text-[8px]" /> View on Facebook
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default ImagePreviewModal;
