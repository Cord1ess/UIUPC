"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { IconFolder, IconClose, IconSync, IconCheckCircle, IconExclamationCircle, IconUserCircle, IconImages } from '@/components/shared/Icons';
import { Admin_DrivePicker } from "@/features/admin/components";
import { supabase } from "@/lib/supabase";
import { executeAdminMutation } from "@/features/admin/actions";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { getImageUrl } from "@/utils/imageUrl";
import { Admin_ModalPortal } from "@/features/admin/components/core/Admin_ModalPortal";

interface Admin_CommitteeFolderSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentYear: string;
  folderInfo: { id: string, name: string };
  onSuccess: () => void;
}

export const Admin_CommitteeFolderSyncModal: React.FC<Admin_CommitteeFolderSyncModalProps> = ({
  isOpen, onClose, currentYear, folderInfo, onSuccess
}) => {
  const [driveFiles, setDriveFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState<any[]>([]);

  const { data: members } = useSupabaseData("committees", { 
    filters: currentYear !== 'all' ? { year: currentYear } : {},
    limit: 500
  });

  const GAS_URL = process.env.NEXT_PUBLIC_GAS_DRIVE;

  const fetchFiles = async (folderId: string) => {
    setLoading(true);
    try {
      const url = new URL(GAS_URL!);
      url.searchParams.append('action', 'browse');
      url.searchParams.append('folderId', folderId);
      const res = await fetch(url.toString());
      const data = await res.json();
      setDriveFiles(data.files || []);
      setDriveFiles(data.files || []);
    } catch (err) {
      alert("Failed to load folder contents");
      onClose();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && folderInfo) {
      fetchFiles(folderInfo.id);
    }
  }, [isOpen, folderInfo]);

  useEffect(() => {
    if (driveFiles.length > 0 && members.length > 0) {
      const newMatches = members.map(m => {
        const normalize = (s: string) => s?.toLowerCase().replace(/[^a-z0-9]/g, ' ').trim() || '';
        const mName = normalize(m.member_name);
        const mTokens = mName.split(/\s+/).filter(t => t.length >= 2); // include 'md', 'dr' etc
        
        // Find best match in drive files
        let bestMatch = null;
        let highestScore = 0;

        for (const file of driveFiles) {
          const fName = normalize(file.name.split('.')[0]);
          const fTokens = fName.split(/\s+/);
          
          // Calculate score based on how many member name tokens are in the filename
          let score = 0;
          mTokens.forEach(token => {
            if (fName.includes(token)) score += 2;
            else if (fTokens.some(ft => ft.includes(token) || token.includes(ft))) score += 1;
          });

          if (score > highestScore) {
            highestScore = score;
            bestMatch = file;
          }
        }

        // Only count as match if score is significant (at least one token match)
        const finalMatch = highestScore >= 2 ? bestMatch : null;

        return {
          member: m,
          file: finalMatch,
          confirmed: !!finalMatch
        };
      });
      setMatches(newMatches);
    }
  }, [driveFiles, members]);

  const handleApply = async () => {
    setLoading(true);
    try {
      const updates = matches
        .filter(m => m.confirmed && m.file)
        .map(m => ({
          id: m.member.id,
          image_url: m.file.id
        }));

      for (const update of updates) {
        await executeAdminMutation('committees', 'update', { image_url: update.image_url }, update.id);
      }

      alert(`Successfully updated ${updates.length} committee photos!`);
      onSuccess();
      onClose();
    } catch (err) {
      alert("Failed to save matches");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Admin_ModalPortal>
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-10">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-2xl" onClick={onClose} />
          
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 40 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 40 }}
            className="relative w-full max-w-4xl bg-white dark:bg-[#0a0a0a] rounded-[3rem] border border-black/10 dark:border-white/10 shadow-3xl flex flex-col overflow-hidden max-h-[90vh]"
          >
            <div className="p-8 md:p-12 border-b border-black/5 dark:border-white/5 flex items-center justify-between">
              <div>
                <h3 className="text-3xl font-black uppercase tracking-tighter dark:text-white">Folder Auto-Link</h3>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mt-1">Committee Year: {currentYear === 'all' ? 'Every Year' : currentYear}</p>
              </div>
              <button onClick={onClose} className="w-12 h-12 rounded-2xl bg-zinc-50 dark:bg-zinc-900 text-zinc-400 hover:text-red-500 flex items-center justify-center transition-all"><IconClose size={16} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 md:p-12 custom-scrollbar">
                <div className="space-y-8">
                  <div className="flex items-center justify-between p-6 bg-zinc-50 dark:bg-[#080808] rounded-3xl border border-black/5 dark:border-white/5">
                    <div className="flex items-center gap-4">
                       <IconFolder size={20} className="text-uiupc-orange" />
                       <span className="text-sm font-black dark:text-white uppercase tracking-tight">{folderInfo.name}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {matches.map((m, idx) => (
                      <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 bg-white dark:bg-zinc-900/30 rounded-2xl border border-zinc-200 dark:border-zinc-800 group hover:border-uiupc-orange/30 transition-all gap-4">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 overflow-hidden shrink-0">
                             {m.member.image_url && m.member.image_url !== 'PLACEHOLDER' ? (
                               <img src={getImageUrl(m.member.image_url, 100, 100)} className="w-full h-full object-cover" />
                             ) : (
                               <IconUserCircle size={20} />
                             )}
                           </div>
                           <div className="flex flex-col min-w-0">
                             <span className="text-xs font-black dark:text-white uppercase truncate">{m.member.member_name}</span>
                             <span className="text-[9px] font-bold text-zinc-500 uppercase truncate">{m.member.designation}</span>
                           </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6 pt-3 sm:pt-0 border-t sm:border-t-0 border-black/5 dark:border-white/5">
                           {m.file ? (
                             <div className="flex items-center gap-3 min-w-0">
                               <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-zinc-50 dark:bg-zinc-950 overflow-hidden border border-black/5 shrink-0">
                                 <img src={getImageUrl(m.file.id, 100, 100)} className="w-full h-full object-cover" />
                               </div>
                               <div className="flex flex-col items-end min-w-0">
                                 <span className="text-[10px] font-black text-green-500 uppercase">Match Found</span>
                                 <span className="text-[9px] font-bold text-zinc-400 truncate max-w-[100px] sm:max-w-[150px]">{m.file.name}</span>
                               </div>
                               <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-green-500/10 text-green-500 flex items-center justify-center shrink-0"><IconCheckCircle size={14} /></div>
                             </div>
                           ) : (
                             <div className="flex items-center gap-3">
                               <span className="text-[10px] font-black text-zinc-400 uppercase">No File</span>
                               <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-300 flex items-center justify-center shrink-0"><IconExclamationCircle size={14} /></div>
                             </div>
                           )}
                           <input 
                             type="checkbox" 
                             checked={m.confirmed} 
                             onChange={() => {
                               const newMatches = [...matches];
                               newMatches[idx].confirmed = !newMatches[idx].confirmed;
                               setMatches(newMatches);
                             }}
                             className="w-5 h-5 rounded-lg border-zinc-300 text-uiupc-orange cursor-pointer shrink-0"
                           />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
            </div>

            <div className="p-8 md:p-12 border-t border-black/5 dark:border-white/5 bg-zinc-50 dark:bg-[#080808] flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Sync Status</span>
                <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-[0.2em] mt-1">{matches.filter(m => m.confirmed).length} / {matches.length} Ready to Link</span>
              </div>
              <div className="flex items-center gap-4">
                <button onClick={onClose} className="px-8 py-4 text-zinc-500 text-[10px] font-black uppercase tracking-widest">Cancel</button>
                <button 
                  disabled={loading || driveFiles.length === 0 || matches.filter(m => m.confirmed).length === 0}
                  onClick={handleApply}
                  className="px-10 py-4 bg-uiupc-orange text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-uiupc-orange/20 hover:translate-y-[-2px] transition-all disabled:opacity-50"
                >
                  {loading ? <IconSync size={14} className="animate-spin" /> : "Apply Linkings"}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
    </Admin_ModalPortal>
  );
};
