import useSWR from "swr";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";

export interface Photo {
  id: string;
  url: string;
  title: string;
  photographerName: string;
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

const fetchFeaturedPhotos = async (): Promise<Photo[]> => {
  const querySnapshot = await getDocs(collection(db, "featuredPhotos"));
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Photo[];
};

const fetchUpcomingEvents = async (): Promise<UIUPCEvent[]> => {
  const querySnapshot = await getDocs(collection(db, "events"));
  const eventsData = querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as UIUPCEvent[];
  
  return eventsData
    .filter((event) => new Date(event.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

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
