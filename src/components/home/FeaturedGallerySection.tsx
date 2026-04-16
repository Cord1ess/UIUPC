import React from 'react';
import PhotoShowcase from '@/components/PhotoShowcase';
import { fetchFeaturedPhotos } from '@/lib/fetchers';

const FeaturedGallerySection = async () => {
  const featuredPhotos = await fetchFeaturedPhotos();

  return <PhotoShowcase photos={featuredPhotos} />;
};

export default FeaturedGallerySection;
