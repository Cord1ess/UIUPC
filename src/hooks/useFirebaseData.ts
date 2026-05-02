import useSWR from "swr";
import { fetchFeaturedPhotos, fetchUpcomingEvents } from "../lib/fetchers";

export interface Photo {
  id: string;
  url: string;
  title: string;
  photographer: string;
  category: string;
}

export interface UIUPCEvent {
  id: string;
  name: string;
  title: string; // fallback if name is used interchangeably
  date: string;
  location: string;
  image_url: string;
  description: string;
}

/**
 * Hook to fetch featured photos for the home page showcase.
 * Note: Despite the file name, this fetches from Supabase as per latest architecture.
 */
export const useFeaturedPhotos = () => {
  const { data, error, isLoading } = useSWR<Photo[]>("featuredPhotos", fetchFeaturedPhotos, {
    revalidateOnFocus: false,
    dedupingInterval: 60000, 
  });
  return { featuredPhotos: data || [], error, isLoading };
};

/**
 * Hook to fetch upcoming events.
 */
export const useUpcomingEvents = () => {
  const { data, error, isLoading } = useSWR<UIUPCEvent[]>("upcomingEvents", fetchUpcomingEvents, {
    revalidateOnFocus: false,
    dedupingInterval: 60000,
  });
  return { events: data || [], error, isLoading };
};
