"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChevronLeft, FaChevronRight, FaPlay, FaInfoCircle } from 'react-icons/fa';
import Link from 'next/link';
import { getImageUrl } from '@/utils/imageUrl';
import { useLoaderStore } from '@/store/useLoaderStore';
import ScrollRevealText from '@/components/motion/ScrollRevealText';

const CAROUSEL_IMAGES = [
  {
    url: "https://res.cloudinary.com/do0e8p5d2/image/upload/v1763054814/uiupc_HeroSlider1_d9kprm.jpg",
  },
  {
    url: "https://res.cloudinary.com/do0e8p5d2/image/upload/v1762121158/uiupc_HeroSlider2_cyl1xw.jpg",
  },
  {
    url: "https://res.cloudinary.com/do0e8p5d2/image/upload/v1772527954/Cover_mhro7f.jpg",
  }
];

const HomeCarousel = () => {
  const [index, setIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const isAnimationComplete = useLoaderStore(state => state.isAnimationComplete);

  const next = useCallback(() => {
    setIndex((prev) => (prev + 1) % CAROUSEL_IMAGES.length);
  }, []);

  const prev = useCallback(() => {
    setIndex((prev) => (prev - 1 + CAROUSEL_IMAGES.length) % CAROUSEL_IMAGES.length);
  }, []);

  useEffect(() => {
    if (!isAutoPlay || !isAnimationComplete) return;
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [isAutoPlay, isAnimationComplete, next]);

  return (
    <section 
      className="relative w-full hero-viewport-height flex-shrink-0 overflow-hidden bg-zinc-950 z-10"
    >
      <AnimatePresence>
        <motion.div
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          {/* Ken Burns Effect Image */}
          <motion.div
            initial={{ scale: 1 }}
            animate={{ scale: 1.08 }}
            transition={{ duration: 10, ease: "linear" }}
            className="absolute inset-0"
          >
            <img
              src={getImageUrl(CAROUSEL_IMAGES[index].url, 1920, 85)}
              alt="UIUPC Hero Slide"
              className="w-full h-full object-cover"
            />
          </motion.div>

          {/* Localized Bottom-Left Gradient for Legibility - Stronger for visibility */}
          <div className="absolute inset-0 bg-gradient-to-tr from-black from-0% via-black/40 via-30% to-transparent to-60%" />

        </motion.div>
      </AnimatePresence>
      
      {/* Static Content Overlay — Moved from ModernHero */}
      <div className="absolute inset-0 flex flex-col justify-end px-6 md:px-12 z-20 pointer-events-none pb-16 md:pb-24">
        {/* Header Spacer - kept for structural safety though justify-end is active */}
        <div className="h-24 md:h-32 shrink-0" />
        
        <div className="max-w-4xl w-full pointer-events-auto">


          <div className="mb-4 flex flex-col space-y-1">
            <div className="overflow-hidden">
              <ScrollRevealText 
                text="Welcome to"
                delayOffset={0.8}
                forceWhite={true}
                className="text-2xl md:text-4xl font-black text-white uppercase tracking-tighter leading-none"
              />
            </div>
            <div className="overflow-hidden">
              <ScrollRevealText 
                text="UIU Photography Club"
                delayOffset={1.1}
                forceWhite={true}
                className="text-2xl md:text-4xl font-black text-white uppercase tracking-tighter leading-none"
              />
            </div>
          </div>

          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={isAnimationComplete ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 1.8, duration: 1 }}
            className="text-white/60 text-[10px] md:text-sm font-medium leading-relaxed mb-8 max-w-md"
          >
            We are a community of passionate photographers at United International University 
            dedicated to exploring the art of photography, sharing knowledge, and capturing campus life.
          </motion.p>

          <div className="flex flex-wrap items-center gap-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={isAnimationComplete ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 2.2, duration: 0.5 }}
            >
              <Link
                href="/join"
                className="inline-flex items-center gap-2 px-8 py-3 bg-white text-black text-[10px] font-black uppercase tracking-widest hover:bg-uiupc-orange hover:text-white transition-all rounded-sm shadow-xl hover:-translate-y-1"
              >
                Join the Club
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="stroke-current">
                  <path d="M5 12H19M19 12L12 5M19 12L12 19" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={isAnimationComplete ? { opacity: 1 } : {}}
              transition={{ delay: 2.5 }}
            >
              <Link
                href="/gallery"
                className="text-[10px] font-black text-white/50 hover:text-white uppercase tracking-widest transition-colors flex items-center gap-2 group"
              >
                View Gallery
                <div className="w-1 h-1 rounded-full bg-uiupc-orange scale-0 group-hover:scale-100 transition-transform" />
              </Link>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="absolute bottom-8 md:bottom-12 left-6 right-6 md:left-auto md:right-12 flex flex-col md:flex-row items-center gap-4 md:gap-8 z-30">
        {/* Progress Indicators */}
        <div className="flex gap-2 md:gap-3 order-2 md:order-1">
          {CAROUSEL_IMAGES.map((_, i) => (
            <button
              key={i}
              onClick={() => { setIndex(i); setIsAutoPlay(false); }}
              className={`h-1 transition-all duration-500 ${i === index ? 'w-8 md:w-12 bg-uiupc-orange' : 'w-3 md:w-4 bg-white/20'}`}
            />
          ))}
        </div>

        {/* Arrow Buttons */}
        <div className="flex gap-2 order-1 md:order-2">
          <button
            onClick={() => { prev(); setIsAutoPlay(false); }}
            className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center border border-white/20 text-white hover:bg-white hover:text-black transition-all rounded-full"
          >
            <FaChevronLeft className="text-sm" />
          </button>
          <button
            onClick={() => { next(); setIsAutoPlay(false); }}
            className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center border border-white/20 text-white hover:bg-white hover:text-black transition-all rounded-full"
          >
            <FaChevronRight className="text-sm" />
          </button>
        </div>
      </div>

    </section>
  );
};

export default HomeCarousel;
