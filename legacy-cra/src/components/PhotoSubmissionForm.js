// components/PhotoSubmissionForm.js
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { collection, addDoc } from "firebase/firestore";
import {
  FaUpload,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaUniversity,
  FaCamera,
  //FaArrowLeft,
  FaFileAlt,
  FaTimes,
  FaExclamationTriangle,
} from "react-icons/fa";
import "./PhotoSubmissionForm.css";
import { useSubmissionStatus } from '../hooks/useSubmissionStatus';

const PhotoSubmissionForm = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    institution: "",
    category: "single",
    photos: [],
    photoStory: [],
    storyTextFile: null,
  });
  const [uploading, setUploading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submissionDetails, setSubmissionDetails] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showRenameConfirm, setShowRenameConfirm] = useState(false);
  // GAS URL for submissions
  const GOOGLE_SCRIPT_URL = process.env.REACT_APP_GAS_PHOTOS || process.env.REACT_APP_GAS_PHOTO_SUBMIT;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const { status: currentStatus, loading: checkingStatus } = useSubmissionStatus(GOOGLE_SCRIPT_URL, "getSubmissionStatus");
  const submissionsEnabled = currentStatus === "enabled";

  const handleSinglePhotoUpload = (e) => {
    const files = Array.from(e.target.files);

    // Check total files after adding new ones
    const totalFiles = formData.photos.length + files.length;
    if (totalFiles > 10) {
      alert(
        `Maximum 10 photos allowed. You already have ${formData.photos.length} photos selected.`
      );
      e.target.value = ""; // Reset input
      return;
    }

    const oversizedFiles = files.filter((file) => file.size > 10 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      alert("Some files exceed 10MB limit. Please resize your images.");
      e.target.value = ""; // Reset input
      return;
    }

    setFormData((prev) => ({
      ...prev,
      photos: [...prev.photos, ...files],
    }));

    // Reset the file input to allow selecting the same file again if needed
    e.target.value = "";
  };

  const handlePhotoStoryUpload = (e) => {
    const files = Array.from(e.target.files);

    // Separate images and text files
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));
    const textFiles = files.filter(
      (file) => file.type === "text/plain" || file.name.endsWith(".txt")
    );

    // Check total story photos after adding new ones
    const totalStoryPhotos = formData.photoStory.length + imageFiles.length;
    if (totalStoryPhotos > 12) {
      alert(
        `Maximum 12 photos allowed for photo story. You already have ${formData.photoStory.length} photos selected.`
      );
      e.target.value = ""; // Reset input
      return;
    }

    if (textFiles.length > 0 && formData.storyTextFile) {
      alert(
        "You can only upload one text file. Please remove the existing text file first."
      );
      e.target.value = ""; // Reset input
      return;
    }

    const oversizedFiles = files.filter((file) => file.size > 10 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      alert("Some files exceed 10MB limit. Please resize your images.");
      e.target.value = ""; // Reset input
      return;
    }

    setFormData((prev) => ({
      ...prev,
      photoStory: [...prev.photoStory, ...imageFiles],
      storyTextFile: textFiles.length > 0 ? textFiles[0] : prev.storyTextFile,
    }));

    // Reset the file input
    e.target.value = "";
  };

  // Remove single photo
  const removeSinglePhoto = (index) => {
    setFormData((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
    }));
  };

  // Remove story photo
  const removeStoryPhoto = (index) => {
    setFormData((prev) => ({
      ...prev,
      photoStory: prev.photoStory.filter((_, i) => i !== index),
    }));
  };

  // Remove text file
  const removeTextFile = () => {
    setFormData((prev) => ({
      ...prev,
      storyTextFile: null,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Show rename confirmation dialog first
    setShowRenameConfirm(true);
  };

  const handleConfirmSubmission = async () => {
    setShowRenameConfirm(false);
    setUploading(true);
    setUploadProgress(0);

    const forceRenderTick = () =>
      new Promise((resolve) => setTimeout(resolve, 0));

    try {

      // Combine all files
      const allFiles = [
        ...formData.photos,
        ...formData.photoStory,
        ...(formData.storyTextFile ? [formData.storyTextFile] : []),
      ];

      if (allFiles.length === 0) {
        throw new Error("No files to upload.");
      }

      // Show initial processing message
      setSubmissionDetails({
        success: false,
        message: "Creating submission folder...",
        processing: true,
      });
      setSubmitted(true);

      // Step 1: Create folder using URL encoded form data (Method 2)
      const folderData = {
        action: "createFolder",
        timestamp: new Date().toISOString(),
        eventId: eventId,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        institution: formData.institution,
        category: formData.category,
        photoCount: formData.photos.length,
        storyPhotoCount: formData.photoStory.length,
        hasStoryText: !!formData.storyTextFile,
        storyTextFileName: formData.storyTextFile
          ? formData.storyTextFile.name
          : null,
      };

      const formDataEncoded = new URLSearchParams();
      Object.keys(folderData).forEach((key) => {
        if (Array.isArray(folderData[key])) {
          formDataEncoded.append(key, JSON.stringify(folderData[key]));
        } else {
          formDataEncoded.append(key, folderData[key]);
        }
      });

      const folderResponse = await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formDataEncoded,
      });

      if (!folderResponse.ok) {
        throw new Error(
          `Failed to create folder: HTTP ${folderResponse.status}`
        );
      }

      const folderResult = await folderResponse.json();

      if (!folderResult.success) {
        throw new Error(folderResult.error || "Failed to create folder");
      }

      // Step 2: Upload files one by one
      setSubmissionDetails({
        success: false,
        message: "Uploading files to Google Drive...",
        processing: true,
      });

      setUploadProgress(0);
      const totalFiles = allFiles.length;
      let successfulUploads = 0;

      // Upload single photos
      for (let i = 0; i < formData.photos.length; i++) {
        const file = formData.photos[i];
        await uploadSingleFile(file, "photo", i + 1, folderResult.folderId);
        successfulUploads++;
        setUploadProgress((successfulUploads / totalFiles) * 85);
        await forceRenderTick();
      }

      // Upload story photos
      for (let i = 0; i < formData.photoStory.length; i++) {
        const file = formData.photoStory[i];
        await uploadSingleFile(file, "story", i + 1, folderResult.folderId);
        successfulUploads++;
        setUploadProgress((successfulUploads / totalFiles) * 85);
        await forceRenderTick();
      }

      // Upload text file if exists
      if (formData.storyTextFile) {
        await uploadSingleFile(
          formData.storyTextFile,
          "text",
          1,
          folderResult.folderId
        );
        successfulUploads++;
        setUploadProgress((successfulUploads / totalFiles) * 85);
        await forceRenderTick();
      }

      // Step 3: Finalize submission
      setSubmissionDetails({
        success: false,
        message: "Finalizing submission...",
        processing: true,
      });

      const finalizeFormData = new URLSearchParams();
      finalizeFormData.append("action", "finalizeSubmission");
      finalizeFormData.append("folderId", folderResult.folderId);

      const finalizeResponse = await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: finalizeFormData,
      });

      if (!finalizeResponse.ok) {
        throw new Error("Failed to finalize submission");
      }

      const finalizeResult = await finalizeResponse.json();

      if (!finalizeResult.success) {
        throw new Error(
          finalizeResult.error || "Failed to finalize submission"
        );
      }

      // Set to 100% when complete
      setUploadProgress(100);
      await forceRenderTick();

      // Firebase Dual-Write Mirroring
      try {
        const firestoreDoc = {
          eventId: eventId,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          institution: formData.institution,
          category: formData.category,
          photoCount: formData.photos.length,
          storyPhotoCount: formData.photoStory.length,
          hasStoryText: !!formData.storyTextFile,
          folderUrl: folderResult.folderUrl,
          timestamp: new Date().toISOString(),
          type: "photos"
        };
        await addDoc(collection(db, "photoSubmissions"), firestoreDoc);
      } catch (fbError) {
        // We won't block the actual submission if GAS passes
      }

      // Show success
      setSubmissionDetails({
        success: true,
        message: "All files uploaded successfully!",
        photosSaved: successfulUploads,
        folderUrl: folderResult.folderUrl,
        processing: false,
        spreadsheetRow: finalizeResult.spreadsheetRow,
      });
    } catch (error) {
      console.error("💥 Upload failed:", error);

      setUploadProgress(100);
      await forceRenderTick();

      setSubmissionDetails({
        success: false,
        message: "Upload Failed",
        error: error.message,
        processing: false,
      });
    } finally {
      setUploading(false);
    }
  };

  const handleCancelSubmission = () => {
    setShowRenameConfirm(false);
  };

  // Individual file upload helper function using only URL encoded form data (Method 2)
  const uploadSingleFile = async (file, fileType, index, folderId) => {
    return new Promise(async (resolve, reject) => {
      const reader = new FileReader();

      reader.onload = async () => {
        try {
          const fileData = {
            action: "uploadFile",
            fileData: reader.result.split(",")[1],
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
            folderId: folderId,
            fileTypeCategory: fileType,
            fileIndex: index,
            timestamp: new Date().toISOString(),
          };

          const formDataEncoded = new URLSearchParams();
          Object.keys(fileData).forEach((key) => {
            if (Array.isArray(fileData[key])) {
              formDataEncoded.append(key, JSON.stringify(fileData[key]));
            } else {
              formDataEncoded.append(key, fileData[key]);
            }
          });

          const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: formDataEncoded,
          });

          if (response.ok) {
            const result = await response.json();
            if (result.success) {

              resolve(result);
            } else {
              reject(
                new Error(`Failed to upload ${file.name}: ${result.error}`)
              );
            }
          } else {
            reject(
              new Error(`HTTP error for ${file.name}: ${response.status}`)
            );
          }
        } catch (error) {
          reject(new Error(`Upload failed for ${file.name}: ${error.message}`));
        }
      };

      reader.onerror = () => {
        reject(new Error(`Failed to read file: ${file.name}`));
      };

      reader.readAsDataURL(file);
    });
  };

  // Rename Confirmation Modal
  const RenameConfirmationModal = () => (
    <div className="modal-overlay">
      <div className="rename-confirm-modal">
        <div className="modal-header">
          <FaExclamationTriangle className="warning-icon" />
          <h3>Photo Renaming Confirmation</h3>
        </div>
        
        <div className="modal-content">
          <h3><strong>Have you renamed your photos?</strong></h3>
          <p>Otherwise, your submission will be disqualified.</p>
          
          <div className="naming-format">
            <p><strong>Required Format:</strong></p>
            <code>Institution Name_Participant's name_Category_Mobile no_Serial no</code>
          </div>

          <div className="event-details">
            <p><strong>Event Details:</strong></p>
            <a 
              href="https://uiupc.vercel.app/events/shutter-stories" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              https://uiupc.vercel.app/events/shutter-stories
            </a>
          </div>

          <div className="file-count-info">
            <p>
              You are about to submit{" "}
              <strong>
                {formData.category === "single" 
                  ? `${formData.photos.length} photo(s)` 
                  : `${formData.photoStory.length} photo(s)${formData.storyTextFile ? ' + 1 text file' : ''}`
                }
              </strong>
            </p>
          </div>
        </div>

        <div className="modal-actions">
          <button 
            className="btn-cancel" 
            onClick={handleCancelSubmission}
            disabled={uploading}
          >
            No, Go Back
          </button>
          <button 
            className="btn-confirm" 
            onClick={handleConfirmSubmission}
            disabled={uploading}
          >
            Yes, I've Renamed All Photos
          </button>
        </div>
      </div>
    </div>
  );

  // Success/Processing Screen
  if (submitted) {
    return (
      <div className="submission-success">
        <div className="success-content">
          {submissionDetails?.processing ? (
            <>
              <div className="processing-spinner">
                <div className="spinner"></div>
              </div>
              <h2>Processing Your Submission</h2>
              <p>{submissionDetails.message}</p>

              {/* Progress Bar */}
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>

              {/* Show different text based on the stage */}
              {submissionDetails.message.includes("Processing your photos") ? (
                <>
                  <p className="progress-text">
                    {Math.round(uploadProgress)}% complete
                  </p>
                  <p className="wait-message">
                    Please wait while we process your{" "}
                    {formData.category === "story"
                      ? "photos and story"
                      : "photos"}
                    ...
                  </p>
                </>
              ) : (
                <>
                  <p className="progress-text">
                    {Math.round(uploadProgress)}% uploaded
                  </p>
                  <p className="wait-message">
                    Uploading to Google Drive... This may take a few minutes
                    depending on file sizes.
                  </p>
                </>
              )}
            </>
          ) : submissionDetails?.success ? (
            // Success UI
            <>
              <div className="success-icon">✅</div>
              <h2>Submission Successful!</h2>
              <p>
                Your{" "}
                {formData.category === "story"
                  ? "photo story and text file"
                  : "photos"}{" "}
                have been saved successfully.
              </p>

              {submissionDetails && (
                <div className="submission-details">
                  <p>
                    <strong>Files Saved:</strong>{" "}
                    {submissionDetails.photosSaved}
                  </p>
                  {formData.category === "story" && formData.storyTextFile && (
                    <p>
                      <strong>Story File:</strong> {formData.storyTextFile.name}
                    </p>
                  )}
                  {submissionDetails.folderUrl && (
                    <p>
                      <strong>Files Location:</strong>{" "}
                      <a
                        href={submissionDetails.folderUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View in Google Drive
                      </a>
                    </p>
                  )}
                </div>
              )}

              <button
                onClick={() => navigate("/events")}
                className="btn-primary"
              >
                Back to Events
              </button>
            </>
          ) : (
            // Error UI
            <>
              <div className="error-icon">❌</div>
              <h2>Upload Failed</h2>
              <p className="error-message">
                {submissionDetails?.error ||
                  "Failed to upload files to Google Drive."}
              </p>
              <div className="error-suggestions">
                <p>
                  <strong>Suggestions:</strong>
                </p>
                <ul>
                  <li>Reduce the number of photos</li>
                  <li>Compress your photos to reduce file size</li>
                  <li>Try uploading in smaller batches</li>
                  <li>Check your internet connection</li>
                </ul>
              </div>
              <button
                onClick={() => setSubmitted(false)}
                className="btn-primary"
              >
                Try Again
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="photo-submission-form">
      {/* Rename Confirmation Modal */}
      {showRenameConfirm && <RenameConfirmationModal />}

      <div className="form-container">
        {/* Check submission status FIRST */}
        {checkingStatus ? (
          <div className="submission-status-checking">
            <div className="spinner"></div>
            <p>Checking submission status...</p>
          </div>
        ) : !submissionsEnabled ? (
          <div className="submission-disabled-message">
            <FaExclamationTriangle className="warning-icon" />
            <h3>Submissions Temporarily Disabled</h3>
            <p>Photo submissions for Shutter Stories Chapter IV are currently disabled.</p>
            <p>Please check back later or contact the organizers for more information.</p>
            <button
              onClick={() => navigate("/events")}
              className="btn-primary"
            >
              Back to Events
            </button>
          </div>
        ) : (
          // Your existing form content here - WRAP EVERYTHING FROM form-header to form-actions in this fragment
          <>
        <header className="form-header">
          {/* <button onClick={() => navigate("/events")} className="back-button">
            <FaArrowLeft />
            Back to Events
          </button> */}
          <h1>Photo Submission Form</h1>
          <p>Shutter Stories Chapter IV - National Photography Exhibition</p>
          <p className="form-note">Your photos will be saved to Google Drive</p>
        </header>

        <form onSubmit={handleSubmit} className="submission-form">
          {/* Personal Information Section */}
          <div className="form-section">
            <h3>Personal Information</h3>
            <div className="form-grid">
              <div className="input-group">
                <label>
                  <FaUser className="input-icon" />
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your full name"
                />
              </div>

              <div className="input-group">
                <label>
                  <FaEnvelope className="input-icon" />
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your email"
                />
              </div>

              <div className="input-group">
                <label>
                  <FaPhone className="input-icon" />
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your phone number"
                />
              </div>

              <div className="input-group">
                <label>
                  <FaUniversity className="input-icon" />
                  Institution / Status *
                </label>
                <select
                  name="institution"
                  value={formData.institution}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select your status</option>
                  <option value="University Student">University Student</option>
                  <option value="College Student">College Student</option>
                  <option value="School Student">School Student</option>
                  <option value="Freelancer">Freelancer</option>
                  <option value="Professional Photographer">
                    Professional Photographer
                  </option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Category Selection */}
          <div className="form-section">
            <h3>Submission Category</h3>
            <div className="category-selection">
              <label className="category-option">
                <input
                  type="radio"
                  name="category"
                  value="single"
                  checked={formData.category === "single"}
                  onChange={handleInputChange}
                />
                <div className="category-card">
                  <FaCamera className="category-icon" />
                  <h4>Single Photo Category</h4>
                  <p>Submit up to 10 individual photos</p>
                  <ul>
                    <li>Maximum 10 photos</li>
                    <li>10MB per photo limit</li>
                    <li>Open theme</li>
                    <li>
                      Rename Photos: Institution Name_Participant’s name_Category_Mobile no_Serial no
                    </li>
                  </ul>
                </div>
              </label>

              <label className="category-option">
                <input
                  type="radio"
                  name="category"
                  value="story"
                  checked={formData.category === "story"}
                  onChange={handleInputChange}
                />
                <div className="category-card">
                  <FaFileAlt className="category-icon" />
                  <h4>Photo Story Category</h4>
                  <p>Submit a series of 6-12 photos telling a story</p>
                  <ul>
                    <li>6-12 photos required</li>
                    <li>10MB per photo limit</li>
                    <li>Open theme</li>
                    <li>
                      Rename Photos: Institution Name_Participant’s name_Category_Mobile no_Serial no
                    </li>
                    <li>Include a .txt file with your story description</li>
                  </ul>
                </div>
              </label>
            </div>
          </div>

          {/* Photo Upload Section */}
          <div className="form-section">
            <h3>Photo Upload</h3>
            <p className="form-note">
              Photos will be automatically saved to Google Drive
            </p>

            {formData.category === "single" ? (
              <div className="upload-section">
                <div className="rename-warning-banner">
              <FaExclamationTriangle />
              <span>
                <strong>IMPORTANT:</strong> Rename your photos before uploading using the format:{" "}
                <code>Institution Name_Participant's name_Category_Mobile no_Serial no</code>
              </span>
            </div>
                <label className="upload-area">
                  <FaUpload className="upload-icon" />
                  <span>Upload Single Photos (Max 10, 10MB each)</span>
                  <span className="upload-hint">
                    You can upload photos one by one
                  </span>
                  <span>Before submitting, Please check that you have renamed your photo. <br/> 
                  Otherwise, Your submission wont be counted.</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleSinglePhotoUpload}
                    disabled={uploading || formData.photos.length >= 10}
                  />
                </label>
                {formData.photos.length > 0 && (
                  <div className="upload-preview">
                    <div className="preview-header">
                      <h4>Selected Photos ({formData.photos.length}/10)</h4>
                      <button
                        type="button"
                        className="clear-all-btn"
                        onClick={() =>
                          setFormData((prev) => ({ ...prev, photos: [] }))
                        }
                      >
                        Clear All
                      </button>
                    </div>
                    <div className="preview-grid">
                      {formData.photos.map((photo, index) => (
                        <div key={index} className="preview-item">
                          <button
                            className="remove-btn"
                            onClick={() => removeSinglePhoto(index)}
                            type="button"
                            disabled={uploading}
                          >
                            <FaTimes />
                          </button>
                          <img
                            src={URL.createObjectURL(photo)}
                            alt={`Preview ${index + 1}`}
                          />
                          <span className="file-name">{photo.name}</span>
                          <span className="file-size">
                            {(photo.size / (1024 * 1024)).toFixed(2)} MB
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="upload-section">
            <div className="rename-warning-banner">
              <FaExclamationTriangle />
              <span>
                <strong>IMPORTANT:</strong> Rename your photos before uploading using the format:{" "}
                <code>Institution Name_Participant's name_Category_Mobile no_Serial no</code>
              </span>
            </div>
                <label className="upload-area">
                  <FaUpload className="upload-icon" />
                  <span> Upload Photo Story (6-12 photos + .txt file)</span>
                  <span className="upload-hint">You can upload photos and text file one by one</span>
                  <span>Before submitting, Please check that you have renamed your photo. <br/> 
                  Otherwise, Your submission wont be counted.</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*,.txt"
                    onChange={handlePhotoStoryUpload}
                    disabled={uploading || formData.photoStory.length >= 12}
                  />
                </label>
                {(formData.photoStory.length > 0 || formData.storyTextFile) && (
                  <div className="upload-preview">
                    <div className="preview-header">
                      <h4>Photo Story Files</h4>
                      <button
                        type="button"
                        className="clear-all-btn"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            photoStory: [],
                            storyTextFile: null,
                          }))
                        }
                      >
                        Clear All
                      </button>
                    </div>
                    {formData.photoStory.length > 0 && (
                      <>
                        <h5>Photos ({formData.photoStory.length}/12)</h5>
                        <div className="preview-grid">
                          {formData.photoStory.map((photo, index) => (
                            <div key={index} className="preview-item">
                              <button
                                className="remove-btn"
                                onClick={() => removeStoryPhoto(index)}
                                type="button"
                                disabled={uploading}
                              >
                                <FaTimes />
                              </button>
                              <img
                                src={URL.createObjectURL(photo)}
                                alt={`Story ${index + 1}`}
                              />
                              <span className="file-name">
                                Photo {index + 1}
                              </span>
                              <span className="file-size">
                                {(photo.size / (1024 * 1024)).toFixed(2)} MB
                              </span>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                    {formData.storyTextFile && (
                      <div className="text-file-preview">
                        <button
                          className="remove-btn"
                          onClick={removeTextFile}
                          type="button"
                          disabled={uploading}
                        >
                          <FaTimes />
                        </button>
                        <FaFileAlt className="text-file-icon" />
                        <div className="text-file-info">
                          <span className="file-name">
                            {formData.storyTextFile.name}
                          </span>
                          <span className="file-size">
                            {(formData.storyTextFile.size / 1024).toFixed(2)} KB
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Submission Button */}
          <div className="form-actions">
            <button
              type="submit"
              className="btn-primary submit-btn"
              disabled={
                uploading ||
                 !submissionsEnabled ||
                (formData.category === "single" &&
                  formData.photos.length === 0) ||
                (formData.category === "story" &&
                  (formData.photoStory.length < 6 ||
                    formData.photoStory.length > 12))
              }
            >
              {uploading ? "Uploading to Google Drive..." : "Submit Photos"}
            </button>
            {uploading && (
              <p className="upload-warning">
                Please wait while we process your submission. This may take a
                few minutes...
              </p>
            )}
          </div>
        </form>
        </>
        )}
      </div>
    </div>
  );
};

export default PhotoSubmissionForm;
