"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  IconEnvelope, 
  IconSync, 
  IconCheckCircle, 
  IconExclamationCircle, 
  IconPenNib, 
  IconClose,
  IconUserCircle,
  IconPaperPlane,
  IconFileSignature,
  IconInfo
} from '@/components/shared/Icons';
import { getProperty } from '@/utils/adminHelpers';

interface Admin_EmailModalProps {
  isOpen: boolean;
  item: any;
  onSend: (item: any, templateType: string, customMessage?: string, onSuccess?: () => void) => void;
  sending: boolean;
  onClose: () => void;
}

export const Admin_EmailModal: React.FC<Admin_EmailModalProps> = ({ 
  isOpen, 
  item, 
  onSend, 
  sending, 
  onClose 
}) => {
  const [customText, setCustomText] = useState("");

  if (!item) return null;

  const recipientName = getProperty(item, "Full Name") || getProperty(item, "Name") || "Participant";
  const recipientEmail = getProperty(item, "Email") || "No Email Found";

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4 md:p-10">
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-2xl"
            onClick={onClose}
          />
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 40 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 40 }}
            className="relative w-full max-w-4xl bg-white dark:bg-[#0a0a0a] rounded-[3rem] border border-black/10 dark:border-white/10 shadow-3xl flex flex-col md:flex-row overflow-hidden max-h-[90vh]"
          >
            {/* Left Side: Preview */}
            <div className="hidden md:flex md:w-2/5 bg-zinc-50 dark:bg-zinc-900/50 border-r border-black/5 dark:border-white/5 flex-col items-center justify-center p-12 overflow-hidden relative">
              <div className="absolute inset-0 opacity-20 pointer-events-none">
                <div className="absolute -top-24 -right-24 w-80 h-80 bg-uiupc-orange/20 blur-[100px] rounded-full" />
              </div>
              <div className="relative z-10 text-center space-y-8">
                <div className="w-32 h-32 bg-white dark:bg-zinc-800 rounded-[2.5rem] shadow-2xl flex items-center justify-center text-5xl text-uiupc-orange mx-auto group">
                   <IconEnvelope size={64} className="group-hover:scale-110 transition-transform duration-500" />
                </div>
                <div className="space-y-3">
                   <h4 className="text-2xl font-black uppercase tracking-tighter dark:text-white">Email</h4>
                   <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">Send emails</p>
                </div>
                <div className="pt-8 space-y-4">
                   <div className="p-4 bg-white dark:bg-zinc-800 rounded-2xl border border-black/5 dark:border-white/5 flex items-center gap-4 text-left">
                      <IconUserCircle size={24} className="text-uiupc-orange shrink-0" />
                      <div className="min-w-0">
                         <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Recipient</p>
                         <p className="text-[11px] font-bold dark:text-white truncate">{recipientName}</p>
                      </div>
                   </div>
                </div>
              </div>
            </div>

            {/* Right Side: Email Form */}
            <div className="flex-1 p-8 md:p-14 overflow-y-auto custom-scrollbar">
              <div className="mb-12 flex items-center justify-between">
                <div>
                  <span className="text-uiupc-orange text-[10px] font-black uppercase tracking-[0.4em] mb-4 block">Send Email</span>
                  <h3 className="text-4xl font-black uppercase tracking-tighter dark:text-white">Send Email</h3>
                </div>
                <button onClick={onClose} className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-900 text-zinc-400 hover:text-red-500 transition-all flex items-center justify-center group">
                  <IconClose size={16} className="group-hover:rotate-90 transition-transform" />
                </button>
              </div>

              <div className="space-y-10">
                {/* Template Grid */}
                <div className="space-y-6">
                  <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 flex items-center gap-2">
                    <IconSync size={12} /> Templates
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button 
                      onClick={() => onSend(item, "confirmation", "", onClose)}
                      disabled={sending}
                      className="p-6 text-left rounded-[2rem] bg-zinc-50 dark:bg-zinc-900 border border-black/5 dark:border-white/5 hover:border-uiupc-orange/30 transition-all group relative overflow-hidden"
                    >
                      <div className="relative z-10 space-y-3">
                         <IconCheckCircle size={20} className="text-uiupc-orange" />
                         <h6 className="text-[11px] font-black uppercase tracking-widest dark:text-white group-hover:text-uiupc-orange transition-colors">Confirmation Email</h6>
                         <p className="text-[10px] text-zinc-500 font-medium leading-relaxed">Confirms receipt and provides details.</p>
                      </div>
                    </button>

                    <button 
                      onClick={() => onSend(item, "renameRequest", "", onClose)}
                      disabled={sending}
                      className="p-6 text-left rounded-[2rem] bg-zinc-50 dark:bg-zinc-900 border border-black/5 dark:border-white/5 hover:border-uiupc-orange/30 transition-all group relative overflow-hidden"
                    >
                      <div className="relative z-10 space-y-3">
                         <IconFileSignature size={20} className="text-uiupc-orange" />
                         <h6 className="text-[11px] font-black uppercase tracking-widest dark:text-white group-hover:text-uiupc-orange transition-colors">Rename Request</h6>
                         <p className="text-[10px] text-zinc-500 font-medium leading-relaxed">Asks member to rename their file.</p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Custom Message Area */}
                <div className="space-y-6">
                  <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 flex items-center gap-2">
                    <IconPenNib size={12} /> Custom Message
                  </h5>
                  <div className="relative">
                    <textarea 
                      placeholder="Write your message here..."
                      value={customText}
                      onChange={(e) => setCustomText(e.target.value)}
                      className="w-full p-8 bg-zinc-50 dark:bg-zinc-900 border-2 border-black/5 dark:border-white/5 rounded-[2.5rem] text-sm font-medium outline-none focus:border-uiupc-orange/30 dark:text-white transition-all min-h-[180px] resize-none"
                    />
                    <div className="absolute bottom-6 right-8">
                       <IconPenNib size={24} className="text-zinc-200 dark:text-zinc-800" />
                    </div>
                  </div>
                  <button 
                    onClick={() => onSend(item, "general", customText, onClose)}
                    disabled={sending || !customText.trim()}
                    className="w-full py-6 bg-uiupc-orange text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl hover:translate-y-[-2px] active:translate-y-0 transition-all shadow-xl shadow-uiupc-orange/20 disabled:opacity-30 flex items-center justify-center gap-3"
                  >
                    {sending ? <IconSync size={14} className="animate-spin" /> : <IconPaperPlane size={14} />}
                    {sending ? "Sending..." : "Send Email"}
                  </button>
                </div>

                {/* Info Alert */}
                <div className="p-5 bg-blue-500/5 border border-blue-500/10 rounded-2xl flex items-start gap-4">
                   <IconInfo size={16} className="text-blue-500 mt-1" />
                   <p className="text-[10px] text-blue-500/80 font-bold uppercase tracking-widest leading-relaxed">
                     All emails are logged and visible to core admin staff.
                   </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
