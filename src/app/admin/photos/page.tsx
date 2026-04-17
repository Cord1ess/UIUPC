"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminData } from "@/hooks/useAdminData";
import { useAdminActions } from "@/features/admin/hooks/useAdminActions";
import { ADMIN_SCRIPTS } from "@/features/admin/config";
import { PhotoSubmissions, AdminDetailsModal, AdminEmailModal } from "@/features/admin/components";
import GlobalLoader from "@/components/shared/GlobalLoader";
import { FaCamera, FaSync, FaFileExport, FaExclamationTriangle, FaCheck } from "react-icons/fa";
import { exportToCSV } from "@/utils/adminHelpers";
import ScrollRevealText from "@/components/motion/ScrollRevealText";

const PhotosAdminPage = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedItem, setSelectedItem] = useState<Record<string, any> | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [selectedEmailItem, setSelectedEmailItem] = useState<Record<string, any> | null>(null);

  const { data, isLoading, refetch: fetchData } = useAdminData("photos", ADMIN_SCRIPTS.photos);

  const {
    photoSubmissionStatus,
    connectionTest,
    emailSending,
    fetchPhotoSubmissionStatus,
    handleTogglePhotoSubmissions,
    testEmailConnection,
    sendEmail
  } = useAdminActions({ 
    user, 
    scripts: ADMIN_SCRIPTS, 
    dataType: "photos", 
    onRefresh: () => fetchData() 
  });

  useEffect(() => {
    if (user) {
      fetchPhotoSubmissionStatus();
      testEmailConnection();
    }
  }, [user, fetchPhotoSubmissionStatus, testEmailConnection]);

  if (isLoading && !data) return <GlobalLoader />;

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-4">
           <ScrollRevealText 
             text="Submissions" 
             className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none text-zinc-900 dark:text-white"
           />
           <p className="text-zinc-500 dark:text-zinc-400 font-medium text-sm md:text-base uppercase tracking-widest">
              Moderate and manage Shutter Stories exhibition entries.
           </p>
        </div>

        <div className="flex gap-4">
            <button 
              onClick={() => fetchData()}
              className="px-6 py-3 bg-white dark:bg-zinc-900 border border-black/5 dark:border-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest text-zinc-600 dark:text-zinc-400 hover:bg-black/5 dark:hover:bg-white/5 transition-all flex items-center gap-2"
            >
              <FaSync className={isLoading ? 'animate-spin' : ''} /> Refresh
            </button>
            <button 
              onClick={() => exportToCSV("photos", data)}
              className="px-6 py-3 bg-uiupc-orange text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all flex items-center gap-2 shadow-lg shadow-uiupc-orange/20"
            >
              <FaFileExport /> Export CSV
            </button>
        </div>
      </div>

      {/* Submission Status Control */}
      <div className="p-8 md:p-12 bg-[#ffffff] dark:bg-[#050505] rounded-2xl border border-black/5 dark:border-white/5 shadow-3xl shadow-black/5 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-2 text-center md:text-left">
           <h3 className="text-xl font-black uppercase tracking-tighter text-zinc-900 dark:text-white">Competition Intake Control</h3>
           <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em]">
             Status: <span className={photoSubmissionStatus === 'enabled' ? 'text-green-500' : 'text-red-500'}>{photoSubmissionStatus.toUpperCase()}</span>
           </p>
        </div>
        <button 
          onClick={() => handleTogglePhotoSubmissions(photoSubmissionStatus)}
          className={`px-8 py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.3em] transition-all flex items-center gap-2 ${
            photoSubmissionStatus === 'enabled' 
              ? 'bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white' 
              : 'bg-green-500/10 text-green-500 border border-green-500/20 hover:bg-green-500 hover:text-white'
          }`}
        >
          {photoSubmissionStatus === 'enabled' ? <><FaExclamationTriangle /> Disable Submissions</> : <><FaCheck /> Enable Submissions</>}
        </button>
      </div>

      <div className="bg-[#ffffff] dark:bg-[#050505] rounded-2xl border border-black/5 dark:border-white/5 overflow-hidden shadow-3xl shadow-black/5 p-6 md:p-10">
        <PhotoSubmissions 
          data={data || []} 
          loading={isLoading} 
          searchTerm={searchTerm} 
          filterStatus={filterStatus} 
          onSearchChange={setSearchTerm} 
          onFilterChange={setFilterStatus} 
          onRefresh={fetchData} 
          onExport={() => exportToCSV("photos", data)} 
          onViewDetails={(item) => { setSelectedItem(item); setShowDetailsModal(true); }} 
          onEmailReply={(item) => { setSelectedEmailItem(item); setShowEmailModal(true); }} 
        />
      </div>

      {showDetailsModal && selectedItem && (
        <AdminDetailsModal 
          selectedItem={selectedItem} 
          dataType="photos" 
          onClose={() => setShowDetailsModal(false)} 
        />
      )}

      {showEmailModal && selectedEmailItem && (
        <AdminEmailModal 
          selectedEmailItem={selectedEmailItem} 
          connectionTest={connectionTest} 
          emailSending={emailSending} 
          onSendEmail={(templateType: string, customMessage?: string) => sendEmail(selectedEmailItem!, templateType, customMessage || "", () => {
            setShowEmailModal(false);
            setSelectedEmailItem(null);
          })} 
          onTestConnection={testEmailConnection} 
          onClose={() => { setShowEmailModal(false); setSelectedEmailItem(null); }} 
        />
      )}
    </div>
  );
};

export default PhotosAdminPage;
