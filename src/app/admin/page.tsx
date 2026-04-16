"use client";

import React, { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminData } from "@/hooks/useAdminData";
import { ADMIN_SCRIPTS } from "@/features/admin/config";
import Loading from "@/components/Loading";
import { 
  FaUsers, 
  FaCamera, 
  FaNewspaper, 
  FaImages, 
  FaChartBar,
  FaShieldAlt,
  FaArrowRight
} from "react-icons/fa";
import ScrollRevealText from "@/components/home/ScrollRevealText";
import Link from "next/link";
import { motion } from "framer-motion";

const OverviewAdminPage = () => {
  const { user } = useAuth();

  // Fetch critical counts for the dashboard
  const { data: members } = useAdminData("membership", ADMIN_SCRIPTS.membership);
  const { data: photos } = useAdminData("photos", ADMIN_SCRIPTS.photos);

  if (!user) return <Loading />;

  const QUICK_STATS = [
    { label: "Active Members", count: members?.length || "...", icon: <FaUsers />, path: "/admin/members", color: "bg-blue-500" },
    { label: "Pending Photos", count: photos?.length || "...", icon: <FaCamera />, path: "/admin/photos", color: "bg-orange-500" },
    { label: "Blog Entries", count: "ACTIVE", icon: <FaNewspaper />, path: "/admin/blog", color: "bg-green-500" },
  ];

  const MODULES = [
    { title: "Membership", desc: "Manage club intake and member database.", icon: <FaUsers />, path: "/admin/members" },
    { title: "Competition", desc: "Moderate Shutter Stories submissions.", icon: <FaCamera />, path: "/admin/photos" },
    { title: "Public Gallery", desc: "Curate assets for the exhibition hall.", icon: <FaImages />, path: "/admin/gallery" },
    { title: "Editorial", desc: "Publish news and newsroom updates.", icon: <FaNewspaper />, path: "/admin/blog" },
    { title: "Results", desc: "Audit results and payment records.", icon: <FaChartBar />, path: "/admin/results" },
  ];

  return (
    <div className="space-y-16">
      {/* Hero Welcome */}
      <div className="space-y-6 max-w-4xl">
         <ScrollRevealText 
           text="Admin Portal" 
           className="text-5xl md:text-8xl font-black uppercase tracking-tighter leading-none text-zinc-900 dark:text-white"
         />
         <div className="flex flex-col gap-1 border-l-2 border-uiupc-orange pl-6 py-1">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">Identity Verified</p>
            <p className="text-zinc-500 dark:text-zinc-400 font-medium text-lg uppercase tracking-widest">
               Logged in as: <span className="text-zinc-900 dark:text-white">Admin</span>
            </p>
            <p className="text-zinc-400 text-xs font-medium uppercase tracking-widest opacity-60">
               {user.email}
            </p>
         </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {QUICK_STATS.map((stat, i) => (
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: i * 0.1 }}
             key={stat.label}
             className="p-8 bg-[#ffffff] dark:bg-[#050505] rounded-2xl border border-black/5 dark:border-white/5 shadow-3xl shadow-black/5"
           >
             <div className="flex items-center justify-between mb-6">
                <div className={`w-12 h-12 rounded-xl ${stat.color} bg-opacity-10 dark:bg-opacity-20 flex items-center justify-center text-xl`}>
                   <span className={stat.color.replace('bg-', 'text-')}>{stat.icon}</span>
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Real-time</span>
             </div>
             <div className="space-y-1">
                <div className="text-4xl font-black text-zinc-900 dark:text-white">{stat.count}</div>
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">{stat.label}</div>
             </div>
           </motion.div>
         ))}
      </div>

      {/* Module Navigation */}
      <div className="space-y-8">
         <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 border-b border-black/5 dark:border-white/5 pb-4">
            Available Modules
         </h3>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {MODULES.map((mod) => (
              <Link 
                key={mod.title}
                href={mod.path}
                className="group p-8 bg-[#ffffff] dark:bg-[#050505] rounded-2xl border border-black/5 dark:border-white/5 hover:border-uiupc-orange/30 transition-all duration-500"
              >
                <div className="flex items-start justify-between">
                   <div className="space-y-4">
                      <div className="text-zinc-400 group-hover:text-uiupc-orange transition-colors text-xl">
                         {mod.icon}
                      </div>
                      <h4 className="text-lg font-black uppercase tracking-tighter text-zinc-900 dark:text-white">
                         {mod.title}
                      </h4>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-[200px]">
                         {mod.desc}
                      </p>
                   </div>
                   <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-[10px] transition-all group-hover:bg-uiupc-orange group-hover:text-white">
                      <FaArrowRight />
                   </div>
                </div>
              </Link>
            ))}
         </div>
      </div>
    </div>
  );
};

export default OverviewAdminPage;
