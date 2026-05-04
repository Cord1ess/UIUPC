"use client";

import React, { useState, useRef, useEffect } from "react";
import { useStudioStore } from "@/store/useStudioStore";
import { IconLayerGroup, IconCheckCircle, IconArrowsAltV, IconArrowsAltH, IconTrash } from "@/components/shared/Icons";
import { WorkerMessage } from "@/workers/imageWorker";

const StitcherTool: React.FC = () => {
  const { images, applyProcessedImage } = useStudioStore();
  const [selectedImageIds, setSelectedImageIds] = useState<string[]>([]);
  const [direction, setDirection] = useState<"vertical" | "horizontal">("vertical");
  const [isProcessing, setIsProcessing] = useState(false);
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    workerRef.current = new Worker(new URL("@/workers/imageWorker.ts", import.meta.url));
    // Auto-select all images initially if none selected
    if (images.length > 1 && selectedImageIds.length === 0) {
      setSelectedImageIds(images.map(img => img.id));
    }
    return () => workerRef.current?.terminate();
  }, [images]);

  if (images.length < 2) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 opacity-50">
        <IconLayerGroup size={40} className="text-zinc-500" />
        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
          Stitcher requires at least 2 images.
        </p>
      </div>
    );
  }

  const toggleImage = (id: string) => {
    if (selectedImageIds.includes(id)) {
      setSelectedImageIds(selectedImageIds.filter(i => i !== id));
    } else {
      setSelectedImageIds([...selectedImageIds, id]);
    }
  };

  const selectedImages = selectedImageIds.map(id => images.find(img => img.id === id)).filter(Boolean) as typeof images;

  const handleApply = async () => {
    if (selectedImages.length < 2) return;
    setIsProcessing(true);
    try {
      if (workerRef.current) {
        // Fetch blobs for all selected images
        const blobPromises = selectedImages.map(async (img) => {
           const res = await fetch(img.workingUrl);
           return await res.blob();
        });
        const blobs = await Promise.all(blobPromises);

        workerRef.current.onmessage = async (e: MessageEvent) => {
          if (e.data.type === 'SUCCESS') {
            // Apply it as a new generation strictly on the first selected image ID 
            // Or maybe output to the active image? Let's just update the first selected image.
            const targetId = selectedImages[0].id;
            applyProcessedImage(targetId, e.data.resultBlob, "stitcher", `Stitched ${selectedImages.length} Images`);
            setIsProcessing(false);
          } else if (e.data.type === 'ERROR') {
            console.error(e.data.error);
            setIsProcessing(false);
          }
        };

        workerRef.current.postMessage({
          type: 'PROCESS_STITCH',
          payload: { blobs, direction }
        });
      }
    } catch (e) {
      console.error(e);
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <p className="text-[10px] font-sans text-zinc-500 uppercase tracking-widest leading-relaxed">
        Select loaded matrices from your queue to stitch them into a seamless panorama or document scroll.
      </p>

      {/* Direction Selection */}
      <div className="grid grid-cols-2 gap-2">
         <button
           onClick={() => setDirection("vertical")}
           className={`py-4 flex items-center justify-center gap-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border
             ${direction === "vertical"
               ? "bg-zinc-900 dark:bg-white text-white dark:text-black border-zinc-900 dark:border-white" 
               : "bg-black/5 dark:bg-white/5 border-black/5 dark:border-white/5 text-zinc-500 hover:text-zinc-600"}`}
         >
           <IconArrowsAltV size={14} /> Vertical
         </button>
         <button
           onClick={() => setDirection("horizontal")}
           className={`py-4 flex items-center justify-center gap-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border
             ${direction === "horizontal"
               ? "bg-zinc-900 dark:bg-white text-white dark:text-black border-zinc-900 dark:border-white" 
               : "bg-black/5 dark:bg-white/5 border-black/5 dark:border-white/5 text-zinc-500 hover:text-zinc-600"}`}
         >
           <IconArrowsAltH size={14} /> Horizontal
         </button>
      </div>

      {/* Image Flow Builder */}
      <div className="space-y-4 pt-4 border-t border-black/5 dark:border-white/5">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 dark:text-zinc-400">Queue Constructor</span>
        
        <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
           {images.map((img, index) => {
              const isSelected = selectedImageIds.includes(img.id);
              const orderIndex = selectedImageIds.indexOf(img.id) + 1;
              return (
                <div 
                  key={img.id}
                  onClick={() => toggleImage(img.id)}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer
                    ${isSelected ? 'bg-uiupc-orange/10 border-uiupc-orange' : 'bg-black/5 dark:bg-white/5 border-black/5 dark:border-white/5'}`}
                >
                   <div className="flex items-center gap-3">
                      <img src={img.workingUrl} className="w-10 h-10 object-cover rounded-lg" />
                      <div className="flex flex-col">
                         <span className={`text-[10px] font-bold font-mono ${isSelected ? 'text-uiupc-orange' : 'text-zinc-500'}`}>
                           IMG_{index}
                         </span>
                         <span className="text-[8px] text-zinc-500 uppercase">
                           {(img.file.size / 1024).toFixed(1)} KB
                         </span>
                      </div>
                   </div>
                   
                   {isSelected && (
                     <div className="w-6 h-6 rounded bg-uiupc-orange text-white flex items-center justify-center text-[10px] font-black shadow-md">
                        {orderIndex}
                     </div>
                   )}
                </div>
              );
           })}
        </div>
      </div>

      <button 
        onClick={handleApply}
        disabled={isProcessing || selectedImageIds.length < 2}
        className="w-full py-5 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-black text-xs font-black uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-95 transition-all shadow-xl disabled:opacity-50 flex items-center justify-center gap-3"
      >
        {isProcessing ? "Stitching Blocks..." : <><IconCheckCircle size={14} /> Fuse Selected ({selectedImageIds.length})</>}
      </button>

      <p className="text-[8px] text-zinc-400 uppercase tracking-widest text-center mt-2">Outputs fused image directly into first matrix</p>
    </div>
  );
};

export default StitcherTool;
