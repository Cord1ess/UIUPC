/**
 * Common data interfaces for the UIUPC platform.
 */

export interface SinglePhoto {
  id: string;
  name: string;
  institute: string;
  photos: number | string;
  selected: boolean;
  category?: string;
}

export interface Story {
  id: string;
  name: string;
  institute: string;
  photos: number | string;
  selected: boolean;
}

export interface Result {
  id: string;
  name: string;
  institute: string;
  photos: number;
  status: string;
  selected: boolean;
  category: string;
}

export interface Payment {
  id: string;
  name: string;
  email: string;
  phone: string;
  institute: string;
  category: string;
  photoCount: number;
  tshirtSize: string;
  address: string;
  paymentMethod: string;
  transactionId: string;
  status: string;
  timestamp: string;
  eventId?: string;
  amount?: number | string;
  totalAmount?: number | string;
}

export interface HeroImage {
  id: number;
  url: string;
  title: string;
  photographer: string;
  isHorizontal: boolean;
  facebookPost?: string;
}

export interface UIUPCEvent {
  id: string;
  title: string;
  date: string;
  location: string;
  description: string;
  image: string;
  link: string;
  status?: 'upcoming' | 'ongoing' | 'ended';
  isFlagship?: boolean;
  latitude?: number;
  longitude?: number;
  map_icon_type?: string;
  is_mapped?: boolean;
}

export interface Photo {
  id: string;
  url: string;
  title: string;
  description: string;
  category: string;
  facebook_url?: string;
  created_at: string;
}

export interface Department {
  id: string;
  name: string;
  display_name: string;
  description: string;
  icon: string;
  achievements: string[];
  works: { title: string; image: string }[];
}

export interface Member {
  id: string;
  name: string;
  username: string;
  role: string;
  department_id: string;
  bio: string;
  image: string;
  social_links: { facebook?: string; instagram?: string; portfolio?: string };
  works: { title: string; image: string; type?: string }[];
  is_alumni: boolean;
  order_index: number;
}

// Re-export Image Utilities
export { getImageUrl, getRawImageUrl, ImageSize } from "@/utils/imageUrl";

