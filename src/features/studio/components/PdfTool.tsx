"use client";

import React, { useState } from "react";
import { useStudioStore } from "@/store/useStudioStore";
import { FaFilePdf, FaCheckCircle, FaDownload, FaFileImage } from "react-icons/fa";
import jsPDF from "jspdf";
import { bakeImageToCanvas } from "@/lib/bakeEngine";

const PdfTool: React.FC = () => {
  const { images } = useStudioStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [format, setFormat] = useState<"a4" | "original">("a4");

  if (images.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 opacity-50">
        <FaFilePdf className="text-4xl text-zinc-500" />
        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
          No images in your Studio loop.
        </p>
      </div>
    );
  }

  const handleApply = async () => {
    setIsProcessing(true);
    try {
      const pdf = new jsPDF({
        orientation: "portrait", 
        unit: "px",
        format: format === "a4" ? "a4" : undefined // if original, we set dynamically below
      });

      for (let i = 0; i < images.length; i++) {
        const imgObj = images[i];
        
        // Bake image with all edits
        const bakedCanvas = await bakeImageToCanvas(imgObj);
        const imgData = bakedCanvas.toDataURL("image/jpeg", 0.95);
        const imgWidth = bakedCanvas.width;
        const imgHeight = bakedCanvas.height;

        if (format === "a4") {
           if (i > 0) pdf.addPage("a4", "portrait");
           
           // A4 size in px (at 72 dpi) is approx 595 x 842
           const pageWidth = pdf.internal.pageSize.getWidth();
           const pageHeight = pdf.internal.pageSize.getHeight();
           
           const ratio = Math.min(pageWidth / imgWidth, pageHeight / imgHeight);
           const drawWidth = imgWidth * ratio;
           const drawHeight = imgHeight * ratio;
           const startX = (pageWidth - drawWidth) / 2;
           const startY = (pageHeight - drawHeight) / 2;

           pdf.addImage(imgData, "JPEG", startX, startY, drawWidth, drawHeight);
        } else {
           if (i > 0) pdf.addPage([imgWidth, imgHeight], imgWidth > imgHeight ? "landscape" : "portrait");
           else {
               // Fix first page dimension manually if "original"
               pdf.deletePage(1);
               pdf.addPage([imgWidth, imgHeight], imgWidth > imgHeight ? "landscape" : "portrait");
           }
           pdf.addImage(imgData, "JPEG", 0, 0, imgWidth, imgHeight);
        }
      }

      pdf.save("uiupc_studio_export.pdf");
      setIsProcessing(false);
    } catch (e) {
      console.error(e);
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3 text-zinc-400">
         <FaFilePdf className="text-uiupc-orange" />
         <span className="text-[10px] font-black uppercase tracking-[0.2em]">PDF Document Compiler</span>
      </div>

      <p className="text-[10px] font-sans text-zinc-500 uppercase tracking-widest leading-relaxed">
        Converts your entire Studio image queue into a sequenced, high-quality .pdf document.
      </p>

      {/* Settings */}
      <div className="space-y-4 pt-4 border-t border-black/5 dark:border-white/5">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 dark:text-zinc-400">Page Layout</span>
        
        <div className="grid grid-cols-2 gap-2">
           <button
             onClick={() => setFormat("a4")}
             className={`py-4 flex items-center justify-center gap-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border
               ${format === "a4"
                 ? "bg-zinc-900 dark:bg-white text-white dark:text-black border-zinc-900 dark:border-white" 
                 : "bg-black/5 dark:bg-white/5 border-black/5 dark:border-white/5 text-zinc-500 hover:text-zinc-600"}`}
           >
             <FaFileImage /> A4 (Padded)
           </button>
           <button
             onClick={() => setFormat("original")}
             className={`py-4 flex items-center justify-center gap-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border
               ${format === "original"
                 ? "bg-zinc-900 dark:bg-white text-white dark:text-black border-zinc-900 dark:border-white" 
                 : "bg-black/5 dark:bg-white/5 border-black/5 dark:border-white/5 text-zinc-500 hover:text-zinc-600"}`}
           >
             Raw (No Crop)
           </button>
        </div>
      </div>

      <div className="py-6 rounded-2xl bg-black/5 dark:bg-white/5 border border-dashed border-black/10 dark:border-white/10 flex flex-col items-center justify-center gap-1">
         <span className="text-2xl font-black text-zinc-800 dark:text-zinc-200 font-mono">{images.length}</span>
         <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">PDF Pages Scheduled</span>
      </div>

      <button 
        onClick={handleApply}
        disabled={isProcessing}
        className="w-full py-5 rounded-2xl bg-red-500 text-white text-xs font-black uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-red-500/20 disabled:opacity-50 flex items-center justify-center gap-3"
      >
        {isProcessing ? "Compiling Document..." : <><FaDownload /> Download PDF</>}
      </button>
    </div>
  );
};

export default PdfTool;
