import { useState, useCallback } from "react";
import { getProperty } from "@/utils/adminHelpers";

interface UseAdminActionsProps {
  user: any;
  scripts: Record<string, string>;
  dataType: string;
  onRefresh: () => void;
}

export const useAdminActions = ({ user, scripts, dataType, onRefresh }: UseAdminActionsProps) => {
  const [photoSubmissionStatus, setPhotoSubmissionStatus] = useState<string>("unknown");
  const [joinPageStatus, setJoinPageStatus] = useState<string>("unknown");
  const [connectionTest, setConnectionTest] = useState<any>(null);
  const [emailSending, setEmailSending] = useState(false);

  const EMAIL_TEMPLATES: Record<string, any> = {
    confirmation: {
      subject: "Photo Submission Confirmation - UIU Photography Club",
      body: `Dear {name},\n\nThank you for submitting your photos to the Shutter Stories Chapter IV. We have successfully received your submission.\n\nSubmission Details:\n- Name: {name}\n- Email: {email}\n- Category: {category}\n- Total Photos Submitted: {photoCount} (Main) + {storyPhotoCount} (Story)\n\nBest regards,\nUIU Photography Club\nphotographyclub@dccsa.uiu.ac.bd`,
    },
    renameRequest: {
      subject: "Action Required: Rename Your Photos - UIU Photography Club",
      body: `Dear {name},\n\nWe have received your photo submission for the Shutter Stories Chapter IV. However, we noticed that your photos have not been properly renamed according to our submission guidelines.\n\nSubmission Guidelines:\n- Photos must be renamed in this format: "Institution Name_Participant's name_Category_Mobile no_Serial no"\n- For example: "UIU_Ahmad Hasan_Single_0162#######_01"\n\nPlease rename your photos and resubmit them as soon as possible. Submissions with improperly named photos may be disqualified.\n\nFor Submission: https://uiupc.vercel.app/register/shutter-stories\nRulebook: https://drive.google.com/drive/u/0/folders/1qwJ7spd1ewaH3RINgSKSf87QMYvcpSZi\n\nIf you have any questions, feel free to contact us through this email or message us on our Facebook page.\n\nBest regards,\nUIU Photography Club\nphotographyclub@dccsa.uiu.ac.bd`,
    },
    general: {
      subject: "Regarding Your Photo Submission - UIU Photography Club",
      body: `Dear {name},\n\nThank you for your interest in the Shutter Stories Chapter IV.\n\nWe have reviewed your submission and would like to inform you that {custom_message}.\n\nIf you have any questions, please feel free to contact us.\n\nBest regards,\nUIU Photography Club\nphotographyclub@dccsa.uiu.ac.bd`,
    },
  };

  const fetchPhotoSubmissionStatus = useCallback(async () => {
    if (!scripts.photos || !scripts.photos.startsWith("http")) return;
    try {
      const response = await fetch(`${scripts.photos}?action=getSubmissionStatus`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const result = await response.json();
      if (result.success) {
        setPhotoSubmissionStatus(result.enabled ? "enabled" : "disabled");
      }
    } catch (error: any) {
      if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
        console.warn("Administrative service (Photos) is currently unreachable. Defaulting to 'enabled'.");
      } else {
        console.error("Error fetching photo submission status:", error);
      }
      setPhotoSubmissionStatus("enabled");
    }
  }, [scripts.photos]);

  const fetchJoinPageStatus = useCallback(async () => {
    if (!scripts.membership || !scripts.membership.startsWith("http")) return;
    try {
      const response = await fetch(`${scripts.membership}?action=getJoinPageStatus`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const result = await response.json();
      if (result.status === "success") {
        setJoinPageStatus(result.data?.status || "enabled");
      }
    } catch (error: any) {
      if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
        console.warn("Administrative service (Membership) is currently unreachable. Defaulting to 'enabled'.");
      } else {
        console.error("Error fetching join page status:", error);
      }
      setJoinPageStatus("enabled");
    }
  }, [scripts.membership]);

  const handleTogglePhotoSubmissions = useCallback(async (currentStatus: string) => {
    if (!user || !scripts.photos) return;
    const newStatus = currentStatus === "enabled" ? "disabled" : "enabled";
    
    if (!window.confirm(`Are you sure you want to ${newStatus === "enabled" ? "ENABLE" : "DISABLE"} photo submissions?\n\nThis will ${newStatus === "enabled" ? "allow" : "prevent"} users from submitting new photos.`)) {
      return;
    }

    try {
      const response = await fetch(scripts.photos, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          action: "updateSubmissionStatus",
          enabled: newStatus === "enabled" ? "true" : "false",
          updatedBy: user.email || "unknown",
        }),
      });

      const result = await response.json();
      if (result.success) {
        setPhotoSubmissionStatus(newStatus);
        alert(`Photo submissions have been ${newStatus}`);
        onRefresh();
      } else {
        throw new Error(result.message || "Failed to update submission status");
      }
    } catch (error: any) {
      console.error("Error updating photo submission status:", error);
      alert("Failed to update photo submission status: " + error.message);
    }
  }, [user, scripts.photos, onRefresh]);

  const handleToggleJoinPageStatus = useCallback(async (currentStatus: string) => {
    if (!user || !scripts.membership) return;
    const newStatus = currentStatus === "enabled" ? "disabled" : "enabled";

    try {
      const response = await fetch(scripts.membership, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          action: "updateJoinPageStatus",
          status: newStatus,
          updatedBy: user.email || "unknown",
        }),
      });

      const result = await response.json();
      if (result.status === "success") {
        setJoinPageStatus(newStatus);
        alert(`Join page submission has been ${newStatus}`);
      } else {
        throw new Error(result.message || "Failed to update join page status");
      }
    } catch (error: any) {
      console.error("Error updating join page status:", error);
      alert("Failed to update join page status: " + error.message);
    }
  }, [user, scripts.membership]);

  const testEmailConnection = useCallback(async () => {
    if (!scripts.email) return;
    try {
      setConnectionTest({ status: "testing", message: "Testing connection..." });
      const response = await fetch(`${scripts.email}?action=testConnection`, {
        method: "GET",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const result = await response.json();
      if (result.status === "success") {
        setConnectionTest({ status: "success", message: "Email service is connected and working!" });
      } else {
        throw new Error(result.data || "Connection test failed");
      }
    } catch (error: any) {
      console.error("Connection test failed:", error);
      setConnectionTest({
        status: "error",
        message: `Failed to connect: ${error.message}. Please check: 1) Script URL is correct, 2) Script is deployed as web app, 3) Execute permissions are set to "Anyone"`,
      });
    }
  }, [scripts.email]);

  const sendEmail = useCallback(async (selectedEmailItem: any, templateType: string, customMessage: string = "", onSuccess?: () => void) => {
    if (!selectedEmailItem || !user || !scripts.email) return;

    try {
      setEmailSending(true);
      const recipientEmail = getProperty(selectedEmailItem, "Email");
      const recipientName = getProperty(selectedEmailItem, "Name");

      let subject = EMAIL_TEMPLATES[templateType].subject;
      let body = EMAIL_TEMPLATES[templateType].body;

      body = body
        .replace(/{name}/g, recipientName)
        .replace(/{email}/g, recipientEmail)
        .replace(/{category}/g, getProperty(selectedEmailItem, "Category") || "N/A")
        .replace(/{photoCount}/g, getProperty(selectedEmailItem, "Photo Count") || "0")
        .replace(/{storyPhotoCount}/g, getProperty(selectedEmailItem, "Story Photo Count") || "0")
        .replace(/{custom_message}/g, customMessage);

      const params = new URLSearchParams({
        action: "sendEmail",
        recipientEmail: recipientEmail,
        subject: subject,
        body: body,
        sentBy: user.email || "unknown",
        submissionId: selectedEmailItem.Timestamp || selectedEmailItem.timestamp || selectedEmailItem["Timestamp"] || "",
        type: dataType,
      });

      const response = await fetch(`${scripts.email}?${params.toString()}`, {
        method: "GET",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });
      const result = await response.json();

      if (response.ok && result.status === "success") {
        alert("Email sent successfully!");
        if (onSuccess) onSuccess();
      } else {
        throw new Error(result.message || "Failed to send email");
      }
    } catch (error: any) {
      console.error("Error sending email:", error);
      alert("Failed to send email: " + error.message);
    } finally {
      setEmailSending(false);
    }
  }, [user, scripts.email, dataType]);

  return {
    EMAIL_TEMPLATES,
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
  };
};
