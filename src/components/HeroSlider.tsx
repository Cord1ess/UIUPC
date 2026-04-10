"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";

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
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const slideTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Local slides data
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

  const startSlideTimer = (duration: number) => {
    if (slideTimerRef.current) clearTimeout(slideTimerRef.current);
    slideTimerRef.current = setTimeout(() => {
      setCurrentSlide((prev) => (prev + 1) % localSlides.length);
    }, duration);
  };

  useEffect(() => {
    const currentSlideData = localSlides[currentSlide];
    if (currentSlideData.type === "image") startSlideTimer(currentSlideData.duration);
    localSlides.forEach((slide, index) => {
      const videoRef = videoRefs.current[index];
      if (videoRef) {
        if (index === currentSlide && slide.type === "video") {
          videoRef.currentTime = 0;
          videoRef.play().catch(() => startSlideTimer(slide.duration));
        } else {
          videoRef.pause();
          videoRef.currentTime = 0;
        }
      }
    });

    return () => { if (slideTimerRef.current) clearTimeout(slideTimerRef.current); };
  }, [currentSlide, localSlides]);

  const handleVideoEnd = () => setCurrentSlide((prev) => (prev + 1) % localSlides.length);

  const addVideoRef = (el: HTMLVideoElement | null, index: number) => {
    if (el) {
      videoRefs.current[index] = el;
      el.addEventListener("ended", handleVideoEnd);
    }
  };

  const handleManualSlideChange = (index: number) => {
    if (slideTimerRef.current) clearTimeout(slideTimerRef.current);
    setCurrentSlide(index);
  };

  useEffect(() => {
    const refs = videoRefs.current;
    return () => {
      refs.forEach((videoRef) => { if (videoRef) videoRef.removeEventListener("ended", handleVideoEnd); });
      if (slideTimerRef.current) clearTimeout(slideTimerRef.current);
    };
  }, []);

  return (
    <div className="relative h-[600px] md:h-[750px] w-full bg-black overflow-hidden">
      {localSlides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
          }`}
        >
          {slide.type === "image" ? (
            <img 
              src={slide.imageUrl} 
              alt={slide.title} 
              className="w-full h-full object-cover opacity-80"
              onError={(e) => {
                e.currentTarget.src = 'https://res.cloudinary.com/do0e8p5d2/image/upload/v1763054814/uiupc_HeroSlider1_d9kprm.jpg';
              }}
            />
          ) : (
            <video
              ref={(el) => addVideoRef(el, index)}
              className="w-full h-full object-cover opacity-70"
              muted
              playsInline
            >
              <source src={slide.videoUrl} type="video/mp4" />
            </video>
          )}

          <div className="absolute inset-0 bg-black/40 z-10" />
          
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 z-20">
            <h1 className={`text-white text-4xl md:text-7xl font-black uppercase tracking-tighter mb-4 transition-all duration-700 delay-300 ${
              index === currentSlide ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
            }`}>
              {slide.title}
            </h1>
            <p className={`text-uiupc-orange text-sm md:text-base font-black uppercase tracking-[0.4em] mb-12 transition-all duration-700 delay-500 ${
              index === currentSlide ? "opacity-100" : "opacity-0"
            }`}>
              {slide.subtitle}
            </p>
            <div className={`transition-all duration-700 delay-700 ${
               index === currentSlide ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
            }`}>
              <a 
                href={slide.eventLink} 
                className="inline-flex px-10 py-4 bg-transparent text-white text-xs font-black uppercase tracking-widest border-2 border-white transition-all hover:bg-white hover:text-black"
              >
                View Details
              </a>
            </div>
          </div>
        </div>
      ))}

      {localSlides.length > 1 && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-3 z-30">
          {localSlides.map((_, index) => (
            <button
              key={index}
              className={`h-1 transition-all duration-500 ${
                index === currentSlide ? "bg-uiupc-orange w-12" : "bg-white/20 w-8 hover:bg-white/40"
              }`}
              onClick={() => handleManualSlideChange(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default HeroSlider;
