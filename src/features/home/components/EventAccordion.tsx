"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

interface EventItem {
  name: string;
  image: string;
  color: string;
}

const events: EventItem[] = [
  { 
    name: "Photowalk", 
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1000&auto=format&fit=crop", 
    color: "#f58920" 
  },
  { 
    name: "Friday Exposure", 
    image: "https://images.unsplash.com/photo-1452784444945-3f4227083ea8?q=80&w=1000&auto=format&fit=crop", 
    color: "#2196F3" 
  },
  { 
    name: "Shutter Stories", 
    image: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=1000&auto=format&fit=crop", 
    color: "#4CAF50" 
  },
  { 
    name: "Photo Carnival", 
    image: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=1000&auto=format&fit=crop", 
    color: "#E91E63" 
  },
  { 
    name: "Muthography", 
    image: "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=1000&auto=format&fit=crop", 
    color: "#9C27B0" 
  },
  { 
    name: "LTAF", 
    image: "https://images.unsplash.com/photo-1502472992402-e1625150d8fc?q=80&w=1000&auto=format&fit=crop", 
    color: "#FF9800" 
  },
];

const EventAccordion: React.FC = () => {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div className="overflow-hidden">
      <div className="flex flex-col md:flex-row h-[500px] md:h-[600px] gap-2.5">
        {events.map((event, index) => (
          <motion.div
            key={index}
            onMouseEnter={() => setHovered(index)}
            onMouseLeave={() => setHovered(null)}
            animate={{
              flex: hovered === index ? 4 : (hovered === null ? 1 : 0.6),
            }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="relative overflow-hidden cursor-pointer group shadow-m3-1 dark:shadow-none hover:shadow-m3-3 dark:hover:shadow-uiupc-orange/10 rounded-xl h-full border border-black/[0.03] dark:border-white/[0.05]"
          >
            {/* Background Image */}
            <div 
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
              style={{ backgroundImage: `url(${event.image})` }}
            />
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/50 group-hover:bg-black/30 transition-colors duration-500" />
            
            {/* Content */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-4">
              <motion.div 
                className="flex items-center justify-center whitespace-nowrap"
                animate={{
                  rotate: typeof window !== 'undefined' && window.innerWidth < 768 ? 0 : (hovered === index ? 0 : -90),
                  scale: hovered === index ? 1.1 : 1,
                }}
                transition={{ duration: 0.5 }}
              >
                <h3 className="text-white text-xl md:text-3xl font-black uppercase tracking-tighter drop-shadow-md text-center">
                  {event.name}
                </h3>
              </motion.div>
            </div>

            {/* Bottom Glow (Subtle & Neutral) */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default EventAccordion;
