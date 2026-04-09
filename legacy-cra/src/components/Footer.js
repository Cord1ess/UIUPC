// components/Footer.js - ENHANCED VERSION
import React from "react";
import { Link } from "react-router-dom";
import {
  /* FaCamera,
  FaFacebookF,
  FaInstagram,
  FaTwitter,
  FaLinkedin,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaHeart, */
  FaArrowRight,
} from "react-icons/fa";
import "./Footer.css";

import myLogo from "../assets/logo.jpg";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="footer">
      {/* Animated Background Elements */}
      <div className="footer-background">
        <div className="footer-glow-1"></div>
        <div className="footer-glow-2"></div>
        <div className="footer-glow-3"></div>
      </div>

      <div className="footer-container">
        {/* Main Footer Content */}
        <div className="footer-content">
          {/* Brand Section */}
          <div className="footer-section brand-section">
            <div className="footer-logo">
              <div className="logo-icon-container">
                <img src={myLogo} alt="UIUPC Logo" className="logo-icon" />
              </div>
              <div className="logo-text">
                <span className="logo-title">UIU Photography Club</span>
                <span className="logo-subtitle">UIUPC</span>
              </div>
            </div>
            <p className="brand-description">
              Capturing Moments, Creating Memories at United International
              University. Join our community of passionate photographers and
              explore the art of visual storytelling.
            </p>
            {/* <div className="social-links">
              <a 
                href="https://facebook.com/UIUPC" 
                target="_blank" 
                rel="noopener noreferrer"
                className="social-link"
                aria-label="Facebook"
              >
                <FaFacebookF className="social-icon" />
                <div className="social-tooltip">Facebook</div>
              </a>
              <a 
                href="https://instagram.com/uiuphotography" 
                target="_blank" 
                rel="noopener noreferrer"
                className="social-link"
                aria-label="Instagram"
              >
                <FaInstagram className="social-icon" />
                <div className="social-tooltip">Instagram</div>
              </a>
              <a 
                href="https://twitter.com/uiuphotography" 
                target="_blank" 
                rel="noopener noreferrer"
                className="social-link"
                aria-label="Twitter"
              >
                <FaTwitter className="social-icon" />
                <div className="social-tooltip">Twitter</div>
              </a>
              <a 
                href="https://linkedin.com/company/uiu-photography-club" 
                target="_blank" 
                rel="noopener noreferrer"
                className="social-link"
                aria-label="LinkedIn"
              >
                <FaLinkedin className="social-icon" />
                <div className="social-tooltip">LinkedIn</div>
              </a>
            </div> */}
          </div>

          {/* Quick Links */}
          <div className="footer-section">
            <h3 className="section-title">Quick Links</h3>
            <ul className="footer-links two-columns">
              <li>
                <Link to="/gallery" className="footer-link">
                  <FaArrowRight className="link-icon" />
                  <span>Gallery</span>
                </Link>
              </li>
              <li>
                <Link to="/events" className="footer-link">
                  <FaArrowRight className="link-icon" />
                  <span>Events</span>
                </Link>
              </li>
              <li>
                <Link to="/members" className="footer-link">
                  <FaArrowRight className="link-icon" />
                  <span>Members</span>
                </Link>
              </li>
              <li>
                <Link to="/blog" className="footer-link">
                  <FaArrowRight className="link-icon" />
                  <span>Blog</span>
                </Link>
              </li>
              <li>
                <Link to="/about" className="footer-link">
                  <FaArrowRight className="link-icon" />
                  <span>About Us</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Get Involved */}
          <div className="footer-section">
            <h3 className="section-title">Get Involved</h3>
            <ul className="footer-links">
              <li>
                <Link to="/join" className="footer-link">
                  <FaArrowRight className="link-icon" />
                  <span>Join the Club</span>
                </Link>
              </li>
              <li>
                <Link to="/contact" className="footer-link">
                  <FaArrowRight className="link-icon" />
                  <span>Contact Us</span>
                </Link>
              </li>
              {/* <li>
                <a href="#volunteer" className="footer-link">
                  <FaArrowRight className="link-icon" />
                  <span>Volunteer</span>
                </a>
              </li>
              <li>
                <a href="#sponsor" className="footer-link">
                  <FaArrowRight className="link-icon" />
                  <span>Sponsor Us</span>
                </a>
              </li>
              <li>
                <a href="#workshops" className="footer-link">
                  <FaArrowRight className="link-icon" />
                  <span>Workshops</span>
                </a>
              </li> */}
            </ul>
          </div>

          {/* Contact Info - UPDATED */}
          {/* <div className="footer-section">
            <h3 className="section-title">Contact Info</h3>
            <div className="contact-info">
              <div className="contact-item">
                <FaEnvelope className="contact-icon" />
                <div className="contact-details">
                  <span className="contact-label">EMAIL</span>
                  <a
                    href="mailto:photographyclub@dccsa.uiu.ac.bd"
                    className="contact-value"
                  >
                    photographyclub@dccsa.uiu.ac.bd
                  </a>
                </div>
              </div>
              <div className="contact-item">
                <div className="contact-details">
                  <FaPhone className="contact-icon" />
                  <span className="contact-label">
                    {" "}
                    PHONE
                    <a href="tel:+8801679861740" className="contact-value">
                      +880 1679-861740
                    </a>
                  </span>
                </div>
              </div>
              <div className="contact-item">
                <FaMapMarkerAlt className="contact-icon" />
                <div className="contact-details">
                  <span className="contact-value address-text">
                    United International University
                    <br />
                    Madani Avenue, Dhaka 1212
                  </span>
                </div>
              </div>
            </div>
          </div> */}
        </div>

        {/* Newsletter Section */}
        {/* <div className="newsletter-section glass-card">
          <div className="newsletter-content">
            <h3 className="newsletter-title">Stay Updated</h3>
            <p className="newsletter-description">
              Subscribe to our newsletter for the latest events, workshops, and photography tips.
            </p>
            <div className="newsletter-form">
              <input 
                type="email" 
                placeholder="Enter your email address"
                className="newsletter-input"
              />
              <button className="newsletter-btn btn-primary">
                Subscribe
              </button>
            </div>
          </div>
        </div> */}

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <p className="copyright">
              &copy; {currentYear} UIU Photography Club. All rights reserved.
            </p>
            {/* <div className="footer-bottom-links">
              <a href="#privacy" className="bottom-link">Privacy Policy</a>
              <a href="#terms" className="bottom-link">Terms of Service</a>
              <a href="#sitemap" className="bottom-link">Sitemap</a>
            </div> */}
            <button
              className="back-to-top"
              onClick={scrollToTop}
              aria-label="Back to top"
            >
              <FaArrowRight className="back-to-top-icon" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
