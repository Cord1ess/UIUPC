import useSWR from "swr";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";

export interface Photo {
  id: string;
  url: string;
  title: string;
  photographer: string;
  [key: string]: any;
}

export interface UIUPCEvent {
  id: string;
  title: string;
  date: string;
  location: string;
  image: string;
  description: string;
  [key: string]: any;
}

import { fetchFeaturedPhotos, fetchUpcomingEvents } from "../lib/fetchers";

export const useFeaturedPhotos = () => {
  const { data, error, isLoading } = useSWR<Photo[]>("featuredPhotos", fetchFeaturedPhotos, {
    revalidateOnFocus: false,
    dedupingInterval: 60000, 
  });
  return { featuredPhotos: data || [], error, isLoading };
};

export const useUpcomingEvents = () => {
  const { data, error, isLoading } = useSWR<UIUPCEvent[]>("upcomingEvents", fetchUpcomingEvents, {
    revalidateOnFocus: false,
    dedupingInterval: 60000,
  });
  return { events: data || [], error, isLoading };
};
