// pages/EventDetail.js
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
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
  const { eventId } = useParams();
  const navigate = useNavigate();

  // Mock data - in real app, fetch from API
  const eventData = {
    "shutter-stories": {
      id: "shutter-stories",
      title: "Shutter Stories Chapter IV",
      subtitle: "National Photography Exhibition",
      status: "completed",
      chapter: "Chapter IV",
      date: "Dec 14 - Dec 17, 2025",
      time: "9:00 AM - 8:00 PM",
      //   location: 'UIU Campus & National Museum, Dhaka',
      location: "Phase 02: UIU Multipurpose Hall",
      registrationLink: "/register/shutter-stories",
      entryFee:
        "Single Photo: 1020BDT  Photo Story: 3060BDT",
      submissionDeadline: "December 10, 2025",
      announcementDate: "November 15, 2025",
      categories: ["Single Photo", "Photo Story"],
      description:
        "United Healthcare Presents Shutter Stories Chapter IV unveils its official identity. The legacy continues as we prepare for yet another national gathering of photographers and storytellers. With fresh energy and limitless possibilities, this chapter is set to define creativity. After many challenges, the moment we’ve all been waiting for has arrived, the Call for Photo is now officially open. This is your opportunity to take part in one of the country’s most celebrated photography exhibitions.",
      fullDescription: `
        # Shutter Stories Chapter IV
        ## National Photography Exhibition

        United Healthcare Presents Shutter Stories Chapter IV unveils its official identity. The legacy continues as we prepare for yet another national gathering of photographers and storytellers. With fresh energy and limitless possibilities, this chapter is set to define creativity. After many challenges, the moment we’ve all been waiting for has arrived, the Call for Photo is now officially open. This is your opportunity to take part in one of the country’s most celebrated photography exhibitions.
        
        Welcome to the most anticipated photography event of the year! Shutter Stories Chapter IV continues our legacy of celebrating visual storytelling through the lens. This national-level exhibition brings together amateur and professional photographers from across Bangladesh.

        ## 🎯 Event Overview
        Shutter Stories is more than just a competition; it's a platform for photographers to share their unique perspectives, tell compelling stories, and connect with like-minded individuals. This year, we're expanding our reach with new categories and exciting opportunities.

        *************************************************//////////*************************************************
        ## 📸 Competition Categories

        ### Single Photo Categories (Maximum 10 Photos):
            Open Theme (Single Image)
            Medium: DSLR/Mobile Phone/PNS
            -> Each participant can submit at most 10 Photos in a single section. A participant can submit in both Colors and Black & White.
            -> All kinds of HDR, Digital Photo Composite, or Photo Montage are allowed in Single Photos. Only minor burning, dodging and/or color correction is acceptable, as is cropping. In the case of digital photo composite or photo montage, all used photos must be taken by the Photographers. (Proof of capture might be required if it is necessary)

        ### Photo Story Category (6-12 images):
            Open Theme (Photo Story)

            -> Number of photographs per story: Minimum 6 to Maximum 12
            -> Each participant can submit at most 2 Photo Series/Stories in this section. A participant can submit in both Colors and Black & White.
            -> Photo Stories including (but not restricted to) journalism, personal stories, and creative/conceptual will be accepted. Photographers can use any type of photo manipulation to express his/her creativity. And all the photos should be coherent and share a common theme.
            -> All forms of HDR, digital composites, and photo montages are allowed in the Breaking Story category. Digital manipulation is permitted only for submissions in the Photo Story category. Any manipulated image that includes composite elements (such as adding clouds, birds, or other objects) must feature content that was originally photographed by the participant. Judges may request proof of authenticity if required.

        *************************************************//////////*************************************************
        ## 📝 Submission Guidelines
            For both Single Photo and Photo Stories you will have to submit photographs via the registration link: https://uiupc.vercel.app/register/shutter-stories
            ONLY USE GOOGLE FORM IF YOU FAIL TO SUBMIT VIA THE REGISTRATION LINK
            Google Form: https://forms.gle/x7yqVVc9gwiT6GgE8

            **** Submission Requirements (Single)****
                    Each photo should follow this naming convention-
                    [ Institution Name_Participant’s name_Category_Mobile no_Serial no ]
                    For example:
                    [ UIU_Ahmad Hasan_Single_0162#######_01 ]

                    **** If you are not a student and you are a job holder or businessman, you will have to mention the name of that institution, if not then you may write as:
                    [ Freelancer_Participant’s name_Category_Mobile no_Serial no ] ****

          1. **Format**: 
                         JPEG/JPG/PNG, minimum 3000px on longer side, Minimum 300 dpi (for DSLR/PNS)
                         JPEG/JPG/PNG, minimum 2400px on longer side
          2. **Size**: Maximum 10MB per image
          3. **No Watermarks**: Do not include watermarks or signatures on the images.
          4.  After the Submission of the email, you have to confirm your submission by posting on this Event’s Discussions. Include the following information in your post: Email Address & Number of Photographs submitted.
        *************************************************//////////*************************************************
          **** Submission Requirements (Photo Stories)****
                    Each photo should follow this naming convention-
                    [ Institution Name_Participant’s name_Category_Mobile no_Serial no ]
                    For example:
                    [ UIU_Ahmad Hasan_Story_0162#######_01 ]

                    **** If you are not a student and you are a job holder or businessman, you will have to mention the name of that institution, if not then you may write as:
                    [ Freelancer_Participant’s name_Category_Mobile no_Serial no ] ****

                    **** Note: Serial no will be from 01 to 12 depending on the number of photos you are submitting in your Story/Series. ****

                    **** Story Description must be added during Registration. No Photo Story will be accepted without a Story Description. ****
          1. **Format**: 
                         JPEG/JPG/PNG, minimum 3000px on longer side, Minimum 300 dpi (for DSLR/PNS)
                         JPEG/JPG/PNG, minimum 2400px on longer side
          2. **Size**: Maximum 10MB per image
          3. **No Watermarks**: Do not include watermarks or signatures on the images.
          4.  After the Submission of the email, you have to confirm your submission by posting on this Event’s Discussions. Include the following information in your post: Email Address & Number of Photographs submitted.
        *************************************************//////////*************************************************
        ## ELIGIBILITY 
          -> Anyone from Bangladesh is eligible to submit their works.
          -> Participants must provide proof of eligibility in the form of a Student ID Card/National ID/-> -> Passport no or other necessary documents if required.


        ## ⏰ Important Dates
          -> Registration Opens**: November 15, 2025
          -> Submission Deadline**: December 10, 2025
          -> Results Announcement**: December 20, 2025
          -> Registration Open**: December 14, 2025
          -> Registration Closes**: December 17, 2025

        ## 💰 Registration Fees
          -> Single Photo: 1020BDT per photo
          -> Photo Story: 3060BDT per story

        ## 🏆 Prizes & Recognition
          -> 50k BDT Cash Prize.

        ## 👥 Jury Panel
          -> Hasan Chandan
          -> MR Hasan
          -> Mahmud Hossain Opu

        ## 🎪 Event Schedule
          -> Phase 01: Bangladesh Shilpakala Academy
          -> Phase 02: UIU Multipurpose Hall

        ## 📍 Venue Details
          -> Phase 01 :
            Bangladesh Shilpakala Academy
            26th Dec to 28th Dec, 2025

          -> Phase 02 :
            United International University (UIU) 
            6th Jan to 07th Jan, 2026

        ## 🤝 Sponsors & Partners
          -> Tittle Sponsor: United Medical
          -> Venue Partner: Bangladesh Shilpakala Academy
          -> Education Partner: Counter Foto
          -> Broadcast Partner: Jamuna TV
          -> Print Media Partner: The Bussiness Standard
          -> Digital Media Partner: Campus24
          -> Youth Engagement Partner: The Business Standard Graduate
          -> Supporting Partner: UIU Photography Club , DCCSA

        *************************************************//////////*************************************************
        ## TERMS & CONDITION FOR PHOTO SUBMISSION
        -> By submitting your photographs, you agree to the terms and conditions set forth by the UIU Photography Club.
        -> All submitted photographs must be original works created by the participant.
        -> The UIU Photography Club reserves the right to use submitted photographs for promotional purposes, with proper credit given to the photographer.
        -> Participants are responsible for obtaining any necessary permissions or releases for recognizable individuals or private property featured in their photographs.
        -> The decision of the jury panel is final and binding. Judges & curators hold the right of altering any selected images. (like, cropping, conversion to black and white, flipping, etc.)
        -> Submission of photos exhibited previously in any other exhibition is strongly discouraged.
        -> The organizers reserve the right to disqualify any entry that does not comply with the submission guidelines or terms and conditions.
        -> Photographs that include sculptures, statues, paintings, and other works of art will be accepted as long as they do not constitute copyright infringement or fraud.
        -> The photograph must not contain obscene, provocative, defamatory, sexually explicit, or otherwise objectionable or inappropriate content.
        ->  Photographers will be notified about the registration process, fees, and deadlines after the results are published. If any ‘selected’ photographer fails to complete the registration process within the registration deadline his/her photograph(s) will be disqualified and priority will be given to the waiting list.
        -> UIUPC holds the right to examine the authenticity of the photograph/source material in order to confirm compliance with these rules.
        *************************************************//////////*************************************************

        Don't miss this incredible opportunity to showcase your talent, learn from experts, and connect with the photography community!
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
      gallery: [
        "/api/placeholder/600/400"
      ],
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
      description:
        "Join the vibrant community of photography enthusiasts at UIU Photography Club.",
      fullDescription: `
        # Member Recruitment 2026
        ## Join the UIU Photography Club
        Are you passionate about photography? Do you want to enhance your skills, participate in exciting events, and connect with fellow photography enthusiasts? The UIU Photography Club is thrilled to announce our Member Recruitment for the year 2024!

        ## 🎯 Why Join Us?
        By becoming a member of the UIU Photography Club, you'll gain access to:
        - Exclusive workshops and training sessions
        - Opportunities to showcase your work in exhibitions
        - Networking events with industry professionals
        - Collaborative projects and photo walks
        - A supportive community to share your passion
        ## 📝 How to Apply
        1. Fill out the online application form.
        2. Pay the membership fee of 500BDT.
        ## ⏰ Important Dates
        - **Application Deadline**: March 04, 2026
        ## 🤝 Contact Us
        For more information, reach out to us at:
        - Email: photographyclub@dccsa.uiu.ac.bd
        - Phone: +8801783503006
        Don't miss this opportunity to be part of a dynamic and creative community. We look forward to welcoming you to the UIU Photography Club!
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
      registrationLink: "/join",
    },
    // Add similar detailed data for other events
  };

  const event = eventData[eventId];

  if (!event) {
    return (
      <div className="event-detail-page">
        <div className="container">
          <div className="event-not-found">
            <h2>Event Not Found</h2>
            <p>The event you're looking for doesn't exist.</p>
            <button onClick={() => navigate("/events")} className="btn-primary">
              Back to Events
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleRegister = () => {
    window.open(event.registrationLink, "_blank");
  };

  /* const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: event.title,
          text: event.description,
          url: window.location.href,
        });
      } catch (error) {
        console.log("Error sharing:", error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert("Event link copied to clipboard!");
    }
  }; */

  return (
    <div className="event-detail-page">
      {/* Navigation Header */}
      {/* <header className="event-detail-header">
        <div className="container">
          <button onClick={() => navigate("/events")} className="back-button">
            <FaArrowLeft />
            Back to Events
          </button>
          <div className="header-actions">
            <button onClick={handleShare} className="share-button">
              <FaShare />
              Share
            </button>
            <button className="download-button">
              <FaDownload />
              Brochure
            </button>
          </div>
        </div>
      </header> */}

      {/* Hero Section */}
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
                onClick={() => navigate("/results")}
              >
                <FaTrophy /> View Results
              </button>
              {/* <button className="btn-secondary">Add to Calendar</button> */}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="event-detail-content">
        <div className="container">
          <div className="content-grid">
            {/* Main Content */}
            <div className="main-content">
              <div className="content-section">
                <h2>About the Event</h2>
                <div className="description-content">
                  {event.fullDescription.split("\n").map((paragraph, index) => {
                    if (paragraph.startsWith("# ")) {
                      return <h1 key={index}>{paragraph.replace("# ", "")}</h1>;
                    } else if (paragraph.startsWith("## ")) {
                      return (
                        <h2 key={index}>{paragraph.replace("## ", "")}</h2>
                      );
                    } else if (paragraph.startsWith("### ")) {
                      return (
                        <h3 key={index}>{paragraph.replace("### ", "")}</h3>
                      );
                    } else if (paragraph.trim() === "") {
                      return <br key={index} />;
                    } else {
                      return <p key={index}>{paragraph}</p>;
                    }
                  })}
                </div>
              </div>

              {/* Gallery Section */}
              <div className="content-section">
                <h2>Event Gallery</h2>
                <div className="detail-gallery">
                  {event.gallery.map((image, index) => (
                    <div key={index} className="gallery-item">
                      <img src={image} alt={`${event.title} ${index + 1}`} />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="sidebar">
              {/* Quick Info Card */}
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
                    <span>{event.categories}</span>
                  </div>
                </div>
              </div>

              {/* Highlights Card */}
              <div className="highlights-card">
                <h3>Event Highlights</h3>
                <ul className="highlights-list">
                  {event.highlights.map((highlight, index) => (
                    <li key={index}>{highlight}</li>
                  ))}
                </ul>
              </div>

              {/* Contact Card */}
              <div className="contact-card">
                <h3>Contact Information</h3>
                <div className="contact-info">
                  <div className="contact-item">
                    <strong>Coordinator</strong>
                    <span>{event.contact.coordinator}</span>

                    <strong>Email</strong>
                    <a href={`mailto:${event.contact.email}`}>
                      {event.contact.email}
                    </a>

                    <strong>Phone</strong>
                    <a href={`tel:${event.contact.phone}`}>
                      {event.contact.phone}
                    </a>
                  </div>
                </div>
              </div>

              {/* CTA Card */}
              <div className="cta-card">
                <h3>Ready to Participate?</h3>
                <p>Don't miss this opportunity to showcase your talent!</p>
                <button
                  onClick={handleRegister}
                  className="btn-primary full-width"
                >
                  Register Now <FaExternalLinkAlt />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default EventDetail;
