"use client";

import React, { useRef } from "react";
import { useStudioStore } from "@/store/useStudioStore";
import { FaCloudUploadAlt, FaTrash, FaDownload, FaImages, FaSyncAlt } from "react-icons/fa";
import Link from "next/link";
import { useState } from "react";
import ExportModal from "./export/ExportModal";

const StudioHeader: React.FC = () => {
  const { images, addImages, clearStudio, maxImages, restartUi } = useStudioStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addImages(Array.from(e.target.files));
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 h-20 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border-b border-black/5 dark:border-white/5 z-50 flex items-center px-6 justify-between">
      <div className="flex items-center gap-4">
        <Link href="/" className="flex items-center gap-2 leading-none">
          <div className="flex flex-col leading-none">
            <span className="text-2xl font-black uppercase tracking-tighter dark:text-white">UIUPC</span>
            <div className="flex items-center gap-1.5">
              <span className="text-uiupc-orange text-[8px] font-bold uppercase tracking-[0.2em]">Studio 1.0</span>
              <span className="text-[7px] font-black uppercase tracking-wide bg-uiupc-orange/10 text-uiupc-orange px-1.5 py-0.5 rounded">Beta</span>
            </div>
          </div>
        </Link>

        <div className="h-8 w-[1px] bg-black/5 dark:bg-white/5" />

        <div className="flex items-center gap-2 px-3 py-1.5 bg-black/5 dark:bg-white/5 rounded-md h-[34px]">
           <FaImages className="text-[10px] text-zinc-400" />
           <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
             {images.length} / {maxImages}
           </span>
        </div>

        {images.length > 0 && (
          <button 
            onClick={clearStudio}
            className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 text-red-500 rounded-md h-[34px] text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all"
            title="Clear Studio"
          >
            <FaTrash className="text-[10px]" />
            <span className="hidden sm:inline">Clear</span>
          </button>
        )}
      </div>

      <div className="flex items-center gap-3">
        <input 
          type="file" 
          multiple 
          accept="image/*" 
          className="hidden" 
          ref={fileInputRef}
          onChange={handleFileChange}
        />
        
        {images.length > 0 && (
          <>
            <button 
              onClick={() => {
                if (window.confirm("This will forcefully restart the Studio UI but keep your images. Continue?")) {
                  restartUi();
                }
              }}
              className="h-10 w-10 rounded-md bg-zinc-900/5 dark:bg-white/5 text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white transition-all flex items-center justify-center"
              title="Force Restart Engine"
            >
              <FaSyncAlt className="text-xs" />
            </button>
          </>
        )}

        <button 
          onClick={() => fileInputRef.current?.click()}
          disabled={images.length >= maxImages}
          className="h-10 px-6 rounded-md bg-uiupc-orange text-white text-[10px] font-black uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-uiupc-orange/20 disabled:opacity-50 flex items-center gap-2"
        >
          <FaCloudUploadAlt className="text-sm" />
          <span className="hidden sm:inline">Upload</span>
        </button>

        {images.length > 0 && (
          <button 
            onClick={() => setIsExportModalOpen(true)}
            className="h-10 w-10 sm:w-auto sm:px-6 rounded-md bg-zinc-900 dark:bg-white text-white dark:text-black text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
            title="Export Center"
          >
            <FaDownload className="text-xs" />
            <span className="hidden sm:inline">Export</span>
          </button>
        )}
      </div>
      
      {isExportModalOpen && <ExportModal onClose={() => setIsExportModalOpen(false)} />}
    </div>
  );
};

export default StudioHeader;
