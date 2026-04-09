// components/UpcomingEvents.js
import React from 'react';
import { Link } from 'react-router-dom';
import { FaCalendarAlt, FaMapMarkerAlt, FaUsers, FaArrowRight, FaClock, FaImage } from 'react-icons/fa';
import './UpcomingEvents.css';

const UpcomingEvents = ({ events }) => {
  const upcomingEvents = events.slice(0, 3);

  const getStatusColor = (status) => {
    switch (status) {
      case 'upcoming':
        return '#FFC107';
      case 'ongoing':
        return '#4CAF50';
      case 'completed':
        return '#9E9E9E';
      default:
        return '#FF6B35';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'upcoming':
        return 'Upcoming';
      case 'ongoing':
        return 'Ongoing';
      case 'completed':
        return 'Completed';
      default:
        return status;
    }
  };

  // Default event images
  const getEventImage = (event) => {
    // If event has a valid image, use it
    if (event.image && event.image.startsWith('http')) {
      return event.image;
    }
    
    // Fallback to themed images based on event type
    if (event.title?.toLowerCase().includes('workshop')) {
      return 'https://images.unsplash.com/photo-1551818255-e6e10975bc17?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80';
    } else if (event.title?.toLowerCase().includes('exhibition')) {
      return 'https://images.unsplash.com/photo-1563089145-599997674d42?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80';
    } else if (event.title?.toLowerCase().includes('shutter')) {
      return 'https://res.cloudinary.com/do0e8p5d2/image/upload/v1762799836/Blog5_lbkrue.png';
    } else if (event.title?.toLowerCase().includes('iftar')) {
      return 'https://res.cloudinary.com/do0e8p5d2/image/upload/v1772527923/Post_air114.jpg';
    } else if (event.title?.toLowerCase().includes('member')) {
      return 'https://res.cloudinary.com/do0e8p5d2/image/upload/v1772526242/Artboard_1-100_u1jtvp.jpg';
    } else {
      // Default photography event image
      return 'https://res.cloudinary.com/do0e8p5d2/image/upload/v1762121162/uiupc_HeroSlider3_wrpuvz.jpg';
    }
  };

  const handleImageError = (e) => {
    const defaultImages = [
      'https://res.cloudinary.com/do0e8p5d2/image/upload/v1762121162/uiupc_HeroSlider3_wrpuvz.jpg',
      'https://images.unsplash.com/photo-1563089145-599997674d42?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1551818255-e6e10975bc17?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'
    ];
    const randomImage = defaultImages[Math.floor(Math.random() * defaultImages.length)];
    e.target.src = randomImage;
  };

  return (
    <section className="upcoming-events-section">
      <div className="upcoming-events-grid">
        {upcomingEvents.map((event, index) => (
          <div 
            key={event.id} 
            className="event-card glass-card"
            style={{ animationDelay: `${index * 0.2}s` }}
          >
            <div className="event-header">
              <div className="event-badges">
                <span 
                  className="status-badge"
                  style={{ 
                    backgroundColor: `${getStatusColor(event.status)}20`,
                    border: `1px solid ${getStatusColor(event.status)}50`,
                    color: getStatusColor(event.status)
                  }}
                >
                  {getStatusText(event.status)}
                </span>
                <span className="chapter-badge">
                  {event.chapter}
                </span>
              </div>
              <div className="event-image">
                <img 
                  src={getEventImage(event)} 
                  alt={event.title}
                  onError={handleImageError}
                  loading="lazy"
                />
                <div className="event-overlay"></div>
                <div className="image-fallback">
                  <FaImage className="fallback-icon" />
                  <span>Event Image</span>
                </div>
              </div>
            </div>

            <div className="event-content">
              <h3 className="event-title">{event.title}</h3>
              <p className="event-subtitle">{event.subtitle}</p>

              <div className="event-meta">
                <div className="meta-item">
                  <FaCalendarAlt className="meta-icon" />
                  <div>
                    <span className="meta-label">Date</span>
                    <span className="meta-value">{event.date}</span>
                  </div>
                </div>
                <div className="meta-item">
                  <FaClock className="meta-icon" />
                  <div>
                    <span className="meta-label">Time</span>
                    <span className="meta-value">{event.time}</span>
                  </div>
                </div>
                <div className="meta-item">
                  <FaMapMarkerAlt className="meta-icon" />
                  <div>
                    <span className="meta-label">Venue</span>
                    <span className="meta-value">{event.location}</span>
                  </div>
                </div>
                <div className="meta-item">
                  <FaUsers className="meta-icon" />
                  <div>
                    <span className="meta-label">Entry</span>
                    <span className="meta-value">{event.entryFee}</span>
                  </div>
                </div>
              </div>

              <p className="event-description">
                {event.description}
              </p>

              <div className="event-actions">
                <Link to={`/events/${event.id}`} className="btn-primary event-detail-btn">
                  <span>View Details</span>
                  <FaArrowRight />
                </Link>
                {event.registrationLink && event.registrationLink !== '#' && (
                  <a 
                    href={event.registrationLink} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="btn-secondary"
                  >
                    Register Now
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {upcomingEvents.length === 0 && (
        <div className="no-events glass-card">
          <div className="no-events-content">
            <div className="no-events-icon">📸</div>
            <h3>No Upcoming Events</h3>
            <p>Stay tuned for exciting photography events and workshops!</p>
            <Link to="/events" className="btn-primary">
              Browse Past Events
            </Link>
          </div>
        </div>
      )}
    </section>
  );
};

export default UpcomingEvents;