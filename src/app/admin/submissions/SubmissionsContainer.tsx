'use client';

import React from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Admin_Submissions } from '@/features/admin/components/modules/Admin_Submissions';
import { ExhibitionSubmission } from '@/types/admin';
import { Admin_DetailsModal } from '@/features/admin/components/core/Admin_DetailsModal';
import { Admin_EmailModal } from '@/features/admin/components/core/Admin_EmailModal';

interface SubmissionsContainerProps {
  initialData: ExhibitionSubmission[];
  totalCount: number;
  currentPage: number;
  searchTerm: string;
  filterCategory: string;
}

export function SubmissionsContainer({
  initialData,
  totalCount,
  currentPage,
  searchTerm,
  filterCategory
}: SubmissionsContainerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [selectedItem, setSelectedItem] = React.useState<any>(null);
  const [showDetailsModal, setShowDetailsModal] = React.useState(false);
  const [selectedEmailItem, setSelectedEmailItem] = React.useState<any>(null);
  const [showEmailModal, setShowEmailModal] = React.useState(false);

  const handleFilterChange = (updates: { page?: number; search?: string; category?: string }) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (updates.page !== undefined) params.set('page', updates.page.toString());
    if (updates.search !== undefined) {
      if (updates.search) params.set('search', updates.search);
      else params.delete('search');
    }
    if (updates.category !== undefined) {
      if (updates.category !== 'all') params.set('category', updates.category);
      else params.delete('category');
    }

    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="pt-16 md:pt-24 pb-12 px-6 md:px-12 w-full max-w-[1600px] mx-auto">
      <Admin_Submissions 
        data={initialData}
        count={totalCount}
        currentPage={currentPage}
        searchTerm={searchTerm}
        filterCategory={filterCategory}
        onFilterChange={handleFilterChange}
        onOpenDetails={(item) => { setSelectedItem(item); setShowDetailsModal(true); }}
        onOpenEmail={(item) => { setSelectedEmailItem(item); setShowEmailModal(true); }}
      />

      <Admin_DetailsModal 
        isOpen={showDetailsModal} 
        onClose={() => setShowDetailsModal(false)} 
        item={selectedItem} 
        dataType="photos" 
      />
      <Admin_EmailModal 
        isOpen={showEmailModal} 
        onClose={() => setShowEmailModal(false)} 
        item={selectedEmailItem} 
        onSend={async () => {}} 
        sending={false} 
      />
    </div>
  );
}
