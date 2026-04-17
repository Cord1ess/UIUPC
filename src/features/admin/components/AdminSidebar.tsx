"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  FaThLarge, 
  FaUsers, 
  FaCamera, 
  FaNewspaper, 
  FaImages, 
  FaChartBar, 
  FaSignOutAlt,
  FaShieldAlt,
  FaHome
} from 'react-icons/fa';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import myLogo from '@/assets/UIUPC Logo.svg';

const ADMIN_LINKS = [
  { path: '/admin', label: 'Overview', icon: <FaThLarge /> },
  { path: '/admin/members', label: 'Member Recruitment', icon: <FaUsers /> },
  { path: '/admin/photos', label: 'Submissions', icon: <FaCamera /> },
  { path: '/admin/blog', label: 'Blog', icon: <FaNewspaper /> },
  { path: '/admin/gallery', label: 'Gallery', icon: <FaImages /> },
  { path: '/admin/results', label: 'Finance', icon: <FaChartBar /> },
];

export const AdminSidebar = () => {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <aside className="w-64 h-screen sticky top-0 flex flex-col bg-[#ffffff] dark:bg-[#050505] border-r border-black/5 dark:border-white/5 z-40 transition-colors duration-500">
      
      {/* Sidebar Header */}
      <div className="p-8 border-b border-black/5 dark:border-white/5">
        <div className="flex items-center gap-3">
          <img src={myLogo.src} alt="UIUPC Logo" className="w-10 h-10 object-contain" />
          <div className="flex flex-col">
             <span className="text-[12px] font-black uppercase tracking-tighter text-zinc-900 dark:text-white leading-none">UIUPC</span>
             <span className="text-[7px] font-black uppercase tracking-[0.1em] text-uiupc-orange leading-tight">UIU PHOTOGRAPHY CLUB</span>
          </div>
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 p-6 space-y-2 overflow-y-auto custom-scrollbar">
        <div className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 mb-6 px-2">Management</div>
        
        {ADMIN_LINKS.map((link) => {
          const isActive = pathname === link.path;
          return (
            <Link 
              key={link.path}
              href={link.path}
              className={`flex items-center gap-4 px-4 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all group ${
                isActive 
                  ? 'bg-uiupc-orange text-white shadow-xl shadow-uiupc-orange/20' 
                  : 'text-zinc-500 dark:text-zinc-400 hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              <span className={`text-base transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-zinc-400'}`}>
                {link.icon}
              </span>
              {link.label}
            </Link>
          );
        })}

        <div className="pt-10">
          <div className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 mb-6 px-2">Navigation</div>
          <Link 
            href="/"
            className="flex items-center gap-4 px-4 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400 hover:bg-black/5 dark:hover:bg-white/5 transition-all group"
          >
            <FaHome className="text-base text-zinc-400" /> Web Portal
          </Link>
        </div>
      </nav>

      {/* Sidebar Footer */}
      <div className="p-6 border-t border-black/5 dark:border-white/5">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] text-red-500 hover:bg-red-500/10 transition-all group"
        >
          <FaSignOutAlt className="text-base transition-transform group-hover:-translate-x-1" />
          Sign Out
        </button>
      </div>
    </aside>
  );
};

// Removed default export
