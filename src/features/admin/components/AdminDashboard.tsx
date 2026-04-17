"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import dynamic from "next/dynamic";
import { exportToCSV } from "@/utils/adminHelpers";
import { AdminDetailsModal, AdminEmailModal } from "@/features/admin/components";
import GlobalLoader from "@/components/shared/GlobalLoader";
import { useAdminData } from "@/hooks/useAdminData";
import { useAdminActions } from "@/features/admin/hooks/useAdminActions";
import "@/app/admin/Admin.css";
import { useRouter } from "next/navigation";

// Dynamically import heavy features for chunk splitting
const MembershipApplications = dynamic(() => import("@/features/admin/components").then(mod => mod.MembershipApplications), {
  loading: () => <GlobalLoader />,
  ssr: false,
});
const PhotoSubmissions = dynamic(() => import("@/features/admin/components").then(mod => mod.PhotoSubmissions), {
  loading: () => <GlobalLoader />,
  ssr: false,
});
const BlogManagement = dynamic(() => import("@/features/blog/components/BlogManagement"), {
  loading: () => <GlobalLoader />,
  ssr: false,
});
const ResultsManagement = dynamic(() => import("@/features/results/components/ResultsManagement"), {
  loading: () => <GlobalLoader />,
  ssr: false,
});
const GalleryUpload = dynamic(() => import("@/features/gallery/components/GalleryUpload"), {
  loading: () => <GlobalLoader />,
  ssr: false,
});

import {
  FaSync,
  FaUsers,
  FaCamera,
  FaNewspaper,
  FaImages,
  FaExclamationTriangle,
  FaCheck,
  FaChartBar,
} from "react-icons/fa";

