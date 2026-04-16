import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";
import { Photo, UIUPCEvent } from "@/hooks/useFirebaseData";

export const fetchFeaturedPhotos = async (): Promise<Photo[]> => {
  const querySnapshot = await getDocs(collection(db, "featuredPhotos"));
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Photo[];
};

export const fetchUpcomingEvents = async (): Promise<UIUPCEvent[]> => {
  const querySnapshot = await getDocs(collection(db, "events"));
  const eventsData = querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as UIUPCEvent[];
  
  return eventsData
    .filter((event) => new Date(event.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

export const fetchAllEvents = async (): Promise<UIUPCEvent[]> => {
  const querySnapshot = await getDocs(collection(db, "events"));
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as UIUPCEvent[];
};

export const fetchEventById = async (id: string): Promise<UIUPCEvent | null> => {
  const allEvents = await fetchAllEvents();
  return allEvents.find(e => e.id === id) || null;
};

export const fetchGalleryPhotos = async (): Promise<Photo[]> => {
  const SCRIPT_URL = process.env.NEXT_PUBLIC_GAS_GALLERY_PUBLIC;
  
  const mockEvents = [
    { id: "1", name: "Friday Exposure" },
    { id: "2", name: "Photo Adda" },
    { id: "3", name: "Photo Walk" },
    { id: "4", name: "Exhibitions Visit" },
    { id: "5", name: "Workshops & Talks" },
    { id: "6", name: "Shutter Stories" },
  ];

  try {
    if (!SCRIPT_URL) return [];
    
    const response = await fetch(`${SCRIPT_URL}?action=getGallery`, {
      next: { revalidate: 3600 } // Cache for 1 hour
    });

    if (!response.ok) return [];

    const result = await response.json();
    if (result.status === "success" && result.data) {
      return result.data.map((photo: any) => ({
        id: photo.id ? photo.id.toString() : Math.random().toString(),
        url: photo.url || photo.imageUrl,
        title: photo.title || "Untitled",
        description: photo.description || "",
        eventId: photo.eventId ? photo.eventId.toString() : "1",
        uploadedAt: photo.uploadedAt || photo.timestamp || Date.now(),
        facebookPost: photo.facebookPost || "",
      }));
    }
    return [];
  } catch (error) {
    console.error("Error fetching gallery:", error);
    return [];
  }
};

export const fetchBlogPosts = async (): Promise<any[]> => {
  const BLOG_SCRIPT_URL = process.env.NEXT_PUBLIC_GAS_BLOG;

  try {
    if (!BLOG_SCRIPT_URL) return [];

    const response = await fetch(`${BLOG_SCRIPT_URL}?action=getBlogPosts`, {
      next: { revalidate: 3600 } // Revalidate every hour
    });

    if (!response.ok) throw new Error("Failed to fetch blog posts");

    const result = await response.json();

    if (result.status === "success" && result.data) {
      return (result.data || []).sort((a: any, b: any) => 
        new Date(b.date || b.timestamp).getTime() - new Date(a.date || a.timestamp).getTime()
      );
    }
    return [];
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    return [];
  }
};
