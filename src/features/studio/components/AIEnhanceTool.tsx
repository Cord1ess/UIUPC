"use client";

import React from "react";
import { FaMagic, FaRobot, FaExpandArrowsAlt, FaBrush } from "react-icons/fa";
import { useAIEngine } from "@/hooks/useAIEngine";

const AIEnhanceTool: React.FC = () => {
  const { activeImage, isProcessing, statusMessage, activeOp, processJob } = useAIEngine("AI Enhancement Engine");

  if (!activeImage) return null;

  const handleEnhance = async (operation: string, title: string) => {
    await processJob('ai', { type: 'PROCESS_ENHANCE', operation }, operation, 'enhance', title);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 text-zinc-400 mb-6">
         <FaMagic className="text-uiupc-orange" />
         <span className="text-[10px] font-black uppercase tracking-[0.2em]">{statusMessage}</span>
      </div>

      <p className="text-[10px] font-sans text-zinc-500 uppercase tracking-widest leading-relaxed">
        Leverage client-side ONNX models to upscale, denoise, and reconstruct image artifacts with zero server latency. 
      </p>

      <div className="py-8 rounded-2xl bg-black/5 dark:bg-white/5 border border-dashed border-black/10 dark:border-white/10 flex flex-col items-center justify-center gap-4">
         <div className="relative">
            <FaExpandArrowsAlt className={`text-4xl text-zinc-400 dark:text-zinc-600 transition-all ${isProcessing ? 'animate-bounce text-uiupc-orange' : ''}`} />
            {isProcessing && (
              <FaRobot className="absolute -bottom-2 -right-2 text-uiupc-orange animate-pulse" />
            )}
         </div>
         <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500 max-w-[200px] text-center">
            {isProcessing ? "Processing Tensors..." : "Select an AI operation below"}
         </span>
      </div>

      <div className="space-y-3">
        <button 
          onClick={() => handleEnhance("super_resolution", "Super Res x2")}
          disabled={isProcessing}
          className={`w-full py-4 rounded-xl border-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3
            ${activeOp === "super_resolution" ? "border-uiupc-orange text-uiupc-orange animate-pulse" : "border-black/10 dark:border-white/10 text-zinc-600 dark:text-zinc-400 hover:border-uiupc-orange hover:text-uiupc-orange disabled:opacity-50"}
          `}
        >
          <FaExpandArrowsAlt /> Super Resolution (x2)
        </button>
        <button 
          onClick={() => handleEnhance("denoise", "AI Denoise")}
          disabled={isProcessing}
          className={`w-full py-4 rounded-xl border-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3
            ${activeOp === "denoise" ? "border-uiupc-orange text-uiupc-orange animate-pulse" : "border-black/10 dark:border-white/10 text-zinc-600 dark:text-zinc-400 hover:border-uiupc-orange hover:text-uiupc-orange disabled:opacity-50"}
          `}
        >
          <FaBrush /> Denoise & Clean
        </button>
        <button 
          onClick={() => handleEnhance("de_jpeg", "JPEG Artifact Removal")}
          disabled={isProcessing}
          className={`w-full py-4 rounded-xl border-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3
            ${activeOp === "de_jpeg" ? "border-uiupc-orange text-uiupc-orange animate-pulse" : "border-black/10 dark:border-white/10 text-zinc-600 dark:text-zinc-400 hover:border-uiupc-orange hover:text-uiupc-orange disabled:opacity-50"}
          `}
        >
          <FaMagic /> De-JPEG (FBCNN)
        </button>
        <button 
          onClick={() => handleEnhance("colorize", "B&W Colorization")}
          disabled={isProcessing}
          className={`w-full py-4 rounded-xl border-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3
            ${activeOp === "colorize" ? "border-uiupc-orange text-uiupc-orange animate-pulse" : "border-black/10 dark:border-white/10 text-zinc-600 dark:text-zinc-400 hover:border-uiupc-orange hover:text-uiupc-orange disabled:opacity-50"}
          `}
        >
          <FaMagic /> B&W Colorizer (DDColor)
        </button>
        <button 
          onClick={() => handleEnhance("auto_straighten", "Auto Straighten")}
          disabled={isProcessing}
          className={`w-full py-4 rounded-xl border-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3
            ${activeOp === "auto_straighten" ? "border-uiupc-orange text-uiupc-orange animate-pulse" : "border-black/10 dark:border-white/10 text-zinc-600 dark:text-zinc-400 hover:border-uiupc-orange hover:text-uiupc-orange disabled:opacity-50"}
          `}
        >
          <FaExpandArrowsAlt /> Auto-Straighten (Hough)
        </button>
      </div>
    </div>
  );
};

export default AIEnhanceTool;
