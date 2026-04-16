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
              <div className="w-14 h-14 transition-transform group-hover:scale-105">
                <img src={myLogo.src} alt="UIUPC Logo" className="w-full h-full object-contain" />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-black text-black dark:text-white uppercase tracking-tighter">
                  UIU PHOTOGRAPHY CLUB
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
            <ul className="flex flex-wrap gap-3">
              {['Gallery', 'Events', 'Members', 'Blog', 'About Us'].map((item) => (
                <li key={item}>
                  <Link 
                    href={`/${item.toLowerCase().replace(' ', '')}`} 
                    className="inline-flex items-center justify-center px-5 py-2.5 bg-black/5 dark:bg-white/5 hover:bg-uiupc-orange dark:hover:bg-uiupc-orange text-zinc-600 dark:text-zinc-300 hover:text-white dark:hover:text-white font-black uppercase tracking-widest text-[9px] rounded-full transition-all border border-black/5 dark:border-white/5 hover:border-uiupc-orange dark:hover:border-uiupc-orange shadow-sm"
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
            <ul className="flex flex-col sm:flex-row md:flex-col gap-3">
              <li>
                <Link href="/join" className="inline-flex w-full items-center justify-center gap-2 px-5 py-3 bg-black dark:bg-white text-white dark:text-black font-black uppercase tracking-widest text-[10px] rounded-full transition-all hover:bg-uiupc-orange dark:hover:bg-uiupc-orange dark:hover:text-white shadow-m3-1">
                  <span>Join Membership</span>
                </Link>
              </li>
              <li>
                <Link href="/contact" className="inline-flex w-full items-center justify-center gap-2 px-5 py-3 bg-transparent border-2 border-black dark:border-white text-black dark:text-white font-black uppercase tracking-widest text-[10px] rounded-full transition-all hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black shadow-none">
                  <span>Contact Inquiry</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="pt-10 border-t border-black/5 dark:border-white/5 relative flex justify-center items-center h-16">
          <p className="text-gray-400 dark:text-gray-500 text-[10px] font-black uppercase tracking-widest text-center px-16">
            &copy; {currentYear} UIU Photography Club • Established 2005
          </p>
          
          <button
            className="absolute right-0 w-12 h-12 bg-black dark:bg-zinc-800 text-white rounded-full shadow-m3-1 flex items-center justify-center -rotate-90 hover:shadow-m3-3 transition-all hover:-translate-y-1 active:scale-95 border border-white/5"
            onClick={scrollToTop}
            aria-label="Back to top"
          >
            <FaArrowRight className="text-xs" />
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
