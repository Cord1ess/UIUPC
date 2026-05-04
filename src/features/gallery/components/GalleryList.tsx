"use client";

import React from "react";
import Image from "next/image";
import { motion } from "motion/react";
import { IconCalendar, IconEye, IconEdit, IconTrash, IconFacebook, IconCamera } from "@/components/shared/Icons";

interface GalleryPhoto {
  id: string;
  title: string;
  description: string;
  eventId: string;
  event_id?: string;
  facebookPost?: string;
  facebook_post?: string;
  url?: string;
  imageUrl?: string;
  image_url?: string;
  uploadedBy?: string;
  uploaded_by?: string;
  uploadedAt?: string;
  timestamp?: string;
  created_at?: string;
}

interface GalleryListProps {
  photos: GalleryPhoto[];
  userEmail: string;
  onEdit: (photo: GalleryPhoto) => void;
  onDelete: (id: string) => void;
}

const GalleryList: React.FC<GalleryListProps> = ({
  photos,
  userEmail,
  onEdit,
  onDelete,
}) => {
  const EVENT_MAP: Record<string, string> = {
    "1": "Friday Exposure",
    "2": "Photo Adda",
    "3": "Photo Walk",
    "4": "Exhibitions Visit",
    "5": "Workshops & Talks",
    "6": "Shutter Stories"
  };

  const getEventName = (eventId: string) => EVENT_MAP[eventId] || "General Collection";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
      {photos.map((photo, index) => (
        <motion.div 
          key={photo.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className="group bg-white dark:bg-[#0a0a0a] border border-black/5 dark:border-white/5 rounded-[2.5rem] overflow-hidden flex flex-col transition-all duration-500 hover:shadow-2xl hover:shadow-black/5"
        >
          {/* Image Container */}
          <div className="relative w-full h-64 overflow-hidden bg-zinc-100 dark:bg-zinc-900">
            <Image
              src={photo.image_url || photo.url || photo.imageUrl || ""}
              alt={photo.title}
              fill
              className="object-cover transition-transform duration-1000 group-hover:scale-110 ease-out"
              unoptimized={true}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-90 transition-opacity" />
            
            <div className="absolute top-6 left-6 z-10">
              <span className="px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest bg-white/10 backdrop-blur-md text-white border border-white/20">
                {getEventName(photo.event_id || photo.eventId)}
              </span>
            </div>

            <div className="absolute bottom-6 left-6 right-6 z-10">
               <div className="flex items-center gap-2 text-white/70 mb-1">
                  <IconCamera size={10} className="text-uiupc-orange" />
                 <span className="text-[9px] font-black uppercase tracking-widest">{photo.uploaded_by || photo.uploadedBy || "Staff Member"}</span>
               </div>
               <h3 className="text-xl font-black uppercase tracking-tighter text-white line-clamp-1 group-hover:text-uiupc-orange transition-colors">{photo.title}</h3>
            </div>
          </div>

          {/* Content */}
          <div className="p-8 flex flex-col flex-1">
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-8 line-clamp-2 leading-relaxed font-medium">
              {photo.description || "No description provided."}
            </p>

            <div className="mt-auto flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-black/5 dark:border-white/5">
                <IconCalendar size={10} className="text-zinc-400" />
                <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">
                  {new Date(photo.created_at || photo.uploadedAt || photo.timestamp || Date.now()).toLocaleDateString()}
                </span>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => window.open(photo.image_url || photo.url || photo.imageUrl, '_blank')}
                  className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:bg-uiupc-orange hover:text-white flex items-center justify-center transition-all shadow-sm"
                  title="View Photo"
                >
                  <IconEye size={12} />
                </button>
                <button
                  onClick={() => onEdit(photo)}
                  className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:bg-zinc-900 dark:hover:bg-white hover:text-white dark:hover:text-black flex items-center justify-center transition-all shadow-sm"
                  title="Edit"
                >
                  <IconEdit size={12} />
                </button>
                {(photo.facebook_post || photo.facebookPost) && (
                  <button
                    onClick={() => window.open(photo.facebook_post || photo.facebookPost, '_blank')}
                    className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 hover:bg-blue-600 hover:text-white flex items-center justify-center transition-all shadow-sm"
                    title="Facebook Post"
                  >
                    <IconFacebook size={12} />
                  </button>
                )}
                <button
                  onClick={() => onDelete(photo.id)}
                  className="w-10 h-10 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all shadow-sm"
                  title="Delete"
                >
                  <IconTrash size={12} />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default React.memo(GalleryList);
