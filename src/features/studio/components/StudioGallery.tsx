"use client";

import React from "react";
import { useStudioStore } from "@/store/useStudioStore";
import { FaPlus, FaTimes, FaCheckCircle } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const StudioGallery: React.FC = () => {
  const { images, activeImageId, setActiveImage, removeImage } = useStudioStore();
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  if (images.length === 0) return null;

  return (
    <div className={`fixed bottom-0 left-0 sm:left-24 right-0 transition-all duration-500 z-40 ${isCollapsed ? 'translate-y-[calc(100%-40px)]' : 'translate-y-0'}`}>
      {/* Collapse Toggle */}
      <div className="absolute -top-10 left-1/2 -translate-x-1/2">
         <button 
           onClick={() => setIsCollapsed(!isCollapsed)}
           className="w-20 h-8 rounded-t-xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-t border-x border-black/5 dark:border-white/5 flex items-center justify-center text-zinc-400 hover:text-uiupc-orange transition-all group shadow-2xl"
         >
            <div className={`w-6 h-1 rounded-full bg-zinc-200 dark:bg-zinc-800 transition-all ${isCollapsed ? 'translate-y-1' : ''}`} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
               {isCollapsed ? <FaPlus className="text-[10px]" /> : <FaTimes className="text-[10px]" />}
            </div>
         </button>
      </div>

      <div className="h-32 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-t border-black/5 dark:border-white/5 px-6 flex items-center gap-4 overflow-x-auto no-scrollbar shadow-[0_-20px_50px_rgba(0,0,0,0.1)]">
        <AnimatePresence initial={false}>
          {images.map((image) => (
            <motion.div
              key={image.id}
              initial={{ opacity: 0, scale: 0.8, x: -20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.8, x: -20 }}
              className={`relative shrink-0 w-20 h-20 rounded-lg overflow-hidden cursor-pointer transition-all duration-300 border-2 group
                ${activeImageId === image.id 
                  ? "border-uiupc-orange scale-105 shadow-lg shadow-uiupc-orange/20" 
                  : "border-transparent opacity-60 hover:opacity-100 hover:scale-105"
                }`}
              onClick={() => setActiveImage(image.id)}
            >
              <img 
                src={image.workingUrl} 
                alt="Thumbnail" 
                className="w-full h-full object-cover"
              />
              
              {image.history.length > 1 && (
                <div className="absolute top-1 right-1 p-0.5 bg-uiupc-orange rounded-full">
                   <FaCheckCircle className="text-[8px] text-white" />
                </div>
              )}

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeImage(image.id);
                }}
                className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <FaTimes className="text-white text-sm" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>

        {images.length > 0 && images.length < 20 && (
           <div className="shrink-0 w-20 h-20 rounded-lg border-2 border-dashed border-black/10 dark:border-white/10 flex flex-col items-center justify-center text-zinc-400 hover:border-uiupc-orange hover:text-uiupc-orange transition-all cursor-pointer bg-black/5 dark:bg-white/5">
              <FaPlus className="text-sm" />
           </div>
        )}
      </div>
    </div>
  );
};

export default StudioGallery;
