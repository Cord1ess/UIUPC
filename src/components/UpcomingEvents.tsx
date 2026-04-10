"use client";

import React from 'react';
import Link from 'next/link';
import { FaCalendarAlt, FaMapMarkerAlt, FaUsers, FaArrowRight, FaClock, FaImage } from 'react-icons/fa';

interface EventData {
  id: string | number;
  title: string;
  subtitle?: string;
  status?: string;
  chapter?: string;
  date: string;
  time?: string;
  location: string;
  entryFee?: string;
  description: string;
  image?: string;
  registrationLink?: string;
}

interface UpcomingEventsProps {
  events: EventData[];
}

const UpcomingEvents: React.FC<UpcomingEventsProps> = ({ events }) => {
  const upcomingEvents = events.slice(0, 3);

  const getStatusColorClasses = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-amber-100 text-amber-600 border border-amber-200';
      case 'ongoing':
        return 'bg-emerald-100 text-emerald-600 border border-emerald-200';
      case 'completed':
        return 'bg-gray-100 text-gray-600 border border-gray-200';
      default:
        return 'bg-uiupc-orange/10 text-uiupc-orange border border-uiupc-orange/20';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'Upcoming';
      case 'ongoing':
        return 'Ongoing';
      case 'completed':
        return 'Completed';
      default:
        return status;
    }
  };

  const getEventImage = (event: EventData) => {
    if (event.image && event.image.startsWith('http')) {
      return event.image;
    }
    
    const title = event.title?.toLowerCase() || '';
    if (title.includes('workshop')) {
      return 'https://images.unsplash.com/photo-1551818255-e6e10975bc17?auto=format&fit=crop&w=800&q=80';
    } else if (title.includes('exhibition')) {
      return 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=800&q=80';
    } else if (title.includes('shutter')) {
      return 'https://res.cloudinary.com/do0e8p5d2/image/upload/v1762799836/Blog5_lbkrue.png';
    } else if (title.includes('iftar')) {
      return 'https://res.cloudinary.com/do0e8p5d2/image/upload/v1772527923/Post_air114.jpg';
    } else if (title.includes('member')) {
      return 'https://res.cloudinary.com/do0e8p5d2/image/upload/v1772526242/Artboard_1-100_u1jtvp.jpg';
    } else {
      return 'https://res.cloudinary.com/do0e8p5d2/image/upload/v1763054814/uiupc_HeroSlider1_d9kprm.jpg';
    }
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const defaultImages = [
      'https://res.cloudinary.com/do0e8p5d2/image/upload/v1763054814/uiupc_HeroSlider1_d9kprm.jpg',
      'https://images.unsplash.com/photo-1563089144-8c600a727265?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1551818255-e6e10975bc17?auto=format&fit=crop&w=800&q=80'
    ];
    const randomImage = defaultImages[Math.floor(Math.random() * defaultImages.length)];
    (e.target as HTMLImageElement).src = randomImage;
  };

  return (
    <section className="w-full py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
        {upcomingEvents.map((event) => (
          <div 
            key={event.id} 
            className="group relative bg-white border border-black/10 flex flex-col transition-all duration-300 hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[6px_6px_0_rgba(0,0,0,0.1)] hover:border-uiupc-orange"
          >
            {/* Badges */}
            <div className="absolute top-4 left-4 z-20 flex gap-2">
              <span className={`px-2 py-0.5 text-[10px] font-black uppercase tracking-widest ${getStatusColorClasses(event.status || 'upcoming')}`}>
                {getStatusText(event.status || 'upcoming')}
              </span>
              <span className="px-2 py-0.5 bg-black text-white text-[10px] font-black uppercase tracking-widest">
                {event.chapter || 'Main'}
              </span>
            </div>

            {/* Image Section */}
            <div className="relative h-56 overflow-hidden bg-gray-100">
              <img 
                src={getEventImage(event)} 
                alt={event.title}
                onError={handleImageError}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/20 z-10" />
            </div>

            {/* Content Section */}
            <div className="p-10 flex-1 flex flex-col">
              <h3 className="text-2xl font-black text-uiupc-orange uppercase tracking-tighter leading-none mb-1 break-words">
                {event.title}
              </h3>
              <p className="text-sm text-gray-400 font-black uppercase tracking-widest mb-4">{event.subtitle || ''}</p>

              <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 border border-black/5">
                <div className="flex gap-2">
                  <FaCalendarAlt className="text-uiupc-orange mt-1 text-xs" />
                  <div>
                    <span className="block text-[10px] text-gray-400 uppercase font-black tracking-widest">Date</span>
                    <span className="block text-xs text-black font-black uppercase">{event.date}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <FaClock className="text-uiupc-orange mt-1 text-xs" />
                  <div>
                    <span className="block text-[10px] text-gray-400 uppercase font-black tracking-widest">Time</span>
                    <span className="block text-xs text-black font-black uppercase">{event.time || 'TBA'}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <FaMapMarkerAlt className="text-uiupc-orange mt-1 text-xs" />
                  <div>
                    <span className="block text-[10px] text-gray-400 uppercase font-black tracking-widest">Venue</span>
                    <span className="block text-xs text-black font-black uppercase truncate max-w-[80px]">{event.location}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <FaUsers className="text-uiupc-orange mt-1 text-xs" />
                  <div>
                    <span className="block text-[10px] text-gray-400 uppercase font-black tracking-widest">Entry</span>
                    <span className="block text-xs text-black font-black uppercase">{event.entryFee || 'Free'}</span>
                  </div>
                </div>
              </div>

              <p className="text-gray-600 text-sm mb-6 flex-1 line-clamp-3 font-medium border-l-2 border-uiupc-orange/20 pl-4">
                {event.description}
              </p>

              <div className="flex gap-4">
                <Link 
                  href={`/events/${event.id}`} 
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-uiupc-orange text-white text-[10px] font-black uppercase tracking-widest border border-uiupc-orange transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_rgba(0,0,0,0.1)] active:translate-x-0 active:translate-y-0"
                >
                  Details <FaArrowRight />
                </Link>
                {event.registrationLink && event.registrationLink !== '#' && (
                  <a 
                    href={event.registrationLink} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-transparent text-uiupc-orange text-[10px] font-black uppercase tracking-widest border-2 border-uiupc-orange transition-all hover:bg-uiupc-orange hover:text-white hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_rgba(0,0,0,0.1)] active:translate-x-0 active:translate-y-0"
                  >
                    Register
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {upcomingEvents.length === 0 && (
        <div className="bg-white border-2 border-black/10 py-16 px-8 text-center">
          <div className="text-6xl mb-6 grayscale opacity-20">📸</div>
          <h3 className="text-3xl font-black text-black uppercase tracking-tighter mb-4">No Upcoming Events</h3>
          <p className="text-gray-500 font-bold mb-8 max-w-sm mx-auto">Stay tuned for exciting photography events and workshops!</p>
          <Link 
            href="/events" 
            className="inline-flex px-8 py-4 border-2 border-uiupc-orange text-uiupc-orange font-black uppercase tracking-widest hover:bg-uiupc-orange hover:text-white transition-all"
          >
            Browse Past Events
          </Link>
        </div>
      )}
    </section>
  );
};

export default UpcomingEvents;
