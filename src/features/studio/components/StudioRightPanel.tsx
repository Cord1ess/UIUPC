"use client";

import React, { useState, useRef } from "react";
import { useStudioStore } from "@/store/useStudioStore";
import { IconHistory, IconImages, IconUndoAlt, IconLayerGroup, IconClose, IconCheckCircle, IconCloudUpload, IconClock } from "@/components/shared/Icons";
import { motion, AnimatePresence } from "motion/react";

const StudioRightPanel: React.FC = () => {
  const { images, activeImageId, setActiveImage, removeImage, revertToHistory, addImages } = useStudioStore();
  const [activeTab, setActiveTab] = useState<"edits" | "images">("edits");
  const [revertTarget, setRevertTarget] = useState<{ imageId: string; historyId: string; label: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const activeImage = images.find((img) => img.id === activeImageId);

  const handleRevert = () => {
    if (revertTarget) {
      revertToHistory(revertTarget.imageId, revertTarget.historyId);
      setRevertTarget(null);
    }
  };

  const handleUploadMore = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addImages(Array.from(e.target.files));
      e.target.value = "";
    }
  };

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  // Find the current active history index (the one matching workingUrl)
  const activeHistoryIndex = activeImage
    ? activeImage.history.findIndex(h => h.workingUrlSnapshot === activeImage.workingUrl)
    : -1;

  return (
    <aside className="fixed right-0 top-20 bottom-0 w-[320px] bg-white dark:bg-zinc-900 border-l border-black/5 dark:border-white/5 z-40 flex flex-col">
      {/* Hidden file input */}
      <input 
        type="file" 
        multiple 
        accept="image/*" 
        className="hidden" 
        ref={fileInputRef}
        onChange={handleFileChange}
      />

      {/* Tab Switcher */}
      <div className="p-3 border-b border-black/5 dark:border-white/5 flex gap-1">
         <button 
           onClick={() => setActiveTab("edits")}
           className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all
             ${activeTab === "edits" ? 'bg-zinc-900 dark:bg-white text-white dark:text-black shadow-lg' : 'text-zinc-400 hover:bg-black/5'}`}
         >
            <IconHistory size={12} /> History
         </button>
         <button 
           onClick={() => setActiveTab("images")}
           className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all
             ${activeTab === "images" ? 'bg-zinc-900 dark:bg-white text-white dark:text-black shadow-lg' : 'text-zinc-400 hover:bg-black/5'}`}
         >
            <IconImages size={12} /> Bin
         </button>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar p-5">
        <AnimatePresence mode="wait">
          {activeTab === "edits" ? (
            <motion.div 
              key="edits"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between px-1">
                 <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">
                   {activeImage ? `${activeImage.history.length} Edits` : 'Process'}
                 </span>
                 <div className="w-1.5 h-1.5 rounded-full bg-uiupc-orange animate-pulse" />
              </div>

              {!activeImage || activeImage.history.length === 0 ? (
                <div className="py-20 text-center space-y-4 opacity-30">
                  <IconLayerGroup size={32} className="mx-auto" />
                  <p className="text-[8px] font-black uppercase tracking-widest">No History</p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {activeImage.history.map((action, index) => {
                    const isCurrent = index === activeHistoryIndex;
                    const isReverted = activeHistoryIndex >= 0 && index > activeHistoryIndex;
                    
                    return (
                      <div 
                        key={action.id}
                        className={`group p-3 rounded-xl border transition-all flex items-center gap-3 cursor-pointer
                          ${isCurrent 
                            ? 'bg-uiupc-orange/10 border-uiupc-orange/30' 
                            : isReverted 
                              ? 'bg-black/5 dark:bg-white/5 border-transparent opacity-40 hover:opacity-70' 
                              : 'bg-black/5 dark:bg-white/5 border-transparent hover:border-uiupc-orange/20'}`}
                        onClick={() => {
                          if (!isCurrent) {
                            setRevertTarget({ imageId: activeImage.id, historyId: action.id, label: action.label });
                          }
                        }}
                      >
                         <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 border border-black/5">
                            <img src={action.workingUrlSnapshot} className="w-full h-full object-cover" />
                         </div>
                         <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-800 dark:text-zinc-200 truncate">{action.label}</p>
                            <p className="text-[8px] text-zinc-400 font-mono flex items-center gap-1 mt-0.5">
                              <IconClock size={7} /> {formatTime(action.timestamp)}
                            </p>
                         </div>
                         {isCurrent ? (
                           <span className="text-[7px] font-black uppercase tracking-widest text-uiupc-orange bg-uiupc-orange/10 px-1.5 py-0.5 rounded flex-shrink-0">Current</span>
                         ) : (
                           <IconUndoAlt size={9} className="text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                         )}
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div 
              key="images"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between px-1">
                 <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Source</span>
                 <span className="text-[9px] font-black text-zinc-400">{images.length}</span>
              </div>

              <div className="flex flex-col gap-2">
                {images.map((image) => (
                  <div
                    key={image.id}
                    onClick={() => setActiveImage(image.id)}
                    className={`relative w-full h-16 rounded-xl overflow-hidden cursor-pointer border-2 transition-all group flex items-center gap-3 p-1
                      ${activeImageId === image.id ? 'border-uiupc-orange bg-uiupc-orange/5' : 'border-transparent opacity-70 hover:opacity-100 hover:bg-black/5'}`}
                  >
                    <div className="w-14 h-full rounded-lg overflow-hidden flex-shrink-0">
                       <img src={image.workingUrl} className="w-full h-full object-cover" />
                    </div>
                    
                    <div className="flex-1 min-w-0 overflow-hidden">
                       <p className="text-[9px] font-black uppercase tracking-widest text-zinc-600 dark:text-zinc-400 truncate">
                          {image.file.name}
                       </p>
                       <p className="text-[8px] text-zinc-400 font-mono mt-0.5">
                          {(image.originalSize / 1024).toFixed(0)} KB
                       </p>
                    </div>

                    {image.history.length > 1 && (
                      <IconCheckCircle size={10} className="text-uiupc-orange mr-2 flex-shrink-0" />
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeImage(image.id);
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-lg bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <IconClose size={10} className="text-white" />
                    </button>
                  </div>
                ))}
                
                {images.length < 20 && (
                  <button 
                    onClick={handleUploadMore}
                    className="w-full h-12 rounded-xl border-2 border-dashed border-black/10 dark:border-white/10 flex items-center justify-center gap-2 text-zinc-400 bg-black/5 dark:bg-white/5 hover:border-uiupc-orange hover:text-uiupc-orange transition-all cursor-pointer"
                  >
                    <IconCloudUpload size={12} />
                    <span className="text-[8px] font-black uppercase tracking-widest">Upload More</span>
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Revert Confirmation Dialog */}
      <AnimatePresence>
        {revertTarget && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-0 left-0 right-0 p-5 bg-white dark:bg-zinc-900 border-t border-black/10 dark:border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.2)] z-50"
          >
            <p className="text-xs font-sans text-zinc-600 dark:text-zinc-300 mb-1">Revert to</p>
            <p className="text-sm font-black uppercase tracking-widest text-zinc-900 dark:text-white mb-4 truncate">{revertTarget.label}</p>
            <p className="text-[10px] text-zinc-500 mb-5 leading-relaxed">
              All edits made after this point will be permanently lost. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setRevertTarget(null)}
                className="flex-1 py-3 rounded-xl border border-black/10 dark:border-white/10 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:bg-black/5 dark:hover:bg-white/5 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleRevert}
                className="flex-1 py-3 rounded-xl bg-uiupc-orange text-white text-[10px] font-black uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-uiupc-orange/20"
              >
                Revert
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </aside>
  );
};

export default StudioRightPanel;
