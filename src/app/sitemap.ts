import { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabase';

// Helper to fetch dynamic events for the sitemap
async function getEventUrls(baseUrl: string) {
  try {
    const { data: events } = await supabase
      .from('events')
      .select('id, created_at')
      .order('created_at', { ascending: false });

    if (!events) return [];

    return events.map((event) => ({
      url: `${baseUrl}/events/${event.id}`,
      lastModified: new Date(event.created_at || Date.now()),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));
  } catch (error) {
    console.error('Sitemap event fetch error:', error);
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://uiupc.com';

  // Core Static Routes
  const staticRoutes = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/events`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/gallery`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/members`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/join`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
  ];

  // Fetch dynamic routes
  const eventUrls = await getEventUrls(baseUrl);

  return [...staticRoutes, ...eventUrls];
}
