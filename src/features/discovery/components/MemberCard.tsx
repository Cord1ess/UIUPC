"use client";

import React from 'react';
import Image from 'next/image';
import { motion } from 'motion/react';
import { IconLinkedin, IconInstagram, IconGlobe, IconFacebook, IconEnvelope } from '@/components/shared/Icons';
import { getImageUrl } from '@/utils/imageUrl';

interface MemberCardProps {
  member: {
    id?: string | number;
    name: string;
    role: string;
    department?: string;
    profileImage?: string;
    email?: string;
    facebook?: string;
    instagram?: string;
    linkedin?: string;
    website?: string;
  };
  priority?: boolean;
}

const MemberCard: React.FC<MemberCardProps> = ({ member, priority = false }) => {
  const isPlaceholder = !member.profileImage || member.profileImage === 'PLACEHOLDER';
  const imageUrl = isPlaceholder ? '' : (member.profileImage || '');
  const initials = (member.name || "?").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

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
        {isPlaceholder ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-zinc-200 via-zinc-100 to-zinc-200 dark:from-zinc-800 dark:via-zinc-900 dark:to-zinc-800">
            <span className="text-5xl md:text-6xl font-black text-uiupc-orange/30 uppercase tracking-tighter select-none">
              {initials}
            </span>
          </div>
        ) : (
          <Image
            src={getImageUrl(imageUrl, 400, 80)}
            alt={member.name}
            fill
            unoptimized
            className="object-cover transition-all duration-1000 ease-[0.16, 1, 0.3, 1] group-hover:scale-110"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
            priority={priority}
          />
        )}
        
        {/* Cinematic Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        
        {/* Social Overlay - High Fidelity Action */}
        <div className="absolute inset-0 flex flex-col items-center justify-end p-8 gap-4 translate-y-8 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-700 ease-[0.16, 1, 0.3, 1]">
          <div className="flex gap-4">
            {member.email && (
              <motion.a 
                whileHover={{ y: -4, scale: 1.1 }}
                href={`mailto:${member.email}`}
                className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white hover:bg-uiupc-orange hover:border-uiupc-orange transition-all"
              >
                <IconEnvelope size={18} />
              </motion.a>
            )}
            {member.facebook && (
              <motion.a 
                whileHover={{ y: -4, scale: 1.1 }}
                href={member.facebook} target="_blank" rel="noopener noreferrer" 
                className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white hover:bg-uiupc-orange hover:border-uiupc-orange transition-all"
              >
                <IconFacebook size={18} />
              </motion.a>
            )}
            {member.linkedin && (
              <motion.a 
                whileHover={{ y: -4, scale: 1.1 }}
                href={member.linkedin} target="_blank" rel="noopener noreferrer" 
                className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white hover:bg-uiupc-orange hover:border-uiupc-orange transition-all"
              >
                <IconLinkedin size={18} />
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
          {member.email && (
            <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 lowercase mt-1">
              {member.email}
            </p>
          )}
        </div>
        
        <div className="h-[1px] w-12 bg-black/5 dark:bg-white/5 mx-auto transition-all duration-700 group-hover:w-24 group-hover:bg-uiupc-orange/30" />
        
        <p className="text-[9px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.25em] max-w-[240px] mx-auto leading-relaxed">
          {member.department}
        </p>
      </div>
    </motion.div>
  );
};

export default React.memo(MemberCard);
