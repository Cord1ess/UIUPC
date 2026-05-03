'use client';

import React from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Admin_Committee } from '@/features/admin/components/modules/Admin_Committee';
import { CommitteeMember } from '@/types/admin';

interface CommitteeContainerProps {
  initialData: CommitteeMember[];
  totalCount: number;
  currentPage: number;
  searchTerm: string;
  filterYear: string;
  filterDept: string;
  filterCategory: string;
  filterLink: string;
  sortOrder: "asc" | "desc";
  availableYears: string[];
}

export function CommitteeContainer({
  initialData,
  totalCount,
  currentPage,
  searchTerm,
  filterYear,
  filterDept,
  filterCategory,
  filterLink,
  sortOrder,
  availableYears
}: CommitteeContainerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleFilterChange = (updates: { 
    page?: number; 
    search?: string; 
    year?: string; 
    dept?: string;
    category?: string;
    link?: string;
    sort?: "asc" | "desc";
  }) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (updates.page !== undefined) params.set('page', updates.page.toString());
    if (updates.search !== undefined) {
      if (updates.search) params.set('search', updates.search);
      else params.delete('search');
    }
    if (updates.year !== undefined) {
      if (updates.year !== 'all') params.set('year', updates.year);
      else params.delete('year');
    }
    if (updates.dept !== undefined) {
      if (updates.dept !== 'all') params.set('dept', updates.dept);
      else params.delete('dept');
    }
    if (updates.category !== undefined) {
      if (updates.category !== 'all') params.set('category', updates.category);
      else params.delete('category');
    }
    if (updates.link !== undefined) {
      if (updates.link !== 'all') params.set('link', updates.link);
      else params.delete('link');
    }
    if (updates.sort !== undefined) {
      if (updates.sort !== 'asc') params.set('sort', updates.sort);
      else params.delete('sort');
    }

    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="pt-16 md:pt-24 pb-12 px-6 md:px-12 w-full max-w-[1600px] mx-auto">
      <Admin_Committee 
        data={initialData}
        count={totalCount}
        currentPage={currentPage}
        searchTerm={searchTerm}
        filterYear={filterYear}
        filterDept={filterDept}
        filterCategory={filterCategory}
        filterLink={filterLink}
        sortOrder={sortOrder}
        availableYears={availableYears}
        onFilterChange={handleFilterChange}
      />
    </div>
  );
}
