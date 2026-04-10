"use client";
import React, { useEffect, useRef, useState } from "react";
import {
  FaUsers,
  FaCalendarAlt,
  FaTrophy,
  FaPhotoVideo,
  FaStar,
} from "react-icons/fa";
import { IconType } from "react-icons";

interface StatItem {
  number: string;
  label: string;
  icon: IconType;
  color: string;
  suffix?: string;
  description: string;
}

const Stats: React.FC = () => {
  const statsRef = useRef<HTMLDivElement>(null);
  const [animated, setAnimated] = useState(false);

  const stats: StatItem[] = [
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

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !animated) {
            setAnimated(true);
          }
        });
      },
      { threshold: 0.3 }
    );

    const currentStatsRef = statsRef.current;
    if (currentStatsRef) {
      observer.observe(currentStatsRef);
    }
    return () => {
      if (currentStatsRef) {
        observer.unobserve(currentStatsRef);
      }
    };
  }, [animated]);

  return (
    <section className="py-12 px-6" ref={statsRef}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black text-black uppercase tracking-tighter mb-4">
            Our Club Milestones
          </h2>
          <div className="w-16 h-1 bg-uiupc-orange mx-auto mb-6"></div>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-sm max-w-2xl mx-auto">
            Establishing visual excellence and technical mastery across the photography landscape.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <div
                key={index}
                className="bg-white border border-black/10 p-12 flex flex-col items-center justify-center text-center transition-all duration-300 hover:-translate-y-1 hover:border-uiupc-orange/50 shadow-sm relative overflow-hidden"
              >
                <div className="mb-6 h-16 w-16 border border-black/5 bg-gray-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <IconComponent className="text-2xl" style={{ color: stat.color }} />
                </div>

                <div className="relative z-10 w-full">
                  <div className="flex items-center justify-center mb-1">
                    <span 
                      className={`text-4xl md:text-5xl font-black text-black leading-none transition-all duration-700 ${animated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                    >
                      {animated ? stat.number : "0"}
                    </span>
                    {stat.suffix && (
                      <span className="text-2xl font-black text-uiupc-orange ml-1">{stat.suffix}</span>
                    )}
                  </div>

                  <h3 className="text-black font-black uppercase tracking-wider text-xs mb-2 border-b border-black/5 pb-2">
                    {stat.label}
                  </h3>
                  <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">
                    {stat.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-12 pt-8 border-t border-black/5">
          <div className="inline-flex items-center gap-3 text-black opacity-30 font-black uppercase tracking-widest text-[10px]">
            <FaStar className="text-sm" />
            <span>Official UIU Photography Club Metric System • since 2005</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Stats;
