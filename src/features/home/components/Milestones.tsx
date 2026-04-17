"use client";
import React, { useEffect, useRef, useState } from "react";
import {
  FaUsers,
  FaCalendarAlt,
  FaTrophy,
  FaPhotoVideo,
} from "react-icons/fa";
import { IconType } from "react-icons";
import { motion } from "framer-motion";
import ScrollRevealText from "@/components/motion/ScrollRevealText";
import { useTheme } from "@/contexts/ThemeContext";

interface MilestoneItem {
  number: string;
  label: string;
  icon: IconType;
  color: string;
  suffix?: string;
  description: string;
}

const milestones: MilestoneItem[] = [
  {
    number: "100",
    label: "Active Members",
    icon: FaUsers,
    color: "#f58920",
    suffix: "+",
    description: "University Students",
  },
  {
    number: "50",
    label: "Events Organized",
    icon: FaCalendarAlt,
    color: "#2196F3",
    suffix: "+",
    description: "Annually Held",
  },
  {
    number: "25",
    label: "Awards Won",
    icon: FaTrophy,
    color: "#FFC107",
    suffix: "+",
    description: "National Scale",
  },
  {
    number: "100",
    label: "Skill Workshops",
    icon: FaPhotoVideo,
    color: "#9C27B0",
    suffix: "+",
    description: "Training Sessions",
  },
];

const Milestones: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [animated, setAnimated] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !animated) {
            setAnimated(true);
          }
        });
      },
      { threshold: 0.2 }
    );

    const currentRef = containerRef.current;
    if (currentRef) observer.observe(currentRef);
    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, [animated]);

  return (
    <section className="px-6" ref={containerRef}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-10">
          <ScrollRevealText 
            text="OUR CLUB MILESTONES" 
            className="text-4xl md:text-5xl font-black text-black dark:text-white uppercase tracking-tighter mb-4"
          />
          <div className="w-16 h-1 bg-uiupc-orange mb-6"></div>
          <p className="text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest text-xs max-w-2xl">
            Establishing visual excellence and technical mastery across the photography landscape since 2005.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {milestones.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className={`${theme === 'dark' ? 'bg-zinc-900 border-white/5' : 'bg-white border-black/5'} p-7 rounded-slight shadow-m3-1 dark:shadow-none transition-all duration-300 hover:shadow-m3-2 dark:hover:shadow-uiupc-orange/10 hover:-translate-y-1 group border flex items-center justify-between`}
              >
                <div className="flex flex-col space-y-1">
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className={`text-4xl font-black ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>
                      {item.number}
                    </span>
                    {item.suffix && (
                      <span className="text-xl font-black text-uiupc-orange">{item.suffix}</span>
                    )}
                  </div>

                  <h3 className={`font-black uppercase tracking-wider text-[11px] leading-tight ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>
                    {item.label}
                  </h3>
                  <p className={`text-[10px] font-bold uppercase tracking-widest ${theme === 'dark' ? 'text-zinc-500' : 'text-zinc-400'}`}>
                    {item.description}
                  </p>
                </div>
                
                <div className="text-uiupc-orange/10 dark:text-uiupc-orange/5 transition-all duration-500 group-hover:scale-110 group-hover:text-uiupc-orange flex-shrink-0">
                  <Icon className="text-6xl" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Milestones;
