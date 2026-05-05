"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  IconCamera, IconSend, IconSync, IconCheckCircle, 
  IconExclamationTriangle, IconArrowLeft
} from '@/components/shared/Icons';
import ScrollRevealText from '@/components/motion/ScrollRevealText';
import { supabase } from '@/lib/supabase';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import Link from 'next/link';

const ExhibitionView: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getSettingBool, loading: settingsLoading } = useSiteSettings();
  const submissionsEnabled = getSettingBool('submissions_open', true);

  const [form, setForm] = useState({
    participant_name: '',
    email: '',
    institute: '',
    photo_title: '',
    category: 'Single',
    photo_url: '', // This will hold the Drive ID/Link
    transaction_id: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.participant_name || !form.photo_url) return alert("Please fill in all required fields.");
    
    setIsSubmitting(true);
    setError(null);

    try {
      // Basic extraction of ID if they paste a full link
      let driveId = form.photo_url;
      if (driveId.includes('id=')) {
        driveId = driveId.split('id=')[1].split('&')[0];
      } else if (driveId.includes('/d/')) {
        driveId = driveId.split('/d/')[1].split('/')[0];
      }

      const { error: submitError } = await supabase.from("exhibition_submissions").insert([{
        ...form,
        photo_url: driveId,
        status: 'pending',
        payment_status: 'unpaid',
        submitted_at: new Date().toISOString()
      }]);

      if (submitError) throw submitError;
      
      setIsSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#f9f5ea] dark:bg-[#0a0a0a] flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          className="max-w-xl w-full bg-white dark:bg-zinc-900 rounded-[3rem] p-12 text-center shadow-2xl border border-black/5 dark:border-white/5"
        >
          <div className="w-20 h-20 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-8">
            <IconCheckCircle size={40} />
          </div>
          <h2 className="text-3xl font-black uppercase tracking-tight text-zinc-900 dark:text-white mb-4">Submission Received</h2>
          <p className="text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed mb-10">
            Your photograph has been successfully submitted to the UIUPC Exhibition committee. We will notify you via email after the curation process.
          </p>
          <Link href="/" className="px-10 py-5 bg-uiupc-orange text-white text-[11px] font-black uppercase tracking-widest rounded-xl hover:scale-105 transition-all shadow-xl block">
            Return to Home
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9f5ea] dark:bg-[#0a0a0a] pb-32">
      {/* ── HERO ────────────────────────────────────────────── */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <Link href="/" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-uiupc-orange transition-colors mb-8">
            <IconArrowLeft size={14} /> Cancel Submission
          </Link>
          <div className="flex items-center gap-4 text-uiupc-orange mb-6">
            <IconCamera size={24} />
            <span className="text-[12px] font-black uppercase tracking-[0.4em]">Exhibition Portal</span>
          </div>
          <ScrollRevealText 
            text="Showcase Your Vision" 
            className="text-6xl md:text-[8vw] font-black uppercase tracking-tighter text-zinc-900 dark:text-white leading-[0.85] mb-12"
          />
          <p className="max-w-2xl text-zinc-500 dark:text-zinc-400 text-sm md:text-lg font-medium leading-relaxed uppercase tracking-tight">
            Submit your entries for the upcoming UIUPC photography exhibition. Ensure your drive links are set to "Anyone with the link" as a viewer.
          </p>
        </div>
      </section>

      {/* ── FORM ────────────────────────────────────────────── */}
      <section className="px-6">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className={`relative bg-white dark:bg-zinc-900 rounded-[3rem] p-8 md:p-16 shadow-2xl border border-black/5 dark:border-white/5 space-y-10 ${!submissionsEnabled ? 'opacity-20 pointer-events-none grayscale' : ''}`}>
            {!submissionsEnabled && !settingsLoading && (
                <div className="absolute inset-0 z-[100] bg-white/80 dark:bg-black/80 backdrop-blur-md flex items-center justify-center p-8 text-center rounded-[3rem]">
                  <div className="max-w-xs">
                    <div className="w-16 h-16 bg-uiupc-orange/10 text-uiupc-orange rounded-full flex items-center justify-center mx-auto mb-6">
                      <IconExclamationTriangle size={32} />
                    </div>
                    <h3 className="text-xl font-black uppercase tracking-tight dark:text-white mb-3">Submissions Closed</h3>
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest leading-relaxed">
                      We are not currently accepting exhibition entries. Keep an eye on our events page for the next call for entries!
                    </p>
                  </div>
                </div>
            )}
            {error && (
              <div className="p-6 bg-red-500/10 text-red-500 rounded-2xl flex items-center gap-4 border border-red-500/20">
                <IconExclamationTriangle size={20} />
                <p className="text-xs font-bold uppercase tracking-widest">{error}</p>
              </div>
            )}

            {/* Step 1: Personal Info */}
            <div className="space-y-6">
              <div className="flex items-center gap-6">
                <span className="w-8 h-8 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 flex items-center justify-center text-[10px] font-black">01</span>
                <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-400">Personal Details</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-2">Full Name</label>
                  <input required type="text" value={form.participant_name} onChange={e => setForm({...form, participant_name: e.target.value})} className="w-full px-6 py-5 bg-[#f9f5ea] dark:bg-black/40 rounded-2xl text-sm font-bold outline-none border border-transparent focus:border-uiupc-orange/20 dark:text-white" placeholder="e.g. Pulok Sikdar" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-2">Email Address</label>
                  <input required type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full px-6 py-5 bg-[#f9f5ea] dark:bg-black/40 rounded-2xl text-sm font-bold outline-none border border-transparent focus:border-uiupc-orange/20 dark:text-white" placeholder="pulok@example.com" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-2">Educational Institute</label>
                <input required type="text" value={form.institute} onChange={e => setForm({...form, institute: e.target.value})} className="w-full px-6 py-5 bg-[#f9f5ea] dark:bg-black/40 rounded-2xl text-sm font-bold outline-none border border-transparent focus:border-uiupc-orange/20 dark:text-white" placeholder="e.g. United International University" />
              </div>
            </div>

            {/* Step 2: Submission Info */}
            <div className="space-y-6">
              <div className="flex items-center gap-6">
                <span className="w-8 h-8 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 flex items-center justify-center text-[10px] font-black">02</span>
                <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-400">Photograph Info</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-2">Photo Title</label>
                  <input required type="text" value={form.photo_title} onChange={e => setForm({...form, photo_title: e.target.value})} className="w-full px-6 py-5 bg-[#f9f5ea] dark:bg-black/40 rounded-2xl text-sm font-bold outline-none border border-transparent focus:border-uiupc-orange/20 dark:text-white" placeholder="The Silent Frame" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-2">Category</label>
                  <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full px-6 py-5 bg-[#f9f5ea] dark:bg-black/40 rounded-2xl text-sm font-bold outline-none border border-transparent focus:border-uiupc-orange/20 dark:text-white cursor-pointer">
                    <option value="Single">Single</option>
                    <option value="Story">Story</option>
                    <option value="Mobile">Mobile</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-2">Google Drive Link (High-Res Source)</label>
                <input required type="text" value={form.photo_url} onChange={e => setForm({...form, photo_url: e.target.value})} className="w-full px-6 py-5 bg-[#f9f5ea] dark:bg-black/40 rounded-2xl text-xs font-mono outline-none border border-transparent focus:border-uiupc-orange/20 dark:text-white" placeholder="Paste your Drive link here..." />
                <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mt-2 px-2">Ensure permission is set to "Anyone with the link"</p>
              </div>
            </div>

            {/* Step 3: Payment */}
            <div className="space-y-6">
              <div className="flex items-center gap-6">
                <span className="w-8 h-8 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 flex items-center justify-center text-[10px] font-black">03</span>
                <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-400">Payment Verification</h3>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-2">Transaction ID (Bkash/Nagad)</label>
                <input required type="text" value={form.transaction_id} onChange={e => setForm({...form, transaction_id: e.target.value})} className="w-full px-6 py-5 bg-[#f9f5ea] dark:bg-black/40 rounded-2xl text-sm font-bold outline-none border border-transparent focus:border-uiupc-orange/20 dark:text-white" placeholder="e.g. 9K2J3L4M5N" />
                <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mt-2 px-2">Entries without a valid transaction ID will be disqualified.</p>
              </div>
            </div>

            <button 
              disabled={isSubmitting}
              type="submit"
              className="w-full py-6 bg-uiupc-orange text-white text-[11px] font-black uppercase tracking-[0.3em] rounded-2xl shadow-2xl hover:brightness-110 transition-all active:scale-[0.98] flex items-center justify-center gap-4 disabled:opacity-50"
            >
              {isSubmitting ? <IconSync size={18} className="animate-spin" /> : <IconSend size={18} />}
              {isSubmitting ? 'Processing Submission...' : 'Submit to Exhibition'}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default ExhibitionView;
