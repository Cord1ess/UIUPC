"use client";

import React, { useState, useEffect } from "react";
import { useStudioStore } from "@/store/useStudioStore";
import { FaTimes, FaDownload, FaArchive, FaListUl, FaCog, FaImages, FaSlidersH } from "react-icons/fa";
import JSZip from "jszip";
import ExhibitionBuilder from "./ExhibitionBuilder";
import { createPortal } from "react-dom";
// @ts-ignore
import UTIF from "utif";
import { GifWriter } from "omggif";
import { bakeImageToCanvas } from "@/lib/bakeEngine";

const LOSSLESS_FORMATS = ["image/png", "image/bmp", "image/gif", "image/tiff"];

interface ExportModalProps {
  onClose: () => void;
}

const ExportModal: React.FC<ExportModalProps> = ({ onClose }) => {
  const { images, activeImageId } = useStudioStore();
  const [activeTab, setActiveTab] = useState<"standard" | "exhibition">("standard");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Shared Output Settings (used by both Standard + Exhibition)
  const [format, setFormat] = useState<string>("image/jpeg");
  const [quality, setQuality] = useState<number>(0.92);
  const [maxSize, setMaxSize] = useState<number>(10);
  const [isProcessing, setIsProcessing] = useState(false);
  const [totalSize, setTotalSize] = useState<number>(0);
  const [processingProgress, setProcessingProgress] = useState({ current: 0, total: 0 });

  const isLossless = LOSSLESS_FORMATS.includes(format);

  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  useEffect(() => {
    const calc = async () => {
      let sum = 0;
      for (const img of images) {
        try {
          const res = await fetch(img.workingUrl);
          const blob = await res.blob();
          sum += blob.size;
        } catch (e) { sum += img.originalSize; }
      }
      setTotalSize(sum);
    };
    calc();
  }, [images]);

  const getExtension = (mime: string) => {
     if (mime === "image/png") return "png";
     if (mime === "image/webp") return "webp";
     if (mime === "image/bmp") return "bmp";
     if (mime === "image/gif") return "gif";
     if (mime === "image/tiff") return "tiff";
     if (mime === "image/avif") return "avif";
     if (mime === "image/heic") return "heic";
     return "jpg";
  };

  const convertBlob = async (img: any, targetMime: string, targetQuality: number): Promise<Blob> => {
     const canvas = await bakeImageToCanvas(img);
     const ctx = canvas.getContext("2d");
     if (!ctx) throw new Error("Canvas context failed");
     
     const exportWidth = canvas.width;
     const exportHeight = canvas.height;

     if (targetMime === "image/gif") {
        const imgData = ctx.getImageData(0, 0, exportWidth, exportHeight).data;
        const { palette, indices } = generatePaletteAndIndices(imgData);
        const buffer = new Uint8Array(exportWidth * exportHeight * 4 + 1024); 
        const gifWriter = new GifWriter(buffer as any, exportWidth, exportHeight, { loop: 0 });
        gifWriter.addFrame(0, 0, exportWidth, exportHeight, indices as any, { palette: palette as any });
        return new Blob([buffer.subarray(0, gifWriter.end())], { type: "image/gif" });
     }

     if (targetMime === "image/tiff") {
        const imgData = ctx.getImageData(0, 0, exportWidth, exportHeight).data;
        const outBuffer = UTIF.encodeImage(imgData, exportWidth, exportHeight);
        return new Blob([outBuffer], { type: "image/tiff" });
     }

     return new Promise((resolve) => {
        canvas.toBlob((b) => resolve(b as Blob), targetMime, targetQuality);
     });
  };

  // Helper for GIF (Naive 256 color quantization)
  const generatePaletteAndIndices = (rgba: Uint8ClampedArray) => {
    const palette = new Int32Array(256);
    const indices = new Uint8Array(rgba.length / 4);
    
    // Create a simple palette by sampling or using a fixed grid
    // For now, we'll use a simple 6x6x6 color cube + some greys for a decent fallback
    for (let i = 0; i < 216; i++) {
      const r = Math.floor(i / 36) * 51;
      const g = (Math.floor(i / 6) % 6) * 51;
      const b = (i % 6) * 51;
      palette[i] = (r << 16) | (g << 8) | b;
    }
    for (let i = 216; i < 256; i++) {
        const grey = (i - 216) * 6;
        palette[i] = (grey << 16) | (grey << 8) | grey;
    }

    // Map each pixel to the nearest color in our fixed palette
    for (let i = 0; i < indices.length; i++) {
      const r = rgba[i * 4];
      const g = rgba[i * 4 + 1];
      const b = rgba[i * 4 + 2];
      
      // Fast mapping to 6x6x6 cube
      const ri = Math.round(r / 51);
      const gi = Math.round(g / 51);
      const bi = Math.round(b / 51);
      indices[i] = ri * 36 + gi * 6 + bi;
    }

    return { palette, indices };
  };

  const handleDownloadSingle = async () => {
    const activeImage = images.find((i) => i.id === activeImageId);
    if (!activeImage) return;

    setIsProcessing(true);
    const convertedBlob = await convertBlob(activeImage, format, quality);
    const url = URL.createObjectURL(convertedBlob);
    
    const a = document.createElement("a");
    a.href = url;
    a.download = `uiupc_export_${Date.now()}.${getExtension(format)}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setIsProcessing(false);
  };

  const handleDownloadBatch = async () => {
     setIsProcessing(true);
     for (let i = 0; i < images.length; i++) {
        const img = images[i];
        const convertedBlob = await convertBlob(img, format, quality);
        const url = URL.createObjectURL(convertedBlob);
        
        const a = document.createElement("a");
        a.href = url;
        a.download = `uiupc_export_${i + 1}_${Date.now()}.${getExtension(format)}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        // Small delay so browser doesn't block multiple downloads
        await new Promise(r => setTimeout(r, 300));
     }
     setIsProcessing(false);
  };

  const handleZipAll = async () => {
     setIsProcessing(true);
     const zip = new JSZip();
     const extension = getExtension(format);
     const folder = zip.folder(`UIUPC_Studio_Export_${Date.now()}`);

     for (let i = 0; i < images.length; i++) {
        const img = images[i];
        const convertedBlob = await convertBlob(img, format, quality);
        folder?.file(`uiupc_export_${(i + 1).toString().padStart(3, '0')}.${extension}`, convertedBlob);
     }

     const zipBlob = await zip.generateAsync({ type: "blob" });
     const zipUrl = URL.createObjectURL(zipBlob);
     const a = document.createElement("a");
     a.href = zipUrl;
     a.download = `UIUPC_Studio_Batch.zip`;
     document.body.appendChild(a);
     a.click();
     document.body.removeChild(a);
     URL.revokeObjectURL(zipUrl);
     setIsProcessing(false);
  };

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-black/80 flex items-center justify-center p-4 sm:p-8" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
      <div className="bg-white dark:bg-zinc-950 w-full max-w-4xl max-h-full rounded-3xl shadow-[0_30px_100px_rgba(0,0,0,0.5)] border border-black/10 dark:border-white/10 overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-black/5 dark:border-white/5 bg-zinc-50 dark:bg-zinc-900/50">
           <div className="flex items-center gap-4">
              <div className="p-3 bg-uiupc-orange/10 text-uiupc-orange rounded-xl">
                 <FaDownload className="text-xl" />
              </div>
              <div>
                 <h2 className="text-xl font-black uppercase tracking-tighter text-zinc-900 dark:text-white leading-none">Export Hub</h2>
                 <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">Output configurations and delivery</p>
              </div>
           </div>
           
           <button onClick={onClose} className="p-3 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
             <FaTimes className="text-zinc-500" />
           </button>
        </div>

        {/* Shared Output Settings Bar */}
        <div className="px-6 py-4 border-b border-black/5 dark:border-white/5 bg-zinc-50/50 dark:bg-zinc-900/30 space-y-4">
          <div className="flex items-center gap-2 mb-3">
            <FaSlidersH className="text-[10px] text-zinc-400" />
            <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Output Settings</span>
          </div>

          {/* Format Row */}
          <div className="flex items-center gap-3">
            <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500 w-16 flex-shrink-0">Format</span>
            <div className="flex items-center gap-1.5 flex-1 flex-wrap">
              {["image/jpeg", "image/png", "image/webp", "image/bmp", "image/gif", "image/tiff", "image/avif", "image/heic"].map((fmt) => (
                <button 
                  key={fmt}
                  onClick={() => setFormat(fmt)}
                  className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all
                    ${format === fmt ? "border-uiupc-orange text-uiupc-orange bg-uiupc-orange/5" : "border-black/5 dark:border-white/5 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"}`}
                >
                   {fmt.replace("image/", "")}
                </button>
              ))}
            </div>
          </div>

          {/* Quality + Max Size Row (only for lossy) */}
          {!isLossless && (
            <div className="flex items-center gap-6">
              <div className="flex-1">
                <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-2">
                  <span>Quality</span>
                  <span className="text-uiupc-orange">{Math.round(quality * 100)}%</span>
                </div>
                <input 
                  type="range" min={0.1} max={1} step={0.01}
                  value={quality}
                  onChange={(e) => setQuality(Number(e.target.value))}
                  className="w-full accent-uiupc-orange h-1 bg-black/5 dark:bg-white/5 rounded-full appearance-none cursor-pointer"
                />
              </div>
              <div className="flex-1">
                <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-2">
                  <span>Max Size</span>
                  <span className="text-uiupc-orange">{maxSize} MB</span>
                </div>
                <input 
                  type="range" min={0.5} max={10} step={0.5}
                  value={maxSize}
                  onChange={(e) => setMaxSize(Number(e.target.value))}
                  className="w-full accent-uiupc-orange h-1 bg-black/5 dark:bg-white/5 rounded-full appearance-none cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* Estimated Size */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Estimated Total</span>
            <span className="text-sm font-black text-uiupc-orange font-mono">
              {formatBytes(totalSize * (isLossless ? 1 : quality))}
              <span className="text-[9px] text-zinc-500 font-sans font-normal ml-2">({images.length} files)</span>
            </span>
          </div>
        </div>

        {/* Tab System */}
        <div className="flex items-center gap-2 px-6 pt-4 pb-0">
           <button 
             onClick={() => setActiveTab("standard")}
             className={`px-6 py-3 rounded-t-xl text-xs font-black uppercase tracking-widest transition-all
               ${activeTab === "standard" ? "bg-black/5 dark:bg-white/5 text-zinc-900 dark:text-white border-t border-x border-black/5 dark:border-white/5" : "text-zinc-400 hover:text-zinc-600"}`}
           >
             <div className="flex items-center gap-2"><FaCog /> Standard Pipeline</div>
           </button>
           <button 
             onClick={() => setActiveTab("exhibition")}
             className={`px-6 py-3 rounded-t-xl text-xs font-black uppercase tracking-widest transition-all
               ${activeTab === "exhibition" ? "bg-uiupc-orange/10 text-uiupc-orange border-t border-x border-uiupc-orange/20" : "text-zinc-400 hover:text-zinc-600"}`}
           >
             <div className="flex items-center gap-2"><FaListUl /> Exhibition Mode</div>
           </button>
        </div>

        {/* Dynamic Body */}
        <div className="p-6 flex-1 overflow-y-auto bg-white dark:bg-zinc-950 border-t-0 rounded-b-3xl">
           
           {activeTab === "standard" && (
             <div className="max-w-2xl mx-auto space-y-8 py-6">
                
                {/* Delivery Mechanics */}
                <div className="space-y-4">
                   <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-4">Delivery Systems</h3>
                   
                   <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      
                      <button 
                        onClick={handleDownloadSingle}
                        disabled={isProcessing}
                        className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-all disabled:opacity-50"
                      >
                         <FaDownload className="text-2xl text-zinc-400" />
                         <span className="text-[10px] font-black uppercase tracking-widest">Active Only</span>
                      </button>

                      <button 
                        onClick={handleDownloadBatch}
                        disabled={isProcessing}
                        className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-all disabled:opacity-50"
                      >
                         <FaImages className="text-2xl text-zinc-400" />
                         <span className="text-[10px] font-black uppercase tracking-widest text-center mt-auto">Batch Output<br/>(<span className="text-uiupc-orange">{images.length} files</span>)</span>
                      </button>

                      <button 
                        onClick={handleZipAll}
                        disabled={isProcessing}
                        className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl bg-uiupc-orange text-white hover:scale-105 active:scale-95 shadow-[0_10px_30px_rgba(255,107,0,0.3)] transition-all disabled:opacity-50"
                      >
                         <FaArchive className="text-2xl" />
                         <span className="text-[10px] font-black uppercase tracking-widest text-center mt-auto">Package ZIP<br/><span className="opacity-80">{images.length} files</span></span>
                      </button>

                   </div>
                </div>

             </div>
           )}

           {activeTab === "exhibition" && (
             <ExhibitionBuilder 
               convertBlob={async (img: any, mime: string, qual: number) => convertBlob(img, mime, qual)}
               getExtension={getExtension}
               format={format}
               quality={quality}
               formatBytes={formatBytes}
             />
           )}

        </div>
      </div>
    </div>,
    document.body
  );
};

export default ExportModal;
