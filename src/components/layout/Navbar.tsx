"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { FaTimes, FaBars } from 'react-icons/fa';
import myLogo from '../../assets/logo.jpg';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const { user } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setIsMenuOpen(false);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const isActive = (path: string) => pathname === path;

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/events', label: 'Events' },
    { path: '/members', label: 'Committee' },
    { path: '/gallery', label: 'Gallery' },
    { path: '/blog', label: 'Blog' },
    { path: '/contact', label: 'Contact' },
    { path: '/committee-2026', label: 'Committee 2026' }
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-[1000] border-b transition-all duration-300 ${
      isScrolled ? 'bg-white shadow-xl py-3 border-black/10' : 'bg-transparent py-5 border-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-4 group" onClick={() => setIsMenuOpen(false)}>
          <div className="relative border-r border-black/10 pr-4">
            <img 
              src={myLogo.src} 
              alt="UIUPC Logo" 
              className="w-10 h-10 object-contain" 
            />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-black text-2xl font-black uppercase tracking-tighter">UIUPC</span>
            <span className="text-uiupc-orange text-[9px] font-black uppercase tracking-[0.2em]">United International University</span>
          </div>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden lg:flex items-center gap-10">
          <div className="flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`text-[10px] font-black uppercase tracking-widest transition-all relative py-1 
                  ${isActive(item.path) ? 'text-uiupc-orange' : 'text-black/60 hover:text-black'}
                  after:content-[''] after:absolute after:bottom-0 after:left-0 after:h-[2px] after:bg-uiupc-orange after:transition-all
                  ${isActive(item.path) ? 'after:w-full' : 'after:w-0 hover:after:w-full'}
                `}
              >
                {item.label}
              </Link>
            ))}
            
            {user && (
              <Link 
                href="/admin" 
                className={`text-[10px] font-black uppercase tracking-widest text-uiupc-orange border-2 border-uiupc-orange px-3 py-1`}
              >
                Admin
              </Link>
            )}
          </div>
          
          <div className="flex items-center gap-4 border-l border-black/10 pl-10">
            {user ? (
              <button 
                className="px-6 py-2 bg-black text-white text-[10px] font-black uppercase tracking-widest border border-black hover:bg-transparent hover:text-black transition-all" 
                onClick={handleSignOut}
              >
                Sign Out
              </button>
            ) : (
              <Link 
                href="/join" 
                className="px-6 py-2 bg-uiupc-orange text-white text-[10px] font-black uppercase tracking-widest border border-uiupc-orange hover:bg-transparent hover:text-uiupc-orange transition-all"
              >
                Join Us
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="lg:hidden text-black text-2xl p-2"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={`fixed inset-0 top-[76px] bg-white z-50 transition-all duration-300 lg:hidden ${
        isMenuOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full pointer-events-none'
      }`}>
        <div className="p-10 flex flex-col gap-8">
          {navItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`text-2xl font-black uppercase tracking-tighter border-b border-black/5 pb-2
                ${isActive(item.path) ? 'text-uiupc-orange border-uiupc-orange' : 'text-black'}
              `}
              onClick={() => setIsMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          
          <div className="mt-4 flex flex-col gap-4">
            {user ? (
              <button className="w-full py-4 bg-black text-white font-black uppercase tracking-widest" onClick={handleSignOut}>Sign Out</button>
            ) : (
              <Link href="/join" className="w-full py-4 bg-uiupc-orange text-white text-center font-black uppercase tracking-widest shadow-lg" onClick={() => setIsMenuOpen(false)}>Join Us</Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
