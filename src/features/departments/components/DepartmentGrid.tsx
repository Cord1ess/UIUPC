"use client";

import React from 'react';
import { motion } from 'motion/react';
import Link from 'next/link';
import { IconPalette, IconCamera, IconUsers, IconGlobe, IconCalendarCheck, IconClipboardList } from '@/components/shared/Icons';
import { Department } from '@/types';

const departmentIcons: Record<string, any> = {
  design: IconPalette,
  visual: IconCamera,
  hr: IconUsers,
  pr: IconGlobe,
  event: IconCalendarCheck,
  organizing: IconClipboardList,
};

const departmentColors: Record<string, string> = {
  design: 'from-pink-500/20 to-orange-500/20',
  visual: 'from-blue-500/20 to-cyan-500/20',
  hr: 'from-green-500/20 to-emerald-500/20',
  pr: 'from-purple-500/20 to-indigo-500/20',
  event: 'from-red-500/20 to-rose-500/20',
  organizing: 'from-amber-500/20 to-yellow-500/20',
};

export const DepartmentGrid = ({ departments }: { departments: Department[] }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-12">
      {departments.map((dept, index) => {
        const Icon = departmentIcons[dept.name] || IconUsers;
        return (
          <motion.div
            key={dept.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link 
              href={`/departments/${dept.name}`}
              className="group block relative p-8 bg-white dark:bg-[#080808] border border-black/5 dark:border-white/5 rounded-[2.5rem] overflow-hidden transition-all hover:border-uiupc-orange/30 hover:shadow-2xl hover:shadow-uiupc-orange/10"
            >
              {/* Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${departmentColors[dept.name] || 'from-zinc-500/10 to-zinc-500/10'} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-uiupc-orange group-hover:text-white transition-all duration-500">
                  <Icon size={24} />
                </div>
                
                <h3 className="text-2xl font-black uppercase tracking-tight mb-3 dark:text-white group-hover:text-uiupc-orange transition-colors">
                  {dept.display_name}
                </h3>
                
                <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed mb-8 line-clamp-2">
                  {dept.description}
                </p>
                
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 group-hover:text-uiupc-orange transition-colors">
                  Explore Department <span>→</span>
                </div>
              </div>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
};
