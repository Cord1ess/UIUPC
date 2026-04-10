"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUpcomingEvents } from '@/hooks/useFirebaseData';

const RedesignHome = () => {
  const { events, isLoading: eventsLoading } = useUpcomingEvents();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-uiupc-white text-uiupc-navy-deep font-sans selection:bg-uiupc-orange selection:text-white">
      {/* Background Blueprint Canvas */}
      <div className="fixed inset-0 pointer-events-none bg-blueprint-intersect opacity-70"></div>

      <div className="relative z-10">
        
        {/* Navigation / Header Area - Minimalist */}
        <header className="border-b border-uiupc-navy-deep/20 bg-uiupc-white/90 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-uiupc-orange rounded-none flex justify-center items-center font-bold text-white tracking-tighter">
                UIUPC
              </div>
              <span className="font-semibold text-lg tracking-tight uppercase">Photography Club</span>
            </div>
            <nav className="hidden md:flex gap-8 font-medium text-sm">
              <Link href="#" className="hover:text-uiupc-orange transition-colors uppercase tracking-widest text-xs">Events</Link>
              <Link href="#" className="hover:text-uiupc-orange transition-colors uppercase tracking-widest text-xs">Gallery</Link>
              <Link href="#" className="hover:text-uiupc-orange transition-colors uppercase tracking-widest text-xs">Committee</Link>
            </nav>
            <Link href="/join" className="border-2 border-uiupc-navy-deep px-5 py-2 text-sm font-bold uppercase tracking-widest hover:bg-uiupc-orange hover:border-uiupc-orange hover:text-white transition-all">
              Join Us
            </Link>
          </div>
        </header>

        {/* Hero Section */}
        <section className="pt-24 pb-20 px-6 lg:px-12 relative border-b border-uiupc-navy-deep/20">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-center">
              <div className="space-y-6">
                <div className="inline-block border border-uiupc-orange text-uiupc-orange px-3 py-1 text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase">
                  Est. 2013 • United Intl. University
                </div>
                <h1 className="text-5xl md:text-7xl font-black leading-[0.9] tracking-tight text-uiupc-navy-deep">
                  FOCUS<br/>
                  <span className="text-uiupc-orange block mt-2">BEYOND.</span>
                </h1>
                <p className="text-lg text-uiupc-navy-light max-w-lg font-medium leading-relaxed border-l-4 border-uiupc-navy-deep pl-5">
                  We are a community of visual storytellers, documenting reality and engineering art.
                </p>
                <div className="flex flex-wrap gap-4 pt-6">
                  <Link href="/events" className="bg-uiupc-navy-deep text-white px-6 py-3 font-bold tracking-widest uppercase text-sm border-2 border-uiupc-navy-deep hover:bg-uiupc-orange hover:border-uiupc-orange transition-all flex items-center gap-2">
                    Latest Events
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                  </Link>
                  <Link href="/gallery" className="bg-transparent text-uiupc-navy-deep px-6 py-3 font-bold tracking-widest uppercase text-sm border-2 border-uiupc-navy-deep hover:bg-uiupc-navy-deep hover:text-white transition-all">
                    View Gallery
                  </Link>
                </div>
              </div>

              {/* Hero Blueprint Graphic */}
              <div className="relative w-full aspect-square md:aspect-[4/3] border-[3px] border-uiupc-navy-deep bg-uiupc-white p-3 mt-8 lg:mt-0">
                <div className="w-full h-full relative overflow-hidden bg-uiupc-navy-deep flex items-center justify-center">
                    <img src="https://res.cloudinary.com/do0e8p5d2/image/upload/v1763054814/uiupc_HeroSlider1_d9kprm.jpg" alt="Photography Club Activity" className="object-cover w-full h-full opacity-80 mix-blend-luminosity hover:mix-blend-normal transition-all duration-700" />
                    
                    {/* Architectural Crosshairs */}
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="absolute top-1/2 left-0 w-full h-px bg-uiupc-white/30"></div>
                      <div className="absolute left-1/2 top-0 w-px h-full bg-uiupc-white/30"></div>
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 border border-uiupc-orange"></div>
                    </div>
                </div>
                {/* Decorative blueprint markers */}
                <div className="absolute -top-3 -left-3 w-6 h-6 border-l-2 border-t-2 border-uiupc-orange"></div>
                <div className="absolute -bottom-3 -right-3 w-6 h-6 border-r-2 border-b-2 border-uiupc-orange"></div>
                <div className="absolute top-2 -right-12 text-xs font-mono tracking-widest text-uiupc-navy-light transform rotate-90 origin-left">
                  FIG 01. EXPOSURE
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Bento Grid layout for content */}
        <section className="py-20 px-6 lg:px-12 border-b border-uiupc-navy-deep/20">
          <div className="max-w-7xl mx-auto">
            
            <div className="flex items-end justify-between mb-10">
              <div>
                <h2 className="text-3xl font-black tracking-tight uppercase text-uiupc-navy-deep mb-3">Systems & Updates</h2>
                <div className="w-16 h-1 bg-uiupc-orange"></div>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              
              {/* Main Bento Card (Events) */}
              <div className="lg:col-span-2 border-2 border-uiupc-navy-deep bg-uiupc-white p-8 sm:p-10 relative flex flex-col group hover:border-uiupc-orange transition-colors">
                <div className="hidden sm:block absolute top-0 right-0 p-3 border-l-2 border-b-2 border-uiupc-navy-deep group-hover:border-uiupc-orange transition-colors">
                  <span className="text-[10px] font-bold tracking-widest uppercase">Log.Events</span>
                </div>
                
                <h3 className="text-2xl font-bold mb-8 uppercase tracking-wide sm:pr-24">Upcoming Operations</h3>
                
                <div className="flex-grow flex flex-col justify-between space-y-6">
                  {eventsLoading ? (
                    <div className="h-32 flex items-center text-sm font-mono tracking-widest uppercase animate-pulse">Loading feed...</div>
                  ) : events && events.length > 0 ? (
                    events.slice(0,2).map(event => (
                      <div key={event.id} className="border-2 border-uiupc-navy-deep/20 p-4 sm:p-6 flex flex-col sm:flex-row gap-6 items-start hover:bg-uiupc-navy-deep/5 transition-colors">
                        <div className="w-full sm:w-24 flex flex-row sm:flex-col justify-start sm:justify-center items-center text-left sm:text-center border-b sm:border-b-0 sm:border-r border-uiupc-navy-deep/20 pb-4 sm:pb-0 sm:pr-6 gap-3 sm:gap-1">
                           <span className="text-uiupc-orange font-black text-3xl leading-none">{new Date(event.date).getDate()}</span>
                           <span className="text-xs font-bold uppercase tracking-[0.2em]">{new Date(event.date).toLocaleString('default', { month: 'short' })}</span>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-xl mb-2">{event.title}</h4>
                          <p className="text-sm font-medium text-uiupc-navy-light mb-4">{event.location}</p>
                          <Link href={`/events/${event.id}`} className="text-xs font-bold tracking-widest uppercase text-uiupc-orange flex items-center gap-2 hover:gap-3 transition-all w-max border-b-2 border-transparent hover:border-uiupc-orange pb-1">
                            Details <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                          </Link>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="border-2 border-uiupc-navy-deep/20 p-8 text-sm font-bold uppercase tracking-widest text-uiupc-navy-light flex items-center gap-4 bg-uiupc-navy-deep/5">
                      <div className="w-3 h-3 bg-uiupc-orange rounded-none animate-pulse"></div>
                      Awaiting signal. No upcoming events.
                    </div>
                  )}
                </div>
              </div>

              {/* Secondary Bento Grid Items */}
              <div className="grid grid-rows-2 gap-8">
                
                {/* Stats Card */}
                <div className="border-2 border-uiupc-navy-deep bg-uiupc-navy-deep text-white p-8 relative flex flex-col justify-center group overflow-hidden">
                   <div className="absolute top-0 right-0 p-3 border-l-2 border-b-2 border-white/20">
                    <span className="text-[10px] font-bold tracking-widest uppercase text-white/50">Metrics</span>
                  </div>
                  <div className="z-10 relative">
                    <div className="text-5xl lg:text-6xl font-black text-uiupc-orange mb-3 group-hover:-translate-y-1 transition-transform origin-left">2.5K+</div>
                    <div className="text-sm font-bold uppercase tracking-widest text-white/90">Active Shutterbugs</div>
                    <div className="w-full h-px bg-white/20 my-5"></div>
                    <div className="text-sm font-bold uppercase tracking-widest text-white/90 flex justify-between items-center">
                      <span>Events</span>
                      <span className="text-uiupc-orange text-lg">150+</span>
                    </div>
                  </div>
                </div>

                {/* Call to action generic card */}
                <div className="border-2 border-uiupc-navy-deep bg-uiupc-orange p-8 relative flex flex-col justify-center group overflow-hidden">
                  {/* Decorative background grid in card */}
                  <div className="absolute inset-0 bg-blueprint-grid opacity-20 pointer-events-none"></div>
                  <h3 className="text-white text-3xl font-black uppercase leading-[1.1] relative text-shadow-sm mb-2">Join the<br/>Community</h3>
                  <Link href="/join" className="mt-8 inline-flex items-center gap-3 text-uiupc-navy-deep font-bold text-sm tracking-widest uppercase border-b-[3px] border-uiupc-navy-deep pb-1 w-max relative group-hover:border-white group-hover:text-white transition-colors">
                    Apply Now
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                  </Link>
                </div>

              </div>

            </div>
          </div>
        </section>

      </div>
    </div>
  );
};

export default RedesignHome;
