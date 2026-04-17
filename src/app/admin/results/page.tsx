"use client";

import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { ADMIN_SCRIPTS } from "@/features/admin/config";
import ResultsManagement from "@/features/results/components/ResultsManagement";
import GlobalLoader from "@/components/shared/GlobalLoader";
import { FaChartBar } from "react-icons/fa";
import ScrollRevealText from "@/components/motion/ScrollRevealText";

const ResultsAdminPage = () => {
  const { user } = useAuth();

  if (!user) return <GlobalLoader />;

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-4">
           <ScrollRevealText 
             text="Results & Payments" 
             className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none text-zinc-900 dark:text-white"
           />
           <p className="text-zinc-500 dark:text-zinc-400 font-medium text-sm md:text-base uppercase tracking-widest">
              Audit transactions and publish the official results of our exhibitions.
           </p>
        </div>
      </div>

      <div className="bg-[#ffffff] dark:bg-[#050505] rounded-2xl border border-black/5 dark:border-white/5 overflow-hidden shadow-3xl shadow-black/5 p-6 md:p-10">
        <ResultsManagement 
          user={user} 
          scripts={ADMIN_SCRIPTS} 
          onUpdate={() => window.location.reload()} 
        />
      </div>
    </div>
  );
};

export default ResultsAdminPage;
