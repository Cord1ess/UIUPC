import React, { useState } from "react";
import { db } from "../firebase";
import { collection, addDoc } from "firebase/firestore";
import {
  FaChalkboardTeacher,
  FaImages,
  FaWalking,
  FaUser,
  FaEnvelope,
  FaIdCard,
  FaUniversity,
  FaPhone,
  FaCamera,
  FaPaperPlane,
  FaCheck,
  FaExclamationTriangle,
  FaSpinner,
  FaTrophy,
  FaHandshake,
  FaCameraRetro,
  FaMoneyBillWave,
  FaCreditCard,
  FaReceipt,
  FaFileSignature,
  FaFacebook,
} from "react-icons/fa";
import { useSubmissionStatus } from "../hooks/useSubmissionStatus";
import "./Join.css";

const Join = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [submitMessage, setSubmitMessage] = useState("");
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showRulesPopup, setShowRulesPopup] = useState(false); // New state for rules popup
  const [agreementAccepted, setAgreementAccepted] = useState(false); // New state for agreement checkbox
  const [formData, setFormData] = useState({
    name: "",
    studentId: "",
    email: "",
    department: "",
    phone: "",
    interests: "",
    experience: "",
    message: "",
    paymentMethod: "",
    receiverName: "",
    transactionId: "",
  });
  const [photo, setPhoto] = useState(null);

  // Google Apps Script Web App URL - You'll need to create this
  const GOOGLE_SCRIPT_URL = process.env.REACT_APP_GAS_JOIN;

  const { status: joinStatus } = useSubmissionStatus(GOOGLE_SCRIPT_URL, "getJoinPageStatus");

  const departments = [
    "Computer Science & Engineering",
    "Electrical & Electronic Engineering",
    "BBA",
    "BBA in AIS",
    "Economics",
    "Data Science",
    "English",
    "Pharmacy",
    "Civil",
    "EDS",
    "MSJ",
    "Others",
  ];

  const photographyInterests = [
    "Portrait Photography",
    "Landscape Photography",
    "Street Photography",
    "Wildlife Photography",
    "Sports Photography",
    "Event Photography",
    "Macro Photography",
    "Night Photography",
    "Architectural Photography",
    "Fashion Photography",
  ];

  const experienceLevels = [
    "Beginner",
    "Intermediate",
    "Advanced",
    "Professional",
  ];

  const paymentMethods = [
    { value: "cash", label: "Cash Payment", icon: FaMoneyBillWave },
    { value: "online", label: "Online Payment", icon: FaCreditCard },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePaymentMethodChange = (method) => {
    setFormData((prev) => ({
      ...prev,
      paymentMethod: method,
      receiverName: "",
      transactionId: "",
    }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type and size
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        alert("Please select an image smaller than 5MB");
        return;
      }
      setPhoto(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if join page submissions are enabled
    if (joinStatus !== "enabled") {
      setSubmitStatus("error");
      setSubmitMessage(
        "Membership applications are currently disabled. Please check back later or contact the photography club for more information."
      );
      return;
    }

    // Show rules popup instead of immediately submitting
    setShowRulesPopup(true);
  };

  // New function to handle final submission after agreement
  // In Join.js - Replace the handleFinalSubmit function
  const handleFinalSubmit = async () => {
    if (!agreementAccepted) {
      alert("Please accept the membership agreement to continue.");
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);
    setShowRulesPopup(false);

    // Validate payment information
    if (formData.paymentMethod === "cash" && !formData.receiverName) {
      setSubmitStatus("error");
      setSubmitMessage("Please enter the receiver name for cash payment.");
      setIsSubmitting(false);
      return;
    }

    if (formData.paymentMethod === "online" && !formData.transactionId) {
      setSubmitStatus("error");
      setSubmitMessage("Please enter the transaction ID for online payment.");
      setIsSubmitting(false);
      return;
    }

    try {
      // Convert photo to base64 if exists
      let photoData = null;
      let photoName = null;
      let photoType = null;

      if (photo) {
        photoData = await convertToBase64(photo);
        photoName = photo.name;
        photoType = photo.type;
      }

      // FIXED: Use URLSearchParams instead of FormData
      const submissionData = new URLSearchParams();

      // Add all form fields
      Object.keys(formData).forEach((key) => {
        if (formData[key]) {
          submissionData.append(key, formData[key]);
        }
      });

      // Add photo data if exists
      if (photoData) {
        submissionData.append("photoData", photoData);
        submissionData.append("photoName", photoName);
        submissionData.append("photoType", photoType);
      }

      // Add agreement acceptance
      submissionData.append("agreementAccepted", "true");

      // Add timestamp
      submissionData.append("timestamp", new Date().toISOString());

      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        },
        body: submissionData.toString(),
      });

      // Firebase Dual-Write Mirroring
      try {
        const firestoreDoc = {
          ...formData,
          agreementAccepted: true,
          timestamp: new Date().toISOString(),
          type: "membership"
        };
        if (photoData) {
          firestoreDoc.photoData = photoData;
          firestoreDoc.photoName = photoName;
          firestoreDoc.photoType = photoType;
        }
        await addDoc(collection(db, "membershipApplications"), firestoreDoc);
      } catch (fbError) {
        console.error("Firestore sync error:", fbError);
        // We won't block the actual submission if GAS passes
      }

      const result = await response.json();

      if (response.ok && result.status === "success") {
        setIsSubmitting(false);
        setSubmitStatus("success");
        setSubmitMessage(
          "Thank you for your application! We will review it and get back to you soon."
        );

        // Show popup message
        setShowSuccessPopup(true);

        // Reset form
        setFormData({
          name: "",
          studentId: "",
          email: "",
          department: "",
          phone: "",
          interests: "",
          experience: "",
          message: "",
          paymentMethod: "",
          receiverName: "",
          transactionId: "",
          facebookLink: "",
        });
        setPhoto(null);
        setAgreementAccepted(false);
        const fileInput = document.getElementById("photo-upload");
        if (fileInput) fileInput.value = "";
      } else {
        throw new Error(result.message || "Failed to submit application");
      }
    } catch (error) {
      console.error("Submission error:", error);
      setIsSubmitting(false);
      setSubmitStatus("error");
      setSubmitMessage(
        "Sorry, there was an error submitting your application. Please try again or contact us directly."
      );
    }
  };

  // Add this helper function to convert file to base64
  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  return (
    <div className="join-page">
      <div className="page-header">
        <h1>Join UIU Photography Club</h1>
        <p>
          Become part of our creative community and showcase your photography
          skills
        </p>
      </div>

      <div className="container">
        <div className="join-content">
          <div className="join-grid">
            {/* Membership Benefits */}
            <div className="benefits-section">
              <h2>Why Join Us?</h2>
              <div className="benefits-grid">
                <div className="benefit-card">
                  <div className="benefit-icon">
                    <FaChalkboardTeacher />
                  </div>
                  <h3>Workshops & Training</h3>
                  <p>
                    Learn from experienced photographers and improve your skills
                  </p>
                </div>

                <div className="benefit-card">
                  <div className="benefit-icon">
                    <FaWalking />
                  </div>
                  <h3>Photo Walks & Events</h3>
                  <p>
                    Participate in organized photo walks and photography events
                  </p>
                </div>

                <div className="benefit-card">
                  <div className="benefit-icon">
                    <FaTrophy />
                  </div>
                  <h3>Competitions</h3>
                  <p>
                    Showcase your work in our regular photography competitions
                  </p>
                </div>

                <div className="benefit-card">
                  <div className="benefit-icon">
                    <FaHandshake />
                  </div>
                  <h3>Networking</h3>
                  <p>Connect with fellow photography enthusiasts</p>
                </div>

                <div className="benefit-card">
                  <div className="benefit-icon">
                    <FaImages />
                  </div>
                  <h3>Exhibitions</h3>
                  <p>
                    Get opportunities to exhibit your work in campus exhibitions
                  </p>
                </div>

                <div className="benefit-card">
                  <div className="benefit-icon">
                    <FaCameraRetro />
                  </div>
                  <h3>Resources</h3>
                  <p>Access to photography equipment and learning resources</p>
                </div>
              </div>
            </div>

            {/* Application Form */}
            <div className="application-section">
              <div className="application-form-container">
                <h2>Membership Application</h2>

                {/* Status Messages */}
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

                <form className="application-form" onSubmit={handleSubmit}>
                  {/* Personal Information */}
                  <div className="form-section">
                    <h3>Personal Information</h3>

                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="name">
                          <FaUser className="input-icon" />
                          Full Name *
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="Enter your full name"
                          required
                          disabled={isSubmitting}
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="studentId">
                          <FaIdCard className="input-icon" />
                          Student ID *
                        </label>
                        <input
                          type="text"
                          id="studentId"
                          name="studentId"
                          value={formData.studentId}
                          onChange={handleInputChange}
                          placeholder="Enter your UIU Student ID"
                          required
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="email">
                          <FaEnvelope className="input-icon" />
                          Email Address *
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="Enter your email"
                          required
                          disabled={isSubmitting}
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="phone">
                          <FaPhone className="input-icon" />
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="Enter your phone number"
                          required
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="facebookLink">
                        <FaFacebook className="input-icon" />
                        Facebook Profile Link
                      </label>
                      <input
                        type="url"
                        id="facebookLink"
                        name="facebookLink"
                        value={formData.facebookLink}
                        onChange={handleInputChange}
                        placeholder="https://facebook.com/yourprofile"
                        required
                        disabled={isSubmitting}
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="department">
                        <FaUniversity className="input-icon" />
                        Department *
                      </label>
                      <select
                        id="department"
                        name="department"
                        value={formData.department}
                        onChange={handleInputChange}
                        required
                        disabled={isSubmitting}
                      >
                        <option value="">Select your department</option>
                        {departments.map((dept) => (
                          <option key={dept} value={dept}>
                            {dept}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Photography Information */}
                  <div className="form-section">
                    <h3>Photography Background</h3>

                    <div className="form-group">
                      <label htmlFor="experience">
                        <FaCamera className="input-icon" />
                        Photography Experience Level *
                      </label>
                      <select
                        id="experience"
                        name="experience"
                        value={formData.experience}
                        onChange={handleInputChange}
                        required
                        disabled={isSubmitting}
                      >
                        <option value="">Select your experience level</option>
                        {experienceLevels.map((level) => (
                          <option key={level} value={level}>
                            {level}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label htmlFor="interests">
                        <FaCamera className="input-icon" />
                        Photography Interests *
                      </label>
                      <div className="interests-grid">
                        {photographyInterests.map((interest) => (
                          <label key={interest} className="interest-checkbox">
                            <input
                              type="checkbox"
                              name="interests"
                              value={interest}
                              onChange={(e) => {
                                const currentInterests = formData.interests
                                  .split(", ")
                                  .filter((i) => i);
                                if (e.target.checked) {
                                  currentInterests.push(interest);
                                } else {
                                  const index =
                                    currentInterests.indexOf(interest);
                                  if (index > -1)
                                    currentInterests.splice(index, 1);
                                }
                                setFormData((prev) => ({
                                  ...prev,
                                  interests: currentInterests.join(", "),
                                }));
                              }}
                              disabled={isSubmitting}
                            />
                            <span className="checkmark"></span>
                            {interest}
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="photo">
                        <FaCamera className="input-icon" />
                        Submit your Photo (Optional)
                      </label>
                      <input
                        type="file"
                        id="photo-upload"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        disabled={isSubmitting}
                      />
                      {photo && (
                        <div className="photo-preview">
                          <p>Selected: {photo.name}</p>
                        </div>
                      )}
                    </div>

                    <div className="form-group">
                      <label htmlFor="message">
                        Why do you want to join UIU Photography Club? *
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        rows="4"
                        value={formData.message}
                        onChange={handleInputChange}
                        placeholder="Tell us about your interest in photography and what you hope to gain from joining the club..."
                        required
                        disabled={isSubmitting}
                      ></textarea>
                    </div>
                  </div>

                  {/* Payment Information */}
                  <div className="form-section">
                    <h3>Payment Information</h3>

                    <div className="payment-options">
                      {paymentMethods.map((method) => {
                        const IconComponent = method.icon;
                        return (
                          <label
                            key={method.value}
                            className={`payment-option ${
                              formData.paymentMethod === method.value
                                ? "selected"
                                : ""
                            }`}
                          >
                            <input
                              type="radio"
                              name="paymentMethod"
                              value={method.value}
                              checked={formData.paymentMethod === method.value}
                              onChange={() =>
                                handlePaymentMethodChange(method.value)
                              }
                              required
                              disabled={isSubmitting}
                            />
                            <span className="payment-checkmark"></span>
                            <IconComponent />
                            <span>{method.label}</span>
                          </label>
                        );
                      })}
                    </div>

                    {formData.paymentMethod === "cash" && (
                      <div className="payment-details">
                        <h4>Cash Payment Details</h4>
                        <div className="payment-instructions">
                          <p>
                            <strong>Instructions:</strong>
                          </p>
                          <p>
                            • Pay the membership fee to any club executive
                            member
                          </p>
                          <p>• Get a receipt for your payment</p>
                          <p>
                            • Enter the name of the person who received your
                            payment below
                          </p>
                        </div>
                        <div className="form-group">
                          <label htmlFor="receiverName">
                            <FaReceipt className="input-icon" />
                            Receiver Name *
                          </label>
                          <input
                            type="text"
                            id="receiverName"
                            name="receiverName"
                            value={formData.receiverName}
                            onChange={handleInputChange}
                            placeholder="Enter the name of the person who received your payment"
                            disabled={isSubmitting}
                          />
                        </div>
                      </div>
                    )}

                    {formData.paymentMethod === "online" && (
                      <div className="payment-details">
                        <h4>Online Payment Details</h4>
                        <div className="payment-instructions">
                          <p>
                            <strong>Bank Details:</strong>
                          </p>
                          <p>• Bank: Bkash</p>
                          <p>• Account Name: UIU Photography Club</p>
                          <p>• Account Number: 01622125125</p>
                          <p>• Amount: 500 BDT</p>
                        </div>
                        <div className="form-group">
                          <label htmlFor="transactionId">
                            <FaCreditCard className="input-icon" />
                            Transaction ID *
                          </label>
                          <input
                            type="text"
                            id="transactionId"
                            name="transactionId"
                            value={formData.transactionId}
                            onChange={handleInputChange}
                            placeholder="Enter your bank transaction ID"
                            disabled={isSubmitting}
                          />
                        </div>
                      </div>
                    )}
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
                        <FaSpinner className="spinner" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <FaPaperPlane className="btn-icon" />
                        Submit Application
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rules and Agreement Popup */}
      {showRulesPopup && (
        <div className="success-popup-overlay">
          <div className="success-popup">
            <div className="popup-header">
              <FaFileSignature className="popup-icon" />
              <h3>Membership Agreement & Code of Conduct</h3>
            </div>
            <div className="popup-content">
              <div
                style={{
                  textAlign: "left",
                  maxHeight: "400px",
                  overflowY: "auto",
                  padding: "10px",
                }}
              >
                <h4
                  style={{ color: "var(--uiu-orange)", marginBottom: "1rem" }}
                >
                  General Rules
                </h4>
                <ul style={{ marginBottom: "1.5rem", paddingLeft: "1.5rem" }}>
                  <li>
                    Members must respect all fellow members, club executives,
                    and event participants.
                  </li>
                  <li>
                    Members must maintain discipline and professionalism in all
                    club activities.
                  </li>
                  <li>
                    Any form of misconduct, harassment, or violation of
                    university policies will lead to disciplinary action.
                  </li>
                  <li>
                    Members should actively engage in club activities and
                    contribute to its growth.
                  </li>
                  <li>
                    UIUPC ID card can only be used for club purposes or special
                    occasions approved by the club. Any misuse of the ID card is
                    strictly prohibited.
                  </li>
                </ul>

                <h4
                  style={{ color: "var(--uiu-orange)", marginBottom: "1rem" }}
                >
                  Activity Participation Rules
                </h4>
                <ul style={{ marginBottom: "1.5rem", paddingLeft: "1.5rem" }}>
                  <li>
                    <strong>Vertex:</strong> Members must attend at least three
                    Vertex Workshop each year.
                  </li>
                  <li>
                    <strong>Photowalks:</strong> Members should try to join
                    photowalks organized right after Vertex.
                  </li>
                  <li>
                    <strong>PhotoAdda:</strong> Members are encouraged to take
                    part in discussions and creative exchanges in PhotoAdda.
                  </li>
                  <li>
                    <strong>Friday Exposure Contribution:</strong> Members are
                    expected to contribute to the club's weekly showcase.
                  </li>
                  <li>
                    <strong>Club Internal Activities:</strong> Members should be
                    willing to help in club operations, event management, and
                    community engagement.
                  </li>
                </ul>

                <h4
                  style={{ color: "var(--uiu-orange)", marginBottom: "1rem" }}
                >
                  Agreement & Signature
                </h4>
                <p style={{ marginBottom: "1rem" }}>
                  I confirm that I have read and understood the UIU Photography
                  Club Membership Agreement & Code of Conduct. I agree to abide
                  by these rules and contribute positively to the club's
                  community. I also acknowledge that I have paid 500 BDT as a
                  one-time, non-refundable membership fee for joining UIUPC.
                </p>

                <div className="form-group" style={{ marginTop: "1.5rem" }}>
                  <label
                    className="interest-checkbox"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={agreementAccepted}
                      onChange={(e) => setAgreementAccepted(e.target.checked)}
                    />
                    <span className="checkmark"></span>
                    <span style={{ marginLeft: "10px", fontWeight: "bold" }}>
                      I accept the Membership Agreement & Code of Conduct
                    </span>
                  </label>
                </div>
              </div>
            </div>
            <div className="popup-actions" style={{ gap: "1rem" }}>
              <button
                className="btn-primary"
                onClick={handleFinalSubmit}
                disabled={!agreementAccepted}
                style={{ opacity: agreementAccepted ? 1 : 0.6 }}
              >
                Confirm & Submit
              </button>
              <button
                className="btn-primary"
                onClick={() => setShowRulesPopup(false)}
                style={{ background: "var(--light-gray)" }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Popup */}
      {showSuccessPopup && (
        <div className="success-popup-overlay">
          <div className="success-popup">
            <div className="popup-header">
              <FaCheck className="popup-icon" />
              <h3>Application Submitted Successfully!</h3>
            </div>
            <div className="popup-content">
              <p>Thank you for applying to join the UIU Photography Club!</p>
              <p>
                We have received your application and will review it shortly.
              </p>
              <p>You will receive a confirmation email within 24-48 hours.</p>
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

export default Join;
