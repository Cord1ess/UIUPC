"use client";

import React from 'react';
import { motion } from 'framer-motion';
import ScrollRevealText from "@/components/motion/ScrollRevealText";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color?: string;
}

export const Admin_StatCard = ({ label, value, icon, color = "text-uiupc-orange" }: StatCardProps) => (
  <div className="p-6 bg-white dark:bg-[#080808] border border-black/5 dark:border-white/5 rounded-2xl flex flex-col justify-between shadow-sm group min-h-[140px]">
    <p className="text-zinc-400 text-[10px] font-black uppercase tracking-widest">{label}</p>
    <div className="flex items-end justify-between mt-auto">
      <div className={`${color} text-4xl opacity-20 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500`}>
        {icon}
      </div>
      <div className="text-right">
        <motion.p 
          key={String(value)} 
          initial={{ opacity: 0, x: 20 }} 
          animate={{ opacity: 1, x: 0 }} 
          className="text-4xl font-black tracking-tighter dark:text-white leading-none uppercase"
        >
          {value}
        </motion.p>
      </div>
    </div>
  </div>
);

interface Admin_ModuleHeaderProps {
  title: string;
  description: string;
  children?: React.ReactNode;
}

export const Admin_ModuleHeader: React.FC<Admin_ModuleHeaderProps> = ({ title, description, children }) => {
  return (
    <div className="space-y-8 mb-8">
      <div className="flex flex-col gap-3">
        <ScrollRevealText
          text={title}
          className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-zinc-900 dark:text-white leading-none"
        />
        <div className="flex items-center gap-4">
           <p className="text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-widest text-[10px]">
             {description}
           </p>
        </div>
      </div>

      {children && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {children}
        </div>
      )}
    </div>
  );
};
