import useSWR from "swr";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";

const fetchFeaturedPhotos = async () => {
  const querySnapshot = await getDocs(collection(db, "featuredPhotos"));
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

const fetchUpcomingEvents = async () => {
  const querySnapshot = await getDocs(collection(db, "events"));
  const eventsData = querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
  return eventsData
    .filter((event) => new Date(event.date) >= new Date())
    .sort((a, b) => new Date(a.date) - new Date(b.date));
};

export const useFeaturedPhotos = () => {
  const { data, error, isLoading } = useSWR("featuredPhotos", fetchFeaturedPhotos, {
    revalidateOnFocus: false,
    dedupingInterval: 60000, 
  });
  return { featuredPhotos: data || [], error, isLoading };
};

export const useUpcomingEvents = () => {
  const { data, error, isLoading } = useSWR("upcomingEvents", fetchUpcomingEvents, {
    revalidateOnFocus: false,
    dedupingInterval: 60000,
  });
  return { events: data || [], error, isLoading };
};
