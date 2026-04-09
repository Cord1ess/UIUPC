// components/HeroSlider.js
"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import "./HeroSlider.css";

const HeroSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const videoRefs = useRef([]);
  const slideTimerRef = useRef(null);

  // Local slides data
  const localSlides = useMemo(() => [
    {
      id: 1,
      imageUrl:
        "https://res.cloudinary.com/do0e8p5d2/image/upload/v1763054814/uiupc_HeroSlider1_d9kprm.jpg",
      title: "UIU Photography Club",
      subtitle: "Capturing Moments, Creating Memories",
      eventLink: "/committee-2026",
      type: "image",
      duration: 5000, 
    },
    {
      id: 2,
      imageUrl:
        "https://res.cloudinary.com/do0e8p5d2/image/upload/v1772526245/Artboard_2-100_woyw8v.jpg",
      title: "Join Our Community",
      subtitle: "Learn, Share, and Grow Together",
      eventLink: "/join",
      type: "image",
      duration: 5000,
    },
    {
      id: 3,
      imageUrl:
        "https://res.cloudinary.com/do0e8p5d2/image/upload/v1772527954/Cover_mhro7f.jpg",
      title: "Iftar-e-Ziyafat",
      subtitle: "Lets Break Our Fast with UIUPC Family",
      eventLink: "https://forms.gle/u9jskfgWjqN12vd97",
      type: "image",
      duration: 5000,
    },
    {
      id: 4,
      videoUrl:
        "https://res.cloudinary.com/do0e8p5d2/video/upload/v1763138349/Shutter_Stories_Chapter_4_-_2025_Promo_glsjvm.mp4",
      title: "Shutter Stories - Chapter IV",
      subtitle: "Showcase Your Talent",
      eventLink: "/committee-2026",
      type: "video",
      duration: 74000,
    },
    {
      id: 5,
      imageUrl:
        "https://res.cloudinary.com/do0e8p5d2/image/upload/v1762121158/uiupc_HeroSlider2_cyl1xw.jpg",
      title: "Join Our Community",
      subtitle: "Learn, Share, and Grow Together",
      eventLink: "/committee-2026",
      type: "image",
      duration: 5000,
    },
  ], []);

  // Function to start slide timer
  const startSlideTimer = (duration) => {
    if (slideTimerRef.current) {
      clearTimeout(slideTimerRef.current);
    }

    slideTimerRef.current = setTimeout(() => {
      setCurrentSlide((prev) => (prev + 1) % localSlides.length);
    }, duration);
  };

  // Handle slide changes
  useEffect(() => {
    const currentSlideData = localSlides[currentSlide];

    if (currentSlideData.type === "image") {
      startSlideTimer(currentSlideData.duration);
    }

    localSlides.forEach((slide, index) => {
      const videoRef = videoRefs.current[index];
      if (videoRef) {
        if (index === currentSlide && slide.type === "video") {
          videoRef.currentTime = 0;
          videoRef.play().catch(() => {
            startSlideTimer(slide.duration);
          });
        } else {
          videoRef.pause();
          videoRef.currentTime = 0;
        }
      }
    });

    return () => {
      if (slideTimerRef.current) {
        clearTimeout(slideTimerRef.current);
      }
    };
  }, [currentSlide, localSlides]);

  // Handle video end to move to next slide
  const handleVideoEnd = () => {
    setCurrentSlide((prev) => (prev + 1) % localSlides.length);
  };

  const addVideoRef = (el, index) => {
    if (el) {
      videoRefs.current[index] = el;
      el.addEventListener("ended", handleVideoEnd);
    }
  };

  // Handle manual slide change via indicators
  const handleManualSlideChange = (index) => {
    if (slideTimerRef.current) {
      clearTimeout(slideTimerRef.current);
    }
    setCurrentSlide(index);
  };

  // Cleanup event listeners
  useEffect(() => {
    const refs = videoRefs.current;
    return () => {
      refs.forEach((videoRef) => {
        if (videoRef) {
          videoRef.removeEventListener("ended", handleVideoEnd);
        }
      });
      if (slideTimerRef.current) {
        clearTimeout(slideTimerRef.current);
      }
    };
  }, []);

  return (
    <div className="hero-slider">
      {localSlides.map((slide, index) => (
        <div
          key={slide.id}
          className={`slide ${index === currentSlide ? "active" : ""}`}
        >
          {slide.type === "image" ? (
            <img 
              src={slide.imageUrl} 
              alt={slide.title} 
              className="slide-image"
              onError={(e) => {
                e.currentTarget.src = 'https://res.cloudinary.com/do0e8p5d2/image/upload/v1762121162/uiupc_HeroSlider3_wrpuvz.jpg';
              }}
            />
          ) : (
            <video
              ref={(el) => addVideoRef(el, index)}
              className="slide-video"
              muted
              playsInline
            >
              <source src={slide.videoUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          )}
          <div className="slide-overlay"></div>
          <div className="slide-content">
            <h1>{slide.title}</h1>
            <p>{slide.subtitle}</p>
            <div className="cta-buttons">
              <a href={slide.eventLink} className="btn btn-secondary">
                Join With US
              </a>
            </div>
          </div>
        </div>
      ))}

      {localSlides.length > 1 && (
        <div className="slider-indicators">
          {localSlides.map((_, index) => (
            <button
              key={index}
              className={`indicator ${index === currentSlide ? "active" : ""}`}
              onClick={() => handleManualSlideChange(index)}
            ></button>
          ))}
        </div>
      )}
    </div>
  );
};

export default HeroSlider;
