"use client";

import React, { useState, useRef, useEffect } from "react";
import { useStudioStore } from "@/store/useStudioStore";
import { FaBorderAll, FaCheckCircle, FaMinus, FaPlus, FaGripHorizontal } from "react-icons/fa";
import { WorkerMessage } from "@/workers/imageWorker";

const CollageTool: React.FC = () => {
  const { images, applyProcessedImage } = useStudioStore();
  const [selectedImageIds, setSelectedImageIds] = useState<string[]>([]);
  const [columns, setColumns] = useState<number>(2);
  const [spacing, setSpacing] = useState<number>(20);
  const [isProcessing, setIsProcessing] = useState(false);
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    workerRef.current = new Worker(new URL("@/workers/imageWorker.ts", import.meta.url));
    if (images.length > 1 && selectedImageIds.length === 0) {
      setSelectedImageIds(images.map(img => img.id));
    }
    return () => workerRef.current?.terminate();
  }, [images]);

  if (images.length < 2) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 opacity-50">
        <FaBorderAll className="text-4xl text-zinc-500" />
        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
          Collage requires at least 2 images.
        </p>
      </div>
    );
  }

  const toggleImage = (id: string) => {
    if (selectedImageIds.includes(id)) setSelectedImageIds(selectedImageIds.filter(i => i !== id));
    else setSelectedImageIds([...selectedImageIds, id]);
  };

  const selectedImages = selectedImageIds.map(id => images.find(img => img.id === id)).filter(Boolean) as typeof images;

  const handleApply = async () => {
    if (selectedImages.length < 2) return;
    setIsProcessing(true);
    try {
      if (workerRef.current) {
        const blobPromises = selectedImages.map(async (img) => {
           const res = await fetch(img.workingUrl);
           return await res.blob();
        });
        const blobs = await Promise.all(blobPromises);

        workerRef.current.onmessage = async (e: MessageEvent) => {
          if (e.data.type === 'SUCCESS') {
            const targetId = selectedImages[0].id;
            applyProcessedImage(targetId, e.data.resultBlob, "collage", `Collage Matrix (${columns} cols)`);
            setIsProcessing(false);
          } else if (e.data.type === 'ERROR') {
            console.error(e.data.error);
            setIsProcessing(false);
          }
        };

        workerRef.current.postMessage({
          type: 'PROCESS_COLLAGE',
          payload: { blobs, columns, spacing }
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
        Assemble selected images firmly into an algorithmic grid matrix.
      </p>

      {/* Controller Parameters */}
      <div className="space-y-6 pt-4 border-t border-black/5 dark:border-white/5">
         
         <div className="space-y-4">
            <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
               <span className="flex items-center gap-2"><FaGripHorizontal /> Columns</span>
               <div className="flex items-center gap-3">
                  <button onClick={() => setColumns(Math.max(1, columns - 1))} className="text-zinc-400 hover:text-uiupc-orange"><FaMinus className="text-[8px]"/></button>
                  <span className="text-uiupc-orange text-xs text-center w-4">{columns}</span>
                  <button onClick={() => setColumns(Math.min(10, columns + 1))} className="text-zinc-400 hover:text-uiupc-orange"><FaPlus className="text-[8px]" /></button>
               </div>
            </div>
         </div>

         <div className="space-y-4">
            <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
               <span>Spacing Vector</span>
               <span className="text-uiupc-orange text-xs">{spacing}px</span>
            </div>
            <input 
               type="range" min={0} max={100} step={5}
               value={spacing}
               onChange={(e) => setSpacing(Number(e.target.value))}
               className="w-full accent-uiupc-orange h-1.5 bg-black/5 dark:bg-white/5 rounded-full appearance-none cursor-pointer"
            />
         </div>
      </div>

      {/* Assembly List */}
      <div className="flex flex-col gap-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
         {images.map((img, index) => {
            const isSelected = selectedImageIds.includes(img.id);
            return (
              <div 
                key={img.id}
                onClick={() => toggleImage(img.id)}
                className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer
                  ${isSelected ? 'bg-uiupc-orange/10 border-uiupc-orange' : 'bg-black/5 dark:bg-white/5 border-black/5 dark:border-white/5'}`}
              >
                 <div className="flex items-center gap-3">
                    <img src={img.workingUrl} className="w-8 h-8 object-cover rounded-lg" />
                    <span className={`text-[9px] font-bold font-mono ${isSelected ? 'text-uiupc-orange' : 'text-zinc-500'}`}>IMG_{index}</span>
                 </div>
              </div>
            );
         })}
      </div>

      <button 
        onClick={handleApply}
        disabled={isProcessing || selectedImageIds.length < 2}
        className="w-full py-5 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-black text-xs font-black uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-95 transition-all shadow-xl disabled:opacity-50 flex items-center justify-center gap-3"
      >
        {isProcessing ? "Assembling Grid..." : <><FaCheckCircle /> Assemble Matrix</>}
      </button>
    </div>
  );
};

export default CollageTool;
