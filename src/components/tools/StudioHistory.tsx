"use client";

import React from "react";
import { useStudioStore } from "@/store/useStudioStore";
import { FaHistory, FaUndoAlt, FaClock, FaCheckCircle, FaLayerGroup } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const StudioHistory: React.FC = () => {
  const { images, activeImageId, revertToHistory } = useStudioStore();
  const activeImage = images.find((img) => img.id === activeImageId);

  if (!activeImage) return null;

  return (
    <aside className="fixed right-0 top-20 bottom-32 sm:bottom-0 w-64 bg-white dark:bg-zinc-900 border-l border-black/5 dark:border-white/5 z-40 hidden xl:flex flex-col">
       <div className="p-6 border-b border-black/5 dark:border-white/5 flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
             <FaHistory className="text-uiupc-orange" /> Edit Stack
          </span>
          <span className="text-[10px] font-bold text-zinc-400">
             {activeImage.history.length} Steps
          </span>
       </div>

       <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          <AnimatePresence initial={false}>
             {/* Original State */}
             <div className="p-4 rounded-lg bg-black/5 dark:bg-white/5 border border-black/5 flex items-center gap-4 opacity-50">
                <div className="w-8 h-8 rounded-md bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-xs">
                   <FaClock />
                </div>
                <div>
                   <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Original</h4>
                   <p className="text-[8px] text-zinc-400">Initial Import</p>
                </div>
             </div>

             {activeImage.history.map((action, index) => (
                <motion.button
                   key={action.id}
                   initial={{ x: 20, opacity: 0 }}
                   animate={{ x: 0, opacity: 1 }}
                   onClick={() => revertToHistory(activeImage.id, action.id)}
                   className="w-full text-left p-4 rounded-lg bg-white dark:bg-zinc-800 border border-black/5 dark:border-white/10 shadow-sm hover:border-uiupc-orange/50 transition-all group flex items-start gap-4"
                >
                   <div className="w-8 h-8 rounded-md bg-uiupc-orange/10 text-uiupc-orange flex items-center justify-center text-xs">
                      <FaLayerGroup />
                   </div>
                   <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-black uppercase tracking-widest text-zinc-800 dark:text-zinc-200 truncate">
                        {action.label}
                      </p>
                      <p className="text-[8px] font-black uppercase tracking-widest text-zinc-400 mt-1">
                        {action.toolId} • {new Date(action.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                   </div>
                   
                   {/* Visual Snapshot */}
                   <div className="w-12 h-12 rounded-lg overflow-hidden bg-black/5 flex-shrink-0 border border-black/5">
                      <img src={action.workingUrlSnapshot} className="w-full h-full object-cover" />
                   </div>
                   
                   <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <FaUndoAlt className="text-zinc-300 text-[10px]" />
                   </div>
                </motion.button>
             ))}
          </AnimatePresence>

          {activeImage.history.length === 0 && (
             <div className="py-20 text-center flex flex-col items-center gap-4 opacity-20">
                <FaLayerGroup className="text-3xl" />
                <p className="text-[9px] font-black uppercase tracking-[0.2em]">No Edits Applied</p>
             </div>
          )}
       </div>

       <div className="p-6 bg-zinc-50 dark:bg-zinc-900/50 border-t border-black/5 dark:border-white/5">
          <div className="flex items-center gap-3">
             <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
             <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Non-Destructive Stack</span>
          </div>
       </div>
    </aside>
  );
};

export default StudioHistory;
