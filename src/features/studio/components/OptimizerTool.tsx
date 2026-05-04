"use client";

import React, { useState, useEffect } from "react";

import { 
  IconCheckCircle, IconExpandArrows, IconPercentage, 
  IconRulerCombined, IconLock, IconLockOpen 
} from "@/components/shared/Icons";
import { useStudioStore } from "@/store/useStudioStore";

const LOSSLESS_FORMATS = ["image/png", "image/bmp", "image/gif"];

const RESIZE_MODES = [
  { id: "none", label: "Original" },
  { id: "dimensions", label: "Custom" },
  { id: "percentage", label: "Scale %" },
];

const OptimizerTool: React.FC = () => {
  const { images, activeImageId, applyProcessedImage } = useStudioStore();
  const activeImage = images.find((img) => img.id === activeImageId);

  const [quality, setQuality] = useState(0.8);
  const [format, setFormat] = useState("image/webp");
  const [maxSize, setMaxSize] = useState(2);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [estimatedSize, setEstimatedSize] = useState(0);

  // Resize state
  const [resizeMode, setResizeMode] = useState("none");
  const [lockAspect, setLockAspect] = useState(true);
  const [naturalSize, setNaturalSize] = useState({ width: 0, height: 0 });
  const [customWidth, setCustomWidth] = useState(0);
  const [customHeight, setCustomHeight] = useState(0);
  const [scalePercent, setScalePercent] = useState(100);

  useEffect(() => {
    if (!activeImage) return;
    const img = new Image();
    img.onload = () => {
      setNaturalSize({ width: img.naturalWidth, height: img.naturalHeight });
      setCustomWidth(img.naturalWidth);
      setCustomHeight(img.naturalHeight);
    };
    img.src = activeImage.workingUrl;
  }, [activeImage?.id, activeImage?.workingUrl]);

  // Estimate output size
  useEffect(() => {
    if (!activeImage) return;
    const fetchSize = async () => {
      try {
        const res = await fetch(activeImage.workingUrl);
        const blob = await res.blob();
        const raw = blob.size;
        // rough estimation: lossless keeps ~100%, lossy scales by quality
        const mult = LOSSLESS_FORMATS.includes(format) ? 1 : quality;
        // resize factor
        let resizeFactor = 1;
        if (resizeMode === "percentage") resizeFactor = (scalePercent / 100) ** 2;
        else if (resizeMode === "dimensions" && naturalSize.width > 0 && naturalSize.height > 0) {
          resizeFactor = (customWidth * customHeight) / (naturalSize.width * naturalSize.height);
        }
        const capped = Math.min(raw * mult * resizeFactor, maxSize * 1024 * 1024);
        setEstimatedSize(capped);
      } catch { setEstimatedSize(activeImage.originalSize); }
    };
    fetchSize();
  }, [activeImage?.workingUrl, format, quality, maxSize, resizeMode, scalePercent, customWidth, customHeight, naturalSize]);

  if (!activeImage) return null;

  const isLossless = LOSSLESS_FORMATS.includes(format);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleWidthChange = (w: number) => {
    setCustomWidth(w);
    if (lockAspect && naturalSize.width > 0) {
      setCustomHeight(Math.round(w * naturalSize.height / naturalSize.width));
    }
  };

  const handleHeightChange = (h: number) => {
    setCustomHeight(h);
    if (lockAspect && naturalSize.height > 0) {
      setCustomWidth(Math.round(h * naturalSize.width / naturalSize.height));
    }
  };

  const getTargetDimensions = () => {
    if (resizeMode === "dimensions") return { width: customWidth, height: customHeight };
    if (resizeMode === "percentage") return { 
      width: Math.round(naturalSize.width * scalePercent / 100), 
      height: Math.round(naturalSize.height * scalePercent / 100) 
    };
    return null;
  };

  const handleOptimization = async () => {
    try {
      setIsProcessing(true);
      
      let blob: any = activeImage.workingUrl === activeImage.originalUrl 
        ? activeImage.file 
        : await (await fetch(activeImage.workingUrl)).blob();

      const target = getTargetDimensions();
      if (target && target.width > 0 && target.height > 0) {
        const bitmap = await createImageBitmap(blob);
        const canvas = document.createElement("canvas");
        canvas.width = target.width;
        canvas.height = target.height;
        const ctx = canvas.getContext("2d");
        if (ctx) ctx.drawImage(bitmap, 0, 0, target.width, target.height);
        blob = await new Promise<Blob>((resolve) => {
          canvas.toBlob((b) => resolve(b as Blob), format, quality);
        });
      }

      const options = {
        maxSizeMB: maxSize,
        maxWidthOrHeight: target ? Math.max(target.width, target.height) : 2560,
        useWebWorker: true,
        initialQuality: quality,
        fileType: format,
        onProgress: (val: number) => setProgress(val),
      };

      const imageCompression = (await import("browser-image-compression")).default;
      const compressedBlob = await imageCompression(blob as File, options);
      
      const dims = target ? `${target.width}×${target.height} ` : '';
      applyProcessedImage(activeImage.id, compressedBlob, "optimizer", `${dims}${format.split('/')[1].toUpperCase()} (${formatBytes(compressedBlob.size)})`);
    } catch (error) {
      console.error("Optimization failed:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-7">

      {/* Output Format */}
      <div className="space-y-3">
         <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500">Output Format</span>
         <div className="grid grid-cols-5 gap-1">
            {[
              { id: "webp", label: "WEBP" },
              { id: "jpeg", label: "JPEG" },
              { id: "png", label: "PNG" },
              { id: "bmp", label: "BMP" },
              { id: "gif", label: "GIF" },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFormat(`image/${f.id}`)}
                className={`py-2.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all border text-center
                  ${format === `image/${f.id}` 
                    ? "bg-uiupc-orange border-uiupc-orange text-white shadow-md shadow-uiupc-orange/20" 
                    : "bg-white dark:bg-zinc-900 border-black/10 dark:border-white/10 text-zinc-500 hover:border-uiupc-orange/40 hover:text-zinc-700 dark:hover:text-zinc-300"}`}
              >
                {f.label}
              </button>
            ))}
         </div>
      </div>

      {/* Quality */}
      {!isLossless && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500">Quality</span>
            <span className="text-xs font-black text-uiupc-orange font-mono tabular-nums">{Math.round(quality * 100)}%</span>
          </div>
          <div className="relative">
            <input 
              type="range" min="0.1" max="1" step="0.05"
              value={quality}
              onChange={(e) => setQuality(Number(e.target.value))}
              className="w-full accent-uiupc-orange h-1.5 bg-black/5 dark:bg-white/5 rounded-full appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-[7px] text-zinc-400 mt-1 font-mono">
              <span>Low</span><span>High</span>
            </div>
          </div>
        </div>
      )}

      {/* Max Size */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500">Max File Size</span>
          <span className="text-xs font-black text-uiupc-orange font-mono tabular-nums">{maxSize} MB</span>
        </div>
        <div className="relative">
          <input 
            type="range" min="0.5" max="10" step="0.5"
            value={maxSize}
            onChange={(e) => setMaxSize(Number(e.target.value))}
            className="w-full accent-uiupc-orange h-1.5 bg-black/5 dark:bg-white/5 rounded-full appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-[7px] text-zinc-400 mt-1 font-mono">
            <span>0.5</span><span>10</span>
          </div>
        </div>
      </div>

      {/* Estimated Output */}
      <div className="flex items-center justify-between p-3.5 rounded-xl bg-uiupc-orange/5 border border-uiupc-orange/15">
        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-uiupc-orange/70">Est. Output</span>
        <span className="text-sm font-black text-uiupc-orange font-mono tabular-nums">{formatBytes(estimatedSize)}</span>
      </div>

      {/* Resize Engine */}
      <div className="space-y-4 pt-5 border-t border-black/5 dark:border-white/5">
        <div className="flex items-center gap-2">
           <IconExpandArrows size={10} className="text-uiupc-orange" />
           <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500">Resize</span>
           {naturalSize.width > 0 && (
             <span className="text-[8px] font-mono text-zinc-400 ml-auto">{naturalSize.width}×{naturalSize.height}</span>
           )}
        </div>

        <div className="grid grid-cols-3 gap-1.5">
           {RESIZE_MODES.map((mode) => (
             <button
               key={mode.id}
               onClick={() => setResizeMode(mode.id)}
               className={`py-2.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all border text-center
                 ${resizeMode === mode.id 
                   ? "bg-uiupc-orange border-uiupc-orange text-white shadow-md shadow-uiupc-orange/20" 
                   : "bg-white dark:bg-zinc-900 border-black/10 dark:border-white/10 text-zinc-500 hover:border-uiupc-orange/40"}`}
             >
               {mode.label}
             </button>
           ))}
        </div>

        {/* Custom Dimensions */}
        {resizeMode === "dimensions" && (
          <div className="space-y-3">
             <button 
               onClick={() => setLockAspect(!lockAspect)}
               className="flex items-center gap-2 text-[8px] font-black uppercase tracking-[0.2em] text-zinc-400 hover:text-uiupc-orange transition-colors"
             >
               {lockAspect ? <IconLock size={9} className="text-uiupc-orange" /> : <IconLockOpen size={9} />}
               {lockAspect ? "Aspect Locked" : "Aspect Free"}
             </button>

             <div className="grid grid-cols-2 gap-2">
               <div>
                 <p className="text-[8px] font-black uppercase tracking-[0.15em] text-zinc-400 mb-1.5 flex items-center gap-1">
                   <IconRulerCombined size={7} /> W
                 </p>
                 <input 
                   type="number" 
                   value={customWidth || ""}
                   onChange={(e) => handleWidthChange(Number(e.target.value))}
                   placeholder="px"
                   className="w-full p-3 rounded-lg bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/10 text-[11px] font-mono outline-none focus:border-uiupc-orange transition-colors placeholder:text-zinc-400"
                 />
               </div>
               <div>
                 <p className="text-[8px] font-black uppercase tracking-[0.15em] text-zinc-400 mb-1.5 flex items-center gap-1">
                   <IconRulerCombined size={7} /> H
                 </p>
                 <input 
                   type="number" 
                   value={customHeight || ""}
                   onChange={(e) => handleHeightChange(Number(e.target.value))}
                   placeholder="px"
                   className="w-full p-3 rounded-lg bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/10 text-[11px] font-mono outline-none focus:border-uiupc-orange transition-colors placeholder:text-zinc-400"
                 />
               </div>
             </div>
          </div>
        )}

        {/* Percentage Scaling */}
        {resizeMode === "percentage" && (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500 flex items-center gap-1.5"><IconPercentage size={8} /> Scale</span>
              <span className="text-xs font-black text-uiupc-orange font-mono tabular-nums">{scalePercent}%</span>
            </div>
            <input 
              type="range" min={10} max={200} step={5}
              value={scalePercent}
              onChange={(e) => setScalePercent(Number(e.target.value))}
              className="w-full accent-uiupc-orange h-1.5 bg-black/5 dark:bg-white/5 rounded-full appearance-none cursor-pointer"
            />
            {naturalSize.width > 0 && (
              <p className="text-[8px] text-zinc-400 font-mono text-center">
                → {Math.round(naturalSize.width * scalePercent / 100)} × {Math.round(naturalSize.height * scalePercent / 100)}
              </p>
            )}
          </div>
        )}
      </div>

      <button 
        onClick={handleOptimization}
        disabled={isProcessing}
        className="w-full py-4 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-black text-[10px] font-black uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-95 transition-all shadow-xl disabled:opacity-50 flex items-center justify-center gap-3"
      >
        {isProcessing ? `Processing... ${Math.round(progress)}%` : <><IconCheckCircle size={14} /> Apply Transform</>}
      </button>
    </div>
  );
};

export default OptimizerTool;
