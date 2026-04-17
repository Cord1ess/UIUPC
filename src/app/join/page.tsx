"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
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
  FaFacebook,
  FaArrowRight,
  FaHistory,
  FaStar,
  FaTint,
  FaChevronDown,
  FaInfoCircle,
} from "react-icons/fa";
import { useSubmissionStatus } from "@/hooks/useSubmissionStatus";
import { useRegistrationForm } from "@/hooks/useRegistrationForm";
import ScrollRevealText from "@/components/motion/ScrollRevealText";

const departments = [
  "Computer Science & Engineering", "Electrical & Electronic Engineering", "BBA", "BBA in AIS", "Economics", "Data Science", "English", "Pharmacy", "Civil", "EDS", "MSJ", "Others",
];

const experienceLevels = ["Beginner", "Intermediate", "Advanced", "Professional"];

const bloodGroups = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

// ── CUSTOM SELECT COMPONENT (Matches Header "About" Dropdown Style) ────
const EditorialSelect = ({ label, value, options, onChange, placeholder }: { 
  label: string; 
  value: string; 
  options: string[]; 
  onChange: (val: string) => void;
  placeholder: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative space-y-3 group">
      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 group-focus-within:text-uiupc-orange transition-colors">{label}</label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between bg-transparent border-b-2 border-black/10 dark:border-white/10 py-4 text-left outline-none focus:border-uiupc-orange transition-colors"
      >
        <span className={`font-bold transition-colors ${value ? 'text-zinc-900 dark:text-white' : 'text-zinc-400'}`}>
          {value || placeholder}
        </span>
        <FaChevronDown className={`text-[10px] text-zinc-300 transition-transform duration-300 ${isOpen ? 'rotate-180 text-uiupc-orange' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute z-[100] left-0 right-0 mt-2 max-h-[280px] overflow-y-auto bg-white dark:bg-zinc-900 border border-black/5 dark:border-white/10 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] no-scrollbar py-2"
          >
            {options.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => { onChange(opt); setIsOpen(false); }}
                className={`w-full text-left px-6 py-3 text-[10px] font-black uppercase tracking-widest transition-colors ${value === opt ? 'bg-uiupc-orange/10 text-uiupc-orange' : 'text-zinc-500 hover:bg-black/5 dark:hover:bg-white/5 hover:text-zinc-900 dark:hover:text-white'}`}
              >
                {opt}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const JoinPage = () => {
  const GOOGLE_SCRIPT_URL = process.env.NEXT_PUBLIC_GAS_JOIN || "";
  const { status: joinStatus } = useSubmissionStatus(GOOGLE_SCRIPT_URL, "getJoinPageStatus");

  const initialFormData = {
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
    bloodGroup: "",
  };

  const {
    formData,
    setFormData,
    isSubmitting,
    submitStatus,
    submitMessage,
    showSuccessPopup,
    setShowSuccessPopup,
    showRulesPopup,
    setShowRulesPopup,
    agreementAccepted,
    setAgreementAccepted,
    handleInputChange,
    handlePaymentMethodChange,
    handlePhotoChange,
    handleInitialSubmit,
    handleFinalSubmit,
  } = useRegistrationForm(initialFormData, GOOGLE_SCRIPT_URL);

  const handleSubmit = (e: React.FormEvent) => {
    handleInitialSubmit(e, joinStatus === "enabled");
  };

  const benefits = [
    { icon: <FaStar />, title: "Workshops", desc: "Master the craft with industry visionaries." },
    { icon: <FaCameraRetro />, title: "Photo Walks", desc: "Explore hidden perspectives in high resolution." },
    { icon: <FaTrophy />, title: "Exhibit", desc: "Showcase your vision in our premium galleries." },
    { icon: <FaHandshake />, title: "Network", desc: "Join a community that speaks your language." },
  ];

  return (
    <div className="min-h-screen bg-[#f9f5ea] dark:bg-[#0a0a0a] transition-colors duration-500 pb-32">
      <div className="max-w-[1440px] mx-auto px-6 pt-32 md:pt-48 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
        
        {/* ── LEFT: INTRO & PERKS (50%) ──────────────────────────────── */}
        <div className="flex flex-col justify-start">
           <div className="mb-20">
              <ScrollRevealText 
                text="Join UIUPC" 
                className="text-[12vw] md:text-[8vw] font-black uppercase tracking-tighter leading-[0.85] text-zinc-900 dark:text-white"
              />
              <p className="mt-10 text-zinc-500 dark:text-zinc-400 font-medium text-lg md:text-xl leading-relaxed">
                Step behind the lens and into the legacy. Join Bangladesh's premier creative community at UIU.
              </p>
           </div>

           <div className="space-y-12">
              <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-uiupc-orange">Why Join Us?</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-16">
                {benefits.map((item, i) => (
                  <motion.div 
                     key={i}
                     initial={{ opacity: 0, y: 20 }}
                     whileInView={{ opacity: 1, y: 0 }}
                     viewport={{ once: true }}
                     className="group"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-white dark:bg-zinc-900 border border-black/5 dark:border-white/5 flex items-center justify-center text-zinc-900 dark:text-white group-hover:bg-uiupc-orange group-hover:text-white transition-all shadow-sm mb-6">
                      {item.icon}
                    </div>
                    <div>
                      <h3 className="text-[11px] font-black uppercase tracking-widest text-zinc-900 dark:text-white mb-2">{item.title}</h3>
                      <p className="text-zinc-500 text-xs leading-relaxed">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
           </div>

           <div className="mt-24 pt-12 border-t border-black/5 dark:border-white/5">
              <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-widest text-zinc-400">
                <span className="shrink-0">Registration Process</span>
                <div className="h-px w-full bg-black/5 dark:bg-white/5" />
              </div>
              <ul className="mt-8 space-y-4">
                {['Apply via portal', 'Payment confirmation', 'Admin verification', 'Member portal access'].map((step, i) => (
                  <li key={i} className="flex items-center gap-4 text-[10px] font-bold text-zinc-500">
                    <span className="text-uiupc-orange">{i + 1}.</span> {step}
                  </li>
                ))}
              </ul>
           </div>
        </div>

        <div className="w-full relative z-10">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-[#ffffff] dark:bg-[#050505] p-8 md:p-12 lg:p-14 rounded-2xl border border-black/5 dark:border-white/5 shadow-[0_20px_80px_rgba(0,0,0,0.05)]"
          >
             <div className="mb-14">
               <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-zinc-900 dark:text-white mb-4">Application Form</h2>
               <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">Please provide your details for review.</p>
             </div>

             {submitStatus === "error" && (
                <div className="mb-10 p-6 bg-red-500/10 rounded-2xl border border-red-500/20 flex items-center gap-4 text-red-500 text-xs font-bold uppercase tracking-widest">
                  <FaExclamationTriangle className="shrink-0" />
                  <span>{submitMessage}</span>
                </div>
             )}

             <form onSubmit={handleSubmit} className="space-y-12">
                {/* Section: Identity */}
                <div className="space-y-10">
                   <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-zinc-400">
                      <span>01. Identity</span>
                      <div className="h-px flex-1 bg-black/5 dark:bg-white/5" />
                   </div>
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                     <div className="space-y-3 group">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 group-focus-within:text-uiupc-orange transition-colors">Full Name</label>
                        <input type="text" name="name" value={formData.name} onChange={handleInputChange} required placeholder="Jonayed Ahmed" className="w-full bg-transparent border-b-2 border-black/10 dark:border-white/10 py-4 outline-none focus:border-uiupc-orange transition-colors text-zinc-900 dark:text-white font-bold" />
                     </div>
                     <div className="space-y-3 group">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 group-focus-within:text-uiupc-orange transition-colors">Student ID</label>
                        <input type="text" name="studentId" value={formData.studentId} onChange={handleInputChange} required placeholder="011 201 000" className="w-full bg-transparent border-b-2 border-black/10 dark:border-white/10 py-4 outline-none focus:border-uiupc-orange transition-colors text-zinc-900 dark:text-white font-bold" />
                     </div>
                   </div>

                   <EditorialSelect 
                      label="Department" 
                      value={formData.department} 
                      placeholder="Select Dept" 
                      options={departments} 
                      onChange={(val) => setFormData(prev => ({...prev, department: val}))} 
                   />

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                     <EditorialSelect 
                        label="Experience Level" 
                        value={formData.experience} 
                        placeholder="Select Level" 
                        options={experienceLevels} 
                        onChange={(val) => setFormData(prev => ({...prev, experience: val}))} 
                     />
                     <EditorialSelect 
                        label="Blood Group" 
                        value={formData.bloodGroup} 
                        placeholder="Select Type" 
                        options={bloodGroups} 
                        onChange={(val) => setFormData(prev => ({...prev, bloodGroup: val}))} 
                     />
                   </div>
                </div>

                {/* Section: Contact */}
                <div className="space-y-10">
                   <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-zinc-400">
                      <span>02. Coordinates</span>
                      <div className="h-px flex-1 bg-black/5 dark:bg-white/5" />
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                     <div className="space-y-3 group">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 group-focus-within:text-uiupc-orange transition-colors">Email Address</label>
                        <input type="email" name="email" value={formData.email} onChange={handleInputChange} required placeholder="hello@example.com" className="w-full bg-transparent border-b-2 border-black/10 dark:border-white/10 py-4 outline-none focus:border-uiupc-orange transition-colors text-zinc-900 dark:text-white font-bold" />
                     </div>
                     <div className="space-y-3 group">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 group-focus-within:text-uiupc-orange transition-colors">Phone Number</label>
                        <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} required placeholder="+880 1XXX-XXXXXX" className="w-full bg-transparent border-b-2 border-black/10 dark:border-white/10 py-4 outline-none focus:border-uiupc-orange transition-colors text-zinc-900 dark:text-white font-bold" />
                     </div>
                   </div>

                   <div className="space-y-3 group">
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 group-focus-within:text-uiupc-orange transition-colors">Facebook Profile Link</label>
                      <input type="url" name="facebookLink" value={formData.facebookLink} onChange={handleInputChange} required placeholder="https://facebook.com/jonayed.eth" className="w-full bg-transparent border-b-2 border-black/10 dark:border-white/10 py-4 outline-none focus:border-uiupc-orange transition-colors text-zinc-900 dark:text-white font-bold" />
                   </div>
                </div>

                {/* Section: Vision */}
                <div className="space-y-10">
                   <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-zinc-400">
                      <span>03. Engagement</span>
                      <div className="h-px flex-1 bg-black/5 dark:bg-white/5" />
                   </div>
                   <div className="space-y-3 group">
                      <textarea name="message" value={formData.message} onChange={handleInputChange} required rows={4} placeholder="Why join UIUPC? Your visual mission..." className="w-full bg-transparent border-b-2 border-black/10 dark:border-white/10 py-4 outline-none focus:border-uiupc-orange transition-colors text-zinc-900 dark:text-white font-bold resize-none" />
                   </div>
                </div>

                {/* Section: Payment */}
                <div className="space-y-10">
                   <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-zinc-400">
                      <div className="flex items-center gap-2 group relative">
                        <span>04. Membership Fee</span>
                        <FaInfoCircle className="text-zinc-300 hover:text-uiupc-orange transition-colors cursor-help" />
                        
                        {/* Tooltip */}
                        <div className="absolute left-0 bottom-full mb-4 w-64 p-5 bg-white dark:bg-zinc-900 border border-black/5 dark:border-white/10 rounded-2xl shadow-2xl opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 transition-all z-50">
                           <p className="text-[9px] text-zinc-500 mb-3">Your contribution directly fuels our creative mission:</p>
                           <ul className="space-y-2 text-[9px] font-bold text-zinc-900 dark:text-white uppercase tracking-wider">
                              <li className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-uiupc-orange" /> Orientation Event</li>
                              <li className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-uiupc-orange" /> Member ID Card</li>
                              <li className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-uiupc-orange" /> Workshop & Event Funding</li>
                           </ul>
                           <p className="mt-3 text-[8px] text-zinc-400 italic">100% member-funded operations.</p>
                        </div>
                      </div>
                      <div className="h-px flex-1 bg-black/5 dark:bg-white/5" />
                   </div>

                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                     <button type="button" onClick={() => handlePaymentMethodChange("cash")} className={`flex items-center justify-between p-6 rounded-2xl border transition-all ${formData.paymentMethod === "cash" ? 'bg-uiupc-orange/5 border-uiupc-orange text-uiupc-orange' : 'bg-transparent border-black/5 dark:border-white/5 text-zinc-500 hover:border-zinc-300'}`}>
                        <div className="flex items-center gap-4">
                          <FaMoneyBillWave className="text-xl" />
                          <span className="text-[10px] font-black uppercase tracking-widest">Cash</span>
                        </div>
                        {formData.paymentMethod === "cash" && <FaCheck className="text-[10px]" />}
                     </button>
                     <button type="button" onClick={() => handlePaymentMethodChange("online")} className={`flex items-center justify-between p-6 rounded-2xl border transition-all ${formData.paymentMethod === "online" ? 'bg-uiupc-orange/5 border-uiupc-orange text-uiupc-orange' : 'bg-transparent border-black/5 dark:border-white/5 text-zinc-500 hover:border-zinc-300'}`}>
                        <div className="flex items-center gap-4">
                          <FaCreditCard className="text-xl" />
                          <span className="text-[10px] font-black uppercase tracking-widest">Online</span>
                        </div>
                        {formData.paymentMethod === "online" && <FaCheck className="text-[10px]" />}
                     </button>
                   </div>

                   <AnimatePresence>
                     {formData.paymentMethod === "cash" && (
                       <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-3 group p-6 bg-zinc-50 dark:bg-zinc-900 rounded-2xl">
                          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Receiver Name</label>
                          <input type="text" name="receiverName" value={formData.receiverName} onChange={handleInputChange} required placeholder="Name of the person you paid" className="w-full bg-transparent border-b-1 border-black/10 dark:border-white/10 py-4 outline-none focus:border-uiupc-orange transition-colors text-zinc-900 dark:text-white font-bold" />
                       </motion.div>
                     )}
                     {formData.paymentMethod === "online" && (
                       <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-3 group p-6 bg-zinc-50 dark:bg-zinc-900 rounded-2xl">
                          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Transaction ID</label>
                          <input type="text" name="transactionId" value={formData.transactionId} onChange={handleInputChange} required placeholder="TrxID / Reference" className="w-full bg-transparent border-b-1 border-black/10 dark:border-white/10 py-4 outline-none focus:border-uiupc-orange transition-colors text-zinc-900 dark:text-white font-bold" />
                       </motion.div>
                     )}
                   </AnimatePresence>
                </div>

                <div className="pt-8">
                   <button 
                     type="submit" 
                     disabled={isSubmitting}
                     className="w-full h-20 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-xl flex items-center justify-center gap-4 group transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 shadow-2xl"
                   >
                     <span className="text-[11px] font-black uppercase tracking-[0.4em]">
                        {isSubmitting ? "Processing..." : "Finish Identity"}
                     </span>
                     {isSubmitting ? <FaSpinner className="animate-spin" /> : <FaArrowRight className="text-xs group-hover:translate-x-2 transition-transform" />}
                   </button>
                </div>
             </form>
          </motion.div>
        </div>
      </div>

      {/* ── ALERTS & MODALS ─────────────────────────────────────────── */}
      <AnimatePresence>
        {showRulesPopup && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[5000] flex items-center justify-center p-6 bg-zinc-950/80 backdrop-blur-xl">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-2xl p-10 md:p-14 shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 p-12 opacity-5">
                 <FaHistory className="text-9xl" />
               </div>
               <h3 className="text-3xl font-black uppercase tracking-tighter text-zinc-900 dark:text-white mb-6">Agreement</h3>
               <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed mb-10 font-bold uppercase tracking-tight">
                  By submitting this application, you commit to upholding the values and creative standards of UIUPC. You agree to follow all club rules and participate actively in our mission to document vision.
               </p>
               
               <label className="flex items-center gap-4 cursor-pointer group mb-12">
                 <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${agreementAccepted ? 'bg-uiupc-orange border-uiupc-orange' : 'border-zinc-300 dark:border-zinc-700'}`}>
                   {agreementAccepted && <FaCheck className="text-[10px] text-white" />}
                   <input type="checkbox" className="hidden" checked={agreementAccepted} onChange={(e) => setAgreementAccepted(e.target.checked)} />
                 </div>
                 <span className="text-[10px] font-black uppercase tracking-widest text-zinc-900 dark:text-white">I accept the terms</span>
               </label>

               <div className="flex flex-col gap-4">
                  <button onClick={handleFinalSubmit} className="w-full py-5 bg-uiupc-orange text-white text-[11px] font-black uppercase tracking-widest rounded-xl hover:scale-105 transition-all shadow-lg active:scale-95">Complete Application</button>
                  <button onClick={() => setShowRulesPopup(false)} className="w-full py-5 text-[11px] font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">Go Back</button>
               </div>
            </motion.div>
          </motion.div>
        )}

        {showSuccessPopup && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[5000] flex items-center justify-center p-6 bg-zinc-950/80 backdrop-blur-xl">
             <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-sm bg-white dark:bg-zinc-900 rounded-2xl p-14 text-center shadow-2xl">
                <div className="w-20 h-20 bg-uiupc-orange rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
                  <FaCheck className="text-3xl text-white" />
                </div>
                <h3 className="text-3xl font-black uppercase tracking-tighter text-zinc-900 dark:text-white mb-4">Identity Sent</h3>
                <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-10 leading-relaxed">Our curation team will review your mission and reach out shortly.</p>
                <button onClick={() => setShowSuccessPopup(false)} className="w-full py-5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all active:scale-95">Dismiss</button>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default JoinPage;
