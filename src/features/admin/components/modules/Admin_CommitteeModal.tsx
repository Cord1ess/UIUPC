"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  IconClose, IconSync, IconCheck, IconWarning, IconSpinner
} from '@/components/shared/Icons';
import { Admin_Dropdown, Admin_DrivePicker } from "@/features/admin/components";
import { getImageUrl } from "@/utils/imageUrl";
import { supabase } from "@/lib/supabase";
import { Admin_ModalPortal } from "@/features/admin/components/core/Admin_ModalPortal";

interface Admin_CommitteeModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: any;
  onSave: (id: string | null, data: any) => Promise<any>;
}

type FeedbackState = { type: 'idle' } | { type: 'saving' } | { type: 'success'; message: string } | { type: 'error'; message: string };

export const Admin_CommitteeModal: React.FC<Admin_CommitteeModalProps> = ({ isOpen, onClose, item, onSave }) => {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackState>({ type: 'idle' });
  const [formData, setFormData] = useState({
    full_name: '', designation: '', club_department: '', department: '',
    batch: '', email: '', phone: '', image_url: '', blood_group: '',
    facebook_link: '', priority: 10, student_id: ''
  });

  useEffect(() => {
    if (!isOpen) return;
    setFeedback({ type: 'idle' });
    if (item) {
      setFormData({
        full_name: item.member_name || '',
        designation: item.designation || '',
        club_department: item.club_department || '',
        department: item.department || '',
        batch: item.year || '',
        email: item.email || '',
        phone: item.phone || '',
        image_url: item.image_url || '',
        blood_group: item.blood_group || '',
        facebook_link: item.social_links?.facebook || '',
        priority: item.order_index || 0,
        student_id: item.student_id || ''
      });
    } else {
      setFormData({
        full_name: '', designation: '', club_department: '', department: '',
        batch: '', email: '', phone: '', image_url: '', blood_group: '',
        facebook_link: '', priority: 0, student_id: ''
      });
    }
  }, [item, isOpen]);

  const set = (key: string, val: any) => setFormData(p => ({ ...p, [key]: val }));

  const handleAutoFill = async () => {
    if (!formData.student_id) return;
    setFeedback({ type: 'saving' });
    const { data } = await supabase.from('committees').select('*')
      .eq('student_id', formData.student_id).order('created_at', { ascending: false }).limit(1);
    if (data?.[0]) {
      const l = data[0];
      setFormData(p => ({
        ...p,
        full_name: l.member_name || p.full_name,
        image_url: l.image_url || p.image_url,
        facebook_link: l.social_links?.facebook || p.facebook_link,
        department: l.department || p.department,
        blood_group: l.blood_group || p.blood_group,
        email: l.email || p.email,
        phone: l.phone || p.phone
      }));
      setFeedback({ type: 'success', message: 'Auto-filled from records' });
    } else {
      setFeedback({ type: 'error', message: 'No record found for this ID' });
    }
    setTimeout(() => setFeedback({ type: 'idle' }), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback({ type: 'saving' });
    const dbData = {
      member_name: formData.full_name,
      designation: formData.designation,
      club_department: formData.club_department || null,
      department: formData.department,
      email: formData.email || null,
      phone: formData.phone || null,
      blood_group: formData.blood_group || null,
      year: formData.batch,
      image_url: formData.image_url || null,
      order_index: formData.priority,
      student_id: formData.student_id || null,
      social_links: { facebook: formData.facebook_link || null }
    };
    const result = await onSave(item && !item._prefill ? item.id : null, dbData);
    if (result?.success) {
      setFeedback({ type: 'success', message: item && !item._prefill ? 'Member updated' : 'Member added' });
      setTimeout(() => { onClose(); }, 800);
    } else {
      setFeedback({ type: 'error', message: result?.message || 'Save failed' });
      setTimeout(() => setFeedback({ type: 'idle' }), 3000);
    }
  };

  const isEdit = item && !item._prefill;

  return (
    <>
      <Admin_ModalPortal>
        <AnimatePresence>
          {isOpen && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 10 }}
                transition={{ duration: 0.15 }}
                className="relative w-full max-w-3xl bg-white dark:bg-[#111] rounded-2xl border border-black/10 dark:border-white/10 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
              >
                {/* Header */}
                <div className="flex items-center justify-between p-4 sm:p-5 border-b border-black/5 dark:border-white/5 shrink-0">
                  <div className="flex items-center gap-3 min-w-0">
                    {formData.image_url && (
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 shrink-0">
                        <img src={getImageUrl(formData.image_url, 80, 50)} alt="" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <h4 className="text-xs sm:text-sm font-black uppercase tracking-tight dark:text-white truncate">{isEdit ? 'Edit Member' : 'Add Member'}</h4>
                      {formData.full_name && <p className="text-[9px] sm:text-[10px] text-zinc-400 font-bold truncate">{formData.full_name}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Feedback badge */}
                    <div className="hidden sm:flex items-center gap-2">
                      <AnimatePresence mode="wait">
                        {feedback.type === 'saving' && (
                          <motion.div key="saving" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                            className="px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                            <IconSpinner size={8} className="animate-spin" /> Saving
                          </motion.div>
                        )}
                        {feedback.type === 'success' && (
                          <motion.div key="success" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                            className="px-3 py-1.5 rounded-lg bg-green-500/10 text-green-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                            <IconCheck size={8} /> {feedback.message}
                          </motion.div>
                        )}
                        {feedback.type === 'error' && (
                          <motion.div key="error" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                            className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                            <IconWarning size={8} /> {feedback.message}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400 hover:text-red-500 flex items-center justify-center transition-all">
                      <IconClose size={16} />
                    </button>
                  </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="overflow-y-auto custom-scrollbar p-5 space-y-5 flex-1">
                  {/* Row 1: Name + Designation */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Full Name" required>
                      <input type="text" required value={formData.full_name} onChange={e => set('full_name', e.target.value)}
                        className="input-field" placeholder="Ahmad Hasan" />
                    </Field>
                    <Field label="Designation">
                      <input type="text" required value={formData.designation} onChange={e => set('designation', e.target.value)}
                        className="input-field" placeholder="Head / President" />
                    </Field>
                  </div>

                  {/* Row 2: Club Dept + Session */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Club Department">
                      <input type="text" value={formData.club_department} onChange={e => set('club_department', e.target.value)}
                        className="input-field" placeholder="PR, Design, Visual" />
                    </Field>
                    <Field label="Committee Session">
                      <input type="text" required value={formData.batch} onChange={e => set('batch', e.target.value)}
                        className="input-field" placeholder="2023-24" />
                    </Field>
                  </div>

                  {/* Row 3: Email + Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Email">
                      <input type="email" value={formData.email} onChange={e => set('email', e.target.value)}
                        className="input-field" placeholder="member@uiu.ac.bd" />
                    </Field>
                    <Field label="Phone">
                      <input type="tel" value={formData.phone} onChange={e => set('phone', e.target.value)}
                        className="input-field" placeholder="+88017..." />
                    </Field>
                  </div>

                  {/* Row 4: Blood Group + Uni Dept */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Blood Group">
                      <Admin_Dropdown
                        value={formData.blood_group || ''}
                        onChange={(val) => set('blood_group', val === 'none' ? '' : val)}
                        options={[
                          { value: 'none', label: 'Not Set' },
                          { value: 'A+', label: 'A+' }, { value: 'A-', label: 'A-' },
                          { value: 'B+', label: 'B+' }, { value: 'B-', label: 'B-' },
                          { value: 'AB+', label: 'AB+' }, { value: 'AB-', label: 'AB-' },
                          { value: 'O+', label: 'O+' }, { value: 'O-', label: 'O-' },
                        ]}
                      />
                    </Field>
                    <Field label="University Dept">
                      <input type="text" required value={formData.department} onChange={e => set('department', e.target.value)}
                        className="input-field" placeholder="CSE" />
                    </Field>
                  </div>

                  {/* Row 5: Student ID + Rank */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="UIU Student ID">
                      <input type="text" value={formData.student_id} onChange={e => set('student_id', e.target.value)}
                        className="input-field w-full" placeholder="011221234" />
                    </Field>
                    <Field label="Rank Order">
                      <input type="number" value={formData.priority} onChange={e => set('priority', parseInt(e.target.value) || 0)}
                        className="input-field" />
                    </Field>
                  </div>

                  {/* Row 6: Image + Facebook */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Profile Image (Drive ID)">
                      <div className="flex gap-2">
                        <input type="text" value={formData.image_url} onChange={e => set('image_url', e.target.value)}
                          className="input-field flex-1 text-xs" placeholder="Google Drive ID..." />
                        <button type="button" onClick={() => setIsPickerOpen(true)}
                          className="px-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-uiupc-orange rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap shrink-0">
                          Browse
                        </button>
                      </div>
                    </Field>
                    <Field label="Facebook Profile">
                      <input type="url" value={formData.facebook_link} onChange={e => set('facebook_link', e.target.value)}
                        className="input-field text-xs" placeholder="https://facebook.com/..." />
                    </Field>
                  </div>

                  {/* Submit */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t border-black/5 dark:border-white/5">
                    <button type="button" onClick={onClose}
                      className="w-full sm:flex-1 py-4 sm:py-3 bg-zinc-100 dark:bg-zinc-900 text-zinc-500 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-all">
                      Cancel
                    </button>
                    <button type="submit" disabled={feedback.type === 'saving'}
                      className="w-full sm:flex-[2] py-4 sm:py-3 bg-uiupc-orange text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl shadow-lg shadow-uiupc-orange/20 hover:brightness-110 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                      {feedback.type === 'saving' ? <IconSpinner size={14} className="animate-spin" /> : <IconCheck size={14} />}
                      {isEdit ? 'Update Member' : 'Add Member'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </Admin_ModalPortal>
      <Admin_DrivePicker isOpen={isPickerOpen} onClose={() => setIsPickerOpen(false)}
        onSelect={(fileId) => set('image_url', fileId)} title="Select Profile Picture" />
    </>
  );
};

// Reusable field wrapper
const Field = ({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
      {label} {required && <span className="text-red-400">*</span>}
    </label>
    {children}
    <style jsx global>{`
      .input-field {
        width: 100%;
        background: rgb(250 250 250);
        border: 1px solid rgba(0,0,0,0.05);
        padding: 10px 14px;
        border-radius: 12px;
        outline: none;
        font-weight: 700;
        font-size: 13px;
        transition: all 0.2s;
      }
      .dark .input-field {
        background: rgba(24,24,27,0.5);
        border-color: rgba(255,255,255,0.05);
        color: white;
      }
      .input-field:focus {
        border-color: rgba(255,140,0,0.4);
      }
    `}</style>
  </div>
);
