"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useStudioStore } from "@/store/useStudioStore";
import dynamic from "next/dynamic";
import { FaImages, FaUndo, FaDownload, FaExternalLinkAlt, FaTrash, FaCopy, FaSyncAlt } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import StudioLoader from "@/features/studio/components/StudioLoader";
import StudioCanvas from "@/features/studio/components/StudioCanvas";

// Dynamic Imports (Update to Controls Only)
const StudioHeader = dynamic(() => import("@/features/studio/components/StudioHeader"), { ssr: false });
const StudioBottomBar = dynamic(() => import("@/features/studio/components/StudioBottomBar"), { ssr: false });
const StudioRightPanel = dynamic(() => import("@/features/studio/components/StudioRightPanel"), { ssr: false });
const OptimizerTool = dynamic(() => import("@/features/studio/components/OptimizerTool"), { ssr: false, loading: () => <StudioLoader /> });
const CropperTool = dynamic(() => import("@/features/studio/components/CropperTool"), { ssr: false, loading: () => <StudioLoader /> });
const EditorialTool = dynamic(() => import("@/features/studio/components/EditorialTool"), { ssr: false, loading: () => <StudioLoader /> });
const MetadataTool = dynamic(() => import("@/features/studio/components/MetadataTool"), { ssr: false, loading: () => <StudioLoader /> });
const TransformerTool = dynamic(() => import("@/features/studio/components/TransformerTool"), { ssr: false, loading: () => <StudioLoader /> });
const ComposeTool = dynamic(() => import("@/features/studio/components/ComposeTool"), { ssr: false, loading: () => <StudioLoader /> });
const PdfTool = dynamic(() => import("@/features/studio/components/PdfTool"), { ssr: false, loading: () => <StudioLoader /> });
const AIRetouchTool = dynamic(() => import("@/features/studio/components/AIRetouchTool"), { ssr: false, loading: () => <StudioLoader /> });
const AIEnhanceTool = dynamic(() => import("@/features/studio/components/AIEnhanceTool"), { ssr: false, loading: () => <StudioLoader /> });

