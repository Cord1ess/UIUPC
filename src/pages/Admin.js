// pages/UniversalAdmin.js
import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import GalleryUpload from "../components/GalleryUpload";
import MembershipApplications from "../components/MembershipApplications";
import PhotoSubmissions from "../components/PhotoSubmissions";
import "../components/GalleryUpload.css";
import BlogManagement from "../components/BlogManagement";
import ResultsManagement from "../components/ResultsManagement";
import { safeToString, getProperty, exportToCSV } from "../utils/adminHelpers";
import AdminDetailsModal from "../components/admin/AdminDetailsModal";
import AdminEmailModal from "../components/admin/AdminEmailModal";
import { useAdminData } from "../hooks/useAdminData";

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
import Loading from "../components/Loading";
import "./Admin.css";

const UniversalAdmin = () => {
  // Data State managed by SWR
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedItem, setSelectedItem] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [selectedEmailItem, setSelectedEmailItem] = useState(null);
  const [emailSending, setEmailSending] = useState(false);
  const [dataType, setDataType] = useState("membership");
  const [connectionTest, setConnectionTest] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [joinPageStatus, setJoinPageStatus] = useState("enabled");
  const [photoSubmissionStatus, setPhotoSubmissionStatus] = useState("enabled");

  const { user } = useAuth();

  // URLs for different data types - MAKE SURE THESE ARE CORRECT
  const SCRIPTS = {
    membership: process.env.REACT_APP_GAS_MEMBERSHIP,
    photos: process.env.REACT_APP_GAS_PHOTOS,
    email: process.env.REACT_APP_GAS_EMAIL,
    gallery: process.env.REACT_APP_GAS_GALLERY,
    blog: process.env.REACT_APP_GAS_BLOG,
    results: process.env.REACT_APP_GAS_RESULTS,
  };

  const toggleJoinPageStatus = async () => {
    try {
      const newStatus = joinPageStatus === "enabled" ? "disabled" : "enabled";

      const response = await fetch(SCRIPTS.membership, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          action: "updateJoinPageStatus",
          status: newStatus,
          updatedBy: user.email,
        }),
      });

      const result = await response.json();

      if (result.status === "success") {
        setJoinPageStatus(newStatus);
        alert(`Join page submission has been ${newStatus}`);
      } else {
        throw new Error(result.message || "Failed to update join page status");
      }
    } catch (error) {
      console.error("Error updating join page status:", error);
      alert("Failed to update join page status: " + error.message);
    }
  };

  // Add this function to fetch the current join page status
  const fetchJoinPageStatus = async () => {
    try {
      const response = await fetch(
        `${SCRIPTS.membership}?action=getJoinPageStatus`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.status === "success") {
        setJoinPageStatus(result.data.status || "enabled");
      }
    } catch (error) {
      console.error("Error fetching join page status:", error);
      // Default to enabled if there's an error
      setJoinPageStatus("enabled");
    }
  };

  // Call fetchJoinPageStatus when component mounts and when dataType is membership
  useEffect(() => {
    if (dataType === "membership") {
      fetchJoinPageStatus();
    }
  }, [dataType]);

  const fetchPhotoSubmissionStatus = async () => {
    try {
      const response = await fetch(
        `${SCRIPTS.photos}?action=getSubmissionStatus`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        setPhotoSubmissionStatus(result.enabled ? "enabled" : "disabled");
      }
    } catch (error) {
      console.error("Error fetching photo submission status:", error);
      // Default to enabled if there's an error
      setPhotoSubmissionStatus("enabled");
    }
  };

  // Add this function to toggle photo submission status
  const togglePhotoSubmissionStatus = async () => {
    try {
      const newStatus =
        photoSubmissionStatus === "enabled" ? "disabled" : "enabled";

      const response = await fetch(SCRIPTS.photos, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          action: "updateSubmissionStatus",
          enabled: newStatus === "enabled" ? "true" : "false",
          updatedBy: user.email,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setPhotoSubmissionStatus(newStatus);
        alert(`Photo submissions have been ${newStatus}`);
        // Refresh data to show updated status
        fetchData();
      } else {
        throw new Error(result.message || "Failed to update submission status");
      }
    } catch (error) {
      console.error("Error updating photo submission status:", error);
      alert("Failed to update photo submission status: " + error.message);
    }
  };

  // Call fetchPhotoSubmissionStatus when component mounts and when dataType is photos
  useEffect(() => {
    if (dataType === "photos") {
      fetchPhotoSubmissionStatus();
    }
  }, [dataType]);

  // Email templates for photo submissions
  const EMAIL_TEMPLATES = {
    confirmation: {
      subject: "Photo Submission Confirmation - UIU Photography Club",
      body: `Dear {name},

Thank you for submitting your photos to the Shutter Stories Chapter IV. We have successfully received your submission.

Submission Details:
- Name: {name}
- Email: {email}
- Category: {category}
- Total Photos Submitted: {photoCount} (Main) + {storyPhotoCount} (Story)

Best regards,
UIU Photography Club
photographyclub@dccsa.uiu.ac.bd`,
    },
    renameRequest: {
      subject: "Action Required: Rename Your Photos - UIU Photography Club",
      body: `Dear {name},

We have received your photo submission for the Shutter Stories Chapter IV. However, we noticed that your photos have not been properly renamed according to our submission guidelines.

Submission Guidelines:
- Photos must be renamed in this format: "Institution Name_Participant's name_Category_Mobile no_Serial no"
- For example: "UIU_Ahmad Hasan_Single_0162#######_01"

Please rename your photos and resubmit them as soon as possible. Submissions with improperly named photos may be disqualified.

For Submission: https://uiupc.vercel.app/register/shutter-stories
Rulebook: https://drive.google.com/drive/u/0/folders/1qwJ7spd1ewaH3RINgSKSf87QMYvcpSZi

If you have any questions, feel free to contact us through this email or message us on our Facebook page.

Best regards,
UIU Photography Club
photographyclub@dccsa.uiu.ac.bd`,
    },
    general: {
      subject: "Regarding Your Photo Submission - UIU Photography Club",
      body: `Dear {name},

Thank you for your interest in the Shutter Stories Chapter IV.

We have reviewed your submission and would like to inform you that {custom_message}.

If you have any questions, please feel free to contact us.

Best regards,
UIU Photography Club
photographyclub@dccsa.uiu.ac.bd`,
    },
  };

  // Test email script connection
  const testEmailConnection = async () => {
    try {
      setConnectionTest({
        status: "testing",
        message: "Testing connection...",
      });

      const response = await fetch(`${SCRIPTS.email}?action=testConnection`, {
        method: "GET",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.status === "success") {
        setConnectionTest({
          status: "success",
          message: "Email service is connected and working!",
        });
      } else {
        throw new Error(result.data || "Connection test failed");
      }
    } catch (error) {
      console.error("Connection test failed:", error);
      setConnectionTest({
        status: "error",
        message: `Failed to connect: ${error.message}. Please check: 1) Script URL is correct, 2) Script is deployed as web app, 3) Execute permissions are set to "Anyone"`,
      });
    }
  };

  const { data, error, isLoading: loading, refetch: fetchData } = useAdminData(dataType, SCRIPTS[dataType]);

  // Handle refresh trigger to force SWR update
  useEffect(() => {
    if (refreshTrigger > 0) fetchData();
  }, [refreshTrigger, fetchData]);

  // Test email connection on component mount
  useEffect(() => {
    testEmailConnection();
  }, []);

  // Helpers are now imported from utils/adminHelpers

  const handleViewDetails = (item) => {
    setSelectedItem(item);
    setShowDetailsModal(true);
  };

  const handleEmailReply = (item) => {
    setSelectedEmailItem(item);
    setShowEmailModal(true);
  };

  const sendEmail = async (templateType, customMessage = "") => {
    if (!selectedEmailItem) return;

    try {
      setEmailSending(true);

      const recipientEmail = getProperty(selectedEmailItem, "Email");
      const recipientName = getProperty(selectedEmailItem, "Name");

      let subject = EMAIL_TEMPLATES[templateType].subject;
      let body = EMAIL_TEMPLATES[templateType].body;

      // Replace template variables
      body = body
        .replace(/{name}/g, recipientName)
        .replace(/{email}/g, recipientEmail)
        .replace(/{category}/g, getProperty(selectedEmailItem, "Category"))
        .replace(/{photoCount}/g, getProperty(selectedEmailItem, "Photo Count"))
        .replace(
          /{storyPhotoCount}/g,
          getProperty(selectedEmailItem, "Story Photo Count")
        )
        .replace(/{custom_message}/g, customMessage);

      // Use GET request with URL parameters as fallback
      const params = new URLSearchParams({
        action: "sendEmail",
        recipientEmail: recipientEmail,
        subject: subject,
        body: body,
        sentBy: user.email,
        submissionId:
          selectedEmailItem.Timestamp ||
          selectedEmailItem.timestamp ||
          selectedEmailItem["Timestamp"],
        type: dataType,
      });

      const response = await fetch(`${SCRIPTS.email}?${params.toString()}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.status === "success") {
        alert("Email sent successfully!");
        setShowEmailModal(false);
        setSelectedEmailItem(null);
        // Retest connection after successful send
        testEmailConnection();
      } else {
        throw new Error(result.message || "Failed to send email");
      }
    } catch (error) {
      console.error("Error sending email:", error);

      let errorMessage = "Failed to send email: ";
      if (
        error.name === "TypeError" &&
        error.message.includes("Failed to fetch")
      ) {
        errorMessage +=
          "Network error - Cannot connect to email service. Please check the script URL and deployment settings.";
      } else {
        errorMessage += error.message;
      }

      alert(errorMessage);
    } finally {
      setEmailSending(false);
    }
  };

  const handleUploadSuccess = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleUpdateStatus = async (item, newStatus) => {
    try {
      const applicationId = item.Timestamp || item.timestamp;

      const response = await fetch(SCRIPTS[dataType], {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          action: "updateStatus",
          applicationId: applicationId,
          status: newStatus,
          updatedBy: user.email,
        }),
      });

      const result = await response.json();

      if (result.status === "success") {
        alert(`Application status updated to ${newStatus}`);
        fetchData(); // Refresh the data
      } else {
        throw new Error(result.message || "Failed to update status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status: " + error.message);
    }
  };

  // Export is handled by utils/adminHelpers

  // getProperty imported from utils

  // AdminDetailsModal logic moved to src/components/admin/AdminDetailsModal

  // AdminEmailModal logic moved to src/components/admin/AdminEmailModal

  if (loading) {
    return <Loading />;
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
          {/* Connection Test Status */}
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

          {/* Debug Info */}
          <div className="debug-info">
            <strong>Debug Info:</strong>
            Data Type: {dataType} |
            {dataType !== "blog" && `Total: ${data.length} |`}
            Error: {error ? "Yes" : "No"} | Email Service:{" "}
            {connectionTest?.status || "Testing..."}
          </div>

          {/* Welcome Message */}
          <div className="admin-welcome">
            <p>
              Welcome, <strong>{user.email}</strong>
            </p>

            {dataType === "membership" && data.length > 0 && (
              <>
                <p>
                  Total Applications: <strong>{data.length}</strong>
                </p>
                <p
                  style={{
                    marginTop: "0.5rem",
                    fontSize: "0.9rem",
                    color: "var(--text-muted)",
                  }}
                >
                  <a
                    href="https://docs.google.com/spreadsheets/d/1rY992dVdc83CVBTTycd9t3gLf6H-_Za_ZHtDTcepkvE/edit?gid=0#gid=0"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: "var(--uiu-orange)",
                      textDecoration: "none",
                    }}
                  >
                    📋 Club Members List
                  </a>
                </p>
              </>
            )}

            {dataType === "photos" && data.length > 0 && (
              <>
                <p>
                  Total Submissions: <strong>{data.length}</strong>
                </p>
                <p
                  style={{
                    marginTop: "0.5rem",
                    fontSize: "0.9rem",
                    color: "var(--text-muted)",
                  }}
                >
                  <a
                    href="https://docs.google.com/spreadsheets/d/1b72pSbP2zz5siLnAdCO0zDFFAq66ZcPzwywR51ZoEKw/edit?gid=0#gid=0"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: "var(--uiu-orange)",
                      textDecoration: "none",
                    }}
                  >
                    📊 Participates full details
                  </a>
                </p>
              </>
            )}

            {(dataType === "gallery" || dataType === "blog") && (
              <p>
                {dataType === "gallery" ? "Gallery" : "Blog"} Management Panel
              </p>
            )}
          </div>

          {/* Render the appropriate component based on dataType */}
          {/* Data Type Selector */}
          <div className="data-type-selector">
            <button
              className={`type-btn ${
                dataType === "membership" ? "active" : ""
              }`}
              onClick={() => setDataType("membership")}
            >
              <FaUsers /> Membership Applications
            </button>
            <button
              className={`type-btn ${dataType === "photos" ? "active" : ""}`}
              onClick={() => setDataType("photos")}
            >
              <FaCamera /> Photo Submissions
            </button>
            <button
              className={`type-btn ${dataType === "gallery" ? "active" : ""}`}
              onClick={() => setDataType("gallery")}
            >
              <FaImages /> Gallery Management
            </button>
            <button
              className={`type-btn ${dataType === "blog" ? "active" : ""}`}
              onClick={() => setDataType("blog")}
            >
              <FaNewspaper /> Blog Management
            </button>
            <button
              className={`type-btn ${dataType === "results" ? "active" : ""}`}
              onClick={() => setDataType("results")}
            >
              <FaChartBar /> Results & Payments
            </button>
          </div>

          {/* Render the appropriate component based on dataType */}
          {dataType === "results" ? (
            <ResultsManagement
              scripts={SCRIPTS}
              onUpdate={() => setRefreshTrigger((prev) => prev + 1)}
            />
          ) : dataType === "membership" ? (
            <div className="applications-container">
              {/* Join Page Control Section */}
              <div
                className="join-page-control"
                style={{
                  background: "rgba(30, 30, 30, 0.7)",
                  padding: "1.5rem",
                  borderRadius: "12px",
                  marginBottom: "2rem",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "1rem",
                }}
              >
                <div>
                  <h3
                    style={{
                      color: "var(--white)",
                      margin: "0 0 0.5rem 0",
                      fontSize: "1.2rem",
                    }}
                  >
                    Join Page Control
                  </h3>
                  <p
                    style={{
                      color: "var(--text-muted)",
                      margin: 0,
                      fontSize: "0.9rem",
                    }}
                  >
                    Current status:{" "}
                    <strong
                      style={{
                        color:
                          joinPageStatus === "enabled" ? "#28a745" : "#dc3545",
                      }}
                    >
                      {joinPageStatus === "enabled" ? "ENABLED" : "DISABLED"}
                    </strong>
                  </p>
                  <p
                    style={{
                      color: "var(--text-muted)",
                      margin: "0.25rem 0 0 0",
                      fontSize: "0.8rem",
                    }}
                  >
                    {joinPageStatus === "enabled"
                      ? "Users can submit membership applications"
                      : "Membership applications are currently disabled"}
                  </p>
                </div>
                <button
                  onClick={toggleJoinPageStatus}
                  className={`btn-primary ${
                    joinPageStatus === "disabled" ? "" : "btn-secondary"
                  }`}
                  style={{
                    minWidth: "140px",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  {joinPageStatus === "enabled" ? (
                    <>
                      <FaExclamationTriangle />
                      Disable Submission
                    </>
                  ) : (
                    <>
                      <FaCheck />
                      Enable Submission
                    </>
                  )}
                </button>
              </div>
              <MembershipApplications
                data={data}
                loading={loading}
                searchTerm={searchTerm}
                filterStatus={filterStatus}
                onSearchChange={setSearchTerm}
                onFilterChange={setFilterStatus}
                onRefresh={fetchData}
                onExport={() => exportToCSV(dataType, data)}
                onViewDetails={handleViewDetails}
                onUpdateStatus={handleUpdateStatus}
                onEmailReply={handleEmailReply}
                connectionTest={connectionTest}
              />
            </div>
          ) : dataType === "photos" ? (
            <>
              {/* Photo Submission Control Section */}
              <div
                className="join-page-control"
                style={{
                  background: "rgba(30, 30, 30, 0.7)",
                  padding: "1.5rem",
                  borderRadius: "12px",
                  marginBottom: "2rem",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "1rem",
                }}
              >
                <div>
                  <h3
                    style={{
                      color: "var(--white)",
                      margin: "0 0 0.5rem 0",
                      fontSize: "1.2rem",
                    }}
                  >
                    Photo Submission Control
                  </h3>
                  <p
                    style={{
                      color: "var(--text-muted)",
                      margin: 0,
                      fontSize: "0.9rem",
                    }}
                  >
                    Current status:{" "}
                    <strong
                      style={{
                        color:
                          photoSubmissionStatus === "enabled"
                            ? "#28a745"
                            : "#dc3545",
                      }}
                    >
                      {photoSubmissionStatus === "enabled"
                        ? "ENABLED"
                        : "DISABLED"}
                    </strong>
                  </p>
                  <p
                    style={{
                      color: "var(--text-muted)",
                      margin: "0.25rem 0 0 0",
                      fontSize: "0.8rem",
                    }}
                  >
                    {photoSubmissionStatus === "enabled"
                      ? "Users can submit photos to Shutter Stories Chapter IV"
                      : "Photo submissions are currently disabled"}
                  </p>
                </div>
                <button
                  onClick={togglePhotoSubmissionStatus}
                  className={`btn-primary ${
                    photoSubmissionStatus === "disabled" ? "" : "btn-secondary"
                  }`}
                  style={{
                    minWidth: "140px",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  {photoSubmissionStatus === "enabled" ? (
                    <>
                      <FaExclamationTriangle />
                      Disable Submission
                    </>
                  ) : (
                    <>
                      <FaCheck />
                      Enable Submission
                    </>
                  )}
                </button>
              </div>
              <PhotoSubmissions
                data={data}
                loading={loading}
                searchTerm={searchTerm}
                filterStatus={filterStatus}
                onSearchChange={setSearchTerm}
                onFilterChange={setFilterStatus}
                onRefresh={fetchData}
                onExport={() => exportToCSV(dataType, data)}
                onViewDetails={handleViewDetails}
                onEmailReply={handleEmailReply}
                connectionTest={connectionTest}
              />
            </>
          ) : dataType === "gallery" ? (
            // Gallery Management Section - Show GalleryUpload component
            <GalleryUpload
              user={user}
              scripts={SCRIPTS}
              onUploadSuccess={handleUploadSuccess}
            />
          ) : (
            // Blog Management Section
            <BlogManagement
              user={user}
              scripts={SCRIPTS}
              onUploadSuccess={handleUploadSuccess}
            />
          )}
        </div>
      </div>

      {/* Details Modal Component */}
      {showDetailsModal && selectedItem && (
        <AdminDetailsModal
          selectedItem={selectedItem}
          dataType={dataType}
          onClose={() => setShowDetailsModal(false)}
        />
      )}

      {/* Email Modal Component */}
      {showEmailModal && selectedEmailItem && (
        <AdminEmailModal
          selectedEmailItem={selectedEmailItem}
          connectionTest={connectionTest}
          emailSending={emailSending}
          onSendEmail={sendEmail}
          onTestConnection={testEmailConnection}
          onClose={() => {
            setShowEmailModal(false);
            setSelectedEmailItem(null);
          }}
        />
      )}
    </div>
  );
};

export default UniversalAdmin;
