"use client";

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { FaLinkedin, FaInstagram, FaGlobe, FaFacebook } from 'react-icons/fa';
import { getCloudinaryUrl } from '@/features/home/components/hero/utils/constants';

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
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
      className="group relative flex flex-col items-center text-center"
    >
      {/* 1:1 Image Holder - High Fidelity Reveal */}
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-[20px] mb-10 bg-zinc-100 dark:bg-zinc-900 border border-black/5 dark:border-white/5 transition-all duration-1000 ease-[0.16, 1, 0.3, 1] group-hover:rounded-[40px] group-hover:shadow-[0_40px_100px_rgba(0,0,0,0.1)] dark:group-hover:shadow-[0_40px_100px_rgba(0,0,0,0.4)]">
        <Image
          src={getCloudinaryUrl(imageUrl, 800, 'auto:best')}
          alt={member.name}
          fill
          className="object-cover transition-all duration-1000 ease-[0.16, 1, 0.3, 1] group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
          priority={priority}
        />
        
        {/* Cinematic Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        
        {/* Social Overlay - High Fidelity Action */}
        <div className="absolute inset-0 flex flex-col items-center justify-end p-8 gap-4 translate-y-8 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-700 ease-[0.16, 1, 0.3, 1]">
          <div className="flex gap-4">
            {member.facebook && (
              <motion.a 
                whileHover={{ y: -4, scale: 1.1 }}
                href={member.facebook} target="_blank" rel="noopener noreferrer" 
                className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white hover:bg-uiupc-orange hover:border-uiupc-orange transition-all"
              >
                <FaFacebook className="text-lg" />
              </motion.a>
            )}
            {member.instagram && (
              <motion.a 
                whileHover={{ y: -4, scale: 1.1 }}
                href={member.instagram} target="_blank" rel="noopener noreferrer" 
                className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white hover:bg-uiupc-orange hover:border-uiupc-orange transition-all"
              >
                <FaInstagram className="text-lg" />
              </motion.a>
            )}
            {member.linkedin && (
              <motion.a 
                whileHover={{ y: -4, scale: 1.1 }}
                href={member.linkedin} target="_blank" rel="noopener noreferrer" 
                className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white hover:bg-uiupc-orange hover:border-uiupc-orange transition-all"
              >
                <FaLinkedin className="text-lg" />
              </motion.a>
            )}
            {member.website && (
              <motion.a 
                whileHover={{ y: -4, scale: 1.1 }}
                href={member.website} target="_blank" rel="noopener noreferrer" 
                className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white hover:bg-uiupc-orange hover:border-uiupc-orange transition-all"
              >
                <FaGlobe className="text-lg" />
              </motion.a>
            )}
          </div>
        </div>
      </div>

      {/* Editorial Identity */}
      <div className="space-y-3 px-4 w-full">
        <div className="flex flex-col items-center gap-1">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-uiupc-orange mb-1">
            {member.role}
          </p>
          <h3 className="text-2xl md:text-3xl font-black text-zinc-900 dark:text-white leading-[0.9] uppercase tracking-tighter">
            {member.name}
          </h3>
        </div>
        
        <div className="h-[1px] w-12 bg-black/5 dark:bg-white/5 mx-auto transition-all duration-700 group-hover:w-24 group-hover:bg-uiupc-orange/30" />
        
        <p className="text-[9px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.25em] max-w-[240px] mx-auto leading-relaxed">
          {member.department}
        </p>
      </div>
    </motion.div>
  );
};

export default MemberCard;
