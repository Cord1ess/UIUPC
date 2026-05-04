"use client";

import React, { useState } from "react";
import { motion } from "motion/react";

interface EventItem {
  name: string;
  image: string;
  color: string;
}

const events: EventItem[] = [
  {
    name: "Shutter Stories",
    image: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=1000&auto=format&fit=crop",
    color: "#4CAF50"
  },
  {
    name: "Photowalk",
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1000&auto=format&fit=crop",
    color: "#f58920"
  },
  {
    name: "Muthography",
    image: "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=1000&auto=format&fit=crop",
    color: "#9C27B0"
  },
  {
    name: "Friday Exposure",
    image: "https://images.unsplash.com/photo-1452784444945-3f4227083ea8?q=80&w=1000&auto=format&fit=crop",
    color: "#2196F3"
  },
  {
    name: "Workshops",
    image: "https://images.unsplash.com/photo-1502472992402-e1625150d8fc?q=80&w=1000&auto=format&fit=crop",
    color: "#FF9800"
  },
  {
    name: "Photo Carnival",
    image: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=1000&auto=format&fit=crop",
    color: "#E91E63"
  },
];

const EventAccordion: React.FC = () => {
  const [hovered, setHovered] = useState<number | null>(null);
  const [mobileActive, setMobileActive] = useState<number | null>(0);

  return (
    <div className="overflow-hidden">
      <div className="flex flex-col md:flex-row h-[600px] md:h-[600px] gap-2.5">
        {events.map((event, index) => (
          <motion.div
            key={index}
            onMouseEnter={() => setHovered(index)}
            onMouseLeave={() => setHovered(null)}
            // Mobile: Target Line Logic - Creates a narrow "active" strip in the upper-middle
            onViewportEnter={() => setMobileActive(index)}
            viewport={{
              amount: 0.1, // Trigger as soon as it touches the target line
              margin: "-35% 0px -55% 0px" // Target line is approximately 35% from the top
            }}
            animate={{
              // Desktop uses hover logic, Mobile uses scroll-active logic
              flex: (typeof window !== 'undefined' && window.innerWidth < 768)
                ? (mobileActive === index ? 3 : 1)
                : (hovered === index ? 4 : (hovered === null ? 1 : 0.6)),
            }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="relative overflow-hidden cursor-pointer group rounded-2xl h-full"
            style={{ willChange: 'flex' }}
          >
            {/* Background Image */}
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
              style={{ backgroundImage: `url(${event.image})` }}
            />

            {/* Overlay */}
            <div className="absolute inset-0 bg-black/50 group-hover:bg-black/30 transition-colors duration-500" />

            {/* Content */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-6">
              <motion.div
                className="flex items-center justify-center"
                animate={{
                  rotate: (typeof window !== 'undefined' && window.innerWidth < 768) ? 0 : (hovered === index ? 0 : -90),
                  scale: (hovered === index || mobileActive === index) ? 1.1 : 1,
                  opacity: (typeof window !== 'undefined' && window.innerWidth < 768) ? (mobileActive === index ? 1 : 0.4) : 1
                }}
                transition={{ duration: 0.5 }}
              >
                <h3 className="text-white text-xl md:text-3xl font-black uppercase tracking-tighter drop-shadow-lg text-center leading-tight whitespace-normal max-w-[200px] md:max-w-none">
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
