'use client';

import React, { useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Admin_Members, Admin_DetailsModal, Admin_ErrorBoundary } from '@/features/admin/components';
import { Member } from '@/types/admin';

interface MembersContainerProps {
  initialData: Member[];
  totalCount: number;
  currentPage: number;
  searchTerm: string;
  filterStatus: string;
  filterDept: string;
  filterYear: string;
  sortOrder: "asc" | "desc";
  departments: string[];
  availableYears: string[];
}

export function MembersContainer({
  initialData,
  totalCount,
  currentPage,
  searchTerm,
  filterStatus,
  filterDept,
  filterYear,
  sortOrder,
  departments,
  availableYears
}: MembersContainerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [selectedItem, setSelectedItem] = useState<Member | null>(null);
  const [showModal, setShowModal] = useState(false);

  const handleFilterChange = (updates: { page?: number; search?: string; dept?: string; status?: string; year?: string; sort?: "asc" | "desc" }) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (updates.page !== undefined) params.set('page', updates.page.toString());
    if (updates.search !== undefined) {
      if (updates.search) params.set('search', updates.search);
      else params.delete('search');
    }
    if (updates.status !== undefined) {
      if (updates.status !== 'all') params.set('status', updates.status);
      else params.delete('status');
    }
    if (updates.dept !== undefined) {
      if (updates.dept !== 'all') params.set('dept', updates.dept);
      else params.delete('dept');
    }
    if (updates.year !== undefined) {
      if (updates.year !== 'all') params.set('year', updates.year);
      else params.delete('year');
    }
    if (updates.sort !== undefined) {
      if (updates.sort !== 'desc') params.set('sort', updates.sort); // default is desc
      else params.delete('sort');
    }

    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="pt-16 md:pt-24 pb-12 px-6 md:px-12 w-full max-w-[1600px] mx-auto">
      <Admin_Members 
        data={initialData}
        count={totalCount}
        currentPage={currentPage}
        searchTerm={searchTerm}
        filterStatus={filterStatus}
        filterDept={filterDept}
        filterYear={filterYear}
        sortOrder={sortOrder}
        departments={departments}
        availableYears={availableYears}
        onFilterChange={handleFilterChange}
        onViewDetails={(item) => { setSelectedItem(item as Member); setShowModal(true); }}
        onEmailReply={(item) => { window.location.href = `mailto:${item.email}`; }}
      />

      <Admin_ErrorBoundary>
        <Admin_DetailsModal 
          isOpen={showModal} 
          onClose={() => setShowModal(false)}
          item={selectedItem}
          dataType="membership"
        />
      </Admin_ErrorBoundary>
    </div>
  );
}
