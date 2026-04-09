// components/Stats.js - ENHANCED VERSION
import React, { useEffect, useRef, useState } from "react";
import {
  FaUsers,
  FaCalendarAlt,
  FaTrophy,
  FaStar,
  FaPhotoVideo,
} from "react-icons/fa";
import "./Stats.css";

const Stats = () => {
  const statsRef = useRef(null);
  const [animated, setAnimated] = useState(false);

  const stats = [
    {
      number: "100",
      label: "Active Members",
      icon: FaUsers,
      color: "#FF6B35",
      suffix: "+",
      description: "Passionate photographers",
    },
    {
      number: "50",
      label: "Events Organized",
      icon: FaCalendarAlt,
      color: "#2196F3",
      suffix: "+",
      description: "Successful gatherings",
    },
    {
      number: "25",
      label: "Awards Won",
      icon: FaTrophy,
      color: "#FFC107",
      suffix: "+",
      description: "National recognition",
    },
    {
      number: "100",
      label: "Workshops",
      icon: FaPhotoVideo,
      color: "#9C27B0",
      suffix: "+",
      description: "Skill development",
    },
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !animated) {
            setAnimated(true);
          }
        });
      },
      { threshold: 0.3 }
    );

    const currentStatsRef = statsRef.current;

    if (currentStatsRef) {
      observer.observe(currentStatsRef);
    }

    return () => {
      if (currentStatsRef) {
        observer.unobserve(currentStatsRef);
      }
    };
  }, [animated]);

  return (
    <section className="stats-section" ref={statsRef}>
      <div className="container">
        <div className="stats-header">
          <h2 className="stats-title gradient-text">Our Impact in Numbers</h2>
          <p className="stats-subtitle">
            Celebrating our journey through milestones and achievements that
            define our photography community
          </p>
          <div className="header-decoration">
            <div className="decoration-line"></div>
            <div className="decoration-icon">📊</div>
            <div className="decoration-line"></div>
          </div>
        </div>

        <div className="stats-grid">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <div
                key={index}
                className="stat-card glass-card"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="stat-icon-container">
                  <div
                    className="stat-icon-wrapper"
                    style={{
                      backgroundColor: `${stat.color}20`,
                      border: `2px solid ${stat.color}30`,
                    }}
                  >
                    <IconComponent
                      className="stat-icon"
                      style={{ color: stat.color }}
                    />
                  </div>
                </div>

                <div className="stat-content">
                  <div className="stat-number-container">
                    <span className="stat-number" style={{ color: stat.color }}>
                      {animated ? stat.number : "0"}
                    </span>
                    {stat.suffix && (
                      <span className="stat-suffix">{stat.suffix}</span>
                    )}
                  </div>

                  <h3 className="stat-label">{stat.label}</h3>
                  <p className="stat-description">{stat.description}</p>
                </div>

                {/* Animated background element */}
                <div
                  className="stat-glow"
                  style={{
                    background: `radial-gradient(circle, ${stat.color}20 0%, transparent 70%)`,
                  }}
                ></div>
              </div>
            );
          })}
        </div>

        <div className="stats-footer">
          <div className="achievement-badge">
            <FaStar className="badge-icon" />
            <span>Photography Community Since 2005</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Stats;
