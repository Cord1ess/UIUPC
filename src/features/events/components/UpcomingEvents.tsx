"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FaCalendarAlt, FaMapMarkerAlt, FaArrowRight } from 'react-icons/fa';
import { getImageUrl } from '@/utils/imageUrl';
import CountdownTimer from '@/components/shared/CountdownTimer';

interface UpcomingEventsProps {
  events: any[];
}

const UpcomingEvents: React.FC<UpcomingEventsProps> = ({ events }) => {
  if (!events || events.length === 0) {
    return (
      <div className="text-center py-20 border-2 border-dashed border-zinc-200 dark:border-white/10 rounded-[2.5rem]">
        <p className="text-zinc-400 dark:text-zinc-500 font-black uppercase text-[10px] tracking-[0.3em]">
          No events currently scheduled.
        </p>
      </div>
    );
  }

  const flagship = events[0];

  return (
    <div className="w-full">
      {/* ── Spotlight Design (Matches Events Page) ── */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative flex flex-col lg:flex-row items-center gap-10 lg:gap-16 transition-all"
      >
        {/* Image Card */}
        <div className="w-full lg:w-1/2 aspect-square md:aspect-[16/10] lg:aspect-square relative rounded-[2rem] overflow-hidden shadow-2xl group">
          <Image 
            src={flagship.image_url ? getImageUrl(flagship.image_url, 1000, 85) : ''}
            alt={flagship.title}
            fill
            className="object-cover transition-transform duration-1000 group-hover:scale-110"
          />
          <div className="absolute top-6 left-6">
            <span className="px-4 py-2 bg-uiupc-orange text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg">
              Next Up
            </span>
          </div>
        </div>

        {/* Content Section */}
        <div className="flex-1 flex flex-col justify-center text-center lg:text-left">
          <h3 className="text-4xl md:text-5xl font-black text-zinc-900 dark:text-white uppercase tracking-tighter mb-6 leading-none">
            {flagship.title}
          </h3>
          
          <div className="flex flex-wrap justify-center lg:justify-start gap-4 mb-8">
            <div className="flex items-center gap-2 text-xs font-bold text-zinc-500 dark:text-zinc-400">
              <FaCalendarAlt className="text-uiupc-orange" /> {new Date(flagship.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-zinc-500 dark:text-zinc-400">
              <FaMapMarkerAlt className="text-uiupc-orange" /> {flagship.location || 'UIU Campus'}
            </div>
          </div>
          
          <div className="mb-10 flex justify-center lg:justify-start">
            <CountdownTimer targetDate={flagship.date} />
          </div>

          <Link 
            href={`/events/${flagship.id}`} 
            className="inline-flex items-center gap-4 px-10 py-5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-[11px] font-black uppercase tracking-widest rounded-xl hover:bg-uiupc-orange dark:hover:bg-uiupc-orange hover:text-white dark:hover:text-white transition-all shadow-xl group/btn active:scale-95 w-max mx-auto lg:mx-0"
          >
            <span>Register for Event</span>
            <FaArrowRight className="group-hover/btn:translate-x-2 transition-transform" />
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default UpcomingEvents;
