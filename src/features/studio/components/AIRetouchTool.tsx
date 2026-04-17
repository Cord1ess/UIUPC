"use client";

import React from "react";
import { useStudioStore } from "@/store/useStudioStore";
import { FaEraser, FaCheckCircle, FaRobot, FaMagic } from "react-icons/fa";

import { useAIEngine } from "@/hooks/useAIEngine";

const AIRetouchTool: React.FC = () => {
  const { retouchMode, setRetouchMode, brushSize, setBrushSize } = useStudioStore();
  const { activeImage, isProcessing, statusMessage, processJob, setStatusMessage } = useAIEngine("AI Retouch Engine");

  if (!activeImage) return null;

  const handleApply = async () => {
    let maskBlob: Blob | null = null;

    if (retouchMode === "inpaint") {
       const canvas = document.getElementById("inpaint-mask-canvas") as HTMLCanvasElement;
       if (canvas) {
          maskBlob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, "image/png"));
       }
       if (!maskBlob) {
          setStatusMessage("No mask selected");
          return;
       }
    }

    const payload = retouchMode === "inpaint" ? { type: 'PROCESS_INPAINT', maskBlob } : { type: 'PROCESS_ERASE' };
    const workerType = retouchMode === "inpaint" ? "ai" : "image";
    const label = retouchMode === "inpaint" ? "AI Object Removed" : "AI Bkg Removed";

    await processJob(workerType, payload, "retouch_op", "retouch", label);

    // Clear mask if inpaint was successful
    if (retouchMode === "inpaint") {
       const canvas = document.getElementById("inpaint-mask-canvas") as HTMLCanvasElement;
       if (canvas) {
          const ctx = canvas.getContext('2d');
          ctx?.clearRect(0, 0, canvas.width, canvas.height);
       }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 text-zinc-400 mb-6">
         <FaMagic className="text-uiupc-orange" />
         <span className="text-[10px] font-black uppercase tracking-[0.2em]">{statusMessage}</span>
      </div>

      <div className="flex bg-black/5 dark:bg-white/5 p-1 rounded-xl">
        <button
          onClick={() => setRetouchMode("background")}
          className={`flex-1 py-3 text-[9px] font-black uppercase tracking-[0.2em] rounded-lg transition-all ${retouchMode === "background" ? "bg-white dark:bg-zinc-800 shadow-sm text-uiupc-orange" : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"}`}
        >
          Extract Subject
        </button>
        <button
          onClick={() => setRetouchMode("inpaint")}
          className={`flex-1 py-3 text-[9px] font-black uppercase tracking-[0.2em] rounded-lg transition-all ${retouchMode === "inpaint" ? "bg-white dark:bg-zinc-800 shadow-sm text-uiupc-orange" : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"}`}
        >
          Remove Object
        </button>
      </div>

      <p className="text-[10px] font-sans text-zinc-500 uppercase tracking-widest leading-relaxed">
        {retouchMode === "background" 
          ? "Identify the main subject and cleanly delete the background. Downloads a 40MB Neural Network locally on first run."
          : "Paint over an unwanted object to seamlessly remove it from the image. Uses local ML inpainting."}
      </p>

      <div className="py-8 rounded-2xl bg-black/5 dark:bg-white/5 border border-dashed border-black/10 dark:border-white/10 flex flex-col items-center justify-center gap-4 relative">
         <div className="relative">
            <FaEraser className={`text-4xl text-zinc-400 dark:text-zinc-600 transition-all ${isProcessing ? 'animate-bounce text-uiupc-orange' : ''}`} />
            {isProcessing && (
              <FaRobot className="absolute -bottom-2 -right-2 text-uiupc-orange animate-pulse" />
            )}
         </div>
         <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500 max-w-[200px] text-center">
            {isProcessing ? "Processing Tensors..." : retouchMode === "background" ? "Powered by image segmentation" : "Brush to mask the object"}
         </span>
         
         {retouchMode === "inpaint" && (
           <div className="w-full px-6 mt-4">
             <div className="flex justify-between text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2">
               <span>Brush Size</span>
               <span className="text-uiupc-orange">{brushSize}px</span>
             </div>
             <input
               type="range"
               min="4"
               max="80"
               value={brushSize}
               onChange={(e) => setBrushSize(parseInt(e.target.value))}
               className="w-full h-1 bg-black/10 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-uiupc-orange"
             />
           </div>
         )}
      </div>

      <button 
        onClick={handleApply}
        disabled={isProcessing}
        className="w-full py-5 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-black text-xs font-black uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-95 transition-all shadow-xl disabled:opacity-50 flex items-center justify-center gap-3 relative overflow-hidden group"
      >
        <div className={`absolute inset-0 bg-uiupc-orange/20 translate-y-full transition-transform ${isProcessing ? 'translate-y-0 animate-pulse' : 'group-hover:translate-y-0'}`} />
        <span className="relative z-10 flex items-center gap-3">
           {isProcessing ? "Extracting..." : retouchMode === "background" ? <><FaCheckCircle /> Extract Subject</> : <><FaEraser /> Remove Object</>}
        </span>
      </button>
    </div>
  );
};

export default AIRetouchTool;
