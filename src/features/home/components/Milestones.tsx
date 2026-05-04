"use client";
import React, { useRef } from "react";
import {
  IconUsers,
  IconCalendar,
  IconTrophy,
  IconPhotoVideo,
  IconType,
} from "@/components/shared/Icons";
import { motion } from "motion/react";
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
    icon: IconUsers,
    color: "#f58920",
    suffix: "+",
    description: "University Students",
  },
  {
    number: "50",
    label: "Events Organized",
    icon: IconCalendar,
    color: "#2196F3",
    suffix: "+",
    description: "Annually Held",
  },
  {
    number: "25",
    label: "Awards Won",
    icon: IconTrophy,
    color: "#FFC107",
    suffix: "+",
    description: "National Scale",
  },
  {
    number: "100",
    label: "Skill Workshops",
    icon: IconPhotoVideo,
    color: "#9C27B0",
    suffix: "+",
    description: "Training Sessions",
  },
];

const Milestones: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  // Animation variants for the card entrance
  const cardVariants = {
    initial: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.6, ease: "easeOut" } 
    }
  } as any;

  // Icon animation variants for scroll-trigger (Mobile) and hover (Desktop)
  const iconVariants = {
    initial: { 
      scale: 1, 
      color: theme === 'dark' ? "#FFFFFF" : "#1A1A1A", // Explicit hex instead of currentColor
      opacity: 0.1 
    },
    active: { 
      scale: 1.15, 
      color: "#f58920", 
      opacity: 1,
      transition: { duration: 0.4 } 
    }
  } as any;

  return (
    <section className="px-6 pt-4 pb-12" ref={containerRef}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-10">
          <ScrollRevealText 
            text="OUR CLUB MILESTONES" 
            delayOffset={0.5}
            className="text-4xl md:text-5xl font-black text-black dark:text-white uppercase tracking-tighter mb-4"
          />
          <div className="w-16 h-1 bg-uiupc-orange mb-6"></div>
          <p className="text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest text-xs max-w-2xl">
            Establishing visual excellence and technical mastery across the photography landscape since 2005.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {milestones.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={index}
                initial="initial"
                whileInView="visible"
                viewport={{ once: true, amount: 0.1 }}
                variants={cardVariants}
                className={`
                  relative p-8 rounded-[2rem] border transition-all duration-500
                  flex items-center justify-between group
                  ${theme === 'dark' 
                    ? 'bg-zinc-900 border-white/5 hover:border-uiupc-orange/20' 
                    : 'bg-white border-black/5 hover:border-uiupc-orange/20 shadow-xl shadow-black/[0.02]'}
                  hover:-translate-y-1
                `}
              >
                <div className="flex flex-col space-y-1 relative z-10">
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className={`text-4xl md:text-5xl font-black ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>
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
                
                {/* Icon with Hybrid Interaction: Desktop Hover & Mobile Scroll-Pulse */}
                <motion.div 
                  initial="initial"
                  whileInView="active"
                  viewport={{ 
                    once: false, 
                    amount: 0.8 // Mobile: Pulse when card is mostly in view
                  }}
                  variants={iconVariants}
                  // Desktop Hover (using the same 'active' variant)
                  whileHover="active"
                  className="flex-shrink-0 relative z-10 text-zinc-400/20 dark:text-white/5 lg:group-hover:text-uiupc-orange lg:group-hover:scale-110 transition-all duration-300"
                >
                  <Icon size={48} />
                </motion.div>

                {/* Mobile Glow Overlay (triggered by whileInView on icon) */}
                <motion.div 
                  variants={{
                    initial: { opacity: 0 },
                    active: { opacity: 0.05 }
                  }}
                  className="absolute inset-0 bg-uiupc-orange pointer-events-none md:hidden"
                />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Milestones;
