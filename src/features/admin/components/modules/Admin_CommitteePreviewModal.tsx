"use client";

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  IconClose, IconEnvelope, IconPhone, IconTint, IconGraduationCap, 
  IconIdBadge, IconLayerGroup, IconSitemap, IconFacebook, IconCrown, IconUserTie
} from '@/components/shared/Icons';
import { getImageUrl } from "@/utils/imageUrl";
import { Admin_ModalPortal } from "@/features/admin/components/core/Admin_ModalPortal";

interface Admin_CommitteePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: any;
}

export const Admin_CommitteePreviewModal: React.FC<Admin_CommitteePreviewModalProps> = ({ isOpen, onClose, item }) => {
  if (!item) return null;

  const fields = [
    { label: 'Designation', value: item.designation, icon: <IconCrown size={12} className="text-uiupc-orange" /> },
    { label: 'Club Dept', value: item.club_department, icon: <IconSitemap size={12} className="text-uiupc-orange" /> },
    { label: 'Email', value: item.email, icon: <IconEnvelope size={12} className="text-zinc-400" /> },
    { label: 'Phone', value: item.phone, icon: <IconPhone size={12} className="text-zinc-400" /> },
    { label: 'Blood Group', value: item.blood_group, icon: <IconTint size={12} className="text-red-500" /> },
    { label: 'University Dept', value: item.department, icon: <IconLayerGroup size={12} className="text-zinc-400" /> },
    { label: 'UIU ID', value: item.student_id, icon: <IconIdBadge size={12} className="text-zinc-400" /> },
    { label: 'Session', value: item.year, icon: <IconGraduationCap size={12} className="text-zinc-400" /> },
  ].filter(f => f.value);

  return (
    <Admin_ModalPortal>
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 10 }}
            transition={{ duration: 0.15 }}
            className="relative w-full max-w-2xl bg-white dark:bg-[#111] rounded-2xl border border-black/10 dark:border-white/10 shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center gap-4 p-5 border-b border-black/5 dark:border-white/5">
              <div className="w-14 h-14 rounded-xl bg-zinc-100 dark:bg-zinc-800 overflow-hidden shrink-0">
                {item.image_url && item.image_url !== 'PLACEHOLDER' ? (
                  <img src={getImageUrl(item.image_url, 120, 60)} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-300 dark:text-zinc-600">
                    <IconUserTie size={20} className="text-xl" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-lg font-black uppercase tracking-tight dark:text-white truncate">{item.member_name}</h4>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-uiupc-orange">{item.designation}{item.club_department ? ` · ${item.club_department}` : ''}</p>
              </div>
              {item.social_links?.facebook && (
                <a href={item.social_links.facebook} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white flex items-center justify-center transition-all shrink-0">
                  <IconFacebook size={16} />
                </a>
              )}
              <button onClick={onClose} className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400 hover:text-red-500 flex items-center justify-center transition-all shrink-0">
                <IconClose size={16} />
              </button>
            </div>

            {/* Data Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-px bg-black/5 dark:bg-white/5">
              {fields.map((f, i) => (
                <div key={i} className="bg-white dark:bg-[#111] p-3 sm:p-4 flex flex-col gap-1">
                  <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-zinc-400">{f.label}</span>
                  <span className="text-[11px] sm:text-[12px] font-bold text-zinc-900 dark:text-white truncate flex items-center gap-2">
                    {f.icon} {f.value}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
    </Admin_ModalPortal>
  );
};
