"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from '@/components/shared/Icons';
import Link from 'next/link';
import { getImageUrl } from '@/utils/imageUrl';
import { useLoaderStore } from '@/store/useLoaderStore';
import ScrollRevealText from '@/components/motion/ScrollRevealText';
import { fetchHeroImages } from '@/lib/fetchers';
import { HeroImage } from '@/types';

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
  const [images, setImages] = useState<HeroImage[]>([]);
  const isAnimationComplete = useLoaderStore(state => state.isAnimationComplete);

  useEffect(() => {
    const loadImages = async () => {
      const fetched = await fetchHeroImages();
      if (fetched.length > 0) {
        setImages(fetched);
      }
    };
    loadImages();
  }, []);

  const carouselImages = images.length > 0 ? images : CAROUSEL_IMAGES;
  const nextIndex = (index + 1) % carouselImages.length;

  const next = useCallback(() => {
    setIndex((prev) => (prev + 1) % carouselImages.length);
  }, [carouselImages.length]);

  const prev = useCallback(() => {
    setIndex((prev) => (prev - 1 + carouselImages.length) % carouselImages.length);
  }, [carouselImages.length]);

  useEffect(() => {
    if (!isAutoPlay || !isAnimationComplete || carouselImages.length === 0) return;
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [isAutoPlay, isAnimationComplete, next, carouselImages.length]);

  return (
    <section className="relative w-full hero-viewport-height flex-shrink-0 overflow-hidden bg-zinc-950 z-10">
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: isAnimationComplete ? 1 : 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <motion.div
            initial={{ scale: 1 }}
            animate={{ scale: isAnimationComplete ? 1.08 : 1 }}
            transition={{ duration: 10, ease: "linear" }}
            className="absolute inset-0"
            style={{ willChange: 'transform' }}
          >
            <Image
              src={getImageUrl(carouselImages[index].url, 1920, 85)}
              alt="UIUPC Hero Slide"
              fill
              priority={true}
              loading="eager"
              unoptimized={true}
              className="object-cover"
              sizes="100vw"
            />
          </motion.div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_rgba(0,0,0,0.9)_0%,_rgba(0,0,0,0.4)_40%,_transparent_80%)]" />
        </motion.div>
      </AnimatePresence>
      
      {/* ── UNIFIED CONTENT OVERLAY ── */}
      <div className="absolute inset-0 z-20 flex flex-col justify-end px-6 md:px-12 pb-12 md:pb-24 pointer-events-none">
        
        {/* Top Section: Text Content (Stays top-left relative to bottom) */}
        <div className="max-w-4xl w-full mb-4 pointer-events-auto">
          <div className="mb-4 flex flex-col space-y-1">
            <div className="overflow-hidden">
              {isAnimationComplete && (
                <ScrollRevealText 
                  text="Welcome to"
                  delayOffset={0.5}
                  forceWhite={true}
                  className="text-2xl md:text-5xl font-black text-white uppercase tracking-tighter leading-none"
                />
              )}
            </div>
            <div className="overflow-hidden">
              {isAnimationComplete && (
                <ScrollRevealText 
                  text="UIU Photography Club"
                  delayOffset={0.7}
                  forceWhite={true}
                  className="text-2xl md:text-5xl font-black text-white uppercase tracking-tighter leading-none"
                />
              )}
            </div>
          </div>

          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={isAnimationComplete ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 1.6, duration: 0.8 }}
            className="text-white/60 text-[10px] md:text-sm font-medium leading-relaxed max-w-md"
          >
            We are a community of passionate photographers at United International University 
            dedicated to exploring the art of photography, sharing knowledge, and capturing campus life.
          </motion.p>
        </div>

        {/* Bottom Section: Buttons & Controls (Symmetrically Aligned) */}
        <div className="flex items-end justify-between w-full pointer-events-auto">
          
          {/* Left: CTA Buttons */}
          <div className="flex items-center gap-4 md:gap-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={isAnimationComplete ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 1.9, duration: 0.5 }}
            >
              <Link
                href="/join"
                className="inline-flex items-center gap-2 px-6 md:px-8 py-3 bg-white text-black text-[10px] font-black uppercase tracking-widest hover:bg-uiupc-orange hover:text-white transition-all rounded-sm shadow-xl"
              >
                Join
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="stroke-current">
                  <path d="M5 12H19M19 12L12 5M19 12L12 19" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={isAnimationComplete ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 2.1, duration: 0.5 }}
            >
              <Link
                href="/gallery"
                className="text-[10px] font-black text-white/50 hover:text-white uppercase tracking-widest transition-colors flex items-center gap-2 group whitespace-nowrap"
              >
                Gallery
                <div className="w-1 h-1 rounded-full bg-uiupc-orange scale-0 group-hover:scale-100 transition-transform" />
              </Link>
            </motion.div>
          </div>

          {/* Right: Navigation Controls (Indicators stacked on top of Arrows) */}
          <div className="flex flex-col items-end gap-3 md:gap-5">
            {/* Progress Indicators - Positioned Above Arrows */}
            <div className="flex gap-1.5 md:gap-3 mr-1">
              {carouselImages.map((_, i) => (
                <button
                  key={i}
                  onClick={() => { setIndex(i); setIsAutoPlay(false); }}
                  className={`h-[2px] md:h-1 transition-all duration-500 ${i === index ? 'w-6 md:w-12 bg-uiupc-orange' : 'w-2 md:w-4 bg-white/10'}`}
                />
              ))}
            </div>

            {/* Arrow Buttons - Aligned with CTA Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => { prev(); setIsAutoPlay(false); }}
                className="w-8 h-8 md:w-12 md:h-12 flex items-center justify-center border border-white/20 text-white hover:bg-white hover:text-black transition-all rounded-full"
              >
                <ChevronLeft />
              </button>
              <button
                onClick={() => { next(); setIsAutoPlay(false); }}
                className="w-8 h-8 md:w-12 md:h-12 flex items-center justify-center border border-white/20 text-white hover:bg-white hover:text-black transition-all rounded-full"
              >
                <ChevronRight />
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default HomeCarousel;
