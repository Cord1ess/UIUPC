"use client";

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { FaLinkedin, FaInstagram, FaGlobe, FaFacebook } from 'react-icons/fa';
import { getCloudinaryUrl } from '@/components/hero/utils/constants';

interface MemberCardProps {
  member: {
    id?: string | number;
    name: string;
    role: string;
    department?: string;
    profileImage?: string;
    facebook?: string;
    instagram?: string;
    linkedin?: string;
    website?: string;
  };
  priority?: boolean;
}

const MemberCard: React.FC<MemberCardProps> = ({ member, priority = false }) => {
  const imageUrl = member.profileImage || 'https://res.cloudinary.com/do0e8p5d2/image/upload/v1763054814/uiupc_HeroSlider1_d9kprm.jpg';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
      className="group flex flex-col items-center text-center"
    >
      {/* 1:1 Image Holder */}
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl mb-8 bg-zinc-100 dark:bg-zinc-900 border border-black/5 dark:border-white/5 transition-all duration-700 group-hover:rounded-[2.5rem] group-hover:shadow-2xl">
        <Image
          src={getCloudinaryUrl(imageUrl, 800, 'auto:best')}
          alt={member.name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
          priority={priority}
        />
        
        {/* Social Overlay - Minimalist */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center gap-4">
          {member.facebook && (
            <a href={member.facebook} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white hover:text-black transition-all">
              <FaFacebook />
            </a>
          )}
          {member.instagram && (
            <a href={member.instagram} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white hover:text-black transition-all">
              <FaInstagram />
            </a>
          )}
          {member.linkedin && (
            <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white hover:text-black transition-all">
              <FaLinkedin />
            </a>
          )}
        </div>
      </div>

      {/* Editorial Identity */}
      <div className="space-y-2 px-2">
        <h3 className="text-xl md:text-2xl font-black text-zinc-900 dark:text-white leading-none uppercase tracking-tight">
          {member.name}
        </h3>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-uiupc-orange">
          {member.role}
        </p>
        <p className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest max-w-[200px] mx-auto leading-relaxed">
          {member.department}
        </p>
      </div>
    </motion.div>
  );
};

export default MemberCard;
