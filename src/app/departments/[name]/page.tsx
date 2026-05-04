"use client";

import React, { use } from 'react';
import { motion } from 'motion/react';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { Department, Member } from '@/types';
import { IconChevronLeft, IconTrophy, IconBriefcase, IconUsers, IconFacebook, IconInstagram, IconGlobe } from '@/components/shared/Icons';
import Link from 'next/link';
import { getImageUrl } from '@/utils/imageUrl';

export default function DepartmentDetailPage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = use(params);
  const { data: departments } = useSupabaseData<Department>("departments");
  const { data: allMembers } = useSupabaseData<Member>("members");

  const dept = departments?.find(d => d.name === name);
  const members = allMembers?.filter(m => {
    const deptId = departments?.find(d => d.name === name)?.id;
    return m.department_id === deptId;
  }).sort((a, b) => a.order_index - b.order_index) || [];

  if (!dept) return null;

  const isSpecial = name === 'design' || name === 'visual';

  return (
    <main className="min-h-screen pt-32 pb-20 px-6 max-w-7xl mx-auto">
      {/* Back Button */}
      <Link href="/departments" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-400 hover:text-uiupc-orange transition-colors mb-12">
        <IconChevronLeft size={12} /> Back to Departments
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        {/* Left: Info */}
        <div className="lg:col-span-5 space-y-12">
          <div>
            <h1 className="text-6xl font-black uppercase tracking-tighter dark:text-white leading-none">
              {dept.display_name} <span className="text-uiupc-orange">Department</span>
            </h1>
            <p className="mt-8 text-lg text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed">
              {dept.description}
            </p>
          </div>

          {/* Achievements */}
          {dept.achievements && dept.achievements.length > 0 && (
            <div className="space-y-6">
              <h2 className="flex items-center gap-3 text-sm font-black uppercase tracking-[0.2em] dark:text-white">
                <IconTrophy size={14} className="text-uiupc-orange" /> Key Achievements
              </h2>
              <div className="grid grid-cols-1 gap-4">
                {dept.achievements.map((ach: string, i: number) => (
                  <div key={i} className="p-6 bg-zinc-50 dark:bg-zinc-900/50 border border-black/5 dark:border-white/5 rounded-2xl text-sm font-medium dark:text-zinc-300">
                    {ach}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Work or Team */}
        <div className="lg:col-span-7">
          {isSpecial ? (
            <div className="space-y-12">
              <div className="flex items-center justify-between">
                <h2 className="flex items-center gap-3 text-sm font-black uppercase tracking-[0.2em] dark:text-white">
                  <IconUsers size={14} className="text-uiupc-orange" /> Meet the Team
                </h2>
                <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                  {members.length} Members
                </div>
              </div>

              {/* Current Members */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {members.filter(m => !m.is_alumni).map((member, i) => (
                  <MemberCard key={member.id} member={member} index={i} />
                ))}
              </div>

              {/* Alumni Section */}
              {members.some(m => m.is_alumni) && (
                <div className="pt-12 border-t border-black/5 dark:border-white/5 space-y-8">
                  <h3 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-400">Previous Members (Alumni)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {members.filter(m => m.is_alumni).map((member, i) => (
                      <MemberCard key={member.id} member={member} index={i} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-12">
              <h2 className="flex items-center gap-3 text-sm font-black uppercase tracking-[0.2em] dark:text-white">
                <IconBriefcase size={14} className="text-uiupc-orange" /> Recent Works
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {dept.works?.map((work: any, i: number) => (
                  <div key={i} className="group relative aspect-video bg-zinc-100 dark:bg-zinc-900 rounded-3xl overflow-hidden">
                    <img src={getImageUrl(work.image, 600)} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={work.title} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                      <p className="text-white text-xs font-black uppercase tracking-widest">{work.title}</p>
                    </div>
                  </div>
                ))}
                {(!dept.works || dept.works.length === 0) && (
                  <div className="col-span-2 py-20 text-center text-zinc-400 text-xs font-bold uppercase tracking-widest bg-zinc-50 dark:bg-zinc-900/50 rounded-3xl border border-dashed border-black/10 dark:border-white/10">
                    No recent works uploaded yet
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

function MemberCard({ member, index }: { member: Member, index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Link 
        href={`/members/${member.username}`}
        className="group flex items-center gap-5 p-4 bg-white dark:bg-[#080808] border border-black/5 dark:border-white/5 rounded-3xl transition-all hover:border-uiupc-orange/30 hover:shadow-xl hover:shadow-uiupc-orange/5"
      >
        <div className="w-20 h-20 rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-900 flex-shrink-0">
          <img src={getImageUrl(member.image, 200)} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt={member.name} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-black uppercase tracking-tight dark:text-white group-hover:text-uiupc-orange transition-colors truncate">
            {member.name}
          </h4>
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">
            {member.role}
          </p>
          <div className="flex items-center gap-3 mt-3">
            {member.social_links.facebook && <IconFacebook size={12} className="text-zinc-300 dark:text-zinc-600 hover:text-uiupc-orange transition-colors cursor-pointer" />}
            {member.social_links.instagram && <IconInstagram size={12} className="text-zinc-300 dark:text-zinc-600 hover:text-uiupc-orange transition-colors cursor-pointer" />}
            {member.social_links.portfolio && <IconGlobe size={12} className="text-zinc-300 dark:text-zinc-600 hover:text-uiupc-orange transition-colors cursor-pointer" />}
          </div>
        </div>
        <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-zinc-50 dark:bg-zinc-900 text-zinc-300 group-hover:bg-uiupc-orange group-hover:text-white transition-all">
          →
        </div>
      </Link>
    </motion.div>
  );
}