export default function UIUPCStudioPage() {
  const { images, activeImageId, activeToolId, uiKey, addImages, revertToHistory } = useStudioStore();
  const [isDragging, setIsDragging] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  
  // Mobile UI State
  const [isMobileControlsOpen, setIsMobileControlsOpen] = useState(false);
  const [isMobileHistoryOpen, setIsMobileHistoryOpen] = useState(false);

  const activeImage = images.find(img => img.id === activeImageId);

  // Auto-close mobile controls when tool changes
  useEffect(() => {
    setIsMobileControlsOpen(false);
  }, [activeToolId]);

  // Prevent accidental reloads when working
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (images.length > 0) {
        e.preventDefault();
        e.returnValue = "You have unsaved changes in the Studio. Are you sure you want to leave?";
        return e.returnValue;
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [images.length]);

  // Global Drag and Drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget === e.target) {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith("image/"));
    if (files.length > 0) {
      addImages(files);
    }
  }, [addImages]);

  // Custom Context Menu
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  }, []);

  useEffect(() => {
    const dismiss = () => setContextMenu(null);
    window.addEventListener("click", dismiss);
    window.addEventListener("scroll", dismiss);
    return () => {
      window.removeEventListener("click", dismiss);
      window.removeEventListener("scroll", dismiss);
    };
  }, []);

  const handleUndo = () => {
    if (activeImage && activeImage.history.length > 1) {
      const prevHistory = activeImage.history[activeImage.history.length - 2];
      revertToHistory(activeImage.id, prevHistory.id);
    }
    setContextMenu(null);
  };

  const handleOpenInNewTab = () => {
    if (activeImage) {
      window.open(activeImage.workingUrl, "_blank");
    }
    setContextMenu(null);
  };

  const handleDownloadNow = () => {
    if (activeImage) {
      const a = document.createElement("a");
      a.href = activeImage.workingUrl;
      a.download = `uiupc_export_${Date.now()}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
    setContextMenu(null);
  };

  const handleCopyToClipboard = async () => {
    if (activeImage) {
      try {
        const res = await fetch(activeImage.workingUrl);
        const blob = await res.blob();
        await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
      } catch (e) { console.error(e); }
    }
    setContextMenu(null);
  };

  const renderToolControls = () => {
    switch (activeToolId) {
      case "optimizer":
        return <OptimizerTool key={`opt-${uiKey}`} />;
      case "cropper":
        return <CropperTool key={`crop-${uiKey}`} />;
      case "editor":
        return <EditorialTool key={`edit-${uiKey}`} />;
      case "metadata":
        return <MetadataTool key={`meta-${uiKey}`} />;
      case "transformer":
        return <TransformerTool key={`trans-${uiKey}`} />;
      case "compose":
        return <ComposeTool key={`compose-${uiKey}`} />;
      case "pdf":
        return <PdfTool key={`pdf-${uiKey}`} />;
      case "retouch":
        return <AIRetouchTool key={`retouch-${uiKey}`} />;
      case "enhance":
        return <AIEnhanceTool key={`enhance-${uiKey}`} />;
      default:
        return null;
    }
  };

  return (
    <div 
      className="min-h-screen max-h-screen bg-[#f9f5ea] dark:bg-[#0a0a0a] transition-colors duration-500 overflow-hidden flex flex-col relative"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onContextMenu={handleContextMenu}
    >
      <div className="absolute inset-0 bg-grid-giant opacity-[0.4] dark:opacity-[0.1] -z-10 pointer-events-none" />

      {/* Drag & Drop Overlay */}
      <AnimatePresence>
        {isDragging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/70 flex items-center justify-center pointer-events-none"
          >
            <motion.div  
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="flex flex-col items-center gap-6"
            >
              <div className="w-32 h-32 rounded-full border-4 border-dashed border-uiupc-orange/60 flex items-center justify-center">
                <FaImages className="text-5xl text-uiupc-orange" />
              </div>
              <p className="text-white font-sans text-sm font-semibold tracking-wide">Drop images to import</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom Context Menu */}
      <AnimatePresence>
        {contextMenu && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.12 }}
            className="fixed z-[9998] bg-white dark:bg-zinc-900 rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.4)] border border-black/10 dark:border-white/10 py-2 min-w-[200px] overflow-hidden"
            style={{ left: contextMenu.x, top: contextMenu.y }}
          >
            <button onClick={handleUndo} disabled={!activeImage || activeImage.history.length <= 1} className="w-full px-4 py-2.5 text-left text-xs flex items-center gap-3 hover:bg-black/5 dark:hover:bg-white/5 transition-colors disabled:opacity-30">
              <FaUndo className="text-zinc-400" /> Undo Last Edit
            </button>
            <button onClick={handleOpenInNewTab} disabled={!activeImage} className="w-full px-4 py-2.5 text-left text-xs flex items-center gap-3 hover:bg-black/5 dark:hover:bg-white/5 transition-colors disabled:opacity-30">
              <FaExternalLinkAlt className="text-zinc-400" /> Open Image in New Tab
            </button>
            <button onClick={handleDownloadNow} disabled={!activeImage} className="w-full px-4 py-2.5 text-left text-xs flex items-center gap-3 hover:bg-black/5 dark:hover:bg-white/5 transition-colors disabled:opacity-30">
              <FaDownload className="text-zinc-400" /> Download Now
            </button>
            <button onClick={handleCopyToClipboard} disabled={!activeImage} className="w-full px-4 py-2.5 text-left text-xs flex items-center gap-3 hover:bg-black/5 dark:hover:bg-white/5 transition-colors disabled:opacity-30">
              <FaCopy className="text-zinc-400" /> Copy to Clipboard
            </button>
            <div className="h-[1px] bg-black/5 dark:bg-white/5 my-1" />
            <button onClick={() => { useStudioStore.getState().restartUi(); setContextMenu(null); }} className="w-full px-4 py-2.5 text-left text-xs flex items-center gap-3 hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-zinc-500">
              <FaSyncAlt className="text-zinc-400" /> Restart Studio UI
            </button>
            {activeImage && (
              <button onClick={() => { useStudioStore.getState().removeImage(activeImage.id); setContextMenu(null); }} className="w-full px-4 py-2.5 text-left text-xs flex items-center gap-3 hover:bg-red-500/10 text-red-500 transition-colors">
                <FaTrash className="text-red-400" /> Remove Active Image
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <StudioHeader />

      <main key={uiKey} className="flex-1 relative z-10 lg:px-[320px] pt-10 pb-4 flex items-center justify-center">
        <div className="w-full h-full flex items-center justify-center">
          
          <AnimatePresence mode="wait">
            {images.length === 0 ? (
              <motion.div 
                key="empty"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="w-full h-full flex flex-col items-center justify-center text-center space-y-6 px-6"
              >
                  <FaImages className="text-6xl text-zinc-300 dark:text-zinc-700 mb-2" />
                  <div className="space-y-4">
                    <div className="flex items-center justify-center gap-3">
                      <h2 className="text-2xl font-sans font-extrabold tracking-tight text-zinc-900 dark:text-white">
                          UIUPC Studio 1.0
                      </h2>
                      <span className="text-[9px] font-black uppercase tracking-wide bg-uiupc-orange/10 text-uiupc-orange px-2 py-1 rounded">Beta</span>
                    </div>
                    <p className="text-zinc-500 dark:text-zinc-500 text-xs font-sans max-w-[340px] mx-auto leading-relaxed">
                        A professional image processing studio. Optimize, crop, edit, transform, remove backgrounds, stitch collages, and export to ZIP or PDF — all in one place.
                    </p>
                    <p className="text-zinc-400 dark:text-zinc-600 text-[10px] font-sans max-w-[320px] mx-auto leading-relaxed">
                        Completely client-side. Your images and data never leave your device — nothing is uploaded or stored.
                    </p>
                    <p className="text-zinc-400 dark:text-zinc-600 text-[10px] font-sans mt-2">
                        Drag & drop images here or use the Upload button.
                    </p>
                  </div>
              </motion.div>
            ) : (
              <div
                className="w-full h-full flex items-center justify-center relative"
              >
                {/* Left Sidebars: Desktop vs Mobile */}
                <aside className="hidden lg:block fixed left-0 top-20 bottom-0 w-[320px] border-r border-black/5 dark:border-white/5 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md overflow-y-auto no-scrollbar p-10">
                   {renderToolControls()}
                </aside>

                <AnimatePresence>
                  {isMobileControlsOpen && (
                    <motion.aside 
                      initial={{ x: "-100%" }}
                      animate={{ x: 0 }}
                      exit={{ x: "-100%" }}
                      transition={{ type: "spring", damping: 25, stiffness: 200 }}
                      className="lg:hidden fixed inset-0 top-20 z-[60] bg-white dark:bg-zinc-900 overflow-y-auto p-10"
                    >
                      <div className="flex items-center justify-between mb-8">
                         <h3 className="text-xs font-black uppercase tracking-widest text-uiupc-orange">Tool Controls</h3>
                         <button onClick={() => setIsMobileControlsOpen(false)} className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center">
                            <FaTrash className="text-[10px]" />
                         </button>
                      </div>
                      {renderToolControls()}
                    </motion.aside>
                  )}
                </AnimatePresence>

                {/* Center Stage: Unified Canvas */}
                <div className="flex-1 flex items-center justify-center h-full w-full max-w-6xl mx-auto overflow-hidden px-4 lg:px-0">
                   <StudioCanvas />
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Desktop Right Sidebar */}
      <div className="hidden lg:block">
        <StudioRightPanel />
      </div>

      {/* Mobile History Panel */}
      <AnimatePresence>
        {isMobileHistoryOpen && (
          <motion.div 
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="lg:hidden fixed inset-0 top-20 z-[60] bg-white dark:bg-zinc-900 overflow-hidden flex flex-col"
          >
             <div className="p-4 border-b border-black/5 dark:border-white/5 flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-widest">History & Bin</h3>
                <button onClick={() => setIsMobileHistoryOpen(false)} className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center">
                    <FaTrash className="text-[10px]" />
                </button>
             </div>
             <div className="flex-1 overflow-y-auto">
                <StudioRightPanel />
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      <StudioBottomBar />

      {/* Mobile Toggle FABs */}
      {images.length > 0 && (
        <div className="lg:hidden fixed bottom-24 left-0 right-0 px-6 flex justify-between items-center z-40 pointer-events-none">
           <button 
             onClick={() => setIsMobileControlsOpen(!isMobileControlsOpen)}
             className="w-12 h-12 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-black shadow-2xl flex items-center justify-center pointer-events-auto active:scale-90 transition-transform"
           >
              <FaSyncAlt className={`text-sm transition-transform ${isMobileControlsOpen ? 'rotate-180' : ''}`} />
           </button>
           <button 
             onClick={() => setIsMobileHistoryOpen(!isMobileHistoryOpen)}
             className="w-12 h-12 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-black shadow-2xl flex items-center justify-center pointer-events-auto active:scale-90 transition-transform"
           >
              <FaImages className="text-sm" />
           </button>
        </div>
      )}
    </div>
  );
}
