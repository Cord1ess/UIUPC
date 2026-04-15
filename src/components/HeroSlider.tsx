"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useTheme } from "../contexts/ThemeContext";

interface Slide {
  id: number;
  imageUrl?: string;
  videoUrl?: string;
  title: string;
  subtitle: string;
  eventLink: string;
  type: "image" | "video";
  duration: number;
}

const HeroSlider: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const { theme } = useTheme();
  
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const slideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const localSlides: Slide[] = useMemo(() => [
    {
      id: 1,
      imageUrl: "https://res.cloudinary.com/do0e8p5d2/image/upload/v1763054814/uiupc_HeroSlider1_d9kprm.jpg",
      title: "UIU PHOTOGRAPHY CLUB",
      subtitle: "CAPTURING MOMENTS • CREATING MEMORIES",
      eventLink: "/committee-2026",
      type: "image",
      duration: 5000, 
    },
    {
      id: 2,
      imageUrl: "https://res.cloudinary.com/do0e8p5d2/image/upload/v1772526245/Artboard_2-100_woyw8v.jpg",
      title: "JOIN OUR COMMUNITY",
      subtitle: "LEARN • SHARE • GROW TOGETHER",
      eventLink: "/join",
      type: "image",
      duration: 5000,
    },
    {
      id: 3,
      imageUrl: "https://res.cloudinary.com/do0e8p5d2/image/upload/v1772527954/Cover_mhro7f.jpg",
      title: "IFTAR-E-ZIYAFAT",
      subtitle: "BREAK FAST WITH UIUPC FAMILY",
      eventLink: "https://forms.gle/u9jskfgWjqN12vd97",
      type: "image",
      duration: 5000,
    },
    {
      id: 4,
      videoUrl: "https://res.cloudinary.com/do0e8p5d2/video/upload/v1763138349/Shutter_Stories_Chapter_4_-_2025_Promo_glsjvm.mp4",
      title: "SHUTTER STORIES IV",
      subtitle: "SHOWCASE YOUR VISUAL TALENT",
      eventLink: "/committee-2026",
      type: "video",
      duration: 74000,
    },
    {
      id: 5,
      imageUrl: "https://res.cloudinary.com/do0e8p5d2/image/upload/v1762121158/uiupc_HeroSlider2_cyl1xw.jpg",
      title: "CULTURAL DISCOVERY",
      subtitle: "EXPLORING MOMENTS THROUGH LENS",
      eventLink: "/committee-2026",
      type: "image",
      duration: 5000,
    },
  ], []);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % localSlides.length);
  }, [localSlides.length]);

  const startSlideTimer = useCallback((duration: number) => {
    if (slideTimerRef.current) clearTimeout(slideTimerRef.current);
    if (!isHovered) {
      slideTimerRef.current = setTimeout(nextSlide, duration);
    }
  }, [isHovered, nextSlide]);

  useEffect(() => {
    const slide = localSlides[currentSlide];
    
    // Video handling
    const videos = videoRefs.current;
    videos.forEach((v, i) => {
      if (v) {
        if (i === currentSlide && slide.type === "video") {
          v.currentTime = 0;
          v.play().catch(() => startSlideTimer(slide.duration));
        } else {
          v.pause();
        }
      }
    });

    if (slide.type === "image") {
      startSlideTimer(slide.duration);
    }

    return () => {
      if (slideTimerRef.current) clearTimeout(slideTimerRef.current);
    };
  }, [currentSlide, localSlides, startSlideTimer]);

  const handleManualChange = (index: number) => {
    if (slideTimerRef.current) clearTimeout(slideTimerRef.current);
    setCurrentSlide(index);
  };

  return (
    <div 
      className="relative w-full h-[500px] md:h-[650px] overflow-hidden group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0"
        >
          {localSlides[currentSlide].type === "image" ? (
            <motion.img
              src={localSlides[currentSlide].imageUrl}
              alt=""
              className="w-full h-full object-cover"
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              transition={{ duration: 10, ease: "linear" }}
            />
          ) : (
            <video
              ref={(el) => { videoRefs.current[currentSlide] = el; }}
              onEnded={nextSlide}
              className="w-full h-full object-cover"
              muted
              playsInline
              autoPlay
            >
              <source src={localSlides[currentSlide].videoUrl} type="video/mp4" />
            </video>
          )}

          {/* Minimalist Bottom Gradient for text readability */}
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />

          {/* Content Overlay */}
          <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-20 z-20">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="max-w-4xl"
            >
              <span className="text-uiupc-orange text-[10px] md:text-sm font-black uppercase tracking-[0.4em] mb-4 block">
                {localSlides[currentSlide].subtitle}
              </span>
              <h2 className="text-4xl md:text-7xl font-black text-white uppercase tracking-tighter mb-8 leading-[0.9]">
                {localSlides[currentSlide].title.split(' ').map((word, i, arr) => (
                  <React.Fragment key={i}>
                    <span className={i === arr.length - 1 ? "font-serif italic font-normal normal-case tracking-normal" : ""}>
                      {word}
                    </span>
                    {i < arr.length - 1 && ' '}
                  </React.Fragment>
                ))}
              </h2>
              <Link
                href={localSlides[currentSlide].eventLink}
                className={`inline-flex items-center px-8 py-3.5 rounded-full text-[10px] md:text-xs font-black uppercase tracking-widest transition-all
                  ${theme === 'dark' ? 'bg-white text-black hover:bg-neutral-200' : 'bg-white text-black hover:shadow-lg hover:scale-105'}`}
              >
                Discover More
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Modern Pill Indicators */}
      <div className="absolute bottom-6 right-8 md:right-20 flex items-center gap-1.5 z-40">
        {localSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => handleManualChange(index)}
            className="relative h-4 flex items-center px-1 group/pill"
            aria-label={`Slide ${index + 1}`}
          >
            <div 
              className={`h-1 rounded-full transition-all duration-500 ease-out
                ${index === currentSlide 
                  ? "bg-uiupc-orange w-10 ring-1 ring-uiupc-orange/50 ring-offset-2 ring-offset-black/20" 
                  : "bg-white/40 w-5 hover:bg-white/60"
                }`}
            />
          </button>
        ))}
      </div>
    </div>
  );
};

export default HeroSlider;
