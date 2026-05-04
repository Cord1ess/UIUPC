"use client";

import React, { useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  IconFacebook,
  IconInstagram,
  IconYoutube,
  IconLinkedin,
  IconEnvelope,
  IconClock,
  IconPaperPlane,
  IconCheck,
  IconExclamationTriangle,
  IconArrowRight,
} from "@/components/shared/Icons";
import ScrollRevealText from "@/components/motion/ScrollRevealText";

const ContactPage = () => {
  const form = useRef<HTMLFormElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"success" | "error" | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const EMAIL_SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
  const EMAIL_TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
  const EMAIL_PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!EMAIL_SERVICE_ID || !EMAIL_TEMPLATE_ID || !EMAIL_PUBLIC_KEY) {
      setSubmitStatus("error");
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    if (form.current) {
      import("emailjs-com").then((module) => {
        const emailjs = module.default;
        emailjs
          .sendForm(EMAIL_SERVICE_ID, EMAIL_TEMPLATE_ID, form.current!, EMAIL_PUBLIC_KEY)
          .then(() => {
          setIsSubmitting(false);
          setSubmitStatus("success");
          setShowSuccessModal(true);
          form.current?.reset();
        })
        .catch(() => {
          setIsSubmitting(false);
          setSubmitStatus("error");
        });
      });
    }
  };

  const socialLinks = [
    { icon: <IconFacebook size={20} />, label: "Facebook", href: "https://facebook.com/UIUPC" },
    { icon: <IconInstagram size={20} />, label: "Instagram", href: "https://www.instagram.com/uiuphotographyclub" },
    { icon: <IconYoutube size={20} />, label: "YouTube", href: "https://www.youtube.com/@uiupc6885" },
    { icon: <IconLinkedin size={20} />, label: "LinkedIn", href: "https://linkedin.com/company/uiupc" },
  ];

  return (
    <div className="min-h-screen bg-[#f9f5ea] dark:bg-[#0a0a0a] pb-32">
      {/* ── ZONE 1: HERO ─────────────────────────────────────────────── */}
      <section className="pt-40 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <ScrollRevealText 
            text="Get in Touch" 
            className="text-[12vw] md:text-[8vw] font-black uppercase tracking-tighter leading-[0.8] text-zinc-900 dark:text-white"
          />
          <p className="mt-8 max-w-2xl text-zinc-500 dark:text-zinc-400 font-medium text-lg md:text-xl leading-relaxed">
            Collaborations, inquiries, or just sharing a vision. We're here to turn perspectives into possibilities.
          </p>
        </div>
      </section>

      {/* ── ZONE 2: INTERACTIVE CONTENT ────────────────────────────────── */}
      <section className="px-6">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-20">
          
          {/* LEFT: INFO PANEL */}
          <div className="w-full lg:w-2/5 space-y-12">
            {/* Digital Presence (No Card) */}
            <div className="space-y-4">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-uiupc-orange">Digital Presence</span>
              <div className="flex flex-wrap gap-4 pt-2">
                {socialLinks.map((social) => (
                  <a 
                    key={social.label} 
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 flex items-center justify-center rounded-full bg-white dark:bg-zinc-900 border border-black/5 dark:border-white/5 text-zinc-900 dark:text-white hover:bg-uiupc-orange hover:text-white hover:scale-110 transition-all shadow-sm"
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Say Hello (No Card) */}
            <div className="space-y-4">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-uiupc-orange">Say Hello</span>
              <div className="space-y-2 overflow-hidden">
                <a href="mailto:photographyclub@dccsa.uiu.ac.bd" className="text-lg md:text-2xl font-black text-zinc-900 dark:text-white hover:text-uiupc-orange transition-colors break-words block">
                  photographyclub@dccsa.uiu.ac.bd
                </a>
              </div>
            </div>

            {/* Visit Us (No Card) */}
            <div className="space-y-4">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-uiupc-orange">Visit Us</span>
              <p className="text-zinc-600 dark:text-zinc-400 font-medium text-sm md:text-base">
                United City, Madani Avenue<br />
                Dhaka 1212, Bangladesh
              </p>
            </div>

            {/* Club Hours (No Card) */}
            <div className="space-y-4">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-uiupc-orange">Club Hours</span>
              <p className="text-zinc-600 dark:text-zinc-400 font-medium text-sm md:text-base">
                SAT - SUN / TUE - THU<br />
                08:30 AM — 04:30 PM
              </p>
            </div>
          </div>

          {/* RIGHT: CONTACT FORM (IN CARD) */}
          <div className="w-full lg:w-3/5">
            <motion.div 
               initial={{ opacity: 0, x: 20 }}
               whileInView={{ opacity: 1, x: 0 }}
               viewport={{ once: true }}
               className="bg-white dark:bg-zinc-950 p-8 md:p-12 lg:p-16 rounded-[2.5rem] md:rounded-[3rem] border border-black/5 dark:border-white/5 shadow-sm overflow-hidden"
            >
              <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-zinc-900 dark:text-white mb-12">
                Draft a message
              </h2>

              <form ref={form} onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Name */}
                  <div className="space-y-2 group">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 group-focus-within:text-uiupc-orange transition-colors">Full Name</label>
                    <input 
                      type="text" name="from_name" required placeholder="Jonayed Ahmed"
                      className="w-full bg-transparent border-b-2 border-black/10 dark:border-white/10 py-4 outline-none focus:border-uiupc-orange transition-colors text-zinc-900 dark:text-white font-bold"
                    />
                  </div>
                  {/* Email */}
                  <div className="space-y-2 group">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 group-focus-within:text-uiupc-orange transition-colors">Email Address</label>
                    <input 
                      type="email" name="from_email" required placeholder="hello@uiupc.com"
                      className="w-full bg-transparent border-b-2 border-black/10 dark:border-white/10 py-4 outline-none focus:border-uiupc-orange transition-colors text-zinc-900 dark:text-white font-bold"
                    />
                  </div>
                </div>

                {/* Subject */}
                <div className="space-y-2 group">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 group-focus-within:text-uiupc-orange transition-colors">Subject</label>
                  <input 
                    type="text" name="subject" required placeholder="What's this regarding?"
                    className="w-full bg-transparent border-b-2 border-black/10 dark:border-white/10 py-4 outline-none focus:border-uiupc-orange transition-colors text-zinc-900 dark:text-white font-bold"
                  />
                </div>

                {/* Message */}
                <div className="space-y-2 group">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 group-focus-within:text-uiupc-orange transition-colors">Your Vision</label>
                  <textarea 
                    name="message" required rows={4} placeholder="I have an idea for..."
                    className="w-full bg-transparent border-b-2 border-black/10 dark:border-white/10 py-4 outline-none focus:border-uiupc-orange transition-colors text-zinc-900 dark:text-white font-bold resize-none"
                  />
                </div>

                <div className="pt-6">
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="group relative flex items-center gap-4 bg-zinc-900 dark:bg-white text-white dark:text-black px-10 py-6 rounded-2xl overflow-hidden shadow-2xl transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                  >
                    <span className="relative z-10 text-[10px] font-black uppercase tracking-[0.3em]">
                      {isSubmitting ? "Submitting..." : "Send Message"}
                    </span>
                    <IconArrowRight size={12} className={`${isSubmitting ? 'animate-pulse' : 'group-hover:translate-x-1'} transition-transform`} />
                  </button>
                </div>
              </form>

              {submitStatus === "error" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8 flex items-center gap-3 text-red-500 font-bold text-xs uppercase tracking-widest">
                  <IconExclamationTriangle size={14} />
                  <span>Submission Failed. Please try again.</span>
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── ZONE 3: SUCCESS MODAL ─────────────────────────────────────── */}
      <AnimatePresence>
        {showSuccessModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[2000] flex items-center justify-center p-6 bg-zinc-950/80 backdrop-blur-xl"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="bg-[#f9f5ea] dark:bg-zinc-900 p-12 md:p-16 rounded-[3rem] max-w-lg w-full text-center space-y-8 shadow-2xl"
            >
              <div className="w-20 h-20 bg-uiupc-orange/10 text-uiupc-orange rounded-full flex items-center justify-center mx-auto text-3xl">
                <IconCheck size={30} />
              </div>
              <div className="space-y-4">
                <h3 className="text-3xl font-black uppercase tracking-tighter text-zinc-900 dark:text-white">Success</h3>
                <p className="text-zinc-500 dark:text-zinc-400 font-medium">
                  Your message has been caught. We'll get back to you with the same precision we use for our lenses.
                </p>
              </div>
              <button 
                onClick={() => setShowSuccessModal(false)}
                className="w-full bg-zinc-900 dark:bg-white text-white dark:text-black py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-uiupc-orange dark:hover:bg-uiupc-orange transition-colors"
              >
                Got It
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ContactPage;
