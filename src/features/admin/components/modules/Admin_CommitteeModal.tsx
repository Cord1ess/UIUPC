"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaUserTie, 
  FaFacebook, 
  FaLinkedin, 
  FaImage, 
  FaCrown,
  FaSync,
  FaTimes,
  FaLayerGroup,
  FaSortAmountUp,
  FaGraduationCap,
  FaEdit
} from 'react-icons/fa';
import { Admin_DrivePicker } from "@/features/admin/components";
import { getImageUrl } from "@/utils/imageUrl";

interface Admin_CommitteeModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: any;
  onSave: (id: string | null, data: any) => Promise<any>;
}

export const Admin_CommitteeModal: React.FC<Admin_CommitteeModalProps> = ({ isOpen, onClose, item, onSave }) => {
  const [loading, setLoading] = useState(false);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    designation: '',
    department: '',
    batch: '',
    image_url: '',
    facebook_link: '',
    linkedin_link: '',
    priority: 10
  });

  useEffect(() => {
    if (item) {
      setFormData({
        full_name: item.member_name || '',
        designation: item.designation || '',
        department: item.department || '',
        batch: item.year || '',
        image_url: item.image_url || '',
        facebook_link: item.social_links?.facebook || '',
        linkedin_link: item.social_links?.linkedin || '',
        priority: item.order_index || 0
      });
    } else {
      setFormData({
        full_name: '',
        designation: '',
        department: '',
        batch: '',
        image_url: '',
        facebook_link: '',
        linkedin_link: '',
        priority: 0
      });
    }
  }, [item, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const dbData = {
      member_name: formData.full_name,
      designation: formData.designation,
      department: formData.department,
      year: formData.batch,
      image_url: formData.image_url,
      order_index: formData.priority,
      social_links: {
        facebook: formData.facebook_link,
        linkedin: formData.linkedin_link
      }
    };

    const result = await onSave(item?.id || null, dbData);
    if (result?.success) {
      onClose();
    }
    setLoading(false);
  };

  return (
    <>
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10">
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-2xl"
            onClick={onClose}
          />
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 40 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 40 }}
            className="relative w-full max-w-4xl bg-white dark:bg-[#0a0a0a] rounded-[3rem] border border-black/10 dark:border-white/10 shadow-3xl flex flex-col md:flex-row overflow-hidden max-h-[90vh]"
          >
            {/* Left Side: Identity Preview */}
            <div className="hidden md:flex md:w-2/5 bg-zinc-50 dark:bg-zinc-900/50 border-r border-black/5 dark:border-white/5 items-center justify-center p-10 overflow-hidden relative">
              <div className="absolute inset-0 opacity-20 pointer-events-none">
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-uiupc-orange/30 blur-[100px] rounded-full" />
              </div>
              
              <AnimatePresence mode="wait">
                <motion.div 
                  key={formData.image_url}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="relative z-10 w-full flex flex-col items-center text-center"
                >
                  <div className="w-48 h-48 rounded-[2.5rem] bg-white dark:bg-zinc-800 shadow-2xl border-4 border-white dark:border-zinc-800 overflow-hidden mb-6 group/img">
                    {formData.image_url ? (
                      <img src={getImageUrl(formData.image_url, 300, 80)} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-200 dark:text-zinc-700">
                        <FaUserTie className="text-6xl" />
                      </div>
                    )}
                  </div>
                  <h4 className="text-2xl font-black uppercase tracking-tighter dark:text-white line-clamp-1">{formData.full_name || "New Member"}</h4>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-uiupc-orange mt-2">{formData.designation || "Role"}</p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Right Side: Form */}
            <div className="flex-1 p-8 md:p-14 overflow-y-auto custom-scrollbar">
              <div className="mb-12 flex items-center justify-between">
                <div>
                  <span className="text-uiupc-orange text-[10px] font-black uppercase tracking-[0.4em] mb-4 block">Committee Member</span>
                  <h3 className="text-4xl font-black uppercase tracking-tighter dark:text-white">
                    {item ? "Edit Member" : "New Member"}
                  </h3>
                </div>
                <button onClick={onClose} className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-900 text-zinc-400 hover:text-red-500 transition-all flex items-center justify-center group">
                  <FaTimes className="group-hover:rotate-90 transition-transform" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 flex items-center gap-2"><FaUserTie className="text-uiupc-orange" /> Full Name</label>
                    <input 
                      type="text" required value={formData.full_name}
                      onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                      className="w-full bg-transparent border-b-2 border-black/5 dark:border-white/5 py-4 outline-none focus:border-uiupc-orange dark:text-white text-xl font-black transition-all"
                      placeholder="e.g. Ahmad Hasan"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 flex items-center gap-2"><FaCrown className="text-uiupc-orange" /> Role</label>
                    <input 
                      type="text" required value={formData.designation}
                      onChange={e => setFormData({ ...formData, designation: e.target.value })}
                      className="w-full bg-transparent border-b-2 border-black/5 dark:border-white/5 py-4 outline-none focus:border-uiupc-orange dark:text-white text-xl font-black transition-all"
                      placeholder="e.g. President"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 flex items-center gap-2"><FaLayerGroup className="text-zinc-400" /> Department</label>
                    <input 
                      type="text" required value={formData.department}
                      onChange={e => setFormData({ ...formData, department: e.target.value })}
                      className="w-full bg-zinc-50 dark:bg-zinc-900/50 border border-black/5 dark:border-white/5 p-4 rounded-2xl outline-none focus:border-uiupc-orange dark:text-white font-bold transition-all"
                      placeholder="e.g. CSE / EEE"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 flex items-center gap-2"><FaGraduationCap className="text-zinc-400" /> Session</label>
                    <input 
                      type="text" required value={formData.batch}
                      onChange={e => setFormData({ ...formData, batch: e.target.value })}
                      className="w-full bg-zinc-50 dark:bg-zinc-900/50 border border-black/5 dark:border-white/5 p-4 rounded-2xl outline-none focus:border-uiupc-orange dark:text-white font-bold transition-all"
                      placeholder="e.g. Spring 2024"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 flex items-center gap-2"><FaImage className="text-zinc-400" /> Image Source</label>
                  <div className="flex gap-4">
                    <input 
                      type="text" value={formData.image_url}
                      onChange={e => setFormData({ ...formData, image_url: e.target.value })}
                      className="flex-1 bg-zinc-50 dark:bg-zinc-900/50 border border-black/5 dark:border-white/5 p-4 rounded-2xl outline-none focus:border-uiupc-orange dark:text-white font-bold transition-all min-w-0"
                      placeholder="Drive ID or direct link..."
                    />
                    <button 
                      type="button" 
                      onClick={() => setIsPickerOpen(true)}
                      className="px-6 py-4 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-uiupc-orange hover:bg-uiupc-orange/10 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap"
                    >
                      Browse Drive
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 flex items-center gap-2"><FaFacebook className="text-blue-500" /> Facebook</label>
                    <input 
                      type="url" value={formData.facebook_link}
                      onChange={e => setFormData({ ...formData, facebook_link: e.target.value })}
                      className="w-full bg-zinc-50 dark:bg-zinc-900/50 border border-black/5 dark:border-white/5 p-4 rounded-2xl outline-none focus:border-uiupc-orange dark:text-white font-bold transition-all text-xs"
                      placeholder="https://facebook.com/..."
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 flex items-center gap-2"><FaLinkedin className="text-blue-700" /> LinkedIn</label>
                    <input 
                      type="url" value={formData.linkedin_link}
                      onChange={e => setFormData({ ...formData, linkedin_link: e.target.value })}
                      className="w-full bg-zinc-50 dark:bg-zinc-900/50 border border-black/5 dark:border-white/5 p-4 rounded-2xl outline-none focus:border-uiupc-orange dark:text-white font-bold transition-all text-xs"
                      placeholder="https://linkedin.com/in/..."
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 flex items-center gap-2"><FaSortAmountUp className="text-zinc-400" /> Rank</label>
                  <input 
                    type="number" value={formData.priority}
                    onChange={e => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                    className="w-full bg-zinc-50 dark:bg-zinc-900/50 border border-black/5 dark:border-white/5 p-4 rounded-2xl outline-none focus:border-uiupc-orange dark:text-white font-bold transition-all"
                  />
                  <p className="text-[9px] text-zinc-500 italic mt-2">Lower numbers appear first (e.g., 1 for President).</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-10 border-t border-black/5 dark:border-white/5">
                  <button 
                    type="button" onClick={onClose}
                    className="flex-1 py-5 bg-zinc-100 dark:bg-zinc-900 text-zinc-500 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" disabled={loading}
                    className="flex-[2] py-5 bg-uiupc-orange text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-uiupc-orange/20 hover:translate-y-[-2px] active:translate-y-0 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                  >
                    {loading ? <FaSync className="animate-spin" /> : (item ? <FaEdit /> : <FaCrown />)}
                    {loading ? 'Saving...' : (item ? 'Save Changes' : 'Add')}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
    
    <Admin_DrivePicker
      isOpen={isPickerOpen}
      onClose={() => setIsPickerOpen(false)}
      onSelect={(fileId) => {
        setFormData({ ...formData, image_url: fileId });
      }}
      title="Select Profile Picture"
    />
    </>
  );
};
