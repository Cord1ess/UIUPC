import React, { Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { FaTrophy, FaEye, FaArrowRight, FaCalendarAlt, FaMapMarkerAlt, FaHistory, FaStar } from 'react-icons/fa';
import { fetchAllEvents } from '@/lib/fetchers';
import { getImageUrl } from '@/utils/imageUrl';
import CountdownTimer from '@/components/shared/CountdownTimer';
import ScrollRevealText from '@/components/motion/ScrollRevealText';

import EventsSkeleton from '@/features/events/components/EventsSkeleton';
import EventMapWrapper from '@/features/events/components/EventMapWrapper';

import EventSuspense from '@/features/events/components/EventSuspense';

const EventsPage = () => {
  return (
    <div className="min-h-screen bg-[#f9f5ea] dark:bg-[#121212] transition-colors duration-500 pb-20">
      <EventSuspense>
        <EventsContent />
      </EventSuspense>
    </div>
  );
};

const EventsContent = async () => {
  const allEvents = await fetchAllEvents();
  
  // Categorization Logic
  const upcomingEvents = allEvents.filter(e => e.status === 'upcoming' || e.status === 'ongoing');
  const recentlyEnded = allEvents.filter(e => e.status === 'completed').slice(0, 1);
  const archive = allEvents.filter(e => e.status === 'completed').slice(recentlyEnded.length);
  
  const flagship = upcomingEvents[0] || {
    id: "recruitment-2026",
    title: "Member Recruitment 2026",
    subtitle: "Join the Legacy",
    date: "May 15, 2026",
    location: "UIU Campus",
    description: "Start your journey in visual storytelling with UIUPC. We are looking for passionate individuals to join our creative family.",
    status: 'upcoming',
    image: "https://images.unsplash.com/photo-1542038784456-1ea8e935640e"
  };

  const endedEvent = recentlyEnded[0] || {
    id: "shutter-stories",
    title: "Shutter Stories Chapter IV",
    date: "December 17, 2025",
    location: "UIU Multipurpose Hall",
    description: "National Photography Exhibition concluded with grand success.",
    status: 'completed',
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32"
  };

  return (
    <>
      {/* ── ZONE 0: INTERACTIVE MAP (ENTRY) ────────────────────────── */}
      <section id="map" className="w-full pt-32 md:pt-24 px-6 md:pb-8">
        <div className="max-w-7xl mx-auto">
          <div className="w-full h-[75vh] md:h-[600px] relative">
             <EventMapWrapper events={allEvents} />
          </div>
        </div>
      </section>

      {/* ── ZONE 1: UPCOMING EVENTS ─────────────────────────────────── */}
      <section id="upcoming" className="py-12 md:py-20 px-6">

        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <ScrollRevealText 
              text="Check our upcoming events"
              as="h2"
              className="text-4xl md:text-6xl font-black text-zinc-900 dark:text-white uppercase tracking-tighter"
            />
          </div>

          {/* Upcoming Event (NO CARD - DIRECT ON BACKGROUND) */}
          <div className="relative flex flex-col md:flex-row items-center gap-12 md:gap-20 transition-all">
            <div className="w-full md:w-[600px] aspect-square relative rounded-2xl overflow-hidden shadow-2xl">
              <Image 
                src={flagship.image ? getImageUrl(flagship.image, 1000, 85) : ''}
                alt={flagship.title}
                fill
                className="object-cover transition-transform duration-1000 group-hover:scale-110"
                priority={upcomingEvents.length > 0}
              />
              <div className="absolute top-6 left-6">
                <span className="px-4 py-2 bg-uiupc-orange text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg">
                  Next Up
                </span>
              </div>
            </div>

            <div className="flex-1 flex flex-col justify-center text-center md:text-left">
              <ScrollRevealText 
                text={flagship.title}
                as="h3"
                className="text-4xl md:text-5xl font-black text-zinc-900 dark:text-white uppercase tracking-tighter mb-6 leading-none"
              />
              <div className="flex flex-wrap justify-center md:justify-start gap-4 mb-8">
                <div className="flex items-center gap-2 text-xs font-bold text-zinc-500 dark:text-zinc-400">
                  <FaCalendarAlt className="text-uiupc-orange" /> {flagship.date}
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-zinc-500 dark:text-zinc-400">
                  <FaMapMarkerAlt className="text-uiupc-orange" /> {flagship.location || 'UIU Campus'}
                </div>
              </div>
              
              <div className="mb-10 flex justify-center md:justify-start">
                <CountdownTimer targetDate="2026-05-15T10:00:00" />
              </div>

              <Link href={`/events/${flagship.id}`} className="px-12 py-5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-[11px] font-black uppercase tracking-widest rounded-xl hover:bg-uiupc-orange dark:hover:bg-uiupc-orange hover:text-white dark:hover:text-white transition-all shadow-xl group/btn active:scale-95 w-max">
                Register for Event <FaArrowRight className="inline ml-3 group-hover/btn:translate-x-2 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── ZONE 2: RECENTLY CONCLUDED ───────────────────────────────── */}
      <section id="concluded" className="py-12 md:py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-end justify-between gap-8 mb-16">
            <div className="max-w-2xl">
              <ScrollRevealText 
                text="Recently Concluded"
                as="h2"
                className="text-4xl md:text-6xl font-black text-zinc-900 dark:text-white uppercase tracking-tighter"
              />
            </div>
            <Link href="/results" className="group flex items-center gap-4 text-[11px] font-black uppercase tracking-widest text-zinc-500 hover:text-uiupc-orange transition-all">
              <FaTrophy className="text-uiupc-orange" /> Browse Event Results
            </Link>
          </div>

          {/* Recently Ended Spotlight (NO CARD - DIRECT ON BACKGROUND) */}
          <div className="flex flex-col lg:flex-row items-center gap-16 group">
             <div className="w-full lg:w-[600px] aspect-square relative rounded-2xl overflow-hidden shadow-2xl">
               <Image 
                src={endedEvent.image ? getImageUrl(endedEvent.image, 1000, 85) : ''}
                alt={endedEvent.title}
                fill
                className="object-cover transition-transform duration-1000 group-hover:scale-105"
               />
               <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/50 to-transparent" />
               <div className="absolute bottom-6 left-6">
                 <div className="px-4 py-2 bg-black/40 backdrop-blur-md border border-white/20 text-white text-[9px] font-black uppercase tracking-widest rounded-full">
                   Completed
                 </div>
               </div>
             </div>

             <div className="flex-1 space-y-8 text-center lg:text-left">
                <ScrollRevealText 
                  text={endedEvent.title}
                  as="h3"
                  className="text-4xl md:text-6xl font-black text-zinc-900 dark:text-white uppercase tracking-tighter leading-tight"
                />
                <p className="text-zinc-500 dark:text-zinc-400 text-sm md:text-base font-medium max-w-xl mx-auto lg:mx-0 leading-relaxed">
                  {endedEvent.description}
                </p>
                <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                  <Link href={`/events/${endedEvent.id}`} className="px-10 py-5 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white text-[11px] font-black uppercase tracking-widest rounded-xl hover:bg-uiupc-orange dark:hover:bg-uiupc-orange hover:text-white dark:hover:text-white transition-all shadow-md">
                    View Archival Gallery
                  </Link>
                  <Link href="/results" className="px-10 py-5 border border-zinc-200 dark:border-white/10 text-zinc-500 dark:text-zinc-400 text-[11px] font-black uppercase tracking-widest rounded-xl hover:border-uiupc-orange hover:text-uiupc-orange transition-all">
                    Results Breakdown
                  </Link>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* ── ZONE 3: THE VAULT ────────────────────────────────────────── */}
      <section id="vault" className="py-12 md:py-20 px-6">

        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <ScrollRevealText 
              text="The Vault"
              as="h2"
              className="text-5xl md:text-7xl font-black text-zinc-900 dark:text-white uppercase tracking-tighter"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {archive.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
            {archive.length === 0 && (
              <div className="lg:col-span-3 text-center py-24 border-2 border-dashed border-zinc-200 dark:border-white/10 rounded-[2.5rem]">
                <FaHistory className="text-5xl text-zinc-200 dark:text-zinc-800 mx-auto mb-6" />
                <p className="text-zinc-400 dark:text-zinc-500 font-black uppercase text-[10px] tracking-[0.3em]">
                  The Archival Vault is being indexed.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
};

const EventCard = ({ event }: { event: any }) => (
  <Link href={`/events/${event.id}`} className="group flex flex-col bg-white dark:bg-zinc-900/40 rounded-2xl border border-black/5 dark:border-white/5 overflow-hidden transition-all duration-500 hover:shadow-2xl dark:hover:shadow-uiupc-orange/10 hover:-translate-y-3">
    {/* 1:1 Image Header */}
    <div className="relative aspect-square overflow-hidden shadow-sm">
      <Image 
        src={event.image ? getImageUrl(event.image, 800, 80) : ''}
        alt={event.title}
        fill
        className="object-cover transition-transform duration-1000 group-hover:scale-110"
      />
      <div className="absolute top-6 right-6 px-3 py-1 bg-black/40 backdrop-blur-md text-white text-[8px] font-black uppercase tracking-widest rounded-full">
        {event.chapter || 'Legacy'}
      </div>
    </div>
    
    <div className="p-6 md:p-10 flex flex-col flex-grow">
      <h3 className="text-2xl font-black text-zinc-900 dark:text-white uppercase tracking-tighter mb-4 group-hover:text-uiupc-orange transition-colors">
        {event.title}
      </h3>
      <div className="flex flex-col gap-3 mb-8">
        <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
          <FaCalendarAlt className="text-uiupc-orange/40" /> {event.date}
        </div>
        <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
          <FaMapMarkerAlt className="text-uiupc-orange/40" /> {event.location || 'UIU'}
        </div>
      </div>
      <div className="mt-auto pt-8 border-t border-black/5 dark:border-white/5 flex items-center justify-between">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-uiupc-orange group-hover:translate-x-3 transition-transform">
          Detailed Archive
        </span>
        <FaArrowRight className="text-uiupc-orange" />
      </div>
    </div>
  </Link>
);

export default EventsPage;
