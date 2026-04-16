import React from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import ModernHero from '@/components/hero/ModernHero';
import ScrollRevealText from '@/components/home/ScrollRevealText';
import { FaUserPlus, FaArrowRight } from 'react-icons/fa';

// Phase 2: Dynamic Imports for Below-the-Fold components
// This drastically reduces the initial JS parsing payload.
const Milestones = dynamic(() => import('@/components/home/Milestones'));
const EventAccordion = dynamic(() => import('@/components/home/EventAccordion'));
const UpcomingEventsSection = dynamic(() => import('@/components/home/UpcomingEventsSection'));
const FeaturedGallerySection = dynamic(() => import('@/components/home/FeaturedGallerySection'));

const Home = () => {
  return (
    <div className="relative min-h-screen overflow-x-hidden font-sans transition-colors duration-300">
      <div className="relative z-10 flex flex-col gap-16 md:gap-24">
        {/* Section 1: Hero */}
        <ModernHero />

        {/* Section 2: Milestones */}
        <Milestones />

        {/* Section 3: Event Strips (Horizontal Accordion) */}
        <section className="px-6">
          <div className="max-w-7xl mx-auto mb-10">
             <ScrollRevealText 
                text="OUR FLAGSHIP EVENTS" 
                className="text-4xl md:text-5xl font-black text-black dark:text-white uppercase tracking-tighter mb-4"
             />
             <div className="w-16 h-1 bg-uiupc-orange mb-6"></div>
             <p className="text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest text-xs max-w-2xl">
                Explore the diverse range of photography experiences we offer year-round.
             </p>
          </div>
          <EventAccordion />
        </section>
        
        {/* Section 4: Upcoming Events */}
        <section className="w-full px-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-10">
              <ScrollRevealText 
                text="UPCOMING EXPERIENCES" 
                className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4 text-zinc-900 dark:text-white"
              />
              <div className="w-16 h-1 bg-uiupc-orange mb-6"></div>
              <p className="font-bold uppercase tracking-widest text-xs max-w-2xl text-zinc-500 dark:text-gray-400">
                Don't miss out on our next workshops, exhibitions, and photo-walks.
              </p>
            </div>
            
            <div className="mb-12">
              <UpcomingEventsSection />
            </div>

            <div className="text-center">
              <Link 
                href="/events" 
                className="group relative inline-flex items-center gap-3 px-10 py-4 font-black uppercase tracking-widest border-2 rounded-full transition-all bg-transparent text-zinc-900 border-zinc-900 hover:bg-zinc-900 hover:text-white dark:text-white dark:border-white dark:hover:bg-white dark:hover:text-black"
              >
                View Event Calendar
                <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </section>
        
        {/* Section 5: Gallery Section */}
        <section className="w-full px-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-10">
               <ScrollRevealText 
                  text="FEATURED GALLERY" 
                  className="text-4xl md:text-5xl font-black text-black dark:text-white uppercase tracking-tighter mb-4"
               />
               <div className="w-16 h-1 bg-uiupc-orange mb-6"></div>
               <p className="text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest text-xs max-w-2xl">
                  A curated selection of works from our talented photography community.
               </p>
            </div>
            <FeaturedGallerySection />
          </div>
        </section>
        
        {/* Section 6: Join Member Section */}
        <section className="w-full px-6 mb-16 md:mb-24">
          <div className="max-w-7xl mx-auto">
            <div className="py-16 px-6 text-center relative overflow-visible transition-colors duration-300">
              {/* Background accent */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-uiupc-orange/5 blur-[150px] rounded-full pointer-events-none" />

              <ScrollRevealText 
                text="JOIN THE FAMILY" 
                className="text-4xl md:text-7xl font-black uppercase tracking-tighter mb-8 relative z-10 block text-zinc-900 dark:text-white"
              />
              <p className="text-base md:text-lg font-bold mb-14 max-w-2xl mx-auto uppercase tracking-[0.2em] leading-relaxed relative z-10 text-zinc-500 dark:text-white/40">
                Begin your creative journey with United International University Photography Club.
              </p>
              
              <Link 
                href="/join" 
                className="inline-flex items-center gap-4 px-12 py-5 bg-uiupc-orange text-white font-black uppercase tracking-widest rounded-full transition-all hover:scale-105 shadow-xl hover:shadow-uiupc-orange/20 relative z-10"
              >
                <span>BECOME A MEMBER</span>
                <FaUserPlus className="text-xl" />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;
