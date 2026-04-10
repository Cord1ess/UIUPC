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
    <footer className="relative bg-white border-t border-black/10 py-20 px-6 overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-grid-giant opacity-[0.03] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-20">
          {/* Brand Section */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-6 mb-8 group">
              <div className="w-14 h-14 border border-black/10 p-1 bg-white transition-all group-hover:border-uiupc-orange rounded-md">
                <img src={myLogo.src} alt="UIUPC Logo" className="w-full h-full object-contain" />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-black text-black uppercase tracking-tighter">UIU Photography Club</span>
                <span className="text-uiupc-orange text-[10px] font-black uppercase tracking-[0.3em]">United International University</span>
              </div>
            </Link>
            <p className="text-gray-500 font-medium text-lg max-w-lg leading-relaxed border-l-2 border-black/5 pl-8">
              Capturing Moments, Creating Memories at United International
              University. We are established to explore the art of visual storytelling 
              through a community of dedicated photographers.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-black text-sm font-black uppercase tracking-[0.2em] mb-8">
              Navigation
            </h3>
            <ul className="flex flex-col gap-3">
              {['Gallery', 'Events', 'Members', 'Blog', 'About Us'].map((item) => (
                <li key={item}>
                  <Link 
                    href={`/${item.toLowerCase().replace(' ', '')}`} 
                    className="flex items-center gap-2 text-black/40 hover:text-black font-bold uppercase tracking-widest text-[10px] transition-all"
                  >
                    <span>{item}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h3 className="text-black text-sm font-black uppercase tracking-[0.2em] mb-8">
              Connect
            </h3>
            <ul className="flex flex-col gap-3">
              <li>
                <Link href="/join" className="flex items-center gap-2 text-black/40 hover:text-black font-bold uppercase tracking-widest text-[10px] transition-all">
                  <span>Join Membership</span>
                </Link>
              </li>
              <li>
                <Link href="/contact" className="flex items-center gap-2 text-black/40 hover:text-black font-bold uppercase tracking-widest text-[10px] transition-all">
                  <span>Contact Inquiry</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="pt-12 border-t border-black/5 flex flex-col md:flex-row justify-between items-center gap-8">
          <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">
            &copy; {currentYear} UIU Photography Club • Standard Operational Procedure
          </p>
          
          <div className="flex items-center gap-6">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-black/20">
              Visual Excellence • Technical Mastery
            </p>
            <button
              className="w-10 h-10 border border-black/10 text-black/40 flex items-center justify-center -rotate-90 hover:bg-black hover:text-white transition-all"
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
