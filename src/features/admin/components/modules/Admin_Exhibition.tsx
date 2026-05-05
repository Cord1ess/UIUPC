"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  IconCamera, IconCheck, IconClose, IconTrash, 
  IconSearch, IconFilter, IconSync, IconExternalLink,
  IconEye, IconHistory, IconCheckCircle, IconExclamationCircle
} from '@/components/shared/Icons';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { supabase } from '@/lib/supabase';
import { getImageUrl } from '@/utils/imageUrl';
import { ExhibitionSubmission } from '@/types/admin';
import { executeAdminMutation } from "@/features/admin/actions";

export const Admin_Exhibition: React.FC = () => {
  const { data: submissions, isLoading, refetch } = useSupabaseData("exhibition_submissions", { orderBy: 'submitted_at', orderDesc: true });
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'selected' | 'rejected'>('all');
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'paid' | 'unpaid'>('all');
  const [selectedSubmission, setSelectedSubmission] = useState<ExhibitionSubmission | null>(null);

  const handleUpdateStatus = async (id: string, status: 'selected' | 'rejected') => {
    const { success, message } = await executeAdminMutation("exhibition_submissions", "update", { status }, id);
    if (!success) alert(message);
    else refetch();
  };

  const handleUpdatePayment = async (id: string, payment_status: 'paid' | 'unpaid') => {
    const { success, message } = await executeAdminMutation("exhibition_submissions", "update", { payment_status }, id);
    if (!success) alert(message);
    else refetch();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this submission?")) return;
    const { success, message } = await executeAdminMutation("exhibition_submissions", "delete", null, id);
    if (!success) alert(message);
    else refetch();
  };

  const filteredSubmissions = (submissions || []).filter((s: ExhibitionSubmission) => {
    const matchesSearch = s.participant_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.photo_title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    const matchesPayment = paymentFilter === 'all' || s.payment_status === paymentFilter;
    return matchesSearch && matchesStatus && matchesPayment;
  });

  return (
    <div className="space-y-8">
      {/* ── HEADER ────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-tight text-zinc-900 dark:text-white flex items-center gap-3">
            <IconCamera className="text-uiupc-orange" /> Exhibition Engine
          </h2>
          <p className="text-sm text-zinc-500 font-medium mt-1">Review and curate photo submissions for upcoming exhibitions.</p>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => refetch()} className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-xl hover:text-uiupc-orange transition-colors">
            <IconSync size={18} />
          </button>
        </div>
      </div>

      {/* ── FILTERS & STATS ────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-2 relative group">
          <IconSearch size={14} className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-300 dark:text-zinc-600 transition-colors group-focus-within:text-uiupc-orange" />
          <input 
            type="text"
            placeholder="Search by name or photo title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-14 pr-6 py-4 bg-white dark:bg-zinc-950 rounded-2xl text-sm font-bold tracking-tight outline-none border border-black/5 dark:border-white/5 focus:border-uiupc-orange/20 dark:text-white shadow-sm"
          />
        </div>
        
        <select 
          value={statusFilter} 
          onChange={(e: any) => setStatusFilter(e.target.value)}
          className="px-6 py-4 bg-white dark:bg-zinc-950 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none border border-black/5 dark:border-white/5 dark:text-white cursor-pointer shadow-sm"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="selected">Selected</option>
          <option value="rejected">Rejected</option>
        </select>

        <select 
          value={paymentFilter} 
          onChange={(e: any) => setPaymentFilter(e.target.value)}
          className="px-6 py-4 bg-white dark:bg-zinc-950 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none border border-black/5 dark:border-white/5 dark:text-white cursor-pointer shadow-sm"
        >
          <option value="all">All Payment</option>
          <option value="paid">Paid</option>
          <option value="unpaid">Unpaid</option>
        </select>
      </div>

      {/* ── SUBMISSIONS TABLE ───────────────────────────────────── */}
      <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-black/5 dark:border-white/5 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f9f5ea] dark:bg-black/40 text-[10px] font-black uppercase tracking-widest text-zinc-400">
                <th className="px-8 py-5">Photo</th>
                <th className="px-8 py-5">Participant</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5">Payment</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center text-uiupc-orange"><IconSync size={32} className="animate-spin mx-auto" /></td>
                </tr>
              ) : filteredSubmissions.map((s: ExhibitionSubmission) => (
                <tr key={s.id} className="group hover:bg-[#f9f5ea]/30 dark:hover:bg-white/[0.02] transition-colors">
                  <td className="px-8 py-6">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 cursor-pointer" onClick={() => setSelectedSubmission(s)}>
                      <img src={getImageUrl(s.photo_url, 100, 100)} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" alt="" />
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <h4 className="text-sm font-black uppercase tracking-tight text-zinc-900 dark:text-white">{s.participant_name}</h4>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{s.institute}</p>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                      s.status === 'selected' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                      s.status === 'rejected' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                      'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 border-transparent'
                    }`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <button 
                      onClick={() => handleUpdatePayment(s.id, s.payment_status === 'paid' ? 'unpaid' : 'paid')}
                      className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${
                        s.payment_status === 'paid' 
                        ? 'bg-uiupc-orange text-white shadow-lg shadow-uiupc-orange/20' 
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 hover:text-uiupc-orange'
                      }`}
                    >
                      {s.payment_status}
                    </button>
                    {s.transaction_id && <p className="text-[8px] font-mono mt-1 text-zinc-400">TX: {s.transaction_id}</p>}
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => handleUpdateStatus(s.id, 'selected')} title="Select" className="p-2 text-zinc-300 hover:text-green-500 transition-colors"><IconCheckCircle size={20} /></button>
                      <button onClick={() => handleUpdateStatus(s.id, 'rejected')} title="Reject" className="p-2 text-zinc-300 hover:text-red-500 transition-colors"><IconExclamationCircle size={20} /></button>
                      <button onClick={() => setSelectedSubmission(s)} title="View Details" className="p-2 text-zinc-300 hover:text-uiupc-orange transition-colors"><IconEye size={20} /></button>
                      <button onClick={() => handleDelete(s.id)} title="Delete" className="p-2 text-zinc-300 hover:text-zinc-600 transition-colors"><IconTrash size={20} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {!isLoading && filteredSubmissions.length === 0 && (
                <tr><td colSpan={5} className="py-20 text-center text-[10px] font-black uppercase tracking-widest text-zinc-300">No submissions found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── DETAILS MODAL ────────────────────────────────────────── */}
      <AnimatePresence>
        {selectedSubmission && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setSelectedSubmission(null)} />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-4xl bg-white dark:bg-zinc-950 rounded-[3rem] overflow-hidden shadow-2xl border border-white/10 flex flex-col md:flex-row max-h-[90vh]"
            >
              <div className="w-full md:w-1/2 bg-zinc-100 dark:bg-zinc-900 p-8 flex items-center justify-center">
                <img src={getImageUrl(selectedSubmission.photo_url, 1000, 1000)} className="w-full h-auto max-h-full object-contain rounded-2xl shadow-2xl" alt="" />
              </div>
              <div className="flex-1 p-10 space-y-8 overflow-y-auto custom-scrollbar">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-black uppercase tracking-tight text-zinc-900 dark:text-white">{selectedSubmission.photo_title}</h3>
                  <button onClick={() => setSelectedSubmission(null)} className="text-zinc-400 hover:text-uiupc-orange transition-colors"><IconClose size={24} /></button>
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Participant</label>
                    <p className="text-sm font-bold dark:text-white">{selectedSubmission.participant_name}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Category</label>
                    <p className="text-sm font-bold dark:text-white uppercase">{selectedSubmission.category}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Institute</label>
                    <p className="text-sm font-bold dark:text-white">{selectedSubmission.institute}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Submitted</label>
                    <p className="text-sm font-bold dark:text-white">{new Date(selectedSubmission.submitted_at).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="p-6 bg-zinc-50 dark:bg-white/[0.03] rounded-2xl border border-black/5 dark:border-white/5 space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-uiupc-orange">Payment Details</h4>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Transaction ID:</span>
                    <span className="text-xs font-mono font-bold dark:text-white">{selectedSubmission.transaction_id || 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Status:</span>
                    <span className={`text-[9px] font-black uppercase tracking-widest ${selectedSubmission.payment_status === 'paid' ? 'text-green-500' : 'text-red-500'}`}>
                      {selectedSubmission.payment_status}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-3 pt-4">
                  <a 
                    href={`https://drive.google.com/file/d/${selectedSubmission.photo_url}/view`} 
                    target="_blank" rel="noopener noreferrer"
                    className="w-full py-4 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-[10px] font-black uppercase tracking-widest rounded-xl text-center hover:bg-uiupc-orange dark:hover:bg-uiupc-orange hover:text-white dark:hover:text-white transition-all shadow-lg flex items-center justify-center gap-2"
                  >
                    <IconExternalLink size={14} /> Open High-Res in Drive
                  </a>
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => { handleUpdateStatus(selectedSubmission.id, 'selected'); setSelectedSubmission(null); }}
                      className="py-4 bg-green-500/10 text-green-500 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-green-500 hover:text-white transition-all"
                    >
                      Select for Exhibition
                    </button>
                    <button 
                      onClick={() => { handleUpdateStatus(selectedSubmission.id, 'rejected'); setSelectedSubmission(null); }}
                      className="py-4 bg-red-500/10 text-red-500 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-red-500 hover:text-white transition-all"
                    >
                      Reject Submission
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
