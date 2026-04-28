"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaArrowRight } from "react-icons/fa";
import myLogo from "@/assets/UIUPC Logo.svg";

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const pathname = usePathname();
  const isAdminPage = pathname.startsWith('/admin') || pathname === '/studio';

  if (isAdminPage) return null;

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="relative bg-white dark:bg-zinc-950 border-t border-black/[0.03] dark:border-white/[0.05] pt-24 pb-12 px-6 overflow-hidden rounded-t-slight-lg transition-colors duration-300">
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-24">
          {/* Brand Section */}
          <div className="space-y-10">
            <Link href="/" className="flex items-center gap-5 group">
              <div className="w-16 h-16 transition-transform group-hover:scale-105">
                <img src={myLogo.src} alt="UIUPC Logo" className="w-full h-full object-contain" />
              </div>
              <div className="flex flex-col">
                <span className="text-4xl font-black text-black dark:text-white uppercase tracking-tighter leading-none">
                  UIUPC
                </span>
                <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.4em] mt-1">
                  UIU Photography club
                </span>
              </div>
            </Link>
            
            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-uiupc-orange">Location</h4>
              <p className="text-zinc-500 dark:text-zinc-400 font-medium text-sm leading-relaxed max-w-[240px]">
                UIU Campus, United City, Madani Ave, Dhaka 1212
              </p>
            </div>
          </div>

          {/* Column 2: Discover */}
          <div className="space-y-10">
            <h3 className="text-zinc-900 dark:text-white text-[10px] font-black uppercase tracking-[0.4em]">
              Discover
            </h3>
            <ul className="space-y-4">
              {[
                { name: 'Gallery', href: '/gallery' },
                { name: 'Events', href: '/events' },
                { name: 'Members', href: '/members' },
                { name: 'Blog', href: '/blog' },
              ].map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-zinc-500 hover:text-uiupc-orange dark:text-zinc-400 dark:hover:text-uiupc-orange text-[10px] font-black uppercase tracking-[0.2em] transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Impact */}
          <div className="space-y-10">
            <h3 className="text-zinc-900 dark:text-white text-[10px] font-black uppercase tracking-[0.4em]">
              Impact
            </h3>
            <ul className="space-y-4">
              {[
                { name: 'Join Club', href: '/join' },
                { name: 'Achievements', href: '/achievements' },
                { name: 'Event Results', href: '/results' },
                { name: 'Contact', href: '/contact' },
              ].map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-zinc-500 hover:text-uiupc-orange dark:text-zinc-400 dark:hover:text-uiupc-orange text-[10px] font-black uppercase tracking-[0.2em] transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Newsletter/Motto */}
          <div className="space-y-10">
            <h3 className="text-zinc-900 dark:text-white text-[10px] font-black uppercase tracking-[0.4em]">
              Motto
            </h3>
            <p className="text-zinc-500 dark:text-zinc-400 font-medium text-sm leading-relaxed">
              "Capturing Moments, Creating Memories at United International University."
            </p>
            <div className="flex gap-4">
               {/* Social placeholders could go here if needed, but keeping it clean as requested */}
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="pt-10 border-t border-black/5 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <p className="text-zinc-400 dark:text-zinc-500 text-[9px] font-black uppercase tracking-[0.3em]">
              &copy; {currentYear} UIUPC • Est. 2005
            </p>
            <span className="hidden md:block w-1 h-1 rounded-full bg-uiupc-orange/30" />
            <p className="text-zinc-400 dark:text-zinc-500 text-[9px] font-black uppercase tracking-[0.3em]">
              Made by Orange Marketers
            </p>
          </div>

          <button
            className="w-10 h-10 bg-zinc-100 dark:bg-zinc-900 text-zinc-400 dark:text-zinc-600 rounded-full flex items-center justify-center hover:bg-uiupc-orange hover:text-white transition-all active:scale-90"
            onClick={scrollToTop}
            aria-label="Back to top"
          >
            <FaArrowRight className="text-xs transition-transform -rotate-90 group-hover:-translate-y-1" />
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
