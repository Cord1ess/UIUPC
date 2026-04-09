// src/app/join/page.tsx
"use client";

import React, { useState } from "react";
import { db } from "@/lib/firebase";
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
import { useSubmissionStatus } from "@/hooks/useSubmissionStatus";
import "./Join.css";

const JoinPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"success" | "error" | null>(null);
  const [submitMessage, setSubmitMessage] = useState("");
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showRulesPopup, setShowRulesPopup] = useState(false); 
  const [agreementAccepted, setAgreementAccepted] = useState(false); 
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
    facebookLink: "",
  });
  const [photo, setPhoto] = useState<File | null>(null);

  const GOOGLE_SCRIPT_URL = process.env.NEXT_PUBLIC_GAS_JOIN || "";

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePaymentMethodChange = (method: string) => {
    setFormData((prev) => ({
      ...prev,
      paymentMethod: method,
      receiverName: "",
      transactionId: "",
    }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert("Please select an image smaller than 5MB");
        return;
      }
      setPhoto(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (joinStatus !== "enabled") {
      setSubmitStatus("error");
      setSubmitMessage(
        "Membership applications are currently disabled. Please check back later or contact the photography club for more information."
      );
      return;
    }
    setShowRulesPopup(true);
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFinalSubmit = async () => {
    if (!agreementAccepted) {
      alert("Please accept the membership agreement to continue.");
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);
    setShowRulesPopup(false);

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
      let photoData = null;
      let photoName = null;
      let photoType = null;

      if (photo) {
        photoData = await convertToBase64(photo);
        photoName = photo.name;
        photoType = photo.type;
      }

      const submissionData = new URLSearchParams();
      Object.keys(formData).forEach((key) => {
        if ((formData as any)[key]) {
          submissionData.append(key, (formData as any)[key]);
        }
      });

      if (photoData) {
        submissionData.append("photoData", photoData);
        submissionData.append("photoName", photoName || "");
        submissionData.append("photoType", photoType || "");
      }

      submissionData.append("agreementAccepted", "true");
      submissionData.append("timestamp", new Date().toISOString());

      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        },
        body: submissionData.toString(),
      });

      try {
        const firestoreDoc: any = {
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
      }

      const result = await response.json();

      if (response.ok && result.status === "success") {
        setIsSubmitting(false);
        setSubmitStatus("success");
        setSubmitMessage("Thank you for your application! We will review it and get back to you soon.");
        setShowSuccessPopup(true);
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
      } else {
        throw new Error(result.message || "Failed to submit application");
      }
    } catch (error: any) {
      console.error("Submission error:", error);
      setIsSubmitting(false);
      setSubmitStatus("error");
      setSubmitMessage("Sorry, there was an error submitting your application. Please try again.");
    }
  };

  return (
    <div className="join-page">
      <div className="page-header">
        <h1>Join UIU Photography Club</h1>
        <p>Become part of our creative community and showcase your photography skills</p>
      </div>

      <div className="container">
        <div className="join-content">
          <div className="join-grid">
            <div className="benefits-section">
              <h2>Why Join Us?</h2>
              <div className="benefits-grid">
                <div className="benefit-card">
                  <div className="benefit-icon"><FaChalkboardTeacher /></div>
                  <h3>Workshops & Training</h3>
                  <p>Learn from experienced photographers and improve your skills</p>
                </div>
                <div className="benefit-card">
                  <div className="benefit-icon"><FaWalking /></div>
                  <h3>Photo Walks & Events</h3>
                  <p>Participate in organized photo walks and photography events</p>
                </div>
                <div className="benefit-card">
                   <div className="benefit-icon"><FaTrophy /></div>
                  <h3>Competitions</h3>
                  <p>Showcase your work in our regular photography competitions</p>
                </div>
                 <div className="benefit-card">
                  <div className="benefit-icon"><FaHandshake /></div>
                  <h3>Networking</h3>
                  <p>Connect with fellow photography enthusiasts</p>
                </div>
                 <div className="benefit-card">
                  <div className="benefit-icon"><FaImages /></div>
                  <h3>Exhibitions</h3>
                  <p>Get opportunities to exhibit your work in campus exhibitions</p>
                </div>
                 <div className="benefit-card">
                  <div className="benefit-icon"><FaCameraRetro /></div>
                  <h3>Resources</h3>
                  <p>Access to photography equipment and learning resources</p>
                </div>
              </div>
            </div>

            <div className="application-section">
              <div className="application-form-container">
                <h2>Membership Application</h2>
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
                  <div className="form-section">
                    <h3>Personal Information</h3>
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="name"><FaUser className="input-icon" /> Full Name *</label>
                        <input type="text" id="name" name="name" value={formData.name} onChange={handleInputChange} placeholder="Enter your full name" required disabled={isSubmitting} />
                      </div>
                      <div className="form-group">
                        <label htmlFor="studentId"><FaIdCard className="input-icon" /> Student ID *</label>
                        <input type="text" id="studentId" name="studentId" value={formData.studentId} onChange={handleInputChange} placeholder="Enter your UIU Student ID" required disabled={isSubmitting} />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="email"><FaEnvelope className="input-icon" /> Email Address *</label>
                        <input type="email" id="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="Enter your email" required disabled={isSubmitting} />
                      </div>
                      <div className="form-group">
                        <label htmlFor="phone"><FaPhone className="input-icon" /> Phone Number</label>
                        <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="Enter your phone number" required disabled={isSubmitting} />
                      </div>
                    </div>
                    <div className="form-group">
                        <label htmlFor="facebookLink"><FaFacebook className="input-icon" /> Facebook Profile Link</label>
                        <input type="url" id="facebookLink" name="facebookLink" value={formData.facebookLink} onChange={handleInputChange} placeholder="https://facebook.com/yourprofile" required disabled={isSubmitting} />
                    </div>
                    <div className="form-group">
                      <label htmlFor="department"><FaUniversity className="input-icon" /> Department *</label>
                      <select id="department" name="department" value={formData.department} onChange={handleInputChange} required disabled={isSubmitting}>
                        <option value="">Select your department</option>
                        {departments.map((dept) => (<option key={dept} value={dept}>{dept}</option>))}
                      </select>
                    </div>
                  </div>

                  <div className="form-section">
                    <h3>Photography Background</h3>
                    <div className="form-group">
                      <label htmlFor="experience"><FaCamera className="input-icon" /> Experience Level *</label>
                      <select id="experience" name="experience" value={formData.experience} onChange={handleInputChange} required disabled={isSubmitting}>
                        <option value="">Select level</option>
                        {experienceLevels.map((level) => (<option key={level} value={level}>{level}</option>))}
                      </select>
                    </div>
                    <div className="form-group">
                        <label><FaCamera className="input-icon" /> Interests *</label>
                        <div className="interests-grid">
                            {photographyInterests.map((interest) => (
                                <label key={interest} className="interest-checkbox">
                                    <input type="checkbox" checked={formData.interests.includes(interest)} onChange={(e) => {
                                        const current = formData.interests.split(", ").filter(i => i);
                                        if (e.target.checked) current.push(interest);
                                        else {
                                            const idx = current.indexOf(interest);
                                            if (idx > -1) current.splice(idx, 1);
                                        }
                                        setFormData(prev => ({ ...prev, interests: current.join(", ") }));
                                    }} disabled={isSubmitting} />
                                    <span className="checkmark"></span> {interest}
                                </label>
                            ))}
                        </div>
                    </div>
                    <div className="form-group">
                        <label htmlFor="photo">Submit your Photo (Optional)</label>
                        <input type="file" id="photo-upload" accept="image/*" onChange={handlePhotoChange} disabled={isSubmitting} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="message">Why join? *</label>
                        <textarea id="message" name="message" rows={4} value={formData.message} onChange={handleInputChange} required disabled={isSubmitting}></textarea>
                    </div>
                  </div>

                  <div className="form-section">
                    <h3>Payment</h3>
                    <div className="payment-options">
                        {paymentMethods.map((method) => {
                            const IconComponent = method.icon;
                            return (
                                <label key={method.value} className={`payment-option ${formData.paymentMethod === method.value ? "selected" : ""}`}>
                                    <input type="radio" name="paymentMethod" value={method.value} checked={formData.paymentMethod === method.value} onChange={() => handlePaymentMethodChange(method.value)} required disabled={isSubmitting} />
                                    <span className="payment-checkmark"></span> <IconComponent /> <span>{method.label}</span>
                                </label>
                            );
                        })}
                    </div>
                    {formData.paymentMethod === "cash" && (
                        <div className="payment-details">
                            <div className="form-group">
                                <label htmlFor="receiverName">Receiver Name *</label>
                                <input type="text" id="receiverName" name="receiverName" value={formData.receiverName} onChange={handleInputChange} required disabled={isSubmitting} />
                            </div>
                        </div>
                    )}
                    {formData.paymentMethod === "online" && (
                        <div className="payment-details">
                            <div className="form-group">
                                <label htmlFor="transactionId">Transaction ID *</label>
                                <input type="text" id="transactionId" name="transactionId" value={formData.transactionId} onChange={handleInputChange} required disabled={isSubmitting} />
                            </div>
                        </div>
                    )}
                  </div>

                  <button type="submit" className={`btn-primary submit-btn ${isSubmitting ? "submitting" : ""}`} disabled={isSubmitting}>
                    {isSubmitting ? <FaSpinner className="spinner" /> : <><FaPaperPlane /> Submit Application</>}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showRulesPopup && (
        <div className="success-popup-overlay">
          <div className="success-popup">
            <h3>Agreement</h3>
            <div className="popup-content">
                <p>By submitting this form, you agree to follow the UIU Photography Club rules.</p>
                <label className="interest-checkbox">
                    <input type="checkbox" checked={agreementAccepted} onChange={(e) => setAgreementAccepted(e.target.checked)} />
                    <span className="checkmark"></span> I accept
                </label>
            </div>
            <div className="popup-actions">
                <button className="btn-primary" onClick={handleFinalSubmit}>Finish Submission</button>
                <button className="btn-secondary" onClick={() => setShowRulesPopup(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showSuccessPopup && (
         <div className="success-popup-overlay">
            <div className="success-popup">
                <FaCheck className="popup-icon" />
                <h3>Success!</h3>
                <button className="btn-primary" onClick={() => setShowSuccessPopup(false)}>OK</button>
            </div>
         </div>
      )}
    </div>
  );
};

export default JoinPage;
