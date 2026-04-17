"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FaCalendarAlt, FaMapMarkerAlt, FaArrowRight } from 'react-icons/fa';
import { UIUPCEvent } from '@/hooks/useFirebaseData';
import ScrollRevealText from '@/components/motion/ScrollRevealText';

interface UpcomingEventsProps {
  events: UIUPCEvent[];
}

const UpcomingEvents: React.FC<UpcomingEventsProps> = ({ events }) => {
  if (!events || events.length === 0) {
    return null;
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return {
      day: date.getDate().toString().padStart(2, '0'),
      month: date.toLocaleString('en-US', { month: 'short' }).toUpperCase(),
      year: date.getFullYear().toString(),
    };
  };

  return (
    <section className="px-6 py-24">
      <div className="max-w-7xl mx-auto space-y-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-4">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-uiupc-orange">What&apos;s Next</span>
            <ScrollRevealText
              text="Upcoming Events"
              className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-[0.85] text-zinc-900 dark:text-white"
            />
          </div>
          <Link
            href="/events"
            className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 hover:text-uiupc-orange transition-colors group"
          >
            <span>View All Events</span>
            <FaArrowRight className="text-[8px] group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.slice(0, 3).map((event, index) => {
            const date = formatDate(event.date);
            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="group"
              >
                <Link href={`/events/${event.id}`} className="block space-y-6">
                  {/* Image */}
                  <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-black/5 dark:border-white/5">
                    {event.image && (
                      <Image
                        src={event.image}
                        alt={event.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    )}
                    <div className="absolute top-4 left-4 p-3 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md rounded-xl border border-black/5 dark:border-white/5 text-center min-w-[60px]">
                      <span className="block text-2xl font-black text-zinc-900 dark:text-white leading-none">{date.day}</span>
                      <span className="block text-[9px] font-black uppercase tracking-widest text-uiupc-orange">{date.month}</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="space-y-3">
                    <h3 className="text-xl md:text-2xl font-black uppercase tracking-tighter text-zinc-900 dark:text-white leading-tight group-hover:text-uiupc-orange transition-colors">
                      {event.title}
                    </h3>
                    <div className="flex items-center gap-4 text-[10px] font-bold text-zinc-400">
                      <span className="flex items-center gap-1.5">
                        <FaCalendarAlt className="text-[8px] text-uiupc-orange" />
                        {new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                      </span>
                      {event.location && (
                        <span className="flex items-center gap-1.5">
                          <FaMapMarkerAlt className="text-[8px] text-uiupc-orange" />
                          {event.location}
                        </span>
                      )}
                    </div>
                    {event.description && (
                      <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                        {event.description}
                      </p>
                    )}
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default UpcomingEvents;
