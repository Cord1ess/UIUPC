"use client";

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { getProperty } from '@/utils/adminHelpers';
import { 
  IconUser, 
  IconEnvelope, 
  IconPhone, 
  IconUniversity, 
  IconFacebook, 
  IconLink, 
  IconCalendar, 
  IconCreditCard, 
  IconComment,
  IconClose,
  IconFingerprint,
  IconExternalLink,
  IconLayerGroup
} from '@/components/shared/Icons';

interface Admin_DetailsModalProps {
  isOpen: boolean;
  item: any;
  dataType: string;
  onClose: () => void;
}

const DetailSection = ({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) => (
  <div className="space-y-6">
    <div className="flex items-center gap-3 pb-3 border-b border-black/5 dark:border-white/5">
      <div className="w-8 h-8 rounded-xl bg-uiupc-orange/10 flex items-center justify-center text-uiupc-orange text-xs">
        <Icon size={14} />
      </div>
      <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">{title}</h4>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {children}
    </div>
  </div>
);

const DetailItem = ({ label, value, fullWidth = false, isLink = false }: { label: string; value: any; fullWidth?: boolean; isLink?: boolean }) => (
  <div className={`flex flex-col gap-2 p-5 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-black/[0.03] dark:border-white/[0.03] hover:border-uiupc-orange/20 transition-all group ${fullWidth ? 'md:col-span-2' : ''}`}>
    <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 group-hover:text-uiupc-orange transition-colors">{label}</label>
    {isLink && value && value !== "Not provided" && value !== "N/A" ? (
      <a 
        href={value.startsWith('http') ? value : `https://${value}`} 
        target="_blank" rel="noopener noreferrer" 
        className="text-sm font-bold text-zinc-900 dark:text-white hover:text-uiupc-orange flex items-center gap-2 break-all"
      >
        {value} <IconExternalLink size={10} className="shrink-0" />
      </a>
    ) : (
      <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 break-words leading-relaxed">
        {value || "Not provided"}
      </span>
    )}
  </div>
);

export const Admin_DetailsModal: React.FC<Admin_DetailsModalProps> = ({ isOpen, item, dataType, onClose }) => {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'auto';
    return () => { document.body.style.overflow = 'auto'; };
  }, [isOpen]);

  if (!item) return null;

  const name = getProperty(item, dataType === "membership" ? "Full Name" : "Name") || "Unknown";
  const email = getProperty(item, "Email") || "No email";
  const phone = getProperty(item, "Phone");
  const timestamp = new Date(item.created_at || item.timestamp || item.Timestamp).toLocaleString(undefined, {
    dateStyle: 'long',
    timeStyle: 'short'
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 md:p-10">
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-2xl"
            onClick={onClose}
          />
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 40 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 40 }}
            className="relative w-full max-w-5xl bg-white dark:bg-[#0d0d0d] rounded-[3rem] border border-zinc-200 dark:border-zinc-800 shadow-3xl flex flex-col overflow-hidden max-h-[90vh]"
          >
            {/* Premium Header */}
            <div className="relative p-8 md:p-12 border-b border-zinc-100 dark:border-zinc-800/50 bg-zinc-50 dark:bg-[#0a0a0a] flex flex-col md:flex-row md:items-center justify-between gap-8 shrink-0">
              <div className="flex items-center gap-8">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-[2.5rem] bg-zinc-950 dark:bg-white flex items-center justify-center text-white dark:text-zinc-900 text-4xl font-black shadow-2xl shadow-black/20 group-hover:scale-105 transition-transform duration-500 shrink-0">
                    {name.charAt(0).toUpperCase()}
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl bg-uiupc-orange text-white flex items-center justify-center text-sm shadow-xl">
                    <IconFingerprint size={14} />
                  </div>
                </div>
                <div className="space-y-2">
                  <span className="px-3 py-1 bg-uiupc-orange/10 text-uiupc-orange text-[9px] font-black uppercase tracking-widest rounded-lg border border-uiupc-orange/20">
                    {dataType === "membership" ? "Member Details" : "Exhibition Details"}
                  </span>
                  <h3 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-zinc-900 dark:text-white leading-none">
                    {name}
                  </h3>
                  <div className="flex flex-wrap items-center gap-6 text-[10px] font-black uppercase tracking-widest text-zinc-500 pt-1">
                    <span className="flex items-center gap-2 group cursor-pointer hover:text-uiupc-orange transition-colors"><IconEnvelope size={12} className="text-uiupc-orange group-hover:scale-110 transition-transform" /> {email}</span>
                    {phone && <span className="flex items-center gap-2 group cursor-pointer hover:text-uiupc-orange transition-colors"><IconPhone size={12} className="text-uiupc-orange group-hover:scale-110 transition-transform" /> {phone}</span>}
                  </div>
                </div>
              </div>
              <button 
                onClick={onClose} 
                className="absolute top-8 right-8 md:static w-14 h-14 flex items-center justify-center rounded-2xl bg-white dark:bg-[#1a1a1a] text-zinc-400 hover:text-red-500 hover:bg-red-500/5 transition-all shadow-sm border border-zinc-200 dark:border-zinc-800"
              >
                <IconClose size={20} />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="p-8 md:p-12 overflow-y-auto flex-1 space-y-12 custom-scrollbar bg-white dark:bg-[#0d0d0d]">
              {dataType === "membership" ? (
                <>
                  <DetailSection title="Basics" icon={IconUser}>
                    <DetailItem label="Full Name" value={name} />
                    <DetailItem label="Student ID" value={getProperty(item, "Student ID")} />
                    <DetailItem label="Department" value={getProperty(item, "Department")} />
                    <DetailItem label="Experience" value={getProperty(item, "Experience Level")} />
                  </DetailSection>

                  <DetailSection title="Social & Interests" icon={IconFacebook}>
                    <DetailItem label="Facebook Profile" value={(() => {
                      const link = getProperty(item, "Facebook Link");
                      return link && link !== "N/A" ? link : "Not provided";
                    })()} isLink />
                    <DetailItem label="Interests" value={getProperty(item, "Interests")} />
                  </DetailSection>

                  <DetailSection title="Payment & Schedule" icon={IconCreditCard}>
                    <DetailItem label="Payment Method" value={getProperty(item, "Payment Method")} />
                    <DetailItem label="Submitted On" value={timestamp} />
                    <DetailItem label="Session" value={getProperty(item, "Session")} fullWidth />
                  </DetailSection>

                  <DetailSection title="Message" icon={IconComment}>
                    <div className="md:col-span-2">
                      <div className="relative p-8 bg-uiupc-orange/5 border border-uiupc-orange/15 rounded-[2.5rem] shadow-sm overflow-hidden group">
                        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                          <IconComment size={40} className="text-uiupc-orange" />
                        </div>
                        <p className="relative z-10 text-base text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap leading-relaxed font-medium italic">
                          "{getProperty(item, "Message") || "No message provided."}"
                        </p>
                      </div>
                    </div>
                  </DetailSection>
                </>
              ) : (
                <>
                  <DetailSection title="Submission" icon={IconCalendar}>
                    <DetailItem label="Submitted On" value={timestamp} />
                    <DetailItem label="Category" value={getProperty(item, "Category")} />
                    <DetailItem label="Institute" value={getProperty(item, "Institute")} />
                    <DetailItem label="Status" value={getProperty(item, "Status") || "PENDING"} />
                  </DetailSection>

                  <DetailSection title="Photo Details" icon={IconLink}>
                    <DetailItem label="Photo Title" value={getProperty(item, "Photo Title")} />
                    <DetailItem label="Photo Count" value={getProperty(item, "Photo Count")} />
                    <DetailItem label="Files" value={getProperty(item, "Folder URL") || getProperty(item, "Drive File IDs")} isLink fullWidth />
                  </DetailSection>
                </>
              )}
            </div>

            {/* Footer Control */}
            <div className="p-8 md:p-10 border-t border-zinc-200 dark:border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-zinc-50 dark:bg-[#0a0a0a]">
              <div className="flex flex-col">
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400">System Reference</span>
                <span className="text-[10px] font-mono text-zinc-500">UID: {item.id || "N/A"}</span>
              </div>
              <button 
                onClick={onClose} 
                className="px-10 h-14 rounded-2xl bg-uiupc-orange text-white text-[10px] font-black uppercase tracking-[0.2em] hover:translate-y-[-2px] active:translate-y-0 transition-all shadow-xl shadow-uiupc-orange/20"
              >
                Close Details
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
