"use client";

import React from "react";
import { useStudioStore } from "@/store/useStudioStore";
import { FaCompressArrowsAlt, FaCrop, FaAdjust, FaShieldAlt, FaWeightHanging, FaEraser, FaMagic } from "react-icons/fa";

const TOOLS = [
  { id: "optimizer", label: "Optimize", icon: FaCompressArrowsAlt },
  { id: "cropper", label: "Crop", icon: FaCrop },
  { id: "editor", label: "Edit", icon: FaAdjust },
  { id: "retouch", label: "AI Retouch", icon: FaEraser },
  { id: "enhance", label: "AI Enhance", icon: FaMagic },
  { id: "metadata", label: "EXIF", icon: FaShieldAlt },
  { id: "transformer", label: "Transform", icon: FaWeightHanging },
];

const StudioSidebar: React.FC = () => {
  const { activeToolId, setActiveTool, images } = useStudioStore();

  return (
    <aside className="fixed left-0 top-20 bottom-0 w-20 bg-white dark:bg-zinc-900 border-r border-black/5 dark:border-white/5 z-40 flex flex-col items-center py-8 gap-4 overflow-y-auto">
      {TOOLS.map((tool) => (
        <button
          key={tool.id}
          onClick={() => setActiveTool(tool.id)}
          disabled={images.length === 0}
          className={`relative group w-12 h-12 sm:w-14 sm:h-14 rounded-md flex flex-col items-center justify-center transition-all
            ${activeToolId === tool.id 
              ? "bg-uiupc-orange text-white shadow-lg shadow-uiupc-orange/20" 
              : "text-zinc-400 hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-30 disabled:pointer-events-none"
            }`}
        >
          <tool.icon className="text-lg sm:text-xl" />
          <span className="text-[7px] font-black uppercase tracking-widest mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {tool.label}
          </span>

          {activeToolId === tool.id && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-r-full" />
          )}
        </button>
      ))}
    </aside>
  );
};

export default StudioSidebar;
