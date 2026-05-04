"use client";

import React, { useState, useRef, useEffect } from "react";
import { useStudioStore } from "@/store/useStudioStore";
import { IconTh, IconCheckCircle, IconDownload, IconColumns, IconGripHorizontal } from "@/components/shared/Icons";
import { bakeImageToCanvas } from "@/lib/bakeEngine";

const PRESET_GRIDS = [
  { id: "2x2", cols: 2, rows: 2, label: "2×2 Grid" },
  { id: "3x3", cols: 3, rows: 3, label: "3×3 Grid" },
  { id: "4x4", cols: 4, rows: 4, label: "4×4 Grid" },
  { id: "3x1", cols: 3, rows: 1, label: "Panorama (3x1)" },
];

const SplitterTool: React.FC = () => {
  const { images, activeImageId } = useStudioStore();
  const activeImage = images.find((img) => img.id === activeImageId);

  const [cols, setCols] = useState(3);
  const [rows, setRows] = useState(3);
  const [isProcessing, setIsProcessing] = useState(false);
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    workerRef.current = new Worker(new URL("@/workers/imageWorker.ts", import.meta.url));
    return () => workerRef.current?.terminate();
  }, []);

  if (!activeImage) return null;

  const handleApply = async () => {
    setIsProcessing(true);
    try {
      if (workerRef.current) {
        const bakedCanvas = await bakeImageToCanvas(activeImage);
        const blob = await new Promise<Blob>((resolve) => {
           bakedCanvas.toBlob((b) => resolve(b!), "image/jpeg", 0.95);
        });

        workerRef.current.onmessage = async (e: MessageEvent) => {
          if (e.data.type === 'SUCCESS') {
            const slices: { x: number, y: number, blob: Blob }[] = e.data.slices;
            
            // Build ZIP
            const JSZip = (await import("jszip")).default;
            const zip = new JSZip();
            const folder = zip.folder(`split_${activeImage.file.name}`);
            
            slices.forEach((slice) => {
               // Pad numbers for proper OS sorting
               const name = `slice_col${slice.x + 1}_row${slice.y + 1}.jpg`;
               folder?.file(name, slice.blob);
            });

            const zipBlob = await zip.generateAsync({ type: "blob" });
            const zipUrl = URL.createObjectURL(zipBlob);
            
            const a = document.createElement("a");
            a.href = zipUrl;
            a.download = `uiupc_split_${activeImage.file.name}.zip`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(zipUrl);

            setIsProcessing(false);
          } else if (e.data.type === 'ERROR') {
            console.error(e.data.error);
            setIsProcessing(false);
          }
        };

        workerRef.current.postMessage({
          type: 'PROCESS_SPLIT',
          payload: { blob, columns: cols, rows: rows }
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
        Mathematically slice the current image into an exact matrix grid. Outputs a neat ZIP file.
      </p>

      {/* Basic Presets */}
      <div className="grid grid-cols-2 gap-2">
         {PRESET_GRIDS.map((preset) => (
           <button
             key={preset.id}
             onClick={() => { setCols(preset.cols); setRows(preset.rows); }}
             className={`py-4 flex items-center justify-center gap-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border
               ${cols === preset.cols && rows === preset.rows
                 ? "bg-uiupc-orange border-uiupc-orange text-white shadow-lg shadow-uiupc-orange/20" 
                 : "bg-black/5 dark:bg-white/5 border-black/5 dark:border-white/5 text-zinc-500 hover:text-zinc-600"}`}
           >
             {preset.label}
           </button>
         ))}
      </div>

      <div className="space-y-6 pt-4 border-t border-black/5 dark:border-white/5">
         {/* Custom Sliders */}
         <div className="space-y-4">
            <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
               <span className="flex items-center gap-2"><IconColumns size={10} /> Columns (X)</span>
               <span className="text-uiupc-orange text-xs">{cols}</span>
            </div>
            <input 
               type="range" min={1} max={10} step={1}
               value={cols}
               onChange={(e) => setCols(Number(e.target.value))}
               className="w-full accent-uiupc-orange h-1.5 bg-black/5 dark:bg-white/5 rounded-full appearance-none cursor-pointer"
            />
         </div>

         <div className="space-y-4">
            <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
               <span className="flex items-center gap-2"><IconGripHorizontal size={10} /> Rows (Y)</span>
               <span className="text-uiupc-orange text-xs">{rows}</span>
            </div>
            <input 
               type="range" min={1} max={10} step={1}
               value={rows}
               onChange={(e) => setRows(Number(e.target.value))}
               className="w-full accent-uiupc-orange h-1.5 bg-black/5 dark:bg-white/5 rounded-full appearance-none cursor-pointer"
            />
         </div>
      </div>

      {/* Visualizer Math */}
      <div className="py-6 rounded-2xl bg-black/5 dark:bg-white/5 border border-dashed border-black/10 dark:border-white/10 flex flex-col items-center justify-center gap-1">
         <span className="text-2xl font-black text-zinc-800 dark:text-zinc-200 font-mono">{cols * rows}</span>
         <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Total Image Slices</span>
      </div>

      <button 
        onClick={handleApply}
        disabled={isProcessing}
        className="w-full py-5 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-black text-xs font-black uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-95 transition-all shadow-xl disabled:opacity-50 flex items-center justify-center gap-3"
      >
        {isProcessing ? "Zipping Matrix..." : <><IconDownload size={14} /> Extract ZIP Payload</>}
      </button>
    </div>
  );
};

export default SplitterTool;
