"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";
import {
  FaUpload,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaUniversity,
  FaCamera,
  FaFileAlt,
  FaTimes,
  FaExclamationTriangle,
} from "react-icons/fa";
import "./PhotoSubmissionForm.css";
import { useSubmissionStatus } from '@/hooks/useSubmissionStatus';

const PhotoSubmissionForm = () => {
  const params = useParams();
  const eventId = params.eventId as string;
  const router = useRouter();

  const [formData, setFormData] = useState<any>({
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
  const [submissionDetails, setSubmissionDetails] = useState<any>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showRenameConfirm, setShowRenameConfirm] = useState(false);

  // GAS URL for submissions
  const GOOGLE_SCRIPT_URL = process.env.NEXT_PUBLIC_GAS_PHOTOS || (process.env as any).REACT_APP_GAS_PHOTOS || "";

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: value,
    }));
  };

  const { status: currentStatus, loading: checkingStatus } = useSubmissionStatus(GOOGLE_SCRIPT_URL, "getSubmissionStatus");
  const submissionsEnabled = currentStatus === "enabled";

  const handleSinglePhotoUpload = (e: any) => {
    const files = Array.from(e.target.files as FileList);

    const totalFiles = formData.photos.length + files.length;
    if (totalFiles > 10) {
      alert(`Maximum 10 photos allowed. You already have ${formData.photos.length} photos selected.`);
      e.target.value = "";
      return;
    }

    const oversizedFiles = files.filter((file) => file.size > 10 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      alert("Some files exceed 10MB limit. Please resize your images.");
      e.target.value = "";
      return;
    }

    setFormData((prev: any) => ({
      ...prev,
      photos: [...prev.photos, ...files],
    }));
    e.target.value = "";
  };

  const handlePhotoStoryUpload = (e: any) => {
    const files = Array.from(e.target.files as FileList);
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));
    const textFiles = files.filter((file) => file.type === "text/plain" || file.name.endsWith(".txt"));

    const totalStoryPhotos = formData.photoStory.length + imageFiles.length;
    if (totalStoryPhotos > 12) {
      alert(`Maximum 12 photos allowed for photo story. You already have ${formData.photoStory.length} photos selected.`);
      e.target.value = "";
      return;
    }

    if (textFiles.length > 0 && formData.storyTextFile) {
      alert("You can only upload one text file. Please remove the existing text file first.");
      e.target.value = "";
      return;
    }

    const oversizedFiles = files.filter((file) => file.size > 10 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      alert("Some files exceed 10MB limit. Please resize your images.");
      e.target.value = "";
      return;
    }

    setFormData((prev: any) => ({
      ...prev,
      photoStory: [...prev.photoStory, ...imageFiles],
      storyTextFile: textFiles.length > 0 ? textFiles[0] : prev.storyTextFile,
    }));
    e.target.value = "";
  };

  const removeSinglePhoto = (index: number) => {
    setFormData((prev: any) => ({
      ...prev,
      photos: prev.photos.filter((_: any, i: number) => i !== index),
    }));
  };

  const removeStoryPhoto = (index: number) => {
    setFormData((prev: any) => ({
      ...prev,
      photoStory: prev.photoStory.filter((_: any, i: number) => i !== index),
    }));
  };

  const removeTextFile = () => {
    setFormData((prev: any) => ({
      ...prev,
      storyTextFile: null,
    }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setShowRenameConfirm(true);
  };

  const uploadSingleFile = async (file: File, fileType: string, index: number, folderId: string) => {
    return new Promise(async (resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const fileData = {
            action: "uploadFile",
            fileData: (reader.result as string).split(",")[1],
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
            formDataEncoded.append(key, (fileData as any)[key]);
          });

          const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: formDataEncoded,
          });

          if (response.ok) {
            const result = await response.json();
            if (result.success) resolve(result);
            else reject(new Error(`Failed to upload ${file.name}: ${result.error}`));
          } else {
            reject(new Error(`HTTP error for ${file.name}: ${response.status}`));
          }
        } catch (error: any) {
          reject(new Error(`Upload failed for ${file.name}: ${error.message}`));
        }
      };
      reader.onerror = () => reject(new Error(`Failed to read file: ${file.name}`));
      reader.readAsDataURL(file);
    });
  };

  const handleConfirmSubmission = async () => {
    setShowRenameConfirm(false);
    setUploading(true);
    setUploadProgress(0);

    const forceRenderTick = () => new Promise((resolve) => setTimeout(resolve, 0));

    try {
      const allFiles = [...formData.photos, ...formData.photoStory, ...(formData.storyTextFile ? [formData.storyTextFile] : [])];
      if (allFiles.length === 0) throw new Error("No files to upload.");

      setSubmissionDetails({ success: false, message: "Creating submission folder...", processing: true });
      setSubmitted(true);

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
        storyTextFileName: formData.storyTextFile ? formData.storyTextFile.name : null,
      };

      const formDataEncoded = new URLSearchParams();
      Object.keys(folderData).forEach((key) => {
        formDataEncoded.append(key, (folderData as any)[key]);
      });

      const folderResponse = await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formDataEncoded,
      });

      if (!folderResponse.ok) throw new Error(`Failed to create folder: HTTP ${folderResponse.status}`);
      const folderResult = await folderResponse.json();
      if (!folderResult.success) throw new Error(folderResult.error || "Failed to create folder");

      setSubmissionDetails({ success: false, message: "Uploading files to Google Drive...", processing: true });

      const totalFiles = allFiles.length;
      let successfulUploads = 0;

      for (let i = 0; i < formData.photos.length; i++) {
        await uploadSingleFile(formData.photos[i], "photo", i + 1, folderResult.folderId);
        successfulUploads++;
        setUploadProgress((successfulUploads / totalFiles) * 85);
        await forceRenderTick();
      }

      for (let i = 0; i < formData.photoStory.length; i++) {
        await uploadSingleFile(formData.photoStory[i], "story", i + 1, folderResult.folderId);
        successfulUploads++;
        setUploadProgress((successfulUploads / totalFiles) * 85);
        await forceRenderTick();
      }

      if (formData.storyTextFile) {
        await uploadSingleFile(formData.storyTextFile, "text", 1, folderResult.folderId);
        successfulUploads++;
        setUploadProgress((successfulUploads / totalFiles) * 85);
        await forceRenderTick();
      }

      setSubmissionDetails({ success: false, message: "Finalizing submission...", processing: true });
      const finalizeFormData = new URLSearchParams();
      finalizeFormData.append("action", "finalizeSubmission");
      finalizeFormData.append("folderId", folderResult.folderId);

      const finalizeResponse = await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: finalizeFormData,
      });
      const finalizeResult = await finalizeResponse.json();
      if (!finalizeResult.success) throw new Error(finalizeResult.error || "Failed to finalize submission");

      setUploadProgress(100);
      try {
        await addDoc(collection(db, "photoSubmissions"), {
          eventId, name: formData.name, email: formData.email, phone: formData.phone,
          institution: formData.institution, category: formData.category,
          photoCount: formData.photos.length, storyPhotoCount: formData.photoStory.length,
          folderUrl: folderResult.folderUrl, timestamp: new Date().toISOString(), type: "photos"
        });
      } catch (e) {}

      setSubmissionDetails({
        success: true, message: "All files uploaded successfully!",
        photosSaved: successfulUploads, folderUrl: folderResult.folderUrl,
        processing: false, spreadsheetRow: finalizeResult.spreadsheetRow,
      });
    } catch (error: any) {
      setSubmissionDetails({ success: false, message: "Upload Failed", error: error.message, processing: false });
    } finally {
      setUploading(false);
    }
  };

  if (submitted) {
    return (
      <div className="submission-success">
        <div className="success-content">
          {submissionDetails?.processing ? (
            <>
              <div className="processing-spinner"><div className="spinner"></div></div>
              <h2>Processing Your Submission</h2>
              <p>{submissionDetails.message}</p>
              <div className="progress-bar"><div className="progress-fill" style={{ width: `${uploadProgress}%` }}></div></div>
            </>
          ) : submissionDetails?.success ? (
            <>
              <div className="success-icon">✅</div>
              <h2>Submission Successful!</h2>
              <button onClick={() => router.push("/events")} className="btn-primary">Back to Events</button>
            </>
          ) : (
            <>
              <div className="error-icon">❌</div>
              <h2>Upload Failed</h2>
              <p>{submissionDetails?.error}</p>
              <button onClick={() => setSubmitted(false)} className="btn-primary">Try Again</button>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="photo-submission-form">
      {showRenameConfirm && (
        <div className="modal-overlay">
          <div className="rename-confirm-modal">
            <h3>Photo Renaming Confirmation</h3>
            <p>Have you renamed your photos? Otherwise, your submission will be disqualified.</p>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowRenameConfirm(false)}>No, Go Back</button>
              <button className="btn-confirm" onClick={handleConfirmSubmission}>Yes, I've Renamed All Photos</button>
            </div>
          </div>
        </div>
      )}

      <div className="form-container">
        {checkingStatus ? <p>Checking status...</p> : !submissionsEnabled ? (
          <div className="submission-disabled-message">
            <h3>Submissions Disabled</h3>
            <button onClick={() => router.push("/events")} className="btn-primary">Back to Events</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <header className="form-header">
              <h1>Photo Submission Form</h1>
              <p>Shutter Stories Chapter IV</p>
            </header>
            <div className="form-section">
              <h3>Personal Information</h3>
              <input type="text" name="name" placeholder="Full Name" onChange={handleInputChange} required />
              <input type="email" name="email" placeholder="Email" onChange={handleInputChange} required />
              <input type="tel" name="phone" placeholder="Phone" onChange={handleInputChange} required />
              <select name="institution" onChange={handleInputChange} required>
                <option value="">Select Status</option>
                <option value="University Student">University Student</option>
                <option value="College Student">College Student</option>
                <option value="Freelancer">Freelancer</option>
              </select>
            </div>
            <div className="form-section">
              <h3>Category</h3>
              <label><input type="radio" name="category" value="single" checked={formData.category === "single"} onChange={handleInputChange} /> Single Photo</label>
              <label><input type="radio" name="category" value="story" checked={formData.category === "story"} onChange={handleInputChange} /> Photo Story</label>
            </div>
            <div className="form-section">
              <h3>Upload</h3>
              {formData.category === "single" ? (
                <input type="file" multiple accept="image/*" onChange={handleSinglePhotoUpload} />
              ) : (
                <input type="file" multiple accept="image/*,.txt" onChange={handlePhotoStoryUpload} />
              )}
            </div>
            <button type="submit" className="btn-submit" disabled={uploading}>Submit Application</button>
          </form>
        )}
      </div>
    </div>
  );
};

export default PhotoSubmissionForm;
