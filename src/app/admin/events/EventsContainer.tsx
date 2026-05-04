"use client";

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Admin_Events } from '@/features/admin/components/modules/Admin_Events';

interface EventsContainerProps {
  initialData: any[];
  count: number;
}

export default function EventsContainer({ initialData, count }: EventsContainerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const filterStatus = searchParams.get('status') || 'all';
  const filterCategory = searchParams.get('category') || 'all';
  const searchTerm = searchParams.get('search') || '';
  const currentPage = parseInt(searchParams.get('page') || '0');

  const handleFilterChange = (newFilters: any) => {
    const params = new URLSearchParams(searchParams.toString());
    
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value === 'all' || value === '') {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    });

    // If we're updating a filter that isn't page, reset to page 0
    if (!newFilters.hasOwnProperty('page')) {
      params.delete('page');
    }

    router.push(`/admin/events?${params.toString()}`);
  };

  return (
    <div className="pt-16 md:pt-24 pb-20 px-4 md:px-10 max-w-[1600px] mx-auto">
      <Admin_Events 
        initialData={initialData}
        count={count}
        filterStatus={filterStatus}
        filterCategory={filterCategory}
        searchTerm={searchTerm}
        currentPage={currentPage}
        onFilterChange={handleFilterChange}
      />
    </div>
  );
}
