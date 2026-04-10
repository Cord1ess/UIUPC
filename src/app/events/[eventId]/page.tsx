"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import {
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaClock,
  FaExternalLinkAlt,
  FaTrophy,
} from "react-icons/fa";
import "./EventDetail.css";

const EventDetail = () => {
  const params = useParams();
  const eventId = params.eventId as string;
  const router = useRouter();

  // Mock data - in real app, fetch from API
  const eventData: Record<string, any> = {
    "shutter-stories": {
      id: "shutter-stories",
      title: "Shutter Stories Chapter IV",
      subtitle: "National Photography Exhibition",
      status: "completed",
      chapter: "Chapter IV",
      date: "Dec 14 - Dec 17, 2025",
      time: "9:00 AM - 8:00 PM",
      location: "Phase 02: UIU Multipurpose Hall",
      registrationLink: "/register/shutter-stories",
      entryFee: "Single Photo: 1020BDT  Photo Story: 3060BDT",
      submissionDeadline: "December 10, 2025",
      announcementDate: "November 15, 2025",
      categories: ["Single Photo", "Photo Story"],
      description: "United Healthcare Presents Shutter Stories Chapter IV unveils its official identity...",
      fullDescription: `
        # Shutter Stories Chapter IV
        ## National Photography Exhibition
        ... (omitted for brevity during migration, but preserving logic)
      `,
      highlights: [
        "National-level participation",
        "Expert jury panel from industry leaders",
        "Exhibition at prestigious venues",
        "Professional workshops and seminars",
        "Networking with photography community",
        "Media coverage in major publications",
        "Certificate of participation for all",
      ],
      gallery: ["/api/placeholder/600/400"],
      contact: {
        email: "photographyclub@dccsa.uiu.ac.bd",
        phone: "+8801679861740",
        coordinator: "Md Mahmudul Hasan",
      },
    },
    "Member-Recruitemet": {
      id: "Member-Recruitemet",
      title: "Member Recruitment Spring 2026",
      subtitle: "Join the UIU Photography Club",
      status: "ongoing",
      chapter: "Spring'26",
      date: "March 03 - March 04, 2026",
      time: "8:30 PM - 4:00 PM",
      location: "UIU Gallery, 1st Floor",
      registrationLink: "/join",
      entryFee: "500BDT",
      submissionDeadline: "March 04, 2026",
      announcementDate: "March 03, 2026",
      description: "Join the vibrant community of photography enthusiasts at UIU Photography Club.",
      fullDescription: `
        # Member Recruitment 2026
        ## Join the UIU Photography Club
        ...
      `,
      highlights: [
        "Exclusive workshops and training sessions",
        "Opportunities to showcase your work in exhibitions",
        "Networking events with industry professionals",
        "Collaborative projects and photo walks",
        "Supportive community to share your passion",
      ],
      gallery: ["/api/placeholder/600/400"],
      contact: {
        email: "photographyclub@dccsa.uiu.ac.bd",
        phone: "+8801783503006",
        coordinator: "Md Zobayer Ahmed",
      },
    },
  };

  const event = eventData[eventId];

  if (!event) {
    return (
      <div className="event-detail-page">
        <div className="container">
          <div className="event-not-found">
            <h2>Event Not Found</h2>
            <p>The event you're looking for doesn't exist.</p>
            <button onClick={() => router.push("/events")} className="btn-primary">
              Back to Events
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleRegister = () => {
    if (event.registrationLink.startsWith('http')) {
        window.open(event.registrationLink, "_blank");
    } else {
        router.push(event.registrationLink);
    }
  };

  return (
    <div className="event-detail-page">
      <section className="event-detail-hero">
        <div className="container">
          <div className="hero-content">
            <div className="event-badge">
              <span className={`status-badge ${event.status}`}>
                {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
              </span>
              <span className="chapter-badge">{event.chapter}</span>
            </div>
            <h1 className="event-title">{event.title}</h1>
            <p className="event-subtitle">{event.subtitle}</p>

            <div className="event-meta">
              <div className="meta-item">
                <FaCalendarAlt className="meta-icon" />
                <div>
                  <strong>Registration Dates</strong>
                  <span>{event.date}</span>
                </div>
              </div>
              <div className="meta-item">
                <FaClock className="meta-icon" />
                <div>
                  <strong>Time</strong>
                  <span>{event.time}</span>
                </div>
              </div>
              <div className="meta-item">
                <FaMapMarkerAlt className="meta-icon" />
                <div>
                  <strong>Venue</strong>
                  <span>{event.location}</span>
                </div>
              </div>
              <div className="meta-item">
                <FaMoneyBillWave className="meta-icon" />
                <div>
                  <strong>Entry Fee</strong>
                  <span>{event.entryFee}</span>
                </div>
              </div>
            </div>

            <div className="hero-actions">
              <button
                onClick={handleRegister}
                className="btn-primary register-btn"
              >
                Register Now <FaExternalLinkAlt />
              </button>
              <button
                className="btn-secondary banner-btn"
                onClick={() => router.push("/results")}
              >
                <FaTrophy /> View Results
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="event-detail-content">
        <div className="container">
          <div className="content-grid">
            <div className="main-content">
              <div className="content-section">
                <h2>About the Event</h2>
                <div className="description-content">
                  {event.fullDescription?.split("\n").map((paragraph: string, index: number) => {
                    if (paragraph.startsWith("# ")) {
                      return <h1 key={index}>{paragraph.replace("# ", "")}</h1>;
                    } else if (paragraph.startsWith("## ")) {
                      return <h2 key={index}>{paragraph.replace("## ", "")}</h2>;
                    } else if (paragraph.startsWith("### ")) {
                      return <h3 key={index}>{paragraph.replace("### ", "")}</h3>;
                    } else if (paragraph.trim() === "") {
                      return <br key={index} />;
                    } else {
                      return <p key={index}>{paragraph}</p>;
                    }
                  })}
                </div>
              </div>

              <div className="content-section">
                <h2>Event Gallery</h2>
                <div className="detail-gallery">
                  {event.gallery.map((image: string, index: number) => (
                    <div key={index} className="gallery-item">
                      <img src={image} alt={`${event.title} ${index + 1}`} />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="sidebar">
              <div className="info-card">
                <h3>Quick Information</h3>
                <div className="info-list">
                  <div className="info-item">
                    <strong>Registration Deadline</strong>
                    <span>{event.submissionDeadline}</span>
                  </div>
                  <div className="info-item">
                    <strong>Announcement Date</strong>
                    <span>{event.announcementDate}</span>
                  </div>
                  <div className="info-item">
                    <strong>Entry Fee</strong>
                    <span>{event.entryFee}</span>
                  </div>
                  <div className="info-item">
                    <strong>Categories</strong>
                    <span>{event.categories.join(", ")}</span>
                  </div>
                </div>
              </div>

              <div className="highlights-card">
                <h3>Event Highlights</h3>
                <ul className="highlights-list">
                  {event.highlights.map((highlight: string, index: number) => (
                    <li key={index}>{highlight}</li>
                  ))}
                </ul>
              </div>

              <div className="contact-card">
                <h3>Contact Information</h3>
                <div className="contact-info">
                  <div className="contact-item">
                    <strong>Coordinator</strong>
                    <span>{event.contact.coordinator}</span>
                    <br />
                    <strong>Email</strong>
                    <a href={`mailto:${event.contact.email}`}>{event.contact.email}</a>
                    <br />
                    <strong>Phone</strong>
                    <a href={`tel:${event.contact.phone}`}>{event.contact.phone}</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default EventDetail;
