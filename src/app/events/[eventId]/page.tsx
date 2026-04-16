import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { FaCalendarAlt, FaMapMarkerAlt, FaMoneyBillWave, FaClock, FaTrophy, FaArrowLeft, FaPhoneAlt, FaEnvelope, FaUser } from 'react-icons/fa';
import { fetchEventById } from '@/lib/fetchers';
import { getCloudinaryUrl } from '@/components/hero/utils/constants';

interface EventDetailPageProps {
  params: Promise<{ eventId: string }>;
}

const EventDetailPage = async ({ params }: EventDetailPageProps) => {
  const { eventId } = await params;
  const event = await fetchEventById(eventId);

  // High-fidelity fallback/mock for common events if not in Firestore yet
  const mockData: Record<string, any> = {
    "shutter-stories": {
      id: "shutter-stories",
      title: "Shutter Stories Chapter IV",
      subtitle: "National Photography Exhibition",
      status: "completed",
      chapter: "Chapter IV",
      date: "Dec 14 - Dec 17, 2025",
      time: "9:00 AM - 8:00 PM",
      location: "UIU Multipurpose Hall",
      registrationLink: "/register/shutter-stories",
      entryFee: "Single Photo: 1020 BDT",
      deadline: "December 10, 2025",
      description: "The official national photography exhibition of UIUPC. A celebration of visual narratives from all across the country.",
      highlights: [
        "National-level participation from 50+ universities",
        "Expert jury panel featuring industry legends",
        "Exhibition at prestigious UIU Gallery",
        "Exclusive Photography Workshops",
        "Networking with professional photographers"
      ],
      image: "https://res.cloudinary.com/do0e8p5d2/image/upload/v1763223291/Blog_7_suqqrn.jpg",
      contact: {
        coordinator: "Md Mahmudul Hasan",
        email: "photographyclub@dccsa.uiu.ac.bd",
        phone: "+8801679861740"
      }
    }
  };

  const data = event || mockData[eventId];

  if (!data) {
    return notFound();
  }

  return (
    <div className="min-h-screen bg-[#f9f5ea] dark:bg-[#121212] transition-colors duration-500">
      {/* Back Button Overlay */}
      <div className="fixed top-24 left-6 z-50">
        <Link href="/events" className="p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-uiupc-orange transition-all flex items-center justify-center">
          <FaArrowLeft />
        </Link>
      </div>

      {/* --- HERO BANNER --- */}
      <section className="relative h-[60vh] min-h-[500px] w-full overflow-hidden">
        <Image 
          src={data.image ? getCloudinaryUrl(data.image, 1920, 'auto:best') : ''}
          alt={data.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#f9f5ea] via-[#f9f5ea]/20 to-transparent dark:from-[#121212] dark:via-[#121212]/40" />
        
        <div className="absolute bottom-0 left-0 w-full p-6 md:p-12">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-wrap gap-3 mb-6">
              <span className="px-4 py-1.5 rounded-full bg-uiupc-orange text-white text-[10px] font-black uppercase tracking-widest shadow-lg">
                {data.status || 'Archived'}
              </span>
              <span className="px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] font-black uppercase tracking-widest">
                {data.chapter}
              </span>
            </div>
            <h1 className="text-5xl md:text-8xl font-black text-zinc-900 dark:text-white uppercase tracking-tighter leading-[0.9] mb-4">
              {data.title}
            </h1>
            <p className="text-xl md:text-2xl font-serif italic text-zinc-600 dark:text-zinc-400">
              {data.subtitle}
            </p>
          </div>
        </div>
      </section>

      {/* --- CONTENT GRID --- */}
      <section className="px-6 py-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16">
          
          {/* Main Info Column */}
          <div className="lg:col-span-8 space-y-16">
            
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-zinc-200 dark:border-white/5">
              <DetailItem icon={<FaCalendarAlt />} title="Registration Dates" value={data.date} />
              <DetailItem icon={<FaClock />} title="Event Time" value={data.time || "Full Day Access"} />
              <DetailItem icon={<FaMapMarkerAlt />} title="Venue" value={data.location} />
              <DetailItem icon={<FaMoneyBillWave />} title="Entry Fee" value={data.entryFee || "Free Entry"} />
            </div>

            {/* About Section */}
            <div className="space-y-6">
              <h2 className="text-3xl font-black text-zinc-900 dark:text-white uppercase tracking-tighter">
                About the Event
              </h2>
              <div className="prose prose-zinc dark:prose-invert max-w-none text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">
                {data.description}
              </div>
            </div>

            {/* Highlights Section */}
            <div className="p-8 md:p-12 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-white/5 shadow-sm">
              <h2 className="text-2xl font-black text-zinc-900 dark:text-white uppercase tracking-tighter mb-8 flex items-center gap-3">
                <FaTrophy className="text-uiupc-orange" /> Event Highlights
              </h2>
              <ul className="space-y-4">
                {data.highlights?.map((item: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-4">
                    <div className="w-1.5 h-1.5 rounded-full bg-uiupc-orange mt-2 ring-4 ring-uiupc-orange/10" />
                    <span className="text-sm md:text-base text-zinc-600 dark:text-zinc-400 font-medium">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Sidebar Column */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* Action Card */}
            <div className="p-8 bg-zinc-900 dark:bg-zinc-950 rounded-3xl text-center space-y-6 shadow-2xl shadow-black/10">
              <h3 className="text-white text-xl font-black uppercase tracking-tighter">
                Ready to Join?
              </h3>
              <p className="text-white/50 text-xs font-medium leading-relaxed">
                The results for this event have been published. Stay tuned for the next grand chapter!
              </p>
              <div className="flex flex-col gap-3">
                <Link href="/results" className="w-full py-4 bg-uiupc-orange text-white text-[11px] font-black uppercase tracking-widest rounded-xl hover:scale-105 transition-all">
                  Check Results
                </Link>
                <Link href="/join" className="w-full py-4 bg-white/5 text-white border border-white/10 text-[11px] font-black uppercase tracking-widest rounded-xl hover:bg-white/10 transition-all">
                  Join the Club
                </Link>
              </div>
            </div>

            {/* Contact Card */}
            <div className="p-8 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-white/5">
              <h3 className="text-zinc-900 dark:text-white text-lg font-black uppercase tracking-tighter mb-6">
                Organization Team
              </h3>
              <div className="space-y-6">
                <ContactItem icon={<FaUser />} label="Coordinator" value={data.contact?.coordinator} />
                <ContactItem icon={<FaEnvelope />} label="Email" value={data.contact?.email} href={`mailto:${data.contact?.email}`} />
                <ContactItem icon={<FaPhoneAlt />} label="Phone" value={data.contact?.phone} href={`tel:${data.contact?.phone}`} />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

const DetailItem = ({ icon, title, value }: { icon: React.ReactNode, title: string, value: string }) => (
  <div className="flex gap-4">
    <div className="w-12 h-12 rounded-xl bg-uiupc-orange/10 flex items-center justify-center text-uiupc-orange text-xl shrink-0">
      {icon}
    </div>
    <div>
      <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-1">
        {title}
      </h4>
      <p className="text-sm font-bold text-zinc-900 dark:text-white">
        {value}
      </p>
    </div>
  </div>
);

const ContactItem = ({ icon, label, value, href }: { icon: React.ReactNode, label: string, value: string, href?: string }) => (
  <div className="flex items-center gap-4">
    <div className="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-white/5 flex items-center justify-center text-zinc-400 dark:text-zinc-500">
      {icon}
    </div>
    <div>
      <h4 className="text-[9px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
        {label}
      </h4>
      {href ? (
        <a href={href} className="text-xs font-bold text-zinc-900 dark:text-white hover:text-uiupc-orange transition-colors">
          {value}
        </a>
      ) : (
        <p className="text-xs font-bold text-zinc-900 dark:text-white">
          {value}
        </p>
      )}
    </div>
  </div>
);

export default EventDetailPage;
