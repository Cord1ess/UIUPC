// src/app/page.tsx
"use client";

import React from 'react';
import Link from 'next/link';
import ModernHero from '@/components/hero/ModernHero';
import HeroSlider from '@/components/HeroSlider';
import PhotoShowcase from '@/components/PhotoShowcase';
import UpcomingEvents from '@/components/UpcomingEvents';
import Stats from '@/components/Stats';
import { useFeaturedPhotos, useUpcomingEvents } from '@/hooks/useFirebaseData';

const Home = () => {
  const { featuredPhotos, isLoading: photosLoading } = useFeaturedPhotos();
  const { events, isLoading: eventsLoading } = useUpcomingEvents();

  return (
    <div className="relative min-h-screen bg-uiupc-white overflow-x-hidden font-sans">
      {/* Unified Background Grid */}
      <div className="absolute inset-0 bg-grid-giant opacity-[0.03] pointer-events-none z-0" />
      
      <div className="relative z-10 flex flex-col">
          <ModernHero />

        <section className="w-full border-b border-black/10">
          <HeroSlider />
        </section>
        
        {/* Welcome Section - Professional Spacing */}
        <section className="w-full py-20 md:py-24 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white border border-black/10 p-10 md:p-20 text-center transition-all duration-300 hover:border-uiupc-orange/50 shadow-sm hover:shadow-[8px_8px_0_rgba(0,0,0,0.05)]">
              <h2 className="text-4xl md:text-5xl font-black text-black leading-tight mb-8 relative inline-block uppercase tracking-tighter">
                welcome to uiupc
                <div className="absolute -bottom-4 left-0 w-full h-1 bg-uiupc-orange" />
              </h2>
              <p className="block text-uiupc-orange font-bold uppercase tracking-widest mb-10 mt-6 text-lg md:text-xl">
                Capturing Moments, Creating Memories
              </p>
              <div className="max-w-4xl mx-auto">
                <p className="text-gray-700 text-lg md:text-xl leading-relaxed font-medium">
                  We are a community of passionate photographers at United International University 
                  dedicated to exploring the art of photography, sharing knowledge, and capturing 
                  the beautiful moments of campus life and beyond.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="w-full py-16">
          <Stats />
        </section>
        
        {/* Gallery Section */}
        <section className="w-full py-16 border-y border-black/5 bg-white/50">
          <PhotoShowcase photos={featuredPhotos} />
        </section>
        
        {/* Events Section - Structured Spacing */}
        <section className="w-full py-20 md:py-24 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-black text-black uppercase tracking-tighter mb-4">
                Upcoming Events
              </h2>
              <p className="text-gray-500 text-lg font-bold uppercase tracking-widest border-t-2 border-uiupc-orange w-max mx-auto pt-4 mt-4">
                Club Workshops and Exhibitions
              </p>
            </div>
            
            <div className="mb-12">
              {eventsLoading ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white border border-black/10">
                  <div className="w-12 h-12 border-4 border-uiupc-orange/20 border-t-uiupc-orange rounded-full animate-spin mb-4" />
                  <p className="text-black font-bold uppercase tracking-wide">Loading Event Data...</p>
                </div>
              ) : (
                <UpcomingEvents events={events} />
              )}
            </div>

            <div className="text-center">
              <Link 
                href="/events" 
                className="group relative inline-flex items-center gap-3 px-10 py-5 bg-transparent text-uiupc-orange font-black uppercase tracking-widest border-2 border-uiupc-orange transition-all hover:bg-uiupc-orange hover:text-white hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[4px_4px_0_rgba(0,0,0,0.1)] active:translate-x-0 active:translate-y-0"
              >
                Explore All Events
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="group-hover:translate-x-1 transition-transform">
                  <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
            </div>
          </div>
        </section>
        
        {/* Grand CTA Section */}
        <section className="w-full py-24 md:py-32 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="bg-black text-white p-12 md:p-24 text-center relative overflow-hidden border border-white/10 shadow-2xl">
              <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-8 relative z-10">
                Ready to Join <span className="text-uiupc-orange">The Community?</span>
              </h2>
              <p className="text-white/70 text-lg font-bold mb-12 max-w-2xl mx-auto uppercase tracking-widest leading-relaxed relative z-10">
                Begin your creative journey with United International University Photography Club.
              </p>
              <Link 
                href="/join" 
                className="inline-flex items-center gap-3 px-10 py-5 bg-uiupc-orange text-white font-black uppercase tracking-widest transition-all hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[6px_6px_0_rgba(255,255,255,0.1)] active:translate-x-0 active:translate-y-0 relative z-10"
              >
                <span>Join UIUPC Today</span>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M8.5 11C10.7091 11 12.5 9.20914 12.5 7C12.5 4.79086 10.7091 3 8.5 3C6.29086 3 4.5 4.79086 4.5 7C4.5 9.20914 6.29086 11 8.5 11Z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;
