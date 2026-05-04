"use client";

import React from "react";
import { motion } from "motion/react";
import { IconSync } from "@/components/shared/Icons";

const StudioLoader: React.FC = () => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-10 space-y-4">
      {/* Simple Rotating Spinner */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        className="text-uiupc-orange"
      >
        <IconSync size={24} />
      </motion.div>

      {/* Basic Text Info */}
      <div className="text-center">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 dark:text-zinc-600">
          Loading Tool
        </p>
        <div className="mt-4 w-24 h-[1px] bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden relative mx-auto">
          <motion.div 
            animate={{ x: ["-100%", "100%"] }}
            transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 bg-uiupc-orange"
          />
        </div>
      </div>
    </div>
  );
};

export default StudioLoader;
