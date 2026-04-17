"use client";

import React, { useState, useEffect, useRef } from "react";
import { useStudioStore } from "@/store/useStudioStore";
import { 
  FaStamp,
  FaCheckCircle,
  FaImage,
  FaTh
} from "react-icons/fa";
import { WorkerMessage } from "@/workers/imageWorker";

const TransformerTool: React.FC = () => {
  const { images, activeImageId, updateImageEdits, applyProcessedImage } = useStudioStore();
  const activeImage = images.find((img) => img.id === activeImageId);
  const transformer = activeImage?.edits?.transformer || {
    resizer: { mode: "none" },
    watermark: { enabled: true, type: "text", opacity: 0.5, position: "bottom-right", tiled: false }
  };

  const [isProcessing, setIsProcessing] = useState(false);
  const [naturalSize, setNaturalSize] = useState({ width: 0, height: 0 });
  const workerRef = useRef<Worker | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    workerRef.current = new Worker(new URL("@/workers/imageWorker.ts", import.meta.url));
    return () => workerRef.current?.terminate();
  }, []);

  useEffect(() => {
    if (!activeImage) return;
    const img = new Image();
    img.onload = () => setNaturalSize({ width: img.naturalWidth, height: img.naturalHeight });
    img.src = activeImage.workingUrl;
  }, [activeImage?.id, activeImage?.workingUrl]);

  if (!activeImage) return null;

  const handleUpdate = (updates: any) => {
    updateImageEdits(activeImage.id, {
      transformer: { ...transformer, ...updates }
    });
  };

  const handleApply = async () => {
    setIsProcessing(true);
    try {
      if (workerRef.current) {
        const res = await fetch(activeImage.workingUrl);
        const blob = await res.blob();

        workerRef.current.onmessage = (e: MessageEvent) => {
          if (e.data.type === 'SUCCESS') {
            applyProcessedImage(
              activeImage.id, 
              e.data.resultBlob, 
              "transformer", 
              `Watermarked${transformer.watermark.tiled ? ' (Tiled)' : ''}`
            );
            setIsProcessing(false);
          } else if (e.data.type === 'ERROR') {
            console.error(e.data.error);
            setIsProcessing(false);
          }
        };

        // Force resizer to "none" so worker only applies watermark
        workerRef.current.postMessage({
          type: 'PROCESS_TRANSFORM',
          payload: { 
            blob, 
            transformer: { ...transformer, resizer: { mode: "none" } }, 
            naturalSize 
          }
        } as WorkerMessage);
      }
    } catch (e) {
      console.error(e);
      setIsProcessing(false);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const uri = URL.createObjectURL(file);
      handleUpdate({ watermark: { ...transformer.watermark, imageUri: uri, type: "logo" } });
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3 text-zinc-400">
         <FaStamp className="text-uiupc-orange" />
         <span className="text-[10px] font-black uppercase tracking-[0.2em]">Watermark Engine</span>
      </div>

      {/* UIUPC Branding Preset */}
      <button 
        onClick={() => handleUpdate({ 
          watermark: { 
            enabled: true, 
            type: "logo", 
            imageUri: "/assets/uiupclogo.svg", 
            opacity: 1, 
            scale: 0.06, 
            inset: 0.02, 
            position: "bottom-right", 
            tiled: false 
          } 
        })}
        className="w-full py-4 rounded-xl bg-uiupc-orange/10 border border-uiupc-orange/30 text-uiupc-orange text-[10px] font-black uppercase tracking-[0.2em] hover:bg-uiupc-orange hover:text-white transition-all flex items-center justify-center gap-3 group"
      >
        <FaStamp className="group-hover:rotate-12 transition-transform" />
        One-Click UIUPC Branding
      </button>

      <p className="text-[10px] font-sans text-zinc-500 leading-relaxed font-medium">
        Burn a text label or logo stamp onto the active image. Choose between a single positioned mark or a tiled pattern.
      </p>

      {/* Type toggles */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => handleUpdate({ watermark: { ...transformer.watermark, type: "text", enabled: true } })}
          className={`py-4 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border
            ${transformer.watermark.type === "text"
              ? "bg-zinc-900 dark:bg-white text-white dark:text-black border-zinc-900 dark:border-white" 
              : "bg-black/5 dark:bg-white/5 border-black/5 dark:border-white/5 text-zinc-400"}`}
        >
          Text Label
        </button>
        <button
          onClick={() => {
            handleUpdate({ watermark: { ...transformer.watermark, type: "logo", enabled: true } });
            if (!transformer.watermark.imageUri) fileInputRef.current?.click();
          }}
          className={`py-4 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border
            ${transformer.watermark.type === "logo"
              ? "bg-zinc-900 dark:bg-white text-white dark:text-black border-zinc-900 dark:border-white" 
              : "bg-black/5 dark:bg-white/5 border-black/5 dark:border-white/5 text-zinc-400"}`}
        >
          Logo Stamp
        </button>
        <input 
          type="file" 
          ref={fileInputRef} 
          accept="image/*" 
          className="hidden" 
          onChange={handleLogoUpload}
        />
      </div>

      {/* Dynamic Content Input */}
      {transformer.watermark.type === "text" ? (
        <div className="space-y-3">
           <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400">Content</p>
           <input 
              type="text" 
              value={transformer.watermark.text || ""}
              onChange={(e) => handleUpdate({ watermark: { ...transformer.watermark, text: e.target.value } })}
              placeholder="UIUPC Studio"
              className="w-full p-4 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 text-[11px] outline-none focus:ring-1 focus:ring-uiupc-orange transition-all placeholder:text-zinc-500"
           />
        </div>
      ) : (
        <div className="space-y-3">
           <button 
             onClick={() => fileInputRef.current?.click()}
             className="w-full p-4 rounded-xl bg-black/5 dark:bg-white/5 border border-dashed border-zinc-500/30 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:border-uiupc-orange hover:text-uiupc-orange transition-all flex items-center justify-center gap-2"
           >
             <FaImage /> {transformer.watermark.imageUri ? "Change Logo File" : "Upload Logo (PNG/SVG)"}
           </button>
           {transformer.watermark.imageUri && (
             <img src={transformer.watermark.imageUri} className="h-10 object-contain mx-auto opacity-50" />
           )}
        </div>
      )}
      
      {/* Opacity + Scale + Tiling Options */}
      <div className="space-y-6">
         <div className="space-y-3">
            <div className="flex justify-between text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400">
               <span>Opacity</span>
               <span className="text-uiupc-orange">{Math.round(transformer.watermark.opacity * 100)}%</span>
            </div>
            <input 
               type="range" 
               min={0.1} max={1} step={0.05}
               value={transformer.watermark.opacity}
               onChange={(e) => handleUpdate({ watermark: { ...transformer.watermark, opacity: Number(e.target.value) } })}
               className="w-full accent-uiupc-orange h-1.5 bg-black/5 dark:bg-white/5 rounded-full appearance-none cursor-pointer"
            />
         </div>

         <div className="grid grid-cols-[1fr_auto] items-center gap-4">
            <div className="space-y-3">
               <div className="flex justify-between text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400">
                  <span>Scale</span>
                  <span className="text-uiupc-orange">{Math.round((transformer.watermark.scale || 0.15) * 100)}%</span>
               </div>
               <input 
                  type="range" 
                  min={0.05} max={0.6} step={0.01}
                  value={transformer.watermark.scale || 0.15}
                  onChange={(e) => handleUpdate({ watermark: { ...transformer.watermark, scale: Number(e.target.value) } })}
                  className="w-full accent-uiupc-orange h-1.5 bg-black/5 dark:bg-white/5 rounded-full appearance-none cursor-pointer"
               />
            </div>
            <button
               onClick={() => handleUpdate({ watermark: { ...transformer.watermark, tiled: !transformer.watermark.tiled } })}
               className={`h-10 w-10 mt-3 rounded-xl flex items-center justify-center text-xs transition-all border
                 ${transformer.watermark.tiled 
                   ? 'bg-uiupc-orange/10 border-uiupc-orange text-uiupc-orange' 
                   : 'bg-black/5 dark:bg-white/5 border-black/5 dark:border-white/5 text-zinc-400'}`}
               title="Tile across image"
            >
               <FaTh />
            </button>
         </div>

         <div className="space-y-3">
            <div className="flex justify-between text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400">
               <span>Distance from Edge</span>
               <span className="text-uiupc-orange">{Math.round((transformer.watermark.inset || 0.05) * 100)}%</span>
            </div>
            <input 
               type="range" 
               min={0.01} max={0.2} step={0.01}
               value={transformer.watermark.inset || 0.05}
               onChange={(e) => handleUpdate({ watermark: { ...transformer.watermark, inset: Number(e.target.value) } })}
               className="w-full accent-uiupc-orange h-1.5 bg-black/5 dark:bg-white/5 rounded-full appearance-none cursor-pointer"
            />
         </div>
      </div>

      {/* Position Selector */}
      <div className="space-y-3">
        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400">Position</span>
        <div className="grid grid-cols-3 gap-1.5">
          {["top-left", "top-center", "top-right", "center-left", "center", "center-right", "bottom-left", "bottom-center", "bottom-right"].map((pos) => (
            <button
              key={pos}
              onClick={() => handleUpdate({ watermark: { ...transformer.watermark, position: pos } })}
              className={`py-2.5 rounded-lg text-[7px] font-black uppercase tracking-widest transition-all border
                ${transformer.watermark.position === pos
                  ? "bg-uiupc-orange/10 border-uiupc-orange text-uiupc-orange" 
                  : "bg-black/5 dark:bg-white/5 border-black/5 dark:border-white/5 text-zinc-400 hover:text-zinc-600"}`}
            >
              {pos.replace("-", " ")}
            </button>
          ))}
        </div>
      </div>

      <button 
        onClick={handleApply}
        disabled={isProcessing || (!transformer.watermark.text && transformer.watermark.type === "text") || (!transformer.watermark.imageUri && transformer.watermark.type === "logo")}
        className="w-full py-5 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-black text-xs font-black uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-95 transition-all shadow-xl disabled:opacity-50 flex items-center justify-center gap-3"
      >
        {isProcessing ? "Burning Watermark..." : <><FaCheckCircle /> Apply Watermark</>}
      </button>
    </div>
  );
};

export default TransformerTool;
