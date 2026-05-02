"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { DepartmentGrid } from '@/features/departments/components/DepartmentGrid';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { Department } from '@/types';
import { FaLayerGroup } from 'react-icons/fa';

export default function DepartmentsPage() {
  const { data: departments, loading, error } = useSupabaseData<Department>("departments");

  return (
    <main className="min-h-screen pt-32 pb-20 px-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-16">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3 text-uiupc-orange mb-4"
        >
          <FaLayerGroup className="text-xl" />
          <span className="text-xs font-black uppercase tracking-[0.3em]">Our Architecture</span>
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl md:text-7xl font-black uppercase tracking-tighter dark:text-white leading-[0.9]"
        >
          The <span className="text-uiupc-orange">Departments</span><br />
          of UIUPC
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-8 text-zinc-500 dark:text-zinc-400 text-lg max-w-2xl font-medium leading-relaxed"
        >
          Discover the specialized teams that drive the creativity, operations, and community of the United International University Photography Club.
        </motion.p>
      </div>

      {error && (
        <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-xs font-bold uppercase tracking-widest mb-12">
          Error loading departments: {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-64 bg-zinc-100 dark:bg-zinc-900 rounded-[2.5rem] animate-pulse" />
          ))}
        </div>
      ) : (
        <DepartmentGrid departments={departments || []} />
      )}
    </main>
  );
}
