// components/HeroSlider.js - TEMPORARY LOCAL VERSION
import React, { useState, useEffect, useRef } from "react";
import "./HeroSlider.css";

const HeroSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const videoRefs = useRef([]);
  const slideTimerRef = useRef(null);

  // Local slides data
  const localSlides = [
    {
      id: 1,
      imageUrl:
        "https://res.cloudinary.com/do0e8p5d2/image/upload/v1763054814/uiupc_HeroSlider1_d9kprm.jpg",
      title: "UIU Photography Club",
      subtitle: "Capturing Moments, Creating Memories",
      eventLink: "/committee-2026",
      type: "image",
      duration: 5000, // 5 seconds for images
    },
    {
      id: 2,
      imageUrl:
        "https://res.cloudinary.com/do0e8p5d2/image/upload/v1772526245/Artboard_2-100_woyw8v.jpg",
      title: "Join Our Community",
      subtitle: "Learn, Share, and Grow Together",
      eventLink: "/join",
      type: "image",
      duration: 5000, // 5 seconds for images
    },
    {
      id: 2,
      imageUrl:
        "https://res.cloudinary.com/do0e8p5d2/image/upload/v1772527954/Cover_mhro7f.jpg",
      title: "Iftar-e-Ziyafat",
      subtitle: "Lets Break Our Fast with UIUPC Family",
      eventLink: "https://forms.gle/u9jskfgWjqN12vd97",
      type: "image",
      duration: 5000, // 5 seconds for images
    },
    {
      id: 3,
      videoUrl:
        "https://res.cloudinary.com/do0e8p5d2/video/upload/v1763138349/Shutter_Stories_Chapter_4_-_2025_Promo_glsjvm.mp4",
      title: "Shutter Stories - Chapter IV",
      subtitle: "Showcase Your Talent",
      eventLink: "/committee-2026",
      type: "video",
      duration: 74000, // 74 seconds for video (1 min 14 sec)
    },
    {
      id: 4,
      imageUrl:
        "https://res.cloudinary.com/do0e8p5d2/image/upload/v1762121158/uiupc_HeroSlider2_cyl1xw.jpg",
      title: "Join Our Community",
      subtitle: "Learn, Share, and Grow Together",
      eventLink: "/committee-2026",
      type: "image",
      duration: 5000, // 5 seconds for images
    },
  ];

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
      // For images, use the timer
      startSlideTimer(currentSlideData.duration);
    }
    // For videos, we rely on the video end event

    // Handle video playback
    localSlides.forEach((slide, index) => {
      const videoRef = videoRefs.current[index];
      if (videoRef) {
        if (index === currentSlide && slide.type === "video") {
          // Reset and play the video from beginning
          videoRef.currentTime = 0;
          videoRef.play().catch((error) => {
            // If video fails to autoplay, fall back to timer
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
    videoRefs.current[index] = el;
    if (el) {
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
    return () => {
      videoRefs.current.forEach((videoRef) => {
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
          style={
            slide.type === "image"
              ? { backgroundImage: `url(${slide.imageUrl})` }
              : {}
          }
        >
          {slide.type === "video" && (
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
            {/* <div className="cta-buttons">
              <button
                onClick={() => {
                  if (
                    window.confirm(
                      "The result will be published soon. Stay tuned with us!\n\nClick OK to continue."
                    )
                  ) {
                    // You can add additional logic here if needed
                  }
                }}
                className="btn btn-secondary"
              >
                Shutter Stories - Chapter IV <br />
                View Results
              </button>
            </div> */}
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
