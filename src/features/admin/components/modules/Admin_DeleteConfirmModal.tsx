"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { IconTrash, IconLock, IconSpinner, IconCheck, IconWarning } from '@/components/shared/Icons';
import { deleteCommitteeMemberSecure, bulkDeleteCommitteeMembersSecure } from '@/features/admin/actions';
import { Admin_ModalPortal } from "@/features/admin/components/core/Admin_ModalPortal";

interface Admin_DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Single delete: pass item id and name */
  itemId?: string;
  itemName?: string;
  /** Bulk delete: pass array of ids */
  bulkIds?: string[];
  /** Called after successful deletion to refresh data */
  onSuccess?: () => void;
}

export const Admin_DeleteConfirmModal: React.FC<Admin_DeleteConfirmModalProps> = ({
  isOpen, onClose, itemId, itemName, bulkIds, onSuccess
}) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const isBulk = bulkIds && bulkIds.length > 0;
  const count = isBulk ? bulkIds.length : 1;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    setLoading(true);
    setError('');
    setResult(null);

    try {
      if (isBulk) {
        const res = await bulkDeleteCommitteeMembersSecure(bulkIds, password);
        if (res.success) {
          setResult(res.message);
          setTimeout(() => { handleClose(); onSuccess?.(); }, 800);
        } else {
          if (res.deleted > 0) {
            setResult(res.message);
            setTimeout(() => { handleClose(); onSuccess?.(); }, 1500);
          } else {
            setError(res.message);
          }
        }
      } else if (itemId) {
        const res = await deleteCommitteeMemberSecure(itemId, password);
        if (res.success) {
          setResult('Deleted successfully');
          setTimeout(() => { handleClose(); onSuccess?.(); }, 600);
        } else {
          setError(res.message);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setPassword('');
    setError('');
    setResult(null);
    onClose();
  };

  return (
    <Admin_ModalPortal>
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={handleClose}
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="relative w-full max-w-sm bg-white dark:bg-[#111] rounded-2xl border border-black/10 dark:border-white/10 shadow-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500">
                <IconTrash size={14} />
              </div>
              <div>
                <h4 className="text-sm font-black uppercase tracking-tight dark:text-white">
                  {isBulk ? `Delete ${count} Members` : 'Confirm Delete'}
                </h4>
                {itemName && <p className="text-[10px] text-zinc-400 font-bold truncate max-w-[220px]">{itemName}</p>}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2 mb-2">
                  <IconLock size={8} /> Admin Password
                </label>
                <input
                  type="password"
                  autoFocus
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  className="w-full bg-zinc-50 dark:bg-zinc-900/50 border border-black/5 dark:border-white/5 p-3 rounded-xl outline-none focus:border-red-500/50 dark:text-white font-bold text-sm transition-all"
                  placeholder="Enter admin password"
                />
                <AnimatePresence mode="wait">
                  {error && (
                    <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="text-[10px] font-bold text-red-500 mt-2 flex items-center gap-1">
                      <IconWarning size={8} /> {error}
                    </motion.p>
                  )}
                  {result && (
                    <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="text-[10px] font-bold text-green-500 mt-2 flex items-center gap-1">
                      <IconCheck size={8} /> {result}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={handleClose} className="flex-1 py-3 bg-zinc-100 dark:bg-zinc-900 text-zinc-500 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-all">
                  Cancel
                </button>
                <button type="submit" disabled={loading || !password} className="flex-1 py-3 bg-red-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-red-600 transition-all disabled:opacity-40 flex items-center justify-center gap-2">
                  {loading ? <IconSpinner size={14} className="animate-spin" /> : <IconTrash size={14} />} Delete
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
    </Admin_ModalPortal>
  );
};
