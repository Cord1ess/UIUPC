"use client";

import React, { useState, useCallback } from "react";
import Cropper, { Area, Point } from "react-easy-crop";
import { useStudioStore } from "@/store/useStudioStore";
import { IconCrop, IconUndo, IconSync, IconCheckCircle, IconWarning, IconExpandArrows } from "@/components/shared/Icons";
import { motion, AnimatePresence } from "motion/react";
import { getSmartScale } from "@/lib/imageUtils";

const ASPECT_RATIOS = [
  { label: "Original", value: undefined },
  { label: "1:1", value: 1 / 1 },
  { label: "4:5", value: 4 / 5 },
  { label: "16:9", value: 16 / 9 },
  { label: "9:16", value: 9 / 16 },
  { label: "2:3", value: 2 / 3 },
  { label: "3:2", value: 3 / 2 },
  { label: "3:4", value: 3 / 4 },
  { label: "3:5", value: 3 / 5 },
  { label: "1.91:1", value: 1.91 },
];

const CropperTool: React.FC = () => {
  const { images, activeImageId, updateImageEdits, applyProcessedImage } = useStudioStore();
  const activeImage = images.find((img) => img.id === activeImageId);

  const [isProcessing, setIsProcessing] = useState(false);

  if (!activeImage) return (
    <div className="flex flex-col items-center justify-center p-12 text-center space-y-4">
       <IconWarning size={24} className="text-zinc-300" />
       <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-black">No Image Selected</p>
    </div>
  );

  const cropState = {
    zoom: 1,
    rotation: 0,
    aspect: undefined,
    ...activeImage.edits.crop
  };

  // Photoshop-style Smart Scale logic is now in lib/imageUtils.ts
  const effectiveZoom = cropState.zoom * getSmartScale(cropState.rotation);

  const handleUpdate = (updates: any) => {
    updateImageEdits(activeImage.id, {
      crop: { ...cropState, ...updates }
    });
  };

  const handleApplyCrop = async () => {
    const pixels = cropState.croppedAreaPixels;
    if (!pixels || !activeImage) return;

    try {
      setIsProcessing(true);
      
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = activeImage.workingUrl;
      await new Promise((resolve) => { img.onload = resolve; });

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("No 2d context");

      const rotRad = (cropState.rotation * Math.PI) / 180;
      const { width: bWidth, height: bHeight } = img;

      const canvasWidth = Math.abs(Math.cos(rotRad) * bWidth) + Math.abs(Math.sin(rotRad) * bHeight);
      const canvasHeight = Math.abs(Math.sin(rotRad) * bWidth) + Math.abs(Math.cos(rotRad) * bHeight);

      canvas.width = canvasWidth;
      canvas.height = canvasHeight;

      ctx.translate(canvasWidth / 2, canvasHeight / 2);
      ctx.rotate(rotRad);
      ctx.translate(-bWidth / 2, -bHeight / 2);
      ctx.drawImage(img, 0, 0);

      const data = ctx.getImageData(pixels.x, pixels.y, pixels.width, pixels.height);
      canvas.width = pixels.width;
      canvas.height = pixels.height;
      ctx.putImageData(data, 0, 0);

      canvas.toBlob((blob) => {
        if (blob) {
          applyProcessedImage(activeImage.id, blob, "cropper", "Image Cropped");
        }
        setIsProcessing(false);
      }, "image/webp", 1);
    } catch (e) {
      console.error(e);
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-10">
      {/* Transformation Sliders */}
      <div className="space-y-8">
        <div className="space-y-4">
           <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
              <span>Magnification</span>
              <span className="text-uiupc-orange">{cropState.zoom.toFixed(2)}x</span>
           </div>
            <input 
              type="range" 
              min={1} max={3} step={0.01} 
              value={cropState.zoom} 
              onChange={(e) => handleUpdate({ zoom: Number(e.target.value) })}
              className="w-full h-1.5 bg-black/5 dark:bg-white/5 rounded-full appearance-none cursor-pointer accent-uiupc-orange"
           />
        </div>
        
        <div className="space-y-4">
           <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
              <span className="flex items-center gap-2">Orientation <span className="text-[8px] opacity-40 font-normal">Level Tool</span></span>
              <span className="text-uiupc-orange font-mono">{cropState.rotation > 0 ? '+' : ''}{cropState.rotation.toFixed(1)}°</span>
           </div>
           
           <div className="relative pt-2">
              {/* Center Marker */}
              <div className="absolute left-1/2 top-0 -translate-x-1/2 w-[1px] h-4 bg-zinc-300 dark:bg-zinc-700" />
              
              <input 
                type="range" 
                min={-45} max={45} step={0.1} 
                value={cropState.rotation} 
                onChange={(e) => handleUpdate({ rotation: Number(e.target.value) })}
                className="w-full h-2 bg-black/5 dark:bg-white/5 rounded-full appearance-none cursor-pointer accent-uiupc-orange relative z-10"
              />
              
              <div className="flex justify-between mt-2 text-[8px] font-black text-zinc-400 uppercase tracking-tighter">
                <span>-45°</span>
                <span>0°</span>
                <span>+45°</span>
              </div>
           </div>
        </div>
      </div>

      {/* Aspect Ratio Presets */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Ratio Matrix</span>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
           {ASPECT_RATIOS.map((ratio) => (
             <button
               key={ratio.label}
               onClick={() => handleUpdate({ aspect: ratio.value })}
               className={`py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border
                 ${cropState.aspect === ratio.value 
                   ? "bg-uiupc-orange border-uiupc-orange text-white shadow-lg shadow-uiupc-orange/20" 
                   : "bg-black/5 dark:bg-white/5 border-black/5 dark:border-white/5 text-zinc-500 hover:text-zinc-600"
                 }`}
             >
               {ratio.label}
             </button>
           ))}
        </div>
      </div>

      {/* Unified Action */}
      <div className="space-y-4 pt-2">
          <button 
            onClick={handleApplyCrop}
            disabled={isProcessing}
            className="w-full py-5 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-black text-xs font-black uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-95 transition-all shadow-xl flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {isProcessing ? "Processing..." : <><IconCrop size={14} /> Apply Crop</>}
          </button>
          
          <button 
            onClick={() => handleUpdate({ crop: { x: 0, y: 0 }, zoom: 1, rotation: 0, aspect: undefined })}
            className="w-full py-3 rounded-xl border border-black/5 dark:border-white/5 text-zinc-400 text-[9px] font-black uppercase tracking-widest hover:bg-black/5 transition-all flex items-center justify-center gap-2"
          >
            <IconUndo size={12} /> Reset
          </button>
      </div>
    </div>
  );
};

export default CropperTool;
