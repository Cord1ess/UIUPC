import { supabase } from './supabase';

/**
 * Server-side data fetchers powered by Supabase.
 * These functions are designed to be used in Next.js Server Components.
 */

// ─── PHOTOS & EXHIBITIONS ──────────────────────────────────────────────────

export async function fetchFeaturedPhotos() {
  const { data, error } = await supabase
    .from('exhibition_submissions')
    .select('*')
    .eq('status', 'selected')
    .limit(12);

  if (error) {
    console.error('Error fetching featured photos:', error);
    return [];
  }

  // Resilient mapping for different schema versions
  return data.map(photo => {
    // If photo_url is a full URL, use it; if it's a Drive ID, proxy it
    let finalUrl = photo.photo_url || '';
    if (finalUrl && !finalUrl.startsWith('http') && !finalUrl.includes('/')) {
      finalUrl = `/api/image/${finalUrl}`;
    } else if (!finalUrl && photo.drive_file_ids && photo.drive_file_ids.length > 0) {
      finalUrl = `/api/image/${photo.drive_file_ids[0]}`;
    }

    return {
      id: photo.id,
      title: photo.photo_title || photo.participant_name || 'Untitled',
      url: finalUrl,
      photographer: photo.photographer_name || photo.participant_name,
      category: photo.category
    };
  });
}

export async function fetchGalleryPhotos() {
  const { data, error } = await supabase
    .from('exhibition_submissions')
    .select('*')
    .eq('status', 'selected')
    .order('submitted_at', { ascending: false });

  if (error) {
    console.error('Error fetching gallery photos:', error);
    return [];
  }

  return data.map(photo => {
    let finalUrl = photo.photo_url || '';
    if (finalUrl && !finalUrl.startsWith('http') && !finalUrl.includes('/')) {
      finalUrl = `/api/image/${finalUrl}`;
    } else if (!finalUrl && photo.drive_file_ids && photo.drive_file_ids.length > 0) {
      finalUrl = `/api/image/${photo.drive_file_ids[0]}`;
    }

    return {
      id: photo.id,
      title: photo.photo_title || photo.participant_name || 'Untitled',
      url: finalUrl,
      photographer: photo.participant_name || 'Member',
      category: photo.category || 'General'
    };
  });
}



export async function fetchAllSubmissions() {
  const { data, error } = await supabase
    .from('exhibition_submissions')
    .select('*')
    .eq('status', 'selected')
    .order('submitted_at', { ascending: false });

  if (error) {
    console.error('Error fetching all submissions:', error);
    return [];
  }
  return data;
}

// ─── EVENTS ────────────────────────────────────────────────────────────────

export async function fetchUpcomingEvents() {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('date', { ascending: true });

  if (error) {
    console.error('Error fetching upcoming events:', error);
    return [];
  }

  // Filter in-memory for maximum resilience and consistency with the Events page
  return data.filter(event => event.status === 'upcoming' || event.status === 'ongoing');
}

export async function fetchAllEvents() {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching all events:', error);
    return [];
  }
  return data;
}

export async function fetchEventById(id: string) {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error(`Error fetching event ${id}:`, error);
    return null;
  }
  return data;
}

// ─── TYPES ────────────────────────────────────────────────────────────────

export interface Achievement {
  id: string;
  title: string;
  description: string;
  year: string;
  image: string;
  tags: string[];
}

// ─── ACHIEVEMENTS ─────────────────────────────────────────────────────────

export async function fetchAchievements(): Promise<Achievement[]> {
  const { data, error } = await supabase
    .from('achievements')
    .select('*')
    .order('year', { ascending: false });

  if (error) {
    console.error('Error fetching achievements:', error);
    return [];
  }

  return data.map(item => ({
    id: item.id,
    title: item.title,
    description: item.description,
    year: item.year,
    image: item.image_url ? 
      (item.image_url.startsWith('http') ? item.image_url : `/api/image/${item.image_url}`) : 
      '',
    tags: item.tags || []
  }));
}


// ─── BLOG ─────────────────────────────────────────────────────────────────

export async function fetchBlogPosts() {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching blog posts:', error);
    return [];
  }
  return data;
}

export async function fetchHeroImages() {
  // 1. Try to fetch featured images from Gallery
  const { data: galleryFeatured } = await supabase
    .from('gallery')
    .select('*')
    .eq('featured_on_hero', true)
    .order('hero_priority', { ascending: false });

  // 2. Try to fetch featured images from Submissions
  const { data: subFeatured } = await supabase
    .from('exhibition_submissions')
    .select('*')
    .eq('featured_on_hero', true)
    .order('hero_priority', { ascending: false });

  // 3. Fallback if no featured images: latest selected submissions
  let fallbackData: any[] = [];
  if ((!galleryFeatured || galleryFeatured.length === 0) && (!subFeatured || subFeatured.length === 0)) {
     const { data: latestSub } = await supabase
      .from('exhibition_submissions')
      .select('*')
      .eq('status', 'selected')
      .order('submitted_at', { ascending: false })
      .limit(10);
     fallbackData = latestSub || [];
  }

  // Combine and Map
  const combined = [...(galleryFeatured || []), ...(subFeatured || []), ...fallbackData];
  
  return combined.map((item, index) => ({
    id: index,
    url: item.image_url || item.photo_url || (item.drive_file_ids?.[0] ? `/api/image/${item.drive_file_ids[0]}` : ''),
    title: item.title || item.photo_title || 'Untitled',
    photographer: (item.uploaded_by ? item.uploaded_by.split('@')[0] : (item.participant_name || 'Member')),
    isHorizontal: true,
    facebookPost: item.facebook_post || item.facebook_url
  }));
}
