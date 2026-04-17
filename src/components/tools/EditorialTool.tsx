"use client";

import React, { useState, useRef, useEffect } from "react";
import { useStudioStore } from "@/store/useStudioStore";
import { 
  FaSun, 
  FaAdjust, 
  FaTint, 
  FaMagic, 
  FaUndo, 
  FaCheckCircle,
  FaThermometerHalf,
  FaEyeDropper,
  FaImage,
  FaFire
} from "react-icons/fa";
import { WorkerMessage } from "@/workers/imageWorker";

const PRESETS = [
  { id: "agfa", label: "Agfa", params: { exposure: 10, contrast: 15, saturation: 110, sepia: 10, temperature: 0, sharpen: 0, vignette: 0, vibrance: 10, blur: 0 } },
  { id: "kodak", label: "Kodak", params: { exposure: 5, contrast: 20, saturation: 120, sepia: 0, temperature: 10, sharpen: 10, vignette: 0, vibrance: 20, blur: 0 } },
  { id: "fuji", label: "Fuji", params: { exposure: 15, contrast: -5, saturation: 130, hueRotate: 5, temperature: -5, sharpen: 5, vignette: 5, vibrance: 15, blur: 0 } },
  { id: "earthy", label: "Earthy", params: { exposure: -5, contrast: 10, saturation: 90, sepia: 20, temperature: 15, sharpen: 0, vignette: 10, vibrance: 5, blur: 0 } },
  { id: "cyber", label: "Cyber", params: { exposure: 0, contrast: 25, saturation: 150, hueRotate: -15, temperature: -20, sharpen: 20, vignette: 20, vibrance: 40, blur: 0 } },
  { id: "noir", label: "Noir", params: { exposure: 0, contrast: 40, saturation: 0, sepia: 0, temperature: 0, sharpen: 30, vignette: 30, vibrance: 0, blur: 0 } },
  { id: "cinema", label: "Cinema", params: { exposure: 5, contrast: 15, saturation: 110, hueRotate: 185, temperature: -10, sharpen: 10, vignette: 15, vibrance: 10, blur: 0 } },
  { id: "soft", label: "Soft", params: { exposure: 10, contrast: -10, saturation: 95, blur: 2, temperature: 5, sharpen: 0, vignette: 0, vibrance: 5 } },
];

const NONE_PRESET = {
  exposure: 0, brightness: 0, contrast: 0, saturation: 100, 
  sharpen: 0, sepia: 0, invert: 0, hueRotate: 0, blur: 0,
  temperature: 0, vignette: 0, vibrance: 0
};

