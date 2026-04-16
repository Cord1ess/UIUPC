"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaCalendarAlt, FaMapMarkerAlt, FaUsers, FaArrowRight, FaClock } from 'react-icons/fa';
import { useTheme } from '@/contexts/ThemeContext';

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
  const { theme } = useTheme();

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
      case 'upcoming': return 'Upcoming';
      case 'ongoing': return 'Ongoing';
      case 'completed': return 'Completed';
      default: return status;
    }
  };

  const displayEvents = events.length > 0 ? events : [
    {
      id: "recruitment-2026",
      title: "Member Recruitment 2026",
      subtitle: "Join the Legacy",
      status: "upcoming",
      chapter: "Main",
      date: "May 15, 2026",
      time: "10:00 AM",
      location: "UIU Campus",
      entryFee: "Free",
      description: "Join United International University Photography Club. Experience the art of capturing moments and become part of our creative family.",
      image: "https://res.cloudinary.com/do0e8p5d2/image/upload/v1772526242/Artboard_1-100_u1jtvp.jpg"
    },
    {
      id: "iftar-2026",
      title: "Iftar e Ziafat",
      subtitle: "Ramadan Special",
      status: "upcoming",
      chapter: "Social",
      date: "March 20, 2026",
      time: "05:30 PM",
      location: "Grand Hall",
      entryFee: "350 BDT",
      description: "A special iftar gathering for all members and alumni of UIUPC. Let's share a meal and stories under the evening sky.",
      image: "https://res.cloudinary.com/do0e8p5d2/image/upload/v1772527923/Post_air114.jpg"
    }
  ];

  const upcomingEvents = displayEvents.slice(0, 3);

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
        {upcomingEvents.map((event) => (
          <div 
            key={event.id} 
            className={`group relative ${theme === 'dark' ? 'bg-black' : 'bg-white'} flex flex-col transition-all duration-300 rounded-slight shadow-m3-1 dark:shadow-none hover:shadow-m3-3 dark:hover:shadow-uiupc-orange/10 hover:-translate-y-1 border ${theme === 'dark' ? 'border-white/5' : 'border-black/5'}`}
          >
            {/* Badges */}
            <div className="absolute top-4 left-4 z-20 flex gap-2">
              <span className={`px-2 py-0.5 text-[10px] font-black uppercase tracking-widest rounded-md ${getStatusColorClasses(event.status || 'upcoming')}`}>
                {getStatusText(event.status || 'upcoming')}
              </span>
              <span className="px-2 py-0.5 bg-zinc-900 dark:bg-zinc-800 text-white text-[10px] font-black uppercase tracking-widest rounded-md">
                {event.chapter || 'Main'}
              </span>
            </div>

            {/* Image Section */}
            <div className="relative h-56 overflow-hidden bg-zinc-100 dark:bg-zinc-800 rounded-t-slight">
              {event.image && (
                <Image 
                  src={event.image} 
                  alt={event.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
              )}
              <div className="absolute inset-0 bg-black/10 z-10" />
            </div>

            {/* Content Section */}
            <div className="p-8 flex-1 flex flex-col">
              <h3 className={`text-2xl font-black uppercase tracking-tighter leading-tight mb-2 break-all ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>
                {event.title}
              </h3>
              <p className="text-[10px] text-uiupc-orange font-black uppercase tracking-[0.2em] mb-4">{event.subtitle || ''}</p>

              <div className={`grid grid-cols-2 gap-x-4 gap-y-3 mb-6 p-0 border-t pt-4 ${theme === 'dark' ? 'border-white/5' : 'border-black/5'}`}>
                <div className="flex gap-2">
                  <FaCalendarAlt className="text-uiupc-orange mt-1 text-[10px]" />
                  <div>
                    <span className={`block text-[8px] uppercase font-bold tracking-widest ${theme === 'dark' ? 'text-zinc-500' : 'text-zinc-400'}`}>Date</span>
                    <span className={`block text-[10px] font-black uppercase tracking-tighter ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>{event.date}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <FaClock className="text-uiupc-orange mt-1 text-[10px]" />
                  <div>
                    <span className={`block text-[8px] uppercase font-bold tracking-widest ${theme === 'dark' ? 'text-zinc-500' : 'text-zinc-400'}`}>Time</span>
                    <span className={`block text-[10px] font-black uppercase tracking-tighter ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>{event.time || 'TBA'}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <FaMapMarkerAlt className="text-uiupc-orange mt-1 text-[10px]" />
                  <div>
                    <span className={`block text-[8px] uppercase font-bold tracking-widest ${theme === 'dark' ? 'text-zinc-500' : 'text-zinc-400'}`}>Venue</span>
                    <span className={`block text-[10px] font-black uppercase tracking-tighter truncate max-w-[80px] ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>{event.location}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <FaUsers className="text-uiupc-orange mt-1 text-[10px]" />
                  <div>
                    <span className={`block text-[8px] uppercase font-bold tracking-widest ${theme === 'dark' ? 'text-zinc-500' : 'text-zinc-400'}`}>Entry</span>
                    <span className={`block text-[10px] font-black uppercase tracking-tighter ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>{event.entryFee || 'Free'}</span>
                  </div>
                </div>
              </div>

              <p className={`text-[13px] mb-8 flex-1 line-clamp-2 leading-relaxed ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'}`}>
                {event.description}
              </p>

              <div className="flex gap-3">
                <Link 
                  href={`/events/${event.id}`} 
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-black dark:bg-zinc-800 text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-sm hover:shadow-md transition-all hover:bg-zinc-800 dark:hover:bg-zinc-700"
                >
                  Details <FaArrowRight />
                </Link>
                {event.registrationLink && event.registrationLink !== '#' && (
                  <a 
                    href={event.registrationLink} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-uiupc-orange text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-sm hover:shadow-md transition-all hover:brightness-110"
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
        <div className={`bg-white dark:bg-zinc-900 border border-black/5 dark:border-white/10 py-20 px-8 text-center rounded-slight shadow-m3-1 dark:shadow-none`}>
          <div className="text-6xl mb-6 grayscale opacity-20">📸</div>
          <h3 className="text-3xl font-black text-black dark:text-white uppercase tracking-tighter mb-4">No Upcoming Events</h3>
          <p className="text-gray-500 dark:text-gray-400 font-bold mb-8 max-w-sm mx-auto uppercase text-[10px] tracking-widest">Stay tuned for exciting photography events and workshops!</p>
          <Link 
            href="/events#hall-of-fame" 
            className="inline-flex px-8 py-4 border-2 border-uiupc-orange text-uiupc-orange font-black uppercase tracking-widest hover:bg-uiupc-orange hover:text-white transition-all rounded-full"
          >
            Browse Past Events
          </Link>
        </div>
      )}
    </div>
  );
};

export default UpcomingEvents;
