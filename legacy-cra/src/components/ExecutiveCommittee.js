// components/ExecutiveCommittee.js
import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import "./ExecutiveCommittee.css";

const ExecutiveCommittee = ({ members }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  //const [direction, setDirection] = useState("next");
  const carouselRef = useRef(null);
  const autoPlayRef = useRef(null);

  // const getSocialIcon = (platform) => {
  //   switch (platform) {
  //     case "facebook":
  //       return <FaFacebook />;
  //     case "instagram":
  //       return <FaInstagram />;
  //     case "linkedin":
  //       return <FaLinkedin />;
  //     case "behance":
  //       return <FaBehance />;
  //     case "portfolio":
  //       return <FaGlobe />;
  //     default:
  //       return null;
  //   }
  // };

  const nextSlide = useCallback(() => {
    setCurrentIndex((prevIndex) =>
      prevIndex === members.length - 1 ? 0 : prevIndex + 1
    );
  }, [members.length]);

  const prevSlide = () => {
    //setDirection("prev");
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? members.length - 1 : prevIndex - 1
    );
  };

  const goToSlide = (index) => {
    //setDirection(index > currentIndex ? "next" : "prev");
    setCurrentIndex(index);
  };

  // Auto-play functionality
  useEffect(() => {
    autoPlayRef.current = setInterval(nextSlide, 4000);
    return () => clearInterval(autoPlayRef.current);
  }, [nextSlide]);

  const handleMouseEnter = () => {
    clearInterval(autoPlayRef.current);
  };

  const handleMouseLeave = () => {
    autoPlayRef.current = setInterval(nextSlide, 4000);
  };

  // const getVisibleCards = () => {
  //   const width = window.innerWidth;
  //   if (width < 768) return 1;
  //   if (width < 1200) return 2;
  //   return 3;
  // };

  //const visibleCards = getVisibleCards();
  //const cardWidth = 100 / visibleCards;

  // Calculate which cards are visible
  const getCardPosition = (index) => {
    const diff = (index - currentIndex + members.length) % members.length;
    if (diff === 0) return "center";
    if (diff === 1 || diff === -members.length + 1) return "right";
    if (diff === -1 || diff === members.length - 1) return "left";
    return "hidden";
  };

  return (
    <div
      className="executive-carousel"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="carousel-container" ref={carouselRef}>
        <div className="carousel-track">
          {members.map((member, index) => {
            const position = getCardPosition(index);
            return (
              <div
                key={member.id}
                className={`carousel-card ${position} ${
                  index === currentIndex ? "active" : ""
                }`}
                onClick={() => position !== "center" && goToSlide(index)}
              >
                <div className="card-content">
                  {/* Full Background Image */}
                  <div className="card-image">
                    <img
                      src={member.profileImage}
                      alt={member.name}
                      loading="lazy"
                      onError={(e) => {
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          member.name
                        )}&background=FF6B00&color=fff&size=300`;
                      }}
                    />
                  </div>

                  {/* Content Overlay */}
                  <div className="card-overlay">
                    <div className="member-info">
                      <h3 className="member-name">{member.name}</h3>
                      <div className="member-role">{member.role}</div>
                      <p className="member-department">{member.department}</p>

                      {/* <div className="social-links">
                        {member.social &&
                          Object.entries(member.social).map(
                            ([platform, url]) => (
                              <a
                                key={platform}
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`social-link ${platform}`}
                                aria-label={`${member.name}'s ${platform}`}
                              >
                                {getSocialIcon(platform)}
                              </a>
                            )
                          )}
                      </div> */}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation Controls (same as before) */}
      <div className="carousel-controls">
        <button className="carousel-btn prev-btn" onClick={prevSlide}>
          <FaChevronLeft />
        </button>

        <div className="carousel-indicators">
          {members.map((_, index) => (
            <button
              key={index}
              className={`indicator ${index === currentIndex ? "active" : ""}`}
              onClick={() => goToSlide(index)}
            />
          ))}
        </div>

        <button className="carousel-btn next-btn" onClick={nextSlide}>
          <FaChevronRight />
        </button>
      </div>
    </div>
  );
};

export default ExecutiveCommittee;