const EditorialTool: React.FC = () => {
  const { images, activeImageId, updateImageEdits, applyProcessedImage } = useStudioStore();
  const activeImage = images.find((img) => img.id === activeImageId);
  
  const editorial = activeImage?.edits?.editorial || { 
    exposure: 0, brightness: 0, contrast: 0, saturation: 100, 
    sharpen: 0, sepia: 0, invert: 0, hueRotate: 0, blur: 0 
  };

  const [isProcessing, setIsProcessing] = useState(false);
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    workerRef.current = new Worker(new URL("@/workers/imageWorker.ts", import.meta.url));
    return () => workerRef.current?.terminate();
  }, []);

  if (!activeImage) return null;

  const handleUpdate = (updates: Partial<typeof editorial>) => {
    updateImageEdits(activeImage.id, {
      editorial: { ...editorial, ...updates }
    });
  };

  const handleApply = async () => {
    setIsProcessing(true);
    try {
      if (workerRef.current) {
        // Fetch current representation as blob to send to worker
        const res = await fetch(activeImage.workingUrl);
        const blob = await res.blob();

        workerRef.current.onmessage = (e: MessageEvent) => {
          if (e.data.type === 'SUCCESS') {
            applyProcessedImage(activeImage.id, e.data.resultBlob, "editorial", "Applied Filters");
            setIsProcessing(false);
          } else if (e.data.type === 'ERROR') {
            console.error(e.data.error);
            setIsProcessing(false);
          }
        };

        workerRef.current.postMessage({
          type: 'PROCESS_EDITORIAL',
          payload: { blob, filters: editorial }
        } as WorkerMessage);
      }
    } catch (e) {
      console.error(e);
      setIsProcessing(false);
    }
  };

  const renderSlider = (
    label: string, 
    icon: React.ReactNode, 
    key: keyof typeof editorial, 
    min: number, 
    max: number, 
    unit: string = ""
  ) => (
    <div className="space-y-4 pt-2">
      <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
        <span className="flex items-center gap-2">{icon} {label}</span>
        <span className="text-uiupc-orange">
          {editorial[key] > 0 && key !== 'saturation' ? '+' : ''}{editorial[key]}{unit}
        </span>
      </div>
      <input 
        type="range" 
        min={min} 
        max={max} 
        value={editorial[key]}
        onChange={(e) => handleUpdate({ [key]: Number(e.target.value) })}
        className="w-full accent-uiupc-orange h-1.5 bg-black/5 dark:bg-white/5 rounded-full appearance-none cursor-pointer"
      />
    </div>
  );

  return (
    <div className="space-y-12">
      <div className="space-y-8">
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-3 text-zinc-400">
              <FaMagic className="text-uiupc-orange" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Color Engine</span>
           </div>
           
           {/* Reset Button */}
           <button 
             onClick={() => handleUpdate(NONE_PRESET)}
             className="text-zinc-500 hover:text-uiupc-orange transition-colors"
           >
             <FaUndo size={12} />
           </button>
        </div>

        {/* Color Tones */}
        {renderSlider("Exposure", <FaSun />, "exposure", -100, 100)}
        {renderSlider("Contrast", <FaAdjust />, "contrast", -100, 100)}
        {renderSlider("Saturation", <FaTint />, "saturation", 0, 200, "%")}
        {renderSlider("Vibrance", <FaMagic />, "vibrance", -100, 100, "%")}
        {renderSlider("Temperature", <FaThermometerHalf />, "temperature", -100, 100)}
        {renderSlider("Hue Shift", <FaEyeDropper />, "hueRotate", -180, 180, "°")}
        
        {/* Stylistic */}
        <div className="pt-4 border-t border-black/5 dark:border-white/5 space-y-8">
          <div className="flex items-center gap-3 text-zinc-400">
             <FaFire className="text-uiupc-orange" />
             <span className="text-[10px] font-black uppercase tracking-[0.2em]">Stylistic</span>
          </div>
          {renderSlider("Sepia", <FaThermometerHalf />, "sepia", 0, 100, "%")}
          {renderSlider("Sharpen", <FaMagic />, "sharpen", 0, 100, "%")}
          {renderSlider("Vignette", <FaAdjust className="rotate-90" />, "vignette", 0, 100, "%")}
          {renderSlider("Invert", <FaAdjust className="rotate-180" />, "invert", 0, 100, "%")}
          {renderSlider("Blur", <FaImage />, "blur", 0, 20, "px")}
        </div>

        {/* LUT Presets */}
        <div className="pt-4 space-y-4">
           <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Fast LUTs</span>
           <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleUpdate(NONE_PRESET)}
                className="px-4 py-2 rounded-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 text-[9px] font-black uppercase tracking-widest hover:border-uiupc-orange hover:text-uiupc-orange transition-all text-zinc-400"
              >
                None
              </button>
              {PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handleUpdate(preset.params)}
                  className="px-4 py-2 rounded-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 text-[9px] font-black uppercase tracking-widest hover:border-uiupc-orange hover:text-uiupc-orange transition-all text-zinc-400"
                >
                  {preset.label}
                </button>
              ))}
           </div>
        </div>
      </div>

      <button 
        onClick={handleApply}
        disabled={isProcessing}
        className="w-full py-5 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-black text-xs font-black uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-95 transition-all shadow-xl disabled:opacity-50 flex items-center justify-center gap-3"
      >
        {isProcessing ? "Processing..." : <><FaCheckCircle /> Apply Adjustments</>}
      </button>
    </div>
  );
};

export default EditorialTool;
