"use client";

import React from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { IconArrowLeft } from "@/components/shared/Icons";

interface ToolLayoutProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

const ToolLayout: React.FC<ToolLayoutProps> = ({ title, description, children }) => {
  return (
    <main className="min-h-screen bg-[#f9f5ea] dark:bg-[#121212] transition-colors duration-500 pt-32 pb-20 px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-giant opacity-[0.4] dark:opacity-[0.1] -z-10 pointer-events-none" />

      <div className="max-w-4xl mx-auto">
        {/* Back Link */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-12"
        >
          <Link 
            href="/tools" 
            className="inline-flex items-center gap-2 text-zinc-500 hover:text-uiupc-orange transition-colors group"
          >
            <div className="p-2 rounded-lg bg-white dark:bg-zinc-900 border border-black/5 dark:border-white/5 group-hover:bg-uiupc-orange group-hover:text-white transition-all">
                <IconArrowLeft size={12} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest child">Back to Hub</span>
          </Link>
        </motion.div>

        {/* Header */}
        <div className="mb-16 space-y-4">
          <h1 className="text-4xl md:text-6xl font-black text-zinc-900 dark:text-white uppercase tracking-tighter leading-tight">
             {title}
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 font-sans text-sm md:text-base leading-relaxed max-w-xl">
             {description}
          </p>
        </div>

        {/* Tool Content */}
        <div className="relative">
          {children}
        </div>
      </div>
    </main>
  );
};

export default ToolLayout;
