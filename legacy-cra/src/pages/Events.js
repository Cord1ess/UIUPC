// pages/Events.js
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
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

const Events = () => {
  const [activeEvent, setActiveEvent] = useState("shutter-stories");
  const [isPlaying, setIsPlaying] = useState(true);
  const [timeLeft, setTimeLeft] = useState({});
  const navigate = useNavigate();

  // Calculate time until December 15, 2024
  const calculateTimeLeft = () => {
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
  };

  useEffect(() => {
    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Add this function to handle registration
  const handleRegisterClick = (eventId) => {
    if (eventId === "shutter-stories") {
      // Open registration form in a new tab or modal
      window.open("/register/shutter-stories", "_blank");
      // Or use navigate if you want same page
      // navigate('/register/shutter-stories');
    } else if (eventId === "Member-Recruitemet") {
      navigate("/register/Member-Recruitemet");
    } else {
      navigate(`/events/${eventId}`);
    }
  };

  // Add this function to handle view details
  const handleViewDetails = (eventId) => {
    navigate(`/events/${eventId}`);
  };

  const signatureEvents = useMemo(
    () => ({
      /* Mock data removed to optimize bundle size */
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
      const events = Object.keys(signatureEvents);
      const currentIndex = events.indexOf(activeEvent);
      const nextIndex = (currentIndex + 1) % events.length;
      setActiveEvent(events[nextIndex]);
    }
  }, [activeEvent, isPlaying, signatureEvents]);

  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(handleAutoPlay, 5000);
    }
    return () => clearInterval(interval);
  }, [handleAutoPlay, isPlaying]);

  const currentEvent = signatureEvents[activeEvent];

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
                {/* <div className="stat">
                  <span className="stat-number">10+</span>
                  <span className="stat-label">Events</span>
                </div>
                <div className="stat">
                  <span className="stat-number">2000+</span>
                  <span className="stat-label">Participants</span>
                </div> */}
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

            {/* Working Countdown Timer */}
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
                className="btn-primary  banner-btn"
                onClick={() => navigate("/results")}
              >
                <FaTrophy /> View Results
              </button>
              <button
                className="btn-secondary banner-btn"
                onClick={() => handleViewDetails("shutter-stories")}
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

          {/* Event Navigation */}
          <div className="events-navigation">
            <div className="nav-controls">
              {Object.values(signatureEvents).map((event) => (
                <button
                  key={event.id}
                  className={`nav-item ${
                    activeEvent === event.id ? "active" : ""
                  }`}
                  onClick={() => setActiveEvent(event.id)}
                >
                  <span className="nav-icon">
                    {event.id === "shutter-stories"
                      ? "🎭"
                      : event.id === "muthography"
                      ? "📱"
                      : event.id === "photo-carnival"
                      ? "🎪"
                      : "📸"}
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

          {/* Event Details - Updated with navigation */}
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
                  {currentEvent.time && (
                    <div className="info-item">
                      <FaCalendarAlt className="info-icon" />
                      <span>{currentEvent.time}</span>
                    </div>
                  )}
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
                    {currentEvent.highlights.map((highlight, index) => (
                      <div key={index} className="highlight-item">
                        <div className="highlight-bullet"></div>
                        <span>{highlight}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="event-stats">
                  {Object.entries(currentEvent.stats).map(([key, value]) => (
                    <div key={key} className="stat-card">
                      <span className="stat-value">{value}</span>
                      <span className="stat-name">
                        {key.charAt(0).toUpperCase() + key.slice(1)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="event-actions">
                  {currentEvent.status === "upcoming" && (
                    <button
                      className="btn-primary"
                      onClick={() => handleRegisterClick(currentEvent.id)}
                    >
                      Submit Now <FaArrowRight />
                    </button>
                  )}
                  <button
                    className="btn-secondary"
                    onClick={() => handleViewDetails(currentEvent.id)}
                  >
                    <FaEye /> View Details
                  </button>
                  {currentEvent.registrationLink && (
                    <button className="btn-secondary">Download Brochure</button>
                  )}
                </div>
              </div>
            </div>

            {/* Event Gallery Preview */}
            <div className="event-gallery">
              <h4>Gallery Preview</h4>
              <div className="gallery-grid">
                {currentEvent.gallery.map((image, index) => (
                  <div key={index} className="gallery-item">
                    <img
                      src={image}
                      alt={`${currentEvent.title} ${index + 1}`}
                    />
                    <div className="gallery-overlay">
                      <span>View</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Events Timeline */}
      {/* <section className="events-timeline">
        <div className="container">
          <div className="section-header">
            <h2>Event Timeline</h2>
            <p>Our journey through remarkable photographic events</p>
          </div>
          <div className="timeline">
            {Object.values(signatureEvents).map((event, index) => (
              <div key={event.id} className={`timeline-item ${event.status}`}>
                <div className="timeline-marker">
                  <div className="marker-dot"></div>
                  <div className="marker-line"></div>
                </div>
                <div className="timeline-content">
                  <div className="timeline-header">
                    <h3>{event.title}</h3>
                    <span className="timeline-date">{event.date}</span>
                  </div>
                  <p className="timeline-description">{event.description}</p>
                  <div className="timeline-stats">
                    <span>{event.stats.participants}</span>
                    <span>{event.stats.photos}</span>
                    <span>{event.chapter}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section> */}

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
                onClick={() => (window.location.href = "/events")}
              >
                View All Events
              </button>
              <button
                className="btn-secondary cta-btn"
                onClick={() => (window.location.href = "/join")}
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

export default Events;
