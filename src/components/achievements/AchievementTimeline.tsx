"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { Achievement } from "@/lib/fetchers";
import AchievementCard from "./AchievementCard";

interface AchievementTimelineProps {
  achievements: Achievement[];
}

const AchievementTimeline: React.FC<AchievementTimelineProps> = ({ achievements }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end end"]
  });

  const scrollSpring = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const lineHeight = useTransform(scrollSpring, [0, 1], ["0%", "100%"]);

  return (
    <div ref={containerRef} className="relative max-w-7xl mx-auto px-6 py-20">
      {/* Central Timeline Track */}
      {/* Mobile: Left-aligned | Desktop: Centered */}
      <div className="absolute left-[7px] lg:left-1/2 top-0 bottom-0 w-[2px] bg-black/5 dark:bg-white/5 lg:-translate-x-1/2 overflow-hidden">
        <motion.div 
          style={{ height: lineHeight }}
          className="w-full bg-uiupc-orange"
        />
      </div>

      {/* Achievement List */}
      <div className="space-y-12 lg:space-y-0">
        {achievements.map((achievement, index) => (
          <AchievementCard 
            key={achievement.id} 
            achievement={achievement} 
            index={index} 
          />
        ))}
      </div>

      {/* Footer Visual Bridge */}
      <div className="flex flex-col items-center text-center mt-32 space-y-6">
        <div className="w-12 h-12 rounded-full border-2 border-dashed border-zinc-300 dark:border-zinc-700 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-uiupc-orange animate-pulse" />
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400">
           The journey continues
        </p>
      </div>
    </div>
  );
};

export default AchievementTimeline;
