"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaHistory, FaUserTie, FaCrown } from 'react-icons/fa';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { getImageUrl } from '@/utils/imageUrl';

interface Admin_MemberTrajectoryProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: string | null;
}

export const Admin_MemberTrajectory: React.FC<Admin_MemberTrajectoryProps> = ({ isOpen, onClose, studentId }) => {
  const { data: history, isLoading } = useSupabaseData("committees", {
    filters: studentId ? { student_id: studentId } : undefined,
    orderBy: 'year',
    orderDesc: true,
    limit: 50,
    enabled: !!studentId && isOpen
  });

  return (
    <AnimatePresence>
      {isOpen && studentId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10">
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-2xl"
            onClick={onClose}
          />
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 40 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 40 }}
            className="relative w-full max-w-2xl bg-white dark:bg-[#0a0a0a] rounded-[3rem] border border-black/10 dark:border-white/10 shadow-3xl flex flex-col max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="p-8 md:p-10 border-b border-black/5 dark:border-white/5 flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-uiupc-orange/10 flex items-center justify-center text-uiupc-orange">
                  <FaHistory className="text-xl" />
                </div>
                <div>
                  <h3 className="text-2xl font-black uppercase tracking-tighter dark:text-white">Role History</h3>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mt-1">Student ID: {studentId}</p>
                </div>
              </div>
              <button onClick={onClose} className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400 hover:text-red-500 transition-all flex items-center justify-center group">
                <FaTimes className="group-hover:rotate-90 transition-transform" />
              </button>
            </div>

            {/* Timeline */}
            <div className="flex-1 p-8 md:p-10 overflow-y-auto custom-scrollbar">
              {isLoading ? (
                <div className="space-y-6">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex gap-6 animate-pulse">
                      <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800" />
                      <div className="flex-1 space-y-3 py-2">
                        <div className="h-4 w-32 bg-zinc-100 dark:bg-zinc-800 rounded" />
                        <div className="h-3 w-48 bg-zinc-100 dark:bg-zinc-800 rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : !history || history.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-16 h-16 rounded-[2rem] bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center text-zinc-300 dark:text-zinc-600 mb-4">
                    <FaHistory size={20} />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">No History Found</p>
                  <p className="text-[9px] text-zinc-500 mt-2">This student ID has no recorded committee roles.</p>
                </div>
              ) : (
                <div className="relative pl-8 border-l-2 border-black/5 dark:border-white/5 space-y-10">
                  {history.map((role, index) => (
                    <motion.div 
                      key={role.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="relative"
                    >
                      {/* Timeline Dot */}
                      <div className="absolute -left-[41px] top-4 w-5 h-5 rounded-full bg-white dark:bg-[#0a0a0a] border-4 border-uiupc-orange flex items-center justify-center shadow-lg" />
                      
                      <div className="bg-zinc-50 dark:bg-zinc-900/30 rounded-[2rem] p-6 flex flex-col sm:flex-row gap-6 items-start sm:items-center border border-black/5 dark:border-white/5 hover:border-uiupc-orange/30 transition-colors group">
                        <div className="w-20 h-20 rounded-2xl bg-white dark:bg-zinc-800 shadow-inner overflow-hidden flex-shrink-0">
                          {(role.image_url || role.image) && role.image_url !== 'PLACEHOLDER' ? (
                            <img src={getImageUrl(role.image_url || role.image, 100, 100)} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                          ) : role.image_url === 'PLACEHOLDER' ? (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-uiupc-orange/20 to-uiupc-orange/5 text-uiupc-orange font-black text-xl">
                              {(role.member_name || "?").split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()}
                            </div>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-zinc-300 dark:text-zinc-600">
                              <FaUserTie size={24} />
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="px-3 py-1 rounded-lg bg-uiupc-orange/10 text-uiupc-orange text-[9px] font-black uppercase tracking-widest">
                              {role.year}
                            </span>
                          </div>
                          <h4 className="text-xl font-black uppercase tracking-tight dark:text-white">{role.member_name}</h4>
                          <div className="flex items-center gap-2 mt-1 text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
                            <FaCrown className="text-uiupc-orange text-[10px]" /> {role.designation}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
