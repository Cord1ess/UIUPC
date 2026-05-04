"use client";

import React from "react";
import { motion } from "motion/react";
import { Achievement } from "@/lib/fetchers";
import { IconTrophy, IconCalendar, IconTag } from "@/components/shared/Icons";

interface AchievementCardProps {
  achievement: Achievement;
  index: number;
}

const AchievementCard: React.FC<AchievementCardProps> = ({ achievement, index }) => {
  const isEven = index % 2 === 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: isEven ? -50 : 50, y: 30 }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: index * 0.1 }}
      className={`relative w-full mb-16 lg:mb-24 flex flex-col ${
        isEven ? "lg:flex-row" : "lg:flex-row-reverse"
      } items-center gap-8 lg:gap-16 group`}
    >
      {/* Connector Node */}
      <div className="absolute left-0 lg:left-1/2 top-0 lg:top-1/2 -translate-x-[11px] lg:-translate-x-1/2 lg:-translate-y-1/2 z-10">
        <div className="w-5 h-5 rounded-full bg-[#f9f5ea] dark:bg-[#121212] border-4 border-uiupc-orange shadow-[0_0_15px_rgba(245,137,32,0.4)] transition-transform duration-500 group-hover:scale-125" />
      </div>

      {/* Media: 1:1 Aspect Ratio (Architecture Rule 5.2) */}
      <div className="w-full lg:w-1/2 aspect-square relative overflow-hidden rounded-[2rem] border border-black/5 dark:border-white/5 shadow-m3-2 group-hover:shadow-m3-3 transition-all duration-700">
        <img
          src={achievement.image}
          alt={achievement.title}
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="absolute bottom-6 left-6 flex gap-2 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 delay-100">
          {achievement.tags.map(tag => (
            <span key={tag} className="px-3 py-1 bg-uiupc-orange text-white text-[9px] font-black uppercase tracking-widest rounded-full">
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Content: Solid Background (Architecture Rule 5.3) */}
      <div className="w-full lg:w-1/2 space-y-6 lg:px-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-uiupc-orange/10 rounded-xl">
             <IconCalendar size={12} className="text-uiupc-orange" />
             <span className="text-uiupc-orange text-[10px] font-black uppercase tracking-widest">
                {achievement.year} Collection
             </span>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-3xl md:text-5xl font-serif font-black tracking-tighter leading-tight text-zinc-900 dark:text-white transition-colors duration-300 group-hover:text-uiupc-orange">
            {achievement.title}
          </h3>
          <p className="text-zinc-600 dark:text-zinc-400 font-sans text-sm md:text-base leading-relaxed max-w-lg">
            {achievement.description}
          </p>
        </div>

        <div className="pt-4 flex items-center gap-4">
           <div className="w-12 h-[1px] bg-uiupc-orange/30 group-hover:w-20 transition-all duration-500" />
           <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">
              Legacy Entry #{achievement.id}
           </span>
        </div>
      </div>
    </motion.div>
  );
};

export default AchievementCard;