export const AdminDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // Data State managed by SWR
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedItem, setSelectedItem] = useState<Record<string, any> | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [selectedEmailItem, setSelectedEmailItem] = useState<Record<string, any> | null>(null);
  const [dataType, setDataType] = useState("membership");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Authentication check
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  // URLs for different data types
  const SCRIPTS: Record<string, string> = {
    membership: process.env.NEXT_PUBLIC_GAS_MEMBERSHIP || (process.env as any).REACT_APP_GAS_MEMBERSHIP || "",
    photos: process.env.NEXT_PUBLIC_GAS_PHOTOS || (process.env as any).REACT_APP_GAS_PHOTOS || "",
    email: process.env.NEXT_PUBLIC_GAS_EMAIL || (process.env as any).REACT_APP_GAS_EMAIL || "",
    gallery: process.env.NEXT_PUBLIC_GAS_GALLERY || (process.env as any).REACT_APP_GAS_GALLERY || "",
    blog: process.env.NEXT_PUBLIC_GAS_BLOG || (process.env as any).REACT_APP_GAS_BLOG || "",
    results: process.env.NEXT_PUBLIC_GAS_RESULTS || (process.env as any).REACT_APP_GAS_RESULTS || "",
  };

  const { data, error, isLoading: loading, refetch: fetchData } = useAdminData(dataType, SCRIPTS[dataType]);

  const {
    photoSubmissionStatus,
    joinPageStatus,
    connectionTest,
    emailSending,
    fetchPhotoSubmissionStatus,
    fetchJoinPageStatus,
    handleTogglePhotoSubmissions,
    handleToggleJoinPageStatus,
    testEmailConnection,
    sendEmail
  } = useAdminActions({ user, scripts: SCRIPTS, dataType, onRefresh: () => setRefreshTrigger((prev) => prev + 1) });

  const exportData = () => {
    if (!data || data.length === 0) return;
    exportToCSV(dataType, data);
  };

  useEffect(() => {
    if (dataType === "membership" && user) {
      fetchJoinPageStatus();
    }
  }, [dataType, user, fetchJoinPageStatus]);

  useEffect(() => {
    if (dataType === "photos" && user) {
      fetchPhotoSubmissionStatus();
    }
  }, [dataType, user, fetchPhotoSubmissionStatus]);

  useEffect(() => {
    if (refreshTrigger > 0) fetchData();
  }, [refreshTrigger, fetchData]);

  useEffect(() => {
    if (user) {
      testEmailConnection();
    }
  }, [user, testEmailConnection]);

  const handleViewDetails = (item: Record<string, any>) => {
    setSelectedItem(item);
    setShowDetailsModal(true);
  };

  const handleEmailReply = (item: Record<string, any>) => {
    setSelectedEmailItem(item);
    setShowEmailModal(true);
  };

  const handleUploadSuccess = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleUpdateStatus = async (applicationId: string, newStatus: string) => {
    if (!user) return;
    try {
      const response = await fetch(SCRIPTS[dataType], {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          action: "updateStatus",
          applicationId: applicationId,
          status: newStatus,
          updatedBy: user.email || "unknown",
        }),
      });

      const result = await response.json();

      if (result.status === "success") {
        alert(`Application status updated to ${newStatus}`);
        fetchData();
      } else {
        throw new Error(result.message || "Failed to update status");
      }
    } catch (error: any) {
      console.error("Error updating status:", error);
      alert("Failed to update status: " + error.message);
    }
  };

  if (authLoading || (loading && !data)) {
    return <GlobalLoader />;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1>Admin Panel</h1>
        <p>
          Manage{" "}
          {dataType === "membership"
            ? "Membership Applications"
            : dataType === "photos"
            ? "Photo Submissions"
            : dataType === "gallery"
            ? "Gallery"
            : "Blog Posts"}
        </p>
      </div>

      <div className="container">
        <div className="admin-content">
          {connectionTest && (
            <div className={`connection-test ${connectionTest.status}`}>
              <div className="test-status">
                <strong>Email Service Status:</strong> {connectionTest.message}
              </div>
              <button
                onClick={testEmailConnection}
                className="btn-secondary"
                style={{ marginLeft: "1rem" }}
              >
                <FaSync /> Test Again
              </button>
            </div>
          )}

          <div className="debug-info">
            <strong>Debug Info:</strong>
            Data Type: {dataType} |
            {dataType !== "blog" && `Total: ${data?.length || 0} |`}
            Error: {error ? "Yes" : "No"} | Email Service:{" "}
            {connectionTest?.status || "Testing..."}
          </div>

          <div className="admin-welcome">
            <p>
              Welcome, <strong>{user.email}</strong>
            </p>

            {dataType === "membership" && data && data.length > 0 && (
              <>
                <p>
                  Total Applications: <strong>{data.length}</strong>
                </p>
                <p style={{ marginTop: "0.5rem", fontSize: "0.9rem", color: "var(--text-muted)" }}>
                  <a href="https://docs.google.com/spreadsheets/d/1rY992dVdc83CVBTTycd9t3gLf6H-_Za_ZHtDTcepkvE/edit?gid=0#gid=0" target="_blank" rel="noopener noreferrer" style={{ color: "var(--uiu-orange)", textDecoration: "none" }}>
                    📋 Club Members List
                  </a>
                </p>
              </>
            )}

            {dataType === "photos" && data && data.length > 0 && (
              <>
                <p>
                  Total Submissions: <strong>{data.length}</strong>
                </p>
                <p style={{ marginTop: "0.5rem", fontSize: "0.9rem", color: "var(--text-muted)" }}>
                  <a href="https://docs.google.com/spreadsheets/d/1b72pSbP2zz5siLnAdCO0zDFFAq66ZcPzwywR51ZoEKw/edit?gid=0#gid=0" target="_blank" rel="noopener noreferrer" style={{ color: "var(--uiu-orange)", textDecoration: "none" }}>
                    📊 Participates full details
                  </a>
                </p>
              </>
            )}

            {(dataType === "gallery" || dataType === "blog") && (
              <p>{dataType === "gallery" ? "Gallery" : "Blog"} Management Panel</p>
            )}
          </div>

          <div className="data-type-selector">
            <button className={`type-btn ${dataType === "membership" ? "active" : ""}`} onClick={() => setDataType("membership")}>
              <FaUsers /> Membership Applications
            </button>
            <button className={`type-btn ${dataType === "photos" ? "active" : ""}`} onClick={() => setDataType("photos")}>
              <FaCamera /> Photo Submissions
            </button>
            <button className={`type-btn ${dataType === "gallery" ? "active" : ""}`} onClick={() => setDataType("gallery")}>
              <FaImages /> Gallery Management
            </button>
            <button className={`type-btn ${dataType === "blog" ? "active" : ""}`} onClick={() => setDataType("blog")}>
              <FaNewspaper /> Blog Management
            </button>
            <button className={`type-btn ${dataType === "results" ? "active" : ""}`} onClick={() => setDataType("results")}>
              <FaChartBar /> Results & Payments
            </button>
          </div>

          {dataType === "results" ? (
            <ResultsManagement scripts={SCRIPTS} user={user} onUpdate={() => setRefreshTrigger((prev) => prev + 1)} />
          ) : dataType === "membership" ? (
            <div className="applications-container">
              <div className="join-page-control" style={{ background: "rgba(30, 30, 30, 0.7)", padding: "1.5rem", borderRadius: "12px", marginBottom: "2rem", border: "1px solid rgba(255, 255, 255, 0.1)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
                <div>
                  <h3 style={{ color: "var(--white)", margin: "0 0 0.5rem 0", fontSize: "1.2rem" }}>Join Page Control</h3>
                  <p style={{ color: "var(--text-muted)", margin: 0, fontSize: "0.9rem" }}>
                    Current status: <strong style={{ color: joinPageStatus === "enabled" ? "#28a745" : "#dc3545" }}>{joinPageStatus.toUpperCase()}</strong>
                  </p>
                </div>
                <button onClick={() => handleToggleJoinPageStatus(joinPageStatus)} className={`btn-primary ${joinPageStatus === "disabled" ? "" : "btn-secondary"}`}>
                  {joinPageStatus === "enabled" ? <><FaExclamationTriangle /> Disable Submission</> : <><FaCheck /> Enable Submission</>}
                </button>
              </div>
              <MembershipApplications data={data || []} loading={loading} searchTerm={searchTerm} filterStatus={filterStatus} onSearchChange={setSearchTerm} onFilterChange={setFilterStatus} onRefresh={fetchData} onExport={exportData} onViewDetails={handleViewDetails} onUpdateStatus={handleUpdateStatus} onEmailReply={handleEmailReply} />
            </div>
          ) : dataType === "photos" ? (
            <>
              <div className="join-page-control" style={{ background: "rgba(30, 30, 30, 0.7)", padding: "1.5rem", borderRadius: "12px", marginBottom: "2rem", border: "1px solid rgba(255, 255, 255, 0.1)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
                <div>
                  <h3 style={{ color: "var(--white)", margin: "0 0 0.5rem 0", fontSize: "1.2rem" }}>Photo Submission Control</h3>
                  <p style={{ color: "var(--text-muted)", margin: 0, fontSize: "0.9rem" }}>
                    Current status: <strong style={{ color: photoSubmissionStatus === "enabled" ? "#28a745" : "#dc3545" }}>{photoSubmissionStatus.toUpperCase()}</strong>
                  </p>
                </div>
                <button
                  onClick={() => handleTogglePhotoSubmissions(photoSubmissionStatus)}
                  className={`btn-primary ${
                    photoSubmissionStatus === "enabled" ? "btn-danger" : "btn-success"
                  }`}
                  style={{ padding: "0.5rem 1rem", fontSize: "0.9rem" }}
                >
                  {photoSubmissionStatus === "enabled" ? "Disable Submissions" : "Enable Submissions"}
                </button>
              </div>
              <PhotoSubmissions data={data || []} loading={loading} searchTerm={searchTerm} filterStatus={filterStatus} onSearchChange={setSearchTerm} onFilterChange={setFilterStatus} onRefresh={fetchData} onExport={exportData} onViewDetails={handleViewDetails} onEmailReply={handleEmailReply} />
            </>
          ) : dataType === "gallery" ? (
            <GalleryUpload user={user} scripts={SCRIPTS} onUploadSuccess={handleUploadSuccess} />
          ) : (
            <BlogManagement user={user} scripts={SCRIPTS} onUploadSuccess={handleUploadSuccess} />
          )}
        </div>
      </div>

      {showDetailsModal && selectedItem && <AdminDetailsModal selectedItem={selectedItem} dataType={dataType} onClose={() => setShowDetailsModal(false)} />}
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

// Removed default export
