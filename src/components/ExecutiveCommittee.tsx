"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import "./ExecutiveCommittee.css";

interface CommitteeMember {
  id?: string | number;
  name: string;
  role: string;
  department?: string;
  profileImage?: string;
}

interface ExecutiveCommitteeProps {
  members: CommitteeMember[];
}

const ExecutiveCommittee: React.FC<ExecutiveCommitteeProps> = ({ members }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prevIndex) =>
      prevIndex === members.length - 1 ? 0 : prevIndex + 1
    );
  }, [members.length]);

  const prevSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? members.length - 1 : prevIndex - 1
    );
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  useEffect(() => {
    autoPlayRef.current = setInterval(nextSlide, 4000);
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [nextSlide]);

  const handleMouseEnter = () => {
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
  };

  const handleMouseLeave = () => {
    autoPlayRef.current = setInterval(nextSlide, 4000);
  };

  const getCardPosition = (index: number) => {
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
                key={member.id || index}
                className={`carousel-card ${position} ${
                  index === currentIndex ? "active" : ""
                }`}
                onClick={() => position !== "center" && goToSlide(index)}
              >
                <div className="card-content">
                  <div className="card-image">
                    <img
                      src={member.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=FF6B00&color=fff&size=300`}
                      alt={member.name}
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          member.name
                        )}&background=FF6B00&color=fff&size=300`;
                      }}
                    />
                  </div>

                  <div className="card-overlay">
                    <div className="member-info">
                      <h3 className="member-name">{member.name}</h3>
                      <div className="member-role">{member.role}</div>
                      <p className="member-department">{member.department}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

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
