// components/Footer.js - ENHANCED VERSION
"use client";

import React from "react";
import Link from "next/link";
import {
  FaArrowRight,
} from "react-icons/fa";
import "./Footer.css";

import myLogo from "@/assets/logo.jpg";

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
                <img src={myLogo.src} alt="UIUPC Logo" className="logo-icon" />
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
          </div>

          {/* Quick Links */}
          <div className="footer-section">
            <h3 className="section-title">Quick Links</h3>
            <ul className="footer-links two-columns">
              <li>
                <Link href="/gallery" className="footer-link">
                  <FaArrowRight className="link-icon" />
                  <span>Gallery</span>
                </Link>
              </li>
              <li>
                <Link href="/events" className="footer-link">
                  <FaArrowRight className="link-icon" />
                  <span>Events</span>
                </Link>
              </li>
              <li>
                <Link href="/members" className="footer-link">
                  <FaArrowRight className="link-icon" />
                  <span>Members</span>
                </Link>
              </li>
              <li>
                <Link href="/blog" className="footer-link">
                  <FaArrowRight className="link-icon" />
                  <span>Blog</span>
                </Link>
              </li>
              <li>
                <Link href="/about" className="footer-link">
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
                <Link href="/join" className="footer-link">
                  <FaArrowRight className="link-icon" />
                  <span>Join the Club</span>
                </Link>
              </li>
              <li>
                <Link href="/contact" className="footer-link">
                  <FaArrowRight className="link-icon" />
                  <span>Contact Us</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <p className="copyright">
              &copy; {currentYear} UIU Photography Club. All rights reserved.
            </p>
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
