"use client";

import React, { useEffect } from "react";
import { useStudioStore } from "@/store/useStudioStore";
import { 
  FaCompressArrowsAlt, 
  FaCrop, 
  FaAdjust, 
  FaShieldAlt, 
  FaStamp,
  FaObjectGroup 
} from "react-icons/fa";
import {
  FaFilePdf,
  FaMagic,
  FaEraser,
  FaWandMagicSparkles
} from "react-icons/fa6";
import { motion } from "framer-motion";

const TOOLS = [
  { id: "optimizer", label: "Transform", icon: FaCompressArrowsAlt },
  { id: "cropper", label: "Crop", icon: FaCrop },
  { id: "editor", label: "Edit", icon: FaAdjust },
  { id: "metadata", label: "EXIF", icon: FaShieldAlt },
  { id: "transformer", label: "Watermark", icon: FaStamp },
  { id: "compose", label: "Compose", icon: FaObjectGroup },
  { id: "pdf", label: "PDF", icon: FaFilePdf },
  { id: "retouch", label: "AI Retouch", icon: FaEraser },
  { id: "enhance", label: "AI Enhance", icon: FaWandMagicSparkles },
];

const StudioBottomBar: React.FC = () => {
  const { activeToolId, setActiveTool, images } = useStudioStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      
      const keyMap: Record<string, string> = {
        '1': 'optimizer',
        '2': 'cropper',
        '3': 'editor',
        '4': 'metadata',
        '5': 'transformer',
        '6': 'compose',
        '7': 'pdf',
        '8': 'retouch',
        '9': 'enhance'
      };

      if (keyMap[e.key] && images.length > 0) {
        setActiveTool(keyMap[e.key]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [images.length, setActiveTool]);

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center justify-center transition-all duration-500 opacity-40 hover:opacity-100">
      <div className="flex items-center gap-1 p-1 bg-white/80 dark:bg-black/80 backdrop-blur-2xl rounded-2xl border border-black/5 dark:border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
        {TOOLS.map((tool) => (
          <button
            key={tool.id}
            onClick={() => setActiveTool(tool.id)}
            disabled={images.length === 0}
            className={`relative px-4 py-2.5 rounded-xl flex items-center gap-2.5 transition-all duration-300 group
              ${activeToolId === tool.id 
                ? "bg-zinc-900 dark:bg-white text-white dark:text-black shadow-xl" 
                : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white disabled:opacity-30 disabled:pointer-events-none"
              }`}
          >
            <tool.icon className={`${activeToolId === tool.id ? 'scale-110' : 'scale-100'} transition-transform duration-200`} />
            
            {/* Smooth expandable label for active tool */}
            <motion.span 
              className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap overflow-hidden"
              initial={false}
              animate={{ 
                width: activeToolId === tool.id ? "auto" : 0,
                opacity: activeToolId === tool.id ? 1 : 0,
              }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
            >
              {tool.label}
            </motion.span>

            {/* Tooltip on hover (not active) */}
            {activeToolId !== tool.id && (
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-zinc-900 dark:bg-white text-white dark:text-black text-[9px] font-black uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap shadow-lg">
                {tool.label}
                <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-zinc-900 dark:border-t-white" />
              </div>
            )}

            {activeToolId === tool.id && (
              <motion.div 
                layoutId="active-pill"
                className="absolute inset-0 bg-zinc-900 dark:bg-white rounded-xl -z-10"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default StudioBottomBar;
