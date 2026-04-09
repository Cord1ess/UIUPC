// src/app/events/page.tsx
"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaUsers,
  FaCamera,
  FaArrowRight,
  FaPlay,
  FaPause,
  FaEye,
  FaTrophy,
} from "react-icons/fa";
import "./Events.css";

const EventsPage = () => {
  const [activeEvent, setActiveEvent] = useState("shutter-stories");
  const [isPlaying, setIsPlaying] = useState(true);
  const [timeLeft, setTimeLeft] = useState<{days: number, hours: number, minutes: number, seconds: number}>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const router = useRouter();

  // Calculate time until December 17, 2025
  const calculateTimeLeft = useCallback(() => {
    const eventDate = new Date("December 17, 2025 24:00:00").getTime();
    const now = new Date().getTime();
    const difference = eventDate - now;

    if (difference > 0) {
      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor(
          (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        ),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000),
      };
    }
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }, []);

  useEffect(() => {
    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [calculateTimeLeft]);

  const signatureEvents = useMemo(
    () => ({
      "shutter-stories": {
        id: "shutter-stories",
        title: "Shutter Stories",
        subtitle: "National Photography Exhibition",
        status: "completed",
        chapter: "Chapter IV",
        date: "TBA",
        location: "UIU Multipurpose Hall",
        description: "Official photography exhibition of UIUPC.",
        fullDescription: "Details coming soon.",
        entryFee: "TBA",
        submissionDeadline: "TBA",
        highlights: [],
        stats: { participants: "0", photos: "0", chapters: "4", awards: "0" },
        image: "https://res.cloudinary.com/do0e8p5d2/image/upload/v1762799836/Blog5_lbkrue.png",
        gallery: [],
      }
    }),
    []
  );

  const handleAutoPlay = useCallback(() => {
    if (isPlaying) {
      const eventKeys = Object.keys(signatureEvents);
      const currentIndex = eventKeys.indexOf(activeEvent);
      const nextIndex = (currentIndex + 1) % eventKeys.length;
      setActiveEvent(eventKeys[nextIndex]);
    }
  }, [activeEvent, isPlaying, signatureEvents]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(handleAutoPlay, 5000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [handleAutoPlay, isPlaying]);

  const handleRegisterClick = (eventId: string) => {
    if (eventId === "shutter-stories") {
      window.open("/register/shutter-stories", "_blank");
    } else {
      router.push(`/events/${eventId}`);
    }
  };

  const currentEvent = (signatureEvents as any)[activeEvent];

  return (
    <div className="events-page">
      {/* Grand Header */}
      <section className="events-hero">
        <div className="hero-background">
          <div className="hero-overlay"></div>
          <div className="floating-elements">
            <div className="floating-camera"></div>
            <div className="floating-lens"></div>
            <div className="floating-aperture"></div>
          </div>
        </div>
        <div className="hero-content">
          <div className="container">
            <div className="hero-text">
              <h1 className="hero-title">
                <span className="title-line">UIU Photography Club</span>
                <span className="title-line highlight">Signature Events</span>
              </h1>
              <p className="hero-subtitle">
                Experience the pinnacle of photographic excellence through our
                signature events that celebrate creativity, talent, and visual
                storytelling
              </p>
              <div className="hero-stats">
                <div className="stat">
                  <span className="stat-number">50K+</span>
                  <span className="stat-label">Prize Pools</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="hero-scroll-indicator">
          <div className="scroll-arrow"></div>
        </div>
      </section>

      {/* Upcoming Event Banner */}
      <section className="upcoming-banner">
        <div className="container">
          <div className="banner-content">
            <div className="banner-badge">
              <span className="badge-text">Completed Event</span>
              <div className="badge-pulse"></div>
            </div>
            <h2 className="banner-title">Shutter Stories Chapter IV</h2>
            <p className="banner-subtitle">
              Result Have Been Published • December 14, 2025
            </p>
            <h2 className="banner-title">Registration is Closed</h2>
            <p className="banner-subtitle">
              Registration Deadline • December 17, 2025
            </p>

            <div className="banner-countdown">
              <div className="countdown-item">
                <span className="countdown-number">
                  {String(timeLeft.days).padStart(2, "0")}
                </span>
                <span className="countdown-label">Days</span>
              </div>
              <div className="countdown-item">
                <span className="countdown-number">
                  {String(timeLeft.hours).padStart(2, "0")}
                </span>
                <span className="countdown-label">Hours</span>
              </div>
              <div className="countdown-item">
                <span className="countdown-number">
                  {String(timeLeft.minutes).padStart(2, "0")}
                </span>
                <span className="countdown-label">Minutes</span>
              </div>
              <div className="countdown-item">
                <span className="countdown-number">
                  {String(timeLeft.seconds).padStart(2, "0")}
                </span>
                <span className="countdown-label">Seconds</span>
              </div>
            </div>

            <div className="banner-actions">
              <button
                className="btn-primary banner-btn"
                onClick={() => router.push("/results")}
              >
                <FaTrophy /> View Results
              </button>
              <button
                className="btn-secondary banner-btn"
                onClick={() => router.push(`/events/shutter-stories`)}
              >
                <FaEye /> View Details
              </button>
              <button
                className="btn-secondary banner-btn"
                onClick={() => handleRegisterClick("shutter-stories")}
              >
                Submit Now <FaArrowRight />
              </button>
            </div>
          </div>
          <div className="banner-visual">
            <div className="visual-glow"></div>
            <div className="visual-frame">
              <img
                src="https://res.cloudinary.com/do0e8p5d2/image/upload/v1763223291/Blog_7_suqqrn.jpg"
                alt="Shutter Stories"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Signature Events Section */}
      <section className="signature-events">
        <div className="container">
          <div className="section-header">
            <h2>Signature Events</h2>
            <p>
              Discover our premier photography events that define excellence
            </p>
            <div className="header-decoration">
              <div className="decoration-line"></div>
              <FaCamera className="decoration-icon" />
              <div className="decoration-line"></div>
            </div>
          </div>

          <div className="events-navigation">
            <div className="nav-controls">
              {Object.values(signatureEvents).map((event: any) => (
                <button
                  key={event.id}
                  className={`nav-item ${
                    activeEvent === event.id ? "active" : ""
                  }`}
                  onClick={() => setActiveEvent(event.id)}
                >
                  <span className="nav-icon">
                    {event.id === "shutter-stories" ? "🎭" : "📸"}
                  </span>
                  <span className="nav-text">{event.title}</span>
                </button>
              ))}
            </div>
            <button
              className="auto-play-btn"
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? <FaPause /> : <FaPlay />}
            </button>
          </div>

          <div className="event-details">
            <div className="event-hero">
              <div className="event-image">
                <img src={currentEvent.image} alt={currentEvent.title} />
                <div className="event-status">
                  <span className={`status-badge ${currentEvent.status}`}>
                    {currentEvent.status === "upcoming"
                      ? "Upcoming"
                      : currentEvent.status === "ongoing"
                      ? "Ongoing"
                      : "Completed"}
                  </span>
                </div>
              </div>

              <div className="event-content">
                <div className="event-header">
                  <h3 className="event-title">{currentEvent.title}</h3>
                  <p className="event-subtitle">{currentEvent.subtitle}</p>
                  <div className="event-chapter">{currentEvent.chapter}</div>
                </div>

                <div className="event-info">
                  <div className="info-item">
                    <FaCalendarAlt className="info-icon" />
                    <span>{currentEvent.date}</span>
                  </div>
                  <div className="info-item">
                    <FaMapMarkerAlt className="info-icon" />
                    <span>{currentEvent.location}</span>
                  </div>
                  <div className="info-item">
                    <FaUsers className="info-icon" />
                    <span>{currentEvent.stats.participants} Participants</span>
                  </div>
                </div>

                <p className="event-description">{currentEvent.description}</p>

                <div className="event-highlights">
                  <h4>Event Highlights</h4>
                  <div className="highlights-grid">
                    {(currentEvent.highlights as string[]).map((highlight, index) => (
                      <div key={index} className="highlight-item">
                        <div className="highlight-bullet"></div>
                        <span>{highlight}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="event-stats">
                  {Object.entries(currentEvent.stats).map(([key, value]: [string, any]) => (
                    <div key={key} className="stat-card">
                      <span className="stat-value">{value}</span>
                      <span className="stat-name">
                        {key.charAt(0).toUpperCase() + key.slice(1)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="event-actions">
                  <button
                    className="btn-secondary"
                    onClick={() => router.push(`/events/${currentEvent.id}`)}
                  >
                    <FaEye /> View Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="events-cta">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Capture Moments With Us?</h2>
            <p>
              Join our next event and showcase your photography talent to the
              world
            </p>
            <div className="cta-actions">
              <button
                className="btn-primary cta-btn"
                onClick={() => router.push("/events")}
              >
                View All Events
              </button>
              <button
                className="btn-secondary cta-btn"
                onClick={() => router.push("/join")}
              >
                Become a Member
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default EventsPage;
