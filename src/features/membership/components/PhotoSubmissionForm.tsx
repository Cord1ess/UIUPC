"use client";

import React, { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";
import {
  FaUpload,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaUniversity,
  FaCamera,
  FaImages,
  FaFileAlt,
  FaTimes,
  FaExclamationTriangle,
  FaChevronRight,
  FaCheckCircle,
} from "react-icons/fa";
import { useSubmissionStatus } from '@/hooks/useSubmissionStatus';
import GlobalLoader from "@/components/shared/GlobalLoader";
import ScrollRevealText from "@/components/motion/ScrollRevealText";

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

  if (checkingStatus) return <GlobalLoader />;

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#f9f5ea] dark:bg-[#0a0a0a] flex items-center justify-center p-6">
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-xl bg-white dark:bg-zinc-950 border border-black/10 dark:border-white/10 rounded-[2.5rem] p-12 md:p-16 shadow-2xl text-center"
        >
          {submissionDetails?.processing ? (
            <div className="space-y-8">
              <div className="relative w-24 h-24 mx-auto">
                 <div className="absolute inset-0 border-4 border-uiupc-orange/10 rounded-full" />
                 <div className="absolute inset-0 border-4 border-uiupc-orange border-t-transparent rounded-full animate-spin" />
              </div>
              <ScrollRevealText 
                text="PROCESSING" 
                className="text-4xl font-black uppercase tracking-tighter text-zinc-900 dark:text-white"
              />
              <p className="text-zinc-500 text-xs font-black uppercase tracking-[0.2em]">{submissionDetails.message}</p>
              <div className="h-1.5 w-full bg-zinc-100 dark:bg-zinc-900 rounded-full overflow-hidden">
                <motion.div 
                    className="h-full bg-uiupc-orange" 
                    initial={{ width: 0 }}
                    animate={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          ) : submissionDetails?.success ? (
            <div className="space-y-10">
              <FaCheckCircle className="text-uiupc-orange text-7xl mx-auto" />
              <div className="space-y-4">
                  <h2 className="text-4xl font-black uppercase tracking-tighter text-zinc-900 dark:text-white leading-tight">
                      Submission Successful
                  </h2>
                  <p className="text-zinc-500 font-medium leading-relaxed italic font-serif">
                      "Each submission is a brushstroke on the canvas of our visual history."
                  </p>
              </div>
              <button 
                onClick={() => router.push("/events")} 
                className="w-full py-5 bg-black dark:bg-white text-white dark:text-black text-[10px] font-black uppercase tracking-[0.4em] rounded-full hover:bg-uiupc-orange dark:hover:bg-uiupc-orange hover:text-white transition-all transform hover:scale-105"
              >
                Return to Events
              </button>
            </div>
          ) : (
            <div className="space-y-10">
              <FaExclamationTriangle className="text-red-500 text-7xl mx-auto" />
              <div className="space-y-4">
                  <h2 className="text-4xl font-black uppercase tracking-tighter text-zinc-900 dark:text-white leading-tight">
                      Upload Failed
                  </h2>
                  <p className="text-red-500/80 text-[10px] font-black uppercase tracking-widest">{submissionDetails?.error}</p>
              </div>
              <button 
                onClick={() => setSubmitted(false)} 
                className="w-full py-5 bg-black dark:bg-white text-white dark:text-black text-[10px] font-black uppercase tracking-[0.4em] rounded-full hover:bg-uiupc-orange dark:hover:bg-uiupc-orange hover:text-white transition-all transform hover:scale-105"
              >
                Try Again
              </button>
            </div>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9f5ea] dark:bg-[#0a0a0a] transition-colors duration-500 pt-32 pb-40 px-6 overflow-hidden">
      {showRenameConfirm && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6 backdrop-blur-md bg-black/40">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md bg-white dark:bg-zinc-950 border border-black/10 dark:border-white/10 rounded-[2rem] p-10 md:p-12 shadow-2xl text-center space-y-8"
          >
            <div className="w-16 h-16 bg-uiupc-orange/10 rounded-full flex items-center justify-center mx-auto">
                <FaExclamationTriangle className="text-uiupc-orange text-xl" />
            </div>
            <div className="space-y-4">
                <h3 className="text-2xl font-black uppercase tracking-tighter text-zinc-900 dark:text-white">Rename Confirmation</h3>
                <p className="text-zinc-500 text-xs font-black uppercase tracking-[0.1em] leading-relaxed">
                    Have you renamed your photos according to the guidelines? Failure to rename will result in immediate disqualification.
                </p>
            </div>
            <div className="flex flex-col gap-3">
              <button 
                className="w-full py-4 bg-uiupc-orange text-white text-[10px] font-black uppercase tracking-[0.4em] rounded-full hover:scale-105 transition-transform" 
                onClick={handleConfirmSubmission}
              >
                Yes, Verified
              </button>
              <button 
                className="w-full py-4 text-zinc-400 text-[10px] font-black uppercase tracking-[0.4em] hover:text-zinc-900 dark:hover:text-white transition-colors" 
                onClick={() => setShowRenameConfirm(false)}
              >
                No, Go Back
              </button>
            </div>
          </motion.div>
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        {!submissionsEnabled ? (
          <div className="py-40 text-center space-y-12">
            <div className="relative w-32 h-32 mx-auto">
                <div className="absolute inset-0 border border-uiupc-orange/20 rounded-full animate-ping" />
                <div className="absolute inset-4 border border-zinc-200 dark:border-zinc-800 rounded-full flex items-center justify-center">
                    <FaTimes className="text-zinc-300 dark:text-zinc-700 text-2xl" />
                </div>
            </div>
            <div className="space-y-4">
                <ScrollRevealText 
                    text="SUBMISSIONS CLOSED" 
                    className="text-4xl md:text-7xl font-black uppercase tracking-tighter text-zinc-900 dark:text-white"
                />
                <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.4em]">The window for Shutter Stories Chapter IV has locked.</p>
            </div>
            <button 
                onClick={() => router.push("/events")} 
                className="px-12 py-5 border-2 border-zinc-900 dark:border-white text-zinc-900 dark:text-white text-[10px] font-black uppercase tracking-[0.4em] rounded-full hover:bg-zinc-900 dark:hover:bg-white hover:text-white dark:hover:text-black transition-all"
            >
                View Other Events
            </button>
          </div>
        ) : (
          <div className="space-y-24">
            {/* Header */}
            <header className="space-y-8 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 justify-center md:justify-start">
                            <span className="w-8 h-[1px] bg-uiupc-orange" />
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400">Submission Hub</span>
                        </div>
                        <ScrollRevealText 
                            text="SUBMIT WORK" 
                            className="text-[12vw] md:text-[6.5vw] font-black uppercase tracking-tighter leading-[0.8] text-zinc-900 dark:text-white"
                        />
                    </div>
                </div>
                <p className="max-w-2xl text-zinc-500 dark:text-zinc-400 font-medium text-lg leading-relaxed italic font-serif">
                    "Contribute your perspective to the visual legacy of United International University Photography Club."
                </p>
            </header>

            <form onSubmit={handleSubmit} className="space-y-32">
              {/* Section 1: Identity */}
              <section className="space-y-12">
                <div className="flex items-center gap-6">
                    <div className="w-12 h-12 rounded-xl bg-zinc-900 dark:bg-white flex items-center justify-center text-white dark:text-black text-xs font-black">01</div>
                    <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tighter text-zinc-900 dark:text-white">Identity</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 pl-4">Full Name</label>
                    <input type="text" name="name" placeholder="E.G. ABDULLAH AL NOUMAN" onChange={handleInputChange} required className="w-full bg-white dark:bg-zinc-950 border border-black/5 dark:border-white/5 rounded-2xl px-6 py-4 text-xs font-bold tracking-tight outline-none focus:border-uiupc-orange transition-colors dark:text-white" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 pl-4">Email Address</label>
                    <input type="email" name="email" placeholder="E.G. NOUMAN@EXAMPLE.COM" onChange={handleInputChange} required className="w-full bg-white dark:bg-zinc-950 border border-black/5 dark:border-white/5 rounded-2xl px-6 py-4 text-xs font-bold tracking-tight outline-none focus:border-uiupc-orange transition-colors dark:text-white" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 pl-4">Phone Number</label>
                    <input type="tel" name="phone" placeholder="E.G. +880 1XXX-XXXXXX" onChange={handleInputChange} required className="w-full bg-white dark:bg-zinc-950 border border-black/5 dark:border-white/5 rounded-2xl px-6 py-4 text-xs font-bold tracking-tight outline-none focus:border-uiupc-orange transition-colors dark:text-white" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 pl-4">Current Status</label>
                    <select name="institution" onChange={handleInputChange} required className="w-full bg-white dark:bg-zinc-950 border border-black/5 dark:border-white/5 rounded-2xl px-6 py-4 text-xs font-bold tracking-tight outline-none focus:border-uiupc-orange transition-colors dark:text-white appearance-none">
                      <option value="">Select</option>
                      <option value="University Student">University Student</option>
                      <option value="College Student">College Student</option>
                      <option value="Freelancer">Freelancer/Professional</option>
                    </select>
                  </div>
                </div>
              </section>

              {/* Section 2: Narrative Mode */}
              <section className="space-y-12">
                <div className="flex items-center gap-6">
                    <div className="w-12 h-12 rounded-xl bg-zinc-900 dark:bg-white flex items-center justify-center text-white dark:text-black text-xs font-black">02</div>
                    <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tighter text-zinc-900 dark:text-white">Narrative Mode</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { id: 'single', name: 'Single Photo', desc: 'Fragments of a larger world.', icon: FaCamera },
                    { id: 'story', name: 'Photo Story', desc: 'A curated visual narrative.', icon: FaImages }
                  ].map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, category: cat.id })}
                      className={`
                        p-8 rounded-3xl border text-left transition-all duration-300 relative overflow-hidden group
                        ${formData.category === cat.id 
                            ? 'bg-zinc-900 border-zinc-900 text-white dark:bg-white dark:border-white dark:text-black' 
                            : 'bg-white border-black/5 hover:border-uiupc-orange/40 dark:bg-zinc-950 dark:border-white/5'}
                      `}
                    >
                      <cat.icon className={`text-2xl mb-6 ${formData.category === cat.id ? 'text-uiupc-orange' : 'text-zinc-300 dark:text-zinc-700'}`} />
                      <h4 className="text-xl font-black uppercase tracking-tighter mb-2">{cat.name}</h4>
                      <p className={`text-[10px] font-bold uppercase tracking-widest ${formData.category === cat.id ? 'opacity-60' : 'text-zinc-400'}`}>{cat.desc}</p>
                    </button>
                  ))}
                </div>
              </section>

              {/* Section 3: Asset Deposit */}
              <section className="space-y-12">
                <div className="flex items-center gap-6">
                    <div className="w-12 h-12 rounded-xl bg-zinc-900 dark:bg-white flex items-center justify-center text-white dark:text-black text-xs font-black">03</div>
                    <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tighter text-zinc-900 dark:text-white">Asset Deposit</h3>
                </div>

                <div className="space-y-8">
                  {/* Dropzone */}
                  <div className="relative group">
                    <input 
                        type="file" 
                        multiple 
                        accept={formData.category === "single" ? "image/*" : "image/*,.txt"}
                        onChange={formData.category === "single" ? handleSinglePhotoUpload : handlePhotoStoryUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="p-16 md:p-24 border-2 border-dashed border-black/5 dark:border-white/5 rounded-[3rem] text-center space-y-6 group-hover:bg-uiupc-orange/[0.02] group-hover:border-uiupc-orange/30 transition-all duration-500">
                        <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-900 rounded-full flex items-center justify-center mx-auto transition-transform group-hover:scale-110">
                            <FaUpload className="text-zinc-400 group-hover:text-uiupc-orange transition-colors" />
                        </div>
                        <div className="space-y-2">
                            <h5 className="text-xl font-black uppercase tracking-tighter text-zinc-900 dark:text-white">Deposit Files</h5>
                            <p className="text-zinc-400 text-[10px] font-black uppercase tracking-widest">RAW or Optimized JPEG • Max 10MB per file</p>
                        </div>
                    </div>
                  </div>

                  {/* Manifest / Selected Files */}
                  <div className="space-y-4">
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 pl-4">Manifest</span>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <AnimatePresence>
                            {(formData.category === "single" ? formData.photos : formData.photoStory).map((file: File, idx: number) => (
                                <motion.div 
                                    key={file.name + idx}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className="p-4 bg-white dark:bg-zinc-900 border border-black/5 dark:border-white/5 rounded-2xl flex items-center justify-between"
                                >
                                    <div className="flex items-center gap-4 truncate">
                                        <FaCamera className="text-zinc-300 dark:text-zinc-700 shrink-0" />
                                        <div className="truncate">
                                            <p className="text-[10px] font-black truncate uppercase tracking-tighter text-zinc-900 dark:text-white">{file.name}</p>
                                            <p className="text-[8px] font-bold text-zinc-400 uppercase">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                        </div>
                                    </div>
                                    <button 
                                        type="button"
                                        onClick={() => formData.category === "single" ? removeSinglePhoto(idx) : removeStoryPhoto(idx)}
                                        className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-red-500/10 hover:text-red-500 transition-colors"
                                    >
                                        <FaTimes />
                                    </button>
                                </motion.div>
                            ))}

                            {formData.category === "story" && formData.storyTextFile && (
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className="p-4 bg-uiupc-orange/5 border border-uiupc-orange/20 rounded-2xl flex items-center justify-between"
                                >
                                    <div className="flex items-center gap-4 truncate">
                                        <FaFileAlt className="text-uiupc-orange shrink-0" />
                                        <div className="truncate">
                                            <p className="text-[10px] font-black truncate uppercase tracking-tighter text-uiupc-orange">{formData.storyTextFile.name}</p>
                                            <p className="text-[8px] font-bold text-uiupc-orange/60 uppercase">NARRATIVE TEXT</p>
                                        </div>
                                    </div>
                                    <button 
                                        type="button"
                                        onClick={removeTextFile}
                                        className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-uiupc-orange/10 text-uiupc-orange"
                                    >
                                        <FaTimes />
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                  </div>
                </div>
              </section>

              {/* Submit Action */}
              <div className="pt-20">
                <button 
                  type="submit" 
                  disabled={uploading}
                  className="w-full py-6 md:py-8 bg-black dark:bg-white text-white dark:text-black rounded-[2rem] flex items-center justify-center gap-4 group hover:bg-uiupc-orange dark:hover:bg-uiupc-orange hover:text-white transition-all transform hover:scale-[1.02] active:scale-95 shadow-2xl disabled:opacity-50"
                >
                  <span className="text-[11px] md:text-xs font-black uppercase tracking-[0.5em]">Seal and Submit Manifest</span>
                  <FaChevronRight className="group-hover:translate-x-2 transition-transform" />
                </button>
                <p className="text-center mt-8 text-[9px] font-black uppercase tracking-[0.3em] text-zinc-400">
                    BY SUBMITTING, YOU AGREE TO THE UIUPC CODE OF ETHICS AND EXHIBITION GUIDELINES.
                </p>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default PhotoSubmissionForm;
