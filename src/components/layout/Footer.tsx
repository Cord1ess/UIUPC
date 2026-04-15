"use client";

import React from "react";
import Link from "next/link";
import { FaArrowRight } from "react-icons/fa";
import myLogo from "@/assets/UIUPC Logo.svg";

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="relative bg-white dark:bg-zinc-950 border-t border-black/[0.03] dark:border-white/[0.05] py-24 px-6 overflow-hidden rounded-t-slight-lg shadow-m3-2 dark:shadow-none transition-colors duration-300">
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-24">
          {/* Brand Section */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-6 mb-10 group">
              <div className="w-14 h-14 bg-white dark:bg-zinc-900 shadow-m3-1 dark:shadow-none p-1 transition-all group-hover:shadow-m3-2 rounded-xl border border-black/[0.03] dark:border-white/[0.05]">
                <img src={myLogo.src} alt="UIUPC Logo" className="w-full h-full object-contain" />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-black text-black dark:text-white uppercase tracking-tighter">
                  UIU <span className="font-serif italic normal-case text-3xl tracking-normal px-0.5">Photography</span> Club
                </span>
                <span className="text-uiupc-orange text-[10px] font-black uppercase tracking-[0.3em]">United International University</span>
              </div>
            </Link>
            <p className="text-gray-500 dark:text-gray-400 font-medium text-lg max-w-lg leading-relaxed border-l-2 border-black/5 dark:border-white/5 pl-8 italic font-serif">
              "Capturing Moments, Creating Memories at United International
              University."
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-black dark:text-white text-xs font-black uppercase tracking-[0.3em] mb-10 opacity-30">
              EXPLORE
            </h3>
            <ul className="flex flex-col gap-4">
              {['Gallery', 'Events', 'Members', 'Blog', 'About Us'].map((item) => (
                <li key={item}>
                  <Link 
                    href={`/${item.toLowerCase().replace(' ', '')}`} 
                    className="flex items-center gap-2 text-black/50 dark:text-white/40 hover:text-black dark:hover:text-white font-black uppercase tracking-widest text-[10px] transition-all hover:translate-x-1"
                  >
                    <span>{item}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h3 className="text-black dark:text-white text-xs font-black uppercase tracking-[0.3em] mb-10 opacity-30">
              ENGAGE
            </h3>
            <ul className="flex flex-col gap-4">
              <li>
                <Link href="/join" className="flex items-center gap-2 text-black/50 dark:text-white/40 hover:text-black dark:hover:text-white font-black uppercase tracking-widest text-[10px] transition-all hover:translate-x-1">
                  <span>Join Membership</span>
                </Link>
              </li>
              <li>
                <Link href="/contact" className="flex items-center gap-2 text-black/50 dark:text-white/40 hover:text-black dark:hover:text-white font-black uppercase tracking-widest text-[10px] transition-all hover:translate-x-1">
                  <span>Contact Inquiry</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="pt-12 border-t border-black/5 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
          <p className="text-gray-400 dark:text-gray-500 text-[10px] font-black uppercase tracking-widest">
            &copy; {currentYear} UIU Photography Club • Established 2005
          </p>
          
          <div className="flex items-center gap-8">
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-black/20 dark:text-white/10">
              Visual Excellence • Technical Mastery
            </p>
            <button
              className="w-12 h-12 bg-black dark:bg-zinc-800 text-white rounded-full shadow-m3-1 flex items-center justify-center -rotate-90 hover:shadow-m3-3 transition-all hover:-translate-y-1 active:scale-95 border border-white/5"
              onClick={scrollToTop}
              aria-label="Back to top"
            >
              <FaArrowRight className="text-xs" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
