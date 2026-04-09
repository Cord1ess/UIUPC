// src/app/contact/page.tsx
"use client";

import React, { useRef, useState } from "react";
import {
  FaFacebookF,
  FaInstagram,
  FaYoutube,
  FaLinkedinIn,
  FaEnvelope,
  FaMapMarkerAlt,
  FaClock,
  FaPaperPlane,
  FaCheck,
  FaExclamationTriangle,
} from "react-icons/fa";
import emailjs from "emailjs-com";
import "./Contact.css";

const ContactPage = () => {
  const form = useRef<HTMLFormElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"success" | "error" | null>(null);
  const [submitMessage, setSubmitMessage] = useState("");
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  // EmailJS configuration from environment variables
  const EMAIL_SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
  const EMAIL_TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
  const EMAIL_PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!EMAIL_SERVICE_ID || !EMAIL_TEMPLATE_ID || !EMAIL_PUBLIC_KEY) {
      setSubmitStatus("error");
      setSubmitMessage("Contact form is not configured properly. Please contact us directly via email.");
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    if (form.current) {
      emailjs
        .sendForm(
          EMAIL_SERVICE_ID,
          EMAIL_TEMPLATE_ID,
          form.current,
          EMAIL_PUBLIC_KEY
        )
        .then(() => {
          setIsSubmitting(false);
          setSubmitStatus("success");
          setSubmitMessage(
            "Thank you! Your message has been sent successfully. We will get back to you soon."
          );
          
          setShowSuccessPopup(true);
          form.current?.reset();
        })
        .catch((error) => {
          console.error("Email sending failed:", error.text);
          setIsSubmitting(false);
          setSubmitStatus("error");
          setSubmitMessage(
            "Sorry, there was an error sending your message. Please try again or email us directly at photographyclub@dccsa.uiu.ac.bd"
          );
        });
    }
  };

  return (
    <div className="contact-page">
      <div className="page-header">
        <h1>Contact Us</h1>
        <p>Get in touch with UIU Photography Club</p>
      </div>

      <div className="container">
        <div className="contact-content">
          <div className="contact-grid">
            {/* Contact Information */}
            <div className="contact-info">
              {/* Social Media Links */}
              <div className="social-section">
                <h3>Follow Us</h3>
                <div className="social-links">
                  <a
                    href="https://facebook.com/UIUPC"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-link facebook"
                  >
                    <FaFacebookF className="social-icon" />
                    <span>Facebook</span>
                  </a>

                  <a
                    href="https://www.instagram.com/uiuphotographyclub"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-link instagram"
                  >
                    <FaInstagram className="social-icon" />
                    <span>Instagram</span>
                  </a>

                  <a
                    href="https://www.youtube.com/@uiupc6885"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-link youtube"
                  >
                    <FaYoutube className="social-icon" />
                    <span>YouTube</span>
                  </a>

                  <a
                    href="https://linkedin.com/company/uiupc"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-link linkedin"
                  >
                    <FaLinkedinIn className="social-icon" />
                    <span>LinkedIn</span>
                  </a>
                </div>
              </div>

              <div className="contact-details">
                <div className="contact-item">
                  <div className="contact-icon">
                    <FaClock className="icon" />
                  </div>
                  <div className="contact-text">
                    <h3>Club Hours</h3>
                    <p>Saturday - Sunday: 8:30 AM - 4:30 PM</p>
                    <p>
                      Tuesday - Thursday: 8:30 AM - 4:30 PM
                      <br />
                      Makeup classday : By appointment
                    </p>
                  </div>
                </div>

                <div className="contact-item">
                  <div className="contact-icon">
                    <FaEnvelope className="icon" />
                  </div>
                  <div className="contact-text">
                    <h3>Email</h3>
                    <a href="mailto:photographyclub@dccsa.uiu.ac.bd">
                      photographyclub@dccsa.uiu.ac.bd
                    </a>
                  </div>
                </div>

                <div className="contact-item">
                  <div className="contact-icon">
                    <FaMapMarkerAlt className="icon" />
                  </div>
                  <div className="contact-text">
                    <h3>Location</h3>
                    <p>
                      United International University
                      <br />
                      United City, Madani Avenue
                      <br />
                      Dhaka 1212, Bangladesh
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="contact-form-container">
              <h2>Send us a Message</h2>

              {submitStatus === "success" && (
                <div className="status-message success">
                  <FaCheck className="status-icon" />
                  {submitMessage}
                </div>
              )}

              {submitStatus === "error" && (
                <div className="status-message error">
                  <FaExclamationTriangle className="status-icon" />
                  {submitMessage}
                </div>
              )}

              <form ref={form} className="contact-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="name">Full Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="from_name"
                    placeholder="Enter your full name"
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email Address *</label>
                  <input
                    type="email"
                    id="email"
                    name="from_email"
                    placeholder="Enter your email"
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="subject">Subject *</label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    placeholder="What is this regarding?"
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="department">Department (Optional)</label>
                  <input
                    type="text"
                    id="department"
                    name="department"
                    placeholder="Your department at UIU"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="message">Message *</label>
                  <textarea
                    id="message"
                    name="message"
                    rows={5}
                    placeholder="Tell us about your inquiry, collaboration idea, or anything else..."
                    required
                    disabled={isSubmitting}
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className={`btn-primary submit-btn ${
                    isSubmitting ? "submitting" : ""
                  }`}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="spinner"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <FaPaperPlane className="btn-icon" />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Map Section */}
          <div className="map-section">
            <h2>Find Us at UIU</h2>
            <div className="map-container">
              <div className="map-placeholder">
                <div className="map-icon">🗺️</div>
                <h3>United International University</h3>
                <p>United City, Madani Avenue, Badda, Dhaka 1212, Bangladesh</p>
                <div className="map-actions">
                  <a
                    href="https://maps.google.com/?q=United+International+University+Dhaka"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary"
                  >
                    Open in Google Maps
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Popup */}
      {showSuccessPopup && (
        <div className="success-popup-overlay">
          <div className="success-popup">
            <div className="popup-header">
              <FaCheck className="popup-icon" />
              <h3>Message Sent Successfully!</h3>
            </div>
            <div className="popup-content">
              <p>Thank you for contacting UIU Photography Club!</p>
              <p>We have received your message and will respond to you shortly.</p>
              <p>You should receive a confirmation email within the next few hours.</p>
            </div>
            <div className="popup-actions">
              <button 
                className="btn-primary"
                onClick={() => setShowSuccessPopup(false)}
              >
                Got It!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactPage;
